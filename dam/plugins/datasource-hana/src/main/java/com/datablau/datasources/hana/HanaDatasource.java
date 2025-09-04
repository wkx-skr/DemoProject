package com.datablau.datasources.hana;

import com.andorj.model.common.search.QueryPage;
import com.andorj.model.common.search.Sort;
import com.datablau.datasource.builtin.datasource.DatasourceJdbcBase;
import com.datablau.datasource.data.DatasourceKnownParameterType;
import com.datablau.datasource.exception.ConnectionEstablishException;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.CollectionUtils;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2023/5/9 16:44
 */
public class HanaDatasource extends DatasourceJdbcBase {

    private static final Logger LOGGER = LoggerFactory.getLogger(HanaDatasource.class);

    public HanaDatasource() {
        super("HANA");
    }

    @Override
    public String getDriverTypeName() {
        return "hana";
    }

    @Override
    public UUID getUniqueId() {
        return UUID.fromString("F3901084-5B9A-4776-86E9-FDEE6F7F87B7");
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
    public String getUrl() {
        String host = super.getProperties().getParameter(DatasourceKnownParameterType.HostServer.toString());
        String port = super.getProperties().getParameter(DatasourceKnownParameterType.PortNumber.toString());
        String db = super.getProperties().getParameter(DatasourceKnownParameterType.DatabaseName.toString());

        String url = null;

        if (db == null) {
            url = String.format("jdbc:sap://%s:%s", host, port);
        }else{
            url = String.format("jdbc:sap://%s:%s/?databaseName=", host, port, db);
        }
        return url;
    }

    @Override
    public List<String> getDatabases() {
        List<String> dbList = new ArrayList<>();
        ResultSet rs = null;
        try {
            DatabaseMetaData dmd = getConnection().getMetaData();

            rs = dmd.getCatalogs();
            while (rs.next()) {
                dbList.add(rs.getString("TABLE_CAT"));
            }

            if (dbList.isEmpty()) {
                rs = dmd.getSchemas();
                while (rs.next()) {
                    dbList.add(rs.getString(1));
                }
            }
        } catch (SQLException e) {
            LOGGER.warn("get databases failed cause by:" + e.getMessage(), e);
        } finally {
            try {
                if (rs != null) {
                    rs.close();
                }
            } catch (Exception e) {
            }
        }

        return dbList;
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

    public String quoteName(String name) {
        return  name ;
    }
}
