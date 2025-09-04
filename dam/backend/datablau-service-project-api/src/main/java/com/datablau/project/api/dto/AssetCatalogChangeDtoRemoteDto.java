package com.datablau.project.api.dto;

import java.io.Serializable;
import java.util.List;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-19 16:54
 * @description
 */
public class AssetCatalogChangeDtoRemoteDto implements Serializable {

    private static final long serialVersionUID = 9127506451076368825L;
    private String catalogCode;
    private String applyType;
    private String directoryStructure;
    private String catalogPath;
    private String catalogType;
    private String currentStatus;
    private Long catalogId;
    private String catalogName;
    private String dataSteward;
    private String catalogKeywords;
    private String abbreviation;
    private String approverName;
    private String approver;
    private Long approverId;
    private String department;
    private String bm;
    private String butler;
    private String describe;
    private List<CatalogExtension> catalogExtensions;


    public static class CatalogExtension implements Serializable {
        private String proName;
        private String proValue;

        public CatalogExtension() {
        }

        public String getProName() {
            return this.proName;
        }

        public void setProName(String proName) {
            this.proName = proName;
        }

        public String getProValue() {
            return this.proValue;
        }

        public void setProValue(String proValue) {
            this.proValue = proValue;
        }
    }


    public String getCatalogCode() {
        return catalogCode;
    }

    public void setCatalogCode(String catalogCode) {
        this.catalogCode = catalogCode;
    }

    public String getApplyType() {
        return applyType;
    }

    public void setApplyType(String applyType) {
        this.applyType = applyType;
    }

    public String getDirectoryStructure() {
        return directoryStructure;
    }

    public void setDirectoryStructure(String directoryStructure) {
        this.directoryStructure = directoryStructure;
    }

    public String getCatalogPath() {
        return catalogPath;
    }

    public void setCatalogPath(String catalogPath) {
        this.catalogPath = catalogPath;
    }

    public String getCatalogType() {
        return catalogType;
    }

    public void setCatalogType(String catalogType) {
        this.catalogType = catalogType;
    }

    public String getCurrentStatus() {
        return currentStatus;
    }

    public void setCurrentStatus(String currentStatus) {
        this.currentStatus = currentStatus;
    }

    public Long getCatalogId() {
        return catalogId;
    }

    public void setCatalogId(Long catalogId) {
        this.catalogId = catalogId;
    }

    public String getCatalogName() {
        return catalogName;
    }

    public void setCatalogName(String catalogName) {
        this.catalogName = catalogName;
    }

    public String getDataSteward() {
        return dataSteward;
    }

    public void setDataSteward(String dataSteward) {
        this.dataSteward = dataSteward;
    }

    public String getCatalogKeywords() {
        return catalogKeywords;
    }

    public void setCatalogKeywords(String catalogKeywords) {
        this.catalogKeywords = catalogKeywords;
    }

    public String getAbbreviation() {
        return abbreviation;
    }

    public void setAbbreviation(String abbreviation) {
        this.abbreviation = abbreviation;
    }

    public String getApproverName() {
        return approverName;
    }

    public void setApproverName(String approverName) {
        this.approverName = approverName;
    }

    public String getApprover() {
        return approver;
    }

    public void setApprover(String approver) {
        this.approver = approver;
    }

    public Long getApproverId() {
        return approverId;
    }

    public void setApproverId(Long approverId) {
        this.approverId = approverId;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getBm() {
        return bm;
    }

    public void setBm(String bm) {
        this.bm = bm;
    }

    public String getButler() {
        return butler;
    }

    public void setButler(String butler) {
        this.butler = butler;
    }

    public String getDescribe() {
        return describe;
    }

    public void setDescribe(String describe) {
        this.describe = describe;
    }

    public List<CatalogExtension> getCatalogExtensions() {
        return catalogExtensions;
    }

    public void setCatalogExtensions(List<CatalogExtension> catalogExtensions) {
        this.catalogExtensions = catalogExtensions;
    }
}
