package com.datablau.reverse.engineering.worker.hive;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.core.model.ObjectX;
import com.datablau.datasource.api.Datasource;
import com.datablau.datasource.api.ReverseDelegator;
import com.datablau.datasource.data.DelegateReverseObject;
import com.datablau.datasource.util.ConnectionManager;
import com.datablau.reverse.engineering.api.JdbcPlugin;
import com.datablau.reverse.engineering.data.ReverseForwardOptions;
import com.datablau.reverse.engineering.data.ReversedSchema;
import com.datablau.reverse.engineering.data.ReversedTable;
import com.datablau.reverse.engineering.exception.ReverseEngineeringFailedException;
import com.datablau.reverse.engineering.utility.JobProgress;
import com.datablau.reverse.engineering.worker.ReverseForwardStrategyJdbc;
import com.datablau.reverse.engineering.worker.utility.ParallelizeReverseEngineerWorker;
import com.google.common.base.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.CollectionUtils;

import javax.sql.DataSource;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.*;
import java.util.stream.Collectors;

/**
 * @program: datablau-datasource-plugins
 * @description: HiveWorker
 * @author: wang tong
 * @create: 2023-08-17 16:08
 **/
public class HiveWorker extends ReverseForwardStrategyJdbc implements JdbcPlugin {

    private static final Logger LOGGER = LoggerFactory.getLogger(HiveWorker.class);

    private String modelName;
    protected ReverseDelegator delegator;

    protected Datasource datasource;

    protected ConnectionManager connectionManager;

    @Override
    public String getType() {
        return "HIVE";
    }

    /**
     * some db like "hive" don't have database,only have schema; but we transport schema in options selectedDatabases
     */
    protected void handleSchemas(List<String> schemas) {
        this.schemaPattern.addAll(options.getSelectedDatabases());
        for(String singleSchema: options.getSelectedDatabases()){
            getOrCreateSchema(currentModel, singleSchema);
        }

        if (CollectionUtils.isEmpty(options.getSelectedSchemas())
                && !options.getSelectedDatabases().isEmpty()) {
            options.getSelectedSchemas().addAll(options.getSelectedDatabases());
        }
        options.getSelectedDatabases().clear();
        options.getSelectedDatabases().add(null);
    }


    @Override
    protected ObjectX createTable(ModelX modelX) {
        ObjectX res = super.createTable(modelX);
        res.setObjectClass("Datablau.LDM.EntityCollection");
        return res;
    }

    @Override
    protected ObjectX createColumn(ModelX model, ReversedTable table) {
        ObjectX res = super.createColumn(model, table);
        res.setObjectClass("Datablau.LDM.CollectionNode");
        return res;
    }

    protected ObjectX createColumn(ObjectX tableX) {
        ObjectX column =
                options.needToPersis() ?
                        ObjectX.createSingleObject(LDMTypes.oAttribute, getNextId(), tableX.getModelX())
                        : (ObjectX) tableX.createObject(LDMTypes.oAttribute, getNextId());
        column.setParentPhysicalName(tableX.getName());
        column.setParentLogicalName(tableX.getLogicalName());
        column.setParentObjectId(tableX.getId());
        column.setProperty(LDMTypes.pSchemaName, tableX.getProperty(LDMTypes.pSchemaName));

        column.setObjectClass("Datablau.LDM.CollectionNode");
        return column;
    }


    protected ObjectX createColumnUnPersis(ObjectX tableX) {
        ObjectX column =
                (ObjectX) tableX.createObject(LDMTypes.oAttribute, getNextId());
        column.setParentPhysicalName(tableX.getName());
        column.setParentLogicalName(tableX.getLogicalName());
        column.setParentObjectId(tableX.getId());
        column.setProperty(LDMTypes.pSchemaName, tableX.getProperty(LDMTypes.pSchemaName));

        column.setObjectClass("Datablau.LDM.CollectionNode");
        return column;
    }

