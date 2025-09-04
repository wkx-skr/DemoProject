package com.datablau.catalog.jpa.entity;

import com.andorj.common.core.annotation.Comment;
import com.datablau.catalog.dto.CommonCatalogDto;
import com.datablau.catalog.enums.CatalogLDMTypes;
import com.datablau.catalog.enums.EnumAssetsCatalogStatus;
import com.datablau.catalog.enums.EnumCatalogPublicType;
import com.datablau.catalog.enums.EnumStructureType;
import com.datablau.catalog.listener.EntityPersistEventListener;
import com.datablau.graph.data.annotation.GraphObject;
import com.datablau.graph.data.annotation.GraphObjectEndpoint;
import com.datablau.graph.data.annotation.GraphObjectProperty;
import com.datablau.graph.data.data.GraphRelationShipType;
import com.datablau.graph.data.util.EntityPersistForGraphListener;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;
import org.hibernate.annotations.Type;
import org.springframework.beans.BeanUtils;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.Lob;
import javax.persistence.Table;
import java.io.Serializable;

import static com.datablau.catalog.enums.EnumAssetsCatalogStatus.PUBLISHED;
import static com.datablau.catalog.enums.EnumStructureType.DATA_ASSETS;
import static com.datablau.catalog.enums.EnumStructureType.DATA_SECURITY_ITEM;


/**
 * 数据资产目录
 *
 * @Author Nicky - 蓝图明册科技有限公司
 * @Date 2017/11/20 14:41
 */
@Entity
@Table(name = "db_common_catalog",indexes = {@Index(name = "db_idx_catalog_structureId", columnList = "structure_id")})
@GraphObject(typeIdMethod = "getTypeIdForGraph", nameMethod = "getName", idMethod = "getId", isSaveMethod = "judgeSaved", descriptionMethod = "getComment")
@EntityListeners({EntityPersistForGraphListener.class, EntityPersistEventListener.class})
public class CommonCatalog implements Serializable {

