package com.datablau.project.api.dto;


import java.io.Serializable;
import java.util.ArrayList;

/**
 * @author: hxs
 * @date: 2025/5/9 15:15
 */
public class DdmL4ExcelDto implements Serializable {
    private String objectName;
    private String entityCode;
    private String entityName;
    private String entityEnglishName;
    private String entityDescription;
    private String entitySourceSystem;
    private String entityDataSteward;
    private String entityDataClassification;
    private ArrayList<DdmL5ExcelDto> subAttrs = new ArrayList<>();

    public String getObjectName() {
        return objectName;
    }

    public void setObjectName(String objectName) {
        this.objectName = objectName;
    }

    public String getEntityCode() {
        return entityCode;
    }

    public void setEntityCode(String entityCode) {
        this.entityCode = entityCode;
    }

    public String getEntityName() {
        return entityName;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

    public String getEntityEnglishName() {
        return entityEnglishName;
    }

    public void setEntityEnglishName(String entityEnglishName) {
        this.entityEnglishName = entityEnglishName;
    }

    public String getEntityDescription() {
        return entityDescription;
    }

    public void setEntityDescription(String entityDescription) {
        this.entityDescription = entityDescription;
    }

    public String getEntitySourceSystem() {
        return entitySourceSystem;
    }

    public void setEntitySourceSystem(String entitySourceSystem) {
        this.entitySourceSystem = entitySourceSystem;
    }

    public String getEntityDataSteward() {
        return entityDataSteward;
    }

    public void setEntityDataSteward(String entityDataSteward) {
        this.entityDataSteward = entityDataSteward;
    }

    public String getEntityDataClassification() {
        return entityDataClassification;
    }

    public void setEntityDataClassification(String entityDataClassification) {
        this.entityDataClassification = entityDataClassification;
    }

    public ArrayList<DdmL5ExcelDto> getSubAttrs() {
        return subAttrs;
    }

    public void setSubAttrs(ArrayList<DdmL5ExcelDto> subAttrs) {
        this.subAttrs = subAttrs;
    }

    public void addSubAttr(DdmL5ExcelDto subAttr) {
        this.subAttrs.add(subAttr);
    }
}
