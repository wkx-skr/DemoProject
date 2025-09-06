package com.datablau.archy.server.dto;

/**
 * @author: hxs
 * @date: 2025/8/19 14:24
 */
public class TableCompareResultDto {

    //操作类型
    private String type;

    //业务对象名称
    private String objectName;

    //实体名
    private String tableName;

    //实体中文名
    private String tableChName;

    //业务定义
    private String definition;

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

    public String getTableChName() {
        return tableChName;
    }

    public void setTableChName(String tableChName) {
        this.tableChName = tableChName;
    }

    public String getDefinition() {
        return definition;
    }

    public void setDefinition(String definition) {
        this.definition = definition;
    }
}
