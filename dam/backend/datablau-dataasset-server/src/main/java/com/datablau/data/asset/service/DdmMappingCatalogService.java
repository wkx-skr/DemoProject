package com.datablau.data.asset.service;

import com.andorj.common.data.PageResult;
import com.datablau.catalog.jpa.entity.CommonCatalog;
import com.datablau.data.asset.dto.DdmAutoMappingDto;
import com.datablau.data.asset.dto.DdmAutoMappingQueryParamDto;
import com.datablau.data.asset.dto.DdmManualMappingExcelDto;
import com.datablau.data.asset.dto.ManualMappingImportResultDto;
import com.datablau.data.asset.dto.DdmMappingCatalogDto;
import com.datablau.data.asset.dto.DdmMappingQueryParamDto;
import com.datablau.data.asset.jpa.entity.DdmMappingCatalogLog;

import java.io.File;
import java.util.List;

public interface DdmMappingCatalogService {

    List<CommonCatalog> queryBusinessDomain(DdmAutoMappingQueryParamDto paramDto);

    void createAutoMapping(DdmAutoMappingDto autoMappingDto) throws Exception;

    PageResult<DdmMappingCatalogDto> queryDdmMappingCatalogPage(DdmMappingQueryParamDto paramDto) throws Exception;

    List<DdmMappingCatalogLog> queryDdmMappingCatalogLogs(Long mappingId);
    void cancelMapping(List<Long> mappingIds);

    File downloadMappingTemplate();

    ManualMappingImportResultDto upload(List<DdmManualMappingExcelDto> manualMappingExcelDtos) throws Exception;

    List<CommonCatalog> queryLogicDataEntity(Long businessObjectId);
}
