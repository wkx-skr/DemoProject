package com.datablau.data.asset.dto;

import java.io.Serializable;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-09 11:11
 * @description
 */
public class SortParam implements Serializable {
    private String field;       // 排序字段，例如：cnCommentRate
    private String direction;

    public String getField() {
        return field;
    }

    public void setField(String field) {
        this.field = field;
    }

    public String getDirection() {
        return direction;
    }

    public void setDirection(String direction) {
        this.direction = direction;
    }
}
