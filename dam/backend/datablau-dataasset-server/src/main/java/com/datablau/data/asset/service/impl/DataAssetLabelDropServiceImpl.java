package com.datablau.data.asset.service.impl;

import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.datablau.base.api.ModelCategoryService70;
import com.datablau.base.data.BaseModelCategory;
import com.datablau.catalog.enums.EnumAssetsCatalogStatus;
import com.datablau.catalog.enums.EnumSupportType;
import com.datablau.catalog.jpa.entity.CommonCatalog;
import com.datablau.data.asset.dto.*;
import com.datablau.data.asset.enums.MappingCatalogTypeEnum;
import com.datablau.data.asset.jpa.entity.*;
import com.datablau.data.asset.jpa.repository.*;
import com.datablau.data.asset.service.AssetsExcelExporter;
import com.datablau.data.asset.service.DataAssetLabelDropService;
import com.datablau.data.common.util.DynamicConfigurations;
import com.datablau.project.api.DatablauRemoteDdmModelServiceNew;
import com.datablau.project.api.DomainExtService;
import com.datablau.project.api.RemoteMetaDataExtendService;
import com.datablau.project.api.dto.CustomDomainExtDto;
import com.datablau.project.api.dto.DdmModelElementDto;
import com.google.common.collect.Lists;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.ss.formula.functions.T;
import org.apache.poi.util.Units;
import org.apache.poi.xwpf.usermodel.*;
import org.elasticsearch.common.Strings;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STBorder;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STTblWidth;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;


@Service
public class DataAssetLabelDropServiceImpl implements DataAssetLabelDropService {
    private static final Logger logger = LoggerFactory.getLogger(DataAssetLabelDropServiceImpl.class);

    @Autowired
    private  CommonCatalogExtRepository commonCatalogExtRepository;

    @Autowired
    private DdmMappingCatalogRepository ddmMappingCatalogRepository;

    @Autowired
    private ModelCategoryService70 modelCategoryService;

    @Autowired
    private DataAssetsRepository dataAssetsRepository;

    @Autowired
    private DatablauRemoteDdmModelServiceNew datablauRemoteDdmModelServiceNew;

    @Autowired
    private DataAssetExtRepository dataAssetExtRepository;

    @Autowired
    private DomainExtService domainExtService;

    @Autowired
    protected AssetsExcelExporter excelExporter;

    @Autowired
    protected RemoteMetaDataExtendService remoteMetaDataExtendService;

    @Autowired
    private MetaDataMappingCatalogRepository metaDataMappingCatalogRepository;

    @Autowired
    private DesignLabelDropResultDetailRepository designLabelDropResultDetailRepository;

    @Autowired
    private DesignLabelDropResultRepository designLabelDropResultRepository;

    @Autowired
    private TechLabelDropResultDetailRepository techLabelDropResultDetailRepository;

    @Autowired
    private TechLabelDropResultRepository techLabelDropResultRepository;

    @Autowired
    private CatalogExtRepository catalogExtRepository;

