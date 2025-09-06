package com.datablau.domain.management.jpa.entity;

import com.andorj.common.core.annotation.Comment;
import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.jpa.type.ConfirmState;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.id.enhanced.SequenceStyleGenerator;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-17 10:46
 * @description 批次表
 */
@Entity
@Table(name = "db_batch_apply"
)
public class BatchApply implements Serializable {

    @Id
    @GeneratedValue(generator = "batch_apply_generator")
    @GenericGenerator(name = "business_term_generator", strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@org.hibernate.annotations.Parameter(name = SequenceStyleGenerator.SEQUENCE_PARAM, value = "BATCH_APPLY_SEQ"),
                    @org.hibernate.annotations.Parameter(name = SequenceStyleGenerator.INITIAL_PARAM, value = "100")})
    @Column(name = "id")
    @Comment("ID")
    private Long id;
    // 关联的dopid
    @Column(name = "apply_approval_id")
    private String approvalId;


    // 审核类型 发布， 变更， 废弃
    @Column(name = "apply_type")
    private String applyType;

    // 批次名称 使用一级目录进行创建
    @Column(name = "apply_name")
    private String applyName;

    // 批次创建人
    @Column(name = "apply_creator")
    private String applyCreator;

    // 批次创建时间
    @Column(name = "apply_create_time")
    private Date applyCreateTime;

    // 批次操作
    @Column(name = "apply_operation")
    private String applyOperation;


    // 这个状态用于 展示 有权限的人可以全部看见，没有权限的人只能看见确认的数据
    @Column(name = "apply_inner_state", length = 50)
    @Enumerated(EnumType.STRING)
    @Comment("内部状态")
    private ConfirmState innerState;

    @Column(name = "apply_confirm_user")
    private String confirmUser;



    @Column(name = "apply_confirm_user_tow")
    private String confirmUserTow;


    @Column(name = "apply_inner_name")
    private String applyInnerName;

    @Column(name = "apply_bind_user")
    private String applyBindUser;




    @Column(name = "apply_bu_code")
    private String applyBuCode;


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

    public String getApplyInnerName() {
        return applyInnerName;
    }

    public void setApplyInnerName(String applyInnerName) {
        this.applyInnerName = applyInnerName;
    }

    public String getConfirmUserTow() {
        return confirmUserTow;
    }

    public void setConfirmUserTow(String confirmUserTow) {
        this.confirmUserTow = confirmUserTow;
    }


    public String getApprovalId() {
        return approvalId;
    }

    public void setApprovalId(String approvalId) {
        this.approvalId = approvalId;
    }

    public String getApplyBindUser() {
        return applyBindUser;
    }

    public void setApplyBindUser(String applyBindUser) {
        this.applyBindUser = applyBindUser;
    }

    public String getApplyBuCode() {
        return applyBuCode;
    }

    public void setApplyBuCode(String applyBuCode) {
        this.applyBuCode = applyBuCode;
    }
}
