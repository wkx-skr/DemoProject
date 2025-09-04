package com.datablau.data.asset.service.impl;

import com.andorj.model.common.api.MessageService;
import com.datablau.data.asset.service.DataAssetsCatalogProcessExt0Service;
import com.datablau.data.asset.service.DataAssetsWorkflowExtend0Service;
import com.datablau.dataasset.dto.CatalogWorkflowApplyDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * @author: hxs
 * @date: 2025/5/22 18:34
 */
@Service
public class DataAssetsCatalogProcessExt0ServiceImpl implements DataAssetsCatalogProcessExt0Service {
    public static final Logger logger = LoggerFactory.getLogger(DataAssetsCatalogProcessExt0ServiceImpl.class);

    @Autowired
    protected MessageService messageService;
    @Autowired
    protected DataAssetsWorkflowExtend0Service workflowExtService;

    @Override
    public void applyCatalog(CatalogWorkflowApplyDto catalogWorkflowApplyDto, String username) {
        logger.info(messageService.getMessage("applyCatalogReleaseOfflineProcess"), catalogWorkflowApplyDto.getCatalogProcessType().name());
        workflowExtService.applyUpOrDownLines0(catalogWorkflowApplyDto, username);
    }

}
