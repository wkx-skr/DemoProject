package com.datablau.domain.management.dto;

import java.io.Serializable;
import java.util.List;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-08-21 16:10
 * @description
 */
public class BatchApplyDopInfoBulkDto implements Serializable {

    private Long approvalId;
    private Integer approvalStatus;
    private String feedBack;
    private List<BatchApplyBindDto> applyData;


    public Long getApprovalId() {
        return approvalId;
    }

    public void setApprovalId(Long approvalId) {
        this.approvalId = approvalId;
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

    public List<BatchApplyBindDto> getApplyData() {
        return applyData;
    }

    public void setApplyData(List<BatchApplyBindDto> applyData) {
        this.applyData = applyData;
    }
}
