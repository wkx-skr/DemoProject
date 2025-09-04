package com.datablau.reverse.engineering.worker.iceberg;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.core.model.ObjectX;
import com.andorj.enhance.sql.data.Pair;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.CollectionUtils;


public class IcebergWorker extends ProgressJob implements ReverseForwardStrategy {

    private static final Logger LOGGER = LoggerFactory.getLogger(IcebergWorker.class);

    protected ReverseForwardOptions options;

    protected Datasource datasource;

    protected ReverseDelegator delegator;

    private IdGetter idGetter;

    private String modelName;

    protected Map<String, ReversedSchema> schemaMap = new ConcurrentHashMap<>();

    public ModelX reverseEngineer(ModelX modelX, Datasource datasource, ReverseForwardOptions options) throws ReverseEngineeringFailedException {
        if (options == null)
            throw new InvalidArgumentException("re options cannot be null");
        this.options = options;
        if (datasource == null)
            throw new InvalidArgumentException("datasource cannot be null");
        this.datasource = datasource;
        this.modelName = modelX.getName();
        updateProgress(new JobProgress(0, "start..."));
        try {
            if (this.options.getObjectCreationWatcher() != null) {
                this.options.getObjectCreationWatcher().setModelX(modelX);
                modelX.setObjectCreationWatcher(options.getObjectCreationWatcher());
            }
            innerReverseEngineer(modelX);
            if (options.isFinalizeModel())
                options.getObjectCreationWatcher().finalizeModel();
        } catch (Throwable tw) {
            options.getClearModelCallback().clearModel(modelX.getId(), datasource);
            LOGGER.error("failed to re model of type '" + datasource.getType() + "'", tw);
            throw new ReverseEngineeringFailedException("Reverse data source failure:" + tw.getMessage(), tw);
        }
        return modelX;
    }

    private boolean isSelectedSchema(String schema) {
        if (CollectionUtils.isEmpty(this.options.getSelectedDatabases()))
            return true;
        for (String selectedSchema : this.options.getSelectedDatabases()) {
            if (schema.equalsIgnoreCase(selectedSchema))
                return true;
        }
        return false;
    }

    private ModelX innerReverseEngineer(ModelX model) throws ReverseEngineeringFailedException {
        LOGGER.info("Start to do re for model:" + model.getName());
        try {
            if (this.datasource instanceof ReverseDelegator) {
                this.delegator = (ReverseDelegator)this.datasource;
            } else {
                throw new InvalidArgumentException("The data source must implement the ReverseDelegator interface");
            }
            List<Pair<ReversedSchema, DelegateReverseObject>> schemas = new ArrayList<>();
            for (DelegateReverseObject schema : this.delegator.getNamespaces()) {
                if (isSelectedSchema(schema.getName()))
                    schemas.add(Pair.of(getOrCreateSchema(model, schema.getName()), schema));
            }
            LOGGER.debug("Namespaces gotten");
            LOGGER.debug("Start to find tables...");
            updateProgress(new JobProgress(21, "reading tables..."));
            buildTables(schemas, model);
            updateProgress(new JobProgress(60, "model is created"));
            return model;
        } catch (Exception ex) {
            throw new ReverseEngineeringFailedException("Reverse failure:" + ex.getMessage(), ex);
        } finally {
            if (this.datasource != null)
                try {
                    this.datasource.close();
                } catch (Exception ignored) {}
        }
    }

