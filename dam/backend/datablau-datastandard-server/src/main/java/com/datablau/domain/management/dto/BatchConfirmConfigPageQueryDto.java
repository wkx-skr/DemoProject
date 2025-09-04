package com.datablau.domain.management.dto;

import java.io.Serializable;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-09 16:25
 * @description
 */
public class BatchConfirmConfigPageQueryDto implements Serializable {

    private Integer pageNum = 1;
    private Integer pageSize = 20;
    private String domainName;
    private String confirmUser1;
    private String confirmUser2;

    public Integer getPageNum() {
        return pageNum;
    }

    public void setPageNum(Integer pageNum) {
        this.pageNum = pageNum;
    }

    public Integer getPageSize() {
        return pageSize;
    }

    public void setPageSize(Integer pageSize) {
        this.pageSize = pageSize;
    }

    public String getDomainName() {
        return domainName;
    }

    public void setDomainName(String domainName) {
        this.domainName = domainName;
    }

    public String getConfirmUser1() {
        return confirmUser1;
    }

    public void setConfirmUser1(String confirmUser1) {
        this.confirmUser1 = confirmUser1;
    }

    public String getConfirmUser2() {
        return confirmUser2;
    }

    public void setConfirmUser2(String confirmUser2) {
        this.confirmUser2 = confirmUser2;
    }
}
