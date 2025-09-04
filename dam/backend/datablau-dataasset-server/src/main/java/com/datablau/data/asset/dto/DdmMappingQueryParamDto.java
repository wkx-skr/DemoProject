package com.datablau.data.asset.dto;

import java.io.Serializable;

public class DdmMappingQueryParamDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long businessObjectId;
    private Long logicDataEntityId;
    private Long modelCategoryId;
    private Long ddmModelId;
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

    public Long getDdmModelId() {
        return ddmModelId;
    }

    public void setDdmModelId(Long ddmModelId) {
        this.ddmModelId = ddmModelId;
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
