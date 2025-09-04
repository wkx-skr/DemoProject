package com.datablau.reverse.engineering.worker.offlinedump;

import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.core.model.ObjectX;
import com.andorj.common.data.OraclePackageBody;
import com.datablau.datasource.data.DatasourceKnownParameterType;
import com.datablau.reverse.engineering.api.JdbcPlugin;
import com.datablau.reverse.engineering.data.ReversedSchema;
import com.datablau.reverse.engineering.data.ReversedTable;
import com.datablau.reverse.engineering.worker.ReverseForwardStrategyJdbc;
import com.datablau.reverse.engineering.worker.mysql.MySqlWorker;
import com.datablau.reverse.engineering.worker.oracle.OracleWorker;
import com.datablau.reverse.engineering.worker.sqlserver.SqlServerWorker;
import com.google.common.base.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * @program: datablau-datasource-plugins
 * @description: OfflineDumpWorker
 * @author: wang tong
 * @create: 2023-08-29 14:14
 **/
public class OfflineDumpWorker extends ReverseForwardStrategyJdbc implements JdbcPlugin {

    public static final String TablePattern = "DUMP_TABLES";
    public static final String ViewPattern = "DUMP_VIEWS";
    public static final String ColumnPattern = "DUMP_COLUMNS";
    public static final String PkPattern = "DUMP_PKS";
    public static final String IndexPattern = "DUMP_INDEXES";
    public static final String RoutinePattern = "DUMP_ROUTINES";
    public static final String RoutinePackage = "DUMP_PACKAGES";

    protected static final int FetchSize = 10000;
    private static final Logger logger = LoggerFactory.getLogger(OfflineDumpWorker.class);


    protected ReverseForwardStrategyJdbc realStrategy;


    @Override
    public String getType() {
        return "OFFLINEDUMP";
    }

    /**
     * 获取离线数据库 中转库 的实际数据库类型   Mysql 或者 Oracle
     */
    private String getRealType() {
        return getCurCatalog().substring(0, getCurCatalog().indexOf("_"));
    }

    private String getRealSchema() {
        return datasource.getProperties().getParameter(DatasourceKnownParameterType.OfflineDumpTargetSchemaName.toString());
    }


    @Override
    protected String getCurCatalog() {
        return datasource.getProperties().getParameter(DatasourceKnownParameterType.OfflineDumpTargetDBName.toString());
    }

    @Override
    public void buildDatasourceRelatedObjects(ModelX model, String catalog, String s_schema) throws Exception {
        if (!getRealType().equalsIgnoreCase("ORACLE")) {
            logger.info("Not oracle, skip build packages");
            return;
        }
        try {
            logger.trace("try to get dump package");
            try (Statement stmt = jdbcDatasource.getConnection().createStatement()) {

                String realSchema = getRealSchema();
                String query = "select PACKAGE_SCHEMA, PACKAGE_NAME, LINE, TEXT from "
                        + (Strings.isNullOrEmpty(realSchema) ? "" : realSchema + ".") + RoutinePackage
                        + " where DATABASE_INFO = '" + getCurCatalog() + "'"
                        + " and PACKAGE_SCHEMA = '" + s_schema + "'"
                        + " and PACKAGE_TYPE = 'PACKAGE BODY' ";

                try (ResultSet results = stmt.executeQuery(query)) {
                    ObjectX previousPackage = null;
                    String sqlSP = "";
                    String schema = "";
                    while (results.next()) {
                        schema = results.getString("PACKAGE_SCHEMA");
                        if (Strings.isNullOrEmpty(schema) && !Strings.isNullOrEmpty(catalog)) {
                            schema = catalog;
                        }

                        String name = results.getString("PACKAGE_NAME");
                        int line = results.getInt("LINE");
                        String text = results.getString("TEXT");

                        if (options.isInBlackList(name, LDMTypes.oPackage)) {
                            logger.debug("PACKAGE BODY '" + name + "' is in the black list");
                            continue;
                        }
                        if (line == 1) {
                            // set the sql of previous sp
                            if (previousPackage != null && !Strings.isNullOrEmpty(sqlSP)) {
                                if (getRealType().equalsIgnoreCase("ORACLE")) {
                                    sqlSP = "create or replace " + sqlSP;
                                }
                                previousPackage.setProperty(LDMTypes.pSQL, sqlSP);
                                previousPackage.setObjectIsFullyCreated();
                                processPackageBody(model, schema, previousPackage.getName(), sqlSP);
                            }

                            // create new sp
                            ObjectX newObj = createObject(model, LDMTypes.oPackage);

                            if (newObj == null) {
                                continue;
                            }

                            ReversedSchema oSchema = getOrCreateSchema(model, schema);
                            setSchemaInfoToObject(oSchema, newObj);
                            newObj.setName(name);

                            previousPackage = newObj;
                            sqlSP = text;

                        } else {
                            if (!Strings.isNullOrEmpty(text)) {
                                sqlSP += text;
                            }
                        }
                    }

                    if (previousPackage != null && !Strings.isNullOrEmpty(sqlSP)) {
                        if (getRealType().equalsIgnoreCase("ORACLE")) {
                            sqlSP = "create or replace " + sqlSP;
                        }
                        previousPackage.setProperty(LDMTypes.pSQL, sqlSP);
                        previousPackage.setObjectIsFullyCreated();
                        processPackageBody(model, schema, previousPackage.getName(), sqlSP);
                    }

                }
            }

        } catch (Exception e) {
            logger.error("Failed to get dump packages", e);
        }
    }

