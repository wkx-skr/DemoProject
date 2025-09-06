package com.datablau.data.asset.service.impl;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.model.common.api.MessageService;
import com.datablau.catalog.dto.CommonCatalogDto;
import com.datablau.catalog.enums.EnumAssetsCatalogStatus;
import com.datablau.catalog.enums.EnumCatalogPublicType;
import com.datablau.catalog.enums.EnumStructureType;
import com.datablau.catalog.enums.EnumSupportType;
import com.datablau.catalog.jpa.entity.CommonCatalog;
import com.datablau.catalog.jpa.entity.CommonCatalogStructure;
import com.datablau.catalog.jpa.entity.CommonCatalogStructureDetail;
import com.datablau.catalog.jpa.entity.CommonCatalogType;
import com.datablau.catalog.jpa.repository.CommonCatalogStructureDetailRepository;
import com.datablau.catalog.jpa.repository.CommonCatalogStructureRepository;
import com.datablau.catalog.jpa.repository.CommonCatalogTypeRepository;
import com.datablau.data.asset.api.DataAssetsCatalogAuthService;
import com.datablau.data.asset.api.DataAssetsCatalogChangeRecordService;
import com.datablau.data.asset.api.DataAssetsCatalogElasticsearchService;
import com.datablau.data.asset.api.DataAssetsCatalogService;
import com.datablau.data.asset.api.DataAssetsCatalogStructureService;
import com.datablau.data.asset.api.DataAssetsCatalogUdpService;
import com.datablau.data.asset.dto.CatalogUdpEntryDto;
import com.datablau.data.asset.dto.DataAssetsCatalogDto;
import com.datablau.data.asset.dto.DataAssetsCatalogUdpDto;
import com.datablau.data.asset.enums.EnumApplyType;
import com.datablau.data.asset.enums.EnumAuthType;
import com.datablau.data.asset.enums.EnumMandateType;
import com.datablau.data.asset.enums.EnumVersionType;
import com.datablau.data.asset.jpa.entity.CatalogExt;
import com.datablau.data.asset.jpa.entity.DataAssets;
import com.datablau.data.asset.jpa.repository.CatalogExtRepository;
import com.datablau.data.asset.jpa.repository.CommonCatalogExtRepository;
import com.datablau.data.asset.jpa.repository.DataAssetExtRepository;
import com.datablau.data.asset.jpa.repository.DataAssetsCatalogRepository;
import com.datablau.data.asset.jpa.repository.DataAssetsRepository;
import com.datablau.data.asset.utils.KafkaLogUtils;
import com.datablau.data.common.util.JsonUtils;
import com.datablau.dataasset.dto.CatalogChangeDto;
import com.datablau.dataasset.dto.CatalogChangeRecordDto;
import com.datablau.dataasset.dto.CatalogVersionRecord;
import com.datablau.dataasset.dto.DataAssetsCatalogStructureDto;
import com.datablau.dataasset.utils.IpUtil;
import com.datablau.domain.management.api.DomainService;
import com.datablau.domain.management.dto.DomainDto;
import com.datablau.project.api.RemoteDataAssetExtendService;
import com.datablau.project.api.dto.BatchApplyDetailRemoteDto;
import com.datablau.project.api.dto.BatchApplyRemoteDto;
import com.datablau.project.dto.CatalogResDto;
import com.datablau.project.dto.L4Dto;
import com.datablau.project.dto.L5Dto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import org.apache.commons.lang.time.DateFormatUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import cn.hutool.http.HttpUtil;
import com.datablau.data.asset.dto.DopDataSyncDto;
import com.datablau.data.asset.dto.Dl1BusinessDomainDto;
import com.datablau.data.asset.dto.Dl2SubjectDomainDto;
import com.datablau.data.asset.dto.Dl3BusinessObjectDto;

/**
 * @author: hxs
 * @date: 2025/4/7 18:15
 */
@Service("remoteDataAssetExtendService")
public class RemoteDataAssetExtendServiceImpl implements RemoteDataAssetExtendService {
    public static final Logger LOGGER = LoggerFactory.getLogger(RemoteDataAssetExtendServiceImpl.class);
    @Autowired
    DataAssetExtRepository extRepository;
    @Autowired
    DataAssetsCatalogRepository catalogRepository;
    @Autowired
    DataAssetsCatalogUdpService udpService;
    @Autowired
    CommonCatalogStructureDetailRepository detailRepository;
    @Autowired
    CommonCatalogStructureRepository structureRepository;
    @Autowired
    CommonCatalogExtRepository commonCatalogExtRepository;
    @Autowired
    DataAssetsCatalogAuthService authService;
    @Autowired
    DataAssetsCatalogElasticsearchService elasticsearchService;
    @Autowired
    CommonCatalogTypeRepository typeRepository;
    @Autowired
    MessageService msgService;
    @Autowired
    DataAssetsCatalogChangeRecordService changeRecordService;
    @Autowired
    CatalogExtRepository catalogExtRepository;
    @Autowired
    DataAssetsCatalogService dataAssetsCatalogService;
    @Autowired
    DataAssetsCatalogChangeRecordService dataAssetsCatalogChangeRecordService;
    @Autowired
    DataAssetsCatalogStructureService structureService;
    @Autowired
    private DataAssetsCatalogExtendServiceImpl dataAssetsCatalogExtendService;
    @Autowired
    protected DataAssetsRepository assetsRepository;
    @Autowired
    private KafkaLogUtils kafkaLogUtils;

    @Autowired
    protected DomainService domainService;

    @Value("${datablau.dop.dopUrl}")
    private String dopUrl;
    @Value("${datablau.dop.enable}")
    private Boolean dopSyncEnable;

    @Override
    public String test() {
        System.out.println("xxxxxxxxxxxxxxxxxxxxx");
        return "测试远程数据资产。。。。";
    }

