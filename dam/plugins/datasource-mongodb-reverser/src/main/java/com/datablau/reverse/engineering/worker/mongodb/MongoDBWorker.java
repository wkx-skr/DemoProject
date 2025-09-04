package com.datablau.reverse.engineering.worker.mongodb;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.core.model.ObjectCreationWatcher;
import com.andorj.common.core.model.ObjectX;
import com.andorj.model.common.utility.DigestUtils;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.datasource.api.Datasource;
import com.datablau.datasource.api.ReverseDelegator;
import com.datablau.datasource.data.CredentialInfo;
import com.datablau.datasource.data.DatasourceKnownParameterType;
import com.datablau.reverse.engineering.api.IdGetter;
import com.datablau.reverse.engineering.api.ReverseForwardStrategy;
import com.datablau.reverse.engineering.data.ReverseForwardOptions;
import com.datablau.reverse.engineering.data.ReversedSchema;
import com.datablau.reverse.engineering.data.ReversedTable;
import com.datablau.reverse.engineering.exception.ReverseEngineeringFailedException;
import com.datablau.reverse.engineering.utility.JobProgress;
import com.datablau.reverse.engineering.utility.ProgressJob;
import com.google.common.base.Strings;
import com.mongodb.AggregationOptions;
import com.mongodb.AggregationOutput;
import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;
import com.mongodb.CommandResult;
import com.mongodb.Cursor;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.mongodb.DBRef;
import com.mongodb.MapReduceCommand;
import com.mongodb.MapReduceOutput;
import com.mongodb.MongoClient;
import com.mongodb.MongoClientOptions;
import com.mongodb.MongoCredential;
import com.mongodb.ServerAddress;
import org.bson.BasicBSONObject;
import org.bson.types.CodeWScope;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @program: datablau-datasource-plugins
 * @description:
 * @author: wang tong
 * @create: 2024-07-12 16:33
 **/
public class MongoDBWorker extends ProgressJob implements ReverseForwardStrategy {

    private static final Logger LOGGER = LoggerFactory.getLogger(MongoDBWorker.class);
    protected ReverseForwardOptions options;
    protected Datasource datasource;
    protected ReverseDelegator delegator;
    private IdGetter idGetter;
    private String modelName;
    protected Map<String, ReversedSchema> schemaMap = new ConcurrentHashMap<>();
    protected ModelX currentModel = null;

    private final static String ARRAY_ELEMENT_FIELD_NAME = "array_element";
    private final static String PATTERN_VIEW_RESULT = "naza_pattern_view";

    // Only store the node which can be parent node such as collection root node, node of Object data
    // type, node of Array data type.
    private Map<String, ObjectX> pathToParentNodeCache = new HashMap<>();
    private HashMap<String, HashMap<String, String>> dbrefs = new HashMap<>();

    private MongoClient mongoClient;
    private DB mongoDb;

    protected ObjectCreationWatcher saver = null;
    protected boolean useProgressSave = false;

