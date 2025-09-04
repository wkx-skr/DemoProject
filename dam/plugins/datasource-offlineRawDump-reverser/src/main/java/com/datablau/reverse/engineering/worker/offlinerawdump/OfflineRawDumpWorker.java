package com.datablau.reverse.engineering.worker.offlinerawdump;

import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.core.model.ObjectX;
import com.andorj.common.data.OraclePackageBody;
import com.andorj.model.common.exception.AndorjJobStoppedException;
import com.datablau.datasource.data.DatasourceKnownParameterType;
import com.datablau.reverse.engineering.api.JdbcPlugin;
import com.datablau.reverse.engineering.data.ReversedSchema;
import com.datablau.reverse.engineering.data.ReversedTable;
import com.datablau.reverse.engineering.worker.ReverseForwardStrategyJdbc;
import com.datablau.reverse.engineering.worker.oracle.OracleWorker;
import com.google.common.base.Strings;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @program: datablau-datasource-plugins
 * @description: OfflineRawDumpWorker
 * @author: wang tong
 * @create: 2023-08-30 16:55
 **/
public class OfflineRawDumpWorker extends ReverseForwardStrategyJdbc implements JdbcPlugin {


    private static final Logger logger = LoggerFactory.getLogger(OfflineRawDumpWorker.class);


    public static String TablePattern = "DUMP_TABLES";
    public static String ViewPattern = "DUMP_VIEWS";
    public static String ColumnPattern = "DUMP_COLUMNS";
    public static String PkPattern = "DUMP_PKS";
    public static String IndexPattern = "DUMP_INDEXES";
    public static String RoutinePattern = "DUMP_ROUTINES";
    public static String RoutinePackage = "DUMP_PACKAGES";
    protected static final int FetchSize = 10000;
    private static final Pattern p = Pattern.compile("\\$\\{([^}]+)\\}");

    private static final String ORACLE_DUMP_TABLES_SQL
            = "SELECT "
            + "o.owner AS table_schem,\n"
            + "o.object_name AS table_name,\n"
            + "o.object_type AS table_type,\n"
            + "c.comments AS remarks\n"
            //+ "数据库 标记 > AS database info\n"
            + "FROM ${prefix}_dba_objects o, ${prefix}_dba_tab_comments c\n"
            + "WHERE o.owner = ${schemas}\n"
            + "AND o.object_type IN ('TABLE')\n"
            + "AND o.owner = c.owner\n"
            + "AND o.object_name = c.table_name\n"
            + "ORDER BY table_type, table_schem, table_name";

    private static final String ORACLE_DUMP_VIEWS_SQL
            = "select\n"
            + "v.owner as table_schem,\n"
            + "v.view_name as table_name,\n"
            + "c.comments AS remarks,\n"
            + "v.text\n"
            + "from ${prefix}_dba_views v, ${prefix}_dba_tab_comments c\n"
            + "where v.owner = ${schemas}\n"
            + "and v.owner = c.owner\n"
            + "and v.view_name = c.table_name\n"
            + "order by table_schem, table_name";

