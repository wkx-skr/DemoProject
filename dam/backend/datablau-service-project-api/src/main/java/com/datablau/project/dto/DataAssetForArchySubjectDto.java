package com.datablau.project.dto;

import java.io.Serializable;

/**
 * @author: hxs
 * @date: 2025/4/9 10:41
 */
public class DataAssetForArchySubjectDto implements Serializable {
    private Long damId;
    private Long damParentId;
    private String catalogName;
    private String code;
    private String englishName;
    private String publishState;

    public Long getDamId() {
        return damId;
    }

    public void setDamId(Long damId) {
        this.damId = damId;
    }

    public String getCatalogName() {
        return catalogName;
    }

    public void setCatalogName(String catalogName) {
        this.catalogName = catalogName;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getEnglishName() {
        return englishName;
    }

    public void setEnglishName(String englishName) {
        this.englishName = englishName;
    }

    public Long getDamParentId() {
        return damParentId;
    }

    public void setDamParentId(Long damParentId) {
        this.damParentId = damParentId;
    }

    public String getPublishState() {
        return publishState;
    }

    public void setPublishState(String publishState) {
        this.publishState = publishState;
    }
}
