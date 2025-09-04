package com.datablau.metadata.main.dto.etldto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.io.Serializable;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class EtlJob implements Serializable {
    @JsonProperty("tenantId")
    private String tenantId;

    @JsonProperty("spaceId")
    private String spaceId;

    @JsonProperty("projectId")
    private String projectId;

    @JsonProperty("etlId")
    private String etlId;

    @JsonProperty("etlName")
    private String etlName;

    @JsonProperty("scheduleWay")
    private String scheduleWay;

    @JsonProperty("movementPeriodInfo")
    private List<MovementPeriodInfo> movementPeriodInfo;

    @JsonProperty("etlManager")
    private String etlManager;

    @JsonProperty("targetTableId")
    private List<TargetTable> targetTableId;

    @JsonProperty("upstreamEtlId")
    private List<String> upstreamEtlId;

    @JsonProperty("triggerEvents")
    private List<String> triggerEvents;

    @JsonProperty("waitEvents")
    private List<String> waitEvents;

    public String getTenantId() {
        return tenantId;
    }

    public void setTenantId(String tenantId) {
        this.tenantId = tenantId;
    }

    public String getSpaceId() {
        return spaceId;
    }

    public void setSpaceId(String spaceId) {
        this.spaceId = spaceId;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getEtlId() {
        return etlId;
    }

    public void setEtlId(String etlId) {
        this.etlId = etlId;
    }

    public String getEtlName() {
        return etlName;
    }

    public void setEtlName(String etlName) {
        this.etlName = etlName;
    }

    public String getScheduleWay() {
        return scheduleWay;
    }

    public void setScheduleWay(String scheduleWay) {
        this.scheduleWay = scheduleWay;
    }

    public List<MovementPeriodInfo> getMovementPeriodInfo() {
        return movementPeriodInfo;
    }

    public void setMovementPeriodInfo(List<MovementPeriodInfo> movementPeriodInfo) {
        this.movementPeriodInfo = movementPeriodInfo;
    }

    public String getEtlManager() {
        return etlManager;
    }

    public void setEtlManager(String etlManager) {
        this.etlManager = etlManager;
    }

    public List<TargetTable> getTargetTableId() {
        return targetTableId;
    }

    public void setTargetTableId(List<TargetTable> targetTableId) {
        this.targetTableId = targetTableId;
    }

    public List<String> getUpstreamEtlId() {
        return upstreamEtlId;
    }

    public void setUpstreamEtlId(List<String> upstreamEtlId) {
        this.upstreamEtlId = upstreamEtlId;
    }

    public List<String> getTriggerEvents() {
        return triggerEvents;
    }

    public void setTriggerEvents(List<String> triggerEvents) {
        this.triggerEvents = triggerEvents;
    }

    public List<String> getWaitEvents() {
        return waitEvents;
    }

    public void setWaitEvents(List<String> waitEvents) {
        this.waitEvents = waitEvents;
    }
}