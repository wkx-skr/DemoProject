package com.datablau.data.asset.dto;

import java.io.Serializable;

public class DL5AttributeDto implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * dl5编码
     */
    private String dL5Code;

    /**
     * dl5中文名
     */
    private String dL5ChName;

    /**
     * dl5英文名
     */
    private String dL5EnName;

    /**
     * 是否被引用
     */
    private String dL5Status;

    public String getdL5Code() {
        return dL5Code;
    }

    public void setdL5Code(String dL5Code) {
        this.dL5Code = dL5Code;
    }

    public String getdL5ChName() {
        return dL5ChName;
    }

    public void setdL5ChName(String dL5ChName) {
        this.dL5ChName = dL5ChName;
    }

    public String getdL5EnName() {
        return dL5EnName;
    }

    public void setdL5EnName(String dL5EnName) {
        this.dL5EnName = dL5EnName;
    }

    public String getdL5Status() {
        return dL5Status;
    }

    public void setdL5Status(String dL5Status) {
        this.dL5Status = dL5Status;
    }
}