    private static final String ORACLE_DUMP_COLUMNS_SQL
            = "SELECT t.owner AS table_schem, t.table_name AS table_name, t.column_name AS column_name\n"
            + "\t, NULL AS data_type\n"
            + "\t, t.data_type AS type_name\n"
            + "\t, (case when t.data_precision is NULL then (case t.data_type when 'NUMBER' then (case when t.data_scale is NULL then 0 else 38 end) else (case t.data_type when 'CHAR' then t.char_length when 'VARCHAR' then t.char_length when 'VARCHAR2' then t.char_length when 'NVARCHAR2' then t.char_length when 'NCHAR' then t.char_length when 'NUMBER' then 0 else t.data_length end) end) else t.data_precision end) AS column_size\n"
            + "\t, 0 AS buffer_length\n"
            + "\t, (case t.data_type when 'NUMBER' then (case when t.data_precision is NULL then (case when t.data_scale is NULL then -127 else t.data_scale end) else t.data_scale end) else t.data_scale end) AS decimal_digits\n"
            + "\t, 10 AS num_prec_radix\n"
            + "\t, (case t.nullable when 'N' then 0 else 1 end) AS nullable\n"
            + "\t, NULL AS remarks, t.data_default AS column_def, 0 AS sql_data_type, 0 AS sql_datetime_sub, t.data_length AS char_octet_length\n"
            + "\t, t.column_id AS ordinal_position\n"
            + "\t, (case t.nullable when 'N' then 'NO' else 'YES' end) AS is_nullable\n"
            + "\t, NULL AS SCOPE_CATALOG, NULL AS SCOPE_SCHEMA, NULL AS SCOPE_TABLE, NULL AS SOURCE_DATA_TYPE, 'NO' AS IS_AUTOINCREMENT\n"
            //+ "\t, <数据库标记> AS database_info\n"
//        + "FROM ${prefix}_dba_tab_columns t, ${prefix}_dba_col_comments c\n"
            + "FROM ${prefix}_dba_tab_columns t\n"
            + "WHERE t.owner = ${schemas}\n"
//        + "\tAND t.owner = c.owner\n"
//        + "\tAND t.table_name = c.table_name\n"
//        + "\tAND t.column_name = c.column_name\n"
            + "ORDER BY table_schem, table_name, ordinal_position\n";


    private static final String ORACLE_DUMP_COLUMNS_COMMENT_SQL
            = "SELECT *\n"
            + "FROM ${prefix}_dba_col_comments\n"
            + "WHERE owner = ${schemas}\n"
            + "ORDER BY OWNER, TABLE_NAME\n";

    private static final String ORACLE_DUMP_INDEXES_SQL
            = "select "
            + "i.owner as table_schem, \n"
            + "i.table_name, \n"
            + "(case i.uniqueness when 'UNIQUE' then 0 else 1 end) as \n"
            + "non_unique, \n"
            + "null as index_qualifier, \n"
            + "i.index_name, \n"
            + "1 as type, \n"
            + "c.column_position as ordinal_position, \n"
            + "c.column_name, \n"
            + "null as asc_or_desc, \n"
            + "i.distinct_keys as cardinality, \n"
            + "i.leaf_blocks as pages, \n"
            + "null as filter_condition \n"
            //+ "<数据库标记> AS database_info \n"
            + "from ${prefix}_dba_indexes i, ${prefix}_dba_ind_columns c \n"
            + "where i.owner = ${schemas} \n"
            + "and i.index_name = c.index_name \n"
            + "and i.table_owner = c.table_owner \n"
            + "and i.table_name = c.table_name \n"
            + "and i.owner = c.index_owner \n"
            + "order by table_name, index_name, \n"
            + "ordinal_position\n";

    private static final String ORACLE_DUMP_PKS_SQL
            = "SELECT "
            + "c.owner AS table_schem,\n"
            + "c.table_name,\n"
            + "c.column_name,\n"
            + "c.position AS key_seq,\n"
            + "c.constraint_name AS pk_name\n"
            //+ "数据库 标记 > AS database info\n"
            + "FROM ${prefix}_dba_cons_columns c,\n"
            + "${prefix}_dba_constraints k\n"
            + "WHERE k.constraint_type = 'P'\n"
            + "AND k.owner = ${schemas}\n"
            + "AND k.constraint_name = c.constraint_name\n"
            + "AND k.table_name = c.table_name\n"
            + "AND k. owner = c.owner\n"
            + "ORDER BY table_name, key_seq";

    private static final String ORACLE_DUMP_ROUTINES_SQL
            = "select\n"
            + "owner as routine_schem,\n"
            + "name as routine_name,\n"
            + "type as routine_type,\n"
            + "line,\n"
            + "text\n"
            + "from ${prefix}_dba_source\n"
            + "where owner = ${schemas}\n"
            + "and type in ('FUNCTION', 'PROCEDURE')\n"
            + "order by routine_schem, routine_name, line";

