package com.datablau.reverse.engineering.worker.es;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.core.model.ObjectCreationWatcher;
import com.andorj.common.core.model.ObjectX;
import com.andorj.enhance.sql.data.Pair;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.datasource.api.Datasource;
import com.datablau.datasource.api.ReverseDelegator;
import com.datablau.datasource.data.DelegateReverseObject;
import com.datablau.reverse.engineering.api.IdGetter;
import com.datablau.reverse.engineering.api.ReverseForwardStrategy;
import com.datablau.reverse.engineering.data.ReverseForwardOptions;
import com.datablau.reverse.engineering.data.ReversedSchema;
import com.datablau.reverse.engineering.data.ReversedTable;
import com.datablau.reverse.engineering.exception.ReverseEngineeringFailedException;
import com.datablau.reverse.engineering.utility.JobProgress;
import com.datablau.reverse.engineering.utility.ProgressJob;
import com.google.common.base.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.CollectionUtils;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @program: datablau-datasource-plugins
 * @description: es
 * @author: wang tong
 * @create: 2024-07-12 11:28
 **/
public class ElasticSearchWorker extends ProgressJob implements ReverseForwardStrategy {

    private static final Logger LOGGER = LoggerFactory.getLogger(ElasticSearchWorker.class);

    protected ReverseForwardOptions options;
    protected Datasource datasource;
    protected ReverseDelegator delegator;
    private IdGetter idGetter;
    private String modelName;
    protected Map<String, ReversedSchema> schemaMap = new ConcurrentHashMap<>();
    protected ModelX currentModel = null;
    protected ObjectCreationWatcher saver = null;
    protected boolean useProgressSave = false;

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
        return "ES";
    }

    @Override
    public boolean canHandleDatasource(Datasource datasource) {
        return datasource.getType().equals(getType());
    }

    protected Long getNextId() {
        return this.idGetter.getNextId();
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


        if (this.datasource instanceof ReverseDelegator) {
            this.delegator = (ReverseDelegator) this.datasource;
        } else {
            throw new InvalidArgumentException("The data source must implement the ReverseDelegator interface");
        }

        try {
            LOGGER.debug("Start reverse engineer--");
            checkStopSign();
            updateProgress(new JobProgress(20, "starting..."));

            preReverseEngineering();

            List<Pair<ReversedSchema, DelegateReverseObject>> schemas = new ArrayList<>();
            for (DelegateReverseObject schema : this.delegator.getNamespaces()) {
                if (isSelectedSchema(schema.getName())) {
                    schemas.add(Pair.of(getOrCreateSchema(model, schema.getName()), schema));
                }
            }
            LOGGER.debug("Schema gotten");
            LOGGER.debug("Start to find tables...");
            updateProgress(new JobProgress(21, "reading tables..."));


            buildTables(schemas, model);

            updateProgress(new JobProgress(60, "model is created"));
            postReverseEngineering();
            return model;
        } catch (Exception ex) {
            LOGGER.error("failed to re es:" + ex.getMessage(), ex);
            throw new UnexpectedStateException(GeneralUtility.getMessageService().getMessage("metadata.reverse.reverseEsFailed", ex.getMessage()), ex);
        }

    }

    private void buildTables(List<Pair<ReversedSchema, DelegateReverseObject>> schemas, ModelX modelX) throws Exception {
        for (Pair<ReversedSchema, DelegateReverseObject> sch : schemas) {
            LOGGER.info("processing schema:" + sch.getFirst().getSchemaName());

            List<DelegateReverseObject> mappings = this.delegator.getChildren(sch.getSecond());

            boolean isLargerThan7 = Boolean.parseBoolean(mappings.get(0).getProperties().get("version"));
            LOGGER.info("isLargerThan7" + isLargerThan7);
            String mapping = mappings.get(0).getProperties().get("mappings");

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, Object> map = mapper.readValue(mapping, HashMap.class);
            Map<String, Object> typeMap = (Map) map.get(sch.getFirst().getSchemaName());
            Map<String, Object> mappingMap = (Map) typeMap.get("mappings");

            if (isLargerThan7) {
                iterateMap(sch.getFirst().getSchemaName(), "doc", mappingMap, modelX);
            } else {
                Iterator<String> keys = mappingMap.keySet().iterator();
                while (keys.hasNext()) {
                    String key = keys.next();

                    if (options.getSelectedTableNamePatterns() != null
                            && !options.getSelectedTableNamePatterns().isEmpty()
                            && !options.getSelectedTableNamePatterns().contains(sch.getFirst().getSchemaName() + "." + key)) {
                        continue;
                    }

                    iterateMap(sch.getFirst().getSchemaName(), key, (Map<String, Object>) mappingMap.get(key), modelX);
                }
            }

        }
    }


    private void iterateMap(String schema, String typeName, Map<String, Object> map, ModelX modelX) {
        ComplexElasticType type = new ComplexElasticType();
        type.setName(typeName);
        LOGGER.debug("iterating " + typeName);
        Map<String, Object> subProperties = (Map<String, Object>) map.get("properties");
        for (String key : subProperties.keySet()) {
            iterateType(type, key, (Map<String, Object>) subProperties.get(key));
        }

        ObjectX tableX = createTable(modelX);
        tableX.setObjectClass("Datablau.LDM.EntityCollection");
        tableX.setProperty(LDMTypes.pName, typeName);

        ReversedSchema oSchema = getOrCreateSchema(modelX, schema);
        setSchemaInfoToObject(oSchema, tableX);
        ReversedTable table = oSchema.addTable(tableX);

        if (options.needToPersis()) {
            tableX.setObjectIsFullyCreated();
            table.clearObjectX();
        }

        fillColumns("", table, type);

        processSave();
    }

    private void fillColumns(String currentPrefix, ReversedTable table, ComplexElasticType parentType) {
        ComplexElasticType ct = parentType;
        for (ElasticType type : ct.getType()) {
            if (type instanceof SimpleElasticType) {
                ObjectX columnX = createColumn(table);
                columnX.setObjectClass("Datablau.LDM.CollectionNode");
                columnX.setProperty(LDMTypes.pName, (Strings.isNullOrEmpty(currentPrefix) ? "" : currentPrefix + ".") + type.getName());
                SimpleElasticType st = (SimpleElasticType) type;
                columnX.setProperty(LDMTypes.pDataType, st.getType());
                columnX.setObjectIsFullyCreated();

                processSave();
            } else {
                fillColumns((Strings.isNullOrEmpty(currentPrefix) ? "" : currentPrefix + ".") + type.getName(), table, (ComplexElasticType) type);
            }
        }
    }

    private void iterateType(ElasticType parentType, String typeName, Map<String, Object> properties) {
        if (properties.containsKey("properties")) {
            ComplexElasticType ct = new ComplexElasticType();
            ct.setName(typeName);
            Map<String, Object> subProperties = (Map<String, Object>) properties.get("properties");
            for (String key : subProperties.keySet()) {
                iterateType(ct, key, (Map<String, Object>) subProperties.get(key));
            }
            ((ComplexElasticType) parentType).addType(ct);
        } else {
            SimpleElasticType st = new SimpleElasticType();
            st.setName(typeName);
            st.setType((String) properties.get("type"));
            ((ComplexElasticType) parentType).addType(st);
        }
    }

    protected ObjectX createColumn(ReversedTable table) {
        ObjectX column =
                options.needToPersis() ?
                        ObjectX.createSingleObject(LDMTypes.oAttribute, getNextId(), currentModel)
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

    protected ObjectX createTable(ModelX modelX) {
        /*
        return (ObjectX) modelX.createObject(LDMTypes.oEntity, getNextId());
        */

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

    public interface ElasticType {
        String getName();

        void setName(String name);
    }

    public class ComplexElasticType implements Serializable, ElasticType {

        private String name;
        private List<ElasticType> type = new LinkedList<>();

        @Override
        public String getName() {
            return name;
        }

        @Override
        public void setName(String name) {
            this.name = name;
        }

        public List<ElasticType> getType() {
            return type;
        }

        public void setType(List<ElasticType> type) {
            this.type = type;
        }

        public void addType(ElasticType type) {
            this.type.add(type);
        }
    }

    public class SimpleElasticType implements Serializable, ElasticType {

        private String name;
        private String type;

        @Override
        public String getName() {
            return name;
        }

        @Override
        public void setName(String name) {
            this.name = name;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }
    }


}
