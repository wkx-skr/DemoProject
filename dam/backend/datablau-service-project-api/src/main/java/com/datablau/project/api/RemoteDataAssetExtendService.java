package com.datablau.project.api;

import com.datablau.catalog.dto.CommonCatalogDto;
import com.datablau.project.api.dto.BatchApplyRemoteDto;
import com.datablau.project.dto.CatalogResDto;
import com.datablau.project.dto.L4Dto;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * @author: hxs
 * @date: 2025/4/7 18:13
 */
public interface RemoteDataAssetExtendService {
    String test();

    /**
     * 根据objectId获取资产目录数据
     */
    HashMap<Long, CatalogResDto> getCatalogInfoByObjId(List<String> objectIds);

    /*
    * 根据columnId获取domainId,[{"columnId": 1, "domainId": "1111", "isNull": true }]
    * */
    List<Map<String, Object>> getDomainByColumnId(Set<Long> columnIds);

    /**
     * 技术架构往资产目录推动L4和L5
     */
    void syncL4AndL5(Long l3Id, String username, List<L4Dto> l4DtoList, String s);

    /**
     *
     * @param batchApplyRemoteDto
     * @param state 2，3 2通过 3 不通过
     * @param username
     */
    void applyAssets(BatchApplyRemoteDto  batchApplyRemoteDto,String state,String username);



    void updateDopDate(Map<Long,String> assetsIds ,String dopId,String batchId);


    Map<String,List<String>> getUsernameByDomainIds(List<String> domainIds);


    Map<Long, String> getCommonCatalogType(List<Long> typeIds);

    List<CommonCatalogDto> getCommonCatalogDtos(Collection<Long> catalogIds);
}
