package com.datablau.data.asset.dto;

import com.datablau.catalog.jpa.entity.CommonCatalog;

import java.io.Serializable;
import java.util.List;

public class MetaDataAutoMappingDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private List<CommonCatalog> businessObjects;
    private Long modelCategoryId;
    private Long modelId;

    //数据库下的schema
    private Long databaseId;

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


    public Long getModelId() {
        return modelId;
    }

    public void setModelId(Long modelId) {
        this.modelId = modelId;
    }

    public Long getDatabaseId() {
        return databaseId;
    }

    public void setDatabaseId(Long databaseId) {
        this.databaseId = databaseId;
    }
}
