package com.datablau.domain.management.dto;

import java.io.Serializable;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-09 16:24
 * @description
 */
public class BatchConfirmConfigSaveDto implements Serializable {
    private Long id;
    private String domainName;
    private String confirmUser1;
    private String confirmUser2;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
