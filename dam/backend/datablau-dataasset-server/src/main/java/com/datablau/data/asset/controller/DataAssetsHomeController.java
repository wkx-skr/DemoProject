package com.datablau.data.asset.controller;


import com.andorj.model.common.api.MessageService;
import com.datablau.catalog.enums.EnumStructureType;
import com.datablau.catalog.enums.EnumSupportType;
import com.datablau.catalog.jpa.entity.CommonCatalog;
import com.datablau.catalog.jpa.entity.CommonCatalogStructure;
import com.datablau.data.asset.api.DataAssetsCatalogAuthService;
import com.datablau.data.asset.api.DataAssetsCatalogService;
import com.datablau.data.asset.api.DataAssetsCatalogStructureService;
import com.datablau.data.asset.api.DataAssetsCatalogTypeService;
import com.datablau.data.asset.api.DataAssetsService;
import com.datablau.data.asset.dto.DataAssetsCatalogAuthDto;
import com.datablau.data.asset.dto.HomeSearchResultDto;
import com.datablau.data.asset.dto.ResResultDto;
import com.datablau.data.asset.dto.SearchDto;
import com.datablau.data.asset.enums.EnumAuthStatusType;
import com.datablau.data.asset.enums.EnumAuthType;
import com.datablau.data.asset.jpa.entity.DataAssetsCatalogAuth;
import com.datablau.data.asset.utils.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.metadata.common.api.DatablauRemoteShareFileService;
import com.datablau.metadata.common.dto.metadata.DataShareFileDto;
import com.datablau.security.management.api.RoleService;
import com.google.common.collect.Lists;
import io.swagger.v3.oas.annotations.Operation;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.SearchHits;
import org.elasticsearch.search.aggregations.bucket.terms.ParsedStringTerms;
import org.elasticsearch.search.aggregations.bucket.terms.Terms;
import org.elasticsearch.search.aggregations.metrics.ParsedTopHits;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping(value = "/es/home")
public class DataAssetsHomeController extends BaseController {


    private static final Logger logger = LoggerFactory.getLogger(DataAssetsHomeController.class);

    @Autowired
    private DataAssetsService dataAssetsService;

    @Autowired
    private DataAssetsCatalogAuthService authService;
    @Autowired
    private DataAssetsCatalogService catalogService;
    @Autowired
    private DataAssetsCatalogStructureService structureService;

    @Autowired
    private DataAssetsCatalogTypeService typeService;

    @Autowired
    private MessageService messageService;

    public DataAssetsHomeController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Autowired
    @Qualifier("datablauRemoteShareFileService")
    private DatablauRemoteShareFileService datablauRemoteShareFileService;

    /**
     * 搜索建议
     *
     * @param searchDto
     * @return
     * @throws IOException
     */
    @Operation(summary = "门户查询")
    @PostMapping(value = "/search")
    public ResResultDto<List<HomeSearchResultDto>> getCatalog(@RequestBody SearchDto searchDto) throws IOException {
        buildDto(searchDto);
        if (CollectionUtils.isEmpty(searchDto.getStructureIds())) {
            return ResResultDto.ok(new ArrayList<>());
        }
        Map<String, Object> resMap = catalogService.getSubCatalogAuthStatus(searchDto, getCurrentUser());
        Map<Long, EnumAuthStatusType> subCatalogAuthStatus = (Map<Long, EnumAuthStatusType>) resMap.get("status");
        logger.info(messageService.getMessage("subCatalogAuthStatus"), subCatalogAuthStatus);

        //进行ES 查询
        SearchResponse searchResponse = dataAssetsService.searchMatchQueryGroupByAssetsType(searchDto.getSearchName(),
                searchDto.getAssetsType(), searchDto.getPageNum(), searchDto.getPageSize(), subCatalogAuthStatus.keySet());
        logger.info(messageService.getMessage("portalEsQuery", searchDto.getSearchName(), searchDto.getAssetsType(), searchDto.getPageNum(), searchDto.getPageSize(), subCatalogAuthStatus.keySet()));

        ParsedStringTerms filters = searchResponse.getAggregations().get("group_by_assetsType");
        List<? extends Terms.Bucket> buckets = filters.getBuckets();
        List<HomeSearchResultDto> maps = new ArrayList<>();
        for (Terms.Bucket bb : buckets) {
            HomeSearchResultDto bc = new HomeSearchResultDto();
            String key = bb.getKeyAsString();
            ParsedTopHits assetsTypeTops = (ParsedTopHits) bb.getAggregations().getAsMap().get("hits_assetsType_tops");
            List<Map<String, Object>> result = new ArrayList<>();
            SearchHits hits = assetsTypeTops.getHits();
            for (SearchHit hit : hits.getHits()) {
                Map<String, Object> sourceAsMap = hit.getSourceAsMap();
                result.add(sourceAsMap);
            }

            //bug:33684  首页-搜索结果中文件的type
            try {
                List<Long> fileIds = Lists.newArrayList();
                result.forEach(assetMap -> {
                    String subType = assetMap.get("subAssetsType").toString();
                    if (EnumSupportType.FILE.name().equals(subType)) {
                        String objId = assetMap.get("itemId").toString();
                        fileIds.add(Long.valueOf(objId));
                    }
                });
                if (!CollectionUtils.isEmpty(fileIds)) {
                    List<DataShareFileDto> fileDtos = datablauRemoteShareFileService.findByIdInItems(fileIds);
                    Map<Long, DataShareFileDto> fileMap = fileDtos.stream().collect(
                        Collectors.toMap(DataShareFileDto::getId, Function.identity(),
                            (n1, n2) -> n1));

                    result.forEach(assetMap -> {
                        String subType = assetMap.get("subAssetsType").toString();
                        if (EnumSupportType.FILE.name().equals(subType)) {
                            String objId = assetMap.get("itemId").toString();
                            DataShareFileDto dataShareFileDto = fileMap.get(Long.valueOf(objId));
                            assetMap.put("fileType", dataShareFileDto.getType());
                        }
                    });
                }
            }catch (Exception e){
                logger.error(messageService.getMessage("getFileTypeError"),e);
            }


            bc.setType(key);
            bc.setBuckets(result);
            bc.setTotalHits(hits.getTotalHits().value);
            maps.add(bc);
        }

        List<DataAssetsCatalogAuth> allRel = (List<DataAssetsCatalogAuth>) resMap.get("auth");
        Map<Long, DataAssetsCatalogAuthDto> authMap = authService.getAuthMapNew(getCurrentUser(), allRel);
        //赋值权限字段
        if (!CollectionUtils.isEmpty(maps)) {
            Map<Long, CommonCatalog> cacheMap = new HashMap<>();
            for (HomeSearchResultDto catalogDataVo : maps) {
                List<Map<String, Object>> b = catalogDataVo.getBuckets();
                handleResult(b, cacheMap, authMap);
            }
        }

        return ResResultDto.ok(maps);
    }


