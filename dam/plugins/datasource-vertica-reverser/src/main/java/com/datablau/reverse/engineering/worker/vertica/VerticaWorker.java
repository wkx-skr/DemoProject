package com.datablau.reverse.engineering.worker.vertica;

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

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.regex.Pattern;

/**
 * @program: datablau-datasource-plugins
 * @description: VerticaWorker
 * @author: wang tong
 * @create: 2023-08-16 15:50
 **/
public class VerticaWorker extends ReverseForwardStrategyJdbc implements JdbcPlugin {

    private static final Logger logger = LoggerFactory.getLogger(VerticaWorker.class);

    private Pattern compile = Pattern.compile("(\\(.+\\))");

    @Override
    public String getType() {
        return "VERTICA";
    }


    @Override
    public ResultSet getColumnCommentsOfSchema(String catalog, String schema) {

        logger.debug("try to get comment of schema \"" + schema + "\n");
        try {
            Statement stmt = jdbcDatasource.getConnection().createStatement();
            String query =
                    "select DISTINCT vc.object_schema as TABLE_SCHEM, vc.object_name as TABLE_NAME, vc.child_object as COLUMN_NAME, " +
                            "vc.comment as REMARKS ,NULL AS TABLE_CAT from v_catalog.comments vc where vc.object_schema = '%s' ";
            query = String.format(query, schema);
            return stmt.executeQuery(query);

        } catch (Exception ex) {
            logger.error("Failed to get comment of schema " + schema, ex);
        }
        return null;
    }


