package com.datablau.data.asset.service;

import com.andorj.common.data.PageResult;
import com.datablau.data.asset.dto.DdmCollectElementConditionForModel;
import com.datablau.data.asset.dto.DdmCollectElementConditionForTable;
import com.datablau.data.asset.dto.DdmCollectElementQueryParamDto;
import com.datablau.data.asset.dto.DdmModelCollectElementDto;
import com.datablau.data.asset.jpa.entity.DdmCollectElement;

import java.util.List;

public interface DdmCollectElementService{

    void deleteDdmCollectElementByDdmModelId(Long ddmModelId);

    void saveAll(List<DdmCollectElement> elements);

    PageResult<DdmModelCollectElementDto> queryDdmModelCollectElementPage(DdmCollectElementQueryParamDto paramDto);

    List<DdmCollectElementConditionForModel> queryModelByModelCategoryId(Long modelCategoryId);
    List<DdmCollectElementConditionForTable> queryModelByModelId(Long ddmModelId);

    void deleteAll();
}
