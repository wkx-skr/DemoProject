package com.datablau.reverse.engineering.worker.oceanbase;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.core.model.ModelX;
import com.datablau.reverse.engineering.api.JdbcPlugin;
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
 * @description: OceanBaseWorker
 * @author: wang tong
 * @create: 2023-08-04 11:33
 **/
public class OceanBaseWorker extends ReverseForwardStrategyJdbc implements JdbcPlugin {

    private static final Logger LOGGER = LoggerFactory.getLogger(OceanBaseWorker.class);
    private static final int FETCH_SIZE = 2000;

    @Override
    public String getType() {
        return "OCEANBASE";
    }

    /**
     * 获取 table comment SQL
     */
    public String getSQL(String catalog) {
        return String.format("SELECT table_name, table_comment " +
                "FROM information_schema.tables " +
                "WHERE table_schema = '%s' " +
                "ORDER BY table_name", catalog);
    }

    @Override
    public ResultSet getTableCommentOfSchema(String catalog, String schema) {
        try {
            Statement stmt = jdbcDatasource.getConnection().createStatement();
            String sql = this.getSQL(catalog);
            if (sql == null) {
                return null;
            }
            return stmt.executeQuery(sql);
        } catch (SQLException ex) {
            throw new UnexpectedStateException(
                    "Unable to get database table comment:" + ex.getMessage());
        }
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public ResultSet getColumnsOfSchema(String catalog, String schema) {
        String sql = " select  "
                + " column_name as `COLUMN_NAME`, "
                + " table_name as `TABLE_NAME`, "
                + " table_schema as `TABLE_SCHEM`, "
                + " column_type as `TYPE_NAME`,  "
                + " is_nullable as `IS_NULLABLE`,  "
                + " column_default as `COLUMN_DEF`, "
                + " column_comment as `REMARKS`, "
                + " ordinal_position as `ORDINAL_POSITION`, "
                + " 0 as `DECIMAL_DIGITS`, "
                + " 0 as `COLUMN_SIZE`, "
                + " case when extra = 'auto_increment' then 'YES' "
                + " else 'NO' end as `IS_AUTOINCREMENT` "
                + "from information_schema.`COLUMNS` "
                + "  where  "
                + " table_schema = ? ";

        Connection conn = jdbcDatasource.getConnection();

        try {
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, Strings.isNullOrEmpty(catalog) ? "%" : catalog);
            stmt.setFetchSize(FETCH_SIZE);

            return stmt.executeQuery();
        } catch (SQLException se) {
            LOGGER.error("failed to get columns of catalog " + catalog, se);
            throw new UnexpectedStateException("Failed to execute command to retrieve field SQL:" + se.getMessage(), se);
        }
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String wrapperCreateViewStatement(String viewName, String selectSql) {
        return "create view `" + viewName + "` as \r  " + selectSql;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String getSpSqlOfSp(String catalog, String schema, String spName) {
        String sql = "SHOW CREATE PROCEDURE `" + catalog + "`.`" + spName + "`";

        try (Statement stmt = jdbcDatasource.getConnection().createStatement()) {
            try (ResultSet rs = stmt.executeQuery(sql)) {
                while (rs.next()) {
                    String result = rs.getString("Create Procedure");
                    return result;
                }
                return null;
            }
        } catch (Exception se) {
            LOGGER.error("failed to get MySQL SP SQL", se);
            throw new UnexpectedStateException("Failed to execute SQL command to obtain Sp:" + se.getMessage(), se);
        }
    }

    /**
     * {@inheritDoc}
     */
    public ResultSet getProceduresOfSchema(String catalog, String schema) {
        String sql = "SELECT \n"
                + "  ROUTINE_CATALOG AS PROCEDURE_CAT,\n"
                + "  ROUTINE_SCHEMA AS PROCEDURE_SCHEM,\n"
                + "  ROUTINE_NAME AS PROCEDURE_NAME,\n"
                + "  ROUTINE_COMMENT AS REMARKS\n"
                + "  FROM information_schema.routines\n"
                + "  WHERE ROUTINE_SCHEMA = ? and ROUTINE_TYPE = 'PROCEDURE'";

        Connection conn = jdbcDatasource.getConnection();

        try {
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, Strings.isNullOrEmpty(catalog) ? "%" : catalog);
            stmt.setFetchSize(FETCH_SIZE);

            return stmt.executeQuery();
        } catch (SQLException se) {
            LOGGER.error("failed to get procedures of catalog " + catalog, se);
            throw new UnexpectedStateException("Failed to execute command to retrieve stored procedure list:" + se.getMessage(), se);
        }
    }

    /**
     * {@inheritDoc}
     */
    public ResultSet getFunctionsOfSchema(String catalog, String schema) {
        String sql = "SELECT "
                + "  ROUTINE_CATALOG AS FUNCTION_CAT,"
                + "  ROUTINE_SCHEMA AS FUNCTION_SCHEM,"
                + "  ROUTINE_NAME AS FUNCTION_NAME,"
                + "  ROUTINE_COMMENT AS REMARKS"
                + "  FROM information_schema.routines"
                + "  WHERE ROUTINE_SCHEMA = ? and ROUTINE_TYPE = 'FUNCTION'";

        Connection conn = jdbcDatasource.getConnection();

        try {
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, Strings.isNullOrEmpty(catalog) ? "%" : catalog);
            stmt.setFetchSize(FETCH_SIZE);

            return stmt.executeQuery();
        } catch (SQLException se) {
            LOGGER.error("failed to get procedures of catalog " + catalog, se);
            throw new UnexpectedStateException("Failed to execute command to retrieve stored procedure list:" + se.getMessage(), se);
        }
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String getFunctionSqlOfSp(String catalog, String schema, String functionName) {
        String sql = "SHOW CREATE FUNCTION `" + catalog + "`.`" + functionName + "`";

        try (Statement stmt = jdbcDatasource.getConnection().createStatement()) {
            try (ResultSet rs = stmt.executeQuery(sql)) {
                while (rs.next()) {
                    String result = rs.getString("Create Function");
                    return result;
                }
                return null;
            }
        } catch (Exception se) {
            LOGGER.error("failed to get MySQL FUNC SQL", se);
            throw new UnexpectedStateException("Failed to execute SQL command to obtain Function:" + se.getMessage(), se);
        }
    }


    /**
     * {@inheritDoc}
     */
    @Override
    public ResultSet getViewSqlOfSchema(String catalog, String schema) {
        Connection conn = jdbcDatasource.getConnection();

        String sql = " SELECT " +
                " t.table_catalog AS VIEW_CAT, " +
                " t.table_schema AS VIEW_SCHEM, " +
                " t.table_name AS VIEW_NAME, " +
                " t.view_definition AS VIEW_SQL " +
                " FROM information_schema.views t " +
                " WHERE t.table_schema = ? ";

        try {
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, Strings.isNullOrEmpty(catalog) ? "%" : catalog);

            stmt.setFetchSize(FETCH_SIZE);

            return stmt.executeQuery();
        } catch (SQLException se) {
            LOGGER.error("failed to get views of catalog " + catalog, se);
            throw new UnexpectedStateException("Failed to execute command to retrieve view SQL:" + se.getMessage(), se);
        }
    }

