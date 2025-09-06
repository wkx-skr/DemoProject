package com.datablau.domain.management.dto;

import com.datablau.domain.management.jpa.type.DomainStateExt;
import io.swagger.v3.oas.annotations.media.Schema;

import java.io.Serializable;
import java.util.List;
import java.util.Set;

public class StandardCodeQueryNewDto implements Serializable {

    @Schema(
            title = "提交人"
    )
    private String submitter;
    @Schema(
            title = "名字"
    )
    private String name;
    @Schema(
            title = "编码"
    )
    private String code;
    @Schema(
            title = "数据设置名字"
    )
    private String datasetName;
    @Schema(
            title = "状态"
    )
    private DomainStateExt state;
    @Schema(
            title = "当前页"
    )
    private Integer currentPage;
    @Schema(
            title = "页宽"
    )
    private Integer pageSize;
    @Schema(
            title = "目录编码"
    )
    private Long categoryId;
    @Schema(
            title = "目录编码集合"
    )
    private List<Long> categoryIds;
    @Schema(
            title = "码值"
    )
    private List<String> codes;
    @Schema(
            title = "版本"
    )
    private Integer srvVersion;
    @Schema(
            title = "标签版本"
    )
    private Integer tagVersion;
    @Schema(
            title = "标签"
    )
    private Set<Long> tagIds;

    @Schema(
            title = "目录ID"
    )
    private Long folderId;

    @Schema(
            title = "是否关联Domain"
    )
    private Boolean relaDomain;

    public String getSubmitter() {
        return submitter;
    }

    public void setSubmitter(String submitter) {
        this.submitter = submitter;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDatasetName() {
        return datasetName;
    }

    public void setDatasetName(String datasetName) {
        this.datasetName = datasetName;
    }

    public DomainStateExt getState() {
        return state;
    }

    public void setState(DomainStateExt state) {
        this.state = state;
    }

    public Integer getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(Integer currentPage) {
        this.currentPage = currentPage;
    }

    public Integer getPageSize() {
        return pageSize;
    }

    public void setPageSize(Integer pageSize) {
        this.pageSize = pageSize;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public List<Long> getCategoryIds() {
        return categoryIds;
    }

    public void setCategoryIds(List<Long> categoryIds) {
        this.categoryIds = categoryIds;
    }

    public List<String> getCodes() {
        return codes;
    }

    public void setCodes(List<String> codes) {
        this.codes = codes;
    }

    public Integer getSrvVersion() {
        return srvVersion;
    }

    public void setSrvVersion(Integer srvVersion) {
        this.srvVersion = srvVersion;
    }

    public Integer getTagVersion() {
        return tagVersion;
    }

    public void setTagVersion(Integer tagVersion) {
        this.tagVersion = tagVersion;
    }

    public Set<Long> getTagIds() {
        return tagIds;
    }

    public void setTagIds(Set<Long> tagIds) {
        this.tagIds = tagIds;
    }

    public Long getFolderId() {
        return folderId;
    }

    public void setFolderId(Long folderId) {
        this.folderId = folderId;
    }

    public Boolean getRelaDomain() {
        return relaDomain;
    }

    public void setRelaDomain(Boolean relaDomain) {
        this.relaDomain = relaDomain;
    }
}
