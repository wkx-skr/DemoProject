package com.datablau.data.asset.dto;

import com.datablau.base.data.ModelCategoryDto;

import java.io.Serializable;

public class DataFlowDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private ModelCategoryDto modelCategoryDto;

    private Long categoryId;

    private String categoryName;

    private String categoryAbbreviation;

    private String description;

    private String L3Name;

    public ModelCategoryDto getModelCategoryDto() {
        return modelCategoryDto;
    }

    public void setModelCategoryDto(ModelCategoryDto modelCategoryDto) {
        this.modelCategoryDto = modelCategoryDto;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getCategoryAbbreviation() {
        return categoryAbbreviation;
    }

    public void setCategoryAbbreviation(String categoryAbbreviation) {
        this.categoryAbbreviation = categoryAbbreviation;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getL3Name() {
        return L3Name;
    }

    public void setL3Name(String l3Name) {
        L3Name = l3Name;
    }
}
