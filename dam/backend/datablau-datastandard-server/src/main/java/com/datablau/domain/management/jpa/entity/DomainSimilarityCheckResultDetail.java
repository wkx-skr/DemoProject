package com.datablau.domain.management.jpa.entity;


import com.andorj.common.core.annotation.Comment;
import com.andorj.common.core.annotation.Comparable;
import com.datablau.domain.management.data.DomainState;
import com.datablau.graph.data.annotation.GraphObjectProperty;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;
import java.util.List;

@Entity
@Table(
        name = "db_domain_similarity_check_result_detail",
        indexes = {
                @Index(
                        name = "idx_domain_similarity_check_result_detail_cluster_id",
                        columnList = "cluster_id"
                )
        }
)
public class DomainSimilarityCheckResultDetail  implements Serializable {
    private static final long serialVersionUID = -1l;
    @Id
    @GeneratedValue(
            generator = "domain_similarity_check_result_detail_generator"
    )
    @GenericGenerator(
            name = "domain_similarity_check_result_detail_generator",
            strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@org.hibernate.annotations.Parameter(
                    name = "sequence_name",
                    value = "DOMAIN_SIMILARITY_CHECK_RESULT_DETAIL_SEQ"
            )}
    )
    @Column(
            name = "id"
    )
    @Comment("聚合明细ID")
    private Long id;
    @Column(
            name = "cluster_id"
    )
    @Comment("聚合ID")
    private Long clusterId;

    @Column(
            name = "score"
    )
    @Comment("分数")
    private float score;

    @Column(
            name = "domain_id"
    )
    @Comment("标准id")
    private String domainId;

    @Column(
            name = "domain_code"
    )
    @Comment("标准编码")
    private String domainCode;
    @Column(
            name = "ch_name"
    )
    @Comment("中文名称")
    private String chineseName;
    @Column(
            name = "en_name"
    )
    @Comment("英文名称")
    private String englishName;
    @Column(
            name = "folder_id"
    )
    @Comment("目录id")
    private Long folderId;

    @Column(
            name = "state",
            length = 4
    )
    @Enumerated(EnumType.STRING)
    @Comment("发布状态")
    private DomainState state;

    @Column(
            name = "data_type"
    )
    @Comment("数据类型")
    @Comparable(
            name = "数据类型"
    )
    private String dataType;
    @Column(
            name = "data_scale"
    )
    @Comment("数据长度")
    @Comparable(
            name = "数据长度"
    )
    private Integer dataScale;
    @Column(
            name = "data_precision"
    )
    @Comment("数据精度")
    @Comparable(
            name = "数据精度"
    )
    private Integer dataPrecision;
    @Column(
            name = "submitter"
    )
    @Comment("谁提交的数据标准")
    private String submitter;

    @Column(
            name = "description_department"
    )
    @Comment("业务定义部门")
    @Comparable(
            name = "业务定义部门"
    )
    private String descriptionDepartment;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getClusterId() {
        return clusterId;
    }

    public void setClusterId(Long clusterId) {
        this.clusterId = clusterId;
    }

    public float getScore() {
        return score;
    }

    public void setScore(float score) {
        this.score = score;
    }

    public String getDomainId() {
        return domainId;
    }

    public void setDomainId(String domainId) {
        this.domainId = domainId;
    }

    public String getDomainCode() {
        return domainCode;
    }

    public void setDomainCode(String domainCode) {
        this.domainCode = domainCode;
    }

    public String getChineseName() {
        return chineseName;
    }

    public void setChineseName(String chineseName) {
        this.chineseName = chineseName;
    }

    public String getEnglishName() {
        return englishName;
    }

    public void setEnglishName(String englishName) {
        this.englishName = englishName;
    }

    public Long getFolderId() {
        return folderId;
    }

    public void setFolderId(Long folderId) {
        this.folderId = folderId;
    }

    public DomainState getState() {
        return state;
    }

    public void setState(DomainState state) {
        this.state = state;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public Integer getDataScale() {
        return dataScale;
    }

    public void setDataScale(Integer dataScale) {
        this.dataScale = dataScale;
    }

    public Integer getDataPrecision() {
        return dataPrecision;
    }

    public void setDataPrecision(Integer dataPrecision) {
        this.dataPrecision = dataPrecision;
    }

    public String getSubmitter() {
        return submitter;
    }

    public void setSubmitter(String submitter) {
        this.submitter = submitter;
    }

    public String getDescriptionDepartment() {
        return descriptionDepartment;
    }

    public void setDescriptionDepartment(String descriptionDepartment) {
        this.descriptionDepartment = descriptionDepartment;
    }
}
