package com.datablau.metadata.main.dto.global.search;

import com.datablau.metadata.main.service.elastic.wrapper.GlobalSearchWrapper;

import java.io.Serializable;

public class DomainSearchResult extends GlobalSearchWrapper implements Serializable {

    private static final long serialVersionUID = 1L;

    private String domainId;

    private String creator; //创建人

    public DomainSearchResult(GlobalSearchWrapper searchWrapper) {
        super(searchWrapper);
        this.domainId = searchWrapper.getItemId();
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }

    public String getDomainId() {
        return domainId;
    }

    public void setDomainId(String domainId) {
        this.domainId = domainId;
    }
}
