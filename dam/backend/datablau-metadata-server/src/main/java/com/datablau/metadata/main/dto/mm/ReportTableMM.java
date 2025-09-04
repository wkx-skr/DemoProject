package com.datablau.metadata.main.dto.mm;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;

/**
 *
 * @author: hxs
 * @date: 2025/4/19 12:24
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ReportTableMM implements Serializable {

    @JsonProperty("tableName")
    private String tableName;

    @JsonProperty("index")
    private Boolean index;

    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public Boolean getIndex() {
        return index;
    }

    public void setIndex(Boolean index) {
        this.index = index;
    }
}
