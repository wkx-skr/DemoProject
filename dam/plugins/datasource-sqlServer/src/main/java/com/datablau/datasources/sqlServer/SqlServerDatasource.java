package com.datablau.datasources.sqlServer;

import com.andorj.model.common.search.QueryPage;
import com.andorj.model.common.search.Sort;
import com.datablau.datasource.builtin.datasource.DatasourceJdbcBase;
import com.datablau.datasource.data.DatasourceKnownParameterType;
import com.datablau.datasource.exception.ConnectionEstablishException;

import com.google.common.base.Strings;
import java.sql.Connection;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.util.CollectionUtils;

/**
 * @author nicky - 数语科技有限公司
 * date 2023/5/5 11:15
 */
public class SqlServerDatasource extends DatasourceJdbcBase {

    public SqlServerDatasource() {
        super("SQLSERVER");
    }

    public String getDriverTypeName() {
        return "sqlserver";
    }

    public UUID getUniqueId() {
        return UUID.fromString("998E48F9-FFEC-4473-A7A0-754C055C0953");
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

    /**
     * sqlServer分页查询需要用到排序字段，较复杂，采样数据只取前几条就可以，所以这里用top，不分页
     */
    @Override
    public String getTableSampleSql(String schema, String table, QueryPage page, boolean countSql) {
        String baseSql = " FROM " + quoteName(schema) + "." + quoteName(table);
        if (countSql) {
            return " SELECT COUNT(*) " + baseSql;
        }
        if (page == null) {
            return " SELECT * " + baseSql;
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

            return " SELECT TOP " + pageSize + " * " + baseSql;
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

        String instanceName = getProperties().getParameter(DatasourceKnownParameterType.InstanceName.toString());
        if (!Strings.isNullOrEmpty(instanceName) && !Strings.isNullOrEmpty(db)) {
            return String.format("jdbc:sqlserver://%s:%s;instanceName=%s;databaseName=%s", host, port, instanceName, db);
        } else if (!Strings.isNullOrEmpty(db)) {
            return String.format("jdbc:sqlserver://%s:%s;databaseName=%s", host, port, db);
        } else {
            return String.format("jdbc:sqlserver://%s:%s", host, port);
        }
    }
}
