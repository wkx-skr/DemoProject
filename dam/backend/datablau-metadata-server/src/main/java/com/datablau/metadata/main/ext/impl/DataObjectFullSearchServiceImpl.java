package com.datablau.metadata.main.ext.impl;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ObjectX;
import com.andorj.common.data.PageResult;
import com.datablau.base.api.ModelCategoryService;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.data.common.udp.MetadataUdpEntry;
import com.datablau.domain.management.dto.DomainDto;
import com.datablau.metadata.common.dto.metamodel.MetaModelDetailDto;
import com.datablau.metadata.common.dto.metamodel.ObjectValueDto;
import com.datablau.metadata.main.dao.DataObjectFullRepository;
import com.datablau.metadata.main.dto.FullSearchDto;
import com.datablau.metadata.main.dto.model.KeyDto;
import com.datablau.metadata.main.dto.objsearch.BaseSearchDto;
import com.datablau.metadata.main.dto.objsearch.FullSearchResultDto;
//import com.datablau.metadata.main.dto.FullSimpleDataObjectEntity;
import com.datablau.metadata.main.dto.objsearch.ReportMmSearchResultDto;
import com.datablau.metadata.main.entity.metadata.DataObject;
import com.datablau.metadata.main.ext.DataObjectFullSearchService;
import com.datablau.metadata.main.service.metadata.api.DataObjectService;
import com.datablau.metadata.main.service.metadata.dto.ColumnDto;
import com.datablau.metadata.main.service.metamodel.MetaModelService;
import com.datablau.project.api.RemoteDataAssetExtendService;
import com.datablau.project.dto.CatalogResDto;
import com.datablau.udp.service.api.MetadataUserDefinedPropertyService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang.ObjectUtils;
import org.elasticsearch.common.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;

import javax.annotation.Resource;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Query;
import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * @author: hxs
 * @date: 2025/4/12 14:04
 */
@Service
public class DataObjectFullSearchServiceImpl implements DataObjectFullSearchService {
    private static final Logger logger = LoggerFactory.getLogger(DataObjectFullSearchServiceImpl.class);

    @Autowired
    EntityManagerFactory entityManagerFactory;
    @Autowired
    DataObjectFullRepository dataObjectFullRepository;
    @Autowired
    RemoteDataAssetExtendService remoteDataAssetExtendService;
    @Autowired
    MetaModelService metaModelService;
    @Autowired
    MetadataUserDefinedPropertyService propertyService;
    @Autowired
    DataObjectService dataObjectService;
    @Autowired
    ModelCategoryService modelCategoryService;

    @Override
    public PageResult<? extends BaseSearchDto> fullSearch(FullSearchDto searchDto) throws Exception {
        if((searchDto.getTypeId() == LDMTypes.oAttribute) || (searchDto.getTypeId() == LDMTypes.oEntity)){
            Page<DataObject> searchedResultData = this.getMetadataQueryResult(searchDto);
            List<FullSearchResultDto> searchResults = this.createSearchResult(searchedResultData.getContent());
            PageResult<FullSearchResultDto> result = new PageResult();
            result.setPageSize(searchDto.getPageSize());
            result.setCurrentPage(searchDto.getCurrentPage());
            result.setTotalItems(searchedResultData.getTotalElements());
            result.setContentDirectly(searchResults);
            return result;
        }else {
            Page<DataObject> searchedResultData = this.getMetadataQueryResult(searchDto);
            List<ReportMmSearchResultDto> mmSearchResult = this.createMMSearchResult(searchedResultData.getContent());
            PageResult<ReportMmSearchResultDto> result = new PageResult();
            result.setPageSize(searchDto.getPageSize());
            result.setCurrentPage(searchDto.getCurrentPage());
            result.setTotalItems(searchedResultData.getTotalElements());
            result.setContentDirectly(mmSearchResult);
            return result;
        }
    }

