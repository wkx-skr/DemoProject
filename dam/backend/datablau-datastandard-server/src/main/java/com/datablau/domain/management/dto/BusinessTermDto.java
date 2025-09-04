package com.datablau.domain.management.dto;

import com.andorj.common.core.annotation.Comment;
import com.andorj.common.core.annotation.Comparable;
import com.andorj.model.common.annotation.ExcelColumn;
import com.datablau.domain.management.utils.JsonUtils;
import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.jpa.entity.BusinessTerm;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.SchemaProperty;
import org.apache.commons.lang.StringUtils;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Parameter;
import org.hibernate.id.enhanced.SequenceStyleGenerator;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;
import java.util.List;
import java.util.Objects;

@Schema(
        title = "业务术语传输层",
        description = "业务术语传输层"
)
public class BusinessTermDto implements Serializable {
    private static final long serialVersionUID = 5891608406630445767L;

    @Schema(title = "ID")
    private Long id;

    @Schema(title = "目录id")
    private Long folderId;

    @Schema(title = "分类id")
    private Long categoryId;

    @Schema(title = "数据标准编码")
    private String domainCode;

    @Schema(title = "业务术语名称")
    private String chName;

    @Schema(title = "业务术语英文名称")
    private String enName;

    @Schema(title = "业务数语英文缩写")
    private String abbr;

    @Schema(title = "术语解释")
    private String explanationTerms;

    @Schema(title = "应用场景")
    private String scene;

    @Schema(title = "示例")
    private String example;

    @Schema(title = "业务术语别名")
    private String businessTermAliases;

    @Schema(title = "相关术语")
    private Long relaId;

    @Schema(title = "责任主体")
    private String managementDepartment;

    @Schema(title = "参考来源")
    private String source;

    @Schema(title = "提报人")
    private String reporter;

    @Schema(title = "更新时间")
    protected Long updateTime;


    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss Z")
    @Schema(title = "第一次发布日期")
    private Date firstPublish;

    @Schema(title = "发布状态")
    private DomainState state;

    @Schema(title = "正在更新版本的原始业务术语ID")
    private Long updatingNsId;

    @Schema(title = "版本号")
    private Integer version;

    @Schema(title = "责任主体名称")
    private String managementDepartmentName;

    private String relaTerm;

    private List<String> paths;

    private String bizCode;

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

    public BusinessTerm build() {
        return JsonUtils.toObject(JsonUtils.toJSon(this), BusinessTerm.class);
    }
    public static BusinessTermDto buildBy(BusinessTerm businessTerm) {
        return JsonUtils.toObject(JsonUtils.toJSon(businessTerm), BusinessTermDto.class);
    }

    public String getManagementDepartmentName() {
        return managementDepartmentName;
    }

    public void setManagementDepartmentName(String managementDepartmentName) {
        this.managementDepartmentName = managementDepartmentName;
    }

    public List<String> getPaths() {
        return paths;
    }

    public void setPaths(List<String> paths) {
        this.paths = paths;
    }

    public String getRelaTerm() {
        return relaTerm;
    }

    public void setRelaTerm(String relaTerm) {
        this.relaTerm = relaTerm;
    }

    public String getBizCode() {
        return bizCode;
    }

    public void setBizCode(String bizCode) {
        this.bizCode = bizCode;
    }

    public static BusinessTerm buildByDao(BusinessTermDto businessTerm) {
        return JsonUtils.toObject(JsonUtils.toJSon(businessTerm), BusinessTerm.class);
    }
}