    private void processPackageBody(ModelX modelX, String schema, String packageName, String content) {
        if (OracleWorker.getSqlInterpretHelper() == null) {
            logger.info("***NOTE***: no sqlInterpretHelper, skip parsing package body...");
            return;
        }
        try {
            logger.info("processing package:" + packageName);
            for (OraclePackageBody body : OracleWorker.getSqlInterpretHelper().parseOraclePackageBody(content)) {
                if (options.isInBlackList(body.getName(), body.getTypeId())) {
                    logger.debug(body.getTypeId() + " in package '" + body.getName() + "' is in the black list");
                    continue;
                }

                ObjectX newObj = createObject(modelX, body.getTypeId());
                ReversedSchema reversedSchema = getOrCreateSchema(modelX, schema);
                setSchemaInfoToObject(reversedSchema, newObj);
                newObj.setName(packageName + "." + body.getName());
                newObj.setProperty(LDMTypes.pSQL, body.getContent());
                newObj.setObjectIsFullyCreated();
            }
        } catch (Throwable tw) {
            logger.error("unable to parse package body of '" + packageName + "' with sql:" + content, tw);
        }
    }

    @Override
    protected void buildProcedures(ModelX model, String catalog) {
        try {
            logger.trace("try to get dump sp/function");
            try (Statement stmt = jdbcDatasource.getConnection().createStatement()) {
                for (String s_schema : schemaPattern) {
                    String realSchema = getRealSchema();
                    String query = "select ROUTINE_SCHEM, ROUTINE_NAME, ROUTINE_TYPE, LINE, TEXT from "
                            + (Strings.isNullOrEmpty(realSchema) ? "" : realSchema + ".") + RoutinePattern
                            + " where DATABASE_INFO = '" + getCurCatalog() + "'"
                            + " and ROUTINE_SCHEM = '" + s_schema + "'";

                    try (ResultSet results = stmt.executeQuery(query)) {
                        ObjectX previousSp = null;
                        String sqlSP = "";
                        while (results.next()) {
                            String schema = results.getString("ROUTINE_SCHEM");
                            if (Strings.isNullOrEmpty(schema) && !Strings.isNullOrEmpty(catalog)) {
                                schema = catalog;
                            }

                            String name = results.getString("ROUTINE_NAME");
                            int line = results.getInt("LINE");
                            String text = results.getString("TEXT");
                            String type = results.getString("ROUTINE_TYPE");
                            if (type.toUpperCase().contains("PROCEDURE") || type.toUpperCase().contains("FUNCTION")) {
                                if (options.isInBlackList(name, type.toUpperCase().contains("PROCEDURE") ? LDMTypes.oStoredProcedure : LDMTypes.oFunction)) {
                                    logger.debug(type + " '" + name + "' is in the black list");
                                    continue;
                                }
                                if (line == 1) {

                                    // set the sql of previous sp
                                    if (previousSp != null && !Strings.isNullOrEmpty(sqlSP)) {
                                        if (getRealType().equalsIgnoreCase("ORACLE")) {
                                            sqlSP = "create or replace " + sqlSP;
                                        }
                                        previousSp.setProperty(LDMTypes.pSQL, sqlSP);
                                        previousSp.setObjectIsFullyCreated();
                                    }

                                    // create new sp
                                    ObjectX newObj = null;

                                    if (type.toUpperCase().contains("PROCEDURE")) {
                                        newObj = createStoredProcedure(model);
                                    } else if (type.toUpperCase().contains("FUNCTION")) {
                                        newObj = createFunction(model);
                                    }

                                    if (newObj == null)
                                        continue;
/* UPDATE
                                    ObjectX oSchema = getOrCreateSchema(modelX, schema);
 */
                                    ReversedSchema oSchema = getOrCreateSchema(model, schema);
                                    setSchemaInfoToObject(oSchema, newObj);
                                    newObj.setName(name);

                                    previousSp = newObj;
                                    sqlSP = text;

                                } else {
                                    if (!Strings.isNullOrEmpty(text)) {
                                        sqlSP += text;
                                    }
                                }
                            }
                        }

                        if (previousSp != null && !Strings.isNullOrEmpty(sqlSP)) {
                            if (getRealType().equalsIgnoreCase("ORACLE")) {
                                sqlSP = "create or replace " + sqlSP;
                            }
                            previousSp.setProperty(LDMTypes.pSQL, sqlSP);
                            previousSp.setObjectIsFullyCreated();
                        }

                    }
                }
            }

        } catch (Exception e) {
            logger.error("Failed to get dump sp/function", e);
        }
    }

