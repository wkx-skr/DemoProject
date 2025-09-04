package com.datablau.domain.management.dto;

import java.io.Serializable;
import java.util.List;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-08-05 17:35
 * @description
 */
public class FlowBatchApplyDopInfoDto implements Serializable {

    private Long approvalId;

    private Integer approvalStatus;

    private String feedBack;

    List<SingleApplyInfo> applyData;

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

    public List<SingleApplyInfo> getApplyData() {
        return applyData;
    }

    public void setApplyData(List<SingleApplyInfo> applyData) {
        this.applyData = applyData;
    }


    @Override
    public String toString() {
        return "FlowBatchApplyDopInfoDto{" +
                "approvalId=" + approvalId +
                ", approvalStatus=" + approvalStatus +
                ", feedBack='" + feedBack + '\'' +
                ", applyData=" + applyData +
                '}';
    }
}
