package com.datablau.reverse.engineering.worker.cassandra;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.core.exception.UnexpectedSystemException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.core.model.ObjectX;
import com.datablau.datasource.data.CredentialInfo;
import com.datablau.datasource.data.DatasourceKnownParameterType;
import com.datablau.reverse.engineering.api.JdbcPlugin;
import com.datablau.reverse.engineering.data.ReversedSchema;
import com.datablau.reverse.engineering.data.ReversedTable;
import com.datablau.reverse.engineering.worker.ReverseForwardStrategyJdbc;
import com.datastax.driver.core.Cluster;
import com.datastax.driver.core.ColumnMetadata;
import com.datastax.driver.core.DataType;
import com.datastax.driver.core.KeyspaceMetadata;
import com.datastax.driver.core.Metadata;
import com.datastax.driver.core.TableMetadata;
import com.google.common.base.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date :2024/9/14
 */
public class CassandraWorker extends ReverseForwardStrategyJdbc implements JdbcPlugin {

    private static final Logger logger = LoggerFactory.getLogger(CassandraWorker.class);

    private static final int FetchSize = 2000;

    private static final int DEFAULT_PORT = 9042;
    private Map<String, Set<TableMetadata>> tableMetadataMap = new ConcurrentHashMap<>();

    @Override
    public String getType() {
        return "CASSANDRA";
    }

    /**
     * 获取 table comment SQL
     */
    public String getSQL(String schema) {
        return  null ;
    }


    @Override
    public ResultSet getPrimaryKeysOfSchema(String catalog, String schema) {
        try {
            return jdbcDatasource.getConnection().getMetaData().getPrimaryKeys(catalog, schema, null);
        } catch (SQLException e) {
            throw new UnexpectedStateException(
                    "Unable to get pk :" + e.getMessage());
        }
    }

    private Cluster getCluster() {
        String host = datasource.getProperties().getParameter(DatasourceKnownParameterType.HostServer.toString());
        String portStr = datasource.getProperties().getParameter(DatasourceKnownParameterType.PortNumber.toString());
        int port = Strings.isNullOrEmpty(portStr) ? DEFAULT_PORT : Integer.parseInt(portStr);
        CredentialInfo credentialInfo = datasource.getProperties().getCredentialInfo();

        Cluster cluster = Cluster.builder().addContactPoint(host)
                .withPort(port).withCredentials(credentialInfo.getUser(), credentialInfo.getPassword()).build();

        logger.debug("connected to the cassandra cluster - " + host
                + "/" + port + ", with credential of " + credentialInfo.getUser());

        return cluster;
    }


    protected void readTables(ModelX model, String catalog, String schema,
                              List<ResultSet> tableResultSets) throws Exception {
        Cluster cluster = null;
        try {
            cluster = getCluster();
            Metadata metadata = cluster.getMetadata();
            if (metadata != null) {
                KeyspaceMetadata keyspace = metadata.getKeyspace(schema);
                Set<TableMetadata> sets = ConcurrentHashMap.newKeySet();
                tableMetadataMap.put(schema, sets);
                if (keyspace != null) {
                    for (TableMetadata table : keyspace.getTables()) {
                        buildTable(model, table, schema);
                        sets.add(table);
                    }
                }
            }
        } catch(Exception ex) {
            throw new UnexpectedSystemException(ex.getMessage(), ex);
        } finally {
            if (cluster != null) {
                try {
                    cluster.close();
                } catch(Exception ex) {

                }
            }
        }
    }


    protected void readColumns(ModelX model, String catalog, String schema,
                               ResultSet columnResultSet) throws Exception {
        try {
            Set<TableMetadata> metadataSet = tableMetadataMap.get(schema);
            if(metadataSet == null || metadataSet.isEmpty()) return;
            for (TableMetadata tableMetadata : metadataSet) {
                buildColumn(model, tableMetadata, schema);
            }

        } finally {
            closeResultSet(columnResultSet);
        }
    }


    protected void readPKs(ModelX model, String database, String schema) throws Exception {
        try{
            Set<TableMetadata> metadataSet = tableMetadataMap.get(schema);
            for (TableMetadata tableMetadata : metadataSet) {
                buildPK(model, tableMetadata.getName(), tableMetadata.getPrimaryKey(), schema);
            }
        }catch (Exception e){
            logger.warn(e.getMessage(), e);
        }
    }


