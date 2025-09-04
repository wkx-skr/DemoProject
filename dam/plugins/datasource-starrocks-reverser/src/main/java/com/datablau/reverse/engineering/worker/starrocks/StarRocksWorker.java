package com.datablau.reverse.engineering.worker.starrocks;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.core.model.ObjectX;
import com.datablau.reverse.engineering.api.JdbcPlugin;
import com.datablau.reverse.engineering.data.ReversedSchema;
import com.datablau.reverse.engineering.data.ReversedTable;
import com.datablau.reverse.engineering.worker.ReverseForwardStrategyJdbc;
import com.datablau.reverse.engineering.worker.utility.ParallelizeReverseEngineerWorker;
import com.google.common.base.Strings;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @program: datablau-datasource-plugins
 * @description: starrocks  inherit from mysql
 * @author: wang tong
 * @create: 2024-07-09 13:37
 **/
public class StarRocksWorker extends ReverseForwardStrategyJdbc implements JdbcPlugin {

    private static final Logger LOGGER = LoggerFactory.getLogger(StarRocksWorker.class);
    private static final int FETCH_SIZE = 2000;
    private static String DESCRIBE = "DESCRIBE %s ALL";

    @Override
    public String getType() {
        return "STARROCKS";
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
    public ResultSet getColumnsOfTable(String catalog, String schema,String table) {
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
                + " table_schema = ?  and table_name = ? ";

        Connection conn = jdbcDatasource.getConnection();

        try {
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, Strings.isNullOrEmpty(catalog) ? "%" : catalog);
            stmt.setString(2, table);
            stmt.setFetchSize(FETCH_SIZE);

            return stmt.executeQuery();
        } catch (SQLException se) {
            LOGGER.error("failed to get columns of catalog " + catalog, se);
            throw new UnexpectedStateException("Failed to execute command to retrieve field SQL:" + se.getMessage(), se);
        }
    }

    @Override
    protected ResultSet fetchAllColumns(String database, String schema) throws SQLException {
        return null;
    }

    @Override
    protected void readColumns(ModelX model, String catalog, String schema,
                               ResultSet columnResultSet) throws Exception {
        LOGGER.info("starrocks  read columns ");
        ReversedSchema reversedSchema = schemaMap
                .get(Strings.isNullOrEmpty(schema) ? catalog : schema);
        if (reversedSchema == null) {
            return;
        }
        for (ReversedTable reversedTable : reversedSchema.getAllTables()) {
            LOGGER.info("starrocks  read table " + reversedTable.getName() + " columns ");
            readTableColumns(model, catalog, schema, reversedTable);
        }
    }

