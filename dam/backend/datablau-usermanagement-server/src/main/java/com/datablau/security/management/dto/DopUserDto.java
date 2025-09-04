package com.datablau.security.management.dto;

import java.io.Serializable;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-04 17:08
 * @description
 */
public class DopUserDto implements Serializable {
    private String username;

    private String sign;

    public DopUserDto() {
    }

    public DopUserDto(String username, String sign) {
        this.username = username;
        this.sign = sign;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getSign() {
        return sign;
    }

    public void setSign(String sign) {
        this.sign = sign;
    }


    @Override
    public String toString() {
        return "DopUserDto{" +
                "username='" + username + '\'' +
                ", sign='" + sign + '\'' +
                '}';
    }
}