    /**
     * {@inheritDoc}
     */
//    @Override
//    public ResultSet getForeignKeysOfSchema(String catalog, String schema) {
//        Connection conn = jdbcDatasource.getConnection();
//
//        String sql = "SELECT " +
//            "    TABLE_NAME    as FKTABLE_NAME," +
//            "    COLUMN_NAME     as FKCOLUMN_NAME," +
//            "   CONSTRAINT_SCHEMA     as FKTABLE_SCHEM," +
//            "   ORDINAL_POSITION as KEY_SEQ,  " +
//            "   CONSTRAINT_NAME   as FK_NAME" +
//            "     FROM " +
//            "  INFORMATION_SCHEMA.KEY_COLUMN_USAGE " +
//            "     WHERE CONSTRAINT_SCHEMA = ? " +
//            " and referenced_column_name IS NOT NULL " +
//            "     ORDER BY fktable_schem, fktable_name, key_seq";
//
//        try {
//            PreparedStatement stmt = conn.prepareStatement(sql);
//            stmt.setString(1, Strings.isNullOrEmpty(catalog)  ? "%" : catalog);
//
//            stmt.setFetchSize(FETCH_SIZE);
//
//            return stmt.executeQuery();
//        } catch (SQLException se) {
//            LOGGER.error("failed to get FKs of catalog " + catalog, se);
//            throw new UnexpectedStateException("执行获取FK命令失败:" + se.getMessage(), se);
//        }
//    }

    /**
     * {@inheritDoc}
     */
    @Override
    public ResultSet getPrimaryKeysOfSchema(String catalog, String schema) {
        Connection conn = jdbcDatasource.getConnection();

        String sql = "select null as TABLE_CAT, pk.TABLE_SCHEMA as TABLE_SCHEM, "
                + " pk.TABLE_NAME, "
                + " pk.COLUMN_NAME, "
                + " pk.SEQ_IN_INDEX as KEY_SEQ, "
                + " pk.INDEX_NAME as PK_NAME " +
                "from `information_schema`.`statistics` pk " +
                "where (index_name = 'PRIMARY' or index_name = 'PRI') " +
                "and table_schema = ? " +
                "order by TABLE_NAME, KEY_SEQ";

        try {
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, Strings.isNullOrEmpty(catalog) ? "%" : catalog);
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

        String sql = "select null as TABLE_CAT, idx.TABLE_SCHEMA as TABLE_SCHEM, idx.TABLE_NAME, " +
                "CASE WHEN idx.NON_UNIQUE = 1 THEN true ELSE false END as NON_UNIQUE, " +
                "null as INDEX_QUALIFIER, idx.INDEX_NAME, 3 as TYPE, " +
                "idx.SEQ_IN_INDEX as ORDINAL_POSITION, idx.COLUMN_NAME, idx.COLLATION as ASC_OR_DESC, " +
                "idx.CARDINALITY, 0 as PAGES, null as FILTER_CONDITION " +
                "from `information_schema`.`statistics` idx  " +
                "where table_schema = ?  " +
                "order by TABLE_SCHEM, TABLE_NAME, INDEX_NAME, ORDINAL_POSITION";

        try {
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, catalog == null ? "%" : catalog);
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
        return generateDataType(columnDataType);
    }

    protected String generateDataType(String datatype) {

        String colDataType = datatype;

        if (datatype.equals("INT(10) UNSIGNED")
                || datatype.equals("TINYINT(3) UNSIGNED")
                || datatype.equals("SMALLINT(5) UNSIGNED")
                || datatype.equals("MEDIUMINT(8) UNSIGNED")
                || datatype.equals("INT(11)")
                || datatype.equals("TINYINT(4)")
                || datatype.equals("SMALLINT(6)")
                || datatype.equals("MEDIUMINT(9)")
                || datatype.startsWith("BIGINT(20)")
                || datatype.startsWith("BIT(1)")) {
            colDataType = colDataType.replaceAll("(\\([^\\)]+\\))", "");
        }

        return colDataType;
    }

    /**
     * tidb 不采集 函数和存储过程
     */

    @Override
    protected void buildProcedures(ModelX model, String catalog) {
    }

    @Override
    protected void buildFunctions(ModelX model, String catalog) {
    }
}
