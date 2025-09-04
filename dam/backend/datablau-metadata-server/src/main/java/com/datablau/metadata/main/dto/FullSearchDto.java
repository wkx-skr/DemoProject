package com.datablau.metadata.main.dto;

import java.io.Serializable;
import java.util.List;

/**
 * @author: hxs
 * @date: 2025/4/12 14:05
 */
public class FullSearchDto implements Serializable {
    private int currentPage;
    private int pageSize;
    private Long typeId;
    private List<Long> objectIds;
    private Long modelId;

    public int getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public Long getTypeId() {
        return typeId;
    }

    public void setTypeId(Long typeId) {
        this.typeId = typeId;
    }

    public List<Long> getObjectIds() {
        return objectIds;
    }

    public void setObjectIds(List<Long> objectIds) {
        this.objectIds = objectIds;
    }

    public Long getModelId() {
        return modelId;
    }

    public void setModelId(Long modelId) {
        this.modelId = modelId;
    }
}
