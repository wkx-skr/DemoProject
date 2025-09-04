package com.datablau.datasources.vertica;

import com.andorj.model.common.search.QueryPage;
import com.andorj.model.common.search.Sort;
import com.datablau.datasource.builtin.datasource.DatasourceJdbcBase;
import com.datablau.datasource.data.DatasourceKnownParameterType;
import com.datablau.datasource.exception.ConnectionEstablishException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.CollectionUtils;

/**
 * @author nicky - 数语科技有限公司
 * date 2023/5/5 11:15
 */
public class VerticaDatasource extends DatasourceJdbcBase {
    private static final Logger LOGGER = LoggerFactory.getLogger(VerticaDatasource.class);

    public VerticaDatasource() {
        super("VERTICA");
    }

    public String getDriverTypeName() {
        return "vertica";
    }

    public UUID getUniqueId() {
        return UUID.fromString("097618F2-3A1D-4D4F-A31C-E138217A486A");
    }

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
    public String getTableSampleSql(String schema, String table, QueryPage page, boolean countSql) {
        String baseSql = " FROM " + quoteName(schema) + "." + quoteName(table);
        if (countSql) {
            return " SELECT COUNT(*) " + baseSql;
        }

        baseSql =  " SELECT * " + baseSql;

        if (page == null) {
            return baseSql;
        } else {
            int pageSize = page.getPageSize();
            int currentPage = page.getCurrentPage();

            if (!CollectionUtils.isEmpty(page.getSortBy())) {
                List<String> sortStrs = new ArrayList<>();
                for (Sort sort : page.getSortBy()) {
                    sortStrs.add(quoteName(sort.getField()) + " " +
                            sort.getOrder() == null ? "" : sort.getOrder().name());
                }

                baseSql = baseSql + " ORDER BY " + String.join(",", sortStrs);
            }

            return baseSql + " LIMIT " + pageSize + " OFFSET " + ((currentPage - 1) * pageSize);
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

        if (db != null) {
            return String.format("jdbc:%s://%s:%s/%s", getDriverTypeName(), host, port, db);
        } else {
            return String.format("jdbc:%s://%s:%s/", getDriverTypeName(), host, port);
        }

    }

    @Override
    public List<String> getDatabases() {
        List<String> dbList = new ArrayList<>();
        String sql = "select database_name from v_catalog.databases";

        try (Statement statement = getConnection().createStatement();
             ResultSet rs = statement.executeQuery(sql)) {
            while (rs.next()) {
                dbList.add(rs.getString(1));
            }

        } catch (SQLException e) {
            LOGGER.warn("get databases failed cause by:" + e.getMessage(), e);
        }
        return dbList;
    }
}
