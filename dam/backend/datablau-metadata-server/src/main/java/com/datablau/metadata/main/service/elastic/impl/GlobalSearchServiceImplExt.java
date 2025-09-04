package com.datablau.metadata.main.service.elastic.impl;

import co.elastic.clients.elasticsearch._types.FieldValue;
import co.elastic.clients.elasticsearch._types.query_dsl.BoolQuery;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch._types.query_dsl.WildcardQuery;
import co.elastic.clients.elasticsearch.core.BulkRequest;
import co.elastic.clients.elasticsearch.core.BulkResponse;
import co.elastic.clients.elasticsearch.core.SearchRequest;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.bulk.BulkOperation;
import co.elastic.clients.elasticsearch.core.bulk.DeleteOperation;
import co.elastic.clients.elasticsearch.core.search.Highlight;
import co.elastic.clients.elasticsearch.core.search.HighlightField;
import co.elastic.clients.elasticsearch.core.search.Hit;
import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ObjectX;
import com.andorj.common.data.PageResult;
import com.datablau.base.api.ModelCategoryService;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.catalog.dto.CommonCatalogDto;
import com.datablau.data.common.data.EntityChangeEventDto;
import com.datablau.data.common.type.EntityChangeType;
import com.datablau.data.quality.data.DataQualityBusinessRuleDto;
import com.datablau.data.quality.data.RemoteDataQualityTechRuleDto;
import com.datablau.domain.management.api.DomainService;
import com.datablau.domain.management.dto.DomainDto;
import com.datablau.domain.management.dto.StandardCodeDto;
import com.datablau.metadata.common.api.DataDepartmentService;
import com.datablau.metadata.common.api.DataManagerService;
import com.datablau.metadata.common.dto.DataDepartmentTableDto;
import com.datablau.metadata.common.dto.DataManagerTableDto;
import com.datablau.metadata.common.dto.metadata.DataObjectDto;
import com.datablau.metadata.common.dto.model.ModelDto;
import com.datablau.metadata.main.dao.DataObjectUdpRepository;
import com.datablau.metadata.main.dao.share.file.DataShareFileRepository;
import com.datablau.metadata.main.dto.BaseDataObjectNew;
import com.datablau.metadata.main.dto.global.search.CatalogSearchResult;
import com.datablau.metadata.main.dto.global.search.ColumnSearchResult;
import com.datablau.metadata.main.dto.global.search.DomainSearchResult;
import com.datablau.metadata.main.dto.global.search.GlobalSearchQueryDto;
import com.datablau.metadata.main.dto.global.search.GlobalSearchResult;
import com.datablau.metadata.main.dto.global.search.MetaSearchResult;
import com.datablau.metadata.main.dto.global.search.ModelSearchResult;
import com.datablau.metadata.main.dto.global.search.ReportSearchResult;
import com.datablau.metadata.main.dto.global.search.StandardSearchResult;
import com.datablau.metadata.main.dto.global.search.StandardSearchResultNew;
import com.datablau.metadata.main.dto.global.search.TableSearchResult;
import com.datablau.metadata.main.dto.global.search.TableSearchResultNew;
import com.datablau.metadata.main.dto.global.search.TechRuleSearchResult;
import com.datablau.metadata.main.dto.metadata.BaseDataObject;
import com.datablau.metadata.main.dto.model.ShallowModelDto;
import com.datablau.metadata.main.entity.metadata.DataObject;
import com.datablau.metadata.main.entity.model.Model;
import com.datablau.metadata.main.entity.report.DataReport;
import com.datablau.metadata.main.entity.share.file.DataShareFile;
import com.datablau.metadata.main.ext.DataObjectNewService;
import com.datablau.metadata.main.service.elastic.api.GlobalSearchService;
import com.datablau.metadata.main.service.elastic.impl.global.search.executor.AssetCatalogSync;
import com.datablau.metadata.main.service.elastic.impl.global.search.executor.DataObjectSync;
import com.datablau.metadata.main.service.elastic.impl.global.search.executor.DataReportSync;
import com.datablau.metadata.main.service.elastic.impl.global.search.executor.DomainSync;
import com.datablau.metadata.main.service.elastic.impl.global.search.executor.GlobalSearchSync;
import com.datablau.metadata.main.service.elastic.impl.global.search.executor.MetaDataObjectSync;
import com.datablau.metadata.main.service.elastic.impl.global.search.executor.ModelCategorySync;
import com.datablau.metadata.main.service.elastic.impl.global.search.executor.ModelSync;
import com.datablau.metadata.main.service.elastic.impl.global.search.executor.QualityRuleSync;
import com.datablau.metadata.main.service.elastic.impl.global.search.executor.ShareFileSync;
import com.datablau.metadata.main.service.elastic.impl.global.search.executor.StandardSync;
import com.datablau.metadata.main.service.elastic.utility.ElasticsearchClientUtils;
import com.datablau.metadata.main.service.elastic.wrapper.GlobalSearchChildrenWrapper;
import com.datablau.metadata.main.service.elastic.wrapper.GlobalSearchWrapper;
import com.datablau.metadata.main.service.metadata.api.DataObjectService;
import com.datablau.metadata.main.service.metamodel.MetaModelService;
import com.datablau.metadata.main.service.model.api.DataModelService;
import com.datablau.metadata.main.service.report.api.DataReportService;
import com.datablau.metadata.main.util.RemoteServiceGetter;
import com.datablau.project.api.DomainExtService;
import com.datablau.project.api.RemoteDataAssetExtendService;
import com.datablau.udp.jpa.entity.MetadataUserDefinedProperty;
import com.datablau.udp.jpa.entity.MetadataUserDefinedPropertyValue;
import com.datablau.udp.service.api.MetadataUserDefinedPropertyService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;
import org.elasticsearch.common.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.validation.annotation.Validated;
import org.w3c.dom.Node;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * @description:
 * @author: huajun.li
 * @create: 2024-08-01 14:27
 **/
@Service("globalSearchServiceImplExt")
public class GlobalSearchServiceImplExt extends GlobalSearchServiceImpl {
    private static final Logger LOGGER = LoggerFactory.getLogger(GlobalSearchServiceImplExt.class);

    private static final ObjectMapper mapper = new ObjectMapper();



