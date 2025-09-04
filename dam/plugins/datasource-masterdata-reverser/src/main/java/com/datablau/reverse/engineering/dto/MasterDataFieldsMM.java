package com.datablau.reverse.engineering.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.io.Serializable;

@JsonIgnoreProperties(ignoreUnknown = true)
public class MasterDataFieldsMM implements Serializable {

    private static final long serialVersionUID = 1L;

    private String ip;
    private String database;
    private String schemaName;
    private String fieldCode;
    private String fieldName;
    private String fieldDescription;
    private String fieldType;
    private String fieldLength;
    private String fieldAccuracy;
    private String isPartitionField;
    private String isPrimaryKey;
    private String isForeignKey;
    private String isNull;
    private String securityLevel;
    private String defaultValue;
    private String enumeration;

    public String getIp() {
        return ip;
    }

    public void setIp(String ip) {
        this.ip = ip;
    }

    public String getDatabase() {
        return database;
    }

    public void setDatabase(String database) {
        this.database = database;
    }

    public String getSchemaName() {
        return schemaName;
    }

    public void setSchemaName(String schemaName) {
        this.schemaName = schemaName;
    }

    public String getFieldCode() {
        return fieldCode;
    }

    public void setFieldCode(String fieldCode) {
        this.fieldCode = fieldCode;
    }

    public String getFieldName() {
        return fieldName;
    }

    public void setFieldName(String fieldName) {
        this.fieldName = fieldName;
    }

    public String getFieldDescription() {
        return fieldDescription;
    }

    public void setFieldDescription(String fieldDescription) {
        this.fieldDescription = fieldDescription;
    }

    public String getFieldType() {
        return fieldType;
    }

    public void setFieldType(String fieldType) {
        this.fieldType = fieldType;
    }

    public String getFieldLength() {
        return fieldLength;
    }

    public void setFieldLength(String fieldLength) {
        this.fieldLength = fieldLength;
    }

    public String getFieldAccuracy() {
        return fieldAccuracy;
    }

    public void setFieldAccuracy(String fieldAccuracy) {
        this.fieldAccuracy = fieldAccuracy;
    }

    public String getIsPartitionField() {
        return isPartitionField;
    }

    public void setIsPartitionField(String isPartitionField) {
        this.isPartitionField = isPartitionField;
    }

    public String getIsPrimaryKey() {
        return isPrimaryKey;
    }

    public void setIsPrimaryKey(String isPrimaryKey) {
        this.isPrimaryKey = isPrimaryKey;
    }

    public String getIsForeignKey() {
        return isForeignKey;
    }

    public void setIsForeignKey(String isForeignKey) {
        this.isForeignKey = isForeignKey;
    }

    public String getIsNull() {
        return isNull;
    }

    public void setIsNull(String isNull) {
        this.isNull = isNull;
    }

    public String getSecurityLevel() {
        return securityLevel;
    }

    public void setSecurityLevel(String securityLevel) {
        this.securityLevel = securityLevel;
    }

    public String getDefaultValue() {
        return defaultValue;
    }

    public void setDefaultValue(String defaultValue) {
        this.defaultValue = defaultValue;
    }

    public String getEnumeration() {
        return enumeration;
    }

    public void setEnumeration(String enumeration) {
        this.enumeration = enumeration;
    }
}
