package com.datablau.domain.management.dto;

import javax.persistence.Column;
import javax.persistence.Lob;
import java.io.Serializable;
import java.util.Date;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-17 13:20
 * @description
 */
public class BatchApplyDetailDto implements Serializable {

    private Long id;

    // private String dopId; // 你暂时注释掉了 dopId 字段，如果需要请取消注释

    private String submitUser;

    //数据类型 暂定用 string 展示 标准，资产。。。
    private String dataType;

    private String code;

    private String cnName;

    private String enName;

    private String orderState;
// 发布，变更，废弃
    private String orderType;

    private Long batchId;


    private String oldId;


    private String neId;


    private String neData;


    private String oldData;


    private Date createTime;

    private String domainCode;



    public BatchApplyDetailDto() {
    }

    public BatchApplyDetailDto(String submitUser, String dataType, String code, String orderType) {
        this.submitUser = submitUser;
        this.dataType = dataType;
        this.code = code;
        this.orderType = orderType;
    }

    public BatchApplyDetailDto(Long id, String submitUser, String dataType, String code, String cnName, String enName, String orderState, String orderType, Long batchId) {
        this.id = id;
        this.submitUser = submitUser;
        this.dataType = dataType;
        this.code = code;
        this.cnName = cnName;
        this.enName = enName;
        this.orderState = orderState;
        this.orderType = orderType;
        this.batchId = batchId;
    }

    public String getSubmitUser() {
        return submitUser;
    }

    public void setSubmitUser(String submitUser) {
        this.submitUser = submitUser;
    }

    public String getDataType() {
        return dataType;
    }

    public void setApplyType(String dataType) {
        this.dataType = dataType;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getCnName() {
        return cnName;
    }

    public void setCnName(String cnName) {
        this.cnName = cnName;
    }

    public String getEnName() {
        return enName;
    }

    public void setEnName(String enName) {
        this.enName = enName;
    }

    public String getOrderState() {
        return orderState;
    }

    public void setOrderState(String orderState) {
        this.orderState = orderState;
    }

    public String getOrderType() {
        return orderType;
    }

    public void setOrderType(String orderType) {
        this.orderType = orderType;
    }

    public Long getBatchId() {
        return batchId;
    }

    public void setBatchId(Long batchId) {
        this.batchId = batchId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public String getOldId() {
        return oldId;
    }

    public void setOldId(String oldId) {
        this.oldId = oldId;
    }

    public String getNeId() {
        return neId;
    }

    public void setNeId(String neId) {
        this.neId = neId;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public String getNeData() {
        return neData;
    }

    public void setNeData(String neData) {
        this.neData = neData;
    }

    public String getOldData() {
        return oldData;
    }

    public void setOldData(String oldData) {
        this.oldData = oldData;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }


    public String getDomainCode() {
        return domainCode;
    }

    public void setDomainCode(String domainCode) {
        this.domainCode = domainCode;
    }
}