    @Override
    public void extractComplexName(ObjectX col, String DataType) {
        DataType = DataType.toUpperCase();

        if (DataType.startsWith("ARRAY<")) {
            col.setProperty(LDMTypes.pDataType, "ARRAY");

            ObjectX childCol1 = //(ObjectX) col.CreateCollectionNode(LDMTypes.oAttribute);
                    createColumnUnPersis(col);
            childCol1.setProperty(LDMTypes.pName, "item");
            extractComplexName(childCol1, DataType.substring("ARRAY<".length()));
        } else if (DataType.startsWith("MAP<")) {
            col.setProperty(LDMTypes.pDataType, "MAP");

            String subDT = DataType.substring("MAP<".length()).trim();

            ObjectX childCol1 = //(ObjectX) col.CreateCollectionNode(LDMTypes.oAttribute);
                    createColumnUnPersis(col);
            childCol1.setProperty(LDMTypes.pName, "key");
            childCol1.setProperty(LDMTypes.pDataType, subDT.substring(0, subDT.indexOf(",")));

            ObjectX childCol2 = //(ObjectX) col.CreateCollectionNode(LDMTypes.oAttribute);
                    createColumnUnPersis(col);
            childCol2.setProperty(LDMTypes.pName, "value");
            extractComplexName(childCol2, subDT.substring(subDT.indexOf(",") + 1));
        } else if (DataType.startsWith("STRUCT<")) {
            col.setProperty(LDMTypes.pDataType, "STRUCT");

            String subDT = DataType.substring("STRUCT<".length()).trim();

            ObjectX childCol1 = //(ObjectX) col.CreateCollectionNode(LDMTypes.oAttribute);
                    createColumnUnPersis(col);
            childCol1.setProperty(LDMTypes.pName, subDT.substring(0, subDT.indexOf(":")).trim());
            extractComplexName(childCol1, subDT.substring(subDT.indexOf(":") + 1).trim());

        } else if (DataType.startsWith("UNIONTYPE<")) {
            col.setProperty(LDMTypes.pDataType, "UNIONTYPE");

            String subDT = DataType.substring("UNIONTYPE<".length()).trim();

            ObjectX childCol1 = //(ObjectX) col.CreateCollectionNode(LDMTypes.oAttribute);
                    createColumnUnPersis(col);
            childCol1.setProperty(LDMTypes.pName, "unionCol");
            extractComplexName(childCol1, subDT);
        } else {
            if (DataType.indexOf(",") != -1) {
                col.setProperty(LDMTypes.pDataType, DataType.substring(0, DataType.indexOf(",")));
                String remains = DataType.substring(DataType.indexOf(",") + 1).trim();

                if (DataType.indexOf(":") == -1) {
                    ObjectX childCol2 = //(ObjectX) col.getOwner().CreateCollectionNode(LDMTypes.oAttribute);
                            createColumnUnPersis(col.getOwner());
                    childCol2.setProperty(LDMTypes.pName, "unionCol");
                    extractComplexName(childCol2, remains);
                } else {
                    ObjectX childCol2 = //(ObjectX) col.getOwner().CreateCollectionNode(LDMTypes.oAttribute);
                            createColumnUnPersis(col.getOwner());
                    childCol2.setProperty(LDMTypes.pName, remains.substring(0, remains.indexOf(":")).trim());
                    extractComplexName(childCol2, remains.substring(remains.indexOf(":") + 1).trim());
                }

            } else {
                if (DataType.indexOf(">") != -1) {
                    col.setProperty(LDMTypes.pDataType, DataType.substring(0, DataType.indexOf(">")));
                }

            }

        }
    }

    @Override
    public String generateFullDataType(ResultSet columnResultSet, String datatype, Integer s,  Integer p) {
        String colDataType = datatype;

        if (datatype.compareToIgnoreCase("BINARY") == 0
                || datatype.compareToIgnoreCase("BIGINT") == 0
                || datatype.compareToIgnoreCase("BOOLEAN") == 0
                || datatype.compareToIgnoreCase("DATE") == 0
                || datatype.compareToIgnoreCase("DOUBLE") == 0
                || datatype.compareToIgnoreCase("DOUBLE PRECISION") == 0
                || datatype.compareToIgnoreCase("FLOAT") == 0
                || datatype.compareToIgnoreCase("INT") == 0
                || datatype.compareToIgnoreCase("INTEGER") == 0
                || datatype.compareToIgnoreCase("INTERVAL") == 0
                || datatype.compareToIgnoreCase("SMALLINT") == 0
                || datatype.compareToIgnoreCase("STRING") == 0
                || datatype.compareToIgnoreCase("TIMESTAMP") == 0
                || datatype.compareToIgnoreCase("TINYINT") == 0
                || datatype.startsWith("ARRAY<")
                || datatype.startsWith("MAP<")
                || datatype.startsWith("STRUCT<")
                || datatype.startsWith("UNIONTYPE<")) {
            // no scale & precision
        } else if (datatype.compareToIgnoreCase("DECIMAL") == 0
                || datatype.compareToIgnoreCase("NUMERIC") == 0) {
            colDataType += "(" + s + "," + p + ")";
        } else {
            colDataType += "(" + s;
            colDataType += ")";
        }

        return colDataType;
    }

    @Override
    public String getViewSqlOfView(String catalog, String schema, String viewName) {

        LOGGER.debug("try to get Hive view sql");
        if(Strings.isNullOrEmpty(schema)){
            schema = catalog;
        }
        String sql = "";
        String query = "SHOW CREATE TABLE `" + schema + "`.`" + viewName + "`";
        StringBuffer sb = new StringBuffer();

        try (Statement stmt = connectionManager.borrowConnection().createStatement();
             ResultSet results = stmt.executeQuery(query)) {
            LOGGER.debug(query);

            while (results.next()) {
                String value = results.getString(1);
                if (!Strings.isNullOrEmpty(value)) {
                    sb.append(value);
                }
            }
            if (sb != null && sb.length() > 0) {
                sql = sb.toString();
            }
        } catch (SQLException ex) {
            LOGGER.error("Failed to get Hive view sql", ex);
        }

        return sql;
    }

    public boolean isView(ResultSet rs) throws SQLException {
        String tableName = rs.getString("TABLE_NAME");
        String tableType = rs.getString("TABLE_TYPE");
        if (!"VIEW".equals(tableType)) {
            LOGGER.warn("get views but return table，[" + tableName + "] type "
                    + tableType);
            return false;
        }
        return true;
    }

