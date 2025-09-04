package com.datablau.domain.management.dto;

import java.io.Serializable;
import java.util.List;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-26 13:27
 * @description
 */
public class BatchConfirmRequestDto implements Serializable {

    private List<Long> batchIds;

    public List<Long> getBatchIds() {
        return batchIds;
    }

    public void setBatchIds(List<Long> batchIds) {
        this.batchIds = batchIds;
    }

}
