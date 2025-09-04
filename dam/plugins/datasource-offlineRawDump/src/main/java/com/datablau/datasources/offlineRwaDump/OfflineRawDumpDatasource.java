package com.datablau.datasources.offlineRwaDump;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.model.common.search.QueryPage;
import com.datablau.datasource.builtin.datasource.DatasourceJdbcBase;
import com.datablau.datasource.data.DatasourceKnownParameterType;
import com.datablau.datasource.data.DatasourceProperties;
import com.datablau.datasource.exception.ConnectionEstablishException;

import java.sql.Connection;
import java.util.List;
import java.util.UUID;

/**
 * @author nicky - 数语科技有限公司
 * date 2023/5/5 11:15
 */
public class OfflineRawDumpDatasource extends DatasourceJdbcBase {

    public OfflineRawDumpDatasource() {
        super("OFFLINEDUMP_RAW");
    }


    private DatasourceJdbcBase realDatasource;


    protected DatasourceJdbcBase getRealDatasource(){
        if(realDatasource == null){
            try {
                DatasourceProperties realProp = new DatasourceProperties(getProperties());
                realProp.setType(getProperties().getParameter(
                        DatasourceKnownParameterType.OfflineDumpSourceDriverType.toString()));
                realDatasource = (DatasourceJdbcBase) getDatasourceManager().getDatasource(realProp);
            } catch (Exception e) {
                throw new UnexpectedStateException("offline dump get real datasource failed", e);
            }
        }
        return realDatasource;
    }

    public String getDriverTypeName() {
        return getRealDatasource().getDriverTypeName();
    }

    public UUID getUniqueId() {
        return UUID.fromString("6CF57DD5-01CC-426C-866C-6DDAADCE95B3");
    }

    public void testConnection() throws ConnectionEstablishException {
        getRealDatasource().testConnection();
    }

    @Override
    public String quoteName(String name) {
        return name;
    }

    @Override
    public String getTableSampleSql(String schema, String table, QueryPage page, boolean countSql) {
        return getRealDatasource().getTableSampleSql(schema, table, page, countSql);
    }

    @Override
    public Connection getConnection() {
        return getRealDatasource().getConnection();
    }

    @Override
    public List<Connection> getConnections(int size) {
        return getRealDatasource().getConnections(size);
    }

    @Override
    public List<String> getDatabases() {
        return getRealDatasource().getDatabases();
    }

    @Override
    public List<String> getSchemas() {
        return getRealDatasource().getSchemas();
    }

    @Override
    public String getUrl() {
        return getRealDatasource().getUrl();
    }
}
