package com.datablau.project.api.dto;

import java.io.Serializable;

/**
 *
 * @author: hxs  查询模型版本和最新版本
 * @date: 2025/4/23 11:01
 */
public class DdmModelVersionQueryDto implements Serializable {

    private Long modelId;

    private Long modelVersionId;

    public Long getModelId() {
        return modelId;
    }

    public void setModelId(Long modelId) {
        this.modelId = modelId;
    }

    public Long getModelVersionId() {
        return modelVersionId;
    }

    public void setModelVersionId(Long modelVersionId) {
        this.modelVersionId = modelVersionId;
    }

}
