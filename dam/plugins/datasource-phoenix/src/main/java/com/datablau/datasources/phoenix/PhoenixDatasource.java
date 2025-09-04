package com.datablau.datasources.phoenix;

import com.andorj.model.common.search.QueryPage;
import com.andorj.model.common.search.Sort;
import com.datablau.datasource.builtin.datasource.DatasourceJdbcBase;
import com.datablau.datasource.data.DatasourceKnownParameterType;
import com.datablau.datasource.exception.ConnectionEstablishException;

import java.sql.Connection;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.util.CollectionUtils;

/**
 * @author nicky - 数语科技有限公司
 * date 2023/5/5 11:15
 */
public class PhoenixDatasource extends DatasourceJdbcBase {

    public PhoenixDatasource() {
        super("PHOENIX");
    }

    public String getDriverTypeName() {
        return "phoenix";
    }

    public UUID getUniqueId() {
        return UUID.fromString("574C6EA7-09DE-4099-9F37-AADBC6C90158");
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
        String url = getProperties().getParameter(DatasourceKnownParameterType.FullUrl.toString());
        return url;
    }
}
