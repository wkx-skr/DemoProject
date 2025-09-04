package com.datablau.data.asset.service;

import com.datablau.data.asset.dto.DopDataSyncDto;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-08-11 15:18
 * @description
 */
public interface DataAssetDopCatalogSyncService {

    /**
     * 给dop同步所有目录
     */
    DopDataSyncDto syncDataAssetAll();
}