    @Override
    @Transactional
    public DesignLabelDropResultTotalDto getTechLabelDropResult(LabelDropInspectionQueryParamDto labelDropInspectionQueryParamDto) {



        //查询主题域对应L5比较结果
        List<String> catalogPaths = new ArrayList<>();
        StringBuilder path = new StringBuilder();
        if (null != labelDropInspectionQueryParamDto.getBusinessObjectId()){//业务对象
            logger.info("业务对象");
            path.append("0/").append(labelDropInspectionQueryParamDto.getBusinessDomainId()).append("/").append(labelDropInspectionQueryParamDto.getSubjectDomainId()).append("/").append(labelDropInspectionQueryParamDto.getBusinessObjectId()).append("/%");
            catalogPaths.add(path.toString());
        }

        if (null != labelDropInspectionQueryParamDto.getSubjectDomainId()){//主题域
            logger.info("主题域");
            path.append("0/").append(labelDropInspectionQueryParamDto.getBusinessDomainId()).append("/").append(labelDropInspectionQueryParamDto.getSubjectDomainId()).append("/%");
            catalogPaths.add(path.toString());
        }

        if (null != labelDropInspectionQueryParamDto.getBusinessDomainId()){//业务域
            //查找
            logger.info("业务域");
            path.append("0/").append(labelDropInspectionQueryParamDto.getBusinessDomainId()).append("/%");
            //path = "0/"+labelDropInspectionQueryParamDto.getBusinessDomainId() + "/%";
            catalogPaths.add(path.toString());
        }

        if (null != labelDropInspectionQueryParamDto.getDdmModelId()){
            logger.info("模型");
            //List<Long> catalogs = ddmMappingCatalogRepository.findByDdmModelId(labelDropInspectionQueryParamDto.getDdmModelId());
            List<Long> catalogs = metaDataMappingCatalogRepository.findByDdmModelId(labelDropInspectionQueryParamDto.getDdmModelId());
            if (!CollectionUtils.isEmpty(catalogs)){
                List<String> paths = commonCatalogExtRepository.findCatalogPathByIds(catalogs);
                for (String catalogPath : paths) {
                    catalogPaths.add(catalogPath + "%");
                }
            }
        }

        if (null != labelDropInspectionQueryParamDto.getParentModelId() && null == labelDropInspectionQueryParamDto.getDdmModelId()){
            logger.info("schema");
            List<Long> catalogs = metaDataMappingCatalogRepository.findByParentModelId(labelDropInspectionQueryParamDto.getParentModelId());
            if (!CollectionUtils.isEmpty(catalogs)){
                List<String> paths = commonCatalogExtRepository.findCatalogPathByIds(catalogs);
                for (String catalogPath : paths) {
                    catalogPaths.add(catalogPath + "%");
                }
            }
        }

        if (null != labelDropInspectionQueryParamDto.getModelCategoryId() && null == labelDropInspectionQueryParamDto.getParentModelId() && null == labelDropInspectionQueryParamDto.getDdmModelId()){
            logger.info("系统");
            List<Long> catalogs = metaDataMappingCatalogRepository.findByModelCategoryId(labelDropInspectionQueryParamDto.getModelCategoryId());
            if (!CollectionUtils.isEmpty(catalogs)){
                List<String> paths = commonCatalogExtRepository.findCatalogPathByIds(catalogs);
                for (String catalogPath : paths) {
                    catalogPaths.add(catalogPath + "%");
                }
            }
        }

        //总结果列表
        DesignLabelDropResultTotalDto designLabelDropResultTotalDto = new DesignLabelDropResultTotalDto();
        //统计列表
        List<DesignLabelDropResultDto> designLabelDropResultDtolist = new ArrayList<>();
        //详情excel列表
        List<DesignLabelDropResultDetailExcelDto> designLabelDropResultDetailExcelDtos = new ArrayList<>();
        //详情列表
        List<DesignLabelDropResultDetailDto> resultDetailDtos = new ArrayList<>();
        //DL5资产列表
        List<DL5AttributeDto> dl5AttributeDtos =  new ArrayList<>();
        long assetNumTotal = 0L;
        long registerAssetNumTotal = 0L;
        long LabelDropNumTotal = 0L;
        if (!CollectionUtils.isEmpty(catalogPaths)) {
            logger.info("catalogPaths:"+ catalogPaths);
            List<BaseModelCategory> modelCategories = modelCategoryService.getAllBaseModelCategories();
            Map<Long, String> modelNameMap = modelCategories.stream().collect(Collectors.toMap(BaseModelCategory::getId, BaseModelCategory::getName));

            List<CatalogExt> L5CaCatalogExts = catalogExtRepository.findAll();
            Map<Long, CatalogExt> L5CaCatalogExtsMap = L5CaCatalogExts.stream().collect(Collectors.toMap(CatalogExt::getCatalogId, Function.identity()));
            List<String> domainIds = L5CaCatalogExts.stream().map(CatalogExt::getDomainId).toList();
            List<CustomDomainExtDto> domains = domainExtService.getDomainsById(domainIds);
            Map<String, CustomDomainExtDto> domainExtDtoMap = domains.stream().collect(Collectors.toMap(CustomDomainExtDto::getDomainId, Function.identity()));
            for (String catalogPath : catalogPaths) {
                //获取主题域对应L5目录id
                List<CommonCatalog> L5catalogs = commonCatalogExtRepository.findByCatalogPathLikeAndLevel(catalogPath, 5, EnumAssetsCatalogStatus.PUBLISHED);
                List<Long> L5catalogIds = L5catalogs.stream().map(CommonCatalog::getId).toList();
                logger.info("主题域对应L5Id:"+ L5catalogIds);
                List<CommonCatalog> L4Catalogs = commonCatalogExtRepository.findAllByCatalogPathLikeAndLevel(catalogPath, 4, EnumAssetsCatalogStatus.PUBLISHED);
                Map<Long, CommonCatalog> L4CatalogMap = L4Catalogs.stream().collect(Collectors.toMap(CommonCatalog::getId, Function.identity()));
                //根据DL5查询对应数据元标准
                 /*List<DataAssets> dataAssetsList = dataAssetExtRepository.findDomainByCatalogIdAndSubType(L5catalogIds, EnumSupportType.DATA_STANDARD);
                if (CollectionUtils.isEmpty(dataAssetsList)){
                    throw new InvalidArgumentException("没有L5注册数据元标准");
                }
                Map<Long, String> L5CatologMap = dataAssetsList.stream().collect(Collectors.toMap(DataAssets::getCatalogId, DataAssets::getItemId));
                List<String> domainIds = dataAssetsList.stream().map(DataAssets::getItemId).toList();
//                List<CustomDomainExtDto> domains = domainExtService.getDomainsById(domainIds);
                Map<String, CustomDomainExtDto> domainExtDtoMap = domains.stream().collect(Collectors.toMap(CustomDomainExtDto::getDomainId, Function.identity()));*/

                //根据L5id 查找注册资产
                List<DataAssets> dataAssets = dataAssetsRepository.findByCatalogIdIn(L5catalogIds);
                //根据注册资产分组得到注册L5数量
                Map<Long, List<DataAssets>> catalogAssetsMap = dataAssets.stream().collect(Collectors.groupingBy(DataAssets::getCatalogId));
                for (CommonCatalog l5catalog : L5catalogs) {
                    DL5AttributeDto dl5AttributeDto = new DL5AttributeDto();
                    if (catalogAssetsMap.containsKey(l5catalog.getId())){
                        dl5AttributeDto.setdL5Status("是");
                    }else {
                        dl5AttributeDto.setdL5Status("否");
                    }
                    dl5AttributeDto.setdL5ChName(l5catalog.getName());
                    dl5AttributeDto.setdL5EnName(l5catalog.getEnglishName());
                    dl5AttributeDto.setdL5Code(l5catalog.getCode());
                    dl5AttributeDtos.add(dl5AttributeDto);
                }
                //根据L5目录id查询已映射mapping信息
                List<MetaDataMappingCatalog> ddmMappingCatalogs = metaDataMappingCatalogRepository.queryDdmMappingCatalogsByCatalogIdsAndMappingTypes(L5catalogIds, Lists.newArrayList(MappingCatalogTypeEnum.AUTOMATIC_MAPPING.getDesc(), MappingCatalogTypeEnum.MANUAL_MAPPING.getDesc()));
                Set<Long> modelIds = ddmMappingCatalogs.stream().map(MetaDataMappingCatalog::getModelId).collect(Collectors.toSet());
                logger.info("根据L5目录id查询已映射mapping信息model:"+ modelIds);
                Map<Long, List<DdmModelElementDto>> modelElementMap = new HashMap<>();
                for (Long modelId : modelIds) {
                    List<DdmModelElementDto> ddmModelElementDtos = remoteMetaDataExtendService.queryDdmModelElementDetail(modelId);
                    modelElementMap.put(modelId,ddmModelElementDtos);
                }
                Map<Long, List<MetaDataMappingCatalog>> modelCategoryMap = ddmMappingCatalogs.stream().collect(Collectors.groupingBy(MetaDataMappingCatalog::getModelCategoryId));
                Map<String, List<DesignLabelDropResultDto>> oldMap = designLabelDropResultDtolist.stream().collect(Collectors.groupingBy(DesignLabelDropResultDto::getModelCategoryName));
                for (Long modelCategoryId : modelCategoryMap.keySet()) {
                    logger.info("对应modelCategoryId："+modelCategoryId);
                    DesignLabelDropResultDto designLabelDropResultDto = new DesignLabelDropResultDto();
                    if (modelNameMap.containsKey(modelCategoryId)){
                        if (oldMap.containsKey(modelNameMap.get(modelCategoryId))){
                            designLabelDropResultDto = oldMap.get(modelNameMap.get(modelCategoryId)).get(0);
                            designLabelDropResultDtolist.remove(designLabelDropResultDto);
                        }else {
                            //设置系统名称
                            designLabelDropResultDto.setModelCategoryName(modelNameMap.get(modelCategoryId));
                        }
                    }else {
                        designLabelDropResultDto.setModelCategoryName(String.valueOf(modelCategoryId));
                    }

                    //每个系统对应的mapping信息
                    List<MetaDataMappingCatalog> mappingCatalogs = modelCategoryMap.get(modelCategoryId);
                    logger.info("对应mappingCatalogs：" + mappingCatalogs);
                    //每个系统中每个DL5的mapping
                    Map<Long, List<MetaDataMappingCatalog>> DL5MapingMap = mappingCatalogs.stream().collect(Collectors.groupingBy(MetaDataMappingCatalog::getCatalogId));
                    //设置资产数
                    long assetNum = L5catalogs.size();
                    assetNumTotal += assetNum;
                    if (oldMap.containsKey(modelNameMap.get(modelCategoryId))){
                        logger.info("assetNum1:"+assetNum);
                        assetNum = assetNum + designLabelDropResultDto.getAssetNum();
                        logger.info("assetNum2:"+assetNum);
                    }
                    designLabelDropResultDto.setAssetNum(assetNum);

                    //提取 mappingCatalogs 中所有的 catalogId 到 Set 集合中
                    Set<Long> mappingCatalogIds = mappingCatalogs.stream()
                            .map(MetaDataMappingCatalog::getCatalogId)
                            .collect(Collectors.toSet());

                    //遍历 catalogAssetsMap 的键，筛选出包含在 mappingCatalogIds 中的键
                    /*long matchedCount = L5catalogIds.stream()
                            .filter(mappingCatalogIds::contains)
                            .count();*/
                    //设置资产注册数
                    long matchedCount = mappingCatalogIds.size();
                    registerAssetNumTotal += matchedCount;
                    if (oldMap.containsKey(modelNameMap.get(modelCategoryId))){
                        logger.info("matchedCount1:"+matchedCount);
                        matchedCount = matchedCount + designLabelDropResultDto.getRegisterAssetNum();
                        logger.info("matchedCount2:"+matchedCount);
                    }
                    designLabelDropResultDto.setRegisterAssetNum(matchedCount);

                    if (designLabelDropResultDto.getAssetNum() != 0) {
                        // 计算注册率
                        double rate = (double) matchedCount / designLabelDropResultDto.getAssetNum() * 100;

                        String formattedRate = String.format("%.2f%%", rate);
                        designLabelDropResultDto.setRegisterAssetRate(formattedRate);
                    }else {
                        designLabelDropResultDto.setRegisterAssetRate("0%");
                    }
                    long LabelDropCount = 0L;

                    //每个系统的L5比对数据元标准
                    Set<String> domainIdSets = new HashSet<>();
                    for (Long mappingCatalogId : DL5MapingMap.keySet()) {
                        List<MetaDataMappingCatalog> ddmMappingCatalogList = DL5MapingMap.get(mappingCatalogId);
                        Long ddmModelId = ddmMappingCatalogList.get(0).getModelId();
                        Long parentObjectId = ddmMappingCatalogList.get(0).getParentObjectId();
                        String objectName = ddmMappingCatalogList.get(0).getObjectName();
                        Long parentCatalogId = ddmMappingCatalogList.get(0).getParentCatalogId();
                        DesignLabelDropResultDetailDto resultDetailDto = new DesignLabelDropResultDetailDto();
                        resultDetailDto.setMappingColumn(objectName);
                        resultDetailDto.setAttribute(objectName);

                        if (L4CatalogMap.containsKey(parentCatalogId)){
                            resultDetailDto.setLogicEntity(L4CatalogMap.get(parentCatalogId).getEnglishName());
                        }

                        //todo 比对每个DL5的属性，（1.是否为空，2.默认值） 数据元标准（3.数据类型，4..数据长度 5.数据精度）
                        if (modelElementMap.containsKey(ddmModelId)) {
                            List<DdmModelElementDto> modelElementDtos = modelElementMap.get(ddmModelId);
                            designLabelDropResultTotalDto.setModelColumnNumTotal((long) modelElementDtos.size());
                            Map<Long, List<DdmModelElementDto>> tableMap = modelElementDtos.stream().collect(Collectors.groupingBy(DdmModelElementDto::getParentId));
                            if (tableMap.containsKey(parentObjectId)){
                                List<DdmModelElementDto> ddmModelElementDtos = tableMap.get(parentObjectId);
                                Map<String, DdmModelElementDto> colunmNameMap = ddmModelElementDtos.stream().collect(Collectors.toMap(DdmModelElementDto::getColumnName, Function.identity()));
                                if (colunmNameMap.containsKey(objectName)){
                                    DdmModelElementDto ddmModelElementDto = colunmNameMap.get(objectName);
                                    resultDetailDto.setCategoryPath(ddmModelElementDto.getCategoryPath());
                                    if (L5CaCatalogExtsMap.containsKey(mappingCatalogId)){
                                        CatalogExt catalogExt = L5CaCatalogExtsMap.get(mappingCatalogId);
                                        if (null != catalogExt.getDomainId() && domainExtDtoMap.containsKey(catalogExt.getDomainId())) {
                                            String itemId = catalogExt.getDomainId();
                                            domainIdSets.add(itemId);
                                            CustomDomainExtDto customDomainExtDto = domainExtDtoMap.get(itemId);
                                            resultDetailDto.setDomainId(itemId);
                                            resultDetailDto.setDomainName(customDomainExtDto.getChineseName());
                                            String domainDataType = customDomainExtDto.getDataType();
                                            Integer domainDataPrecision = customDomainExtDto.getDataPrecision();
                                            Integer domainDataScale = customDomainExtDto.getDataScale();

                                            String dataType = ddmModelElementDto.getpDataType();
                                            int dataPrecision = ddmModelElementDto.getpDataPrecision();
                                            int dataScale = ddmModelElementDto.getpDataScale();
                                            String defaultValue = ddmModelElementDto.getpDefaultValue();
                                            Boolean isNotNull = ddmModelElementDto.getpIsNotNull();
                                            boolean defaultValueFlag = false;
                                            if (Objects.equals(catalogExt.getDefaultValue(),defaultValue)) {
                                                defaultValueFlag = true;
                                            }else {
                                                DesignLabelDropResultDetailDto resultDetailDto1 = new DesignLabelDropResultDetailDto();
                                                BeanUtils.copyProperties(resultDetailDto,resultDetailDto1);
                                                resultDetailDto1.setDesc("默认值不匹配");
                                                resultDetailDto1.setStatus("失败");
                                                resultDetailDto1.setDomainValue(catalogExt.getDefaultValue());
                                                resultDetailDto1.setColumnValue(defaultValue);
                                                resultDetailDtos.add(resultDetailDto1);
                                                //sb.append("数据精度不匹配,数据标准精度为").append(domainDataPrecision).append(",字段精度为").append(dataPrecision).append(";");
                                                DesignLabelDropResultDetailExcelDto designLabelDropResultDetailExcelDto = new DesignLabelDropResultDetailExcelDto(resultDetailDto);
                                                designLabelDropResultDetailExcelDto.setDesc("默认值不匹配");
                                                designLabelDropResultDetailExcelDto.setStatus("失败");
                                                designLabelDropResultDetailExcelDto.setDomainValue(catalogExt.getDefaultValue());
                                                designLabelDropResultDetailExcelDto.setColumnValue(defaultValue);
                                                designLabelDropResultDetailExcelDtos.add(designLabelDropResultDetailExcelDto);
                                            }

                                            boolean isNotNullFlag = false;
                                            if (Objects.equals(catalogExt.getsNull(),isNotNull)) {
                                                isNotNullFlag = true;
                                            }else {
                                                DesignLabelDropResultDetailDto resultDetailDto1 = new DesignLabelDropResultDetailDto();
                                                BeanUtils.copyProperties(resultDetailDto,resultDetailDto1);
                                                resultDetailDto1.setDesc("是否为空不匹配");
                                                resultDetailDto1.setStatus("失败");
                                                resultDetailDto1.setDomainValue(String.valueOf(catalogExt.getsNull()));
                                                resultDetailDto1.setColumnValue(String.valueOf(isNotNull));
                                                resultDetailDtos.add(resultDetailDto1);
                                                //sb.append("数据精度不匹配,数据标准精度为").append(domainDataPrecision).append(",字段精度为").append(dataPrecision).append(";");
                                                DesignLabelDropResultDetailExcelDto designLabelDropResultDetailExcelDto = new DesignLabelDropResultDetailExcelDto(resultDetailDto);
                                                designLabelDropResultDetailExcelDto.setDesc("是否为空不匹配");
                                                designLabelDropResultDetailExcelDto.setStatus("失败");
                                                designLabelDropResultDetailExcelDto.setDomainValue(catalogExt.getsNull() ? "是" : "否");
                                                designLabelDropResultDetailExcelDto.setColumnValue(isNotNull ? "是" : "否");
                                                designLabelDropResultDetailExcelDtos.add(designLabelDropResultDetailExcelDto);
                                            }

                                            Boolean dataTypeFlag = checkDataType(dataType, domainDataType, resultDetailDtos,designLabelDropResultDetailExcelDtos,resultDetailDto);
                                            boolean dataPrecisionFlag = false;
                                            if (null != domainDataPrecision && domainDataPrecision == dataPrecision){
                                                dataPrecisionFlag = true;
                                            }else {
                                                DesignLabelDropResultDetailDto resultDetailDto1 = new DesignLabelDropResultDetailDto();
                                                BeanUtils.copyProperties(resultDetailDto,resultDetailDto1);
                                                resultDetailDto1.setDesc("数据精度不匹配");
                                                resultDetailDto1.setStatus("失败");
                                                resultDetailDto1.setDomainValue(String.valueOf(domainDataPrecision));
                                                resultDetailDto1.setColumnValue(String.valueOf(dataPrecision));
                                                resultDetailDtos.add(resultDetailDto1);
                                                //sb.append("数据精度不匹配,数据标准精度为").append(domainDataPrecision).append(",字段精度为").append(dataPrecision).append(";");
                                                DesignLabelDropResultDetailExcelDto designLabelDropResultDetailExcelDto = new DesignLabelDropResultDetailExcelDto(resultDetailDto);
                                                designLabelDropResultDetailExcelDto.setDesc("数据精度不匹配");
                                                designLabelDropResultDetailExcelDto.setStatus("失败");
                                                designLabelDropResultDetailExcelDto.setDomainValue(String.valueOf(domainDataPrecision));
                                                designLabelDropResultDetailExcelDto.setColumnValue(String.valueOf(dataPrecision));
                                                designLabelDropResultDetailExcelDtos.add(designLabelDropResultDetailExcelDto);
                                            }


                                            boolean dataScaleFlag = false;
                                            if (null != domainDataScale  && dataScale <= domainDataScale){
                                                dataScaleFlag = true;
                                            }else {
                                                DesignLabelDropResultDetailDto resultDetailDto1 = new DesignLabelDropResultDetailDto();
                                                BeanUtils.copyProperties(resultDetailDto,resultDetailDto1);
                                                resultDetailDto1.setDesc("数据长度不匹配");
                                                resultDetailDto1.setStatus("失败");
                                                resultDetailDto1.setDomainValue(String.valueOf(domainDataScale));
                                                resultDetailDto1.setColumnValue(String.valueOf(dataScale));
                                                resultDetailDtos.add(resultDetailDto1);
                                                //sb.append("数据长度不匹配,数据标准长度为").append(domainDataScale).append(",字段长度为").append(dataScale).append(";");
                                                DesignLabelDropResultDetailExcelDto designLabelDropResultDetailExcelDto = new DesignLabelDropResultDetailExcelDto(resultDetailDto);
                                                designLabelDropResultDetailExcelDto.setDesc("数据长度不匹配");
                                                designLabelDropResultDetailExcelDto.setStatus("失败");
                                                designLabelDropResultDetailExcelDto.setDomainValue(String.valueOf(domainDataScale));
                                                designLabelDropResultDetailExcelDto.setColumnValue(String.valueOf(dataScale));
                                                designLabelDropResultDetailExcelDtos.add(designLabelDropResultDetailExcelDto);
                                            }
                                            //resultDetailDto.setDesc(sb.toString());
                                            if (dataTypeFlag && dataPrecisionFlag && dataScaleFlag && defaultValueFlag && isNotNullFlag){
                                                LabelDropCount++;
                                                resultDetailDto.setStatus("成功");
                                                resultDetailDtos.add(resultDetailDto);
                                            }
                                        }
                                    }else {
                                        DesignLabelDropResultDetailDto resultDetailDto1 = new DesignLabelDropResultDetailDto();
                                        BeanUtils.copyProperties(resultDetailDto,resultDetailDto1);
                                        resultDetailDto1.setDesc("该DL5未映射属性");
                                        resultDetailDto1.setStatus("未映射");
                                        resultDetailDtos.add(resultDetailDto1);
                                    }
                                }

                            }
                        }
                    }
                    LabelDropNumTotal += LabelDropCount;
                    if (null != designLabelDropResultDto.getLabelDropNum()){
                        logger.info("LabelDropCount1:"+LabelDropCount);
                        LabelDropCount = LabelDropCount + designLabelDropResultDto.getLabelDropNum();
                        logger.info("matchedCount2:"+matchedCount);
                    }
                    designLabelDropResultDto.setLabelDropNum(LabelDropCount);
                    designLabelDropResultDto.setDomainNum((long)domainIdSets.size());

                    if (designLabelDropResultDto.getAssetNum() != 0) {
                        // 计算注册率
                        double rate = (double) LabelDropCount / designLabelDropResultDto.getAssetNum() * 100;

                        String formattedRate = String.format("%.2f%%", rate);
                        designLabelDropResultDto.setLabelDropRate(formattedRate);
                    }else {
                        designLabelDropResultDto.setLabelDropRate("0%");
                    }
                    /*designLabelDropResultDto.setDesignLabelDropResultDetailDtoList(resultDetailDtos);*/
                    designLabelDropResultDtolist.add(designLabelDropResultDto);
                }
            }
        }
        if (assetNumTotal != 0) {
            // 计算注册率
            double rate1 = (double) registerAssetNumTotal / assetNumTotal * 100;
            double rate2 = (double) LabelDropNumTotal / assetNumTotal * 100;
            String formattedRate1 = String.format("%.2f%%", rate1);
            String formattedRate2 = String.format("%.2f%%", rate2);
            designLabelDropResultTotalDto.setRegisterAssetRateTotal(formattedRate1);
            designLabelDropResultTotalDto.setLabelDropRateTotal(formattedRate2);

        }else {
            designLabelDropResultTotalDto.setRegisterAssetRateTotal("0%");
            designLabelDropResultTotalDto.setLabelDropRateTotal("0%");
        }
        designLabelDropResultTotalDto.setAssetNumTotal(assetNumTotal);
        designLabelDropResultTotalDto.setLabelDropNumTotal(LabelDropNumTotal);
        designLabelDropResultTotalDto.setRegisterAssetNumTotal(registerAssetNumTotal);
        designLabelDropResultTotalDto.setDesignLabelDropResultDtolist(designLabelDropResultDtolist);
        designLabelDropResultTotalDto.setDesignLabelDropResultDetailExcelDtos(designLabelDropResultDetailExcelDtos);
        designLabelDropResultTotalDto.setDesignLabelDropResultDetailDtoList(resultDetailDtos);
        designLabelDropResultTotalDto.setDl5AttributeDtos(dl5AttributeDtos);
        List<TechLabelDropResult> techLabelDropResults = new ArrayList<>();
        List<TechLabelDropResultDetail> techLabelDropResultDetails = new ArrayList<>();
        String checkTime = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        for (DesignLabelDropResultDto designLabelDropResultDto : designLabelDropResultDtolist) {
            TechLabelDropResult techLabelDropResult = new TechLabelDropResult(designLabelDropResultDto);
            techLabelDropResult.setCheckTime(checkTime);
            techLabelDropResults.add(techLabelDropResult);
        }
        for (DesignLabelDropResultDetailDto resultDetailDto : resultDetailDtos) {
            TechLabelDropResultDetail techLabelDropResultDetail = new TechLabelDropResultDetail(resultDetailDto);
            techLabelDropResultDetail.setCheckTime(checkTime);
            techLabelDropResultDetails.add(techLabelDropResultDetail);
        }
        if (techLabelDropResultRepository.existsByCheckTime(checkTime)){
            techLabelDropResultRepository.deleteByCheckTime(checkTime);
        }
        if (techLabelDropResultDetailRepository.existsByCheckTime(checkTime)){
            techLabelDropResultDetailRepository.deleteByCheckTime(checkTime);
        }
        techLabelDropResultRepository.saveAll(techLabelDropResults);
        techLabelDropResultDetailRepository.saveAll(techLabelDropResultDetails);
        return designLabelDropResultTotalDto;
    }



