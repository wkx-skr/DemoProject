package com.datablau.project.api.dto;

import java.io.Serializable;

/**
 *
 * @author: hxs
 * @date: 2025/4/23 11:02
 * archy对象绑定的模型当前版本和最新版本
 */
public class DdmModelVersionDto implements Serializable {
    private static final long serialVersionUID = -2042594741898048121L;

    private Long modelId;
    private Long modelVersionId;
    //archy绑定的模型版本名称
    private String modelVersionName;

    //模型最新版本VersionId
    private Long modelCurrentVersionId;
    //archy绑定的模型最新版本
    private String modelVersionCurrentName;

    //模型的endVersion
    private Long modelEndVer;

    public Long getModelId() {
        return modelId;
    }

    public void setModelId(Long modelId) {
        this.modelId = modelId;
    }

    public String getModelVersionName() {
        return modelVersionName;
    }

    public void setModelVersionName(String modelVersionName) {
        this.modelVersionName = modelVersionName;
    }

    public String getModelVersionCurrentName() {
        return modelVersionCurrentName;
    }

    public void setModelVersionCurrentName(String modelVersionCurrentName) {
        this.modelVersionCurrentName = modelVersionCurrentName;
    }

    public Long getModelVersionId() {
        return modelVersionId;
    }

    public void setModelVersionId(Long modelVersionId) {
        this.modelVersionId = modelVersionId;
    }

    public Long getModelCurrentVersionId() {
        return modelCurrentVersionId;
    }

    public void setModelCurrentVersionId(Long modelCurrentVersionId) {
        this.modelCurrentVersionId = modelCurrentVersionId;
    }

    public Long getModelEndVer() {
        return modelEndVer;
    }

    public void setModelEndVer(Long modelEndVer) {
        this.modelEndVer = modelEndVer;
    }
}
