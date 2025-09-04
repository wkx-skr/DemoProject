package com.datablau.domain.management.dto;

import com.andorj.model.common.annotation.ExcelColumn;

import java.io.Serializable;

/**
 * @author: hxs
 * @date: 2025/8/11 10:18
 */
public class DomainQianYiDto implements Serializable {
    @ExcelColumn(columnNames = {"id"})
    private String id;

    @ExcelColumn(columnNames = {"业务域"})
    private String businessDomain;

    @ExcelColumn(columnNames = {"编码"})
    private String code;

    @ExcelColumn(columnNames = {"中文名称"})
    private String chineseName;

    @ExcelColumn(columnNames = {"英文名称"})
    private String englishName;

    @ExcelColumn(columnNames = {"英文简写"})
    private String englishAbbr;

    @ExcelColumn(columnNames = {"参考数据名称"})
    private String referenceDataName;

    @ExcelColumn(columnNames = {"业务定义"})
    private String businessDefinition;

    @ExcelColumn(columnNames = {"业务规则"})
    private String businessRules;

    @ExcelColumn(columnNames = {"标准来源"})
    private String standardSource;

    @ExcelColumn(columnNames = {"同义词"})
    private String synonyms;

    @ExcelColumn(columnNames = {"关联旧标准"})
    private String relatedOldStandard;

    @ExcelColumn(columnNames = {"权威系统"})
    private String authoritativeSystem;

    @ExcelColumn(columnNames = {"创建人"})
    private String creator;

    @ExcelColumn(columnNames = {"创建时间"})
    private String createTime;

    @ExcelColumn(columnNames = {"最后变更时间"})
    private String lastUpdateTime;

    @ExcelColumn(columnNames = {"发布时间"})
    private String publishTime;

    @ExcelColumn(columnNames = {"数据类型"})
    private String dataType;

    @ExcelColumn(columnNames = {"数据长度"})
    private String dataLength;

    @ExcelColumn(columnNames = {"数据精度"})
    private String dataPrecision;

    @ExcelColumn(columnNames = {"数据格式"})
    private String dataFormat;

    @ExcelColumn(columnNames = {"取值范围最小值"})
    private String minValue;

    @ExcelColumn(columnNames = {"取值范围最大值"})
    private String maxValue;

    @ExcelColumn(columnNames = {"关联术语名称"})
    private String relatedTermCode;

    @ExcelColumn(columnNames = {"计量单位"})
    private String measurementUnit;

    @ExcelColumn(columnNames = {"对象类词"})
    private String relatedClassWord;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getBusinessDomain() {
        return businessDomain;
    }

    public void setBusinessDomain(String businessDomain) {
        this.businessDomain = businessDomain;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getChineseName() {
        return chineseName;
    }

    public void setChineseName(String chineseName) {
        this.chineseName = chineseName;
    }

    public String getEnglishName() {
        return englishName;
    }

    public void setEnglishName(String englishName) {
        this.englishName = englishName;
    }

    public String getEnglishAbbr() {
        return englishAbbr;
    }

    public void setEnglishAbbr(String englishAbbr) {
        this.englishAbbr = englishAbbr;
    }

    public String getReferenceDataName() {
        return referenceDataName;
    }

    public void setReferenceDataName(String referenceDataName) {
        this.referenceDataName = referenceDataName;
    }

    public String getBusinessDefinition() {
        return businessDefinition;
    }

    public void setBusinessDefinition(String businessDefinition) {
        this.businessDefinition = businessDefinition;
    }

    public String getBusinessRules() {
        return businessRules;
    }

    public void setBusinessRules(String businessRules) {
        this.businessRules = businessRules;
    }

    public String getStandardSource() {
        return standardSource;
    }

    public void setStandardSource(String standardSource) {
        this.standardSource = standardSource;
    }

    public String getSynonyms() {
        return synonyms;
    }

    public void setSynonyms(String synonyms) {
        this.synonyms = synonyms;
    }

    public String getRelatedOldStandard() {
        return relatedOldStandard;
    }

    public void setRelatedOldStandard(String relatedOldStandard) {
        this.relatedOldStandard = relatedOldStandard;
    }

    public String getAuthoritativeSystem() {
        return authoritativeSystem;
    }

    public void setAuthoritativeSystem(String authoritativeSystem) {
        this.authoritativeSystem = authoritativeSystem;
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }

    public String getCreateTime() {
        return createTime;
    }

    public void setCreateTime(String createTime) {
        this.createTime = createTime;
    }

    public String getLastUpdateTime() {
        return lastUpdateTime;
    }

    public void setLastUpdateTime(String lastUpdateTime) {
        this.lastUpdateTime = lastUpdateTime;
    }

    public String getPublishTime() {
        return publishTime;
    }

    public void setPublishTime(String publishTime) {
        this.publishTime = publishTime;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public String getDataLength() {
        return dataLength;
    }

    public void setDataLength(String dataLength) {
        this.dataLength = dataLength;
    }

    public String getDataPrecision() {
        return dataPrecision;
    }

    public void setDataPrecision(String dataPrecision) {
        this.dataPrecision = dataPrecision;
    }

    public String getDataFormat() {
        return dataFormat;
    }

    public void setDataFormat(String dataFormat) {
        this.dataFormat = dataFormat;
    }

    public String getMinValue() {
        return minValue;
    }

    public void setMinValue(String minValue) {
        this.minValue = minValue;
    }

    public String getMaxValue() {
        return maxValue;
    }

    public void setMaxValue(String maxValue) {
        this.maxValue = maxValue;
    }

    public String getRelatedTermCode() {
        return relatedTermCode;
    }

    public void setRelatedTermCode(String relatedTermCode) {
        this.relatedTermCode = relatedTermCode;
    }

    public String getMeasurementUnit() {
        return measurementUnit;
    }

    public void setMeasurementUnit(String measurementUnit) {
        this.measurementUnit = measurementUnit;
    }

    public String getRelatedClassWord() {
        return relatedClassWord;
    }

    public void setRelatedClassWord(String relatedClassWord) {
        this.relatedClassWord = relatedClassWord;
    }
}
