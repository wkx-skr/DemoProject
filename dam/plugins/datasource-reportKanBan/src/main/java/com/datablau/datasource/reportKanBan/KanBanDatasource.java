package com.datablau.datasource.reportKanBan;

import com.datablau.datasource.api.Datasource;
import com.datablau.datasource.api.ReverseDelegator;
import com.datablau.datasource.data.DatasourceProperties;
import com.datablau.datasource.data.DelegateReverseObject;
import com.datablau.datasource.exception.ConnectionEstablishException;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * @author: hxs
 * @date: 2025/7/29 9:25
 */
public class KanBanDatasource implements Datasource, ReverseDelegator {
    private DatasourceProperties properties;

    @Override
    public UUID getUniqueId() {
        return UUID.fromString("e7b1c3a5-9f82-4d8c-ae34-0123456789ab");
    }

    @Override
    public void setProperties(DatasourceProperties datasourceProperties) {
        this.properties = datasourceProperties;
    }

    @Override
    public DatasourceProperties getProperties() {
        return this.properties;
    }

    @Override
    public void testConnection() throws ConnectionEstablishException {

    }

    @Override
    public String getType() {
        return "KanBan";
    }

    @Override
    public List<String> getSchemas() {
        return List.of();
    }

    @Override
    public List<String> getDatabases() {
        return List.of();
    }

    @Override
    public boolean isJdbcDatasource() {
        return false;
    }

    @Override
    public List<DelegateReverseObject> getNamespaces() {
        return List.of();
    }

    @Override
    public List<DelegateReverseObject> getChildren(DelegateReverseObject delegateReverseObject) {
        return List.of();
    }

    @Override
    public void close() throws IOException {

    }
}
