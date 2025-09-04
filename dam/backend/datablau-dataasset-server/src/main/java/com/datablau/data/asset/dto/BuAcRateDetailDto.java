package com.datablau.data.asset.dto;

import java.io.Serializable;


import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-09 10:33
 * @description 统计详情 DTO（包含各类填充率与统计时间）
 */
/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-09 10:33
 * @description 用户维度的指标统计详情 DTO
 */
public class BuAcRateDetailDto implements Serializable {

    /**
     * 用户英文名
     */
    private String username;

    /**
     * 用户中文名
     */
    private String cnUsername;

    /**
     * 中文注释填充率（%）
     */
    private BigDecimal cnCommentRate;

    /**
     * 安全等级填充率（%）
     */
    private BigDecimal securityLevelRate;

    /**
     * 业务描述填充率（%）
     */
    private BigDecimal bizDescRate;

    /**
     * 使用描述填充率（%）
     */
    private BigDecimal usageDescRate;

    /**
     * 类型匹配率（%）
     */
    private BigDecimal typeMatchRate;

    /**
     * 表中文名与描述合规率（%）
     */
    private BigDecimal tableDescComplianceRate;

    /**
     * 统计日期（格式：yyyyMMdd）
     */
    private String batchDate;

    // ======= Getter / Setter =======

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getCnUsername() {
        return cnUsername;
    }

    public void setCnUsername(String cnUsername) {
        this.cnUsername = cnUsername;
    }

    public BigDecimal getCnCommentRate() {
        return cnCommentRate;
    }

    public void setCnCommentRate(BigDecimal cnCommentRate) {
        this.cnCommentRate = cnCommentRate;
    }

    public BigDecimal getSecurityLevelRate() {
        return securityLevelRate;
    }

    public void setSecurityLevelRate(BigDecimal securityLevelRate) {
        this.securityLevelRate = securityLevelRate;
    }

    public BigDecimal getBizDescRate() {
        return bizDescRate;
    }

    public void setBizDescRate(BigDecimal bizDescRate) {
        this.bizDescRate = bizDescRate;
    }

    public BigDecimal getUsageDescRate() {
        return usageDescRate;
    }

    public void setUsageDescRate(BigDecimal usageDescRate) {
        this.usageDescRate = usageDescRate;
    }

    public BigDecimal getTypeMatchRate() {
        return typeMatchRate;
    }

    public void setTypeMatchRate(BigDecimal typeMatchRate) {
        this.typeMatchRate = typeMatchRate;
    }

    public BigDecimal getTableDescComplianceRate() {
        return tableDescComplianceRate;
    }

    public void setTableDescComplianceRate(BigDecimal tableDescComplianceRate) {
        this.tableDescComplianceRate = tableDescComplianceRate;
    }

    public String getBatchDate() {
        return batchDate;
    }

    public void setBatchDate(String batchDate) {
        this.batchDate = batchDate;
    }
}