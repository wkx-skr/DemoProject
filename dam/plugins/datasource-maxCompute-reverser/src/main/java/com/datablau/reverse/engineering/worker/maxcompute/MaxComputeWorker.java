package com.datablau.reverse.engineering.worker.maxcompute;

import com.andorj.common.core.exception.AndorjRuntimeException;
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

/**
 * @program: datablau-datasource-plugins
 * @description: MaxComputeWorker
 * @author: wang tong
 * @create: 2023-08-18 17:42
 **/
public class MaxComputeWorker extends ReverseForwardStrategyJdbc implements JdbcPlugin {

    private static final Logger logger = LoggerFactory.getLogger(MaxComputeWorker.class);


    @Override
    public String getType() {
        return "MAXCOMPUTE";
    }


    @Override
    protected void readFKs(ModelX model, String database, String schema) throws Exception {
        // not supported yet
    }

    @Override
    protected void readPKs(ModelX model, String database, String schema) throws Exception {
        // not supported yet
    }

    @Override
    protected void readIndexes(ModelX model, String database, String schema) throws Exception {
        // not supported yet
    }

    @Override
    protected void readColumns(ModelX model, String catalog, String schema, ResultSet ignore) throws Exception {
        logger.info("loading columns of schema [" + schema + "]");
        ResultSet rs = null;
        try {
            int totalHandledColumns = 0;
            ReversedSchema reversedSchema = schemaMap
                    .get(Strings.isNullOrEmpty(schema) ? catalog : schema);

            for (ReversedTable reversedTable : reversedSchema.getAllTables()) {
                rs = getDatabaseMetadata().getColumns(catalog, schema, reversedTable.getName(), "%");

                logger.info("loading columns of table [" + reversedTable.getName() + "]");

                while (rs.next()) {
                    String tableName = rs.getString("TABLE_NAME");

                    ReversedTable table = reversedSchema.lookForTable(tableName);
                    if (table == null) {
                        continue;
                    }

                    String columnName = rs.getString("COLUMN_NAME");
                    logger.info("loading columns  [" + columnName + "]");
                    ObjectX columnX = createColumn(model, table);
                    // System.out.println(columnName + " ; " + rsColumns.getInt("DATA_TYPE"));
                    columnX.setName(columnName);

                    try {
                        String colDataType = rs.getString("TYPE_NAME").toUpperCase();
                        if (colDataType.startsWith("ARRAY<") || colDataType.startsWith("MAP<")
                                || colDataType.startsWith("STRUCT<") || colDataType
                                .startsWith("UNIONTYPE<")) {
                            extractComplexName(columnX, colDataType);
                        }

                        int scale = rs.getInt("COLUMN_SIZE");
                        int precision = rs.getInt("DECIMAL_DIGITS");

                        String dataTypeString = generateFullDataType(rs, colDataType, scale, precision);

                        columnX.setProperty(LDMTypes.pDataType, dataTypeString);

                        String columnDefinition = rs.getString("REMARKS");
                        if (columnDefinition != null && columnDefinition.length() > 0) {
                            setCommentToObject(columnX, columnDefinition);
                        }

                        columnX.setProperty(LDMTypes.pDefaultValue, rs.getString("COLUMN_DEF"));
                        columnX.setProperty(LDMTypes.pIsNotNull,
                                !getBoolean(rs.getString("IS_NULLABLE")));

                        int ordinalPosition = rs.getInt("ORDINAL_POSITION"); // 表中列的索引（从1开始）
                        columnX.setProperty(LDMTypes.pOrdinal, ordinalPosition);
                        columnX.setObjectIsFullyCreated();

                        totalHandledColumns++;
                        if (totalHandledColumns % 1000 == 0) {
                            processSave();
                            logger.info("total loaded " + totalHandledColumns + " columns");
                        }
                    } catch (Exception e) {
                        // Just catch it.
                        logger.warn(e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Failed to get columns", e);
        } finally {
            closeResultSet(rs);
            closeResultSet(ignore);
        }
    }

    @Override
    protected void buildFunctions(ModelX model, String catalog) {
        ClassLoader currentClassLoader = Thread.currentThread().getContextClassLoader();
        try {
            ClassLoader connClassLoader = getDatabaseMetadata().getConnection().getClass().getClassLoader();
            Thread.currentThread().setContextClassLoader(connClassLoader);
            super.buildFunctions(model, catalog);
        } catch (Throwable e) {
            throw new AndorjRuntimeException(e.getMessage(), e);
        } finally {
            Thread.currentThread().setContextClassLoader(currentClassLoader);
        }
    }

    @Override
    protected void buildProcedures(ModelX model, String catalog) {
        ClassLoader currentClassLoader = Thread.currentThread().getContextClassLoader();
        try {
            ClassLoader connClassLoader = getDatabaseMetadata().getConnection().getClass().getClassLoader();
            Thread.currentThread().setContextClassLoader(connClassLoader);
            super.buildProcedures(model, catalog);
        } catch (Throwable e) {
            throw new AndorjRuntimeException(e.getMessage(), e);
        } finally {
            Thread.currentThread().setContextClassLoader(currentClassLoader);
        }
    }

    @Override
    protected void buildColumnsAndIndices(ModelX model, String database) {
        ClassLoader currentClassLoader = Thread.currentThread().getContextClassLoader();
        try {
            ClassLoader connClassLoader = getDatabaseMetadata().getConnection().getClass().getClassLoader();
            Thread.currentThread().setContextClassLoader(connClassLoader);
            super.buildColumnsAndIndices(model, database);
        } catch (Throwable e) {
            throw new AndorjRuntimeException(e.getMessage(), e);
        } finally {
            Thread.currentThread().setContextClassLoader(currentClassLoader);
        }
    }

    @Override
    protected void buildViews(ModelX model, String database) {
        ClassLoader currentClassLoader = Thread.currentThread().getContextClassLoader();
        try {
            ClassLoader connClassLoader = getDatabaseMetadata().getConnection().getClass().getClassLoader();
            Thread.currentThread().setContextClassLoader(connClassLoader);
            super.buildViews(model, database);
        } catch (Throwable e) {
            throw new AndorjRuntimeException(e.getMessage(), e);
        } finally {
            Thread.currentThread().setContextClassLoader(currentClassLoader);
        }
    }

    @Override
    protected void buildTables(ModelX model, String database) {
        ClassLoader currentClassLoader = Thread.currentThread().getContextClassLoader();
        try {
            ClassLoader connClassLoader = getDatabaseMetadata().getConnection().getClass().getClassLoader();
            Thread.currentThread().setContextClassLoader(connClassLoader);
            super.buildTables(model, database);
        } catch (Throwable e) {
            throw new AndorjRuntimeException(e.getMessage(), e);
        } finally {
            Thread.currentThread().setContextClassLoader(currentClassLoader);
        }
    }

    @Override
    public void buildProceduresOfSchema(ModelX model, String catalog, String schema) throws Exception {
        ClassLoader currentClassLoader = Thread.currentThread().getContextClassLoader();
        try {
            ClassLoader connClassLoader = getDatabaseMetadata().getConnection().getClass().getClassLoader();
            Thread.currentThread().setContextClassLoader(connClassLoader);
            super.buildProceduresOfSchema(model, catalog, schema);
        } catch (Throwable e) {
            throw new AndorjRuntimeException(e.getMessage(), e);
        } finally {
            Thread.currentThread().setContextClassLoader(currentClassLoader);
        }
    }

    @Override
    public void buildFunctionsOfSchema(ModelX model, String catalog, String schema) throws Exception {
        ClassLoader currentClassLoader = Thread.currentThread().getContextClassLoader();
        try {
            ClassLoader connClassLoader = getDatabaseMetadata().getConnection().getClass().getClassLoader();
            Thread.currentThread().setContextClassLoader(connClassLoader);
            super.buildFunctionsOfSchema(model, catalog, schema);
        } catch (Throwable e) {
            throw new AndorjRuntimeException(e.getMessage(), e);
        } finally {
            Thread.currentThread().setContextClassLoader(currentClassLoader);
        }
    }

    @Override
    protected void buildViewsOfSchema(ModelX model, String catalog, String schema) throws Exception {
        ClassLoader currentClassLoader = Thread.currentThread().getContextClassLoader();
        try {
            ClassLoader connClassLoader = getDatabaseMetadata().getConnection().getClass().getClassLoader();
            Thread.currentThread().setContextClassLoader(connClassLoader);
            super.buildViewsOfSchema(model, catalog, schema);
        } catch (Throwable e) {
            throw new AndorjRuntimeException(e.getMessage(), e);
        } finally {
            Thread.currentThread().setContextClassLoader(currentClassLoader);
        }
    }

    @Override
    protected void buildTablesOfSchema(ModelX model, String catalog, String schema) throws Exception {
        ClassLoader currentClassLoader = Thread.currentThread().getContextClassLoader();
        try {
            ClassLoader connClassLoader = getDatabaseMetadata().getConnection().getClass().getClassLoader();
            Thread.currentThread().setContextClassLoader(connClassLoader);
            super.buildTablesOfSchema(model, catalog, schema);
        } catch (Throwable e) {
            throw new AndorjRuntimeException(e.getMessage(), e);
        } finally {
            Thread.currentThread().setContextClassLoader(currentClassLoader);
        }
    }

    @Override
    protected void buildForeignKeys(ModelX model, String catalog) {
        ClassLoader currentClassLoader = Thread.currentThread().getContextClassLoader();
        try {
            ClassLoader connClassLoader = getDatabaseMetadata().getConnection().getClass().getClassLoader();
            Thread.currentThread().setContextClassLoader(connClassLoader);
            super.buildForeignKeys(model, catalog);
        } catch (Throwable e) {
            throw new AndorjRuntimeException(e.getMessage(), e);
        } finally {
            Thread.currentThread().setContextClassLoader(currentClassLoader);
        }
    }

    @Override
    protected void readFunctions(ModelX model, String catalog, String schema,
                                 ResultSet functionResultSet) throws Exception {
        try {
            while (functionResultSet.next()) {
                checkStopSign();

                String schemaName = functionResultSet.getString("FUNCTION_SCHEM");
                if (Strings.isNullOrEmpty(schemaName) && !Strings.isNullOrEmpty(catalog)) {
                    schemaName = catalog;
                }

                String functionName = functionResultSet.getString("FUNCTION_NAME");
                if (options.isInBlackList(functionName, LDMTypes.oFunction)) {
                    logger.debug("Function '" + functionName + "' is in the black list");
                    continue;
                }

                logger.debug("loading sp " + schemaName + "/" + functionName);

                ObjectX funcObjX = createFunction(model);
                funcObjX.setName(functionName);

                ReversedSchema oSchema = getOrCreateSchema(model, schemaName);
                if (oSchema != null) {
                    setSchemaInfoToObject(oSchema, funcObjX);
                }

                Object tableDefinition = functionResultSet.getObject("REMARKS");
                if (tableDefinition != null) {
                    setCommentToObject(funcObjX, tableDefinition.toString());
                }

                String sql = getFunctionSqlOfSp(catalog, schemaName, functionName);
                if (!Strings.isNullOrEmpty(sql)) {
                    funcObjX.setProperty(LDMTypes.pSQL, sql);
                }

                funcObjX.setObjectIsFullyCreated();
            }

        } finally {
            closeResultSet(functionResultSet);
        }
    }
}
