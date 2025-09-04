package com.datablau.data.asset.dto;

import com.andorj.model.common.annotation.ExcelColumn;

import java.io.Serializable;

public class DdmManualMappingExcelDto implements Serializable {
    private static final long serialVersionUID = 1L;

    @ExcelColumn(columnNames = {"DL3英文名"}, required = true)
    private String catalogL3Name;
    @ExcelColumn(columnNames = {"DL4英文名"}, required = true)
    private String catalogL4Name;
    @ExcelColumn(columnNames = {"DL5英文名"}, required = true)
    private String catalogL5Name;
    @ExcelColumn(columnNames = {"模型路径"}, required = true)
    private String ddmCategoryPath;
    @ExcelColumn(columnNames = {"模型名称"}, required = true)
    private String ddmModelName;
    @ExcelColumn(columnNames = {"模型实体英文名"}, required = true)
    private String ddmModelEntityName;
    @ExcelColumn(columnNames = {"模型属性英文名"}, required = true)
    private String ddmModelColumnName;

    public String getCatalogL3Name() {
        return catalogL3Name;
    }

    public void setCatalogL3Name(String catalogL3Name) {
        this.catalogL3Name = catalogL3Name;
    }

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

    public String getDdmModelName() {
        return ddmModelName;
    }

    public void setDdmModelName(String ddmModelName) {
        this.ddmModelName = ddmModelName;
    }

    public String getDdmModelEntityName() {
        return ddmModelEntityName;
    }

    public void setDdmModelEntityName(String ddmModelEntityName) {
        this.ddmModelEntityName = ddmModelEntityName;
    }

    public String getDdmModelColumnName() {
        return ddmModelColumnName;
    }

    public void setDdmModelColumnName(String ddmModelColumnName) {
        this.ddmModelColumnName = ddmModelColumnName;
    }

    public String getDdmCategoryPath() {
        return ddmCategoryPath;
    }

    public void setDdmCategoryPath(String ddmCategoryPath) {
        this.ddmCategoryPath = ddmCategoryPath;
    }
}
