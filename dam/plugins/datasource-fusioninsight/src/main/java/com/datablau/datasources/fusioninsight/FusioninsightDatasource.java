package com.datablau.datasources.fusioninsight;

import com.andorj.model.common.search.QueryPage;
import com.andorj.model.common.search.Sort;
import com.datablau.datasource.builtin.datasource.DatasourceJdbcBase;
import com.datablau.datasource.exception.ConnectionEstablishException;
import java.sql.Connection;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.util.CollectionUtils;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2023/5/10 9:38
 */
public class FusioninsightDatasource extends DatasourceJdbcBase {

    public FusioninsightDatasource() {
        super("FUSIONINSIGHT");
    }

    @Override
    public String getDriverTypeName() {
        return "fusionInsight";
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
    public UUID getUniqueId() {
        return UUID.fromString("AE04DB82-2EC5-4653-BAAE-09CF8358A0C7");
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
