package com.datablau.data.asset.service.impl;
import java.io.File;
import java.util.ArrayList;
import java.util.Date;

import com.andorj.common.core.exception.IllegalOperationException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.utility.MultiConditionQueryUtils;
import com.datablau.base.api.ModelCategoryService;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.catalog.enums.EnumAssetsCatalogStatus;
import com.datablau.catalog.enums.EnumStructureType;
import com.datablau.catalog.jpa.entity.CommonCatalog;
import com.datablau.catalog.jpa.entity.CommonCatalogStructure;
import com.datablau.catalog.jpa.repository.CommonCatalogRepository;
import com.datablau.catalog.jpa.repository.CommonCatalogStructureRepository;
import com.datablau.data.asset.dto.DdmAutoMappingDto;
import com.datablau.data.asset.dto.DdmAutoMappingQueryParamDto;
import com.datablau.data.asset.dto.DdmManualMappingExcelDto;
import com.datablau.data.asset.dto.ManualMappingImportResultDto;
import com.datablau.data.asset.dto.DdmMappingCatalogDto;
import com.datablau.data.asset.dto.DdmMappingQueryParamDto;
import com.datablau.data.asset.enums.MappingCatalogTypeEnum;
import com.datablau.data.asset.jpa.entity.DdmCollectElement;
import com.datablau.data.asset.jpa.entity.DdmMappingCatalog;
import com.datablau.data.asset.jpa.entity.DdmMappingCatalogLog;
import com.datablau.data.asset.jpa.repository.CommonCatalogNewRepository;
import com.datablau.data.asset.jpa.repository.DdmCollectElementRepository;
import com.datablau.data.asset.jpa.repository.DdmMappingCatalogLogRepository;
import com.datablau.data.asset.jpa.repository.DdmMappingCatalogRepository;
import com.datablau.data.asset.service.DdmMappingCatalogService;
import com.datablau.data.asset.utils.DatablauUtil;
import com.datablau.security.management.utils.AuthTools;
import com.google.common.collect.Lists;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class DdmMappingCatalogServiceImpl implements DdmMappingCatalogService {

    private static final Logger logger = LoggerFactory.getLogger(DdmMappingCatalogServiceImpl.class);

    @Autowired
    private CommonCatalogStructureRepository catalogStructureRepository;
    @Autowired
    private CommonCatalogNewRepository commonCatalogNewRepository;
    @Autowired
    private CommonCatalogRepository catalogRepository;
    @Autowired
    private DdmCollectElementRepository ddmCollectElementRepository;
    @Autowired
    private DdmMappingCatalogRepository ddmMappingCatalogRepository;
    @Autowired
    private DdmMappingCatalogLogRepository ddmMappingCatalogLogRepository;
    @Autowired
    private ModelCategoryService modelCategoryService;
    @Autowired
    protected RedissonClient redissonClient;
    @Autowired
    private MultiConditionQueryUtils queryUtils;

    protected AtomicInteger idGenerator = new AtomicInteger(0);
    protected ExecutorService es = Executors.newFixedThreadPool(10, (run) -> {
        Thread t = new Thread(run);
        t.setName("EXT-ASSET-AUTO-MAPPING" + this.idGenerator.getAndIncrement());
        return t;
    });

    @Override
    public List<CommonCatalog> queryBusinessDomain(DdmAutoMappingQueryParamDto paramDto) {
        List<CommonCatalog> commonCatalogs;
        Long businessDomainId = paramDto.getBusinessDomainId();
        Long subjectDomainId = paramDto.getSubjectDomainId();
        if (businessDomainId == null && subjectDomainId == null) {
            //查询所有已启用的目录空间
            List<CommonCatalogStructure> structureList = catalogStructureRepository.findAllByStructureTypeAndOpenStatus(EnumStructureType.DATA_ASSETS, true);
            List<Long> structureListIds = structureList.stream().map(CommonCatalogStructure::getId).toList();
            //获取业务域目录
           commonCatalogs = commonCatalogNewRepository.findCommonCatalogs(structureListIds, "0/", EnumAssetsCatalogStatus.PUBLISHED);
        } else if (businessDomainId != null && subjectDomainId == null) {
            //根据业务域Id获取主题域
            commonCatalogs = catalogRepository.findAllByParentIdAndStatus(businessDomainId, EnumAssetsCatalogStatus.PUBLISHED);
        } else {
            //根据主题域Id获取业务对象
            commonCatalogs = catalogRepository.findAllByParentIdAndStatus(subjectDomainId, EnumAssetsCatalogStatus.PUBLISHED);
        }
        return commonCatalogs;
    }

    /**
     * 自动映射
     * 2.自动映射逻辑说明：
     * a.业务对象中的逻辑实体（DL4）英文名与元数据中的表英文名进行比对，比对成功时，将元数据中的表映射到该DL4上。
     * b.同时比对该DL4下的DL5与元数据中表下的属性进行比对，比对成功时，将元数据的表下的字段映射到DL5上。
     * c.如该DL4或DL5已存在人工映射标记（即人工批量导入映射），则不做覆盖。
     * d.DL4和DL5只允许被映射一次，第二个匹配上的实体或属性，跳过映射，不覆盖原有映射关系。
     * e.DL5映射成功时，覆盖映射、取消映射，需记录映射记录。
     * f.实体、属性映射比对规则：
     * i.不区分大小写。
     * 空格替换成下划线再进行比较
     * @param autoMappingDto
     */
    @Override
    @Transactional
    public void createAutoMapping(DdmAutoMappingDto autoMappingDto) throws Exception {

        String username = AuthTools.currentUsernameFailFast();

        List<CommonCatalog> businessObjects = autoMappingDto.getBusinessObjects();
        if (CollectionUtils.isEmpty(businessObjects)) {
           return;
        }
        Map<Long, CommonCatalog> commonCatalogMap = businessObjects.stream().collect(Collectors.toMap(CommonCatalog::getId, Function.identity(), (x1, x2) -> x1));
        List<CommonCatalog> commonCatalogsAll = Lists.newArrayList();
        for (CommonCatalog catalog : businessObjects) {
            //查询业务对象下的L4和L5
            Long structureId = catalog.getStructureId();
            String catalogPath = catalog.getCatalogPath();
            List<CommonCatalog> commonCatalogs = catalogRepository.findSubExcludeAndStatus(structureId, catalogPath, EnumAssetsCatalogStatus.PUBLISHED);
            if (!CollectionUtils.isEmpty(commonCatalogs)) {
                commonCatalogsAll.addAll(commonCatalogs);
            }
        }
        //表按上级ID（业务对象分组）
        Map<Long, List<CommonCatalog>> catalogsOfL4GroupMap = commonCatalogsAll.stream().filter(x -> Objects.equals(x.getLevel(), 4)).collect(Collectors.groupingBy(CommonCatalog::getParentId));
        List<CommonCatalog> catalogsOfL5 = commonCatalogsAll.stream().filter(x -> Objects.equals(x.getLevel(), 5)).toList();
        Map<Long, List<CommonCatalog>> catalogsOfL5Map = catalogsOfL5.stream().collect(Collectors.groupingBy(CommonCatalog::getParentId));
        //获取模型下的表和字段
        Long ddmModelId = autoMappingDto.getDdmModelId();
        List<DdmCollectElement> collectElements = ddmCollectElementRepository.queryModelElementByModelId(ddmModelId, Arrays.asList(LDMTypes.oEntity, LDMTypes.oAttribute, LDMTypes.oModelSource));
        List<DdmCollectElement> tableElements = collectElements.stream().filter(x -> Objects.equals(LDMTypes.oEntity, x.getTypeId())).toList();
        List<DdmCollectElement> columnElements = collectElements.stream().filter(x -> Objects.equals(LDMTypes.oAttribute, x.getTypeId())).toList();
        Optional<DdmCollectElement> ddmCollectElementOptional = collectElements.stream().filter(x -> Objects.equals(LDMTypes.oModelSource, x.getTypeId())).findFirst().stream().findFirst();
        if (ddmCollectElementOptional.isEmpty()) {
            return;
        }
        Map<Long, List<DdmCollectElement>> columnElementMaps = columnElements.stream().collect(Collectors.groupingBy(DdmCollectElement::getParentId));
        Map<Long, CommonCatalog> businessObjectMap = businessObjects.stream().collect(Collectors.toMap(CommonCatalog::getId, Function.identity(), (x1, x2) -> x1));
        List<Long> commonCatalogIds = commonCatalogsAll.stream().map(CommonCatalog::getId).toList();
        //查询表和字段是否已存在映射关系
        List<DdmMappingCatalog> ddmMappingCatalogs = ddmMappingCatalogRepository.queryMappingByTypes(commonCatalogIds);
        //获取表的映射关系
        List<DdmMappingCatalog> tableMappings = ddmMappingCatalogs.stream().filter(x -> Objects.equals("L4", x.getObjectLevel())).toList();
        //获取字段的映射关系
        List<DdmMappingCatalog> columnMappings = ddmMappingCatalogs.stream().filter(x -> Objects.equals("L5", x.getObjectLevel())).toList();
        Map<String, DdmMappingCatalog> tableMappingMap = tableMappings.stream().collect(Collectors.toMap(x -> x.getBusinessObjectId() + "-" + x.getParentCatalogId() + "-" + x.getCatalogId(), Function.identity(),
                (x1, x2) -> x1));
        Map<String, DdmMappingCatalog> columnMappingMap = columnMappings.stream().collect(Collectors.toMap(x -> x.getBusinessObjectId() + "-" + x.getParentCatalogId() + "-" + x.getCatalogId(), Function.identity(),
                (x1, x2) -> x1));

        for (Map.Entry<Long, List<CommonCatalog>> entry : catalogsOfL4GroupMap.entrySet()) {
            Long businessObjectId = entry.getKey();
            List<DdmMappingCatalog> updateDdmMappingCatalogs = new ArrayList<>();
            Map<String, DdmMappingCatalog> insertMappingMap = new HashMap<>();
            List<DdmMappingCatalog> mappingCatalogsAll = new ArrayList<>();
            List<DdmMappingCatalog> tableDdmMappingCatalogs = new ArrayList<>();

            logger.info("businessObjectId:{}", businessObjectId);

            RLock lock = this.redissonClient.getLock("autoMapping-" + businessObjectId);
            try {

                CommonCatalog commonCatalog = commonCatalogMap.get(businessObjectId);

                //检查锁是否存在
                if (lock.isLocked()) {
                    throw new Exception("业务对象"+commonCatalog.getName()+"正在执行自动映射任务");
                }
                //获取锁
                lock.lock();
                logger.info("auto compare mapping table begin");
                //先比较表,表比对上比较字段
                List<CommonCatalog> commonCatalogsOfL4 = entry.getValue();
                for (CommonCatalog catalog : commonCatalogsOfL4) {
                    String englishName = catalog.getEnglishName();
                    String processedEnglishName = englishName.toLowerCase().replace(" ", "_");
                    CommonCatalog businessCatalog = businessObjectMap.get(catalog.getParentId());
                    if (businessCatalog == null) {
                        continue;
                    }
                    for (DdmCollectElement tableElement : tableElements) {
                        String name = tableElement.getName();
                        String processedName = name.toLowerCase().replace(" ", "_");
                        if (Objects.equals(processedName, processedEnglishName)) {
                            //匹配的上看之前是否存在匹配记录，如果存在且是自动映射、但是表信息不一致则更新数据，手动映射的则跳过
                            DdmCollectElement modelElement = ddmCollectElementOptional.get();

                            Long parentId = catalog.getParentId();
                            Long catalogId = catalog.getId();
                            String key = businessObjectId + "-" + parentId + "-" + catalogId;
                            //判断目录是否已经匹配过表，匹配过了则跳出
                            DdmMappingCatalog insertMappingCatalog = insertMappingMap.get(key);
                            if (insertMappingCatalog != null) {
                                break;
                            }
                            DdmMappingCatalog ddmMappingCatalog = new DdmMappingCatalog();

                            //表的上级是业务对象
                            ddmMappingCatalog.setBusinessObjectId(catalog.getParentId());
                            ddmMappingCatalog.setBusinessObjectName(businessCatalog.getName());

                            ddmMappingCatalog.setCatalogId(catalog.getId());
                            ddmMappingCatalog.setCatalogName(catalog.getName());
                            ddmMappingCatalog.setCatalogEnName(catalog.getEnglishName());

                            ddmMappingCatalog.setParentCatalogId(businessCatalog.getId());
                            ddmMappingCatalog.setParentCatalogName(businessCatalog.getName());
                            ddmMappingCatalog.setStructureId(catalog.getStructureId());

                            ddmMappingCatalog.setModelCategoryId(modelElement.getModelCategoryId());
                            ddmMappingCatalog.setDdmModelId(modelElement.getDdmModelId());
                            ddmMappingCatalog.setDdmModelName(modelElement.getDdmModelName());
                            ddmMappingCatalog.setDdmCategoryPath(modelElement.getDdmCategoryPath());
                            ddmMappingCatalog.setObjectId(tableElement.getObjectId());
                            //英文名称
                            ddmMappingCatalog.setObjectName(tableElement.getName());
                            //中文名称
                            ddmMappingCatalog.setAlias(tableElement.getAlias());

                            ddmMappingCatalog.setParentObjectId(tableElement.getParentId());
                            ddmMappingCatalog.setParentObjectName(tableElement.getParentName());
                            ddmMappingCatalog.setParentObjectAlias(tableElement.getParentAlias());

                            ddmMappingCatalog.setObjectLevel("L4");
                            ddmMappingCatalog.setMappingType(MappingCatalogTypeEnum.AUTOMATIC_MAPPING.getDesc());
                            ddmMappingCatalog.setCreateTime(new Date());
                            ddmMappingCatalog.setUpdateTime(new Date());
                            ddmMappingCatalog.setCreator(username);
                            ddmMappingCatalog.setUpdater(username);
                            tableDdmMappingCatalogs.add(ddmMappingCatalog);
                            insertMappingMap.put(key, ddmMappingCatalog);
                            break;
                        }
                    }
                }
                logger.info("auto compare mapping table end");

                Map<String, DdmMappingCatalog> insertColumnMappingMap = new HashMap<>();
                //循环匹配上的目录，判断表下的字段是否能映射上
                for (DdmMappingCatalog updateMappingCatalog : tableDdmMappingCatalogs) {
                    //表Id
                    Long objectId = updateMappingCatalog.getObjectId();
                    //L4目录Id
                    Long catalogIdOfL4 = updateMappingCatalog.getCatalogId();
                    //businessObjectId
                    String businessObjectName = updateMappingCatalog.getBusinessObjectName();
                    List<DdmCollectElement> collectElementList = columnElementMaps.get(objectId);
                    //获取L4目录下的L5
                    List<CommonCatalog> catalogs = catalogsOfL5Map.get(catalogIdOfL4);
                    for (CommonCatalog catalog : catalogs) {
                        String englishName = catalog.getEnglishName();
                        String processedEnglishName = englishName.toLowerCase().replace(" ", "_");
                        //循环比对字段
                        for (DdmCollectElement element : collectElementList) {
                            String name = element.getName();
                            String processedName = name.toLowerCase().replace(" ", "_");
                            if (Objects.equals(processedName, processedEnglishName)) {
                                //匹配上看之前是否存在匹配记录，如果存在且是自动映射则更新数据，手动映射则跳过
                                Long parentId = catalog.getParentId();
                                Long catalogId = catalog.getId();
                                String key = businessObjectId + "-" + parentId + "-" + catalogId;
                                DdmMappingCatalog ddmMappingCatalog = columnMappingMap.get(key);
                                //是否为自动映射
                                if (ddmMappingCatalog != null && !Objects.equals(MappingCatalogTypeEnum.MANUAL_MAPPING.getDesc(), ddmMappingCatalog.getMappingType())) {
                                    //判断映射的字段信息是否一致
                                    Long mappingObjectId = ddmMappingCatalog.getObjectId();
                                    Long mappingParentObjectId = ddmMappingCatalog.getParentObjectId();
                                    Long mappingDdmModelId = ddmMappingCatalog.getDdmModelId();

                                    String oldMappingType = ddmMappingCatalog.getMappingType();

                                    if (Objects.equals(MappingCatalogTypeEnum.AUTOMATIC_MAPPING.getDesc(), oldMappingType)) {
                                        if (Objects.equals(ddmModelId, mappingDdmModelId) && Objects.equals(element.getParentId(), mappingParentObjectId)
                                                && Objects.equals(mappingObjectId, element.getObjectId())) {
                                            break;
                                        }
                                    }

                                    ddmMappingCatalog.setBusinessObjectId(updateMappingCatalog.getBusinessObjectId());
                                    ddmMappingCatalog.setBusinessObjectName(businessObjectName);

                                    ddmMappingCatalog.setCatalogName(catalog.getName());
                                    ddmMappingCatalog.setCatalogEnName(catalog.getEnglishName());

                                    ddmMappingCatalog.setParentCatalogId(updateMappingCatalog.getCatalogId());
                                    ddmMappingCatalog.setParentCatalogName(updateMappingCatalog.getCatalogName());
                                    ddmMappingCatalog.setStructureId(catalog.getStructureId());

                                    ddmMappingCatalog.setModelCategoryId(updateMappingCatalog.getModelCategoryId());
                                    ddmMappingCatalog.setDdmModelId(updateMappingCatalog.getDdmModelId());
                                    ddmMappingCatalog.setDdmModelName(updateMappingCatalog.getDdmModelName());

                                    ddmMappingCatalog.setObjectId(element.getObjectId());
                                    //英文名称
                                    ddmMappingCatalog.setObjectName(element.getName());
                                    //中文名称
                                    ddmMappingCatalog.setAlias(element.getAlias());

                                    //字段的上级是表
                                    ddmMappingCatalog.setParentObjectId(element.getParentId());
                                    ddmMappingCatalog.setParentObjectName(element.getParentName());
                                    ddmMappingCatalog.setParentObjectAlias(element.getParentAlias());

                                    ddmMappingCatalog.setObjectLevel("L5");
                                    ddmMappingCatalog.setMappingType(MappingCatalogTypeEnum.AUTOMATIC_MAPPING.getDesc());
                                    ddmMappingCatalog.setCreateTime(new Date());
                                    ddmMappingCatalog.setUpdateTime(new Date());
                                    ddmMappingCatalog.setCreator(username);
                                    ddmMappingCatalog.setUpdater(username);
                                    mappingCatalogsAll.add(ddmMappingCatalog);
                                    //为后续作插入取消映射记录日志使用
                                    updateDdmMappingCatalogs.add(ddmMappingCatalog);
                                } else if ((ddmMappingCatalog != null && Objects.equals(MappingCatalogTypeEnum.MANUAL_MAPPING.getDesc(), ddmMappingCatalog.getMappingType()))) {
                                    //有映射关系但是手动映射调出循环
                                    break;
                                } else {
                                    //新增，判断是否已经匹配过
                                    DdmMappingCatalog mappingCatalog = insertColumnMappingMap.get(key);
                                    if (mappingCatalog != null) {
                                        break;
                                    }
                                    DdmMappingCatalog insertMappingCatalog = new DdmMappingCatalog();
                                    insertMappingCatalog.setBusinessObjectId(businessObjectId);
                                    insertMappingCatalog.setBusinessObjectName(businessObjectName);

                                    insertMappingCatalog.setCatalogId(catalog.getId());
                                    insertMappingCatalog.setCatalogName(catalog.getName());
                                    insertMappingCatalog.setCatalogEnName(catalog.getEnglishName());

                                    insertMappingCatalog.setParentCatalogId(updateMappingCatalog.getCatalogId());
                                    insertMappingCatalog.setParentCatalogName(updateMappingCatalog.getCatalogName());
                                    insertMappingCatalog.setStructureId(updateMappingCatalog.getStructureId());

                                    insertMappingCatalog.setModelCategoryId(updateMappingCatalog.getModelCategoryId());
                                    insertMappingCatalog.setDdmModelId(updateMappingCatalog.getDdmModelId());
                                    insertMappingCatalog.setDdmModelName(updateMappingCatalog.getDdmModelName());
                                    insertMappingCatalog.setObjectId(element.getObjectId());
                                    //中文名称
                                    insertMappingCatalog.setObjectName(element.getName());
                                    //英文名称
                                    insertMappingCatalog.setAlias(element.getAlias());

                                    insertMappingCatalog.setParentObjectId(element.getParentId());
                                    insertMappingCatalog.setParentObjectName(updateMappingCatalog.getObjectName());
                                    insertMappingCatalog.setParentObjectAlias(updateMappingCatalog.getAlias());
                                    insertMappingCatalog.setObjectLevel("L5");
                                    insertMappingCatalog.setMappingType(MappingCatalogTypeEnum.AUTOMATIC_MAPPING.getDesc());
                                    insertMappingCatalog.setCreateTime(new Date());
                                    insertMappingCatalog.setUpdateTime(new Date());
                                    insertMappingCatalog.setCreator(username);
                                    insertMappingCatalog.setUpdater(username);
                                    insertColumnMappingMap.put(key, insertMappingCatalog);
                                    mappingCatalogsAll.add(insertMappingCatalog);
                                }
                                break;
                            }
                        }
                    }
                }
                logger.info("auto compare mapping column end");

                //按业务对象分别数据进行处理
                //如果有更新的则先插入取消映射的日志
                if (!CollectionUtils.isEmpty(updateDdmMappingCatalogs)) {
                    List<DdmMappingCatalogLog> mappingCatalogLogs = Lists.newArrayList();
                    DdmMappingCatalogLog ddmMappingCatalogLog;
                    for (DdmMappingCatalog tableUpdateDdmMappingCatalog : updateDdmMappingCatalogs) {
                        ddmMappingCatalogLog = new DdmMappingCatalogLog();
                        ddmMappingCatalogLog.setMappingId(tableUpdateDdmMappingCatalog.getId());
                        ddmMappingCatalogLog.setCatalogId(tableUpdateDdmMappingCatalog.getCatalogId());
                        ddmMappingCatalogLog.setMappingType(tableUpdateDdmMappingCatalog.getMappingType());
                        ddmMappingCatalogLog.setOperatorTime(new Date());
                        ddmMappingCatalogLog.setOperator(tableUpdateDdmMappingCatalog.getUpdater());
                        mappingCatalogLogs.add(ddmMappingCatalogLog);
                    }
                    ddmMappingCatalogLogRepository.saveAll(mappingCatalogLogs);
                    logger.info("共插入取消映射记录日志{}条:", mappingCatalogLogs.size());
                }

                if (!CollectionUtils.isEmpty(mappingCatalogsAll)) {
                    logger.info("mapping log insert begin");
                    //插入映射信息
                    List<DdmMappingCatalog> catalogList = ddmMappingCatalogRepository.saveAll(mappingCatalogsAll);
                    logger.info("共插入或者更新映射信息{}条", catalogList.size());
                    //插入映射记录
                    List<DdmMappingCatalogLog> mappingCatalogLogs = Lists.newArrayList();
                    DdmMappingCatalogLog ddmMappingCatalogLog;
                    for (DdmMappingCatalog ddmMappingCatalog : catalogList) {
                        ddmMappingCatalogLog = new DdmMappingCatalogLog();
                        ddmMappingCatalogLog.setMappingId(ddmMappingCatalog.getId());
                        ddmMappingCatalogLog.setCatalogId(ddmMappingCatalog.getCatalogId());
                        ddmMappingCatalogLog.setMappingType(ddmMappingCatalog.getMappingType());
                        ddmMappingCatalogLog.setOperatorTime(new Date());
                        ddmMappingCatalogLog.setOperator(ddmMappingCatalog.getUpdater());
                        mappingCatalogLogs.add(ddmMappingCatalogLog);
                    }
                    ddmMappingCatalogLogRepository.saveAll(mappingCatalogLogs);
                    logger.info("共插入映射日志{}条:", mappingCatalogLogs.size());
                    logger.info("mapping log insert end");
                }
            }finally {
                lock.unlock();
            }
        }
        logger.info("auto ddm mapping finish");
    }

    @Override
    public PageResult<DdmMappingCatalogDto> queryDdmMappingCatalogPage(DdmMappingQueryParamDto paramDto) throws Exception {
        Long businessObjectId = paramDto.getBusinessObjectId();
        Long logicDataEntityId = paramDto.getLogicDataEntityId();
        Long modelCategoryId = paramDto.getModelCategoryId();
        Long ddmModelId = paramDto.getDdmModelId();
        Long tableId = paramDto.getTableId();
        //没有搜索条件时获取所有已启用的目录空间下的已发布的L5目录
        if (businessObjectId == null && logicDataEntityId == null && modelCategoryId == null && ddmModelId == null && tableId == null) {
            MultiConditionQueryUtils.MultiConditionQuery<CommonCatalog> query = queryUtils.createQuery(CommonCatalog.class);
            List<CommonCatalogStructure> structureList = catalogStructureRepository.findAllByStructureTypeAndOpenStatus(EnumStructureType.DATA_ASSETS, true);
            List<Long> structureListIds = structureList.stream().map(CommonCatalogStructure::getId).toList();
            query.andIsIn("structureId", structureListIds).andEqual("level", 5).andEqual("status", EnumAssetsCatalogStatus.PUBLISHED);
            query.setPageInfo(paramDto.getCurrentPage(), paramDto.getPageSize());
            PageResult<CommonCatalog> page = query.page();
            List<CommonCatalog> commonCatalogs = page.getContent();
            //查询L5是否有映射上的属性
            List<DdmMappingCatalogDto> mappingCatalogDtos = buildL5OfMapping(commonCatalogs);
            PageResult<DdmMappingCatalogDto> dtoPageResult = new PageResult<>();
            dtoPageResult.setContentDirectly(mappingCatalogDtos);
            dtoPageResult.setPageSize(paramDto.getPageSize());
            dtoPageResult.setCurrentPage(paramDto.getCurrentPage());
            dtoPageResult.setTotalItems(page.getTotalItems());
            return dtoPageResult;
        }


        boolean isLeftQuery = businessObjectId != null || logicDataEntityId != null;
        boolean isRightQuery = modelCategoryId != null || ddmModelId != null || tableId != null;

        if (isLeftQuery && isRightQuery) {
            throw new IllegalArgumentException("不能同时选择左侧查询和右侧查询。");
        }

        if (isLeftQuery) {
            if (businessObjectId != null && logicDataEntityId == null) {
                //业务对象不为空，逻辑实体为空，获取该业务对象下的所有逻辑实体
                Optional<CommonCatalog> commonCatalog = catalogRepository.findById(businessObjectId);
                if (commonCatalog.isEmpty()) {
                    throw new Exception("未找到对应的业务对象");
                }
                CommonCatalog catalog = commonCatalog.get();
                String catalogPath = catalog.getCatalogPath()+catalog.getId()+"/";
                MultiConditionQueryUtils.MultiConditionQuery<CommonCatalog> query = queryUtils.createQuery(CommonCatalog.class);
                query.andLike("catalogPath", catalogPath+ "%").andEqual("status", EnumAssetsCatalogStatus.PUBLISHED)
                        .andEqual("level", 5);
                query.setPageInfo(paramDto.getCurrentPage(), paramDto.getPageSize());
                PageResult<CommonCatalog> page = query.page();
                List<CommonCatalog> commonCatalogs = page.getContent();
                //查询L5是否有映射上的属性
                List<DdmMappingCatalogDto> mappingCatalogDtos = buildL5OfMapping(commonCatalogs);
                PageResult<DdmMappingCatalogDto> dtoPageResult = new PageResult<>();
                dtoPageResult.setContentDirectly(mappingCatalogDtos);
                dtoPageResult.setPageSize(paramDto.getPageSize());
                dtoPageResult.setCurrentPage(paramDto.getCurrentPage());
                dtoPageResult.setTotalItems(page.getTotalItems());
                return dtoPageResult;
            } else {
                Optional<CommonCatalog> commonCatalog = catalogRepository.findById(logicDataEntityId);
                if (commonCatalog.isEmpty()) {
                    throw new Exception("未找到对应的逻辑数据实体");
                }
                CommonCatalog catalog = commonCatalog.get();
                String catalogPath = catalog.getCatalogPath()+catalog.getId()+"/";
                MultiConditionQueryUtils.MultiConditionQuery<CommonCatalog> query = queryUtils.createQuery(CommonCatalog.class);
                query.andLike("catalogPath", catalogPath+ "%").andEqual("status", EnumAssetsCatalogStatus.PUBLISHED)
                        .andEqual("level", 5);
                query.setPageInfo(paramDto.getCurrentPage(), paramDto.getPageSize());
                PageResult<CommonCatalog> page = query.page();
                List<CommonCatalog> commonCatalogs = page.getContent();
                //查询L5是否有映射上的属性
                List<DdmMappingCatalogDto> mappingCatalogDtos = buildL5OfMapping(commonCatalogs);
                PageResult<DdmMappingCatalogDto> dtoPageResult = new PageResult<>();
                dtoPageResult.setContentDirectly(mappingCatalogDtos);
                dtoPageResult.setPageSize(paramDto.getPageSize());
                dtoPageResult.setCurrentPage(paramDto.getCurrentPage());
                dtoPageResult.setTotalItems(page.getTotalItems());
                return dtoPageResult;
            }

        }
        if (modelCategoryId != null && ddmModelId == null && tableId == null) {
            MultiConditionQueryUtils.MultiConditionQuery<DdmCollectElement> query = queryUtils.createQuery(DdmCollectElement.class);
            query.andEqual("modelCategoryId", modelCategoryId).andEqual("typeId", LDMTypes.oAttribute);
            query.setPageInfo(paramDto.getCurrentPage(), paramDto.getPageSize());
            PageResult<DdmCollectElement> page = query.page();
            List<DdmCollectElement> ddmCollectElements = page.getContent();
            //查询模型字段是否有映射
            List<DdmMappingCatalogDto> mappingCatalogDtos = buildL5OfMappingByDdm(ddmCollectElements);
            PageResult<DdmMappingCatalogDto> dtoPageResult = new PageResult<>();
            dtoPageResult.setContentDirectly(mappingCatalogDtos);
            dtoPageResult.setPageSize(paramDto.getPageSize());
            dtoPageResult.setCurrentPage(paramDto.getCurrentPage());
            dtoPageResult.setTotalItems(page.getTotalItems());
            return dtoPageResult;
        } else if (modelCategoryId != null && ddmModelId != null && tableId == null) {
            MultiConditionQueryUtils.MultiConditionQuery<DdmCollectElement> query = queryUtils.createQuery(DdmCollectElement.class);
            query.andEqual("modelCategoryId", modelCategoryId).andEqual("ddmModelId", ddmModelId).andEqual("typeId", LDMTypes.oAttribute);
            query.setPageInfo(paramDto.getCurrentPage(), paramDto.getPageSize());
            PageResult<DdmCollectElement> page = query.page();
            List<DdmCollectElement> ddmCollectElements = page.getContent();
            //查询模型字段是否有映射
            List<DdmMappingCatalogDto> mappingCatalogDtos = buildL5OfMappingByDdm(ddmCollectElements);
            PageResult<DdmMappingCatalogDto> dtoPageResult = new PageResult<>();
            dtoPageResult.setContentDirectly(mappingCatalogDtos);
            dtoPageResult.setPageSize(paramDto.getPageSize());
            dtoPageResult.setCurrentPage(paramDto.getCurrentPage());
            dtoPageResult.setTotalItems(page.getTotalItems());
            return dtoPageResult;
        } else if (modelCategoryId != null && ddmModelId != null) {
            MultiConditionQueryUtils.MultiConditionQuery<DdmCollectElement> query = queryUtils.createQuery(DdmCollectElement.class);
            query.andEqual("modelCategoryId", modelCategoryId).andEqual("ddmModelId", ddmModelId)
                    .andEqual("tableId", tableId)
                    .andEqual("typeId", LDMTypes.oAttribute);
            query.setPageInfo(paramDto.getCurrentPage(), paramDto.getPageSize());
            PageResult<DdmCollectElement> page = query.page();
            List<DdmCollectElement> ddmCollectElements = page.getContent();
            //查询模型字段是否有映射
            List<DdmMappingCatalogDto> mappingCatalogDtos = buildL5OfMappingByDdm(ddmCollectElements);
            PageResult<DdmMappingCatalogDto> dtoPageResult = new PageResult<>();
            dtoPageResult.setContentDirectly(mappingCatalogDtos);
            dtoPageResult.setPageSize(paramDto.getPageSize());
            dtoPageResult.setCurrentPage(paramDto.getCurrentPage());
            dtoPageResult.setTotalItems(page.getTotalItems());
            return dtoPageResult;
        }
        PageResult<DdmMappingCatalogDto> dtoPageResult = new PageResult<>();
        dtoPageResult.setContentDirectly(Lists.newArrayList());
        dtoPageResult.setPageSize(paramDto.getPageSize());
        dtoPageResult.setCurrentPage(paramDto.getCurrentPage());
        dtoPageResult.setTotalItems(0L);
        return dtoPageResult;
    }

    /**
     * 查看映射记录
     * @param mappingId
     * @return
     */
    @Override
    public List<DdmMappingCatalogLog> queryDdmMappingCatalogLogs(Long mappingId) {
        return ddmMappingCatalogLogRepository.queryDdmMappingCatalogLogByMappingId(mappingId);
    }

    /**
     * 批量取消映射
     * @param mappingIds
     */
    @Override
    @Transactional
    public void cancelMapping(List<Long> mappingIds) {
        String username = AuthTools.currentUsernameFailFast();
        List<DdmMappingCatalogLog> ddmMappingCatalogLogs = Lists.newArrayList();
        //查询映射信息
        DdmMappingCatalogLog log;
        List<DdmMappingCatalog> ddmMappingCatalogs = ddmMappingCatalogRepository.findAllById(mappingIds);
        for (DdmMappingCatalog ddmMappingCatalog : ddmMappingCatalogs) {
            ddmMappingCatalog.setUpdater(username);
            ddmMappingCatalog.setUpdateTime(new Date());
            ddmMappingCatalog.setMappingType(MappingCatalogTypeEnum.CANCEL__MAPPING.getDesc());

            log = new DdmMappingCatalogLog();
            log.setMappingId(ddmMappingCatalog.getId());
            log.setCatalogId(ddmMappingCatalog.getCatalogId());
            log.setMappingType(MappingCatalogTypeEnum.CANCEL__MAPPING.getDesc());
            log.setOperatorTime(new Date());
            log.setOperator(username);
            ddmMappingCatalogLogs.add(log);
        }
        //删除映射记录
        ddmMappingCatalogRepository.deleteAllById(mappingIds);
        //插入取消映射记录
        ddmMappingCatalogLogRepository.saveAll(ddmMappingCatalogLogs);
    }

    @Override
    public File downloadMappingTemplate() {
        File file = new File(DatablauUtil.getResourcePath("/ddc/ddm_manual_mapping_template.xlsx"));
        return file;
    }

    /**
     * 需求前提是目录空间只有一个,L3目录整个目录空间唯一
     * @param manualMappingExcelDtos@return
     * @throws Exception
     */
    @Override
    public ManualMappingImportResultDto upload(List<DdmManualMappingExcelDto> manualMappingExcelDtos) throws Exception {

        //获取模型路径
        Set<String> ddmCategoryPaths = manualMappingExcelDtos.stream().map(DdmManualMappingExcelDto::getDdmCategoryPath).collect(Collectors.toSet());
        //获取模型名称
        Set<String> ddmModelNames = manualMappingExcelDtos.stream().map(DdmManualMappingExcelDto::getDdmModelName).collect(Collectors.toSet());
        //根据excel模型路径和模型名称获取已采集的所有模型信息（模型、实体、字段）
        List<DdmCollectElement> collectElements = ddmCollectElementRepository.queryModelElementByCategoryPathAndModelName(ddmCategoryPaths, ddmModelNames, Arrays.asList(LDMTypes.oEntity, LDMTypes.oAttribute, LDMTypes.oModelSource));
        //按照模型路径和模型名称分组，获取表信息
        Map<String, List<DdmCollectElement>> tableElementsMap = collectElements.stream().filter(x -> Objects.equals(LDMTypes.oEntity, x.getTypeId())).collect(Collectors.groupingBy(x->x.getDdmCategoryPath()+"/"+x.getDdmModelName()));
        //按照模型名称和表名称分组，获取字段信息
        Map<String, List<DdmCollectElement>> columnElementsMap = collectElements.stream().filter(x -> Objects.equals(LDMTypes.oAttribute, x.getTypeId())).collect(Collectors.groupingBy(x -> x.getDdmCategoryPath()+"/"+x.getDdmModelName() + "-" + x.getParentName()));
        //按照模型名称和表名称分组获取模型信息
        List<DdmCollectElement> modelElements = collectElements.stream().filter(x -> Objects.equals(LDMTypes.oModelSource, x.getTypeId())).toList();
        Map<String, DdmCollectElement> modelElementMap = modelElements.stream().collect(Collectors.toMap(x->x.getDdmCategoryPath()+"/"+x.getName(), Function.identity(), (x1, x2) -> x1));
        //获取excel中L3目录
        List<String> catalogOfL3Name = manualMappingExcelDtos.stream().map(DdmManualMappingExcelDto::getCatalogL3Name).toList();
        //获取excel中L4目录
        List<String> catalogOfL4Name = manualMappingExcelDtos.stream().map(DdmManualMappingExcelDto::getCatalogL4Name).toList();
        //获取excel中L5目录
        List<String> catalogOfL5Name = manualMappingExcelDtos.stream().map(DdmManualMappingExcelDto::getCatalogL5Name).toList();
        List<Long> commonCatalogIds = Lists.newArrayList();

        //判断填写的L3目录是否都是发布状态
        List<CommonCatalog> commonCatalogsOfL3 = Lists.newArrayList();
        for (List<String> items : Lists.partition(catalogOfL3Name, 999)) {
            List<CommonCatalog> commonCatalogs = commonCatalogNewRepository.findCommonCatalogsByNames(items, EnumAssetsCatalogStatus.PUBLISHED, 3);
            if (!CollectionUtils.isEmpty(commonCatalogs)) {
                commonCatalogsOfL3.addAll(commonCatalogs);
            }
        }
        //获取L3目录ID
        Set<Long> categoryOfL3Ids = commonCatalogsOfL3.stream().map(CommonCatalog::getId).collect(Collectors.toSet());

        //判断填写的L4,L5目录是否都是发布状态
        List<CommonCatalog> commonCatalogsOfL4 = Lists.newArrayList();
        for (List<String> items : Lists.partition(catalogOfL4Name, 999)) {
            List<CommonCatalog> commonCatalogs = commonCatalogNewRepository.findCommonCatalogsByPatentId(categoryOfL3Ids, items, EnumAssetsCatalogStatus.PUBLISHED, 4);
            if (!CollectionUtils.isEmpty(commonCatalogs)) {
                commonCatalogsOfL4.addAll(commonCatalogs);
            }
        }

        //获取L4目录ID
        Set<Long> categoryOfL4Ids = commonCatalogsOfL4.stream().map(CommonCatalog::getId).collect(Collectors.toSet());

        //获取L5目录
        List<CommonCatalog> commonCatalogsOfL5 = Lists.newArrayList();
        for (List<String> items : Lists.partition(catalogOfL5Name, 999)) {
            List<CommonCatalog> catalogOfL5 = commonCatalogNewRepository.findCommonCatalogsByPatentId(categoryOfL4Ids, items,  EnumAssetsCatalogStatus.PUBLISHED, 5);
            if (!CollectionUtils.isEmpty(catalogOfL5)) {
                commonCatalogsOfL5.addAll(catalogOfL5);
            }
        }


        List<Long> catalogOfL4Ids = commonCatalogsOfL4.stream().map(CommonCatalog::getId).toList();
        List<Long> catalogOfL5Ids = commonCatalogsOfL5.stream().map(CommonCatalog::getId).toList();
        if (!CollectionUtils.isEmpty(catalogOfL4Ids)) {
            commonCatalogIds.addAll(catalogOfL4Ids);
        }
        if (!CollectionUtils.isEmpty(catalogOfL5Ids)) {
            commonCatalogIds.addAll(catalogOfL5Ids);
        }

        ManualMappingImportResultDto resultDto = new ManualMappingImportResultDto();
        //L3目录即业务对象
        Map<String, CommonCatalog> commonCatalogOfL3Map = commonCatalogsOfL3.stream().collect(Collectors.toMap(CommonCatalog::getEnglishName, Function.identity(), (x1, x2) -> x1));
        Map<String, CommonCatalog> commonCatalogOfL4Map = commonCatalogsOfL4.stream().collect(Collectors.toMap(x->x.getParentId()+"-"+x.getEnglishName(), Function.identity(), (x1, x2) -> x1));
        Map<String, CommonCatalog> commonCatalogsOfL5Map = commonCatalogsOfL5.stream().collect(Collectors.toMap(x -> x.getParentId() + "-" + x.getEnglishName(), Function.identity(), (x1, x2) -> x1));
        //校验目录是否已经发布，填写的模型、表是否已采集
        for (DdmManualMappingExcelDto manualMappingExcelDto : manualMappingExcelDtos) {

            //L3目录
            String catalogL3Name = manualMappingExcelDto.getCatalogL3Name();
            CommonCatalog catalogOfL3 = commonCatalogOfL3Map.get(catalogL3Name);
            if (catalogOfL3 == null) {
                resultDto.getErrorMsg().add(catalogL3Name+"不是已发布的L3级目录或者不存在");
            }
        }
        if (!CollectionUtils.isEmpty(resultDto.getErrorMsg())) {
            return resultDto;
        }
        for (DdmManualMappingExcelDto manualMappingExcelDto : manualMappingExcelDtos) {
            String catalogL3Name = manualMappingExcelDto.getCatalogL3Name();
            CommonCatalog catalogOfL3 = commonCatalogOfL3Map.get(catalogL3Name);
            Long catalogOfL3Id = catalogOfL3.getId();
            //L4目录
            String catalogL4Name = manualMappingExcelDto.getCatalogL4Name();
            String catalogL4Key = catalogOfL3Id+"-"+catalogL4Name;
            CommonCatalog catalogOfL4 = commonCatalogOfL4Map.get(catalogL4Key);
            if (catalogOfL4 == null) {
                resultDto.getErrorMsg().add(catalogL4Name+"不是已发布的L4级目录或者不存在");
            }
            //L5目录
            String catalogL5Name = manualMappingExcelDto.getCatalogL5Name();
            if (catalogOfL4 != null) {
                String catalogL5Key = catalogOfL4.getId()+"-"+catalogL5Name;
                CommonCatalog catalogOfL5 = commonCatalogsOfL5Map.get(catalogL5Key);
                if (catalogOfL5 == null) {
                    resultDto.getErrorMsg().add(catalogL5Name+"不是已发布的L5级目录或者不存在");
                }
            }
            //模型名称
            String ddmModelName = manualMappingExcelDto.getDdmModelName();
            //模型路径
            String ddmCategoryPath = manualMappingExcelDto.getDdmCategoryPath();
            String ddmModelKey = ddmCategoryPath + "/" +ddmModelName;
            DdmCollectElement ddmCollectElement = modelElementMap.get(ddmModelKey);
            if (ddmCollectElement == null) {
                resultDto.getErrorMsg().add("名称为"+ddmModelName+"的模型未采集");
            }
            //实体英文名
            String ddmModelEntityName = manualMappingExcelDto.getDdmModelEntityName();
            //获取模型下对应的表信息
            List<DdmCollectElement> allTableElements = tableElementsMap.get(ddmModelKey);
            if (CollectionUtils.isEmpty(allTableElements)) {
                resultDto.getErrorMsg().add("已采集的表不在模型路径为:"+ddmCategoryPath+"的模型:"+ddmModelName+"下");
            } else {
                Map<String, DdmCollectElement> allTableElementsMap = allTableElements.stream().collect(Collectors.toMap(DdmCollectElement::getName, Function.identity(), (x1, x2) -> x1));

                if (!allTableElementsMap.containsKey(ddmModelEntityName)) {
                    resultDto.getErrorMsg().add(ddmModelEntityName+"不是已采集的"+ddmModelName+"模型下的表");
                }
            }
        }
        if (!CollectionUtils.isEmpty(resultDto.getErrorMsg())) {
            return resultDto;
        }

        //查询表和字段是否已存在映射关系
        List<DdmMappingCatalog> ddmMappingCatalogs = ddmMappingCatalogRepository.queryMappingByTypes(commonCatalogIds);
        //获取字段的映射关系
        List<DdmMappingCatalog> columnMappings = ddmMappingCatalogs.stream().filter(x -> Objects.equals("L5", x.getObjectLevel())).toList();
        Map<String, DdmMappingCatalog> columnMappingMap = columnMappings.stream().collect(Collectors.toMap(x -> x.getBusinessObjectId() + "-" + x.getParentCatalogId() + "-" + x.getCatalogId(), Function.identity(),
                (x1, x2) -> x1));

        List<DdmMappingCatalog> updateDdmMappingCatalogs = new CopyOnWriteArrayList<>();
        List<DdmMappingCatalog> mappingCatalogsAll = new CopyOnWriteArrayList<>();
        String username = AuthTools.currentUsernameFailFast();

        logger.info("manual compare mapping column begin");

        Map<String, DdmMappingCatalog> insertColumnMappingMap = new HashMap<>();
        //获取字段的映射关系
        for (DdmManualMappingExcelDto manualMappingExcelDto : manualMappingExcelDtos) {
            //模型路径
            String ddmCategoryPath = manualMappingExcelDto.getDdmCategoryPath();
            //模型名称
            String ddmModelName = manualMappingExcelDto.getDdmModelName();
            //模型实体英文名
            String ddmModelEntityName = manualMappingExcelDto.getDdmModelEntityName();
            //模型属性英文名
            String ddmModelColumnName = manualMappingExcelDto.getDdmModelColumnName();
            String catalogL5Name = manualMappingExcelDto.getCatalogL5Name();
            //L4英文名
            String catalogL4Name = manualMappingExcelDto.getCatalogL4Name();
            //L3业务对象
            String catalogL3Name = manualMappingExcelDto.getCatalogL3Name();
            //获取业务对象
            CommonCatalog businessCatalog = commonCatalogOfL3Map.get(catalogL3Name);
            //业务对象ID
            Long businessObjectId = businessCatalog.getId();
            CommonCatalog catalogOfL4 = commonCatalogOfL4Map.get(businessObjectId + "-"+catalogL4Name);

            String businessObjectName = businessCatalog.getName();
            Long catalogOfL4Id = catalogOfL4.getId();
            String catalogOfL5Key = catalogOfL4Id + "-" +catalogL5Name;
            CommonCatalog commonCatalogOfL5 = commonCatalogsOfL5Map.get(catalogOfL5Key);
            String key = businessObjectId + "-"+catalogOfL4Id+"-"+commonCatalogOfL5.getId();

            //采集的模型信息
            String ddmModelKey = ddmCategoryPath + "/"+ddmModelName;
            DdmCollectElement modelElement = modelElementMap.get(ddmModelKey);
            Long ddmModelId = modelElement.getDdmModelId();
            DdmMappingCatalog ddmMappingCatalog = columnMappingMap.get(key);
            //采集的模型下的表的字段信息 columnElementsMap
            String columnKey = ddmModelKey+"-"+ddmModelEntityName;
            List<DdmCollectElement> ddmColumnElements = columnElementsMap.get(columnKey);
            Map<String, DdmCollectElement> ddmColumnElementsMap = ddmColumnElements.stream().collect(Collectors.toMap(DdmCollectElement::getName, Function.identity(), (x1, x2) -> x1));
            DdmCollectElement element = ddmColumnElementsMap.get(ddmModelColumnName);

            if (ddmMappingCatalog != null) {
                //判断映射的字段信息是否一致
                String mappingObjectName = ddmMappingCatalog.getObjectName();
                String mappingParentObjectName = ddmMappingCatalog.getParentObjectName();
                Long mappingDdmModelId = ddmMappingCatalog.getDdmModelId();

                if (Objects.equals(ddmModelId, mappingDdmModelId) && Objects.equals(ddmModelEntityName, mappingParentObjectName)
                        && Objects.equals(mappingObjectName, ddmModelColumnName) && Objects.equals(ddmMappingCatalog.getMappingType(), MappingCatalogTypeEnum.MANUAL_MAPPING.getDesc() )) {
                    continue;
                }

                ddmMappingCatalog.setBusinessObjectId(businessObjectId);
                ddmMappingCatalog.setBusinessObjectName(businessObjectName);

                ddmMappingCatalog.setCatalogId(commonCatalogOfL5.getId());
                ddmMappingCatalog.setCatalogName(commonCatalogOfL5.getName());
                ddmMappingCatalog.setCatalogEnName(commonCatalogOfL5.getEnglishName());

                ddmMappingCatalog.setParentCatalogId(catalogOfL4Id);
                ddmMappingCatalog.setParentCatalogName(catalogOfL4.getName());
                ddmMappingCatalog.setStructureId(commonCatalogOfL5.getStructureId());

                ddmMappingCatalog.setModelCategoryId(element.getModelCategoryId());
                ddmMappingCatalog.setDdmModelId(ddmModelId);
                ddmMappingCatalog.setDdmModelName(ddmModelName);
                ddmMappingCatalog.setDdmCategoryPath(ddmCategoryPath);
                ddmMappingCatalog.setObjectId(element.getObjectId());
                //英文名称
                ddmMappingCatalog.setObjectName(element.getName());
                //中文名称
                ddmMappingCatalog.setAlias(element.getAlias());

                //字段的上级是表
                ddmMappingCatalog.setParentObjectId(element.getParentId());
                ddmMappingCatalog.setParentObjectName(element.getParentName());
                ddmMappingCatalog.setParentObjectAlias(element.getParentAlias());

                ddmMappingCatalog.setObjectLevel("L5");
                ddmMappingCatalog.setMappingType(MappingCatalogTypeEnum.MANUAL_MAPPING.getDesc());
                ddmMappingCatalog.setCreateTime(new Date());
                ddmMappingCatalog.setUpdateTime(new Date());
                ddmMappingCatalog.setCreator(username);
                ddmMappingCatalog.setUpdater(username);
                mappingCatalogsAll.add(ddmMappingCatalog);
                //为后续作插入取消映射记录日志使用
                updateDdmMappingCatalogs.add(ddmMappingCatalog);
            } else {
                //新增，判断是否已经匹配过
                DdmMappingCatalog mappingCatalog = insertColumnMappingMap.get(key);
                if (mappingCatalog != null) {
                    continue;
                }
                DdmMappingCatalog insertMappingCatalog = new DdmMappingCatalog();
                insertMappingCatalog.setBusinessObjectId(businessObjectId);
                insertMappingCatalog.setBusinessObjectName(businessObjectName);

                insertMappingCatalog.setCatalogId(commonCatalogOfL5.getId());
                insertMappingCatalog.setCatalogName(commonCatalogOfL5.getName());
                insertMappingCatalog.setCatalogEnName(commonCatalogOfL5.getEnglishName());

                insertMappingCatalog.setParentCatalogId(catalogOfL4Id);
                insertMappingCatalog.setParentCatalogName(catalogOfL4.getName());
                insertMappingCatalog.setStructureId(commonCatalogOfL5.getStructureId());

                insertMappingCatalog.setModelCategoryId(element.getModelCategoryId());
                insertMappingCatalog.setDdmModelId(ddmModelId);
                insertMappingCatalog.setDdmModelName(ddmModelName);
                insertMappingCatalog.setDdmCategoryPath(ddmCategoryPath);
                insertMappingCatalog.setObjectId(element.getObjectId());
                insertMappingCatalog.setObjectName(element.getName());
                insertMappingCatalog.setAlias(element.getAlias());

                insertMappingCatalog.setParentObjectId(element.getParentId());
                insertMappingCatalog.setParentObjectName(element.getParentName());
                insertMappingCatalog.setParentObjectAlias(element.getParentAlias());

                insertMappingCatalog.setObjectLevel("L5");
                insertMappingCatalog.setMappingType(MappingCatalogTypeEnum.MANUAL_MAPPING.getDesc());
                insertMappingCatalog.setCreateTime(new Date());
                insertMappingCatalog.setUpdateTime(new Date());
                insertMappingCatalog.setCreator(username);
                insertMappingCatalog.setUpdater(username);
                insertColumnMappingMap.put(key, insertMappingCatalog);
                mappingCatalogsAll.add(insertMappingCatalog);
            }
        }
        logger.info("manual compare mapping column end");
        //如果有更新的则先插入取消映射的日志
        if (!CollectionUtils.isEmpty(updateDdmMappingCatalogs)) {
            List<DdmMappingCatalogLog> mappingCatalogLogs = Lists.newArrayList();
            DdmMappingCatalogLog ddmMappingCatalogLog;
            for (DdmMappingCatalog tableUpdateDdmMappingCatalog : updateDdmMappingCatalogs) {
                ddmMappingCatalogLog = new DdmMappingCatalogLog();
                ddmMappingCatalogLog.setMappingId(tableUpdateDdmMappingCatalog.getId());
                ddmMappingCatalogLog.setCatalogId(tableUpdateDdmMappingCatalog.getCatalogId());
                ddmMappingCatalogLog.setMappingType(tableUpdateDdmMappingCatalog.getMappingType());
                ddmMappingCatalogLog.setOperatorTime(new Date());
                ddmMappingCatalogLog.setOperator(tableUpdateDdmMappingCatalog.getUpdater());
                mappingCatalogLogs.add(ddmMappingCatalogLog);
            }
            ddmMappingCatalogLogRepository.saveAll(mappingCatalogLogs);
            logger.info("manual mapping 共插入取消映射记录日志{}条:", mappingCatalogLogs.size());
        }
        if (!CollectionUtils.isEmpty(mappingCatalogsAll)) {
            logger.info("manual mapping log insert begin");
            //插入映射信息
            List<DdmMappingCatalog> catalogList = ddmMappingCatalogRepository.saveAll(mappingCatalogsAll);
            logger.info("manual mapping 共插入或者更新映射信息{}条", catalogList.size());
            //插入映射记录
            List<DdmMappingCatalogLog> mappingCatalogLogs = Lists.newArrayList();
            DdmMappingCatalogLog ddmMappingCatalogLog;
            for (DdmMappingCatalog ddmMappingCatalog : catalogList) {
                ddmMappingCatalogLog = new DdmMappingCatalogLog();
                ddmMappingCatalogLog.setMappingId(ddmMappingCatalog.getId());
                ddmMappingCatalogLog.setCatalogId(ddmMappingCatalog.getCatalogId());
                ddmMappingCatalogLog.setMappingType(ddmMappingCatalog.getMappingType());
                ddmMappingCatalogLog.setOperatorTime(new Date());
                ddmMappingCatalogLog.setOperator(ddmMappingCatalog.getUpdater());
                mappingCatalogLogs.add(ddmMappingCatalogLog);
                resultDto.addSuccess();
            }
            ddmMappingCatalogLogRepository.saveAll(mappingCatalogLogs);
            logger.info("manual mapping 共插入映射日志{}条:", mappingCatalogLogs.size());
            logger.info("manual mapping log insert end");
        }
        return resultDto;
    }

    @Override
    public List<CommonCatalog> queryLogicDataEntity(Long businessObjectId) {
        //findByStructureIdAndStatusAndLevel
        List<CommonCatalog> commonCatalogs;
        if (businessObjectId == null) {
            //查询所有已启用的目录空间
            List<CommonCatalogStructure> structureList = catalogStructureRepository.findAllByStructureTypeAndOpenStatus(EnumStructureType.DATA_ASSETS, true);
            List<Long> structureListIds = structureList.stream().map(CommonCatalogStructure::getId).toList();
            //获取业务对象目录
            commonCatalogs = commonCatalogNewRepository.findCommonCatalogsByLevel(structureListIds, 3, EnumAssetsCatalogStatus.PUBLISHED);
        } else {
            //根据业务对象目录Id获取逻辑数据实体
            commonCatalogs = catalogRepository.findAllByParentIdAndStatus(businessObjectId, EnumAssetsCatalogStatus.PUBLISHED);
        }
        return commonCatalogs;
    }

    /**
     * 模型映射管理左侧查询
     * @param commonCatalogs
     * @return
     */
    private List<DdmMappingCatalogDto> buildL5OfMapping(List<CommonCatalog> commonCatalogs){

        List<DdmMappingCatalogDto> mappingCatalogDtos = Lists.newArrayList();
        List<Long> catalogIdsOfL5 = commonCatalogs.stream().map(CommonCatalog::getId).toList();
        List<DdmMappingCatalog> ddmMappingCatalogs = ddmMappingCatalogRepository.queryMappingByTypes(catalogIdsOfL5);
        //获取业务系统
        List<Long> modelCategoryIds = ddmMappingCatalogs.stream().map(DdmMappingCatalog::getModelCategoryId).toList();
        List<ModelCategoryDto> categoryDtos = modelCategoryService.getModelCategoriesByIds(modelCategoryIds);
        Map<Object, ModelCategoryDto> modelCategoryDtoMap = categoryDtos.stream().collect(Collectors.toMap(ModelCategoryDto::getCategoryId, Function.identity(), (x1, x2) -> x1));
        Map<Long, DdmMappingCatalog> ddmMappingCatalogsMap = ddmMappingCatalogs.stream().collect(Collectors.toMap(DdmMappingCatalog::getCatalogId, Function.identity(), (x1, x2) -> x1));

        //获取上级目录
        List<Long> catalogIdsOfL4 = commonCatalogs.stream().map(CommonCatalog::getParentId).toList();
        List<CommonCatalog> catalogsOfL4 = commonCatalogNewRepository.findCommonCatalogsByIdAndStatus(catalogIdsOfL4, EnumAssetsCatalogStatus.PUBLISHED);
        Map<Long, CommonCatalog> commonCatalogOfL4Map = catalogsOfL4.stream().collect(Collectors.toMap(CommonCatalog::getId, Function.identity(), (x1, x2) -> x1));
        //获取L4的上级业务对象
        List<Long> catalogIdsOfL3 = catalogsOfL4.stream().map(CommonCatalog::getParentId).toList();
        List<CommonCatalog> catalogsOfL3 = commonCatalogNewRepository.findCommonCatalogsByIdAndStatus(catalogIdsOfL3, EnumAssetsCatalogStatus.PUBLISHED);
        Map<Long, CommonCatalog> commonCatalogOfL3Map = catalogsOfL3.stream().collect(Collectors.toMap(CommonCatalog::getId, Function.identity(), (x1, x2) -> x1));
        DdmMappingCatalogDto  mappingCatalogDto;
        for (CommonCatalog commonCatalog : commonCatalogs) {
            Long id = commonCatalog.getId();
            mappingCatalogDto = new DdmMappingCatalogDto();
            DdmMappingCatalog ddmMappingCatalog = ddmMappingCatalogsMap.get(id);
            if (ddmMappingCatalog != null) {
                //有映射记录
                mappingCatalogDto.setBusinessObjectId(ddmMappingCatalog.getBusinessObjectId());
                mappingCatalogDto.setBusinessObjectName(ddmMappingCatalog.getBusinessObjectName());
                mappingCatalogDto.setLogicDataEntityId(ddmMappingCatalog.getParentCatalogId());
                mappingCatalogDto.setLogicDataEntityName(ddmMappingCatalog.getParentCatalogName());
                CommonCatalog L4Catalog = commonCatalogOfL4Map.get(ddmMappingCatalog.getParentCatalogId());
                if (L4Catalog != null) {
                    mappingCatalogDto.setLogicDataEntityEnName(L4Catalog.getEnglishName());
                }
                mappingCatalogDto.setColumnCatalogId(ddmMappingCatalog.getCatalogId());
                mappingCatalogDto.setColumnCatalogName(ddmMappingCatalog.getCatalogEnName());
                mappingCatalogDto.setColumnCatalogAlias(ddmMappingCatalog.getAlias());
                mappingCatalogDto.setModelCategoryId(ddmMappingCatalog.getModelCategoryId());
                ModelCategoryDto modelCategoryDto = modelCategoryDtoMap.get(ddmMappingCatalog.getModelCategoryId());
                if (modelCategoryDto != null) {
                    mappingCatalogDto.setModelCategoryName(modelCategoryDto.getCategoryName());
                }
                mappingCatalogDto.setDdmModelId(ddmMappingCatalog.getDdmModelId());
                mappingCatalogDto.setDdmModelName(ddmMappingCatalog.getDdmModelName());
                mappingCatalogDto.setTableId(ddmMappingCatalog.getParentObjectId());
                mappingCatalogDto.setTableName(ddmMappingCatalog.getParentObjectName());
                mappingCatalogDto.setTableAlias(ddmMappingCatalog.getParentObjectAlias());
                mappingCatalogDto.setColumnId(ddmMappingCatalog.getObjectId());
                mappingCatalogDto.setColumnName(ddmMappingCatalog.getObjectName());
                mappingCatalogDto.setColumnAlias(ddmMappingCatalog.getAlias());
                mappingCatalogDto.setMappingType(ddmMappingCatalog.getMappingType());
                mappingCatalogDto.setMappingId(ddmMappingCatalog.getId());
                mappingCatalogDto.setEnableClick(Boolean.TRUE);
            } else {
                //没有映射记录
                //获取L5对应的L4

                CommonCatalog catalogOfL4 = commonCatalogOfL4Map.get(commonCatalog.getParentId());
                if (catalogOfL4 != null) {
                    mappingCatalogDto.setLogicDataEntityId(catalogOfL4.getId());
                    mappingCatalogDto.setLogicDataEntityName(catalogOfL4.getName());
                    mappingCatalogDto.setLogicDataEntityEnName(catalogOfL4.getEnglishName());
                    CommonCatalog catalogOfL3 = commonCatalogOfL3Map.get(catalogOfL4.getParentId());
                    if (catalogOfL3 != null) {
                        mappingCatalogDto.setBusinessObjectId(catalogOfL3.getId());
                        mappingCatalogDto.setBusinessObjectName(catalogOfL3.getName());
                    }
                }
                mappingCatalogDto.setColumnCatalogId(id);
                mappingCatalogDto.setColumnCatalogName(commonCatalog.getEnglishName());
                mappingCatalogDto.setColumnCatalogAlias(commonCatalog.getName());
                mappingCatalogDto.setModelCategoryId(null);
                mappingCatalogDto.setModelCategoryName("");
                mappingCatalogDto.setDdmModelId(null);
                mappingCatalogDto.setDdmModelName("");
                mappingCatalogDto.setTableId(null);
                mappingCatalogDto.setTableName("");
                mappingCatalogDto.setTableAlias("");
                mappingCatalogDto.setColumnId(null);
                mappingCatalogDto.setColumnName("");
                mappingCatalogDto.setColumnAlias("");
                mappingCatalogDto.setMappingType("");
                mappingCatalogDto.setEnableClick(Boolean.TRUE);
            }
            mappingCatalogDtos.add(mappingCatalogDto);
        }
        return mappingCatalogDtos;
    }

    /**
     * 模型映射管理右侧查询
     * @param ddmCollectElements
     * @return
     */
    private List<DdmMappingCatalogDto> buildL5OfMappingByDdm(List<DdmCollectElement> ddmCollectElements) {
        List<DdmMappingCatalogDto> mappingCatalogDtos = Lists.newArrayList();
        //获取业务系统
        List<Long> modelCategoryIds = ddmCollectElements.stream().map(DdmCollectElement::getModelCategoryId).toList();
        List<ModelCategoryDto> categoryDtos = modelCategoryService.getModelCategoriesByIds(modelCategoryIds);
        Map<Object, ModelCategoryDto> modelCategoryDtoMap = categoryDtos.stream().collect(Collectors.toMap(ModelCategoryDto::getCategoryId, Function.identity(), (x1, x2) -> x1));
        //模型ID
        List<Long> ddmModelIds = ddmCollectElements.stream().map(DdmCollectElement::getDdmModelId).toList();
        //字段ID
        List<Long> ddmColumnIds = ddmCollectElements.stream().map(DdmCollectElement::getObjectId).toList();
        //查询是否存在映射
        List<DdmMappingCatalog> ddmMappingCatalogs = ddmMappingCatalogRepository.queryDdmMappingCatalogsByObjectIds(modelCategoryIds, ddmModelIds, ddmColumnIds, "L5");
        Map<String, DdmMappingCatalog> ddmMappingCatalogsMap = ddmMappingCatalogs.stream().collect(Collectors.toMap(x -> x.getModelCategoryId() + "-" + x.getDdmModelId() + "-" + x.getObjectId(), Function.identity(), (x1, x2) -> x1));
        //获取映射关系L4目录
        List<Long> catalogIdsOfL4 = ddmMappingCatalogs.stream().map(DdmMappingCatalog::getParentCatalogId).toList();
        List<CommonCatalog> catalogsOfL4 = commonCatalogNewRepository.findCommonCatalogsByIdAndStatus(catalogIdsOfL4, EnumAssetsCatalogStatus.PUBLISHED);
        Map<Long, CommonCatalog> commonCatalogOfL4Map = catalogsOfL4.stream().collect(Collectors.toMap(CommonCatalog::getId, Function.identity(), (x1, x2) -> x1));
        DdmMappingCatalogDto  mappingCatalogDto;
        for (DdmCollectElement ddmCollectElement : ddmCollectElements) {
            String key = ddmCollectElement.getModelCategoryId()+"-"+ddmCollectElement.getDdmModelId()+"-"+ddmCollectElement.getObjectId();
            DdmMappingCatalog ddmMappingCatalog = ddmMappingCatalogsMap.get(key);
            if (ddmMappingCatalog != null) {
                //有映射记录
                mappingCatalogDto = new DdmMappingCatalogDto();
                mappingCatalogDto.setBusinessObjectId(ddmMappingCatalog.getBusinessObjectId());
                mappingCatalogDto.setBusinessObjectName(ddmMappingCatalog.getBusinessObjectName());
                mappingCatalogDto.setLogicDataEntityId(ddmMappingCatalog.getParentCatalogId());
                mappingCatalogDto.setLogicDataEntityName(ddmMappingCatalog.getParentCatalogName());
                CommonCatalog catalogOfL3 = commonCatalogOfL4Map.get(ddmMappingCatalog.getParentCatalogId());
                if (catalogOfL3 != null) {
                    mappingCatalogDto.setLogicDataEntityEnName(catalogOfL3.getEnglishName());
                }
                mappingCatalogDto.setColumnCatalogId(ddmMappingCatalog.getCatalogId());
                mappingCatalogDto.setColumnCatalogName(ddmMappingCatalog.getCatalogEnName());
                mappingCatalogDto.setColumnCatalogAlias(ddmMappingCatalog.getAlias());
                mappingCatalogDto.setModelCategoryId(ddmMappingCatalog.getModelCategoryId());
                ModelCategoryDto modelCategoryDto = modelCategoryDtoMap.get(ddmMappingCatalog.getModelCategoryId());
                if (modelCategoryDto != null) {
                    mappingCatalogDto.setModelCategoryName(modelCategoryDto.getCategoryName());
                }
                mappingCatalogDto.setDdmModelId(ddmMappingCatalog.getDdmModelId());
                mappingCatalogDto.setDdmModelName(ddmMappingCatalog.getDdmModelName());
                mappingCatalogDto.setTableId(ddmMappingCatalog.getParentObjectId());
                mappingCatalogDto.setTableName(ddmMappingCatalog.getParentObjectName());
                mappingCatalogDto.setTableAlias(ddmMappingCatalog.getParentObjectAlias());
                mappingCatalogDto.setColumnId(ddmMappingCatalog.getObjectId());
                mappingCatalogDto.setColumnName(ddmMappingCatalog.getObjectName());
                mappingCatalogDto.setColumnAlias(ddmMappingCatalog.getAlias());
                mappingCatalogDto.setMappingType(ddmMappingCatalog.getMappingType());
                mappingCatalogDto.setMappingId(ddmMappingCatalog.getId());
                mappingCatalogDto.setEnableClick(Boolean.TRUE);
            } else {
                mappingCatalogDto = new DdmMappingCatalogDto();
                mappingCatalogDto.setBusinessObjectId(null);
                mappingCatalogDto.setBusinessObjectName("");
                mappingCatalogDto.setLogicDataEntityId(null);
                mappingCatalogDto.setLogicDataEntityName("");
                mappingCatalogDto.setColumnCatalogId(null);
                mappingCatalogDto.setColumnCatalogName("");
                mappingCatalogDto.setColumnCatalogAlias("");
                mappingCatalogDto.setModelCategoryId(ddmCollectElement.getModelCategoryId());
                ModelCategoryDto modelCategoryDto = modelCategoryDtoMap.get(ddmCollectElement.getModelCategoryId());
                if (modelCategoryDto != null) {
                    mappingCatalogDto.setModelCategoryName(modelCategoryDto.getCategoryName());
                }
                mappingCatalogDto.setDdmModelId(ddmCollectElement.getDdmModelId());
                mappingCatalogDto.setDdmModelName(ddmCollectElement.getDdmModelName());
                mappingCatalogDto.setTableId(ddmCollectElement.getParentId());
                mappingCatalogDto.setTableName(ddmCollectElement.getParentName());
                mappingCatalogDto.setTableAlias(ddmCollectElement.getParentAlias());
                mappingCatalogDto.setColumnId(ddmCollectElement.getObjectId());
                mappingCatalogDto.setColumnName(ddmCollectElement.getName());
                mappingCatalogDto.setColumnAlias(ddmCollectElement.getAlias());
                mappingCatalogDto.setMappingType("");
                mappingCatalogDto.setEnableClick(Boolean.FALSE);
            }
            mappingCatalogDtos.add(mappingCatalogDto);
        }
        return mappingCatalogDtos;
    }

}
