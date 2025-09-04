package com.datablau.reverse.engineering.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.io.Serializable;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TimeSeriesModelMM implements Serializable {

    private static final long serialVersionUID = 1L;

    private String modelName;
    private String modelType;
    private String remarks;
    private String createTime;
    private String creator;
    private String securityLevel;
    private String timeSeriesDataPoints;
    private String resourceId;
    private String pointName;
    private String comment;
    private String dl1BusinessDomain;




    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public String getModelType() {
        return modelType;
    }

    public void setModelType(String modelType) {
        this.modelType = modelType;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getCreateTime() {
        return createTime;
    }

    public void setCreateTime(String createTime) {
        this.createTime = createTime;
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }

    public String getSecurityLevel() {
        return securityLevel;
    }

    public void setSecurityLevel(String securityLevel) {
        this.securityLevel = securityLevel;
    }

    public String getTimeSeriesDataPoints() {
        return timeSeriesDataPoints;
    }

    public void setTimeSeriesDataPoints(String timeSeriesDataPoints) {
        this.timeSeriesDataPoints = timeSeriesDataPoints;
    }

    public String getResourceId() {
        return resourceId;
    }

    public void setResourceId(String resourceId) {
        this.resourceId = resourceId;
    }

    public String getPointName() {
        return pointName;
    }

    public void setPointName(String pointName) {
        this.pointName = pointName;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getDl1BusinessDomain() {
        return dl1BusinessDomain;
    }

    public void setDl1BusinessDomain(String dl1BusinessDomain) {
        this.dl1BusinessDomain = dl1BusinessDomain;
    }
}
