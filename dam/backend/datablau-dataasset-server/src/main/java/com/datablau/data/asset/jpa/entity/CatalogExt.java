package com.datablau.data.asset.jpa.entity;

import com.andorj.common.core.annotation.Comment;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import java.io.Serializable;

/**
 * @author: hxs
 * @date: 2025/4/28 14:29
 */

@Entity
@Table(name = "db_common_catalog_ext")
public class CatalogExt implements Serializable {

    @Id
    @GeneratedValue(generator = "db_common_catalog_ext_generator")
    @GenericGenerator(name = "db_common_catalog_ext_generator", strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@Parameter(name = "sequence_name", value = "db_common_catalog_ext_seq")})
    private Long id;

    @Column(name = "catalogId")
    @Comment("资产目录id")
    private Long catalogId;

    @Column(name = "dataClassification")
    @Comment("数据分类")
    private String dataClassification;

    @Column(name = "sourceSystem")
    @Comment("来源系统")
    private String sourceSystem;

    @Column(name = "sNull")
    @Comment("是否为null")
    private Boolean sNull;

    @Column(name = "domainId")
    @Comment("数据标准id")
    private String domainId;

    @Column(name = "sPk")
    @Comment("是否是主键")
    private Boolean sPk;

    @Column(name = "defaultValue")
    @Comment("默认值")
    private String defaultValue;

    @Column(name = "dataType")
    @Comment("数据类型")
    private String dataType;

    @Column(name = "apply_username")
    @Comment("审批人数据")
    private String applyUsername;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCatalogId() {
        return catalogId;
    }

    public void setCatalogId(Long catalogId) {
        this.catalogId = catalogId;
    }

    public String getDataClassification() {
        return dataClassification;
    }

    public void setDataClassification(String dataClassification) {
        this.dataClassification = dataClassification;
    }

    public Boolean getsNull() {
        return sNull;
    }

    public void setsNull(Boolean sNull) {
        this.sNull = sNull;
    }

    public String getDomainId() {
        return domainId;
    }

    public void setDomainId(String domainId) {
        this.domainId = domainId;
    }

    public Boolean getsPk() {
        return sPk;
    }

    public void setsPk(Boolean sPk) {
        this.sPk = sPk;
    }

    public String getDefaultValue() {
        return defaultValue;
    }

    public void setDefaultValue(String defaultValue) {
        this.defaultValue = defaultValue;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public String getSourceSystem() {
        return sourceSystem;
    }

    public void setSourceSystem(String sourceSystem) {
        this.sourceSystem = sourceSystem;
    }

    public String getApplyUsername() {
        return applyUsername;
    }

    public void setApplyUsername(String applyUsername) {
        this.applyUsername = applyUsername;
    }
}
