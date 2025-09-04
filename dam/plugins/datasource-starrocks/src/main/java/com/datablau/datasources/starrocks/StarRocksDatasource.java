package com.datablau.datasources.starrocks;

import com.andorj.model.common.search.QueryPage;
import com.andorj.model.common.search.Sort;
import com.datablau.datasource.builtin.datasource.DatasourceJdbcBase;
import com.datablau.datasource.data.DatasourceKnownParameterType;
import com.datablau.datasource.exception.ConnectionEstablishException;
import org.springframework.util.CollectionUtils;

import java.sql.Connection;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * @program: datablau-datasource-plugins
 * @description: starrocks
 * @author: wang tong
 * @create: 2024-07-09 13:27
 **/
public class StarRocksDatasource extends DatasourceJdbcBase {

    public StarRocksDatasource() {
        super("STARROCKS");
    }

    public String getDriverTypeName() {
        return "starrocks";
    }

    public UUID getUniqueId() {
        return UUID.fromString("07AEF3BA-0FD4-493E-A7F5-EF61D0B0065D");
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
    public String quoteName(String name) {
        return "`" + name + "`";
    }

    @Override
    public String getUrl() {
        String host = getProperties().getParameter(DatasourceKnownParameterType.HostServer.toString());
        String port = getProperties().getParameter(DatasourceKnownParameterType.PortNumber.toString());
        String db = getProperties().getParameter(DatasourceKnownParameterType.DatabaseName.toString());
        String timeZone = getProperties().getParameterMap().getOrDefault(DatasourceKnownParameterType.TimeZone.name(), "&serverTimezone=CST");
        if (db == null) {
            db = "information_schema";
        }else {
            db = db.trim().split(";")[0];
        }
        String bitSet = "?useUnicode=true&characterEncoding=UTF-8&tinyInt1isBit=false&verifyServerCertificate=false&useSSL=true&getProceduresReturnsFunctions=false" + timeZone;
        String url = String
                .format("jdbc:%s://%s:%s/%s%s", "mysql", host, port, db, bitSet);
        return url;
    }

    @Override
    public List<String> getDatabases() {
        List<String> res = super.getDatabases();
        Collection<String> reserved = new ArrayList<String>(
                Arrays.asList("information_schema", "performance_schema", "mysql"));
        res.removeAll(reserved);
        return res;
    }
}
