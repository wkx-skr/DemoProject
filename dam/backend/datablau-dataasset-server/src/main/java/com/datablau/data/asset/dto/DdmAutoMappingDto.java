package com.datablau.data.asset.dto;

import com.datablau.catalog.jpa.entity.CommonCatalog;

import java.io.Serializable;
import java.util.List;

public class DdmAutoMappingDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private List<CommonCatalog> businessObjects;

    private Long modelCategoryId;

    private Long ddmModelId;

    public List<CommonCatalog> getBusinessObjects() {
        return businessObjects;
    }

    public void setBusinessObjects(List<CommonCatalog> businessObjects) {
        this.businessObjects = businessObjects;
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
}
