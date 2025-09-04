package com.datablau.datasources.trino;

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

import com.google.common.base.Strings;
import org.springframework.util.CollectionUtils;

/**
 * 未经过测试，
 * @author nicky - 数语科技有限公司
 * date 2023/5/5 11:15
 */
public class TrinoDatasource extends DatasourceJdbcBase {

    public TrinoDatasource() {
        super("TRINO");
    }

    public String getDriverTypeName() {
        return "trino";
    }

    public UUID getUniqueId() {
        return UUID.fromString("BED50B98-F703-4DC0-B51A-E43C3A96E3FA");
    }

    public void testConnection() throws ConnectionEstablishException {
        try (Connection c = getConnection();
             ResultSet rs = c.getMetaData().getCatalogs()) {

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

        if (db != null) {
            return String.format("jdbc:trino://%s:%s/%s?SSL=true&SSLVerification=NONE",  host, port, db);
        } else {
            return String.format("jdbc:trino://%s:%s/?SSL=true&SSLVerification=NONE", host, port);
        }
    }

    @Override
    public List<String> getDatabases() {
        List<String> dblist = new ArrayList();
        try (ResultSet rs = this.getConnection().getMetaData().getCatalogs()) {
            while (rs.next()) {
                dblist.add(rs.getString(1));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return dblist;
    }

    @Override
    public List<String> getSchemas() {
        List<String> res = new ArrayList<>();

        String db = getProperties().getParameter(DatasourceKnownParameterType.DatabaseName.toString());

        if (Strings.isNullOrEmpty(db)) {
            try (ResultSet rs = this.getConnection().getMetaData().getSchemas()) {
                while (rs.next()) {
                    res.add(rs.getString("TABLE_SCHEM"));
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        } else {
            try (ResultSet rs = this.getConnection().getMetaData().getSchemas(db, null)) {
                while (rs.next()) {
                    res.add(rs.getString("TABLE_SCHEM"));
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }

        return res;
    }
}
