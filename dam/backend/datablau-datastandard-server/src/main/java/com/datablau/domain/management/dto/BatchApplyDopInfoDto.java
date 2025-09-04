package com.datablau.domain.management.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-23 10:01
 * @description dop 审批是否通过接口
 */

public class BatchApplyDopInfoDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long approvalId;
    private Long batchId;
    private Integer approvalStatus;
    private String feedBack;

    // 加上这个构造方法非常关键！
    @JsonCreator
    public BatchApplyDopInfoDto(@JsonProperty("approvalId") Long approvalId,
                                @JsonProperty("batchId") Long batchId,
                                @JsonProperty("approvalStatus") Integer approvalStatus) {
        this.approvalId = approvalId;
        this.batchId = batchId;
        this.approvalStatus = approvalStatus;
    }

    public BatchApplyDopInfoDto() {
    }

    // getter/setter 全保留
    public Long getApprovalId() {
        return approvalId;
    }

    public void setApprovalId(Long approvalId) {
        this.approvalId = approvalId;
    }

    public Long getBatchId() {
        return batchId;
    }

    public void setBatchId(Long batchId) {
        this.batchId = batchId;
    }

    public Integer getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(Integer approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public String getFeedBack() {
        return feedBack;
    }

    public void setFeedBack(String feedBack) {
        this.feedBack = feedBack;
    }

    @Override
    public String toString() {
        return "BatchApplyDopInfoDto{" +
                "approvalId=" + approvalId +
                ", batchId=" + batchId +
                ", approvalStatus=" + approvalStatus +
                '}';
    }
}

