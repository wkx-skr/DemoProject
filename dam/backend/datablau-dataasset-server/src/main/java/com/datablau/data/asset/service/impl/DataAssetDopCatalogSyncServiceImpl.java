package com.datablau.data.asset.service.impl;

import cn.hutool.http.HttpUtil;
import com.datablau.catalog.enums.EnumAssetsCatalogStatus;
import com.datablau.catalog.jpa.entity.CommonCatalog;
import com.datablau.data.asset.dto.Dl1BusinessDomainDto;
import com.datablau.data.asset.dto.Dl2SubjectDomainDto;
import com.datablau.data.asset.dto.Dl3BusinessObjectDto;
import com.datablau.data.asset.dto.DopDataSyncDto;
import com.datablau.data.asset.jpa.repository.CommonCatalogExtRepository;
import com.datablau.data.asset.service.DataAssetDopCatalogSyncService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-08-11 15:19
 * @description
 */
@Service
public class DataAssetDopCatalogSyncServiceImpl implements DataAssetDopCatalogSyncService {

    public static final Logger LOGGER = LoggerFactory.getLogger(DataAssetDopCatalogSyncServiceImpl.class);
    @Value("${datablau.dop.dopUrl}")
    private String dopUrl;

    @Value("${datablau.dop.enable}")
    private Boolean dopSyncEnable;

    @Autowired
    private CommonCatalogExtRepository commonCatalogExtRepository;

    @Override
    public DopDataSyncDto syncDataAssetAll() {
        List<Integer> levels = new ArrayList<>(Arrays.asList(1,2,3));
        List<CommonCatalog> allPublished = commonCatalogExtRepository.findByStatusAndLevelIn(EnumAssetsCatalogStatus.PUBLISHED,levels);
        List<Dl1BusinessDomainDto> dl1BusinessDomainDtos = buildDl1BusinessDomainList(allPublished);
        // 构建DOP数据同步DTO
        DopDataSyncDto dopDataSyncDto = new DopDataSyncDto();
        dopDataSyncDto.setDl1List(dl1BusinessDomainDtos);
        // 调用DOP接口更新目录信息

        return dopDataSyncDto;


//        try {
//            callDopCatalogUpdateApi(dopDataSyncDto);
//            LOGGER.info("成功调用DOP接口更新目录信息，共处理{}个条目录", allPublished.size());
//        } catch (Exception e) {
//            LOGGER.error("调用DOP接口更新目录信息失败", e);
//            throw new RuntimeException("调用DOP接口失败: " + e.getMessage(), e);
//        }
    }


    /**
     * 构建DL1业务域列表
     */
    private List<Dl1BusinessDomainDto> buildDl1BusinessDomainList(List<CommonCatalog> catalogs) {
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
                dl1Dto.setDl1Status(1);

                // 构建DL2主题域列表
                List<Dl2SubjectDomainDto> dl2List = buildDl2SubjectDomainList(dl1Catalog, catalogs);
                dl1Dto.setDl2List(dl2List);

                dl1List.add(dl1Dto);
            }
        }

        return dl1List;
    }

    /**
     * 构建DL2主题域列表
     */
    private List<Dl2SubjectDomainDto> buildDl2SubjectDomainList(CommonCatalog dl1Catalog, List<CommonCatalog> catalogs) {
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
                dl2Dto.setDl2Status(1);
                // 构建DL3业务对象列表
                List<Dl3BusinessObjectDto> dl3List = buildDl3BusinessObjectList(catalog, catalogs);
                dl2Dto.setDl3List(dl3List);

                dl2List.add(dl2Dto);
            }
        }

        return dl2List;
    }

    /**
     * 构建DL3业务对象列表
     */
    private List<Dl3BusinessObjectDto> buildDl3BusinessObjectList(CommonCatalog dl2Catalog, List<CommonCatalog> catalogs) {
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
                dl3Dto.setDl3Status(1);
                dl3List.add(dl3Dto);
            }
        }

        return dl3List;
    }



    /**
     * 调用DOP接口更新目录信息
     */
    private void callDopCatalogUpdateApi(DopDataSyncDto dopDataSyncDto) {
        // 从配置中获取DOP接口URL
        String dopUrl = getDopUrl();
        String apiUrl = dopUrl + "/api/catalog/update"; // 根据实际接口路径调整

        // 设置请求头
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/json");

        try {
            // 使用HttpUtil进行POST请求，参考SynEtlJob的实现方式
            String body= new ObjectMapper().writeValueAsString(dopDataSyncDto);
            LOGGER.info("请求体内容:{}", body);
            if (dopSyncEnable){
                LOGGER.info("同步流程未启动，不调用接口");
                return;
            }
            String responseStr = HttpUtil.createPost(apiUrl)
                    .addHeaders(headers)
                    .body(body)
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
}