    @Id
    @GeneratedValue(generator = "infocatalog_generator")
    @GenericGenerator(name = "infocatalog_generator", strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@Parameter(name = "sequence_name", value = "INFOCATALOG_SEQ")})
    private Long id;

    @Column(name = "parent_id")
    @Comment("父节点ID")
    @GraphObjectEndpoint(methodToGetEndpointId = "getParentId", isEndpointSrc = true, relationShip = GraphRelationShipType.CHILD, methodToGetEndpointTypeId = "getTypeIdForGraph", isOnlyOne = false)
    private Long parentId;

    @Column(name = "catalog_name", length = 500)
    @Comment("分类名")
    private String name;

    @Column(name = "catalog_order")
    @Comment("顺序")
    private Long order;

    @Column(name = "english_name", length = 500)
    @Comment("英文名")
    private String englishName;

    @Column(name = "describe_info")
    @Comment("描述")
    @Lob
    @Type(type = "com.andorj.model.common.utility.postgres.PostgresTextType")
    private String comment;

    @Column(name = "catalog_belong")
    @Comment("目录属于哪个系统：用于与数据分类进行区分")
    private String catalogBelong;

    @Column(name = "structure_id")
    @Comment("结构id : DataAssetsCatalogStructure")
    @GraphObjectProperty(propertyName = "structureId", methodToGetStringValue = "getStructureId")
    private Long structureId;

    @Column(name = "catalog_type_id")
    @Comment("目录类型id : DataAssetsCatalogType")
    private Long catalogTypeId;

    @Column(name = "keyword", length = 500)
    @Comment("关键字")
    private String keyword;

    @Column(name = "creator")
    @Comment("创建人")
    private String creator;

    @Column(name = "approver")
    @Comment("审批人")
    private String approver;

    @Column(name = "butler")
    @Comment("数据管家")
    private String butler;

    @Column(name = "status")
    @Comment("发布状态")
    @Enumerated(EnumType.STRING)
    @GraphObjectProperty(propertyName = "status", methodToGetStringValue = "getStatus")
    private EnumAssetsCatalogStatus status;

    @Column(name = "create_time")
    @Comment("创建时间")
    private String createTime;

    @Column(name = "publish_time")
    @Comment("发布时间")
    private String publishTime;

    @Column(name = "modify_time")
    @Comment("修改时间")
    private String modifyTime;

    @Column(name = "bm")
    @Comment("权属")
    private String bm;

    @Column(name = "catalog_path")
    @Comment("目录路径:格式为 0/1/2/")
    private String catalogPath;

    @Column(name = "catalog_level")
    @Comment("目录等级")
    private Integer level;

    @Column(name = "quality_problem_num")
    @Comment("质量问题")
    private Long qualityProblemNum = 0L;

    @Column(name = "pub_quality_problem_num")
    @Comment("质量问题")
    private Long pubQualityProblemNum = 0L;

    @Column(name = "public_type")
    @Comment("公开访问权限")
    @Enumerated(EnumType.STRING)
    @GraphObjectProperty(propertyName = "publicType", methodToGetStringValue = "getPublicType")
    private EnumCatalogPublicType publicType;

    @Column(name = "structure_type")
    @Comment("结构类型 枚举 （EnumStructureType）")
    @Enumerated(EnumType.STRING)
    private EnumStructureType structureType;

    @Column(name = "catalog_code")
    @Comment("编码")
    private String code;

    @Column(name = "catalog_visible")
    @Comment("是否公开可见")
    private Boolean visible;

    public EnumStructureType getStructureType() {
        return structureType;
    }

    public void setStructureType(EnumStructureType structureType) {
        this.structureType = structureType;
    }

    //定位关系节点的类型
    @JsonIgnore
    public Long getTypeIdForGraph() {
        switch (structureType) {
            case DATA_ASSETS:
                return CatalogLDMTypes.oCatalog;
            case DATA_SECURITY:
                return CatalogLDMTypes.oDataSecurityCatalog;
            case DATA_SECURITY_ITEM:
                return CatalogLDMTypes.oDataSecurityItemCatalog;
            case DISCERN_RULE:
                return CatalogLDMTypes.oDiscernRuleCatalog;
            default:
                return CatalogLDMTypes.oCatalog;
        }
    }

    @JsonIgnore
    public boolean judgeSaved() {
        //当目录类型是资产目录类型且未发布状态时,不进入图库
        if (structureType == DATA_ASSETS && status != PUBLISHED) {
            return false;
        }
        //需求3410:信息项的目录不进入知识图谱
        if (structureType == DATA_SECURITY_ITEM) {
            return false;
        }
        return true;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getOrder() {
        return order;
    }

    public void setOrder(Long order) {
        this.order = order;
    }

    public String getEnglishName() {
        return englishName;
    }

    public void setEnglishName(String englishName) {
        this.englishName = englishName;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getCatalogBelong() {
        return catalogBelong;
    }

    public void setCatalogBelong(String catalogBelong) {
        this.catalogBelong = catalogBelong;
    }

    public Long getStructureId() {
        return structureId;
    }

    public void setStructureId(Long structureId) {
        this.structureId = structureId;
    }

    public Long getCatalogTypeId() {
        return catalogTypeId;
    }

    public void setCatalogTypeId(Long catalogTypeId) {
        this.catalogTypeId = catalogTypeId;
    }

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }

    public String getApprover() {
        return approver;
    }

    public void setApprover(String approver) {
        this.approver = approver;
    }

    public String getButler() {
        return butler;
    }

    public void setButler(String butler) {
        this.butler = butler;
    }


    public EnumAssetsCatalogStatus getStatus() {
        return status;
    }

    public void setStatus(EnumAssetsCatalogStatus status) {
        this.status = status;
    }

    public String getCreateTime() {
        return createTime;
    }

    public void setCreateTime(String createTime) {
        this.createTime = createTime;
    }

    public String getPublishTime() {
        return publishTime;
    }

    public void setPublishTime(String publishTime) {
        this.publishTime = publishTime;
    }

    public String getModifyTime() {
        return modifyTime;
    }

    public void setModifyTime(String modifyTime) {
        this.modifyTime = modifyTime;
    }

    public String getBm() {
        return bm;
    }

    public void setBm(String bm) {
        this.bm = bm;
    }

    public String getCatalogPath() {
        return catalogPath;
    }

    public void setCatalogPath(String catalogPath) {
        this.catalogPath = catalogPath;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public Long getQualityProblemNum() {
        return qualityProblemNum;
    }

    public void setQualityProblemNum(Long qualityProblemNum) {
        this.qualityProblemNum = qualityProblemNum;
    }

    public Long getPubQualityProblemNum() {
        return pubQualityProblemNum;
    }

    public void setPubQualityProblemNum(Long pubQualityProblemNum) {
        this.pubQualityProblemNum = pubQualityProblemNum;
    }

    public EnumCatalogPublicType getPublicType() {
        return publicType;
    }

    public void setPublicType(EnumCatalogPublicType publicType) {
        this.publicType = publicType;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Boolean getVisible() {
        return visible;
    }

    public void setVisible(Boolean visible) {
        this.visible = visible;
    }

    public CommonCatalogDto toDto() {
        CommonCatalogDto catalogDto = new CommonCatalogDto();
        BeanUtils.copyProperties(this, catalogDto);
        return catalogDto;
    }
}
