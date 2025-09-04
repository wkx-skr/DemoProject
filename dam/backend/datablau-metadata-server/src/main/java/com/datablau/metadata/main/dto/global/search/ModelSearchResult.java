package com.datablau.metadata.main.dto.global.search;

import com.datablau.metadata.main.service.elastic.wrapper.GlobalSearchWrapper;

import java.io.Serializable;

public class ModelSearchResult extends GlobalSearchWrapper implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long modelId;

    private String type;

    private Long modelCategoryId;

    private String modelCategoryName;



    public ModelSearchResult(GlobalSearchWrapper searchWrapper) {
        super(searchWrapper);
        this.modelId = Long.parseLong(searchWrapper.getItemId());
    }

    public Long getModelId() {
        return modelId;
    }

    public void setModelId(Long modelId) {
        this.modelId = modelId;
    }

    @Override
    public String getType() {
        return type;
    }

    @Override
    public void setType(String type) {
        this.type = type;
    }

    public Long getModelCategoryId() {
        return modelCategoryId;
    }

    public void setModelCategoryId(Long modelCategoryId) {
        this.modelCategoryId = modelCategoryId;
    }

    public String getModelCategoryName() {
        return modelCategoryName;
    }

    public void setModelCategoryName(String modelCategoryName) {
        this.modelCategoryName = modelCategoryName;
    }
}
