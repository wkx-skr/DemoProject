package com.datablau.datasources.hbase;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.file.transfer.api.RemoteFileLoader;
import com.andorj.model.common.utility.AndorjClassLoader;
import com.andorj.model.common.utility.BeanHelper;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.datasource.api.Datasource;
import com.datablau.datasource.api.ReverseDelegator;
import com.datablau.datasource.data.DatasourceKnownParameterType;
import com.datablau.datasource.data.DatasourceProperties;
import com.datablau.datasource.data.DelegateReverseObject;
import com.datablau.datasource.exception.ConnectionEstablishException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.google.common.base.Strings;
import java.io.File;
import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.NavigableMap;
import java.util.Set;
import java.util.UUID;
import org.apache.commons.io.FileUtils;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.hbase.HBaseConfiguration;
import org.apache.hadoop.hbase.TableName;
import org.apache.hadoop.hbase.client.Admin;
import org.apache.hadoop.hbase.client.Connection;
import org.apache.hadoop.hbase.client.ConnectionFactory;
import org.apache.hadoop.hbase.client.Result;
import org.apache.hadoop.hbase.client.Scan;
import org.apache.hadoop.hbase.client.Table;
import org.apache.hadoop.hbase.client.TableDescriptor;
import org.apache.hadoop.hbase.filter.FilterList;
import org.apache.hadoop.hbase.filter.KeyOnlyFilter;
import org.apache.hadoop.hbase.filter.PageFilter;
import org.apache.hadoop.security.UserGroupInformation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author nicky - 数语科技有限公司
 * date 2023/9/4 9:58
 */
public class HBaseDatasource implements Datasource, ReverseDelegator {
    private static final Logger LOGGER = LoggerFactory.getLogger(HBaseDatasource.class);

    private static final String DEFAULT_MASTER_PORT = "16000";
    private static final String DEFAULT_REGION_PORT = "16020";
    private static final String DEFAULT_ZNODE_PARENT = "/hbase";

    private static RemoteFileLoader fileLoader;

    private DatasourceProperties datasourceProperties;
    private Connection connection;
    private Map<String, TableName> tableNameMap = new HashMap<>();

