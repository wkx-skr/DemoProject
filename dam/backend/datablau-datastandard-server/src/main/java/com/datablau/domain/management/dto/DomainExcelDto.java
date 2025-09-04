//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

package com.datablau.domain.management.dto;

import com.andorj.model.common.annotation.ExcelColumn;
import java.io.Serializable;
import java.util.Date;
import java.util.List;

public class DomainExcelDto implements Serializable {
    private static final long serialVersionUID = -4989228083620182339L;
    private String domainId;
    @ExcelColumn(
            columnNames = {"DomainExcelDto.domainCode"}
    )
    private String domainCode;

    @ExcelColumn(
            columnNames = {"DomainExcelDto.referenceTerm"}
    )
    private String referenceTerm;

    @ExcelColumn(
            columnNames = {"DomainExcelDto.maxValue"}
    )
    private Integer maxValue;

    @ExcelColumn(
            columnNames = {"DomainExcelDto.minValue"}
    )
    private Integer minValue;


    @ExcelColumn(
            columnNames = {"DomainExcelDto.chineseName"}
    )
    private String chineseName;
    @ExcelColumn(
            columnNames = {"DomainExcelDto.englishName"}
    )
    private String englishName;
    @ExcelColumn(
            columnNames = {"DomainExcelDto.abbreviation"}
    )
    private String abbreviation;
    @ExcelColumn(
            columnNames = {"DomainExcelDto.description"}
    )
    private String description;
    @ExcelColumn(
            columnNames = {"DomainExcelDto.businessRule"}
    )
    private String businessRule;
    @ExcelColumn(
            columnNames = {"DomainExcelDto.descriptionDepartment"}
    )
    private String descriptionDepartment;
    @ExcelColumn(
            columnNames = {"DomainExcelDto.referenceCode"}
    )
    private String referenceCode;
    @ExcelColumn(
            columnNames = {"DomainExcelDto.dataType"}
    )
    private String dataType;
    @ExcelColumn(
            columnNames = {"DomainExcelDto.dataScale"}
    )
    private Integer dataScale;
    @ExcelColumn(
            columnNames = {"DomainExcelDto.dataPrecision"}
    )
    private Integer dataPrecision;
    @ExcelColumn(
            columnNames = {"DomainExcelDto.notNullStr"}
    )
    private String notNullStr;
    private Date firstPublish;
    @ExcelColumn(
            columnNames = {"DomainExcelDto.state"}
    )
    private String state;
    @ExcelColumn(
            columnNames = {"DomainExcelDto.path"}
    )
    private String path;
    @ExcelColumn(
            columnNames = {"DomainExcelDto.paths"}
    )
    private List<String> paths;
    private Long folderId;
    private String comment;
    private String owner;
    private Long usageCount;
    private Boolean notNull;
    @ExcelColumn(
            columnNames = {"DomainExcelDto.source"}
    )
    private String source;
    @ExcelColumn(
            columnNames = {"DomainExcelDto.synonym"}
    )
    private String synonym;
    @ExcelColumn(
            columnNames = {"DomainExcelDto.relationDomain"}
    )
    private String relationDomain;
    @ExcelColumn(
            columnNames = {"DomainExcelDto.authCategoryName"}
    )
    private String authCategoryName;
    @ExcelColumn(
            columnNames = {"DomainExcelDto.rangeType"}
    )
    private String rangeType;
    @ExcelColumn(
            columnNames = {"DomainExcelDto.dataFormat"}
    )
    private String dataFormat;
    @ExcelColumn(
            columnNames = {"DomainExcelDto.ownerOrg"}
    )
    private String ownerOrg;
    @ExcelColumn(
            columnNames = {"DomainExcelDto.parentCode"}
    )
    private String parentCode;
    @ExcelColumn(
            columnNames = {"DomainExcelDto.dimCodes"}
    )
    private String dimCodes;
    @ExcelColumn(
            columnNames = {"DomainExcelDto.function"}
    )
    private String function;
    @ExcelColumn(
            columnNames = {"DomainExcelDto.measureUnit"}
    )
    private String measureUnit;
    @ExcelColumn(
            columnNames = {"DomainExcelDto.monitorObjects"}
    )
    private String monitorObjects;

    public DomainExcelDto() {
    }

