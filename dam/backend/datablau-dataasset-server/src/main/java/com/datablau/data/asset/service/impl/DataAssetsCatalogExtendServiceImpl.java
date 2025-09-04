package com.datablau.data.asset.service.impl;

import com.datablau.catalog.enums.EnumAssetsCatalogStatus;
import com.datablau.catalog.jpa.entity.CommonCatalog;
import com.datablau.data.asset.impl.DataAssetsCatalogServiceImpl;
import com.datablau.project.api.RemoteArchyExtendService;
import com.datablau.project.dto.DataAssetForArchySubjectDto;
import com.datablau.security.management.utils.AuthTools;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.List;
import java.util.Set;

/**
 *
 * @author: hxs
 * @date: 2025/4/22 19:43
 */
@Service("dataAssetsCatalogServiceExt")
public class DataAssetsCatalogExtendServiceImpl extends DataAssetsCatalogServiceImpl {

    @Autowired
    RemoteArchyExtendService remoteArchyExtendService;


    @Override
    public void updateCatalogStatus(Set<Long> catalogIds, EnumAssetsCatalogStatus status, String publishTime) {
        LOGGER.info("update catalog status, catalogIds:{} ,status:{} , publishTime:{}", catalogIds, status, publishTime);
        List<CommonCatalog> catalogs = catalogRepository.findAllByIdIn(catalogIds);
        if (CollectionUtils.isEmpty(catalogs)) return;

        catalogs.forEach(catalog -> {
            catalog.setStatus(status);
            if (StringUtils.isNotBlank(publishTime)) {
                catalog.setPublishTime(publishTime);
            }
        });
        catalogRepository.saveAll(catalogs);
        try {
            for (CommonCatalog catalog : catalogs) {
                DataAssetForArchySubjectDto forArchySubjectDto = new DataAssetForArchySubjectDto();
                forArchySubjectDto.setCatalogName(catalog.getName());
                forArchySubjectDto.setCode(catalog.getCode());
                forArchySubjectDto.setEnglishName(catalog.getEnglishName());
                forArchySubjectDto.setDamId(catalog.getId());
                forArchySubjectDto.setDamParentId(catalog.getParentId());
                forArchySubjectDto.setPublishState(catalog.getStatus().toString());
                remoteArchyExtendService.updatePublishState(forArchySubjectDto, catalog.getLevel());
            }
        }catch (Exception e){
            e.printStackTrace();
        }

        LOGGER.info("update result ,catalog status: {}", catalogs.get(0).getStatus().name());
        //更新ES 中，目录的状态

        catalogs.forEach(c -> {
            LOGGER.info(msgService.getMessage("updateCatalog"), c.getName());
            elasticsearchService.updateCatalogStatus(c);
            //同步知识图谱
            if (EnumAssetsCatalogStatus.PUBLISHED.equals(status)) {
                syncChildNode(c.getId());
            }
        });
    }
}