    private static final String ORACLE_DUMP_ROUTINES_SQL_PACKAGE
            = "select\n"
            + "owner as package_schema,\n"
            + "name as package_name,\n"
            + "line,\n"
            + "text\n"
            + "from ${prefix}_dba_source\n"
            + "where type = 'PACKAGE BODY'\n"
            + "order by package_schema, package_name, line";

    private static final String MYSQL_DUMP_TABLES_SQL
            = "SELECT\n"
            + "o.TABLE_SCHEMA AS table_schem,\n"
            + "o.TABLE_NAME AS table_name,\n"
            + "o.TABLE_TYPE AS table_type,\n"
            + "o.TABLE_COMMENT AS remarks\n"
            + "FROM ${prefix}_tables o\n"
            + "WHERE o.TABLE_SCHEMA = ${schemas}\n"
            + "AND o.TABLE_TYPE IN ('BASE TABLE')\n"
            + "ORDER BY table_schem, table_name";

    private static final String MYSQL_DUMP_VIEWS_SQL
            = "select\n"
            + "v.TABLE_SCHEMA as table_schem,\n"
            + "v.TABLE_NAME as table_name,"
            + "NULL AS remarks,\n"
            + "v.VIEW_DEFINITION as text\n"
            + "from\n"
            + "${prefix}_views v "
            + "where v.TABLE_SCHEMA = ${schemas}\n"
            + "order by table_schem, table_name";

    private static final String MYSQL_DUMP_COLUMNS_SQL
            = "SELECT\n"
            + "c.TABLE_SCHEMA as TABLE_SCHEM,\n"
            + "c.TABLE_NAME as TABLE_NAME,\n"
            + "c.COLUMN_NAME as COLUMN_NAME,\n"
            + "0 as DATA_TYPE,\n"
            + "c.COLUMN_TYPE as TYPE_NAME,\n"
            + "0 as COLUMN_SIZE,\n"
            + "0 as DECIMAL_DIGITS,\n"
            + "c.COLUMN_COMMENT as REMARKS,\n"
            + "c.COLUMN_DEFAULT as COLUMN_DEF,\n"
            + "c.ORDINAL_POSITION as\n"
            + "ORDINAL_POSITION,\n"
            + "c.IS_NULLABLE as IS_NULLABLE,\n"
            + "case c.EXTRA\n"
            + "WHEN 'auto_increment' THEN 'YES' ELSE 'NO'\n"
            + "end IS_AUTOINCREMENT\n"
            + "FROM ${prefix}_columns c\n"
            + "WHERE c.TABLE_SCHEMA = ${schemas}\n"
            + "ORDER BY table_schem, table_name,\n"
            + "ordinal_position";

    private static final String MYSQL_DUMP_PKS_SQL
            = "select\n"
            + "pk.TABLE_SCHEMA as TABLE_SCHEM,"
            + "pk.TABLE_NAME,\n"
            + "pk.COLUMN_NAME,\n"
            + "pk.SEQ_IN_INDEX as KEY_SEQ,\n"
            + "pk.INDEX_NAME as PK_NAME\n"
            + "from\n"
            + "${prefix}_statistics pk\n"
            + "where (index_name = 'PRIMARY' or index_name = 'PRI')\n"
            + "and table_schema = ${schemas}\n"
            + "order by TABLE_NAME, KEY_SEQ";

    private static final String MYSQL_DUMP_INDEXES_SQL
            = "select\n"
            + "idx.TABLE_SCHEMA as TABLE_SCHEM,\n"
            + "idx.TABLE_NAME,\n"
            + "CASE WHEN idx.NON_UNIQUE = 1 THEN\n"
            + "true ELSE false END as NON_UNIQUE,\n"
            + "null as INDEX_QUALIFIER,\n"
            + "idx.INDEX_NAME,\n"
            + "3 as TYPE,\n"
            + "idx.SEQ_IN_INDEX as ORDINAL_POSITION,\n"
            + "idx.COLUMN_NAME,\n"
            + "idx.COLLATION as ASC_OR_DESC,\n"
            + "idx.CARDINALITY,\n"
            + "0 as PAGES,\n"
            + "null as FILTER_CONDITION\n"
            + "from ${prefix}_statistics idx\n"
            + "where table_schema = ${schemas}\n"
            + "order by TABLE_SCHEM, TABLE_NAME,\n"
            + "INDEX_NAME, ORDINAL_POSITION";

