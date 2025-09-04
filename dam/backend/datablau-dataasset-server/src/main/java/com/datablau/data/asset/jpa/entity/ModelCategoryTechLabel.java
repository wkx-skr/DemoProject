package com.datablau.data.asset.jpa.entity;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * @author: hxs
 * @date: 2025/7/29 15:18
 */

@Entity
@Table(
        name = "model_category_tech_label"
)
public class ModelCategoryTechLabel {

    @Id
    @GeneratedValue(generator = "model_category_tech_label_generator")
    @GenericGenerator(name = "dmodel_category_tech_label_generator", strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@Parameter(name = "sequence_name", value = "model_category_tech_label_seq")})
    private Long id;

    @Column(name = "model_category_id")
    private Long modelCategoryId;

    @Column(name = "label_drop_rate_total")
    private String labelDropRateTotal;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getModelCategoryId() {
        return modelCategoryId;
    }

    public void setModelCategoryId(Long modelCategoryId) {
        this.modelCategoryId = modelCategoryId;
    }

    public String getLabelDropRateTotal() {
        return labelDropRateTotal;
    }

    public void setLabelDropRateTotal(String labelDropRateTotal) {
        this.labelDropRateTotal = labelDropRateTotal;
    }
}
