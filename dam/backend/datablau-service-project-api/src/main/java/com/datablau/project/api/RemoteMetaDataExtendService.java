package com.datablau.project.api;

import com.andorj.common.data.PageResult;
import com.datablau.metadata.common.dto.metadata.DataObjectDto;
import com.datablau.metadata.common.dto.model.ModelDto;
import com.datablau.project.api.dto.DataObjectQueryParamDto;
import com.datablau.project.api.dto.DdmModelElementDto;

import java.util.Collection;
import java.util.List;
import java.util.Set;

public interface RemoteMetaDataExtendService {

    List<DataObjectDto> findDataObjectDtos(Long modelId, List<Long> typeIds);

    PageResult<DataObjectDto> queryDataObjectDtoPage(DataObjectQueryParamDto paramDto);

    List<DdmModelElementDto> queryDdmModelElementDetail(Long ddmModelId);

    Set<Long> findModelIdsByNames(Set<String> names);

    List<DataObjectDto> findDataObjectDtoByModelIds(Collection<Long> modelIds, List<Long> typeIds);

    ModelDto queryModelDtoById(Long modelId);
    List<ModelDto> findModelsByModelIdIn(List<Long> modelIds);
    List<ModelDto> findModelsByDataSourceId(Collection<Long> dataSourceIds);

    List<DataObjectDto> findTableAndFiledByObjectIds(List<Long> objectIds);
}
