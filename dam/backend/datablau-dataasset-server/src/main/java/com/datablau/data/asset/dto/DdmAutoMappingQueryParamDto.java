package com.datablau.data.asset.dto;

import java.io.Serializable;

public class DdmAutoMappingQueryParamDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long businessDomainId;

    private Long subjectDomainId;

    private Long businessObjectId;


    public Long getBusinessDomainId() {
        return businessDomainId;
    }

    public void setBusinessDomainId(Long businessDomainId) {
        this.businessDomainId = businessDomainId;
    }

    public Long getSubjectDomainId() {
        return subjectDomainId;
    }

    public void setSubjectDomainId(Long subjectDomainId) {
        this.subjectDomainId = subjectDomainId;
    }

    public Long getBusinessObjectId() {
        return businessObjectId;
    }

    public void setBusinessObjectId(Long businessObjectId) {
        this.businessObjectId = businessObjectId;
    }
}
