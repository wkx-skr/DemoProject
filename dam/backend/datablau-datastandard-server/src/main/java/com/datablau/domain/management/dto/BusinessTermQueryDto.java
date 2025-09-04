package com.datablau.domain.management.dto;

import com.datablau.domain.management.data.DomainState;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * @ClassName：BusinessTermQueryDto
 * @Author: dingzicheng
 * @Date: 2024/9/2 16:59
 * @Description: 业务术语查询DTO
 */
@Schema(
        title = "业务术语传查询实体",
        description = "业务术语传查询实体"
)
public class BusinessTermQueryDto {
    @Schema(title = "业务术语名称", description = "业务术语名称")
    private String keyword;
    @Schema(title = "业务术语名称", description = "业务术语名称")
    private String chName;
    @Schema(title = "数据标准编码", description = "数据标准编码")
    private String domainCode;

    @Schema(title = "目录id", description = "目录id")
    private Long folderId;

    @Schema(title = "修改时间", description = "修改时间")
    private Long updateTime;

    @Schema(title = "标准状态", description = "标准状态")
    private DomainState domainState;

    private String orderBy;
    private String sort;
    private Integer currentPage;
    private Integer pageSize;
    public String getChName() {
        return chName;
    }

    public void setChName(String chName) {
        this.chName = chName;
    }

    public String getDomainCode() {
        return domainCode;
    }

    public void setDomainCode(String domainCode) {
        this.domainCode = domainCode;
    }

    public Long getFolderId() {
        return folderId;
    }

    public void setFolderId(Long folderId) {
        this.folderId = folderId;
    }

    public Long getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(Long updateTime) {
        this.updateTime = updateTime;
    }

    public DomainState getDomainState() {
        return domainState;
    }

    public void setDomainState(DomainState domainState) {
        this.domainState = domainState;
    }

    public String getOrderBy() {
        return orderBy;
    }

    public void setOrderBy(String orderBy) {
        this.orderBy = orderBy;
    }

    public String getSort() {
        return sort;
    }

    public void setSort(String sort) {
        this.sort = sort;
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

    public String getKeyword() {
        return keyword;
    }

    public void setKeyword(String keyword) {
        this.keyword = keyword;
    }
}
