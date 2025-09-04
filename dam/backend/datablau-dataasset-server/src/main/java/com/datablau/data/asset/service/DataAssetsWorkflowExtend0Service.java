package com.datablau.data.asset.service;

import com.datablau.dataasset.dto.CatalogWorkflowApplyDto;
import com.datablau.dataasset.dto.WorkflowApplyDto;

/**
 * @author: hxs
 * @date: 2025/5/22 18:47
 */
public interface DataAssetsWorkflowExtend0Service {

    void applyUpOrDownLines0(WorkflowApplyDto workflowApplyDto, String username);

    void applyCatalogUpOrDownLines0(CatalogWorkflowApplyDto workflowApplyDto, String username);

}
