package com.datablau.datasources.tidb;

import com.andorj.model.common.search.QueryPage;
import com.andorj.model.common.search.Sort;
import com.datablau.datasource.builtin.datasource.DatasourceJdbcBase;
import com.datablau.datasource.data.DatasourceKnownParameterType;
import com.datablau.datasource.exception.ConnectionEstablishException;

import java.sql.Connection;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.springframework.util.CollectionUtils;

/**
 * @author nicky - 数语科技有限公司
 * date 2023/5/5 11:15
 */
public class TidbDatasource extends DatasourceJdbcBase {

    public TidbDatasource() {
        super("TIDB");
    }

    public String getDriverTypeName() {
        return "mysql";
    }

    public UUID getUniqueId() {
        return UUID.fromString("E8025268-E159-4E65-9E79-E79B475AF286");
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
                Arrays.asList("information_schema", "performance_schema", "mysql", "INFORMATION_SCHEMA", "PERFORMANCE_SCHEMA", "MYSQL"));
        res.removeAll(reserved);
        return res;
    }

}
