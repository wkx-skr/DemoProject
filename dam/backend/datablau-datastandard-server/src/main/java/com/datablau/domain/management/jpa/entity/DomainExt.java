//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

package com.datablau.domain.management.jpa.entity;

import com.andorj.common.core.annotation.Comment;
import com.datablau.domain.management.constants.DomainCheckState;

import javax.persistence.*;

@Entity
@Table(
        name = "db_domain_ext",
        indexes = {
            @Index(
                name = "idx_domain_ext_d_id",
                columnList = "d_id",
                unique = true
            )
        }
)
public class DomainExt {
    @Id
    @Column(
            name = "d_id",
            nullable = false
    )
    @Comment("关联Domain的ID")
    private String dId;
    @Column(
            name = "reference_term"
    )
    @Comment("关联术语")
    private String referenceTerm;

    @Column(
            name = "max_value"
    )
    @Comment("最大值")
    private Integer maxValue;

    @Column(
            name = "min_value"
    )
    @Comment("最小值")
    private Integer minValue;

    @Column(
            name = "check_state",
            nullable = false
    )
    @Enumerated(EnumType.STRING)
    @Comment("检查状态")
    private DomainCheckState checkState;

    //单位，此字段只有数据类型是“数值型”是必填
    @Column(name = "unit")
    @Comment("单位")
    private String unit;

    public DomainExt() {
    }

    public String getdId() {
        return dId;
    }

    public void setdId(String dId) {
        this.dId = dId;
    }

    public String getReferenceTerm() {
        return referenceTerm;
    }

    public void setReferenceTerm(String referenceTerm) {
        this.referenceTerm = referenceTerm;
    }

    public Integer getMaxValue() {
        return maxValue;
    }

    public void setMaxValue(Integer maxValue) {
        this.maxValue = maxValue;
    }

    public Integer getMinValue() {
        return minValue;
    }

    public void setMinValue(Integer minValue) {
        this.minValue = minValue;
    }

    public DomainCheckState getCheckState() {
        return checkState;
    }

    public void setCheckState(DomainCheckState checkState) {
        this.checkState = checkState;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }
}
