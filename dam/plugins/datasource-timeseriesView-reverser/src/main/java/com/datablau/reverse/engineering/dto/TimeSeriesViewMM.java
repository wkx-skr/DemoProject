package com.datablau.reverse.engineering.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.io.Serializable;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TimeSeriesViewMM implements Serializable {
    private static final long serialVersionUID = 1L;

    private String viewId;
    private String viewName;
    private String createTime;
    private String timeSeriesDataPoints;
    private String securityLevel;
    private String resourceId;
    private String pointName;
    private String comment;
    private String dl1BusinessDomain;

    public String getViewId() {
        return viewId;
    }

    public void setViewId(String viewId) {
        this.viewId = viewId;
    }

    public String getViewName() {
        return viewName;
    }

    public void setViewName(String viewName) {
        this.viewName = viewName;
    }

    public String getCreateTime() {
        return createTime;
    }

    public void setCreateTime(String createTime) {
        this.createTime = createTime;
    }

    public String getTimeSeriesDataPoints() {
        return timeSeriesDataPoints;
    }

    public void setTimeSeriesDataPoints(String timeSeriesDataPoints) {
        this.timeSeriesDataPoints = timeSeriesDataPoints;
    }

    public String getSecurityLevel() {
        return securityLevel;
    }

    public void setSecurityLevel(String securityLevel) {
        this.securityLevel = securityLevel;
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
