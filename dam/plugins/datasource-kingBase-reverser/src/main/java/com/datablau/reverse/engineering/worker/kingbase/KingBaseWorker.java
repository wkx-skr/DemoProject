package com.datablau.reverse.engineering.worker.kingbase;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.core.model.ObjectX;
import com.datablau.reverse.engineering.api.JdbcPlugin;
import com.datablau.reverse.engineering.data.ReversedSchema;
import com.datablau.reverse.engineering.data.ReversedTable;
import com.datablau.reverse.engineering.worker.ReverseForwardStrategyJdbc;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableSet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date :2024/9/14
 */
public class KingBaseWorker extends ReverseForwardStrategyJdbc implements JdbcPlugin {

    private static final Logger logger = LoggerFactory.getLogger(KingBaseWorker.class);

    private static final int FetchSize = 2000;

    private ImmutableSet<String> dtWithoutPS = ImmutableSet.<String>builder()
            .add("FLOAT4").add("FLOAT8")
            .add("MONEY").add("TEXT").add("BYTEA").add("DATE")
            .add("POINT").add("LINE").add("LSEG").add("BOX").add("PATH")
            .add("POLYGON").add("CIRCLE").add("CIDR").add("INET").add("MACADDR")
            .add("MACADDR8").add("UUID").add("XML").add("JSON")
            .build();

    @Override
    public String getType() {
        return "KINGBASE";
    }

