package com.datablau.metadata.main.dto.mm;

import java.io.Serializable;

public class DimensionMM implements Serializable {

    private static final long serialVersionUID = 1L;

    private String dimensionCode;
    private String dimensionName;
    private String dimensionDescription;

    public String getDimensionCode() {
        return dimensionCode;
    }

    public void setDimensionCode(String dimensionCode) {
        this.dimensionCode = dimensionCode;
    }

    public String getDimensionName() {
        return dimensionName;
    }

    public void setDimensionName(String dimensionName) {
        this.dimensionName = dimensionName;
    }

    public String getDimensionDescription() {
        return dimensionDescription;
    }

    public void setDimensionDescription(String dimensionDescription) {
        this.dimensionDescription = dimensionDescription;
    }
}
