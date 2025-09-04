package com.datablau.datasources.kingbase;

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
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.util.CollectionUtils;

/**
 * @author nicky - 数语科技有限公司
 * date 2023/5/5 11:15
 */
public class KingBaseDatasource extends DatasourceJdbcBase {

    public KingBaseDatasource() {
        super("KINGBASE");
    }

    public String getDriverTypeName() {
        return "kingbase";
    }

    public UUID getUniqueId() {
        return UUID.fromString("3A9CB2EF-2886-0A53-450F-5343C74AF788");
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
        String baseSql = " FROM " + specialQuote(schema) + "." + specialQuote(table);
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
                    sortStrs.add(specialQuote(sort.getField()) + " " +
                        sort.getOrder() == null ? "" : sort.getOrder().name());
                }

                baseSql = baseSql + " ORDER BY " + String.join(",", sortStrs);
            }

            return baseSql + " LIMIT " + pageSize + " OFFSET " + ((currentPage - 1) * pageSize);
        }
    }

    public String specialQuote(String name) {
        return "\"" + name + "\"";
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

        if (db != null && !db.isEmpty()) {
            return String.format("jdbc:kingbase8://%s:%s/%s",  host, port, db);
        } else {
            return String.format("jdbc:kingbase8://%s:%s/kingbase", host, port);
        }
    }

    @Override
    public List<String> getDatabases() {
        List<String> dblist = new ArrayList();
        String sql = "SELECT datname FROM pg_catalog.pg_database where datistemplate = false";
        try (Statement stmt = this.getConnection().createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                dblist.add(rs.getString("datname"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return dblist;
    }

    @Override
    public List<String> getSchemas() {
        Collection<String> reserved = new ArrayList<String>(
                Arrays.asList("information_schema", "pg_catalog"));
        List<String> res = super.getSchemas();
        res.removeAll(reserved);
        return res;
    }
}