    @Override
    public ModelX reverseEngineer(ModelX modelX, Datasource datasource, ReverseForwardOptions options) throws ReverseEngineeringFailedException {

        if (options == null) {
            throw new InvalidArgumentException("re options cannot be null");
        } else {
            this.options = options;
        }

        if (datasource == null) {
            throw new InvalidArgumentException("datasource cannot be null");
        } else {
            this.datasource = datasource;
        }
        this.modelName = modelX.getName();
        currentModel = modelX;
        preReverseEngineering();

        updateProgress(new JobProgress(0, "start..."));

        try {
            innerReverseEngineer(modelX);
            if (options.isFinalizeModel()) {
                options.getObjectCreationWatcher().finalizeModel();
            }
        } catch (Throwable tw) {
            options.getClearModelCallback().clearModel(modelX.getId(), datasource);
            LOGGER.error("failed to re model of type \'" + datasource.getType() + "\'", tw);
            throw new ReverseEngineeringFailedException("Reverse data source failure:" + tw.getMessage(), tw);
        }

        try {
            close();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return modelX;
    }

    @Override
    public void setIdGetter(IdGetter idGetter) {
        this.idGetter = idGetter;
    }

    @Override
    public String getType() {
        return "MONGODB";
    }

    @Override
    public boolean canHandleDatasource(Datasource datasource) {
        return datasource.getType().equals(getType());
    }

    protected void preReverseEngineering() {
        try {
            connect(datasource.getProperties().getCredentialInfo());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        if (options.getObjectCreationWatcher() != null) {
            options.getObjectCreationWatcher().setModelX(currentModel);
            currentModel.setObjectCreationWatcher(options.getObjectCreationWatcher());
        }
    }

    public boolean connect(CredentialInfo info) throws Exception {
        String hostName = datasource.getProperties().getParameter(DatasourceKnownParameterType.HostServer.toString());
        String dbName = datasource.getProperties().getParameter(DatasourceKnownParameterType.DatabaseName.toString());
        String portStr = datasource.getProperties().getParameter(DatasourceKnownParameterType.PortNumber.toString());
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

    public void close() throws IOException {
        if (mongoClient != null) {
            mongoClient.close();
            mongoClient = null;
        }
    }

    protected ModelX innerReverseEngineer(ModelX model) throws ReverseEngineeringFailedException {
        this.currentModel = model;
        if (!canHandleDatasource(datasource)) {
            throw new ReverseEngineeringFailedException(GeneralUtility.getMessageService().getMessage("metadata.reverse.notMongoDB"));
        }


        this.mongoDb = this.mongoClient.getDB(datasource.getProperties().getParameter(
                DatasourceKnownParameterType.DatabaseName.name()));

        try {
            LOGGER.debug("Start reverse engineer--");
            checkStopSign();
            updateProgress(new JobProgress(20, "starting..."));

            preReverseEngineering();

            // get database
            ReversedSchema dbx = buildDatabase(model);

            checkStopSign();
            updateProgress(new JobProgress(30, "got database:" + dbx.getSchemaName()));

            // get tables
            checkStopSign();
            buildCollections(model, dbx);

            checkStopSign();
            buildCollectionRelationship(model, dbx);

            updateProgress(new JobProgress(60, "model is created"));
            postReverseEngineering();
            return model;
        } catch (Exception ex) {
            throw new ReverseEngineeringFailedException(GeneralUtility.getMessageService().getMessage("metadata.reverse.mongoDBFailed", ex.getMessage()), ex);
        } finally {
            if (mongoClient != null) {
                mongoClient.close();
            }
        }
    }


    private void buildCollections(ModelX modelX, ReversedSchema dbx) throws Exception {
        int collectionCount = mongoDb.getCollectionNames().size();
        int collectionIndex = 0;

        ///
        /// Get config database.
        ///
        DB configDb = mongoClient.getDB("config");

        /// Loop for each collection.
        for (String collectionName : mongoDb.getCollectionNames()) {
            checkStopSign();
            collectionIndex++;

            if (options.isInBlackList(collectionName, LDMTypes.oEntity)) {
                continue;
            }

            updateProgress(new JobProgress(30 + (collectionIndex * 20 / collectionCount),
                    "reading collection:" + collectionName));
            LOGGER.debug("Reverse Egineering for collection:" + collectionName);

            DBCollection collection = mongoDb.getCollection(collectionName);

            // Create collection node in the modelX document.
            ObjectX tableX = buildCollectionProperties(collection, modelX, dbx);
            ReversedTable table = dbx.addTable(tableX);

            try {
                buildCollectionFields(configDb, tableX, collectionName, dbx);

                // if (!rfOptions.isTypeFiltered("PatternView"))
                // buildCollectionPatternView(configDb, tableX, collectionName);

                ///
                /// Retrieve Indexes
                ///

                buildCollectionIndexes(collection, tableX);

                ///
                /// Retrieve Shards
                ///
                buildCollectionShards(configDb, collection, tableX);

                if (options.needToPersis()) {
                    tableX.setObjectIsFullyCreated();
                    table.clearObjectX();
                }
            } catch (Exception e) {
                LOGGER.error(e.getMessage());
            }

        }

//        DBCollection patternView = mongoDb.getCollection(PATTERN_VIEW_RESULT);
//        if (patternView != null) {
//            patternView.drop();
//        }
    }

    private void buildCollectionRelationship(ModelX modelX, ReversedSchema dbx) throws Exception {
        int collectionCount = mongoDb.getCollectionNames().size();
        int collectionIndex = 0;

        ///
        /// Get config database.
        ///
        DB configDb = mongoClient.getDB("config");

        /// Loop for each collection.
        for (String collectionName : mongoDb.getCollectionNames()) {
            checkStopSign();
            collectionIndex++;

            if (options.isInBlackList(collectionName, LDMTypes.oEntity)) {
                continue;
            }

            updateProgress(new JobProgress(50 + collectionIndex * 10 / collectionCount,
                    "reading relationships of " + collectionName));
            LOGGER.debug("Reverse Egineering for collection:" + collectionName);

            DBCollection collection = mongoDb.getCollection(collectionName);

            // Create collection node in the modelX document.
            ObjectX tableX = modelX.getObjectX(modelX.name2Id(collectionName, LDMTypes.oEntity));
            if (tableX == null) {
                continue;
            }

            try {
                ///
                /// Retrieve DBRef
                ///
                buildCollectionDBRef(collection, modelX, tableX);
            } catch (Exception e) {
                LOGGER.error(e.getMessage());
            }

        }
    }

    private void buildCollectionDBRef(DBCollection collection, ModelX modelX, ObjectX tableFK)
            throws Exception {

        HashMap<String, String> collectionRefs = dbrefs.get(collection.getName());
        if (collectionRefs == null) {
            return;
        }

        for (Map.Entry<String, String> entry : collectionRefs.entrySet()) {
            checkStopSign();
            String key = entry.getKey();
            entry.getValue();
            String[] path = key.split("\\.");

            String field = path[path.length - 1];
            // create our pipeline operations, first with the $match
            DBObject exist = new BasicDBObject(key, new BasicDBObject("$exists", true));

            List<DBObject> pipeline = new ArrayList<DBObject>();
            pipeline.add(exist);

            DBCursor cursor = collection.find(exist).limit(3);
            boolean isValid = false;
            try {
                String refCollectionName = collection.getName();

                while (cursor.hasNext()) {
                    DBObject dbo = (DBObject) cursor.next();

                    Object dbrefvalue = null;
                    DBObject dbo1 = dbo;
                    for (int i = 0; i < path.length; i++) {
                        Object dbo2 = dbo1.get(path[i]);

                        if (dbo2 instanceof BasicDBList) {
                            BasicDBList array = (BasicDBList) dbo2;
                            if (array.size() > 0) {
                                dbo1 = (DBObject) array.get(0);
                            }
                        } else if (dbo2 instanceof DBObject) {
                            dbo1 = (DBObject) dbo2;
                        } else {
                            dbrefvalue = dbo1.get(path[i]);
                        }
                    }

                    if (dbrefvalue instanceof ObjectId) {
                        DBObject existid = collection.findOne(dbrefvalue);
                        if (existid == null) {
                            /// this is NOT valid manual dbref.
                            continue;
                        }

                    } else if (dbrefvalue instanceof DBRef) {
                        DBRef dbref = (DBRef) dbrefvalue;
                        refCollectionName = dbref.getCollectionName();
                        Object oid = dbref.getId();
                        ObjectId refid = null;
                        if (oid instanceof ObjectId) {
                            refid = (ObjectId) oid;
                        } else if (oid instanceof Double) {
                            refid = null;
                        } else {
                            refid = new ObjectId(oid.toString());
                        }

                        /// Dont verify for custome integer objectid
                        if (refid != null) {
                            DBCollection refcollection = mongoDb.getCollection(refCollectionName);
                            DBObject existid = refcollection.findOne(refid);
                            if (existid == null) {
                                /// this is not valid dbref.
                                continue;
                            }
                        }
                    } else {
                        System.out.println(dbo.toString());
                        continue;
                    }

                    isValid = true;
                }
                if (isValid) {

                    ObjectX tablePK = modelX
                            .getObjectX(modelX.name2Id(refCollectionName, LDMTypes.oEntity));
                    if (tablePK == null || tableFK == null) {
                        continue;
                    }

                    /// build relationships
                    ObjectX relationship = (ObjectX) modelX
                            .createObject(LDMTypes.oRelationship, getNextId());
                    relationship.setProperty(LDMTypes.pName, key);

                    relationship.setProperty(LDMTypes.pName, key);
                    relationship.setProperty(LDMTypes.pRelationalType, "Identifying");
                    relationship.setProperty(LDMTypes.pStartCardinality, "ZeroOrOne");
                    relationship.setProperty(LDMTypes.pEndCardinality, "ZeroOneOrMore");
                    relationship.setProperty(LDMTypes.pRelationalType, "Identifying");

                    relationship.setProperty(LDMTypes.pStartRole, refCollectionName);
                    relationship.setProperty(LDMTypes.pEndRole, collection.getName());
                    relationship.setProperty(LDMTypes.pStartMultiplicity, "0,1");
                    relationship.setProperty(LDMTypes.pEndMultiplicity, "1,n");
                    relationship.setProperty(LDMTypes.pLabel, "ref to");

                    /// Create Foreign Key group
                    ObjectX fkx = (ObjectX) tableFK
                            .createObject(LDMTypes.oKeyGroup, getNextId());
                    fkx.setProperty(LDMTypes.pName, field + "_fk");
                    fkx.setProperty(LDMTypes.pKeyGroupType, "ForeignKey");

                    // key members
                    fkx.setProperty(LDMTypes.pKeyGroupMemberRefs,
                            String.format("{\"%s\":{\"Id\":0,\"Type\":%s}}", field, "\"Ascending\""));

                    relationship.setProperty(LDMTypes.pParentEntityRef, tablePK.getId());
                    relationship.setProperty(LDMTypes.pChildEntityRef, tableFK.getId());

                    relationship.setProperty(LDMTypes.pParentKeyRef,
                            tablePK.name2Id("_id_", LDMTypes.oKeyGroup));
                    relationship.setProperty(LDMTypes.pChildKeyRef, fkx.getId());

                }
            } finally {
                cursor.close();
            }
        }
    }

    protected ObjectX buildCollectionProperties(DBCollection collection, ModelX modelX, ReversedSchema dbx)
            throws Exception {
        LOGGER.debug("--Reverse Egineering for collection Properties.");

        ObjectX tableX =
                createTable(modelX);
        tableX.setObjectClass("Datablau.LDM.EntityCollection");
        //(ObjectX) modelX.createObject(LDMTypes.oEntity, getNextId(), "Datablau.LDM.EntityCollection");
        tableX.setProperty(LDMTypes.pName, collection.getName());

        setSchemaInfoToObject(dbx, tableX);

        CommandResult options = collection.getStats();
        Object capped = options.get("capped");
        if (capped != null && (boolean) capped == true) {
            tableX.setProperty(LDMTypes.pCapped, options.get("capped").toString());
            tableX.setProperty(LDMTypes.pMaxSize, options.get("maxSize").toString());
            tableX.setProperty(LDMTypes.pMaxDocs, options.get("max").toString());
        }

        {
            tableX.setProperty(LDMTypes.pRowCount, options.get("count").toString());

            DBObject sort = new BasicDBObject("$sort", new BasicDBObject("_id", -1));

            // build the $projection operation
            DBObject limit = new BasicDBObject("$limit", 1);

            List<DBObject> pipeline = new ArrayList<DBObject>();
            pipeline.add(sort);
            pipeline.add(limit);

            // run aggregation with AggregationOptions
            AggregationOptions aggregationOptions = AggregationOptions.builder().batchSize(1000)
                    .build();
            Cursor cursor = collection.aggregate(pipeline, aggregationOptions);
            while (cursor.hasNext()) {
                Object oid = (Object) ((DBObject) cursor.next()).get("_id");
                if (oid instanceof ObjectId) {
                    ObjectId objectId = (ObjectId) oid;
                    Timestamp time = new Timestamp((long) objectId.getTimestamp() * 1000);
                    tableX
                            .setProperty(LDMTypes.pLastUpdateTime, time);
                }

                break;
            }

//            AggregationOutput output = collection.aggregate(pipeline);
//            for (DBObject dbo : output.results()) {
//                Object oid = (Object) dbo.get("_id");
//                if (oid instanceof ObjectId) {
//                    ObjectId objectId = (ObjectId) oid;
//                    Timestamp time = new Timestamp((long) objectId.getTimestamp() * 1000);
//                    tableX.setProperty(LDMTypes.pLastUpdateTime, time);
//                }
//
//                break;
//            }
        }

        tableX.setObjectIsFullyCreated();
        return tableX;
    }

    protected ReversedSchema buildDatabase(ModelX modelX) throws Exception {
        LOGGER.debug("Create Database Object.");
        /// build Database
        //ObjectX dbx = (ObjectX) modelX.createObject(LDMTypes.oDatabase, getNextId());
        //dbx.setProperty(LDMTypes.pName, mongoDb.getName());

        ReversedSchema dbx = getOrCreateSchema(modelX, mongoDb.getName());

        return dbx;
    }

    protected boolean buildCollectionShards(DB configDb, DBCollection collection, ObjectX tableX)
            throws Exception {
        if (configDb != null) {
            DBCollection collections = configDb.getCollection("collections");
            if (collections != null) {
                BasicDBObject findshards = new BasicDBObject();
                findshards.put("_id", collection.getFullName());

                try {
                    DBObject chunkInfo = collections.findOne(findshards);
                    if (chunkInfo != null) {
                        tableX.setProperty(LDMTypes.pShardInfo, chunkInfo.get("key").toString());
                        // System.out.println(chunkInfo.toString());
                        LOGGER.debug("--Reverse Egineering for collection Shard Key.");
                        return true;
                    }
                } catch (Exception ex) {
                    LOGGER.warn("Failed to get shard information", ex);
                    return false;
                }
            }
        }
        return false;
    }

    protected boolean isCollectionShards(DB configDb, DBCollection collection) {
        try {
            if (configDb != null) {
                DBCollection collections = configDb.getCollection("collections");
                if (collections != null) {
                    BasicDBObject findshards = new BasicDBObject();
                    findshards.put("_id", collection.getFullName());
                    DBObject chunkInfo = collections.findOne(findshards);
                    if (chunkInfo != null) {
                        return true;
                    }
                }
            }
            return false;
        } catch (Exception ex) {
            LOGGER.warn("Failed to retrieve \'isShard\' information, set to false", ex);
            return false;
        }
    }

    private MapReduceOutput getSchemaUseMapReduce(DB configDb, String collectionName)
            throws Exception {
        DBCollection collection = mongoDb.getCollection(collectionName);
        // Load js scripts to mongodb system table.
//        DBCollection sysJsTable = mongoDb.getCollection("system.js");

//        BasicDBObject getType = new BasicDBObject();

//        getType.put("_id", "getTypeId");
        String getTypeString =
                loadFileContentFromClasspath("schema_getType.js");
        CodeWScope getTypeCodeWScope = new CodeWScope(getTypeString, new BasicBSONObject());
//        getType.put("value", getTypeCodeWScope);
//        sysJsTable.save(getType);

//        BasicDBObject getNewKeyString = new BasicDBObject();
//        getNewKeyString.put("_id", "getNewKeyString");
        String getNewKeyStringString =
                loadFileContentFromClasspath("schema_getNewKeyString.js");
        CodeWScope getNewKeyStringCodeWScope =
                new CodeWScope(getNewKeyStringString, new BasicBSONObject());
//        getNewKeyString.put("value", getNewKeyStringCodeWScope);
//        sysJsTable.save(getNewKeyString);

//        BasicDBObject getKeyInfo = new BasicDBObject();
//        getKeyInfo.put("_id", "getKeyInfo");
        String getKeyInfoString =
                loadFileContentFromClasspath("schema_getKeyInfo.js");
        CodeWScope getKeyInfoCodeWScope = new CodeWScope(getKeyInfoString, new BasicBSONObject());
//        getKeyInfo.put("value", getKeyInfoCodeWScope);
//        sysJsTable.save(getKeyInfo);

        String mapString = loadFileContentFromClasspath("schema_map.js");
        String reduceString = loadFileContentFromClasspath("schema_reduce.js");
        String finalizeString = loadFileContentFromClasspath("schema_finalize.js");

        String mapPatternString =
                loadFileContentFromClasspath("schema_map_pattern.js");
        String reducePatternString =
                loadFileContentFromClasspath("schema_reduce_pattern.js");
        String finalizePatternString =
                loadFileContentFromClasspath("schema_finalize_pattern.js");

        // Build mapreduce command.
        MapReduceCommand cmd = new MapReduceCommand(collection, mapString, reduceString, null,
                MapReduceCommand.OutputType.INLINE, null);
        cmd.setFinalize(finalizeString);

        boolean isSharded = isCollectionShards(configDb, collection);
        LOGGER.debug("--The Collection is on Sharding? : " + isSharded);

        int scanCount = options.getScanCount();
        if (scanCount > collection.count()) {
            scanCount = (int) collection.count();
        }

        if (!isSharded && scanCount > 0) {
            cmd.setLimit(scanCount);
        }

        int inferDepth = options.getInferDepth();
        int coverageBar = options.getCoverageThreshold();
        // Set the scope for the mapreduce job.
        Map<String, Object> scope = new HashMap<String, Object>();
        scope.put("getType", getTypeCodeWScope);
        scope.put("getNewKeyString", getNewKeyStringCodeWScope);
        scope.put("getKeyInfo", getKeyInfoCodeWScope);
        scope.put("statCount", scanCount);
        scope.put("wildcards", new ArrayList<String>());
        scope.put("arraysAreWildcards", true);
        scope.put("fields", new HashMap<String, String>());
        scope.put("omitArray", false);
        scope.put("schemaInferDepth", inferDepth);
        scope.put("coverageBar", coverageBar);
        scope.put("usePositiveFields", false);
        scope.put("useNegativeFields", false);
        cmd.setScope(scope);

        MapReduceOutput output = collection.mapReduce(cmd);

        LOGGER.debug("--MapReduce for Field Retrieve finished.");
        return output;
    }

    private String loadFileContentFromClasspath(String fileName) throws Exception {
        try (InputStream is = MongoDBWorker.class.getClassLoader().getResourceAsStream(fileName);
             InputStreamReader ir = new InputStreamReader(is);
             BufferedReader reader = new BufferedReader(ir)) {

            String line = null;
            StringBuilder sb = new StringBuilder();
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }

            return sb.toString();
        }
    }

    private ObjectX getParentNode(ObjectX collectionNode, String path) {
        if (path == null || path.isEmpty()) {
            return null;
        }
        String[] pathArr = path.split("\\.");
        if (pathArr.length == 0 || pathArr.length == 1) {
            return collectionNode;
        }

        String fieldName = pathArr[pathArr.length - 1];

        String parentPath;
        // This path is about an array element
        if (fieldName.equals("$")) {
            parentPath = path;
        } else {
            parentPath = path.substring(0, path.length() - fieldName.length() - 1);
        }
        if (pathToParentNodeCache.containsKey(parentPath)) {
            return pathToParentNodeCache.get(parentPath);
        }
        return null;
    }

    protected void buildCollectionIndexes(DBCollection collection, ObjectX tableX)
            throws Exception {
        List<DBObject> dbIndexes = collection.getIndexInfo();
        /// System.out.println(dbIndexes.toString());

        for (DBObject dbindex : dbIndexes) {
            // Determine the parent node
            ObjectX indexX = (ObjectX) tableX.createObject(LDMTypes.oKeyGroup, getNextId());

            // Add property for oAttribute
            String indexName = dbindex.get("name").toString();
            indexX.setProperty(LDMTypes.pName, indexName);
            indexX.setProperty(LDMTypes.pKeyGroupType,
                    indexName.compareToIgnoreCase("_id_") == 0 ? "PrimaryKey" : "NonUniqueKey");
            LOGGER.debug("-- -- Reverse for Index : " + indexName);

            DBObject members = (DBObject) dbindex.get("key");
            Object defaultLanguage = dbindex.get("default_language");
            if (defaultLanguage != null) {
                indexX.setProperty(LDMTypes.pDefaultLanguage, defaultLanguage.toString());
            }
            Object LanguageOverriden = dbindex.get("language_override");
            if (LanguageOverriden != null) {
                indexX.setProperty(LDMTypes.pLanguageOverride, LanguageOverriden.toString());
            }
            Object expireAfterSeconds = dbindex.get("expireAfterSeconds");
            if (expireAfterSeconds != null) {
                if (expireAfterSeconds instanceof Double) {
                    expireAfterSeconds = new Double((Double) expireAfterSeconds).intValue();
                }
                indexX.setProperty(LDMTypes.pExpireAfterSeconds, expireAfterSeconds.toString());
            }
            Object weights = dbindex.get("weights");
            if (weights != null) {
                indexX.setProperty(LDMTypes.pWeights, weights.toString());
            }
            Object sparse = dbindex.get("sparse");
            if (sparse != null) {
                indexX.setProperty(LDMTypes.pIsSparse, sparse.toString());
            }
            Object partialFilterExpression = dbindex.get("partialFilterExpression");
            if (partialFilterExpression != null) {
                indexX.setProperty(LDMTypes.pPartialFilter, partialFilterExpression.toString());
            }
            Object min = dbindex.get("min");
            if (min != null) {
                indexX.setProperty(LDMTypes.pLowerBound, min.toString());
            }
            Object max = dbindex.get("max");
            if (max != null) {
                indexX.setProperty(LDMTypes.pUpperBound, max.toString());
            }
            Object bits = dbindex.get("bits");
            if (bits != null) {
                indexX.setProperty(LDMTypes.pBitPrecision, bits.toString());
            }
            Object bucketSize = dbindex.get("bucketSize");
            if (bucketSize != null) {
                if (bucketSize instanceof Double) {
                    bucketSize = new Double((Double) bucketSize).intValue();
                }
                indexX.setProperty(LDMTypes.pBucketSize, bucketSize.toString());
            }
            Object geo2dsphereIndexVersion = dbindex.get("2dsphereIndexVersion");
            if (geo2dsphereIndexVersion != null) {
                indexX.setProperty(LDMTypes.p2DSphereVersion, geo2dsphereIndexVersion.toString());
            }

            String memberJson = "{";
            for (String key : members.keySet()) {
                Object keyvalue = members.get(key);
                if (key.compareToIgnoreCase("unique") == 0) {
                    indexX.setProperty(LDMTypes.pIsUnique, keyvalue.toString());
                } else if (key.compareToIgnoreCase("_ftsx") == 0
                        || key.compareToIgnoreCase("_fts") == 0) {
                    indexX.setProperty(LDMTypes.pWildcardTextIndex, "true");
                } else {
                    String keytype = "";
                    if (memberJson.length() > 1) {
                        memberJson += ",";
                    }
                    if (keyvalue instanceof Double) {
                        keyvalue = new Double((Double) keyvalue).intValue();
                    }

                    if (keyvalue.equals(1)) {
                        keytype = "\"Ascending\"";
                    } else if (keyvalue.equals(-1)) {
                        keytype = "\"Descending\"";
                    } else {
                        keytype = "\"" + keyvalue.toString() + "\"";
                    }

                    memberJson += String.format("\"%s\":{\"Id\":0,\"Type\":%s}", key, keytype);
                }
            }
            memberJson += "}";
            // key members
            indexX.setProperty(LDMTypes.pKeyGroupMemberRefs, memberJson);
            indexX.setObjectIsFullyCreated();
        }
    }

    protected void buildCollectionFields(DB configDB, ObjectX table, String collectionName,  ReversedSchema dbx)
            throws IOException, Exception {
        LOGGER.debug("--Reverse Egineering for collection Fields.");

        MapReduceOutput schemaMrResult = getSchemaUseMapReduce(configDB, collectionName);

        // Sort the schema mapreduce result to make sure parent node will be created before child node.
        List<DBObject> sortedSchemaMrResult = new ArrayList<DBObject>();
        for (DBObject dbo : schemaMrResult.results()) {
            sortedSchemaMrResult.add(dbo);
            // System.out.println(dbo.toString());
        }

        Collections.sort(sortedSchemaMrResult, new Comparator<DBObject>() {
            @Override
            public int compare(DBObject o1, DBObject o2) {
                return o1.get("_id").toString().compareTo(o2.get("_id").toString());
            }
        });

        // dbrefs.clear(); //clear the dbrefs.
        for (DBObject dbo : schemaMrResult.results()) {
            checkStopSign();
            String objectPath = dbo.get("_id").toString();
            String[] path = objectPath.split("\\.");
            String fieldName = path[path.length - 1];
            // If it is an array.
            if (fieldName.equals("$")) {
                fieldName = ARRAY_ELEMENT_FIELD_NAME;
            }
            DBObject value = (DBObject) dbo.get("value");
            List typeObjects = (List) value.get("types");
            String types = "";
            for (Object typeObj : typeObjects) {
                String type = (String) typeObj;
                if (type.equals("all")) {
                    continue;
                } else if (type.equals("bson")) {
                    type = "object";
                } else if (type.equals("number")) {
                    type = "int";
                } else if (type.equals("numberlong")) {
                    type = "long";
                }

                if (types.length() != 0) {
                    types += " | ";
                }

                types += type;
            }
            // Determine the parent node
            ObjectX toBeParentX = getParentNode(table, objectPath);
            if (toBeParentX == null) {
                LOGGER.warn("Can not find the parent  node  of this object path: " + objectPath);
                continue;
            }

            ObjectX columnX = (ObjectX) toBeParentX.createObject(LDMTypes.oAttribute, getNextId(), "Datablau.LDM.CollectionNode");

            // Add property for oAttribute
            columnX.setProperty(LDMTypes.pName, fieldName);
            columnX.setProperty(LDMTypes.pDataType, types);
            columnX.setProperty(LDMTypes.pStatistics,
                    "{\"Statistics\":" + value.get("results").toString() + "}");
            columnX.setParentPhysicalName(toBeParentX.getName());
            columnX.setParentLogicalName(toBeParentX.getLogicalName());
            columnX.setParentObjectId(toBeParentX.getId());
            setSchemaInfoToObject(dbx, columnX);
            /// temp code
            // if(fieldName.toLowerCase().contains("车牌") || fieldName.contains("carlicense")||
            // fieldName.contains("chepaihao")){
            // ObjectX tagX = (ObjectX) columnX.createObject(LDMTypes.oTagged);
            // tagX.setProperty(LDMTypes.pTagUniqueRef, "1A0964B2-512B-4B96-A6D1-24CBCF5CB2EF");
            // }
            // if(fieldName.toLowerCase().contains("身份证号") ){
            // ObjectX tagX = (ObjectX) columnX.createObject(LDMTypes.oTagged);
            // tagX.setProperty(LDMTypes.pTagUniqueRef, "2A0964B2-512B-4B96-A6D1-24CBCF5CB2EF");
            // }
            // if(fieldName.toLowerCase().contains("车辆型号")){
            // ObjectX tagX = (ObjectX) columnX.createObject(LDMTypes.oTagged);
            // tagX.setProperty(LDMTypes.pTagUniqueRef, "3A0964B2-512B-4B96-A6D1-24CBCF5CB2EF");
            // }
            /// end of temp
            // System.out.println("{\"Statistics\":" + value.get("results").toString() + "}");
            if (typeObjects.contains("bson") || typeObjects.contains("object")) {
                pathToParentNodeCache.put(objectPath, columnX);
            } else if (typeObjects.contains("array")) {
                pathToParentNodeCache.put(objectPath + ".$", columnX);
            }

            columnX.setObjectIsFullyCreated();
            if ((types.compareToIgnoreCase("objectid") == 0
                    && fieldName.compareToIgnoreCase("_id") != 0)
                    || types.compareToIgnoreCase("dbref") == 0) {
                HashMap<String, String> dbref = dbrefs.get(collectionName);
                if (dbref == null) {
                    dbref = new HashMap<String, String>();
                    dbrefs.put(collectionName, dbref);

                    dbref.put(objectPath.replace(".$.", "."), types);
                }
            }
        }
    }

    protected void buildCollectionPatternView(DB configDB, ObjectX tableX, String collectionName)
            throws IOException, Exception {
        DBCollection patternView = mongoDb.getCollection(PATTERN_VIEW_RESULT);
        DBCollection collection = mongoDb.getCollection(collectionName);
        LOGGER.debug("-- Reverse the collection for PatternView from naza_pattern_view.");
        /*
         * db.student.aggregate([ // First sort all the docs by name {$sort: {name: 1}}, // Take the
         * first 100 of those {$limit: 100}, // Of those, take only ones where marks > 35 {$match:
         * {marks: {$gt: 35}}} ])
         */
        // create our pipeline operations, first with the $match
        DBObject sort = new BasicDBObject("$sort", new BasicDBObject("value.count", -1));

        // build the $projection operation
        DBObject limit = new BasicDBObject("$limit", 3);

        List<DBObject> pipeline = new ArrayList<DBObject>();
        pipeline.add(sort);
        pipeline.add(limit);

        // run aggregation with AggregationOptions
        AggregationOutput output = patternView.aggregate(pipeline);
        int num = 0;
        BasicDBObject patternJson = new BasicDBObject();
        DBObject sampledata1 = null;
        for (DBObject dbo : output.results()) {
            DBObject valueo = (DBObject) dbo.get("value");
            Object oid = valueo.get("id");
            DBObject query = new BasicDBObject("_id",
                    (oid instanceof ObjectId) ? new ObjectId(valueo.get("id").toString()) : oid);
            DBObject pattern = collection.findOne(query);
            if (pattern != null) {
                BasicDBObject bdb = (BasicDBObject) pattern;
                DBObject sampledata = (DBObject) bdb.copy();
                dbo.put("sampledata", sampledata);
                sampledata1 = sampledata;

                pattern = typingDBObject(pattern);
                dbo.put("pattern", pattern);

                patternJson.append("Pattern_" + num++, dbo);
            }
        }
        /// Only omit the pattern more than one
        if (num > 1) {
            tableX.setProperty(LDMTypes.pPatternInfo, patternJson.toString());
        } else if (sampledata1 != null) {
            tableX.setProperty(LDMTypes.pInfo, sampledata1.toString());
        }
        // System.out.println(patternJson.toString());
        /*
         * DBObject query = new BasicDBObject ("_id", new BasicDBObject("$in", vals)); DBCursor cursor =
         * collection.findOne(query);
         *
         * try { while(cursor.hasNext()) { System.out.println(cursor.next()); } } finally {
         * cursor.close(); }
         */
    }

    private DBObject typingDBObject(DBObject dbo) {
        for (String key : dbo.keySet()) {
            Object value = dbo.get(key);
            if (value instanceof DBObject) {
                value = typingDBObject((DBObject) value);
            } else {
                dbo.put(key,
                        value == null ? "null" : value.getClass().getSimpleName().toLowerCase());
            }
        }
        return dbo;
    }

    protected void postReverseEngineering() throws Exception {
        if (useProgressSave) {
            LOGGER.info("finalizing...");
            saver.finalizeModel();
        }
    }

    protected void setSchemaInfoToObject(ReversedSchema schema, ObjectX object) {
        if (schema == null || object == null) {
            return;
        }

        object.setProperty(LDMTypes.pSchemaRef, schema.getSchemaId());
        object.setProperty(LDMTypes.pSchemaName, schema.getSchemaName());
    }

    protected synchronized ReversedSchema getOrCreateSchema(ModelX modelX, String schemaName) {
        if ("%".equals(schemaName)) {
            return null;
        }

        if (schemaMap.containsKey(schemaName)) {
            return schemaMap.get(schemaName);
        } else {
            ObjectX schema =
                    options.needToPersis() ?
                            ObjectX
                                    .createSingleObject(LDMTypes.oSchema, getNextId(), modelX) :
                            (ObjectX) modelX.createObject(LDMTypes.oSchema, getNextId());
            schema.setParentObjectId(modelX.getId());
            schema.setParentLogicalName(modelX.getLogicalName());
            schema.setParentPhysicalName(modelX.getPhysicalName());
            schema.setName(schemaName);
            schema.setObjectIsFullyCreated();
            schemaMap.put(schema.getName(), new ReversedSchema(schema));
            modelX.addObject(schema);
            return schemaMap.get(schema.getName());
        }
    }

    protected ObjectX createTable(ModelX modelX) {
        ObjectX table =
                options.needToPersis() ?
                        ObjectX.createSingleObject(LDMTypes.oEntity, getNextId(), modelX)
                        : (ObjectX) modelX.createObject(LDMTypes.oEntity, getNextId());
        table.setParentPhysicalName(modelX.getPhysicalName());
        table.setParentLogicalName(modelX.getLogicalName());
        table.setParentObjectId(modelX.getId());
        modelX.addObject(table);

        return table;
    }

    protected ObjectX createColumn(ReversedTable table) {
        ObjectX column =
                options.needToPersis() ?
                        ObjectX.createSingleObject(LDMTypes.oAttribute, getNextId(), getCurrentModel())
                        : (ObjectX) table.getTableX().createObject(LDMTypes.oAttribute, getNextId());
        column.setParentPhysicalName(table.getName());
        column.setParentLogicalName(table.getLogicalName());
        column.setParentObjectId(table.getId());
        column.setProperty(LDMTypes.pSchemaName, table.getSchema());

        return column;
    }

    protected void processSave() {
        if (saver != null) {
            saver.notifySave();
        }
    }

    protected Long getNextId() {
        return this.idGetter.getNextId();
    }

    protected ModelX getCurrentModel() {
        return currentModel;
    }
}
