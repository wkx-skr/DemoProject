package com.datablau.metadata.main.dto.mm;

import java.io.Serializable;

/**
 * @author: hxs
 * @date: 2025/5/15 15:17
 */
public class ReportTableIndex implements Serializable {
    private String indexId;
    private String indexName;

    public String getIndexId() {
        return indexId;
    }

    public void setIndexId(String indexId) {
        this.indexId = indexId;
    }

    public String getIndexName() {
        return indexName;
    }

    public void setIndexName(String indexName) {
        this.indexName = indexName;
    }
}
