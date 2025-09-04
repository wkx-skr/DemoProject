package com.datablau.metadata.main.ext.impl;

import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.core.model.ObjectX;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.model.common.utility.BeanHelper;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.base.api.FavoriteService;
import com.datablau.base.api.ModelCategoryService;
import com.datablau.base.api.SubscribeService;
import com.datablau.base.data.FavoriteDto;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.base.data.criteria.FavoriteQueryCriteria;
import com.datablau.common.kafka.producer.KafkaProducer;
import com.datablau.data.common.api.ExcelService;
import com.datablau.data.common.util.JsonUtils;
import com.datablau.metadata.main.dao.DataObjectFullRepository;
import com.datablau.metadata.main.dao.DataObjectRepositoryExt;
import com.datablau.metadata.main.dao.model.ModelVersionRepository;
import com.datablau.metadata.main.dto.MetaDataIncrementDto;
import com.datablau.metadata.main.dto.TableMetadataMessageDto;
import com.datablau.metadata.main.dto.model.MetadataSyncJobDto;
import com.datablau.metadata.main.entity.metadata.DataObject;
import com.datablau.metadata.main.entity.model.Model;
import com.datablau.metadata.main.entity.model.ModelVersion;
import com.datablau.metadata.main.ext.DataModelSyncUdpService;
import com.datablau.metadata.main.ext.DataModelVersionServiceExt;
import com.datablau.metadata.main.service.lineage.api.LineageMappingService;
import com.datablau.metadata.main.service.metadata.api.DataObjectService;
import com.datablau.metadata.main.service.model.api.DataModelService;
import com.datablau.metadata.main.service.model.dto.CCompareDto;
import com.datablau.metadata.main.service.model.dto.CompareResultExporter;
import com.datablau.metadata.main.service.model.impl.DataModelVersionServiceImpl;
import com.datablau.udp.jpa.entity.MetadataUserDefinedProperty;
import com.datablau.udp.jpa.entity.MetadataUserDefinedPropertyValue;
import com.datablau.udp.jpa.repository.MetadataUserDefinedPropertyRepository;
import com.datablau.udp.jpa.repository.MetadataUserDefinedPropertyValueRepository;
import com.google.common.base.Strings;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.data.UserDetails;
import com.datablau.security.management.mail.api.MailMessageService;
import com.datablau.security.management.mail.api.MailTemplateService;
import com.datablau.security.management.mail.bo.MailParamBo;
import com.datablau.security.management.mail.contentholder.MailParamBoContentHolder;
import com.datablau.security.management.mail.enums.SceneEnum;
import com.google.common.collect.Lists;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 *
 * @author: hxs
 * @date: 2025/4/19 10:35
 */
@Service("dataModelVersionServiceExted")
@Primary
public class DataModelVersionServiceImplExt extends DataModelVersionServiceImpl implements DataModelVersionServiceExt, DataModelSyncUdpService {
    private static final Logger LOGGER = LoggerFactory.getLogger(DataModelVersionServiceImplExt.class);
    @Value("${datablau.kafka-topic.metadata-increment:datablau-metadata-increment}")
    private String metadataIncrementKafkaTopic;
    @Value("${notification.weact.url:http://10.39.7.17:8080/open-apis/message/v4/batch_send}")
    private String weactUrl;
    @Autowired
    private KafkaProducer kafkaProducer;
    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    protected DataObjectFullRepository fullRepository;

    @Autowired
    private MetadataUserDefinedPropertyRepository metadataUdpDao;

    @Autowired
    private MetadataUserDefinedPropertyValueRepository metadataUdpValDao;

    @Value("${syncTable.udp}")
    private String udpName;

    @Value("${topicSync.tableUdp}")
    private String syncTableUdpName;

    @Value("${topicSync.columnUdp}")
    private String syncColumnUdpName;

    @Autowired
    private DataObjectRepositoryExt dataObjectRepositoryExt;

    public DataModelVersionServiceImplExt(ModelVersionRepository modelVersionRepository) {
        super(modelVersionRepository);
    }

