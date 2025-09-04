package com.datablau.domain.management.dto;

import java.io.Serializable;

public class SkipReasonDto implements Serializable {

    private static final long serialVersionUID = 1L;

    //跳过原因
    private String reason;
    //跳过标准id
    private String domainId;
    //跳过标准名称
    private String domainName;
    //其他相似标准名称
    private String anotherDomainNames;
    //其他相似标准id
    private String anotherDomainIds;


    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDomainId() {
        return domainId;
    }

    public void setDomainId(String domainId) {
        this.domainId = domainId;
    }

    public String getDomainName() {
        return domainName;
    }

    public void setDomainName(String domainName) {
        this.domainName = domainName;
    }

    public String getAnotherDomainNames() {
        return anotherDomainNames;
    }

    public void setAnotherDomainNames(String anotherDomainNames) {
        this.anotherDomainNames = anotherDomainNames;
    }

    public String getAnotherDomainIds() {
        return anotherDomainIds;
    }

    public void setAnotherDomainIds(String anotherDomainIds) {
        this.anotherDomainIds = anotherDomainIds;
    }
}
