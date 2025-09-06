package com.datablau.archy.server.dto;

import com.datablau.archy.common.enums.ArchyState;
import com.datablau.archy.server.jpa.entity.ArchyObject;
import io.swagger.v3.oas.annotations.media.Schema;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

/**
 * @author: hxs
 * @date: 2025/5/13 18:11
 */
public class ArchyBindModelBasicInfoExtDto implements Serializable {

    private Long modelId;
    private String modelName;
    private String modelVersionName;
    private String modelPath;
    private Long categoryId;
    private String creator;
    private ArchyState releaseState;
    private Date releaseTime;
    List<ArchyModelElementExtDto> entities;
    List<ArchyObject> objects;

    public ArchyBindModelBasicInfoExtDto() {
    }

    public ArchyBindModelBasicInfoExtDto(ArchyBindModelBasicInfoDto dto){
        this.modelId = dto.getModelId();
        this.modelName = dto.getModelName();
        this.modelVersionName = dto.getModelVersionName();
        this.modelPath = dto.getModelPath();
        this.categoryId = dto.getCategoryId();
        this.creator = dto.getCreator();
        this.releaseState = dto.getReleaseState();
        this.releaseTime = dto.getReleaseTime();
        this.objects = dto.getObjects();
    }

    public Long getModelId() {
        return modelId;
    }

    public void setModelId(Long modelId) {
        this.modelId = modelId;
    }

    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public String getModelVersionName() {
        return modelVersionName;
    }

    public void setModelVersionName(String modelVersionName) {
        this.modelVersionName = modelVersionName;
    }

    public String getModelPath() {
        return modelPath;
    }

    public void setModelPath(String modelPath) {
        this.modelPath = modelPath;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }

    public ArchyState getReleaseState() {
        return releaseState;
    }

    public void setReleaseState(ArchyState releaseState) {
        this.releaseState = releaseState;
    }

    public Date getReleaseTime() {
        return releaseTime;
    }

    public void setReleaseTime(Date releaseTime) {
        this.releaseTime = releaseTime;
    }

    public List<ArchyModelElementExtDto> getEntities() {
        return entities;
    }

    public void setEntities(List<ArchyModelElementExtDto> entities) {
        this.entities = entities;
    }

    public List<ArchyObject> getObjects() {
        return objects;
    }

    public void setObjects(List<ArchyObject> objects) {
        this.objects = objects;
    }
}
