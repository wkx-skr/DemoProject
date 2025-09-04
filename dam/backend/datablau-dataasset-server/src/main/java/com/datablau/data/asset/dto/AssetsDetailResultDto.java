package com.datablau.data.asset.dto;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-06 11:22
 * @description  月度变化趋势
 */
public class AssetsDetailResultDto implements Serializable {

    private String month;

    // 数据完整性比率
    private BigDecimal dataIntegrityRate = BigDecimal.valueOf(0.00);

    // 准确率比率
    private BigDecimal accuracyRate = BigDecimal.valueOf(0.00);

    // 有效性比率
    private BigDecimal validityRate = BigDecimal.valueOf(0.00);

    public AssetsDetailResultDto() {
    }

    public AssetsDetailResultDto(String month, BigDecimal dataIntegrityRate, BigDecimal accuracyRate, BigDecimal validityRate) {
        this.month = month;
        this.dataIntegrityRate = dataIntegrityRate;
        this.accuracyRate = accuracyRate;
        this.validityRate = validityRate;
    }



    public AssetsDetailResultDto(String month, double dataIntegrityRate, double accuracyRate, double validityRate) {
        this.month = month;
        this.dataIntegrityRate = BigDecimal.valueOf(dataIntegrityRate);
        this.accuracyRate = BigDecimal.valueOf(accuracyRate);
        this.validityRate = BigDecimal.valueOf(validityRate);
    }


    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
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
}
