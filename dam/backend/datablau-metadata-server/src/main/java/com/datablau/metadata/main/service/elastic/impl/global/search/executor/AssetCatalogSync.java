package com.datablau.metadata.main.service.elastic.impl.global.search.executor;

import com.andorj.common.core.model.LDMTypes;
import com.andorj.model.common.utility.BeanHelper;
import com.datablau.catalog.dto.CommonCatalogDto;
import com.datablau.dataasset.api.RemoteDataAssetsCatalogService;
import com.datablau.metadata.main.service.elastic.wrapper.GlobalSearchWrapper;

import java.util.ArrayList;
import java.util.List;

/**
 * @program: dam
 * @description: 资产目录同步
 * @author: wang tong
 * @create: 2025-06-23 11:48
 **/
public class AssetCatalogSync extends GlobalSearchSync {

    public List<CommonCatalogDto> commonCatalogDtos;

    public AssetCatalogSync() {
    }

    public AssetCatalogSync(List<CommonCatalogDto> commonCatalogDtos) {
        this.commonCatalogDtos = commonCatalogDtos;
    }

    @Override
    List<GlobalSearchWrapper> convertGlobalSearchWrapper() {
        List<GlobalSearchWrapper> result = new ArrayList<>();
        if (commonCatalogDtos == null || commonCatalogDtos.isEmpty()) {
            return result;
        }
        for (CommonCatalogDto commonCatalogDto : commonCatalogDtos) {
            GlobalSearchWrapper wrapper = createGlobalSearchWrapper(commonCatalogDto);
            result.add(wrapper);
        }
        return result;
    }

    public GlobalSearchWrapper createGlobalSearchWrapper(CommonCatalogDto m) {
        GlobalSearchWrapper wrapper = new GlobalSearchWrapper();
        wrapper.setItemId(m.getId().toString());
        wrapper.setItemType(LDMTypes.oCatalog);
        wrapper.setChineseName(m.getName());
        wrapper.setEnglishName(m.getEnglishName());
        wrapper.setDescription(m.getName());
        wrapper.setType(m.getCatalogTypeId().toString());
        wrapper.setPath(m.getCatalogPath());
        wrapper.setFolderId(Long.valueOf(m.getLevel()));
        wrapper.setCode(String.valueOf(m.getStructureId()));

        return wrapper;
    }

    @Override
    String getTypeName() {
        return "AssetCatalog";
    }

    @Override
    void queryDbData() {
        commonCatalogDtos = new ArrayList<>();
        RemoteDataAssetsCatalogService remoteDataAssetsCatalogService;
        try {
            remoteDataAssetsCatalogService = BeanHelper.getBean(RemoteDataAssetsCatalogService.class);
            List<CommonCatalogDto> commonCatalogs = remoteDataAssetsCatalogService.findAll();
            if (commonCatalogs != null && !commonCatalogs.isEmpty()) {
                commonCatalogDtos.addAll(commonCatalogs);
            }

        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
        }

    }

    @Override
    List<GlobalSearchWrapper> selfIncrementSync() {
        LOGGER.info("increment sync assetCatalog , current batch size [{}]...", commonCatalogDtos.size());
        return convertGlobalSearchWrapper();
    }
}
