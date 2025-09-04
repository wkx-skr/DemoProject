package com.datablau.base.server.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.io.Serializable;
import java.util.List;

/**
 * @author zxy
 * @create 2025/4/9 下午16:50
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ModelCategoryTreeNodeDto implements Serializable {

    private String name;
    private Long folderId;
    private Long parentId;
    private List<ModelCategoryTreeNodeDto> nodes;
    private Integer order;
    private Long categoryId;

    public ModelCategoryTreeNodeDto() {
    }

    public ModelCategoryTreeNodeDto(String name) {
        this.name = name;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getFolderId() {
        return folderId;
    }

    public void setFolderId(Long folderId) {
        this.folderId = folderId;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public List<ModelCategoryTreeNodeDto> getNodes() {
        return nodes;
    }

    public void setNodes(List<ModelCategoryTreeNodeDto> nodes) {
        this.nodes = nodes;
    }

    public Integer getOrder() {
        return order;
    }

    public void setOrder(Integer order) {
        this.order = order;
    }
}
