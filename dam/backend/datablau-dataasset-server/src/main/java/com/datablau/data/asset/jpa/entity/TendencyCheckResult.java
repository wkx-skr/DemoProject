package com.datablau.data.asset.jpa.entity;

import com.datablau.data.asset.enums.AssetsCheckResultType;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-05-21 10:25
 * @description 该表为趋势图，主要存储三种数据 按照type字段进行区分， 一个是业务域的，一个是负责人的。还有一个则是无类型的
 * 依据类型进行判断 涉及到的两个字段是否会存在值
 */
@Entity
@Table(
        name = "dam_asset_tendency_check_result"
)
public class TendencyCheckResult  implements Serializable {

    @Serial
    private static final long serialVersionUID = -2542358557674345390L;

    @Id
    @Column(name = "id")
    @GeneratedValue(
            generator = "dam_asset_tendency_check_result"
    )
    @GenericGenerator(
            name = "dam_asset_tendency_check_result",
            strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@org.hibernate.annotations.Parameter(
                    name = "sequence_name",
                    value = "tendency_check_result_seq"
            )}
    )
    private Long id;


    // 每日统计的时间，如2025年5月6日，使用20250506方式进行存储
    @Column(name = "batch_date", nullable = false, length = 8)
    private String batchDate;


    // 数据完整性比率
    @Column(name = "data_integrity_rate", precision = 10, scale = 2, columnDefinition = "DECIMAL(10,2) DEFAULT 0.00")
    private BigDecimal dataIntegrityRate = BigDecimal.valueOf(0.00);

    // 准确率比率
    @Column(precision = 10, scale = 2, columnDefinition = "DECIMAL(10,2) DEFAULT 0.00")
    private BigDecimal accuracyRate = BigDecimal.valueOf(0.00);

    // 有效性比率
    @Column(precision = 10, scale = 2, columnDefinition = "DECIMAL(10,2) DEFAULT 0.00")
    private BigDecimal validityRate = BigDecimal.valueOf(0.00);

    // 用户名 登录账号
    @Column(name = "username", length = 100)
    private String username;

    // 用户中文名称
    @Column(name = "cn_username", length = 100)
    private String cnUsername;

    // 业务域名称
    @Column(name = "bu_name", length = 100)
    private String buName;

    // 业务域 目录id
    @Column(name = "bu_id", length = 100)
    private String buId;

    @Enumerated(EnumType.STRING)
    @Column(name = "result_type", nullable = false, length = 10)
    private AssetsCheckResultType resultType;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBatchDate() {
        return batchDate;
    }

    public void setBatchDate(String batchDate) {
        this.batchDate = batchDate;
    }

    public BigDecimal getDataIntegrityRate() {
        return dataIntegrityRate;
    }

    public void setDataIntegrityRate(BigDecimal dataIntegrityRate) {
        this.dataIntegrityRate = dataIntegrityRate;
    }

    public BigDecimal getAccuracyRate() {
        return accuracyRate;
    }

    public void setAccuracyRate(BigDecimal accuracyRate) {
        this.accuracyRate = accuracyRate;
    }

    public BigDecimal getValidityRate() {
        return validityRate;
    }

    public void setValidityRate(BigDecimal validityRate) {
        this.validityRate = validityRate;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getBuName() {
        return buName;
    }

    public void setBuName(String buName) {
        this.buName = buName;
    }

    public AssetsCheckResultType getResultType() {
        return resultType;
    }

    public void setResultType(AssetsCheckResultType resultType) {
        this.resultType = resultType;
    }

    public String getCnUsername() {
        return cnUsername;
    }

    public void setCnUsername(String cnUsername) {
        this.cnUsername = cnUsername;
    }

    public String getBuId() {
        return buId;
    }

    public void setBuId(String buId) {
        this.buId = buId;
    }


    @Override
    public String toString() {
        return "TendencyCheckResult{" +
                "id=" + id +
                ", batchDate='" + batchDate + '\'' +
                ", dataIntegrityRate=" + dataIntegrityRate +
                ", accuracyRate=" + accuracyRate +
                ", validityRate=" + validityRate +
                ", username='" + username + '\'' +
                ", cnUsername='" + cnUsername + '\'' +
                ", buName='" + buName + '\'' +
                ", buId='" + buId + '\'' +
                ", resultType=" + resultType +
                '}';
    }
}