    private static final String MYSQL_DUMP_ROUTINES_SQL
            = "SELECT routine_schema AS routine_schem, \n"
            + "       routine_name   AS routine_name, \n"
            + "       routine_type   AS routine_type, \n"
            + "       1              AS line, \n"
            + "       CASE \n"
            + "         WHEN routine_type = 'PROCEDURE' THEN \n"
            + "         Concat(\"create procedure\", routine_name, \n"
            + "         CASE \n"
            + "           WHEN parameters IS NOT NULL THEN Concat \n"
            + "           (\"\\n(\", parameters, \")\\n\") \n"
            + "           ELSE \"()\\n\" \n"
            + "         end, sql_data_access, \"\\n\", \n"
            + "         Concat( \n"
            + "                    \"comment '\", routine_comment, \n"
            + "         \"'\\n\"), \n"
            + "                    routine_definition) \n"
            + "         ELSE Concat(\"create function\", routine_name, CASE \n"
            + "                     WHEN parameters IS NOT NULL THEN \n"
            + "                     Concat(\"\\n(\", parameters, \")\\n\") \n"
            + "                     ELSE \"()\\n\" \n"
            + "                                                       end, CASE \n"
            + "                     WHEN return_v IS NOT NULL THEN \n"
            + "                     Concat(\"returns\", return_v, \"\\n\") \n"
            + "                     ELSE \"\\n\" \n"
            + "                                                            end, sql_data_access \n"
            + "              , \"\\n\", \n"
            + "              Concat \n"
            + "                     (\"comment '\", routine_comment, \"'\\n\"), routine_definition) \n"
            + "       end            AS text \n"
            + "FROM   (SELECT r_all.*, \n"
            + "               pa_return.return_v \n"
            + "        FROM   (SELECT r1.*, \n"
            + "                       t1.parameters \n"
            + "                FROM   ${prefix}_routines r1 \n"
            + "                       LEFT JOIN (SELECT specific_schema, \n"
            + "                                         specific_name, \n"
            + "                                         Group_concat(para SEPARATOR ',\\n') AS \n"
            + "                                         parameters \n"
            + "                                  FROM  (SELECT specific_schema, \n"
            + "                                                specific_name, \n"
            + "                                                ( CASE \n"
            + "                                                    WHEN \n"
            + "                                        routine_type = 'PROCEDURE' \n"
            + "                                                  THEN \n"
            + "                                                    Concat(parameter_mode, \"\", \n"
            + "                                                    parameter_name, \n"
            + "                                                    \"\", \n"
            + "                                                    dtd_identifier) \n"
            + "                                                    ELSE Concat(parameter_name, \n"
            + "                                                         \"\", \n"
            + "                                                         dtd_identifier) \n"
            + "                                                  end ) AS para \n"
            + "                                         FROM   ${prefix}_parameters \n"
            + "                                         WHERE  routine_type IN ( \n"
            + "                                                'FUNCTION', 'PROCEDURE' ) \n"
            + "                                                AND ordinal_position > 0 \n"
            + "                                         ORDER  BY specific_schema, \n"
            + "                                                   specific_name, \n"
            + "                                                   ordinal_position) AS t \n"
            + "                                  GROUP  BY specific_schema, \n"
            + "                                            specific_name) AS t1 \n"
            + "                              ON r1.routine_type IN ( 'FUNCTION', 'PROCEDURE' ) \n"
            + "                                 AND r1.routine_schema = t1.specific_schema \n"
            + "                                 AND r1.specific_name = t1.specific_name) AS \n"
            + "               r_all \n"
            + "               LEFT JOIN (SELECT specific_schema, \n"
            + "                                 specific_name, \n"
            + "                                 dtd_identifier AS RETURN_V \n"
            + "                          FROM   ${prefix}_parameters \n"
            + "                          WHERE  ordinal_position = 0) pa_return \n"
            + "                      ON r_all.routine_schema = pa_return.specific_schema \n"
            + "                         AND r_all.specific_name = pa_return.specific_name) AS p \n"
            + " where routine_schema = ${schemas}"
            + "ORDER  BY routine_schem, \n"
            + "          routine_name, \n"
            + "          line ";


