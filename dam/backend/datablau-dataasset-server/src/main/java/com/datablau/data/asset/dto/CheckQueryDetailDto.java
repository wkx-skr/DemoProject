package com.datablau.data.asset.dto;

import java.io.Serializable;
import java.util.List;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-09 10:50
 * @description
 */
public class CheckQueryDetailDto extends CheckQueryDto implements Serializable {


    private int page = 0;
    private int size = 10;

    private List<SortParam> sortParams;// 支持多个排序字段


    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public List<SortParam> getSortParams() {
        return sortParams;
    }

    public void setSortParams(List<SortParam> sortParams) {
        this.sortParams = sortParams;
    }
}