    @Override
    @Transactional
    public DesignLabelDropResultTotalDto getDesignLabelDropResult(LabelDropInspectionQueryParamDto labelDropInspectionQueryParamDto) throws Exception{


        //查询主题域对应L5比较结果
        List<String> catalogPaths = new ArrayList<>();
        StringBuilder path = new StringBuilder();
        if (null != labelDropInspectionQueryParamDto.getBusinessObjectId()){//业务对象
            logger.info("业务对象");
            path.append("0/").append(labelDropInspectionQueryParamDto.getBusinessDomainId()).append("/").append(labelDropInspectionQueryParamDto.getSubjectDomainId()).append("/").append(labelDropInspectionQueryParamDto.getBusinessObjectId()).append("/%");
            catalogPaths.add(path.toString());
        }

        if (null != labelDropInspectionQueryParamDto.getSubjectDomainId() && null == labelDropInspectionQueryParamDto.getBusinessObjectId()){//主题域
            logger.info("主题域");
            path.append("0/").append(labelDropInspectionQueryParamDto.getBusinessDomainId()).append("/").append(labelDropInspectionQueryParamDto.getSubjectDomainId()).append("/%");
            catalogPaths.add(path.toString());
        }

        if (null != labelDropInspectionQueryParamDto.getBusinessDomainId() && null == labelDropInspectionQueryParamDto.getSubjectDomainId() && null == labelDropInspectionQueryParamDto.getBusinessObjectId()){//业务域
            logger.info("业务域");
            //查找
            path.append("0/").append(labelDropInspectionQueryParamDto.getBusinessDomainId()).append("/%");
            catalogPaths.add(path.toString());
        }

        if (null != labelDropInspectionQueryParamDto.getDdmModelId()){
            logger.info("模型");
            List<Long> catalogs = ddmMappingCatalogRepository.findByDdmModelId(labelDropInspectionQueryParamDto.getDdmModelId());
            if (!CollectionUtils.isEmpty(catalogs)){
                Long businessObjectId = catalogs.get(0);//一个模型只能映射一个业务域
                String catalogPath = commonCatalogExtRepository.findCatalogPathById(businessObjectId);
                path.append(catalogPath).append("%");
                catalogPaths.add(path.toString());
            }
        }


        if (null != labelDropInspectionQueryParamDto.getModelCategoryId() && null == labelDropInspectionQueryParamDto.getDdmModelId()){
            logger.info("系统");
            List<Long> catalogs = ddmMappingCatalogRepository.findByModelCategoryId(labelDropInspectionQueryParamDto.getModelCategoryId());
            if (!CollectionUtils.isEmpty(catalogs)){
                List<String> paths = commonCatalogExtRepository.findCatalogPathByIds(catalogs);
                for (String catalogPath : paths) {
                    catalogPaths.add(catalogPath + "%");
                }
            }
        }
        //总结果列表
        DesignLabelDropResultTotalDto designLabelDropResultTotalDto = new DesignLabelDropResultTotalDto();
        //统计列表
        List<DesignLabelDropResultDto> designLabelDropResultDtolist = new ArrayList<>();
        //详情excel列表
        List<DesignLabelDropResultDetailExcelDto> designLabelDropResultDetailExcelDtos = new ArrayList<>();
        //详情列表
        List<DesignLabelDropResultDetailDto> resultDetailDtos = new ArrayList<>();
        //DL5资产列表
        List<DL5AttributeDto> dl5AttributeDtos =  new ArrayList<>();
        long assetNumTotal = 0L;
        long registerAssetNumTotal = 0L;
        long LabelDropNumTotal = 0L;
        if (!CollectionUtils.isEmpty(catalogPaths)){
            logger.info("catalogPaths:"+ catalogPaths);
            List<BaseModelCategory> modelCategories = modelCategoryService.getAllBaseModelCategories();
            Map<Long, String> modelNameMap = modelCategories.stream().collect(Collectors.toMap(BaseModelCategory::getId, BaseModelCategory::getName));

            List<CatalogExt> L5CaCatalogExts = catalogExtRepository.findAll();
            Map<Long, CatalogExt> L5CaCatalogExtsMap = L5CaCatalogExts.stream().collect(Collectors.toMap(CatalogExt::getCatalogId, Function.identity()));
            List<String> domainIds = L5CaCatalogExts.stream().map(CatalogExt::getDomainId).toList();
            List<CustomDomainExtDto> domains = domainExtService.getDomainsById(domainIds);
            Map<String, CustomDomainExtDto> domainExtDtoMap = domains.stream().collect(Collectors.toMap(CustomDomainExtDto::getDomainId, Function.identity()));
            for (String catalogPath : catalogPaths) {//多个model对应path
                //获取主题域对应L5目录id
                List<CommonCatalog> L5catalogs = commonCatalogExtRepository.findByCatalogPathLikeAndLevel(catalogPath, 5,EnumAssetsCatalogStatus.PUBLISHED);
                List<Long> L5catalogIds = L5catalogs.stream().map(CommonCatalog::getId).toList();
                logger.info("主题域对应L5Id:"+ L5catalogIds);
                List<CommonCatalog> L4Catalogs = commonCatalogExtRepository.findAllByCatalogPathLikeAndLevel(catalogPath, 4,EnumAssetsCatalogStatus.PUBLISHED);
                Map<Long, CommonCatalog> L4CatalogMap = L4Catalogs.stream().collect(Collectors.toMap(CommonCatalog::getId, Function.identity()));
                //根据DL5查询对应数据元标准
                /*List<DataAssets> dataAssetsList = dataAssetExtRepository.findDomainByCatalogIdAndSubType(L5catalogIds, EnumSupportType.DATA_STANDARD);
                if (CollectionUtils.isEmpty(dataAssetsList)){
                    throw new InvalidArgumentException("没有L5注册数据元标准");
                }
                Map<Long, String> L5CatologMap = dataAssetsList.stream().collect(Collectors.toMap(DataAssets::getCatalogId, DataAssets::getItemId));
                List<String> domainIds = dataAssetsList.stream().map(DataAssets::getItemId).toList();
                List<CustomDomainExtDto> domains = domainExtService.getDomainsById(domainIds);
                Map<String, CustomDomainExtDto> domainExtDtoMap = domains.stream().collect(Collectors.toMap(CustomDomainExtDto::getDomainId, Function.identity()));
*/
                //根据L5id 查找注册资产
                //List<DataAssets> dataAssets = dataAssetsRepository.findByCatalogIdIn(L5catalogIds);
                //根据注册资产分组得到注册L5数量
                //Map<Long, List<DataAssets>> catalogAssetsMap = dataAssets.stream().collect(Collectors.groupingBy(DataAssets::getCatalogId));


                //根据L5目录id查询已映射mapping信息
                List<DdmMappingCatalog> ddmMappingCatalogs = ddmMappingCatalogRepository.queryDdmMappingCatalogsByCatalogIdsAndMappingTypes(L5catalogIds, Lists.newArrayList(MappingCatalogTypeEnum.AUTOMATIC_MAPPING.getDesc(), MappingCatalogTypeEnum.MANUAL_MAPPING.getDesc()));
                Set<Long> modelIds = ddmMappingCatalogs.stream().map(DdmMappingCatalog::getDdmModelId).collect(Collectors.toSet());
                Map<Long, List<DdmModelElementDto>> modelElementMap = new HashMap<>();
                for (Long modelId : modelIds) {
                    List<DdmModelElementDto> ddmModelElementDtos = datablauRemoteDdmModelServiceNew.queryDdmModelElementDetail(modelId);
                    modelElementMap.put(modelId,ddmModelElementDtos);
                }
                Map<Long, List<DdmMappingCatalog>> modelCategoryMap = ddmMappingCatalogs.stream().collect(Collectors.groupingBy(DdmMappingCatalog::getModelCategoryId));

                Map<Long, List<DdmMappingCatalog>> mappingL5Map = ddmMappingCatalogs.stream().collect(Collectors.groupingBy(DdmMappingCatalog::getCatalogId));

                for (CommonCatalog l5catalog : L5catalogs) {
                    DL5AttributeDto dl5AttributeDto = new DL5AttributeDto();
                    if (mappingL5Map.containsKey(l5catalog.getId())){
                        dl5AttributeDto.setdL5Status("是");
                    }else {
                        dl5AttributeDto.setdL5Status("否");
                    }
                    dl5AttributeDto.setdL5ChName(l5catalog.getName());
                    dl5AttributeDto.setdL5EnName(l5catalog.getEnglishName());
                    dl5AttributeDto.setdL5Code(l5catalog.getCode());
                    dl5AttributeDtos.add(dl5AttributeDto);
                }

                Map<String, List<DesignLabelDropResultDto>> oldMap = designLabelDropResultDtolist.stream().collect(Collectors.groupingBy(DesignLabelDropResultDto::getModelCategoryName));
                for (Long modelCategoryId : modelCategoryMap.keySet()) {
                    logger.info("对应modelCategoryId："+modelCategoryId);
                    DesignLabelDropResultDto designLabelDropResultDto = new DesignLabelDropResultDto();

                    if (modelNameMap.containsKey(modelCategoryId)){
                        if (oldMap.containsKey(modelNameMap.get(modelCategoryId))){
                            designLabelDropResultDto = oldMap.get(modelNameMap.get(modelCategoryId)).get(0);
                            designLabelDropResultDtolist.remove(designLabelDropResultDto);
                        }else {
                            //设置系统名称
                            designLabelDropResultDto.setModelCategoryName(modelNameMap.get(modelCategoryId));
                        }
                    }else {
                        designLabelDropResultDto.setModelCategoryName(String.valueOf(modelCategoryId));
                    }

                    //每个系统对应的mapping信息
                    List<DdmMappingCatalog> mappingCatalogs = modelCategoryMap.get(modelCategoryId);

                    //每个系统中每个DL5的mapping
                    Map<Long, List<DdmMappingCatalog>> DL5MapingMap = mappingCatalogs.stream().collect(Collectors.groupingBy(DdmMappingCatalog::getCatalogId));

                    //设置资产数
                    long assetNum = L5catalogs.size();
                    assetNumTotal += assetNum;
                    if (oldMap.containsKey(modelNameMap.get(modelCategoryId))){
                        logger.info("assetNum1:"+assetNum);
                        assetNum = assetNum + designLabelDropResultDto.getAssetNum();
                        logger.info("assetNum2:"+assetNum);
                    }
                    designLabelDropResultDto.setAssetNum(assetNum);
                    //提取 mappingCatalogs 中所有的 catalogId 到 Set 集合中
                    Set<Long> mappingCatalogIds = mappingCatalogs.stream()
                            .map(DdmMappingCatalog::getCatalogId)
                            .collect(Collectors.toSet());
                    logger.info("对应mappingCatalogs：" + mappingCatalogIds);
                    //遍历 L5catalogs 的键，筛选出包含在 mappingCatalogIds 中的键
                    /*long matchedCount = L5catalogs.stream()
                            .filter(mappingCatalogIds::contains)
                            .count();*/
                    //设置资产注册数
                    long matchedCount = mappingCatalogIds.size();
                    registerAssetNumTotal += matchedCount;
                    if (oldMap.containsKey(modelNameMap.get(modelCategoryId))){
                        logger.info("matchedCount1:"+matchedCount);
                        matchedCount = matchedCount + designLabelDropResultDto.getRegisterAssetNum();
                        logger.info("matchedCount2:"+matchedCount);
                    }
                    designLabelDropResultDto.setRegisterAssetNum(matchedCount);

                    if (designLabelDropResultDto.getAssetNum() != 0) {
                        // 计算注册率
                        double rate = (double) matchedCount / designLabelDropResultDto.getAssetNum() * 100;

                        String formattedRate = String.format("%.2f%%", rate);
                        designLabelDropResultDto.setRegisterAssetRate(formattedRate);
                    }else {
                        designLabelDropResultDto.setRegisterAssetRate("0%");
                    }
                    long LabelDropCount = 0L;

                    //每个系统的L5比对数据元标准
                    Set<String> domainIdSets = new HashSet<>();
                    for (Long mappingCatalogId : DL5MapingMap.keySet()) {
                        List<DdmMappingCatalog> ddmMappingCatalogList = DL5MapingMap.get(mappingCatalogId);

                        Long ddmModelId = ddmMappingCatalogList.get(0).getDdmModelId();
                        Long parentObjectId = ddmMappingCatalogList.get(0).getParentObjectId();
                        String objectName = ddmMappingCatalogList.get(0).getObjectName();
                        Long parentCatalogId = ddmMappingCatalogList.get(0).getParentCatalogId();
                        DesignLabelDropResultDetailDto resultDetailDto = new DesignLabelDropResultDetailDto();
                        resultDetailDto.setMappingColumn(objectName);
                        resultDetailDto.setAttribute(objectName);

                        if (L4CatalogMap.containsKey(parentCatalogId)){
                            resultDetailDto.setLogicEntity(L4CatalogMap.get(parentCatalogId).getEnglishName());
                        }

                        //todo 比对每个DL5的属性，（1.是否为空，2.默认值） 数据元标准（3.数据类型，4..数据长度 5.数据精度）
                        if (modelElementMap.containsKey(ddmModelId)) {
                            List<DdmModelElementDto> modelElementDtos = modelElementMap.get(ddmModelId);
                            designLabelDropResultTotalDto.setModelColumnNumTotal((long) modelElementDtos.size());
                            Map<Long, List<DdmModelElementDto>> tableMap = modelElementDtos.stream().collect(Collectors.groupingBy(DdmModelElementDto::getParentId));
                            if (tableMap.containsKey(parentObjectId)){
                                List<DdmModelElementDto> ddmModelElementDtos = tableMap.get(parentObjectId);
                                Map<String, DdmModelElementDto> colunmNameMap = ddmModelElementDtos.stream().collect(Collectors.toMap(DdmModelElementDto::getColumnName, Function.identity()));
                                if (colunmNameMap.containsKey(objectName)){
                                    DdmModelElementDto ddmModelElementDto = colunmNameMap.get(objectName);
                                    resultDetailDto.setCategoryPath(ddmModelElementDto.getCategoryPath());
                                    if (L5CaCatalogExtsMap.containsKey(mappingCatalogId)){
                                        CatalogExt catalogExt = L5CaCatalogExtsMap.get(mappingCatalogId);
                                        if (null != catalogExt.getDomainId() && domainExtDtoMap.containsKey(catalogExt.getDomainId())) {
                                            String itemId = catalogExt.getDomainId();
                                            domainIdSets.add(itemId);
                                            CustomDomainExtDto customDomainExtDto = domainExtDtoMap.get(itemId);
                                            resultDetailDto.setDomainId(itemId);
                                            resultDetailDto.setDomainName(customDomainExtDto.getChineseName());
                                            String domainDataType = customDomainExtDto.getDataType();
                                            Integer domainDataPrecision = customDomainExtDto.getDataPrecision();
                                            Integer domainDataScale = customDomainExtDto.getDataScale();

                                            String dataType = ddmModelElementDto.getpDataType();
                                            int dataPrecision = ddmModelElementDto.getpDataPrecision();
                                            int dataScale = ddmModelElementDto.getpDataScale();
                                            String defaultValue = ddmModelElementDto.getpDefaultValue();
                                            Boolean isNotNull = ddmModelElementDto.getpIsNotNull();
                                            boolean defaultValueFlag = false;
                                            if (Objects.equals(catalogExt.getDefaultValue(),defaultValue)) {
                                                defaultValueFlag = true;
                                            }else {
                                                DesignLabelDropResultDetailDto resultDetailDto1 = new DesignLabelDropResultDetailDto();
                                                BeanUtils.copyProperties(resultDetailDto,resultDetailDto1);
                                                resultDetailDto1.setDesc("默认值不匹配");
                                                resultDetailDto1.setStatus("失败");
                                                resultDetailDto1.setDomainValue(catalogExt.getDefaultValue());
                                                resultDetailDto1.setColumnValue(defaultValue);
                                                resultDetailDtos.add(resultDetailDto1);
                                                //sb.append("数据精度不匹配,数据标准精度为").append(domainDataPrecision).append(",字段精度为").append(dataPrecision).append(";");
                                                DesignLabelDropResultDetailExcelDto designLabelDropResultDetailExcelDto = new DesignLabelDropResultDetailExcelDto(resultDetailDto);
                                                designLabelDropResultDetailExcelDto.setDesc("默认值不匹配");
                                                designLabelDropResultDetailExcelDto.setStatus("失败");
                                                designLabelDropResultDetailExcelDto.setDomainValue(catalogExt.getDefaultValue());
                                                designLabelDropResultDetailExcelDto.setColumnValue(defaultValue);
                                                designLabelDropResultDetailExcelDtos.add(designLabelDropResultDetailExcelDto);
                                            }

                                            boolean isNotNullFlag = false;
                                            if (Objects.equals(catalogExt.getsNull(),isNotNull)) {
                                                isNotNullFlag = true;
                                            }else {
                                                DesignLabelDropResultDetailDto resultDetailDto1 = new DesignLabelDropResultDetailDto();
                                                BeanUtils.copyProperties(resultDetailDto,resultDetailDto1);
                                                resultDetailDto1.setDesc("是否为空不匹配");
                                                resultDetailDto1.setStatus("失败");
                                                resultDetailDto1.setDomainValue(String.valueOf(catalogExt.getsNull()));
                                                resultDetailDto1.setColumnValue(String.valueOf(isNotNull));
                                                resultDetailDtos.add(resultDetailDto1);
                                                //sb.append("数据精度不匹配,数据标准精度为").append(domainDataPrecision).append(",字段精度为").append(dataPrecision).append(";");
                                                DesignLabelDropResultDetailExcelDto designLabelDropResultDetailExcelDto = new DesignLabelDropResultDetailExcelDto(resultDetailDto);
                                                designLabelDropResultDetailExcelDto.setDesc("是否为空不匹配");
                                                designLabelDropResultDetailExcelDto.setStatus("失败");
                                                designLabelDropResultDetailExcelDto.setDomainValue(catalogExt.getsNull() ? "是" : "否");
                                                designLabelDropResultDetailExcelDto.setColumnValue(isNotNull ? "是" : "否");
                                                designLabelDropResultDetailExcelDtos.add(designLabelDropResultDetailExcelDto);
                                            }

                                            Boolean dataTypeFlag = checkDataType(dataType, domainDataType, resultDetailDtos,designLabelDropResultDetailExcelDtos,resultDetailDto);
                                            boolean dataPrecisionFlag = false;
                                            if (null != domainDataPrecision && domainDataPrecision == dataPrecision){
                                                dataPrecisionFlag = true;
                                            }else {
                                                DesignLabelDropResultDetailDto resultDetailDto1 = new DesignLabelDropResultDetailDto();
                                                BeanUtils.copyProperties(resultDetailDto,resultDetailDto1);
                                                resultDetailDto1.setDesc("数据精度不匹配");
                                                resultDetailDto1.setStatus("失败");
                                                resultDetailDto1.setDomainValue(String.valueOf(domainDataPrecision));
                                                resultDetailDto1.setColumnValue(String.valueOf(dataPrecision));
                                                resultDetailDtos.add(resultDetailDto1);
                                                //sb.append("数据精度不匹配,数据标准精度为").append(domainDataPrecision).append(",字段精度为").append(dataPrecision).append(";");
                                                DesignLabelDropResultDetailExcelDto designLabelDropResultDetailExcelDto = new DesignLabelDropResultDetailExcelDto(resultDetailDto);
                                                designLabelDropResultDetailExcelDto.setDesc("数据精度不匹配");
                                                designLabelDropResultDetailExcelDto.setStatus("失败");
                                                designLabelDropResultDetailExcelDto.setDomainValue(String.valueOf(domainDataPrecision));
                                                designLabelDropResultDetailExcelDto.setColumnValue(String.valueOf(dataPrecision));
                                                designLabelDropResultDetailExcelDtos.add(designLabelDropResultDetailExcelDto);
                                            }


                                            boolean dataScaleFlag = false;
                                            if (null != domainDataScale  && dataScale <= domainDataScale){
                                                dataScaleFlag = true;
                                            }else {
                                                DesignLabelDropResultDetailDto resultDetailDto1 = new DesignLabelDropResultDetailDto();
                                                BeanUtils.copyProperties(resultDetailDto,resultDetailDto1);
                                                resultDetailDto1.setDesc("数据长度不匹配");
                                                resultDetailDto1.setStatus("失败");
                                                resultDetailDto1.setDomainValue(String.valueOf(domainDataScale));
                                                resultDetailDto1.setColumnValue(String.valueOf(dataScale));
                                                resultDetailDtos.add(resultDetailDto1);
                                                //sb.append("数据长度不匹配,数据标准长度为").append(domainDataScale).append(",字段长度为").append(dataScale).append(";");
                                                DesignLabelDropResultDetailExcelDto designLabelDropResultDetailExcelDto = new DesignLabelDropResultDetailExcelDto(resultDetailDto);
                                                designLabelDropResultDetailExcelDto.setDesc("数据长度不匹配");
                                                designLabelDropResultDetailExcelDto.setStatus("失败");
                                                designLabelDropResultDetailExcelDto.setDomainValue(String.valueOf(domainDataScale));
                                                designLabelDropResultDetailExcelDto.setColumnValue(String.valueOf(dataScale));
                                                designLabelDropResultDetailExcelDtos.add(designLabelDropResultDetailExcelDto);
                                            }
                                            //resultDetailDto.setDesc(sb.toString());
                                            if (dataTypeFlag && dataPrecisionFlag && dataScaleFlag && defaultValueFlag && isNotNullFlag){
                                                LabelDropCount++;
                                                resultDetailDto.setStatus("成功");
                                                resultDetailDtos.add(resultDetailDto);
                                            }
                                        }
                                    }else {
                                        DesignLabelDropResultDetailDto resultDetailDto1 = new DesignLabelDropResultDetailDto();
                                        BeanUtils.copyProperties(resultDetailDto,resultDetailDto1);
                                        resultDetailDto1.setDesc("该DL5未映射属性");
                                        resultDetailDto1.setStatus("未映射");
                                        resultDetailDtos.add(resultDetailDto1);
                                    }
                                }

                            }
                        }
                    }
                    LabelDropNumTotal += LabelDropCount;
                    if (null != designLabelDropResultDto.getLabelDropNum()){
                        logger.info("LabelDropCount1:"+LabelDropCount);
                        LabelDropCount = LabelDropCount + designLabelDropResultDto.getLabelDropNum();
                        logger.info("matchedCount2:"+matchedCount);
                    }
                    designLabelDropResultDto.setLabelDropNum(LabelDropCount);
                    designLabelDropResultDto.setDomainNum((long)domainIdSets.size());

                    if (designLabelDropResultDto.getAssetNum() != 0) {
                        // 计算注册率
                        double rate = (double) LabelDropCount / designLabelDropResultDto.getAssetNum() * 100;

                        String formattedRate = String.format("%.2f%%", rate);
                        designLabelDropResultDto.setLabelDropRate(formattedRate);
                    }else {
                        designLabelDropResultDto.setLabelDropRate("0%");
                    }
                    designLabelDropResultDtolist.add(designLabelDropResultDto);
                }
            }
        }
        if (assetNumTotal != 0) {
            // 计算注册率
            double rate1 = (double) registerAssetNumTotal / assetNumTotal * 100;
            double rate2 = (double) LabelDropNumTotal / assetNumTotal * 100;
            String formattedRate1 = String.format("%.2f%%", rate1);
            String formattedRate2 = String.format("%.2f%%", rate2);
            designLabelDropResultTotalDto.setRegisterAssetRateTotal(formattedRate1);
            designLabelDropResultTotalDto.setLabelDropRateTotal(formattedRate2);

        }else {
            designLabelDropResultTotalDto.setRegisterAssetRateTotal("0%");
            designLabelDropResultTotalDto.setLabelDropRateTotal("0%");
        }
        designLabelDropResultTotalDto.setAssetNumTotal(assetNumTotal);
        designLabelDropResultTotalDto.setLabelDropNumTotal(LabelDropNumTotal);
        designLabelDropResultTotalDto.setRegisterAssetNumTotal(registerAssetNumTotal);
        designLabelDropResultTotalDto.setDesignLabelDropResultDtolist(designLabelDropResultDtolist);
        designLabelDropResultTotalDto.setDesignLabelDropResultDetailExcelDtos(designLabelDropResultDetailExcelDtos);
        designLabelDropResultTotalDto.setDesignLabelDropResultDetailDtoList(resultDetailDtos);
        designLabelDropResultTotalDto.setDl5AttributeDtos(dl5AttributeDtos);

        List<DesignLabelDropResult> designLabelDropResults = new ArrayList<>();
        List<DesignLabelDropResultDetail> designLabelDropResultDetails = new ArrayList<>();
        String checkTime = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        for (DesignLabelDropResultDto designLabelDropResultDto : designLabelDropResultDtolist) {
            DesignLabelDropResult designLabelDropResult = new DesignLabelDropResult(designLabelDropResultDto);
            designLabelDropResult.setCheckTime(checkTime);
            designLabelDropResults.add(designLabelDropResult);
        }
        for (DesignLabelDropResultDetailDto resultDetailDto : resultDetailDtos) {
            DesignLabelDropResultDetail designLabelDropResultDetail = new DesignLabelDropResultDetail(resultDetailDto);
            designLabelDropResultDetail.setCheckTime(checkTime);
            designLabelDropResultDetails.add(designLabelDropResultDetail);
        }
        if (designLabelDropResultRepository.existsByCheckTime(checkTime)){
            designLabelDropResultRepository.deleteByCheckTime(checkTime);
        }

        if (designLabelDropResultDetailRepository.existsByCheckTime(checkTime)){
            designLabelDropResultDetailRepository.deleteByCheckTime(checkTime);
        }
        designLabelDropResultRepository.saveAll(designLabelDropResults);
        designLabelDropResultDetailRepository.saveAll(designLabelDropResultDetails);
        return designLabelDropResultTotalDto;
    }


