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
 * 模型和目录映射表
 */
@Entity
@Table(
        name = "ddm_mapping_catalog"
)
public class DdmMappingCatalog {

    @Id
    @Column(name = "id")
    @GeneratedValue(
            generator = "ddm_mapping_catalog_generator"
    )
    @GenericGenerator(
            name = "ddm_mapping_catalog_generator",
            strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@org.hibernate.annotations.Parameter(
                    name = "sequence_name",
                    value = "ddm_mapping_catalog_seq"
            )}
    )
    private Long id;
    @Column(name = "business_object_id")
    @Comment("业务对象id")
    private Long businessObjectId;
    @Column(name = "business_object_name")
    @Comment("业务对象名称")
    private String businessObjectName;
    @Column(name = "catalog_id")
    @Comment("目录id")
    private Long catalogId;
    @Column(name = "catalog_name")
    @Comment("目录名称")
    private String catalogName;
    @Column(name = "catalog_en_name")
    @Comment("目录英文名称")
    private String catalogEnName;
    @Column(name = "parent_catalog_id")
    @Comment("上级目录id")
    private Long parentCatalogId;
    @Column(name = "parent_catalog_name")
    @Comment("上级目录名称")
    private String parentCatalogName;
    @Column(name = "structure_id")
    @Comment("目录空间id")
    private Long structureId;
    @Column(name = "model_category_id")
    @Comment("应用系统id")
    private Long modelCategoryId;
    @Column(name = "ddm_model_id")
    @Comment("ddm模型id")
    private Long ddmModelId;
    @Column(name = "ddm_model_name")
    @Comment("ddm模型名称")
    private String ddmModelName;
    @Column(name = "ddm_category_path")
    @Comment("ddm模型路径")
    private String ddmCategoryPath;
    @Column(name = "object_id")
    @Comment("ddm模型元素ID")
    private Long objectId;
    @Column(name = "object_name")
    @Comment("ddm模型元素名称")
    private String objectName;
    @Column(name = "alias")
    @Comment("ddm模型元素别名")
    private String alias;
    @Column(name = "parent_object_id")
    @Comment("ddm模型上级元素ID")
    private Long parentObjectId;
    @Column(name = "parent_object_name")
    @Comment("ddm模型上级元素名称")
    private String parentObjectName;
    @Column(name = "parent_object_alias")
    @Comment("ddm模型上级元素别名")
    private String parentObjectAlias;
    @Column(name = "object_level")
    @Comment("元数据级别")
    private String objectLevel;
    @Column(name = "mapping_type")
    @Comment("映射类型")
    private String mappingType;

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

    public Long getBusinessObjectId() {
        return businessObjectId;
    }

    public void setBusinessObjectId(Long businessObjectId) {
        this.businessObjectId = businessObjectId;
    }

    public String getBusinessObjectName() {
        return businessObjectName;
    }

    public void setBusinessObjectName(String businessObjectName) {
        this.businessObjectName = businessObjectName;
    }

    public Long getCatalogId() {
        return catalogId;
    }

    public void setCatalogId(Long catalogId) {
        this.catalogId = catalogId;
    }

    public String getCatalogName() {
        return catalogName;
    }

    public void setCatalogName(String catalogName) {
        this.catalogName = catalogName;
    }

    public String getCatalogEnName() {
        return catalogEnName;
    }

    public void setCatalogEnName(String catalogEnName) {
        this.catalogEnName = catalogEnName;
    }

    public Long getParentCatalogId() {
        return parentCatalogId;
    }

    public void setParentCatalogId(Long parentCatalogId) {
        this.parentCatalogId = parentCatalogId;
    }

    public String getParentCatalogName() {
        return parentCatalogName;
    }

    public void setParentCatalogName(String parentCatalogName) {
        this.parentCatalogName = parentCatalogName;
    }

    public void setParentObjectName(String parentObjectName) {
        this.parentObjectName = parentObjectName;
    }

    public Long getStructureId() {
        return structureId;
    }

    public void setStructureId(Long structureId) {
        this.structureId = structureId;
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

    public String getDdmModelName() {
        return ddmModelName;
    }

    public void setDdmModelName(String ddmModelName) {
        this.ddmModelName = ddmModelName;
    }

    public Long getObjectId() {
        return objectId;
    }

    public void setObjectId(Long objectId) {
        this.objectId = objectId;
    }

    public String getObjectName() {
        return objectName;
    }

    public void setObjectName(String objectName) {
        this.objectName = objectName;
    }

    public Long getParentObjectId() {
        return parentObjectId;
    }

    public void setParentObjectId(Long parentObjectId) {
        this.parentObjectId = parentObjectId;
    }

    public String getParentObjectName() {
        return parentObjectName;
    }

    public String getParentObjectAlias() {
        return parentObjectAlias;
    }

    public void setParentObjectAlias(String parentObjectAlias) {
        this.parentObjectAlias = parentObjectAlias;
    }

    public String getAlias() {
        return alias;
    }

    public void setAlias(String alias) {
        this.alias = alias;
    }

    public String getObjectLevel() {
        return objectLevel;
    }

    public void setObjectLevel(String objectLevel) {
        this.objectLevel = objectLevel;
    }

    public String getMappingType() {
        return mappingType;
    }

    public void setMappingType(String mappingType) {
        this.mappingType = mappingType;
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

    public String getDdmCategoryPath() {
        return ddmCategoryPath;
    }

    public void setDdmCategoryPath(String ddmCategoryPath) {
        this.ddmCategoryPath = ddmCategoryPath;
    }

    @Override
    public String toString() {
        return "DdmMappingCatalog{" +
                "id=" + id +
                ", businessObjectId=" + businessObjectId +
                ", businessObjectName='" + businessObjectName + '\'' +
                ", catalogId=" + catalogId +
                ", catalogName='" + catalogName + '\'' +
                ", catalogEnName='" + catalogEnName + '\'' +
                ", parentCatalogId=" + parentCatalogId +
                ", parentCatalogName='" + parentCatalogName + '\'' +
                ", structureId=" + structureId +
                ", modelCategoryId=" + modelCategoryId +
                ", ddmModelId=" + ddmModelId +
                ", ddmModelName='" + ddmModelName + '\'' +
                ", ddmCategoryPath='" + ddmCategoryPath + '\'' +
                ", objectId=" + objectId +
                ", objectName='" + objectName + '\'' +
                ", alias='" + alias + '\'' +
                ", parentObjectId=" + parentObjectId +
                ", parentObjectName='" + parentObjectName + '\'' +
                ", parentObjectAlias='" + parentObjectAlias + '\'' +
                ", objectLevel='" + objectLevel + '\'' +
                ", mappingType='" + mappingType + '\'' +
                ", createTime=" + createTime +
                ", updateTime=" + updateTime +
                ", creator='" + creator + '\'' +
                ", updater='" + updater + '\'' +
                '}';
    }
}