    @Override
    public void reverseEngineer(Long modelId, MetadataSyncJobDto syncJobDto, Boolean useResourceMode) throws Exception{
        //更新前版本的表&字段
        List<DataObject> oldVersion = fullRepository.findTypeByModelId(modelId, Arrays.asList(80000005L, 80000004L));

        Model model = this.dataModelService.getDataModelById(modelId);
        Map<String, Map<Long, String>> map = new HashMap<>();

        try {
            if (Strings.isNullOrEmpty(model.getMetaModelCode()) || "LDM".equals(model.getMetaModelCode())) {
                if (this.isFirstReverse(modelId)) {
                    if (this.workerManager.isFileType(model.getType())) {
                        this.innerReverseEngineerFileTypeDatasource(model, true);
                        return;
                    }
                    this.firstReverseEngineer(modelId);

                } else {
                    try {
                        this.setSyncType(syncJobDto.getSyncType());
                        Long versionId = this.incrementalReverseEngineerExt(modelId, useResourceMode, map, model);
                        if (versionId != null) {
                            this.dataModelService.countModelTableAndColumnInfo(modelId);
                            ModelVersion mv = this.getModelVersion(modelId, versionId);
                            if (mv == null) {
                                throw new IllegalArgumentException(GeneralUtility.getMessageService().getMessage("dataSourceNotFound", new Object[]{modelId, versionId}));
                            }

                            this.sendMailForMetadataSync(mv);
                        } else {
                            LOGGER.info("No new version has been generated");
                        }
                    } finally {
                        this.removeSyncType();
                    }
                }

            } else {
                this.reverseMetaModelData(modelId);
            }
        } finally {
            //获取当前最新的元数据信息
            List<DataObject> dataObjectList = super.dataObjectRepo.findObjectsOfModel(modelId, LDMTypes.oEntity);
            if (!CollectionUtils.isEmpty(dataObjectList)) {
                //获取数据库类型
                String type = model.getType();
                if (type.equalsIgnoreCase("CLICKHOUSE")) {
                    try {
                        List<MetadataUserDefinedPropertyValue> list = new ArrayList<>();
                        Map<String, MetadataUserDefinedProperty> udpMap = metadataUdpDao.findByNameIn(Arrays.asList(udpName.trim().split(","))).stream().collect(Collectors.toMap(m -> m.getName() + "-" + m.getTypeId(), m -> m));
                        LOGGER.info("获取到表的udp信息:{}", mapper.writeValueAsString(map));
                        LOGGER.info("获取到需要修改的udp名称：{}", mapper.writeValueAsString(udpMap));
                        List<String> udpNameList = Arrays.asList(udpName.trim().split(","));
                        if (CollectionUtils.isEmpty(udpNameList)) {
                            return;
                        }
                        for(DataObject object : dataObjectList) {
                            ObjectX objectX = object.getObjectX();
                            if (object.getTypeId().equals(LDMTypes.oEntity)) {
                                //获取创建时间
                                String createTime = "";
                                if (Objects.nonNull(objectX.getProperty(LDMTypes.pTarget))) {
                                    createTime = objectX.getProperty(LDMTypes.pTarget).toString();
                                }
                                createTime = getUdpNewValue(map, object, createTime, LDMTypes.pTarget);
                                getMetadataUserDefinedPropertyValue(list, udpMap.get("创建日期-" + LDMTypes.oEntity).getId(), object, createTime, String.valueOf(LDMTypes.oModelSource));
                            }
                            if (object.getTypeId().equals(LDMTypes.oEntity)) {
                                //获取修改时间
                                String updateTime = "";
                                if (Objects.nonNull(objectX.getProperty(LDMTypes.pInclusions))) {
                                    updateTime = objectX.getProperty(LDMTypes.pInclusions).toString();
                                }
                                updateTime = getUdpNewValue(map, object, updateTime, LDMTypes.pInclusions);
                                getMetadataUserDefinedPropertyValue(list, udpMap.get("修改日期-" + LDMTypes.oEntity).getId(), object, updateTime, String.valueOf(LDMTypes.oModelSource));
                            }
                            if (object.getTypeId().equals(LDMTypes.oEntity)) {
                                //获取存储大小
                                String storageSize = "";
                                if (Objects.nonNull(objectX.getProperty(LDMTypes.pExclusions))) {
                                    storageSize = objectX.getProperty(LDMTypes.pExclusions).toString();
                                }
                                storageSize = getUdpNewValue(map, object, storageSize, LDMTypes.pExclusions);
                                getMetadataUserDefinedPropertyValue(list, udpMap.get("存储大小-" + LDMTypes.oEntity).getId(), object, storageSize, String.valueOf(LDMTypes.oModelSource));
                            }
                            if (object.getTypeId().equals(LDMTypes.oEntity)) {
                                //获取数据量
                                String dataSize = "";
                                if (Objects.nonNull(objectX.getProperty(LDMTypes.pArchyObjectName))) {
                                    dataSize = objectX.getProperty(LDMTypes.pArchyObjectName).toString();
                                }
                                dataSize = getUdpNewValue(map, object, dataSize, LDMTypes.pArchyObjectName);
                                getMetadataUserDefinedPropertyValue(list, udpMap.get("数据量-" + LDMTypes.oEntity).getId(), object, dataSize, String.valueOf(LDMTypes.oModelSource));
                            }
                        }
                        if (!CollectionUtils.isEmpty(list)) {
                            metadataUdpValDao.saveAll(list);
                        }
                    } catch (Exception e) {
                        LOGGER.warn("datasource save udp error:{}", e);
                    }
                }
            }
        }
//        Model model = this.dataModelService.getDataModelById(modelId);
//        if (Strings.isNullOrEmpty(model.getMetaModelCode()) && "LDM".equals(model.getMetaModelCode())) {
//            if (this.isFirstReverse(modelId)) {
//                if (this.workerManager.isFileType(model.getType())) {
//                    this.innerReverseEngineerFileTypeDatasource(model, true);
//                    return;
//                }
//
//                this.firstReverseEngineer(modelId);
//            } else {
//                try {
//                    this.setSyncType(syncJobDto.getSyncType());
//                    Long versionId = this.incrementalReverseEngineer(modelId, useResourceMode);
//                    if (versionId != null) {
//                        this.dataModelService.countModelTableAndColumnInfo(modelId);
//                        ModelVersion mv = this.getModelVersion(modelId, versionId);
//                        if (mv == null) {
//                            throw new IllegalArgumentException(GeneralUtility.getMessageService().getMessage("dataSourceNotFound", new Object[]{modelId, versionId}));
//                        }
//
//                        this.sendMailForMetadataSync(mv);
//                    } else {
//                        LOGGER.info("No new version has been generated");
//                    }
//                } finally {
//                    this.removeSyncType();
//                }
//            }
//        }

        List<Long> newIds = new ArrayList<>();
        List<DataObject> newVersion = fullRepository.findTypeByModelId(modelId, Arrays.asList(80000005L, 80000004L));
        if(CollectionUtils.isEmpty(oldVersion)){
            newIds = newVersion.stream().map(DataObject::getObjectId).toList();
        }else {
            Map<Long, DataObject> oldDataObjectMap = oldVersion.stream().collect(Collectors.toMap(DataObject::getObjectId, a -> a));
            for (DataObject dataObject : newVersion) {
                DataObject oldObject = oldDataObjectMap.get(dataObject.getObjectId());
                if(oldObject == null){
                    newIds.add(dataObject.getObjectId());
                }else {
                    if(oldObject.getStartVersion() != dataObject.getStartVersion()){
                        newIds.add(dataObject.getObjectId());
                    }
                }
            }
        }
        this.tokafkaMetaDataIncrement(newIds);
    }

