package com.datablau.metadata.main.dto.global.search;

import com.datablau.metadata.main.service.elastic.wrapper.GlobalSearchWrapper;

import java.io.Serializable;

public class CatalogSearchResult extends GlobalSearchWrapper implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long catalogId; //目录ID
    private String catalogType; //目录类型
    private String creator; //创建人
    private String createTime; //创建时间

    private String pathStr; //目录路径名称

    public CatalogSearchResult(GlobalSearchWrapper searchWrapper) {
        super(searchWrapper);
        this.catalogId = Long.parseLong(searchWrapper.getItemId());
    }

    public Long getCatalogId() {
        return catalogId;
    }

    public void setCatalogId(Long catalogId) {
        this.catalogId = catalogId;
    }

    public String getCatalogType() {
        return catalogType;
    }

    public void setCatalogType(String catalogType) {
        this.catalogType = catalogType;
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }

    public String getCreateTime() {
        return createTime;
    }

    public void setCreateTime(String createTime) {
        this.createTime = createTime;
    }

    public String getPathStr() {
        return pathStr;
    }

    public void setPathStr(String pathStr) {
        this.pathStr = pathStr;
    }
}
