package com.datablau.reverse.engineering.worker.informix;

import com.datablau.reverse.engineering.api.JdbcPlugin;
import com.datablau.reverse.engineering.worker.ReverseForwardStrategyJdbc;
import com.google.common.base.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * @program: datablau-datasource-plugins
 * @description: InformixWorker
 * @author: wang tong
 * @create: 2023-08-11 10:24
 **/
public class InformixWorker extends ReverseForwardStrategyJdbc implements JdbcPlugin {

    private static final Logger logger = LoggerFactory.getLogger(InformixWorker.class);

    Set<String> supportDataType = new HashSet<>(Arrays.asList("CHAR", "VARCHAR", "DECIMAL", "LVARCHAR", "MONEY", "NVARCHAR"));

    @Override
    public String getType() {
        return "INFORMIX";
    }


    @Override
    public String getViewSqlOfView(String catalog, String schema, String viewName) {
        try {
            logger.debug("try to get Informix view sql");
            try (Statement stmt = jdbcDatasource.getConnection().createStatement()) {
                String query = "select v.viewtext as view_definition from sysviews v "
                        + " inner join systables t on v.tabid = t.tabid "
                        + " where t.tabname = '%s' and owner = '%s'";
                query = String.format(query, viewName, schema);
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
            logger.error("Failed to get Informix database variables", e);
        }
        return null;
    }

    @Override
    public String getSpSqlOfSp(String catalog, String schema, String spName) {
        logger.debug("try to get Informix sp sql");
        try {
            try (Statement stmt = jdbcDatasource.getConnection().createStatement()) {
                String query = "select data as pro_definition from sysprocedures pro "
                        + " inner join sysprocbody  pro_body on pro.procid = pro_body.procid "
                        + " where pro.procname = '%s' and owner = '%s' and pro_body.datakey = 'T'";
                query = String.format(query, spName, schema);
                logger.debug(query);
                try (ResultSet results = stmt.executeQuery(query)) {
                    while (results.next()) {
                        String sql = results.getString("pro_definition");

                        processSave();
                        return sql;
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Failed to get Informix sp sql", e);
        }
        return null;
    }

    @Override
    public String getFunctionSqlOfSp(String catalog, String schema, String functionName) {
        logger.debug("try to get Informix sp sql");
        try {
            try (Statement stmt = jdbcDatasource.getConnection().createStatement()) {
                String query = "select data as pro_definition from sysprocedures pro "
                        + " inner join sysprocbody  pro_body on pro.procid = pro_body.procid "
                        + " where pro.procname = '%s' and owner = '%s' and pro_body.datakey = 'T'";
                query = String.format(query, functionName, schema);
                logger.debug(query);
                try (ResultSet results = stmt.executeQuery(query)) {
                    while (results.next()) {
                        String sql = results.getString("pro_definition");

                        processSave();
                        return sql;
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Failed to get Informix sp sql", e);
        }
        return null;
    }

    @Override
    public String generateFullDataType(ResultSet columnResultSet, String columnDataType, Integer scale ,Integer precision) {
        String colDataType = columnDataType;
        if (supportDataType.contains(columnDataType.toUpperCase()) && scale > 0) {
            colDataType += "(" + scale;
            if (precision > 0 && precision < scale) {
                colDataType += "," + precision;
            }
            colDataType += ")";
        }
        return colDataType;
    }
}