    public boolean isTable(ResultSet rs) throws SQLException {
        String tableName = rs.getString("TABLE_NAME");
        String tableType = rs.getString("TABLE_TYPE");
        if (!"TABLE".equals(tableType)) {
            LOGGER.warn("get tables but return view，[" + tableName + "] type "
                    + tableType);
            return false;
        }
        return true;
    }

    @Override
    protected void readTables(ModelX model, String catalog, String schema, List<ResultSet> tableResultSets) throws Exception {
        try {
            for (ResultSet rs : tableResultSets) {
                try {
                    checkStopSign();
                    while (rs.next()) {
                        if (!isTable(rs)) {
                            continue;
                        }

                        String tableSchema = rs.getString("TABLE_SCHEM");
                        if (Strings.isNullOrEmpty(tableSchema) && !Strings.isNullOrEmpty(catalog)) {
                            tableSchema = catalog;
                        }

                        String tableName = rs.getString("TABLE_NAME");
                        if (options.isInBlackList(tableName, LDMTypes.oEntity)
                                || checkTableExistence(
                                tableSchema, tableName)) {
                            LOGGER.debug(
                                    "table '" + tableName + "' is in the black list or already exists");
                            continue;
                        }

                        if (ignoreTheTable(catalog, tableSchema, tableName)) {
                            continue;
                        }

                        String tableType = rs.getString("TABLE_TYPE");
                        if (!"TABLE".equals(tableType)) {
                            LOGGER.info(
                                    " \'" + tableName + "\' is not type of TABLE but " + tableType);
                            continue;
                        }

                        ObjectX tableX = createTable(model);
                        if (tableX == null) {
                            LOGGER.error("unable to create tableX");
                            continue;
                        }

                        tableX.setName(tableName);

                        ReversedSchema oSchema = getOrCreateSchema(model, tableSchema);
                        setSchemaInfoToObject(oSchema, tableX);

                        String tableDefinition = rs.getString("REMARKS");
                        if (tableDefinition != null && tableDefinition.length() > 0) {
                            setCommentToObject(tableX, tableDefinition);
                        }

                        String tableKey = getNormalizedTableName(catalog, schema, tableName);
                        if (tableCommentMap.containsKey(tableKey)) {
                            setCommentToObject(tableX, tableCommentMap.get(tableKey));
                        }

                        ReversedTable table = oSchema.addTable(tableX);
                        processSave();

                        if (options.needToPersis()) {
                            table.getTableX().setObjectIsFullyCreated();
                            table.clearObjectX();
                        }
                    }
                } finally {
                    closeResultSet(rs);
                }
            }

            LOGGER.info("fetching table metadata of schema \'" + schema + "\' is done");
        } finally {
            makeSureResultSetIsClosed(tableResultSets);
        }
    }

    @Override
    protected void readViews(ModelX model, String catalog, String schema, List<ResultSet> viewResultSets) throws Exception {
        List<ReversedTable> viewXs = new ArrayList<>();
        ReversedSchema oSchema = null;

        try {
            for (ResultSet viewResultSet : viewResultSets) {
                try {
                    checkStopSign();
                    while (viewResultSet.next()) {
                        if (!isView(viewResultSet)) {
                            continue;
                        }

                        String viewSchema = viewResultSet.getString("TABLE_SCHEM");
                        if (Strings.isNullOrEmpty(viewSchema) && !Strings.isNullOrEmpty(catalog)) {
                            viewSchema = catalog;
                        }
                        String viewName = viewResultSet.getString("TABLE_NAME");
                        if (options.isInBlackList(viewName, LDMTypes.oView) || checkTableExistence(
                                viewSchema, viewName)) {
                            LOGGER.debug(
                                    "view '" + viewName + "' is in the black list or already REed");
                            continue;
                        }

                        if (ignoreTheView(catalog, viewSchema, viewName)) {
                            continue;
                        }

                        LOGGER.debug("loading view " + viewSchema + "/" + viewName);

                        oSchema = getOrCreateSchema(model, viewSchema);
                        ObjectX viewX = createView(model);
                        viewX.setName(viewName);
                        setSchemaInfoToObject(oSchema, viewX);

                        String viewDefinition = viewResultSet.getString("REMARKS");
                        if (!Strings.isNullOrEmpty(viewDefinition)) {
                            setCommentToObject(viewX, viewDefinition);
                        }

                        String viewKey = getNormalizedTableName(catalog, schema, viewName);
                        if (tableCommentMap.containsKey(viewKey)) {
                            setCommentToObject(viewX, tableCommentMap.get(viewKey));
                        }

                        String sql = getViewSqlOfView(catalog, schema, viewName);
                        if (!Strings.isNullOrEmpty(sql)) {
                            viewX.setProperty(LDMTypes.pSQL, sql);
                        }

                        ReversedTable reversedView = oSchema.addTable(viewX);
                        viewXs.add(reversedView);
                    }

                } finally {
                    closeResultSet(viewResultSet);
                }
            }

            if (oSchema != null) {
                readEntireViewSQL(catalog, schema, oSchema, getViewSqlOfSchema(catalog, schema));
            }

            if (options.needToPersis()) {
                for (ReversedTable view : viewXs) {
                    if (view.getTableX() != null) {
                        view.getTableX().setObjectIsFullyCreated();
                        view.clearObjectX();
                    }
                }
            }

        } finally {
            makeSureResultSetIsClosed(viewResultSets);
        }
    }

