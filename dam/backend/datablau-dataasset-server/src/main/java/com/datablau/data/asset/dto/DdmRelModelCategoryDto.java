package com.datablau.data.asset.dto;

import java.io.Serializable;

public class DdmRelModelCategoryDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long ddmModelId;
    private Long modelCategoryId;


    public DdmRelModelCategoryDto () {

    }

    public DdmRelModelCategoryDto (Long ddmModelId, Long modelCategoryId) {
        this.ddmModelId = ddmModelId;
        this.modelCategoryId = modelCategoryId;
    }


    public Long getDdmModelId() {
        return ddmModelId;
    }

    public void setDdmModelId(Long ddmModelId) {
        this.ddmModelId = ddmModelId;
    }

    public Long getModelCategoryId() {
        return modelCategoryId;
    }

    public void setModelCategoryId(Long modelCategoryId) {
        this.modelCategoryId = modelCategoryId;
    }
}
