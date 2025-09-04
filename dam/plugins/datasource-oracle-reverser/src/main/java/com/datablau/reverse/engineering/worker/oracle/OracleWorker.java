package com.datablau.reverse.engineering.worker.oracle;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.core.model.ObjectX;
import com.andorj.common.data.OraclePackageBody;
import com.andorj.common.utils.SqlInterpretHelper;
import com.andorj.lineage.sql.plsql.OraclePackageBodyPreProcessor;
import com.andorj.model.common.exception.AndorjJobStoppedException;
import com.datablau.reverse.engineering.api.JdbcPlugin;
import com.datablau.reverse.engineering.data.ReversedSchema;
import com.datablau.reverse.engineering.data.ReversedTable;
import com.datablau.reverse.engineering.worker.ReverseForwardStrategyJdbc;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import org.apache.commons.lang.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.nio.charset.Charset;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author nicky - 数语科技有限公司
 * date 2023/6/15 17:11
 */
public class OracleWorker extends ReverseForwardStrategyJdbc implements JdbcPlugin {
    private static final Logger LOGGER = LoggerFactory.getLogger(OracleWorker.class);
    private static final int FETCH_SIZE = 2000;
    private Map<String, ObjectX> packagePathToPackageObjectMap = new ConcurrentHashMap<>();
    private Map<String, String> mViews = new ConcurrentHashMap<>();
    private boolean userDBA = false;
    private Map<String,Map<String,String>> schemaColCharUsedMap = new ConcurrentHashMap<>();
    private Charset charset = null;
    private static final String QUERY_ORACLE_CHARSET = "SELECT value FROM nls_database_parameters WHERE parameter ='NLS_CHARACTERSET'";

    private static SqlInterpretHelper sqlInterpretHelper;

    public static SqlInterpretHelper getSqlInterpretHelper() {
        return sqlInterpretHelper;
    }

    boolean j2ee13Compliant =false;
    boolean mapDateToTimestamp;
    private Pattern sqlWildcardPattern = null;
    private Pattern sqlEscapePattern = null;

    private static Map<String, String> dbaTableToAllaMap = ImmutableMap.<String, String>builder()
        .put("ALL_OBJECTS", "SYS.DBA_OBJECTS")
        .put("ALL_COL_COMMENTS", "SYS.DBA_COL_COMMENTS")
        .put("ALL_CONS_COLUMNS", "SYS.DBA_CONS_COLUMNS")
        .put("ALL_CONSTRAINTS", "SYS.DBA_CONSTRAINTS")
        .put("ALL_INDEXES", "SYS.DBA_INDEXES")
        .put("ALL_IND_COLUMNS", "SYS.DBA_IND_COLUMNS")
        .put("ALL_VIEWS", "SYS.DBA_VIEWS")
        .put("ALL_SOURCE", "SYS.DBA_SOURCE")
        .put("ALL_TAB_COMMENTS", "SYS.DBA_TAB_COMMENTS")
        .put("ALL_TAB_COLUMNS", "SYS.DBA_TAB_COLUMNS")
        .put("ALL_SYNONYMS", "SYS.DBA_SYNONYMS")
        .put("ALL_TABLES", "SYS.DBA_TABLES")
        //暂时不用dba映射，考虑到客户权限问题
        .put("ALL_MVIEWS", "ALL_MVIEWS")
        .build();

    static {
        sqlInterpretHelper = (String bodyScript) -> {
                OraclePackageBodyPreProcessor op = new OraclePackageBodyPreProcessor(bodyScript);
                op.preprocess();
                return op.getPackageBodies();
        };
    }
    private String getTableName(String name) {
        if (!userDBA) {
            return " " + name + " ";
        } else {
            return " " + dbaTableToAllaMap.getOrDefault(name, name) + " ";
        }
    }

    public void getDatabaseCharset() {
        try {
            try (Statement stmt = jdbcDatasource.getConnection().createStatement();
                 ResultSet rs = stmt.executeQuery(QUERY_ORACLE_CHARSET)) {
                String value = "";
                if (rs.next()) {
                    value = rs.getString("value");
                }
                if (value.toLowerCase().contains("gbk")) {
                    charset = Charset.defaultCharset();
                }
            } finally {
                charset = (charset == null ? Charset.defaultCharset() : charset);
                LOGGER.info("charset is set to:{}", charset);

            }
        } catch (SQLException e) {
            LOGGER.error(e.getMessage(), e);
        }

    }

    //    @Override
    public String normalizeString(String s) {
        if (Strings.isNullOrEmpty(s)) {
            return s;
        } else {
            if (charset != null) {
                return new String(s.getBytes(charset));
            } else {
                return s;
            }
        }
    }

    @Override
    public String getType() {
        return "ORACLE";
    }


    /**
     * 获取 table comment SQL
     */
    public String getSQL(String schema) {
        return "SELECT tc.TABLE_NAME, tc.COMMENTS " +
                "FROM " + getTableName("ALL_TAB_COMMENTS") + "  tc " +
                "where (tc.TABLE_TYPE = 'TABLE' or tc.TABLE_TYPE = 'VIEW') and tc.owner = '" + schema + "' ";
    }