    @Override
    public String generateFullDataType(ResultSet columnResultSet, String columnDataType, Integer precision, Integer scale) {
        if (getRealType().equalsIgnoreCase("oracle")) {
            OracleWorker oracleWorker = new OracleWorker();
            return oracleWorker.generateFullDataType(columnResultSet, columnDataType, precision, scale);
        } else if (getRealType().equalsIgnoreCase("mysql")) {
            MySqlWorker mySqlWorker = new MySqlWorker();
            return mySqlWorker.generateFullDataType(columnResultSet, columnDataType, precision, scale);
        } else if (getRealType().equalsIgnoreCase("SQLSERVER")) {
            SqlServerWorker sqlServerWorker = new SqlServerWorker();
            return sqlServerWorker.generateFullDataType(columnResultSet, columnDataType, precision, scale);
        } else {
            return super.generateFullDataType(columnResultSet, columnDataType, precision, scale);
        }
    }

    private String getSqlWhereFilter(String schema) {
        return getSqlWhereFilter(schema, null);
    }

    private String getSqlWhereFilter(String schema, String tableNamePattern) {
        String whereSql = " where DATABASE_INFO = '" + getCurCatalog() + "'"
                + " and TABLE_SCHEM = '" + schema + "'";
        if (!Strings.isNullOrEmpty(tableNamePattern)) {
            whereSql += " and TABLE_NAME like '" + tableNamePattern + "' ";
        }
        return whereSql;
    }


    @Override
    public ResultSet getColumnsOfSchema(String catalog, String s_schema) {
        String schema = getRealSchema();
        String sql = "select TABLE_CAT, TABLE_SCHEM, TABLE_NAME, COLUMN_NAME, TYPE_NAME, COLUMN_SIZE, DECIMAL_DIGITS, REMARKS, COLUMN_DEF, ORDINAL_POSITION, IS_NULLABLE, IS_AUTOINCREMENT from "
                + (Strings.isNullOrEmpty(schema) ? "" : schema + ".") + ColumnPattern
                + getSqlWhereFilter(s_schema)
                +" order by TABLE_SCHEM, TABLE_NAME, ORDINAL_POSITION ";

        PreparedStatement stmt = null;
        try {
            stmt = jdbcDatasource.getConnection().prepareStatement(sql);
            stmt.setFetchSize(FetchSize);
            return stmt.executeQuery();
        } catch (SQLException e) {
            logger.error("failed to get columns", e);
        }
        return null;

    }

    @Override
    protected void readEntireViewSQL(String catalog, String tableSchema, ReversedSchema oSchema, ResultSet viewSqlResultSet) throws Exception {
        logger.debug("try to get dump view sql");
        String schema = getRealSchema();
        String query = "select TABLE_CAT, TABLE_SCHEM, TABLE_NAME, TEXT from "
                + (Strings.isNullOrEmpty(schema) ? "" : schema + ".") + ViewPattern
                + getSqlWhereFilter(tableSchema)
                + " order by  TABLE_SCHEM, TABLE_NAME ";
        logger.debug(query);
        try (Statement stmt = jdbcDatasource.getConnection().createStatement();
             ResultSet results = stmt.executeQuery(query)) {
            while (results.next()) {
                String viewname = results.getString("TABLE_NAME");
                ReversedTable view = oSchema.lookForTable(viewname);
                if (view == null)
                    return;

                String value = results.getString("TEXT");
                if (!Strings.isNullOrEmpty(value)) {
                    // replace \n to \r\n , so we can show it in client correctly
                    value = value.replaceAll("\n", "\r\n");
                    view.getTableX().setProperty(LDMTypes.pSQL, value);
                }
                if (options.needToPersis()) {
                    view.getTableX().setObjectIsFullyCreated();
                    view.clearObjectX();
                }
                processSave();
            }

        } catch (Exception e) {
            logger.error("Failed to get dump View SQL", e);
        }
    }


