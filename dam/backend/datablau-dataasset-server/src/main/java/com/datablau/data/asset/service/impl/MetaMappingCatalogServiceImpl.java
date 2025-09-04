package com.datablau.data.asset.service.impl;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.datablau.catalog.enums.EnumSupportType;
import com.datablau.data.asset.api.DataAssetsCatalogAuthService;
import com.datablau.data.asset.api.DataAssetsCatalogService;
import com.datablau.data.asset.api.DataAssetsService;
import com.datablau.data.asset.dto.BindAssetsDto;
import com.datablau.data.asset.enums.EnumSearchRange;
import com.datablau.data.asset.jpa.entity.DataAssets;
import com.datablau.data.asset.jpa.repository.DataAssetsRepository;
import com.datablau.data.asset.utils.KafkaLogUtils;
import com.datablau.dataasset.utils.IpUtil;
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
import com.datablau.data.asset.dto.ManualMappingImportResultDto;
import com.datablau.data.asset.dto.MetaDataAutoMappingDto;
import com.datablau.data.asset.dto.MetaDataManualMappingExcelDto;
import com.datablau.data.asset.dto.MetaDataMappingCatalogDto;
import com.datablau.data.asset.dto.MetaDataMappingQueryParamDto;
import com.datablau.data.asset.dto.SearchDto;
import com.datablau.data.asset.enums.MappingCatalogTypeEnum;
import com.datablau.data.asset.jpa.entity.MetaDataMappingCatalog;
import com.datablau.data.asset.jpa.entity.MetaDataMappingCatalogLog;
import com.datablau.data.asset.jpa.repository.CommonCatalogNewRepository;
import com.datablau.data.asset.jpa.repository.MetaDataMappingCatalogLogRepository;
import com.datablau.data.asset.jpa.repository.MetaDataMappingCatalogRepository;
import com.datablau.data.asset.service.MetaDataMappingCatalogService;
import com.datablau.data.asset.utils.DatablauUtil;
import com.datablau.metadata.common.dto.metadata.DataObjectDto;
import com.datablau.metadata.common.dto.model.ModelDto;
import com.datablau.project.api.RemoteMetaDataExtendService;
import com.datablau.project.api.dto.DataObjectQueryParamDto;
import com.datablau.security.management.utils.AuthTools;
import com.google.common.collect.Lists;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
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
public class MetaMappingCatalogServiceImpl implements MetaDataMappingCatalogService {
    private static final Logger logger = LoggerFactory.getLogger(MetaMappingCatalogServiceImpl.class);

    @Autowired
    private CommonCatalogRepository catalogRepository;
    @Autowired
    private RemoteMetaDataExtendService remoteMetaDataExtendService;
    @Autowired
    private MetaDataMappingCatalogRepository mappingCatalogRepository;
    @Autowired
    protected RedissonClient redissonClient;
    @Autowired
    private MetaDataMappingCatalogLogRepository metaDataMappingCatalogLogRepository;
    @Autowired
    private ModelCategoryService modelCategoryService;
    @Autowired
    private CommonCatalogNewRepository commonCatalogNewRepository;
    @Autowired
    private CommonCatalogStructureRepository catalogStructureRepository;
    @Autowired
    private MultiConditionQueryUtils queryUtils;
    @Autowired
    private DataAssetsCatalogAuthService authService;
    @Autowired
    private DataAssetsService dataAssetsService;
    @Autowired
    private KafkaLogUtils kafkaLogUtils;
    @Autowired
    protected DataAssetsRepository assetsRepository;
    @Autowired
    private DataAssetsCatalogService dataAssetsCatalogService;

    protected AtomicInteger idGenerator = new AtomicInteger(0);
    protected ExecutorService es = Executors.newFixedThreadPool(10, (run) -> {
        Thread t = new Thread(run);
        t.setName("EXT-ASSET-AUTO-MAPPING" + this.idGenerator.getAndIncrement());
        return t;
    });


