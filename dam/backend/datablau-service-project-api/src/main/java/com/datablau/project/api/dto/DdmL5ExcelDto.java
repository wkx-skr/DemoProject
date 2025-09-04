package com.datablau.project.api.dto;


import java.io.Serializable;

/**
 * @author: hxs
 * @date: 2025/5/9 15:15
 */
public class DdmL5ExcelDto implements Serializable {
    private String objectName;
    private String entityName;
    private String attrName;
    private String attrEnglishName;
    private String attrDescription;
    private String attrNull;
    private String attrDomainId;
    private String attrPk;
    private String attrDefaultValue;
    private String attrDataType;

    public String getObjectName() {
        return objectName;
    }

    public void setObjectName(String objectName) {
        this.objectName = objectName;
    }

    public String getEntityName() {
        return entityName;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

    public String getAttrName() {
        return attrName;
    }

    public void setAttrName(String attrName) {
        this.attrName = attrName;
    }

    public String getAttrEnglishName() {
        return attrEnglishName;
    }

    public void setAttrEnglishName(String attrEnglishName) {
        this.attrEnglishName = attrEnglishName;
    }

    public String getAttrDescription() {
        return attrDescription;
    }

    public void setAttrDescription(String attrDescription) {
        this.attrDescription = attrDescription;
    }

    public String getAttrNull() {
        return attrNull;
    }

    public void setAttrNull(String attrNull) {
        this.attrNull = attrNull;
    }

    public String getAttrDomainId() {
        return attrDomainId;
    }

    public void setAttrDomainId(String attrDomainId) {
        this.attrDomainId = attrDomainId;
    }

    public String getAttrPk() {
        return attrPk;
    }

    public void setAttrPk(String attrPk) {
        this.attrPk = attrPk;
    }

    public String getAttrDefaultValue() {
        return attrDefaultValue;
    }

    public void setAttrDefaultValue(String attrDefaultValue) {
        this.attrDefaultValue = attrDefaultValue;
    }

    public String getAttrDataType() {
        return attrDataType;
    }

    public void setAttrDataType(String attrDataType) {
        this.attrDataType = attrDataType;
    }
}
