package com.datablau.data.asset.jpa.entity;

import com.andorj.common.core.annotation.Comment;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import java.util.Date;

/**
 * 模型和应用系统关联表
 */

@Entity
@Table(
        name = "ddm_rel_model_category"
)
public class DdmRelModelCategory {


    @Id
    @Column(name = "id")
    @GeneratedValue(
            generator = "ddm_rel_model_category_generator"
    )
    @GenericGenerator(
            name = "ddm_rel_model_category_generator",
            strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@org.hibernate.annotations.Parameter(
                    name = "sequence_name",
                    value = "ddm_rel_model_category_seq"
            )}
    )
    private Long id;

    @Column(name = "model_category_id")
    @Comment("应用系统ID")
    private Long modelCategoryId;

    @Column(name = "ddm_model_id")
    @Comment("ddm模型ID")
    private Long ddmModelId;

    @Column(name = "create_time")
    @Comment("创建时间")
    private Date createTime;

    @Column(name = "update_time")
    @Comment("更新时间")
    private Date updateTime;

    @Column(name = "creator")
    @Comment("创建人")
    private String creator;

    @Column(name = "updater")
    @Comment("更新人")
    private String updater;

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

    public Long getDdmModelId() {
        return ddmModelId;
    }

    public void setDdmModelId(Long ddmModelId) {
        this.ddmModelId = ddmModelId;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    public Date getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(Date updateTime) {
        this.updateTime = updateTime;
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }

    public String getUpdater() {
        return updater;
    }

    public void setUpdater(String updater) {
        this.updater = updater;
    }
}