    private void buildTable(ModelX model, TableMetadata table, String schema){

        String tableName = table.getName();
        if (options.isInBlackList(tableName, LDMTypes.oEntity)
                || checkTableExistence(
                schema, tableName)) {
            logger.debug(
                    "table '" + tableName + "' is in the black list or already exists");
            return;
        }

        if (ignoreTheTable(schema, schema, tableName)) {
            return;
        }

        ObjectX tableX = createTable(model);
        if (tableX == null) {
            logger.error("unable to create tableX");
            return;
        }

        tableX.setName(tableName);

        ReversedSchema oSchema = getOrCreateSchema(model, schema);
        setSchemaInfoToObject(oSchema, tableX);

        String tableKey = getNormalizedTableName(null, schema, tableName);
        if (tableCommentMap.containsKey(tableKey)) {
            setCommentToObject(tableX, tableCommentMap.get(tableKey));
        }

        ReversedTable reversedTable = oSchema.addTable(tableX);
        processSave();
        if (options.needToPersis()) {
            reversedTable.getTableX().setObjectIsFullyCreated();
            reversedTable.clearObjectX();
        }
    }

    private void buildColumn(ModelX model, TableMetadata table, String schema){
        ReversedSchema reversedSchema = schemaMap.get(schema);
        int totalHandledColumns = 0;
        try {
            String tableName = table.getName();

            ReversedTable reversedTable = reversedSchema.lookForTable(tableName);
            if (table == null) {
                return;
            }

            List<ColumnMetadata> columns = table.getColumns();
            if(columns == null || columns.isEmpty()){
                return;
            }

            int ordinalPosition = 1;
            for (ColumnMetadata column : columns) {
                String columnName = column.getName();
                ObjectX columnX = createColumn(model, reversedTable);
                columnX.setName(columnName);
                DataType type = column.getType();

                columnX.setProperty(LDMTypes.pDataType, type.getName());
                columnX.setProperty(LDMTypes.pOrdinal, ordinalPosition);
                columnX.setObjectIsFullyCreated();

                totalHandledColumns++;
                if (totalHandledColumns % 1000 == 0) {
                    processSave();
                    logger.debug("total loaded " + totalHandledColumns + " columns");
                }
            }
        } catch (Exception e) {
            // Just catch it.
            logger.warn(e.getMessage());
        }
    }

    private void buildPK(ModelX model, String tableName, List<ColumnMetadata> pkColumns, String schema){
        logger.info("building pks in schema \'" + schema + "\'");

        String pkName = "";
        ObjectX prePkObject = null;
        ObjectX curPkObject = null;
        List<String> pkMembers = new ArrayList<>();
        ReversedTable lastTable = null;
        ReversedSchema reversedSchema = schemaMap.get(schema);

        try {
            String columnName = "";
            int totalLoaded = 0;
            for (ColumnMetadata pkColumn : pkColumns) {
                ReversedTable table = reversedSchema.lookForTable(tableName);
                if (table == null) {
                    continue;
                }

                columnName = pkColumn.getName();// column name
                String pkName1 = "PrimaryKey"; // PK name
                //boolean isLastFinished = false;
                if (lastTable != table || pkName1.compareToIgnoreCase(pkName) != 0) {
                    curPkObject = createKeyGroup(model, table);
                    curPkObject.setName(pkName1);
                    curPkObject.setProperty(LDMTypes.pKeyGroupType, "PrimaryKey");
                    curPkObject.setProperty(LDMTypes.pIsUnique, true);
                    table.addKeyGroup(curPkObject);

                    reversedSchema.addIndexName(pkName1);
                    if (prePkObject != null) {
                        setIndexMembers(prePkObject, pkMembers);

                        totalLoaded++;
                        if (totalLoaded % 1000 == 0) {
                            logger.debug("total loaded " + totalLoaded + " pks");
                            processSave();
                        }
                    }

                    //if (!isLastFinished)
                    prePkObject = curPkObject;
                    pkName = pkName1;

                    logger.debug("loading pk of table [" + table.getName() + "]");
                }
                pkMembers.add(columnName);
                lastTable = table;
            }
            if (curPkObject != null) {
                setIndexMembers(curPkObject, pkMembers);
            }

            logger.info("all pks in \'" + schema + "\' are read");
        } catch (Exception ex) {
            logger.warn("failed to load pks in \'" + schema + "\'");
        }
    }

}
