package com.datablau.datasources.hologres;

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
 * @description: Hologres  similar to   Postgres
 * @author: wang tong
 * @create: 2023-05-09 15:02
 **/
public class HologresDatasource extends DatasourceJdbcBase {

    private static final Logger logger = LoggerFactory.getLogger(HologresDatasource.class);


    public HologresDatasource() {
        super("HOLOGRES");
    }

    @Override
    public String getDriverTypeName() {
        return "Hologres";
    }

    @Override
    public String getTableSampleSql(String schema, String table, QueryPage page, boolean countSql) {
        String baseSql = " FROM " + schema + "." + table;
        if (countSql) {
            return " SELECT COUNT(*) " + baseSql;
        }

        baseSql = " SELECT * " + baseSql;

        if (page == null) {
            return baseSql;
        } else {
            int pageSize = page.getPageSize();
            int currentPage = page.getCurrentPage();

            if (!CollectionUtils.isEmpty(page.getSortBy())) {
                List<String> sortStrs = new ArrayList<>();
                for (Sort sort : page.getSortBy()) {
                    sortStrs.add(sort.getField() + " " +
                            sort.getOrder() == null ? "" : sort.getOrder().name());
                }

                baseSql = baseSql + " ORDER BY " + String.join(",", sortStrs);
            }

            return baseSql + " LIMIT " + pageSize + " OFFSET " + ((currentPage - 1) * pageSize);
        }
    }

    @Override
    public UUID getUniqueId() {
        return UUID.fromString("db5b1268-2df5-422e-af42-48e8473209a5");
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
    public String getUrl() {
        String host = getProperties().getParameter(DatasourceKnownParameterType.HostServer.toString());
        String port = getProperties().getParameter(DatasourceKnownParameterType.PortNumber.toString());
        String db = getProperties().getParameter(DatasourceKnownParameterType.DatabaseName.toString());

        String url;

        if (db != null)
            url = String.format("jdbc:postgresql://%s:%s/%s", host, port, db);
        else
            url = String.format("jdbc:postgresql://%s:%s/postgres", host, port);

        logger.info("the url is: " + url);

        return url;
    }

    @Override
    public String quoteName(String name) {
        return name;
    }

    @Override
    public List<String> getDatabases() {
        List<String> dblist = new ArrayList<>();
        String sql = "SELECT datname FROM pg_catalog.pg_database where datistemplate = false";
        try (Statement stmt = this.getConnection().createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                dblist.add(rs.getString("datname"));
            }

        } catch (SQLException e) {
            logger.error("hologres getDatabases failed: ",e);
        }
        return dblist;
    }
}
