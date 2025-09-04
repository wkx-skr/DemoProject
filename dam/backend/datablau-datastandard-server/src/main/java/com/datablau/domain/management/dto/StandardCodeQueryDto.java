//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

package com.datablau.domain.management.dto;

import com.datablau.domain.management.data.DomainState;
import io.swagger.v3.oas.annotations.media.Schema;
import java.io.Serializable;
import java.util.List;
import java.util.Set;

@Schema(
        title = "查询标准代码传输层"
)
public class StandardCodeQueryDto implements Serializable {
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
    private DomainState state;
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

    public StandardCodeQueryDto() {
    }

    public String getDatasetName() {
        return this.datasetName;
    }

    public void setDatasetName(String datasetName) {
        this.datasetName = datasetName;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public DomainState getState() {
        return this.state;
    }

    public void setState(DomainState state) {
        this.state = state;
    }

    public Integer getCurrentPage() {
        return this.currentPage;
    }

    public void setCurrentPage(Integer currentPage) {
        this.currentPage = currentPage;
    }

    public Integer getPageSize() {
        return this.pageSize;
    }

    public void setPageSize(Integer pageSize) {
        this.pageSize = pageSize;
    }

    public String getSubmitter() {
        return this.submitter;
    }

    public void setSubmitter(String submitter) {
        this.submitter = submitter;
    }

    public String getCode() {
        return this.code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Long getCategoryId() {
        return this.categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Integer getSrvVersion() {
        return this.srvVersion;
    }

    public void setSrvVersion(Integer srvVersion) {
        this.srvVersion = srvVersion;
    }

    public Integer getTagVersion() {
        return this.tagVersion;
    }

    public void setTagVersion(Integer tagVersion) {
        this.tagVersion = tagVersion;
    }

    public List<String> getCodes() {
        return this.codes;
    }

    public void setCodes(List<String> codes) {
        this.codes = codes;
    }

    public List<Long> getCategoryIds() {
        return this.categoryIds;
    }

    public void setCategoryIds(List<Long> categoryIds) {
        this.categoryIds = categoryIds;
    }

    public Set<Long> getTagIds() {
        return this.tagIds;
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