    private void tokafkaMetaDataIncrement(List<Long> result) {
        if(CollectionUtils.isEmpty(result)){
            LOGGER.info("没有产生新的ObjectId");
            return;
        }
        LOGGER.info("产生新的Id{}", result);
        kafkaProducer.sendMessage(metadataIncrementKafkaTopic, new MetaDataIncrementDto(result));
    }

    private String getUdpNewValue(Map<String, Map<Long, String>> map, DataObject object, String createTime, long key) {
        if (map.containsKey(object.getPhysicalName().toLowerCase())) {
            Map<Long, String> stringMap = map.get(object.getPhysicalName().toLowerCase());
            if (stringMap.containsKey(key)) {
                createTime = stringMap.get(key);
            }
        }
        return createTime;
    }

    private void getMetadataUserDefinedPropertyValue(List<MetadataUserDefinedPropertyValue> list, Long udpId, DataObject object, String sourceSystem, String containerType) {
        MetadataUserDefinedPropertyValue mv = new MetadataUserDefinedPropertyValue();
        mv.setItemId(object.getObjectId().toString());
        mv.setUdpId(udpId);
        mv.setContainerType(containerType);
        mv.setContainerId(containerType.equals(String.valueOf(LDMTypes.oModelSource))?String.valueOf(object.getModelId()):String.valueOf(object.getTableId()));
        mv.setValue(sourceSystem);
        mv.buildId();
        list.add(mv);
    }

    protected Long incrementalReverseEngineerExt(Long modelId, boolean useResourceMode, Map<String, Map<Long, String>> map, Model model) throws Exception {
        PerformanceLogger prefLogger = new PerformanceLogger(modelId, logREPerformance);
        try {
            prefLogger.startLog();
            objectUpdaterLock.startToUpdateModel(modelId);
            LOGGER.info("start to do incremental re");

            if (useResourceMode) {
                ModelX modelX = getDatasourceMetadataAndSaveToDB(modelId,
                        datasourceHelper.getDatasourcePropertiesByModelId(modelId));
                parseUdpMap(model, map, modelX);
                return comparePortionOfModels(modelX
                        , modelId);
            } else {
                return oldIncrementalReverseEngineerExt(modelId, map, model);
            }
        } finally {
            prefLogger.stopLog();
            elasticSearchService.cleanUselessDataObjects();
            objectUpdaterLock.finishUpdateModel(modelId);
            // Let It Be ...
            Runtime.getRuntime().gc();
        }
    }

    protected Long oldIncrementalReverseEngineerExt(Long modelId, Map<String, Map<Long, String>> map, Model model) throws Exception {
        ModelX modelX2 = this.getDBModelx(modelId);
        parseUdpMap(model, map, modelX2);
        return this.incrementalReverseEngineer(modelId, modelX2);
    }

    private void parseUdpMap(Model model, Map<String, Map<Long, String>> map, ModelX modelX) {
        if (model.getType().equalsIgnoreCase("CLICKHOUSE") || model.getType().equalsIgnoreCase("Hive")) {
            List<ObjectX> allObjects = modelX.getAllObjects();
            allObjects = allObjects.stream().filter(o -> o.getTypeId() == LDMTypes.oEntity).collect(Collectors.toList());
            for (ObjectX objectX : allObjects) {
                Map<Long, String> udpMap = new HashMap<>();
                map.put(objectX.getName().toLowerCase(), udpMap);
                if (Objects.nonNull(objectX.getProperty(LDMTypes.pTarget))) {
                    String createTime = objectX.getProperty(LDMTypes.pTarget).toString();
                    udpMap.put(LDMTypes.pTarget, createTime);
                }
                if (Objects.nonNull(objectX.getProperty(LDMTypes.pInclusions))) {
                    String updateTime = objectX.getProperty(LDMTypes.pInclusions).toString();
                    udpMap.put(LDMTypes.pInclusions, updateTime);
                }
                if (Objects.nonNull(objectX.getProperty(LDMTypes.pExclusions))) {
                    String storageSize = objectX.getProperty(LDMTypes.pExclusions).toString();
                    udpMap.put(LDMTypes.pExclusions, storageSize);
                }
                if (Objects.nonNull(objectX.getProperty(LDMTypes.pArchyObjectName))) {
                    String dataSize = objectX.getProperty(LDMTypes.pArchyObjectName).toString();
                    udpMap.put(LDMTypes.pArchyObjectName, dataSize);
                }
            }


        }
    }