    protected ModelX innerReverseEngineer(ModelX model) {
        LOGGER.info("Start to do re for model:" + model.getName());
        this.preExecution();

        try {
//            if (!(this.datasource instanceof JdbcDatasource)) {
//                throw new UnSupportedException("当前逆向只支持JDBC类型数据源，当前的是:" + this.datasource.getType());
//            } else {
//                this.jdbcDatasource = (JdbcDatasource) this.datasource;
            this.currentModel = model;
            if (this.options.getObjectCreationWatcher() != null) {
                this.options.getObjectCreationWatcher().setModelX(this.currentModel);
                this.currentModel.setObjectCreationWatcher(this.options.getObjectCreationWatcher());
            }

            this.handleSchemas(this.options.getSelectedSchemas());
            this.updateProgress(new JobProgress(10, "reading tables and views..."));
//                preReverseEngineering();
            long start = System.currentTimeMillis();
            List<String> selectedDatabases = this.options.getSelectedDatabases();
            if (selectedDatabases.isEmpty()) {
                selectedDatabases.add(this.getCurCatalog());
            }

            if ("HIVE".equalsIgnoreCase(this.datasource.getType()) || "IMPALA".equalsIgnoreCase(this.datasource.getType())) {
                if (CollectionUtils.isEmpty(this.options.getSelectedSchemas()) && !this.options.getSelectedDatabases().isEmpty()) {
                    this.options.getSelectedSchemas().addAll(this.options.getSelectedDatabases());
                }

                selectedDatabases.clear();
                selectedDatabases.add(null);
            }

            this.checkStopSign();
            Iterator var5 = selectedDatabases.iterator();

            while (true) {
                String database;
                Iterator var7;
                String schema;
                while (var5.hasNext()) {
                    database = (String) var5.next();
                    if (CollectionUtils.isEmpty(this.options.getSelectedSchemas())) {
                        LOGGER.info("reading table comment of database '" + database + "' ...");
                        this.tableCommentMap = this.innerGetTableCommentOfSchema(database, (String) null);
                    } else {
                        for (var7 = this.options.getSelectedSchemas().iterator(); var7.hasNext(); this.tableCommentMap = this.innerGetTableCommentOfSchema(database, schema)) {
                            schema = (String) var7.next();
                            LOGGER.info("reading table comment of schema '" + schema + "' ...");
                        }
                    }
                }

                Logger var10000 = LOGGER;
                long var10001 = System.currentTimeMillis() - start;
                var10000.info("build table/view comments cost " + var10001 / 1000L + "s");
                LOGGER.info("start to build tables...");
                start = System.currentTimeMillis();
                this.checkStopSign();
                var5 = selectedDatabases.iterator();

                while (var5.hasNext()) {
                    database = (String) var5.next();
                    this.buildTables(model, database);
                }

                var10000 = LOGGER;
                var10001 = System.currentTimeMillis() - start;
                var10000.info("build tables cost " + var10001 / 1000L + "s");
                if (this.options.doNotFetchViews()) {
                    LOGGER.info("skip to build views...");
                } else {
                    LOGGER.info("start to build views...");
                    start = System.currentTimeMillis();
                    this.checkStopSign();
                    var5 = selectedDatabases.iterator();

                    while (var5.hasNext()) {
                        database = (String) var5.next();
                        this.buildViews(model, database);
                    }

                    var10000 = LOGGER;
                    var10001 = System.currentTimeMillis() - start;
                    var10000.info("build views cost " + var10001 / 1000L + "s");
                }

                LOGGER.info("start to build columns...");
                start = System.currentTimeMillis();
                this.checkStopSign();
                var5 = selectedDatabases.iterator();

                while (var5.hasNext()) {
                    database = (String) var5.next();
                    this.buildColumnsAndIndices(model, database);
                }

                var10000 = LOGGER;
                var10001 = System.currentTimeMillis() - start;
                var10000.info("build columns and indices cost " + var10001 / 1000L + "s");
                LOGGER.info("start to build PhysicalConnectionByFK...");
                start = System.currentTimeMillis();
                this.checkStopSign();
                var5 = selectedDatabases.iterator();

                while (var5.hasNext()) {
                    database = (String) var5.next();
                    if (this.options.isBuildPhysicalConnectionByFK()) {
                        LOGGER.info("build foreign key of database '" + database + "'...");
                        this.buildForeignKeys(model, database);
                    }
                }

                var10000 = LOGGER;
                var10001 = System.currentTimeMillis() - start;
                var10000.info("build PhysicalConnectionByFK cost " + var10001 / 1000L + "s");
                if (this.options.doNotFetchProcedures()) {
                    LOGGER.info("skip to build procedures...");
                } else {
                    LOGGER.info("start to build procedures...");
                    start = System.currentTimeMillis();
                    this.checkStopSign();
                    var5 = selectedDatabases.iterator();

                    while (var5.hasNext()) {
                        database = (String) var5.next();
                        this.buildProcedures(model, database);
                    }

                    var10000 = LOGGER;
                    var10001 = System.currentTimeMillis() - start;
                    var10000.info("build procedures cost " + var10001 / 1000L + "s");
                }

                if (this.options.doNotFetchFunctions()) {
                    LOGGER.info("skip to build functions...");
                } else {
                    LOGGER.info("start to build functions...");
                    start = System.currentTimeMillis();
                    this.checkStopSign();
                    var5 = selectedDatabases.iterator();

                    while (var5.hasNext()) {
                        database = (String) var5.next();
                        this.buildFunctions(model, database);
                    }

                    var10000 = LOGGER;
                    var10001 = System.currentTimeMillis() - start;
                    var10000.info("build functions cost " + var10001 / 1000L + "s");
                }

                if (!this.options.doNotFetchPackages()) {
                    LOGGER.info("start to build datasource related objects...");
                    start = System.currentTimeMillis();
                    this.checkStopSign();

                    try {
                        var5 = selectedDatabases.iterator();

                        label347:
                        while (true) {
                            while (true) {
                                if (!var5.hasNext()) {
                                    break label347;
                                }

                                database = (String) var5.next();
                                if (CollectionUtils.isEmpty(this.options.getSelectedSchemas())) {
                                    this.buildDatasourceRelatedObjects(model, database, (String) null);
                                } else {
                                    var7 = this.options.getSelectedSchemas().iterator();

                                    while (var7.hasNext()) {
                                        schema = (String) var7.next();
                                        this.buildDatasourceRelatedObjects(model, database, schema);
                                    }
                                }
                            }
                        }
                    } catch (Exception var12) {
                        throw new UnexpectedStateException("逆向数据源相关对象出错:" + var12.getMessage(), var12);
                    }

                    var10000 = LOGGER;
                    var10001 = System.currentTimeMillis() - start;
                    var10000.info("build functions cost " + var10001 / 1000L + "s");
                } else {
                    LOGGER.info("skip to build datasource related objects...");
                }

                ModelX var14 = this.currentModel;
                return var14;
            }
//            }
//            }
        }  finally{
            this.postExecution();
        }
    }

