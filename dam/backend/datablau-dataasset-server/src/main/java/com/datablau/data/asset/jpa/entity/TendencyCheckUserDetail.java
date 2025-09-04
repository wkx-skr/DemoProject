package com.datablau.data.asset.jpa.entity;

import com.datablau.data.asset.enums.AssetsCheckResultType;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-05-21 11:13
 * @description 用户相关统计的详情信息 以用户纬度为准
 */
@Entity
@Table(
        name = "dam_asset_tendency_check_user_detail"
)
public class TendencyCheckUserDetail implements Serializable {

    @Id
    @Column(name = "id")
    @GeneratedValue(
            generator = "dam_asset_tendency_check_user_detail"
    )
    @GenericGenerator(
            name = "dam_asset_tendency_check_user_detail",
            strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@org.hibernate.annotations.Parameter(
                    name = "sequence_name",
                    value = "tendency_check_user_detail_seq"
            )}
    )
    private Long id;
    // 负责人名称
    @Column(name = "username", length = 100)
    private String username;
    // 这个字段用不到 负责人中文名
    @Column(name = "cn_username", length = 100)
    private String cnUsername;

    // 中文注填充率
    @Column(name = "cn_comment_rate", precision = 10, scale = 2, columnDefinition = "DECIMAL(10,2) DEFAULT 0.00")
    private BigDecimal cnCommentRate = BigDecimal.valueOf(0.00);

    // 安全等级填充率
    @Column(name = "security_level_rate", precision = 10, scale = 2, columnDefinition = "DECIMAL(10,2) DEFAULT 0.00")
    private BigDecimal securityLevelRate = BigDecimal.valueOf(0.00);

    // 业务描述填充率
    @Column(name = "biz_desc_rate", precision = 10, scale = 2, columnDefinition = "DECIMAL(10,2) DEFAULT 0.00")
    private BigDecimal bizDescRate = BigDecimal.valueOf(0.00);

    // 使用描述填充率
    @Column(name = "usage_desc_rate", precision = 10, scale = 2, columnDefinition = "DECIMAL(10,2) DEFAULT 0.00")
    private BigDecimal usageDescRate = BigDecimal.valueOf(0.00);

    // 类型匹配率
    @Column(name = "type_match_rate", precision = 10, scale = 2, columnDefinition = "DECIMAL(10,2) DEFAULT 0.00")
    private BigDecimal typeMatchRate = BigDecimal.valueOf(0.00);

    // 表中文名与描述合规率
    @Column(name = "table_desc_compliance_rate", precision = 10, scale = 2, columnDefinition = "DECIMAL(10,2) DEFAULT 0.00")
    private BigDecimal tableDescComplianceRate = BigDecimal.valueOf(0.00);

    // 每日统计的时间，如2025年5月6日，使用20250506方式进行存储
    @Column(name = "batch_date", nullable = false, length = 8)
    private String batchDate;

    // 统计类型        USER_TYPE,  // 用户维度
    //        NONE_TYPE,  // 无类型
    //        BU_TYPE    // 业务域维度
    @Enumerated(EnumType.STRING)
    @Column(name = "result_type", nullable = false, length = 10)
    private AssetsCheckResultType resultType;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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


    public AssetsCheckResultType getResultType() {
        return resultType;
    }

    public void setResultType(AssetsCheckResultType resultType) {
        this.resultType = resultType;
    }
}
