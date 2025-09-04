package com.datablau.datasources.unstructuredir;

import com.datablau.datasource.api.Datasource;
import com.datablau.datasource.api.ReverseDelegator;
import com.datablau.datasource.data.DatasourceProperties;
import com.datablau.datasource.data.DelegateReverseObject;
import com.datablau.datasource.exception.ConnectionEstablishException;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class UnstructureDirectoryDatasource implements Datasource, ReverseDelegator {


    private DatasourceProperties properties;


    @Override
    public UUID getUniqueId() {
        return UUID.fromString("A3370E10-3843-4D52-A239-F3BEFB3386C4");
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
        return "UNSTRUCTUREDIRECTORY";
    }

    @Override
    public List<String> getSchemas() {
        return Collections.emptyList();
    }

    @Override
    public List<String> getDatabases() {
        return Collections.emptyList();
    }

    @Override
    public boolean isMatchType(String testType) {
        return Datasource.super.isMatchType(testType);
    }

    @Override
    public boolean isJdbcDatasource() {
        return Datasource.super.isJdbcDatasource();
    }

    @Override
    public void close() throws IOException {

    }

    @Override
    public List<DelegateReverseObject> getNamespaces() {
        return Collections.emptyList();
    }

    @Override
    public List<DelegateReverseObject> getChildren(DelegateReverseObject delegateReverseObject) {
        return Collections.emptyList();
    }
}
