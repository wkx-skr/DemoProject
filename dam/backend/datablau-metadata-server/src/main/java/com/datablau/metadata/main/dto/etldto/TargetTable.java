package com.datablau.metadata.main.dto.etldto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-05-28 10:20
 * @description
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class TargetTable implements Serializable {


    @JsonProperty("tableId")
    private String tableId;

    @JsonProperty("tableSchema")
    private String tableSchema;

    @JsonProperty("tableName")
    private String tableName;


    public String getTableId() {
        return tableId;
    }

    public void setTableId(String tableId) {
        this.tableId = tableId;
    }

    public String getTableSchema() {
        return tableSchema;
    }

    public void setTableSchema(String tableSchema) {
        this.tableSchema = tableSchema;
    }

    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }
}