    private List<ReportMmSearchResultDto> createMMSearchResult(List<DataObject> objects) throws Exception {
        ArrayList<ReportMmSearchResultDto> res = new ArrayList<>();
        for (DataObject dataObject : objects) {
            ReportMmSearchResultDto reportMmDto = new ReportMmSearchResultDto();
            reportMmDto.setObjectId(dataObject.getObjectId());
            reportMmDto.setParentId(dataObject.getParentId());
            reportMmDto.setDefinition(dataObject.getDefinition());
            reportMmDto.setPhysicalName(dataObject.getPhysicalName());
            reportMmDto.setTypeId(dataObject.getTypeId());
            reportMmDto.setStartVersion(dataObject.getStartVersion());
            reportMmDto.setCreateTime(dataObject.getCreationTime());

            MetaModelDetailDto mmDto = metaModelService.getMetaModelDetailByDataObjectId(dataObject.getObjectId());
            List<ObjectValueDto> propertie = mmDto.getProperties().get("默认分组");
            Map<Long, Object> propertiesM0 = mmDto.getPropertiesM0();

            LinkedHashMap<String, String> prop = new LinkedHashMap<>();
            for (ObjectValueDto valueDto : propertie) {
                Object o = propertiesM0.get(valueDto.getCode());
                if(o != null){
                    prop.put(valueDto.getValue(), String.valueOf(o));
                }else {
                    prop.put(valueDto.getValue(), null);
                }
            }
            reportMmDto.setProp(prop);
            res.add(reportMmDto);
        }
        return res;
    }

//    private String getValue(ObjectValueDto valueDto, Map<Long, Object> propertiesM0, String value){
//        if(valueDto.getValue().equals(value)){
//            Object o = propertiesM0.get(valueDto.getCode());
//            if(o != null){
//                return String.valueOf(o);
//            }
//        }
//        return "";
//    }

    private List<FullSearchResultDto> createSearchResult(List<DataObject> objects) throws Exception {
        ArrayList<FullSearchResultDto> res = new ArrayList<>();
        if (objects.isEmpty()) {
            return res;
        }
        List<String> objectIds = objects.stream().map(o -> o.getObjectId().toString()).collect(Collectors.toList());
        List<ModelCategoryDto> modelCategories = modelCategoryService.getModelCategoriesSimple();
        Map<Long, ModelCategoryDto> categoryDtoMap = modelCategories.stream().collect(Collectors.toMap(ModelCategoryDto::getCategoryId, a -> a));
        //远程调用数据资产目录信息
        HashMap<Long, CatalogResDto> catalogInfos = remoteDataAssetExtendService.getCatalogInfoByObjId(objectIds);
        for (DataObject obj : objects) {
            FullSearchResultDto resultDto = new FullSearchResultDto();
            resultDto.setObjectId(obj.getObjectId());
            resultDto.setTypeId(obj.getTypeId());
            resultDto.setName(obj.getPhysicalName());
            resultDto.setChineseName(obj.getLogicalName());
            resultDto.setCategoryId(obj.getModelCategoryId());
//            resultDto.setDefinition(obj.getDefinition());
            resultDto.setTableOwner(obj.getOwner());
            resultDto.setCreationDate(obj.getCreationTime());
            resultDto.setStartVersion(obj.getStartVersion());
            ModelCategoryDto categoryDto = categoryDtoMap.get(obj.getModelCategoryId());
            resultDto.setCategoryName(categoryDto.getCategoryName());
            //只有字段才会有的属性，表时为null
            if(obj.getTypeId() == LDMTypes.oAttribute){
                resultDto.setParentId(obj.getParentId());
                this.doHandleColumnObject(obj, resultDto);
            }
            //只有表才会有的字段，其他情况不会有
            if(obj.getTypeId() == LDMTypes.oEntity){
                List<DataObject> columns = dataObjectFullRepository.findColumnsByModelIdAndTableId(obj.getModelId(), obj.getTableId());
                List<Long> columnIds = columns.stream().map(DataObject::getObjectId).toList();
                resultDto.setColumnIds(columnIds);
            }

            //处理资产目录
            CatalogResDto catalogResDto = catalogInfos.get(obj.getObjectId());
            if (catalogResDto != null){
                resultDto.setL1Name(catalogResDto.getL1Name());
                resultDto.setL2Name(catalogResDto.getL2Name());
                resultDto.setL3Name(catalogResDto.getL3Name());
                resultDto.setL4Name(catalogResDto.getL4Name());
                resultDto.setDataMaster(catalogResDto.getDataMaster());
                resultDto.setDataSteward(catalogResDto.getDataSteward());
            }

            // 扩展属性
            List<MetadataUdpEntry> udpEntries = propertyService.getObjectUdps(obj.getObjectId(), obj.getTypeId());
            if(!CollectionUtils.isEmpty(udpEntries)){
                System.out.println();
                Map<String, MetadataUdpEntry> udpMap = udpEntries.stream().collect(Collectors.toMap(MetadataUdpEntry::getName, a -> a));
                MetadataUdpEntry securityLevel = udpMap.get("安全级别");
                if(securityLevel != null){
                    String value = securityLevel.getValue();
                    if(!"#N/A".equals(value)){
                        resultDto.setSecurityLevel(securityLevel.getValue());
                    }
                }

                //当资产目录侧没有数据时取扩展属性
                if(Strings.isEmpty(resultDto.getL1Name())){
                    MetadataUdpEntry l1Name = udpMap.get("业务域");
                    if(l1Name != null){
                        String value = l1Name.getValue();
                        if(!"#N/A".equals(value)){
                            resultDto.setL1Name(l1Name.getValue());
                        }
                    }
                }

                //definition取扩展属性里业务描述
                MetadataUdpEntry definition = udpMap.get("业务描述");
                if(definition != null){
                    String value = definition.getValue();
                    if(!"#N/A".equals(value)){
                        resultDto.setDefinition(value);
                    }
                }
            }

            res.add(resultDto);
        }
        return res;
    }

