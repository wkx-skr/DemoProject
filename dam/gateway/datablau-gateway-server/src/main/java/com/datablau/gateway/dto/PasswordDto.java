package com.datablau.gateway.dto;

import java.io.Serializable;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2021/8/5 17:13
 */
public class PasswordDto implements Serializable {
    private String newPassword;
    private String oldPassword;

    private String username;

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }

    public String getOldPassword() {
        return oldPassword;
    }

    public void setOldPassword(String oldPassword) {
        this.oldPassword = oldPassword;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