    @Override
    public void syncDataModelUdp(TableMetadataMessageDto dto) {
        LOGGER.info("start consum message");
        try {
            if (Objects.isNull(dto) || CollectionUtils.isEmpty(dto.getTableList())) {
                return;
            }
            List<TableMetadataMessageDto.TableInfo> tableList = dto.getTableList();
            Set<String> databaseSet = tableList.stream().map(t -> t.getDatabase()).collect(Collectors.toSet());
            //通过schema获取元数据信息
            List<DataObject> dataObjectList = dataObjectRepositoryExt.findAllBySchemaIn(databaseSet);
            Map<String, DataObject> schemaAndTableMap = dataObjectList.stream().collect(Collectors.toMap(d -> d.getSchema() + "--" + d.getPhysicalName(), d -> d));
            Map<String, DataObject> schemaTableAndColumnMap = dataObjectList.stream().filter(d -> d.getTypeId().equals(LDMTypes.oAttribute)).
                    collect(Collectors.toMap(d -> d.getSchema() + "--" + d.getParentPhysicalName() + "--" + d.getPhysicalName(), d -> d));
            //获取udp信息
            Map<String, MetadataUserDefinedProperty> tableUdpMap = metadataUdpDao.findByNameIn(Arrays.asList(syncTableUdpName.trim().split(","))).stream().collect(Collectors.toMap(m -> m.getName() + "-" + m.getTypeId(), m -> m));
            Map<String, MetadataUserDefinedProperty> columnUdpMap = metadataUdpDao.findByNameIn(Arrays.asList(syncColumnUdpName.trim().split(","))).stream().collect(Collectors.toMap(m -> m.getName() + "-" + m.getTypeId(), m -> m));
            if (CollectionUtils.isEmpty(tableUdpMap) || CollectionUtils.isEmpty(columnUdpMap)) {
                return;
            }
            String[] tableUdp = syncTableUdpName.trim().split(",");
            String[] columnUdp = syncColumnUdpName.trim().split(",");
            List<MetadataUserDefinedPropertyValue> list = new ArrayList<>();
            for (TableMetadataMessageDto.TableInfo tableInfo : tableList) {
                List<TableMetadataMessageDto.FieldInfo> fieldList = tableInfo.getFieldList();
                //先处理表的udp
                Map<String, String> attributeValue = tableInfo.getAttributeValue();
                String businessDescription = attributeValue.get("businessDescription");
                String database = tableInfo.getDatabase();
                String tableEnglishName = tableInfo.getTableEnglishName();
                if (!schemaAndTableMap.containsKey(database + "--" + tableEnglishName)) {
                    continue;
                }
                DataObject object = schemaAndTableMap.get(database + "--" + tableEnglishName);
                //业务描述
                if (StringUtils.isNotEmpty(businessDescription)) {
                    getMetadataUserDefinedPropertyValue(list, tableUdpMap.get(tableUdp[0] + LDMTypes.oEntity).getId(), object, businessDescription, String.valueOf(LDMTypes.oModelSource));
                }
                //使用描述
                String useDescription = attributeValue.get("useDescription");
                if (StringUtils.isNotEmpty(useDescription)) {
                    getMetadataUserDefinedPropertyValue(list, tableUdpMap.get(tableUdp[1] + LDMTypes.oEntity).getId(), object, useDescription, String.valueOf(LDMTypes.oModelSource));
                }
                //业务域
                String businessDomain = attributeValue.get("businessDomain");
                if (StringUtils.isNotEmpty(businessDomain)) {
                    getMetadataUserDefinedPropertyValue(list, tableUdpMap.get(tableUdp[2] + LDMTypes.oEntity).getId(), object, businessDomain, String.valueOf(LDMTypes.oModelSource));
                }
                //安全级别
                String securityLevel = attributeValue.get("securityLevel");
                if (StringUtils.isNotEmpty(securityLevel)) {
                    getMetadataUserDefinedPropertyValue(list, tableUdpMap.get(tableUdp[3] + LDMTypes.oEntity).getId(), object, securityLevel, String.valueOf(LDMTypes.oModelSource));
                }
                //数据域
                String dataDomain = attributeValue.get("dataDomain");
                if (StringUtils.isNotEmpty(dataDomain)) {
                    getMetadataUserDefinedPropertyValue(list, tableUdpMap.get(tableUdp[4] + LDMTypes.oEntity).getId(), object, dataDomain, String.valueOf(LDMTypes.oModelSource));
                }
                //业务过程
                String businessProcess = attributeValue.get("businessProcess");
                if (StringUtils.isNotEmpty(businessProcess)) {
                    getMetadataUserDefinedPropertyValue(list, tableUdpMap.get(tableUdp[5] + LDMTypes.oEntity).getId(), object, businessProcess, String.valueOf(LDMTypes.oModelSource));
                }
                //负责人
                String tableManager = tableInfo.getTableManager();
                if (StringUtils.isNotEmpty(tableManager)) {
                    getMetadataUserDefinedPropertyValue(list, tableUdpMap.get(tableUdp[6] + LDMTypes.oEntity).getId(), object, tableManager, String.valueOf(LDMTypes.oModelSource));
                }
                //创建日期
                String creationDate = tableInfo.getCreationDate();
                if (StringUtils.isNotEmpty(creationDate)) {
                    getMetadataUserDefinedPropertyValue(list, tableUdpMap.get(tableUdp[7] + LDMTypes.oEntity).getId(), object, creationDate, String.valueOf(LDMTypes.oModelSource));
                }
                //修改日期
                String modificationDate = tableInfo.getModificationDate();
                if (StringUtils.isNotEmpty(modificationDate)) {
                    getMetadataUserDefinedPropertyValue(list, tableUdpMap.get(tableUdp[8] + LDMTypes.oEntity).getId(), object, modificationDate, String.valueOf(LDMTypes.oModelSource));
                }

                //处理字段
                for (TableMetadataMessageDto.FieldInfo fieldInfo : fieldList) {
                    String fieldCode = fieldInfo.getFieldCode();
                    if (!schemaTableAndColumnMap.containsKey(database + "--" + tableEnglishName + "--" + fieldCode)) {
                        continue;
                    }
                    DataObject dataObject = schemaTableAndColumnMap.get(database + "--" + tableEnglishName + "--" + fieldCode);
                    //是否分区字段
                    Map<String, String> fieldInfoAttributeValue = fieldInfo.getAttributeValue();
                    String isPatytionField = fieldInfoAttributeValue.get("isPatytionField");
                    if (StringUtils.isNotEmpty(isPatytionField)) {
                        getMetadataUserDefinedPropertyValue(list, columnUdpMap.get(columnUdp[0] + LDMTypes.oAttribute).getId(), dataObject, isPatytionField, String.valueOf(LDMTypes.oEntity));
                    }
                    //安全级别
                    String level = fieldInfoAttributeValue.get("securityLevel");
                    if (StringUtils.isNotEmpty(level)) {
                        getMetadataUserDefinedPropertyValue(list, columnUdpMap.get(columnUdp[1] + LDMTypes.oAttribute).getId(), dataObject, level, String.valueOf(LDMTypes.oEntity));
                    }
                    //默认值
                    String defaultValue = fieldInfoAttributeValue.get("defaultValue");
                    if (StringUtils.isNotEmpty(defaultValue)) {
                        getMetadataUserDefinedPropertyValue(list, columnUdpMap.get(columnUdp[2] + LDMTypes.oAttribute).getId(), dataObject, defaultValue, String.valueOf(LDMTypes.oEntity));
                    }
                    //字段枚举
                    String enumeration = fieldInfoAttributeValue.get("enumeration");
                    if (StringUtils.isNotEmpty(enumeration)) {
                        getMetadataUserDefinedPropertyValue(list, columnUdpMap.get(columnUdp[3] + LDMTypes.oAttribute).getId(), dataObject, enumeration, String.valueOf(LDMTypes.oEntity));
                    }
                }

            }

            if (!CollectionUtils.isEmpty(list)) {
                metadataUdpValDao.saveAll(list);
            }
        } catch (Exception e) {
            LOGGER.error("sync udp fail:{}", e);
        }

    }

