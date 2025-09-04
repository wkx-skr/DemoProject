package com.datablau.security.management.dto;

import java.io.Serializable;
import java.util.List;

public class UserWesisDto implements Serializable {

    private String accountNo;

    private String userName;

    private Integer gender;

    private String mobile;

    private String email;

    private String password;

    private Integer actionFlag;

    private List<OrganizationWesisDto> orgs;


    public String getAccountNo() {
        return accountNo;
    }

    public void setAccountNo(String accountNo) {
        this.accountNo = accountNo;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Integer getGender() {
        return gender;
    }

    public void setGender(Integer gender) {
        this.gender = gender;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Integer getActionFlag() {
        return actionFlag;
    }

    public void setActionFlag(Integer actionFlag) {
        this.actionFlag = actionFlag;
    }

    public List<OrganizationWesisDto> getOrgs() {
        return orgs;
    }

    public void setOrgs(List<OrganizationWesisDto> orgs) {
        this.orgs = orgs;
    }
}