    protected void readColumnsAndIndices(ModelX model, String catalog, String schema) throws Exception {
        LOGGER.info("reading column comments of schema '" + schema + "' ...");
        this.readColumnComments(catalog, schema);
        LOGGER.info("reading columns of schema '" + schema + "' ...");
        this.readColumns(model, catalog, schema, this.fetchAllColumns(catalog, schema));
        if (!this.options.isTableOnlyReColumns()) {
            LOGGER.info("reading pks of schema '" + schema + "' ...");
            this.readPKs(model, catalog, schema);
            LOGGER.info("reading fks of schema '" + schema + "' ...");
            this.readFKs(model, catalog, schema);
            LOGGER.info("reading indexes of schema '" + schema + "' ...");
            this.readIndexes(model, catalog, schema);
        } else {
            LOGGER.info("only RE columns of table ...");
        }

    }

    protected void readPKs(ModelX model, String database, String schema) throws Exception {
        ResultSet rs = this.getPrimaryKeysOfSchema(database, schema);
        if (rs != null) {
            this.processSchemaPrimaryKeyResultSet(model, database, schema, rs);
        } else {
            ReversedSchema reversedSchema = (ReversedSchema)this.schemaMap.get(Strings.isNullOrEmpty(schema) ? database : schema);
            if (reversedSchema != null) {
                ParallelizeReverseEngineerWorkerNew worker = new ParallelizeReverseEngineerWorkerNew(this.connectionManager);
                worker.startBatchOfJob();

                try {
                    Iterator var7 = reversedSchema.getAllTables().iterator();

                    while(var7.hasNext()) {
                        ReversedTable reversedTable = (ReversedTable)var7.next();
                        this.processPrimaryKeyResultSetNew(worker, model, reversedSchema, reversedTable, database, schema);
                    }
                } finally {
                    worker.endBatchOfJobs();
                }
            }
        }

    }

    protected void readIndexes(ModelX model, String database, String schema) throws Exception {
        ResultSet rs = this.getIndexesOfSchema(database, schema);
        if (rs != null) {
            this.processSchemaIndexesResultSet(model, database, schema, rs);
        } else {
            ReversedSchema reversedSchema = (ReversedSchema)this.schemaMap.get(Strings.isNullOrEmpty(schema) ? database : schema);
            if (reversedSchema != null) {
                ParallelizeReverseEngineerWorkerNew worker = new ParallelizeReverseEngineerWorkerNew(this.connectionManager);
                worker.startBatchOfJob();

                try {
                    Iterator var7 = reversedSchema.getAllTables().iterator();

                    while(var7.hasNext()) {
                        ReversedTable reversedTable = (ReversedTable)var7.next();
                        this.processIndexesResultSetNew(worker, model, reversedSchema, reversedTable, database, schema);
                    }
                } finally {
                    worker.endBatchOfJobs();
                }
            }
        }

    }