    protected class PerformanceLogger implements Runnable {

        Logger logger = LoggerFactory.getLogger("performance");
        Long modelId;
        volatile boolean stopped = false;
        Long startTime;
        boolean logPerf = false;

        PerformanceLogger(Long modelId, boolean logPerf) {
            this.modelId = modelId;
            this.logPerf = logPerf;
        }

        void startLog() {
            if (logPerf) {
                Thread t = new Thread(this);
                t.setDaemon(true);
                t.setName("INCR-PERF-" + modelId);
                t.start();
                this.startTime = System.currentTimeMillis();
                logger.info(
                        "****************************START****************************************");
            }
        }

        void stopLog() {
            if (logPerf) {
                this.stopped = true;
                logger.info(
                        "total run time: " + ((System.currentTimeMillis() - this.startTime) / 1000));
            }
        }

        @Override
        public void run() {
            while (!stopped) {
                try {
                    Thread.sleep(3000);
                    long total = Runtime.getRuntime().totalMemory() / 1024 / 1024;
                    long free = Runtime.getRuntime().freeMemory() / 1024 / 1024;
                    logger.info("total: " + total + "MB, free: " + free + "MB");
                } catch (Exception ex) {
                    logger.info("perf thread interrupted");
                    break;
                }
            }
        }
    }


