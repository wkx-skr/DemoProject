package com.datablau.data.asset.service;

import com.datablau.catalog.enums.EnumAssetsCatalogStatus;
import com.datablau.catalog.jpa.entity.CommonCatalog;
import com.datablau.data.asset.api.DataAssetsCatalogService;
import com.datablau.data.asset.dto.DDCCatalogImportResultExtDto;
import com.datablau.data.asset.dto.DataAssetsCatalogDto;
import com.datablau.data.asset.dto.CommonCatalogDopExtDto;
import com.datablau.data.asset.jpa.entity.CatalogExt;
import com.datablau.data.asset.upload.DDCCatalogImportResultDto;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.core.JsonProcessingException;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * @author: hxs
 * @date: 2025/4/2 13:47
 */
public interface DataAssetsCatalogArchyService extends DataAssetsCatalogService {

    void test();

    CommonCatalog save(DataAssetsCatalogDto dto, String username);

    File exportCatalogNew(String username, EnumAssetsCatalogStatus status, Long structureId) throws Exception;

    DDCCatalogImportResultDto uploadCatalog0(Map<String, List<Object>> sheets, DDCCatalogImportResultDto result, Long structureId, String username, EnumAssetsCatalogStatus status) ;

    CatalogExt getCatalogExt(Long catalogId);

    void deleteByIds(Long id);

    void moveArchyForCatalog(CommonCatalog catalog, Long moveParentId);

    Collection<DataAssetsCatalogDto> findManageCatalogs0(Long structureId, Long catalogId);

    void uploadCatalogTwo(Map<String, List<Object>> sheets, DDCCatalogImportResultDto result, Long structureId, String username, EnumAssetsCatalogStatus status) throws Exception;

    Map<String, List<List<Object>>> exportCatalogWithId(List<Long> catalogIds);
    
    CommonCatalogDopExtDto getCommonCatalogDopExtDtoById(Long id);

    Collection<DataAssetsCatalogDto> manageTree(Long structureId, Long catalogId) throws Exception;
}
