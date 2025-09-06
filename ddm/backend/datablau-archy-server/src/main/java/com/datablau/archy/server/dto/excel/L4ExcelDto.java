package com.datablau.archy.server.dto.excel;

import com.andorj.model.common.annotation.ExcelColumn;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Objects;

/**
 * @author: hxs
 * @date: 2025/5/8 10:50
 * 逻辑数据实体
 */
public class L4ExcelDto implements Serializable {
    @ExcelColumn(columnNames = "业务对象中文名", columnAlias = "objectName")
    private String objectName;

    @ExcelColumn(columnNames = "逻辑数据实体编码", columnAlias = "entityCode")
    private String entityCode;

    @ExcelColumn(columnNames = "逻辑数据实体中文名", columnAlias = "entityName")
    private String entityName;

    @ExcelColumn(columnNames = "逻辑数据实体英文名", columnAlias = "entityEnglishName")
    private String entityEnglishName;

    @ExcelColumn(columnNames = "逻辑数据实体定义", columnAlias = "entityDescription")
    private String entityDescription;

    @ExcelColumn(columnNames = "来源系统", columnAlias = "entitySourceSystem")
    private String entitySourceSystem;

    @ExcelColumn(columnNames = "数据管家", columnAlias = "entityDataSteward")
    private String entityDataSteward;

    @ExcelColumn(columnNames = "数据分类", columnAlias = "entityDataClassification")
    private String entityDataClassification;

    private ArrayList<L5ExcelDto> subAttrs = new ArrayList<>();

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

    public ArrayList<L5ExcelDto> getSubAttrs() {
        return subAttrs;
    }

    public void setSubAttrs(ArrayList<L5ExcelDto> subAttrs) {
        this.subAttrs = subAttrs;
    }

    public void addSubAttr(L5ExcelDto subAttr) {
        this.subAttrs.add(subAttr);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true; // 同一个引用
        if (obj == null || getClass() != obj.getClass()) return false;
        L4ExcelDto l4ExcelDto = (L4ExcelDto) obj;
        return objectName.equals(l4ExcelDto.objectName) && entityCode.equals(l4ExcelDto.entityCode)
                && entityName.equals(l4ExcelDto.entityName) && entityEnglishName.equals(l4ExcelDto.entityEnglishName)
                && entityDescription.equals(l4ExcelDto.entityDescription) && entitySourceSystem.equals(l4ExcelDto.entitySourceSystem)
                && entityDataSteward.equals(l4ExcelDto.entityDataSteward) && entityDataClassification.equals(l4ExcelDto.entityDataClassification);
    }

    @Override
    public int hashCode() {
        return Objects.hash(objectName, entityCode, entityName, entityEnglishName, entityDescription, entitySourceSystem, entityDataSteward, entityDataClassification);
    }
}
