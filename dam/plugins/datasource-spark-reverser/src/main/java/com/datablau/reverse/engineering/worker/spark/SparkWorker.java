package com.datablau.reverse.engineering.worker.spark;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.core.model.ObjectX;
import com.datablau.reverse.engineering.api.JdbcPlugin;
import com.datablau.reverse.engineering.data.ReversedSchema;
import com.datablau.reverse.engineering.data.ReversedTable;
import com.datablau.reverse.engineering.worker.ReverseForwardStrategyJdbc;
import com.google.common.base.Strings;
import org.apache.commons.compress.utils.Lists;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.CollectionUtils;

import java.sql.*;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;


/**
 * @program: datablau-datasource-plugins
 * @description: SparkWorker
 * @author: wang tong
 * @create: 2023-08-17 16:08
 **/
public class SparkWorker extends ReverseForwardStrategyJdbc implements JdbcPlugin {

    private static final Logger logger = LoggerFactory.getLogger(SparkWorker.class);

    @Override
    public String getType() {
        return "SPARK";
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

        logger.debug("try to get Hive view sql");
        if(Strings.isNullOrEmpty(schema)){
            schema = catalog;
        }
        String sql = "";
        String query = "SHOW CREATE TABLE `" + schema + "`.`" + viewName + "`";
        StringBuffer sb = new StringBuffer();

        try (Statement stmt = jdbcDatasource.getConnection().createStatement();
             ResultSet results = stmt.executeQuery(query)) {
            logger.debug(query);

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
            logger.error("Failed to get Hive view sql", ex);
        }

        return sql;
    }

    public boolean isView(ResultSet rs) throws SQLException {
        String tableName = rs.getString("TABLE_NAME");
        String tableType = rs.getString("TABLE_TYPE");
        if (!"VIEW".equals(tableType)) {
            logger.warn("get views but return table，[" + tableName + "] type "
                    + tableType);
            return false;
        }
        return true;
    }

    public boolean isTable(ResultSet rs) throws SQLException {
        String tableName = rs.getString("TABLE_NAME");
        String tableType = rs.getString("TABLE_TYPE");
        if (!"TABLE".equals(tableType)) {
            logger.warn("get tables but return view，[" + tableName + "] type "
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
                            logger.debug(
                                    "table '" + tableName + "' is in the black list or already exists");
                            continue;
                        }

                        if (ignoreTheTable(catalog, tableSchema, tableName)) {
                            continue;
                        }

                        String tableType = rs.getString("TABLE_TYPE");
                        if (!"TABLE".equals(tableType)) {
                            logger.info(
                                    " \'" + tableName + "\' is not type of TABLE but " + tableType);
                            continue;
                        }

                        ObjectX tableX = createTable(model);
                        if (tableX == null) {
                            logger.error("unable to create tableX");
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

            logger.info("fetching table metadata of schema \'" + schema + "\' is done");
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
                            logger.debug(
                                    "view '" + viewName + "' is in the black list or already REed");
                            continue;
                        }

                        if (ignoreTheView(catalog, viewSchema, viewName)) {
                            continue;
                        }

                        logger.debug("loading view " + viewSchema + "/" + viewName);

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
}
