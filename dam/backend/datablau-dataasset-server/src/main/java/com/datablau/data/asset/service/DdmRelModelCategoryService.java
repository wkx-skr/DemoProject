package com.datablau.data.asset.service;

import com.datablau.data.asset.dto.DdmRelModelCategoryDto;
import com.datablau.data.asset.jpa.entity.DdmRelModelCategory;

import java.util.List;

public interface DdmRelModelCategoryService {

    List<DdmRelModelCategory> queryRelModelCategories(List<Long> ddmModelIds);

    void saveOrUpdateDdmRelModelCategory(DdmRelModelCategoryDto relModelCategoryDto);

    DdmRelModelCategory queryRelModelCategory(Long ddmModelId);

    void saveOrUpdate(DdmRelModelCategory ddmRelModelCategory);

    List<Long> queryRelModelIdByModelCategoryId(Long modelCategoryId);
}
