package com.datablau.data.asset.dto;

import java.io.Serializable;

public class DdmCollectElementConditionForTable implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long modelCategoryId;

    private Long ddmModelId;

    private Long tableId;
    private String tableName;

    public DdmCollectElementConditionForTable() {

    }

    public DdmCollectElementConditionForTable(Long modelCategoryId,Long ddmModelId,  Long tableId, String tableName) {
        this.modelCategoryId = modelCategoryId;
        this.ddmModelId = ddmModelId;
        this.tableId = tableId;
        this.tableName = tableName;
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

    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }
}
