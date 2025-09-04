package com.datablau.domain.management.dto;

import java.io.Serializable;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-15 13:23
 * @description
 */
public class ApplyMessageDto implements Serializable {

    private String code;

    private String msg;

    private Boolean data;

    public ApplyMessageDto() {
    }

    public ApplyMessageDto(String code, String msg, Boolean data) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public Boolean getData() {
        return data;
    }

    public void setData(Boolean data) {
        this.data = data;
    }
}
