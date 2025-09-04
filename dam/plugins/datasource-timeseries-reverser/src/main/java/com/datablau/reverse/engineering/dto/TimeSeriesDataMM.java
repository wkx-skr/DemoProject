package com.datablau.reverse.engineering.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.io.Serializable;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TimeSeriesDataMM implements Serializable {
    private static final long serialVersionUID = 1L;


    private String dl1BusinessDomain;
    private String dl2ThemeDomain;
    private String dl3BusinessObject;
    private String sourceSystem;
    private String dataMaster;
    private String dataSteward;
    private String resourceId;
    private String resourceName;
    private String resourceSummary;
    private String dataCollectionProtocol;
    private String securityLevel;
    private List<TimeSeriesPointMM> timeSeriesPointMMList;

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

    public String getDl3BusinessObject() {
        return dl3BusinessObject;
    }

    public void setDl3BusinessObject(String dl3BusinessObject) {
        this.dl3BusinessObject = dl3BusinessObject;
    }

    public String getSourceSystem() {
        return sourceSystem;
    }

    public void setSourceSystem(String sourceSystem) {
        this.sourceSystem = sourceSystem;
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

    public String getResourceId() {
        return resourceId;
    }

    public void setResourceId(String resourceId) {
        this.resourceId = resourceId;
    }

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public String getResourceSummary() {
        return resourceSummary;
    }

    public void setResourceSummary(String resourceSummary) {
        this.resourceSummary = resourceSummary;
    }

    public String getDataCollectionProtocol() {
        return dataCollectionProtocol;
    }

    public void setDataCollectionProtocol(String dataCollectionProtocol) {
        this.dataCollectionProtocol = dataCollectionProtocol;
    }

    public String getSecurityLevel() {
        return securityLevel;
    }

    public void setSecurityLevel(String securityLevel) {
        this.securityLevel = securityLevel;
    }

    public List<TimeSeriesPointMM> getTimeSeriesPointMMList() {
        return timeSeriesPointMMList;
    }

    public void setTimeSeriesPointMMList(List<TimeSeriesPointMM> timeSeriesPointMMList) {
        this.timeSeriesPointMMList = timeSeriesPointMMList;
    }
}