    @Override
    public HashMap<Long, CatalogResDto> getCatalogInfoByObjId(List<String> objectIds) {
        List<DataAssets> dataAssets = extRepository.findByObjectIds(objectIds, Arrays.asList(EnumSupportType.TABLE, EnumSupportType.DATA_OBJECT));
        if (CollectionUtils.isEmpty(dataAssets)) {
            return new HashMap<>();
        }
        HashMap<String, Long> objIdCatalogMap = new HashMap<>();
        for (DataAssets dataAsset : dataAssets) {
            String itemId = dataAsset.getItemId();
            Long catalogId = objIdCatalogMap.get(itemId);
            if (catalogId == null) {
                objIdCatalogMap.put(itemId, dataAsset.getCatalogId());
            }
        }
        //返回元数据对应的要返回资产目录的数据
        HashMap<Long, CatalogResDto> res = new HashMap<>();
        //查询元数据（表+字段）对应的所有的资产目录
        List<CommonCatalog> catalogs = catalogRepository.findByIdIn(objIdCatalogMap.values());
        Map<Long, CommonCatalog> catalogsMap = catalogs.stream().collect(Collectors.toMap(CommonCatalog::getId, a -> a));
        for (Map.Entry<String, Long> entry : objIdCatalogMap.entrySet()) {
            String objectId = entry.getKey();
            CommonCatalog catalog = catalogsMap.get(entry.getValue());
            List<Long> parentIds = Arrays.asList(catalog.getCatalogPath().split("/"))
                    .stream().map(Long::parseLong).toList();
            Map<Long, CommonCatalog> parentCatalogs = catalogRepository.findByIdIn(parentIds)
                    .stream().collect(Collectors.toMap(CommonCatalog::getId, a -> a));

            CatalogResDto catalogResDto = new CatalogResDto();
            catalogResDto.setDataSteward(catalog.getButler());
            if (parentIds.size() == 4 || parentIds.size() == 5) {
                String L1Name = this.getCatalogName(parentIds, parentCatalogs, 1);
                String L2Name = this.getCatalogName(parentIds, parentCatalogs, 2);
                String L3Name = this.getCatalogName(parentIds, parentCatalogs, 3);
                catalogResDto.setL1Name(L1Name);
                catalogResDto.setL2Name(L2Name);
                catalogResDto.setL3Name(L3Name);
                if (parentIds.size() == 4) {
                    catalogResDto.setL4Name(catalog.getName());
                }
                if (parentIds.size() == 5) {
                    String L4Name = this.getCatalogName(parentIds, parentCatalogs, 4);
                    catalogResDto.setL4Name(L4Name);
                }
                //udp
                List<CatalogUdpEntryDto> udps = udpService.getObjectUdpByCatalogId(catalog.getCatalogTypeId(), catalog.getId());
                for (CatalogUdpEntryDto udp : udps) {
                    if ("数据主官".equals(udp.getName())) {
                        catalogResDto.setDataMaster(udp.getValue());
                    }
                }
            }
            res.put(Long.valueOf(objectId), catalogResDto);
        }

        System.out.println();
        return res;
    }

    @Override
    public List<Map<String, Object>> getDomainByColumnId(Set<Long> columnIds) {
        List<Map<String, Object>> res = new ArrayList<>();
        List<String> columnIdsStr = columnIds.stream().map(Object::toString).toList();
        List<DataAssets> dataAssets = extRepository.findByObjectIds(columnIdsStr, Arrays.asList(EnumSupportType.DATA_OBJECT));
        if (CollectionUtils.isEmpty(dataAssets)) {
            return res;
        }

        HashMap<String, List<Long>> objIdCatalogMap0 = new HashMap<>();
        for (DataAssets dataAsset : dataAssets) {
            String itemId = dataAsset.getItemId();
            List<Long> cataIds = objIdCatalogMap0.computeIfAbsent(itemId, k -> new ArrayList<>());
            cataIds.add(dataAsset.getCatalogId());
        }

        ArrayList<Long> catalogIds = new ArrayList<>();
        for (List<Long> cataIds : objIdCatalogMap0.values()) {
            catalogIds.addAll(cataIds);
        }
        List<CommonCatalog> catalogs = catalogRepository.findByIdIn(catalogIds);

        Map<Long, CommonCatalog> catalogsMap = catalogs.stream().collect(Collectors.toMap(CommonCatalog::getId, a -> a));
        for (Map.Entry<String, List<Long>> entry : objIdCatalogMap0.entrySet()) {
            String objectId = entry.getKey();
            //存在脏数据如果一个资产绑了多个目录，只取第一个存在的目录
            CommonCatalog commonCatalog = null;
            for (Long cataId : entry.getValue()) {
                CommonCatalog catalog = catalogsMap.get(cataId);
                if (catalog != null) {
                    commonCatalog = catalog;
                    break;
                }
            }
            if (commonCatalog != null) {
                CatalogExt catalogExt = catalogExtRepository.findByCatalogId(commonCatalog.getId());
                if (catalogExt == null) {
                    continue;
                }
                Map<String, Object> map = new HashMap<>();
                map.put("columnId", Long.valueOf(objectId));
                map.put("domainId", catalogExt.getDomainId());
                map.put("isNull", catalogExt.getsNull());
                res.add(map);
            }
        }
//        HashMap<String, Long> objIdCatalogMap = new HashMap<>();
//        for (DataAssets dataAsset : dataAssets) {
//            String itemId = dataAsset.getItemId();
//            Long catalogId = objIdCatalogMap.get(itemId);
//            if(catalogId == null){
//                objIdCatalogMap.put(itemId, dataAsset.getCatalogId());
//            }
//        }
//        List<CommonCatalog> catalogs = catalogRepository.findByIdIn(objIdCatalogMap.values());
//        Map<Long, CommonCatalog> catalogsMap = catalogs.stream().collect(Collectors.toMap(CommonCatalog::getId, a -> a));
//        for (Map.Entry<String, Long> entry : objIdCatalogMap.entrySet()) {
//            String objectId = entry.getKey();
//            CommonCatalog catalog = catalogsMap.get(entry.getValue());
//            CatalogExt catalogExt = catalogExtRepository.findByCatalogId(catalog.getId());
//            if(catalogExt == null){
//                continue;
//            }
//            Map<String, Object> map = new HashMap<>();
//            map.put("columnId", objectId);
//            map.put("domainId", catalogExt.getDomainId());
//            map.put("isNull", catalogExt.getsNull());
//            res.add(map);
//        }
        return res;
    }

    private String getCatalogName(List<Long> parentIds, Map<Long, CommonCatalog> parentCatalogs, int index) {
        CommonCatalog catalog = parentCatalogs.get(parentIds.get(index));
        if (catalog != null) {
            return catalog.getName();
        }
        return "";
    }

