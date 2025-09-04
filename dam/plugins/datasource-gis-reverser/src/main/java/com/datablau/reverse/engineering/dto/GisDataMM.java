package com.datablau.reverse.engineering.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.io.Serializable;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GisDataMM implements Serializable {
    private static final long serialVersionUID = 1L;

    private String dl1BusinessDomain;
    private String dl2ThemeDomain;
    private String systemName;
    private String dataMaster;
    private String dataSteward;
    private String resourceName;
    private String resourceDescription;
    private String serviceType;
    private String spatialRange;
    private String timeFrame;
    private String resourceType;
    private String dataResourceFormat;
    private String coordinateSystem;
    private String scale;
    private String storagePath;
//    private String resourceSize;
    private String dataUpdateCycle; //数据更新周期
    private String securityLevel;
    private String createTime; //数据发布日期

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

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public String getResourceDescription() {
        return resourceDescription;
    }

    public void setResourceDescription(String resourceDescription) {
        this.resourceDescription = resourceDescription;
    }

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public String getSpatialRange() {
        return spatialRange;
    }

    public void setSpatialRange(String spatialRange) {
        this.spatialRange = spatialRange;
    }

    public String getTimeFrame() {
        return timeFrame;
    }

    public void setTimeFrame(String timeFrame) {
        this.timeFrame = timeFrame;
    }

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public String getDataResourceFormat() {
        return dataResourceFormat;
    }

    public void setDataResourceFormat(String dataResourceFormat) {
        this.dataResourceFormat = dataResourceFormat;
    }

    public String getCoordinateSystem() {
        return coordinateSystem;
    }

    public void setCoordinateSystem(String coordinateSystem) {
        this.coordinateSystem = coordinateSystem;
    }

    public String getScale() {
        return scale;
    }

    public void setScale(String scale) {
        this.scale = scale;
    }

    public String getStoragePath() {
        return storagePath;
    }

    public void setStoragePath(String storagePath) {
        this.storagePath = storagePath;
    }
//
//    public String getResourceSize() {
//        return resourceSize;
//    }
//
//    public void setResourceSize(String resourceSize) {
//        this.resourceSize = resourceSize;
//    }

    public String getDataUpdateCycle() {
        return dataUpdateCycle;
    }

    public void setDataUpdateCycle(String dataUpdateCycle) {
        this.dataUpdateCycle = dataUpdateCycle;
    }

    public String getCreateTime() {
        return createTime;
    }

    public void setCreateTime(String createTime) {
        this.createTime = createTime;
    }

    public String getSecurityLevel() {
        return securityLevel;
    }

    public void setSecurityLevel(String securityLevel) {
        this.securityLevel = securityLevel;
    }


}