    /**
     * 搜索结果
     *
     * @param searchDto 请求体
     * @return 命中数据
     */
    @Operation(summary = "门户查询结果")
    @PostMapping(value = "/search/do")
    public ResResultDto<HomeSearchResultDto> searchResult(@RequestBody SearchDto searchDto) throws IOException {
        logger.info(messageService.getMessage("portalEsQueryStart"));
        HomeSearchResultDto resultDto = new HomeSearchResultDto();
        String currentUser = getCurrentUser();
        buildDto(searchDto);
        if (CollectionUtils.isEmpty(searchDto.getStructureIds())) {
            return ResResultDto.ok(new HomeSearchResultDto());
        }
//        Map<Long, EnumAuthStatusType> subCatalogAuthStatus = catalogService.getSubCatalogAuthStatus(searchDto, getCurrentUser());
        Map<String, Object> resMap = catalogService.getSubCatalogAuthStatus(searchDto, getCurrentUser());
        Map<Long, EnumAuthStatusType> subCatalogAuthStatus = (Map<Long, EnumAuthStatusType>) resMap.get("status");
        List<DataAssetsCatalogAuth> allRel = (List<DataAssetsCatalogAuth>) resMap.get("auth");

        SearchResponse searchResponse = dataAssetsService.searchTodo(searchDto.getSearchName(),
                searchDto.getAssetsType(),
                searchDto.getPageNum(),
                searchDto.getPageSize(), subCatalogAuthStatus.keySet());
        SearchHit[] hits = searchResponse.getHits().getHits();

        logger.info(messageService.getMessage("portalEsQueryTotal"), hits.length);
        List<Map<String, Object>> searchResult = Lists.newArrayList();
        if (hits.length > 0) {
//            Set<Long> catalogIds = Sets.newHashSet();
            for (SearchHit hit : hits) {
                Map<String, Object> sourceAsMap = hit.getSourceAsMap();
//                Long catalogId = ((Integer) sourceAsMap.get("catalogId")).longValue();
//                catalogIds.add(catalogId);
                searchResult.add(sourceAsMap);
            }
            //获取权限
            Map<Long, DataAssetsCatalogAuthDto> authMap = authService.getAuthMapNew(currentUser, allRel);
            Map<Long, CommonCatalog> cacheMap = new HashMap<>();
            handleResult(searchResult, cacheMap, authMap);
        }
        resultDto.setBuckets(searchResult);
        resultDto.setTotalHits(searchResponse.getHits().getTotalHits().value);
        return ResResultDto.ok(resultDto);
    }

    private void buildDto(SearchDto searchDto) {
        List<CommonCatalogStructure> openDataAssetsCatalogStructures = structureService.findAllByStructureTypeAndOpenStatus(EnumStructureType.DATA_ASSETS, true);
        List<Long> openStructuresIds = openDataAssetsCatalogStructures.stream().map(CommonCatalogStructure::getId).collect(Collectors.toList());
        searchDto.setStructureIds(openStructuresIds);
    }

    private void handleResult(List<Map<String, Object>> searchResult,
                              Map<Long, CommonCatalog> cacheMap,
                              Map<Long, DataAssetsCatalogAuthDto> authMap) {
        for (Map<String, Object> sourceMap : searchResult) {
            Long catalogId = ((Integer) sourceMap.get("catalogId")).longValue();
            String subAssetsType = (String) sourceMap.get("subAssetsType");
            //查看是不是公开访问
            CommonCatalog catalog = catalogService.findByCatalogId(catalogId);
            if (Objects.equals(subAssetsType, EnumSupportType.CATALOG.name())) {
                Long catalogTypeId = catalog.getCatalogTypeId();
                Long iconId = typeService.getIconId(catalogTypeId);
                sourceMap.put("icon", iconId);
            }
            if (catalogService.isPublic(catalog.getCatalogPath(), catalog.getPublicType(), cacheMap)) {
                sourceMap.put("isAuth", true);
            } else {
                sourceMap.put("isAuth", authMap.containsKey(catalogId) && authMap.get(catalogId).getAuthType() != EnumAuthType.NONE);
            }
        }
    }
}
