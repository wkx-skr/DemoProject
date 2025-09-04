package com.datablau.data.asset.dto;

import java.io.Serializable;

public class LabelDropInspectionQueryParamDto implements Serializable {
    private static final long serialVersionUID = 1L;

    //目录空间id
    private Long structureId;

    //业务域id
    private Long businessDomainId;

    //主题域id
    private Long subjectDomainId;

    //业务对象id
    private Long businessObjectId;

    //系统id
    private Long modelCategoryId;

    //模型id
    private Long ddmModelId;

    private Long parentModelId;

    public Long getParentModelId() {
        return parentModelId;
    }

    public void setParentModelId(Long parentModelId) {
        this.parentModelId = parentModelId;
    }

    public Long getStructureId() {
        return structureId;
    }

    public void setStructureId(Long structureId) {
        this.structureId = structureId;
    }

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

    public Long getModelCategoryId() {
        return modelCategoryId;
    }

    public void setModelCategoryId(Long modelCategoryId) {
        this.modelCategoryId = modelCategoryId;
    }

    public Long getDdmModelId() {
        return ddmModelId;
    }

    public void setDdmModelId(Long ddmModelId) {
        this.ddmModelId = ddmModelId;
    }
}