    protected void processIndexesResultSetNew(ParallelizeReverseEngineerWorkerNew parallelizeReverseEngineerWorker, ModelX model, ReversedSchema reversedSchema, ReversedTable reversedTable, String database, String schema) throws InterruptedException {
        parallelizeReverseEngineerWorker.submitJob((connection) -> {
            String lastIndexName = "";
            ObjectX preIdxObj = null;
            ObjectX curIdxObj = null;
            List<String> indexmember = new ArrayList();
            LOGGER.debug("loading index of table [" + reversedTable.getName() + "]");

            try {
                ResultSet rsIndexes = connection.getMetaData().getIndexInfo(database, schema, reversedTable.getName(), false, true);

                try {
                    label76:
                    while(true) {
                        boolean nonUnique;
                        String indexName;
                        String columnName2;
                        String ascOrDesc;
                        do {
                            do {
                                if (!rsIndexes.next()) {
                                    this.setIndexMembers(curIdxObj, indexmember);
                                    break label76;
                                }

                                nonUnique = rsIndexes.getBoolean("NON_UNIQUE");
                                indexName = rsIndexes.getString("INDEX_NAME");
                                columnName2 = rsIndexes.getString("COLUMN_NAME");
                                ascOrDesc = rsIndexes.getString("ASC_OR_DESC");
                            } while(Strings.isNullOrEmpty(indexName));
                        } while(reversedSchema.containsIndex(indexName));

                        boolean isLastFinished = false;
                        if (lastIndexName.compareToIgnoreCase(indexName) != 0) {
                            curIdxObj = this.createKeyGroup(model, reversedTable);
                            curIdxObj.setName(indexName);
                            curIdxObj.setProperty(80000097L, nonUnique ? "NonUniqueKey" : "UniqueKey");
                            reversedTable.addKeyGroup(curIdxObj);
                            if (preIdxObj != null) {
                                isLastFinished = true;
                            }

                            if (!isLastFinished) {
                                preIdxObj = curIdxObj;
                            }

                            lastIndexName = indexName;
                        }

                        if (isLastFinished) {
                            this.setIndexMembers(preIdxObj, indexmember);
                            preIdxObj = curIdxObj;
                        }

                        indexmember.add(columnName2 + ";" + (ascOrDesc != null && ascOrDesc.compareToIgnoreCase("A") != 0 ? "Descending" : "Ascending"));
                    }
                } catch (Throwable var18) {
                    if (rsIndexes != null) {
                        try {
                            rsIndexes.close();
                        } catch (Throwable var17) {
                            var18.addSuppressed(var17);
                        }
                    }

                    throw var18;
                }

                if (rsIndexes != null) {
                    rsIndexes.close();
                }
            } catch (Throwable var19) {
                LOGGER.warn("Failed to load index of table " + reversedTable.getName());
            }

        });
    }

    protected void readFKs(ModelX model, String database, String schema) throws Exception {
        ResultSet rs = this.getForeignKeysOfSchema(database, schema);
        if (rs != null) {
            this.processSchemaForeignKeyResultSet(model, database, schema, rs);
        } else {
            ReversedSchema reversedSchema = (ReversedSchema)this.schemaMap.get(Strings.isNullOrEmpty(schema) ? database : schema);
            if (reversedSchema != null) {
                ParallelizeReverseEngineerWorkerNew worker = new ParallelizeReverseEngineerWorkerNew(this.connectionManager);
                worker.startBatchOfJob();

                try {
                    Iterator var7 = reversedSchema.getAllTables().iterator();

                    while(var7.hasNext()) {
                        ReversedTable reversedTable = (ReversedTable)var7.next();
                        this.processForeignKeyResultSetNew(worker, model, reversedSchema, reversedTable, database, schema);
                    }
                } finally {
                    worker.endBatchOfJobs();
                }
            }
        }

    }

