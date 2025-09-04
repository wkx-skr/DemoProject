package com.datablau.data.asset.jpa.entity;

import com.andorj.common.core.annotation.Comment;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * 模型元数据采集表
 */

@Entity
@Table(
        name = "ddm_collect_element"
)
public class DdmCollectElement {

    @Id
    @Column(name = "id")
    @GeneratedValue(
            generator = "ddm_collect_element_generator"
    )
    @GenericGenerator(
            name = "ddm_collect_element_generator",
            strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@org.hibernate.annotations.Parameter(
                    name = "sequence_name",
                    value = "ddm_collect_element_seq"
            )}
    )
    private Long id;
    @Column(name = "model_category_id")
    @Comment("应用系统ID")
    private Long modelCategoryId;
    @Column(name = "ddm_model_id")
    @Comment("ddm模型ID")
    private Long ddmModelId;
    @Column(name = "ddm_model_name")
    @Comment("ddm模型名称")
    private String ddmModelName;
    @Column(name = "ddm_category_id")
    @Comment("ddm模型目录ID")
    private Long ddmCategoryId;
    @Column(name = "ddm_category_path")
    @Comment("ddm模型目录路径")
    private String ddmCategoryPath;
    @Column(name = "object_id")
    @Comment("ddm模型元素ID")
    private Long objectId;
    @Column(name = "parent_id")
    @Comment("ddm模型上级元素ID")
    private Long parentId;
    @Column(name = "parent_alias")
    @Comment("ddm模型上级元素别名")
    private String parentAlias;
    @Column(name = "parent_name")
    @Comment("ddm模型上级元素名称")
    private String parentName;
    @Column(name = "name")
    @Comment("ddm模型元素名称")
    private String name;
    @Column(name = "alias")
    @Comment("ddm模型元素别名")
    private String alias;
    @Column(name = "table_id")
    @Comment("表在ddm_collect_element的主键id")
    private Long tableId;
    @Column(name = "type_id")
    @Comment("类型")
    private Long typeId;
    @Column(name = "is_pk")
    @Comment("是否主键")
    private Boolean isPk;

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

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public String getParentAlias() {
        return parentAlias;
    }

    public void setParentAlias(String parentAlias) {
        this.parentAlias = parentAlias;
    }

    public String getParentName() {
        return parentName;
    }

    public void setParentName(String parentName) {
        this.parentName = parentName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getTableId() {
        return tableId;
    }

    public void setTableId(Long tableId) {
        this.tableId = tableId;
    }

    public Long getTypeId() {
        return typeId;
    }

    public void setTypeId(Long typeId) {
        this.typeId = typeId;
    }

    public String getAlias() {
        return alias;
    }

    public void setAlias(String alias) {
        this.alias = alias;
    }

    public Boolean getPk() {
        return isPk;
    }

    public void setPk(Boolean pk) {
        isPk = pk;
    }

    public Long getDdmCategoryId() {
        return ddmCategoryId;
    }

    public void setDdmCategoryId(Long ddmCategoryId) {
        this.ddmCategoryId = ddmCategoryId;
    }

    public String getDdmCategoryPath() {
        return ddmCategoryPath;
    }

    public void setDdmCategoryPath(String ddmCategoryPath) {
        this.ddmCategoryPath = ddmCategoryPath;
    }
}
