/*
 * Copyright (c) 2017, Datablau. All rights reserved.
 */
package com.datablau.metadata.main.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.core.annotation.EndpointDoc;
import com.andorj.common.core.data.CommonTableInfo;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.ItemNotFoundException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.core.model.ObjectX;
import com.andorj.common.data.PageResult;
import com.andorj.enhance.sql.data.Pair;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.utility.BeanHelper;
import com.datablau.base.api.ModelCategoryService;
import com.datablau.base.api.ObjectVisitService;
import com.datablau.base.api.TagService;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.base.data.TagDto;
import com.datablau.common.kafka.producer.KafkaProducer;
import com.datablau.data.common.api.OperationLogService;
import com.datablau.data.common.api.PropertyService;
import com.datablau.data.common.operation.type.OperationLogType;
import com.datablau.data.common.operation.type.OperationModuleType;
import com.datablau.datasource.data.DataConnect;
import com.datablau.domain.management.dto.DomainDto;
import com.datablau.domain.management.dto.StandardCodeDto;
import com.datablau.metadata.common.dto.comm.SearchResult;
import com.datablau.metadata.common.dto.metadata.ChangeType;
import com.datablau.metadata.common.dto.metadata.DataObjectDto;
import com.datablau.metadata.common.dto.metadata.DataSampleDto;
import com.datablau.metadata.common.dto.metadata.MetaDataTagDto;
import com.datablau.metadata.common.dto.metadata.MetadataChangeDto;
import com.datablau.metadata.common.dto.metadata.RelationshipDto;
import com.datablau.metadata.common.dto.metadata.SearchCriteriaDto;
import com.datablau.metadata.common.dto.metadata.TableRelationDetail;
import com.datablau.metadata.common.dto.metadata.query.DataSampleQueryDto;
import com.datablau.metadata.common.dto.metamodel.ObjectVersionDto;
import com.datablau.metadata.main.dao.domain.DomainVerifyRepository;
import com.datablau.metadata.main.dao.metadata.DataObjectLogicalRelationshipRepository;
import com.datablau.metadata.main.dao.metadata.DataObjectRepository;
import com.datablau.metadata.main.dao.model.ModelRepository;
import com.datablau.metadata.main.dto.FullSearchDto;
import com.datablau.metadata.main.dto.covermm.SheetData;
import com.datablau.metadata.main.dto.covermm.Sheets;
import com.datablau.metadata.main.dto.mm.IndexMM;
import com.datablau.metadata.main.dto.objsearch.BaseSearchDto;
import com.datablau.metadata.main.dto.ObjectTenderQueryDto;
import com.datablau.metadata.main.dto.ObjectTenderQueryTableResult;
import com.datablau.metadata.main.dto.metadata.BaseDataObject;
import com.datablau.metadata.main.dto.metadata.DataObjectHistoryDto;
import com.datablau.metadata.main.dto.metadata.DataObjectPropDto;
import com.datablau.metadata.main.dto.metadata.TechRuleEntityResultDto;
import com.datablau.metadata.main.dto.model.KeyDto;
import com.datablau.metadata.main.dto.model.ShallowModelDto;
import com.datablau.metadata.main.dto.report.bi.ResResultDto;
import com.datablau.metadata.main.entity.domain.DomainRecommendationJobResult;
import com.datablau.metadata.main.entity.domain.DomainRecommendationResultRefuse;
import com.datablau.metadata.main.entity.domain.DomainVerify;
import com.datablau.metadata.main.entity.metadata.DataObject;
import com.datablau.metadata.main.entity.metadata.DataObjectLogicalRelationship;
import com.datablau.metadata.main.entity.metadata.ObjectSummary;
import com.datablau.metadata.main.entity.metadata.ViewAndSPObject;
import com.datablau.metadata.main.entity.model.Model;
import com.datablau.metadata.main.entity.model.ModelVersionCompareInfo;
import com.datablau.metadata.main.ext.DataObjectFullSearchService;
import com.datablau.metadata.main.impl.LocalDomainServiceExt;
import com.datablau.metadata.main.service.domain.api.DomainVerifyService;
import com.datablau.metadata.main.service.metadata.api.ColumnMappingService;
import com.datablau.metadata.main.service.metadata.api.DataObjectService;
import com.datablau.metadata.main.service.metadata.api.MetaModelDataService;
import com.datablau.metadata.main.service.metadata.dto.ColumnDto;
import com.datablau.metadata.main.service.metadata.dto.ObjectPathDto;
import com.datablau.metadata.main.service.metadata.dto.TableRelationDto;
import com.datablau.metadata.main.service.model.api.DataModelService;
import com.datablau.metadata.main.service.model.api.DataModelVersionService;
import com.datablau.metadata.main.service.model.api.DataModelXService;
import com.datablau.metadata.main.service.model.dto.CCompareDto;
import com.datablau.metadata.main.service.model.dto.ModelVersionCompareQueryDto;
import com.datablau.metadata.main.service.search.api.SearchService;
import com.datablau.metadata.main.service.tag.TagServiceLocal;
import com.datablau.metadata.main.util.ModelUtility;
import com.datablau.metadata.main.util.RemoteServiceGetter;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import com.datablau.udp.service.api.MetadataUserDefinedPropertyService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import org.apache.commons.lang.ObjectUtils;
import org.apache.poi.ss.usermodel.Workbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.w3c.dom.Node;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;


/**
 * This controller is for web portal Data Asset.
 *
 * @author baobao
 * @author Nicky
 */
@RestController
@RequestMapping("/entities")
@Description("元数据浏览相关REST API")
@io.swagger.v3.oas.annotations.tags.Tag(name = "元数据浏览相关REST API", description = "元数据浏览相关REST API")
public class DataObjectController extends LocalBaseController {

    private static final Logger LOGGER = LoggerFactory.getLogger(DataObjectController.class);
    @Autowired
    private DataModelService dataModelService;
    @javax.annotation.Resource
    private ModelCategoryService modelCategoryService;
    @Autowired
    private DataModelXService modelXService;
    @Autowired
    private DataObjectService dataObjectService;
    @Autowired
    private SearchService searchService;
    @Autowired
    private TagService tagService;
    @Autowired
    private TagServiceLocal tagServiceLocal;
    @Autowired
    private DomainVerifyService domainVerifyService;
    @Autowired
    private DomainVerifyRepository domainVerifyRepo;
    @Autowired
    private MessageService msgService;
    @Autowired
    private ObjectVisitService objectVisitService;
    @Autowired
    private DataObjectRepository dataObjectRepository;
    //@Autowired
    //private SampleDataService sampleDataService;
    @Autowired
    private PropertyService propertyService;
    @Autowired
    private DataModelVersionService modelVersionService;
    @Autowired
    private ColumnMappingService columnMappingService;
    @Autowired
    private KafkaProducer kafkaProducer;
    @Autowired
    private OperationLogService operationLogService;
    @Autowired
    public MetadataUserDefinedPropertyService udpService;

    @Autowired
    public LocalDomainServiceExt localDomainService;

    @Autowired
    private ModelRepository dataModelRepo;

    @Autowired
    private MetaModelDataService metaModelDataService;

    @Value("${datablau.kafka-topic.metadata-change:datablau-metadata.dataObject.change}")
    private String metadataChangeKafkaTopic;

    public DataObjectController(@Autowired RoleService roleService) {
        super(roleService);
    }


//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "dam_element",
//            systemModule = OperationModuleType.METADATA_DATA,
//            description = "查询数据集列表"
//    )
    @RequestMapping(value = "/searchMetadata", method = RequestMethod.POST)
    @Description("搜索的API")
    @Operation(summary = "搜索的API")
    public PageResult<SearchResult> searchObjects(@RequestBody SearchCriteriaDto criteria) {
        return searchService.searchMetadata(criteria);
    }


    @RequestMapping(value = "/search/summary", method = RequestMethod.POST)
    @Description("搜索的API")
    public PageResult<ObjectSummary> searchObjectSummary(@RequestBody SearchCriteriaDto criteria) {
        return searchService.searchObjectSummary(criteria.getPageSize(), criteria.getCurrentPage(),
                criteria.getKeyword(), criteria.getTagIds());
    }

    @RequestMapping("/models")
    public Collection<Model> getModels() {
        return dataModelService.getRealModels();
    }

