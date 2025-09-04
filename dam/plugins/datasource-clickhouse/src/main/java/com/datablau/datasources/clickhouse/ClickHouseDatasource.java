package com.datablau.datasources.clickhouse;

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
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2023/5/9 16:44
 */
public class ClickHouseDatasource extends DatasourceJdbcBase {

    private static final Logger LOGGER = LoggerFactory.getLogger(ClickHouseDatasource.class);

    public ClickHouseDatasource() {
        super("CLICKHOUSE");
    }

    @Override
    public String getDriverTypeName() {
        return "clickhouse";
    }

    @Override
    public UUID getUniqueId() {
        return UUID.fromString("5053D067-62BB-f7AE-7971-F28AC8FDD44B");
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
            Integer pageSize = page.getPageSize();
            Integer currentPage = page.getCurrentPage();

            if (!CollectionUtils.isEmpty(page.getSortBy())) {
                List<String> sortStrs = new ArrayList<>();
                for (Sort sort : page.getSortBy()) {
                    sortStrs.add(quoteName(sort.getField()) + " " +
                        sort.getOrder() == null ? "" : sort.getOrder().name());
                }

                baseSql = baseSql + " ORDER BY " + String.join(",", sortStrs);
            }

            return baseSql + " LIMIT " + ((currentPage - 1) * pageSize) + " , " + pageSize;
        }
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
    public List<String> getDatabases() {
        List<String> dblist = new ArrayList();
        ResultSet rs = null;
        Statement statement = null;
        try {
            statement = getConnection().createStatement();
            String sql = "SELECT name from system.databases where name <> 'system'";
            rs = statement.executeQuery(sql);
            while (rs.next()) {
                dblist.add(rs.getString(1));
            }

        } catch (SQLException e) {
            LOGGER.warn("get databases failed cause by:" + e.getMessage(), e);
        } finally {
            try {
                if (rs != null) {
                    rs.close();
                }
                if(statement != null){
                    statement.close();
                }
            } catch (Exception e) {
                LOGGER.warn("close session failed cause by:" + e.getMessage(), e);
            }
        }
        return dblist;
    }

    public String quoteName(String name) {
        return  name ;
    }

    @Override
    public String getUrl() {
        String host =  getProperties().getParameter(DatasourceKnownParameterType.HostServer.toString());
        String port =  getProperties().getParameter(DatasourceKnownParameterType.PortNumber.toString());
        String db =  getProperties().getParameter(DatasourceKnownParameterType.DatabaseName.toString());

        return String.format("jdbc:clickhouse://%s:%s", host, port);
    }
}