    @Autowired
    public ElasticsearchClientUtils clientUtils;
    @Autowired
    public DataObjectService dataObjectService;
    @Autowired
    public ModelCategoryService modelCategoryService;
    @Autowired
    public DataDepartmentService dataDepartmentService;
    @Autowired
    public DataManagerService dataManagerService;
    @Autowired
    public DataReportService dataReportService;
    @Autowired
    public DataShareFileRepository shareFileRepository;
    @Autowired
    public DataModelService dataModelService;
    @Autowired
    public MetaModelService metaModelService;
    @Autowired
    public RemoteDataAssetExtendService remoteDataAssetExtendService;
    @Autowired
    public DomainService domainService;
    @Autowired
    public MetadataUserDefinedPropertyService udpService;
    @Autowired
    public DataObjectUdpRepository dataObjectUdpRepository;
    @Autowired
    public DataObjectNewService objectNewService;
    @Autowired
    public DomainExtService domainExtService;

    @Value("${common.metric-sync.enable:false}")
    protected boolean metricEnable;


    @Override
    public void syncGlobalSearch() throws Exception {
        LOGGER.info("start to sync global search...");
        clientUtils.createGlobalSearchIndex();
        LOGGER.info("global index ready...");

        List<GlobalSearchSync> allSyncExecutors = new ArrayList<>();
        allSyncExecutors.add(new DataObjectSync());
        allSyncExecutors.add(new DataReportSync());
        allSyncExecutors.add(new DomainSync());
        allSyncExecutors.add(new StandardSync());
        allSyncExecutors.add(new ShareFileSync());
        allSyncExecutors.add(new QualityRuleSync());
        allSyncExecutors.add(new MetaDataObjectSync());
        allSyncExecutors.add(new ModelSync());
        allSyncExecutors.add(new AssetCatalogSync());
        allSyncExecutors.add(new ModelCategorySync());

        int index = 1;
        for (GlobalSearchSync syncExecutor : allSyncExecutors) {
            LOGGER.info("start sync {}/{} ...", index++, allSyncExecutors.size());
            syncExecutor.sync();
        }
        LOGGER.info("all data sync finished!");
    }

