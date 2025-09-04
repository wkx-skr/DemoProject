package com.datablau.domain.management.dto;

import java.io.Serializable;
import java.util.List;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-08-07 11:06
 * @description
 */
public class BatchApplyBindDto implements Serializable {


    private String approvalId;

    private List<Long> batchId;

    public String getApprovalId() {
        return approvalId;
    }

    public void setApprovalId(String approvalId) {
        this.approvalId = approvalId;
    }

    public List<Long> getBatchId() {
        return batchId;
    }

    public void setBatchId(List<Long> batchId) {
        this.batchId = batchId;
    }
}