    @Override
    public void sendMailForMetadataSync(ModelVersion mv) throws Exception {
        LineageMappingService mappingService = BeanHelper.getBean(LineageMappingService.class);
        MailMessageService mailService = BeanHelper.getBean(MailMessageService.class);
        DataModelService dataModelService = BeanHelper.getBean(DataModelService.class);
        DataObjectService dataObjectService = BeanHelper.getBean(DataObjectService.class);
        SubscribeService subsService = (SubscribeService) BeanHelper.getBeanByName("subscribeService");
        MailTemplateService templateService = BeanHelper.getBean(MailTemplateService.class);
        ExcelService excelService = BeanHelper.getBean(ExcelService.class);
        FavoriteService favoriteService = (FavoriteService) BeanHelper
                .getBeanByName("favoriteService");
        ModelCategoryService modelCategoryService = (ModelCategoryService) BeanHelper
                .getBeanByName("modelCategoryService");

        String cpmr = mv.getVersionDelta();
        if (cpmr != null) {
            CCompareDto result = mapper.readValue(cpmr, CCompareDto.class);

            Long modelId = mv.getModelId();
            Model model = dataModelService.getModelByIdUnsafe(modelId);

            if (model == null) {
                throw new IllegalArgumentException(
                        GeneralUtility.getMessageService().getMessage("dataSourceNotExist", modelId));
            }

            String modelName = model.getDefinition();

            List<String> users = new ArrayList<>();
            //需要发送WeACT 消息的用户
            List<String> needWeACTUsers = new ArrayList<>();
            //todo  根据modelId获取数据源负责人(数据源所属系统负责人)        √
            Map<Long, String> owners = dataObjectService
                    .getObjectOwners(Lists.newArrayList(modelId));
            users.add(owners.get(modelId));
            needWeACTUsers.add(owners.get(modelId));
            //todo  根据modelId获取数据源所属系统负责人                    √
            ModelCategoryDto modelCategory = modelCategoryService
                    .getModelCategory(model.getCategoryId());
            users.add(modelCategory.getOwner());
            //todo  根据modelId获取数据源订阅人                           √]
            if (model.getParentId() != null) {
                List<String> pUser = subsService
                        .getUsernamesByTypedObject(model.getParentId().toString(), LDMTypes.oModelSource, 0);
                if (!pUser.isEmpty()) {
                    users.addAll(pUser);
                    needWeACTUsers.addAll(pUser);
                }
            }
            // 发送WeACT消息
            sendMsgToWeACT(modelName, needWeACTUsers);

            //获取下游数据源订阅人
            for (Long lineageModelId : mappingService.getAllModelIds(result.getLineage())) {
                users.addAll(subsService
                        .getUsernamesByTypedObject(lineageModelId.toString(), LDMTypes.oModelSource,
                                0));
            }

            // 获取元数据收藏用户
            //获取变更元数据id
            List<String> modifiedObjectIds = result.getModifiedObjectIds()
                    .stream().map(objectId -> objectId.toString()).collect(Collectors.toList());
            //获取下游影响字段id
            Set<String> lineageCols = mappingService.getAllMetadataIds(result.getLineage());
            modifiedObjectIds.addAll(lineageCols);
            List<Long> modifiedTypeIds = Lists
                    .newArrayList(LDMTypes.oEntity, LDMTypes.oAttribute, LDMTypes.oKeyGroup,
                            LDMTypes.oView, LDMTypes.oFunction, LDMTypes.oStoredProcedure,
                            LDMTypes.oPackage);

            FavoriteQueryCriteria favoriteQueryCriteria = new FavoriteQueryCriteria();
            favoriteQueryCriteria.setQueryByItemIds(modifiedObjectIds);
            favoriteQueryCriteria.setQueryByTypeIds(modifiedTypeIds);
            List<FavoriteDto> favorites = favoriteService.getFavorites(favoriteQueryCriteria);
            List<String> favoriteOwner = favorites.stream().map(FavoriteDto::getOwner).distinct()
                    .collect(Collectors.toList());
            users.addAll(favoriteOwner);

            // 根据modelId获取数据源下元数据血缘关系中的下游系统负责人  dam_lineage_bind(死循环)
            Set<Long> modelCategoryIds = mappingService.getAllModelCategoryIds(
                    result.getLineage());

//            List<Long> downModelIdList = dataObjectService.getDownModelIdsByModelId(Lists.newArrayList(modelId),Lists.newArrayList());
            List<String> downUserList = modelCategoryIds.stream().map(modelCategoryId -> {
                ModelCategoryDto downModelCategory = modelCategoryService
                        .getModelCategory(modelCategoryId);
                return downModelCategory.getOwner();
            }).distinct().collect(Collectors.toList());
            users.addAll(downUserList);
            users = users.stream().filter(org.apache.commons.lang3.StringUtils::isNotBlank)
                    .distinct().collect(Collectors.toList());

            List<String> receivers = new ArrayList<>(mailService.getEmailFromUsernames(users));
            if (receivers.size() == 0) {
                LOGGER.info("No recipient, unable to send discrepancy report");
                return;
            }

            List<byte[]> files = new ArrayList<>();
            List<String> fileNames = new ArrayList<>();

            //Workbook cmpWb = dmvService.exportCompareResult(result);
            CompareResultExporter crExporter = new CompareResultExporter(result,
                    msgService.getMessage("exportCompareResult.obj.lVersion"), mv.getVersionName());
            XSSFWorkbook cmpWb = crExporter.exportCompareResult();

            File cmpResult = excelService
                    .generalFileByWorkbook(cmpWb, msgService.getMessage("exportCompareResult.file.diff", modelName));
            if (cmpResult != null) {
                files.add(FileUtils.readFileToByteArray(cmpResult));
                fileNames.add(msgService.getMessage("exportCompareResult.file.lineage", modelName));
            }

            File lineage = mappingService.exportLineageContainerToExcel(result.getLineage());
            if (lineage != null) {
                files.add(FileUtils.readFileToByteArray(lineage));
                fileNames.add(msgService.getMessage("exportCompareResult.file.update", modelName));
            }
            LOGGER.info("Send a data source change report to " + String.join(",", receivers));

            //获取参数对象上下文信息
            List<MailParamBo> boList = MailParamBoContentHolder.getContentHolder();
            //做各个场景下参数的转换
            List<MailParamBo> convertList = users.stream().map(userName -> {
                MailParamBo bo = new MailParamBo();
                bo.setReceivers(Lists
                        .newArrayList(mailService.getEmailFromUsernames(Lists.newArrayList(userName))));
                bo.setFiles(files);
                bo.setFileNames(fileNames);
                //前端可用参数
                bo.setReceiverName(userName);
                bo.setSourceName(modelName);
                bo.setVersion(mv.getVersionName());
                return bo;
            }).collect(Collectors.toList());
            boList.addAll(convertList);

            //发送邮件,定义好场景模板映射关系
            boList.forEach(bo -> {
                templateService.sendMail(SceneEnum.METADATASYNCJOBSCENE.getSceneId(), 1, bo);
            });
            //清除上下文参数对象
            MailParamBoContentHolder.remove();
            //mailService.publishMessage(receivers, subject, body, false, files, fileNames);
        } else {
            LOGGER.info("The data source has not changed, do not send change emails");
        }
    }

