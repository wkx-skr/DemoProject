package com.datablau.datasources.masterdata;

import com.datablau.datasource.api.Datasource;
import com.datablau.datasource.api.ReverseDelegator;
import com.datablau.datasource.data.DatasourceProperties;
import com.datablau.datasource.data.DelegateReverseObject;
import com.datablau.datasource.exception.ConnectionEstablishException;
import com.google.common.collect.Lists;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public class MasterDataSource implements Datasource, ReverseDelegator {

    private DatasourceProperties properties;


    @Override
    public List<DelegateReverseObject> getNamespaces() {
        return Lists.newArrayList();
    }

    @Override
    public List<DelegateReverseObject> getChildren(DelegateReverseObject delegateReverseObject) {
        return Lists.newArrayList();
    }

    @Override
    public void close() throws IOException {

    }

    @Override
    public UUID getUniqueId() {
        return UUID.fromString("15AB7C4E-C9B6-4EEB-91FD-049914DD38E5");
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
        return "MASTERDATA";
    }

    @Override
    public List<String> getSchemas() {
        return Lists.newArrayList();
    }

    @Override
    public List<String> getDatabases() {
        return Lists.newArrayList();
    }

}
