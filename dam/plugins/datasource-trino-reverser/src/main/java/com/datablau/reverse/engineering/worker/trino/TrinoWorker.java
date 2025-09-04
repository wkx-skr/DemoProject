package com.datablau.reverse.engineering.worker.trino;

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

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * @program: datablau-datasource-plugins
 * @description: 未经过测试，
 * @author: wang tong
 * @create: 2023-08-01 18:22
 **/
public class TrinoWorker extends ReverseForwardStrategyJdbc implements JdbcPlugin {

    private static final Logger logger = LoggerFactory.getLogger(TrinoWorker.class);

    @Override
    public String getType() {
        return "TRINO";
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
        logger.debug("try to get trino view sql");

        for (ReversedTable reversedTable : oSchema.getAllTables()) {
            if (!reversedTable.isView()) {
                continue;
            }
            try (Statement stmt = jdbcDatasource.getConnection().createStatement()) {
                String query = String.format("show create table \"%s\".\"%s\".\"%s\"", catalog, schema, reversedTable.getName());
                logger.debug(query);
                try (ResultSet results = stmt.executeQuery(query)) {
                    while (results.next()) {
                        String viewSql = results.getString(1);
                        if (!Strings.isNullOrEmpty(viewSql)) {
                            reversedTable.getTableX().setProperty(LDMTypes.pSQL, viewSql);
                        }
                        processSave();
                    }
                }
            } catch (Exception e) {
                logger.error("Failed to get Trino view sql", e);
            }
        }

    }

    private String getColumnDataType(ResultSet rsColumnsDt) throws SQLException {
        return rsColumnsDt.getString("TYPE_NAME");
    }

    @Override
    protected void readColumns(ModelX model, String catalog, String schema, ResultSet columnResultSet) throws Exception {
        logger.debug("loading columns of schema [" + schema + "]");

        ReversedSchema reversedSchema = schemaMap
                .get(Strings.isNullOrEmpty(schema) ? catalog : schema);

        try (ResultSet rsColumnsDt = jdbcDatasource.getConnection().getMetaData().getColumns(catalog, schema, null, null)) {
            while (rsColumnsDt.next()) {
                String tableName = rsColumnsDt.getString("TABLE_NAME");
                ReversedTable table = reversedSchema.lookForTable(tableName);
                if (table == null)
                    continue;

                String columnName = rsColumnsDt.getString("COLUMN_NAME");
                table.addColumnType(columnName, getColumnDataType(rsColumnsDt));
            }
            processSave();
            super.readColumns(model, catalog, schema, columnResultSet);
        } catch (Exception e) {
            logger.error("Failed to get columns", e);
        }
    }

    @Override
    protected void buildProcedures(ModelX model, String catalog) {
        // todo procedures
    }

    @Override
    protected void buildFunctions(ModelX model, String catalog) {
        //not support function
    }

}
