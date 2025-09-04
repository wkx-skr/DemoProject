package com.datablau.data.asset.dto;

import java.io.Serializable;

public class DdmMappingCatalogDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long businessObjectId;
    private String businessObjectName;
    private Long logicDataEntityId;
    private String logicDataEntityName;
    private String logicDataEntityEnName;
    private Long columnCatalogId;
    private String columnCatalogName;
    private String columnCatalogAlias;
    private Long modelCategoryId;
    private String modelCategoryName;
    private Long ddmModelId;
    private String ddmModelName;
    private Long tableId;
    private String tableName;
    private String tableAlias;
    private Long columnId;
    private String columnName;
    private String columnAlias;
    private String mappingType;
    private Long mappingId;
    private Boolean enableClick;

    public Long getBusinessObjectId() {
        return businessObjectId;
    }

    public void setBusinessObjectId(Long businessObjectId) {
        this.businessObjectId = businessObjectId;
    }

    public String getBusinessObjectName() {
        return businessObjectName;
    }

    public void setBusinessObjectName(String businessObjectName) {
        this.businessObjectName = businessObjectName;
    }

    public Long getLogicDataEntityId() {
        return logicDataEntityId;
    }

    public void setLogicDataEntityId(Long logicDataEntityId) {
        this.logicDataEntityId = logicDataEntityId;
    }

    public String getLogicDataEntityName() {
        return logicDataEntityName;
    }

    public void setLogicDataEntityName(String logicDataEntityName) {
        this.logicDataEntityName = logicDataEntityName;
    }

    public String getLogicDataEntityEnName() {
        return logicDataEntityEnName;
    }

    public void setLogicDataEntityEnName(String logicDataEntityEnName) {
        this.logicDataEntityEnName = logicDataEntityEnName;
    }

    public Long getColumnCatalogId() {
        return columnCatalogId;
    }

    public void setColumnCatalogId(Long columnCatalogId) {
        this.columnCatalogId = columnCatalogId;
    }

    public String getColumnCatalogName() {
        return columnCatalogName;
    }

    public void setColumnCatalogName(String columnCatalogName) {
        this.columnCatalogName = columnCatalogName;
    }

    public String getColumnCatalogAlias() {
        return columnCatalogAlias;
    }

    public void setColumnCatalogAlias(String columnCatalogAlias) {
        this.columnCatalogAlias = columnCatalogAlias;
    }

    public Long getModelCategoryId() {
        return modelCategoryId;
    }

    public void setModelCategoryId(Long modelCategoryId) {
        this.modelCategoryId = modelCategoryId;
    }

    public String getModelCategoryName() {
        return modelCategoryName;
    }

    public void setModelCategoryName(String modelCategoryName) {
        this.modelCategoryName = modelCategoryName;
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

    public String getTableAlias() {
        return tableAlias;
    }

    public void setTableAlias(String tableAlias) {
        this.tableAlias = tableAlias;
    }

    public Long getColumnId() {
        return columnId;
    }

    public void setColumnId(Long columnId) {
        this.columnId = columnId;
    }

    public String getColumnName() {
        return columnName;
    }

    public void setColumnName(String columnName) {
        this.columnName = columnName;
    }

    public String getMappingType() {
        return mappingType;
    }

    public void setMappingType(String mappingType) {
        this.mappingType = mappingType;
    }

    public String getColumnAlias() {
        return columnAlias;
    }

    public void setColumnAlias(String columnAlias) {
        this.columnAlias = columnAlias;
    }

    public Long getMappingId() {
        return mappingId;
    }

    public void setMappingId(Long mappingId) {
        this.mappingId = mappingId;
    }

    public Boolean getEnableClick() {
        return enableClick;
    }

    public void setEnableClick(Boolean enableClick) {
        this.enableClick = enableClick;
    }
}
