package com.datablau.metadata.main.dto.global.search;

import java.io.Serializable;
import java.util.List;

/**
 * @description:
 * @author: huajun.li
 * @create: 2024-08-02 16:18
 **/
public class GlobalSearchQueryDto implements Serializable {

    private int currentPage = 1;
    private int pageSize = 20;

    private String keyword;

    private List<Long> itemType;

    private Long catalogLevel;

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

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }

    public List<Long> getItemType() {
        return itemType;
    }

    public void setItemType(List<Long> itemType) {
        this.itemType = itemType;
    }

    public Long getCatalogLevel() {
        return catalogLevel;
    }

    public void setCatalogLevel(Long catalogLevel) {
        this.catalogLevel = catalogLevel;
    }
}
