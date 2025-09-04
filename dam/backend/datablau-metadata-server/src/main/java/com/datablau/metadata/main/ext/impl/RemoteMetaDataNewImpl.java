package com.datablau.metadata.main.ext.impl;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ObjectX;
import com.andorj.common.data.PageResult;
import com.datablau.base.api.ModelCategoryService;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.base.data.TagDto;
import com.datablau.domain.management.dto.StandardCodeDto;
import com.datablau.metadata.main.dao.DataObjectRepositoryExt;
import com.datablau.metadata.common.dto.model.ModelDto;
import com.datablau.metadata.main.dao.model.ModelRepository;
import com.datablau.metadata.main.dto.metadata.BaseDataObject;
import com.datablau.metadata.main.entity.model.Model;
import com.datablau.metadata.main.service.metadata.api.DataObjectService;
import com.datablau.metadata.main.service.model.api.DataModelService;
import com.datablau.metadata.main.util.RemoteServiceGetter;
import com.datablau.project.api.dto.DataObjectQueryParamDto;
import com.datablau.project.api.dto.DdmModelElementDto;
import com.datablau.security.management.utils.AuthTools;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;

import com.datablau.metadata.common.dto.metadata.DataObjectDto;
import com.datablau.metadata.main.dao.DataObjectFullRepository;
import com.datablau.metadata.main.entity.metadata.DataObject;
import com.datablau.project.api.RemoteMetaDataExtendService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.w3c.dom.Node;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Query;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class RemoteMetaDataNewImpl implements RemoteMetaDataExtendService {

    private static final Logger logger = LoggerFactory.getLogger(RemoteMetaDataNewImpl.class);


    @Autowired
    private DataObjectFullRepository dataObjectFullRepository;
    @Autowired
    private ModelRepository modelRepository;
    @Autowired
    protected EntityManagerFactory entityManagerFactory;

    @Autowired
    private DataObjectRepositoryExt dataObjectRepositoryExt;

    @Autowired
    private DataObjectService dataObjectService;

    @Autowired
    private DataModelService dataModelService;

    @Autowired
    private ModelCategoryService modelCategoryService;

    /*@Override
    public List<DdmModelElementDto> queryDdmModelElementDetail(Long modelId) {

        List<DdmModelElementDto> modelElementDtos = org.apache.commons.compress.utils.Lists.newArrayList();
        Model model = dataModelService.getDataModelById(modelId);
        ModelCategoryDto modelCategory = modelCategoryService.getModelCategory(model.getCategoryId());
        List<DataObject> allTablesByModelId = dataObjectService.getAllTablesByModelId(modelId);
        Map<Long, DataObject> tableMap = allTablesByModelId.stream().collect(Collectors.toMap(DataObject::getObjectId, x -> x, (x1, x2) -> x1));
        List<DataObject> columns = dataObjectRepositoryExt.findAllShallowColumnsOfModelId(modelId);
        for (DataObject column : columns) {
            ObjectX objectX = column.getObjectX();
            Object pIsNotNull = objectX.getProperty(LDMTypes.pIsNotNull);//是否为空
            Object pDataScale = objectX.getProperty(LDMTypes.pDataScale);//数据长度
            Object pDataPrecision = objectX.getProperty(LDMTypes.pDataPrecision);//数据精度
            Object pDefaultValue = objectX.getProperty(LDMTypes.pDefaultValue);//默认值
            Object pDataType = objectX.getProperty(LDMTypes.pDataType);//数据类型
            DdmModelElementDto ddmModelElementDto = new DdmModelElementDto();
            ddmModelElementDto.setCategoryPath(modelCategory.getCategoryName()+"/"+model.getDefinition());
            if (pDataType != null) {
                ddmModelElementDto.setpDataType(pDataType.toString());
            }

            if (pDataPrecision != null) {
                Double dp = Double.parseDouble(pDataPrecision.toString());
                ddmModelElementDto.setpDataPrecision(dp.intValue());
            }

            if (pDataScale != null) {
                ddmModelElementDto.setpDataScale(Integer.parseInt(pDataScale.toString()));
            }

            if (pIsNotNull != null) {
                ddmModelElementDto.setpIsNotNull(Boolean.valueOf(pIsNotNull.toString()));
            } else {
                ddmModelElementDto.setpIsNotNull(false);
            }
            if (pDefaultValue != null){
                ddmModelElementDto.setpDefaultValue(pDefaultValue.toString());
            }
            modelElementDtos.add(convertToModelElementDtoForColumn(column,model,ddmModelElementDto,tableMap));

        }

        return modelElementDtos;
    }*/
    @Override
    public List<DdmModelElementDto> queryDdmModelElementDetail(Long modelId) {

        List<DdmModelElementDto> modelElementDtos = org.apache.commons.compress.utils.Lists.newArrayList();
        Model model = dataModelService.getDataModelById(modelId);
        ModelCategoryDto modelCategory = modelCategoryService.getModelCategory(model.getCategoryId());
        List<DataObject> allTablesByModelId = dataObjectService.getAllTablesByModelId(modelId);
        Map<Long, DataObject> tableMap = allTablesByModelId.stream().collect(Collectors.toMap(DataObject::getObjectId, x -> x, (x1, x2) -> x1));
        List<DataObject> columns = dataObjectRepositoryExt.findAllShallowColumnsOfModelId(modelId);
        for (DataObject column : columns) {
            ObjectX objectX = column.getObjectX();
            Object pIsNotNull = objectX.getProperty(LDMTypes.pIsNotNull);//是否为空
            Object pDataScale = objectX.getProperty(LDMTypes.pDataScale);//数据长度
            Object pDataPrecision = objectX.getProperty(LDMTypes.pDataPrecision);//数据精度
            Object pDefaultValue = objectX.getProperty(LDMTypes.pDefaultValue);//默认值
            Object pDataType = objectX.getProperty(LDMTypes.pDataType);//数据类型
            DdmModelElementDto ddmModelElementDto = new DdmModelElementDto();
            ddmModelElementDto.setCategoryPath(modelCategory.getCategoryName()+"/"+model.getDefinition());
            // 处理数据类型：解析类型名、长度、精度
            if (pDataType != null) {
                String dataTypeStr = pDataType.toString();

                // 正则表达式匹配 "类型(长度,精度)" 格式
                java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("^(.*?)\\((\\d+)(?:,(\\d+))?\\)$");
                java.util.regex.Matcher matcher = pattern.matcher(dataTypeStr);

                if (matcher.find()) {
                    // 提取类型名（第一组）
                    String typeName = matcher.group(1).trim();
                    ddmModelElementDto.setpDataType(typeName);

                    // 提取长度（第二组）
                    if (matcher.group(2) != null) {
                        try {
                            int length = Integer.parseInt(matcher.group(2));
                            ddmModelElementDto.setpDataScale(length);
                        } catch (NumberFormatException e) {
                            // 转换失败时保留原始值（或记录日志）
                        }
                    }

                    // 提取精度（第三组，可选）
                    if (matcher.group(3) != null) {
                        try {
                            int precision = Integer.parseInt(matcher.group(3));
                            ddmModelElementDto.setpDataPrecision(precision);
                        } catch (NumberFormatException e) {
                            // 转换失败时保留原始值（或记录日志）
                        }
                    }
                } else {
                    // 无括号格式：直接使用整个字符串作为类型名
                    ddmModelElementDto.setpDataType(dataTypeStr);
                }
            }

            // 处理精度（如果未从pDataType解析出精度，则使用原始pDataPrecision）
            if (0 == ddmModelElementDto.getpDataPrecision() && pDataPrecision != null) {
                try {
                    Double dp = Double.parseDouble(pDataPrecision.toString());
                    ddmModelElementDto.setpDataPrecision(dp.intValue());
                } catch (NumberFormatException e) {
                    // 转换失败处理
                }
            }

            // 处理长度（如果未从pDataType解析出长度，则使用原始pDataScale）
            if (0 == ddmModelElementDto.getpDataScale()  && pDataScale != null) {
                try {
                    ddmModelElementDto.setpDataScale(Integer.parseInt(pDataScale.toString()));
                } catch (NumberFormatException e) {
                    // 转换失败处理
                }
            }

            // 处理非空约束
            if (pIsNotNull != null) {
                ddmModelElementDto.setpIsNotNull(Boolean.valueOf(pIsNotNull.toString()));
            } else {
                ddmModelElementDto.setpIsNotNull(false);
            }

            // 处理默认值
            if (pDefaultValue != null) {
                ddmModelElementDto.setpDefaultValue(pDefaultValue.toString());
            }

            modelElementDtos.add(convertToModelElementDtoForColumn(column, model, ddmModelElementDto, tableMap));
        }

        return modelElementDtos;
    }

    private DdmModelElementDto convertToModelElementDtoForColumn(DataObject column, Model model, DdmModelElementDto ddmModelElementDto, Map<Long, DataObject> tableMap) {

        DataObject tableElement = tableMap.get(column.getParentId());
        ddmModelElementDto.setDdmModelId(model.getModelId());
        ddmModelElementDto.setDdmModelName(model.getDefinition());
        ddmModelElementDto.setParentId(column.getParentId());
        if (tableElement != null) {
            ddmModelElementDto.setTableId(column.getParentId());
            ddmModelElementDto.setTableName(tableElement.getPhysicalName());
            ddmModelElementDto.setTableCnName(tableElement.getAlias());
        }
        ddmModelElementDto.setColumnId(column.getObjectId());
        ddmModelElementDto.setColumnName(column.getPhysicalName());
        ddmModelElementDto.setColumnCnName(column.getAlias());
        ddmModelElementDto.setTypeId(LDMTypes.oAttribute);
        ddmModelElementDto.setPk(false);
        return ddmModelElementDto;
    }


    @Override
    public List<DataObjectDto> findDataObjectDtos(Long modelId, List<Long> typeIds) {
        List<DataObjectDto> dataObjectDtos = Lists.newArrayList();
        List<DataObject> dataObjects = dataObjectFullRepository.findTypeByModelId(modelId, typeIds);
        for (DataObject dataObject : dataObjects) {
            DataObjectDto dataObjectDto = new DataObjectDto();
            BeanUtils.copyProperties(dataObject, dataObjectDto);
            dataObjectDtos.add(dataObjectDto);
        }
        return dataObjectDtos;
    }

    @Override
    public PageResult<DataObjectDto> queryDataObjectDtoPage(DataObjectQueryParamDto paramDto) {
        EntityManager em = this.entityManagerFactory.createEntityManager();
        em.getTransaction().begin();
        String baseSql = "SELECT new com.datablau.metadata.main.dto.metadata.BaseDataObject( o.creationTime, o.physicalName, o.logicalName, o.id, o.objectId,  o.parentId, o.typeId, o.tableId, o.modelId, o.modelName, o.modelCategoryId, o.schema, o.logicalElement,  o.lineageBindStatus, o.parentPhysicalName, o.parentLogicalName, o.domainId, o.domainCode, m.type)  FROM DataObject  o INNER JOIN Model m ON o.modelId = m.modelId ";
        String countSql = "SELECT count(*) FROM DataObject o INNER JOIN Model m ON o.modelId = m.modelId ";
        String whereSql = " WHERE  (m.notLoaded = false OR m.notLoaded IS NULL) AND o.endVersion IS NULL ";
        List<Object> param = new ArrayList();
        int idx = 1;

        Long tableId = paramDto.getTableId();
        Long modelId = paramDto.getModelId();
        Long databaseId = paramDto.getDatabaseId();
        List<Long> typeIds = paramDto.getTypeIds();
        Long modelCategoryId = paramDto.getModelCategoryId();

        List<Long> allModelIds = Lists.newArrayList();
        if (modelId != null && databaseId == null) {
            //查询该数据源下所有对应的schemaId
            List<Model> modelList = modelRepository.findByParentId(modelId);
            if (!CollectionUtils.isEmpty(modelList)) {
                List<Long> modelIds = modelList.stream().map(Model::getModelId).toList();
                allModelIds.addAll(modelIds);
            } else {
                allModelIds.add(modelId);
            }
        }
        if (databaseId != null) {
            allModelIds.add(databaseId);
        }

        if (tableId != null) {
            whereSql = whereSql + " AND o.tableId = ?" + idx++;
            param.add(tableId);
        }

        if (!CollectionUtils.isEmpty(allModelIds)) {
            whereSql = whereSql + " AND o.modelId in (?" + idx++ + ")";
            param.add(allModelIds);
        }

        if (!CollectionUtils.isEmpty(typeIds)) {
            whereSql = whereSql + " AND o.typeId IN (?" + idx++ + ")";
            param.add(typeIds);
        }


        if (modelCategoryId != null) {
            whereSql = whereSql + " AND m.categoryId = ?" + idx++;
            param.add(modelCategoryId);
        }



        String sql = baseSql + whereSql;
        Query q = em.createQuery(sql);

        for(int i = 0; i < param.size(); ++i) {
            q.setParameter(i + 1, param.get(i));
        }

        q.setFirstResult((paramDto.getCurrentPage() - 1) * paramDto.getPageSize());
        q.setMaxResults(paramDto.getPageSize());

        List content;
        try {
            content = q.getResultList();
        } catch (Exception var15) {
            Exception ex = var15;
            logger.error("failed to run sql:" + baseSql + whereSql);
            throw new UnexpectedStateException("unable to get job result", ex);
        }

        q = em.createQuery(countSql + whereSql);

        for(int i = 0; i < param.size(); ++i) {
            q.setParameter(i + 1, param.get(i));
        }

        Long totalCnt;
        try {
            totalCnt = (Long)q.getSingleResult();
        } catch (Exception var14) {
            Exception ex = var14;
            logger.error("failed to run count sql:" + countSql + whereSql);
            throw new UnexpectedStateException("unable to get job count result", ex);
        }
        em.getTransaction().commit();
        em.close();
        Pageable page = PageRequest.of(paramDto.getCurrentPage() - 1, paramDto.getPageSize());
        Page<BaseDataObject> pageData = new PageImpl(content, page, totalCnt);
        List<BaseDataObject> baseDataObjects = pageData.getContent();
        List<DataObjectDto> dataObjectDtos = Lists.newArrayList();
        DataObjectDto dataObjectDto;

        //获取字段对应的表id
        List<Long> tableIds = baseDataObjects.stream().map(BaseDataObject::getParentId).distinct().toList();
        List<Long> modelIdList = baseDataObjects.stream().map(BaseDataObject::getModelId).distinct().toList();
        List<DataObject> tableObjects = dataObjectRepositoryExt.findAllTablesByModelIdsAndObjectIds(modelIdList, tableIds);
        Map<String, DataObject> tableMap = tableObjects.stream().collect(Collectors.toMap(x -> x.getModelId() + "-" + x.getObjectId(), Function.identity(), (x1, x2) -> x1));

        for (BaseDataObject baseDataObject : baseDataObjects) {
            dataObjectDto = new DataObjectDto();
            dataObjectDto.setLogicalName(baseDataObject.getLogicalName());
            dataObjectDto.setPhysicalName(baseDataObject.getName());
            dataObjectDto.setObjectId(baseDataObject.getObjectId());
            dataObjectDto.setModelName(baseDataObject.getModelName());
            dataObjectDto.setModelId(baseDataObject.getModelId());
            dataObjectDto.setTableName(baseDataObject.getParentName());
            dataObjectDto.setTableId(baseDataObject.getParentId());
            dataObjectDto.setSchema(baseDataObject.getSchema());
//            dataObjectDto.setSchemaId(baseDataObject.getModelId());
            dataObjectDto.setTypeId(baseDataObject.getTypeId());
            dataObjectDto.setModelCategoryId(baseDataObject.getModelCategoryId());
            dataObjectDto.setParentId(baseDataObject.getParentId());

            String key = baseDataObject.getModelId() + "-"+baseDataObject.getParentId();
            DataObject dataObject = tableMap.get(key);
            if (dataObject != null) {
                dataObjectDto.setParentPhysicalName(dataObject.getPhysicalName());
                dataObjectDto.setParentLogicalName(dataObject.getLogicalName());
            } else {
                dataObjectDto.setParentPhysicalName(baseDataObject.getParentName());
                dataObjectDto.setParentLogicalName(baseDataObject.getParentAlias());
            }
            dataObjectDtos.add(dataObjectDto);
        }
        PageResult<DataObjectDto> result = new PageResult<>();
        result.setTotalItems(pageData.getTotalElements());
        result.setCurrentPage(paramDto.getCurrentPage());
        result.setPageSize(paramDto.getPageSize());
        result.setContentDirectly(dataObjectDtos);
        return result;
    }

    @Override
    public Set<Long> findModelIdsByNames(Set<String> names) {
        return modelRepository.findModelIdByParentName(names);
    }

    @Override
    public List<DataObjectDto> findDataObjectDtoByModelIds(Collection<Long> modelIds, List<Long> typeIds) {
        List<DataObject> dataObjects = dataObjectFullRepository.findTypeByModelIds(modelIds, typeIds);
        List<DataObjectDto> dataObjectDtos = Lists.newArrayList();
        for (DataObject dataObject : dataObjects) {
            DataObjectDto dataObjectDto = new DataObjectDto();
            BeanUtils.copyProperties(dataObject, dataObjectDto);
            dataObjectDtos.add(dataObjectDto);
        }
        return dataObjectDtos;
    }

    @Override
    public ModelDto queryModelDtoById(Long modelId) {
        Model model = modelRepository.findByModelIdEquals(modelId);
        ModelDto modelDto = new ModelDto();
        BeanUtils.copyProperties(model, modelDto);
        return modelDto;
    }

    @Override
    public List<ModelDto> findModelsByModelIdIn(List<Long> modelIds) {
        List<Model> modelList = modelRepository.findModelsByModelIdIn(modelIds);
        List<ModelDto> modelDtos = Lists.newArrayList();
        for (Model model : modelList) {
            ModelDto modelDto = new ModelDto();
            BeanUtils.copyProperties(model, modelDto);
            modelDtos.add(modelDto);
        }
        return modelDtos;
    }

    @Override
    public List<ModelDto> findModelsByDataSourceId(Collection<Long> dataSourceIds) {
        if(CollectionUtils.isEmpty(dataSourceIds)) return Arrays.asList();
        List<Model> modelList = modelRepository.findByDatasourceIdIn(dataSourceIds);
        List<ModelDto> modelDtos = Lists.newArrayList();
        for (Model model : modelList) {
            ModelDto modelDto = new ModelDto();
            BeanUtils.copyProperties(model, modelDto);
            modelDtos.add(modelDto);
        }
        return modelDtos;
    }

    @Override
    public List<DataObjectDto> findTableAndFiledByObjectIds(List<Long> objectIds) {
        List<DataObjectDto> results = new ArrayList<>();

        List<DataObject> byObjectIdIn = dataObjectRepositoryExt.findByObjectIdIn(objectIds);
        // 解析pro
        try {

            for (DataObject object : byObjectIdIn) {
                DataObjectDto result = object.toDto();

                Node node = object.getObjectNode();
                ObjectX ox = new ObjectX();
                ox.deserialize(node);
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
                results.add(result);

            }

        }catch (Exception e){
            logger.info(e.getMessage());
        }

        return results;


    }

}
