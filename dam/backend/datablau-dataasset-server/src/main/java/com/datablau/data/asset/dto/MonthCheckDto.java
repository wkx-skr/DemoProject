package com.datablau.data.asset.dto;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-30 10:55
 * @description
 */
public class MonthCheckDto implements Serializable {

    private String name;


    // 数据完整性比率
    private BigDecimal dataIntegrityRate = BigDecimal.valueOf(0.00);

    // 准确率比率
    private BigDecimal accuracyRate = BigDecimal.valueOf(0.00);

    // 有效性比率
    private BigDecimal validityRate = BigDecimal.valueOf(0.00);


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
