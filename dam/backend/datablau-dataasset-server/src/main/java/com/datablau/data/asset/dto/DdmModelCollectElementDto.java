package com.datablau.data.asset.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.io.Serializable;

public class DdmModelCollectElementDto implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(name = "模型id")
    private Long ddmModelId;
    @Schema(name = "模型名称")
    private String ddmModelName;
    @Schema(name = "应用系统ID")
    private Long modelCategoryId;
    @Schema(name = "应用系统名")
    private String modelCategoryName;
    @Schema(name = "表ID")
    private Long tableId;
    @Schema(name = "表名称")
    private String tableName;
    @Schema(name = "表中文名称")
    private String tableCnName;
    @Schema(name = "属性ID")
    private Long columnId;
    @Schema(name = "属性名称")
    private String columnName;
    @Schema(name = "属性中文名称")
    private String columnCnName;
    @Schema(name = "是否主键")
    private Boolean isPk;

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

    public String getTableCnName() {
        return tableCnName;
    }

    public void setTableCnName(String tableCnName) {
        this.tableCnName = tableCnName;
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

    public String getColumnCnName() {
        return columnCnName;
    }

    public void setColumnCnName(String columnCnName) {
        this.columnCnName = columnCnName;
    }

    public Boolean getPk() {
        return isPk;
    }

    public void setPk(Boolean pk) {
        isPk = pk;
    }
}
