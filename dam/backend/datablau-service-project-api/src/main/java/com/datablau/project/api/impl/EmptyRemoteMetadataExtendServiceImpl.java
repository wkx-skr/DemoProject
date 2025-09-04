package com.datablau.project.api.impl;

import com.andorj.common.data.PageResult;
import com.datablau.metadata.common.dto.metadata.DataObjectDto;
import com.datablau.metadata.common.dto.model.ModelDto;
import com.datablau.project.api.RemoteMetaDataExtendService;
import com.datablau.project.api.dto.DataObjectQueryParamDto;
import com.datablau.project.api.dto.DdmModelElementDto;

import java.util.Collection;
import java.util.List;
import java.util.Set;

public class EmptyRemoteMetadataExtendServiceImpl implements RemoteMetaDataExtendService {

    @Override
    public List<DataObjectDto> findDataObjectDtos(Long modelId, List<Long> typeIds) {
        return List.of();
    }

    @Override
    public PageResult<DataObjectDto> queryDataObjectDtoPage(DataObjectQueryParamDto paramDto) {
        return null;
    }

    @Override
    public List<DdmModelElementDto> queryDdmModelElementDetail(Long ddmModelId) {
        return List.of();
    }

    @Override
    public Set<Long> findModelIdsByNames(Set<String> names) {
        return Set.of();
    }

    @Override
    public List<DataObjectDto> findDataObjectDtoByModelIds(Collection<Long> modelIds, List<Long> typeIds) {
        return List.of();
    }

    @Override
    public ModelDto queryModelDtoById(Long modelId) {
        return null;
    }

    @Override
    public List<ModelDto> findModelsByModelIdIn(List<Long> modelIds) {
        return List.of();
    }

    @Override
    public List<ModelDto> findModelsByDataSourceId(Collection<Long> dataSourceIds) {
        return null;
    }

    @Override
    public List<DataObjectDto> findTableAndFiledByObjectIds(List<Long> objectIds) {
        return List.of();
    }
}
