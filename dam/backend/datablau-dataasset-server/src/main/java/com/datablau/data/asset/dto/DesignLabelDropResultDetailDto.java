package com.datablau.data.asset.dto;

import com.andorj.model.common.annotation.ExcelColumn;

import java.io.Serializable;

public class DesignLabelDropResultDetailDto implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 字段来源
     */
    private String columnSource;

    /**
     * 映射字段
     */
    private String mappingColumn;

    /**
     * 逻辑数据实体
     */
    private String logicEntity;

    /**
     * 实体属性
     */
    private String attribute;

    /**
     * 数据元标准
     */
    private String domainName;

    /**
     * 数据元标准ID
     */
    private String domainId;

    /**
     * 落标状态
     */
    private String status;

    /**
     * 字段来源
     */
    private String categoryPath;

    /**
     * 落标问题描述
     */
    private String desc;

    /**
     * 标准值
     */
    private String domainValue;

    /**
     * 实际值
     */
    private String columnValue;

    public String getDomainId() {
        return domainId;
    }

    public void setDomainId(String domainId) {
        this.domainId = domainId;
    }

    public String getDomainValue() {
        return domainValue;
    }

    public void setDomainValue(String domainValue) {
        this.domainValue = domainValue;
    }

    public String getColumnValue() {
        return columnValue;
    }

    public void setColumnValue(String columnValue) {
        this.columnValue = columnValue;
    }

    public String getCategoryPath() {
        return categoryPath;
    }

    public void setCategoryPath(String categoryPath) {
        this.categoryPath = categoryPath;
    }

    public String getColumnSource() {
        return columnSource;
    }

    public void setColumnSource(String columnSource) {
        this.columnSource = columnSource;
    }

    public String getMappingColumn() {
        return mappingColumn;
    }

    public void setMappingColumn(String mappingColumn) {
        this.mappingColumn = mappingColumn;
    }

    public String getLogicEntity() {
        return logicEntity;
    }

    public void setLogicEntity(String logicEntity) {
        this.logicEntity = logicEntity;
    }

    public String getAttribute() {
        return attribute;
    }

    public void setAttribute(String attribute) {
        this.attribute = attribute;
    }

    public String getDomainName() {
        return domainName;
    }

    public void setDomainName(String domainName) {
        this.domainName = domainName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }
}