    protected void readTableColumns(ModelX model, String catalog, String schema,
                                    ReversedTable reversedTable) throws Exception {
        ResultSet columnResultSet = null;
        try {
            int totalHandledColumns = 0;

            Map<String, String> attributeMap = new HashMap<>();
            String describeSql = String.format("DESCRIBE %s  all", reversedTable.getSchema() + "." + reversedTable.getName());
            LOGGER.info("describeSql: " + describeSql);
            try (Statement stmt = this.jdbcDatasource.getConnection().createStatement();
                 ResultSet rs = stmt.executeQuery(describeSql)) {

                while (rs.next()) {
                    // 获取本表的DESCRIBE
                    String field = rs.getString("Field");
                    //String type = rs.getString("Type");
                    String is_nullable = rs.getString("Null");
                    attributeMap.put(field, is_nullable);
                }
            } catch (Exception e) {
                LOGGER.error("failed to get columns nullable of catalog " + catalog + " table " + reversedTable.getName(), e);
            }
            LOGGER.info("attributeMap :"  + attributeMap.toString());

            columnResultSet = this.getColumnsOfTable(catalog, schema, reversedTable.getName());
            while (columnResultSet.next()) {
                try {
                    String columnName = columnResultSet.getString("COLUMN_NAME");
                    ObjectX columnX = createColumn(model, reversedTable);
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

//                    String nullable = columnResultSet.getString("IS_NULLABLE");
//                    if (nullable != null) {
//                        columnX.setProperty(LDMTypes.pIsNotNull, !getBoolean(nullable));
//                    } else {
                        String isnull = attributeMap.get(columnName);
                        LOGGER.info(columnName + ":" + isnull);
                        if (isnull != null) {
                            columnX.setProperty(LDMTypes.pIsNotNull, !getBoolean(isnull.toUpperCase()));
//                        }
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

                        String dataType = reversedTable.getColumnType(columnName, dataTypeString);
                        columnX.setProperty(LDMTypes.pDataType, dataType);
                    }

                    String columnDefinition = columnResultSet.getString("REMARKS");
                    if (Strings.isNullOrEmpty(columnDefinition)) {
                        columnDefinition = reversedTable.getColumnComment(columnName);
                    }
                    setCommentToColumns(reversedTable, columnX, columnDefinition);

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
            LOGGER.error("failed to get StarRocks SP SQL", se);
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
            LOGGER.error("failed to get StarRocks FUNC SQL", se);
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


    @Override
    protected void processPrimaryKeyResultSet(
            ParallelizeReverseEngineerWorker parallelizeReverseEngineerWorker,
            ModelX model, ReversedSchema reversedSchema, ReversedTable reversedTable, String database,
            String schema) throws InterruptedException {

        String describeSql = String.format(DESCRIBE, database + "." + reversedTable.getName());

        parallelizeReverseEngineerWorker.submitJob((connection) -> {
            try {
                LOGGER.debug("loading pk of table [" + reversedTable.getName() + "]");
                try (ResultSet rsPKs = connection.createStatement().executeQuery(describeSql)) {


                    boolean isHavingPk = false;
                    //检索ResultSetMetadata对象
                    ResultSetMetaData rsMetaData = rsPKs.getMetaData();
                    //检索列名列表
                    int count = rsMetaData.getColumnCount();
                    for (int i = 1; i <= count; i++) {
                        String columnName = rsMetaData.getColumnName(i);
                        if (StringUtils.equalsIgnoreCase("IndexName", columnName)) {
                            isHavingPk = true;
                        }
                    }
                    if (!isHavingPk) {
                        return;
                    }

                    boolean first = true;
                    ObjectX keyGroup = null;
                    List<String> columnNameList = new ArrayList<>();

                    while (rsPKs.next()) {
                        // 获取本表的DESCRIBE
                        LOGGER.debug("pk is first : " + first);

                        String field = rsPKs.getString("Field");
                        Boolean key = rsPKs.getBoolean("Key");
                        LOGGER.debug("pk Field : " + field);
                        LOGGER.debug("pk key : " + key);
                        if (first) {
                            String indexName = rsPKs.getString("IndexName");
                            String indexKeysType = rsPKs.getString("IndexKeysType");
                            LOGGER.debug("indexName : " + indexName);
                            LOGGER.debug("indexKeysType : " + indexKeysType);
                            if (!Strings.isNullOrEmpty(indexKeysType)) {
                                keyGroup = createKeyGroup(model, reversedTable);
                                keyGroup.setName(indexName);
                                keyGroup.setProperty(LDMTypes.pKeyGroupType, "PrimaryKey");
                                keyGroup.setProperty(LDMTypes.pIsUnique, true);
                                reversedTable.addKeyGroup(keyGroup);

                                reversedSchema.addIndexName(indexName);
                                first = false;
                            } else {
                                return;
                            }
                        }
                        if (key) {
                            columnNameList.add(field);
                        }
                    }

                    setIndexMembers(keyGroup, columnNameList);
                }
            } catch (Throwable tw) {
                LOGGER.warn("unable to get pk of table:" + reversedTable.toString(), tw);
            }
        });
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
}
