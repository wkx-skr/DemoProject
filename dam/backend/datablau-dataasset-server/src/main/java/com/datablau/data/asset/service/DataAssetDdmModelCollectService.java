package com.datablau.data.asset.service;

import com.andorj.common.data.PageResult;
import com.datablau.data.asset.dto.DdmCollectElementTaskParamDto;
import com.datablau.data.asset.dto.DdmModelCollectDto;
import com.datablau.project.api.dto.DdmModelInfoQueryDto;

public interface DataAssetDdmModelCollectService {

    PageResult<DdmModelCollectDto> queryDdmModelInfoPage(DdmModelInfoQueryDto queryDto);

    Long createTask(DdmCollectElementTaskParamDto paramDto) throws Exception;

    void test(Long ddmModelId);
}
