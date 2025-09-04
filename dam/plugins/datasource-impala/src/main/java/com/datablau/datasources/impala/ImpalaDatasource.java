package com.datablau.datasources.impala;

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
 * @description: Impala
 * @author: wang tong
 * @create: 2023-05-10 10:28
 **/
public class ImpalaDatasource extends DatasourceJdbcBase {

    private static final Logger logger = LoggerFactory.getLogger(ImpalaDatasource.class);

    public ImpalaDatasource() {
        super("IMPALA");
    }

    @Override
    public String getDriverTypeName() {
        return "Impala";
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
        return UUID.fromString("CAB99A80-BD07-4D09-9583-3B3496A2CB99");
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

        String url = String.format("jdbc:impala://%s:%s/%s", host, port, db);

        try {
            int authenticationType = Integer.parseInt(
                    getProperties().getParameter(DatasourceKnownParameterType.AuthenticationType.toString()));
            if (authenticationType == 1) {
                String sp = getProperties().getParameter(
                        DatasourceKnownParameterType.ServicePrincipal.toString());
                int idx = sp.indexOf('@');
                if (idx > 0) {
                    sp = sp.substring(0, idx);
                }
                String krbSn = sp.substring(0, sp.indexOf('/'));
                String fqdn = sp.substring(sp.indexOf('/') + 1);
                url += ";AuthMech=1;KrbHostFQDN=" + fqdn + ";KrbServiceName=" + krbSn;
            }
        } catch (Exception ignored) {
        }

        return url;
    }

    @Override
    public String quoteName(String name) {
        return name;
    }

    @Override
    public List<String> getDatabases() {
        List<String> dblist = new ArrayList<>();
        String sql = "show databases";
        try (Statement stmt = getConnection().createStatement();
             ResultSet rs = stmt.executeQuery(sql))
        {
            while (rs.next()) {
                String db = rs.getString(1);
                if (!db.equals("_impala_builtins"))
                    dblist.add(db);
            }
        } catch (SQLException e) {
           logger.error("Impala getDatabase failed", e);
        }
        return dblist;
    }


    /**
     *
     * http://192.168.1.15/webdoc/view/Pub4028818f7d78dd5b017e9ad82a980592.html
     * */
    @Override
    protected void setContextForKerberos() {
        System.setProperty("javax.security.auth.useSubjectCredsOnly", "false");
        logger.info(" set Impala Kerberos Context: " + System.getProperty("javax.security.auth.useSubjectCredsOnly"));
    }
}
