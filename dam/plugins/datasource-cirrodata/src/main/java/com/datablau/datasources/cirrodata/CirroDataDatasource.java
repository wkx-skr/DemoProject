package com.datablau.datasources.cirrodata;

import com.andorj.model.common.search.QueryPage;
import com.datablau.datasource.builtin.datasource.DatasourceJdbcBase;
import com.datablau.datasource.data.DatasourceKnownParameterType;
import com.datablau.datasource.exception.ConnectionEstablishException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * @program: datablau-datasource-plugins
 * @description: CirroDataDatasource
 * @author: wang tong
 * @create: 2023-08-25 09:57
 **/
public class CirroDataDatasource extends DatasourceJdbcBase {

    private static final Logger logger = LoggerFactory.getLogger(CirroDataDatasource.class);

    public CirroDataDatasource() {
        super("CIRRODATA");
    }

    @Override
    public String getDriverTypeName() {
        return "cirrodata";
    }

    @Override
    public String quoteName(String name) {
        return name;
    }

    @Override
    public String getTableSampleSql(String s, String s1, QueryPage queryPage, boolean b) {
        return null;
    }

    @Override
    public UUID getUniqueId() {
        return UUID.fromString("fbf9080c-6b79-4fc6-b602-aeea365a1346");
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

    @Override
    public String getUrl() {
        String host = getProperties().getParameter(DatasourceKnownParameterType.HostServer.toString());
        String port = getProperties().getParameter(DatasourceKnownParameterType.PortNumber.toString());
        String db = getProperties().getParameter(DatasourceKnownParameterType.DatabaseName.toString());
        String url = String.format("jdbc:xcloud:@%s:%s/%s", host, port, db);
        logger.info("CirroData: the connection url is:" + url);
        return url;
    }

    @Override
    public List<String> getSchemas() {
        String sql = "SELECT DISTINCT SCHEMA_NAME FROM v$user_schemas";
        logger.info("CirroData: the query of getting schemas is :" + sql);
        List<String> schemalist = new ArrayList<>();
        try (Statement stmt = this.getConnection().createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                schemalist.add(rs.getString("SCHEMA_NAME"));
            }
        } catch (SQLException e) {
            logger.error(e.getMessage(), e);
        }
        logger.info("schema list is:" + schemalist);
        return schemalist;
    }


}
