package com.datablau.datasources.iceberg;


import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.datablau.datasource.api.Datasource;
import com.datablau.datasource.api.ReverseDelegator;
import com.datablau.datasource.data.DatasourceProperties;
import com.datablau.datasource.data.DelegateReverseObject;
import com.datablau.datasource.exception.ConnectionEstablishException;
import com.google.common.base.Strings;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.apache.hadoop.conf.Configuration;
import org.apache.iceberg.Schema;
import org.apache.iceberg.Table;
import org.apache.iceberg.catalog.Namespace;
import org.apache.iceberg.catalog.TableIdentifier;
import org.apache.iceberg.hive.HiveCatalog;
import org.apache.iceberg.types.Types;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @program: datablau-datasource-plugins
 * @description: hive
 * @author: wang tong
 * @create: 2023-05-09 14:08
 **/
public class IcebergDatasource implements Datasource, ReverseDelegator {

    private static final Logger logger = LoggerFactory.getLogger(IcebergDatasource.class);

    private HiveCatalog catalog;

    private DatasourceProperties datasourceProperties;

    private Map<String, Namespace> namespaceMap = new HashMap<>();

    private Map<String, TableIdentifier> tableNameMap = new HashMap<>();

    public void setProperties(DatasourceProperties datasourceProperties) {
        this.datasourceProperties = datasourceProperties;
    }

    public DatasourceProperties getProperties() {
        return this.datasourceProperties;
    }

    public String getType() {
        return "ICEBERG";
    }

    public UUID getUniqueId() {
        return UUID.fromString("625bcba6-b303-4cb8-b9a8-d73011b687bf");
    }

    public void testConnection() throws ConnectionEstablishException {
        logger.info("测试中...");
        try {
            connection();
        } catch (Exception ex) {
            throw new ConnectionEstablishException("Test failed:" + ex.getMessage(), ex);
        } finally {
            close();
        }
    }

    public List<String> getSchemas() {
        logger.info("获取schema...");
        connection();
        List<String> result = new ArrayList<>();
        ClassLoader cl = Thread.currentThread().getContextClassLoader();
        try {
            Thread.currentThread().setContextClassLoader(getClass().getClassLoader());
            logger.info(getClass().getClassLoader().toString());
            List<Namespace> namespaces = this.catalog.listNamespaces();
            for (Namespace namespace : namespaces) {
                result.add(namespace.toString());
                this.namespaceMap.put(namespace.toString(), namespace);
            }
        } finally {
            Thread.currentThread().setContextClassLoader(cl);
        }
        return result;
    }

    private void connection() {
        ClassLoader cl = Thread.currentThread().getContextClassLoader();
        try {
            if (this.catalog == null) {
                Thread.currentThread().setContextClassLoader(getClass().getClassLoader());
                logger.info("Iceberg连接中...");
                String thrift = this.datasourceProperties.getParameter("HostServer");
                String catalogName = this.datasourceProperties.getParameter("PortNumber");
                if (Strings.isNullOrEmpty(catalogName))
                    throw new AndorjRuntimeException("CatalogName不能为空");
                if (Strings.isNullOrEmpty(thrift))
                    throw new AndorjRuntimeException("Thrift地址不能为空");
                Map<String, String> properties = new HashMap<>();
                properties.put("uri", thrift);
                Configuration configuration = new Configuration();
                configuration.set("metastore.thrift.uri.selection", "SEQUENTIAL");
                this.catalog = new HiveCatalog();
                this.catalog.setConf(configuration);
                this.catalog.initialize(catalogName, properties);
                logger.info("Iceberg连接成功");
            } else {
                logger.info("已经连接到iceberg");
            }
        } catch (Exception e) {
            throw new AndorjRuntimeException("Iceberg", e);
        } finally {
            Thread.currentThread().setContextClassLoader(cl);
        }
    }

    public List<String> getDatabases() {
        return getSchemas();
    }

    public void close() {

    }

    public boolean isJdbcDatasource() {
        return false;
    }

    public List<DelegateReverseObject> getNamespaces() {
        if (this.catalog == null)
            try {
                connection();
            } catch (Exception ex) {
                throw new UnexpectedStateException("Connection creation failed:" + ex.getMessage(), ex);
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

    public List<DelegateReverseObject> getChildren(DelegateReverseObject parent) {
        if (parent.getType().equals("SCHEMA"))
            try {
                return innerGetTables(parent);
            } catch (Exception ex) {
                throw new UnexpectedStateException("Failed to retrieve table:" + ex.getMessage(), ex);
            }
        if (parent.getType().equals("TABLE"))
            try {
                return innerGetColumns(parent);
            } catch (Exception ex) {
                throw new UnexpectedStateException("Failed to obtain field:" + ex.getMessage(), ex);
            }
        throw new InvalidArgumentException("Only support type SCHEMA/TABLE, current parameter type is \"" + parent.getType() + "\"");
    }

    private List<DelegateReverseObject> innerGetTables(DelegateReverseObject schema) {
        Namespace namespace = this.namespaceMap.get(schema.getName());
        if (namespace == null) {
            throw new AndorjRuntimeException(String.format("名称为[%s]的namespace不存在", schema.getName()));
        }
        List<DelegateReverseObject> objects = new ArrayList<>();
        for (TableIdentifier tableIdentifier : this.catalog.listTables(namespace)) {
            String name = tableIdentifier.name();
            DelegateReverseObject table = new DelegateReverseObject();
            table.setName(name);
            table.setParent(schema);
            table.setType("TABLE");
            objects.add(table);
            this.tableNameMap.put(buildTableFullPath(schema.getName(), name), tableIdentifier);
        }
        return objects;
    }

    private String buildTableFullPath(String schema, String table) {
        return schema + "@@" + table;
    }

    private List<DelegateReverseObject> innerGetColumns(DelegateReverseObject parentTable) {
        String fullPath = buildTableFullPath(parentTable.getParent().getName(), parentTable.getName());
        TableIdentifier tableIdentifier = this.tableNameMap.get(fullPath);
        if (tableIdentifier == null)
            throw new InvalidArgumentException("Unable to find table " + fullPath);
        Table table = this.catalog.loadTable(tableIdentifier);
        Schema tableSchema = table.schema();
        List<DelegateReverseObject> result = new ArrayList<>();
        for (Types.NestedField icebergColumn : tableSchema.columns()) {
            String columnName = icebergColumn.name();
            String type = icebergColumn.type().toString();
            boolean notNull = icebergColumn.isOptional();
            String comment = icebergColumn.doc();
            DelegateReverseObject object = new DelegateReverseObject();
            object.setName(columnName);
            object.setType("COLUMN");
            object.setParent(parentTable);
            object.addProperty("columnType", type);
            object.addProperty("columnNotNull", String.valueOf(notNull));
            object.addProperty("columnComment", comment);
            result.add(object);
        }
        return result;
    }

}
