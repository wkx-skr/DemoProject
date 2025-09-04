package com.datablau.data.asset.dto;

import com.andorj.model.common.annotation.ExcelColumn;

import java.io.Serializable;

public class MetaDataManualMappingExcelDto implements Serializable {
    private static final long serialVersionUID = 1L;

    @ExcelColumn(columnNames = {"DL3英文名"}, required = true)
    private String catalogL3Name;
    @ExcelColumn(columnNames = {"DL4英文名"}, required = true)
    private String catalogL4Name;
    @ExcelColumn(columnNames = {"DL5英文名"}, required = true)
    private String catalogL5Name;
    @ExcelColumn(columnNames = {"应用系统名称"}, required = true)
    private String modelCategoryName;
    @ExcelColumn(columnNames = {"数据源"}, required = true)
    private String modelName;
    @ExcelColumn(columnNames = {"数据库"}, required = true)
    private String databaseName;
    @ExcelColumn(columnNames = {"表英文名"}, required = true)
    private String tableName;
    @ExcelColumn(columnNames = {"字段英文名"}, required = true)
    private String columnName;

    public String getCatalogL4Name() {
        return catalogL4Name;
    }

    public void setCatalogL4Name(String catalogL4Name) {
        this.catalogL4Name = catalogL4Name;
    }

    public String getCatalogL5Name() {
        return catalogL5Name;
    }

    public void setCatalogL5Name(String catalogL5Name) {
        this.catalogL5Name = catalogL5Name;
    }

    public String getModelCategoryName() {
        return modelCategoryName;
    }

    public void setModelCategoryName(String modelCategoryName) {
        this.modelCategoryName = modelCategoryName;
    }

    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public String getDatabaseName() {
        return databaseName;
    }

    public void setDatabaseName(String databaseName) {
        this.databaseName = databaseName;
    }

    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public String getColumnName() {
        return columnName;
    }

    public void setColumnName(String columnName) {
        this.columnName = columnName;
    }

    public String getCatalogL3Name() {
        return catalogL3Name;
    }

    public void setCatalogL3Name(String catalogL3Name) {
        this.catalogL3Name = catalogL3Name;
    }
}
