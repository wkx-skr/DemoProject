package com.datablau.datasources.mongodb;

import com.andorj.model.common.utility.DigestUtils;
import com.datablau.datasource.api.Datasource;
import com.datablau.datasource.api.ReverseDelegator;
import com.datablau.datasource.data.CredentialInfo;
import com.datablau.datasource.data.DatasourceKnownParameterType;
import com.datablau.datasource.data.DatasourceProperties;
import com.datablau.datasource.data.DelegateReverseObject;
import com.datablau.datasource.exception.ConnectionEstablishException;
import com.google.common.base.Strings;
import com.mongodb.DB;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientOptions;
import com.mongodb.MongoCredential;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoIterable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * @program: datablau-datasource-plugins
 * @description:
 * @author: wang tong
 * @create: 2024-07-12 15:52
 **/
public class MongoDBDatasource implements Datasource, ReverseDelegator {

    private static final Logger LOGGER = LoggerFactory.getLogger(MongoDBDatasource.class);

    private MongoClient mongoClient;
    private DB mongoDb;
    private boolean credentialProvided = false;
    private DatasourceProperties datasourceProperties;


    @Override
    public UUID getUniqueId() {
        return UUID.fromString("8EA840A5-37F4-48F8-82D9-1429E42A0FC6");
    }

    @Override
    public void setProperties(DatasourceProperties datasourceProperties) {
        this.datasourceProperties = datasourceProperties;
    }

    @Override
    public DatasourceProperties getProperties() {
        return datasourceProperties;
    }

    @Override
    public void testConnection() throws ConnectionEstablishException {
        try {
            connect(datasourceProperties.getCredentialInfo());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public String getType() {
        return "MONGODB";
    }

    @Override
    public List<String> getSchemas() {
        return Collections.emptyList();
    }

    @Override
    public List<String> getDatabases() {
        if (mongoClient == null || mongoDb == null) {
            try {
                connect(datasourceProperties.getCredentialInfo());
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
        List<String> dblist = new ArrayList<>();
        if (mongoClient != null && !credentialProvided) {
            MongoIterable<String> dbs = mongoClient.listDatabaseNames();
            for (String db : dbs) {

                dblist.add(db);
            }
        } else {
            dblist.add(mongoDb.getName());
        }
        return dblist;
    }

    @Override
    public List<DelegateReverseObject> getNamespaces() {
        return Collections.emptyList();
    }

    @Override
    public List<DelegateReverseObject> getChildren(DelegateReverseObject delegateReverseObject) {
        return Collections.emptyList();
    }

    @Override
    public void close() throws IOException {
        if (mongoClient != null) {
            mongoClient.close();
            mongoClient = null;
        }
    }

    public MongoClient GetMongoClient() {
        return mongoClient;
    }

    public boolean connect(CredentialInfo info) throws Exception {
        String hostName = datasourceProperties.getParameter(DatasourceKnownParameterType.HostServer.toString());
        String dbName = datasourceProperties.getParameter(DatasourceKnownParameterType.DatabaseName.toString());
        String portStr = datasourceProperties.getParameter(DatasourceKnownParameterType.PortNumber.toString());
        int port = 27017; // default mongodb port
        if (portStr != null) {
            port = Integer.parseInt(portStr);
        }

        MongoClientOptions options = MongoClientOptions.builder()
                .connectTimeout(5000)
                .socketTimeout(60000)
                .connectionsPerHost(10)
                .serverSelectionTimeout(1000)
                .build();

        try {
            final ServerAddress serverAddress = new ServerAddress(hostName, port);

            if (!Strings.isNullOrEmpty(info.getUser())) {
                final List<MongoCredential> creds = new ArrayList<MongoCredential>();
                creds.add(MongoCredential.createCredential(info.getUser(), dbName,
                        DigestUtils.decryptIfIsEncrypted(info.getPassword()).toCharArray()));

                mongoClient = new MongoClient(serverAddress, creds, options);

                //if the mongoclient isn't correctly set, then the below call will throw an exception
                for (String name : mongoClient.listDatabaseNames()) {
                    LOGGER.debug("get mongodb database:" + name);
                }
                mongoDb = mongoClient.getDB(dbName);
                credentialProvided = true;
            } else {
                mongoClient = new MongoClient(serverAddress, options);
                //if the mongoclient isn't correctly set, then the below call will throw an exception
                for (String name : mongoClient.listDatabaseNames()) {
                    LOGGER.debug("get mongodb database:" + name);
                }
                if (!Strings.isNullOrEmpty(dbName)) {
                    mongoDb = mongoClient.getDB(dbName);
                }
            }

            return true;
        } catch (Exception e) {
            close();
            throw e; // TODO xmpy add customerized data access exception
        }
    }
}
