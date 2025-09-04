package com.datablau.datasources.gbase;

import com.andorj.model.common.search.QueryPage;
import com.andorj.model.common.search.Sort;
import com.datablau.datasource.builtin.datasource.DatasourceJdbcBase;
import com.datablau.datasource.data.DatasourceKnownParameterType;
import com.datablau.datasource.exception.ConnectionEstablishException;
import java.sql.Connection;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.CollectionUtils;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2023/5/9 16:44
 */
public class GBaseDatasource extends DatasourceJdbcBase {

    private static final Logger LOGGER = LoggerFactory.getLogger(GBaseDatasource.class);

    public GBaseDatasource() {
        super("GBASE");
    }

    @Override
    public String getDriverTypeName() {
        return "gbase";
    }

    @Override
    public UUID getUniqueId() {
        return UUID.fromString("AA8FBE2F-EC17-48B4-B7F1-A9AC47525D3F");
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
        String vcName = super.getProperties().getParameter("GBaseMppVcName");
        if (db == null || db.equals("") || db.contains(";")) {
            db = "information_schema";
        }

        String bitSet = "?useUnicode=true&characterEncoding=UTF-8&tinyInt1isBit=false&verifyServerCertificate=false&useSSL=true";
        String url = String
                .format("jdbc:%s://%s:%s/%s%s%s", getDriverTypeName(), host, port, db, bitSet,
                        (vcName == null || vcName.equals("")) ? "" : "&vcName=" + vcName);
        LOGGER.info("connection url:" + url);
        return url;
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
        return name;
    }
}
