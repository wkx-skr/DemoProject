package com.datablau.reverse.engineering.worker.inceptor;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.core.model.ObjectX;
import com.datablau.reverse.engineering.api.JdbcPlugin;
import com.datablau.reverse.engineering.data.ReversedSchema;
import com.datablau.reverse.engineering.data.ReversedTable;
import com.datablau.reverse.engineering.worker.ReverseForwardStrategyJdbc;
import com.google.common.base.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * @program: datablau-datasource-plugins
 * @description: InceptorWorker
 * @author: wang tong
 * @create: 2023-08-18 14:02
 **/
public class InceptorWorker  extends ReverseForwardStrategyJdbc implements JdbcPlugin {


    private static final Logger logger = LoggerFactory.getLogger(InceptorWorker.class);

    private static final int FETCH_SIZE = 2000;
    private List<String> tableNames = new ArrayList<>();
    private List<String> viewNames = new ArrayList<>();


    @Override
    public String getType() {
        return "INCEPTOR";
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


    @Override
    public ResultSet getColumnsOfSchema(String catalog, String schema) {
        String sql ="    select\n" +
                " `column_name` as COLUMN_NAME,\n" +
                " `table_name` as TABLE_NAME,\n" +
                " `database_name` as TABLE_SCHEM,\n" +
                " `column_type` as TYPE_NAME,\n" +
                " `nullable` as IS_NULLABLE,\n" +
                " `default_value` as COLUMN_DEF,\n" +
                " `commentstring` as REMARKS,\n" +
                " 0 as ORDINAL_POSITION,\n" +
                " 0 as DECIMAL_DIGITS,\n" +
                " 0 as COLUMN_SIZE,\n" +
                " 'NO' as IS_AUTOINCREMENT\n" +
                "from SYSTEM.COLUMNS_V\n" +
                " where\n" +
                " database_name = ?";

        Connection conn = jdbcDatasource.getConnection();

        try {
            logger.info("target schema is:"+ schema +",execute sql:" + sql);
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, Strings.isNullOrEmpty(schema)  ? "%" : schema);
            stmt.setFetchSize(FETCH_SIZE);

            return stmt.executeQuery();
        } catch (SQLException se) {
            logger.error("failed to get columns of catalog or schema" + schema, se);
            throw new UnexpectedStateException("执行获取字段sql的命令失败:" + se.getMessage(), se);
        }
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

    @Override
    public void extractComplexName(ObjectX col, String DataType) {
        DataType = DataType.toUpperCase();

        if (DataType.startsWith("ARRAY<")) {
            col.setProperty(LDMTypes.pDataType, "ARRAY");

            ObjectX childCol1 = //(ObjectX) col.CreateCollectionNode(LDMTypes.oAttribute);
                    createColumn(col);
            childCol1.setProperty(LDMTypes.pName, "item");
            extractComplexName(childCol1, DataType.substring("ARRAY<".length()));
        } else if (DataType.startsWith("MAP<")) {
            col.setProperty(LDMTypes.pDataType, "MAP");

            String subDT = DataType.substring("MAP<".length()).trim();

            ObjectX childCol1 = //(ObjectX) col.CreateCollectionNode(LDMTypes.oAttribute);
                    createColumn(col);
            childCol1.setProperty(LDMTypes.pName, "key");
            childCol1.setProperty(LDMTypes.pDataType, subDT.substring(0, subDT.indexOf(",")));

            ObjectX childCol2 = //(ObjectX) col.CreateCollectionNode(LDMTypes.oAttribute);
                    createColumn(col);
            childCol2.setProperty(LDMTypes.pName, "value");
            extractComplexName(childCol2, subDT.substring(subDT.indexOf(",") + 1));
        } else if (DataType.startsWith("STRUCT<")) {
            col.setProperty(LDMTypes.pDataType, "STRUCT");

            String subDT = DataType.substring("STRUCT<".length()).trim();

            ObjectX childCol1 = //(ObjectX) col.CreateCollectionNode(LDMTypes.oAttribute);
                    createColumn(col);
            childCol1.setProperty(LDMTypes.pName, subDT.substring(0, subDT.indexOf(":")).trim());
            extractComplexName(childCol1, subDT.substring(subDT.indexOf(":") + 1).trim());

        } else if (DataType.startsWith("UNIONTYPE<")) {
            col.setProperty(LDMTypes.pDataType, "UNIONTYPE");

            String subDT = DataType.substring("UNIONTYPE<".length()).trim();

            ObjectX childCol1 = //(ObjectX) col.CreateCollectionNode(LDMTypes.oAttribute);
                    createColumn(col);
            childCol1.setProperty(LDMTypes.pName, "unionCol");
            extractComplexName(childCol1, subDT);
        } else {
            if (DataType.indexOf(",") != -1) {
                col.setProperty(LDMTypes.pDataType, DataType.substring(0, DataType.indexOf(",")));
                String remains = DataType.substring(DataType.indexOf(",") + 1).trim();

                if (DataType.indexOf(":") == -1) {
                    ObjectX childCol2 = //(ObjectX) col.getOwner().CreateCollectionNode(LDMTypes.oAttribute);
                            createColumn(col.getOwner());
                    childCol2.setProperty(LDMTypes.pName, "unionCol");
                    extractComplexName(childCol2, remains);
                } else {
                    ObjectX childCol2 = //(ObjectX) col.getOwner().CreateCollectionNode(LDMTypes.oAttribute);
                            createColumn(col.getOwner());
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
//
//    @Override
//    public String generateFullDataType(ResultSet columnResultSet, String datatype, Integer precision, Integer scale) {
//        String colDataType = datatype;
//
//        if (datatype.compareToIgnoreCase("BINARY") == 0
//                || datatype.compareToIgnoreCase("BIGINT") == 0
//                || datatype.compareToIgnoreCase("BOOLEAN") == 0
//                || datatype.compareToIgnoreCase("DATE") == 0
//                || datatype.compareToIgnoreCase("DOUBLE") == 0
//                || datatype.compareToIgnoreCase("DOUBLE PRECISION") == 0
//                || datatype.compareToIgnoreCase("FLOAT") == 0
//                || datatype.compareToIgnoreCase("INT") == 0
//                || datatype.compareToIgnoreCase("INTEGER") == 0
//                || datatype.compareToIgnoreCase("INTERVAL") == 0
//                || datatype.compareToIgnoreCase("SMALLINT") == 0
//                || datatype.compareToIgnoreCase("STRING") == 0
//                || datatype.compareToIgnoreCase("TIMESTAMP") == 0
//                || datatype.compareToIgnoreCase("TINYINT") == 0
//                || datatype.startsWith("ARRAY<")
//                || datatype.startsWith("MAP<")
//                || datatype.startsWith("STRUCT<")
//                || datatype.startsWith("UNIONTYPE<")) {
//            // no scale & precision
//        } else if (datatype.compareToIgnoreCase("DECIMAL") == 0
//                || datatype.compareToIgnoreCase("NUMERIC") == 0) {
//            colDataType += "(" + scale + "," + precision + ")";
//        } else {
//            colDataType += "(" + scale;
//            colDataType += ")";
//        }
//
//        return colDataType;
//    }

    @Override
    public String getViewSqlOfView(String catalog, String schema, String viewName) {

        logger.debug("try to get Inceptor view sql");
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
            logger.error("Failed to get Inceptor view sql", ex);
        }

        return sql;
    }

    public boolean isView(ResultSet rs) throws SQLException {
        String tableName = rs.getString("TABLE_NAME");
        if (!viewNames.isEmpty()) {
            if (viewNames.contains(tableName)) {
                return true;
            } else {
                return false;
            }
        }
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
        if (!tableNames.isEmpty()) {
            if (tableNames.contains(tableName)) {
                return true;
            } else {
                return false;
            }
        }
        String tableType = rs.getString("TABLE_TYPE");
        if (!"TABLE".equals(tableType)) {
            logger.warn("get tables but return view，[" + tableName + "] type "
                    + tableType);
            return false;
        }
        return true;
    }

    private void getAllTableOfInceptor(String schema) {
        String sql = "SELECT table_name " +
                "FROM SYSTEM.tables_v " +
                " where database_name = '" + schema + "' ";
        try (Statement statement = jdbcDatasource.getConnection().createStatement();
             ResultSet resultSet = statement.executeQuery(sql)
        ) {
            while (resultSet.next()) {
                String tableName = resultSet.getString(1);
                tableNames.add(tableName);
            }
        } catch (Exception e) {
            logger.warn("execute sql failed：" + sql, e);
        }
    }

    @Override
    protected void readTables(ModelX model, String catalog, String schema, List<ResultSet> tableResultSets) throws Exception {

        // 通过sql查询表，用于过滤视图
        getAllTableOfInceptor(schema);

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


    private void getAllViewOfInceptor(String schema) {
        String sql = "SELECT view_name "
                + "from SYSTEM.views_v" +
                " where database_name = '" + schema + "' ";
        try (Statement statement = jdbcDatasource.getConnection().createStatement();
             ResultSet resultSet = statement.executeQuery(sql)
        ) {
            while (resultSet.next()) {
                String viewName = resultSet.getString(1);
                viewNames.add(viewName);
            }
        } catch (Exception e) {
            logger.warn("execute sql failed：" + sql, e);
        }
    }

    @Override
    protected void readViews(ModelX model, String catalog, String schema, List<ResultSet> viewResultSets) throws Exception {
        List<ReversedTable> viewXs = new ArrayList<>();
        ReversedSchema oSchema = null;

        // 通过sql查询视图，用于过滤表
        getAllViewOfInceptor(schema);

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
                        if (Strings.isNullOrEmpty(sql)) {
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

    public String getSQL(String schema) {
        return "SELECT table_name, commentstring " +
                "FROM SYSTEM.tables_v " +
                "where database_name = '" + schema + "' ";
    }


    @Override
    public ResultSet getTableCommentOfSchema(String catalog, String schema) {
        try {
            Statement stmt = jdbcDatasource.getConnection().createStatement();
            String sql = this.getSQL(schema);
            if (sql == null) {
                return null;
            }
            return stmt.executeQuery(sql);
        } catch (SQLException ex) {
            throw new UnexpectedStateException(
                    "Unable to get database table comment:" + ex.getMessage());
        }
    }

    @Override
    public ResultSet getFunctionsOfSchema(String catalog, String schema) {
        Connection conn = jdbcDatasource.getConnection();
        String querySchema = schema == null ? "%" : schema;
        String sql =
                "select function_name as FUNCTION_NAME, database_name as FUNCTION_SCHEM, full_text, null as REMARKS\n"
                        + "from system.functions_v \n"
                        + "where database_name = '" + querySchema + "'";


        try {
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setFetchSize(2000);
            return stmt.executeQuery();
        } catch (SQLException e) {
            logger.error("failed to get procedures of schema " + schema, e);
        }

        return  null;
    }

    @Override
    public String getFunctionSqlOfSp(String catalog, String schema, String functionName) {
        logger.debug("try to get Inceptor func sql");
        String query = "DESC PLSQL FUNCTION EXTENDED %s.%s";
        if (schema == null || schema.equals("")) {
            schema = "default";
        }
        query = String.format(query, schema, functionName);
        try (Statement stmt = jdbcDatasource.getConnection().createStatement();
             ResultSet results = stmt.executeQuery(query)) {
            StringBuffer sb = null;
            int index = 0;
            while (results.next()) {
                index++;
                if (index < 4) continue;
                if (sb == null) {
                    sb = new StringBuffer();
                } else {
                    sb.append("\r\n");
                }
                sb.append(results.getString(1));
            }

            if (sb != null && sb.length() > 0) {
                return sb.toString();
            }
        } catch (Exception e) {
            logger.error("Failed to get Inceptor func sql", e);
        }
        return null;
    }

    @Override
    public String getSpSqlOfSp(String catalog, String schema, String spName) {
        String query = "DESC PLSQL FUNCTION EXTENDED %s.%s";
        if (schema == null || schema.equals("")) {
            schema = "default";
        }
        query = String.format(query, schema, spName);

        logger.debug("try to get Inceptor sp sql");

        try (Statement stmt = jdbcDatasource.getConnection().createStatement();
             ResultSet results = stmt.executeQuery(query)) {
            StringBuffer sb = null;
            int index = 0;
            while (results.next()) {
                index++;
                if (index < 4) continue;
                if (sb == null) {
                    sb = new StringBuffer();
                } else {
                    sb.append("\r\n");
                }
                sb.append(results.getString(1));
            }

            if (sb != null && sb.length() > 0) {
                return sb.toString();
            }

        } catch (Exception e) {
            logger.error("Failed to get Inceptor sp sql", e);
        }
        return null;
    }
}
