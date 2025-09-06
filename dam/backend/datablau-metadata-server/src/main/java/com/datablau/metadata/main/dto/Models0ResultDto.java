package com.datablau.metadata.main.dto;

import com.datablau.datasource.data.ConnectType;
import com.datablau.datasource.data.CredentialInfo;
import com.datablau.datasource.data.DataConnect;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * @author: hxs
 * @date: 2025/9/2 10:20
 */
public class Models0ResultDto {

    @Schema(title = "数据源id")
    private Long id;

    @Schema(title = "数据源名称")
    private String sourceName;

    @Schema(title = "数据源类型")
    private String type;

    @Schema(title = "系统名称")
    private String categoryName;

    @Schema(title = "系统ID")
    private Long categoryId;

    @Schema(title = "数据源所有者")
    private String owner;

    @Schema(title = "创建时间")
    private Date createTime;

    @Schema(title = "最后修改时间")
    private Date lastModification;

    @Schema(title = "描述")
    private String description;

    @Schema(title = "父级目录")
    private Long parentId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSourceName() {
        return sourceName;
    }

    public void setSourceName(String sourceName) {
        this.sourceName = sourceName;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    public Date getLastModification() {
        return lastModification;
    }

    public void setLastModification(Date lastModification) {
        this.lastModification = lastModification;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }
}
