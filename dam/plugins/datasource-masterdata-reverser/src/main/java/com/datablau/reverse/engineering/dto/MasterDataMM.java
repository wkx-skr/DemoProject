package com.datablau.reverse.engineering.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.io.Serializable;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class MasterDataMM implements Serializable {

    private static final long serialVersionUID = 1L;

    private String ip;
    private String database;
    private String schemaName;
    private String tableEnglishName;
    private String tableChineseName;
    private String businessDescription;
    private String useDescription;
    private String businessDomain;
    private String securityLevel;
    private String dataDomain;
    private String businessProcess;
    private String tableManager;
    private String creationDate;
    private String modificationDate;
    private String dataSize;
    private String dataCount;
    private String upstreamSystem;
    private String downstreamSystem;
    private List<MasterDataFieldsMM> fields;

    public String getIp() {
        return ip;
    }

    public void setIp(String ip) {
        this.ip = ip;
    }

    public String getDatabase() {
        return database;
    }

    public void setDatabase(String database) {
        this.database = database;
    }

    public String getSchemaName() {
        return schemaName;
    }

    public void setSchemaName(String schemaName) {
        this.schemaName = schemaName;
    }

    public String getTableEnglishName() {
        return tableEnglishName;
    }

    public void setTableEnglishName(String tableEnglishName) {
        this.tableEnglishName = tableEnglishName;
    }

    public String getTableChineseName() {
        return tableChineseName;
    }

    public void setTableChineseName(String tableChineseName) {
        this.tableChineseName = tableChineseName;
    }

    public String getBusinessDescription() {
        return businessDescription;
    }

    public void setBusinessDescription(String businessDescription) {
        this.businessDescription = businessDescription;
    }

    public String getUseDescription() {
        return useDescription;
    }

    public void setUseDescription(String useDescription) {
        this.useDescription = useDescription;
    }

    public String getBusinessDomain() {
        return businessDomain;
    }

    public void setBusinessDomain(String businessDomain) {
        this.businessDomain = businessDomain;
    }

    public String getSecurityLevel() {
        return securityLevel;
    }

    public void setSecurityLevel(String securityLevel) {
        this.securityLevel = securityLevel;
    }

    public String getDataDomain() {
        return dataDomain;
    }

    public void setDataDomain(String dataDomain) {
        this.dataDomain = dataDomain;
    }

    public String getBusinessProcess() {
        return businessProcess;
    }

    public void setBusinessProcess(String businessProcess) {
        this.businessProcess = businessProcess;
    }

    public String getTableManager() {
        return tableManager;
    }

    public void setTableManager(String tableManager) {
        this.tableManager = tableManager;
    }

    public String getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(String creationDate) {
        this.creationDate = creationDate;
    }

    public String getModificationDate() {
        return modificationDate;
    }

    public void setModificationDate(String modificationDate) {
        this.modificationDate = modificationDate;
    }

    public String getDataSize() {
        return dataSize;
    }

    public void setDataSize(String dataSize) {
        this.dataSize = dataSize;
    }

    public String getDataCount() {
        return dataCount;
    }

    public void setDataCount(String dataCount) {
        this.dataCount = dataCount;
    }

    public String getUpstreamSystem() {
        return upstreamSystem;
    }

    public void setUpstreamSystem(String upstreamSystem) {
        this.upstreamSystem = upstreamSystem;
    }

    public String getDownstreamSystem() {
        return downstreamSystem;
    }

    public void setDownstreamSystem(String downstreamSystem) {
        this.downstreamSystem = downstreamSystem;
    }

    public List<MasterDataFieldsMM> getFields() {
        return fields;
    }

    public void setFields(List<MasterDataFieldsMM> fields) {
        this.fields = fields;
    }
}
