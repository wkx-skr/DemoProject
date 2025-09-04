package com.datablau.datasources.oceanBaseOracle;

import com.andorj.common.core.exception.UnexpectedStateException;
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
 * @author nicky - 数语科技有限公司
 * date 2023/5/5 11:15
 */
public class OceanBaseOracleDatasource extends DatasourceJdbcBase {

    private static final Logger logger = LoggerFactory.getLogger(OceanBaseOracleDatasource.class);


    public OceanBaseOracleDatasource() {
        super("OCEANBASEO");
    }

    public String getDriverTypeName() {
        return "oceanbase";
    }

    public UUID getUniqueId() {
        return UUID.fromString("FE4D6AB0-A259-4F48-8FEC-D171008E2D75");
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

        if (page == null) {
            return "SELECT * " + baseSql;
        } else {
            Integer pageSize = page.getPageSize();
            Integer currentPage = page.getCurrentPage();

            int start = ((currentPage - 1) * pageSize);
            int end = start + pageSize;

            if (!CollectionUtils.isEmpty(page.getSortBy())) {
                List<String> sortStrs = new ArrayList<>();
                for (Sort sort : page.getSortBy()) {
                    sortStrs.add(quoteName(sort.getField()) + " " +
                            sort.getOrder() == null ? "" : sort.getOrder().name());
                }

                baseSql = baseSql + " ORDER BY " + String.join(",", sortStrs);
            }

            baseSql = "SELECT * FROM "
                    + "(SELECT tt.*, ROWNUM AS rowno FROM "
                    + "( SELECT * " + baseSql + " ) tt WHERE ROWNUM <= " + (start + end) + " ) table_alias "
                    + "WHERE table_alias.rowno > " + start;

            return baseSql;
        }
    }

    @Override
    public String quoteName(String name) {
        return "\"" + name + "\"";
    }

    @Override
    public String getUrl() {
        String host = getProperties().getParameter(DatasourceKnownParameterType.HostServer.toString());
        String port = getProperties().getParameter(DatasourceKnownParameterType.PortNumber.toString());
        String url = String.format("jdbc:%s://%s:%s", "oceanbase", host, port);
        return url;
    }

    @Override
    public List<String> getSchemas() {
        List<String> schemas = new ArrayList<>();
        try {
            final Statement stmt = getConnection().createStatement();
            String sql = "SELECT username AS table_schem, null as table_catalog FROM all_users WHERE username LIKE '%' ORDER BY table_schem";
            ResultSet rs = null;
            logger.info("sql of getting schemas:" + sql);
            rs = stmt.executeQuery(sql);
            while (rs.next()) {
                schemas.add(rs.getString("TABLE_SCHEM"));
            }

        } catch (SQLException e) {
            logger.error("获取schema失败:" + e.getMessage(), e);
            throw new UnexpectedStateException("Unable to get schemas:" + e.getMessage(), e);
        }
        return schemas;
    }
}