    @Override
    public String getViewSqlOfView(String catalog, String schema, String viewName) {
        try {
            logger.debug("try to get vertica view sql");
            try (Statement stmt = jdbcDatasource.getConnection().createStatement()) {
                String query = "select DISTINCT table_schema,table_name,view_definition from views where table_schema = '%s' and table_name = '%s'";
                query = String.format(query, schema, viewName);
                logger.debug(query);
                try (ResultSet results = stmt.executeQuery(query)) {
                    while (results.next()) {

                        String viewsql = results.getString("view_definition");
                        if (!Strings.isNullOrEmpty(viewsql) && viewsql.length() > 5) {
                            String sub = viewsql.substring(0, 5).toUpperCase();
                            if (!sub.startsWith("CREATE")) {
                                viewsql = "create view `" + catalog + "`.`" + viewName + "` as \n" + viewsql;
                            }
                            return viewsql;
                        }
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Failed to get vertica database variables", e);
        }
        return null;
    }

    /**
     * 空实现，跳过读取出function方法
     *
     * @throws Exception
     */
    @Override
    protected void readProcedures(ModelX model, String catalog, String schema, ResultSet procedureResultSet) throws Exception {
    }


    @Override
    public String getFunctionSqlOfSp(String catalog, String schema, String functionName) {

        try {
            logger.trace("try to get VERTICA Function sql");
            try (Statement stmt = jdbcDatasource.getConnection().createStatement()) {
                String query = "SELECT DISTINCT function_return_type, function_argument_type, function_definition from v_catalog.user_functions where schema_name='" +
                        schema
                        + "' and function_name='" +
                        functionName
                        + "' and procedure_type = 'User Defined Function' and function_definition not LIKE 'Class %' ";
                try (ResultSet results = stmt.executeQuery(query)) {
                    while (results.next()) {
                        String returnData = results.getString("function_return_type");
                        String argument = results.getString("function_argument_type");
                        String definition = results.getString("function_definition");

                        String text = "CREATE OR REPLACE FUNCTION " + functionName;
                        if (!Strings.isNullOrEmpty(argument)) {
                            text += "(" + argument + ")";
                        }

                        if (!Strings.isNullOrEmpty(returnData)) {
                            text += "\n RETURN " + returnData + "\nAS BEGIN \n ";
                        }

                        text += definition;
                        text += ";\n";
                        text += "END;";
                        return text;
                    }
                }
            }

        } catch (Exception e) {
            logger.error("Failed to get VERTICA Function sql", e);
        }
        return null;
    }

    @Override
    public ResultSet getPrimaryKeysOfSchema(String catalog, String schema) {
        String query = "SELECT DISTINCT \n"
                + "\tp.table_schema AS table_schem,\n"
                + "\tp.table_name,\n"
                + "\tp.column_name,\n"
                + "\tp.ordinal_position AS key_seq,\n"
                + "\tp.constraint_name AS pk_name,\n"
                + "\t'' AS database_info\n"
                + "FROM\n"
                + "\tv_catalog.primary_keys p\n"
                + "\twhere p.table_schema = '" + schema + "'\n"
                + "ORDER BY\n"
                + "\tp.table_schema,\n"
                + "\tp.table_name,\n"
                + "\tp.constraint_name";
        try {
            Statement statement = jdbcDatasource.getConnection().createStatement();
            return statement.executeQuery(query);
        } catch (SQLException e) {
            logger.error("Failed to get vertica database pk", e);
        }
        return null;
    }

    @Override
    public ResultSet getForeignKeysOfSchema(String catalog, String schema) {
        String query = "select DISTINCT \n"
                + "\tf.constraint_name as FK_NAME,\n"
                + "\tf.column_name as FKCOLUMN_NAME,\n"
                + "\tf.table_schema as FKTABLE_SCHEM,\n"
                + "\tf.table_name as FKTABLE_NAME,\n"
                + "\tf.reference_table_name as PKTABLE_NAME,\n"
                + "\tf.reference_table_schema as PKTABLE_SCHEM,\n"
                + "\tp.constraint_name as PK_NAME\n"
                + "from\n"
                + "\tv_catalog.FOREIGN_KEYS f\n"
                + "left join\n"
                + "\tv_catalog.primary_keys p\n"
                + "on  f.reference_column_name = p.column_name\n"
                + "and f.reference_table_name = p.table_name\n"
                + "and f.reference_table_schema = p.table_schema\n"
                + "and f.table_schema = '" + schema + "'";

        try {
            Statement statement = jdbcDatasource.getConnection().createStatement();
            return statement.executeQuery(query);
        } catch (SQLException e) {
            logger.error("Failed to get vertica database fk", e);
        }
        return null;
    }

    @Override
    protected ResultSet fetchAllColumns(String database, String schema) {
        return null;
    }
    protected ResultSet readColumnsResultSet(String s_schema, boolean isTable) {
        String query;
        if (isTable) {
            query = "SELECT DISTINCT \n"
                    + "\tc.table_schema AS TABLE_SCHEM,\n"
                    + "\tc.table_name AS TABLE_NAME,\n"
                    + "\tc.column_name AS COLUMN_NAME,\n"
                    + "\tc.data_type AS DATA_TYPE,\n"
                    + "\tc.data_type AS TYPE_NAME,\n"
                    + " null AS COLUMN_SIZE,\n"
                    + " null AS DECIMAL_DIGITS,\n"
                    + "\tm.comment AS REMARKS,\n"
                    + "\tc.column_default AS COLUMN_DEF,\n"
                    + "\tc.ordinal_position AS ORDINAL_POSITION,\n"
                    + "\tCASE\n"
                    + "\t\tWHEN c.is_nullable = 'false' THEN 'NO'\n"
                    + "\t\tELSE 'YES'\n"
                    + "\tEND IS_NULLABLE,\n"
                    + "\tCASE\n"
                    + "\t\tWHEN c.is_identity = 'false' THEN 'NO'\n"
                    + "\t\tELSE 'YES'\n"
                    + "\tEND IS_AUTOINCREMENT \n"
                    + "FROM\n"
                    + "\tv_catalog.columns c\n"
                    + "LEFT JOIN v_catalog.comments m ON\n"
                    + "\tm.object_type = 'COLUMN'\n"
                    + "\tand m.object_schema = c.table_schema\n"
                    + "\tand m.child_object = c.column_name\n"
                    + " and (upper(m.object_name) = CONCAT(CONCAT(upper(c.table_name), upper('_b0.')), upper(c.column_name)) or (m.child_object = c.column_name and m.object_name = c.table_name)) "
                    + "\tWHERE c.table_schema ='" + s_schema + "'\n"
                    + "ORDER BY\n"
                    + "\tc.table_schema,\n"
                    + "\tc.table_name,\n"
                    + "\tc.ordinal_position";
        } else {
            query = "SELECT\n"
                    + "\tDISTINCT null as TABLE_CAT,\n"
                    + "\tc.table_schema AS TABLE_SCHEM,\n"
                    + "\tc.table_name AS TABLE_NAME,\n"
                    + "\tc.column_name AS COLUMN_NAME,\n"
                    + "\tc.data_type AS DATA_TYPE,\n"
                    + "\tc.data_type AS TYPE_NAME,\n"
                    + " null AS COLUMN_SIZE,\n"
                    + " null AS DECIMAL_DIGITS,\n"
                    + "\tnull AS REMARKS,\n"
                    + "\tnull AS COLUMN_DEF,\n"
                    + "\tc.ordinal_position AS ORDINAL_POSITION,\n"
                    + "\tnull IS_NULLABLE,\n"
                    + "\tnull IS_AUTOINCREMENT,\n"
                    + "\t'' AS database_info\n"
                    + "FROM\n"
                    + "\tv_catalog.view_columns c\n"
                    + "LEFT JOIN v_catalog.comments m ON\n"
                    + "\tm.object_type = 'COLUMN'\n"
                    + "\tand m.object_schema = c.table_schema\n"
                    + "\tand m.child_object = c.column_name\n"
                    + " and (upper(m.object_name) = CONCAT(CONCAT(upper(c.table_name), upper('_b0.')), upper(c.column_name)) or (m.child_object = c.column_name and m.object_name = c.table_name)) "
                    + "\tWHERE c.table_schema ='" + s_schema + "'\n"
                    + "ORDER BY \n"
                    + "\tc.table_schema,\n"
                    + "\tc.table_name,\n"
                    + "\tc.ordinal_position";
        }
        try {
            Statement stmt = jdbcDatasource.getConnection().createStatement();
            return stmt.executeQuery(query);
        } catch (SQLException e) {
            logger.error("Failed to get  column", e);
        }
        return null;

    }


    @Override
    protected void readColumns(ModelX model, String catalog, String schema, ResultSet columnResultSet) throws Exception {
        String realSchema = Strings.isNullOrEmpty(schema) ? catalog : schema;

        // read table columns
        readColumnsVertica(model, catalog, schema, readColumnsResultSet(realSchema, true));

        // read view columns
        readColumnsVertica(model, catalog, schema, readColumnsResultSet(realSchema, false));

    }


    protected void readColumnsVertica(ModelX model, String catalog, String schema,
                               ResultSet columnResultSet) throws Exception {
        try {
            int totalHandledColumns = 0;
            ReversedSchema reversedSchema = schemaMap
                    .get(Strings.isNullOrEmpty(schema) ? catalog : schema);

            while (columnResultSet.next()) {
                try {
                    String tableName = columnResultSet.getString("TABLE_NAME");

                    ReversedTable table = reversedSchema.lookForTable(tableName);
                    if (table == null) {
                        continue;
                    }

                    String columnName = columnResultSet.getString("COLUMN_NAME");
                    ObjectX columnX = createColumn(model, table);
                    columnX.setName(columnName);

                    try {
                        columnX.setProperty(LDMTypes.pIsAutoIncrement,
                                getBoolean(columnResultSet.getString("IS_AUTOINCREMENT")));
                    } catch (Exception ex) {
                        // some db does't have AI.
                    }

                    try {
                        String defaultValue = columnResultSet.getString("COLUMN_DEF");
                        if (!Strings.isNullOrEmpty(defaultValue)) {
                            columnX.setProperty(LDMTypes.pDefaultValue, defaultValue);
                        }
                    } catch (Exception ignored) {

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

//                        int scale = 0;
//                        try {
//                            scale = columnResultSet.getInt("COLUMN_SIZE");
//                        } catch (SQLException e) {
//                            // do nothing
//                        }
//
//                        int precision = 0;
//                        try {
//                            precision = columnResultSet.getInt("DECIMAL_DIGITS");
//                        } catch (SQLException e) {
//                            //do nothing
//                        }

//                        String dataTypeString = generateFullDataType(columnResultSet, colDataType,
//                                scale, precision);

                        String dataType = table.getColumnType(columnName, colDataType);
                        columnX.setProperty(LDMTypes.pDataType, dataType);
                    }

                    String columnDefinition = columnResultSet.getString("REMARKS");
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
                        logger.debug("total loaded " + totalHandledColumns + " columns");
                    }

                } catch (Exception e) {
                    // Just catch it.
                    logger.warn(e.getMessage());
                }
            }
        } finally {
            closeResultSet(columnResultSet);
        }
    }
}

