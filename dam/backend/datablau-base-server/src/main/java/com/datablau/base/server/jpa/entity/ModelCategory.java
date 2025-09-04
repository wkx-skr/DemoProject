package com.datablau.base.server.jpa.entity;

import com.andorj.common.core.annotation.Comment;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.model.common.annotation.ExcelColumn;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.base.data.ModelCategoryParamDto;
import com.datablau.base.server.listener.EntityPersistEventListener;
import com.datablau.data.common.jpa.util.EntityPersistListener;
import com.datablau.data.common.jpa.util.JpaListStringConverter;
import com.datablau.graph.data.annotation.GraphObject;
import com.datablau.graph.data.util.EntityPersistForGraphListener;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;
import org.hibernate.annotations.Type;
import org.springframework.beans.BeanUtils;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.Table;
import javax.persistence.Transient;
import java.io.Serializable;
import java.util.List;

/**
 * @Author Nicky - 数语科技有限公司
 * @Date 2018/5/14 11:30
 */
@Entity
@Table(name = "db_model_category")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE, region = "db_modelcategory")
@GraphObject(typeId = LDMTypes.oSystem, idMethod = "getStringModelCategoryId", nameMethod = "getCategoryName", descriptionMethod = "getDescription")
@EntityListeners({EntityPersistListener.class, EntityPersistForGraphListener.class, EntityPersistEventListener.class})
public class ModelCategory implements Serializable {

    @Id
    @Column(name = "category_id")
    @GeneratedValue(generator = "modelcategory_generator")
    @GenericGenerator(name = "modelcategory_generator", strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@Parameter(name = "sequence_name", value = "MODEL_CATEGORY_SEQ")})
    @Comment("系统ID")
    private Long categoryId;

    @Column(name = "category_name", nullable = false, unique = true)
    @ExcelColumn(columnNames = "系统产品名称", required = true)
    @Comment("系统名称")
    private String categoryName;

    @Column(name = "category_abbr", nullable = false, unique = true)
    @ExcelColumn(columnNames = "系统缩写", required = true,
            columnAlias = "系统简称")
    @Comment("系统简称")
    private String categoryAbbreviation;

    @Column(name = "description")
    @Lob
    @Type(type = "com.andorj.model.common.utility.postgres.PostgresTextType")
    @ExcelColumn(columnNames = "系统说明",
            columnAlias = "系统描述")
    @Comment("系统描述")
    private String description;

    @Column(name = "it_department")
    @ExcelColumn(columnNames = {"IT属主单位", "部门"}, required = true)
    @Comment("IT部门")
    private String itDepartment;

    @Column(name = "attribution_center")
    @Comment("归属中心")
    private String attributionCenter;

    @Column(name = "bus_department")
    @ExcelColumn(columnNames = "业务属主单位",
            columnAlias = "业务部门")
    @Comment("业务部门")
    private String businessDepartment;

    @Column(name = "zone")
    @ExcelColumn(columnNames = "系统区域",
            columnAlias = "系统区域")
    @Comment("系统对应区域")
    private String zone;

    @Column(name = "importance")
    @Comment("系统重要性")
    @ExcelColumn(columnNames = "重要性")
    private String importance;

    @Column(name = "owner")
    @Comment("系统技术负责人")
    @ExcelColumn(columnNames = "技术负责人")
//    @GraphObjectEndpoint(endpointTypeId = LDMTypes.oUser, relationShip = "技术负责人", methodToGetEndpointId = "getOwner")
    private String owner;

    @Column(name = "bus_owner")
    @Comment("系统业务负责人")
    @ExcelColumn(columnNames = "业务负责人")
    @Convert(converter = JpaListStringConverter.class)