    protected void processForeignKeyResultSetNew(ParallelizeReverseEngineerWorkerNew parallelizeReverseEngineerWorker, ModelX model, ReversedSchema reversedSchema, ReversedTable reversedTable, String database, String schema) throws InterruptedException {
        parallelizeReverseEngineerWorker.submitJob((connection) -> {
            String fkName = "";
            ObjectX preFkObj = null;
            ObjectX curFkObj = null;
            List<String> fkMembers = new ArrayList();
            LOGGER.debug("loading fk of table [" + reversedTable.getName() + "]");

            try {
                ResultSet rsFKs = connection.getMetaData().getImportedKeys(database, schema, reversedTable.getName());

                try {
                    List fks = new LinkedList();
                    this.tableFKsMap.put(reversedTable.getId(), fks);

                    while(true) {
                        if (!rsFKs.next()) {
                            this.setIndexMembers(curFkObj, fkMembers);
                            break;
                        }

                        Map<String, String> fkMap = new HashMap();
                        String fkColumnName = rsFKs.getString("FKCOLUMN_NAME");
                        String fkName1 = rsFKs.getString("FK_NAME");
                        fkMap.put("FK_NAME", fkName1);
                        fkMap.put("PKTABLE_SCHEM", rsFKs.getString("PKTABLE_SCHEM"));
                        fkMap.put("PKTABLE_NAME", rsFKs.getString("PKTABLE_NAME"));
                        fkMap.put("FKTABLE_SCHEM", rsFKs.getString("FKTABLE_SCHEM"));
                        fkMap.put("FKTABLE_NAME", rsFKs.getString("FKTABLE_NAME"));
                        fkMap.put("PK_NAME", rsFKs.getString("PK_NAME"));
                        fks.add(fkMap);
                        boolean isLastFinished = false;
                        if (fkName.compareToIgnoreCase(fkName1) != 0) {
                            curFkObj = this.createKeyGroup(model, reversedTable);
                            curFkObj.setName(fkName1);
                            curFkObj.setProperty(80000097L, "ForeignKey");
                            reversedTable.addKeyGroup(curFkObj);
                            reversedSchema.addIndexName(fkName1);
                            if (preFkObj != null) {
                                isLastFinished = true;
                            }

                            if (!isLastFinished) {
                                preFkObj = curFkObj;
                            }

                            fkName = fkName1;
                        }

                        if (isLastFinished) {
                            this.setIndexMembers(preFkObj, fkMembers);
                            preFkObj = curFkObj;
                        }

                        fkMembers.add(fkColumnName);
                    }
                } catch (Throwable var18) {
                    if (rsFKs != null) {
                        try {
                            rsFKs.close();
                        } catch (Throwable var17) {
                            var18.addSuppressed(var17);
                        }
                    }

                    throw var18;
                }

                if (rsFKs != null) {
                    rsFKs.close();
                }
            } catch (Throwable var19) {
                LOGGER.warn("Failed to load fks of table " + reversedTable.getName());
            }

        });
    }

    protected void processPrimaryKeyResultSetNew(ParallelizeReverseEngineerWorkerNew parallelizeReverseEngineerWorker, ModelX model, ReversedSchema reversedSchema, ReversedTable reversedTable, String database, String schema) throws InterruptedException {
        parallelizeReverseEngineerWorker.submitJob((connection) -> {
            try {
                String pkName = "";
                ObjectX prePkObj = null;
                ObjectX curPkObj = null;
                HashMap<Integer, String> pkMembers = new HashMap();
                LOGGER.debug("loading pk of table [" + reversedTable.getName() + "]");
                ResultSet rsPKs = connection.getMetaData().getPrimaryKeys(database, schema, reversedTable.getName());

                try {
                    String columnName = "";

                    while(true) {
                        if (!rsPKs.next()) {
                            this.setIndexMembers(curPkObj, (List)pkMembers.entrySet().stream().sorted(Map.Entry.comparingByKey()).map((mem) -> {
                                return (String)mem.getValue();
                            }).collect(Collectors.toList()));
                            break;
                        }

                        columnName = rsPKs.getString("COLUMN_NAME");
                        String pkName1 = rsPKs.getString("PK_NAME");
                        Integer seq = rsPKs.getInt("KEY_SEQ");
                        if (seq == null) {
                            seq = 0;
                        }

                        boolean isLastFinished = false;
                        if (pkName1.compareToIgnoreCase(pkName) != 0) {
                            curPkObj = this.createKeyGroup(model, reversedTable);
                            curPkObj.setName(pkName1);
                            curPkObj.setProperty(80000097L, "PrimaryKey");
                            curPkObj.setProperty(80300006L, true);
                            reversedTable.addKeyGroup(curPkObj);
                            reversedSchema.addIndexName(pkName1);
                            if (prePkObj != null) {
                                isLastFinished = true;
                            }

                            if (!isLastFinished) {
                                prePkObj = curPkObj;
                            }

                            pkName = pkName1;
                        }

                        if (isLastFinished) {
                            this.setIndexMembers(prePkObj, (List)pkMembers.entrySet().stream().sorted(Map.Entry.comparingByKey()).map((mem) -> {
                                return (String)mem.getValue();
                            }).collect(Collectors.toList()));
                        }

                        pkMembers.put(seq, columnName);
                    }
                } catch (Throwable var17) {
                    if (rsPKs != null) {
                        try {
                            rsPKs.close();
                        } catch (Throwable var16) {
                            var17.addSuppressed(var16);
                        }
                    }

                    throw var17;
                }

                if (rsPKs != null) {
                    rsPKs.close();
                }
            } catch (Throwable var18) {
                LOGGER.warn("unable to get pk of table:" + reversedTable.toString(), var18);
            }

        });
    }

    protected DatabaseMetaData getDatabaseMetadata() {
        try {
            return this.connectionManager.borrowConnection().getMetaData();
        } catch (SQLException var2) {
            throw new UnexpectedStateException("Unable to get database metadata:" + var2.getMessage());
        }
    }

