package com.datablau.datasources.maxCompute;

import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.core.exception.UnexpectedStateException;
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
import java.util.List;
import java.util.UUID;
import org.springframework.util.CollectionUtils;

/**
 * @author nicky - 数语科技有限公司
 * date 2023/5/5 11:15
 */
public class MaxComputeDatasource extends DatasourceJdbcBase {

    public MaxComputeDatasource() {
        super("MAXCOMPUTE");
    }

    public String getDriverTypeName() {
        return "odps";
    }

    public UUID getUniqueId() {
        return UUID.fromString("BF8AD2B8-4B7F-480A-B3FE-7E1A15DD7817");
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
        return  name ;
    }

    @Override
    public String getUrl() {
        String host = getProperties().getParameter(DatasourceKnownParameterType.HostServer.toString());
        String db = getProperties().getParameter(DatasourceKnownParameterType.DatabaseName.toString());
        String bitSet = "&charset=UTF-8";
        String url = String.format("jdbc:%s:%s?project=%s%s", "odps", host, db, bitSet);
        return url;
    }


    @Override
    public List<String> getDatabases() {
        List<String> dblist = new ArrayList<>();
        ResultSet rs = null;
        try {
            DatabaseMetaData dmd = getConnection().getMetaData();

            ClassLoader currentClassLoader = Thread.currentThread().getContextClassLoader();
            try {
                ClassLoader connClassLoader = dmd.getClass().getClassLoader();
                Thread.currentThread().setContextClassLoader(connClassLoader);
                rs = dmd.getCatalogs();
            } catch (Throwable e) {
                throw new AndorjRuntimeException(e.getMessage(), e);
            } finally {
                Thread.currentThread().setContextClassLoader(currentClassLoader);
            }

            while (rs.next()) {
                dblist.add(rs.getString("TABLE_CAT"));
            }

        } catch (SQLException e) {
            throw new UnexpectedStateException("Unable to get databases:" + e.getMessage(), e);
        } finally {
            try {
                if (rs != null) {
                    rs.close();
                }
            } catch (Exception e) {
            }

            close();
        }
        return dblist;
    }
}