    @Override
    protected void readFksOfSchema(ModelX model, String catalog, String schema) {
        // no need to read fk
    }

    @Override
    public ResultSet getIndexesOfSchema(String catalog, String schema) {
        String realSchema = getRealSchema();
        String sql = "select TABLE_CAT, TABLE_SCHEM, TABLE_NAME, NON_UNIQUE, INDEX_NAME, TYPE, ORDINAL_POSITION, COLUMN_NAME, ASC_OR_DESC from "
                + (Strings.isNullOrEmpty(realSchema) ? "" : realSchema + ".") + IndexPattern
                + getSqlWhereFilter(schema)
                + "  order by DATABASE_INFO, TABLE_SCHEM, TABLE_NAME ,INDEX_NAME, ORDINAL_POSITION ";

        logger.info(sql);
        try {
            PreparedStatement stmt = jdbcDatasource.getConnection().prepareStatement(sql);

            stmt.setFetchSize(FetchSize);

            return stmt.executeQuery();
        } catch (SQLException e) {
            logger.error("failed to get index ", e);
        }
        return null;
    }

    @Override
    public ResultSet getPrimaryKeysOfSchema(String catalog, String schema) {
        String realSchema = getRealSchema();
        String sql = "select TABLE_CAT, TABLE_SCHEM, TABLE_NAME, COLUMN_NAME, KEY_SEQ, PK_NAME from "
                + (Strings.isNullOrEmpty(realSchema) ? "" : realSchema + ".") + PkPattern
                + getSqlWhereFilter(schema)
                + " order by  TABLE_SCHEM, TABLE_NAME, KEY_SEQ, PK_NAME ";
        try {
            PreparedStatement stmt = jdbcDatasource.getConnection().prepareStatement(sql);

            stmt.setFetchSize(FetchSize);

            return stmt.executeQuery();
        } catch (SQLException e) {
            logger.error("failed to get pk ", e);
        }
        return null;
    }

    @Override
    public ResultSet getTablesOfSchema(String catalog, String s_schema, String tableNamePattern) {
        String schema = getRealSchema();
        boolean isTable = true;
        String sql = "select TABLE_CAT, TABLE_SCHEM, TABLE_NAME, REMARKS, TABLE_TYPE from "
                + (Strings.isNullOrEmpty(schema) ? "" : schema + ".") + (isTable ? TablePattern : ViewPattern)
                + getSqlWhereFilter(s_schema, tableNamePattern)
                + " order by  TABLE_SCHEM, TABLE_NAME ";

        logger.info("getTablesOfSchema sql : " + sql);

        try {
            PreparedStatement stmt = jdbcDatasource.getConnection().prepareStatement(sql);
            stmt.closeOnCompletion();
            stmt.setFetchSize(FetchSize);
            return stmt.executeQuery();
        } catch (SQLException e) {
            logger.error("failed to get table ", e);
        }
        return null;

    }

    @Override
    public ResultSet getViewsOfSchema(String catalog, String s_schema, String tableNamePattern) {
        String schema = getRealSchema();
        boolean isTable = false;
        String sql = "select TABLE_CAT, TABLE_SCHEM, TABLE_NAME, REMARKS from "
                + (Strings.isNullOrEmpty(schema) ? "" : schema + ".") + (isTable ? TablePattern : ViewPattern)
                + getSqlWhereFilter(s_schema, tableNamePattern)
                + " order by  TABLE_SCHEM, TABLE_NAME ";

        try {
            PreparedStatement stmt = jdbcDatasource.getConnection().prepareStatement(sql);
            stmt.closeOnCompletion();
            stmt.setFetchSize(FetchSize);
            return stmt.executeQuery();
        } catch (SQLException e) {
            logger.error("failed to get view ", e);
        }
        return null;
    }
}