    private String replacePlceholder(String str, String placeholder, String value) {
        final StringBuffer result = new StringBuffer();
        final Matcher m = p.matcher(str);
        while (m.find()) {
            String refKey = m.group(1);
            if (refKey.equals(placeholder)) {
                String refValue = value;
                m.appendReplacement(result, null == refValue ? refKey : refValue);
            }
        }
        m.appendTail(result);

        return result.toString();
    }

    private String buildSchemaString(String schemas) {
        if (schemas.indexOf(",") >= 0) {
            String[] parts = schemas.split(",");
            List<String> schemaList = new ArrayList<>();
            for (int i = 0; i < parts.length; i++) {
                String part = parts[i];
                if (Strings.isNullOrEmpty(part)) {
                    continue;
                }
                schemaList.add("\'" + part.toUpperCase().trim() + "\'");
            }
            return StringUtils.join(schemaList, ",");
        } else {
            return "\'" + schemas.toUpperCase().trim() + "\'";
        }
    }


    @Override
    public String getType() {
        return "OFFLINEDUMP_RAW";
    }


    private String getDatabaseInfo() {
        return datasource.getProperties().getParameter(DatasourceKnownParameterType.OfflineDumpTargetDBName.toString());
    }

    private String getDatabaseType() {
        return datasource.getProperties().getParameter(DatasourceKnownParameterType.OfflineDumpRealDBType.toString());
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
    public void buildDatasourceRelatedObjects(ModelX modelX, String catalog, String s_schema) throws Exception {
        if (getRealType().equalsIgnoreCase("ORACLE")) {
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
                                processPackageBody(modelX, schema, previousPackage.getName(), sqlSP);
                            }

                            // create new sp
                            ObjectX newObj = createObject(modelX, LDMTypes.oPackage);

                            if (newObj == null) {
                                continue;
                            }

                            ReversedSchema oSchema = getOrCreateSchema(modelX, schema);
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
                        processPackageBody(modelX, schema, previousPackage.getName(), sqlSP);
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
    protected void buildProcedures(ModelX modelX, String catalog) {
        try {
            logger.trace("try to get dump sp/function");
            for (String s_schema : schemaPattern) {
                try (Statement stmt = jdbcDatasource.getConnection().createStatement()) {

                    //String realSchema = getRealSchema();
                    String query = null;

                    if ("oracle".equalsIgnoreCase(getDatabaseType())) {
                        query = ORACLE_DUMP_ROUTINES_SQL;
                        query = replacePlceholder(query, "prefix", getDatabaseInfo());
                        query = replacePlceholder(query, "schemas", buildSchemaString(s_schema));
                    } else if ("mysql".equalsIgnoreCase(getDatabaseType())) {
                        query = MYSQL_DUMP_ROUTINES_SQL;
                        query = replacePlceholder(query, "prefix", getDatabaseInfo());
                        query = replacePlceholder(query, "schemas", buildSchemaString(s_schema));
                    }

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
                                        if ("oracle".equalsIgnoreCase(getDatabaseType())) {
                                            sqlSP = "create or replace " + sqlSP;
                                        }
                                        previousSp.setProperty(LDMTypes.pSQL, sqlSP);
                                        previousSp.setObjectIsFullyCreated();
                                    }

                                    // create new sp
                                    ObjectX newObj = null;

                                    if (type.toUpperCase().contains("PROCEDURE")) {
                                        newObj = createStoredProcedure(modelX);
                                    } else if (type.toUpperCase().contains("FUNCTION")) {
                                        newObj = createFunction(modelX);
                                    }

                                    if (newObj == null)
                                        continue;
/* UPDATE
                                    ObjectX oSchema = getOrCreateSchema(modelX, schema);
  */
                                    ReversedSchema oSchema = getOrCreateSchema(modelX, schema);
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
                            if ("oracle".equalsIgnoreCase(getDatabaseType())) {
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
    protected void readColumnComments(String catalog, String schema) throws Exception {
        if (!"oracle".equalsIgnoreCase(getDatabaseType())) {
            super.readColumnComments(catalog, schema);
        } else {
            String sql = ORACLE_DUMP_COLUMNS_COMMENT_SQL;
            sql = replacePlceholder(sql, "prefix", getDatabaseInfo());
            sql = replacePlceholder(sql, "schemas", buildSchemaString(schema));
            logger.debug("loading columns comment of schema [" + schema + "]");
            try (Statement stmt = jdbcDatasource.getConnection().createStatement();
                 ResultSet rsColumnsComment = stmt.executeQuery(sql)) {

                while (rsColumnsComment.next()) {
                    String tableName = rsColumnsComment.getString("TABLE_NAME");
                    if (!Strings.isNullOrEmpty(catalog) && Strings.isNullOrEmpty(schema)) {
                        schema = catalog;
                    }
                    ReversedSchema reversedSchema = schemaMap.get(schema);
                    ReversedTable table = reversedSchema.lookForTable(tableName);
                    String columnDefinition = rsColumnsComment.getString("COMMENTS");
                    if (!Strings.isNullOrEmpty(columnDefinition)) {
                        String columnName = rsColumnsComment.getString("COLUMN_NAME");
                        if (table != null) {
                            table.addColumnComment(columnName, columnDefinition);
                        }
                    }
                }
            } catch (AndorjJobStoppedException e) {
                throw e;
            } catch (Exception e) {
                logger.error("Failed to get column comment", e);
            }
        }
    }

    @Override
    public ResultSet getColumnsOfSchema(String catalog, String schema) {

        String sql = null;
        if ("oracle".equalsIgnoreCase(getDatabaseType())) {
            sql = ORACLE_DUMP_COLUMNS_SQL;
            sql = replacePlceholder(sql, "prefix", getDatabaseInfo());
            sql = replacePlceholder(sql, "schemas", buildSchemaString(schema));
        } else if ("mysql".equalsIgnoreCase(getDatabaseType())) {
            sql = MYSQL_DUMP_COLUMNS_SQL;
            sql = replacePlceholder(sql, "prefix", getDatabaseInfo());
            sql = replacePlceholder(sql, "schemas", buildSchemaString(schema));
        }
        try {
            PreparedStatement stmt = jdbcDatasource.getConnection().prepareStatement(sql);

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
        String query = null;

        if ("oracle".equalsIgnoreCase(getDatabaseType())) {
            query = replacePlceholder(ORACLE_DUMP_VIEWS_SQL, "prefix", getDatabaseInfo());
            query = replacePlceholder(query, "schemas", buildSchemaString(tableSchema));
        } else if ("mysql".equalsIgnoreCase(getDatabaseType())) {
            query = replacePlceholder(MYSQL_DUMP_VIEWS_SQL, "prefix", getDatabaseInfo());
            query = replacePlceholder(query, "schemas", buildSchemaString(tableSchema));
        }

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
    public ResultSet getIndexesOfSchema(String catalog, String schema) {
        String sql = null;

        if ("oracle".equalsIgnoreCase(getDatabaseType())) {
            sql = ORACLE_DUMP_INDEXES_SQL;
            sql = replacePlceholder(sql, "prefix", getDatabaseInfo());
            sql = replacePlceholder(sql, "schemas", buildSchemaString(schema));
        } else if ("mysql".equalsIgnoreCase(getDatabaseType())) {
            sql = MYSQL_DUMP_INDEXES_SQL;
            sql = replacePlceholder(sql, "prefix", getDatabaseInfo());
            sql = replacePlceholder(sql, "schemas", buildSchemaString(schema));
        }

        try {
            PreparedStatement stmt = jdbcDatasource.getConnection().prepareStatement(sql);
            stmt.setFetchSize(FetchSize);
            return stmt.executeQuery();
        } catch (SQLException e) {
            logger.error("failed to get index", e);
        }
        return null;
    }

    @Override
    public ResultSet getPrimaryKeysOfSchema(String catalog, String schema) {
        String sql = null;

        if ("oracle".equalsIgnoreCase(getDatabaseType())) {
            sql = ORACLE_DUMP_PKS_SQL;
            sql = replacePlceholder(sql, "prefix", getDatabaseInfo());
            sql = replacePlceholder(sql, "schemas", buildSchemaString(schema));
        } else if ("mysql".equalsIgnoreCase(getDatabaseType())) {
            sql = MYSQL_DUMP_PKS_SQL;
            sql = replacePlceholder(sql, "prefix", getDatabaseInfo());
            sql = replacePlceholder(sql, "schemas", buildSchemaString(schema));
        }

        try {
            PreparedStatement stmt = jdbcDatasource.getConnection().prepareStatement(sql);

            stmt.setFetchSize(FetchSize);

            return stmt.executeQuery();
        } catch (SQLException e) {
            logger.error("failed to obtain pk ", e);
        }
        return null;
    }

    @Override
    public ResultSet getTablesOfSchema(String catalog, String s_schema, String tableNamePattern) {

        //String schema = getRealSchema();

        boolean isTable = true;

        String sql = null;

        if ("oracle".equalsIgnoreCase(getDatabaseType())) {
            sql = isTable ?
                    replacePlceholder(ORACLE_DUMP_TABLES_SQL, "prefix", getDatabaseInfo())
                    : replacePlceholder(ORACLE_DUMP_VIEWS_SQL, "prefix", getDatabaseInfo());

            sql = replacePlceholder(sql, "schemas", buildSchemaString(s_schema));
        } else if ("mysql".equalsIgnoreCase(getDatabaseType())) {
            sql = isTable ?
                    replacePlceholder(MYSQL_DUMP_TABLES_SQL, "prefix", getDatabaseInfo())
                    : replacePlceholder(MYSQL_DUMP_VIEWS_SQL, "prefix", getDatabaseInfo());
            sql = replacePlceholder(sql, "schemas", buildSchemaString(s_schema));
        }
        try {
            PreparedStatement stmt = jdbcDatasource.getConnection().prepareStatement(sql);

            stmt.setFetchSize(FetchSize);

            return stmt.executeQuery();
        } catch (SQLException e) {
            logger.error("failed to obtain tables", e);
        }
        return null;
    }

    @Override
    public ResultSet getViewsOfSchema(String catalog, String s_schema, String tableNamePattern) {

        //String schema = getRealSchema();

        boolean isTable = false;

        String sql = null;

        if ("oracle".equalsIgnoreCase(getDatabaseType())) {
            sql = isTable ?
                    replacePlceholder(ORACLE_DUMP_TABLES_SQL, "prefix", getDatabaseInfo())
                    : replacePlceholder(ORACLE_DUMP_VIEWS_SQL, "prefix", getDatabaseInfo());

            sql = replacePlceholder(sql, "schemas", buildSchemaString(s_schema));
        } else if ("mysql".equalsIgnoreCase(getDatabaseType())) {
            sql = isTable ?
                    replacePlceholder(MYSQL_DUMP_TABLES_SQL, "prefix", getDatabaseInfo())
                    : replacePlceholder(MYSQL_DUMP_VIEWS_SQL, "prefix", getDatabaseInfo());
            sql = replacePlceholder(sql, "schemas", buildSchemaString(s_schema));
        }
        try {
            PreparedStatement stmt = jdbcDatasource.getConnection().prepareStatement(sql);

            stmt.setFetchSize(FetchSize);

            return stmt.executeQuery();
        } catch (SQLException e) {
            logger.error("failed to obtain tables", e);
        }
        return null;
    }
}
