/*
 * Copyright (c) 2017, Datablau. All rights reserved.
 */


package com.datablau.gateway.dto;

import java.io.Serializable;
import java.util.List;

/**
 * @author Nicky
 * @since 1.0
 */
public class UserInfoDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private String username;
    private String fullname;
    private List<String> roles;
    private Long userid;
    private String orgName;

    private Long orgId;

    /**
     * @return the username
     */
    public String getUsername() {
        return username;
    }

    /**
     * @param username the username to set
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * @return the roles
     */
    public List<String> getRoles() {
        return roles;
    }

    /**
     * @param roles the roles to set
     */
    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public Long getUserid() {
        return userid;
    }

    public void setUserid(Long userid) {
        this.userid = userid;
    }

    public String getFullname() {
        return fullname;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    public String getOrgName() {
        return orgName;
    }

    public void setOrgName(String orgName) {
        this.orgName = orgName;
    }

    public Long getOrgId() {
        return orgId;
    }

    public void setOrgId(Long orgId) {
        this.orgId = orgId;
    }
}
