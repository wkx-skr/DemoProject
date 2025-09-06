package com.datablau.domain.management.jpa.entity;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.id.enhanced.SequenceStyleGenerator;

import javax.persistence.*;
import java.io.Serializable;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-09 15:49
 * @description 批次权限配置表
 */


@Entity
@Table(name = "batch_confirm_config")
public class BatchConfirmConfig implements Serializable {

    @Id
    @GeneratedValue(generator = "batch_confirm_config_generator")
    @GenericGenerator(name = "batch_confirm_config_generator", strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@org.hibernate.annotations.Parameter(name = SequenceStyleGenerator.SEQUENCE_PARAM, value = "BATCH_CONFIRM_CONFIG_SEQ"),
                    @org.hibernate.annotations.Parameter(name = SequenceStyleGenerator.INITIAL_PARAM, value = "100")})
    @Column(name = "id")
    private Long id;
    // 业务域名称
    @Column(name = "domain_name", nullable = false)
    private String domainName; // 一级目录名，用于与 BatchApply.applyInnerName 匹配
    // 确认人1
    @Column(name = "confirm_user1")
    private String confirmUser1;
    // 确认人2
    @Column(name = "confirm_user2")
    private String confirmUser2;

    // --- Getter / Setter ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDomainName() {
        return domainName;
    }

    public void setDomainName(String domainName) {
        this.domainName = domainName;
    }

    public String getConfirmUser1() {
        return confirmUser1;
    }

    public void setConfirmUser1(String confirmUser1) {
        this.confirmUser1 = confirmUser1;
    }

    public String getConfirmUser2() {
        return confirmUser2;
    }

    public void setConfirmUser2(String confirmUser2) {
        this.confirmUser2 = confirmUser2;
    }
}