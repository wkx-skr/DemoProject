package com.datablau.datasources.databricks;

import com.andorj.model.common.search.QueryPage;
import com.datablau.datasource.builtin.datasource.DatasourceJdbcBase;
import com.datablau.datasource.data.DatasourceKnownParameterType;
import com.datablau.datasource.exception.ConnectionEstablishException;
import com.google.common.base.Strings;

import java.sql.Connection;
import java.util.UUID;

/**
 * @program: datablau-datasource-plugins
 * @description: databricks
 * @author: wang tong
 * @create: 2024-05-28 10:50
 **/
public class DataBricksDatasource extends DatasourceJdbcBase {

    public DataBricksDatasource() {
        super("DATABRICKS");
    }

    @Override
    public UUID getUniqueId() {
        return UUID.fromString("4A73423F-3A45-1EEA-981B-9DABEBCE44BE");
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
    public String getDriverTypeName() {
        return "databricks";
    }

    @Override
    public String quoteName(String s) {
        return s;
    }

    @Override
    public String getTableSampleSql(String s, String s1, QueryPage queryPage, boolean b) {
        return "";
    }

    @Override
    public String getUrl() {
        String host = getProperties().getParameter(DatasourceKnownParameterType.HostServer.toString());
        String port = getProperties().getParameter(DatasourceKnownParameterType.PortNumber.toString());
        String db = getProperties().getParameter(DatasourceKnownParameterType.DatabaseName.toString());
        String additional = getProperties().getParameterMap().get("Additional");
        if (Strings.isNullOrEmpty(db)) {
            db = "default";
        } else {
            db = db.trim().split(";")[0];
        }
        if (Strings.isNullOrEmpty(additional)) {
            return String.format("jdbc:%s://%s:%s/%s", "databricks", host, port, db);
        } else {
            return String.format("jdbc:%s://%s:%s/%s%s;", "databricks", host, port, db, additional);
        }

    }
}
