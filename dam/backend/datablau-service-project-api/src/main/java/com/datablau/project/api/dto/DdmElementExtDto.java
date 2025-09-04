package com.datablau.project.api.dto;

import java.io.Serializable;
import java.util.Date;

/**
 * @author: hxs
 * @date: 2025/4/27 13:44
 */
public class DdmElementExtDto implements Serializable {

    private Long id;
    private Long modelElementId;
    private Date createDate;
    private String creater;
    private Date updateDate;
    private String updater;
    private Long typeId;
    //编码
    private String code;
    //业务对象的id
    private String archyId;
    //只有字段有此属性，是表的id
    private Long parentId;
    //来源系统
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

    public Long getTypeId() {
        return typeId;
    }

    public void setTypeId(Long typeId) {
        this.typeId = typeId;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getArchyId() {
        return archyId;
    }

    public void setArchyId(String archyId) {
        this.archyId = archyId;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public String getSystem() {
        return system;
    }

    public void setSystem(String system) {
        this.system = system;
    }
}
