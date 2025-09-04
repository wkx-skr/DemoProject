package com.datablau.project.api.dto;

import java.io.Serializable;

public class DdmModelElementDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long ddmModelId;

    private Long ddmCategoryId;

    private String ddmCategoryPath;

    private String ddmModelName;

    private String ddmModelAlias;

    private Long parentId;
    private Long tableId;

    private String tableName;

    private String tableCnName;

    private Long columnId;

    private String columnName;

    private String columnCnName;

    private Long typeId;

    private Boolean isPk;

    private Boolean pIsNotNull;//是否为空

    private int pDataScale;//数据长度

    private int pDataPrecision;//数据精度

    private String pDefaultValue;//默认值

    private String pDataType;//数据类型

    private String categoryPath;

    public String getCategoryPath() {
        return categoryPath;
    }

    public void setCategoryPath(String categoryPath) {
        this.categoryPath = categoryPath;
    }

    public Boolean getpIsNotNull() {
        return pIsNotNull;
    }

    public void setpIsNotNull(Boolean pIsNotNull) {
        this.pIsNotNull = pIsNotNull;
    }

    public int getpDataScale() {
        return pDataScale;
    }

    public void setpDataScale(int pDataScale) {
        this.pDataScale = pDataScale;
    }

    public int getpDataPrecision() {
        return pDataPrecision;
    }

    public void setpDataPrecision(int pDataPrecision) {
        this.pDataPrecision = pDataPrecision;
    }

    public String getpDefaultValue() {
        return pDefaultValue;
    }

    public void setpDefaultValue(String pDefaultValue) {
        this.pDefaultValue = pDefaultValue;
    }

    public String getpDataType() {
        return pDataType;
    }

    public void setpDataType(String pDataType) {
        this.pDataType = pDataType;
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

    public String getDdmModelAlias() {
        return ddmModelAlias;
    }

    public void setDdmModelAlias(String ddmModelAlias) {
        this.ddmModelAlias = ddmModelAlias;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
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

    public Long getTypeId() {
        return typeId;
    }

    public void setTypeId(Long typeId) {
        this.typeId = typeId;
    }

    public Boolean getPk() {
        return isPk;
    }

    public void setPk(Boolean pk) {
        isPk = pk;
    }

    public Long getDdmCategoryId() {
        return ddmCategoryId;
    }

    public void setDdmCategoryId(Long ddmCategoryId) {
        this.ddmCategoryId = ddmCategoryId;
    }

    public String getDdmCategoryPath() {
        return ddmCategoryPath;
    }

    public void setDdmCategoryPath(String ddmCategoryPath) {
        this.ddmCategoryPath = ddmCategoryPath;
    }
}
