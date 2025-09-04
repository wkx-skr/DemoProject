package com.datablau.metadata.main.dto.mm;

import java.io.Serializable;

public class IndexMM implements Serializable {

    private static final long serialVersionUID = 1L;

    private String businessDomain;
    private String themeDomain;
    private String limitedConditions;
    private String indexCode;
    private String indexName;
    private String indexType;
    private String measure;
    private String indexUnit;
    private String cycleTime;
    private String resourceTable;
    private String resourceIndex;
    private String dimensionMM;

    private String indexMeaning;
    private String indexLogic;
    private String indexLevel;
    private String securityLevel;
    private String sourceDepartment;
    private String technicaler;

    private String applicationName;


    public String getBusinessDomain() {
        return businessDomain;
    }

    public void setBusinessDomain(String businessDomain) {
        this.businessDomain = businessDomain;
    }

    public String getThemeDomain() {
        return themeDomain;
    }

    public void setThemeDomain(String themeDomain) {
        this.themeDomain = themeDomain;
    }

    public String getLimitedConditions() {
        return limitedConditions;
    }

    public void setLimitedConditions(String limitedConditions) {
        this.limitedConditions = limitedConditions;
    }

    public String getIndexCode() {
        return indexCode;
    }

    public void setIndexCode(String indexCode) {
        this.indexCode = indexCode;
    }

    public String getIndexName() {
        return indexName;
    }

    public void setIndexName(String indexName) {
        this.indexName = indexName;
    }

    public String getIndexType() {
        return indexType;
    }

    public void setIndexType(String indexType) {
        this.indexType = indexType;
    }

    public String getMeasure() {
        return measure;
    }

    public void setMeasure(String measure) {
        this.measure = measure;
    }

    public String getIndexUnit() {
        return indexUnit;
    }

    public void setIndexUnit(String indexUnit) {
        this.indexUnit = indexUnit;
    }

    public String getCycleTime() {
        return cycleTime;
    }

    public void setCycleTime(String cycleTime) {
        this.cycleTime = cycleTime;
    }

    public String getIndexMeaning() {
        return indexMeaning;
    }

    public void setIndexMeaning(String indexMeaning) {
        this.indexMeaning = indexMeaning;
    }

    public String getIndexLogic() {
        return indexLogic;
    }

    public void setIndexLogic(String indexLogic) {
        this.indexLogic = indexLogic;
    }

    public String getIndexLevel() {
        return indexLevel;
    }

    public void setIndexLevel(String indexLevel) {
        this.indexLevel = indexLevel;
    }

    public String getSecurityLevel() {
        return securityLevel;
    }

    public void setSecurityLevel(String securityLevel) {
        this.securityLevel = securityLevel;
    }

    public String getSourceDepartment() {
        return sourceDepartment;
    }

    public void setSourceDepartment(String sourceDepartment) {
        this.sourceDepartment = sourceDepartment;
    }

    public String getTechnicaler() {
        return technicaler;
    }

    public void setTechnicaler(String technicaler) {
        this.technicaler = technicaler;
    }

    public String getResourceTable() {
        return resourceTable;
    }

    public void setResourceTable(String resourceTable) {
        this.resourceTable = resourceTable;
    }

    public String getResourceIndex() {
        return resourceIndex;
    }

    public void setResourceIndex(String resourceIndex) {
        this.resourceIndex = resourceIndex;
    }

    public String getDimensionMM() {
        return dimensionMM;
    }

    public void setDimensionMM(String dimensionMM) {
        this.dimensionMM = dimensionMM;
    }

    public String getApplicationName() {
        return applicationName;
    }

    public void setApplicationName(String applicationName) {
        this.applicationName = applicationName;
    }
}
