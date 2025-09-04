package com.datablau.datasources.es;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.model.common.utility.DigestUtils;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.datasource.api.Datasource;
import com.datablau.datasource.api.ReverseDelegator;
import com.datablau.datasource.data.CredentialInfo;
import com.datablau.datasource.data.DatasourceKnownParameterType;
import com.datablau.datasource.data.DatasourceProperties;
import com.datablau.datasource.data.DelegateReverseObject;
import com.datablau.datasource.exception.ConnectionEstablishException;
import com.google.common.base.Strings;
import org.apache.commons.lang.StringUtils;
import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.nio.client.HttpAsyncClientBuilder;
import org.apache.http.ssl.SSLContextBuilder;
import org.apache.http.ssl.SSLContexts;
import org.apache.http.util.EntityUtils;
import org.elasticsearch.client.Request;
import org.elasticsearch.client.Response;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestClientBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.net.ssl.SSLContext;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.KeyStore;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * @program: datablau-datasource-plugins
 * @description: es
 * @author: wang tong
 * @create: 2024-07-11 17:29
 **/
public class ElasticSearchDatasource implements Datasource, ReverseDelegator {
    private static final Logger LOGGER = LoggerFactory.getLogger(ElasticSearchDatasource.class);


    private static final Integer DEFAULT_PORT = 9200;
    private RestClient client;
    private String isLargerThan7 = null;
    private DatasourceProperties datasourceProperties;


    @Override
    public UUID getUniqueId() {
        return UUID.fromString("87CEE7F1-0391-4E9F-95CF-FE766B33A776");
    }

    @Override
    public void setProperties(DatasourceProperties datasourceProperties) {
        this.datasourceProperties = datasourceProperties;
    }

    @Override
    public DatasourceProperties getProperties() {
        return this.datasourceProperties;
    }

    @Override
    public void testConnection() throws ConnectionEstablishException {
        try {
            getSchemas();
            getVersion();
        } catch (Exception ex) {
            throw new ConnectionEstablishException("Test failed:" + ex.getMessage(), ex);
        } finally {
            try {
                close();
            } catch (IOException ignored) {

            }
        }
    }

    @Override
    public String getType() {
        return "ES";
    }

