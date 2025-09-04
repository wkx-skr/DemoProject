package com.datablau.data.asset.dto;

import java.io.Serializable;

public class DdmCollectElementConditionForModel implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long modelCategoryId;

    private Long ddmModelId;

    private String ddmModelName;

    public DdmCollectElementConditionForModel() {

    }

    public DdmCollectElementConditionForModel(Long modelCategoryId, Long ddmModelId, String ddmModelName) {
        this.modelCategoryId = modelCategoryId;
        this.ddmModelId = ddmModelId;
        this.ddmModelName = ddmModelName;
    }

    public Long getModelCategoryId() {
        return modelCategoryId;
    }

    public void setModelCategoryId(Long modelCategoryId) {
        this.modelCategoryId = modelCategoryId;
    }

    public Long getDdmModelId() {
        return ddmModelId;
    }

    public void setDdmModelId(Long ddmModelId) {
        this.ddmModelId = ddmModelId;
    }

    public String getDdmModelName() {
        return ddmModelName;
    }

    public void setDdmModelName(String ddmModelName) {
        this.ddmModelName = ddmModelName;
    }
}
