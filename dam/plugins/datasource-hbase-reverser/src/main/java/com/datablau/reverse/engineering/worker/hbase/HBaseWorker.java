package com.datablau.reverse.engineering.worker.hbase;

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
import com.datablau.reverse.engineering.data.ReverseEngineeringKnownParameterType;
import com.datablau.reverse.engineering.data.ReverseForwardOptions;
import com.datablau.reverse.engineering.data.ReversedSchema;
import com.datablau.reverse.engineering.exception.ReverseEngineeringFailedException;
import com.datablau.reverse.engineering.utility.JobProgress;
import com.datablau.reverse.engineering.utility.ProgressJob;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.CollectionUtils;

/**
 * @program: datablau-datasource-plugins
 * @description: HBase Worker
 * @author: nicky wang
 * @create: 2023-08-07 17:21
 **/
public class HBaseWorker extends ProgressJob implements ReverseForwardStrategy {
    private static final Logger LOGGER = LoggerFactory.getLogger(HBaseWorker.class);

    protected ReverseForwardOptions options;
    protected Datasource datasource;
    protected ReverseDelegator delegator;
    private IdGetter idGetter;
    private String modelName;
    protected Map<String, ReversedSchema> schemaMap = new ConcurrentHashMap<>();
    protected ModelX currentModel = null;

    @Override
    public ModelX reverseEngineer(ModelX modelX, Datasource datasource,
                                  ReverseForwardOptions options) throws ReverseEngineeringFailedException {

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

    protected void preReverseEngineering() {
        if (options.getObjectCreationWatcher() != null) {
            options.getObjectCreationWatcher().setModelX(currentModel);
            currentModel.setObjectCreationWatcher(options.getObjectCreationWatcher());
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

    private ModelX innerReverseEngineer(ModelX model) throws ReverseEngineeringFailedException {
        LOGGER.info("Start to do re for model:" + model.getName());

        try {
            if (this.datasource instanceof ReverseDelegator) {
                this.delegator = (ReverseDelegator) this.datasource;
            } else {
                throw new InvalidArgumentException("The data source must implement the ReverseDelegator interface");
            }

            List<Pair<ReversedSchema, DelegateReverseObject>> schemas = new ArrayList<>();
            for (DelegateReverseObject schema : this.delegator.getNamespaces()) {
                if (isSelectedSchema(schema.getName())) {
                    schemas.add(Pair.of(getOrCreateSchema(model, schema.getName()), schema));
                }
            }

            LOGGER.info("Namespaces gotten");
            LOGGER.info("Start to find tables...");
            updateProgress(new JobProgress(21, "reading tables..."));

            buildTables(schemas, model);

            updateProgress(new JobProgress(60, "model is created"));

            return model;
        } catch (Exception ex) {
            throw new ReverseEngineeringFailedException("Reverse failure:" + ex.getMessage(), ex);
        } finally {
            if (this.datasource != null) {
                try {
                    this.datasource.close();
                } catch (Exception ex) {

                }
            }
        }
    }

    private void buildTables(List<Pair<ReversedSchema, DelegateReverseObject>> schemas, ModelX modelX) throws Exception {
        for (Pair<ReversedSchema, DelegateReverseObject> schema : schemas) {
            LOGGER.info("processing schema:" + schema.getFirst().getSchemaName());

            List<DelegateReverseObject> tables = this.delegator.getChildren(schema.getSecond());
            LOGGER.info("there are total " + tables.size() + " tables");

            int i = 1, total = tables.size();

            for (DelegateReverseObject table : tables) {
                LOGGER.info("re table:" + table.getName() + " - " + (i++) + "/" + total);
                ObjectX tableX = createTable(modelX);
                tableX.setObjectClass("Datablau.LDM.EntityCollection");
                tableX.setProperty(LDMTypes.pName, table.getName());

                tableX.setProperty(LDMTypes.pSchemaRef, schema.getFirst().getSchemaId());
                tableX.setProperty(LDMTypes.pSchemaName, schema.getFirst().getSchemaName());

                String tableSchema = schema.getFirst().getSchemaName();
                LOGGER.info("this table tableSchema is :" + tableSchema);
                ReversedSchema oSchema = getOrCreateSchema(modelX, tableSchema);
                setSchemaInfoToObject(oSchema, tableX);


                for (String columnName : this.delegator.getChildren(table).stream().map(r -> r.getName()).collect(Collectors.toList())) {
                    ObjectX columnX = (ObjectX) tableX.createObject(LDMTypes.oAttribute, getNextId(), "Datablau.LDM.CollectionNode");
                    LOGGER.info("columnName is :" + columnName);

                    columnX.setProperty(LDMTypes.pName, columnName);
                    columnX.setProperty(LDMTypes.pDataType, "byte array");

                    columnX.setProperty(LDMTypes.pSchemaRef, schema.getFirst().getSchemaId());
                    columnX.setProperty(LDMTypes.pSchemaName, schema.getFirst().getSchemaName());

                    columnX.setObjectIsFullyCreated();
                }

                if (options.needToPersis()) {
                    tableX.setObjectIsFullyCreated();
                }
            }
        }
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

    protected Long getNextId() {
        return this.idGetter.getNextId();
    }

    @Override
    public void setIdGetter(IdGetter idGetter) {
        this.idGetter = idGetter;
    }

    @Override
    public String getType() {
        return "HBASE";
    }

    @Override
    public boolean canHandleDatasource(Datasource datasource) {
        return datasource.getType().equals(getType());
    }
}