    @Override
    @Transactional
    public ResponseEntity<byte[]> exportRequirementPublish(LabelDropInspectionQueryParamDto labelDropInspectionQueryParamDto) throws Exception{
        DesignLabelDropResultTotalDto deesignLabelDropResultTotalDto = this.getDesignLabelDropResult(labelDropInspectionQueryParamDto);
        File exportExcel = excelExporter.exportExcel(DesignLabelDropResultDetailExcelDto.class, deesignLabelDropResultTotalDto.getDesignLabelDropResultDetailExcelDtos(), "落标明细", 0, "落标明细");
        return this.generalResponseEntityByFile(exportExcel);
    }

    @Override
    @Transactional
    public ResponseEntity<byte[]> exportTechLabelDropResult(LabelDropInspectionQueryParamDto labelDropInspectionQueryParamDto) throws Exception {
        DesignLabelDropResultTotalDto deesignLabelDropResultTotalDto = this.getTechLabelDropResult(labelDropInspectionQueryParamDto);
        File exportExcel = excelExporter.exportExcel(DesignLabelDropResultDetailExcelDto.class, deesignLabelDropResultTotalDto.getDesignLabelDropResultDetailExcelDtos(), "落标明细", 0, "落标明细");
        return this.generalResponseEntityByFile(exportExcel);
    }

