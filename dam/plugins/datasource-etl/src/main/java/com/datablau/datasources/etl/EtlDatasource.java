package com.datablau.datasources.etl;

import com.datablau.datasource.api.Datasource;
import com.datablau.datasource.api.ReverseDelegator;
import com.datablau.datasource.data.DatasourceProperties;
import com.datablau.datasource.data.DelegateReverseObject;
import com.datablau.datasource.exception.ConnectionEstablishException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * @program: datablau-datasource-plugins
 * @description:
 * @author: wang tong
 * @create: 2025-06-27 11:18
 **/
public class EtlDatasource implements Datasource, ReverseDelegator {

    private static final Logger LOGGER = LoggerFactory.getLogger(EtlDatasource.class);

    private DatasourceProperties properties;

    @Override
    public UUID getUniqueId() {
        return UUID.fromString("A74A2C28-2664-47BA-8407-F91D93A42B58");
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
        return "ETL";
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
