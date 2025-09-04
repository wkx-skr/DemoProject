package com.datablau.data.asset.dto;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-30 16:45
 * @description
 */
public class TendencyAggResultDTO implements Serializable {

    private String batchDate;
    private BigDecimal dataIntegrityRate;
    private BigDecimal accuracyRate;
    private BigDecimal validityRate;

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

    public TendencyAggResultDTO(String batchDate, BigDecimal dataIntegrityRate,
                                BigDecimal accuracyRate, BigDecimal validityRate) {
        this.batchDate = batchDate;
        this.dataIntegrityRate = dataIntegrityRate;
        this.accuracyRate = accuracyRate;
        this.validityRate = validityRate;




    }
}
