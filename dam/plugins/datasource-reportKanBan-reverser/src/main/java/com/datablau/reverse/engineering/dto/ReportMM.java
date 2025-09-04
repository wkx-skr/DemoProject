package com.datablau.reverse.engineering.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.util.List;

/**
 *
 * @author: hxs
 * @date: 2025/4/19 12:16
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ReportMM implements Serializable {
    @JsonProperty("dl1BusinessDomain")
    private String dl1BusinessDomain;

    @JsonProperty("dl2ThemeDomain")
    private String dl2ThemeDomain;

    @JsonProperty("systemName")
    private String systemName;

    @JsonProperty("reportName")
    private String reportName;

    @JsonProperty("reportRemark")
    private String reportRemark;

    @JsonProperty("updateCycle")
    private String updateCycle;

    @JsonProperty("technicaler")
    private String technicaler;

    @JsonProperty("securityLevel")
    private String securityLevel;

    @JsonProperty("dataMaster")
    private String dataMaster;

    @JsonProperty("dataSteward")
    private String dataSteward;

    @JsonProperty("reportDispay")
    private String reportDispay;

    @JsonProperty("reportType")
    private String reportType;

    @JsonProperty("publishLink")
    private String publishLink;

    @JsonProperty("reportId")
    private String reportId;

    @JsonProperty("reportItem")
    private List<ReportItemMM> reportItem;

    @JsonProperty("reportLabel")
    private String reportLabel;

    public String getDl1BusinessDomain() {
        return dl1BusinessDomain;
    }

    public void setDl1BusinessDomain(String dl1BusinessDomain) {
        this.dl1BusinessDomain = dl1BusinessDomain;
    }

    public String getDl2ThemeDomain() {
        return dl2ThemeDomain;
    }

    public void setDl2ThemeDomain(String dl2ThemeDomain) {
        this.dl2ThemeDomain = dl2ThemeDomain;
    }

    public String getSystemName() {
        return systemName;
    }

    public void setSystemName(String systemName) {
        this.systemName = systemName;
    }

    public String getReportName() {
        return reportName;
    }

    public void setReportName(String reportName) {
        this.reportName = reportName;
    }

    public String getReportRemark() {
        return reportRemark;
    }

    public void setReportRemark(String reportRemark) {
        this.reportRemark = reportRemark;
    }

    public String getUpdateCycle() {
        return updateCycle;
    }

    public void setUpdateCycle(String updateCycle) {
        this.updateCycle = updateCycle;
    }

    public String getTechnicaler() {
        return technicaler;
    }

    public void setTechnicaler(String technicaler) {
        this.technicaler = technicaler;
    }

    public String getSecurityLevel() {
        return securityLevel;
    }

    public void setSecurityLevel(String securityLevel) {
        this.securityLevel = securityLevel;
    }

    public String getDataMaster() {
        return dataMaster;
    }

    public void setDataMaster(String dataMaster) {
        this.dataMaster = dataMaster;
    }

    public String getDataSteward() {
        return dataSteward;
    }

    public void setDataSteward(String dataSteward) {
        this.dataSteward = dataSteward;
    }

    public String getReportDispay() {
        return reportDispay;
    }

    public void setReportDispay(String reportDispay) {
        this.reportDispay = reportDispay;
    }

    public String getReportType() {
        return reportType;
    }

    public void setReportType(String reportType) {
        this.reportType = reportType;
    }

    public String getPublishLink() {
        return publishLink;
    }

    public void setPublishLink(String publishLink) {
        this.publishLink = publishLink;
    }

    public String getReportId() {
        return reportId;
    }

    public void setReportId(String reportId) {
        this.reportId = reportId;
    }

    public List<ReportItemMM> getReportItem() {
        return reportItem;
    }

    public void setReportItem(List<ReportItemMM> reportItem) {
        this.reportItem = reportItem;
    }

    public String getReportLabel() {
        return reportLabel;
    }

    public void setReportLabel(String reportLabel) {
        this.reportLabel = reportLabel;
    }
}