    public String getPath() {
        return this.path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getDomainId() {
        return this.domainId;
    }

    public void setDomainId(String domainId) {
        this.domainId = domainId;
    }

    public String getDomainCode() {
        return this.domainCode;
    }

    public void setDomainCode(String domainCode) {
        this.domainCode = domainCode;
    }

    public String getChineseName() {
        return this.chineseName;
    }

    public void setChineseName(String chineseName) {
        this.chineseName = chineseName;
    }

    public String getEnglishName() {
        return this.englishName;
    }

    public void setEnglishName(String englishName) {
        this.englishName = englishName;
    }

    public String getAbbreviation() {
        return this.abbreviation;
    }

    public void setAbbreviation(String abbreviation) {
        this.abbreviation = abbreviation;
    }

    public String getDescription() {
        return this.description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getReferenceCode() {
        return this.referenceCode;
    }

    public void setReferenceCode(String referenceCode) {
        this.referenceCode = referenceCode;
    }

    public String getDataType() {
        return this.dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public Integer getDataScale() {
        return this.dataScale;
    }

    public void setDataScale(Integer dataScale) {
        this.dataScale = dataScale;
    }

    public Integer getDataPrecision() {
        return this.dataPrecision;
    }

    public void setDataPrecision(Integer dataPrecision) {
        this.dataPrecision = dataPrecision;
    }

    public Date getFirstPublish() {
        return this.firstPublish;
    }

    public void setFirstPublish(Date firstPublish) {
        this.firstPublish = firstPublish;
    }

    public String getState() {
        return this.state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public Long getFolderId() {
        return this.folderId;
    }

    public void setFolderId(Long folderId) {
        this.folderId = folderId;
    }

    public String getComment() {
        return this.comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Boolean getNotNull() {
        return this.notNull;
    }

    public void setNotNull(Boolean notNull) {
        this.notNull = notNull;
    }

    public String getOwner() {
        return this.owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public Long getUsageCount() {
        return this.usageCount;
    }

    public void setUsageCount(Long usageCount) {
        this.usageCount = usageCount;
    }

    public String getNotNullStr() {
        return this.notNullStr;
    }

    public void setNotNullStr(String notNullStr) {
        this.notNullStr = notNullStr;
    }

    public String getDescriptionDepartment() {
        return this.descriptionDepartment;
    }

    public void setDescriptionDepartment(String descriptionDepartment) {
        this.descriptionDepartment = descriptionDepartment;
    }

    public String getSource() {
        return this.source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getSynonym() {
        return this.synonym;
    }

    public void setSynonym(String synonym) {
        this.synonym = synonym;
    }

    public String getRelationDomain() {
        return this.relationDomain;
    }

    public void setRelationDomain(String relationDomain) {
        this.relationDomain = relationDomain;
    }

    public String getAuthCategoryName() {
        return this.authCategoryName;
    }

    public void setAuthCategoryName(String authCategoryName) {
        this.authCategoryName = authCategoryName;
    }

    public String getRangeType() {
        return this.rangeType;
    }

    public void setRangeType(String rangeType) {
        this.rangeType = rangeType;
    }

    public String getDataFormat() {
        return this.dataFormat;
    }

    public void setDataFormat(String dataFormat) {
        this.dataFormat = dataFormat;
    }

    public String getOwnerOrg() {
        return this.ownerOrg;
    }

    public void setOwnerOrg(String ownerOrg) {
        this.ownerOrg = ownerOrg;
    }

    public String getBusinessRule() {
        return this.businessRule;
    }

    public void setBusinessRule(String businessRule) {
        this.businessRule = businessRule;
    }

    public String getParentCode() {
        return this.parentCode;
    }

    public void setParentCode(String parentCode) {
        this.parentCode = parentCode;
    }

    public String getDimCodes() {
        return this.dimCodes;
    }

    public void setDimCodes(String dimCodes) {
        this.dimCodes = dimCodes;
    }

    public String getFunction() {
        return this.function;
    }

    public void setFunction(String function) {
        this.function = function;
    }

    public String getMeasureUnit() {
        return this.measureUnit;
    }

    public void setMeasureUnit(String measureUnit) {
        this.measureUnit = measureUnit;
    }

    public String getMonitorObjects() {
        return this.monitorObjects;
    }

    public void setMonitorObjects(String monitorObjects) {
        this.monitorObjects = monitorObjects;
    }

    public List<String> getPaths() {
        return this.paths;
    }

    public void setPaths(List<String> paths) {
        this.paths = paths;
    }

    public String getReferenceTerm() {
        return referenceTerm;
    }

    public void setReferenceTerm(String referenceTerm) {
        this.referenceTerm = referenceTerm;
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
}
