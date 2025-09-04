package com.datablau.domain.management.dto;

import java.io.Serializable;
import java.util.List;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-18 09:52
 * @description
 */
public class PubBatchApplyDto implements Serializable {

    private List<PubBatchApplyChildDto>  data;

    private String type;

    private String creator;

    public List<PubBatchApplyChildDto> getData() {
        return data;
    }

    public void setData(List<PubBatchApplyChildDto> data) {
        this.data = data;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }
}
