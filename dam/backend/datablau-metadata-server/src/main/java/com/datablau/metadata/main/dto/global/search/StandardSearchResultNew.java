package com.datablau.metadata.main.dto.global.search;

import com.datablau.metadata.main.service.elastic.wrapper.GlobalSearchWrapper;

import java.io.Serializable;

public class StandardSearchResultNew extends GlobalSearchWrapper implements Serializable {

    private static final long serialVersionUID = 1L;
    private Long domainUsedCount;
    private String code;
    private String domainId;
    private String domainName;

    public StandardSearchResultNew(GlobalSearchWrapper searchWrapper) {
        super(searchWrapper);
        this.code = searchWrapper.getItemId();
    }

    public Long getDomainUsedCount() {
        return domainUsedCount;
    }

    public void setDomainUsedCount(Long domainUsedCount) {
        this.domainUsedCount = domainUsedCount;
    }

    @Override
    public String getCode() {
        return code;
    }

    @Override
    public void setCode(String code) {
        this.code = code;
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
}
