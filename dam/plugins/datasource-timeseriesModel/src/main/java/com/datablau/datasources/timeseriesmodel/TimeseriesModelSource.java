package com.datablau.datasources.timeseriesmodel;

import com.datablau.datasource.api.Datasource;
import com.datablau.datasource.api.ReverseDelegator;
import com.datablau.datasource.data.DatasourceProperties;
import com.datablau.datasource.data.DelegateReverseObject;
import com.datablau.datasource.exception.ConnectionEstablishException;
import com.google.common.collect.Lists;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public class TimeseriesModelSource implements Datasource, ReverseDelegator {

    private static final Logger LOGGER = LoggerFactory.getLogger(TimeseriesModelSource.class);

    private DatasourceProperties properties;


    @Override
    public UUID getUniqueId() {
        return UUID.fromString("E86F1DF6-44FF-47B1-8082-A52F75BCE226");
    }

    @Override
    public DatasourceProperties getProperties() {
        return this.properties;
    }

    @Override
    public void setProperties(DatasourceProperties datasourceProperties) {
        this.properties = datasourceProperties;
    }

    @Override
    public void testConnection() throws ConnectionEstablishException {

    }

    @Override
    public String getType() {
        return "TIMESERIESMODEL";
    }

    @Override
    public List<String> getSchemas() {
        return Lists.newArrayList();
    }

    @Override
    public List<String> getDatabases() {
        return Lists.newArrayList();
    }

    @Override
    public boolean isJdbcDatasource() {
        return false;
    }

    @Override
    public List<DelegateReverseObject> getNamespaces() {
        return Lists.newArrayList();
    }

    @Override
    public List<DelegateReverseObject> getChildren(DelegateReverseObject delegateReverseObject) {
        return Lists.newArrayList();
    }

    /**
     * Closes this stream and releases any system resources associated
     * with it. If the stream is already closed then invoking this
     * method has no effect.
     *
     * <p> As noted in {@link AutoCloseable#close()}, cases where the
     * close may fail require careful attention. It is strongly advised
     * to relinquish the underlying resources and to internally
     * <em>mark</em> the {@code Closeable} as closed, prior to throwing
     * the {@code IOException}.
     *
     * @throws IOException if an I/O error occurs
     */
    @Override
    public void close() throws IOException {

    }
}