    @Override
    public void sendMailForMetaModelDataSync(ModelVersion mv, ModelX metaModelX) throws Exception {
        LineageMappingService mappingService = BeanHelper.getBean(LineageMappingService.class);
        MailMessageService mailService = BeanHelper.getBean(MailMessageService.class);
        DataModelService dataModelService = BeanHelper.getBean(DataModelService.class);
        DataObjectService dataObjectService = BeanHelper.getBean(DataObjectService.class);
        SubscribeService subsService = (SubscribeService) BeanHelper.getBeanByName("subscribeService");
        MailTemplateService templateService = BeanHelper.getBean(MailTemplateService.class);
        ExcelService excelService = BeanHelper.getBean(ExcelService.class);
        FavoriteService favoriteService = (FavoriteService) BeanHelper
                .getBeanByName("favoriteService");
        ModelCategoryService modelCategoryService = (ModelCategoryService) BeanHelper
                .getBeanByName("modelCategoryService");

        String cpmr = mv.getVersionDelta();
        if (cpmr != null) {
            CCompareDto result = mapper.readValue(cpmr, CCompareDto.class);

            Long modelId = mv.getModelId();
            Model model = dataModelService.getModelByIdUnsafe(modelId);

            if (model == null) {
                throw new IllegalArgumentException(
                        GeneralUtility.getMessageService().getMessage("dataSourceNotExist", modelId));
            }

            String modelName = model.getDefinition();
            List<String> users = new ArrayList<>();
            //需要发送WeACT 消息的用户
            // 根据modelId获取数据源负责人(数据源所属系统负责人)        √
            Map<Long, String> owners = dataObjectService
                    .getObjectOwners(Lists.newArrayList(modelId));
            users.add(owners.get(modelId));
            // 根据modelId获取数据源所属系统负责人                    √
            ModelCategoryDto modelCategory = modelCategoryService
                    .getModelCategory(model.getCategoryId());
            users.add(modelCategory.getOwner());
            // 根据modelId获取数据源订阅人                           √]
            if (model.getDatasourceId() != null) {
                List<String> pUser = subsService
                        .getUsernamesByTypedObject(model.getDatasourceId().toString(), LDMTypes.oModelSource, 0);
                if (!pUser.isEmpty()) {
                    users.addAll(pUser);
                }
            }
            // 获取元数据收藏用户
            //获取变更元数据id
            List<String> modifiedObjectIds = result.getModifiedObjectIds()
                    .stream().map(Object::toString).collect(Collectors.toList());
            //获取下游影响字段id
            Set<String> lineageCols = mappingService.getAllMetadataIds(result.getLineage());
            modifiedObjectIds.addAll(lineageCols);

            FavoriteQueryCriteria favoriteQueryCriteria = new FavoriteQueryCriteria();
            favoriteQueryCriteria.setQueryByItemIds(modifiedObjectIds);
            List<FavoriteDto> favorites = favoriteService.getFavorites(favoriteQueryCriteria);
            List<String> favoriteOwner = favorites.stream().map(FavoriteDto::getOwner).distinct().toList();
            users.addAll(favoriteOwner);


            users = users.stream().filter(org.apache.commons.lang3.StringUtils::isNotBlank)
                    .distinct().collect(Collectors.toList());

            // 发送WeACT消息
            sendMsgToWeACT(modelName, users);

            List<String> receivers = new ArrayList<>(mailService.getEmailFromUsernames(users));
            if (receivers.isEmpty()) {
                LOGGER.info("No recipient, unable to send discrepancy report");
                return;
            }

            List<byte[]> files = new ArrayList<>();
            List<String> fileNames = new ArrayList<>();

            CompareResultExporter crExporter = new CompareResultExporter(result, mv.getVersionName(),
                    msgService.getMessage("exportCompareResult.obj.lVersion"), metaModelX);
            XSSFWorkbook cmpWb = crExporter.exportCompareResult();

            File cmpResult = excelService.generalFileByWorkbook(cmpWb, msgService.getMessage("exportCompareResult.file.diff", modelName));
            if (cmpResult != null) {
                files.add(FileUtils.readFileToByteArray(cmpResult));
                fileNames.add(msgService.getMessage("exportCompareResult.file.lineage", modelName));
            }


            LOGGER.info("Send a data source change report to " + String.join(",", receivers));

            //获取参数对象上下文信息
            List<MailParamBo> boList = MailParamBoContentHolder.getContentHolder();
            //做各个场景下参数的转换
            List<MailParamBo> convertList = users.stream().map(userName -> {
                MailParamBo bo = new MailParamBo();
                bo.setReceivers(Lists
                        .newArrayList(mailService.getEmailFromUsernames(Lists.newArrayList(userName))));
                bo.setFiles(files);
                bo.setFileNames(fileNames);
                //前端可用参数
                bo.setReceiverName(userName);
                bo.setSourceName(modelName);
                bo.setVersion(mv.getVersionName());
                return bo;
            }).toList();
            boList.addAll(convertList);

            //发送邮件,定义好场景模板映射关系
            boList.forEach(bo -> {
                templateService.sendMail(SceneEnum.METADATASYNCJOBSCENE.getSceneId(), 1, bo);
            });
            //清除上下文参数对象
            MailParamBoContentHolder.remove();
            //mailService.publishMessage(receivers, subject, body, false, files, fileNames);
        } else {
            LOGGER.info("The data source has not changed, do not send change emails");
        }
    }


