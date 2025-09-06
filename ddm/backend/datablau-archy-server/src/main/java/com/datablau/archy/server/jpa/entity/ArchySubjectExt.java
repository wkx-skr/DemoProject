package com.datablau.archy.server.jpa.entity;

import com.andorj.common.core.annotation.Comment;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * @author: hxs
 * @date: 2025/4/9 11:46
 */
@Entity
@Table(name = "db_object_subject_ext")
public class ArchySubjectExt {
    @Id
    @GeneratedValue(generator = "catalog_archy_sync_ext_generator")
    @GenericGenerator(name = "catalog_archy_sync_ext_generator", strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@Parameter(name = "sequence_name", value = "CATALOG_ARCHY_SYNC_EXT_SEQ")})
    private Long id;

    @Column(name = "archy_id")
    @Comment("数据架构目录id")
    private Long archyId;

    @Column(name = "dam_id")
    @Comment("数据资产那边的id")
    private Long damId;

    @Column(name = "dam_parent_id")
    @Comment("数据资产那边的parentid")
    private Long damParentId;

    @Column(name = "type")
    @Comment("0是L1和L2对应技术架构一级和二级目录，1是L3对应技术架构业务对应")
    private Integer type;

    @Column(name = "archy_object_id")
    @Comment("业务对象的id")
    private String archyObjectId;

    @Column(name = "catalog_publish_state")
    @Comment("资产目录侧发布状态")
    private String publishState;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getArchyId() {
        return archyId;
    }

    public void setArchyId(Long archyId) {
        this.archyId = archyId;
    }

    public Long getDamId() {
        return damId;
    }

    public void setDamId(Long damId) {
        this.damId = damId;
    }

    public Long getDamParentId() {
        return damParentId;
    }

    public void setDamParentId(Long damParentId) {
        this.damParentId = damParentId;
    }

    public Integer getType() {
        return type;
    }

    public void setType(Integer type) {
        this.type = type;
    }

    public String getArchyObjectId() {
        return archyObjectId;
    }

    public void setArchyObjectId(String archyObjectId) {
        this.archyObjectId = archyObjectId;
    }

    public String getPublishState() {
        return publishState;
    }

    public void setPublishState(String publishState) {
        this.publishState = publishState;
    }
}