    @Override
    public UUID getUniqueId() {
        return UUID.fromString("2C166D20-E66B-4DC7-BCFB-61B81A5AE26C");
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
            getSchemas();
        } catch (Exception ex) {
            throw new ConnectionEstablishException("Test failed:" + ex.getMessage(), ex);
        } finally {
            try {
                close();
            } catch (IOException ie) {

            }
        }
    }

    @Override
    public String getType() {
        return "HBASE";
    }

    @Override
    public List<String> getSchemas() {
        boolean selfCreateConnection = false;
        try {
            if (connection == null) {
                connect();
                selfCreateConnection = true;
            }
            return innerGetNamespaces();
        } catch (Exception ex) {
            LOGGER.error("failed to read namespaces:" + ex.getMessage(), ex);
            throw new UnexpectedStateException(ex.getMessage());
        } finally {
            try {
                if (selfCreateConnection) {
                    close();
                }
            } catch (Exception ex) {

            }
        }
    }

    private List<String> innerGetNamespaces() {
        if (connection != null) {
            try {
                Admin admin = connection.getAdmin();
                Set<String> nss = new HashSet<>();
                for(TableDescriptor td : admin.listTableDescriptors()) {
                    nss.add(td.getTableName().getNamespaceAsString());
                }

                LOGGER.info("got " + nss.size() + " namespaces");
                return new ArrayList<>(nss);
            } catch (Exception ex) {
                throw new UnexpectedStateException("Failed to obtain namespace:" + ex.getMessage(), ex);
            }
        } else {
            throw new InvalidArgumentException("Connection must be created first");
        }
    }

    @Override
    public List<String> getDatabases() {
        return getSchemas();
    }

    @Override
    public void close() throws IOException {
        if (this.connection != null) {
            this.connection.close();
        }

        if (this.tableNameMap != null) {
            this.tableNameMap.clear();
        }
    }

    @Override
    public boolean isMatchType(String testType) {
        return Datasource.super.isMatchType(testType);
    }

    @Override
    public boolean isJdbcDatasource() {
        return false;
    }

    private void connect() throws Exception {
        Configuration config = HBaseConfiguration.create();
        String host = datasourceProperties.getParameter(DatasourceKnownParameterType.HostServer.name());
        if (Strings.isNullOrEmpty(host)) {
            throw new InvalidArgumentException(GeneralUtility.getMessageService().getMessage("needZookeeperQuorum"));
        }

        String port = datasourceProperties.getParameter(DatasourceKnownParameterType.PortNumber.name());
        if (Strings.isNullOrEmpty(port)) {
            port = "2181";
        }

        config.set("hbase.zookeeper.quorum", host);
        config.set("hbase.zookeeper.property.clientPort", port);

        String masterPort = datasourceProperties.getParameter(DatasourceKnownParameterType.HBaseMasterPort.name());
        String regionPort = datasourceProperties.getParameter(DatasourceKnownParameterType.HBaseRegionPort.name());
        config.set("hbase.master.port", Strings.isNullOrEmpty(masterPort) ? DEFAULT_MASTER_PORT : masterPort);
        config.set("hbase.regionserver.port", Strings.isNullOrEmpty(regionPort) ? DEFAULT_REGION_PORT : regionPort);

        String znodeParent = datasourceProperties.getParameter(DatasourceKnownParameterType.HBaseZnodeParent.name());
        config.set("zookeeper.znode.parent", Strings.isNullOrEmpty(znodeParent) ? DEFAULT_ZNODE_PARENT : znodeParent);

        Object authTypeStr = datasourceProperties.getParameter(DatasourceKnownParameterType.AuthenticationType.name());
        if (authTypeStr != null && !Strings.isNullOrEmpty(authTypeStr.toString())) {
            int authenticationType = Integer.parseInt(authTypeStr.toString());

            switch (authenticationType) {
                case 0:
                    break;
                case 1:
                    kerberosUseDbFile(config);
                    break;
                default:
                    throw new InvalidArgumentException(GeneralUtility.getMessageService().getMessage("onlySupportKerberosAuth"));
            }
        }

        connection = ConnectionFactory.createConnection(config);
    }

    protected synchronized RemoteFileLoader getDriverUtil() {
        if (fileLoader == null) {
            fileLoader = (RemoteFileLoader)BeanHelper.getBeanByName("remoteFileLoader");
        }

        return fileLoader;
    }

    private void kerberosUseDbFile(Configuration config) throws Exception {
        getDriverUtil();

        String krb5FileId = this.getProperties().getParameter(DatasourceKnownParameterType.Krb5Path.toString());
        String keyTabFileId = this.getProperties().getParameter(DatasourceKnownParameterType.KeyTabPath.toString());
        File krb5File = fileLoader.loadFileToLocal(krb5FileId, "krb5");
        File keyTabFile = fileLoader.loadFileToLocal(keyTabFileId, "keytab");
        String servicePrincipal = this.getProperties().getParameter(DatasourceKnownParameterType.ServicePrincipal.toString());
        String userPrincipal = this.getProperties().getParameter(DatasourceKnownParameterType.UserPrincipal.toString());

        if (Strings.isNullOrEmpty(servicePrincipal)) {
            throw new InvalidArgumentException("Service Principal can't be empty!");
        } else {

            if (krb5File != null && krb5File.exists()) {
                System.setProperty("java.security.krb5.conf", krb5File.getAbsolutePath());
            }

            String xmlFiles = System.getProperty("hbase.config.files");
            if (!Strings.isNullOrEmpty(xmlFiles)) {
                LOGGER.info("load xmlFiles:" + xmlFiles);

                String[] files = xmlFiles.split(",");

                XmlMapper mapper = new XmlMapper();
                mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

                for (String file : files) {
                    LOGGER.info("loading file:" + file);
                    if (!Strings.isNullOrEmpty(file.trim())) {
                        LocalConfiguration configuration = mapper.readValue(FileUtils.readFileToString(new File(file.trim())), LocalConfiguration.class);
                        for (Property property : configuration.getProperty()) {
                            config.set(property.getName(), property.getValue());
                            LOGGER.info("set " + property.getName() + " to " + property.getValue());
                        }
                    }
                }
            } else {
                LOGGER.info("no xmlFiles to be loaded");
            }

            String keyTabPath = keyTabFile.getAbsolutePath();
            config.set("hbase.master.kerberos.principal", servicePrincipal);
            config.set("hbase.master.keytab.file", keyTabPath);
            UserGroupInformation.setConfiguration(config);

            if (Strings.isNullOrEmpty(userPrincipal)) {
                LOGGER.info("kerberbos- user principal is empty");
                UserGroupInformation.loginUserFromSubject(null);
            } else {
                UserGroupInformation.loginUserFromKeytab(userPrincipal, keyTabPath);
            }
        }
    }

    @Override
    public List<DelegateReverseObject> getNamespaces() {
        if (this.connection == null) {
            try {
                connect();
            } catch (Exception ex) {
                throw new UnexpectedStateException("Connection creation failed:" + ex.getMessage(), ex);
            }
        }

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
                return innerGetTables(parent);
            } catch (Exception ex) {
                throw new UnexpectedStateException("Failed to retrieve table:" + ex.getMessage(), ex);
            }
        } else if (parent.getType().equals("TABLE")) {
            try {
                return innerGetColumns(parent);
            } catch (Exception ex) {
                throw new UnexpectedStateException("Failed to obtain field:" + ex.getMessage(), ex);
            }
        } else {
            throw new InvalidArgumentException("Only support type SCHEMA/TABLE, current parameter type is \"" + parent.getType() + "\"");
        }
    }

    private List<DelegateReverseObject> innerGetTables(DelegateReverseObject schema) throws IOException{
        Admin admin = connection.getAdmin();

        List<DelegateReverseObject> objects = new ArrayList<>();
        for (TableDescriptor td : admin.listTableDescriptors()) {
            if (td.getTableName().getNamespaceAsString().equals(schema.getName())) {
                String name = td.getTableName().getNameAsString();
                DelegateReverseObject table = new DelegateReverseObject();
                table.setName(name);
                table.setParent(schema);
                table.setType("TABLE");
                objects.add(table);

                tableNameMap.put(buildTableFullPath(schema.getName(), name), td.getTableName());
            }
        }

        return objects;
    }

    private String buildTableFullPath(String schema, String table) {
        return schema + "@@" + table;
    }

    private List<DelegateReverseObject> innerGetColumns(DelegateReverseObject parentTable) throws IOException {
        Scan scan = new Scan();
        FilterList filters = new FilterList();
        filters.addFilter(new PageFilter(10000));
        filters.addFilter(new KeyOnlyFilter());
        scan.setFilter(filters);

        String fullPath = buildTableFullPath(parentTable.getParent().getName(), parentTable.getName());
        TableName targetName = tableNameMap.get(fullPath);

        if (targetName == null) {
            throw new InvalidArgumentException("Unable to find table " + fullPath);
        }

        Set<String> columns = new HashSet<>();
        try {
            Table table = connection.getTable(targetName);
            for (Result result : table.getScanner(scan)) {
                NavigableMap<byte[], NavigableMap<byte[], byte[]>> map = result.getNoVersionMap();
                for (Entry<byte[], NavigableMap<byte[], byte[]>> entry : map.entrySet()) {
                    byte[] cf = entry.getKey();
                    String cfStr = new String(cf, "UTF-8");

                    for (Entry<byte[], byte[]> ck : entry.getValue().entrySet()) {
                        byte[] cn = ck.getKey();
                        String cnStr = new String(cn, "UTF-8" );
                        columns.add(cfStr + "." + cnStr);
                    }
                }
            }
        } catch (Throwable ex) {
            LOGGER.warn("stop to scan the table due to :" + ex.getMessage());
        }

        List<DelegateReverseObject> result = new ArrayList<>();
        for (String column : columns) {
            DelegateReverseObject object = new DelegateReverseObject();
            object.setName(column);
            object.setType("COLUMN");
            object.setParent(parentTable);
            result.add(object);
        }

        return result;
    }

    public static class LocalConfiguration implements Serializable {
        @JacksonXmlElementWrapper(useWrapping = false)
        private List<Property> property;

        public List<Property> getProperty() {
            return property;
        }

        public void setProperty(List<Property> property) {
            this.property = property;
        }
    }

    public static class Property implements Serializable {
        private String name;
        private String value;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getValue() {
            return value;
        }

        public void setValue(String value) {
            this.value = value;
        }
    }

}