    @Override
    public ResultSet getTableCommentOfSchema(String catalog, String schema) {
        try {
            checkConnectionType();

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


    public ResultSet getSynonymsOfSchema(String catalog, String schema, String tableNamePattern) {
        try{
            Statement stmt = jdbcDatasource.getConnection().createStatement();
            String sql = "SELECT SYNONYM_NAME , TABLE_NAME, OWNER, TABLE_OWNER \n" +
                    "FROM  " + getTableName("ALL_SYNONYMS") + " \n" +
                    "WHERE owner = '" + schema + "'";
            return stmt.executeQuery(sql);
        }catch (Exception e){
            throw new UnexpectedStateException(
                    "Unable to get database table comment:" + e.getMessage());
        }
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String wrapperCreateViewStatement(String viewName, String selectSql) {
        return "CREATE OR REPLACE FORCE VIEW " + viewName + " AS \r\n " + selectSql;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void buildProceduresOfSchema(ModelX model, String catalog, String schema) throws Exception {
        readOracleObjectSource(model, catalog, schema, LDMTypes.oStoredProcedure);
    }

    /**
     * {@inheritDoc}
     */
    public void buildFunctionsOfSchema(ModelX model, String catalog, String schema) throws Exception {
        readOracleObjectSource(model, catalog, schema, LDMTypes.oFunction);
    }

    protected void checkConnectionType() {
        try( Connection conn = jdbcDatasource.getConnection();
            Statement stmt = conn.createStatement()) {
            LOGGER.debug("retrieve oracle use dba/all");

            try {
                ResultSet rs = null;

                try {
                    List<String> toBeTestDbaTables = Lists.newArrayList(dbaTableToAllaMap.values());
                    for (String table : toBeTestDbaTables) {
                        String sql = "select * from " + table + " where rownum < 2";
                        rs = stmt.executeQuery(sql);
                        rs.next();
                    }
                    userDBA = true;
                } finally {
                    if (rs != null) {
                        try {
                            rs.close();
                        } catch (Exception ex) {
                        }

                        rs = null;
                    }
                }

            } finally {
                if (stmt != null) {
                    stmt.close();
                }
            }

        } catch (AndorjJobStoppedException e) {
            throw e;
        } catch (Exception e) {
            LOGGER.info("没有DBA系列视图权限, 查询ALLA系列视图", e);
        }
    }

    /**
     *  {@inheritDoc}
     */
    public void buildDatasourceRelatedObjects(ModelX model, String catalog, String schema) throws Exception {
        try {
            LOGGER.info("try to get Oracle Packages");
            //just read package
            readOracleObjectSource(model, catalog, schema, LDMTypes.oPackage);

            if (sqlInterpretHelper == null) {
                LOGGER.info("***NOTE***: no sqlInterpretHelper, skip parsing package body...");
                return;
            }

            //read function / sp names
            String query = "select * from "
                + getTableName("ALL_SOURCE")
                + " where TYPE ='PACKAGE BODY' "
                + " and " + (schema.equals("%") ? "1=1" : "OWNER = '" + schema + "'")
                + " order by OWNER, NAME, LINE";

            try (Statement stmt = jdbcDatasource.getConnection().createStatement()) {
                stmt.setFetchSize(FETCH_SIZE);
                try (ResultSet rs = stmt.executeQuery(query)) {
                    StringBuilder currentContent = new StringBuilder("");
                    String currentSchema = null;
                    String previousSchema = null;
                    String currentPackageName = null;
                    String previousPackageName = null;
                    while(rs.next()) {
                        currentSchema = rs.getString("OWNER");
                        currentPackageName = rs.getString("NAME");
                        if (options.isInBlackList(currentPackageName, LDMTypes.oPackage)) {
                            LOGGER.debug("Package '" + currentPackageName + "' is in the black list");
                            continue;
                        }

                        int line = rs.getInt("LINE");
                        String content = rs.getString("TEXT");

                        if (ObjectUtils.equals(1, line)) {
                            String current = currentContent.toString();
                            if (!Strings.isNullOrEmpty(current)) {
                                String path = previousSchema + "." + previousPackageName;
                                ObjectX packageObj = packagePathToPackageObjectMap.get(path);

                                if (packageObj != null) {
                                    //logger.info("package body of package :" + path + " is " + current);
                                    packageObj.setProperty(LDMTypes.pPackageBody, "CREATE OR REPLACE " + current);
                                    processPackageBody(model, previousSchema, previousPackageName, "CREATE OR REPLACE " + current);
                                    packageObj.setObjectIsFullyCreated();
                                    LOGGER.info("successfully handled package body:" + path);
                                } else {
                                    LOGGER.info("unable to find package:" + path);
                                }
                            }

                            currentContent = new StringBuilder("");
                            previousSchema = currentSchema;
                            previousPackageName = currentPackageName;
                        }

                        currentContent.append(content);
                    }

                    String current = currentContent.toString();
                    if (!Strings.isNullOrEmpty(current)) {
                        String path = previousSchema + "." + previousPackageName;
                        ObjectX packageObj = packagePathToPackageObjectMap.get(path);

                        if (packageObj != null) {
                            //logger.info("package body of package :" + path + " is " + current);
                            packageObj.setProperty(LDMTypes.pPackageBody, "CREATE OR REPLACE " + current);
                            processPackageBody(model, previousSchema, previousPackageName,
                                "CREATE OR REPLACE " + current);
                            packageObj.setObjectIsFullyCreated();
                            LOGGER.info("successfully handled package body:" + path);
                        } else {
                            LOGGER.info("unable to find package:" + path);
                        }
                    }
                }
            }

        } catch (Exception e) {
            LOGGER.error("failed to get Oracle Packages SQL", e);
        }
    }

    private void processPackageBody(ModelX modelX, String schema, String packageName, String content) {
        try {
            LOGGER.info("processing package:" + packageName);
            for (OraclePackageBody body : sqlInterpretHelper.parseOraclePackageBody(content)) {

                if (options.isInBlackList(body.getName(), body.getTypeId())) {
                    LOGGER.debug(body.getTypeId() + " in package '" + body.getName() + "' is in the black list");
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
            LOGGER.error("unable to parse package body of '" + packageName + "' with sql:" + content, tw);
        }
    }

    private void readOracleObjectSource(ModelX model, String catalog, String schema, long typeId)
        throws Exception {
        try (Statement stmt = jdbcDatasource.getConnection().createStatement()) {

            String queryObj = "";
            if (ObjectUtils.equals(typeId, LDMTypes.oStoredProcedure)) {
                queryObj = "PROCEDURE";
            } else if (ObjectUtils.equals(typeId, LDMTypes.oFunction)) {
                queryObj = "FUNCTION";
            } else if (ObjectUtils.equals(typeId, LDMTypes.oPackage)) {
                queryObj = "PACKAGE";
            } else {
                return;
            }

            String query = "select * from "
                + getTableName("ALL_SOURCE")
                + " where TYPE='" + queryObj + "' " + (schema.equals("%") ? ""
                : " and owner = '" + schema + "'")
                + " order by owner, name, line";

            stmt.setFetchSize(FETCH_SIZE);
            try (ResultSet results = stmt.executeQuery(query)) {
                String previousSpName = null;
                String previousSchema = null;
                String sqlSP = "";
                while (results.next()) {
                    String schemaName = results.getString("OWNER");
                    String name = results.getString("NAME");
                    if (options.isInBlackList(name, typeId)) {
                        LOGGER.debug(queryObj+ " '" + name + "' is in the black list");
                        continue;
                    }

                    int line = results.getInt("LINE");
                    String text = results.getString("TEXT");

                    if (line == 1) {

                        // set the sql of previous sp
                        if (previousSpName != null && !Strings.isNullOrEmpty(sqlSP)) {
                            String spCreate = "create or replace " + sqlSP;

                            ObjectX newObj = createObject(model, typeId);

                            ReversedSchema reversedSchema = getOrCreateSchema(model, previousSchema);
                            setSchemaInfoToObject(reversedSchema, newObj);
                            newObj.setName(previousSpName);
                            newObj.setProperty(LDMTypes.pSQL, spCreate);

                            if (ObjectUtils.equals(typeId, LDMTypes.oPackage)) {
                                String path = previousSchema + "." + previousSpName;
                                packagePathToPackageObjectMap.put(path, newObj);
                            } else {
                                newObj.setObjectIsFullyCreated();
                            }
                        }

                        previousSpName = name;
                        previousSchema = schemaName;
                        sqlSP = text;

                    } else {
                        if (!Strings.isNullOrEmpty(text)) {
                            sqlSP += text;
                        }
                    }
                }

                if (previousSpName != null && !Strings.isNullOrEmpty(sqlSP)) {
                    String spCreate = "create or replace " + sqlSP;
                    ObjectX newObj = createObject(model, typeId);;

                    ReversedSchema reversedSchema = getOrCreateSchema(model, previousSchema);
                    setSchemaInfoToObject(reversedSchema, newObj);
                    newObj.setName(previousSpName);
                    newObj.setProperty(LDMTypes.pSQL, spCreate);

                    if (ObjectUtils.equals(typeId, LDMTypes.oPackage)) {
                        String path = previousSchema + "." + previousSpName;
                        packagePathToPackageObjectMap.put(path, newObj);
                    } else {
                        newObj.setObjectIsFullyCreated();
                    }
                }
                processSave();
            }
        }
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public ResultSet getViewSqlOfSchema(String catalog, String schema) {
        Connection conn = jdbcDatasource.getConnection();

        String sql = " SELECT " +
            " NULL AS VIEW_CAT, \n" +
            " OWNER AS VIEW_SCHEM, \n" +
            " VIEW_NAME, \n" +
            " TEXT AS VIEW_SQL \n" +
            " FROM " +  getTableName("ALL_VIEWS") + " \n" +
            " WHERE OWNER = :1 ";

        try {
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, schema == null ? "%" : schema);
            stmt.closeOnCompletion();
            stmt.setFetchSize(FETCH_SIZE);

            return stmt.executeQuery();
        } catch (SQLException se) {
            LOGGER.error("failed to get views of schema " + schema, se);
            throw new UnexpectedStateException("Failed to execute command to retrieve view SQL:" + se.getMessage(), se);
        }
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public ResultSet getColumnCommentsOfSchema(String catalog, String schema) {
        Connection conn = jdbcDatasource.getConnection();

        String sql = " SELECT " +
            " NULL AS TABLE_CAT, \n" +
            " OWNER AS TABLE_SCHEM, \n" +
            " TABLE_NAME, \n" +
            " COLUMN_NAME, \n" +
            " COMMENTS AS REMARKS \n" +
            " FROM " + getTableName("ALL_COL_COMMENTS")+ " \n" +
            " WHERE OWNER = :1  AND COMMENTS IS NOT NULL ";

        try {
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, schema == null ? "%" : schema);
            stmt.closeOnCompletion();
            stmt.setFetchSize(FETCH_SIZE);

            return stmt.executeQuery();
        } catch (SQLException se) {
            LOGGER.error("failed to get column comments of schema " + schema, se);
            throw new UnexpectedStateException("Failed to execute the command to obtain field notes:" + se.getMessage(), se);
        }
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public ResultSet getForeignKeysOfSchema(String catalog, String schema) {
        Connection conn = jdbcDatasource.getConnection();

        String sql = "SELECT " +
            "       f.table_name as FKTABLE_NAME," +
            "       p.owner as PKTABLE_SCHEM," +
            "       p.table_name as PKTABLE_NAME,"+
            "       fc.column_name as FKCOLUMN_NAME," +
            "       fc.position as key_seq," +
            "       f.owner as FKTABLE_SCHEM," +
            "       p.constraint_name as PK_NAME," +
            "       f.constraint_name as FK_NAME" +
            "     FROM " +
            "" + getTableName("ALL_CONS_COLUMNS")+ " pc, " + getTableName("ALL_CONSTRAINTS")+" p, " + getTableName("ALL_CONS_COLUMNS")+ " fc, " + getTableName("ALL_CONSTRAINTS")+ " f" +
            "     WHERE 1 = 1" +
            "       AND f.owner = :1" +
            "       AND f.constraint_type = 'R'" +
            "       AND p.owner = f.r_owner" +
            "       AND p.constraint_name = f.r_constraint_name" +
            "       AND p.constraint_type = 'P'" +
            "       AND pc.owner = p.owner" +
            "       AND pc.constraint_name = p.constraint_name" +
            "       AND pc.table_name = p.table_name" +
            "       AND fc.owner = f.owner" +
            "       AND fc.constraint_name = f.constraint_name" +
            "       AND fc.table_name = f.table_name" +
            "       AND fc.position = pc.position" +
            "     ORDER BY fktable_schem, fktable_name, key_seq";

        try {
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, schema == null ? "%" : schema);
            stmt.closeOnCompletion();
            stmt.setFetchSize(FETCH_SIZE);

            return stmt.executeQuery();
        } catch (SQLException se) {
            LOGGER.error("failed to get FKs of schema " + schema, se);
            throw new UnexpectedStateException("Failed to execute the Get FK command:" + se.getMessage(), se);
        }
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public ResultSet getPrimaryKeysOfSchema(String catalog, String schema) {
        Connection conn = jdbcDatasource.getConnection();

        String sql = "SELECT " +
            "  c.table_name as TABLE_NAME," +
            "  c.column_name as COLUMN_NAME," +
            "  c.position AS key_seq," +
            "  c.constraint_name AS PK_NAME" +
            "  FROM " +
            "" + getTableName("ALL_CONS_COLUMNS")+ " c, " + getTableName("ALL_CONSTRAINTS")+ " k " +
            "  WHERE k.constraint_type = 'P'" +
            //"  AND k.table_name = :1" +
            "  AND k.owner like :1 escape '/'" +
            "  AND k.constraint_name = c.constraint_name " +
            "  AND k.table_name = c.table_name " +
            "  AND k.owner = c.owner " +
            "  ORDER BY table_name, key_seq\n";

        try  {
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, schema == null ? "%" : schema);
            stmt.closeOnCompletion();
            stmt.setFetchSize(FETCH_SIZE);

            return stmt.executeQuery();
        } catch (SQLException se) {
            LOGGER.error("failed to get PKs", se);
            throw new UnexpectedStateException("Failed to execute the Get PK command:" + se.getMessage(), se);
        }
    }


    @Override
    public ResultSet getTablesOfSchema(String catalog, String schema, String tableNamePattern) {
        return this.getTables(catalog, schema, tableNamePattern, new String[]{"TABLE"});
    }

    @Override
    public ResultSet getViewsOfSchema(String catalog, String schema, String tableNamePattern) {
        return this.getTables(catalog, schema, tableNamePattern, new String[]{"VIEW"});
    }

    public ResultSet getTables(String catalog, String schema, String tableNamePattern, String[] types) {

        Connection conn = jdbcDatasource.getConnection();

        String var1 = catalog;
        String var2 = schema;
        String var3 = tableNamePattern;
        String[] var4 = types;

        String var5 = "SELECT NULL AS table_cat,\n       o.owner AS table_schem,\n       o.object_name AS table_name,\n       o.object_type AS table_type,\n";
        String var6 = "       c.comments AS remarks\n";
        String var7 = "       NULL AS remarks\n";
        String var8 = "  FROM sys.dba_objects o, sys.dba_tab_comments c\n";
        String var9 = "  FROM sys.dba_objects o\n";
        String var10 = "  WHERE o.owner LIKE :1 ESCAPE '/'\n    AND o.object_name LIKE :2 ESCAPE '/'\n";
        String var11 = "    AND o.owner = c.owner (+)\n    AND o.object_name = c.table_name (+)\n";
        boolean var12 = false;
        String var13 = "";
        String var14 = "";
        String var20;
        if (var4 != null) {
            var13 = "    AND o.object_type IN ('xxx'";
            var14 = "    AND o.object_type IN ('xxx'";
            ArrayList var15 = tableType;

            String[] var17 = var4;
            int var18 = var4.length;

            for (int var19 = 0; var19 < var18; ++var19) {
                var20 = var17[var19];
                if (!var15.contains(var20)) {
                    // ignore  exception
                } else if (var20.equals("SYNONYM")) {
                    var13 = var13 + ", '" + var20 + "'";
                    var12 = true;
                } else {
                    var13 = var13 + ", '" + var20 + "'";
                    var14 = var14 + ", '" + var20 + "'";
                }
            }

            var13 = var13 + ")\n";
            var14 = var14 + ")\n";
        } else {
            var12 = true;
            var13 = "    AND o.object_type IN ('TABLE', 'SYNONYM', 'VIEW')\n";
            var14 = "    AND o.object_type IN ('TABLE', 'VIEW')\n";
        }

        String var25 = "  ORDER BY table_type, table_schem, table_name\n";
        String var26 = "SELECT NULL AS table_cat,\n       s.owner AS table_schem,\n       s.synonym_name AS table_name,\n       'SYNONYM' AS table_table_type,\n";
        String var27 = "       c.comments AS remarks\n";
        String var28 = "       NULL AS remarks\n";
        String var29 = "  FROM all_synonyms s, all_objects o, all_tab_comments c\n";
        var20 = "  FROM all_synonyms s, all_objects o\n";
        String var30 = "  WHERE s.owner LIKE :3 ESCAPE '/'\n    AND s.synonym_name LIKE :4 ESCAPE '/'\n    AND s.table_owner = o.owner\n    AND s.table_name = o.object_name\n    AND o.object_type IN ('TABLE', 'VIEW')\n";
        String var22 = "";
        var22 = var22 + var5;
//        if (conn.getRemarksReporting()) {
//            var22 = var22 + var6 + var8;
//        } else {
        var22 = var22 + var7 + var9;
//        }

        var22 = var22 + var10;
//        if (conn.getRestrictGetTables()) {
        var22 = var22 + var14;
//        } else {
//            var22 = var22 + var13;
//        }

//        if (conn.getRemarksReporting()) {
//            var22 = var22 + var11;
//        }

//        if (var12 && conn.getRestrictGetTables()) {
//            var22 = var22 + "UNION\n" + var26;
//            if (conn.getRemarksReporting()) {
//                var22 = var22 + var27 + var29;
//            } else {
//                var22 = var22 + var28 + var20;
//            }
//
//            var22 = var22 + var30;
//            if (conn.getRemarksReporting()) {
//                var22 = var22 + var11;
//            }
//        }

        var22 = var22 + var25;

        if (userDBA) {
            var22 = var22.replaceAll("all_", "dba_");
        } else {
            var22 = var22.replaceAll("dba_", "all_");
        }

        try {
            PreparedStatement var23 = conn.prepareStatement(var22);
            var23.setString(1, var2 == null ? "%" : var2);
            var23.setString(2, var3 == null ? "%" : var3);
//            if (var12 && conn.getRestrictGetTables()) {
//                var23.setString(3, var2 == null ? "%" : var2);
//                var23.setString(4, var3 == null ? "%" : var3);
//            }

//            LOGGER.info(" oracle table sql : " + var22);
            return var23.executeQuery();
        } catch (SQLException se) {
            LOGGER.error("failed to get tables", se);
            throw new UnexpectedStateException("Failed to execute the Get tables:" + se.getMessage(), se);
        }


    }
    /**
     * {@inheritDoc}
     */
    @Override
    public ResultSet getIndexesOfSchema(String catalog, String schema) {
        Connection conn = jdbcDatasource.getConnection();

        String sql = "select "+
            "       i.table_name AS TABLE_NAME,\n" +
            "       decode (i.uniqueness, 'UNIQUE', 0, 1) AS NON_UNIQUE,\n" +
            "       i.index_name AS INDEX_NAME,\n" +
            "       c.column_name AS COLUMN_NAME,\n" +
            "       c.column_position as ordinal_position,\n" +
            "       null AS ASC_OR_DESC \n" +
            "from " +
            "" + getTableName("ALL_INDEXES")+ " i, " + getTableName("ALL_IND_COLUMNS")+ " c\n" +
            "where i.owner = :1\n" +
            "  and i.index_name = c.index_name\n" +
            "  and i.table_owner = c.table_owner\n" +
            "  and i.table_name = c.table_name\n" +
            "  and i.owner = c.index_owner\n" +
            "order by table_name, index_name, ordinal_position";

        try {
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, schema == null ? "%" : schema);
            stmt.closeOnCompletion();
            stmt.setFetchSize(FETCH_SIZE);

            return stmt.executeQuery();
        } catch (SQLException se) {
            LOGGER.error("failed to get indices", se);
            throw new UnexpectedStateException("Failed to execute the retrieve index command:" + se.getMessage(), se);
        }
    }

    private ArrayList<String> tableType = new ArrayList() {
        {
            add("TABLE");
            add("VIEW");
            add("SYNONYM");
        }
    };


    @Override
    public ResultSet getColumnsOfSchema(String catalog, String schema) {
        try {
            return getColumnsExtended(catalog, schema, null, "%");
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }


    private ResultSet getColumnsExtended( String var1, String var2,
                                         String var3, String var4) throws SQLException {

        getPhysicalConnectionProp(jdbcDatasource.getConnection());
        return this.getColumns(var1, var2, var3, var4);
    }


    private synchronized ResultSet getColumns(String var1, String var2, String var3,
                                              String var4) throws SQLException {
        boolean var5 = false; // this.connection.getIncludeSynonyms();
        return var5 && var2 != null && !this.hasSqlWildcard(var2) && var3 != null && !this
                .hasSqlWildcard(var3) ? this
                .getColumnsNoWildcards(this.stripSqlEscapes(var2), this.stripSqlEscapes(var3), var4)
                : this.getColumnsWithWildcards(var2, var3, var4, var5);
    }


    private ResultSet getColumnsNoWildcards(String var1, String var2, String var3)
            throws SQLException {
        String var4 = this.getColumnsNoWildcardsPlsql();
        CallableStatement var5 = jdbcDatasource.getConnection().prepareCall(var4);
        var5.setFetchSize(FETCH_SIZE);
        var5.setString(1, var1);
        var5.setString(2, var2);
        var5.setString(3, var3 == null ? "%" : var3);
        var5.registerOutParameter(4, -10);
        var5.closeOnCompletion();
        var5.execute();
        ResultSet var6 = this.getCursor(var5, 4); //((OracleCallableStatement) var5).getCursor(4);
        return var6;
    }
    private ResultSet getCursor(CallableStatement stmt, int cursor) throws SQLException {
        try {
            Method md = stmt.getClass().getMethod("getCursor", int.class);
            md.setAccessible(true);
            return (ResultSet) md.invoke(stmt, cursor);
        } catch (Exception e) {
            LOGGER.error("fails to get result set ", e);
            throw new SQLException(e.getMessage());
        }
    }

    private short getVersionNumber(Connection conn) {
        try {
            Method md = conn.getClass().getMethod("getVersionNumber");
            md.setAccessible(true);
            return (short) md.invoke(conn);
        } catch (Exception e) {
            // do nothing
        }

        return 0;
    }


    private ResultSet getColumnsWithWildcards(String var1, String var2, String var3,
                                              boolean var4) throws SQLException {
        short var5 = this.getVersionNumber(jdbcDatasource.getConnection()); //this.connection.getVersionNumber();
        String var6 = "SELECT ";
        String var7 = " NULL AS table_cat,\n";
        String var8 = "";
        if (var5 >= 10200 & var5 < 11100 & var4) {
            var8 = "/*+ CHOOSE */";
        }

        String var9 = "       t.owner AS table_schem,\n       t.table_name AS table_name,\n";
        String var10 = "       DECODE(s.owner, NULL, t.owner, s.owner)\n              AS table_schem,\n       DECODE(s.synonym_name, NULL, t.table_name, s.synonym_name)\n              AS table_name,\n";
        String var11 = "         DECODE (t.data_type, 'CHAR', t.char_length,                   'VARCHAR', t.char_length,                   'VARCHAR2', t.char_length,                   'NVARCHAR2', t.char_length,                   'NCHAR', t.char_length,                   'NUMBER', 0,           t.data_length)";
        String var12 = "       t.column_name AS column_name,\n" + this.datatypeQuery("t")
                + "       t.data_type AS type_name,\n" + "       DECODE (t.data_precision, "
                + "               null, DECODE(t.data_type, "
                + "                       'NUMBER', DECODE(t.data_scale, "
                + "                                   null, " + (j2ee13Compliant ? "38" : "0")
                + "                                   , 38), " + var11
                + "                           )," + "         t.data_precision)\n"
                + "              AS column_size,\n" + "       0 AS buffer_length,\n"
                + "       DECODE (t.data_type, "
                + "               'NUMBER', DECODE(t.data_precision, "
                + "                                null, DECODE(t.data_scale, "
                + "                                             null, " + (j2ee13Compliant ? "0"
                : "-127") + "                                             , t.data_scale), "
                + "                                 t.data_scale), "
                + "               t.data_scale) AS decimal_digits,\n"
                + "       10 AS num_prec_radix,\n"
                + "       DECODE (t.nullable, 'N', 0, 1) AS nullable,\n";
        String var13 = "       c.comments AS remarks,\n";
        String var14 = "       NULL AS remarks,\n";
        //String var15 = "       t.data_default AS column_def,\n       0 AS sql_data_type,\n       0 AS sql_datetime_sub,\n       t.data_length AS char_octet_length,\n       t.column_id AS ordinal_position,\n       DECODE (t.nullable, 'N', 'NO', 'YES') AS is_nullable,\n";
        String var15 = "       t.data_default AS column_def,\n       t.column_id AS ordinal_position,\n       DECODE (t.nullable, 'N', 'NO', 'YES') AS is_nullable,\n";
        //String var16 = "         null as SCOPE_CATALOG,\n       null as SCOPE_SCHEMA,\n       null as SCOPE_TABLE,\n       null as SOURCE_DATA_TYPE,\n       'NO' as IS_AUTOINCREMENT\n,       t.char_used as CHAR_USED\n";
        String var16 = "         'NO' as IS_AUTOINCREMENT\n,       t.char_used as CHAR_USED\n";
        String var17 = "FROM sys.dba_tab_columns t";
        String var18 = ", sys.dba_synonyms s";
        String var19 = ", sys.dba_col_comments c";
        String var20 = "WHERE t.owner LIKE :1 ESCAPE '/'\n  AND t.table_name LIKE :2 ESCAPE '/'\n  AND t.column_name LIKE :3 ESCAPE '/'\n";
        String var21 = "WHERE (t.owner LIKE :4 ESCAPE '/' OR\n       (s.owner LIKE :5 ESCAPE '/' AND t.owner = s.table_owner))\n  AND (t.table_name LIKE :6 ESCAPE '/' OR\n       s.synonym_name LIKE :7 ESCAPE '/')\n  AND t.column_name LIKE :8 ESCAPE '/'\n";
        String var22 = "  AND t.owner = c.owner (+)\n  AND t.table_name = c.table_name (+)\n  AND t.column_name = c.column_name (+)\n";
        String var23 = "  AND s.table_name (+) = t.table_name\n  AND ((DECODE(s.owner, t.owner, 'OK',\n                       'PUBLIC', 'OK',\n                       NULL, 'OK',\n                       'NOT OK') = 'OK') OR\n       (t.owner LIKE :9 AND t.owner = s.table_owner) OR\n       (s.owner LIKE :10 AND t.owner = s.table_owner))";
        String var24 = "ORDER BY table_schem, table_name, ordinal_position\n";
        String var25 = var6 + var8 + var7;
        if (var4) {
            var25 = var25 + var10;
        } else {
            var25 = var25 + var9;
        }

        var25 = var25 + var12;
        boolean remarksReporting = false; //this.getRemarksReporting(connection);
        if (remarksReporting) {
            var25 = var25 + var13;
        } else {
            var25 = var25 + var14;
        }

        var25 = var25 + var15 + var16 + var17;
        if (remarksReporting) {
            var25 = var25 + var19;
        }

        if (var4) {
            var25 = var25 + var18;
        }

        if (var4) {
            var25 = var25 + "\n" + var21;
        } else {
            var25 = var25 + "\n" + var20;
        }

        if (remarksReporting) {
            var25 = var25 + var22;
        }

        if (false) { // (this.connection.getIncludeSynonyms()) {
            var25 = var25 + var23;
        }

        var25 = var25 + "\n" + var24;

        if (userDBA) {
            var25 = var25.replaceAll("all_", "dba_");
        } else {
            var25 = var25.replaceAll("dba_", "all_");
        }

        //PreparedStatement var26 = this.connection.prepareStatement(var25, ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY);
        //feedback from dam: http://192.168.1.15/webdoc/view/Pub4028818f885874510188b88c37100213.html
        PreparedStatement var26 = jdbcDatasource.getConnection().prepareStatement(var25, ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY);
        if (var4) {
            var26.setString(1, var1 == null ? "%" : var1);
            var26.setString(2, var1 == null ? "%" : var1);
            var26.setString(3, var2 == null ? "%" : var2);
            var26.setString(4, var2 == null ? "%" : var2);
            var26.setString(5, var3 == null ? "%" : var3);
            var26.setString(6, var1 == null ? "%" : var1);
            var26.setString(7, var1 == null ? "%" : var1);
        } else {
            var26.setString(1, var1 == null ? "%" : var1);
            var26.setString(2, var2 == null ? "%" : var2);
            var26.setString(3, var3 == null ? "%" : var3);
        }
        var26.setFetchSize(FETCH_SIZE);
        var26.setFetchDirection(ResultSet.FETCH_FORWARD);
        var26.closeOnCompletion();

        return var26.executeQuery();
    }

    private String getColumnsNoWildcardsPlsql() throws SQLException {
        String var1 = "declare\n  in_owner varchar2(32) := null;\n  in_name varchar2(32) := null;\n  my_user_name varchar2(32) := null;\n  cnt number := 0;\n  out_owner varchar2(32) := null;\n  out_name  varchar2(32):= null;\n  loc varchar2(32) := null;\n  xxx SYS_REFCURSOR;\nbegin\n  in_owner := ?;\n  in_name := ?;\n  select user into my_user_name from dual;\n  if( my_user_name = in_owner ) then\n    select count(*) into cnt from user_tables where table_name = in_name;\n    if( cnt = 1 ) then\n      out_owner := in_owner;\n      out_name := in_name;\n      loc := 'USER_TABLES';\n    else\n      begin\n        select table_owner, table_name into out_owner, out_name from user_synonyms where synonym_name = in_name;\n      exception\n        when NO_DATA_FOUND then\n        out_owner := null;\n        out_name := null;\n      end;\n      if( not(out_name is null) ) then\n        loc := 'USER_SYNONYMS';\n      end if;\n    end if;\n  else\n    select count(*) into cnt from sys.dba_tables where owner = in_owner and table_name = in_name;\n    if( cnt = 1 ) then\n      out_owner := in_owner;\n      out_name := in_name;\n      loc := 'dba_TABLES';\n    else\n      begin\n        select table_owner, table_name into out_owner, out_name from sys.dba_synonyms \n          where  owner = in_owner and synonym_name = in_name;\n      exception\n        when NO_DATA_FOUND then\n          out_owner := null;\n          out_name := null;\n      end;\n      if( not(out_owner is null) ) then\n        loc := 'dba_SYNONYMS';\n      end if;\n    end if;\n  end if;\n";
        short var2 = this.getVersionNumber(jdbcDatasource.getConnection());
        String var3 = "open xxx for SELECT NULL AS table_cat,\n";
        String var4 = "       in_owner AS table_schem,\n       in_name AS table_name,\n";
        String var5 = "         DECODE (t.data_type, 'CHAR', t.char_length,                   'VARCHAR', t.char_length,                   'VARCHAR2', t.char_length,                   'NVARCHAR2', t.char_length,                   'NCHAR', t.char_length,                   'NUMBER', 0,           t.data_length)";
        String var6 = "       t.column_name AS column_name,\n" + this.datatypeQuery("t")
                + "       t.data_type AS type_name,\n" + "       DECODE (t.data_precision, "
                + "               null, DECODE(t.data_type, "
                + "                       'NUMBER', DECODE(t.data_scale, "
                + "                                   null, " + (j2ee13Compliant ? "38" : "0")
                + "                                   , 38), " + var5
                + "                           )," + "         t.data_precision)\n"
                + "              AS column_size,\n" + "       0 AS buffer_length,\n"
                + "       DECODE (t.data_type, "
                + "               'NUMBER', DECODE(t.data_precision, "
                + "                                null, DECODE(t.data_scale, "
                + "                                             null, " + (j2ee13Compliant ? "0"
                : "-127") + "                                             , t.data_scale), "
                + "                                 t.data_scale), "
                + "               t.data_scale) AS decimal_digits,\n"
                + "       10 AS num_prec_radix,\n"
                + "       DECODE (t.nullable, 'N', 0, 1) AS nullable,\n";
        String var7 = "       c.comments AS remarks,\n";
        String var8 = "       NULL AS remarks,\n";
        String var9 = "       t.data_default AS column_def,\n       0 AS sql_data_type,\n       0 AS sql_datetime_sub,\n       t.data_length AS char_octet_length,\n       t.column_id AS ordinal_position,\n       DECODE (t.nullable, 'N', 'NO', 'YES') AS is_nullable,\n";
        String var10 = "         null as SCOPE_CATALOG,\n       null as SCOPE_SCHEMA,\n       null as SCOPE_TABLE,\n       null as SOURCE_DATA_TYPE,\n       'NO' as IS_AUTOINCREMENT\n,       t.char_used as CHAR_USED\n";
        String var11 = "FROM sys.dba_tab_columns t";
        String var12 = ", sys.dba_col_comments c";
        String var13 = "WHERE t.owner = out_owner \n  AND t.table_name = out_name\n AND t.column_name LIKE ? ESCAPE '/'\n";
        String var14 = "  AND t.owner = c.owner (+)\n  AND t.table_name = c.table_name (+)\n  AND t.column_name = c.column_name (+)\n";
        String var15 = "ORDER BY table_schem, table_name, ordinal_position\n";
        String var16 = var3 + var4;
        var16 = var16 + var6;
        boolean remarksReporting = this.getRemarksReporting(jdbcDatasource.getConnection());
        if (remarksReporting) {
            var16 = var16 + var7;
        } else {
            var16 = var16 + var8;
        }

        var16 = var16 + var9 + var10 + var11;
        if (remarksReporting) {
            var16 = var16 + var12;
        }

        var16 = var16 + "\n" + var13;
        if (remarksReporting) {
            var16 = var16 + var14;
        }

        var16 = var16 + "\n" + var15;
        String var17 = "; \n ? := xxx;\n end;";
        String var18 = var1 + var16 + var17;

        if (userDBA) {
            var18 = var18.replaceAll("all_", "dba_");
        } else {
            var18 = var18.replaceAll("dba_", "all_");
        }

        return var18;
    }

    private boolean getRemarksReporting(Connection conn) {
        return getReflectBooleanVal(conn, "getRemarksReporting", false);
    }

    protected boolean getReflectBooleanVal(Connection conn, String method, boolean defaultVal) {
        try {
            Method md = conn.getClass().getMethod(method);
            md.setAccessible(true);
            return (boolean) md.invoke(conn);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return defaultVal;
    }

    private String datatypeQuery(String var1) {
        String var3 =
                "NULL AS data_type,\n";
        return var3;
    }


    protected boolean hasSqlWildcard(String var1) {
        if (sqlWildcardPattern == null) {
            sqlWildcardPattern = Pattern.compile("^%|^_|[^/]%|[^/]_");
        }

        Matcher var2 = sqlWildcardPattern.matcher(var1);
        return var2.find();
    }

    protected String stripSqlEscapes(String var1) {
        if (sqlEscapePattern == null) {
            sqlEscapePattern = Pattern.compile("/");
        }

        Matcher var2 = sqlEscapePattern.matcher(var1);
        StringBuffer var3 = new StringBuffer();

        while (var2.find()) {
            var2.appendReplacement(var3, "");
        }

        var2.appendTail(var3);
        return var3.toString();
    }


    private void getPhysicalConnectionProp(Connection conn) {
        try {
            Class clazz = conn.getClass();
            while (clazz != null) {
                try {
                    Field field1 = clazz.getDeclaredField("j2ee13Compliant");
                    Field field2 = clazz.getDeclaredField("mapDateToTimestamp");
                    field1.setAccessible(true);
                    j2ee13Compliant = (boolean) field1.get(jdbcDatasource.getConnection());
                    field2.setAccessible(true);
                    mapDateToTimestamp = (boolean) field2.get(jdbcDatasource.getConnection());
                    break;
                } catch (Exception e) {
                    clazz = clazz.getSuperclass();
                }
            }
        } catch (Exception ex) {
            LOGGER.error(ex.getMessage(), ex);
        }
    }


    /**
     * {@inheritDoc}
     */
    @Override
    public String generateFullDataType(ResultSet columnResultSet, final String columnDataType, final Integer precision, final Integer scale) {
        String dt = null;
        if (columnDataType.compareToIgnoreCase("CHAR") == 0
            || columnDataType.compareToIgnoreCase("VARCHAR2") == 0) {
            try {
                String useChar = columnResultSet.getString("CHAR_USED");
                if (useChar != null && useChar.compareToIgnoreCase("C") == 0 && precision > 0) {
                    dt = columnDataType + "(" + precision + " CHAR)";
                }

            } catch (SQLException e) {
                // ignore
                try {
                    String useChar = getChatUsed(columnResultSet);
                    if (useChar != null && useChar.compareToIgnoreCase("C") == 0 && precision > 0) {
                        dt = columnDataType + "(" + precision + " CHAR)";
                    }
                } catch (Exception ex) {
                    LOGGER.warn("failed to get CHAR_USED", ex.getMessage());
                }
            }
        }

        if (dt != null) {
            return dt;
        } else {
            return generateDataType(columnDataType, precision, scale);
        }
    }

    public String getChatUsed(ResultSet columnResultSet) throws SQLException {
        String schema = columnResultSet.getString("TABLE_SCHEM");
        String tableName = columnResultSet.getString("TABLE_NAME");
        String columnName = columnResultSet.getString("COLUMN_NAME");
        if (schemaColCharUsedMap.containsKey(schema)) {
//            LOGGER.info("schemaColCharUsedMap contains schema:" + schema);
            return schemaColCharUsedMap.get(schema).get(tableName + "/" + columnName);
        }

        if (jdbcDatasource == null) return null;
        Connection connection = jdbcDatasource.getConnection();
        String sql = "SELECT CHAR_USED, COLUMN_NAME, TABLE_NAME FROM " + getTableName("ALL_TAB_COLUMNS") + " WHERE OWNER = ?";

        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, schema);
            try (ResultSet rs = stmt.executeQuery()) {
                HashMap<String, String> colCharUsedMap = new HashMap<>();
                while (rs.next()) {
                    String colName = rs.getString("COLUMN_NAME");
                    String tabName = rs.getString("TABLE_NAME");
                    String charUsed = rs.getString("CHAR_USED");
                    colCharUsedMap.put(tabName + "/" + colName, charUsed);
                }
                schemaColCharUsedMap.put(schema, colCharUsedMap);
            }
        } catch (SQLException se) {
            LOGGER.error("failed to get CHAR_USED", se.getMessage());
            throw new UnexpectedStateException("Failed to execute command to obtain CHAR_USED:" + se.getMessage(), se);
        }
        return schemaColCharUsedMap.get(schema).get(tableName + "/" + columnName);
    }

    protected String generateDataType(String datatype, int precision, int scale) {
        String colDataType = datatype;

        if (datatype.compareToIgnoreCase("CHAR") == 0
            || datatype.compareToIgnoreCase("CHAR VARYING") == 0
            || datatype.compareToIgnoreCase("CHARACTER") == 0
            || datatype.compareToIgnoreCase("CHARACTER VARYING") == 0
            || datatype.compareToIgnoreCase("FLOAT") == 0
            || datatype.compareToIgnoreCase("NATIONAL CHAR") == 0
            || datatype.compareToIgnoreCase("NATIONAL CHAR VARYING") == 0
            || datatype.compareToIgnoreCase("NATIONAL CHARACTER") == 0
            || datatype.compareToIgnoreCase("NATIONAL CHARACTER VARYING") == 0
            || datatype.compareToIgnoreCase("NCHAR") == 0
            || datatype.compareToIgnoreCase("NCHAR VARYING") == 0
            || datatype.compareToIgnoreCase("NVARCHAR2") == 0
            || datatype.compareToIgnoreCase("RAW") == 0
            || datatype.compareToIgnoreCase("UROWID") == 0
            || datatype.compareToIgnoreCase("VARCHAR") == 0
            || datatype.compareToIgnoreCase("VARCHAR2") == 0) {
            if (precision > 0) {
                colDataType += "(" + precision + ")";
            }
        } else if (datatype.compareToIgnoreCase("DEC") == 0
            || datatype.compareToIgnoreCase("DECIMAL") == 0
            || datatype.compareToIgnoreCase("NUMBER") == 0
            || datatype.compareToIgnoreCase("NUMERIC") == 0) {

            // ?? somehow its scale & precision are reversed in this sys view

            if (precision > 0) {
                colDataType += "(" + precision;

                if (scale > 0) {
                    colDataType += "," + scale;
                }

                colDataType += ")";
            }
        }

        return colDataType;
    }

    @Override
    protected void readTables(ModelX model, String catalog, String schema, List<ResultSet> tableResultSets) throws Exception {
        try {

            this.getMviews(catalog, schema);

            for (ResultSet rs : tableResultSets) {
                try {
                    checkStopSign();
                    while (rs.next()) {
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

                        ObjectX tableX = null;
                        if (isMviews(schema, tableName)) {
                            tableX = createView(model);
                        } else {
                            tableX = createTable(model);
                        }

                        if (tableX == null) {
                            LOGGER.error("unable to create tableX");
                            continue;
                        }

                        tableX.setName(tableName);

                        ReversedSchema oSchema = getOrCreateSchema(model, tableSchema);
                        setSchemaInfoToObject(oSchema, tableX);

                        String tableDefinition = normalizeString(rs.getString("REMARKS"));
                        if (tableDefinition != null && tableDefinition.length() > 0) {
                            setCommentToObject(tableX, tableDefinition);
                        }

                        String tableKey = getNormalizedTableName(catalog, schema, tableName);
                        if (tableCommentMap.containsKey(tableKey)) {
                            setCommentToObject(tableX, tableCommentMap.get(tableKey));
                        }

                        ReversedTable table = oSchema.addTable(tableX);

                        if (isMviews(schema, tableName)) {
                            String sql = mViews.get(schema + "." + tableName);
                            if (!Strings.isNullOrEmpty(sql)) {
                                tableX.setProperty(LDMTypes.pSQL, sql);
                            }
                        }

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

    protected boolean isMviews(String schema, String name) {
        return !mViews.isEmpty() && mViews.containsKey(schema + "." + name);
    }

    /**
     * get MATERIALIZED VIEW
     */
    protected void getMviews(String catalog, String schema) {
        String sql = "SELECT MVIEW_NAME, QUERY FROM " + getTableName("ALL_MVIEWS")+" WHERE OWNER= '" + schema + "'";
        try (Connection conn = jdbcDatasource.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql);) {
            while (rs.next()) {
                String mViewName = rs.getString("MVIEW_NAME");
                String mViewSql = wrapperCreateViewStatement(mViewName, rs.getString("QUERY"));
                if (!Strings.isNullOrEmpty(mViewName)) {
                    mViews.put(schema + "." + mViewName, mViewSql);
                }
            }
        } catch (SQLException se) {
            LOGGER.error("failed to get mviews of schema " + schema, se);
            throw new UnexpectedStateException("Failed to execute command to obtain materialized view:" + se.getMessage(), se);
        }

    }


    protected void readColumns(ModelX model, String catalog, String schema,
                               ResultSet columnResultSet) throws Exception {
        try {
            int totalHandledColumns = 0;
            ReversedSchema reversedSchema = schemaMap
                    .get(Strings.isNullOrEmpty(schema) ? catalog : schema);

            while (columnResultSet.next()) {
                try {
//                    LOGGER.info("column:  '" + columnResultSet.getString("COLUMN_NAME") + "'");
                    String tableName = columnResultSet.getString("TABLE_NAME");

                    ReversedTable table = reversedSchema.lookForTable(tableName);
                    if (table == null) {
                        continue;
                    }

                    String columnName = columnResultSet.getString("COLUMN_NAME");
                    ObjectX columnX = createColumn(model, table);
                    columnX.setName(columnName);


                    try {
                        String defaultValue = columnResultSet.getString("COLUMN_DEF");
                        if (!Strings.isNullOrEmpty(defaultValue)) {
                            columnX.setProperty(LDMTypes.pDefaultValue, defaultValue);
                        }
                    } catch (Exception ignored) {

                    }

                    try {
                        columnX.setProperty(LDMTypes.pIsAutoIncrement,
                                getBoolean(columnResultSet.getString("IS_AUTOINCREMENT")));
                    } catch (Exception ex) {
                        // some db does't have AI.
                    }


                    String nullable = columnResultSet.getString("IS_NULLABLE");
                    if (nullable != null) {
                        columnX.setProperty(LDMTypes.pIsNotNull, !getBoolean(nullable));
                    }

                    String typeName = columnResultSet.getString("TYPE_NAME");
                    if (!Strings.isNullOrEmpty(typeName)) {
                        String colDataType = columnResultSet.getString("TYPE_NAME").toUpperCase();
                        if (colDataType.startsWith("ARRAY<") || colDataType.startsWith("MAP<")
                                || colDataType.startsWith("STRUCT<") || colDataType
                                .startsWith("UNIONTYPE<")) {
                            extractComplexName(columnX, colDataType);
                        }

                        int scale = 0;
                        try {
                            scale = columnResultSet.getInt("COLUMN_SIZE");
                        } catch (SQLException e) {
                            // do nothing
                        }

                        int precision = 0;
                        try {
                            precision = columnResultSet.getInt("DECIMAL_DIGITS");
                        } catch (SQLException e) {
                            //do nothing
                        }

                        String dataTypeString = generateFullDataType(columnResultSet, colDataType,
                                scale, precision);

                        String dataType = table.getColumnType(columnName, dataTypeString);
                        columnX.setProperty(LDMTypes.pDataType, dataType);
                    }

                    String columnDefinition = normalizeString(columnResultSet.getString("REMARKS"));
                    if (Strings.isNullOrEmpty(columnDefinition)) {
                        columnDefinition = table.getColumnComment(columnName);
                    }
                    setCommentToColumns(table, columnX, columnDefinition);

                    int ordinalPosition = columnResultSet
                            .getInt("ORDINAL_POSITION"); // 表中列的索引（从1开始）
                    columnX.setProperty(LDMTypes.pOrdinal, ordinalPosition);

                    //columnX.setProperty(LDMTypes.pIsAutoIncrement,false);
                    columnX.setObjectIsFullyCreated();

                    totalHandledColumns++;
                    if (totalHandledColumns % 1000 == 0) {
                        processSave();
                        LOGGER.debug("total loaded " + totalHandledColumns + " columns");
                    }

                } catch (Exception e) {
                    // Just catch it.
                    LOGGER.warn(e.getMessage());
                }
            }
        } finally {
            closeResultSet(columnResultSet);
        }
    }
}