    private void doHandleColumnObject(DataObject obj, FullSearchResultDto resultDto) throws Exception{
        Node columnNode = obj.getObjectNode();
        ObjectX columnObjectX = new ObjectX();
        columnObjectX.deserialize(columnNode);

        //字段类型
        Object dataTypeo = columnObjectX.getProperty(LDMTypes.pDataType);
        if (dataTypeo != null) {
            String dataType = dataTypeo.toString();
            resultDto.setDataType(dataType);

            ColumnTypeInfo columnTypeInfo = this.parseDataType(dataType);
            //字段长度
            resultDto.setFieldLength(String.valueOf(columnTypeInfo.getLength()));
            //字段精度
            resultDto.setScale(String.valueOf(columnTypeInfo.getScale()));
        }

        //是否是null
        Object isNotNull = columnObjectX.getProperty(LDMTypes.pIsNotNull);
        if (isNotNull != null && Boolean.parseBoolean(isNotNull.toString())) {
            resultDto.setIsNull("是");
        } else {
            resultDto.setIsNull("否");
        }
        Set<KeyDto> keys = this.getKeys(obj);
        for (KeyDto key : keys) {
            //是否主键
            if("PrimaryKey".equals(key.getType())){
                resultDto.setPk("PK");
            }
            //是否外键
            if("ForeignKey".equals(key.getType())){
                resultDto.setFk("FK");
            }
        }

    }