    @RequestMapping("/{objectId}/columns")
    @Operation(summary = "获取实体列")
    public Set<ColumnDto> getEntityColumns(@Parameter(name = "objectId", description = "唯一id")
                                           @PathVariable("objectId") Long objectId, @RequestParam(value = "keyword", required = false) String keyword)
            throws Exception {
//        Node node = null;
        DataObject dataObject = null;
        List<DataObject> colObjs = new ArrayList<>();
        List<ObjectX> keyGroupObjs = new ArrayList<>();
        Iterable<DataObject> children;
        //是否有关键词搜索
        if (StringUtils.isEmpty(keyword)) {
            children = dataObjectService.getDataObjectAndChildren(objectId);
        } else {
            List<DataObject> search = dataObjectService.getDataObjectAndChildren(objectId, keyword);
            if (search == null || search.isEmpty()) {
                return new HashSet<>();
            }
            children = search;
        }
        for (DataObject object : children) {
            if (ObjectUtils.equals(object.getObjectId(), objectId)) {
                dataObject = object;
                continue;
            }
            if (ObjectUtils.equals(object.getTypeId(), LDMTypes.oAttribute)) {
                colObjs.add(object);
            }
            if (ObjectUtils.equals(object.getTypeId(), LDMTypes.oKeyGroup)) {
                keyGroupObjs.add(object.getObjectX());
            }
        }

        //dataModelService.loadEntity(objectId);
//        ObjectX ox = new ObjectX();
//        ox.deserialize(node);
        ObjectX ox = dataObject.getObjectX();
        Set<ColumnDto> columns = new HashSet<>();
        Map<Long, ColumnDto> columnMap = new HashMap<>();

        //List<ObjectX> cols = ox.getTypedChildren(LDMTypes.oAttribute);
        //List<Long> colIds = cols.stream().map(col -> col.getId()).collect(Collectors.toList());
        colObjs.sort(Comparator.comparing(DataObject::getOrdinal));

        Set<String> domainIds = new HashSet<>();
        Set<String> itemIds = new HashSet<>();
        Set<String> domainCodes = new HashSet<>();
        for (DataObject column : colObjs) {
            if (!StringUtils.isEmpty(column.getDomainId())) {
                domainIds.add(column.getDomainId());
            }
            if(!StringUtils.isEmpty(column.getDomainCode())){
                domainCodes.add(column.getDomainCode());
            }
            itemIds.add(column.getObjectId().toString());
        }

        Map<String, Set<TagDto>> tagsMap = tagServiceLocal.getTagsRelationMapOfItemsAndTypeExceptSecurityTag(itemIds, true, LDMTypes.oAttribute);

        List<DomainDto> domainDtos = RemoteServiceGetter.getDomainService().getDomainsByDomainIds(domainIds);

        List<StandardCodeDto> domainCodeDtos = RemoteServiceGetter.getStandardService().findCodesByIds(domainCodes);
        Map<String, StandardCodeDto> codeDtoMap = new HashMap<>();
        if(!CollectionUtils.isEmpty(domainCodeDtos)){
            codeDtoMap = domainCodeDtos.stream().collect(Collectors.toMap(StandardCodeDto::getCode, dto -> dto));
        }

        Map<String, DomainDto> domainDtoMap = new HashMap<>();
        if (domainDtos != null) {
            for (DomainDto domainDto : domainDtos) {
                domainDtoMap.put(domainDto.getDomainId(), domainDto);
            }
        }

        for (DataObject columnObj : colObjs) {
            //DataObject columnObj = dataObjectService.getDataObjectByObjectId(obj.getId());

            ColumnDto column = new ColumnDto(columnObj);

            //add modelName and schema
            column.setModelName(columnObj.getModelName());
            column.setSchema(columnObj.getSchema());

            Long ordinal = columnObj.getOrdinal();
            if (ordinal != null) // Make the code stronger.
            {
                column.setOrdinal(ordinal);
            }

            column.setTags(convertToTagDtos(tagsMap.getOrDefault(columnObj.getObjectId().toString(), new HashSet<>()), columnObj.getObjectId()));

            Set<DomainDto> columnDomains = new HashSet<>();
            if (domainDtoMap.containsKey(columnObj.getDomainId())) {
                columnDomains.add(domainDtoMap.get(columnObj.getDomainId()));
            }
            String domainCode = column.getDomainCode();
            column.setDomains(columnDomains);
            column.setDomainCode(domainCode);
            if(codeDtoMap.get(domainCode) != null){
                column.setDomainState(codeDtoMap.get(domainCode).getState());
            }

            columns.add(column);

//            Node columnNode = columnObj.getObjectNode();
//            ObjectX columnObjectX = new ObjectX();
//            columnObjectX.deserialize(columnNode);
            ObjectX columnObjectX = columnObj.getObjectX();


            Object precision = columnObjectX.getProperty(LDMTypes.pDataPrecision);
            Object scale = columnObjectX.getProperty(LDMTypes.pDataScale);
            Object dataType = columnObjectX.getProperty(LDMTypes.pDataType);
            Object isNotNull = columnObjectX.getProperty(LDMTypes.pIsNotNull);

            if (dataType != null) {
                column.setType(dataType.toString());
            }

            if (precision != null) {
                Double dp = Double.parseDouble(precision.toString());
                column.setPercision(dp.intValue());
            }

            if (scale != null) {
                column.setScale(Integer.parseInt(scale.toString()));
            }

            if (isNotNull != null) {
                column.setNotNull(Boolean.valueOf(isNotNull.toString()));
            } else {
                column.setNotNull(false);
            }

            columnMap.put(column.getObjectId(), column);
        }

        ObjectMapper mapper = new ObjectMapper();
        if (CollectionUtils.isEmpty(keyGroupObjs)) {
            keyGroupObjs = ox.getTypedChildren(LDMTypes.oKeyGroup);
        }

        for (ObjectX obj : keyGroupObjs) {
            String keyGroupRefs = (String) obj.getProperty(LDMTypes.pKeyGroupMemberRefs);

            if (keyGroupRefs == null) {
                continue;
            }

            try {
                Map<String, Map<String, Object>> groups = mapper.readValue(keyGroupRefs, Map.class);
                for (Map<String, Object> content : groups.values()) {
                    Integer id = (Integer) content.get("Id");
                    ColumnDto column = columnMap.get(id.longValue());
                    if (column != null) {
                        KeyDto key = new KeyDto();
                        key.setName(obj.getName());
                        key.setType((String) obj.getProperty(LDMTypes.pKeyGroupType));
                        column.addKey(key);
                    }
                }
            } catch (JsonProcessingException e) {
                /**
                 * 以下是新的核心包RE出来的keygroupMember，是用 ;号分割的字符串
                 */
                String[] columnNames = keyGroupRefs.split(";");
                for (ColumnDto column : columnMap.values()) {
                    for (String columnName : columnNames) {
                        if (column.getPhysicalName().equalsIgnoreCase(columnName)) {
                            KeyDto key = new KeyDto();
                            key.setName(obj.getName());
                            key.setType((String) obj.getProperty(LDMTypes.pKeyGroupType));
                            column.addKey(key);
                        }
                    }
                }
            }
        }

        setLogicalRelationshipProperties(columns, objectId);

        return columns;
    }

    private void setLogicalRelationshipProperties(Set<ColumnDto> columns, Long tableId) {
        DataObjectLogicalRelationshipRepository relationshipRepository = BeanHelper.getBean(DataObjectLogicalRelationshipRepository.class);

        List<DataObjectLogicalRelationship> relationshipList = relationshipRepository.findBySrcTableId(tableId);

        Map<Long, List<DataObjectLogicalRelationship>> relationshipMap = relationshipList
                .stream()
                .collect(Collectors.groupingBy(DataObjectLogicalRelationship::getSrcColId));
        List<Long> dstColumnIds = new ArrayList<>();
        List<Long> dstModelIds = new ArrayList<>();
        for (DataObjectLogicalRelationship relationship : relationshipList) {
            dstColumnIds.add(relationship.getDstColId());
            dstModelIds.add(relationship.getDstModelId());
        }

        Map<Long, Model> dstModelMap = dataModelService.getDataModelByIds(dstModelIds)
                .stream()
                .collect(Collectors.toMap(Model::getModelId, m -> m));

        Map<Long, DataObject> dstColumnMap = dataObjectService.getDataObjectsByIds(dstColumnIds)
                .stream().collect(Collectors.toMap(DataObject::getObjectId, d -> d));

        for (ColumnDto column : columns) {
            if (!relationshipMap.containsKey(column.getObjectId())) {
                continue;
            }
            List<DataObjectLogicalRelationship> relationships = relationshipMap.get(column.getObjectId());

            Set<String> relationPath = new LinkedHashSet<>();

            for (DataObjectLogicalRelationship relationship : relationships) {
                if (!dstColumnMap.containsKey(relationship.getDstColId())
                    || !dstModelMap.containsKey(relationship.getDstModelId())) {
                    continue;
                }

                DataObject dstColumn = dstColumnMap.get(relationship.getDstColId());
                Model dstModel = dstModelMap.get(relationship.getDstModelId());

                String dstModelName = dstModel.getDefinition();
                String dstSchema = dstColumn.getSchema();
                String dstTableName = dstColumn.getParentPhysicalName();
                String dstColumnName = dstColumn.getPhysicalName();

                relationPath.add(dstModelName + "/" + dstSchema + "/" + dstTableName + "/" + dstColumnName);
            }

            column.setRelationShipPhysicalColumnName(String.join("; ", relationPath));
        }

    }