    @Transactional
    @Override
    public void syncL4AndL5(Long l3Id, String username, List<L4Dto> l4DtoList, String s) {
//        if (CollectionUtils.isEmpty(l4DtoList)) {
//            LOGGER.info("无目录可同步");
//            return;
//        }
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            LOGGER.info("l3id:{}, username:{}, l4s:{}", l3Id, username, objectMapper.writeValueAsString(l4DtoList));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        ArrayList<String> domainIds = new ArrayList<>();
        for (L4Dto l4Dto : l4DtoList) {
            for (L5Dto l5Child : l4Dto.getL5Children()) {
                domainIds.add(l5Child.getDomainId());
            }
        }
        List<DomainDto> domains = domainService.getDomainsByDomainIds(domainIds);
        Map<String, DomainDto> domainMap = domains.stream().collect(Collectors.toMap(DomainDto::getDomainId, a -> a));

        //处理删除逻辑
        this.offlineByL4delete(l3Id, l4DtoList, username);

        for (L4Dto l4Dto : l4DtoList) {
            CommonCatalog byCode = commonCatalogExtRepository.findByCode(l4Dto.getCode());
            //新增
            if (byCode == null) {
                CommonCatalog l4Catalog = this.getCatalogByL4(l4Dto);
                CommonCatalog l4Save = this.saveCatalog(l4Catalog);
                this.saveL4CatalogExt(l4Save.getId(), l4Dto,username);
                for (L5Dto l5Child : l4Dto.getL5Children()) {
                    CommonCatalog l5Catalog = this.getCatalogByL5(l5Child, l4Save);
                    CommonCatalog l5Save = this.saveCatalog(l5Catalog);
                    this.saveL5CatalogExt(l5Save.getId(), l5Child, domainMap);
                }
            } else {
                //修改
                byCode.setName(l4Dto.getName());
                byCode.setEnglishName(l4Dto.getEnglishName());
                byCode.setModifyTime(DateFormatUtils.format(new Date(), "yyyy-MM-dd HH:mm:ss"));
                this.updateL4CatalogExt(byCode.getId(), l4Dto);
                this.updateCatalog(byCode);
                for (L5Dto l5Child : l4Dto.getL5Children()) {
                    this.dohandleL5(l5Child, byCode, domainMap);
                }
            }
        }
//        this.syncChildNode(l3Id);
        LOGGER.info("同步目录成功");
    }