    /***
     * @description 给数据源订阅人和负责人发送元数据变更消息
     * @params [modelName, users]
     * @return void
     * @author:
     * @date 2025/6/24-18:53
     */
    public void sendMsgToWeACT(String modelName, List<String> users) {
        if (users == null || users.isEmpty()) {
            return;
        }
        for (String userName : users) {
            Map<Object, Object> contentWrapper = Map.of(
                    "title", "元数据变更提醒 系统:数据架构",
                    "content", "【" + modelName + "】元数据信息发生变更"
            );
            sendToWeAct(userName, "元数据变更", "post", Map.of(
                    "zh_cn", contentWrapper));
        }

    }


    /*
receive_id_type: 'open_id, user_id, union_id, email, chat_id'
{
    msg_type: '消息类型 包括：text、post、image、file、audio、media、sticker、interactive、share_chat、share_user等，类型定义请参考发送消息内容示例值："text"',
    content: '消息内容，JSON结构序列化后的字符串。不同msg_type对应不同内容，具体格式说明参考：发送消息内容注意：JSON字符串需进行转义，如换行符转义后为\\n文本消息请求体最大不能超过150KB卡片及富文本消息请求体最大不能超过30KB示例值："{\"text\":\"test content\"}"'
    uuid: '',
    receive_id: ''
}
* */
    private void sendToWeAct(String user, String name, String msgType, Map content) {
        UserService userService = (UserService) BeanHelper.getBeanByName("userService");
        UserDetails userDetails = userService.getUserDetails(user);
        String userID = null;
        if (userDetails != null && userDetails.getAdditionalProperties() != null) {
            userID = userDetails.getAdditionalProperties().getOrDefault("userId", "").toString();
        }
        if (StringUtils.isEmpty(userID)) {
            LOGGER.error("元数据变更[{}]，通知weact用户失败：{}", name, user);
            return;
//            userID = "T9068610";
        }
        // 组装参数
        String _content = JsonUtils.toJSon(content);
        Map<String, Object> requestBody = Map.of(
                "msg_type", msgType,
                "content", _content,
                "uuid", new Date().getTime() + "",
                "receive_id", userID
        );
        MultiValueMap<String, String> headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        HttpEntity request = new HttpEntity(requestBody, headers);
        String formatUrl = String.format("%s?receive_id_type=%s", weactUrl, "user_id");
        Map<String, Object> responseMap = restTemplate.postForObject(formatUrl, request, Map.class);
        if (responseMap.containsKey("code") && Objects.equals(responseMap.get("code"), 0)) {
            LOGGER.info("元数据变更[{}]，通知weact用户：{}", name, user);
        } else {
            LOGGER.error("元数据变更[{}]，通知weact用户：{}，返回失败：{}, 请求参数：{}", name, user, responseMap, requestBody);
        }
    }
}
