package com.datablau.archy.server.dto;

/**
 * @author: hxs
 * @date: 2025/8/19 14:24
 */
public class ColumnCompareResultDto {

    //类型
    private String type;

    //业务对象名称
    private String objectName;

    //实体名
    private String tableName;

    //属性名
    private String columnName;

    //属性中文名
    private String columnChName;

    //属性英文名
    private String columnEnName;

    //属性数据类型
    private String dataType;

    //属性定义
    private String definition;

    //主键
    private String pk;

    //非空
    private String notNull;

    //默认值
    private String defaultValue;

    public String getColumnEnName() {
        return columnEnName;
    }

    public void setColumnEnName(String columnEnName) {
        this.columnEnName = columnEnName;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getObjectName() {
        return objectName;
    }

    public void setObjectName(String objectName) {
        this.objectName = objectName;
    }

    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public String getColumnName() {
        return columnName;
    }

    public void setColumnName(String columnName) {
        this.columnName = columnName;
    }

    public String getColumnChName() {
        return columnChName;
    }

    public void setColumnChName(String columnChName) {
        this.columnChName = columnChName;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public String getDefinition() {
        return definition;
    }

    public void setDefinition(String definition) {
        this.definition = definition;
    }

    public String getPk() {
        return pk;
    }

    public void setPk(String pk) {
        this.pk = pk;
    }

    public String getNotNull() {
        return notNull;
    }

    public void setNotNull(String notNull) {
        this.notNull = notNull;
    }

    public String getDefaultValue() {
        return defaultValue;
    }

    public void setDefaultValue(String defaultValue) {
        this.defaultValue = defaultValue;
    }
}