    private Set<MetaDataTagDto> convertToTagDtos(Collection<TagDto> tags, Long objectId) {
        Set<MetaDataTagDto> result = new HashSet<>();

        for (TagDto tag : tags) {
            result.add(new MetaDataTagDto(tag, objectId));
        }

        return result;
    }

    @PostMapping("/column/type")
    @Operation(summary = "获取实体列")
    public Set<ColumnDto> getColumnsType(@RequestBody List<Long> objectIdList) throws Exception {
        Node node = null;
        List<DataObject> colObjs = new ArrayList<>();
        List<ObjectX> keyGroupObjs = new ArrayList<>();
        for (DataObject object : dataObjectService.getDataObjectsByIds(objectIdList)) {
            if (ObjectUtils.equals(object.getTypeId(), LDMTypes.oAttribute)) {
                colObjs.add(object);
            }
            if (ObjectUtils.equals(object.getTypeId(), LDMTypes.oKeyGroup)) {
                keyGroupObjs.add(object.getObjectX());
            }
        }

        //dataModelService.loadEntity(objectId);
//        ObjectX ox = new ObjectX();
//        ox.deserialize(node);
        Set<ColumnDto> columns = new HashSet<>();
        Map<Long, ColumnDto> columnMap = new HashMap<>();

        //List<ObjectX> cols = ox.getTypedChildren(LDMTypes.oAttribute);
        //List<Long> colIds = cols.stream().map(col -> col.getId()).collect(Collectors.toList());
        colObjs.sort(Comparator.comparing(DataObject::getOrdinal));

        Set<String> domainIds = new HashSet<>();
        Set<String> itemIds = new HashSet<>();
        for (DataObject column : colObjs) {
            if (!StringUtils.isEmpty(column.getDomainId())) {
                domainIds.add(column.getDomainId());
            }
            itemIds.add(column.getObjectId().toString());
        }
        Map<String, Set<TagDto>> tagsMap = tagServiceLocal.getTagsRelationMapOfItemsAndTypeExceptSecurityTag(itemIds, true, LDMTypes.oAttribute);

        List<DomainDto> domainDtos = RemoteServiceGetter.getDomainService().getDomainsByDomainIds(domainIds);

        Map<String, DomainDto> domainDtoMap = new HashMap<>();
        if (domainDtos != null) {
            for (DomainDto domainDto : domainDtos) {
                domainDtoMap.put(domainDto.getDomainId(), domainDto);
            }
        }

        for (DataObject columnObj : colObjs) {
            //DataObject columnObj = dataObjectService.getDataObjectByObjectId(obj.getId());

            ColumnDto column = new ColumnDto(columnObj);

            Long ordinal = columnObj.getOrdinal();
            if (ordinal != null) // Make the code stronger.
            {
                column.setOrdinal(ordinal);
            }
            column.setTags(convertToTagDtos(tagsMap.getOrDefault(columnObj.getObjectId().toString(), new HashSet<>()), columnObj.getObjectId()));

            Set<DomainDto> columnDomains = new HashSet<>();
            if (domainDtoMap.containsKey(columnObj.getDomainId())) {
                columnDomains.add(domainDtoMap.get(columnObj.getDomainId()));
            }

            column.setDomains(columnDomains);
            columns.add(column);

            Node columnNode = columnObj.getObjectNode();
            ObjectX columnObjectX = new ObjectX();
            columnObjectX.deserialize(columnNode);

            Object precision = columnObjectX.getProperty(LDMTypes.pDataPrecision);
            Object scale = columnObjectX.getProperty(LDMTypes.pDataScale);
            Object dataType = columnObjectX.getProperty(LDMTypes.pDataType);
            Object isNotNull = columnObjectX.getProperty(LDMTypes.pIsNotNull);

            if (dataType != null) {
                column.setType(dataType.toString());
            }

            if (precision != null) {
                Double dp = Double.parseDouble(precision.toString());
                column.setPercision(dp.intValue());
            }

            if (scale != null) {
                column.setScale(Integer.parseInt(scale.toString()));
            }

            if (isNotNull != null) {
                column.setNotNull(Boolean.valueOf(isNotNull.toString()));
            } else {
                column.setNotNull(false);
            }

            columnMap.put(column.getObjectId(), column);
        }

        ObjectMapper mapper = new ObjectMapper();
//        if (CollectionUtils.isEmpty(keyGroupObjs)) {
//            keyGroupObjs = ox.getTypedChildren(LDMTypes.oKeyGroup);
//        }

        for (ObjectX obj : keyGroupObjs) {
            String keyGroupRefs = (String) obj.getProperty(LDMTypes.pKeyGroupMemberRefs);

            if (keyGroupRefs == null) {
                continue;
            }

            try {
                Map<String, Map<String, Object>> groups = mapper.readValue(keyGroupRefs, Map.class);
                for (Map<String, Object> content : groups.values()) {
                    Integer id = (Integer) content.get("Id");
                    ColumnDto column = columnMap.get(id.longValue());
                    if (column != null) {
                        KeyDto key = new KeyDto();
                        key.setName(obj.getName());
                        key.setType((String) obj.getProperty(LDMTypes.pKeyGroupType));
                        column.addKey(key);
                    }
                }
            } catch (JsonProcessingException e) {
                /**
                 * 以下是新的核心包RE出来的keygroupMember，是用 ;号分割的字符串
                 */
                String[] columnNames = keyGroupRefs.split(";");
                for (ColumnDto column : columnMap.values()) {
                    for (String columnName : columnNames) {
                        if (column.getPhysicalName().equalsIgnoreCase(columnName)) {
                            KeyDto key = new KeyDto();
                            key.setName(obj.getName());
                            key.setType((String) obj.getProperty(LDMTypes.pKeyGroupType));
                            column.addKey(key);
                        }
                    }
                }
            }
        }

        return columns;
    }


