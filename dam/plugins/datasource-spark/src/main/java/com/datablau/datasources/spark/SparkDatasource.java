package com.datablau.datasources.spark;

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
 * @description: spark
 * @author: wang tong
 * @create: 2023-05-09 14:08
 **/
public class SparkDatasource extends DatasourceJdbcBase {

    private static final Logger logger = LoggerFactory.getLogger(SparkDatasource.class);
    public SparkDatasource() {
        super("SPARK");
    }

    @Override
    public String getDriverTypeName() {
        return "SPARK";
    }

    @Override
    public String getTableSampleSql(String schema, String table, QueryPage page, boolean countSql) {
        String baseSql = " FROM " + schema + "." + table;
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
                    sortStrs.add(sort.getField() + " " +
                            sort.getOrder() == null ? "" : sort.getOrder().name());
                }

                baseSql = baseSql + " ORDER BY " + String.join(",", sortStrs);
            }

            return baseSql + " LIMIT " + ((currentPage - 1) * pageSize) + " , " + pageSize;
        }
    }

    @Override
    public UUID getUniqueId() {
        return UUID.fromString("D283F082-5296-41B6-BB39-57734DEDF517");
    }

    @Override
    public void testConnection() throws ConnectionEstablishException {
        try (Connection c = getConnection()) {
            if (c == null) {
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
        String db = getProperties().getParameter(DatasourceKnownParameterType.DatabaseName.toString()).trim().split(";")[0];

        String url = String.format("jdbc:hive2://%s:%s/%s", host, port, db);

        int authenticationType = Integer.parseInt(getProperties().getParameter(DatasourceKnownParameterType.AuthenticationType.toString()));
        if (authenticationType == 1) {
            String servicePrincipal = getProperties().getParameter(DatasourceKnownParameterType.ServicePrincipal.toString());
            url += ";principal=" + servicePrincipal;
        }
        logger.info("spark url:" + url);
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
        try (Statement stmt = this.getConnection().createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                dblist.add(rs.getString(1));
            }
        } catch (SQLException e) {
            logger.error("spark getDatabases failed", e);
        }
        return dblist;
    }

}
