package com.datablau.data.asset.controller;

import com.datablau.data.asset.dto.DopDataSyncDto;
import com.datablau.data.asset.service.DataAssetDopCatalogSyncService;
import com.datablau.data.common.controller.BaseController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-08-14 13:43
 * @description
 */
@Tag(name = "")
@RestController
@RequestMapping(value = "/sync/test")
public class SyncAssetController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(SyncAssetController.class);

    @Autowired
    private DataAssetDopCatalogSyncService dataAssetDopCatalogSyncService;

    @Operation(summary = "用于测试用")
    @GetMapping("/sync")
    public DopDataSyncDto syncTest() {
        try {
            return dataAssetDopCatalogSyncService.syncDataAssetAll();
        } catch (Exception e) {
            logger.error(e.getMessage());
        }
        return null;
    }


}
