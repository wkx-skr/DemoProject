package com.datablau.project.api.impl;

import com.andorj.common.data.PageResult;
import com.datablau.project.api.DatablauRemoteDdmModelServiceNew;
import com.datablau.project.api.dto.DdmElementExtDto;
import com.datablau.project.api.dto.DdmL4ExcelDto;
import com.datablau.project.api.dto.DdmModelDto;
import com.datablau.project.api.dto.DdmModelElementDto;
import com.datablau.project.api.dto.DdmModelInfoDto;
import com.datablau.project.api.dto.DdmModelInfoQueryDto;
import com.datablau.project.api.dto.DdmModelVersionDto;
import com.datablau.project.api.dto.DdmModelVersionQueryDto;

import java.util.Collection;
import java.util.List;


public class EmptyDatablauRemoteDdmModelServiceNewImpl implements DatablauRemoteDdmModelServiceNew {
    @Override
    public PageResult<DdmModelInfoDto> queryDdmModelInfoDtoPage(DdmModelInfoQueryDto ddmModelInfoQueryDto) {
        return new PageResult<>();
    }

    @Override
    public void test(Object o) {

    }

    @Override
    public void deleteModelById(Long modelId){

    }

    @Override
    public List<DdmModelElementDto> queryDdmModelElementDtos(Long ddmModelId) {
        return List.of();
    }

    @Override
    public List<DdmModelElementDto> queryDdmModelElementDetail(Long ddmModelId) {
        return List.of();
    }

    @Override
    public List<DdmModelDto> getDdmModels(Collection<Long> modelIds) {
        return List.of();
    }

    @Override
    public List<DdmModelVersionDto> getDdmModelVersionDto(Collection<DdmModelVersionQueryDto> dtos) {
        return List.of();
    }

    @Override
    public List<DdmElementExtDto> getDdmElementExtByElementIds(List<Long> elementIds, String archyObjectId) {
        return List.of();
    }

    @Override
    public void syncUpdateDDMModelX(String username, Long modelId, String objectId, List<DdmL4ExcelDto> entity) throws Exception{

    }

    @Override
    public String getElementsChangesBetweenTwoVersions(Long modelId, Long baseVerId, Long targetVerId, boolean showAll) throws Exception {
        return null;
    }
}
