package com.datablau.archy.server.dto.excel;

import com.andorj.model.common.annotation.ExcelColumn;

import java.io.Serializable;

/**
 * @author: hxs
 * @date: 2025/5/8 11:09
 * 业务属性导入
 */
public class L5ExcelDto implements Serializable {

    @ExcelColumn(columnNames = "业务对象中文名", columnAlias = "objectName")
    private String objectName;

    @ExcelColumn(columnNames = "逻辑实体中文名", columnAlias = "entityName")
    private String entityName;

    @ExcelColumn(columnNames = "属性中文名", columnAlias = "attrName")
    private String attrName;

    @ExcelColumn(columnNames = "属性英文名", columnAlias = "attrEnglishName")
    private String attrEnglishName;

    @ExcelColumn(columnNames = "业务定义", columnAlias = "attrDescription")
    private String attrDescription;

    @ExcelColumn(columnNames = "是否必填", columnAlias = "attrNull")
    private String attrNull;

    @ExcelColumn(columnNames = "标准数据元中文名", columnAlias = "attrDomainName")
    private String attrDomainName;

    @ExcelColumn(columnNames = "主键", columnAlias = "attrPk")
    private String attrPk;

    @ExcelColumn(columnNames = "默认值", columnAlias = "attrDefaultValue")
    private String attrDefaultValue;

    @ExcelColumn(columnNames = "属性数据类型", columnAlias = "attrDataType")
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

    public String getAttrDomainName() {
        return attrDomainName;
    }

    public void setAttrDomainName(String attrDomainName) {
        this.attrDomainName = attrDomainName;
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
