package com.datablau.data.asset.dto;

import java.io.Serializable;

public class MetaDataMappingQueryParamDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long businessObjectId;
    private Long logicDataEntityId;
    private Long modelCategoryId;

    //数据源id
    private Long modelId;

    //数据库id（数据源下的schema对应的数据库）
    private Long databaseId;
    private Long tableId;

    private int currentPage;
    private int pageSize;

    public Long getBusinessObjectId() {
        return businessObjectId;
    }

    public void setBusinessObjectId(Long businessObjectId) {
        this.businessObjectId = businessObjectId;
    }

    public Long getLogicDataEntityId() {
        return logicDataEntityId;
    }

    public void setLogicDataEntityId(Long logicDataEntityId) {
        this.logicDataEntityId = logicDataEntityId;
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

    public Long getTableId() {
        return tableId;
    }

    public void setTableId(Long tableId) {
        this.tableId = tableId;
    }

    public int getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }
}
