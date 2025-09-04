package com.datablau.data.asset.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.io.Serializable;
import java.util.Date;

public class DdmModelCollectDto implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(name = "模型id")
    private Long ddmModelId;
    @Schema(name = "模型名称")
    private String ddmModelName;
    @Schema(name = "数据库类型")
    private String dbType;

    @Schema(name = "任务ID")
    private Long jobId;

    @Schema(name = "应用系统ID")
    private Long modelCategoryId;
    @Schema(name = "应用系统名")
    private String modelCategoryName;
    @Schema(name = "更新时间")
    private String updateTime;

    @Schema(name = "是否关联业务系统")
    private Boolean relModelCategory;
    @Schema(name = "是否有采集任务")
    private Boolean collectTask;


    public Long getDdmModelId() {
        return ddmModelId;
    }

    public void setDdmModelId(Long ddmModelId) {
        this.ddmModelId = ddmModelId;
    }

    public String getDdmModelName() {
        return ddmModelName;
    }

    public void setDdmModelName(String ddmModelName) {
        this.ddmModelName = ddmModelName;
    }

    public String getDbType() {
        return dbType;
    }

    public void setDbType(String dbType) {
        this.dbType = dbType;
    }

    public Boolean getRelModelCategory() {
        return relModelCategory;
    }

    public void setRelModelCategory(Boolean relModelCategory) {
        this.relModelCategory = relModelCategory;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public Long getModelCategoryId() {
        return modelCategoryId;
    }

    public void setModelCategoryId(Long modelCategoryId) {
        this.modelCategoryId = modelCategoryId;
    }

    public String getModelCategoryName() {
        return modelCategoryName;
    }

    public void setModelCategoryName(String modelCategoryName) {
        this.modelCategoryName = modelCategoryName;
    }

    public Boolean getCollectTask() {
        return collectTask;
    }

    public void setCollectTask(Boolean collectTask) {
        this.collectTask = collectTask;
    }

    public String getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(String updateTime) {
        this.updateTime = updateTime;
    }
}
