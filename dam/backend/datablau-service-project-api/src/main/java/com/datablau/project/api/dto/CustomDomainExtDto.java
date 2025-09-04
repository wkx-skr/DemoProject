package com.datablau.project.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.io.Serializable;

public class CustomDomainExtDto implements Serializable {
    @Schema(
            title = "数据标准id",
            description = "数据标准id"
    )
    private String domainId;
    @Schema(
            title = "数据标准编码",
            description = "数据标准编码"
    )
    private String domainCode;
    @Schema(
            title = "中文名字",
            description = "中文名字"
    )
    private String chineseName;
    @Schema(
            title = "英文名字",
            description = "英文名字"
    )
    private String englishName;
    @Schema(
            title = "版本",
            description = "版本"
    )
    private Integer version;

    @Schema(
            title = "关联编码",
            description = "关联编码"
    )
    private String referenceCode;

    @Schema(
            title = "数据类型",
            description = "数据类型"
    )
    private String dataType;
    @Schema(
            title = "格式化数据",
            description = "格式化数据"
    )
    private String dataFormat;

    /******************************************************************************************************************/
    @Schema(
            title = "关联编码名称",
            description = "关联编码名称"
    )
    private String referenceCodeName;

    @Schema(title = "关联编码版本", description = "关联编码版本")
    private Integer referenceCodeVersion;

    @Schema(
            title = "最大值",
            description = "最大值"
    )
    private Integer maxValue;
    @Schema(
            title = "最小值",
            description = "最小值"
    )
    private Integer minValue;

    @Schema(
            title = "关联术语",
            description = "关联术语"
    )
    private String referenceTerm;

    @Schema(
            title = "数据长度",
            description = "数据长度"
    )
    private Integer dataScale;
    @Schema(
            title = "数据精度",
            description = "数据精度"
    )
    private Integer dataPrecision;

    public Integer getDataScale() {
        return dataScale;
    }

    public void setDataScale(Integer dataScale) {
        this.dataScale = dataScale;
    }

    public Integer getDataPrecision() {
        return dataPrecision;
    }

    public void setDataPrecision(Integer dataPrecision) {
        this.dataPrecision = dataPrecision;
    }

    public String getDomainId() {
        return domainId;
    }

    public void setDomainId(String domainId) {
        this.domainId = domainId;
    }

    public String getDomainCode() {
        return domainCode;
    }

    public void setDomainCode(String domainCode) {
        this.domainCode = domainCode;
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

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public String getReferenceCode() {
        return referenceCode;
    }

    public void setReferenceCode(String referenceCode) {
        this.referenceCode = referenceCode;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public String getDataFormat() {
        return dataFormat;
    }

    public void setDataFormat(String dataFormat) {
        this.dataFormat = dataFormat;
    }

    public String getReferenceCodeName() {
        return referenceCodeName;
    }

    public void setReferenceCodeName(String referenceCodeName) {
        this.referenceCodeName = referenceCodeName;
    }

    public Integer getReferenceCodeVersion() {
        return referenceCodeVersion;
    }

    public void setReferenceCodeVersion(Integer referenceCodeVersion) {
        this.referenceCodeVersion = referenceCodeVersion;
    }

    public Integer getMaxValue() {
        return maxValue;
    }

    public void setMaxValue(Integer maxValue) {
        this.maxValue = maxValue;
    }

    public Integer getMinValue() {
        return minValue;
    }

    public void setMinValue(Integer minValue) {
        this.minValue = minValue;
    }

    public String getReferenceTerm() {
        return referenceTerm;
    }

    public void setReferenceTerm(String referenceTerm) {
        this.referenceTerm = referenceTerm;
    }

    @Override
    public String toString() {
        return "CustomDomainExtDto{" +
                "domainId='" + domainId + '\'' +
                ", domainCode='" + domainCode + '\'' +
                ", chineseName='" + chineseName + '\'' +
                ", englishName='" + englishName + '\'' +
                ", version=" + version +
                ", referenceCode='" + referenceCode + '\'' +
                ", dataType='" + dataType + '\'' +
                ", dataFormat='" + dataFormat + '\'' +
                ", referenceCodeName='" + referenceCodeName + '\'' +
                ", referenceCodeVersion=" + referenceCodeVersion +
                ", maxValue=" + maxValue +
                ", minValue=" + minValue +
                ", referenceTerm='" + referenceTerm + '\'' +
                '}';
    }
}