    @Override
    @Transactional
    public ByteArrayOutputStream exportDesignLabelDropResultByWord(LabelDropInspectionQueryParamDto labelDropInspectionQueryParamDto) throws Exception {
        DesignLabelDropResultTotalDto deesignLabelDropResultTotalDto = this.getDesignLabelDropResult(labelDropInspectionQueryParamDto);
        // 创建文档对象
        XWPFDocument document = new XWPFDocument();

        // 添加标题
        XWPFParagraph title = document.createParagraph();
        title.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun titleRun = title.createRun();
        titleRun.setText("设计落标报告（逻辑模型）");
        titleRun.setBold(true);
        titleRun.setFontSize(16);

        // 添加字段
        XWPFParagraph paragraph = document.createParagraph();
        XWPFRun run = paragraph.createRun();
        run.setText("校验时间："+ LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        run.setBold(true);
        Long assetNumTotal = deesignLabelDropResultTotalDto.getAssetNumTotal();
        Long registerAssetNumTotal = deesignLabelDropResultTotalDto.getRegisterAssetNumTotal();
        String registerAssetRateTotal = deesignLabelDropResultTotalDto.getRegisterAssetRateTotal();
        String labelDropRateTotal = deesignLabelDropResultTotalDto.getLabelDropRateTotal();
        Long modelColumnNumTotal = deesignLabelDropResultTotalDto.getModelColumnNumTotal();
        paragraph = document.createParagraph();
        run = paragraph.createRun();
        run.setText("落标结果   资产总数（DL5）: "+ assetNumTotal + "    已承载DL5: " + registerAssetNumTotal + "    资产覆盖率: " + registerAssetRateTotal
        +"  落标率: " + labelDropRateTotal + "  模型字段数: " + modelColumnNumTotal);
        run.setBold(true);

        //系统列表
        List<DesignLabelDropResultDto> designLabelDropResultDtolist = deesignLabelDropResultTotalDto.getDesignLabelDropResultDtolist();
        XWPFTable table = getXwpfTable(document, designLabelDropResultDtolist, 5);

        XWPFTableRow headerRow = table.getRow(0);
        headerRow.getCell(0).setText("应用系统");
        headerRow.getCell(1).setText("资产数（DL5）");
        headerRow.getCell(2).setText("已承载DL5数");
        headerRow.getCell(3).setText("落标数");
        headerRow.getCell(4).setText("涉及标准元数据个数");

        fillData(designLabelDropResultDtolist,table);

        addEmptyLine(document);
        paragraph = document.createParagraph();
        run = paragraph.createRun();
        run.setText("资产总数清单");
        run.setBold(true);

        //dl5资产列表
        List<DL5AttributeDto> dl5AttributeDtos = deesignLabelDropResultTotalDto.getDl5AttributeDtos();
        XWPFTable table3 = getXwpfTable(document, dl5AttributeDtos, 4);
        XWPFTableRow headerRow3 = table3.getRow(0);
        headerRow3.getCell(0).setText("DL5编码");
        headerRow3.getCell(1).setText("DL5中文名称");
        headerRow3.getCell(2).setText("DL5英文名称");
        headerRow3.getCell(3).setText("是否被引用");
        fillData3(dl5AttributeDtos,table3);



        addEmptyLine(document);
        paragraph = document.createParagraph();
        run = paragraph.createRun();
        run.setText("落标详情");
        run.setBold(true);

        //详情列表
        List<DesignLabelDropResultDetailDto> designLabelDropResultDetailDtoList = deesignLabelDropResultTotalDto.getDesignLabelDropResultDetailDtoList();
        XWPFTable table2 = getXwpfTable(document, designLabelDropResultDetailDtoList, 9);
        XWPFTableRow headerRow2 = table2.getRow(0);
        headerRow2.getCell(0).setText("字段来源");
        headerRow2.getCell(1).setText("映射字段");
        headerRow2.getCell(2).setText("DL4实体英文名");
        headerRow2.getCell(3).setText("DL5属性英文名");
        headerRow2.getCell(4).setText("标准数据元");
        headerRow2.getCell(5).setText("落标状态");
        headerRow2.getCell(6).setText("落标问题描述");
        headerRow2.getCell(7).setText("标准值");
        headerRow2.getCell(8).setText("实际值");

        fillData2(designLabelDropResultDetailDtoList,table2);

        // 保存文档到字节数组输出流
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        document.write(outputStream);

        // 关闭流
        outputStream.close();
        document.close();

        return outputStream;
    }

    @Override
    @Transactional
    public ByteArrayOutputStream exportTechLabelDropResultByWord(LabelDropInspectionQueryParamDto labelDropInspectionQueryParamDto) throws Exception {
        DesignLabelDropResultTotalDto deesignLabelDropResultTotalDto = this.getTechLabelDropResult(labelDropInspectionQueryParamDto);
        // 创建文档对象
        XWPFDocument document = new XWPFDocument();

        // 添加标题
        XWPFParagraph title = document.createParagraph();
        title.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun titleRun = title.createRun();
        titleRun.setText("技术落标报告（逻辑模型）");
        titleRun.setBold(true);
        titleRun.setFontSize(16);

        // 添加字段
        XWPFParagraph paragraph = document.createParagraph();
        XWPFRun run = paragraph.createRun();
        run.setText("校验时间："+ LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        run.setBold(true);
        Long assetNumTotal = deesignLabelDropResultTotalDto.getAssetNumTotal();
        Long registerAssetNumTotal = deesignLabelDropResultTotalDto.getRegisterAssetNumTotal();
        String registerAssetRateTotal = deesignLabelDropResultTotalDto.getRegisterAssetRateTotal();
        String labelDropRateTotal = deesignLabelDropResultTotalDto.getLabelDropRateTotal();
        Long modelColumnNumTotal = deesignLabelDropResultTotalDto.getModelColumnNumTotal();
        paragraph = document.createParagraph();
        run = paragraph.createRun();
        run.setText("落标结果   资产总数（DL5）: "+ assetNumTotal + "    已承载DL5: " + registerAssetNumTotal + "    资产覆盖率: " + registerAssetRateTotal
                +"  落标率: " + labelDropRateTotal + "  模型字段数: " + modelColumnNumTotal);
        run.setBold(true);

        //系统列表
        List<DesignLabelDropResultDto> designLabelDropResultDtolist = deesignLabelDropResultTotalDto.getDesignLabelDropResultDtolist();
        XWPFTable table = getXwpfTable(document, designLabelDropResultDtolist, 5);

        XWPFTableRow headerRow = table.getRow(0);
        headerRow.getCell(0).setText("应用系统");
        headerRow.getCell(1).setText("资产数（DL5）");
        headerRow.getCell(2).setText("已承载DL5数");
        headerRow.getCell(3).setText("落标数");
        headerRow.getCell(4).setText("涉及标准元数据个数");

        fillData(designLabelDropResultDtolist,table);

        addEmptyLine(document);
        paragraph = document.createParagraph();
        run = paragraph.createRun();
        run.setText("资产总数清单");
        run.setBold(true);

        //dl5资产列表
        List<DL5AttributeDto> dl5AttributeDtos = deesignLabelDropResultTotalDto.getDl5AttributeDtos();
        XWPFTable table3 = getXwpfTable(document, dl5AttributeDtos, 4);
        XWPFTableRow headerRow3 = table3.getRow(0);
        headerRow3.getCell(0).setText("DL5编码");
        headerRow3.getCell(1).setText("DL5中文名称");
        headerRow3.getCell(2).setText("DL5英文名称");
        headerRow3.getCell(3).setText("是否被引用");
        fillData3(dl5AttributeDtos,table3);

        addEmptyLine(document);
        paragraph = document.createParagraph();
        run = paragraph.createRun();
        run.setText("落标详情");
        run.setBold(true);

        //详情列表
        List<DesignLabelDropResultDetailDto> designLabelDropResultDetailDtoList = deesignLabelDropResultTotalDto.getDesignLabelDropResultDetailDtoList();
        XWPFTable table2 = getXwpfTable(document, designLabelDropResultDetailDtoList, 9);
        XWPFTableRow headerRow2 = table2.getRow(0);
        headerRow2.getCell(0).setText("字段来源");
        headerRow2.getCell(1).setText("映射字段");
        headerRow2.getCell(2).setText("DL4实体英文名");
        headerRow2.getCell(3).setText("DL5属性英文名");
        headerRow2.getCell(4).setText("标准数据元");
        headerRow2.getCell(5).setText("落标状态");
        headerRow2.getCell(6).setText("落标问题描述");
        headerRow2.getCell(7).setText("标准值");
        headerRow2.getCell(8).setText("实际值");

        fillData2(designLabelDropResultDetailDtoList,table2);

        // 保存文档到字节数组输出流
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        document.write(outputStream);

        // 关闭流
        outputStream.close();
        document.close();

        return outputStream;
    }

    /**
     * 添加空行
     */
    private static void addEmptyLine(XWPFDocument document) {
        XWPFParagraph paragraph = document.createParagraph();
        XWPFRun run = paragraph.createRun();
        run.setText("\r\n");
    }

    private static void fillData3(List<DL5AttributeDto> dl5AttributeDtos, XWPFTable table) {
        int k = 1;
        for (DL5AttributeDto dl5AttributeDto : dl5AttributeDtos) {
            XWPFTableRow row = table.getRow(k);

            row.getCell(0).setText(dl5AttributeDto.getdL5Code());
            row.getCell(0).getParagraphs().get(0).setAlignment(ParagraphAlignment.CENTER); // 设置排名单元格内容居中对齐

            row.getCell(1).setText(String.valueOf(dl5AttributeDto.getdL5ChName()));
            row.getCell(1).getParagraphs().get(0).setAlignment(ParagraphAlignment.CENTER);

            row.getCell(2).setText(String.valueOf(dl5AttributeDto.getdL5EnName()));
            row.getCell(2).getParagraphs().get(0).setAlignment(ParagraphAlignment.CENTER);

            row.getCell(3).setText(String.valueOf(dl5AttributeDto.getdL5Status()));
            row.getCell(3).getParagraphs().get(0).setAlignment(ParagraphAlignment.CENTER);

            k++;
        }
    }

    private void fillData2(List<DesignLabelDropResultDetailDto> designLabelDropResultDetailDtoList, XWPFTable table) {
        int k = 1;
        for (DesignLabelDropResultDetailDto designLabelDropResultDetailDto : designLabelDropResultDetailDtoList) {
            XWPFTableRow row = table.getRow(k);
            row.getCell(0).setText(designLabelDropResultDetailDto.getCategoryPath());
            row.getCell(0).getParagraphs().get(0).setAlignment(ParagraphAlignment.CENTER);

            row.getCell(1).setText(designLabelDropResultDetailDto.getMappingColumn());
            row.getCell(1).getParagraphs().get(0).setAlignment(ParagraphAlignment.CENTER);

            row.getCell(2).setText(designLabelDropResultDetailDto.getLogicEntity());
            row.getCell(2).getParagraphs().get(0).setAlignment(ParagraphAlignment.CENTER);

            row.getCell(3).setText(designLabelDropResultDetailDto.getAttribute());
            row.getCell(3).getParagraphs().get(0).setAlignment(ParagraphAlignment.CENTER);

            row.getCell(4).setText(designLabelDropResultDetailDto.getDomainName());
            row.getCell(4).getParagraphs().get(0).setAlignment(ParagraphAlignment.CENTER);

            row.getCell(5).setText(designLabelDropResultDetailDto.getStatus());
            row.getCell(5).getParagraphs().get(0).setAlignment(ParagraphAlignment.CENTER);

            row.getCell(6).setText(designLabelDropResultDetailDto.getDesc());
            row.getCell(6).getParagraphs().get(0).setAlignment(ParagraphAlignment.CENTER);

            row.getCell(7).setText(designLabelDropResultDetailDto.getDomainValue());
            row.getCell(7).getParagraphs().get(0).setAlignment(ParagraphAlignment.CENTER);

            row.getCell(8).setText(designLabelDropResultDetailDto.getColumnValue());
            row.getCell(8).getParagraphs().get(0).setAlignment(ParagraphAlignment.CENTER);

            k++;
        }
    }

    private static void fillData(List<DesignLabelDropResultDto> designLabelDropResultDtolist, XWPFTable table) {
        int k = 1;
        for (DesignLabelDropResultDto designLabelDropResultDto : designLabelDropResultDtolist) {
            XWPFTableRow row = table.getRow(k);

            row.getCell(0).setText(designLabelDropResultDto.getModelCategoryName());
            row.getCell(0).getParagraphs().get(0).setAlignment(ParagraphAlignment.CENTER); // 设置排名单元格内容居中对齐

            row.getCell(1).setText(String.valueOf(designLabelDropResultDto.getAssetNum()));
            row.getCell(1).getParagraphs().get(0).setAlignment(ParagraphAlignment.CENTER);

            row.getCell(2).setText(String.valueOf(designLabelDropResultDto.getRegisterAssetNum()));
            row.getCell(2).getParagraphs().get(0).setAlignment(ParagraphAlignment.CENTER);

            row.getCell(3).setText(String.valueOf(designLabelDropResultDto.getLabelDropNum()));
            row.getCell(3).getParagraphs().get(0).setAlignment(ParagraphAlignment.CENTER);

            row.getCell(4).setText(String.valueOf(designLabelDropResultDto.getDomainNum()));
            row.getCell(4).getParagraphs().get(0).setAlignment(ParagraphAlignment.CENTER);

            k++;
        }
    }


    private static <T> XWPFTable getXwpfTable(XWPFDocument document, List<T> list, int cols) {
        // 添加表格
        int rows = list.size() + 1;//加表头
        //int cols = 4;
        XWPFTable table = document.createTable(rows, cols);
        // 设置表格的整体宽度
        int tableWidth = Units.toEMU(500);  // 设置表格宽度为 500 磅
        table.setWidth(tableWidth);

        // 设置表格样式
        table.getCTTbl().addNewTblPr().addNewTblW().setType(STTblWidth.DXA);
        table.getCTTbl().getTblPr().addNewTblBorders().addNewBottom().setVal(STBorder.SINGLE);
        table.getCTTbl().getTblPr().addNewTblBorders().addNewTop().setVal(STBorder.SINGLE);
        table.getCTTbl().getTblPr().addNewTblBorders().addNewInsideH().setVal(STBorder.SINGLE);
        table.getCTTbl().getTblPr().addNewTblBorders().addNewInsideV().setVal(STBorder.SINGLE);
        return table;
    }



    public ResponseEntity<byte[]> generalResponseEntityByFile(File file) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        String realName = file.getName();

        try {
            realName = URLEncoder.encode(realName, "UTF-8");
            realName = realName.replace("+", "%20");
        } catch (Exception var12) {
            logger.warn("Failed to convert template file name");
        }

        headers.setContentDispositionFormData("attachment", realName);
        ResponseEntity<byte[]> result = null;

        try {
            result = new ResponseEntity(FileUtils.readFileToByteArray(file), headers, HttpStatus.OK);
        } catch (Exception var10) {
            Exception e = var10;
            throw new AndorjRuntimeException(e.getLocalizedMessage());
        } finally {
            file.delete();
        }

        return result;
    }

    /**
     * 核验数据类型
     * @param dataType
     * @param domainDataType
     * @return
     */
    private Boolean checkDataType(String dataType, String domainDataType, List<DesignLabelDropResultDetailDto> resultDetailDtos,List<DesignLabelDropResultDetailExcelDto> designLabelDropResultDetailExcelDtos,
                                  DesignLabelDropResultDetailDto resultDetailDto) {
        String BigDecimalPro = DynamicConfigurations.INSTANCE.getPropertyValue("configurable.datatypes.BigDecimal");
        String BooleanPro = DynamicConfigurations.INSTANCE.getPropertyValue("configurable.datatypes.Boolean");
        String DatePro = DynamicConfigurations.INSTANCE.getPropertyValue("configurable.datatypes.Date");
        String StringPro = DynamicConfigurations.INSTANCE.getPropertyValue("configurable.datatypes.String");
        String BinaryPro = DynamicConfigurations.INSTANCE.getPropertyValue("configurable.datatypes.Binary");

        if(StringUtils.isBlank(BinaryPro)){
            BinaryPro = DynamicConfigurations.INSTANCE.getPropertyValue("configurable.datatypes.binary");
        }


        List<String> bigDecimalList = new ArrayList<>(Arrays.asList(BigDecimalPro.split("\\."))); //数值型
        List<String> booleanList = new ArrayList<>(Arrays.asList(BooleanPro.split(",")));//布尔型
        List<String> dateList = new ArrayList<>(Arrays.asList(DatePro.split(",")));//日期型
        List<String> stringList = new ArrayList<>(Arrays.asList(StringPro.split(",")));//字符型
        List<String> binaryList = new ArrayList<>(Arrays.asList(BinaryPro.split(",")));//字符型


        stringList.add("字符串");
        stringList.add("文本");
        stringList.add("STRING");
        stringList.add("string");
        dateList.add("日期");
        bigDecimalList.add("数值");

        logger.info("bigDecimalList:"+ bigDecimalList);
        logger.info("booleanList:"+ booleanList);
        logger.info("dateList:"+ dateList);
        logger.info("stringList:"+ stringList);
        logger.info("binaryList:"+ binaryList);

        if ((stringList.contains(dataType) && stringList.contains(domainDataType)
                || (stringList.contains(domainDataType) && StringUtils.startsWith(dataType,"VARCHAR"))
                || (StringUtils.startsWith(domainDataType,"VARCHAR") && StringUtils.startsWith(dataType,"VARCHAR")))){
            return true;
        }

        if (binaryList.contains(dataType) && binaryList.contains(domainDataType)){
            return true;
        }

        if (booleanList.contains(dataType) && booleanList.contains(domainDataType)){
            return true;
        }

        if (dateList.contains(dataType) && dateList.contains(domainDataType)){
            return true;
        }

        if (bigDecimalList.contains(dataType) && bigDecimalList.contains(domainDataType)){
            return true;
        }


        if (dataType.equals(domainDataType)){
            return true;
        }else {
            //sb.append("数据类型不匹配,数据标准数据类型为").append(domainDataType).append(",字段数据类型为").append(dataType).append(";");
            DesignLabelDropResultDetailDto resultDetailDto1 = new DesignLabelDropResultDetailDto();
            BeanUtils.copyProperties(resultDetailDto,resultDetailDto1);
            resultDetailDto1.setDesc("数据类型不匹配");
            resultDetailDto1.setStatus("失败");
            resultDetailDto1.setDomainValue(domainDataType);
            resultDetailDto1.setColumnValue(dataType);
            resultDetailDtos.add(resultDetailDto1);
            DesignLabelDropResultDetailExcelDto designLabelDropResultDetailExcelDto = new DesignLabelDropResultDetailExcelDto(resultDetailDto);
            designLabelDropResultDetailExcelDto.setDesc("数据类型不匹配");
            designLabelDropResultDetailExcelDto.setStatus("失败");
            designLabelDropResultDetailExcelDto.setDomainValue(domainDataType);
            designLabelDropResultDetailExcelDto.setColumnValue(dataType);
            designLabelDropResultDetailExcelDtos.add(designLabelDropResultDetailExcelDto);
            return false;
        }

    }

    @Autowired
    private ModelCategoryTechLabelRepository categoryTechLabelRepository;

    @Override
    @Transactional
    public Integer getTechLabelDropModelCategoryCount() {
        Integer result = 0;

        List<BaseModelCategory> modelCategories = modelCategoryService.getAllBaseModelCategories();
        for (BaseModelCategory modelCategory : modelCategories) {
            ModelCategoryTechLabel modelCategoryTechLabel = categoryTechLabelRepository.findByModelCategoryId(modelCategory.getId());
            if(modelCategoryTechLabel != null){
                if(!Strings.isEmpty(modelCategoryTechLabel.getLabelDropRateTotal()) && !modelCategoryTechLabel.getLabelDropRateTotal().equals("0%")){
                    result++;
                }
            }else {
                LabelDropInspectionQueryParamDto dto = new LabelDropInspectionQueryParamDto();
                dto.setModelCategoryId(modelCategory.getId());

                DesignLabelDropResultTotalDto techLabelDropResult = this.getTechLabelDropResult(dto);
                if(!techLabelDropResult.getLabelDropRateTotal().equals("0%")){
                    result++;

                    ModelCategoryTechLabel categoryTechLabel = new ModelCategoryTechLabel();
                    categoryTechLabel.setModelCategoryId(modelCategory.getId());
                    categoryTechLabel.setLabelDropRateTotal(techLabelDropResult.getLabelDropRateTotal());
                    categoryTechLabelRepository.save(categoryTechLabel);
                }
            }
        }

        return result;
    }
}
