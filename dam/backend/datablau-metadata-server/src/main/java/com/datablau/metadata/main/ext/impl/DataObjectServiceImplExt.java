package com.datablau.metadata.main.ext.impl;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ObjectX;
import com.andorj.enhance.sql.data.Pair;
import com.andorj.model.common.search.QueryParameterCriteria;
import com.andorj.model.common.utility.MultiConditionQueryUtils;
import com.datablau.metadata.common.dto.metadata.DataObjectDto;
import com.datablau.metadata.main.entity.metadata.DataObject;
import com.datablau.metadata.main.service.metadata.impl.DataObjectServiceImpl;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;
import org.apache.commons.lang.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.w3c.dom.Node;

import java.util.*;

/**
 * @program: datablau-projects
 * @description:
 * @author: wang tong
 *
 * @create: 2024-05-18 19:54
 **/
@Service("dataObjectServiceExt")
public class DataObjectServiceImplExt extends DataObjectServiceImpl {

    private static final Logger LOGGER = LoggerFactory.getLogger(DataObjectServiceImplExt.class);

    @Override
    public DataObject saveDataObject(DataObject dataObject, Long modelCategoryId) {
        // do sth
        return super.saveDataObject(dataObject, modelCategoryId);
    }

    @Override
    public List<DataObjectDto> getDataObject(QueryParameterCriteria criteria) {
        List<String> queryColumns = Lists.newArrayList(new String[]{"id", "physicalName", "schema", "parentPhysicalName", "typeId", "logicalName", "domainId", "domainCode", "objectId", "modelId", "modelName", "modelCategoryId", "parentId", "ordinal", "measurementId", "definition", "categoryId", "tableId", "parentLogicalName", "owner", "creationTime", "content"});
        MultiConditionQueryUtils.MultiConditionQuery<DataObject> query = this.queryUtils.createQuery(DataObject.class, queryColumns);
        boolean pageQuery = this.datasourceQueryHelper.buildCriteria(criteria, query);
        query.andIsNull("endVersion");
        List objectList;
        if (pageQuery) {
            objectList = query.page().getContent();
        } else {
            objectList = query.list();
        }

        List<DataObjectDto> result = new ArrayList();
        Iterator var7 = objectList.iterator();

        while(var7.hasNext()) {
            DataObject object = (DataObject)var7.next();
            DataObjectDto dto = convertToObjectDtoAndProperties(object);
            result.add(dto);
        }

        this.setDomainToDataObject(result);
        return result;
    }

    public static DataObjectDto convertToObjectDtoAndProperties(DataObject object) {
        if (object == null) {
            return null;
        } else {
            DataObjectDto dto = object.toDto();
//            Node node = null;
//
//            try {
//                node = object.getObjectNode();
//            } catch (Exception var8) {
//                throw new RuntimeException(var8);
//            }
//
//            ObjectX ox = new ObjectX();
//            ox.deserialize(node);
            ObjectX ox = object.getObjectX();
            Map<String, Object> properties = new HashMap();
            Iterator var5 = ox.getProperties().entrySet().iterator();

            while(var5.hasNext()) {
                Map.Entry<Long, Object> entry = (Map.Entry)var5.next();
                LDMTypes.LDMTypeObject property = LDMTypes.getLDMTypeObject((Long)entry.getKey());
                if (property != null && 80500009L != property.getId()) {
                    properties.put(property.getName(), entry.getValue());
                }
            }

            dto.setProperties(properties);
            return dto;
        }
    }