    private Set<KeyDto> getKeys(DataObject dataObject) throws Exception {
        Iterable<DataObject> children = dataObjectService.getDataObjectAndChildren(dataObject.getObjectId());
        Node node = null;
        List<DataObject> colObjs = new ArrayList<>();
        List<ObjectX> keyGroupObjs = new ArrayList<>();
        Map<Long, ColumnDto> columnMap = new HashMap<>();
        for (DataObject object : children) {
            if (ObjectUtils.equals(object.getObjectId(), dataObject.getObjectId())) {
                node = object.getObjectNode();
                continue;
            }
            if (ObjectUtils.equals(object.getTypeId(), LDMTypes.oAttribute)) {
                colObjs.add(object);
            }
            if (ObjectUtils.equals(object.getTypeId(), LDMTypes.oKeyGroup)) {
                keyGroupObjs.add(object.getObjectX());
            }
        }

        for (DataObject columnObj : colObjs) {
            ColumnDto column = new ColumnDto(columnObj);
            columnMap.put(column.getObjectId(), column);
        }

        ObjectX ox = new ObjectX();
        ox.deserialize(node);
        ObjectMapper mapper = new ObjectMapper();
        if (CollectionUtils.isEmpty(keyGroupObjs)) {
            keyGroupObjs = ox.getTypedChildren(LDMTypes.oKeyGroup);
        }

        Set<KeyDto> keys = new HashSet();

        for (ObjectX obj : keyGroupObjs) {
            String keyGroupRefs = (String) obj.getProperty(LDMTypes.pKeyGroupMemberRefs);
            if (keyGroupRefs == null) {
                continue;
            }
            try {
                Map<String, Map<String, Object>> groups = mapper.readValue(keyGroupRefs, Map.class);
                for (Map<String, Object> content : groups.values()) {
                    Integer id = (Integer) content.get("Id");
                    if(id.longValue() == dataObject.getObjectId()){
                        KeyDto key = new KeyDto();
                        key.setName(obj.getName());
                        key.setType((String) obj.getProperty(LDMTypes.pKeyGroupType));
                        keys.add(key);
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
                            keys.add(key);
                        }
                    }
                }
            }
        }
        return keys;
    }

    public Page<DataObject> getMetadataQueryResult(FullSearchDto searchDto) {
        //通过工厂创建实体类管理器
        EntityManager em = entityManagerFactory.createEntityManager();
        em.getTransaction().begin();

//        String baseSql = "SELECT new com.datablau.metadata.main.dto.FullSimpleDataObjectEntity("
//                + " o.creationTime, o.physicalName, o.logicalName, o.id, o.objectId, o.parentId, o.typeId, o.tableId, " +
//                "o.modelName, o.modelCategoryId, o.schema, o.logicalElement, o.definition, o.owner, o.modelId) "
//                + " FROM DataObject "
//                + " o INNER JOIN Model m ON o.modelId = m.modelId ";
        String baseSql = "SELECT o FROM DataObject o INNER JOIN Model m ON o.modelId = m.modelId";

        String countSql = "SELECT count(*) FROM DataObject o INNER JOIN Model m ON o.modelId = m.modelId ";
        String whereSql = " WHERE  (m.notLoaded = false OR m.notLoaded IS NULL) AND o.endVersion IS NULL ";

        List<Object> param = new ArrayList<>();
        int idx = 1;
        //objectIDs
        if(!CollectionUtils.isEmpty(searchDto.getObjectIds())){
            whereSql += " AND o.objectId in ( ?" + idx++ + ") ";
            param.add(searchDto.getObjectIds());
        }else {
            //typeIds
            if (searchDto.getTypeId() != null) {
                whereSql += " AND o.typeId in ?" + idx++;
                param.add(searchDto.getTypeId());
            }

            //modelId
            if(searchDto.getModelId() != null){
                whereSql += " AND o.modelId = ?" + idx++;
                param.add(searchDto.getModelId());
            }
        }


        String orderSql = " order by o.id ";
        //创建Query查询对象，执行sql
        Query q = em.createQuery(baseSql + whereSql + orderSql);
        //param里的值进行传参
        for (int i = 0; i < param.size(); i++) {
            q.setParameter(i + 1, param.get(i));
        }
        //设置查询起始下标
        q.setFirstResult((searchDto.getCurrentPage() - 1) * searchDto.getPageSize());
        q.setMaxResults(searchDto.getPageSize());

        //发送sql，返回结果集
        List<DataObject> content;
        try {
            content = q.getResultList();
        } catch (Exception ex) {
            logger.error("failed to run sql:" + baseSql + whereSql);
            throw new UnexpectedStateException("unable to get job result", ex);
        }

        q = em.createQuery(countSql + whereSql);
        for (int i = 0; i < param.size(); i++) {
            q.setParameter(i + 1, param.get(i));
        }
        Long totalCnt;
        try {
            totalCnt = (Long) q.getSingleResult();
        } catch (Exception ex) {
            logger.error("failed to run count sql:" + countSql + whereSql);
            throw new UnexpectedStateException("unable to get job count result", ex);
        }
        em.getTransaction().commit();
        em.close();

        Pageable page = PageRequest.of(searchDto.getCurrentPage() - 1, searchDto.getPageSize());
        return new PageImpl<>(content, page, totalCnt);
    }

    public ColumnTypeInfo parseDataType(String dataType) {
        if (dataType == null || dataType.trim().isEmpty()) {
            return new ColumnTypeInfo("", null, null);
        }

        String normalizedType = dataType.trim().toUpperCase();

        // 1. 尝试匹配标准格式：类型(长度) 或 类型(长度,精度)
//        Matcher matcher = Pattern.compile("^([A-Z]+)\\s*\\(\\s*(\\d+)(?:\\s*,\\s*(\\d+)\\s*)?\\)$").matcher(normalizedType);
        Matcher matcher = Pattern.compile("^([a-zA-Z]+\\d*)\\(?(\\d*)(?:,(\\d*))?\\)?$").matcher(normalizedType);
        if (matcher.find()) {
            return new ColumnTypeInfo(
                    matcher.group(1),
                    parseInt(matcher.group(2)),
                    matcher.group(3) != null ? parseInt(matcher.group(3)) : null
            );
        }

        // 2. 尝试匹配数字后缀格式：类型+数字（如INT16）
        matcher = Pattern.compile("^([A-Z]+)(\\d+)$").matcher(normalizedType);
        if (matcher.find()) {
            return new ColumnTypeInfo(matcher.group(1), parseInt(matcher.group(2)), null);
        }

        // 3. 简单类型（无长度和精度）
        return new ColumnTypeInfo(normalizedType, null, null);
    }

    private static Integer parseInt(String value) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public static class ColumnTypeInfo {
        private final String baseType;
        private final Integer length;
        private final Integer scale;

        public ColumnTypeInfo(String baseType, Integer length, Integer scale) {
            this.baseType = baseType;
            this.length = length;
            this.scale = scale;
        }

        public String getBaseType() { return baseType; }
        public Integer getLength() { return length; }
        public Integer getScale() { return scale; }
    }
}
