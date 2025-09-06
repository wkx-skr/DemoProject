package com.datablau.model.server.jpa.entity;

import com.andorj.common.core.annotation.Comment;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import java.util.Date;

/**
 *
 * @author: hxs
 * @date: 2025/4/24 15:18
 */
@Entity
@Table(name = "db_model_element_ext")
public class ModelElementExt {
    @Id
    @GeneratedValue(generator = "db_model_element_ext_generator")
    @GenericGenerator(name = "db_model_element_ext_generator", strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@Parameter(name = "sequence_name", value = "DB_MODEL_ELEMENT_EXT_SEQ")})
    private Long id;

    @Column(name = "model_element_id")
    @Comment("元数据objectID")
    private Long modelElementId;

    @Column(name = "createdate")
    @Comment("创建时间")
    private Date createDate;

    @Column(name = "creater")
    @Comment("创建人")
    private String creater;

    @Column(name = "updatedate")
    @Comment("更新时间")
    private Date updateDate;

    @Column(name = "updater")
    @Comment("更新操作人")
    private String updater;

    @Column(name = "code")
    @Comment("编码")
    private String code;

    @Column(name = "archyid")
    @Comment("业务对象的id")
    private String archyId;

    @Column(name = "typeid")
    @Comment("数据类型，表和字段")
    private Long typeId;

    @Column(name = "parentid")
    @Comment("只有字段有此属性，是表的id")
    private Long parentId;

    @Column(name = "source_system")
    @Comment("来源系统")
    private String system;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getModelElementId() {
        return modelElementId;
    }

    public void setModelElementId(Long modelElementId) {
        this.modelElementId = modelElementId;
    }

    public Date getCreateDate() {
        return createDate;
    }

    public void setCreateDate(Date createDate) {
        this.createDate = createDate;
    }

    public String getCreater() {
        return creater;
    }

    public void setCreater(String creater) {
        this.creater = creater;
    }

    public Date getUpdateDate() {
        return updateDate;
    }

    public void setUpdateDate(Date updateDate) {
        this.updateDate = updateDate;
    }

    public String getUpdater() {
        return updater;
    }

    public void setUpdater(String updater) {
        this.updater = updater;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getSystem() {
        return system;
    }

    public void setSystem(String system) {
        this.system = system;
    }

    public String getArchyId() {
        return archyId;
    }

    public void setArchyId(String archyId) {
        this.archyId = archyId;
    }

    public Long getTypeId() {
        return typeId;
    }

    public void setTypeId(Long typeId) {
        this.typeId = typeId;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

}
