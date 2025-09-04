package com.datablau.reverse.engineering.worker.cirrodata;

import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.core.model.ObjectX;
import com.datablau.reverse.engineering.api.JdbcPlugin;
import com.datablau.reverse.engineering.worker.ReverseForwardStrategyJdbc;
import com.google.common.base.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * @program: datablau-datasource-plugins
 * @description: CirroDataWorker
 * @author: wang tong
 * @create: 2023-08-25 10:08
 **/
public class CirroDataWorker extends ReverseForwardStrategyJdbc implements JdbcPlugin {

    private static final Logger logger = LoggerFactory.getLogger(CirroDataWorker.class);

    @Override
    public String getType() {
        return "CIRRODATA";
    }


    @Override
    protected void buildViewsOfSchema(ModelX model, String catalog, String schema) throws Exception {
        // don‘t have view
    }

    @Override
    public ResultSet getColumnsOfSchema(String catalog, String schema) {
        logger.debug("try to get column of schema \"" + schema + "\n");
        try {
            Statement stmt = jdbcDatasource.getConnection().createStatement();
            String query =
                    "select table_cat         as TABLE_CAT,\n" +
                            "       schema_name       as TABLE_SCHEM,\n" +
                            "       table_name        as TABLE_NAME,\n" +
                            "       column_name       as COLUMN_NAME,\n" +
                            "       jdbc_data_type    as DATA_TYPE,\n" +
                            "       data_type         as TYPE_NAME,\n" +
                            "       data_size         as COLUMN_SIZE,\n" +
                            "       buffer_length     as BUFFER_LENGTH,\n" +
                            "       decimal_digits    as DECIMAL_DIGITS,\n" +
                            "       num_prec_radix    as NUM_PREC_RADIX,\n" +
                            "       nullable          as NULLABLE,\n" +
                            "       column_comment    as REMARKS,\n" +
                            "       column_def        as COLUMN_DEF,\n" +
                            "       sql_data_type     as SQL_DATA_TYPE,\n" +
                            "       sql_datetime_sub  as SQL_DATETIME_SUB,\n" +
                            "       char_octet_length as CHAR_OCTET_LENGTH,\n" +
                            "       ordinal_position  as ORDINAL_POSITION,\n" +
                            "       is_nullable       as IS_NULLABLE,\n" +
                            "       scope_catlog      as SCOPE_CATLOG,\n" +
                            "       scope_schema      as SCOPE_SCHEMA,\n" +
                            "       scope_table       as SCOPE_TABLE,\n" +
                            "       source_data_type  as SOURCE_DATA_TYPE,\n" +
                            "       is_autoincrement  as IS_AUTOINCREMENT\n" +
                            "from v$user_tab_columns\n" +
                            "where schema_name = '%s' ";
            query = String.format(query, schema);
            return stmt.executeQuery(query);

        } catch (Exception ex) {
            logger.error("Failed to get column of schema " + schema, ex);
        }
        return null;
    }

    @Override
    public ResultSet getTablesOfSchema(String catalog, String schema, String tableNamePattern) {
        try {
            return getDatabaseMetadata().getTables(catalog, schema, null,
                    new String[]{"TABLE"});
        } catch (SQLException e) {
            logger.error(e.getMessage(), e);
        }
        return null;
    }


    @Override
    protected void buildFunctions(ModelX model, String catalog) {
        logger.info("CirroData: Building Functions...");
        try {
            DatabaseMetaData dbmd = jdbcDatasource.getConnection().getMetaData();
            for (String s_schema : schemaPattern) {
                readFunctions(model, s_schema, catalog);
            }
            logger.info("Finished building Functions");
        } catch (Exception e) {
            logger.error("Failed to build Functions", e);
        }
    }

    private void readFunctions(ModelX modelX, String s_schema, String catalog) {
        try {
            logger.info("try to get CirroData functions");
            readCirroObjectSource(modelX, s_schema, catalog, LDMTypes.oFunction);
        } catch (Exception e) {
            logger.error("Failed to get CirroData fuctions SQL", e);
        }
    }

    @Override
    protected void buildProcedures(ModelX model, String catalog) {
        logger.info("CirroData Building Procedures...");
        try {
            for (String s_schema : schemaPattern) {
                readProcedures(model, s_schema, catalog);
            }
            logger.debug("Finished building Procedures");
        } catch (Exception e) {
            logger.error("Failed to build Procedures", e);
            throw e;
        }
    }

    private void readProcedures(ModelX modelX, String s_schema, String catalog) {
        try {
            logger.info("try to get CirroData Procedures");
            readCirroObjectSource(modelX, s_schema, catalog, LDMTypes.oStoredProcedure);
        } catch (Exception e) {
            logger.error("Failed to get CirroData Procedures SQL", e);
        }
    }

    private void readCirroObjectSource(ModelX modelX, String s_schema, String catalog, long typeId) throws Exception {
        try (Statement stmt = jdbcDatasource.getConnection().createStatement()) {

            String queryObj = "";
            if (typeId == LDMTypes.oStoredProcedure) {
                queryObj = "PROCEDURE";
            } else if (typeId == LDMTypes.oFunction) {
                queryObj = "FUNCTION";
            } else {
                return;
            }

            String query = "select * from v$user_source where TYPE='" + queryObj + "' "
                    + (s_schema.equals("%") ? "" : "and SCHEMA_NAME='" + s_schema + "' ")
                    + "ORDER BY SCHEMA_NAME ,NAME ,LINE";

            logger.info("CirroData:the query of retrieving  sp or function is:" + query);

            stmt.setFetchSize(2000);
            try (ResultSet results = stmt.executeQuery(query)) {
                ObjectX previousSp = null;
                String sqlSP = "";
                while (results.next()) {
                    String schema = results.getString("SCHEMA_NAME");
                    String name = results.getString("NAME");
                    if (options.isInBlackList(name, typeId)) {
                        logger.debug(queryObj + " '" + name + "' is in the black list");
                        continue;
                    }

                    int line = results.getInt("LINE");
                    String text = results.getString("TEXT");

                    if (line == 1) {

                        // set the sql of previous sp
                        if (previousSp != null && !Strings.isNullOrEmpty(sqlSP)) {
                            previousSp.setProperty(LDMTypes.pSQL, sqlSP);
                            previousSp.setObjectIsFullyCreated();
                        }

                        ObjectX newObj = (ObjectX) modelX.createObject(typeId, getNextId());

                        ObjectX oSchema = modelX.getSchema(schema);
                        if (oSchema != null) {
                            newObj.setProperty(LDMTypes.pSchemaRef, oSchema.getId());
                        }
                        newObj.setName(name);

                        previousSp = newObj;
                        sqlSP = text;
                        sqlSP += "\r\n";

                    } else {
                        if (!Strings.isNullOrEmpty(text)) {
                            sqlSP += text;
                            sqlSP += "\r\n";
                        }
                    }
                    processSave();
                }

                if (previousSp != null && !Strings.isNullOrEmpty(sqlSP)) {
                    previousSp.setProperty(LDMTypes.pSQL, sqlSP);
                    previousSp.setObjectIsFullyCreated();
                }
                processSave();
            }
        }
    }
}