    @Override
    protected void buildTablesOfSchema(ModelX model, String catalog, String schema) throws Exception {
        this.checkStopSign();
        LOGGER.info("reading table metadata of schema '" + schema + "' ...");
        List<DelegateReverseObject> children = null;
        if (this.datasource instanceof ReverseDelegator) {
            this.delegator = (ReverseDelegator) this.datasource;
        } else {
            LOGGER.warn("datasource instanceof ReverseDelegator false");
        }
        LOGGER.info(" delegator is null:{}", delegator == null);
        if (delegator != null) {
            DelegateReverseObject delegateReverseObject = new DelegateReverseObject();
            delegateReverseObject.setName(catalog !=null && !catalog.equals("")? catalog : schema);
            try {
                children = delegator.getChildren(delegateReverseObject);
            } catch (Exception e) {
                LOGGER.error("get metadata udp error:{}", e);
            }
        }
        this.readTableList(model, catalog, schema, this.fetchAllTables(catalog, schema), children);
    }

    protected void readTableList(ModelX model, String catalog, String schema, List<ResultSet> tableResultSets, List<DelegateReverseObject> list) throws Exception {
        try {
            Map<String, Map<String, String>> udpMap = null;
            if (list != null) {
                LOGGER.info("获取到的表的扩展属性数量:{}", list.size());
                udpMap = list.stream().collect(Collectors.toMap(d -> d.getName(), d -> d.getProperties()));
            }
            for (ResultSet rs : tableResultSets) {
                try {
                    checkStopSign();
                    while (rs.next()) {
                        if (!isTable(rs)) {
                            continue;
                        }

                        String tableSchema = rs.getString("TABLE_SCHEM");
                        if (Strings.isNullOrEmpty(tableSchema) && !Strings.isNullOrEmpty(catalog)) {
                            tableSchema = catalog;
                        }

                        String tableName = rs.getString("TABLE_NAME");
                        if (options.isInBlackList(tableName, LDMTypes.oEntity)
                                || checkTableExistence(
                                tableSchema, tableName)) {
                            LOGGER.debug(
                                    "table '" + tableName + "' is in the black list or already exists");
                            continue;
                        }

                        if (ignoreTheTable(catalog, tableSchema, tableName)) {
                            continue;
                        }

                        String tableType = rs.getString("TABLE_TYPE");
                        if (!"TABLE".equals(tableType)) {
                            LOGGER.info(
                                    " \'" + tableName + "\' is not type of TABLE but " + tableType);
                            continue;
                        }

                        ObjectX tableX = createTable(model);
                        if (tableX == null) {
                            LOGGER.error("unable to create tableX");
                            continue;
                        }

                        tableX.setName(tableName);

                        ReversedSchema oSchema = getOrCreateSchema(model, tableSchema);
                        setSchemaInfoToObject(oSchema, tableX);

                        String tableDefinition = rs.getString("REMARKS");
                        if (tableDefinition != null && tableDefinition.length() > 0) {
                            setCommentToObject(tableX, tableDefinition);
                        }

                        String tableKey = getNormalizedTableName(catalog, schema, tableName);
                        if (tableCommentMap.containsKey(tableKey)) {
                            setCommentToObject(tableX, tableCommentMap.get(tableKey));
                        }

                        //处理扩展属性
                        if (udpMap != null) {
                            if (udpMap.containsKey(tableName.toLowerCase())) {
                                Map<String, String> map = udpMap.get(tableName.toLowerCase());
                                if (map != null) {
                                    //表的创建时间
                                    String createTime = map.get("createTime");
                                    if (!Strings.isNullOrEmpty(createTime)) {
                                        tableX.setProperty(LDMTypes.pTarget, createTime);
                                    }
                                    //表的更新时间
                                    String updateTime = map.get("updateTime");
                                    if (!Strings.isNullOrEmpty(updateTime)) {
                                        tableX.setProperty(LDMTypes.pInclusions, updateTime);
                                    }
                                    //表的存储大小
                                    String tableTotalSize = map.get("tableTotalSize");
                                    if (!Strings.isNullOrEmpty(tableTotalSize)) {
                                        tableX.setProperty(LDMTypes.pExclusions, tableTotalSize);
                                    }
                                    //表的数据量
                                    String entryNumRows = map.get("entryNumRows");
                                    if (!Strings.isNullOrEmpty(entryNumRows)) {
                                        tableX.setProperty(LDMTypes.pArchyObjectName, entryNumRows);
                                    }
                                }
                            }
                        }


                        ReversedTable table = oSchema.addTable(tableX);
                        processSave();

                        if (options.needToPersis()) {
                            table.getTableX().setObjectIsFullyCreated();
                            table.clearObjectX();
                        }
                    }
                } finally {
                    closeResultSet(rs);
                }
            }

            LOGGER.info("fetching table metadata of schema \'" + schema + "\' is done");
        } finally {
            makeSureResultSetIsClosed(tableResultSets);
        }
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
        LOGGER.info("datasource:{}", datasource.getType() + datasource.getProperties().getType());
        if (this.datasource instanceof ReverseDelegator) {
            this.delegator = (ReverseDelegator) this.datasource;
        } else {
            LOGGER.warn("datasource instanceof ReverseDelegator false");
        }
        if (datasource instanceof ConnectionManager) {
            this.connectionManager = (ConnectionManager) datasource;
        } else {
            LOGGER.warn("datasource instanceof ConnectionManager false");
        }
        this.modelName = modelX.getName();
        currentModel = modelX;
//        preReverseEngineering();
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
}
