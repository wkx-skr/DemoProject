package com.datablau.datasources.informix;

import com.andorj.model.common.search.QueryPage;
import com.andorj.model.common.search.Sort;
import com.datablau.datasource.builtin.datasource.DatasourceJdbcBase;
import com.datablau.datasource.data.DatasourceKnownParameterType;
import com.datablau.datasource.exception.ConnectionEstablishException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.CollectionUtils;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * @program: datablau-datasource-plugins
 * @description: informix
 * @author: wang tong
 * @create: 2023-05-10 14:06
 **/
public class InformixDatasource extends DatasourceJdbcBase {

    private static final Logger logger = LoggerFactory.getLogger(InformixDatasource.class);
    public InformixDatasource() {
        super("INFORMIX");
    }

    @Override
    public String getDriverTypeName() {
        return "Informix";
    }

    @Override
    public String getTableSampleSql(String schema, String table, QueryPage page, boolean countSql) {
        String baseSql = " FROM " + schema + "." + table;
        if (countSql) {
            return " SELECT COUNT(*) " + baseSql;
        }


        if (page == null) {
            return " SELECT  FIRST  200  * " + baseSql;
        } else {
            Integer pageSize = page.getPageSize();
            Integer currentPage = page.getCurrentPage();

            if (!CollectionUtils.isEmpty(page.getSortBy())) {
                List<String> sortStrs = new ArrayList<>();
                for (Sort sort : page.getSortBy()) {
                    sortStrs.add(sort.getField() + " " +
                            sort.getOrder() == null ? "" : sort.getOrder().name());
                }

                baseSql = baseSql + " ORDER BY " + String.join(",", sortStrs);
            }

            return "SELECT SKIP  " + ((currentPage - 1) * pageSize) + " FIRST " + pageSize + " * " + baseSql;
        }
    }

    @Override
    public UUID getUniqueId() {
        return UUID.fromString("778D29FB-4D87-4816-B3D1-A19F935C8EEF");
    }

    @Override
    public void testConnection() throws ConnectionEstablishException {
        try (Connection c = getConnection()) {
            if (!c.isValid(1000)) {
                throw new ConnectionEstablishException("Unable to call isValid function on the connection");
            }
        } catch (Exception ex) {
            throw new ConnectionEstablishException("Unable to create the connection", ex);
        }
    }

    @Override
    public String quoteName(String name) {
        return name;
    }

    @Override
    public String getUrl() {
        String host = getProperties().getParameter(DatasourceKnownParameterType.HostServer.toString());
        String port = getProperties().getParameter(DatasourceKnownParameterType.PortNumber.toString());
        String db = getProperties().getParameter(DatasourceKnownParameterType.DatabaseName.toString());
        String serverInstance = getProperties().getParameter(DatasourceKnownParameterType.InstanceName.toString());

        return String.format("jdbc:informix-sqli://%s:%s/%s:INFORMIXSERVER=%s", host, port, db, serverInstance);
    }

    @Override
    public List<String> getDatabases() {
        List<String> dblist = new ArrayList<>();
        String sql = "SELECT name from system.databases where name <> 'system'";
        try (Statement statement = getConnection().createStatement();
             ResultSet rs = statement.executeQuery(sql)
        ) {
            while (rs.next()) {
                dblist.add(rs.getString(1));
            }

        } catch (SQLException e) {
           logger.error("Informix getDatabases failed",e);
        }
        return dblist;
    }
}