    @Override
    public Map<Long, List<Pair<Long, String>>> getTablesPrimaryKeys(Collection<Long> tableObjectIds) {
        Map<Long, List<Pair<Long, String>>> tableMap = new HashMap();
        Set<Long> allColumnId = new HashSet();
        Iterator var4 = this.getDataObjectsByIds(tableObjectIds).iterator();

        label122:
        while(true) {
            DataObject table;
            do {
                if (!var4.hasNext()) {
                    Map<Long, String> mapping = new HashMap();
                    Iterator var25 = Lists.partition(new ArrayList(allColumnId), 999).iterator();

                    Iterator var28;
                    while(var25.hasNext()) {
                        List<Long> partition = (List)var25.next();
                        var28 = this.dataObjectRepo.findObjectIdAndName(partition).iterator();

                        while(var28.hasNext()) {
                            Object[] entry = (Object[])var28.next();
                            mapping.put((Long)entry[0], (String)entry[1]);
                            allColumnId.remove((Long)entry[0]);
                        }
                    }

                    if (!allColumnId.isEmpty()) {
                        throw new InvalidArgumentException(this.msgService.getMessage("objectNotFoundById"));
                    }

                    var25 = tableMap.entrySet().iterator();

                    while(var25.hasNext()) {
                        Map.Entry<Long, List<Pair<Long, String>>> entry = (Map.Entry)var25.next();
                        var28 = ((List)entry.getValue()).iterator();

                        while(var28.hasNext()) {
                            Pair<Long, String> pair = (Pair)var28.next();
                            String name = (String)mapping.get(pair.getFirst());
                            pair.setSecond(name);
                        }
                    }

                    return tableMap;
                }

                table = (DataObject)var4.next();
            } while(ObjectUtils.notEqual(table.getTypeId(), 80000004L) && ObjectUtils.notEqual(table.getTypeId(), 80500008L));

            try {
//                Node tableNode = table.getObjectNode();
//                ObjectX ox = new ObjectX();
//                ox.deserialize(tableNode);
                ObjectX ox = table.getObjectX();
                ObjectMapper mapper = new ObjectMapper();
                Collection<ObjectX> keyGroups = ox.getTypedChildren(80000093L);
                Iterator var10;
                if (CollectionUtils.isEmpty(keyGroups)) {
                    var10 = this.getAllSubObjectsWithoutPermissionCheck(table.getId(), 80000093L).iterator();

                    while(var10.hasNext()) {
                        DataObject keyGroup = (DataObject)var10.next();
                        ox.addObject(keyGroup.getObjectX());
                    }
                }

                var10 = ox.getTypedChildren(80000093L).iterator();

                while(true) {
                    String keyGroupRefs;
                    ObjectX obj;
                    do {
                        if (!var10.hasNext()) {
                            continue label122;
                        }

                        obj = (ObjectX)var10.next();
                        keyGroupRefs = (String)obj.getProperty(80000096L);
                    } while(keyGroupRefs == null);

                    if (!tableMap.containsKey(table.getObjectId())) {
                        tableMap.put(table.getObjectId(), new ArrayList());
                    }

                    try {
                        Map<String, Map<String, Object>> groups = (Map)mapper.readValue(keyGroupRefs, Map.class);
                        Iterator var33 = groups.values().iterator();

                        while(var33.hasNext()) {
                            Map<String, Object> content = (Map)var33.next();
                            String keyGroupType = (String)obj.getProperty(80000097L);
                            if ("PrimaryKey".equals(keyGroupType)) {
                                Long id = (long)(Integer)content.get("Id");
                                ((List)tableMap.get(table.getObjectId())).add(Pair.of(id, (Object)null));
                                allColumnId.add(id);
                            }
                        }
                    } catch (JsonProcessingException var22) {
                        List<DataObject> colums = this.dataObjectRepo.findAllColumnsByTableObjectId(table.getTableId());
                        String[] columnNames = keyGroupRefs.split(";");
                        String[] var16 = columnNames;
                        int var17 = columnNames.length;

                        for(int var18 = 0; var18 < var17; ++var18) {
                            String columnName = var16[var18];
                            Iterator var20 = colums.iterator();

                            while(var20.hasNext()) {
                                DataObject dataObject = (DataObject)var20.next();
                                if (dataObject.getPhysicalName().equalsIgnoreCase(columnName)) {
                                    allColumnId.add(dataObject.getObjectId());
                                    break;
                                }
                            }
                        }
                    }
                }
            } catch (Exception var23) {
                throw new UnexpectedStateException("open object:\"" + table.getPhysicalName() + "\" falied:" + var23.getMessage(), var23);
            }
        }
    }
}
