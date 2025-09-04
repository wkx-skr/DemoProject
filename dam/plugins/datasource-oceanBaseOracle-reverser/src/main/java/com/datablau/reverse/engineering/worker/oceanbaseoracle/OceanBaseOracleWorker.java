package com.datablau.reverse.engineering.worker.oceanbaseoracle;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.core.model.ObjectX;
import com.datablau.reverse.engineering.api.JdbcPlugin;
import com.datablau.reverse.engineering.data.ReversedSchema;
import com.datablau.reverse.engineering.worker.ReverseForwardStrategyJdbc;
import com.google.common.base.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * @program: datablau-datasource-plugins
 * @description: OceanBaseOracleWorker
 * @author: wang tong
 * @create: 2023-08-28 17:02
 **/
public class OceanBaseOracleWorker extends ReverseForwardStrategyJdbc implements JdbcPlugin {

    private static final Logger LOGGER = LoggerFactory.getLogger(OceanBaseOracleWorker.class);
    private static final int FETCH_SIZE = 2000;


    @Override
    public String getType() {
        return "OCEANBASEO";
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


    private void readOracleObjectSource(ModelX modelX, String catalog, String schema, long typeId)
    throws Exception {
        try (Statement stmt = jdbcDatasource.getConnection().createStatement()) {

            String queryObj = "";
            if (typeId == LDMTypes.oStoredProcedure) {
                queryObj = "PROCEDURE";
            } else if (typeId == LDMTypes.oFunction) {
                queryObj = "FUNCTION";
            } else {
                return;
            }

            String query = "select * from "
                    + "all_source"
                    + " where TYPE='" + queryObj + "' " + (schema.equals("%") ? ""
                    : "and owner = '" + schema + "'")
                    + " order by owner, name, line";

            stmt.setFetchSize(FETCH_SIZE);
            try (ResultSet results = stmt.executeQuery(query)) {
                String previousSpName = null;
                String previousSchema = null;
                String sqlSP = "";
                while (results.next()) {
                    String currentSchema = results.getString("OWNER");
                    String name = results.getString("NAME");
                    if (options.isInBlackList(name, typeId)) {
                        LOGGER.debug(queryObj + " '" + name + "' is in the black list");
                        continue;
                    }
                    int line = results.getInt("LINE");
                    String text = results.getString("TEXT");

                    if (line == 1) {

                        // set the sql of previous sp
                        if (previousSpName != null && !Strings.isNullOrEmpty(sqlSP)) {
                            String spCreate = "create or replace " + sqlSP;

                            ObjectX newObj = createObject(modelX, typeId);
                            ReversedSchema reversedSchema = getOrCreateSchema(modelX, previousSchema);
                            setSchemaInfoToObject(reversedSchema, newObj);
                            newObj.setName(previousSpName);
                            newObj.setProperty(LDMTypes.pSQL, spCreate);
                            newObj.setObjectIsFullyCreated();
                        }

                        previousSpName = name;
                        previousSchema = currentSchema;
                        sqlSP = text;

                    } else {
                        if (!Strings.isNullOrEmpty(text)) {
                            sqlSP += text;
                        }
                    }
                }

                if (previousSpName != null && !Strings.isNullOrEmpty(sqlSP)) {
                    String spCreate = "create or replace " + sqlSP;
                    ObjectX newObj = createObject(modelX, typeId);

                    ReversedSchema reversedSchema = getOrCreateSchema(modelX, previousSchema);
                    setSchemaInfoToObject(reversedSchema, newObj);
                    newObj.setName(previousSpName);
                    newObj.setProperty(LDMTypes.pSQL, spCreate);
                    newObj.setObjectIsFullyCreated();
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
                " FROM ALL_VIEWS \n" +
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
                " FROM ALL_COL_COMMENTS \n" +
                " WHERE OWNER = :1 ";

        try {
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, schema == null ? "%" : schema);
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
                "       fc.column_name as FKCOLUMN_NAME," +
                "       fc.position as key_seq," +
                "       f.owner as FKTABLE_SCHEM," +
                "       p.constraint_name as PK_NAME," +
                "       f.constraint_name as FK_NAME" +
                "     FROM " +
                "all_cons_columns pc, all_constraints p, all_cons_columns fc, all_constraints f" +
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
                "all_cons_columns c, all_constraints k " +
                "  WHERE k.constraint_type = 'P'" +
                //"  AND k.table_name = :1" +
                "  AND k.owner like :1 escape '/'" +
                "  AND k.constraint_name = c.constraint_name " +
                "  AND k.table_name = c.table_name " +
                "  AND k.owner = c.owner " +
                "  ORDER BY table_name, key_seq\n";

        try {
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

    /**
     * {@inheritDoc}
     */
    @Override
    public ResultSet getIndexesOfSchema(String catalog, String schema) {
        Connection conn = jdbcDatasource.getConnection();

        String sql = "select " +
                "       i.table_name AS TABLE_NAME,\n" +
                "       decode (i.uniqueness, 'UNIQUE', 0, 1) AS NON_UNIQUE,\n" +
                "       i.index_name AS INDEX_NAME,\n" +
                "       c.column_name AS COLUMN_NAME,\n" +
                "       c.column_position as ordinal_position,\n" +
                "       null AS ASC_OR_DESC \n" +
                "from " +
                "all_indexes i, all_ind_columns c\n" +
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
            }
        }

        if (dt != null) {
            return dt;
        } else {
            return generateDataType(columnDataType, precision, scale);
        }
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


}
