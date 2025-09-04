package com.datablau.datasources.metamodeldemo;

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
 * @description: 元模型自定义类型 demo数据源
 * @author: wang tong
 * @create: 2025-02-19 14:39
 **/
public class MetaModelDemoDatasource implements Datasource, ReverseDelegator {


    private static final Logger LOGGER = LoggerFactory.getLogger(MetaModelDemoDatasource.class);
    @Override
    public UUID getUniqueId() {
        return UUID.fromString("48C4B6C3-21F9-4E8E-B8D2-139311C22541");
    }

    @Override
    public void setProperties(DatasourceProperties datasourceProperties) {

    }

    @Override
    public DatasourceProperties getProperties() {
        return null;
    }

    @Override
    public void testConnection() throws ConnectionEstablishException {

    }

    @Override
    public String getType() {
        return "METAMODELDEMO";
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
