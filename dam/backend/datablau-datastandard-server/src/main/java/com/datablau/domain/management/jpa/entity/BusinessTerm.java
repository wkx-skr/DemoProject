package com.datablau.domain.management.jpa.entity;

import com.andorj.common.core.annotation.Comment;
import com.andorj.common.core.annotation.Comparable;
import com.datablau.domain.management.data.DomainState;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;
import org.hibernate.id.enhanced.SequenceStyleGenerator;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;


@Entity
@Table(name = "db_business_term",
        indexes = {
                @Index(columnList = "folder_id", name = "idx_business_term_folder_id", unique = false),
                @Index(columnList = "ch_name", name = "idx_business_term_ch_name", unique = false),
                @Index(columnList = "rela_id", name = "idx_business_term_rela_id", unique = false),
                @Index(columnList = "category_id", name = "idx_business_term_category_id", unique = false)
        }
)
public class BusinessTerm implements Serializable {

    @Id
    @GeneratedValue(generator = "business_term_generator")
    @GenericGenerator(name = "business_term_generator", strategy = "com.datablau.data.common.jpa.util.DatablauIdGenerator",
            parameters = {@Parameter(name = SequenceStyleGenerator.SEQUENCE_PARAM, value = "BUSINESS_TERM_SEQ"),
                    @Parameter(name = SequenceStyleGenerator.INITIAL_PARAM, value = "100")})
    @Column(name = "id")
    @Comment("ID")
    private Long id;

    @Column(name = "folder_id")
    @Comment("目录id")
    @Comparable(name = "目录id")
    private Long folderId;

    @Column(name = "category_id")
    @Comment("分类id")
    @Comparable(name = "分类id")
    private Long categoryId;

    @Column(name = "domain_code")
    @Comment("数据标准编码")
    private String domainCode;

    @Column(name = "ch_name")
    @Comment("业务术语名称")
    @Comparable(name = "业务术语名称")
    private String chName;

    @Column(name = "en_name")
    @Comment("业务术语英文名称")
    @Comparable(name = "业务术语英文名称")
    private String enName;

    @Column(name = "abbr")
    @Comment("业务数语英文缩写")
    @Comparable(name = "业务数语英文缩写")
    private String abbr;

    @Column(name = "explanation_terms")
    @Comment("术语解释")
    @Comparable(name = "术语解释")
    @Lob
    private String explanationTerms;

    @Column(name = "scene")
    @Comment("应用场景")
    @Lob
    private String scene;

    @Column(name = "example")
    @Comment("示例")
    @Lob
    private String example;

    @Column(name = "business_term_aliases")
    @Comment("业务术语别名")
    @Comparable(name = "业务术语别名")
    private String businessTermAliases;

    @Comment("相关术语")
    @Column(name = "rela_id")
    private Long relaId;

    @Column(name = "management_department")
    @Comment("责任主体")
    @Comparable(name = "责任主体")
    private String managementDepartment;

    @Column(name = "source")
    @Comment("参考来源")
    @Comparable(name = "参考来源")
    private String source;

    @Column(name = "reporter")
    @Comment("提报人")
    @Comparable(name = "提报人")
    private String reporter;

    @Column(name = "update_time", nullable = false)
    @Comment("更新时间")
    protected Long updateTime;


    @Column(name = "first_pub")
    @Temporal(TemporalType.TIMESTAMP)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss Z")
    @Comment("第一次发布日期")
    private Date firstPublish;

    @Column(name = "state", length = 4)
    @Enumerated(EnumType.STRING)
    @Comment("发布状态")
    private DomainState state;

    @Column(name = "update_ns_id")
    @Comment("正在更新版本的原始业务术语ID")
    private Long updatingNsId;

    @Column(name = "ver_id")
    @Comment("版本号")
    private Integer version;

    public BusinessTerm() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getDomainCode() {
        return domainCode;
    }

    public void setDomainCode(String domainCode) {
        this.domainCode = domainCode;
    }

    public String getChName() {
        return chName;
    }

    public void setChName(String chName) {
        this.chName = chName;
    }

    public String getEnName() {
        return enName;
    }

    public void setEnName(String enName) {
        this.enName = enName;
    }

    public String getAbbr() {
        return abbr;
    }

    public void setAbbr(String abbr) {
        this.abbr = abbr;
    }

    public String getExplanationTerms() {
        return explanationTerms;
    }

    public void setExplanationTerms(String explanationTerms) {
        this.explanationTerms = explanationTerms;
    }

    public String getScene() {
        return scene;
    }

    public void setScene(String scene) {
        this.scene = scene;
    }

    public String getExample() {
        return example;
    }

    public void setExample(String example) {
        this.example = example;
    }

    public String getBusinessTermAliases() {
        return businessTermAliases;
    }

    public void setBusinessTermAliases(String businessTermAliases) {
        this.businessTermAliases = businessTermAliases;
    }

    public Long getRelaId() {
        return relaId;
    }

    public void setRelaId(Long relaId) {
        this.relaId = relaId;
    }

    public String getManagementDepartment() {
        return managementDepartment;
    }

    public void setManagementDepartment(String managementDepartment) {
        this.managementDepartment = managementDepartment;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getReporter() {
        return reporter;
    }

    public void setReporter(String reporter) {
        this.reporter = reporter;
    }

    public Long getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(Long updateTime) {
        this.updateTime = updateTime;
    }

    public Date getFirstPublish() {
        return firstPublish;
    }

    public void setFirstPublish(Date firstPublish) {
        this.firstPublish = firstPublish;
    }

    public DomainState getState() {
        return state;
    }

    public void setState(DomainState state) {
        this.state = state;
    }

    public Long getUpdatingNsId() {
        return updatingNsId;
    }

    public void setUpdatingNsId(Long updatingNsId) {
        this.updatingNsId = updatingNsId;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public Long getFolderId() {
        return folderId;
    }

    public void setFolderId(Long folderId) {
        this.folderId = folderId;
    }
}
