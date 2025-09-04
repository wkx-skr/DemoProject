package com.datablau.data.asset.dto;

import java.io.Serializable;

public class DdmCollectElementTaskParamDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long ddmModelId;

    private String ddmModelName;

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
}
