package com.datablau.reverse.engineering.worker.api;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.core.model.ObjectCreationWatcher;
import com.andorj.common.core.model.ObjectX;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.datasource.api.Datasource;
import com.datablau.reverse.engineering.api.IdGetter;
import com.datablau.reverse.engineering.api.ReverseForwardStrategy;
import com.datablau.reverse.engineering.data.ReverseForwardOptions;
import com.datablau.reverse.engineering.data.ReversedSchema;
import com.datablau.reverse.engineering.data.ReversedTable;
import com.datablau.reverse.engineering.exception.ReverseEngineeringFailedException;
import com.datablau.reverse.engineering.utility.JobProgress;
import com.datablau.reverse.engineering.utility.ProgressJob;
import com.google.common.base.Strings;
import okhttp3.Call;
import okhttp3.Headers;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.CollectionUtils;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * @program: datablau-datasource-plugins
 * @description: 采集api类型元数据
 * @author: wang tong
 * @create: 2024-10-31 16:10
 **/
public class ApiWorker extends ProgressJob implements ReverseForwardStrategy {

    private static final Logger LOGGER = LoggerFactory.getLogger(ApiWorker.class);


    private final OkHttpClient okHttpClient = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)//链接超时，单位为秒
            .writeTimeout(3 * 60, TimeUnit.SECONDS)//写入超时，单位为秒
            .readTimeout(3 * 60, TimeUnit.SECONDS)//读取超时，单位为秒
            .build();
    ;
    private final Map<String, String> headers = new HashMap<>();
    protected ReverseForwardOptions options;
    protected Datasource datasource;
    protected Map<String, ReversedSchema> schemaMap = new ConcurrentHashMap<>();
    protected ModelX currentModel = null;
    protected ObjectCreationWatcher saver = null;
    protected boolean useProgressSave = false;
    private IdGetter idGetter;
    private String modelName;

    public static Headers MapToHeaders(Map<String, String> headerMap) {
        Headers.Builder headerBuilder = new Headers.Builder();
        headerBuilder.add("Accept", "application/json");
        if (null != headerMap) {
            headerMap.forEach((k, v) -> {
                headerBuilder.add(k, v);
            });
        }
        return headerBuilder.build();
    }

    @Override
    public ModelX reverseEngineer(ModelX modelX, Datasource datasource, ReverseForwardOptions options) throws ReverseEngineeringFailedException {
        if (options == null) {
            throw new InvalidArgumentException("re options cannot be null");
        } else {
            this.options = options;
        }

        if (datasource == null) {
            throw new InvalidArgumentException("datasource cannot be null");
        } else {
            this.datasource = datasource;
        }
        this.modelName = modelX.getName();
        currentModel = modelX;
        preReverseEngineering();

        updateProgress(new JobProgress(0, "start..."));

        try {
            innerReverseEngineer(modelX);
            if (options.isFinalizeModel()) {
                options.getObjectCreationWatcher().finalizeModel();
            }
        } catch (Throwable tw) {
            options.getClearModelCallback().clearModel(modelX.getId(), datasource);
            LOGGER.error("failed to re model of type \'" + datasource.getType() + "\'", tw);
            throw new ReverseEngineeringFailedException("Reverse data source failure:" + tw.getMessage(), tw);
        }

        return modelX;
    }

    @Override
    public void setIdGetter(IdGetter idGetter) {
        this.idGetter = idGetter;
    }

    @Override
    public String getType() {
        return "API";
    }

    @Override
    public boolean canHandleDatasource(Datasource datasource) {
        return datasource.getType().equals(getType());
    }

    protected void preReverseEngineering() {
        if (options.getObjectCreationWatcher() != null) {
            options.getObjectCreationWatcher().setModelX(currentModel);
            currentModel.setObjectCreationWatcher(options.getObjectCreationWatcher());
        }
    }

    protected void postReverseEngineering() throws Exception {
        if (useProgressSave) {
            LOGGER.info("finalizing...");
            saver.finalizeModel();
        }
    }

    protected void processSave() {
        if (saver != null) {
            saver.notifySave();
        }
    }

    private boolean isSelectedSchema(String schema) {
        if (CollectionUtils.isEmpty(this.options.getSelectedSchemas())) {
            return true;
        } else {
            for (String selectedSchema : this.options.getSelectedSchemas()) {
                if (schema.equalsIgnoreCase(selectedSchema)) {
                    return true;
                }
            }
        }

        return false;
    }

    protected Long getNextId() {
        return this.idGetter.getNextId();
    }

    protected synchronized ReversedSchema getOrCreateSchema(ModelX modelX, String schemaName) {
        if (schemaMap.containsKey(schemaName)) {
            return schemaMap.get(schemaName);
        } else {
            ObjectX schema =
                    options.needToPersis() ?
                            ObjectX
                                    .createSingleObject(LDMTypes.oSchema, getNextId(), modelX) :
                            (ObjectX) modelX.createObject(LDMTypes.oSchema, getNextId());
            schema.setParentObjectId(modelX.getId());
            schema.setParentLogicalName(modelX.getLogicalName());
            schema.setParentPhysicalName(modelX.getPhysicalName());
            schema.setName(schemaName);
            schema.setObjectIsFullyCreated();
            schemaMap.put(schema.getName(), new ReversedSchema(schema));
            modelX.addObject(schema);
            return schemaMap.get(schema.getName());
        }
    }

    protected ModelX innerReverseEngineer(ModelX model) {
        this.currentModel = model;


        try {
            LOGGER.debug("Start reverse engineer--");
            checkStopSign();
            updateProgress(new JobProgress(20, "starting..."));

            preReverseEngineering();

            for (String sch : options.getSelectedSchemas()) {
                getOrCreateSchema(model, sch);
                ReversedSchema oSchema = getOrCreateSchema(model, sch);
            }

            updateProgress(new JobProgress(21, "reading tables..."));


            for (String sch : options.getSelectedSchemas()) {
                buildTablesAndColumns(sch, model);
            }


            updateProgress(new JobProgress(60, "model is created"));

            postReverseEngineering();
            return model;
        } catch (Exception ex) {
            LOGGER.error("failed to re es:" + ex.getMessage(), ex);
            throw new UnexpectedStateException(GeneralUtility.getMessageService().getMessage("metadata.reverse.reverseEsFailed", ex.getMessage()), ex);
        }

    }

    public JSONObject get(String url, Map<String, String> headerMap) {
        Headers headers = MapToHeaders(headerMap);
        Request request = new Request.Builder()
                .get()
                .url(url)
                .headers(headers)
                .build();
        return this.requestProcessor(request);
    }

    public JSONObject requestProcessor(Request request) {
        Call call = okHttpClient.newCall(request);
        Response response;
        try {
            response = call.execute();
            if (response.isSuccessful()) {
                String responseBody;
                responseBody = Objects.requireNonNull(response.body()).string();
                return JSON.parseObject(responseBody);
            }
        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
        }
        return null;
    }

    protected ObjectX createTable(ModelX modelX) {
        ObjectX table =
                options.needToPersis() ?
                        ObjectX.createSingleObject(LDMTypes.oEntity, getNextId(), modelX)
                        : (ObjectX) modelX.createObject(LDMTypes.oEntity, getNextId());
        table.setParentPhysicalName(modelX.getPhysicalName());
        table.setParentLogicalName(modelX.getLogicalName());
        table.setParentObjectId(modelX.getId());
        modelX.addObject(table);

        return table;
    }

    protected ModelX getCurrentModel() {
        return currentModel;
    }

    protected ObjectX createColumn(ReversedTable table) {
        ObjectX column =
                options.needToPersis() ?
                        ObjectX.createSingleObject(LDMTypes.oAttribute, getNextId(), getCurrentModel())
                        : (ObjectX) table.getTableX().createObject(LDMTypes.oAttribute, getNextId());
        column.setParentPhysicalName(table.getName());
        column.setParentLogicalName(table.getLogicalName());
        column.setParentObjectId(table.getId());
        column.setProperty(LDMTypes.pSchemaName, table.getSchema());

        return column;
    }

    protected void setSchemaInfoToObject(ReversedSchema schema, ObjectX object) {
        if (schema == null || object == null) {
            return;
        }

        object.setProperty(LDMTypes.pSchemaRef, schema.getSchemaId());
        object.setProperty(LDMTypes.pSchemaName, schema.getSchemaName());
    }

    protected ObjectX createKeyGroup(ModelX model, ReversedTable table) {
        ObjectX column =
                options.needToPersis() ?
                        ObjectX.createSingleObject(LDMTypes.oKeyGroup, getNextId(), model)
                        : (ObjectX) table.getTableX().createObject(LDMTypes.oKeyGroup, getNextId());
        column.setParentPhysicalName(table.getName());
        column.setParentLogicalName(table.getLogicalName());
        column.setParentObjectId(table.getId());
        column.setProperty(LDMTypes.pSchemaName, table.getSchema());

        return column;
    }


    protected void buildTablesAndColumns(String schema, ModelX modelX) {

        ReversedSchema oSchema = getOrCreateSchema(modelX, schema);

        String url = datasource.getProperties().getParameter("HostServer");

        JSONObject res = get(url, headers);
        if (res == null) {
            LOGGER.info("res is null");
            return;
        }
        JSONObject sch = (JSONObject) res.get("schema");
        if (!schema.equalsIgnoreCase(sch.getString("name"))) {
            LOGGER.info("res schema not found");
            return;
        }
        JSONArray tables = (JSONArray) sch.get("tables");
        if (tables == null) {
            LOGGER.info("tables is null");
            return;
        }
        for (Object object : tables) {
            JSONObject table = (JSONObject) object;

            ObjectX tableX = createTable(modelX);
            setSchemaInfoToObject(oSchema, tableX);

            String tableName = table.get("tableName").toString();
            tableX.setProperty(LDMTypes.pName, tableName);
            tableX.setProperty(LDMTypes.pPhysicalName, tableName);

            Object tableChineseName = table.get("tableChineseName");
            if (tableChineseName != null) {
                tableX.setProperty(LDMTypes.pLogicalName, tableChineseName.toString());
            }

            ReversedTable reversedTable = oSchema.addTable(tableX);

            //暂时默认只有一个主键吧 poc
            Object pk = table.get("primaryKey");
            if (pk != null) {
                ObjectX pkObj = createKeyGroup(modelX, reversedTable);
                pkObj.setName("PK_"+tableName);
                pkObj.setProperty(LDMTypes.pKeyGroupType, "PrimaryKey");
                pkObj.setProperty(LDMTypes.pIsUnique, true);

                reversedTable.addKeyGroup(pkObj);

                oSchema.addIndexName("PK_"+tableName);
                pkObj.setProperty(LDMTypes.pKeyGroupMemberRefs, pk);
            }


            if (table.get("columns") != null) {
                JSONArray columns = (JSONArray) table.get("columns");
                for (Object c : columns) {
                    JSONObject col = (JSONObject) c;
                    ObjectX columnX = createColumn(reversedTable);
                    columnX.setName(col.get("columnName").toString());

                    Object defaultValue = col.get("defaultValue");
                    if (defaultValue != null) {
                        columnX.setProperty(LDMTypes.pDefaultValue, defaultValue.toString());
                    }
                    Object logicalName = col.get("columnChineseName");
                    if (logicalName != null) {
                        columnX.setProperty(LDMTypes.pLogicalName, logicalName.toString());
                    }
                    Object type = col.get("dataType");
                    if (type != null) {
                        columnX.setProperty(LDMTypes.pDataType, type.toString());
                    }

                    Object columnDefinition = col.get("definition");
                    if (columnDefinition != null) {
                        columnX.setProperty(LDMTypes.pDefinition, columnDefinition.toString());
                    }
                }
            }
        }


    }

}
