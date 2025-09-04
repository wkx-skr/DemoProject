package com.datablau.project.api.impl;

import com.datablau.catalog.dto.CommonCatalogDto;
import com.datablau.project.api.RemoteDataAssetExtendService;
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
 * @date: 2025/4/7 18:14
 */
public class EmptyRemoteDataAssetExtendService implements RemoteDataAssetExtendService {
    @Override
    public String test() {
        return "";
    }

    @Override
    public HashMap<Long, CatalogResDto> getCatalogInfoByObjId(List<String> objectIds) {
        return null;
    }

    @Override
    public List<Map<String, Object>> getDomainByColumnId(Set<Long> columnIds) {
        return null;
    }

    @Override
    public void syncL4AndL5(Long l3Id, String username, List<L4Dto> l4DtoList, String s) {

    }

    @Override
    public void applyAssets(BatchApplyRemoteDto batchApplyRemoteDto, String state, String username) {

    }

    @Override
    public void updateDopDate(Map<Long,String> assetsIds,String dopId,String batchId) {

    }

    @Override
    public Map<Long, String> getCommonCatalogType(List<Long> typeIds) {
        return Map.of();
    }

    @Override
    public List<CommonCatalogDto> getCommonCatalogDtos(Collection<Long> catalogIds) {
        return List.of();
    }

    @Override
    public Map<String, List<String>> getUsernameByDomainIds(List<String> domainIds) {
        return Map.of();
    }
}
