package com.datablau.data.asset.dto;

import com.andorj.model.common.annotation.ExcelColumn;

import java.io.Serializable;

public class DesignLabelDropResultDetailExcelDto implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * 字段来源
     */
    @ExcelColumn(
            columnNames = {"字段来源"}
    )
    private String categoryPath;

    /**
     * 映射字段
     */
    @ExcelColumn(
            columnNames = {"映射字段"}
    )
    private String mappingColumn;

    /**
     * 逻辑数据实体
     */
    @ExcelColumn(
            columnNames = {"逻辑数据实体"}
    )
    private String logicEntity;

    /**
     * 实体属性
     */
    @ExcelColumn(
            columnNames = {"实体属性"}
    )
    private String attribute;

    /**
     * 数据元标准
     */
    @ExcelColumn(
            columnNames = {"数据元标准"}
    )
    private String domainName;

    /**
     * 落标状态
     */
    @ExcelColumn(
            columnNames = {"落标状态"}
    )
    private String status;

    /**
     * 落标问题描述
     */
    @ExcelColumn(
            columnNames = {"落标问题描述"}
    )
    private String desc;

    @ExcelColumn(
            columnNames = {"标准值"}
    )
    private String domainValue;

    @ExcelColumn(
            columnNames = {"实际值"}
    )
    private String columnValue;

    public DesignLabelDropResultDetailExcelDto() {
    }

    public DesignLabelDropResultDetailExcelDto(DesignLabelDropResultDetailDto designLabelDropResultDetailDto) {
        this.categoryPath = designLabelDropResultDetailDto.getCategoryPath();
        this.mappingColumn = designLabelDropResultDetailDto.getMappingColumn();
        this.logicEntity = designLabelDropResultDetailDto.getLogicEntity();
        this.attribute = designLabelDropResultDetailDto.getAttribute();
        this.domainName = designLabelDropResultDetailDto.getDomainName();
        this.status = designLabelDropResultDetailDto.getStatus();
        this.desc = designLabelDropResultDetailDto.getDesc();
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
