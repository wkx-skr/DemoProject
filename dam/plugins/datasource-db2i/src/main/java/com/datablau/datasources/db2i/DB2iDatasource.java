package com.datablau.datasources.db2i;

import com.andorj.model.common.search.QueryPage;
import com.datablau.datasource.builtin.datasource.DatasourceJdbcBase;
import com.datablau.datasource.data.DatasourceKnownParameterType;
import com.datablau.datasource.exception.ConnectionEstablishException;

import java.sql.Connection;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * @program: datablau-datasource-plugins
 * @description: DB2iDatasource
 * @author: wang tong
 * @create: 2023-08-24 14:44
 **/
public class DB2iDatasource extends DatasourceJdbcBase {
    public DB2iDatasource() {
        super("DB2I");
    }

    @Override
    public String getDriverTypeName() {
        return "db2foriSeries";
    }

    @Override
    public String quoteName(String name) {
        return  name ;
    }

    @Override
    public String getTableSampleSql(String schema, String table, QueryPage page, boolean countSql) {
        return null;
    }

    @Override
    public UUID getUniqueId() {
        return UUID.fromString("512DDAD7-55CB-4F24-AFAC-281C08829695");
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
    public List<String> getDatabases() {
        // validate first
        super.getDatabases();
        // return the instance back as base method can't get the correct name of databases
        List<String> dblist = new ArrayList<>();
        dblist.add(getProperties().getParameter(DatasourceKnownParameterType.DatabaseName.toString()));
        return dblist;
    }

    @Override
    public String getUrl() {
        String host = getProperties().getParameter(DatasourceKnownParameterType.HostServer.toString());
        //String port = source.getParameter(DatasourceKnownParameterType.PortNumber.toString());
        //String db = source.getParameter(DatasourceKnownParameterType.DatabaseName.toString());

        String url = String.format("jdbc:as400://%s", host);
        return url;
    }


}
