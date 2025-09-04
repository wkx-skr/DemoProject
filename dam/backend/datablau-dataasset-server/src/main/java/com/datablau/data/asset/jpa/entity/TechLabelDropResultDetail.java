package com.datablau.data.asset.jpa.entity;

import com.andorj.common.core.annotation.Comment;
import com.datablau.data.asset.dto.DesignLabelDropResultDetailDto;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;


@Entity
@Table(
        name = "tech_label_drop_result_detail"
)
public class TechLabelDropResultDetail {


    @Id
    @Column(name = "id")
    @GeneratedValue(
            generator = "tech_label_drop_result_detail_generator"
    )
    @GenericGenerator(
            name = "tech_label_drop_result_detail",
            strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@org.hibernate.annotations.Parameter(
                    name = "sequence_name",
                    value = "TECH_LABEL_DROP_RESULT_DETAIL_SEQ"
            )}
    )
    private Long id;
    /**
     * 字段来源
     */
    @Column(name = "column_source")
    private String columnSource;

    /**
     * 映射字段
     */
    @Column(name = "mapping_column")
    private String mappingColumn;

    /**
     * 逻辑数据实体
     */
    @Column(name = "logic_entity")
    private String logicEntity;

    /**
     * 实体属性
     */
    @Column(name = "attribute")
    private String attribute;

    /**
     * 数据元标准
     */
    @Column(name = "domain_name")
    private String domainName;

    /**
     * 数据元标准ID
     */
    @Column(name = "domain_id")
    private String domainId;

    /**
     * 落标状态
     */
    @Column(name = "status")
    private String status;

    /**
     * 字段来源
     */
    @Column(name = "category_path")
    private String categoryPath;

    /**
     * 落标问题描述
     */
    @Column(name = "descs")
    private String descs;

    /**
     * 标准值
     */
    @Column(name = "domain_value")
    private String domainValue;

    /**
     * 实际值
     */
    @Column(name = "column_value")
    private String columnValue;

    @Comment("校验时间")
    @Column(name = "check_time")
    private String checkTime;

    public TechLabelDropResultDetail(){

    }

    public TechLabelDropResultDetail(DesignLabelDropResultDetailDto designLabelDropResultDetailDto) {
        this.categoryPath = designLabelDropResultDetailDto.getCategoryPath();
        this.domainId = designLabelDropResultDetailDto.getDomainId();
        this.domainName = designLabelDropResultDetailDto.getDomainName();
        this.domainValue = designLabelDropResultDetailDto.getDomainValue();
        this.columnValue = designLabelDropResultDetailDto.getColumnValue();
        this.columnSource = designLabelDropResultDetailDto.getColumnSource();
        this.mappingColumn = designLabelDropResultDetailDto.getMappingColumn();
        this.logicEntity = designLabelDropResultDetailDto.getLogicEntity();
        this.attribute = designLabelDropResultDetailDto.getAttribute();
        this.status = designLabelDropResultDetailDto.getStatus();
        this.descs = designLabelDropResultDetailDto.getDesc();
    }

    public String getCheckTime() {
        return checkTime;
    }

    public void setCheckTime(String checkTime) {
        this.checkTime = checkTime;
    }

    public String getDescs() {
        return descs;
    }

    public void setDescs(String descs) {
        this.descs = descs;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDomainId() {
        return domainId;
    }

    public void setDomainId(String domainId) {
        this.domainId = domainId;
    }

    public String getDomainValue() {
        return domainValue;
    }

    public void setDomainValue(String domainValue) {
        this.domainValue = domainValue;
    }

    public String getColumnValue() {
        return columnValue;
    }

    public void setColumnValue(String columnValue) {
        this.columnValue = columnValue;
    }

    public String getCategoryPath() {
        return categoryPath;
    }

    public void setCategoryPath(String categoryPath) {
        this.categoryPath = categoryPath;
    }

    public String getColumnSource() {
        return columnSource;
    }

    public void setColumnSource(String columnSource) {
        this.columnSource = columnSource;
    }

    public String getMappingColumn() {
        return mappingColumn;
    }

    public void setMappingColumn(String mappingColumn) {
        this.mappingColumn = mappingColumn;
    }

    public String getLogicEntity() {
        return logicEntity;
    }

    public void setLogicEntity(String logicEntity) {
        this.logicEntity = logicEntity;
    }

    public String getAttribute() {
        return attribute;
    }

    public void setAttribute(String attribute) {
        this.attribute = attribute;
    }

    public String getDomainName() {
        return domainName;
    }

    public void setDomainName(String domainName) {
        this.domainName = domainName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

}