    @GetMapping(value = "/objects/path")
    public List<ObjectPathDto> getObjectsPath(@RequestParam("ids") String ids) throws Exception {
        if (Strings.isNullOrEmpty(ids)) {
            throw new InvalidArgumentException(msgService.getMessage("IdIsNotPreset"));
        }

        String[] idArr = ids.split(",");
        List<Long> idList = new ArrayList<>(idArr.length);
        try {
            for (String str : idArr) {
                idList.add(Long.parseLong(str));
            }
        } catch (NumberFormatException nfe) {
            throw new InvalidArgumentException(msgService.getMessage("illegalNumberCharacter"));
        }

        List<ObjectPathDto> result = new LinkedList<>();
        Map<Long, String> modelCategorys = new HashMap<>();
        Map<Long, String> models = new HashMap<>();
        for (DataObject object : dataObjectService.getDataObjectsByIds(idList)) {
            modelCategorys.put(object.getModelCategoryId(), "");
            models.put(object.getModelId(), "");
            ObjectPathDto objectPathDto = new ObjectPathDto(object);

            Node columnNode = object.getObjectNode();
            ObjectX columnObjectX = new ObjectX();
            columnObjectX.deserialize(columnNode);
            Object dataType = columnObjectX.getProperty(LDMTypes.pDataType);
            if (dataType != null) {
                objectPathDto.setDataType(dataType.toString());
            }
            result.add(objectPathDto);
        }

        for (ModelCategoryDto category : modelCategoryService
                .getModelCategoriesByIds(new ArrayList<>(modelCategorys.keySet()))) {
            modelCategorys.put(category.getCategoryId(), category.getCategoryName());
        }

        for (ShallowModelDto model : dataModelService.getShallowModelsByIds(models.keySet())) {
            models.put(model.getModelId(), model.getModelName());
        }

        for (ObjectPathDto object : result) {
            object.setModelCategoryName(modelCategorys.get(object.getModelCategoryId()));
            object.setModelName(models.get(object.getModelId()));
        }

        return result;
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "dam_element",
//            systemModule = OperationModuleType.METADATA_DATA,
//            description = "查询数据集，objectId为: {param}",
//            descriptionParamClass = Long.class,
//            descriptionParamMethod = "toString"
//    )
    @RequestMapping("/{objectId}/summary")
    @Operation(summary = "获取数据对象和增加访问次数")
    public DataObjectDto getDataObjectAndAddCount(@Parameter(name = "objectId", description = "对象编号")
                                                  @PathVariable("objectId") Long objectId) throws Exception {
        DataObjectDto object = getDataObject(objectId);
        objectVisitService.asyncIncrementVisitCount(object.getObjectId().toString(),
                object.getTypeId(), AuthTools.currentUsernameFailFast());

        //增加操作日志
        addDataObjectQueryLog(object);

        return object;
    }

    protected void addDataObjectQueryLog(DataObjectDto object) {
        try {
            String entityName = object.getFullName();
            String logMessage;
            if (LDMTypes.oEntity == object.getTypeId() || LDMTypes.oView == object.getTypeId()) {
                logMessage = msgService.getMessage("metadata.table.log.query", entityName);
            } else if (LDMTypes.oAttribute == object.getTypeId()) {
                logMessage = msgService.getMessage("metadata.column.log.query", entityName);
            } else {
                return;
            }
            operationLogService.generateOperationLog(OperationModuleType.METADATA_DATA, "dam_element",
                    OperationLogType.TABLE_QUERY, logMessage, AuthTools.currentUsername(), 0);
        } catch (Exception e) {
            LOGGER.error(e.getMessage());
        }
    }

    @RequestMapping("/{objectId}/get")
    @Operation(summary = "获取数据对象")
    public DataObjectDto getDataObjectWithoutCount(@Parameter(name = "objectId", description = "对象编号")
                                                  @PathVariable("objectId") Long objectId) throws Exception {
        DataObjectDto object = getDataObject(objectId);
        return object;
    }


    @RequestMapping(value = "/getPackageRelationships", method = RequestMethod.POST)
    @Operation(summary = "获取Oracle Package关联的SP和Function", description = "如果传入的ID不是package类型或者找不到，则会抛出异常")
    public List<DataObjectDto> getPackageRelatedObjects(
            @Parameter(name = "objectId", description = "package的objectId", required = true) @RequestParam("objectId") Long objectId) {
        List<DataObjectDto> relationships = new ArrayList<>();
        for (DataObject object : dataObjectService.findPackageRelationships(objectId)) {
            relationships.add(object.toDto());
        }
        return relationships;
    }

    @Transactional(readOnly = true)
    public DataObjectDto getDataObject(Long objectId) throws Exception {
        DataObject object = dataObjectService.getDataObjectByObjectId(objectId);
        if (object == null) {
            throw new ItemNotFoundException(
                    msgService.getMessage("cannotFindObjectWithObjectId", objectId));
        }

        DataObjectDto result = object.toDto();

        if (AuthTools.hasAnyRole(AuthTools.ROLE_SUPERUSER, "METADATA_ROLE_DATA_CATALOG_ADMIN")) {
            result.setWritable(true);
        }

//        Node node = object.getObjectNode();
//        ObjectX ox = new ObjectX();
//        ox.deserialize(node);
        ObjectX ox = object.getObjectX();
        Map<String, Object> properties = new HashMap<>();

        for (Map.Entry<Long, Object> entry : ox.getProperties().entrySet()) {
            LDMTypes.LDMTypeObject property = LDMTypes.getLDMTypeObject(entry.getKey());
            if (property == null) {
                continue;
            }
            if (LDMTypes.pSQL == property.getId()) {
                if ((LDMTypes.oView == object.getTypeId()
                    || LDMTypes.oFunction == object.getTypeId()
                    || LDMTypes.oStoredProcedure == object.getTypeId()
                    || LDMTypes.oPackage == object.getTypeId()
                    ) && !AuthTools.hasAnyRole("METADATA_SQL_ALL_GET", AuthTools.ROLE_SUPERUSER)) {
                    continue;
                }
            }
            properties.put(property.getName(), entry.getValue());
        }

        result.setProperties(properties);
        result.setModelName(object.getModelName());

        Set<TagDto> tags = tagService
                .getTagsOfItemAndType(object.getObjectId().toString(), true, ox.getTypeId());
        result.setTags(convertToTagDtos(tags, object.getObjectId()));

        if (object.getTypeId().equals(LDMTypes.oAttribute)) {
            result.setDomains(
                    new HashSet<>(dataObjectService.getObjectDomains(object.getObjectId())));
            //todo 7.0 me
//            result.setMeasurements(
//                    convertToMeasurementDtos(
//                            dataObjectService.getObjectMeasurements(object.getObjectId()))
//            );
        }

        if (object.getTypeId().equals(LDMTypes.oAttribute) && result.getTableId() == null) {
            DataObject tableObject = dataObjectService
                    .getDataObjectByObjectId(object.getParentId());
            if (tableObject != null) {
                result.setTableName(Strings.isNullOrEmpty(tableObject.getLogicalName())
                        ? tableObject.getPhysicalName() : tableObject.getLogicalName());
                result.setTableId(tableObject.getObjectId());
            }
        }

        //todo 7.0: udp
        // result.setUdps(udpService.getObjectUdps(object.getObjectId(), object.getTypeId()));

        //引用代码，可以被覆盖
        List<StandardCodeDto> domainCodeDtos = RemoteServiceGetter.getStandardService().findCodesByIds(
                Collections.singleton(object.getDomainCode()));

        if (domainCodeDtos != null && !domainCodeDtos.isEmpty()) {
            for (StandardCodeDto dto : domainCodeDtos) {
                result.setDomainState(dto.getState());
            }
        }


        return result;
    }


//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_element",
//            systemModule = OperationModuleType.METADATA_DATA,
//            description = "修改数据集，objectId为: {param}",
//            descriptionParamClass = Long.class,
//            descriptionParamMethod = "toString"
//    )
    @PutMapping(value = "/{dataObjectId}/summary")
    @Operation(summary = "修改元数据")
    public DataObjectDto updateDataObject(@Parameter(name = "dataObjectId", description = "元数据id") @PathVariable("dataObjectId") Long dataObjectId,
                                          @io.swagger.v3.oas.annotations.parameters.RequestBody(required = true, description = "修改的完整对象") @RequestBody DataObjectDto object) throws Exception {
        DataObject doj = dataObjectService.getDataObjectByAutoId(dataObjectId);
        // 校验元数据修改权限
        checkMetadataEditPermissions(doj);
        if (doj == null) {
            throw new ItemNotFoundException(
                    msgService.getMessage("cannotFindObjectWithID", dataObjectId));
        }

        //todo 7.0 数据资产
//        Optional<DataSecurityInfo> dataSecurityInfoById = dataSecurityInfoRepo
//                .findByObjectId(doj.getObjectId());
//        if (dataSecurityInfoById.isPresent()) {
//            dataSecurityInfoService
//                    .updateObjectLogicalNameByObjectId(object.getLogicalName(), doj.getObjectId());
//        }

        Optional<DomainVerify> domainVerifyById = domainVerifyRepo
                .findByObjectId(doj.getObjectId());
        if (domainVerifyById.isPresent()) {
            domainVerifyService
                    .updateObjectLogicalNameByObjectId(object.getLogicalName(), doj.getObjectId());
        }

        ObjectX ox = doj.getObjectX();
        if (ox != null) {
            ox.setProperty(LDMTypes.pLogicalName, object.getLogicalName());
            ox.setProperty(LDMTypes.pDefinition, object.getDefinition());
            if (ModelUtility.syncObjectXToDataObject(doj, ox)) {
                doj = dataObjectService.saveDataObject(doj, doj.getModelCategoryId());
                kafkaProducer.sendMessage(metadataChangeKafkaTopic, new MetadataChangeDto(doj.toDto(), ChangeType.UPDATED));
            }
        }

        return doj.toDto();
    }

    @GetMapping("/domains/candidates")
    //@PreAuthorize(UserRights.INTELLIGENT_VIEW)
    public Page<DomainRecommendationJobResult> getResults(
            @RequestParam(name = "currentPage", defaultValue = "0") Integer currentPage,
            @RequestParam(name = "pageSize", defaultValue = "50") Integer pageSize,
            @RequestParam(name = "orderBy", required = false) String orderBy,
            @RequestParam(name = "sort", defaultValue = "asc") String sort,
            @RequestParam(name = "modelId", required = false) Long modelId,
            @RequestParam(name = "modelCategoryId", required = false) Long modelCategoryId,
            @RequestParam(name = "tableAlias", required = false) String tableAlias,
            @RequestParam(name = "tableName", required = false) String tableName,
            @RequestParam(name = "colAlias", required = false) String colAlias,
            @RequestParam(name = "colName", required = false) String colName) {

        Direction direction = Direction.ASC;
        if (sort.equalsIgnoreCase("desc")) {
            direction = Direction.DESC;
        }

        Pageable page = PageRequest.of(currentPage, pageSize, direction, getBaseDataObjectOrderBy(orderBy));
        return dataObjectService.getDomainRecommendations(modelCategoryId, modelId, tableName, tableAlias, colName, colAlias, page);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "dam_dorcmd_result",
//            systemModule = OperationModuleType.METADATA_DATA,
//            description = "删除数据标准推荐"
//    )
    @DeleteMapping("/domains/candidates/{objectId}")
    public void deleteCandidate(@PathVariable("objectId") Long objectId) {
        dataObjectService.deleteDomainRecomendation(objectId);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_element",
//            systemModule = OperationModuleType.METADATA_DATA,
//            description = "修改元数据的所有者"
//    )
    @RequestMapping(value = "/{objectId}/owner", method = RequestMethod.PUT)
    public void updateObjectOwner(@PathVariable("objectId") Long objectId,
                                  @RequestBody String owner) {
        dataObjectService.setObjectOwner(objectId, owner, true);
    }

    @RequestMapping("/views/{objectId}/tables")
    @Description("获取一个view关联的表")
    public ViewAndSPObject getViewRelatedTables(
            @Description("view的objectId") @PathVariable("objectId") Long objectId) {
        return dataObjectService.getViewObject(objectId);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_view",
//            systemModule = OperationModuleType.METADATA_DATA,
//            description = "更新一个view关联的表"
//    )
    @RequestMapping(value = "/views/{objectId}/tables", method = RequestMethod.PUT)
    @Description("更新一个view关联的表，用户可以手工触发此API让后台自动重新解析view的sql语句")
    public ViewAndSPObject updateViewRelatedTables(
            @Description("view的objectId") @PathVariable("objectId") Long objectId) throws Exception {
        dataObjectService.updateViewObject(objectId);
        return dataObjectService.getViewObject(objectId);
    }

    @RequestMapping("/tables/{objectId}/views")
    @Description("获得一个表相关联的所有view/sp/function")
    public List<ViewAndSPObject> getTableRelatedViews(
            @Description("表的objectId") @PathVariable("objectId") Long objectId) {
        return dataObjectService.getTableRelatedViews(objectId);
    }

    @RequestMapping("/tables/{objectId}/ddminfo")
    @Description("获取一个表在DDM模型里面的信息")
    @Operation(summary = "获取一个表在DDM模型里面的信息")
    public List<CommonTableInfo> getTableInfoInDdm(
            @Parameter(name = "objectId", description = "表的objectId")
            @Description("表的objectId") @PathVariable("objectId") Long objectId) {
        return dataObjectService.getTableRelatedInfoInDDM(objectId);
    }

//    @RequestMapping("/{objectId}/data")
//    @ResponseBody
//    @AuditLog(auditParams = true)
//    public DataTable getSampleData(@PathVariable("objectId") Long objectId) throws Exception {
//        return sampleDataService.getSampleData(objectId);
//    }

    @RequestMapping("/statistics")
    @Description("获取全局的统计")
    public List<Map<String, Object>> getStatistics() {
        return dataObjectService.getStatistics();
    }

    @RequestMapping("/{objectId}/relationships")
    @ResponseBody
    @Operation(summary = "获取关联表格")
    public TableRelationDto getRelatedTables(@Parameter(name = "objectId", description = "id") @PathVariable("objectId") Long objectId)
            throws Exception {
        DataObject object = dataObjectService.getDataObjectByObjectId(objectId);
        if (object == null) {
            throw new ItemNotFoundException("Cannot find object with id [" + objectId + "]");
        }

        if (object.getTypeId() != LDMTypes.oEntity) {
            throw new InvalidArgumentException(
                    "The object is not a table [" + object.getTypeId() + "]");
        }

        TableRelationDto result = new TableRelationDto();

        Set<TableRelationDetail> relatedTables = dataObjectService.findFKRelatedTables(objectId);

        Set<DataObjectDto> relatedTableByFk = new HashSet<>();
        if (!CollectionUtils.isEmpty(relatedTables)) {
            Map<Long, TableRelationDetail> map = new HashMap<>();
            for (TableRelationDetail detail : relatedTables) {
                map.put(detail.getTabId(), detail);
            }

            for (DataObject relatedObject : dataObjectService
                    .getAllModelsAndTablesByIds(map.keySet())) {

                DataObjectDto dto = relatedObject.toDto();
                Set<TagDto> tags = tagService.getTagsOfItem(relatedObject.getObjectId().toString(), true);
                dto.setTags(convertToTagDtos(tags, relatedObject.getObjectId()));

                TableRelationDetail detail = map.get(relatedObject.getObjectId());
                if (detail != null) {
                    dto.addRelationship(detail.getSrc(), detail.getDst(), detail.isFromSrc());
                }

                relatedTableByFk.add(dto);
            }

        } else {
//            Node node = object.getObjectNode();
//            ObjectX nodeObject = new ObjectX();
//            nodeObject.deserialize(node);
            ObjectX nodeObject = object.getObjectX();
            Map<Long, String> objectKeyGroupMap = new HashMap<>();
            List<ObjectX> objectKeyGroups = nodeObject.getTypedChildren(LDMTypes.oKeyGroup);
            if (CollectionUtils.isEmpty(objectKeyGroups)) {
                objectKeyGroups = new ArrayList<>();
                for (DataObject keyGroup : dataObjectService.getAllSubObjectsWithoutPermissionCheck(object.getObjectId(), LDMTypes.oKeyGroup)) {
                    objectKeyGroups.add(keyGroup.getObjectX());
                }
            }

            for (ObjectX keyGroup : objectKeyGroups) {
                Object refs = keyGroup.getProperty(LDMTypes.pKeyGroupMemberRefs);
                if (refs != null) {
                    objectKeyGroupMap.put(keyGroup.getId(), refs.toString());
                }
            }

            ModelX model = modelXService.loadSimpleModelX(object.getModelId());
            List<ObjectX> relationships = model.getTypedObjects(LDMTypes.oRelationship);

            Set<Long> relatedEntities = new HashSet<>();
            Map<Long, Set<Pair<Long, Long>>> keyGroupMap = new HashMap<>();

            for (ObjectX relationship : relationships) {
                Long sourceId =
                        Long.parseLong(relationship.getProperty(LDMTypes.pParentEntityRef).toString());
                Long targetId = Long
                        .parseLong(relationship.getProperty(LDMTypes.pChildEntityRef).toString());

                Object o1 = relationship.getProperty(LDMTypes.pParentKeyRef);
                Object o2 = relationship.getProperty(LDMTypes.pChildKeyRef);

                if (objectId.equals(sourceId)) {
                    if (!objectId.equals(targetId)) {
                        relatedEntities.add(targetId);

                        Set<Pair<Long, Long>> keyGroupPair = keyGroupMap.get(targetId);
                        if (keyGroupPair == null) {
                            keyGroupPair = new HashSet<>();
                            keyGroupMap.put(targetId, keyGroupPair);
                        }
                        keyGroupPair
                                .add(Pair.of(Long.parseLong(o1.toString()),
                                        Long.parseLong(o2.toString())));
                    }
                } else if (objectId.equals(targetId)) {
                    relatedEntities.add(sourceId);

                    Set<Pair<Long, Long>> keyGroupPair = keyGroupMap.get(sourceId);
                    if (keyGroupPair == null) {
                        keyGroupPair = new HashSet<>();
                        keyGroupMap.put(sourceId, keyGroupPair);
                    }
                    keyGroupPair
                            .add(Pair.of(Long.parseLong(o1.toString()), Long.parseLong(o2.toString())));
                }
            }

            Set<TableRelationDetail> relationDetails = new HashSet<>();
            for (DataObject relatedObject : dataObjectService
                    .getAllModelsAndTablesByIds(relatedEntities)) {
                DataObjectDto dto = relatedObject.toDto();
                Set<TagDto> tags = tagService.getTagsOfItem(relatedObject.getObjectId().toString(), true);
                dto.setTags(convertToTagDtos(tags, relatedObject.getObjectId()));

                Node relatedNode = relatedObject.getObjectNode();
                ObjectX ox = new ObjectX();
                ox.deserialize(relatedNode);

                List<ObjectX> keyGroups = ox.getTypedChildren(LDMTypes.oKeyGroup);
                if (CollectionUtils.isEmpty(keyGroups)) {
                    keyGroups = new ArrayList<>();
                    for (DataObject keyGroup : dataObjectService.getAllSubObjectsWithoutPermissionCheck(relatedObject.getObjectId(), LDMTypes.oKeyGroup)) {
                        keyGroups.add(keyGroup.getObjectX());
                    }
                }

                Set<Pair<Long, Long>> mappedKeyGroups = keyGroupMap
                        .get(relatedObject.getObjectId());

                for (ObjectX keyGroup : keyGroups) {
                    Pair<Long, Long> p = findMatchedPair(mappedKeyGroups, keyGroup.getId());
                    if (p != null) {
                        Object refs = keyGroup.getProperty(LDMTypes.pKeyGroupMemberRefs);

                        if (p.getFirst().equals(keyGroup.getId())) {
                            dto.addRelationship(refs.toString(),
                                    objectKeyGroupMap.get(p.getSecond()),
                                    true);
                        } else {
                            dto.addRelationship(objectKeyGroupMap.get(p.getFirst()),
                                    refs.toString(),
                                    false);
                        }
                    }
                }

                relatedTableByFk.add(dto);
                relationDetails.addAll(
                        convertToTableRelationDetails(dto.getObjectId(), dto.getRelationships()));
            }

            dataObjectService.saveFKRelatedTables(objectId, relationDetails);
        }

        result.setRelatedTableByFk(relatedTableByFk);
        return result;
    }

    @RequestMapping("/domainRelation")
    @Description("根据数据标准id获取关联的表")
    public List<DataObject> getDataObjectByDomainIdIs(@RequestBody List<String> domainIds) {
        return dataObjectService.getDataObjectByDomainIdIs(domainIds);
    }

    @RequestMapping("/view/{objectId}/tables/bind")
    @Description("绑定存储过程或者函数的血缘关系")
    public void bindSpOrFunctionRelation(
            @Description("view的objectId") @PathVariable("objectId") Long objectId) {
        try {
            ViewAndSPObject sp = dataObjectService.getViewObject(objectId);
            dataObjectService.bindSpOrFunctionRelation(sp);
        } catch (Exception e) {
            throw new IllegalArgumentException(msgService.getMessage("bindLineageFailed"));
        }
    }

    @RequestMapping("/view/{objectId}/tables/analysis")
    @Description("重新解析oracle存储过程或者函数")
    public void reAnalysisSpOrFunction(
            @Description("view的objectId") @PathVariable("objectId") Long objectId) throws Exception {
        dataObjectService.reAnalysisSpOrFunction(objectId);
    }

    @RequestMapping("/view/{objectId}/tables/bound")
    @Description("重新解析oracle存储过程或者函数")
    public boolean ifOracleViewBound(
            @Description("view的objectId") @PathVariable("objectId") Long objectId) {
        return dataObjectService.ifOracleViewBound(objectId);
    }

    private String[] getBaseDataObjectOrderBy(String orderBy) {
        ArrayList<String> array = new ArrayList<>();
        if (Strings.isNullOrEmpty(orderBy)) {
            array.add("modelId");
            array.add("timestamp");
        } else {
            try {
                DomainRecommendationJobResult.class.getDeclaredField(orderBy);
                array.add(orderBy);
            } catch (NoSuchFieldException nfe) {
                throw new InvalidArgumentException(
                        msgService.getMessage("noPropertyNamedThisFound", orderBy));
            }
        }

        return array.toArray(new String[0]);
    }


    //todo 7.0 me
//    private Set<MeCodeDto> convertToMeasurementDtos(Collection<MeCode> meCodes) {
//        Set<MeCodeDto> result = new HashSet<>();
//
//        for (MeCode meCode : meCodes) {
//            result.add(new MeCodeDto(meCode));
//        }
//
//        return result;
//    }

    private List<TableRelationDetail> convertToTableRelationDetails(Long tableId,
                                                                    Collection<RelationshipDto> relationshipDtos) {
        List<TableRelationDetail> result = new ArrayList<>();
        for (RelationshipDto dto : relationshipDtos) {
            result.add(dto.toDetail(tableId));
        }

        return result;
    }

    private Pair<Long, Long> findMatchedPair(Set<Pair<Long, Long>> pairs, Long keyGroupId) {
        for (Pair<Long, Long> pair : pairs) {
            if (pair.getFirst().equals(keyGroupId) || pair.getSecond().equals(keyGroupId)) {
                return pair;
            }
        }
        return null;
    }


    @RequestMapping("/{objectId}/summary/prop")
    @Description("获取entity的相关属性")
    @Operation(summary = "获取entity的相关属性")
    public DataObjectPropDto getTableProp(
            @Description("表的objectId") @PathVariable("objectId") Long objectId) {
        return dataObjectService.getTableProp(objectId);
    }

    @RequestMapping("/{fileId}/file/prop")
    @Description("获取文件的相关属性")
    @Operation(summary = "获取文件的相关属性", description = "获取文件的相关属性")
    @Parameters({@Parameter(name = "fileId", description = "fileId", in = ParameterIn.PATH, required = true)})
    public DataObjectPropDto getFileProp(@Description("文件的id") @PathVariable("fileId") Long fileId) {
        return dataObjectService.getFileProp(fileId);
    }

    @PostMapping("/data/sample")
    @Description("获取样例数据")
    @EndpointDoc(bodyExample = "{\n" +
            "    \"objectId\" : \"17518\",\n" +
            "    \"currentPage\" : \"1\",\n" +
            "    \"pageSize\" : \"20\"\n" +
            "}",
            responseExample = "{\n" +
                    "    \"currentPage\": 1,\n" +
                    "    \"pageSize\": 20,\n" +
                    "    \"total\": 4,\n" +
                    "    \"columns\": [\n" +
                    "        \"id\",\n" +
                    "        \"class\"\n" +
                    "    ],\n" +
                    "    \"content\": [\n" +
                    "        [\n" +
                    "            4,\n" +
                    "            \"com.datablau.dam.data.jpa.entity.CommonJob\"\n" +
                    "        ],\n" +
                    "        [\n" +
                    "            2,\n" +
                    "            \"com.datablau.dam.data.jpa.entity.Model\"\n" +
                    "        ],\n" +
                    "        [\n" +
                    "            1,\n" +
                    "            \"com.datablau.dam.data.jpa.entity.ModelCategoryDto\"\n" +
                    "        ],\n" +
                    "        [\n" +
                    "            3,\n" +
                    "            \"com.datablau.dam.data.jpa.entity.quality.DataQualityTechRule\"\n" +
                    "        ]\n" +
                    "    ]\n" +
                    "}")
    @Operation(summary = "获取样例数据")
    public DataSampleDto getDataSample(@RequestBody DataSampleQueryDto queryDto) {
        return dataObjectService.getTableDataSample(queryDto);
    }

    @GetMapping("/{objectId}/tech/rule")
    @Description("获取entity的规则信息")
    @EndpointDoc(responseExample = "{\n" +
            "    \"score\": 50,\n" +
            "    \"ruleNumber\": 1,\n" +
            "    \"checkColumn\": 1,\n" +
            "    \"totalNumber\": 4,\n" +
            "    \"rules\": [\n" +
            "        {\n" +
            "            \"techRuleId\": 4,\n" +
            "            \"taskId\": null,\n" +
            "            \"columnObjectId\": 17725,\n" +
            "            \"columnName\": \"id\",\n" +
            "            \"techRuleName\": \"test\",\n" +
            "            \"questionStatus\": null,\n" +
            "            \"errorNumber\": 2,\n" +
            "            \"totalNumber\": 4,\n" +
            "            \"lastRunTime\": 1627011358683,\n" +
            "            \"jobId\": 32,\n" +
            "            \"errorRatio\": 0.5\n" +
            "        }\n" +
            "    ]\n" +
            "}")
    @Operation(summary = "获取entity的规则信息")
    public TechRuleEntityResultDto getTechRuleEntityDto(
            @Parameter(name = "表的objectId", description = "表的objectId")
            @Description("表的objectId") @PathVariable("objectId") Long objectId) {
        return dataObjectService.getTechRuleEntityDto(objectId);
    }

    @RequestMapping("/{objectId}/history")
    @Operation(summary = "获取entity的历史变化版本")
    public List<DataObjectHistoryDto> getDataObjectHistory(
            @Parameter(name = "objectId", description = "表唯一标识")
            @Description("表的objectId") @PathVariable("objectId") Long objectId) {
        return dataObjectService.getDataObjectHistory(objectId);
    }

    @RequestMapping("/udp/select")
    @Description("提供udp的分类，用作下拉框")
    @EndpointDoc(responseExample = "[\n" +
            "    \"密码信息\",\n" +
            "    \"个人证件信息\",\n" +
            "    \"字段扩展树形\"\n" +
            "]")
    @Operation(summary = "提供udp的分类，用作下拉框")
    public List<String> getUdpCatalogSelect(@RequestParam(value = "groupId", required = false) Long groupId) {
        if (groupId == null) {
            return dataObjectService.getUdpCatalogSelect();
        } else {
            return udpService.getUdpCatalogSelect(groupId);
        }
    }

    @PostMapping("/version/compare")
    @Description("模型任意两个版本比较")
    public void compareObjectBetweenVersion(
            @RequestBody ModelVersionCompareQueryDto queryDto) throws Exception {
        modelVersionService.compareObjectBetweenVersion(queryDto);
    }

    @PostMapping("/version/compare/getCompareDetail")
    @Operation(summary = "获取模型比较历史详细数据")
    public CCompareDto getCompareDetail(
            @RequestBody ModelVersionCompareQueryDto queryDto) throws Exception {
        return modelVersionService.getCompareDetail(queryDto);
    }

    @PostMapping("/version/compare/getComparePage")
    @Description("获取模型比较历史分页数据")
    public PageResult<ModelVersionCompareInfo> getComparePage(
            @RequestBody ModelVersionCompareQueryDto queryDto) throws Exception {
        return modelVersionService.getComparePage(queryDto);
    }

    @PostMapping("/version/compare/download")
    @Description("模型任意两个版本比较，下载比较结果")
    public ResponseEntity<Resource> getCompareResultFileForDamModelAndDdmModel(
            @RequestBody ModelVersionCompareQueryDto queryDto) throws Exception {
        ByteArrayOutputStream bos = null;
        try {
            Workbook wb = modelVersionService.exportModelVersionCompareResult(queryDto);
            bos = new ByteArrayOutputStream();
            wb.write(bos);
            wb.close();

            Model model = dataModelService.getModelByIdUnsafe(queryDto.getModelId());

            String filename = model.getDefinition() + "版本" + queryDto.getStartVersion()
                    + "与" + queryDto.getEndVersion() + "的变化详情.xlsx";

            HttpHeaders headers = new HttpHeaders();
            headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");
            headers.add("charset", "utf-8");

            headers.add("Content-Disposition", "attachment;filename=\"" + URLEncoder.encode(filename, "utf-8") + "\"");

            Resource resource = new InputStreamResource(
                    new ByteArrayInputStream(bos.toByteArray()));

            return ResponseEntity.ok().headers(headers)
                    .contentType(MediaType.parseMediaType("application/octet-stream")).body(resource);

        } finally {
            if (null != bos) {
                bos.close();
            }
        }
    }

    @PostMapping("/version/compareDataObject")
    @Description("元数据任意两个版本比较")
    public CCompareDto getDataObjectHistoryCompareInfo(
            @RequestBody ModelVersionCompareQueryDto queryDto) throws Exception {
        return modelVersionService.getDataObjectHistoryCompareInfo(queryDto);
    }

    @Operation(summary = "绑定标准代码")
    @RequestMapping(value = "/bindDomainCode", method = RequestMethod.POST)
    public void bindDomainCode(@Parameter(name = "字段的objectId", description = "字段的objectId") @RequestParam("columnId") Long columnId,
                               @Parameter(name = "标准代码的编码", description = "标准代码的编码") @RequestParam("domainCode") String domainCode) {
        DataObject dataObject = dataObjectService.getDataObjectByObjectId(columnId);
        checkMetadataEditPermissions(dataObject);
        dataObjectService.bindDomainCode(columnId, domainCode);

        //增加日志
        addEntityStandardLog(dataObject);
    }

    protected void addEntityStandardLog(DataObject dataObject) {
        try {
            String logMessage = msgService.getMessage("metadata.column.standard.log.modify", dataObject.getFullName());
            operationLogService.generateOperationLog(OperationModuleType.METADATA_DATA, "dam_element",
                    OperationLogType.TABLE_MODIFY, logMessage, AuthTools.currentUsername(), 0);
        } catch (Exception e) {
            LOGGER.error(e.getMessage());
        }
    }

    @Operation(summary = "解除绑定标准代码")
    @RequestMapping(value = "/unbindDomainCode", method = RequestMethod.POST)
    public void unbindDomainCode(@RequestParam("columnId") Long columnId) {
        DataObject dataObject = dataObjectService.getDataObjectByObjectId(columnId);
        checkMetadataEditPermissions(dataObject);
        dataObjectService.unbindDomainCode(columnId);

        //增加日志
        addEntityStandardLog(dataObject);
    }

    @Operation(summary = "获取字段中英文映射")
    @RequestMapping(value = "/getColumnMapping", method = RequestMethod.POST)
    public Map<String, String> getColumnMapping() {
        return columnMappingService.getColumnMapping();
    }


    /**
     * 查询已拒绝的智能推荐结果，用于不参与下次推荐
     *
     * @return
     */
    @GetMapping("/domains/candidates/refuse")
//    @PreAuthorize(UserRights.INTELLIGENT_VIEW)
    public Page<DomainRecommendationResultRefuse> getResultsRefuse(
            @RequestParam(name = "currentPage", defaultValue = "0") Integer currentPage,
            @RequestParam(name = "pageSize", defaultValue = "50") Integer pageSize,
            @RequestParam(name = "orderBy", required = false) String orderBy,
            @RequestParam(name = "sort", defaultValue = "asc") String sort,
            @RequestParam(name = "modelId", required = false) Long modelId,
            @RequestParam(name = "modelCategoryId", required = false) Long modelCategoryId,
            @RequestParam(name = "tableAlias", required = false) String tableAlias,
            @RequestParam(name = "tableName", required = false) String tableName,
            @RequestParam(name = "colAlias", required = false) String colAlias,
            @RequestParam(name = "colName", required = false) String colName) {

        Direction direction = Direction.ASC;
        if (sort.equalsIgnoreCase("desc")) {
            direction = Direction.DESC;
        }

        Pageable page = PageRequest.of(currentPage, pageSize, direction, getBaseDataObjectOrderBy(orderBy));
        return dataObjectService.getDomainRecommendationsRefuse(modelCategoryId, modelId, tableName, tableAlias, colName, colAlias, page);
    }

    @DeleteMapping("/domains/candidates/refuse")
    public void deleteRefuseCandidate(@RequestBody List<Long> ids) {
        dataObjectService.deleteDomainRecomendationRefuse(ids);
    }

    @RequestMapping(value = "/simplePage", method = RequestMethod.POST)
    @Description("获取分页数据简要信息 目前该接口在数据质量 - 创建数据规则任务 - 选择范围的时候用")
    @Operation(summary = "获取分页数据简要信息 目前该接口在数据质量 - 创建数据规则任务 - 选择范围的时候用")
    public Page<BaseDataObject> getSimpleDataObjectPage(@RequestBody SearchCriteriaDto criteria) {
        //这里条件变了，getBaseColumnsUsedDomain方法也要跟着变
        criteria.setDomainUsage(true);
        criteria.setOnlyJdbc(true);
        criteria.setLogicalEntity(false);
        criteria.setDataConnects(Lists.newArrayList(DataConnect.SELF, DataConnect.BACKUP));
        return dataObjectService.getSimpleDataObjectPage(criteria);
    }

    @RequestMapping(value = "/getLogicalInfo", method = RequestMethod.POST)
    public Map<Long, Boolean> getMetadataLogicalInfo(@RequestBody List<Long> objectIds) {
        return dataObjectService.getMetadataLogicalInfo(objectIds);
    }

    @Autowired
    DataObjectFullSearchService fullSearchService;

    @RequestMapping(value = "/objects/page", method = RequestMethod.POST)
    public PageResult<? extends BaseSearchDto> objectsPage(@RequestBody FullSearchDto searchDto) throws Exception {
        if(searchDto.getTypeId() == null){
//            throw new RuntimeException("必须传入类型【" + LDMTypes.oAttribute + "】或【" +  LDMTypes.oEntity + "】");
            throw new RuntimeException("必须传入typeId");
        }
        //最大两千
        if(searchDto.getPageSize() > 2000){
            searchDto.setPageSize(2000);
        }
        return fullSearchService.fullSearch(searchDto);
    }

    @PostMapping(value = "/objects/tender")
    public List<ObjectTenderQueryTableResult> objectsTender(@RequestBody List<ObjectTenderQueryDto> queryParams) throws Exception {
        return localDomainService.objectsTender(queryParams);
    }

    @RequestMapping("/{objectId}/versionDetail")
    @Operation(summary = "获取对象当前查询版本与上一个版本的变化详情")
    public List<ObjectVersionDto> getDataObjectHistoryDetail(
            @Parameter(name = "objectId", description = "表唯一标识")
            @Description("表的objectId") @PathVariable("objectId") Long objectId,
            @RequestParam("version") Integer version) {
        return dataObjectService.getDataObjectHistoryDetail(objectId, version);
    }


    @Value("${mm.index.sheet1:指标1}")
    private String indexMMSheet1;
    @Value("${mm.index.sheet2:指标2}")
    private String indexMMSheet2;
    @Value("${mm.index.sheet3:指标3}")
    private String indexMMSheet3;
    @Value("${mm.index.dimensionCollectName:维度组采集名称}")
    private String dimensionCollectName;
    @Value("${mm.index.bytehouseDatasource:bytehouseDatasource数据源名称.schema名称}")
    private String bytehouseDatasource;
    @Value("${mm.index.indexCollectName:指标采集名称}")
    private String indexCollectName;
    @Value("${mm.index.systemCollectName:应用系统采集名称}")
    private String systemCollectName;
    @Value("${mm.index.modelId:78104963}")
    private Long indexModelId;

    @PostMapping("/object/{modelId}/index")
    @Operation(summary = "三方指标对接，生成元模型数据")
    public ResResultDto saveIndexMM(@RequestBody List<IndexMM> indexMMS, @PathVariable("modelId") Long modelId) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        LOGGER.info("指标元模型对接数据：{}", mapper.writeValueAsString(indexMMS));
        Optional<Model> modelOpt = dataModelRepo.findById(indexModelId);
        Model model = modelOpt.get();

        SheetData sheetData1 = new SheetData(indexMMSheet1);
        sheetData1.addHeader(indexMMSheet1 + ".Id");
        sheetData1.addHeader(indexMMSheet1 + ".Name");
        sheetData1.addHeader(indexMMSheet1 + ".Definition");
        sheetData1.addHeader(indexMMSheet1 + ".LogicalName");
        sheetData1.addData(List.of(indexModelId, model.getDefinition(), "", ""));

        SheetData sheetData2 = new SheetData(indexMMSheet2);
        sheetData2.addHeader(indexMMSheet2 + ".Id");
        sheetData2.addHeader(indexMMSheet2 + ".Name");
        sheetData2.addHeader(indexMMSheet2 + ".Id");
        sheetData2.addHeader(indexMMSheet2 + ".Name");
        sheetData2.addHeader(indexMMSheet2 + ".Definition");
        sheetData2.addHeader(indexMMSheet2 + ".LogicalName");
        sheetData2.addHeader(indexMMSheet2 + ".businessDomain");
        sheetData2.addHeader(indexMMSheet2 + ".themeDomain");
        sheetData2.addHeader(indexMMSheet2 + ".limitedConditions");
        sheetData2.addHeader(indexMMSheet2 + ".indexCode");
        sheetData2.addHeader(indexMMSheet2 + ".indexType");
        sheetData2.addHeader(indexMMSheet2 + ".measure");
        sheetData2.addHeader(indexMMSheet2 + ".indexUnit");
        sheetData2.addHeader(indexMMSheet2 + ".cycleTime");
        sheetData2.addHeader(indexMMSheet2 + ".indexLogic");
        sheetData2.addHeader(indexMMSheet2 + ".indexLevel");
        sheetData2.addHeader(indexMMSheet2 + ".securityLevel");
        sheetData2.addHeader(indexMMSheet2 + ".sourceDepartment");
        sheetData2.addHeader(indexMMSheet2 + ".technicaler");
        sheetData2.addHeader(indexMMSheet2 + ".indexMeaning");
        sheetData2.addHeader(indexMMSheet2 + ".indexName");
        //引用指标表
        sheetData2.addHeader("index.resourceTable");
        //引用关联的来源指标
        sheetData2.addHeader("index.resourceIndex");
        //引用维度
        sheetData2.addHeader("index.dimension");
        //引用来源系统
        sheetData2.addHeader("index.applicationName");

        for (IndexMM indexMM : indexMMS) {
            //维度
            String referDimension = referDimension(indexMM.getDimensionMM());
            //来源指标
            String referIndexName = referIndexName(indexMM.getResourceIndex());
            //指标表
            String referResultTable = referResultTable(indexMM.getResourceTable());
            //应用系统
            String referApplicationName = referApplicationName(indexMM.getApplicationName());
            List data = Arrays.asList(indexModelId, model.getDefinition(), "", indexMM.getIndexName(), "", indexMM.getIndexName(), indexMM.getBusinessDomain(),
                    indexMM.getThemeDomain(), indexMM.getLimitedConditions(), indexMM.getIndexCode(), indexMM.getIndexType(),indexMM.getMeasure(), indexMM.getIndexUnit(),
                    indexMM.getCycleTime(), indexMM.getIndexLogic(), indexMM.getIndexLevel(), indexMM.getSecurityLevel(), indexMM.getSourceDepartment(),
                    indexMM.getTechnicaler(), indexMM.getIndexMeaning(), indexMM.getIndexName(), referResultTable, referIndexName, referDimension, referApplicationName);
            sheetData2.addData(data);
        }
        List<SheetData> sheetDatas = new ArrayList<>();
        sheetDatas.add(sheetData1);
        sheetDatas.add(sheetData2);
        Sheets sheets = new Sheets();
        sheets.setSheets(sheetDatas);

        String JsonData = mapper.writeValueAsString(sheets);

        ModelX jsonDataModelXC = metaModelDataService.loadDataModelXFromJson(indexModelId, JsonData);
        metaModelDataService.saveWithCompare(indexModelId, jsonDataModelXC, true);

        return ResResultDto.ok();
    }

    /**
     * 组装引用的维度
     * @param dimensionMM
     * @return
     */
    private String referDimension(String dimensionMM) {
        String name = "";
        if (!Strings.isNullOrEmpty(dimensionMM)) {
            String[] dimensionMMArray = dimensionMM.split(",");
            for (String item : dimensionMMArray) {
                name += dimensionCollectName+"."+item+",";
            }
            if (!Strings.isNullOrEmpty(name)) {
                name = name.substring(0, name.length()-1);
            }
        }
        return name;
    }

    /**
     * 组装引用的来源指标
     * @param indexNameMM
     * @return
     */
    private String referIndexName(String indexNameMM) {
        String indexName = "";
        if (!Strings.isNullOrEmpty(indexNameMM)) {
            String[] indexNameMMArray = indexNameMM.split(",");
            for (String item : indexNameMMArray) {
                indexName += indexCollectName+"."+ item+"," ;
            }
            if (!Strings.isNullOrEmpty(indexName)) {
                indexName = indexName.substring(0, indexName.length()-1);
            }
        }
        return indexName;
    }

    /**
     * 组装来源的指标表
     * @param resultTableMM
     * @return
     */
    private String referResultTable(String resultTableMM) {
        String resultTableName = "";
        if (!Strings.isNullOrEmpty(resultTableMM)) {
            String[] resultTableArray = resultTableMM.split(",");
            for (String item : resultTableArray) {
                resultTableName += bytehouseDatasource+"."+item+",";
            }
            if (!Strings.isNullOrEmpty(resultTableName)) {
                resultTableName = resultTableName.substring(0, resultTableName.length()-1);
            }
        }
        return resultTableName;
    }

    /**
     * 组装来源系统
     * @param applicationNameMM
     * @return
     */
    private String referApplicationName(String applicationNameMM) {
        String applicationName = "";
        if (!Strings.isNullOrEmpty(applicationNameMM)) {
            String[] applicationNameArray = applicationNameMM.split(",");
            for (String item : applicationNameArray) {
                applicationName += systemCollectName+"."+item+",";
            }
            if (!Strings.isNullOrEmpty(applicationName)) {
                applicationName = applicationName.substring(0, applicationName.length()-1);
            }
        }
        return applicationName;
    }


    public static void main(String[] args) {
        String dimensionMM = "aatestdd,bbb";
        String name = "";
        if (!Strings.isNullOrEmpty(dimensionMM)) {
            String[] dimensionMMArray = dimensionMM.split(",");
            for (String item : dimensionMMArray) {
                name += "123"+"."+item+",";
            }
            if (!Strings.isNullOrEmpty(name)) {
                name = name.substring(0, name.length()-1);
            }
        }
        System.out.println("name = " + name);
    }
}