//    @GraphObjectEndpoint(endpointTypeId = LDMTypes.oUser, relationShip = "业务负责人", isMany = true, methodToGetEndpointId = "getBusOwner")
    private List<String> busOwner;

    @Column(name = "status")
    @ExcelColumn(columnNames = "运行状态")
    @Comment("系统状态")
    private String status;

    @Column(name = "comment_info")
    @ExcelColumn(columnNames = "备注")
    @Comment("备注")
    private String commentInfo;

    @Column(name = "deployment")
    @ExcelColumn(columnNames = "部署位置")
    @Comment("部署位置")
    private String deployment;

    @Column(name = "parent_id")
    @Comment("父级系统ID，目前没使用")
    private Long parentCategoryId;

    public ModelCategory() {
    }

    public ModelCategory(ModelCategoryDto modelCategoryDto) {
        BeanUtils.copyProperties(modelCategoryDto, this);
//        this.categoryId = modelCategoryDto.getCategoryId();
//        this.categoryName = modelCategoryDto.getCategoryName();
//        this.categoryAbbreviation = modelCategoryDto.getCategoryAbbreviation();
//        this.description = modelCategoryDto.getDescription();
//        this.itDepartment = modelCategoryDto.getItDepartment();
//        this.attributionCenter = modelCategoryDto.getAttributionCenter();
//        this.businessDepartment = modelCategoryDto.getBusinessDepartment();
//        this.zone = modelCategoryDto.getZone();
//        this.importance = modelCategoryDto.getImportance();
//        this.owner = modelCategoryDto.getOwner();
//        this.busOwner = modelCategoryDto.getBusOwner();
//        this.status = modelCategoryDto.getStatus();
//        this.commentInfo = modelCategoryDto.getCommentInfo();
//        this.deployment = modelCategoryDto.getDeployment();
//        this.parentCategoryId = modelCategoryDto.getParentCategoryId();
//        this.dataSourceQuantity = modelCategoryDto.getDataSourceQuantity();
    }

    public ModelCategory(ModelCategoryParamDto modelCategoryDto) {
        BeanUtils.copyProperties(modelCategoryDto, this);
//        this.categoryId = modelCategoryDto.getCategoryId();
//        this.categoryName = modelCategoryDto.getCategoryName();
//        this.categoryAbbreviation = modelCategoryDto.getCategoryAbbreviation();
//        this.description = modelCategoryDto.getDescription();
//        this.itDepartment = modelCategoryDto.getItDepartment();
//        this.attributionCenter = modelCategoryDto.getAttributionCenter();
//        this.businessDepartment = modelCategoryDto.getBusinessDepartment();
//        this.zone = modelCategoryDto.getZone();
//        this.importance = modelCategoryDto.getImportance();
//        this.owner = modelCategoryDto.getOwner();
//        this.busOwner = modelCategoryDto.getBusOwner();
//        this.status = modelCategoryDto.getStatus();
//        this.commentInfo = modelCategoryDto.getCommentInfo();
//        this.deployment = modelCategoryDto.getDeployment();
//        this.parentCategoryId = modelCategoryDto.getParentCategoryId();
//        this.dataSourceQuantity = modelCategoryDto.getDataSourceQuantity();
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getItemIds() {
        return categoryId + "";
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getCategoryAbbreviation() {
        return categoryAbbreviation;
    }

    public void setCategoryAbbreviation(String categoryAbbreviation) {
        this.categoryAbbreviation = categoryAbbreviation;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getZone() {
        return zone;
    }

    public void setZone(String zone) {
        this.zone = zone;
    }

    public String getItDepartment() {
        return itDepartment;
    }

    public void setItDepartment(String itDepartment) {
        this.itDepartment = itDepartment;
    }

    public String getImportance() {
        return importance;
    }

    public void setImportance(String importance) {
        this.importance = importance;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getBusinessDepartment() {
        return businessDepartment;
    }

    public void setBusinessDepartment(String businessDepartment) {
        this.businessDepartment = businessDepartment;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDeployment() {
        return deployment;
    }

    public void setDeployment(String deployment) {
        this.deployment = deployment;
    }

    public Long getParentCategoryId() {
        return parentCategoryId;
    }

    public void setParentCategoryId(Long parentCategoryId) {
        this.parentCategoryId = parentCategoryId;
    }

    public String getAttributionCenter() {
        return attributionCenter;
    }

    public void setAttributionCenter(String attributionCenter) {
        this.attributionCenter = attributionCenter;
    }

    public List<String> getBusOwner() {
        return busOwner;
    }

    public void setBusOwner(List<String> busOwner) {
        this.busOwner = busOwner;
    }

    public String getCommentInfo() {
        return commentInfo;
    }

    public void setCommentInfo(String commentInfo) {
        this.commentInfo = commentInfo;
    }

    public String getStringModelCategoryId() {
        return this.categoryId == null ? null : this.categoryId.toString();
    }

    @JsonIgnore
    @Transient
    public Long getClickCount() {
        return 0L;
    }

    @Transient
    public Long getTypeId() {
        return LDMTypes.oModelMart;
    }

    public ModelCategoryDto toDto() {
        ModelCategoryDto modelCategoryDto = new ModelCategoryDto();
        BeanUtils.copyProperties(this, modelCategoryDto);
        return modelCategoryDto;
    }
}
