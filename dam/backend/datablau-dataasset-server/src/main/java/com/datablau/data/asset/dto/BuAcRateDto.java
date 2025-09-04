package com.datablau.data.asset.dto;

import javax.persistence.Column;
import java.math.BigDecimal;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-06 09:48
 * @description  业务准确性 完整性，有效性
 */
public class BuAcRateDto {

    private String buName;

    // 数据完整性比率
    private BigDecimal dataIntegrityRate = BigDecimal.valueOf(0.00);

    // 准确率比率
    private BigDecimal accuracyRate = BigDecimal.valueOf(0.00);

    // 有效性比率
    private BigDecimal validityRate = BigDecimal.valueOf(0.00);




    public String getBuName() {
        return buName;
    }

    public void setBuName(String buName) {
        this.buName = buName;
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