    @Override
    public List<String> getSchemas() {
        List<String> schemas = new ArrayList<>();
        if (client == null) {
            try {
                connect(datasourceProperties.getCredentialInfo());
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }

        try {
            Set<String> indices = getIndices(client);
            if (!indices.isEmpty()) {
                schemas.addAll(indices);
            }
            return schemas;
        } catch (Exception ex) {
            throw new UnexpectedStateException(GeneralUtility.getMessageService().getMessage("failedGetIndices", ex.getMessage()), ex);
        }

    }

    @Override
    public List<String> getDatabases() {
        return getSchemas();
    }

    @Override
    public List<DelegateReverseObject> getNamespaces() {
        List<DelegateReverseObject> objects = new ArrayList<>();
        for (String schema : getSchemas()) {
            DelegateReverseObject object = new DelegateReverseObject();
            object.setName(schema);
            object.setType("SCHEMA");
            objects.add(object);
        }
        return objects;
    }

    @Override
    public List<DelegateReverseObject> getChildren(DelegateReverseObject parent) {
        if (parent.getType().equals("SCHEMA")) {
            try {
                return getDetail(parent);
            } catch (Exception ex) {
                throw new UnexpectedStateException("Failed to retrieve table:" + ex.getMessage(), ex);
            }
        } else {
            throw new InvalidArgumentException("Only support type SCHEMA, current parameter type is \"" + parent.getType() + "\"");
        }
    }

    @Override
    public void close() throws IOException {
        if (client != null) {
            try {
                client.close();
                client = null;
            } catch (Exception ignore) {

            }
        }
    }

    private List<DelegateReverseObject> getDetail(DelegateReverseObject parent) throws Exception {
        List<DelegateReverseObject> objects = new ArrayList<>();

        DelegateReverseObject object = new DelegateReverseObject();
        Map<String, String> properties = new HashMap<>();
        if (Strings.isNullOrEmpty(isLargerThan7)) {
            getVersion();
        }
        properties.put("version", isLargerThan7);

        Request request = new Request("GET", "/" + parent.getName() + "/_mapping");
        Response response = client.performRequest(request);

        properties.put("mappings", EntityUtils.toString(response.getEntity()));
        object.setProperties(properties);
        objects.add(object);
        return objects;
    }


    private Set<String> getIndices(RestClient client) throws Exception {
        Request request = new Request("GET", "_cat/indices");
        Response response = client.performRequest(request);

        String[] lines = EntityUtils.toString(response.getEntity()).split("\n");
        Set<String> indices = new HashSet<>();
        for (String line : lines) {
            String[] parts = line.split("\\s+");
            if (parts[2].startsWith(".")) {
                continue;
            }
            indices.add(parts[2]);
        }

        return indices;
    }


    /**
     * 获取版本
     *  >=7 返回 true; <7 返回false
     *
     */
    private void getVersion() throws Exception {
        Request request = new Request("GET", "/");
        Response response = client.performRequest(request);

        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        Map<String, Object> map = mapper.readValue(EntityUtils.toString(response.getEntity()), HashMap.class);
        Map<String, Object> version = (Map) map.get("version");
        String versionNumber = (String) version.get("number");
        datasourceProperties.getParameterMap().put(DatasourceKnownParameterType.DBVersion.toString(), versionNumber);

        String bigNumber = versionNumber.substring(0, versionNumber.indexOf("."));
        if (Integer.parseInt(bigNumber) >= 7) {
            isLargerThan7 = "true";
        } else {
            isLargerThan7 = "false";
        }
    }

    public boolean connect(CredentialInfo info) throws Exception {
        CredentialsProvider credentialsProvider = null;
        if (StringUtils.isNotEmpty(info.getUser())) {
            credentialsProvider = new BasicCredentialsProvider();
            credentialsProvider.setCredentials(AuthScope.ANY, new UsernamePasswordCredentials(info.getUser(),
                    DigestUtils.decryptIfIsEncrypted(info.getPassword())));
        }

        SSLContext sslContext = null;
        if (datasourceProperties.getParameterMap().get(DatasourceKnownParameterType.HttpType.name()) != null) {
            String httpType = datasourceProperties.getParameterMap().get(DatasourceKnownParameterType.HttpType.name());
            if (httpType.equalsIgnoreCase("https")) {
                String keyStorePath = datasourceProperties.getParameterMap().get(DatasourceKnownParameterType.KeyStorePath.name());
                if (StringUtils.isEmpty(keyStorePath)) {
                    throw new InvalidArgumentException(GeneralUtility.getMessageService().getMessage("needKeyStoreFilePath"));
                }

                String keyStorePass = datasourceProperties.getParameterMap().get(DatasourceKnownParameterType.KeyStorePass.name());
                if (StringUtils.isEmpty(keyStorePass)) {
                    throw new InvalidArgumentException(GeneralUtility.getMessageService().getMessage("needKeyStoreFilePassword"));
                }

                KeyStore trustStore = KeyStore.getInstance("jks");
                try (InputStream is = Files.newInputStream(Paths.get(keyStorePath))) {
                    trustStore.load(is, keyStorePass.toCharArray());
                }

                SSLContextBuilder sslContextBuilder = SSLContexts.custom().loadTrustMaterial(trustStore, null);
                sslContext = sslContextBuilder.build();
            }
        }

        if (!datasourceProperties.getParameterMap().containsKey(DatasourceKnownParameterType.PortNumber.name())) {
            datasourceProperties.getParameterMap().put(DatasourceKnownParameterType.PortNumber.name(), DEFAULT_PORT.toString());
        }
        int port = Integer.parseInt(datasourceProperties.getParameterMap().get(DatasourceKnownParameterType.PortNumber.name()));
        RestClientBuilder builder = RestClient.builder(
                new HttpHost(datasourceProperties.getHostServer(), port, sslContext == null ? "http" : "https"));

        if (sslContext != null || credentialsProvider != null) {
            final SSLContext context = sslContext;
            final CredentialsProvider provider = credentialsProvider;
            builder.setHttpClientConfigCallback((HttpAsyncClientBuilder httpClientBuilder) -> {
                if (context != null) {
                    httpClientBuilder.setSSLContext(context);
                }

                if (provider != null) {
                    httpClientBuilder.setDefaultCredentialsProvider(provider);

                    if (context != null) {
                        httpClientBuilder.disableAuthCaching();
                    }
                }

                return httpClientBuilder;
            });
        }

        client = builder.build();
        return true;
    }


}
