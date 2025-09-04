package com.datablau.reverse.engineering.worker.iceberg;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.core.model.ObjectX;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.reverse.engineering.api.JdbcPlugin;
import com.datablau.reverse.engineering.data.ReversedSchema;
import com.datablau.reverse.engineering.data.ReversedTable;
import com.datablau.reverse.engineering.worker.hive.HiveWorker;
import com.google.common.base.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.CollectionUtils;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;


public class IcebergOnHiveSparkWorker extends HiveWorker implements JdbcPlugin {

    private static final Logger logger = LoggerFactory.getLogger(IcebergOnHiveSparkWorker.class);

    @Override
    public String getType() {
        return "ICEBERGONHIVESPARK";
    }

// todo 如果jdbc查询元数据的字段报错，可以用下面的 bug:42048 元数据采集的时候无法采集拥有iceberg表结构的数据源

//    @Override
//    protected void readTables(ModelX model, String catalog, String schema, List<ResultSet> tableResultSets) throws Exception {
//        try {
//            for (ResultSet rs : tableResultSets) {
//                try {
//                    checkStopSign();
//                    while (rs.next()) {
//                        if (!isTable(rs)) {
//                            continue;
//                        }
//
//                        String tableSchema = rs.getString("TABLE_SCHEM");
//                        if (Strings.isNullOrEmpty(tableSchema) && !Strings.isNullOrEmpty(catalog)) {
//                            tableSchema = catalog;
//                        }
//
//                        String tableName = rs.getString("TABLE_NAME");
//                        if (options.isInBlackList(tableName, LDMTypes.oEntity)
//                                || checkTableExistence(
//                                tableSchema, tableName)) {
//                            logger.debug(
//                                    "table '" + tableName + "' is in the black list or already exists");
//                            continue;
//                        }
//
//                        if (ignoreTheTable(catalog, tableSchema, tableName)) {
//                            continue;
//                        }
//
//                        String tableType = rs.getString("TABLE_TYPE");
//                        if (!"TABLE".equals(tableType)) {
//                            logger.info(
//                                    " \'" + tableName + "\' is not type of TABLE but " + tableType);
//                            continue;
//                        }
//
//                        ObjectX tableX = createTable(model);
//                        if (tableX == null) {
//                            logger.error("unable to create tableX");
//                            continue;
//                        }
//
//                        tableX.setName(tableName);
//
//                        ReversedSchema oSchema = getOrCreateSchema(model, tableSchema);
//                        setSchemaInfoToObject(oSchema, tableX);
//
//                        String tableDefinition = rs.getString("REMARKS");
//                        if (tableDefinition != null && tableDefinition.length() > 0) {
//                            setCommentToObject(tableX, tableDefinition);
//                        }
//
//                        String tableKey = getNormalizedTableName(catalog, schema, tableName);
//                        if (tableCommentMap.containsKey(tableKey)) {
//                            setCommentToObject(tableX, tableCommentMap.get(tableKey));
//                        }
//
//                        ReversedTable table = oSchema.addTable(tableX);
//                        processSave();
//
//                        if (options.needToPersis()) {
//                            table.getTableX().setObjectIsFullyCreated();
//                            table.clearObjectX();
//                        }
//
//                        readColumns(model, table);
//                    }
//                } finally {
//                    closeResultSet(rs);
//                }
//            }
//
//            logger.info("fetching table metadata of schema \'" + schema + "\' is done");
//        } finally {
//            makeSureResultSetIsClosed(tableResultSets);
//        }
//    }
//
//    @Override
//    protected void readViews(ModelX model, String catalog, String schema, List<ResultSet> viewResultSets) throws Exception {
//        List<ReversedTable> viewXs = new ArrayList<>();
//        ReversedSchema oSchema = null;
//
//        try {
//            for (ResultSet viewResultSet : viewResultSets) {
//                try {
//                    checkStopSign();
//                    while (viewResultSet.next()) {
//                        if (!isView(viewResultSet)) {
//                            continue;
//                        }
//
//                        String viewSchema = viewResultSet.getString("TABLE_SCHEM");
//                        if (Strings.isNullOrEmpty(viewSchema) && !Strings.isNullOrEmpty(catalog)) {
//                            viewSchema = catalog;
//                        }
//                        String viewName = viewResultSet.getString("TABLE_NAME");
//                        if (options.isInBlackList(viewName, LDMTypes.oView) || checkTableExistence(
//                                viewSchema, viewName)) {
//                            logger.debug(
//                                    "view '" + viewName + "' is in the black list or already REed");
//                            continue;
//                        }
//
//                        if (ignoreTheView(catalog, viewSchema, viewName)) {
//                            continue;
//                        }
//
//                        logger.debug("loading view " + viewSchema + "/" + viewName);
//
//                        oSchema = getOrCreateSchema(model, viewSchema);
//                        ObjectX viewX = createView(model);
//                        viewX.setName(viewName);
//                        setSchemaInfoToObject(oSchema, viewX);
//
//                        String viewDefinition = viewResultSet.getString("REMARKS");
//                        if (!Strings.isNullOrEmpty(viewDefinition)) {
//                            setCommentToObject(viewX, viewDefinition);
//                        }
//
//                        String viewKey = getNormalizedTableName(catalog, schema, viewName);
//                        if (tableCommentMap.containsKey(viewKey)) {
//                            setCommentToObject(viewX, tableCommentMap.get(viewKey));
//                        }
//
//                        String sql = getViewSqlOfView(catalog, schema, viewName);
//                        if (!Strings.isNullOrEmpty(sql)) {
//                            viewX.setProperty(LDMTypes.pSQL, sql);
//                        }
//
//                        ReversedTable reversedView = oSchema.addTable(viewX);
//                        viewXs.add(reversedView);
//
//                        readColumns(model, reversedView);
//                    }
//
//                } finally {
//                    closeResultSet(viewResultSet);
//                }
//            }
//
//            if (oSchema != null) {
//                readEntireViewSQL(catalog, schema, oSchema, getViewSqlOfSchema(catalog, schema));
//            }
//
//            if (options.needToPersis()) {
//                for (ReversedTable view : viewXs) {
//                    if (view.getTableX() != null) {
//                        view.getTableX().setObjectIsFullyCreated();
//                        view.clearObjectX();
//                    }
//                }
//            }
//
//        } finally {
//            makeSureResultSetIsClosed(viewResultSets);
//        }
//    }
//
//    @Override
//    protected void buildColumnsAndIndices(ModelX model, String database) {
//        //do nothing
//        logger.info("buildColumnsAndIndices ignore...");
//    }
//
//
//    private void readColumns(ModelX model, ReversedTable table) throws Exception {
//        if (table == null) {
//            return;
//        }
//        int totalHandledColumns = 0;
//        Connection connection = this.jdbcDatasource.getConnection();
//
//        String sql;
//        if (Strings.isNullOrEmpty(table.getSchema())) {
//            sql = String.format("DESCRIBE FORMATTED %s", table.getName());
//        } else {
//            sql = String.format("DESCRIBE FORMATTED %s.%s", table.getSchema(), table.getName());
//        }
//
//        logger.info("execute : " + sql);
//
//        try (Statement statement = connection.createStatement();
//             ResultSet resultSet = statement.executeQuery(sql)) {
//
//            boolean columnRange = false;
//
//            int ordinal = 1;
//            while (resultSet.next()) {
//                String columnName = resultSet.getString("col_name");
//                if (Strings.isNullOrEmpty(columnName)) {
//                    continue;
//                }
//                if (columnName.startsWith("# col_name")) {
//                    columnRange = true;
//                    continue;
//                }
//                if (columnName.startsWith("# ") && columnRange) {
//                    columnRange = false;
//                }
//                if (!columnRange) {
//                    continue;
//                }
//
//                ObjectX columnX = createColumn(model, table);
//                columnX.setName(columnName);
//
//                try {
//                    columnX.setProperty(LDMTypes.pIsAutoIncrement, false);
//                } catch (Exception ex) {
//                    // some db does't have AI.
//                }
//
//                String typeName = resultSet.getString("data_type");
//                if (!Strings.isNullOrEmpty(typeName)) {
//                    String colDataType = typeName.toUpperCase();
//                    if (colDataType.startsWith("ARRAY<") || colDataType.startsWith("MAP<")
//                            || colDataType.startsWith("STRUCT<") || colDataType
//                            .startsWith("UNIONTYPE<")) {
//                        extractComplexName(columnX, colDataType);
//                    }
//
////                    String dataTypeString = generateFullDataType(columnResultSet, colDataType,
////                            scale, precision);
//                    String dataTypeString = colDataType;
//
//                    String dataType = table.getColumnType(columnName, dataTypeString);
//                    columnX.setProperty(LDMTypes.pDataType, dataType);
//                }
//
//                String columnDefinition = resultSet.getString("comment");
//                if (Strings.isNullOrEmpty(columnDefinition)) {
//                    columnDefinition = table.getColumnComment(columnName);
//                }
//                setCommentToColumns(table, columnX, columnDefinition);
//
//                columnX.setProperty(LDMTypes.pOrdinal, ordinal++);
//
//                //columnX.setProperty(LDMTypes.pIsAutoIncrement,false);
//                columnX.setObjectIsFullyCreated();
//
//                totalHandledColumns++;
//                if (totalHandledColumns % 1000 == 0) {
//                    processSave();
//                    logger.debug("total loaded " + totalHandledColumns + " columns");
//                }
//            }
//        } catch (Exception e) {
//            // Just catch it.
//            logger.warn(e.getMessage());
//        }
//    }

}
