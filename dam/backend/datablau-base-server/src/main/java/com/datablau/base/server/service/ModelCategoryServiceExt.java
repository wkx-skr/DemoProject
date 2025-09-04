package com.datablau.base.server.service;

import com.datablau.base.data.ModelCategoryDto;
import com.datablau.base.data.ModelCategoryParamDto;
import com.datablau.base.server.dto.ModelCategoryExtDto;
import com.datablau.base.server.dto.ModelCategoryParamExtDto;
import com.datablau.base.server.dto.ModelCategoryTreeNodeDto;


public interface ModelCategoryServiceExt {

    ModelCategoryExtDto createModelCategoryNew(ModelCategoryParamExtDto modelCategoryParamExtDto, String appName);

    ModelCategoryExtDto updateModelCategoryNew(ModelCategoryParamExtDto category);

    ModelCategoryTreeNodeDto loadStandardCodeTree();

    void deleteModelCategory(Long categoryId, String appName);
}
