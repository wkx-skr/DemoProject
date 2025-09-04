//package com.datablau.metadata.main.impl;
//
//import com.andorj.common.core.model.LDMTypes;
//import com.andorj.common.core.model.ModelX;
//import com.andorj.common.core.model.ObjectX;
//import com.andorj.model.common.utility.GeneralUtility;
//import com.datablau.metadata.main.dao.model.ModelVersionRepository;
//import com.datablau.metadata.main.dto.model.MetadataSyncJobDto;
//import com.datablau.metadata.main.entity.metadata.DataObject;
//import com.datablau.metadata.main.entity.model.Model;
//import com.datablau.metadata.main.entity.model.ModelVersion;
//import com.datablau.metadata.main.service.model.impl.DataModelVersionServiceImpl;
//import com.datablau.udp.jpa.entity.MetadataUserDefinedProperty;
//import com.datablau.udp.jpa.entity.MetadataUserDefinedPropertyValue;
//import com.datablau.udp.jpa.repository.MetadataUserDefinedPropertyRepository;
//import com.datablau.udp.jpa.repository.MetadataUserDefinedPropertyValueRepository;
//import com.google.common.base.Strings;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Primary;
//import org.springframework.stereotype.Service;
//import org.springframework.util.CollectionUtils;
//
//import java.util.*;
//import java.util.stream.Collectors;
//
///**
// * @ClassName：DataModelVersionServiceImplExt
// * @Author: dingzicheng
// * @Date: 2025/6/22 13:08
// * @Description: 必须描述类做什么事情, 实现什么功能
// */
//@Service("dataModelVersionServiceExt")
//@Primary
//public class DataModelVersionServiceImplExt extends DataModelVersionServiceImpl {
//    private static final Logger LOGGER = LoggerFactory.getLogger(DataModelVersionServiceImplExt.class);
//
//    @Autowired
//    private MetadataUserDefinedPropertyRepository metadataUdpDao;
//
//    @Autowired
//    private MetadataUserDefinedPropertyValueRepository metadataUdpValDao;
//
//    @Value("${syncTable.udp}")
//    private String udpName;
//
//    public DataModelVersionServiceImplExt(ModelVersionRepository modelVersionRepository) {
//        super(modelVersionRepository);
//    }
//
//    @Override
//    public void reverseEngineer(Long modelId, MetadataSyncJobDto syncJobDto, Boolean useResourceMode) throws Exception {
//        Model model = this.dataModelService.getDataModelById(modelId);
//        Map<String, Map<Long, String>> map = new HashMap<>();
//
//        try {
//            if (Strings.isNullOrEmpty(model.getMetaModelCode()) || "LDM".equals(model.getMetaModelCode())) {
//                if (this.isFirstReverse(modelId)) {
//                    if (this.workerManager.isFileType(model.getType())) {
//                        this.innerReverseEngineerFileTypeDatasource(model, true);
//                        return;
//                    }
//                    this.firstReverseEngineer(modelId);
//
//                } else {
//                    try {
//                        this.setSyncType(syncJobDto.getSyncType());
//                        Long versionId = this.incrementalReverseEngineerExt(modelId, useResourceMode, map, model);
//                        if (versionId != null) {
//                            this.dataModelService.countModelTableAndColumnInfo(modelId);
//                            ModelVersion mv = this.getModelVersion(modelId, versionId);
//                            if (mv == null) {
//                                throw new IllegalArgumentException(GeneralUtility.getMessageService().getMessage("dataSourceNotFound", new Object[]{modelId, versionId}));
//                            }
//
//                            this.sendMailForMetadataSync(mv);
//                        } else {
//                            LOGGER.info("No new version has been generated");
//                        }
//                    } finally {
//                        this.removeSyncType();
//                    }
//                }
//
//            }
//        } finally {
//            //获取当前最新的元数据信息
//            List<DataObject> dataObjectList = super.dataObjectRepo.findObjectsOfModel(modelId, LDMTypes.oEntity);
//            if (!CollectionUtils.isEmpty(dataObjectList)) {
//                //获取数据库类型
//                String type = model.getType();
//                if (type.equalsIgnoreCase("CLICKHOUSE")) {
//                    try {
//                        List<MetadataUserDefinedPropertyValue> list = new ArrayList<>();
//                        Map<String, MetadataUserDefinedProperty> udpMap = metadataUdpDao.findByNameIn(Arrays.asList(udpName.trim().split(","))).stream().collect(Collectors.toMap(m -> m.getName() + "-" + m.getTypeId(), m -> m));
//                        LOGGER.info("获取到表的udp信息:{}", mapper.writeValueAsString(map));
//                        List<String> udpNameList = Arrays.asList(udpName.trim().split(","));
//                        if (CollectionUtils.isEmpty(udpNameList)) {
//                            return;
//                        }
//                        for(DataObject object : dataObjectList) {
//                            ObjectX objectX = object.getObjectX();
//                            if (object.getTypeId().equals(LDMTypes.oEntity) && Objects.nonNull(objectX.getProperty(70000000L))) {
//                                //获取创建时间
//                                String createTime = objectX.getProperty(70000001L).toString();
//                                createTime = getUdpNewValue(map, object, createTime, 70000001L);
//                                getMetadataUserDefinedPropertyValue(list, udpMap.get("创建日期-" + LDMTypes.oEntity).getId(), object, createTime, String.valueOf(LDMTypes.oModelSource));
//                            }
//                            if (object.getTypeId().equals(LDMTypes.oEntity) && Objects.nonNull(objectX.getProperty(70000002L))) {
//                                //获取修改时间
//                                String updateTime = objectX.getProperty(70000002L).toString();
//                                updateTime = getUdpNewValue(map, object, updateTime, 70000002L);
//                                getMetadataUserDefinedPropertyValue(list, udpMap.get("修改日期-" + LDMTypes.oEntity).getId(), object, updateTime, String.valueOf(LDMTypes.oModelSource));
//                            }
//                            if (object.getTypeId().equals(LDMTypes.oEntity) && Objects.nonNull(objectX.getProperty(70000003L))) {
//                                //获取存储大小
//                                String storageSize = objectX.getProperty(70000003L).toString();
//                                storageSize = getUdpNewValue(map, object, storageSize, 70000003L);
//                                getMetadataUserDefinedPropertyValue(list, udpMap.get("存储大小-" + LDMTypes.oEntity).getId(), object, storageSize, String.valueOf(LDMTypes.oModelSource));
//                            }
//                            if (object.getTypeId().equals(LDMTypes.oEntity) && Objects.nonNull(objectX.getProperty(70000004L))) {
//                                //获取数据量
//                                String dataSize = objectX.getProperty(70000004L).toString();
//                                dataSize = getUdpNewValue(map, object, dataSize, 70000004L);
//                                getMetadataUserDefinedPropertyValue(list, udpMap.get("数据量-" + LDMTypes.oEntity).getId(), object, dataSize, String.valueOf(LDMTypes.oModelSource));
//                            }
//                        }
//                        if (!CollectionUtils.isEmpty(list)) {
//                            metadataUdpValDao.saveAll(list);
//                        }
//                    } catch (Exception e) {
//                        LOGGER.warn("datasource save udp error:{}", e);
//                    }
//                }
//            }
//        }
//    }
//
//    private String getUdpNewValue(Map<String, Map<Long, String>> map, DataObject object, String createTime, long key) {
//        if (map.containsKey(object.getPhysicalName().toLowerCase())) {
//            Map<Long, String> stringMap = map.get(object.getPhysicalName().toLowerCase());
//            if (stringMap.containsKey(key)) {
//                createTime = stringMap.get(key);
//            }
//        }
//        return createTime;
//    }
//
//    private void parseUdpMap(Model model, Map<String, Map<Long, String>> map, ModelX modelX) {
//        if (model.getType().equalsIgnoreCase("CLICKHOUSE") || model.getType().equalsIgnoreCase("Hive")) {
//            List<ObjectX> allObjects = modelX.getAllObjects();
//            allObjects = allObjects.stream().filter(o -> o.getTypeId() == LDMTypes.oEntity).collect(Collectors.toList());
//            for (ObjectX objectX : allObjects) {
//                Map<Long, String> udpMap = new HashMap<>();
//                map.put(objectX.getName().toLowerCase(), udpMap);
//                if (Objects.nonNull(objectX.getProperty(70000001L))) {
//                    String createTime = objectX.getProperty(70000001L).toString();
//                    udpMap.put(70000001L, createTime);
//                }
//                if (Objects.nonNull(objectX.getProperty(70000002L))) {
//                    String updateTime = objectX.getProperty(70000002L).toString();
//                    udpMap.put(70000002L, updateTime);
//                }
//                if (Objects.nonNull(objectX.getProperty(70000003L))) {
//                    String storageSize = objectX.getProperty(70000003L).toString();
//                    udpMap.put(70000003L, storageSize);
//                }
//                if (Objects.nonNull(objectX.getProperty(70000004L))) {
//                    String dataSize = objectX.getProperty(70000004L).toString();
//                    udpMap.put(70000004L, dataSize);
//                }
//            }
//
//
//        }
//    }
//
//    protected Long incrementalReverseEngineerExt(Long modelId, boolean useResourceMode, Map<String, Map<Long, String>> map, Model model) throws Exception {
//        PerformanceLogger prefLogger = new PerformanceLogger(modelId, logREPerformance);
//        try {
//            prefLogger.startLog();
//            objectUpdaterLock.startToUpdateModel(modelId);
//            LOGGER.info("start to do incremental re");
//
//            if (useResourceMode) {
//                ModelX modelX = getDatasourceMetadataAndSaveToDB(modelId,
//                        datasourceHelper.getDatasourcePropertiesByModelId(modelId));
//                parseUdpMap(model, map, modelX);
//                return comparePortionOfModels(modelX
//                        , modelId);
//            } else {
//                return oldIncrementalReverseEngineerExt(modelId, map, model);
//            }
//        } finally {
//            prefLogger.stopLog();
//            elasticSearchService.cleanUselessDataObjects();
//            objectUpdaterLock.finishUpdateModel(modelId);
//            // Let It Be ...
//            Runtime.getRuntime().gc();
//        }
//    }
//
//    protected Long oldIncrementalReverseEngineerExt(Long modelId, Map<String, Map<Long, String>> map, Model model) throws Exception {
//        ModelX modelX2 = this.getDBModelx(modelId);
//        parseUdpMap(model, map, modelX2);
//        return this.incrementalReverseEngineer(modelId, modelX2);
//    }
//
//    protected class PerformanceLogger implements Runnable {
//
//        Logger logger = LoggerFactory.getLogger("performance");
//        Long modelId;
//        volatile boolean stopped = false;
//        Long startTime;
//        boolean logPerf = false;
//
//        PerformanceLogger(Long modelId, boolean logPerf) {
//            this.modelId = modelId;
//            this.logPerf = logPerf;
//        }
//
//        void startLog() {
//            if (logPerf) {
//                Thread t = new Thread(this);
//                t.setDaemon(true);
//                t.setName("INCR-PERF-" + modelId);
//                t.start();
//                this.startTime = System.currentTimeMillis();
//                logger.info(
//                        "****************************START****************************************");
//            }
//        }
//
//        void stopLog() {
//            if (logPerf) {
//                this.stopped = true;
//                logger.info(
//                        "total run time: " + ((System.currentTimeMillis() - this.startTime) / 1000));
//            }
//        }
//
//        @Override
//        public void run() {
//            while (!stopped) {
//                try {
//                    Thread.sleep(3000);
//                    long total = Runtime.getRuntime().totalMemory() / 1024 / 1024;
//                    long free = Runtime.getRuntime().freeMemory() / 1024 / 1024;
//                    logger.info("total: " + total + "MB, free: " + free + "MB");
//                } catch (Exception ex) {
//                    logger.info("perf thread interrupted");
//                    break;
//                }
//            }
//        }
//    }
//
//    private void getMetadataUserDefinedPropertyValue(List<MetadataUserDefinedPropertyValue> list, Long udpId, DataObject object, String sourceSystem, String containerType) {
//        MetadataUserDefinedPropertyValue mv = new MetadataUserDefinedPropertyValue();
//        mv.setItemId(object.getObjectId().toString());
//        mv.setUdpId(udpId);
//        mv.setContainerType(containerType);
//        mv.setContainerId(containerType.equals(String.valueOf(LDMTypes.oModelSource))?String.valueOf(object.getModelId()):String.valueOf(object.getTableId()));
//        mv.setValue(sourceSystem);
//        mv.buildId();
//        list.add(mv);
//    }
//}
