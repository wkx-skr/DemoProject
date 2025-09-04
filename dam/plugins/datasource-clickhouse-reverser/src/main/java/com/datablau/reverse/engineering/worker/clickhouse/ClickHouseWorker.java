package com.datablau.reverse.engineering.worker.clickhouse;

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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.*;
import java.util.*;
import java.util.stream.Collectors;

/**
 * @program: datablau-datasource-plugins
 * @description: ClickHouseWorker
 * @author: wang tong
 * @create: 2023-08-07 17:30
 **/
public class ClickHouseWorker extends ReverseForwardStrategyJdbc implements JdbcPlugin {
    private static final Logger LOGGER = LoggerFactory.getLogger(ClickHouseWorker.class);

    private static final int FETCH_SIZE = 2000;

    @Override
    public String getType() {
        return "CLICKHOUSE";
    }

    public String getSQL(String schema) {
        return null;
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
    public ResultSet getTablesOfSchema(String catalog, String schema, String tableNamePattern) {
        try {
            return getDatabaseMetadata().getTables(catalog, catalog, "%",
                    new String[]{"TABLE"});
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public ResultSet getViewsOfSchema(String catalog, String schema, String tableNamePattern) {
        try {
            return getDatabaseMetadata().getTables(catalog, catalog, "%",
                    new String[]{"VIEW"});
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
    @Override
    public String generateFullDataType(ResultSet columnResultSet, String columnDataType, Integer precision, Integer scale) {
        if (columnDataType == null) {
            return null;
        }

        // 如果columnDataType已经包含了精度信息（即包含括号），则直接返回
        if (columnDataType.contains("(") && columnDataType.contains(")")) {
            return columnDataType;
        }

        StringBuilder dataType = new StringBuilder(columnDataType);

        // 当scale存在且大于0，或者precision存在且大于0时，需要添加精度信息
        if ((scale != null && scale > 0) || (precision != null && precision > 0)) {
            dataType.append("(");

            if (precision != null && precision > 0) {
                dataType.append(precision);

                if (scale != null && scale > 0) {
                    dataType.append(",").append(scale);
                }
            } else if (scale != null && scale > 0) {
                // 只有scale没有precision的情况
                dataType.append(scale);
            }

            dataType.append(")");
        }

        return dataType.toString();
    }



    @Override
    protected void processPrimaryKeyResultSet(ParallelizeReverseEngineerWorker parallelizeReverseEngineerWorker,
                                              ModelX model, ReversedSchema reversedSchema, ReversedTable reversedTable,
                                              String database, String schema) throws InterruptedException {
        parallelizeReverseEngineerWorker.submitJob((connection) -> {
            try {
                String pkName = "";
                ObjectX prePkObj = null;
                ObjectX curPkObj = null;
                Map<String, Integer> pkNameSeqMap = new HashMap<>();
                //List<String> pkmember = new ArrayList<String>();
                // getPrimaryKeys() is ordered by COLUMN_NAME !
                HashMap<Integer, String> pkMembers = new HashMap<>();
                LOGGER.info("loading pk of table [" + reversedTable.getName() + "]");
                try (Statement stmt = connection.createStatement()) {

                    // 1. 获取主键列（可能是多个，按逗号分隔）
                    String sql = "SELECT primary_key FROM system.tables WHERE database = '" + database + "' AND  name = '" + reversedTable.getName() + "'" ;
                    ResultSet rsPKs = stmt.executeQuery(sql);
                    String columnName = "";
                    while (rsPKs.next()) {
                        //columnName = rsPKs.getString("COLUMN_NAME");// column name
                        String pkName1 = rsPKs.getString("primary_key"); // PK name
                        //Integer seq = rsPKs.getInt("KEY_SEQ");// seq
                        // 2. 拆分主键列，并赋予顺序号（KEY_SEQ）
                        if (!pkName1.isEmpty()) {
                            String[] keyColumns = pkName1.split(",\\s*");
                            for (int i = 0; i < keyColumns.length; i++) {
                                columnName = keyColumns[i].trim();
                                int keySeq = i + 1; // JDBC 规范：从 1 开始
                                pkNameSeqMap.put(columnName, keySeq);
                                LOGGER.info("列名: " + columnName + ", KEY_SEQ: " + keySeq);
                            }
                        }
                        LOGGER.info("columnName  " + columnName + "pkName " + pkName1);

                        boolean isLastFinished = false;
                        if (pkName1.compareToIgnoreCase(pkName) != 0) {
                            curPkObj = createKeyGroup(model, reversedTable);
                            curPkObj.setName(pkName1);
                            curPkObj.setProperty(LDMTypes.pKeyGroupType, "PrimaryKey");
                            curPkObj.setProperty(LDMTypes.pIsUnique, true);
                            reversedTable.addKeyGroup(curPkObj);

                            reversedSchema.addIndexName(pkName1);
                            if (prePkObj != null) {
                                isLastFinished = true;
                            }

                            if (!isLastFinished) {
                                prePkObj = curPkObj;
                            }
                            pkName = pkName1;
                        }
                        if (isLastFinished) {
                            setIndexMembers(prePkObj,
                                    pkMembers.entrySet().stream().sorted(Map.Entry.comparingByKey())
                                            .map(mem -> mem.getValue()).collect(Collectors.toList()));
                        }
                        pkMembers.put(pkNameSeqMap.getOrDefault(columnName, 0), columnName);
                    }

                    setIndexMembers(curPkObj,
                            pkMembers.entrySet().stream().sorted(Map.Entry.comparingByKey())
                                    .map(mem -> mem.getValue()).collect(Collectors.toList()));
                }
            } catch (Throwable tw) {
                LOGGER.warn("unable to get pk of table:" + reversedTable.toString(), tw);
            }
        });
    }
    @Override
    public ResultSet getColumnsOfSchema(String catalog, String schema) {
        try {
            return getDatabaseMetadata().getColumns(catalog, catalog, "%",
                    "%");
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    protected void buildTablesOfSchema(ModelX model, String catalog, String schema) throws Exception {
        this.checkStopSign();
        LOGGER.info("reading table metadata of schema '" + schema + "' ...");
        readTablesNew(model, catalog, schema, fetchAllTables(catalog, schema), getTableUdp(catalog, schema));
    }

    protected void readTablesNew(ModelX model, String catalog, String schema, List<ResultSet> tableResultSets, Map<String, Map<String, String>> map) throws Exception {
        try {
            Iterator var5 = tableResultSets.iterator();

            label195:
            while(true) {
                if (var5.hasNext()) {
                    ResultSet rs = (ResultSet)var5.next();

                    try {
                        this.checkStopSign();

                        while(true) {
                            while(true) {
                                if (!rs.next()) {
                                    continue label195;
                                }

                                String tableSchema = rs.getString("TABLE_SCHEM");
                                if (Strings.isNullOrEmpty(tableSchema) && !Strings.isNullOrEmpty(catalog)) {
                                    tableSchema = catalog;
                                }

                                String tableName = rs.getString("TABLE_NAME");
                                if (!this.options.isInBlackList(tableName, 80000004L) && !this.checkTableExistence(tableSchema, tableName)) {
                                    if (!this.ignoreTheTable(catalog, tableSchema, tableName)) {
                                        String tableType = rs.getString("TABLE_TYPE");
                                        if (!"TABLE".equals(tableType)) {
                                            LOGGER.info(" '" + tableName + "' is not type of TABLE but " + tableType);
                                        } else {
                                            ObjectX tableX = this.createTable(model);
                                            if (tableX == null) {
                                                LOGGER.error("unable to create tableX");
                                            } else {
                                                tableX.setName(tableName);
                                                ReversedSchema oSchema = this.getOrCreateSchema(model, tableSchema);
                                                this.setSchemaInfoToObject(oSchema, tableX);
                                                String tableDefinition = rs.getString("REMARKS");
                                                if (tableDefinition != null && tableDefinition.length() > 0) {
                                                    this.setCommentToObject(tableX, tableDefinition);
                                                }

                                                String tableKey = this.getNormalizedTableName(catalog, schema, tableName);
                                                if (this.tableCommentMap.containsKey(tableKey)) {
                                                    this.setCommentToObject(tableX, (String)this.tableCommentMap.get(tableKey));
                                                }

                                                //处理扩展属性信息
                                                if (map.containsKey(tableName.toLowerCase())) {
                                                    //获取到的扩展属性Map
                                                    Map<String, String> udpMap = map.get(tableName.toLowerCase());
                                                    if (Objects.nonNull(udpMap) && !udpMap.isEmpty()) {
                                                        //表的创建时间
                                                        String createTime = udpMap.get("create_time");
                                                        if (!Strings.isNullOrEmpty(createTime)) {
                                                            tableX.setProperty(LDMTypes.pTarget, createTime);
                                                        }
                                                        //表的修改时间
                                                        String updateTime = udpMap.get("update_time");
                                                        if (!Strings.isNullOrEmpty(updateTime)) {
                                                            tableX.setProperty(LDMTypes.pInclusions, updateTime);
                                                        }
                                                        //表的存储大小
                                                        String storageSize = udpMap.get("storage_size");
                                                        if (!Strings.isNullOrEmpty(storageSize)) {
                                                            tableX.setProperty(LDMTypes.pExclusions, storageSize);
                                                        }
                                                        //表的数据量
                                                        String dataSize = udpMap.get("data_size");
                                                        if (!Strings.isNullOrEmpty(dataSize)) {
                                                            tableX.setProperty(LDMTypes.pArchyObjectName, dataSize);
                                                        }
                                                    }
                                                }

                                                ReversedTable table = oSchema.addTable(tableX);
                                                this.processSave();
                                                if (this.options.needToPersis()) {
                                                    table.getTableX().setObjectIsFullyCreated();
                                                    table.clearObjectX();
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    LOGGER.debug("table '" + tableName + "' is in the black list or already exists");
                                }
                            }
                        }
                    } finally {
                        this.closeResultSet(rs);
                    }
                }

                LOGGER.info("fetching table metadata of schema '" + schema + "' is done");
                return;
            }
        } finally {
            this.makeSureResultSetIsClosed(tableResultSets);
        }
    }

    //获取表的扩展属性
    protected Map<String, Map<String, String>> getTableUdp(String catalog, String schema) throws Exception {
        LOGGER.info("get tableUdp catalog:{}, schema:{}", catalog, schema);
        Map<String, Map<String, String>> map = new HashMap<>();
        String querySql = "select t.database as schema_table, t.name,t.update_time as create_time, " +
                "t.update_time, t.total_bytes as storage_size,t.total_rows as data_size from system.tables t where t.database = ? ";
        ResultSet resultSet = getResultSet(catalog, schema, querySql);
        LOGGER.info("get tableUdp data is null:{}", resultSet == null);
        //解析获取到的表扩展属性、封装到map中
        if (Objects.nonNull(resultSet)) {
            while (resultSet.next()) {
                Map<String, String> udpMap = new HashMap<>();
                String tableName = resultSet.getString("name");
                if (Objects.nonNull(tableName)) {
                    map.put(tableName.toLowerCase(), udpMap);
                    String createTime = resultSet.getString("create_time");
                    udpMap.put("create_time", createTime);
                    String updateTime = resultSet.getString("update_time");
                    udpMap.put("update_time", updateTime);
                    String storageSize = resultSet.getString("storage_size");
                    udpMap.put("storage_size", storageSize);
                    String dataSize = resultSet.getString("data_size");
                    udpMap.put("data_size", dataSize);
                }
            }
        }
        return map;
    }

    private ResultSet getResultSet(String catalog, String schema, String querySql) {
        PreparedStatement preparedStatement;
        Connection conn = jdbcDatasource.getConnection();
        try {
            preparedStatement = conn.prepareStatement(querySql);
            preparedStatement.setString(1, Objects.nonNull(schema)? schema : catalog);
            preparedStatement.setFetchSize(FETCH_SIZE);
            return preparedStatement.executeQuery();
        } catch (SQLException e) {
            LOGGER.error("get clickhouse data error:{}", e);
            throw new RuntimeException(e);
        }
    }
}
