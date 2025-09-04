package com.datablau.project.api.dto;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-20 10:18
 * @description
 */
public class BatchApplyRemoteDto implements Serializable {

    private Long id;

    private String applyType;

    private String applyName;

    private String applyCreator;

    private Date applyCreateTime;

    private String applyOperation;

    private List<BatchApplyDetailRemoteDto> details;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getApplyType() {
        return applyType;
    }

    public void setApplyType(String applyType) {
        this.applyType = applyType;
    }

    public String getApplyName() {
        return applyName;
    }

    public void setApplyName(String applyName) {
        this.applyName = applyName;
    }

    public String getApplyCreator() {
        return applyCreator;
    }

    public void setApplyCreator(String applyCreator) {
        this.applyCreator = applyCreator;
    }

    public Date getApplyCreateTime() {
        return applyCreateTime;
    }

    public void setApplyCreateTime(Date applyCreateTime) {
        this.applyCreateTime = applyCreateTime;
    }

    public String getApplyOperation() {
        return applyOperation;
    }

    public void setApplyOperation(String applyOperation) {
        this.applyOperation = applyOperation;
    }


    public List<BatchApplyDetailRemoteDto> getDetails() {
        return details;
    }

    public void setDetails(List<BatchApplyDetailRemoteDto> details) {
        this.details = details;
    }
}
