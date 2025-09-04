package com.datablau.domain.management.jpa.entity;

import com.andorj.common.core.annotation.Comment;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.id.enhanced.SequenceStyleGenerator;

import javax.persistence.*;
import java.io.Serializable;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-17 10:19
 * @description 批次详情表
 */
@Entity
@Table(name = "db_batch_apply_detail", indexes = {
        @Index(name = "idx_batchapplydetail", columnList = "apply_batch_id")
})
public class BatchApplyDetail implements Serializable {


    @Id
    @GeneratedValue(generator = "batch_apply_detail_generator")
    @GenericGenerator(name = "business_term_generator", strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@org.hibernate.annotations.Parameter(name = SequenceStyleGenerator.SEQUENCE_PARAM, value = "BATCH_APPLY_DETAIL_SEQ"),
                    @org.hibernate.annotations.Parameter(name = SequenceStyleGenerator.INITIAL_PARAM, value = "100")})
    @Column(name = "id")
    @Comment("ID")
    private Long id;

//    // 绑定dopId 使用
//    @Column(name = "dop_id")
//    private String dopId;

    // 提交人 用于weact 通知时使用
    @Column(name = "submit_user")
    private String submitUser;

    //数据类型 暂定用 string 展示 标准，资产。。。
    @Column(name = "apply_type")
    private String dataType;

    // 编码  如果是资产那就是id 冗余字段
    @Column(name = "apply_code")
    private String code;

    @Column(name = "apply_cn_name")
    private String cnName;

    @Column(name = "apply_en_name")
    private String enName;

    // 有些数据存在副本 所以下面两个字段是 新老id。如果只有一种的情况 那就只用new id  不展示在前端页面
    @Column(name = "apply_old_id")
    private String oldId;

    @Column(name = "apply_ne_id")
    private String neId;

    // 审核状态。比如
    @Column(name = "apply_order_state")
    private String orderState;

    // 审核类型 发布， 变更， 废弃
    @Column(name = "apply_order_type")
    private String orderType;

    @Column(name = "apply_batch_id")
    private Long batchId;
    //  冗余字段  格式为时间 如 202506111259
    @Column(name = "apply_batch_name")
    private String  batchName;


    // 由于他妈的 吊资产那边不是副本的形式 所以增加两个存放json的字段 主要是用于变更
    @Column(name = "apply_ne_data")
    @Lob
    private String neData;

    @Column(name = "apply_old_data")
    @Lob
    private String oldData;


    @Column(name = "apply_domain_code")
    private String domainCode;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

//    public String getDopId() {
//        return dopId;
//    }
//
//    public void setDopId(String dopId) {
//        this.dopId = dopId;
//    }

    public String getSubmitUser() {
        return submitUser;
    }

    public void setSubmitUser(String submitUser) {
        this.submitUser = submitUser;
    }

    public String getApplyType() {
        return dataType;
    }

    public void setApplyType(String applyType) {
        this.dataType = applyType;
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

    public String getBatchName() {
        return batchName;
    }

    public void setBatchName(String batchName) {
        this.batchName = batchName;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
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


    public String getDomainCode() {
        return domainCode;
    }

    public void setDomainCode(String domainCode) {
        this.domainCode = domainCode;
    }
}
