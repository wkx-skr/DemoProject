package com.datablau.data.asset.jpa.entity;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.io.Serializable;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-05-26 10:27
 * @description 元数据质量任务 业务负责人表 用于下拉展示
 */
@Entity
@Table(
        name = "dam_asset_tendency_check_bu"
)
public class CheckBuName implements Serializable {


    @Id
    @Column(name = "id")
    @GeneratedValue(
            generator = "dam_asset_tendency_check_bu"
    )
    @GenericGenerator(
            name = "dam_asset_tendency_check_bu",
            strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@org.hibernate.annotations.Parameter(
                    name = "sequence_name",
                    value = "tendency_check_bu_seq"
            )}
    )
    private Long id;

    // 业务负责人名称
    @Column(name = "bu_name", length = 100)
    private String buName;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBuName() {
        return buName;
    }

    public void setBuName(String buName) {
        this.buName = buName;
    }
}
