package com.datablau.data.asset.jpa.entity;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.io.Serializable;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-30 16:09
 * @description。元数据任务运行完之后每次对应的批次表 因为表是增量操作的，所以有一个批次表
 */
@Entity
@Table(
        name = "dam_asset_tendency_batch"
)
public class CheckBatch implements Serializable {

    @Id
    @Column(name = "id")
    @GeneratedValue(
            generator = "dam_asset_tendency_check_bu_num"
    )
    @GenericGenerator(
            name = "dam_asset_tendency_batch",
            strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@org.hibernate.annotations.Parameter(
                    name = "sequence_name",
                    value = "tendency_batch_num_seq"
            )}
    )
    private Long id;

    // 批次id
    @Column(name = "batch_num")
    private String batchNum;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBatchNum() {
        return batchNum;
    }

    public void setBatchNum(String batchNum) {
        this.batchNum = batchNum;
    }
}