    @Override
    public void createAutoMapping(MetaDataAutoMappingDto autoMappingDto) {
        String username = AuthTools.currentUsernameFailFast();
        List<CommonCatalog> businessObjects = autoMappingDto.getBusinessObjects();
        //数据源
        Long parentModelId = autoMappingDto.getModelId();
        ModelDto parentModelDto = remoteMetaDataExtendService.queryModelDtoById(parentModelId);
        //数据库（数据源下的schema）
        Long modelId = autoMappingDto.getDatabaseId();
        if (CollectionUtils.isEmpty(businessObjects)) {
            return;
        }
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

        //获取数据库下的表和字段
        List<DataObjectDto> dataObjectDtos = remoteMetaDataExtendService.findDataObjectDtos(modelId, Arrays.asList(LDMTypes.oEntity, LDMTypes.oAttribute, LDMTypes.oModelSource));
        List<DataObjectDto> tableElements = dataObjectDtos.stream().filter(x -> Objects.equals(LDMTypes.oEntity, x.getTypeId())).toList();
        List<DataObjectDto> columnElements = dataObjectDtos.stream().filter(x -> Objects.equals(LDMTypes.oAttribute, x.getTypeId())).toList();
        Optional<DataObjectDto> modelElementOptional = dataObjectDtos.stream().filter(x -> Objects.equals(LDMTypes.oModelSource, x.getTypeId())).findFirst().stream().findFirst();
        if (modelElementOptional.isEmpty()) {
            return;
        }
        Map<Long, CommonCatalog> businessObjectMap = businessObjects.stream().collect(Collectors.toMap(CommonCatalog::getId, Function.identity(), (x1, x2) -> x1));
        Map<Long, List<DataObjectDto>> columnElementMaps = columnElements.stream().collect(Collectors.groupingBy(DataObjectDto::getParentId));

        //查询表和字段是否存在映射
        List<Long> commonCatalogIds = commonCatalogsAll.stream().map(CommonCatalog::getId).toList();
        List<MetaDataMappingCatalog> metaDataMappingCatalogs = mappingCatalogRepository.queryMappingCatalogs(commonCatalogIds);
        //获取表的映射关系
        List<MetaDataMappingCatalog> tableMappings = metaDataMappingCatalogs.stream().filter(x -> Objects.equals("L4", x.getObjectLevel())).toList();
        List<MetaDataMappingCatalog> columnMappings = metaDataMappingCatalogs.stream().filter(x -> Objects.equals("L5", x.getObjectLevel())).toList();
        Map<String, MetaDataMappingCatalog> tableMappingMap = tableMappings.stream().collect(Collectors.toMap(x -> x.getBusinessObjectId() + "-" + x.getParentCatalogId() + "-" + x.getCatalogId(), Function.identity(),
                (x1, x2) -> x1));
        Map<String, MetaDataMappingCatalog> columnMappingMap = columnMappings.stream().collect(Collectors.toMap(x -> x.getBusinessObjectId() + "-" + x.getParentCatalogId() + "-" + x.getCatalogId(), Function.identity(),
                (x1, x2) -> x1));

        for (Map.Entry<Long, List<CommonCatalog>> entry : catalogsOfL4GroupMap.entrySet()) {
            Long businessObjectId = entry.getKey();
            logger.info("businessObjectId:{}", businessObjectId);
            List<MetaDataMappingCatalog> tableMetaDataMappingCatalogs = new CopyOnWriteArrayList<>();
            RLock lock = this.redissonClient.getLock("autoMapping-" + businessObjectId);
            List<MetaDataMappingCatalog> updateMetaDataMappingCatalogs = new ArrayList<>();
            Map<String, MetaDataMappingCatalog> insertMappingMap = new HashMap<>();
            List<MetaDataMappingCatalog> mappingCatalogsAll = new ArrayList<>();
            //类型为手动映射的表映射关系
            List<MetaDataMappingCatalog> manualMappingList = Lists.newArrayList();
            try {

                logger.info("metadata auto compare mapping table begin");
                //先比较表,表比对上比较字段
                List<CommonCatalog> commonCatalogsOfL4 = entry.getValue();
                for (CommonCatalog catalog : commonCatalogsOfL4) {
                    String englishName = catalog.getEnglishName();
                    String processedEnglishName = englishName.toLowerCase().replace(" ", "_");
                    for (DataObjectDto tableElement : tableElements) {
                        String name = tableElement.getPhysicalName();
                        String processedName = name.toLowerCase().replace(" ", "_");
                        if (Objects.equals(processedName, processedEnglishName)) {
                            //匹配的上看之前是否存在匹配记录，如果存在且是自动映射、但是表信息不一致则更新数据，手动映射的则跳过
                            DataObjectDto modelElement = modelElementOptional.get();
                            CommonCatalog businessCatalog = businessObjectMap.get(catalog.getParentId());
                            if (businessCatalog == null) {
                                continue;
                            }

                            Long parentId = catalog.getParentId();
                            Long catalogId = catalog.getId();
                            String key = businessObjectId + "-" + parentId + "-" + catalogId;
                            MetaDataMappingCatalog mappingCatalog = tableMappingMap.get(key);
                            //看是否是自动映射,或者取消映射
                            if (mappingCatalog != null && !Objects.equals(MappingCatalogTypeEnum.MANUAL_MAPPING.getDesc(), mappingCatalog.getMappingType())) {

                                //判断表信息是否一致
                                Long tableId = tableElement.getTableId();
                                Long mappingDdmModelId = mappingCatalog.getModelId();
                                Long mappingObjectId = mappingCatalog.getObjectId();

                                String oldMappingType = mappingCatalog.getMappingType();

                                //表映射信息一致，还要考虑表下的字段映射是否一致，所以提前add(mappingCatalog)
                                tableMetaDataMappingCatalogs.add(mappingCatalog);
                                if (Objects.equals(MappingCatalogTypeEnum.AUTOMATIC_MAPPING.getDesc(), oldMappingType)) {
                                    if (Objects.equals(modelId, mappingDdmModelId) && Objects.equals(tableId, mappingObjectId)) {
                                        break;
                                    }
                                }

                                mappingCatalog.setBusinessObjectName(businessCatalog.getName());
                                mappingCatalog.setCatalogName(catalog.getName());
                                //表的上级是业务对象中文名
                                mappingCatalog.setCatalogEnName(catalog.getEnglishName());
                                mappingCatalog.setCatalogId(catalog.getId());
                                mappingCatalog.setParentCatalogId(businessCatalog.getId());
                                mappingCatalog.setParentCatalogName(businessCatalog.getName());
                                mappingCatalog.setCatalogPath(catalog.getCatalogPath());
                                mappingCatalog.setStructureId(catalog.getStructureId());
                                mappingCatalog.setModelCategoryId(modelElement.getModelCategoryId());
                                mappingCatalog.setModelId(modelElement.getModelId());
                                mappingCatalog.setModelName(modelElement.getModelName());
                                mappingCatalog.setParentModelId(parentModelId);
                                mappingCatalog.setParentModelName(parentModelDto.getDefinition());
                                mappingCatalog.setObjectId(tableElement.getObjectId());
                                //英文名称
                                mappingCatalog.setObjectName(tableElement.getPhysicalName());
                                //中文名称
                                mappingCatalog.setAlias(tableElement.getLogicalName());
                                mappingCatalog.setParentObjectId(tableElement.getParentId());
                                mappingCatalog.setParentObjectName(tableElement.getParentPhysicalName());
                                mappingCatalog.setParentObjectAlias(tableElement.getParentLogicalName());
                                mappingCatalog.setObjectLevel("L4");
                                mappingCatalog.setMappingType(MappingCatalogTypeEnum.AUTOMATIC_MAPPING.getDesc());
                                mappingCatalog.setCreateTime(new Date());
                                mappingCatalog.setUpdateTime(new Date());
                                mappingCatalog.setCreator(username);
                                mappingCatalog.setUpdater(username);
                                //为后续作插入取消映射记录日志使用
                                updateMetaDataMappingCatalogs.add(mappingCatalog);
                                mappingCatalogsAll.add(mappingCatalog);
                            } else if (mappingCatalog != null && Objects.equals(MappingCatalogTypeEnum.MANUAL_MAPPING.getDesc(), mappingCatalog.getMappingType())) {
                                //表存在手动映射关系，考虑到可能部分字段无映射关系，所以此处需要存入表为手动映射的数据
                                manualMappingList.add(mappingCatalog);
                                break;
                            } else {
                                //新增,要判断目录是否已经匹配过表，匹配过了则跳出
                                MetaDataMappingCatalog insertMappingCatalog = insertMappingMap.get(key);
                                if (insertMappingCatalog != null) {
                                    break;
                                }
                                MetaDataMappingCatalog metaDataMappingCatalog = new MetaDataMappingCatalog();

                                metaDataMappingCatalog.setBusinessObjectId(catalog.getParentId());
                                metaDataMappingCatalog.setBusinessObjectName(businessCatalog.getName());
                                metaDataMappingCatalog.setCatalogId(catalog.getId());
                                metaDataMappingCatalog.setCatalogName(catalog.getName());
                                metaDataMappingCatalog.setCatalogPath(catalog.getCatalogPath());
                                //表的上级是业务对象
                                metaDataMappingCatalog.setCatalogEnName(catalog.getEnglishName());
                                metaDataMappingCatalog.setParentCatalogId(businessCatalog.getId());
                                metaDataMappingCatalog.setParentCatalogName(businessCatalog.getName());
                                metaDataMappingCatalog.setStructureId(catalog.getStructureId());
                                metaDataMappingCatalog.setCatalogPath(catalog.getCatalogPath());
                                metaDataMappingCatalog.setModelCategoryId(modelElement.getModelCategoryId());
                                metaDataMappingCatalog.setModelId(modelElement.getModelId());
                                metaDataMappingCatalog.setModelName(modelElement.getModelName());
                                metaDataMappingCatalog.setParentModelId(parentModelId);
                                metaDataMappingCatalog.setParentModelName(parentModelDto.getDefinition());
                                metaDataMappingCatalog.setObjectId(tableElement.getObjectId());
                                //英文名称
                                metaDataMappingCatalog.setObjectName(tableElement.getPhysicalName());
                                //中文名称
                                metaDataMappingCatalog.setAlias(tableElement.getLogicalName());
                                metaDataMappingCatalog.setParentObjectId(tableElement.getParentId());
                                metaDataMappingCatalog.setParentObjectName(tableElement.getParentPhysicalName());
                                metaDataMappingCatalog.setParentObjectAlias(tableElement.getParentLogicalName());
                                metaDataMappingCatalog.setObjectLevel("L4");
                                metaDataMappingCatalog.setMappingType(MappingCatalogTypeEnum.AUTOMATIC_MAPPING.getDesc());
                                metaDataMappingCatalog.setCreateTime(new Date());
                                metaDataMappingCatalog.setUpdateTime(new Date());
                                metaDataMappingCatalog.setCreator(username);
                                metaDataMappingCatalog.setUpdater(username);
                                tableMetaDataMappingCatalogs.add(metaDataMappingCatalog);
                                insertMappingMap.put(key, metaDataMappingCatalog);
                                mappingCatalogsAll.add(metaDataMappingCatalog);
                            }
                            break;
                        }
                    }
                }
                logger.info("metadata auto compare mapping table end");

                //加上手动映射的表
                if (!CollectionUtils.isEmpty(manualMappingList)) {
                    tableMetaDataMappingCatalogs.addAll(manualMappingList);
                }


                Map<String, MetaDataMappingCatalog> insertColumnMappingMap = new HashMap<>();
                //循环匹配上的目录，判断表下的字段是否能映射上
                for (MetaDataMappingCatalog updateMappingCatalog : tableMetaDataMappingCatalogs) {
                    //表Id
                    Long objectId = updateMappingCatalog.getObjectId();
                    //L4目录Id
                    Long catalogIdOfL4 = updateMappingCatalog.getCatalogId();
                    //businessObjectId
                    String businessObjectName = updateMappingCatalog.getBusinessObjectName();
                    List<DataObjectDto> collectElementList = columnElementMaps.get(objectId);
                    //获取L4目录下的L5
                    List<CommonCatalog> catalogs = catalogsOfL5Map.get(catalogIdOfL4);
                    for (CommonCatalog catalog : catalogs) {
                        String englishName = catalog.getEnglishName();
                        String processedEnglishName = englishName.toLowerCase().replace(" ", "_");
                        //循环比对字段
                        for (DataObjectDto element : collectElementList) {
                            String name = element.getPhysicalName();
                            String processedName = name.toLowerCase().replace(" ", "_");
                            if (Objects.equals(processedName, processedEnglishName)) {
                                //匹配上看之前是否存在匹配记录，如果存在且是自动映射则更新数据，手动映射则跳过
                                Long parentId = catalog.getParentId();
                                Long catalogId = catalog.getId();
                                String key = businessObjectId + "-" + parentId + "-" + catalogId;
                                MetaDataMappingCatalog metaDataMappingCatalog = columnMappingMap.get(key);
                                //是否为自动映射或者取消映射
                                if (metaDataMappingCatalog != null && !Objects.equals(MappingCatalogTypeEnum.MANUAL_MAPPING.getDesc(), metaDataMappingCatalog.getMappingType())) {
                                    //判断映射的字段信息是否一致
                                    Long mappingObjectId = metaDataMappingCatalog.getObjectId();
                                    Long mappingParentObjectId = metaDataMappingCatalog.getParentObjectId();
                                    Long mappingDdmModelId = metaDataMappingCatalog.getModelId();

                                    String oldMappingType = metaDataMappingCatalog.getMappingType();
                                    //自动映射
                                    if (Objects.equals(MappingCatalogTypeEnum.AUTOMATIC_MAPPING.getDesc(), oldMappingType)) {
                                        if (Objects.equals(modelId, mappingDdmModelId) && Objects.equals(element.getParentId(), mappingParentObjectId)
                                                && Objects.equals(mappingObjectId, element.getObjectId())) {
                                            break;
                                        }
                                    }
                                    metaDataMappingCatalog.setBusinessObjectName(businessObjectName);
                                    metaDataMappingCatalog.setCatalogName(catalog.getName());
                                    //字段的上级是表
                                    metaDataMappingCatalog.setCatalogEnName(catalog.getEnglishName());
                                    metaDataMappingCatalog.setParentCatalogId(updateMappingCatalog.getCatalogId());
                                    metaDataMappingCatalog.setParentCatalogName(updateMappingCatalog.getCatalogName());
                                    metaDataMappingCatalog.setStructureId(catalog.getStructureId());
                                    metaDataMappingCatalog.setCatalogPath(catalog.getCatalogPath());
                                    metaDataMappingCatalog.setModelCategoryId(updateMappingCatalog.getModelCategoryId());
                                    metaDataMappingCatalog.setModelId(updateMappingCatalog.getModelId());
                                    metaDataMappingCatalog.setModelName(updateMappingCatalog.getModelName());
                                    metaDataMappingCatalog.setParentModelId(parentModelId);
                                    metaDataMappingCatalog.setParentModelName(parentModelDto.getDefinition());
                                    metaDataMappingCatalog.setObjectId(element.getObjectId());
                                    //英文名称
                                    metaDataMappingCatalog.setObjectName(element.getPhysicalName());
                                    //中文名称
                                    metaDataMappingCatalog.setAlias(element.getLogicalName());
                                    metaDataMappingCatalog.setParentObjectId(element.getParentId());
                                    metaDataMappingCatalog.setParentObjectName(updateMappingCatalog.getObjectName());
                                    metaDataMappingCatalog.setParentObjectAlias(updateMappingCatalog.getAlias());
                                    metaDataMappingCatalog.setObjectLevel("L5");
                                    metaDataMappingCatalog.setMappingType(MappingCatalogTypeEnum.AUTOMATIC_MAPPING.getDesc());
                                    metaDataMappingCatalog.setCreateTime(new Date());
                                    metaDataMappingCatalog.setUpdateTime(new Date());
                                    metaDataMappingCatalog.setCreator(username);
                                    metaDataMappingCatalog.setUpdater(username);
                                    mappingCatalogsAll.add(metaDataMappingCatalog);
                                    //为后续作插入取消映射记录日志使用
                                    updateMetaDataMappingCatalogs.add(metaDataMappingCatalog);
                                } else if (metaDataMappingCatalog != null && Objects.equals(MappingCatalogTypeEnum.MANUAL_MAPPING.getDesc(), metaDataMappingCatalog.getMappingType())) {
                                    //存在手动映射关系调出循环
                                    break;
                                } else {
                                    //新增，判断是否已经匹配过
                                    MetaDataMappingCatalog mappingCatalog = insertColumnMappingMap.get(key);
                                    if (mappingCatalog != null) {
                                        break;
                                    }
                                    MetaDataMappingCatalog insertMappingCatalog = new MetaDataMappingCatalog();
                                    insertMappingCatalog.setBusinessObjectId(businessObjectId);
                                    insertMappingCatalog.setBusinessObjectName(businessObjectName);

                                    insertMappingCatalog.setCatalogId(catalog.getId());
                                    insertMappingCatalog.setCatalogName(catalog.getName());
                                    insertMappingCatalog.setCatalogEnName(catalog.getEnglishName());

                                    insertMappingCatalog.setParentCatalogId(updateMappingCatalog.getCatalogId());
                                    insertMappingCatalog.setParentCatalogName(updateMappingCatalog.getCatalogName());
                                    insertMappingCatalog.setStructureId(updateMappingCatalog.getStructureId());
                                    insertMappingCatalog.setCatalogPath(catalog.getCatalogPath());

                                    insertMappingCatalog.setModelCategoryId(updateMappingCatalog.getModelCategoryId());
                                    insertMappingCatalog.setModelId(updateMappingCatalog.getModelId());
                                    insertMappingCatalog.setModelName(updateMappingCatalog.getModelName());
                                    insertMappingCatalog.setParentModelId(parentModelId);
                                    insertMappingCatalog.setParentModelName(parentModelDto.getDefinition());

                                    insertMappingCatalog.setObjectId(element.getObjectId());
                                    insertMappingCatalog.setObjectName(element.getPhysicalName());
                                    insertMappingCatalog.setAlias(element.getLogicalName());

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

                logger.info("metadata auto compare mapping column end");

                //按业务对象分别数据进行处理
                //判断资产是否被其他目录绑定
                checkBindAssets(mappingCatalogsAll);

                //如果有更新的则先插入取消映射的日志
                if (!CollectionUtils.isEmpty(updateMetaDataMappingCatalogs)) {
                    List<MetaDataMappingCatalogLog> mappingCatalogLogs = Lists.newArrayList();
                    MetaDataMappingCatalogLog metaDataMappingCatalogLog;
                    for (MetaDataMappingCatalog tableUpdateMetaDataMappingCatalog : updateMetaDataMappingCatalogs) {
                        metaDataMappingCatalogLog = new MetaDataMappingCatalogLog();
                        metaDataMappingCatalogLog.setMappingId(tableUpdateMetaDataMappingCatalog.getId());
                        metaDataMappingCatalogLog.setCatalogId(tableUpdateMetaDataMappingCatalog.getCatalogId());
                        metaDataMappingCatalogLog.setMappingType(tableUpdateMetaDataMappingCatalog.getMappingType());
                        metaDataMappingCatalogLog.setOperatorTime(new Date());
                        metaDataMappingCatalogLog.setOperator(tableUpdateMetaDataMappingCatalog.getUpdater());
                        mappingCatalogLogs.add(metaDataMappingCatalogLog);
                    }
                    metaDataMappingCatalogLogRepository.saveAll(mappingCatalogLogs);
                    logger.info("共插入取消映射记录日志{}条:", mappingCatalogLogs.size());
                }

                if (!CollectionUtils.isEmpty(mappingCatalogsAll)) {
                    logger.info("mapping log insert begin");
                    //插入映射信息
                    List<MetaDataMappingCatalog> catalogList = mappingCatalogRepository.saveAll(mappingCatalogsAll);
                    logger.info("共插入或者更新映射信息{}条", catalogList.size());
                    //插入映射记录
                    List<MetaDataMappingCatalogLog> mappingCatalogLogs = Lists.newArrayList();
                    MetaDataMappingCatalogLog metaDataMappingCatalogLog;
                    for (MetaDataMappingCatalog item : catalogList) {
                        metaDataMappingCatalogLog = new MetaDataMappingCatalogLog();
                        metaDataMappingCatalogLog.setMappingId(item.getId());
                        metaDataMappingCatalogLog.setCatalogId(item.getCatalogId());
                        metaDataMappingCatalogLog.setMappingType(item.getMappingType());
                        metaDataMappingCatalogLog.setOperatorTime(new Date());
                        metaDataMappingCatalogLog.setOperator(item.getUpdater());
                        mappingCatalogLogs.add(metaDataMappingCatalogLog);
                    }
                    metaDataMappingCatalogLogRepository.saveAll(mappingCatalogLogs);
                    logger.info("共插入映射日志{}条:", mappingCatalogLogs.size());
                    logger.info("mapping log insert end");
                }
                logger.info("元数据自动映射注册资产开始");
                bindDataAssets(mappingCatalogsAll);
                logger.info("元数据自动映射注册资产结束");
            }finally {
                if (lock.isLocked() && lock.isHeldByCurrentThread()) {
                    lock.unlock();
                }
            }
        }
        logger.info("auto metadata mapping finish");
    }

    @Override
    public PageResult<MetaDataMappingCatalogDto> queryMappingPage(MetaDataMappingQueryParamDto queryParamDto) throws Exception {
        Long businessObjectId = queryParamDto.getBusinessObjectId();
        Long logicDataEntityId = queryParamDto.getLogicDataEntityId();
        Long modelCategoryId = queryParamDto.getModelCategoryId();
        Long modelId = queryParamDto.getModelId();
        Long databaseId = queryParamDto.getDatabaseId();
        Long tableId = queryParamDto.getTableId();
        //所有已启用的目录空间下的已发布的L5目录
        if (businessObjectId == null && logicDataEntityId == null && modelCategoryId == null && modelId == null && databaseId == null && tableId == null) {
            MultiConditionQueryUtils.MultiConditionQuery<CommonCatalog> query = queryUtils.createQuery(CommonCatalog.class);
            List<CommonCatalogStructure> structureList = catalogStructureRepository.findAllByStructureTypeAndOpenStatus(EnumStructureType.DATA_ASSETS, true);
            List<Long> structureListIds = structureList.stream().map(CommonCatalogStructure::getId).toList();
            query.andIsIn("structureId", structureListIds).andEqual("level", 5).andEqual("status", EnumAssetsCatalogStatus.PUBLISHED);
            query.setPageInfo(queryParamDto.getCurrentPage(), queryParamDto.getPageSize());
            PageResult<CommonCatalog> page = query.page();
            List<CommonCatalog> commonCatalogs = page.getContent();
            //查询L5是否有映射上的属性
            List<MetaDataMappingCatalogDto> mappingCatalogDtos = buildL5OfManualMapping(commonCatalogs);
            PageResult<MetaDataMappingCatalogDto> dtoPageResult = new PageResult<>();
            dtoPageResult.setContentDirectly(mappingCatalogDtos);
            dtoPageResult.setPageSize(queryParamDto.getPageSize());
            dtoPageResult.setCurrentPage(queryParamDto.getCurrentPage());
            dtoPageResult.setTotalItems(page.getTotalItems());
            return dtoPageResult;
        }

        boolean isLeftQuery = businessObjectId != null || logicDataEntityId != null;
        boolean isRightQuery = modelCategoryId != null || modelId != null || databaseId != null || tableId != null;

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
                query.setPageInfo(queryParamDto.getCurrentPage(), queryParamDto.getPageSize());
                PageResult<CommonCatalog> page = query.page();
                List<CommonCatalog> commonCatalogs = page.getContent();
                List<MetaDataMappingCatalogDto> mappingCatalogDtos = buildL5OfManualMapping(commonCatalogs);
                PageResult<MetaDataMappingCatalogDto> dtoPageResult = new PageResult<>();
                dtoPageResult.setContentDirectly(mappingCatalogDtos);
                dtoPageResult.setPageSize(queryParamDto.getPageSize());
                dtoPageResult.setCurrentPage(queryParamDto.getCurrentPage());
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
                query.setPageInfo(queryParamDto.getCurrentPage(), queryParamDto.getPageSize());
                PageResult<CommonCatalog> page = query.page();
                List<CommonCatalog> commonCatalogs = page.getContent();
                List<MetaDataMappingCatalogDto> mappingCatalogDtos = buildL5OfManualMapping(commonCatalogs);
                PageResult<MetaDataMappingCatalogDto> dtoPageResult = new PageResult<>();
                dtoPageResult.setContentDirectly(mappingCatalogDtos);
                dtoPageResult.setPageSize(queryParamDto.getPageSize());
                dtoPageResult.setCurrentPage(queryParamDto.getCurrentPage());
                dtoPageResult.setTotalItems(page.getTotalItems());
                return dtoPageResult;
            }
        } else {
            //根据业务系统分页查询元数据字段
            DataObjectQueryParamDto paramDto = new DataObjectQueryParamDto();
            BeanUtils.copyProperties(queryParamDto, paramDto);
            paramDto.setTypeIds(List.of(LDMTypes.oAttribute));
            PageResult<DataObjectDto> result = remoteMetaDataExtendService.queryDataObjectDtoPage(paramDto);
            List<DataObjectDto> content = result.getContent();
            List<MetaDataMappingCatalogDto> mappingCatalogDtos = buildL5OfMetaData(content, modelId);
            PageResult<MetaDataMappingCatalogDto> dtoPageResult = new PageResult<>();
            dtoPageResult.setContentDirectly(mappingCatalogDtos);
            dtoPageResult.setPageSize(queryParamDto.getPageSize());
            dtoPageResult.setCurrentPage(queryParamDto.getCurrentPage());
            dtoPageResult.setTotalItems(result.getTotalItems());
            return dtoPageResult;
        }

    }

    /**
     * 查看映射记录
     * @param mappingId
     * @return
     */
    @Override
    public List<MetaDataMappingCatalogLog> queryMappingLogByMappingId(Long mappingId) {
        return metaDataMappingCatalogLogRepository.queryMappingCatalogLogByMappingId(mappingId);
    }

    /**
     * 取消映射，物理删除，同时要判断，要取消字段映射的信息，在映射表里没有同级目录的映射，要把对应的上级注册的资产（表）取消掉
     * @param mappingIds
     */
    @Override
    public void cancelMapping(List<Long> mappingIds) {

        String username = AuthTools.currentUsernameFailFast();
        List<MetaDataMappingCatalogLog> metaDataMappingCatalogLogs = Lists.newArrayList();
        //查询映射信息
        MetaDataMappingCatalogLog log;
        List<MetaDataMappingCatalog> metaDataMappingCatalogs = mappingCatalogRepository.findAllById(mappingIds);
        //根据上级目录id分组
        Map<Long, List<MetaDataMappingCatalog>> mappingMap = metaDataMappingCatalogs.stream().collect(Collectors.groupingBy(MetaDataMappingCatalog::getParentCatalogId));
        for (Map.Entry<Long, List<MetaDataMappingCatalog>> entry : mappingMap.entrySet()) {
            Long parentCatalogId = entry.getKey();
            List<MetaDataMappingCatalog> mappingCatalogs = entry.getValue();
            Long countMapping = mappingCatalogRepository.countMapping(parentCatalogId, Arrays.asList(MappingCatalogTypeEnum.AUTOMATIC_MAPPING.getDesc(), MappingCatalogTypeEnum.MANUAL_MAPPING.getDesc()));
            if (countMapping == (long) mappingCatalogs.size()) {
                //说明字段这次要全部取消，则要把表的映射关系和挂接的资产取消
                //查询表的映射关系
                MetaDataMappingCatalog dataMappingCatalog = mappingCatalogRepository.queryMappingCatalog(parentCatalogId);
                if (dataMappingCatalog != null) {
                    metaDataMappingCatalogs.add(dataMappingCatalog);
                    mappingIds.add(dataMappingCatalog.getId());
                }
            }
        }

        for (MetaDataMappingCatalog metaDataMappingCatalog : metaDataMappingCatalogs) {
            metaDataMappingCatalog.setUpdater(username);
            metaDataMappingCatalog.setUpdateTime(new Date());
            metaDataMappingCatalog.setMappingType(MappingCatalogTypeEnum.CANCEL__MAPPING.getDesc());

            log = new MetaDataMappingCatalogLog();
            log.setMappingId(metaDataMappingCatalog.getId());
            log.setCatalogId(metaDataMappingCatalog.getCatalogId());
            log.setMappingType(MappingCatalogTypeEnum.CANCEL__MAPPING.getDesc());
            log.setOperatorTime(new Date());
            log.setOperator(username);
            metaDataMappingCatalogLogs.add(log);
        }
        //删除映射记录
        mappingCatalogRepository.deleteAllById(mappingIds);
        //插入取消映射记录
        metaDataMappingCatalogLogRepository.saveAll(metaDataMappingCatalogLogs);
        //取消已绑定的资产
        List<Long> catalogIds = metaDataMappingCatalogs.stream().map(MetaDataMappingCatalog::getCatalogId).distinct().toList();
        unBindDataAsset(username, catalogIds);
    }

    @Override
    public File downloadMetaDataMappingTemplate() {
        File file = new File(DatablauUtil.getResourcePath("/ddc/meta_data_manual_mapping_template.xlsx"));
        return file;
    }

    /**
     * 只有一个目录空间，L3是唯一的
     * @param manualMappingExcelDtos
     * @return
     * @throws Exception
     */

    @Override
    public ManualMappingImportResultDto upload(List<MetaDataManualMappingExcelDto> manualMappingExcelDtos) throws Exception {
        //获取excel里的L3，L4,L5目录
        List<String> catalogOfL3Name = manualMappingExcelDtos.stream().map(MetaDataManualMappingExcelDto::getCatalogL3Name).toList();
        List<String> catalogOfL4Name = manualMappingExcelDtos.stream().map(MetaDataManualMappingExcelDto::getCatalogL4Name).toList();
        List<String> catalogOfL5Name = manualMappingExcelDtos.stream().map(MetaDataManualMappingExcelDto::getCatalogL5Name).toList();
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
        Map<Long, CommonCatalog> businessObjectMap = commonCatalogsOfL3.stream().collect(Collectors.toMap(CommonCatalog::getId, Function.identity(), (x1, x2) -> x1));
        Map<String, CommonCatalog> commonCatalogOfL3Map = commonCatalogsOfL3.stream().collect(Collectors.toMap(CommonCatalog::getEnglishName, Function.identity(), (x1, x2) -> x1));
        Map<String, CommonCatalog> commonCatalogOfL4Map = commonCatalogsOfL4.stream().collect(Collectors.toMap(x->x.getParentId()+"-"+x.getEnglishName(), Function.identity(), (x1, x2) -> x1));
        Map<String, CommonCatalog> commonCatalogsOfL5Map = commonCatalogsOfL5.stream().collect(Collectors.toMap(x -> x.getParentId() + "-" + x.getEnglishName(), Function.identity(), (x1, x2) -> x1));

        for (MetaDataManualMappingExcelDto manualMappingExcelDto : manualMappingExcelDtos) {
            //L3目录
            String catalogL3Name = manualMappingExcelDto.getCatalogL3Name();
            CommonCatalog catalogOfL3 = commonCatalogOfL3Map.get(catalogL3Name);
            if (catalogOfL3 == null) {
                resultDto.getErrorMsg().add(catalogL3Name+"不是已发布的L3级目录或者不存在");
            }
        }

        if (!CollectionUtils.isEmpty(resultDto.getErrorMsg())) {
//            resultDto.addFailed();
            return resultDto;
        }
        //校验目录是否已经发布，填写的模型、表是否已采集
         for (MetaDataManualMappingExcelDto manualMappingExcelDto : manualMappingExcelDtos) {
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
        }
        if (!CollectionUtils.isEmpty(resultDto.getErrorMsg())) {
            return resultDto;
        }

        //查询目录是否已存在映射关系
        List<MetaDataMappingCatalog> metaDataMappingCatalogs = mappingCatalogRepository.queryMappingCatalogs(commonCatalogIds);
        //获取表的映射关系
        List<MetaDataMappingCatalog> tableMappings = metaDataMappingCatalogs.stream().filter(x -> Objects.equals("L4", x.getObjectLevel())).toList();
        //获取字段的映射关系
        List<MetaDataMappingCatalog> columnMappings = metaDataMappingCatalogs.stream().filter(x -> Objects.equals("L5", x.getObjectLevel())).toList();
        Map<String, MetaDataMappingCatalog> tableMappingMap = tableMappings.stream().collect(Collectors.toMap(x -> x.getBusinessObjectId() + "-" + x.getParentCatalogId() + "-" + x.getCatalogId(), Function.identity(),
                (x1, x2) -> x1));
        Map<String, MetaDataMappingCatalog> columnMappingMap = columnMappings.stream().collect(Collectors.toMap(x -> x.getBusinessObjectId() + "-" + x.getParentCatalogId() + "-" + x.getCatalogId(), Function.identity(),
                (x1, x2) -> x1));

        //查询数据源下的表和字段
        //构建数据源
        Set<String> databaseNames = new HashSet<>();
        Set<String> parentDatabaseNames = new HashSet<>();
        for (MetaDataManualMappingExcelDto manualMappingExcelDto : manualMappingExcelDtos) {
            String databaseName = manualMappingExcelDto.getModelName()+"-"+manualMappingExcelDto.getDatabaseName();
            databaseNames.add(databaseName);
            parentDatabaseNames.add(manualMappingExcelDto.getModelName());
        }
        //根据数据源名称查询数据源ID
        Set<Long> databaseIds = remoteMetaDataExtendService.findModelIdsByNames(databaseNames);
        List<DataObjectDto> dataObjectDtos = remoteMetaDataExtendService.findDataObjectDtoByModelIds(databaseIds, Arrays.asList(LDMTypes.oEntity, LDMTypes.oAttribute, LDMTypes.oModelSource));

        //数据源
        List<DataObjectDto> modelList = dataObjectDtos.stream().filter(x -> Objects.equals(LDMTypes.oModelSource, x.getTypeId())).toList();
        Map<String, DataObjectDto> modelMap = modelList.stream().collect(Collectors.toMap(DataObjectDto::getModelName, Function.identity(), (x1, x2) -> x1));
        Map<String, List<DataObjectDto>> tableMap = dataObjectDtos.stream().filter(x -> Objects.equals(LDMTypes.oEntity, x.getTypeId())).collect(Collectors.groupingBy(DataObjectDto::getModelName));

        //按数据源、表名分组获取字段信息
        Map<String, List<DataObjectDto>> columnMap = dataObjectDtos.stream().filter(x -> Objects.equals(LDMTypes.oAttribute, x.getTypeId())).collect(Collectors.groupingBy(x -> x.getModelName() + "-" + x.getParentPhysicalName()));

        // 查询数据源信息db_model
        Set<Long> parentDatabaseIds = remoteMetaDataExtendService.findModelIdsByNames(parentDatabaseNames);
        List<ModelDto> parentModelList = remoteMetaDataExtendService.findModelsByModelIdIn(parentDatabaseIds.stream().toList());
        Map<String, Long> parentModelMap = parentModelList.stream().collect(Collectors.toMap(ModelDto::getDefinition, ModelDto::getModelId, (x1, x2) -> x1));

        String username = AuthTools.currentUsernameFailFast();
        List<MetaDataMappingCatalog> updateMetaDataMappingCatalogs = new CopyOnWriteArrayList<>();
        Map<String, MetaDataMappingCatalog> insertMappingMap = new HashMap<>();
        List<MetaDataMappingCatalog> mappingCatalogsAll = new CopyOnWriteArrayList<>();

        logger.info("metadata manual compare mapping table begin");
        for (MetaDataManualMappingExcelDto manualMappingExcelDto : manualMappingExcelDtos) {
            String catalogL4Name = manualMappingExcelDto.getCatalogL4Name();
            String catalogL3Name = manualMappingExcelDto.getCatalogL3Name();
            //获取业务对象
            CommonCatalog businessCatalog = commonCatalogOfL3Map.get(catalogL3Name);
            //业务对象ID
            Long businessObjectId = businessCatalog.getId();
            CommonCatalog catalogOfL4 = commonCatalogOfL4Map.get(businessObjectId+"-"+catalogL4Name);

            Long parentId = catalogOfL4.getParentId();
            Long catalogId = catalogOfL4.getId();

            String key = businessObjectId + "-"+parentId+"-"+catalogId;
            MetaDataMappingCatalog mappingCatalog = tableMappingMap.get(key);
            String modelNameOfExcel = manualMappingExcelDto.getModelName();
            String databaseName = manualMappingExcelDto.getDatabaseName();
            String finalModelName = modelNameOfExcel+"-"+databaseName;
            String tableNameOfExcel = manualMappingExcelDto.getTableName();
            List<DataObjectDto> tableObjects = tableMap.get(finalModelName);
            if (CollectionUtils.isEmpty(tableObjects)) {
                continue;
            }
            Map<String, DataObjectDto> dataObjectDtoOfTableMap = tableObjects.stream().collect(Collectors.toMap(DataObjectDto::getPhysicalName, Function.identity(), (x1, x2) -> x1));
            //有映射关系
            if (mappingCatalog != null ) {
                //数据源（schema）名称
                String modelName = mappingCatalog.getModelName();
                //表名
                String tableName = mappingCatalog.getObjectName();

                String oldMappingType = mappingCatalog.getMappingType();

                if (Objects.equals(modelName, finalModelName) && Objects.equals(tableName, tableNameOfExcel) && Objects.equals(oldMappingType, MappingCatalogTypeEnum.MANUAL_MAPPING.getDesc())) {
                    continue;
                }

                mappingCatalog.setBusinessObjectId(parentId);
                mappingCatalog.setBusinessObjectName(businessCatalog.getName());
                mappingCatalog.setCatalogId(catalogId);
                mappingCatalog.setCatalogName(catalogOfL4.getName());
                mappingCatalog.setCatalogEnName(catalogOfL4.getEnglishName());
                mappingCatalog.setParentCatalogId(parentId);
                mappingCatalog.setParentCatalogName(businessCatalog.getName());
                mappingCatalog.setStructureId(catalogOfL4.getStructureId());

                //数据源信息
                DataObjectDto dataObjectDto = modelMap.get(modelName);
                mappingCatalog.setParentObjectName(dataObjectDto.getModelName());
                mappingCatalog.setModelId(dataObjectDto.getModelId());
                mappingCatalog.setModelName(dataObjectDto.getModelName());
                mappingCatalog.setModelCategoryId(dataObjectDto.getModelCategoryId());
                Long parentModelId = parentModelMap.get(modelNameOfExcel);
                mappingCatalog.setParentModelName(modelNameOfExcel);
                mappingCatalog.setParentModelId(parentModelId);

                DataObjectDto dataObjectDtoOfTable = dataObjectDtoOfTableMap.get(tableName);
                mappingCatalog.setObjectId(dataObjectDtoOfTable.getObjectId());
                mappingCatalog.setObjectName(dataObjectDtoOfTable.getPhysicalName());
                mappingCatalog.setParentObjectId(dataObjectDtoOfTable.getParentId());
                mappingCatalog.setParentObjectAlias(dataObjectDtoOfTable.getParentLogicalName());
                mappingCatalog.setAlias(dataObjectDtoOfTable.getLogicalName());

                mappingCatalog.setObjectLevel("L4");
                mappingCatalog.setMappingType(MappingCatalogTypeEnum.MANUAL_MAPPING.getDesc());
                mappingCatalog.setCreateTime(new Date());
                mappingCatalog.setUpdateTime(new Date());
                mappingCatalog.setCreator(username);
                mappingCatalog.setUpdater(username);
                //为后续作插入取消映射记录日志使用
                updateMetaDataMappingCatalogs.add(mappingCatalog);
                mappingCatalogsAll.add(mappingCatalog);
            } else {
                //没有映射关系，新增，判断是否匹配过
                MetaDataMappingCatalog insertMappingCatalog = insertMappingMap.get(key);
                if (insertMappingCatalog != null) {
                    continue;
                }
                MetaDataMappingCatalog dataMappingCatalog = new MetaDataMappingCatalog();
                dataMappingCatalog.setBusinessObjectId(parentId);
                dataMappingCatalog.setBusinessObjectName(businessCatalog.getName());
                dataMappingCatalog.setCatalogId(catalogId);
                dataMappingCatalog.setCatalogName(catalogOfL4.getName());
                dataMappingCatalog.setCatalogEnName(catalogOfL4.getEnglishName());
                dataMappingCatalog.setParentCatalogId(parentId);
                dataMappingCatalog.setParentCatalogName(businessCatalog.getName());
                dataMappingCatalog.setStructureId(catalogOfL4.getStructureId());

                DataObjectDto dataObjectDtoOfTable = dataObjectDtoOfTableMap.get(tableNameOfExcel);

                dataMappingCatalog.setParentObjectId(dataObjectDtoOfTable.getParentId());
                dataMappingCatalog.setParentObjectName(dataObjectDtoOfTable.getParentPhysicalName());
                dataMappingCatalog.setParentObjectAlias(dataObjectDtoOfTable.getParentLogicalName());

                dataMappingCatalog.setModelCategoryId(dataObjectDtoOfTable.getModelCategoryId());
                dataMappingCatalog.setModelId(dataObjectDtoOfTable.getModelId());
                dataMappingCatalog.setModelName(dataObjectDtoOfTable.getModelName());
                Long parentModelId = parentModelMap.get(modelNameOfExcel);
                dataMappingCatalog.setParentModelName(modelNameOfExcel);
                dataMappingCatalog.setParentModelId(parentModelId);

                dataMappingCatalog.setObjectId(dataObjectDtoOfTable.getObjectId());
                dataMappingCatalog.setObjectName(dataObjectDtoOfTable.getPhysicalName());
                dataMappingCatalog.setAlias(dataObjectDtoOfTable.getLogicalName());

                dataMappingCatalog.setObjectLevel("L4");
                dataMappingCatalog.setMappingType(MappingCatalogTypeEnum.MANUAL_MAPPING.getDesc());
                dataMappingCatalog.setCreateTime(new Date());
                dataMappingCatalog.setUpdateTime(new Date());
                dataMappingCatalog.setCreator(username);
                dataMappingCatalog.setUpdater(username);
                insertMappingMap.put(key, dataMappingCatalog);
                mappingCatalogsAll.add(dataMappingCatalog);
            }
        }
        logger.info("metadata manual compare mapping table end");
        Map<String, MetaDataMappingCatalog> insertColumnMappingMap = new HashMap<>();
        for (MetaDataManualMappingExcelDto manualMappingExcelDto : manualMappingExcelDtos) {
            //数据源名称
            String modelNameOfExcel = manualMappingExcelDto.getModelName();
            //数据库名称
            String databaseNameOfExcel = manualMappingExcelDto.getDatabaseName();
            //表名称
            String tableNameOfExcel = manualMappingExcelDto.getTableName();
            String finalModelName = modelNameOfExcel+"-"+databaseNameOfExcel;
            //字段名称
            String columnNameOfExcel = manualMappingExcelDto.getColumnName();
            String catalogL3NameOfExcel = manualMappingExcelDto.getCatalogL3Name();
            String catalogL4NameOfExcel = manualMappingExcelDto.getCatalogL4Name();
            String catalogL5NameOfExcel = manualMappingExcelDto.getCatalogL5Name();

            CommonCatalog businessCatalog = commonCatalogOfL3Map.get(catalogL3NameOfExcel);
            //业务对象ID
            Long businessObjectId = businessCatalog.getId();
            String businessObjectName = businessCatalog.getName();
            CommonCatalog catalogOfL4 = commonCatalogOfL4Map.get(businessObjectId+"-"+catalogL4NameOfExcel);

            Long catalogOfL4Id = catalogOfL4.getId();
            String catalogOfL5Key = catalogOfL4Id + "-" +catalogL5NameOfExcel;
            CommonCatalog commonCatalogOfL5 = commonCatalogsOfL5Map.get(catalogOfL5Key);
            String key = businessObjectId + "-"+catalogOfL4Id+"-"+commonCatalogOfL5.getId();
            //数据源信息
            DataObjectDto dataObjectDtoOfModel = modelMap.get(finalModelName);
            if (dataObjectDtoOfModel == null) {
                logger.error("未找到对应的数据源:{}", finalModelName);
                continue;
            }
            //获取数据源ID
            Long modelId = dataObjectDtoOfModel.getModelId();
            //获取数据源下的字段信息
            String columnKey = finalModelName+"-"+tableNameOfExcel;
            List<DataObjectDto> objectDtosOfColumn = columnMap.get(columnKey);
            Map<String, DataObjectDto> ddmColumnElementsMap = objectDtosOfColumn.stream().collect(Collectors.toMap(DataObjectDto::getPhysicalName, Function.identity(), (x1, x2) -> x1));
            DataObjectDto element = ddmColumnElementsMap.get(columnNameOfExcel);

            //获取字段的映射信息
            MetaDataMappingCatalog dataMappingCatalog = columnMappingMap.get(key);

            if (dataMappingCatalog != null) {
                //判断字段映射信息是否一致
                Long mappingModelId = dataMappingCatalog.getModelId();
                String mappingParentObjectName = dataMappingCatalog.getParentObjectName();
                String mappingObjectName = dataMappingCatalog.getObjectName();

                String oldMappingType = dataMappingCatalog.getMappingType();

                if (Objects.equals(mappingModelId, modelId) && Objects.equals(mappingParentObjectName, tableNameOfExcel)
                        && Objects.equals(mappingObjectName, columnNameOfExcel) && Objects.equals(oldMappingType, MappingCatalogTypeEnum.MANUAL_MAPPING.getDesc())) {
                    continue;
                }

                dataMappingCatalog.setBusinessObjectId(businessObjectId);
                dataMappingCatalog.setBusinessObjectName(businessObjectName);
                dataMappingCatalog.setCatalogId(commonCatalogOfL5.getId());
                dataMappingCatalog.setCatalogName(commonCatalogOfL5.getName());
                dataMappingCatalog.setCatalogEnName(commonCatalogOfL5.getEnglishName());
                dataMappingCatalog.setParentCatalogId(catalogOfL4.getId());
                dataMappingCatalog.setParentCatalogName(catalogOfL4.getName());
                dataMappingCatalog.setStructureId(commonCatalogOfL5.getStructureId());


                dataMappingCatalog.setParentObjectName(element.getParentPhysicalName());
                dataMappingCatalog.setModelCategoryId(element.getModelCategoryId());
                dataMappingCatalog.setParentObjectId(element.getParentId());
                dataMappingCatalog.setParentObjectAlias(element.getParentLogicalName());


                dataMappingCatalog.setModelId(element.getModelId());
                dataMappingCatalog.setModelName(element.getModelName());
                Long parentModelId = parentModelMap.get(modelNameOfExcel);
                dataMappingCatalog.setParentModelName(modelNameOfExcel);
                dataMappingCatalog.setParentModelId(parentModelId);


                dataMappingCatalog.setObjectId(element.getObjectId());
                dataMappingCatalog.setObjectName(element.getPhysicalName());
                dataMappingCatalog.setAlias(element.getLogicalName());
                dataMappingCatalog.setObjectLevel("L5");
                dataMappingCatalog.setMappingType(MappingCatalogTypeEnum.MANUAL_MAPPING.getDesc());
                dataMappingCatalog.setCreateTime(new Date());
                dataMappingCatalog.setUpdateTime(new Date());
                dataMappingCatalog.setCreator(username);
                dataMappingCatalog.setUpdater(username);
                mappingCatalogsAll.add(dataMappingCatalog);
                //为后续作插入取消映射记录日志使用
                updateMetaDataMappingCatalogs.add(dataMappingCatalog);
            } else {
                //新增
                MetaDataMappingCatalog insertMapping = insertColumnMappingMap.get(key);
                if (insertMapping != null) {
                    continue;
                }
                MetaDataMappingCatalog mappingCatalog = new MetaDataMappingCatalog();
                mappingCatalog.setBusinessObjectId(businessObjectId);
                mappingCatalog.setBusinessObjectName(businessObjectName);
                mappingCatalog.setCatalogId(commonCatalogOfL5.getId());
                mappingCatalog.setCatalogName(commonCatalogOfL5.getName());
                mappingCatalog.setCatalogEnName(commonCatalogOfL5.getEnglishName());
                mappingCatalog.setParentCatalogId(catalogOfL4Id);
                mappingCatalog.setParentCatalogName(catalogOfL4.getName());
                mappingCatalog.setStructureId(commonCatalogOfL5.getStructureId());

                mappingCatalog.setModelCategoryId(element.getModelCategoryId());
                mappingCatalog.setModelId(element.getModelId());
                mappingCatalog.setModelName(element.getModelName());
                Long parentModelId = parentModelMap.get(modelNameOfExcel);
                mappingCatalog.setParentModelName(modelNameOfExcel);
                mappingCatalog.setParentModelId(parentModelId);


                mappingCatalog.setObjectId(element.getObjectId());
                mappingCatalog.setObjectName(element.getPhysicalName());
                mappingCatalog.setAlias(element.getLogicalName());

                mappingCatalog.setParentObjectName(element.getParentPhysicalName());
                mappingCatalog.setParentObjectAlias(element.getParentLogicalName());
                mappingCatalog.setParentObjectId(element.getParentId());

                mappingCatalog.setObjectLevel("L5");
                mappingCatalog.setMappingType(MappingCatalogTypeEnum.MANUAL_MAPPING.getDesc());
                mappingCatalog.setCreateTime(new Date());
                mappingCatalog.setUpdateTime(new Date());
                mappingCatalog.setCreator(username);
                mappingCatalog.setUpdater(username);

                insertColumnMappingMap.put(key, mappingCatalog);
                mappingCatalogsAll.add(mappingCatalog);
            }
        }
        logger.info("metadata manual compare mapping column end");

        //判断资产是否被其他目录绑定了
        checkBindAssets(mappingCatalogsAll);

        //如果有更新的则先插入取消映射的日志
        if (!CollectionUtils.isEmpty(updateMetaDataMappingCatalogs)) {
            List<MetaDataMappingCatalogLog> mappingCatalogLogs = Lists.newArrayList();
            MetaDataMappingCatalogLog mappingCatalogLog;
            for (MetaDataMappingCatalog tableUpdateMetaDataMappingCatalog : updateMetaDataMappingCatalogs) {
                mappingCatalogLog = new MetaDataMappingCatalogLog();
                mappingCatalogLog.setMappingId(tableUpdateMetaDataMappingCatalog.getId());
                mappingCatalogLog.setCatalogId(tableUpdateMetaDataMappingCatalog.getCatalogId());
                mappingCatalogLog.setMappingType(tableUpdateMetaDataMappingCatalog.getMappingType());
                mappingCatalogLog.setOperatorTime(new Date());
                mappingCatalogLog.setOperator(tableUpdateMetaDataMappingCatalog.getUpdater());
                mappingCatalogLogs.add(mappingCatalogLog);
            }
            metaDataMappingCatalogLogRepository.saveAll(mappingCatalogLogs);
            logger.info("metadata manual mapping 共插入取消映射记录日志{}条:", mappingCatalogLogs.size());
        }
        if (!CollectionUtils.isEmpty(mappingCatalogsAll)) {
            logger.info("metadata manual mapping log insert begin");
            //插入映射信息
            List<MetaDataMappingCatalog> catalogList = mappingCatalogRepository.saveAll(mappingCatalogsAll);
            logger.info("metadata manual mapping 共插入或者更新映射信息{}条", catalogList.size());
            //插入映射记录
            List<MetaDataMappingCatalogLog> mappingCatalogLogs = Lists.newArrayList();
            MetaDataMappingCatalogLog mappingCatalogLog;
            for (MetaDataMappingCatalog metaDataMappingCatalog : catalogList) {
                mappingCatalogLog = new MetaDataMappingCatalogLog();
                mappingCatalogLog.setMappingId(metaDataMappingCatalog.getId());
                mappingCatalogLog.setCatalogId(metaDataMappingCatalog.getCatalogId());
                mappingCatalogLog.setMappingType(metaDataMappingCatalog.getMappingType());
                mappingCatalogLog.setOperatorTime(new Date());
                mappingCatalogLog.setOperator(metaDataMappingCatalog.getUpdater());
                mappingCatalogLogs.add(mappingCatalogLog);
                resultDto.addSuccess();
            }
            metaDataMappingCatalogLogRepository.saveAll(mappingCatalogLogs);
            logger.info("metadata manual mapping 共插入映射日志{}条:", mappingCatalogLogs.size());
            logger.info("metadata manual mapping log insert end");
            logger.info("元数据手动映射注册资产开始");
            bindDataAssets(mappingCatalogsAll);
            logger.info("元数据手动映射注册资产结束");
        }
        return resultDto;
    }

    private List<MetaDataMappingCatalogDto> buildL5OfManualMapping(List<CommonCatalog> commonCatalogs) {
        List<MetaDataMappingCatalogDto> mappingCatalogs = Lists.newArrayList();
        List<Long> catalogIdsOfL5 = commonCatalogs.stream().map(CommonCatalog::getId).toList();

        //查询是否存在映射关系
        List<MetaDataMappingCatalog> metaDataMappingCatalogs = mappingCatalogRepository.queryMappingCatalogs(catalogIdsOfL5);
        Map<Long, MetaDataMappingCatalog> mappingMap = metaDataMappingCatalogs.stream().collect(Collectors.toMap(MetaDataMappingCatalog::getCatalogId, Function.identity(), (x1, x2) -> x1));
        //获取业务系统id
        List<Long> modelCategoryIds = metaDataMappingCatalogs.stream().map(MetaDataMappingCatalog::getModelCategoryId).toList();
        List<ModelCategoryDto> modelCategoryDtos = modelCategoryService.getModelCategoriesByIds(modelCategoryIds);
        Map<Long, String> modelCategoryMap = modelCategoryDtos.stream().collect(Collectors.toMap(ModelCategoryDto::getCategoryId, ModelCategoryDto::getCategoryName, (x1, x2) -> x1));

        //获取L4目录
        //获取上级目录
        List<Long> catalogIdsOfL4 = commonCatalogs.stream().map(CommonCatalog::getParentId).toList();
        List<CommonCatalog> catalogsOfL4 = commonCatalogNewRepository.findCommonCatalogsByIdAndStatus(catalogIdsOfL4, EnumAssetsCatalogStatus.PUBLISHED);
        Map<Long, CommonCatalog> commonCatalogOfL4Map = catalogsOfL4.stream().collect(Collectors.toMap(CommonCatalog::getId, Function.identity(), (x1, x2) -> x1));
        //获取L4的上级业务对象
        List<Long> catalogIdsOfL3 = catalogsOfL4.stream().map(CommonCatalog::getParentId).toList();
        List<CommonCatalog> catalogsOfL3 = commonCatalogNewRepository.findCommonCatalogsByIdAndStatus(catalogIdsOfL3, EnumAssetsCatalogStatus.PUBLISHED);
        Map<Long, CommonCatalog> commonCatalogOfL3Map = catalogsOfL3.stream().collect(Collectors.toMap(CommonCatalog::getId, Function.identity(), (x1, x2) -> x1));

        MetaDataMappingCatalogDto mappingCatalogDto;

        for (CommonCatalog commonCatalog : commonCatalogs) {
            Long id = commonCatalog.getId();
            mappingCatalogDto = new MetaDataMappingCatalogDto();
            MetaDataMappingCatalog metaDataMappingCatalog = mappingMap.get(id);
            if (metaDataMappingCatalog != null) {
                mappingCatalogDto.setBusinessObjectId(metaDataMappingCatalog.getBusinessObjectId());
                mappingCatalogDto.setBusinessObjectName(metaDataMappingCatalog.getBusinessObjectName());
                mappingCatalogDto.setLogicDataEntityId(metaDataMappingCatalog.getParentCatalogId());
                mappingCatalogDto.setLogicDataEntityName(metaDataMappingCatalog.getParentCatalogName());
                CommonCatalog catalogOfL3 = commonCatalogOfL4Map.get(metaDataMappingCatalog.getParentCatalogId());
                if (catalogOfL3 != null) {
                    mappingCatalogDto.setLogicDataEntityEnName(catalogOfL3.getEnglishName());
                }
                mappingCatalogDto.setColumnCatalogId(metaDataMappingCatalog.getCatalogId());
                mappingCatalogDto.setColumnCatalogName(metaDataMappingCatalog.getCatalogEnName());
                mappingCatalogDto.setColumnCatalogAlias(metaDataMappingCatalog.getCatalogName());
                mappingCatalogDto.setModelCategoryId(metaDataMappingCatalog.getModelCategoryId());
                mappingCatalogDto.setModelCategoryName(modelCategoryMap.get(metaDataMappingCatalog.getModelCategoryId()));
                mappingCatalogDto.setModelId(metaDataMappingCatalog.getParentModelId());
                mappingCatalogDto.setModelName(metaDataMappingCatalog.getParentModelName());
                mappingCatalogDto.setDatabaseId(metaDataMappingCatalog.getModelId());
                mappingCatalogDto.setDatabaseName(metaDataMappingCatalog.getModelName());
                mappingCatalogDto.setTableId(metaDataMappingCatalog.getParentObjectId());
                mappingCatalogDto.setTableName(metaDataMappingCatalog.getParentObjectName());
                mappingCatalogDto.setTableAlias(metaDataMappingCatalog.getParentObjectAlias());
                mappingCatalogDto.setColumnId(metaDataMappingCatalog.getObjectId());
                mappingCatalogDto.setColumnName(metaDataMappingCatalog.getObjectName());
                mappingCatalogDto.setColumnAlias(metaDataMappingCatalog.getAlias());
                mappingCatalogDto.setMappingType(metaDataMappingCatalog.getMappingType());
                mappingCatalogDto.setMappingId(metaDataMappingCatalog.getId());
                mappingCatalogDto.setEnableClick(true);
            } else {
                //无映射记录
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
                    mappingCatalogDto.setColumnCatalogId(id);
                    mappingCatalogDto.setColumnCatalogName(commonCatalog.getEnglishName());
                    mappingCatalogDto.setColumnCatalogAlias(commonCatalog.getName());
                    mappingCatalogDto.setModelCategoryId(null);
                    mappingCatalogDto.setModelCategoryName("");
                    mappingCatalogDto.setModelId(null);
                    mappingCatalogDto.setModelName("");
                    mappingCatalogDto.setDatabaseId(null);
                    mappingCatalogDto.setDatabaseName("");
                    mappingCatalogDto.setTableId(null);
                    mappingCatalogDto.setTableName("");
                    mappingCatalogDto.setTableAlias("");
                    mappingCatalogDto.setColumnId(null);
                    mappingCatalogDto.setColumnName("");
                    mappingCatalogDto.setColumnAlias("");
                    mappingCatalogDto.setMappingType("");
                    mappingCatalogDto.setEnableClick(Boolean.TRUE);
                }
            }
            mappingCatalogs.add(mappingCatalogDto);
        }
        return mappingCatalogs;
    }

    private List<MetaDataMappingCatalogDto> buildL5OfMetaData(List<DataObjectDto> dataObjectDtos, Long modelId) {
        List<MetaDataMappingCatalogDto> mappingCatalogDtos = Lists.newArrayList();
        //获取业务系统的
        List<Long> modelCategoryIds = dataObjectDtos.stream().map(DataObjectDto::getModelCategoryId).toList();
        List<ModelCategoryDto> categoryDtos = modelCategoryService.getModelCategoriesByIds(modelCategoryIds);
        Map<Object, ModelCategoryDto> modelCategoryDtoMap = categoryDtos.stream().collect(Collectors.toMap(ModelCategoryDto::getCategoryId, Function.identity(), (x1, x2) -> x1));
        //模型id
        List<Long> modelIds = dataObjectDtos.stream().map(DataObjectDto::getModelId).toList();
        //字段id
        List<Long> objectIds = dataObjectDtos.stream().map(DataObjectDto::getObjectId).toList();

        //查询是否存在映射关系
        List<MetaDataMappingCatalog> metaDataMappingCatalogs = mappingCatalogRepository.queryMappingCatalogsByObjectIds(modelCategoryIds, modelIds, objectIds, "L5");
        Map<String, MetaDataMappingCatalog> mappingCatalogMap = metaDataMappingCatalogs.stream().collect(Collectors.toMap(x -> x.getModelCategoryId() + "-" + x.getModelId() + "-" + x.getObjectId(), Function.identity(), (x1, x2) -> x1));

        //获取L4级目录
        List<Long> catalogIdsOfL4 = metaDataMappingCatalogs.stream().map(MetaDataMappingCatalog::getParentCatalogId).toList();
        List<CommonCatalog> catalogsOfL4 = commonCatalogNewRepository.findCommonCatalogsByIdAndStatus(catalogIdsOfL4, EnumAssetsCatalogStatus.PUBLISHED);
        Map<Long, CommonCatalog> commonCatalogOfL4Map = catalogsOfL4.stream().collect(Collectors.toMap(CommonCatalog::getId, Function.identity(), (x1, x2) -> x1));
        MetaDataMappingCatalogDto mappingCatalogDto;

        Map<Long, ModelDto> modelDtoMap = new HashMap<>();
        Map<Long, ModelDto> parentModelMap = new HashMap<>();

        //数据源是否为空
        String modelName = "";
        if (modelId != null) {
            ModelDto modelDto = remoteMetaDataExtendService.queryModelDtoById(modelId);
            modelName = modelDto.getDefinition();
        } else {
            //根据modelIds查询数据库
            List<ModelDto> modelDtoList = remoteMetaDataExtendService.findModelsByModelIdIn(modelIds);
            modelDtoMap = modelDtoList.stream().collect(Collectors.toMap(ModelDto::getModelId, Function.identity(), (x1, x2) -> x1));
            List<Long> parentIds = modelDtoList.stream().map(ModelDto::getParentId).toList();
            List<ModelDto> parentModels = remoteMetaDataExtendService.findModelsByModelIdIn(parentIds);
            parentModelMap = parentModels.stream().collect(Collectors.toMap(ModelDto::getModelId, Function.identity(), (x1, x2) -> x1));
        }

        for (DataObjectDto dataObjectDto : dataObjectDtos) {

            String key = dataObjectDto.getModelCategoryId()+"-"+dataObjectDto.getModelId()+"-"+dataObjectDto.getObjectId();
            MetaDataMappingCatalog mappingCatalog = mappingCatalogMap.get(key);
            mappingCatalogDto = new MetaDataMappingCatalogDto();
            if (mappingCatalog != null) {
                mappingCatalogDto.setBusinessObjectId(mappingCatalog.getBusinessObjectId());
                mappingCatalogDto.setBusinessObjectName(mappingCatalog.getBusinessObjectName());
                mappingCatalogDto.setLogicDataEntityId(mappingCatalog.getParentCatalogId());
                mappingCatalogDto.setLogicDataEntityName(mappingCatalog.getParentCatalogName());
                CommonCatalog catalogOfL3 = commonCatalogOfL4Map.get(mappingCatalog.getParentCatalogId());
                if (catalogOfL3 != null) {
                    mappingCatalogDto.setLogicDataEntityEnName(catalogOfL3.getEnglishName());
                }
                mappingCatalogDto.setColumnCatalogId(mappingCatalog.getCatalogId());
                mappingCatalogDto.setColumnCatalogName(mappingCatalog.getCatalogEnName());
                mappingCatalogDto.setColumnCatalogAlias(mappingCatalog.getAlias());
                mappingCatalogDto.setModelCategoryId(mappingCatalog.getModelCategoryId());
                ModelCategoryDto modelCategoryDto = modelCategoryDtoMap.get(mappingCatalog.getModelCategoryId());
                if (modelCategoryDto != null) {
                    mappingCatalogDto.setModelCategoryName(modelCategoryDto.getCategoryName());
                }
                mappingCatalogDto.setModelId(mappingCatalog.getParentModelId());
                mappingCatalogDto.setModelName(mappingCatalog.getParentModelName());
                mappingCatalogDto.setDatabaseId(mappingCatalog.getModelId());
                mappingCatalogDto.setDatabaseName(mappingCatalog.getModelName());
                mappingCatalogDto.setTableId(mappingCatalog.getParentObjectId());
                mappingCatalogDto.setTableName(mappingCatalog.getParentObjectName());
                mappingCatalogDto.setTableAlias(mappingCatalog.getParentObjectAlias());
                mappingCatalogDto.setColumnId(mappingCatalog.getObjectId());
                mappingCatalogDto.setColumnName(mappingCatalog.getObjectName());
                mappingCatalogDto.setColumnAlias(mappingCatalog.getAlias());
                mappingCatalogDto.setMappingType(mappingCatalog.getMappingType());
                mappingCatalogDto.setMappingId(mappingCatalog.getId());
                mappingCatalogDto.setEnableClick(Boolean.TRUE);
            } else {
                mappingCatalogDto.setBusinessObjectId(null);
                mappingCatalogDto.setBusinessObjectName("");
                mappingCatalogDto.setLogicDataEntityId(null);
                mappingCatalogDto.setLogicDataEntityName("");
                mappingCatalogDto.setColumnCatalogId(null);
                mappingCatalogDto.setColumnCatalogName("");
                mappingCatalogDto.setColumnCatalogAlias("");
                mappingCatalogDto.setModelCategoryId(dataObjectDto.getModelCategoryId());
                ModelCategoryDto modelCategoryDto = modelCategoryDtoMap.get(dataObjectDto.getModelCategoryId());
                if (modelCategoryDto != null) {
                    mappingCatalogDto.setModelCategoryName(modelCategoryDto.getCategoryName());
                }
                mappingCatalogDto.setDatabaseId(dataObjectDto.getModelId());
                mappingCatalogDto.setDatabaseName(dataObjectDto.getModelName());
                if (modelId != null) {
                    mappingCatalogDto.setModelId(modelId);
                    mappingCatalogDto.setModelName(modelName);
                }
                ModelDto modelDto = modelDtoMap.get(dataObjectDto.getModelId());
                if (modelDto != null) {
                    Long parentId = modelDto.getParentId();
                    mappingCatalogDto.setModelId(parentId);
                    if (parentId != null) {
                        ModelDto parentModelDto = parentModelMap.get(parentId);
                        if (parentModelDto != null) {
                            String definition = parentModelDto.getDefinition();
                            mappingCatalogDto.setModelName(definition);
                        }
                    }
                }

                mappingCatalogDto.setTableId(dataObjectDto.getParentId());
                mappingCatalogDto.setTableName(dataObjectDto.getParentPhysicalName());
                mappingCatalogDto.setTableAlias(dataObjectDto.getParentLogicalName());
                mappingCatalogDto.setColumnId(dataObjectDto.getObjectId());
                mappingCatalogDto.setColumnName(dataObjectDto.getPhysicalName());
                mappingCatalogDto.setColumnAlias(dataObjectDto.getLogicalName());
                mappingCatalogDto.setMappingType("");
                mappingCatalogDto.setMappingId(null);
                mappingCatalogDto.setEnableClick(Boolean.FALSE);
            }
            mappingCatalogDtos.add(mappingCatalogDto);
        }
        return mappingCatalogDtos;
    }


    public void bindDataAssets(List<MetaDataMappingCatalog> mappingCatalogsAll) {

        String username = AuthTools.currentUsernameFailFast();
        List<Long> catalogIds = mappingCatalogsAll.stream().map(MetaDataMappingCatalog::getCatalogId).distinct().toList();
        //查询是否绑定资产，如果有绑定的资产，先解绑
        unBindDataAsset(username, catalogIds);

        //构建绑定资产参数
        for (MetaDataMappingCatalog dataMappingCatalog : mappingCatalogsAll) {
            BindAssetsDto assetsDto = new BindAssetsDto();
            if (Objects.equals("L4", dataMappingCatalog.getObjectLevel())) {
                assetsDto.setSubAssetsType("TABLE");
            } else {
                assetsDto.setSubAssetsType( "DATA_OBJECT");
            }
            assetsDto.setObjectName(List.of(dataMappingCatalog.getObjectName()));
            assetsDto.setDeptNameMap(new HashMap<>());
            assetsDto.setDeptIdMap(new HashMap<>());
            assetsDto.setCatalogId(dataMappingCatalog.getCatalogId());
            assetsDto.setCatalogPath(dataMappingCatalog.getCatalogPath());
            assetsDto.setStructureId(dataMappingCatalog.getStructureId());
            assetsDto.setObjectId(List.of(dataMappingCatalog.getObjectId()));
            //注册资产默认发布状态
            assetsDto.setStatus(EnumAssetsCatalogStatus.PUBLISHED.name());
            //绑定资产
            bindDataAsset(username, assetsDto);
        }
    }

    private static SearchDto getSearchDto(Set<Long> catalogIds) {
        SearchDto searchDto = new SearchDto();
        searchDto.setAssetsTypeList(Arrays.asList("TABLE", "VIEW", "DATA_OBJECT", "FILE", "REPORT"));
        searchDto.setRange(EnumSearchRange.LIST);
        searchDto.setCatalogIds(catalogIds);
        searchDto.setUser(SecurityContextHolder.getContext().getAuthentication().getName());
        searchDto.setIsFromBrowse(false);
        searchDto.setCurCatalog(false);
        searchDto.setWithAlias(true);
        searchDto.setWithDesc(false);
        searchDto.setPageNum(1);
        searchDto.setPageSize(1000);
        searchDto.setOrderBy("publishTime");
        searchDto.setSort("ASC");
        return searchDto;
    }


    private void checkBindAssets(List<MetaDataMappingCatalog> mappingCatalogsAll) {
        //判断资产是否被其他目录绑定了
        List<Long> objectIds =  mappingCatalogsAll.stream().map(MetaDataMappingCatalog::getObjectId).distinct().toList();
        List<DataAssets> existAssets = assetsRepository.findAllByItemIdIn(objectIds.stream().map(String::valueOf).toList());
        Map<String, Long> existAssetsMap = existAssets.stream().collect(Collectors.toMap(DataAssets::getItemId, DataAssets::getCatalogId, (x1, x2) -> x1));

        for (MetaDataMappingCatalog dataMappingCatalog : mappingCatalogsAll) {
            Long objectId = dataMappingCatalog.getObjectId();
            Long existCatalogId = existAssetsMap.get(String.valueOf(objectId));
            if (existCatalogId != null && !Objects.equals(existCatalogId, dataMappingCatalog.getCatalogId())) {
                throw new RuntimeException("资产【"+dataMappingCatalog.getObjectName()+"】已被其他目录绑定");
            }
        }
    }

    private void unBindDataAsset(String username, List<Long> catalogIds) {
        if (!CollectionUtils.isEmpty(catalogIds)) {
            //查询匹配上的目录是否绑定了资产
            List<Long> assetsIds = Lists.newArrayList();

            if (catalogIds.size() > 1000) {
                List<Long> catalogIdList = catalogIds.stream().toList();
                for (List<Long> items : Lists.partition(catalogIdList, 999)) {
                    Set<Long> catalogIdSets = new HashSet<>(items);
                    SearchDto searchDto = getSearchDto(catalogIdSets);
                    Map<String, Object> map = dataAssetsService.searchAssets(searchDto);
                    if (map != null) {
                        List<Map<String, Object>> assetsList = (List<Map<String, Object>>)map.get("assetsList");
                        if (!CollectionUtils.isEmpty(assetsList)) {
                            for (Map<String, Object> dataMap : assetsList) {
                                Long assetsId = Long.parseLong(dataMap.get("assetsId").toString());
                                assetsIds.add(assetsId);
                            }
                        }
                    }
                }
            } else {
                Set<Long> catalogIdSets = new HashSet<>(catalogIds);
                SearchDto searchDto = getSearchDto(catalogIdSets);
                Map<String, Object> map = dataAssetsService.searchAssets(searchDto);
                if (map != null) {
                    List<Map<String, Object>> assetsList = (List<Map<String, Object>>)map.get("assetsList");
                    if (!CollectionUtils.isEmpty(assetsList)) {
                        for (Map<String, Object> dataMap : assetsList) {
                            Long assetsId = Long.parseLong(dataMap.get("assetsId").toString());
                            assetsIds.add(assetsId);
                        }
                    }
                }
            }

            if (!CollectionUtils.isEmpty(assetsIds)) {
                //解绑资产
                logger.info("解绑资产开始");
                Map<Long, List<String>> delete = dataAssetsService.deleteBatch(assetsIds);
                kafkaLogUtils.deleteAssets(username, delete, IpUtil.getUserIp(), IpUtil.getUrl());
                logger.info("解绑资产结束，共解绑资产:{}个", assetsIds.size());
            }
        }
    }


    private void bindDataAsset(String username, BindAssetsDto bindAssetsDtoList) {
        RLock lock = redissonClient.getLock("bind_assets_lock");
        try {
            lock.lock();
            //判断该资产目录下只能注册一个资产
            List<DataAssets> allByCatalogId = assetsRepository.findAllByCatalogId(bindAssetsDtoList.getCatalogId());
            if(!CollectionUtils.isEmpty(allByCatalogId)){
                throw new RuntimeException("资产目录只允许注册一个数据资产");
            }

            if(bindAssetsDtoList.getSubAssetsType().equals(EnumSupportType.DATA_OBJECT.name()) || bindAssetsDtoList.getSubAssetsType().equals(EnumSupportType.TABLE.name()) ){
                List<Long> objectIds = bindAssetsDtoList.getObjectId();
                List<DataAssets> existAssets = assetsRepository.findAllByItemIdIn(objectIds.stream().map(String::valueOf).toList());
                if(!CollectionUtils.isEmpty(existAssets)){
                    List<String> names = existAssets.stream().map(DataAssets::getItemName).toList();
                    throw new RuntimeException("资产【" + names + "】已经被绑定不能重复绑定");
                }
            }

            dataAssetsCatalogService.bindAssets(bindAssetsDtoList);
            String fullPath = dataAssetsCatalogService.getFullPathByCatalogId(bindAssetsDtoList.getCatalogId());
            kafkaLogUtils.bindAssets(username, bindAssetsDtoList, fullPath, IpUtil.getUserIp(), IpUtil.getUrl());
        } catch (Exception e) {
            throw new UnexpectedStateException(e.getMessage());
        } finally {
            lock.forceUnlock();
        }
    }
}
