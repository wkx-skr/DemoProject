package com.datablau.domain.management.dto;

import java.io.Serializable;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-08-05 17:31
 * @description
 */
public class SingleApplyInfo implements Serializable {


    private Long batchId;
//    private Integer approvalStatus;
    private String flowApprover;


    public Long getBatchId() {
        return batchId;
    }

    public void setBatchId(Long batchId) {
        this.batchId = batchId;
    }

//    public Integer getApprovalStatus() {
//        return approvalStatus;
//    }
//
//    public void setApprovalStatus(Integer approvalStatus) {
//        this.approvalStatus = approvalStatus;
//    }

    public String getFlowApprover() {
        return flowApprover;
    }

    public void setFlowApprover(String flowApprover) {
        this.flowApprover = flowApprover;
    }


    @Override
    public String toString() {
        return "SingleApplyInfo{" +
                "batchId=" + batchId +
                ", flowApprover='" + flowApprover + '\'' +
                '}';
    }
}