    @Override
    public void incrementSyncGlobalSearch(List<EntityChangeEventDto> eventList) throws Exception {
        if (CollectionUtils.isEmpty(eventList)) {
            return;
        }

        Set<String> toBeDeletedList = eventList
                .stream()
                .filter(event -> event.getEvent() == EntityChangeType.DELETE)
                .map(event -> {
                    try {
                        return getElasticId(event);
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                })
                .collect(Collectors.toSet());

        Map<String, DomainDto> toBeUpdateDomainMap = new LinkedHashMap<>();
        Map<String, com.datablau.metric.management.dto.DomainDto> toBeUpdateMetricMap = new LinkedHashMap<>();
        Map<String, StandardCodeDto> toBeUpdateStandardMap = new LinkedHashMap<>();
        Map<Long, DataReport> toBeUpdateDataReportMap = new LinkedHashMap<>();
        Map<Long, DataShareFile> toBeUpdateShareFileMap = new LinkedHashMap<>();
        Map<Long, DataObjectDto> toBeUpdateDataObjectMap = new LinkedHashMap<>();
        Map<Long, DataObjectDto> toBeUpdateMetaDataObjectMap = new LinkedHashMap<>();
        Map<Long, DataQualityBusinessRuleDto> toBeUpdateBusinessRuleMap = new LinkedHashMap<>();
        Map<Long, RemoteDataQualityTechRuleDto> toBeUpdateTechRuleMap = new LinkedHashMap<>();
        Set<Long> toBeUpdateModelIds = new HashSet<>();
        Set<Long> toBeUpdateMetaModelIds = new HashSet<>();
        Map<Long, ModelDto> toBeUpdateModelMap = new LinkedHashMap<>();
        Map<Long, ModelCategoryDto> toBeUpdateModelCategoryMap = new LinkedHashMap<>();
        Map<Long, CommonCatalogDto> toBeUpdateCommonCatalogMap = new LinkedHashMap<>();

        for (EntityChangeEventDto event : eventList) {
            String elasticId = getElasticId(event);
            if (toBeDeletedList.contains(elasticId)) {
                if (DataObjectSync.ENTITY_TYPE.contains(event.getItemType())
                        || LDMTypes.oMetadataObject == event.getItemType()) {
                    if (event.getEvent() == EntityChangeType.DELETE) {
                        continue;
                    }
                } else {
                    continue;
                }
            }
            if (event.getItemType() == LDMTypes.oDataStandard) {
                DomainDto domainDto = mapper.readValue(event.getValue(), DomainDto.class);
                toBeUpdateDomainMap.put(domainDto.getDomainId(), domainDto);
            }
            if (event.getItemType() == LDMTypes.oMetrics) {
                //判断新旧指标
                if (DomainSync.getMetricEnable()) {//使用新指标
                    com.datablau.metric.management.dto.DomainDto metricDto = mapper.readValue(event.getValue(), com.datablau.metric.management.dto.DomainDto.class);
                    toBeUpdateMetricMap.put(metricDto.getDomainId(), metricDto);
                } else {//使用旧指标
                    DomainDto domainDto = mapper.readValue(event.getValue(), DomainDto.class);
                    toBeUpdateDomainMap.put(domainDto.getDomainId(), domainDto);
                }
            }
            if (event.getItemType() == LDMTypes.oDataStandardCode) {
                StandardCodeDto codeDto = mapper.readValue(event.getValue(), StandardCodeDto.class);
                toBeUpdateStandardMap.put(codeDto.getCode(), codeDto);
            }
            if (event.getItemType() == LDMTypes.oDataReport) {
                DataReport dataReport = mapper.readValue(event.getValue(), DataReport.class);
                toBeUpdateDataReportMap.put(dataReport.getId(), dataReport);
            }
            if (event.getItemType() == LDMTypes.oUnstructuredDataAssets) {
                DataShareFile shareFile = mapper.readValue(event.getValue(), DataShareFile.class);
                toBeUpdateShareFileMap.put(shareFile.getId(), shareFile);
            }
            if (DataObjectSync.ENTITY_TYPE.contains(event.getItemType())) {
                DataObjectDto dataObjectDto = mapper.readValue(event.getValue(), DataObjectDto.class);
                toBeUpdateDataObjectMap.put(dataObjectDto.getObjectId(), dataObjectDto);
            }
            if (event.getItemType() == LDMTypes.oMetadataObject) {
                DataObjectDto dataObjectDto = mapper.readValue(event.getValue(), DataObjectDto.class);
                toBeUpdateMetaDataObjectMap.put(dataObjectDto.getObjectId(), dataObjectDto);
            }
            if (event.getItemType() == LDMTypes.oDataQualityBusinessRule) {
                DataQualityBusinessRuleDto businessRuleDto = mapper.readValue(event.getValue(), DataQualityBusinessRuleDto.class);
                toBeUpdateBusinessRuleMap.put(businessRuleDto.getId(), businessRuleDto);
            }
            if (event.getItemType() == LDMTypes.oDataQualityTechnicalRule) {
                RemoteDataQualityTechRuleDto techRuleDto = mapper.readValue(event.getValue(), RemoteDataQualityTechRuleDto.class);
                toBeUpdateTechRuleMap.put(techRuleDto.getId(), techRuleDto);
            }
            if (event.getItemType() == LDMTypes.oModelSource) {
                try {
                    //更新采集
                    ModelDto modelDto = mapper.readValue(event.getValue(), ModelDto.class);
                    toBeUpdateModelMap.put(modelDto.getModelId(), modelDto);
                } catch (Exception ignored) {
                    //更新model下的数据
                    toBeUpdateModelIds.add(Long.parseLong(event.getItemId()));
                }
            }
            //元模型的数据源
            if (event.getItemType() == LDMTypes.oModelMart) {
                toBeUpdateMetaModelIds.add(Long.parseLong(event.getItemId()));
            }
            if(event.getItemType() == LDMTypes.oSystem){
                ModelCategoryDto modelCategoryDto = mapper.readValue(event.getValue(), ModelCategoryDto.class);
                toBeUpdateModelCategoryMap.put(modelCategoryDto.getCategoryId(), modelCategoryDto);
            }
            if(event.getItemType() == LDMTypes.oCatalog){
                CommonCatalogDto commonCatalogDto = mapper.readValue(event.getValue(), CommonCatalogDto.class);
                toBeUpdateCommonCatalogMap.put(commonCatalogDto.getId(), commonCatalogDto);
            }
        }

        List<GlobalSearchSync> allSyncExecutors = new ArrayList<>();
        allSyncExecutors.add(new DomainSync(new ArrayList<>(toBeUpdateDomainMap.values()), new ArrayList<>(toBeUpdateMetricMap.values())));
        allSyncExecutors.add(new StandardSync(new ArrayList<>(toBeUpdateStandardMap.values())));
        allSyncExecutors.add(new DataReportSync(new ArrayList<>(toBeUpdateDataReportMap.values())));
        allSyncExecutors.add(new ShareFileSync(new ArrayList<>(toBeUpdateShareFileMap.values())));
        allSyncExecutors.add(new DataObjectSync(new ArrayList<>(toBeUpdateDataObjectMap.values())));
        allSyncExecutors.add(new DataObjectSync(toBeUpdateModelIds));
        allSyncExecutors.add(new QualityRuleSync(new ArrayList<>(toBeUpdateBusinessRuleMap.values()), new ArrayList<>(toBeUpdateTechRuleMap.values())));
        allSyncExecutors.add(new MetaDataObjectSync(new ArrayList<>(toBeUpdateMetaDataObjectMap.values())));
        allSyncExecutors.add(new MetaDataObjectSync(toBeUpdateMetaModelIds));
        allSyncExecutors.add(new ModelSync(new ArrayList<>(toBeUpdateModelMap.values())));
        allSyncExecutors.add(new ModelCategorySync(new ArrayList<>(toBeUpdateModelCategoryMap.values())));
        allSyncExecutors.add(new AssetCatalogSync(new ArrayList<>(toBeUpdateCommonCatalogMap.values())));

        deleteFromElastic(toBeDeletedList);

        for (GlobalSearchSync syncExecutor : allSyncExecutors) {
            syncExecutor.incrementSync();
        }
    }

    protected void deleteFromElastic(Set<String> ids) {
        if (CollectionUtils.isEmpty(ids)) {
            return;
        }
        try {
            List<BulkOperation> operations = new ArrayList<>();
            for (String id : ids) {
                DeleteOperation build = new DeleteOperation.Builder()
                        .index(clientUtils.getIndexName(clientUtils.globalSearchIndexName))
                        .id(id)
                        .build();
                BulkOperation bulkOperation = new BulkOperation.Builder().delete(build).build();
                operations.add(bulkOperation);
            }

            BulkRequest request = new BulkRequest.Builder().operations(operations).build();
            BulkResponse response = clientUtils.getElasticsearchClient().bulk(request);
        } catch (Exception e) {
            throw new AndorjRuntimeException(e.getMessage(), e);
        }
    }

    @Override
    public PageResult<GlobalSearchResult> getGlobalSearchPage(GlobalSearchQueryDto queryDto) throws Exception {
        // 如果没有创建个空的
        String indexName = clientUtils.getIndexName(clientUtils.globalSearchIndexName);
        if (!clientUtils.ifExistIndex(indexName)) {
            clientUtils.createGlobalSearchIndex();
        }

        BoolQuery.Builder boolQueryBuilder = new BoolQuery.Builder();

        // itemType查询（资产类型）
        List<Long> itemType = queryDto.getItemType();
        if (!CollectionUtils.isEmpty(itemType)) {
            boolQueryBuilder.must(mustItemTypeQuery(itemType));
        }

        if (queryDto.getCatalogLevel() != null) {
            boolQueryBuilder.must(Query.of(q -> q.term(t -> t.field("folderId").value(queryDto.getCatalogLevel()))));
        }

        // 构建keyword查询（关键字查询）
        // 暂时只查询raw的
        List<String> originalQueryFields = Lists.newArrayList("code", "chineseName", "englishName",
                "relationName", "children.name", "description");

        List<String> lowercaseQueryFields = new ArrayList<>();
        for (String queryField : originalQueryFields) {
            lowercaseQueryFields.add(queryField + ".raw");
        }

        List<String> queryFields = new ArrayList<>();
        queryFields.addAll(lowercaseQueryFields);

        BoolQuery.Builder keywordQueryBuilder = new BoolQuery.Builder();
        List<Query> shouldQueries = shouldQueryBuilder(queryDto.getKeyword(), queryFields);
        if (!shouldQueries.isEmpty()) {
            keywordQueryBuilder.should(shouldQueries);
            boolQueryBuilder.must(keywordQueryBuilder.build()._toQuery());
        }

        // 构建最终的布尔查询
        BoolQuery boolQuery = boolQueryBuilder.build();

        // 构建搜索请求
        SearchRequest searchRequest = SearchRequest.of(s -> s
                .index(indexName)
                .query(Query.of(q -> q.bool(boolQuery)))
                .highlight(createHighlight(queryFields))
                .from((queryDto.getCurrentPage() - 1) * queryDto.getPageSize())
                .size(queryDto.getPageSize())
        );

        // 执行查询
        SearchResponse<GlobalSearchWrapper> searchResponse = clientUtils.getElasticsearchClient()
                .search(searchRequest, GlobalSearchWrapper.class);

        // wrapper数据
        List<GlobalSearchResult> results = createWrapperResults(searchResponse);

        // 为每个不同的类型查询各自的属性
        setGlobalSearchResultProperties(results);

        PageResult<GlobalSearchResult> pageResult = new PageResult<>();
        pageResult.setCurrentPage(queryDto.getCurrentPage());
        pageResult.setPageSize(queryDto.getPageSize());
        pageResult.setContentDirectly(results);
        pageResult.setTotalItems(searchResponse.hits().total().value());

        return pageResult;
    }

    protected Query mustItemTypeQuery(List<Long> itemType) {
        List<FieldValue> fieldValues = itemType.stream()
                .map(FieldValue::of)
                .collect(Collectors.toList());

        return Query.of(q -> q
                .terms(t -> t
                        .field("itemType")
                        .terms(terms -> terms
                                .value(fieldValues)
                        )
                )
        );
    }

    protected List<Query> shouldQueryBuilder(String keyword, List<String> fields) {
        if (Strings.isNullOrEmpty(keyword)) {
            return new ArrayList<>();
        }
        List<Query> shouldQueries = new ArrayList<>();
        if (!Strings.isNullOrEmpty(keyword)) {
            //应产品和测试要求，这几列名字用模糊查询
            for (String field : fields) {
                WildcardQuery multiMatchQuery = WildcardQuery.of(m -> m
                        .wildcard("*" + keyword + "*")
                        .field(field)
                );
                shouldQueries.add(Query.of(q -> q.wildcard(multiMatchQuery)));
            }
        }
        return shouldQueries;
    }


    protected Highlight createHighlight(List<String> fields) {
        Map<String, HighlightField> highlightFieldMap = new HashMap<>();
        for (String filed : fields) {
            highlightFieldMap.put(filed, HighlightField.of(f -> f.preTags("<em>").postTags("</em>")));
        }

        return Highlight.of(h -> h
                .fragmentSize(100000)  // 设置一个足够大的值，确保包含整个字段内容
                .numberOfFragments(0)     // 返回全部内容，不做分片这里，便于前端全部替换
                .fields(highlightFieldMap)
        );
    }

    protected List<GlobalSearchResult> createWrapperResults(SearchResponse<GlobalSearchWrapper> searchResponse) {
        List<GlobalSearchResult> results = new ArrayList<>();

        for (Hit<GlobalSearchWrapper> hit : searchResponse.hits().hits()) {
            if (hit.source() == null) {
                continue;
            }
            GlobalSearchResult result = new GlobalSearchResult();
            //返回数据
            result.setData(hit.source());
            //高亮显示
            highlight(result, hit);
            //处理只返回命中的children
            onlyReturnHitChildren(result);

            results.add(result);
        }

        return results;
    }

    /**
     * 高亮显示
     */
    protected void highlight(GlobalSearchResult result, Hit<GlobalSearchWrapper> hit) {
        Map<String, List<String>> highlight = new HashMap<>();
        for (Map.Entry<String, List<String>> entry : hit.highlight().entrySet()) {
            String key = entry.getKey().replace(".raw", "");
            List<String> value = highlight.getOrDefault(key, new ArrayList<>());

            value.addAll(entry.getValue());
            //去重
            highlight.put(key, new ArrayList<>(new LinkedHashSet<>(value)));
        }

        result.setHighLight(highlight);
    }

    /**
     * 只返回命中的children
     */
    protected void onlyReturnHitChildren(GlobalSearchResult result) {
        List<String> originalChildrenNameList = new ArrayList<>();
        if (!CollectionUtils.isEmpty(result.getData().getChildren())) {
            originalChildrenNameList.addAll(result.getData().getChildren().stream().map(GlobalSearchChildrenWrapper::getName).toList());
        }

        List<GlobalSearchChildrenWrapper> childrenWrappers = new ArrayList<>();
        if (!CollectionUtils.isEmpty(result.getHighLight())) {
            result.getHighLight().forEach((field, values) -> {
                if ("children.name".equals(field)) {
                    for (String value : values) {
                        value = value
                                .replaceAll("<em>", "")
                                .replaceAll("</em>", "");

                        for (String originalChildrenName : originalChildrenNameList) {
                            if (originalChildrenName.toLowerCase().contains(value.toLowerCase())) {
                                childrenWrappers.add(new GlobalSearchChildrenWrapper(originalChildrenName));
                            }
                        }
                    }
                }
            });
        }
        result.getData().setChildren(childrenWrappers);
    }

    protected void setGlobalSearchResultProperties(List<GlobalSearchResult> results) throws Exception {
        List<Long> tableIds = new ArrayList<>();
        List<Long> columnIds = new ArrayList<>();
        List<Long> dataReportIds = new ArrayList<>();
        List<String> domainIds = new ArrayList<>();
        List<String> stdCodes = new ArrayList<>();
        List<Long> buRuleIds = new ArrayList<>();
        List<Long> techRuleIds = new ArrayList<>();
        List<Long> metaObjectIds = new ArrayList<>();
        List<Long> catalogIds = new ArrayList<>();
        List<Long> modelIds = new ArrayList<>();

        for (GlobalSearchResult searchResult : results) {
            GlobalSearchWrapper wrapper = searchResult.getData();

            String itemId = wrapper.getItemId();
            Long itemType = wrapper.getItemType();

            if (LDMTypes.oView == itemType || LDMTypes.oEntity == itemType) {
                tableIds.add(Long.parseLong(itemId));
            } else if (LDMTypes.oAttribute == itemType) {
                columnIds.add(Long.parseLong(itemId));
            } else if (LDMTypes.oDataReport == itemType) {
                dataReportIds.add(Long.parseLong(itemId));
            } else if (LDMTypes.oDataStandard == itemType || LDMTypes.oMetrics == itemType) {
                domainIds.add(itemId);
            } else if (LDMTypes.oDataStandardCode == itemType) {
                stdCodes.add(itemId);
            } else if (LDMTypes.oDataQualityBusinessRule == itemType) {
                buRuleIds.add(Long.parseLong(itemId));
            } else if (LDMTypes.oDataQualityTechnicalRule == itemType) {
                techRuleIds.add(Long.parseLong(itemId));
            } else if (LDMTypes.oCatalog == itemType) {
                catalogIds.add(Long.parseLong(itemId));
            } else if (LDMTypes.oSystem == itemType) {

            } else if (LDMTypes.oModelSource == itemType) {
                modelIds.add(Long.parseLong(itemId));
            } else {//默认是元模型的
                metaObjectIds.add(Long.parseLong(itemId));
            }
        }

        //设置表的部分展示属性
        setTableSearchResultProperties(results, tableIds);
        //设置字段的属性
        setColumnSearchResultProperties(results, columnIds);
        //设置报表的属性
        setReportSearchResultProperties(results, dataReportIds);
        //设置数据标准的属性
        setDomainSearchResultProperties(results, domainIds);
        //设置标准代码的属性
        setStandardSearchResultProperties(results, stdCodes);
        //技术规则的属性
        setTechRuleSearchResultProperties(results, techRuleIds);
        //元模型的属性
        setMetaSearchResultProperties(results, metaObjectIds);
        //设置资产目录的属性
        setCatalogSearchResultProperties(results, catalogIds);
        //设置数据库的属性
        setModelSearchResultProperties(results, modelIds);
    }

    protected void setMetaSearchResultProperties(List<GlobalSearchResult> results, List<Long> metaIds) throws Exception {
        if (CollectionUtils.isEmpty(metaIds)) {
            return;
        }
        List<BaseDataObject> baseTables = dataObjectService.getBaseDataObjectsByObjectIds(metaIds);

        Set<Long> modelCategoryIds = baseTables
                .stream()
                .map(BaseDataObject::getModelCategoryId)
                .collect(Collectors.toSet());

        Set<Long> modelIds = baseTables
                .stream()
                .map(BaseDataObject::getModelId)
                .collect(Collectors.toSet());

        Map<Long, ShallowModelDto> parentModelMap = new HashMap<>();
        for (ShallowModelDto model : dataModelService.getParentShallowModelsByIds(modelIds)) {
            parentModelMap.put(model.getChildrenId(), model);
        }

        Map<Long, ModelCategoryDto> categoryMap = modelCategoryService.getModelCategoriesByIds(modelCategoryIds)
                .stream()
                .collect(Collectors.toMap(ModelCategoryDto::getCategoryId, m -> m));

        Map<Long, BaseDataObject> metaMap = baseTables
                .stream()
                .collect(Collectors.toMap(BaseDataObject::getObjectId, t -> t));

        for (GlobalSearchResult searchResult : results) {
            MetaSearchResult metaSearchResult = new MetaSearchResult(searchResult.getData());

            BaseDataObject metaDataObject = metaMap.get(metaSearchResult.getObjectId());
            if (metaDataObject == null) {
                LOGGER.error("error data [{}] ...", metaSearchResult.getObjectId());
                continue;
            }

            //权威来源路径：系统、父数据源、schema
            ModelCategoryDto category = categoryMap.get(metaDataObject.getModelCategoryId());
            String categoryName = category == null ? "" : category.getCategoryName();
            String modelName = metaDataObject.getModelName();
            String parentModelName = modelName;
            if (parentModelMap.containsKey(metaDataObject.getModelId())) {
                parentModelName = parentModelMap.get(metaDataObject.getModelId()).getModelName();
            }
            metaSearchResult.setPath(categoryName + "/" + parentModelName);
            searchResult.setData(metaSearchResult);
        }
    }

    protected void setTechRuleSearchResultProperties(List<GlobalSearchResult> results, List<Long> techRuleIds) {
        if (CollectionUtils.isEmpty(techRuleIds)) {
            return;
        }


        Map<Long, RemoteDataQualityTechRuleDto> techRuleMap = RemoteServiceGetter.getDataQualityRemoteService().getTechRuleByIds(techRuleIds)
                .stream()
                .collect(Collectors.toMap(RemoteDataQualityTechRuleDto::getId, r -> r));

        for (GlobalSearchResult searchResult : results) {
            Long itemType = searchResult.getData().getItemType();
            if (LDMTypes.oDataQualityTechnicalRule != itemType) {
                continue;
            }

            TechRuleSearchResult techRuleSearchResult = new TechRuleSearchResult(searchResult.getData());

            if (techRuleMap.containsKey(techRuleSearchResult.getTechRuleId())) {
                RemoteDataQualityTechRuleDto techRuleDto = techRuleMap.get(techRuleSearchResult.getTechRuleId());
                //规则大类
                techRuleSearchResult.setBigClassSelectOption(techRuleDto.getBigClassSelectOption());
                //规则小类
                techRuleSearchResult.setSmallClassSelectOption(techRuleDto.getSmallClassSelectOption());
                //业务类型
                techRuleSearchResult.setBizTypeSelectOption(techRuleDto.getBizTypeSelectOption());
            }

            searchResult.setData(techRuleSearchResult);
        }
    }

    protected void setDomainSearchResultProperties(List<GlobalSearchResult> results, List<String> domainIds) {
        if (CollectionUtils.isEmpty(domainIds)) {
            return;
        }

        //ddm数据标准使用
        Map<String, Integer> ddmDomainUsedMap = RemoteServiceGetter.getDatablauRemoteModelService().domainUseCountsMap(domainIds);
        //dam数据标准使用
        Map<String, Integer> damDomainUsedMap = dataObjectService.domainUseCountsMap(domainIds);
        //
        List<DomainDto> domainDtos = domainService.getDomainsByDomainIds(domainIds);
        Map<String, DomainDto> domainDtoMap = domainDtos.stream().collect(Collectors.toMap(DomainDto::getDomainId, x -> x, (x1, x2) -> x1));

        for (GlobalSearchResult searchResult : results) {
            Long itemType = searchResult.getData().getItemType();
            if (LDMTypes.oDataStandard != itemType && LDMTypes.oMetrics != itemType) {
                continue;
            }

            GlobalSearchWrapper wrapper = searchResult.getData();

            DomainSearchResult domainSearchResult = new DomainSearchResult(wrapper);

            DomainDto domainDto = domainDtoMap.get(domainSearchResult.getItemId());
            if (domainDto == null) {
                LOGGER.error("error data [{}] ...", domainSearchResult.getDomainId());
                continue;
            }
            //引用次数
            long usedCount = 0;
            if (!CollectionUtils.isEmpty(damDomainUsedMap)) {
                usedCount += damDomainUsedMap.getOrDefault(wrapper.getItemId(), 0);
            }
            if (!CollectionUtils.isEmpty(ddmDomainUsedMap)) {
                usedCount += ddmDomainUsedMap.getOrDefault(wrapper.getItemId(), 0);
            }
            domainSearchResult.setUsedCount(usedCount);
            domainSearchResult.setCreator(domainDto.getSubmitter());
            searchResult.setData(domainSearchResult);
        }
    }

    protected void setStandardSearchResultProperties(List<GlobalSearchResult> results, List<String> stdCodes) {
        if (CollectionUtils.isEmpty(stdCodes)) {
            return;
        }

        //domain引用情况
        Map<String, Integer> domainUsedMap = RemoteServiceGetter.getDomainService().getStandardUsedCount(stdCodes);
        Map<String, Integer> ddmStandardUsedMap = RemoteServiceGetter.getDatablauRemoteModelService().standardUseCountsMap(stdCodes);
        Map<String, Integer> damStandardUsedMap = dataObjectService.standardUseCountsMap(stdCodes);

        //查询关联的数据标准
        List<DomainDto> domainDtos = domainExtService.getDomainsByReferenceCodes(stdCodes);
        Map<String, DomainDto> domainDtoMap = domainDtos.stream().collect(Collectors.toMap(DomainDto::getReferenceCode, Function.identity(), (x1, x2) -> x1));

        for (GlobalSearchResult searchResult : results) {
            Long itemType = searchResult.getData().getItemType();
            if (LDMTypes.oDataStandardCode != itemType) {
                continue;
            }

            StandardSearchResultNew standardSearchResult = new StandardSearchResultNew(searchResult.getData());

            //标准引用次数
            standardSearchResult.setDomainUsedCount((long) domainUsedMap.getOrDefault(standardSearchResult.getItemId(), 0));

            //元数据引用次数
            long usedCount = 0;
            if (!CollectionUtils.isEmpty(damStandardUsedMap)) {
                usedCount += damStandardUsedMap.getOrDefault(standardSearchResult.getItemId(), 0);
            }
            if (!CollectionUtils.isEmpty(ddmStandardUsedMap)) {
                usedCount += ddmStandardUsedMap.getOrDefault(standardSearchResult.getItemId(), 0);
            }
            standardSearchResult.setUsedCount(usedCount);

            //设置关联的数据标准
            DomainDto domainDto = domainDtoMap.get(standardSearchResult.getItemId());
            if (domainDto != null) {
                standardSearchResult.setDomainName(domainDto.getChineseName());
                standardSearchResult.setDomainId(domainDto.getDomainId());
            }

            searchResult.setData(standardSearchResult);
        }
    }


    protected void setReportSearchResultProperties(List<GlobalSearchResult> results, List<Long> dataReportIds) {
        if (CollectionUtils.isEmpty(dataReportIds)) {
            return;
        }
        List<String> dataReportIdStr = dataReportIds
                .stream()
                .map(Object::toString)
                .toList();

        Map<Long, DataReport> reportMap = dataReportService.getDataReportsByIds(dataReportIds)
                .stream()
                .collect(Collectors.toMap(DataReport::getId, d -> d));

        Map<String, List<DataManagerTableDto>> dataManagerMap =
                dataManagerService.findUserManagerByDataIdsAndType(dataReportIdStr, Lists.newArrayList(LDMTypes.oDataReport));


        for (GlobalSearchResult searchResult : results) {
            Long itemType = searchResult.getData().getItemType();
            if (LDMTypes.oDataReport != itemType) {
                continue;
            }

            ReportSearchResult reportSearchResult = new ReportSearchResult(searchResult.getData());

            DataReport report = reportMap.get(reportSearchResult.getReportId());
            if (report == null) {
                LOGGER.error("error data [{}] ...", reportSearchResult.getReportId());
                continue;
            }
            //报表类型
            reportSearchResult.setType(report.getType().toString());

            //更新频率
            reportSearchResult.setFrequency(report.getFrequency());

            //数据管家
            if (dataManagerMap.containsKey(reportSearchResult.getItemId())) {
                reportSearchResult.setDataManagers(dataManagerMap.get(reportSearchResult.getItemId()));
            }

            //报表路径
            if (!CollectionUtils.isEmpty(report.getPath())) {
                reportSearchResult.setPath(String.join("/", report.getPath()));
            }


            searchResult.setData(reportSearchResult);
        }
    }

    protected void setColumnSearchResultProperties(List<GlobalSearchResult> results, List<Long> columnIds) throws Exception {
        if (CollectionUtils.isEmpty(columnIds)) {
            return;
        }
        //字段
        List<DataObject> columns = dataObjectService.getDataObjectsByIds(columnIds);

        Set<Long> tableIds = new HashSet<>();
        Set<String> domainIds = new HashSet<>();
        Set<Long> modelIds = new HashSet<>();
        for (DataObject column : columns) {
            tableIds.add(column.getTableId());
            if (!Strings.isNullOrEmpty(column.getDomainId())) {
                domainIds.add(column.getDomainId());
            }
            modelIds.add(column.getModelId());
        }
        //表
        List<BaseDataObject> baseTables = dataObjectService.getBaseDataObjectsByObjectIds(new ArrayList<>(tableIds));

        Set<Long> modelCategoryIds = baseTables
                .stream()
                .map(BaseDataObject::getModelCategoryId)
                .collect(Collectors.toSet());

        Map<Long, ModelCategoryDto> categoryMap = modelCategoryService.getModelCategoriesByIds(modelCategoryIds)
                .stream()
                .collect(Collectors.toMap(ModelCategoryDto::getCategoryId, m -> m));

        Map<Long, BaseDataObject> tableMap = baseTables
                .stream()
                .collect(Collectors.toMap(BaseDataObject::getObjectId, t -> t));

        Map<Long, DataObject> columnMap = columns
                .stream()
                .collect(Collectors.toMap(DataObject::getObjectId, d -> d));


        //标准
        Map<String, DomainDto> domainMap = RemoteServiceGetter.getDomainService().getDomainsByDomainIds(domainIds)
                .stream()
                .collect(Collectors.toMap(DomainDto::getDomainId, d -> d));

        Map<Long, ShallowModelDto> parentModelMap = new HashMap<>();
        for (ShallowModelDto model : dataModelService.getParentShallowModelsByIds(modelIds)) {
            parentModelMap.put(model.getChildrenId(), model);
        }


        for (GlobalSearchResult searchResult : results) {
            Long itemType = searchResult.getData().getItemType();
            if (LDMTypes.oAttribute != itemType) {
                continue;
            }

            ColumnSearchResult columnSearchResult = new ColumnSearchResult(searchResult.getData());

            DataObject column = columnMap.get(columnSearchResult.getObjectId());
            if (column == null || !tableMap.containsKey(column.getTableId())) {
                LOGGER.error("error data [{}] ...", columnSearchResult.getObjectId());
                continue;
            }
            BaseDataObject table = tableMap.get(column.getTableId());

            //权威来源路径：系统、数据源、schema
            ModelCategoryDto category = categoryMap.get(table.getModelCategoryId());
            String categoryName = category == null ? "" : category.getCategoryName();
            String modelName = table.getModelName();
            String schema = table.getSchema();
            String parentModelName = modelName;
            if (parentModelMap.containsKey(table.getModelId())) {
                parentModelName = parentModelMap.get(table.getModelId()).getModelName();
            }
            //权威来源路径
            columnSearchResult.setPath(categoryName + "/" + parentModelName + "/" + schema + "/" + column.getParentPhysicalName());

            //数据标准
            columnSearchResult.setDomain(domainMap.get(column.getDomainId()));

            //标准代码
            columnSearchResult.setStandardCode(column.getDomainCode());

            //字段类型
            Node columnNode = column.getObjectNode();
            ObjectX columnObjectX = new ObjectX();
            columnObjectX.deserialize(columnNode);

            Object dataType = columnObjectX.getProperty(LDMTypes.pDataType);
            if (dataType != null) {
                columnSearchResult.setColumnType(dataType.toString());
            }

            //数据源类型
            columnSearchResult.setModelType(table.getModelType());

            searchResult.setData(columnSearchResult);
        }
    }

    protected void setTableSearchResultProperties(List<GlobalSearchResult> results, List<Long> tableIds) throws Exception {
        if (CollectionUtils.isEmpty(tableIds)) {
            return;
        }
        List<String> tableIdStrList = tableIds
                .stream()
                .map(Objects::toString)
                .toList();

        List<BaseDataObjectNew> baseTables = objectNewService.getBaseDataObjectNewByObjectIds(tableIds);

        Set<Long> modelCategoryIds = baseTables
                .stream()
                .map(BaseDataObjectNew::getModelCategoryId)
                .collect(Collectors.toSet());

        Set<Long> modelIds = baseTables
                .stream()
                .map(BaseDataObjectNew::getModelId)
                .collect(Collectors.toSet());

        Map<Long, ShallowModelDto> parentModelMap = new HashMap<>();
        for (ShallowModelDto model : dataModelService.getParentShallowModelsByIds(modelIds)) {
            parentModelMap.put(model.getChildrenId(), model);
        }

        Map<Long, ModelCategoryDto> categoryMap = modelCategoryService.getModelCategoriesByIds(modelCategoryIds)
                .stream()
                .collect(Collectors.toMap(ModelCategoryDto::getCategoryId, m -> m));

        Map<Long, BaseDataObjectNew> tableMap = baseTables
                .stream()
                .collect(Collectors.toMap(BaseDataObjectNew::getObjectId, t -> t));

        //数据权属
        Map<String, List<DataDepartmentTableDto>> departmentMap =
                dataDepartmentService.findDepartmentByObjectIds(tableIdStrList);
        //数据管家
        Map<String, List<DataManagerTableDto>> dataManagerMap =
                dataManagerService.findUserManagerByDataIdsAndType(tableIdStrList, Lists.newArrayList(LDMTypes.oEntity, LDMTypes.oView));
        //有无采样数据
        Map<Long, Boolean> dataSampleMap = dataObjectService.getTableIfHasDataSample(tableIds);
        //有无质量问题
        Map<Long, Boolean> qualityMap = RemoteServiceGetter.getDataQualityRemoteService().getTableIfHasQualityTask(tableIds);

        //获取表udp
        List<String> tableUdps = Arrays.asList("业务域", "业务描述", "使用描述");
        List<MetadataUserDefinedProperty> tableUdpProperty = udpService.getByNamesAndTypeId(tableUdps, LDMTypes.oEntity);
        Map<String, Long> tableUdpMap = tableUdpProperty.stream().collect(Collectors.toMap(MetadataUserDefinedProperty::getName, MetadataUserDefinedProperty::getId,(x1,x2)->x1));
        List<Long>  tableUdpIds = tableUdpProperty.stream().map(MetadataUserDefinedProperty::getId).toList();
        //获取视图udp
        List<MetadataUserDefinedProperty> viewUdpProperty = udpService.getByNamesAndTypeId(tableUdps, LDMTypes.oView);
        Map<String, Long> viewUdpMap = viewUdpProperty.stream().collect(Collectors.toMap(MetadataUserDefinedProperty::getName, MetadataUserDefinedProperty::getId,(x1,x2)->x1));

        List<Long>  viewUdpIds = viewUdpProperty.stream().map(MetadataUserDefinedProperty::getId).toList();
        List<MetadataUserDefinedPropertyValue> udpValus = Lists.newArrayList();

        //根据objectId和udpId查询udp值
        List<Long> udpIdAllList = Lists.newArrayList();
        if (!CollectionUtils.isEmpty(tableUdpIds)) {
            udpIdAllList.addAll(tableUdpIds);
        }
        if (!CollectionUtils.isEmpty(viewUdpIds)) {
            udpIdAllList.addAll(viewUdpIds);
        }
        if (!CollectionUtils.isEmpty(udpIdAllList)) {
            //查询udp的值
            List<String> stringTableIds = tableIds.stream().map(String::valueOf).toList();
            udpValus= dataObjectUdpRepository.findUdpByItemIdsAndUdpIds(stringTableIds, udpIdAllList);
        }
        Map<String, MetadataUserDefinedPropertyValue> udpValMap = udpValus.stream().collect(Collectors.toMap(x -> x.getItemId() + "-" + x.getUdpId(), Function.identity(), (x1, x2) -> x1));

        for (GlobalSearchResult searchResult : results) {
            Long itemType = searchResult.getData().getItemType();
            if (LDMTypes.oEntity != itemType && LDMTypes.oView != itemType) {
                continue;
            }

            TableSearchResultNew tableSearchResult = new TableSearchResultNew(searchResult.getData());

            BaseDataObjectNew table = tableMap.get(tableSearchResult.getObjectId());
            if (table == null) {
                LOGGER.error("error data [{}] ...", tableSearchResult.getObjectId());
                continue;
            }

            //权威来源路径：系统、父数据源、schema
            ModelCategoryDto category = categoryMap.get(table.getModelCategoryId());
            String categoryName = category == null ? "" : category.getCategoryName();
            String parentModelName = table.getModelName();
            if (parentModelMap.containsKey(table.getModelId())) {
                parentModelName = parentModelMap.get(table.getModelId()).getModelName();
            }
            String schema = table.getSchema();

            tableSearchResult.setPath(categoryName + "/" + parentModelName + "/" + schema);

            //数据权属
            if (departmentMap != null && departmentMap.containsKey(tableSearchResult.getItemId())) {
                tableSearchResult.setDataDepartments(departmentMap.get(tableSearchResult.getItemId()));
            }

            //数据管家
            if (dataManagerMap.containsKey(tableSearchResult.getItemId())) {
                tableSearchResult.setDataManagers(dataManagerMap.get(tableSearchResult.getItemId()));
            }

            //采样数据
            tableSearchResult.setHasSampleData(dataSampleMap.getOrDefault(table.getObjectId(), false));
            Boolean tableFlag = true;
            if (LDMTypes.oView == itemType) {
                tableFlag = false;
            }

            //有无质量问题
            tableSearchResult.setHasQualityData(qualityMap.getOrDefault(table.getObjectId(), false));

            //负责人
            tableSearchResult.setOwner(table.getOwner());

            // 设置业务域、业务描述、使用描述
            setUdpValue(tableSearchResult, tableUdpMap, viewUdpMap, udpValMap, "业务域", tableFlag);
            setUdpValue(tableSearchResult, tableUdpMap, viewUdpMap, udpValMap, "业务描述", tableFlag);
            setUdpValue(tableSearchResult, tableUdpMap, viewUdpMap, udpValMap, "使用描述", tableFlag);

            searchResult.setData(tableSearchResult);
        }
    }

    private void setUdpValue(TableSearchResultNew tableSearchResult, Map<String, Long> tableUdpMap, Map<String, Long> viewUdpMap, Map<String, MetadataUserDefinedPropertyValue> udpValMap, String key, Boolean tableFlag) {
        Long udpId;
        Map<String, Long> udpMap;

        if (tableFlag) {
            udpMap = tableUdpMap;
        } else {
            udpMap = viewUdpMap;
        }

        udpId = udpMap.get(key);

        if (udpId != null) {
            String udpKey = tableSearchResult.getItemId() + "-" + udpId;
            MetadataUserDefinedPropertyValue propertyValue = udpValMap.get(udpKey);
            if (propertyValue != null) {
                switch (key) {
                    case "业务域":
                        tableSearchResult.setBusinessDomain(propertyValue.getValue());
                        break;
                    case "业务描述":
                        tableSearchResult.setBusinessDescription(propertyValue.getValue());
                        break;
                    case "使用描述":
                        tableSearchResult.setUseDescription(propertyValue.getValue());
                        break;
                    default:
                        // 如果有其他属性，可以在这里添加
                        break;
                }
            }
        }
    }

    protected void setCatalogSearchResultProperties(List<GlobalSearchResult> results, List<Long> catalogIds) {
        if (CollectionUtils.isEmpty(catalogIds)) {
            return;
        }

        List<CommonCatalogDto> commonCatalogs = remoteDataAssetExtendService.getCommonCatalogDtos(catalogIds);
        Map<Long, CommonCatalogDto> catalogMap = commonCatalogs.stream().collect(Collectors.toMap(CommonCatalogDto::getId, x->x, (x1, x2) -> x1));
        List<Long> typeIds = commonCatalogs.stream().map(CommonCatalogDto::getCatalogTypeId).distinct().toList();
        //获取目录路径
        List<String> catalogPathList = commonCatalogs.stream().map(CommonCatalogDto::getCatalogPath).distinct().toList();
        Set<Long> allParentIds = new HashSet<>();
        for (String catalogPath : catalogPathList) {
            String[] ids = catalogPath.split("/");
            for (String id : ids) {
                if (!id.isEmpty() && !id.equals("0")) {
                    allParentIds.add(Long.parseLong(id));
                }
            }
        }
        //查询涉及到的上级目录
        List<CommonCatalogDto> parentCatalogs = remoteDataAssetExtendService.getCommonCatalogDtos(allParentIds);
        Map<Long, CommonCatalogDto> parentCatalogMap = parentCatalogs.stream().collect(Collectors.toMap(CommonCatalogDto::getId, Function.identity(), (x1, x2) -> x1));

        //获取目录类型
        Map<Long, String> typeMap = remoteDataAssetExtendService.getCommonCatalogType(typeIds);
        for (GlobalSearchResult result : results) {
            CatalogSearchResult catalogSearchResult = new CatalogSearchResult(result.getData());
            Long catalogId = catalogSearchResult.getCatalogId();
            String path = catalogSearchResult.getPath();
            CommonCatalogDto commonCatalog = catalogMap.get(catalogId);
            if (commonCatalog == null) {
                LOGGER.error("error data [{}] ...", catalogSearchResult.getCatalogId());
                continue;
            }
            Long catalogTypeId = commonCatalog.getCatalogTypeId();
            String type = typeMap.get(catalogTypeId);
            catalogSearchResult.setCatalogType(type);
            catalogSearchResult.setCreator(commonCatalog.getCreator());
            catalogSearchResult.setCreateTime(commonCatalog.getCreateTime());
            //获取对应的目录路径名称
            String[] pathIds = path.split("/");
            List<String> names = new ArrayList<>();
            // 遍历每个 ID 并查找对应的中文名称
            for (String id : pathIds) {
                if (!id.isEmpty() && !id.equals("0")) { // 跳过根节点 0
                    Long parentId = Long.parseLong(id);
                    CommonCatalogDto catalogDto = parentCatalogMap.get(parentId);
                    if (catalogDto != null) {
                        names.add(catalogDto.getName());
                    }
                }
            }
            names.add(commonCatalog.getName());
            String pathStr = String.join("/", names);
            catalogSearchResult.setPathStr(pathStr);
            result.setData(catalogSearchResult);
        }

    }


    public void setModelSearchResultProperties(List<GlobalSearchResult> results, List<Long> modelIds) {
        if (CollectionUtils.isEmpty(modelIds)) {
            return;
        }
        List<Model> models = dataModelService.getDataModelByIds(modelIds);
        Map<Long, Model> modelMap = models.stream().collect(Collectors.toMap(Model::getModelId, x -> x, (x1, x2) -> x1));

        //查询所有应用系统
        List<Long> categoryIds = models.stream().map(Model::getCategoryId).distinct().toList();
        List<ModelCategoryDto> modelCategoryDtos = modelCategoryService.getModelCategoriesByIds(categoryIds);
        Map<Long, String> categoryMap = modelCategoryDtos.stream().collect(Collectors.toMap(ModelCategoryDto::getCategoryId, ModelCategoryDto::getCategoryName, (x1, x2) -> x1));

        for (GlobalSearchResult result : results) {
            ModelSearchResult modelSearchResult = new ModelSearchResult(result.getData());
            Long modelId = modelSearchResult.getModelId();
            Model model = modelMap.get(modelId);
            if (model == null) {
                LOGGER.error("error data [{}] ...", modelSearchResult.getModelId());
                continue;
            }
            modelSearchResult.setModelCategoryId(model.getCategoryId());
            modelSearchResult.setModelCategoryName(categoryMap.get(model.getCategoryId()));
            modelSearchResult.setType(model.getType());
            result.setData(modelSearchResult);
        }
    }

    public String getElasticId(EntityChangeEventDto event) throws Exception {
        if (event.getItemType() == LDMTypes.oMetadataObject) {
            DataObjectDto metaDataObject = mapper.readValue(event.getValue(), DataObjectDto.class);
            return getElasticId(event.getItemId(), metaDataObject.getTypeId());
        } else {
            return getElasticId(event.getItemId(), event.getItemType());
        }
    }

    public static String getElasticId(String itemId, Long itemType) {
        return itemId + "_" + itemType;
    }

}