    private void buildTables(List<Pair<ReversedSchema, DelegateReverseObject>> schemas, ModelX modelX) {
        for (Pair<ReversedSchema, DelegateReverseObject> schema : schemas) {
            LOGGER.info("processing schema:" + schema.getFirst().getSchemaName());
            List<DelegateReverseObject> tables = this.delegator.getChildren(schema.getSecond());
            LOGGER.info("there are total " + tables.size() + " tables");
            int i = 1, total = tables.size();
            for (DelegateReverseObject table : tables) {
                LOGGER.info("re table:" + table.getName() + " - " + i++ + "/" + total);
                ObjectX tableX = createTable(modelX);
                tableX.setObjectClass("Datablau.LDM.EntityCollection");
                tableX.setProperty(90000003L, table.getName());
                tableX.setProperty(80700005L, schema.getFirst().getSchemaId());
                tableX.setProperty(82800030L, schema.getFirst().getSchemaName());
                String tableSchema = table.getParent().getName();
                ReversedSchema oSchema = getOrCreateSchema(modelX, tableSchema);
                setSchemaInfoToObject(oSchema, tableX);
                try {
                    for (DelegateReverseObject columnObject : this.delegator.getChildren(table)) {
                        Map<String, String> properties = columnObject.getProperties();
                        String dataType = properties.get("columnType");
                        String notNull = properties.getOrDefault("columnNotNull", "true");
                        String comment = properties.getOrDefault("columnComment", "");
                        ObjectX columnX = (ObjectX)tableX.createObject(80000005L, getNextId(), "Datablau.LDM.CollectionNode");

                        columnX.setProperty(90000003L, columnObject.getName());
                        columnX.setProperty(80000002L, dataType);
                        columnX.setProperty(80100033L, !getBoolean(notNull));
                        columnX.setProperty(90000004L, comment);
                        columnX.setProperty(80700005L, schema.getFirst().getSchemaId());
                        columnX.setProperty(82800030L, schema.getFirst().getSchemaName());

                        columnX.setParentPhysicalName(tableX.getName());
                        columnX.setParentLogicalName(tableX.getLogicalName());
                        columnX.setParentObjectId(tableX.getId());

                        columnX.setObjectIsFullyCreated();
                    }
                } catch (Exception e) {
                    LOGGER.error(String.format("获取表[%s]的字段失败: %s", table.getName(), e.getMessage()), e);
                }
                if (this.options.needToPersis())
                    tableX.setObjectIsFullyCreated();
            }
        }
    }

    protected void setSchemaInfoToObject(ReversedSchema schema, ObjectX object) {
        if (schema == null || object == null)
            return;
        object.setProperty(80700005L, schema.getSchemaId());
        object.setProperty(82800030L, schema.getSchemaName());
    }

    protected ObjectX createTable(ModelX modelX) {
        ObjectX table = this.options.needToPersis() ? ObjectX.createSingleObject(80000004L, getNextId(), modelX) : (ObjectX)modelX.createObject(80000004L, getNextId());
        table.setParentPhysicalName(modelX.getPhysicalName());
        table.setParentLogicalName(modelX.getLogicalName());
        table.setParentObjectId(modelX.getId());
        modelX.addObject(table);
        return table;
    }

    protected synchronized ReversedSchema getOrCreateSchema(ModelX modelX, String schemaName) {
        if (this.schemaMap.containsKey(schemaName))
            return this.schemaMap.get(schemaName);
        ObjectX schema = this.options.needToPersis() ? ObjectX.createSingleObject(80700001L, getNextId(), modelX) : (ObjectX)modelX.createObject(80700001L, getNextId());
        schema.setParentObjectId(modelX.getId());
        schema.setParentLogicalName(modelX.getLogicalName());
        schema.setParentPhysicalName(modelX.getPhysicalName());
        schema.setName(schemaName);
        schema.setObjectIsFullyCreated();
        this.schemaMap.put(schema.getName(), new ReversedSchema(schema));
        modelX.addObject(schema);
        return this.schemaMap.get(schema.getName());
    }

    protected boolean getBoolean(String str) {
        return ("true".compareToIgnoreCase(str) == 0);
    }

    protected Long getNextId() {
        return this.idGetter.getNextId();
    }

    public void setIdGetter(IdGetter idGetter) {
        this.idGetter = idGetter;
    }

    public String getType() {
        return "ICEBERG";
    }

    public boolean canHandleDatasource(Datasource datasource) {
        return datasource.getType().equals(getType());
    }

}
