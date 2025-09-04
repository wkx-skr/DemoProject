package com.datablau.security.management.dto;

import java.io.Serializable;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-15 10:51
 * @description
 */
public class DopTokenDto implements Serializable {

    private String state;

    private String dataToken;


    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getDataToken() {
        return dataToken;
    }

    public void setDataToken(String dataToken) {
        this.dataToken = dataToken;
    }
}
