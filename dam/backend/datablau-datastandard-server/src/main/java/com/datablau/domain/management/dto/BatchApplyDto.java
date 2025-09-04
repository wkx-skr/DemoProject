package com.datablau.domain.management.dto;

import com.andorj.common.core.annotation.Comment;
import com.datablau.domain.management.jpa.type.ConfirmState;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-17 13:17
 * @description
 */
public class BatchApplyDto  implements Serializable {

    private Long id;

    private String applyType;

    private String applyName;

    private String applyCreator;

    private Date applyCreateTime;

    private String applyOperation;

    private ConfirmState innerState;

    private String confirmUser;

    private String confirmUserTow;


    private List<BatchApplyDetailDto> details;

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


    public List<BatchApplyDetailDto> getDetails() {
        return details;
    }

    public void setDetails(List<BatchApplyDetailDto> details) {
        this.details = details;
    }

    public ConfirmState getInnerState() {
        return innerState;
    }

    public void setInnerState(ConfirmState innerState) {
        this.innerState = innerState;
    }


    public String getConfirmUser() {
        return confirmUser;
    }

    public void setConfirmUser(String confirmUser) {
        this.confirmUser = confirmUser;
    }

    public String getConfirmUserTow() {
        return confirmUserTow;
    }

    public void setConfirmUserTow(String confirmUserTow) {
        this.confirmUserTow = confirmUserTow;
    }
}
