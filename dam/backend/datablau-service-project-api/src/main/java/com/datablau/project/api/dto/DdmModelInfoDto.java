package com.datablau.project.api.dto;

import java.io.Serializable;

public class DdmModelInfoDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long ddmModelId;

    private String ddmModelName;

    private String dbType;

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
}
