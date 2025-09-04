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
 *  元数据和目录映射日志表
 */
@Entity
@Table(
        name = "meta_data_mapping_catalog_log"
)
public class MetaDataMappingCatalogLog {

    @Id
    @Column(name = "id")
    @GeneratedValue(
            generator = "meta_data_mapping_catalog_log_generator"
    )
    @GenericGenerator(
            name = "meta_data_mapping_catalog_log_generator",
            strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@org.hibernate.annotations.Parameter(
                    name = "sequence_name",
                    value = "meta_data_mapping_catalog_log_seq"
            )}
    )
    private Long id;
    @Column(name = "mapping_id")
    @Comment("映射ID")
    private Long mappingId;

    @Column(name = "mapping_type")
    @Comment("映射类型")
    private String mappingType;

    @Column(name = "operator_time")
    @Comment("操作时间")
    private Date operatorTime;

    @Column(name = "operator")
    @Comment("操作人")
    private String operator;

    @Column(name = "catalog_id")
    @Comment("目录id")
    private Long catalogId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getMappingId() {
        return mappingId;
    }

    public void setMappingId(Long mappingId) {
        this.mappingId = mappingId;
    }

    public String getMappingType() {
        return mappingType;
    }

    public void setMappingType(String mappingType) {
        this.mappingType = mappingType;
    }

    public Date getOperatorTime() {
        return operatorTime;
    }

    public void setOperatorTime(Date operatorTime) {
        this.operatorTime = operatorTime;
    }

    public String getOperator() {
        return operator;
    }

    public void setOperator(String operator) {
        this.operator = operator;
    }

    public Long getCatalogId() {
        return catalogId;
    }

    public void setCatalogId(Long catalogId) {
        this.catalogId = catalogId;
    }
}
