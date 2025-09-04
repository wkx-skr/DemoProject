package com.datablau.data.asset.service;

import com.andorj.common.data.PageResult;
import com.datablau.data.asset.dto.ManualMappingImportResultDto;
import com.datablau.data.asset.dto.MetaDataAutoMappingDto;
import com.datablau.data.asset.dto.MetaDataManualMappingExcelDto;
import com.datablau.data.asset.dto.MetaDataMappingCatalogDto;
import com.datablau.data.asset.dto.MetaDataMappingQueryParamDto;
import com.datablau.data.asset.jpa.entity.MetaDataMappingCatalogLog;

import java.io.File;
import java.util.List;

public interface MetaDataMappingCatalogService {

    void createAutoMapping(MetaDataAutoMappingDto autoMappingDto) throws Exception;

    PageResult<MetaDataMappingCatalogDto> queryMappingPage(MetaDataMappingQueryParamDto queryParamDto) throws Exception;

    List<MetaDataMappingCatalogLog> queryMappingLogByMappingId(Long mappingId);

    void cancelMapping(List<Long> mappingIds);

    File downloadMetaDataMappingTemplate();

    ManualMappingImportResultDto upload(List<MetaDataManualMappingExcelDto> manualMappingExcelDtos) throws Exception;
}