    /**
     * 获取 table comment SQL
     */
    public String getSQL(String schema) {
        return  null ;
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
    public ResultSet getPrimaryKeysOfSchema(String catalog, String schema) {
        try {
            return jdbcDatasource.getConnection().getMetaData().getPrimaryKeys(catalog, schema, null);
        } catch (SQLException e) {
            throw new UnexpectedStateException(
                    "Unable to get pk :" + e.getMessage());
        }
    }


    @Override
    protected void readEntireViewSQL(String catalog, String schema, ReversedSchema oSchema, ResultSet viewSqlResultSet) throws Exception {
        logger.debug("try to get KingBase view sql");

        try (Statement stmt = jdbcDatasource.getConnection().createStatement()) {
            String query = "SELECT viewname, definition FROM pg_views WHERE schemaname = '" + schema + "'";
            logger.debug(query);
            try (ResultSet results = stmt.executeQuery(query)) {
                while (results.next()) {
                    String viewname = results.getString("VIEWNAME");
                    ReversedTable view = oSchema.lookForTable(viewname);
                    if (view == null)
                        return;

                    String value = results.getString("DEFINITION");
                    if (!Strings.isNullOrEmpty(value)) {
                        // replace \n to \r\n , so we can show it in client correctly
                        // value = value.replaceAll("\n", "\r\n");
                        if (!value.startsWith("CREATE")) {
                            value = "create view `" + catalog + "`.`" + view.getTableX().getName() + "` as \n" + value;
                        }
                        view.getTableX().setProperty(LDMTypes.pSQL, value);
                    }
                    if (options.needToPersis()) {
                        view.getTableX().setObjectIsFullyCreated();
                        view.clearObjectX();
                    }
                    processSave();
                }
            }
        } catch (Exception e) {
            logger.error("Failed to get KingBase database variables", e);
        }
    }

    private String getColumnDataType(ResultSet rsColumnsDt) throws SQLException {
        String dt = rsColumnsDt.getString("UDT_NAME").toUpperCase();
        if (!dtWithoutPS.contains(dt)) {
            if (dt.equals("INT2") || dt.equals("INT4") || dt.equals("INT8")) {
                // remove this. default value confusion by Huawei.
                String colDv = rsColumnsDt.getString("COLUMN_DEFAULT");
                if(!Strings.isNullOrEmpty(colDv) && colDv.startsWith("nextval('") && colDv.endsWith("seq'::regclass)")){
                    if(dt.equals("INT2")){
                            dt = "SMALLSERIAL";
                    }else if(dt.equals("INT4")){
                        dt = "SERIAL";
                    }else if(dt.equals("INT8")){
                        dt = "BIGSERIAL";
                    }
                }
            } else if (dt.equals("NUMERIC")) {
                int precision = rsColumnsDt.getInt("NUMERIC_PRECISION");
                int scale = rsColumnsDt.getInt("NUMERIC_SCALE");
                dt = super.generateFullDataType(null, dt, scale, precision);
            } else if (dt.equals("BPCHAR") || dt.equals("CHAR")) {
                dt = "CHAR(" + rsColumnsDt.getInt("CHARACTER_MAXIMUM_LENGTH") + ")";
            } else if (dt.equals("VARCHAR") || dt.equals("CHARACTER VARYING")) {
                int precision = rsColumnsDt.getInt("CHARACTER_MAXIMUM_LENGTH");
                if (precision > 0) {
                    dt = "VARCHAR(" + precision + ")";
                }
            } else if (dt.equals("BOOL")) {
                dt = "BOOLEAN";
            } else if (dt.equals("TIME") || dt.equals("TIMESTAMP")) {
                int precision = rsColumnsDt.getInt("DATETIME_PRECISION");
                if (precision > 0) {
                    dt = dt + "(" + precision + ")";
                }
            } else if (dt.equals("TIMETZ")) {
                int precision = rsColumnsDt.getInt("DATETIME_PRECISION");
                if (precision > 0) {
                    dt = "TIME(" + precision + ") WITH TIME ZONE";
                } else {
                    dt = "TIME WITH TIME ZONE";
                }
            } else if (dt.equals("TIMESTAMPTZ")) {
                int precision = rsColumnsDt.getInt("DATETIME_PRECISION");
                if (precision > 0) {
                    dt = "TIMESTAMP(" + precision + ") WITH TIME ZONE";
                } else {
                    dt = "TIMESTAMP WITH TIME ZONE";
                }
            } else if (dt.equals("INTERVAL")) {
                String intervalType = rsColumnsDt.getString("INTERVAL_TYPE");
                if (!Strings.isNullOrEmpty(intervalType)) {
                    dt += " " + intervalType;
                }
            } else if (dt.equals("BIT") || dt.equals("VARBIT")) {
                Object precision = rsColumnsDt.getObject("CHARACTER_MAXIMUM_LENGTH");
                if (precision != null) {
                    dt += "(" + precision.toString() + ")";
                }
            }
        }
        return dt;
    }

    @Override
    protected void readColumns(ModelX model, String catalog, String schema, ResultSet columnResultSet) throws Exception {


        logger.debug("loading columns of schema [" + schema + "]");

        ReversedSchema reversedSchema = schemaMap
                .get(Strings.isNullOrEmpty(schema) ? catalog : schema);

        try (Statement stmt = jdbcDatasource.getConnection().createStatement()) {
            String sql = "SELECT TABLE_CATALOG, TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, COLUMN_DEFAULT, UDT_NAME, CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, NUMERIC_SCALE, DATETIME_PRECISION, INTERVAL_TYPE \n" +
                    "FROM INFORMATION_SCHEMA.columns \n" +
                    "WHERE TABLE_CATALOG = '" + catalog + "' \n" +
                    "AND TABLE_SCHEMA = '" + schema + "' \n" +
//                    "AND TABLE_NAME = '" + table.getName() + "'";
                    "ORDER BY TABLE_NAME, COLUMN_NAME";

            try (ResultSet rsColumnsDt = stmt.executeQuery(sql)) {
                while (rsColumnsDt.next()) {
                    String tableName = rsColumnsDt.getString("TABLE_NAME");
                    ReversedTable table = reversedSchema.lookForTable(tableName);
                    if (table == null)
                        continue;

                    String columnName = rsColumnsDt.getString("COLUMN_NAME");
                    table.addColumnType(columnName, getColumnDataType(rsColumnsDt));
                }
                processSave();
            }
            super.readColumns(model, catalog, schema, columnResultSet);
        } catch (Exception e) {
            logger.error("Failed to get columns", e);
        }

    }


    @Override
    public ResultSet getForeignKeysOfSchema(String catalog, String schema) {
        try {
            return jdbcDatasource.getConnection().getMetaData().getImportedKeys(catalog, schema, null);
        } catch (SQLException e) {
            throw new UnexpectedStateException(
                    "Unable to get fk :" + e.getMessage());
        }
    }

    @Override
    protected void buildProcedures(ModelX model, String catalog) {
        // Procedures is defined as Functions in KingBase
        return;
    }

    @Override
    protected void buildFunctions(ModelX model, String catalog) {
        logger.debug("Building Functions...");
        try {
            for (String s_schema : schemaPattern) {
                readFunctions(model, s_schema, catalog);
            }
            logger.debug("Finished building Functions");
        } catch (Exception e) {
            logger.error("Failed to build Functions", e);
            throw e;
        }
    }

    private int getMajorVersion(Connection connection) {
        try (Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT split_part(version(), ' ', 2) AS POSTGRES_VERSION")) {
            while(rs.next()) {
                String version = rs.getString("POSTGRES_VERSION");
                logger.info("KingBase version:" + version);
                String majorVersion = version.substring(0, version.indexOf("."));
                return Integer.parseInt(majorVersion);
            }
        } catch (SQLException e) {
            throw new UnexpectedStateException("Failed to obtain version information:" + e.getMessage(), e);
        }
        return 0;
    }

    private void readFunctions(ModelX modelX, String s_schema, String catalog) {
        try {
            logger.trace("try to get KingBase Functions");

            Connection connection = jdbcDatasource.getConnection();
            int major = getMajorVersion(connection);

            String typeFilter = " not p.proisagg\n AND not p.proiswindow\n ";
            if (major > 10) {
                typeFilter = " p.prokind in ('f', 'p') \n";
            }
            if (major < 8.4) {
                typeFilter = " not p.proisagg\n ";
            }

            try (Statement stmt = jdbcDatasource.getConnection().createStatement()) {
                String query = "SELECT\n" +
                        "            n.nspname AS schema_name\n" +
                        "            , p.proname AS function_name\n" +
                        "            , pg_catalog.pg_get_function_result(p.oid) AS result_data_type\n" +
                        "            , pg_catalog.pg_get_function_arguments(p.oid) AS argument_data_types\n" +
                        "            , p.prosrc AS code\n" +
                        "            , l.lanname AS language\n" +
                        "            , p.provolatile AS volatile\n" +
                        "FROM\n" +
                        "            pg_catalog.pg_proc p\n" +
                        "LEFT JOIN   pg_catalog.pg_namespace n\n" +
                        "     ON     n.oid = p.pronamespace\n" +
                        "LEFT JOIN   pg_catalog.pg_language l\n" +
                        "     ON     l.oid = p.prolang\n" +
                        "WHERE " + (s_schema.equals("%") ? "" : "n.nspname = '" + s_schema + "' AND") + "\n" +
                        typeFilter +
                        "     AND    not p.prorettype = 'pg_catalog.trigger'::pg_catalog.regtype\n" +
                        "ORDER BY\n" +
                        "            schema_name\n" +
                        "            , function_name";

                stmt.setFetchSize(10000);
                try (ResultSet results = stmt.executeQuery(query)) {
                    while (results.next()) {
                        String schema = results.getString("schema_name");
                        String name = results.getString("function_name");
                        if (options.isInBlackList(name, LDMTypes.oFunction)) {
                            logger.debug("Function '" + name + "' is in the black list");
                            continue;
                        }

                        String code = results.getString("code");
                        String argument = results.getString("argument_data_types");
                        String returnData = results.getString("result_data_type");
                        String language = results.getString("language");
                        String volatileFlag = results.getString("volatile");

                        // create new sp
                        ObjectX newSp = createFunction(modelX);
                        ReversedSchema reversedSchema = getOrCreateSchema(modelX, schema);
                        setSchemaInfoToObject(reversedSchema, newSp);
                        newSp.setName(name);
                        if (!Strings.isNullOrEmpty(code)) {
                            String text = "CREATE OR REPLACE FUNCTION " + name;
                            if (!Strings.isNullOrEmpty(argument)) {
                                text += "(\n" + argument + ")";
                            }

                            if (!Strings.isNullOrEmpty(returnData)) {
                                text += "\nRETURNS " + returnData + " AS";
                            }

                            text += "\n$BODY$\n";
                            text += code;
                            text += "\n$BODY$\n";

                            if (!Strings.isNullOrEmpty(language)) {
                                text += "LANGUAGE " + language;
                                if (!Strings.isNullOrEmpty(volatileFlag)) {
                                    if (volatileFlag.equals("i")) {
                                        text += " IMMUTABLE";
                                    } else if (volatileFlag.equals("v")) {
                                        text += " VOLATILE";
                                    } else if (volatileFlag.equals("s")) {
                                        text += " STABLE";
                                    }
                                }
                            }

                            text += ";";

                            newSp.setProperty(LDMTypes.pSQL, text);
                            newSp.setObjectIsFullyCreated();
                        }

                    }
                }
            }
        } catch (Exception e) {
            logger.error("Failed to get KingBase Function SQL", e);
        }
    }

    @Override
    public ResultSet getIndexesOfSchema(String catalog, String schema) {
        Connection conn = jdbcDatasource.getConnection();

        String sql;
        String select = "SELECT NULL AS TABLE_CAT, n.nspname AS TABLE_SCHEM, ";
        String from = " FROM pg_catalog.pg_namespace n, pg_catalog.pg_class ct, pg_catalog.pg_class ci,  pg_catalog.pg_attribute a, pg_catalog.pg_am am ";
        String where = " AND n.oid = ct.relnamespace ";
        from = from + ", pg_catalog.pg_index i ";
        if (schema != null && !schema.isEmpty()) {
            where = where + " AND n.nspname = '" + schema + "' ";
        }

        sql = select + " ct.relname AS TABLE_NAME, NOT i.indisunique AS NON_UNIQUE, NULL AS INDEX_QUALIFIER, ci.relname AS INDEX_NAME, " + " CASE i.indisclustered " + " WHEN true THEN " + 1 + " ELSE CASE am.amname " + " WHEN 'hash' THEN " + 2 + " ELSE " + 3 + " END " + " END AS TYPE, " + " a.attnum AS ORDINAL_POSITION, " + " CASE WHEN i.indexprs IS NULL THEN a.attname " + " ELSE pg_catalog.pg_get_indexdef(ci.oid,a.attnum,false) END AS COLUMN_NAME, " + " NULL AS ASC_OR_DESC, " + " ci.reltuples AS CARDINALITY, " + " ci.relpages AS PAGES, " + " pg_catalog.pg_get_expr(i.indpred, i.indrelid) AS FILTER_CONDITION " + from + " WHERE ct.oid=i.indrelid AND ci.oid=i.indexrelid AND a.attrelid=ci.oid AND ci.relam=am.oid " + where;
//        }

//        sql = sql + " AND ct.relname = " + this.escapeQuotes(conn, tableName);
        if (false) { // unique = false
            sql = sql + " AND i.indisunique ";
        }

        sql = sql + " ORDER BY NON_UNIQUE, TYPE, INDEX_NAME, ORDINAL_POSITION ";

        try {
            PreparedStatement stmt = conn.prepareStatement(sql);
            //        stmt.setString(1, schema == null ? "%" : schema);
            stmt.closeOnCompletion();
            stmt.setFetchSize(FetchSize);
            return stmt.executeQuery();
        } catch (SQLException e) {
            logger.error("failed to get index ", e);
        }

        return null;
    }
}