    @Override
    public void applyAssets(BatchApplyRemoteDto batchApplyRemoteDto, String state, String username) {
        //
        if ("发布".equals(batchApplyRemoteDto.getApplyOperation()) && 2 == Integer.valueOf(state)){
            List<BatchApplyDetailRemoteDto> details = batchApplyRemoteDto.getDetails();
            Set<Long> ids = details.stream()
                    .map(BatchApplyDetailRemoteDto::getNeId)
                    .filter(Objects::nonNull)
                    .map(Long::valueOf)
                    .collect(Collectors.toSet());
            dataAssetsCatalogExtendService.updateCatalogStatus(ids, EnumAssetsCatalogStatus.PUBLISHED, LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            for (Long id : ids) {
                CommonCatalog commonCatalog = this.dataAssetsCatalogService.getById(id);
                DataAssetsCatalogStructureDto dataAssetsCatalogStructure = this.structureService.findByCatalog(commonCatalog);
                EnumAssetsCatalogStatus toStatus = EnumAssetsCatalogStatus.PUBLISHED;
                this.dataAssetsCatalogChangeRecordService.writerVersionOfCatalog(Collections.singleton(id), "", toStatus, EnumApplyType.MANUAL, username, dataAssetsCatalogStructure, EnumVersionType.PUBLISHED);
            }

        }else if ("发布".equals(batchApplyRemoteDto.getApplyOperation()) && 3 == Integer.valueOf(state)){
            List<BatchApplyDetailRemoteDto> details = batchApplyRemoteDto.getDetails();
            Set<Long> ids = details.stream()
                    .map(BatchApplyDetailRemoteDto::getNeId)
                    .filter(Objects::nonNull)
                    .map(Long::valueOf)
                    .collect(Collectors.toSet());
            this.dataAssetsCatalogExtendService.updateCatalogStatus(ids, EnumAssetsCatalogStatus.UNPUBLISHED, "");
        }else if ("变更".equals(batchApplyRemoteDto.getApplyOperation()) && 2 == Integer.valueOf(state)){
            // 通过
            List<BatchApplyDetailRemoteDto> details = batchApplyRemoteDto.getDetails();
            for (BatchApplyDetailRemoteDto detail : details) {
                String neId = detail.getNeId();
                String neData = detail.getNeData();
                CatalogChangeDto object = JsonUtils.toObject(neData, CatalogChangeDto.class);
                dataAssetsCatalogExtendService.updateCatalog(object, EnumAssetsCatalogStatus.PUBLISHED);
                dataAssetsCatalogExtendService.updateCatalogStatus(Sets.newHashSet(new Long[]{Long.valueOf(neId)}), EnumAssetsCatalogStatus.PUBLISHED);
            }
        }else if ("变更".equals(batchApplyRemoteDto.getApplyOperation()) && 3 == Integer.valueOf(state)){
            // 变更没有通过直接修改状态
            List<BatchApplyDetailRemoteDto> details = batchApplyRemoteDto.getDetails();
            Set<Long> ids = details.stream()
                    .map(BatchApplyDetailRemoteDto::getNeId)
                    .filter(Objects::nonNull)
                    .map(Long::valueOf)
                    .collect(Collectors.toSet());
            this.dataAssetsCatalogExtendService.updateCatalogStatus(ids, EnumAssetsCatalogStatus.PUBLISHED, "");
        }
     else if ("废弃".equals(batchApplyRemoteDto.getApplyOperation()) && 2 == Integer.valueOf(state)){
        List<BatchApplyDetailRemoteDto> details = batchApplyRemoteDto.getDetails();
        Set<Long> ids = details.stream()
                .map(BatchApplyDetailRemoteDto::getNeId)
                .filter(Objects::nonNull)
                .map(Long::valueOf)
                .collect(Collectors.toSet());
            dataAssetsCatalogExtendService.updateCatalogStatus(ids, EnumAssetsCatalogStatus.OFFLINE, LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        for (Long id : ids) {
            CommonCatalog commonCatalog = this.dataAssetsCatalogService.getById(id);
            DataAssetsCatalogStructureDto dataAssetsCatalogStructure = this.structureService.findByCatalog(commonCatalog);
            EnumAssetsCatalogStatus toStatus = EnumAssetsCatalogStatus.OFFLINE;
            this.dataAssetsCatalogExtendService.updateCatalogStatus(ids, toStatus, "");
          //  this.dataAssetsCatalogChangeRecordService.writerVersionOfCatalog(Collections.singleton(id), "", toStatus, EnumApplyType.MANUAL, username, dataAssetsCatalogStructure, EnumVersionType.PUBLISHED);
        }

    }else if ("废弃".equals(batchApplyRemoteDto.getApplyOperation()) && 3 == Integer.valueOf(state)){
        List<BatchApplyDetailRemoteDto> details = batchApplyRemoteDto.getDetails();
        Set<Long> ids = details.stream()
                .map(BatchApplyDetailRemoteDto::getNeId)
                .filter(Objects::nonNull)
                .map(Long::valueOf)
                .collect(Collectors.toSet());
        this.dataAssetsCatalogService.updateCatalogStatus(ids, EnumAssetsCatalogStatus.PUBLISHED, "");
    }

    }

    @Override
    public void updateDopDate(Map<Long,String> assetsIds,String dopId,String batchId) {
        List<CommonCatalog> allByIds = dataAssetsCatalogService.findAllByIds(assetsIds.keySet());
        
        if (CollectionUtils.isEmpty(allByIds)) {
            LOGGER.warn("未找到指定的目录信息，assetsIds: {}", assetsIds);
            return;
        }
        
        // 通过catalogPath解析出所有需要的目录ID，构建完整的层级结构
        Set<Long> allRequiredCatalogIds = new HashSet<>();
        
        for (CommonCatalog catalog : allByIds) {
            if (catalog.getCatalogPath() != null && !catalog.getCatalogPath().isEmpty()) {
                String[] pathIds = catalog.getCatalogPath().split("/");
                // 从索引1开始，跳过0（因为0是固定值）
                for (int i = 1; i < pathIds.length; i++) {
                    try {
                        Long pathId = Long.parseLong(pathIds[i]);
                        allRequiredCatalogIds.add(pathId);
                    } catch (NumberFormatException e) {
                        LOGGER.warn("目录路径解析失败: {}", pathIds[i]);
                    }
                }
            }
            // 添加当前目录ID
            allRequiredCatalogIds.add(catalog.getId());
        }
        
        // 查询所有需要的目录信息
        List<CommonCatalog> allCatalogs = dataAssetsCatalogService.findAllByIds(new ArrayList<>(allRequiredCatalogIds));
        
        // 构建DL1、DL2、DL3层级结构
        List<Dl1BusinessDomainDto> dl1List = buildDl1BusinessDomainList(allCatalogs, assetsIds);
        
        // 构建DOP数据同步DTO
        DopDataSyncDto dopDataSyncDto = new DopDataSyncDto(dopId, batchId, dl1List);
        
        // 调用DOP接口更新目录信息
        try {
            callDopCatalogUpdateApi(dopDataSyncDto);
            LOGGER.info("成功调用DOP接口更新目录信息，共处理{}个DL1业务域", dl1List.size());
        } catch (Exception e) {
            LOGGER.error("调用DOP接口更新目录信息失败", e);
            throw new RuntimeException("调用DOP接口失败: " + e.getMessage(), e);
        }
    }

    @Override
    public Map<String, List<String>> getUsernameByDomainIds(List<String> domainIds) {
        Map<String, List<String>> result = new HashMap<>();
        //获取到当前被引用的标准
        List<CatalogExt> byDomainIdIn = catalogExtRepository.findByDomainIdIn(domainIds);
        if (CollectionUtils.isEmpty(byDomainIdIn)){
            return result;
        }
        // 获取到资产目录的id
        Map<String, List<CatalogExt>> collect = byDomainIdIn.stream().collect(Collectors.groupingBy(CatalogExt::getDomainId));
        collect.forEach((k,v)->{
            Set<Long> catalogIds = v.stream().map(CatalogExt::getCatalogId).collect(Collectors.toSet());
            List<CommonCatalog> catalogs = catalogRepository.findByIdIn(catalogIds);
            List<Long> parentIds = catalogs.stream()
                    .map(CommonCatalog::getParentId)
                    .filter(Objects::nonNull) // 过滤掉null值
                    .collect(Collectors.toList());
            List<CatalogExt> byCatalogIdIn = catalogExtRepository.findByCatalogIdIn(parentIds);
            if (!CollectionUtils.isEmpty(byCatalogIdIn)){
                List<String> usernames = byCatalogIdIn.stream()
                        .map(CatalogExt::getApplyUsername)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toList());
                result.put(k,usernames);
            }
        }
        );

        return result;
    }


    @Override
    public Map<Long, String> getCommonCatalogType(List<Long> typeIds) {
        List<CommonCatalogType> catalogTypes = typeRepository.findAllById(typeIds);
        Map<Long, String> typeMap = catalogTypes.stream().collect(Collectors.toMap(CommonCatalogType::getId, CommonCatalogType::getName, (x1, x2) -> x1));
        return typeMap;
    }

    @Override
    public List<CommonCatalogDto> getCommonCatalogDtos(Collection<Long> catalogIds) {
        List<CommonCatalog> commonCatalogs = dataAssetsCatalogService.findAllByIds(catalogIds);
        List<CommonCatalogDto> commonCatalogDtos = Lists.newArrayList();

        for (CommonCatalog commonCatalog : commonCatalogs) {
            CommonCatalogDto commonCatalogDto = new CommonCatalogDto();
            BeanUtils.copyProperties(commonCatalog, commonCatalogDto);
            commonCatalogDtos.add(commonCatalogDto);
        }
        return commonCatalogDtos;
    }

    /**
     * 构建DL1业务域列表
     */
    private List<Dl1BusinessDomainDto> buildDl1BusinessDomainList(List<CommonCatalog> catalogs, Map<Long,String> assetsIds) {
        // 按目录级别分组
        Map<Integer, List<CommonCatalog>> catalogsByLevel = catalogs.stream()
                .collect(Collectors.groupingBy(CommonCatalog::getLevel));
        
        List<Dl1BusinessDomainDto> dl1List = new ArrayList<>();
        
        // 处理DL1级别的目录（业务域）
        List<CommonCatalog> dl1Catalogs = catalogsByLevel.get(1);
        if (dl1Catalogs != null) {
            for (CommonCatalog dl1Catalog : dl1Catalogs) {
                Dl1BusinessDomainDto dl1Dto = new Dl1BusinessDomainDto();
                dl1Dto.setDl1Code(dl1Catalog.getCode());
                dl1Dto.setDl1CnName(dl1Catalog.getName());
                dl1Dto.setDl1EnName(dl1Catalog.getEnglishName());
                dl1Dto.setDl1Desc(dl1Catalog.getComment());
                // 根据Map中的状态值设置状态，如果没有包含则默认为0
                dl1Dto.setDl1Status(getStatusFromMap(dl1Catalog.getId(), assetsIds));
                
                // 构建DL2主题域列表
                List<Dl2SubjectDomainDto> dl2List = buildDl2SubjectDomainList(dl1Catalog, catalogs, assetsIds);
                dl1Dto.setDl2List(dl2List);
                
                dl1List.add(dl1Dto);
            }
        }
        
        return dl1List;
    }
    
    /**
     * 构建DL2主题域列表
     */
    private List<Dl2SubjectDomainDto> buildDl2SubjectDomainList(CommonCatalog dl1Catalog, List<CommonCatalog> catalogs, Map<Long,String> assetsIds) {
        List<Dl2SubjectDomainDto> dl2List = new ArrayList<>();
        
        // 查找属于该DL1的DL2目录
        for (CommonCatalog catalog : catalogs) {
            if (catalog.getLevel() == 2 && dl1Catalog.getId().equals(catalog.getParentId())) {
                Dl2SubjectDomainDto dl2Dto = new Dl2SubjectDomainDto();
                dl2Dto.setDl2Code(catalog.getCode());
                dl2Dto.setDl2CnName(catalog.getName());
                dl2Dto.setDl2EnName(catalog.getEnglishName());
                dl2Dto.setDl2Desc(catalog.getComment());
                // 根据Map中的状态值设置状态，如果没有包含则默认为0
                dl2Dto.setDl2Status(getStatusFromMap(catalog.getId(), assetsIds));
                
                // 构建DL3业务对象列表
                List<Dl3BusinessObjectDto> dl3List = buildDl3BusinessObjectList(catalog, catalogs, assetsIds);
                dl2Dto.setDl3List(dl3List);
                
                dl2List.add(dl2Dto);
            }
        }
        
        return dl2List;
    }
    
    /**
     * 构建DL3业务对象列表
     */
    private List<Dl3BusinessObjectDto> buildDl3BusinessObjectList(CommonCatalog dl2Catalog, List<CommonCatalog> catalogs, Map<Long,String> assetsIds) {
        List<Dl3BusinessObjectDto> dl3List = new ArrayList<>();
        
        // 查找属于该DL2的DL3目录
        for (CommonCatalog catalog : catalogs) {
            if (catalog.getLevel() == 3 && dl2Catalog.getId().equals(catalog.getParentId())) {
                Dl3BusinessObjectDto dl3Dto = new Dl3BusinessObjectDto();
                dl3Dto.setDl3Code(catalog.getCode());
                dl3Dto.setDl3CnName(catalog.getName());
                dl3Dto.setDl3EnName(catalog.getEnglishName());
                dl3Dto.setDl3Desc(catalog.getComment());
                // 根据Map中的状态值设置状态，如果没有包含则默认为0
                dl3Dto.setDl3Status(getStatusFromMap(catalog.getId(), assetsIds));
                
                dl3List.add(dl3Dto);
            }
        }
        
        return dl3List;
    }
    
    /**
     * 从Map中获取状态值，如果没有包含则默认为0
     * 发布=1，变更=2，废弃=3
     */
    private Integer getStatusFromMap(Long catalogId, Map<Long,String> assetsIds) {
        String status = assetsIds.get(catalogId);
        if (status == null) {
            return 0; // 默认状态
        }
        
        // 中文状态值映射
        switch (status) {
            case "发布":
                return 1;
            case "变更":
                return 2;
            case "废弃":
                return 3;
            default:
                LOGGER.warn("未知的状态值: {}, catalogId: {}", status, catalogId);
                return 0; // 未知状态时返回默认值
        }
    }
    
    /**
     * 从Map中获取状态值，如果没有包含则默认为"停用"
     * 发布=1，变更=2，废弃=3
     */
    private String getStatusStringFromMap(Long catalogId, Map<Long,String> assetsIds) {
        String status = assetsIds.get(catalogId);
        if (status == null) {
            return "停用"; // 默认状态
        }
        
        // 直接返回中文状态值，如果没有包含则返回默认值
        return status;
    }
    
    /**
     * 调用DOP接口更新目录信息
     */
    private void callDopCatalogUpdateApi(DopDataSyncDto dopDataSyncDto) {
        // 从配置中获取DOP接口URL
        String dopUrl = getDopUrl();
        String apiUrl = dopUrl + "/api/data/openApi/syncDataArch"; // 根据实际接口路径调整
        
        // 设置请求头
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");
        
        try {
            // 使用HttpUtil进行POST请求，参考SynEtlJob的实现方式
//            if (dopSyncEnable){
//                LOGGER.info("同步流程未启动");
//                return;
//            }
            LOGGER.info("开始调用 url"+ apiUrl);
            String string = new ObjectMapper().writeValueAsString(dopDataSyncDto).toString();
            LOGGER.info("请求内容:{}"+string);
            String responseStr = HttpUtil.createPost(apiUrl)
                    .addHeaders(headers)
                    .body(new ObjectMapper().writeValueAsString(dopDataSyncDto))
                    .execute()
                    .body();
            
            LOGGER.info("DOP接口调用成功，响应: {}", responseStr);
            
            // 解析响应结果
            if (responseStr != null) {
                ObjectMapper objectMapper = new ObjectMapper();
                Map<String, Object> response = objectMapper.readValue(responseStr, Map.class);
                
                // 检查响应状态
                Object status = response.get("status");
                if (status == null || !"200".equals(status.toString())) {
                    String errorMsg = response.get("message") != null ? response.get("message").toString() : "未知错误";
                    throw new RuntimeException("DOP接口返回失败: " + errorMsg);
                }
            }
            
        } catch (Exception e) {
            LOGGER.error("调用DOP接口失败: {}", e.getMessage(), e);
            throw new RuntimeException("调用DOP接口失败: " + e.getMessage(), e);
        }
    }
    

    
    /**
     * 获取DOP服务URL
     */
    private String getDopUrl() {
        return dopUrl;
    }

    private void offlineByL4delete(Long l3Id, List<L4Dto> l4DtoList, String username) {
        //库里的l3下得L4
        List<CommonCatalog> l4Catalogs = catalogRepository.findByParentId(l3Id);
        if (CollectionUtils.isEmpty(l4Catalogs)) {
            return;
        }
        List<Long> l4Ids = l4Catalogs.stream().map(CommonCatalog::getId).toList();

        //库里的l4下的所有l5
        ArrayList<CommonCatalog> l5Catalogs = new ArrayList<>();
        for (Long l4Id : l4Ids) {
            l5Catalogs.addAll(catalogRepository.findByParentId(l4Id));
        }
        List<Long> l5Ids = l5Catalogs.stream().map(CommonCatalog::getId).toList();
        LOGGER.info("L4的dam的ID：" + l4Ids);
        LOGGER.info("L5的dam的ID：" + l5Ids);


        //传过来模型的L4和L5对应目录的id
        ArrayList<Long> modelL4Ids = new ArrayList<>();
        ArrayList<Long> modelL5Ids = new ArrayList<>();

        ObjectMapper objectMapper = new ObjectMapper();
        try {
            LOGGER.info("l4DtoList::" + objectMapper.writeValueAsString(l4DtoList));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        for (L4Dto l4Dto : l4DtoList) {
            try {
                LOGGER.info("l4Dto::" + objectMapper.writeValueAsString(l4Dto));
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }

            CommonCatalog l4 = commonCatalogExtRepository.findByCode(l4Dto.getCode());
            if(l4 != null){
                modelL4Ids.add(l4.getId());
                for (L5Dto l5Child : l4Dto.getL5Children()) {
                    CommonCatalog l5 = commonCatalogExtRepository.findByCode(l5Child.getCode());
                    if(l5 != null){
                        modelL5Ids.add(l5.getId());
                    }
                }
            }
        }

        LOGGER.info("L4的模型的ID：" + modelL4Ids);
        LOGGER.info("L5的模型的ID：" + modelL5Ids);

        //先处理l4
        List<Long> deleteL4Ids = l4Ids.stream().filter(e -> !modelL4Ids.contains(e)).toList();
        List<Long> deleteL5Ids = l5Ids.stream().filter(e -> !modelL5Ids.contains(e)).toList();
        HashSet<Long> deleteIds = new HashSet<>();
        deleteIds.addAll(deleteL4Ids);
        deleteIds.addAll(deleteL5Ids);
        this.offlineCatalogById(deleteIds, username);
    }

    private void offlineCatalogById(HashSet<Long> deleteIds, String username) {
        if(CollectionUtils.isEmpty(deleteIds)) return;

        dataAssetsCatalogService.updateCatalogStatus(deleteIds, EnumAssetsCatalogStatus.OFFLINE, "");

        Long catalogId = deleteIds.stream().findAny().orElseThrow(() -> new InvalidArgumentException("目录文件ID为空"));
        CommonCatalog commonCatalog = dataAssetsCatalogService.getById(catalogId);
        DataAssetsCatalogStructureDto dataAssetsCatalogStructure = structureService.findByCatalog(commonCatalog);

        dataAssetsCatalogChangeRecordService.writerVersionOfCatalog(deleteIds
                , "", EnumAssetsCatalogStatus.OFFLINE, EnumApplyType.MANUAL,
                username, dataAssetsCatalogStructure, EnumVersionType.PUBLISHED);
    }

    private void dohandleL5(L5Dto l5Child, CommonCatalog byCode, Map<String, DomainDto> domainMap) {
        CommonCatalog l5ByCode = commonCatalogExtRepository.findByCode(l5Child.getCode());
        if (l5ByCode == null) {
            //字段不存在则新增
            CommonCatalog l5Catalog = this.getCatalogByL5(l5Child, byCode);
            CommonCatalog l5Save = this.saveCatalog(l5Catalog);
            this.saveL5CatalogExt(l5Save.getId(), l5Child, domainMap);
        } else {
            //存在则修改
            l5ByCode.setName(l5Child.getName());
            l5ByCode.setEnglishName(l5Child.getEnglishName());
            l5ByCode.setModifyTime(DateFormatUtils.format(new Date(), "yyyy-MM-dd HH:mm:ss"));
            this.updateCatalog(l5ByCode);
            this.updateL5CatalogExt(l5ByCode.getId(), l5Child, domainMap);
        }
    }

    private void updateL5CatalogExt(Long catalogId, L5Dto l5Child, Map<String, DomainDto> domainMap) {
        CatalogExt catalogExt = catalogExtRepository.findByCatalogId(catalogId);
        catalogExt.setsNull(l5Child.getNull());
        catalogExt.setDomainId(l5Child.getDomainId());
        catalogExt.setsPk(l5Child.getPk());
        catalogExt.setDefaultValue(l5Child.getDefaultValue());
        catalogExt.setDataType(l5Child.getDataType());

        DomainDto domainDto = domainMap.get(l5Child.getDomainId());
        if(domainDto != null){
            catalogExt.setDomainVer(domainDto.getVersion());
        }
        catalogExtRepository.save(catalogExt);
    }

    private void updateCatalog(CommonCatalog byCode) {
        CommonCatalog save = catalogRepository.save(byCode);
        elasticsearchService.updateCatalog(save, null, null);
        //保存版本
        if (save.getStatus().equals(EnumAssetsCatalogStatus.PUBLISHED)) {
            CatalogVersionRecord catalogVersionRecord = new CatalogVersionRecord();
            catalogVersionRecord.setToStatus(EnumAssetsCatalogStatus.PUBLISHED.name());
            this.typeRepository.findById(save.getCatalogTypeId()).ifPresent((dataAssetsCatalogType) -> {
                catalogVersionRecord.setCatalogType(dataAssetsCatalogType.getName());
            });
            catalogVersionRecord.setReason(this.msgService.getMessage("createNewAssetCatalog"));
            catalogVersionRecord.setCatalogPath(save.getCatalogPath());
            catalogVersionRecord.setCatalogName(save.getName());
            this.structureRepository.findById(save.getStructureId()).ifPresent((s) -> {
                catalogVersionRecord.setDirectoryStructure(s.getDescription());
            });
            //catalogVersionRecord.setDepartment(dto.getCatalogDept());
            catalogVersionRecord.setCatalogKeywords(save.getKeyword());
            catalogVersionRecord.setAbbreviation(save.getEnglishName());
            catalogVersionRecord.setDescribe(save.getComment());
            CatalogChangeRecordDto catalogChangeRecordDto = new CatalogChangeRecordDto(JsonUtils.toJSon(catalogVersionRecord), save.getCreator(), save.getId());
            this.changeRecordService.save(catalogChangeRecordDto);
        }
        DataAssetsCatalogDto dto = new DataAssetsCatalogDto();
        BeanUtils.copyProperties(save, dto);
        kafkaLogUtils.changeCatalog(save.getCreator(), dto, dataAssetsCatalogService.getFullPathByCatalogId(save.getId()), "", IpUtil.getUserIp(), IpUtil.getUrl());
    }

    private void saveL5CatalogExt(Long catalogId, L5Dto l5Child, Map<String, DomainDto> domainMap) {
        CatalogExt catalogExt = new CatalogExt();
        catalogExt.setCatalogId(catalogId);
        catalogExt.setsNull(l5Child.getNull());
        catalogExt.setDomainId(l5Child.getDomainId());
        catalogExt.setsPk(l5Child.getPk());
        catalogExt.setDefaultValue(l5Child.getDefaultValue());
        catalogExt.setDataType(l5Child.getDataType());

        DomainDto domainDto = domainMap.get(l5Child.getDomainId());
        if(domainDto != null){
            catalogExt.setDomainVer(domainDto.getVersion());
        }
        catalogExtRepository.save(catalogExt);
    }

    private void updateL4CatalogExt(Long catalogId, L4Dto l4Dto) {
        CatalogExt catalogExt = catalogExtRepository.findByCatalogId(catalogId);
        catalogExt.setDataClassification(l4Dto.getDataClassification());
        catalogExt.setSourceSystem(l4Dto.getSourceSystem());
        catalogExtRepository.save(catalogExt);
    }

    private void saveL4CatalogExt(Long catalogId, L4Dto l4Dto, String username) {
        CatalogExt catalogExt = new CatalogExt();
        catalogExt.setCatalogId(catalogId);
        catalogExt.setDataClassification(l4Dto.getDataClassification());
        catalogExt.setSourceSystem(l4Dto.getSourceSystem());
        catalogExt.setApplyUsername(username);
        catalogExtRepository.save(catalogExt);
    }

    private CommonCatalog getCatalogByL5(L5Dto l5, CommonCatalog l4Save) {
        CommonCatalogStructure structure = structureRepository.findById(l4Save.getStructureId()).get();
        List<CommonCatalogStructureDetail> details = detailRepository.findByStructureIdsAndLevel(List.of(structure.getId()), 5);
        Map<Long, Long> structureTypeMap = details.stream().collect(Collectors.toMap(CommonCatalogStructureDetail::getStructureId, CommonCatalogStructureDetail::getCatalogTypeId));

        CommonCatalog catalog = new CommonCatalog();
        catalog.setName(l5.getName());
        catalog.setEnglishName(l5.getEnglishName());
        catalog.setCode(l5.getCode());
        catalog.setCatalogTypeId(structureTypeMap.get(structure.getId()));
        catalog.setStructureId(l4Save.getStructureId());
        catalog.setStructureType(EnumStructureType.DATA_ASSETS);
        catalog.setLevel(5);
        catalog.setParentId(l4Save.getId());
        String catalogPath = l4Save.getCatalogPath() + l4Save.getId() + "/";
        catalog.setCatalogPath(catalogPath);

        //自动生成的属性
        catalog.setCreator(l5.getCreator());
        catalog.setStatus(EnumAssetsCatalogStatus.PUBLISHED);
        catalog.setQualityProblemNum(0L);
        catalog.setPubQualityProblemNum(0L);
        catalog.setPublicType(EnumCatalogPublicType.NONE);
        CommonCatalog top = this.catalogRepository.findTopByStructureIdAndParentIdOrderByOrderDesc(catalog.getStructureId(), catalog.getParentId());
        catalog.setOrder(top == null ? 1L : top.getOrder() + 1L);
        catalog.setCreateTime(DateFormatUtils.format(new Date(), "yyyy-MM-dd HH:mm:ss"));
        catalog.setModifyTime(DateFormatUtils.format(new Date(), "yyyy-MM-dd HH:mm:ss"));
        catalog.setVisible(false);
        catalog.setApprover("");
        return catalog;
    }

    private CommonCatalog getCatalogByL4(L4Dto l4) {
        Optional<CommonCatalog> parentCatalogOpt = catalogRepository.findById(l4.getL3DamId());
        CommonCatalog parentCatalog = parentCatalogOpt.get();
        CommonCatalogStructure structure = structureRepository.findById(parentCatalog.getStructureId()).get();
        List<CommonCatalogStructureDetail> details = detailRepository.findByStructureIdsAndLevel(List.of(structure.getId()), 4);
        Map<Long, Long> structureTypeMap = details.stream().collect(Collectors.toMap(CommonCatalogStructureDetail::getStructureId, CommonCatalogStructureDetail::getCatalogTypeId));

        CommonCatalog catalog = new CommonCatalog();
        catalog.setName(l4.getName());
        catalog.setEnglishName(l4.getEnglishName());
        catalog.setCode(l4.getCode());
        catalog.setCatalogTypeId(structureTypeMap.get(structure.getId()));
        catalog.setStructureId(parentCatalog.getStructureId());
        catalog.setStructureType(EnumStructureType.DATA_ASSETS);
        catalog.setLevel(4);
        catalog.setParentId(parentCatalog.getId());
        String catalogPath = parentCatalog.getCatalogPath() + parentCatalog.getId() + "/";
        catalog.setCatalogPath(catalogPath);

        //自动生成的属性
        catalog.setCreator(l4.getCreator());
        catalog.setStatus(EnumAssetsCatalogStatus.PUBLISHED);
        catalog.setQualityProblemNum(0L);
        catalog.setPubQualityProblemNum(0L);
        catalog.setPublicType(EnumCatalogPublicType.NONE);
        CommonCatalog top = this.catalogRepository.findTopByStructureIdAndParentIdOrderByOrderDesc(catalog.getStructureId(), catalog.getParentId());
        catalog.setOrder(top == null ? 1L : top.getOrder() + 1L);
        catalog.setCreateTime(DateFormatUtils.format(new Date(), "yyyy-MM-dd HH:mm:ss"));
        catalog.setModifyTime(DateFormatUtils.format(new Date(), "yyyy-MM-dd HH:mm:ss"));
        catalog.setVisible(false);
        catalog.setApprover("");
        return catalog;
    }

    private CommonCatalog saveCatalog(CommonCatalog catalog) {
        CommonCatalog save = this.catalogRepository.save(catalog);
        //保存UDP
        List<DataAssetsCatalogUdpDto> udpDtos = new ArrayList<>();
        this.udpService.saveBatchValue(save.getId(), udpDtos);
        //权限
        this.authService.save(save, EnumMandateType.PERSON, EnumAuthType.MANAGER, save.getCreator());
        this.authService.extendParentAuth(save, save.getParentId());
        //保存到es
        this.elasticsearchService.saveCatalog(save);
        //保存版本
        if (save.getStatus().equals(EnumAssetsCatalogStatus.PUBLISHED)) {
            CatalogVersionRecord catalogVersionRecord = new CatalogVersionRecord();
            catalogVersionRecord.setToStatus(EnumAssetsCatalogStatus.PUBLISHED.name());
            this.typeRepository.findById(save.getCatalogTypeId()).ifPresent((dataAssetsCatalogType) -> {
                catalogVersionRecord.setCatalogType(dataAssetsCatalogType.getName());
            });
            catalogVersionRecord.setReason(this.msgService.getMessage("createNewAssetCatalog"));
            catalogVersionRecord.setCatalogPath(save.getCatalogPath());
            catalogVersionRecord.setCatalogName(save.getName());
            this.structureRepository.findById(save.getStructureId()).ifPresent((s) -> {
                catalogVersionRecord.setDirectoryStructure(s.getDescription());
            });
            //catalogVersionRecord.setDepartment(dto.getCatalogDept());
            catalogVersionRecord.setCatalogKeywords(save.getKeyword());
            catalogVersionRecord.setAbbreviation(save.getEnglishName());
            catalogVersionRecord.setDescribe(save.getComment());
            CatalogChangeRecordDto catalogChangeRecordDto = new CatalogChangeRecordDto(JsonUtils.toJSon(catalogVersionRecord), save.getCreator(), save.getId());
            this.changeRecordService.save(catalogChangeRecordDto);
        }

        kafkaLogUtils.addNewCatalog(save.getCreator(), save, dataAssetsCatalogService.getFullPathByCatalogId(save.getId()), IpUtil.getUserIp(), IpUtil.getUrl());

        return save;
    }
// dataAssetsCatalogExtendService.updateCatalogStatus(ids, EnumAssetsCatalogStatus.PUBLISHED, LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

//    public void updateCatalogStatus(Set<Long> catalogIds, EnumAssetsCatalogStatus status, String publishTime){
//        LOGGER.info("update catalog status, catalogIds:{} ,status:{} , publishTime:{}", catalogIds, status, publishTime);
//        List<CommonCatalog> catalogs = catalogRepository.findAllByIdIn(catalogIds);
//        if (CollectionUtils.isEmpty(catalogs)) return;
//
//        catalogs.forEach(catalog -> {
//            catalog.setStatus(status);
//            if (StringUtils.isNotBlank(publishTime)) {
//                catalog.setPublishTime(publishTime);
//            }
//        });
//        catalogRepository.saveAll(catalogs);
//
//        LOGGER.info("update result ,catalog status: {}", catalogs.get(0).getStatus().name());
//        //更新ES 中，目录的状态
//
//        catalogs.forEach(c -> {
//            LOGGER.info(msgService.getMessage("updateCatalog"), c.getName());
//            elasticsearchService.updateCatalogStatus(c);
//            //同步知识图谱
//            if (EnumAssetsCatalogStatus.PUBLISHED.equals(status)) {
//                syncChildNode(c.getId());
//            }
//        });
//    }
//
//    protected GraphObjectProcessor graphObjectProcessor;
//    @Value("${datablau.task.delay.seconds:2}")
//    protected long delaySeconds;
//
//    protected synchronized GraphObjectProcessor getGraphObjectProcessor() {
//        if (this.graphObjectProcessor == null) {
//            this.graphObjectProcessor = (GraphObjectProcessor) RootBeanHelper.getBean(GraphObjectProcessor.class);
//        }
//
//        return this.graphObjectProcessor;
//    }
//
//    protected void syncChildNode(Long catalogId) {
////        AsyncManager.execute(() -> {
//        ObjectMapper objectMapper = new ObjectMapper();
//        List<CommonCatalog> catalogList = this.catalogRepository.findAllByParentIdAndStatus(catalogId, EnumAssetsCatalogStatus.PUBLISHED);
//        try {
//            LOGGER.info("catalogid::" + catalogId);
//            LOGGER.info("catalogList：：" + objectMapper.writeValueAsString(catalogList));
//        } catch (JsonProcessingException e) {
//            throw new RuntimeException(e);
//        }
//        this.getGraphObjectProcessor().objectsSave(catalogList, SaveType.UPDATE);
//        List<DataAssets> assesLists = this.assetsRepository.findAllByCatalogIdAndStatus(catalogId, EnumAssetsCatalogStatus.PUBLISHED);
//        this.getGraphObjectProcessor().objectsSave(assesLists, SaveType.UPDATE);
////        }, this.delaySeconds);
//    }
}
