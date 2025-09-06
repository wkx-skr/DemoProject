package com.datablau.model.server.ext.service.impl;


import com.andorj.common.core.exception.IllegalOperationException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ObjectX;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.utility.MultiConditionQueryUtils;
import com.datablau.model.common.dto.DdmModelUdpDto;
import com.datablau.model.common.dto.DdmModelUdpValueDto;
import com.datablau.model.data.dto.ElementChangesDto;
import com.datablau.model.data.dto.ModelElementWebDto;
import com.datablau.model.data.dto.SaveWebModelDto;
import com.datablau.model.data.dto.VersionElementChangesDto;
import com.datablau.model.data.jpa.entity.Category;
import com.datablau.model.data.jpa.entity.Model;
import com.datablau.model.data.jpa.entity.ModelElement;
import com.datablau.model.data.jpa.entity.ModelUdpObject;
import com.datablau.model.data.jpa.entity.ModelVersion;
import com.datablau.model.data.jpa.entity.UdpValueObject;
import com.datablau.model.data.jpa.repository.*;
import com.datablau.model.security.utility.AuthTools;
import com.datablau.model.server.jpa.entity.ModelElementExt;
import com.datablau.model.server.jpa.repostory.ModelElement0Repository;
import com.datablau.model.server.jpa.repostory.ModelElementExtRepostory;
import com.datablau.model.utils.utility.DbType;
import com.datablau.project.api.DatablauRemoteDdmModelServiceNew;
import com.datablau.project.api.dto.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Sets;
import org.apache.commons.compress.utils.Lists;
import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.logging.log4j.util.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DatablauRemoteDdmModelServiceNewImpl implements DatablauRemoteDdmModelServiceNew {

    protected static final Logger logger = LoggerFactory.getLogger(DatablauRemoteDdmModelServiceNewImpl.class);

    @Autowired
    private MultiConditionQueryUtils queryUtils;
    @Autowired
    private ModelElementRepository modelElementRepository;
    @Autowired
    private ModelRepository modelRepository;
    @Autowired
    private ModelExtendServiceImpl modelService;
    @Autowired
    private TrashedModelRepository trashedModelDao;
    @Autowired
    private ModelVersionRepository modelVersionDao;
    @Autowired
    private ModelElementExtRepostory modelElementExtRepostory;
    @Autowired
    private CategoryRepository categoryDao;
    @Autowired
    private ModelElement0Repository element0Repository;
    @Autowired
    private ModelUdpObjectRepository modelUdpDao;

    /**
     * 只查询逻辑模型和物理模型,排查概念模型--Conceptual
     *
     * @param queryDto
     * @return
     */
    @Override
    public PageResult<DdmModelInfoDto> queryDdmModelInfoDtoPage(DdmModelInfoQueryDto queryDto) {
        List<DdmModelInfoDto> ddmModelInfoDtos = Lists.newArrayList();
        String modelName = queryDto.getDdmModelName();
        if (StringUtils.isNotEmpty(modelName)) {
            modelName = "%" + modelName + "%";
        }
        MultiConditionQueryUtils.MultiConditionQuery<Model> query = queryUtils.createQuery(Model.class);
        query.andLike("name", modelName);
        query.andIsNotIn("modelType", Collections.singleton(DbType.CONCEPTUAL.getDisplayName()));
        query.andEqual("deleted", Boolean.FALSE);
        query.setPageInfo(queryDto.getCurrentPage(), queryDto.getPageSize());
        PageResult<Model> page = query.page();
        List<Model> content = page.getContent();
        for (Model model : content) {
            ddmModelInfoDtos.add(convertToDdmModelInfoDto(model));
        }
        PageResult<DdmModelInfoDto> modelInfoDtoPageResult = new PageResult<>();
        modelInfoDtoPageResult.setCurrentPage(page.getCurrentPage());
        modelInfoDtoPageResult.setPageSize(page.getPageSize());
        modelInfoDtoPageResult.setTotalItems(page.getTotalItems());
        modelInfoDtoPageResult.setContentDirectly(ddmModelInfoDtos);
        return modelInfoDtoPageResult;
    }

    @Override
    public List<DdmModelElementDto> queryDdmModelElementDtos(Long ddmModelId) {
        List<DdmModelElementDto> modelElementDtos = Lists.newArrayList();
        Model model = modelRepository.findByIdEquals(ddmModelId);
        if (model == null) {
            throw new RuntimeException("模型不存在");
        }
        List<Long> typeIds = new ArrayList<>(Arrays.asList(LDMTypes.oEntity, LDMTypes.oAttribute, LDMTypes.oModelSource,
                LDMTypes.oKeyGroup, LDMTypes.oKeyGroupMember));
        List<ModelElement> elements = modelElementRepository.findGivenTypesElementsOfModel(ddmModelId, typeIds);
        //过滤字段
        List<ModelElement> columns = elements.stream().filter(x -> Objects.equals(x.getTypeId(), LDMTypes.oAttribute)).toList();
        List<ModelElement> tables = elements.stream().filter(x -> Objects.equals(x.getTypeId(), LDMTypes.oEntity)).toList();
        List<ModelElement> models = elements.stream().filter(x -> Objects.equals(x.getTypeId(), LDMTypes.oModelSource)).toList();
        //挂在表下，keyGroup的parentId是表
        List<ModelElement> keyGroupElements = elements.stream().filter(x -> Objects.equals(x.getTypeId(), LDMTypes.oKeyGroup)).toList();
        //挂在keyGroup下，索引成员具体信息
        List<ModelElement> keyGroupMemberElements = elements.stream().filter(x -> Objects.equals(x.getTypeId(), LDMTypes.oKeyGroupMember)).toList();
        Map<Long, String> keyGroupMemberElementsMap = keyGroupMemberElements.stream().collect(Collectors.toMap(ModelElement::getElementId, ModelElement::getName, (x1, x2) -> x1));
        Map<Long, ModelElement> tableMap = tables.stream().collect(Collectors.toMap(ModelElement::getElementId, x -> x, (x1, x2) -> x1));
        Map<Long, String> pkGroupMap = new HashMap<>();
        for (ModelElement keyGroupElement : keyGroupElements) {
            ObjectX objectXFromData = modelService.getObjectXFromData(keyGroupElement.getData(), model.getUseProto());
            String keyType = objectXFromData.getProperty(LDMTypes.pKeyGroupType).toString();
            if (Objects.equals("PrimaryKey", keyType)) {
                String pKeyGroupMemberRefs = objectXFromData.getProperty(LDMTypes.pKeyGroupMemberRefs).toString();
                //value值是键值索引ID
                pkGroupMap.put(keyGroupElement.getParentId(), pKeyGroupMemberRefs);
            }
        }

        //获取模型所在目录
        Long categoryId = model.getCategoryId();
        Category category = categoryDao.findByIdEquals(categoryId);
        if (category == null) {
            throw new RuntimeException("id为:"+categoryId+"的目录不存在");
        }
        //获取目录完整路径
        String categoryPath = getCategoryPath(categoryId);
        for (ModelElement column : columns) {
            modelElementDtos.add(convertToDdmModelElementDtoForColumn(column, model, pkGroupMap, keyGroupMemberElementsMap, tableMap));
        }
        for (ModelElement table : tables) {
            modelElementDtos.add(convertToDdmModelElementDtoForEntity(table, model));
        }
        for (ModelElement modelElement : models) {
            modelElementDtos.add(convertToDdmModelElementDtoForModel(modelElement, model));
        }
        for (DdmModelElementDto modelElementDto : modelElementDtos) {
            modelElementDto.setDdmCategoryId(model.getCategoryId());
            modelElementDto.setDdmCategoryPath(categoryPath);
        }

        return modelElementDtos;
    }

    public String getCategoryPath(Long categoryId) {
        List<String> pathParts = new ArrayList<>();
        Set<Long> visitedIds = new HashSet<>(); // 防止循环引用
        Long currentId = categoryId;

        while (currentId != null && currentId != 0 && !visitedIds.contains(currentId)) {
            Category category = categoryDao.findByIdEquals(currentId);

            pathParts.add(category.getName()); // 假设 IdentifiableWithName 包含 getName()
            visitedIds.add(currentId);
            currentId = category.getParentId(); // 获取下一级父ID
        }

        // 检测循环引用
        if (currentId != null && currentId != 0) {
            throw new IllegalStateException("检测到循环引用，路径生成失败: " + categoryId);
        }

        Collections.reverse(pathParts); // 反转顺序：根 -> 子
        return String.join("/", pathParts);
    }

    /*@Override
    public List<DdmModelElementDto> queryDdmModelElementDetail(Long ddmModelId) {
        List<DdmModelElementDto> modelElementDtos = Lists.newArrayList();
        Model model = modelRepository.findByIdEquals(ddmModelId);

        if (model == null) {
            throw new RuntimeException("模型不存在");
        }
        String categoryPath = getCategoryPath(model.getCategoryId());

        List<Long> typeIds = new ArrayList<>(Arrays.asList(LDMTypes.oEntity, LDMTypes.oAttribute, LDMTypes.oModelSource,
                LDMTypes.oKeyGroup, LDMTypes.oKeyGroupMember));
        List<ModelElement> elements = modelElementRepository.findGivenTypesElementsOfModel(ddmModelId, typeIds);

        //过滤字段
        List<ModelElement> columns = elements.stream().filter(x -> Objects.equals(x.getTypeId(), LDMTypes.oAttribute)).toList();
        List<ModelElement> tables = elements.stream().filter(x -> Objects.equals(x.getTypeId(), LDMTypes.oEntity)).toList();
        List<ModelElement> models = elements.stream().filter(x -> Objects.equals(x.getTypeId(), LDMTypes.oModelSource)).toList();
        Map<Long, ModelElement> tableMap = tables.stream().collect(Collectors.toMap(ModelElement::getElementId, x -> x, (x1, x2) -> x1));
        for (ModelElement column : columns) {
            ObjectX objectXFromData = modelService.getObjectXFromData(column.getData(), model.getUseProto());
            Object pIsNotNull = objectXFromData.getProperty(LDMTypes.pIsNotNull);//是否为空
            Object pDataScale = objectXFromData.getProperty(LDMTypes.pDataScale);//数据长度
            Object pDataPrecision = objectXFromData.getProperty(LDMTypes.pDataPrecision);//数据精度
            Object pDefaultValue = objectXFromData.getProperty(LDMTypes.pDefaultValue);//默认值
            Object pDataType = objectXFromData.getProperty(LDMTypes.pDataType);//数据类型
            DdmModelElementDto ddmModelElementDto = new DdmModelElementDto();
            ddmModelElementDto.setCategoryPath(categoryPath);
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
            modelElementDtos.add(convertToDdmModelElementDtoForColumn(column,model,ddmModelElementDto,tableMap));
        }

        return modelElementDtos;
    }*/
    @Override
    public List<DdmModelElementDto> queryDdmModelElementDetail(Long ddmModelId) {
        List<DdmModelElementDto> modelElementDtos = Lists.newArrayList();
        Model model = modelRepository.findByIdEquals(ddmModelId);

        if (model == null) {
            throw new RuntimeException("模型不存在");
        }
        String categoryPath = getCategoryPath(model.getCategoryId());

        List<Long> typeIds = new ArrayList<>(Arrays.asList(LDMTypes.oEntity, LDMTypes.oAttribute, LDMTypes.oModelSource,
                LDMTypes.oKeyGroup, LDMTypes.oKeyGroupMember));
        List<ModelElement> elements = modelElementRepository.findGivenTypesElementsOfModel(ddmModelId, typeIds);

        //过滤字段
        List<ModelElement> columns = elements.stream().filter(x -> Objects.equals(x.getTypeId(), LDMTypes.oAttribute)).toList();
        List<ModelElement> tables = elements.stream().filter(x -> Objects.equals(x.getTypeId(), LDMTypes.oEntity)).toList();
        List<ModelElement> models = elements.stream().filter(x -> Objects.equals(x.getTypeId(), LDMTypes.oModelSource)).toList();
        Map<Long, ModelElement> tableMap = tables.stream().collect(Collectors.toMap(ModelElement::getElementId, x -> x, (x1, x2) -> x1));
        for (ModelElement column : columns) {
            ObjectX objectXFromData = modelService.getObjectXFromData(column.getData(), model.getUseProto());
            Object pIsNotNull = objectXFromData.getProperty(LDMTypes.pIsNotNull); // 是否为空
            Object pDataScale = objectXFromData.getProperty(LDMTypes.pDataScale); // 数据长度
            Object pDataPrecision = objectXFromData.getProperty(LDMTypes.pDataPrecision); // 数据精度
            Object pDefaultValue = objectXFromData.getProperty(LDMTypes.pDefaultValue); // 默认值
            Object pDataType = objectXFromData.getProperty(LDMTypes.pDataType); // 数据类型

            DdmModelElementDto ddmModelElementDto = new DdmModelElementDto();
            ddmModelElementDto.setCategoryPath(categoryPath);

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

            modelElementDtos.add(convertToDdmModelElementDtoForColumn(column, model, ddmModelElementDto, tableMap));
        }

        return modelElementDtos;
    }

    private DdmModelInfoDto convertToDdmModelInfoDto(Model model) {
        DdmModelInfoDto ddmModelInfoDto = new DdmModelInfoDto();
        ddmModelInfoDto.setDdmModelId(model.getId());
        ddmModelInfoDto.setDdmModelName(model.getName());
        ddmModelInfoDto.setDbType(model.getModelType());
        return ddmModelInfoDto;
    }

    @Override
    public void test(Object o) {

    }

    @Override
    @Transactional
    public void deleteModelById(Long modelId) {
        try {
            AuthTools.callAsSuperuser(()->{
                modelService.permanentlyDeleteModel(modelId);
                return null;
            });
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 构建字段
     *
     * @param element
     * @param model
     * @return
     */
    private DdmModelElementDto convertToDdmModelElementDtoForColumn(ModelElement element, Model model, DdmModelElementDto ddmModelElementDto, Map<Long, ModelElement> tableMap) {

        ModelElement tableElement = tableMap.get(element.getParentId());
        ddmModelElementDto.setDdmModelId(model.getId());
        ddmModelElementDto.setDdmModelName(model.getName());
        ddmModelElementDto.setParentId(element.getParentId());
        if (tableElement != null) {
            ddmModelElementDto.setTableId(element.getParentId());
            ddmModelElementDto.setTableName(tableElement.getName());
            ddmModelElementDto.setTableCnName(tableElement.getAlias());
        }
        ddmModelElementDto.setColumnId(element.getElementId());
        ddmModelElementDto.setColumnName(element.getName());
        ddmModelElementDto.setColumnCnName(element.getAlias());
        ddmModelElementDto.setTypeId(LDMTypes.oAttribute);
        ddmModelElementDto.setPk(false);
        return ddmModelElementDto;
    }

    /**
     * 构建字段
     *
     * @param element
     * @param model
     * @return
     */
    private DdmModelElementDto convertToDdmModelElementDtoForColumn(ModelElement element, Model model, Map<Long, String> pkGroupValMap, Map<Long, String> keyGroupMemberElementsMap,
                                                                    Map<Long, ModelElement> tableMap) {
        DdmModelElementDto ddmModelElementDto = new DdmModelElementDto();
        ModelElement tableElement = tableMap.get(element.getParentId());
        ddmModelElementDto.setDdmModelId(model.getId());
        ddmModelElementDto.setDdmModelName(model.getName());
        ddmModelElementDto.setParentId(element.getParentId());
        if (tableElement != null) {
            ddmModelElementDto.setTableId(element.getParentId());
            ddmModelElementDto.setTableName(tableElement.getName());
            ddmModelElementDto.setTableCnName(tableElement.getAlias());
        }
        ddmModelElementDto.setColumnId(element.getElementId());
        ddmModelElementDto.setColumnName(element.getName());
        ddmModelElementDto.setColumnCnName(element.getAlias());
        ddmModelElementDto.setTypeId(LDMTypes.oAttribute);
        ddmModelElementDto.setPk(false);
        //keyGroupMap挂在表下
        String keyGroupRefIds = pkGroupValMap.get(element.getParentId());
        if (Strings.isNotEmpty(keyGroupRefIds)) {
            String[] split = keyGroupRefIds.split(",");
            for (String keyGroupRefId : split) {
                String keyGroupRefName = keyGroupMemberElementsMap.get(Long.parseLong(keyGroupRefId));
                if (Objects.equals(element.getName(), keyGroupRefName)) {
                    ddmModelElementDto.setPk(true);

                }
            }
        }
        return ddmModelElementDto;
    }

    /**
     * 构建表
     *
     * @param element
     * @param model
     * @return
     */
    private DdmModelElementDto convertToDdmModelElementDtoForEntity(ModelElement element, Model model) {
        DdmModelElementDto ddmModelElementDto = new DdmModelElementDto();
        ddmModelElementDto.setDdmModelId(model.getId());
        ddmModelElementDto.setDdmModelName(model.getName());
        ddmModelElementDto.setParentId(element.getParentId());
        ddmModelElementDto.setTableId(element.getElementId());
        ddmModelElementDto.setTableName(element.getName());
        ddmModelElementDto.setTableCnName(element.getAlias());
        ddmModelElementDto.setTypeId(LDMTypes.oEntity);
        ddmModelElementDto.setPk(false);
        return ddmModelElementDto;
    }

    private DdmModelElementDto convertToDdmModelElementDtoForModel(ModelElement element, Model model) {
        DdmModelElementDto ddmModelElementDto = new DdmModelElementDto();
        ddmModelElementDto.setDdmModelId(model.getId());
        ddmModelElementDto.setDdmModelName(model.getName());
        ddmModelElementDto.setDdmModelAlias(element.getAlias());
        ddmModelElementDto.setParentId(element.getParentId());
        ddmModelElementDto.setTypeId(LDMTypes.oModelSource);
        return ddmModelElementDto;
    }

    @Override
    public List<DdmModelDto> getDdmModels(Collection<Long> ids) {
        List<Long> removeModelIdList = trashedModelDao.findAll().stream().map(t -> t.getId()).collect(Collectors.toList());
        List<Model> models = this.modelRepository.findByIdIn(ids);
        models = models.stream().filter(m -> !removeModelIdList.contains(m.getId())).collect(Collectors.toList());
        return (models != null && !models.isEmpty() ? models.stream().map((m) -> {
            DdmModelDto modelDto = new DdmModelDto();
            BeanUtils.copyProperties(m, modelDto);
            String modelPath = this.modelService.getModelPath(m.getCategoryId(), new ArrayList(), "/" + m.getName());
            modelDto.setPath(modelPath);
            return modelDto;
        }).collect(Collectors.toList()) : new ArrayList());
    }

    @Override
    public List<DdmModelVersionDto> getDdmModelVersionDto(Collection<DdmModelVersionQueryDto> dtos) {
        if (CollectionUtils.isEmpty(dtos)) {
            return null;
        }
        Set<Long> versionIds = dtos.stream().map(DdmModelVersionQueryDto::getModelVersionId).collect(Collectors.toSet());
        List<DdmModelVersionDto> list = new ArrayList<>();
        Map<Long, ModelVersion> map = new HashMap<>();
        Iterable<ModelVersion> modelVersions = modelVersionDao.findAllById(versionIds);
        for (ModelVersion modelVersion : modelVersions) {
            DdmModelVersionDto dto = new DdmModelVersionDto();
            dto.setModelId(modelVersion.getModelId());
            dto.setModelVersionName(modelVersion.getName());
            dto.setModelVersionId(modelVersion.getId());
            if (map.containsKey(modelVersion.getModelId())) {
                ModelVersion curversion = map.get(modelVersion.getModelId());
                dto.setModelVersionCurrentName(curversion.getName());
                dto.setModelCurrentVersionId(curversion.getId());
                dto.setModelEndVer(curversion.getEndVersion());
            } else {
                ModelVersion curversion = modelVersionDao.getFirstByModelIdOrderByIdDesc(modelVersion.getModelId());
                dto.setModelVersionCurrentName(curversion.getName());
                dto.setModelCurrentVersionId(curversion.getId());
                dto.setModelEndVer(curversion.getEndVersion());
                map.put(modelVersion.getModelId(), curversion);
            }
            list.add(dto);

        }
        return list;
    }

    @Override
    public List<DdmElementExtDto> getDdmElementExtByElementIds(List<Long> ids, String archyObjectId) {
        ArrayList<DdmElementExtDto> res = new ArrayList<>();

        List<ModelElementExt> elementExts = modelElementExtRepostory.findByModelElementId(ids, archyObjectId);
        for (ModelElementExt ext : elementExts) {
            DdmElementExtDto dto = new DdmElementExtDto();
            dto.setId(ext.getId());
            dto.setModelElementId(ext.getModelElementId());
            dto.setCreateDate(ext.getCreateDate());
            dto.setCreater(ext.getCreater());
            dto.setUpdateDate(ext.getUpdateDate());
            dto.setUpdater(ext.getUpdater());
            dto.setTypeId(ext.getTypeId());
            dto.setCode(ext.getCode());
            dto.setArchyId(ext.getArchyId());
            dto.setParentId(ext.getParentId());
            dto.setSystem(ext.getSystem());
            res.add(dto);
        }
        return res;
    }

    @Override
    public void syncUpdateDDMModelX(String username, Long modelId, String archyId, List<DdmL4ExcelDto> entities) throws Exception{
        Model model = modelRepository.findByIdEquals(modelId);
        if(model == null){
            return;
        }
        //拿到最大elementId往后做自增
        Long maxElementId = element0Repository.getMaxElementId(modelId);

        //模型下的字段和表
        Set<Long> types = Sets.newHashSet(LDMTypes.oEntity, LDMTypes.oAttribute, LDMTypes.oKeyGroup, LDMTypes.oKeyGroupMember,
                LDMTypes.oModelSource, LDMTypes.oDiagram);
        List<ModelElement> allElements = modelElementRepository.findGivenTypesElementsOfModel(modelId, types);
        List<Long> elementIds = allElements.stream().map(ModelElement::getElementId).toList();
        List<ModelElementExt> elementExts = modelElementExtRepostory.findByModelElementId(elementIds, archyId);
        Map<String, ModelElementExt> elementExtMap = elementExts.stream().collect(Collectors.toMap(ModelElementExt::getCode, a -> a));

        // 获取Main主题域的id,如果没有main主题域，选一个
        Long modelSourceId = 0L;
        Long diagramId = 0L;
        for (ModelElement e : allElements) {
            if(LDMTypes.oModelSource == (e.getTypeId())) {
                modelSourceId = e.getElementId();
            }
            if(LDMTypes.oDiagram == (e.getTypeId())) {
                diagramId = e.getElementId();
            }
        }

        List<DdmModelUdpDto> ddmModelUdp = this.getDdmModelUdp();
        HashMap<String, DdmModelUdpDto> tableUdpMap = new HashMap<>();
        for (DdmModelUdpDto udp : ddmModelUdp) {
            if (udp.getTargetTypes().contains(LDMTypes.oEntity)) {
                tableUdpMap.put(udp.getName(), udp);
            }
        }

        SaveWebModelDto webModelDto = new SaveWebModelDto();
        List<ModelElementWebDto> added = new ArrayList();
        List<ModelElementWebDto> updated = new ArrayList();
        List<Long> removed = new ArrayList();

        Map<Long, ModelElement> elementMap = allElements.stream().collect(Collectors.toMap(ModelElement::getElementId, a -> a));

        for (DdmL4ExcelDto entity : entities) {
            String entityCode = entity.getEntityCode();
            //i.模板没写编码为新增
            //ii.模板填了但是系统里查不到则新增
            if((Strings.isEmpty(entityCode)) || (!elementExtMap.containsKey(entityCode))){
                //封装表web建模
                ModelElementWebDto tableWebDto = this.convertTableElementWebDto(modelId, entity, ++maxElementId, modelSourceId, tableUdpMap);
                added.add(tableWebDto);
                // 表要有shape信息，否则显示不出来
                added.add(this.convertShapeElementWebDto(tableWebDto.getElementId(), modelId, ++maxElementId, diagramId));

                /**
                 * 这块主键的逻辑：每一个字段如果是主键就创建一个oKeyGroupMember-80500001L
                 * 然后先封装一个oKeyGroup-80000093来保存所有oKeyGroupMember的引用
                 */
                ModelElementWebDto keyGroupWebDto = null;
                List<Long> KeyGroupMemberIds = new ArrayList<>();

                //封装字段web建模
                for (DdmL5ExcelDto attr : entity.getSubAttrs()) {
                    ModelElementWebDto columnWebDto = this.convertColumnElementWebDto(modelId, attr, ++maxElementId, tableWebDto.getElementId());
                    added.add(columnWebDto);
                    //主键
                    if("Y".equals(attr.getAttrPk())){
                        if(keyGroupWebDto == null){
                            //先创建好keygroup
                            keyGroupWebDto = this.convertkeyGroupWebDto(modelId, entity, ++maxElementId, tableWebDto.getElementId());
                        }
                        //每个字段创建一个keygroupMember
                        ModelElementWebDto KeyGroupMemberWebDto = this.convertKeyGroupMemberWebDto(modelId, attr, ++maxElementId, keyGroupWebDto.getElementId(), columnWebDto.getElementId());
                        added.add(KeyGroupMemberWebDto);
                        KeyGroupMemberIds.add(KeyGroupMemberWebDto.getElementId());
                    }
                }
                if(keyGroupWebDto != null){
                    String KeyGroupMemberRefs = KeyGroupMemberIds.stream().map(String::valueOf).collect(Collectors.joining(","));
                    keyGroupWebDto.setProperty(LDMTypes.pKeyGroupMemberRefs, KeyGroupMemberRefs);
                    added.add(keyGroupWebDto);
                }
            }

            //iii.如果编码存在则全量更新表，表更新表内字段全删除再新增
            ModelElementExt elementExt = elementExtMap.get(entityCode);
            if(elementExt != null){
                ModelElement table = elementMap.get(elementExt.getModelElementId());
                if(table != null){
                    //先更新表
                    ModelElementWebDto tableUpdateWebDto = this.convertTableElementWebDto(modelId, entity, table.getElementId(), modelSourceId, tableUdpMap);
                    updated.add(tableUpdateWebDto);

                    //保存一个表下的所有keygroup，用于删除keygroupmember
                    ArrayList<Long> keygroupIds = new ArrayList<>();
                    //删除表原有字段
                    for (ModelElement e : allElements) {
                        if(Objects.equals(e.getParentId(), table.getElementId()) && e.getTypeId() == LDMTypes.oAttribute){
                            removed.add(e.getElementId());
                        }
                        if(Objects.equals(e.getParentId(), table.getElementId()) && e.getTypeId() == LDMTypes.oKeyGroup){
                            removed.add(e.getElementId());
                            keygroupIds.add(e.getElementId());
                        }
                    }
                    //删除keygroupmember
                    if(!CollectionUtils.isEmpty(keygroupIds)){
                        for (ModelElement e : allElements) {
                            if((e.getTypeId() == LDMTypes.oKeyGroupMember) && (keygroupIds.contains(e.getParentId()))){
                                removed.add(e.getElementId());
                            }
                        }
                    }


                    //把新的字段全量新建
                    /**
                     * 这块主键的逻辑：每一个字段如果是主键就创建一个oKeyGroupMember-80500001L
                     * 然后先封装一个oKeyGroup-80000093来保存所有oKeyGroupMember的引用
                     */
                    ModelElementWebDto keyGroupWebDto = null;
                    List<Long> KeyGroupMemberIds = new ArrayList<>();
                    for (DdmL5ExcelDto attr : entity.getSubAttrs()) {
                        ModelElementWebDto columnWebDto = this.convertColumnElementWebDto(modelId, attr, ++maxElementId, table.getElementId());
                        added.add(columnWebDto);
                        //主键
                        if("Y".equals(attr.getAttrPk())){
                            if(keyGroupWebDto == null){
                                //先创建好keygroup
                                keyGroupWebDto = this.convertkeyGroupWebDto(modelId, entity, ++maxElementId, tableUpdateWebDto.getElementId());
                            }
                            //每个字段创建一个keygroupMember
                            ModelElementWebDto KeyGroupMemberWebDto = this.convertKeyGroupMemberWebDto(modelId, attr, ++maxElementId, keyGroupWebDto.getElementId(), columnWebDto.getElementId());
                            added.add(KeyGroupMemberWebDto);
                            KeyGroupMemberIds.add(KeyGroupMemberWebDto.getElementId());
                        }
                    }
                    if(keyGroupWebDto != null){
                        String KeyGroupMemberRefs = KeyGroupMemberIds.stream().map(String::valueOf).collect(Collectors.joining(","));
                        keyGroupWebDto.setProperty(LDMTypes.pKeyGroupMemberRefs, KeyGroupMemberRefs);
                        added.add(keyGroupWebDto);
                    }
                }
            }
        }
        webModelDto.setAdded(added);
        webModelDto.setUpdated(updated);
        webModelDto.setRemoved(removed);

        webModelDto.setModelId(modelId);
        webModelDto.setLastVersion(model.getCurrentVersion());
        Long verId = AuthTools.callAsGivenUser(username, () -> {
            try {
                modelService.saveWebModel0(webModelDto);
                return this.creaModelVersion(modelId);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
        logger.info("xxxxxxxxxxxxxxxx:::" + verId);
        System.out.println();
    }

    private Long creaModelVersion(Long modelId) {
        ModelVersion version = this.modelVersionDao.getLastestModelVersion(modelId);
        String[] split = version.getName().split("\\.");
        String s = split[0];
        if(Strings.isEmpty(s)){
            s = "0";
        }

        String newVersionName = "";
        if(s.startsWith("V")){
            String numberStr = s.substring(1);
            int num = Integer.parseInt(numberStr) + 1;
            newVersionName = "V" + num;
        }else {
            int num = Integer.parseInt(s) + 1;
            newVersionName = "V" + num;
        }

        Model model = modelRepository.findByIdEquals(modelId);
        ModelVersion newVersion = new ModelVersion();
        newVersion.setModelId(modelId);
//        newVersion.setDescription("");
        newVersion.setName(newVersionName);
        newVersion.setCreator(AuthTools.currentUsername());
        newVersion.setTimestamp(new Date());
        if (version == null) {
            if (model.getReferredModelId() != null) {
                newVersion.setStartVersion(model.getCurrentVersion());
            } else {
                newVersion.setStartVersion(1L);
            }

            newVersion.setEndVersion(model.getCurrentVersion());
        } else {
            if (ObjectUtils.equals(version.getEndVersion(), model.getCurrentVersion())) {
                throw new IllegalOperationException("No changes compares to the last version");
            }

            newVersion.setStartVersion(version.getEndVersion() + 1L);
            newVersion.setEndVersion(model.getCurrentVersion());
        }

        ModelVersion result = (ModelVersion) modelVersionDao.save(newVersion);
        return result.getId();
    }

    private ModelElementWebDto convertKeyGroupMemberWebDto(Long modelId, DdmL5ExcelDto attr, Long elementId, Long parentId, Long attributeRef){
        ModelElementWebDto webDto = new ModelElementWebDto();
        webDto.setModelId(modelId);
        webDto.setElementId(elementId);
        webDto.setName(attr.getAttrEnglishName());
        webDto.setObjectClass("Datablau.LDM.EntityKeyGroupMember");
        //keygroupID
        webDto.setParentId(parentId);
        webDto.setTypeId(LDMTypes.oKeyGroupMember);
        Map<Long, Object> p = new HashMap<>();
        p.put(LDMTypes.pAttributeRef, attributeRef);
        p.put(LDMTypes.pOrderType, "Ascending");
        p.put(LDMTypes.pTypeId, LDMTypes.oKeyGroupMember);
        p.put(LDMTypes.pId, elementId);
        p.put(LDMTypes.pName, attr.getAttrEnglishName());
        webDto.setProperties(p);
        return webDto;
    }

    private ModelElementWebDto convertkeyGroupWebDto(Long modelId, DdmL4ExcelDto entity, Long elementId, Long parentId){
        ModelElementWebDto webDto = new ModelElementWebDto();
        webDto.setModelId(modelId);
        webDto.setElementId(elementId);
        webDto.setName("pk_" + entity.getEntityEnglishName() +"_1");
        webDto.setObjectClass("Datablau.LDM.EntityKeyGroup");
        //表的elementid
        webDto.setParentId(parentId);
        webDto.setTypeId(LDMTypes.oKeyGroup);
        Map<Long, Object> p = new HashMap<>();
//        p.put(LDMTypes.pKeyGroupMemberRefs, "");//80000096L 保存oKeyGroupMember引用"1,2"，这里不传等创建完主键字段再传
        p.put(LDMTypes.pKeyGroupType, "PrimaryKey"); // 80000097L
        p.put(LDMTypes.pMacro, "pk_%owner%_%keyid%");// 80010138L
        p.put(LDMTypes.pTypeId, LDMTypes.oKeyGroup);//90000001L
        p.put(LDMTypes.pId, elementId);//90000002L
        p.put(LDMTypes.pName, "pk_" + entity.getEntityName() +"_1");//90000002L
        webDto.setProperties(p);
        return webDto;
    }

    private ModelElementWebDto convertColumnElementWebDto(Long modelId, DdmL5ExcelDto attr, Long elementId, Long parentId){
        ModelElementWebDto webDto = new ModelElementWebDto();
        webDto.setModelId(modelId);
        webDto.setElementId(elementId);
        webDto.setName(attr.getAttrEnglishName());
        webDto.setAlias(attr.getAttrName());
        webDto.setDomainId(attr.getAttrDomainId());
        webDto.setObjectClass("Datablau.LDM.EntityAttribute");
        webDto.setParentId(parentId);
        webDto.setTypeId(LDMTypes.oAttribute);
        Map<Long, Object> p = new HashMap<>();
        p.put(LDMTypes.pTypeId, LDMTypes.oAttribute);//类型 "90000001": 80000005,
        p.put(LDMTypes.pId, elementId); //elementId "90000002": 29,
        p.put(LDMTypes.pName, attr.getAttrEnglishName());// 英文名 "90000003": "Attribute_1",
        p.put(LDMTypes.pLogicalName, attr.getAttrName());//字段中文名 "80100005": "表字段1",
        p.put(LDMTypes.pDefinition, attr.getAttrDescription()); //定义 90000004L
        p.put(LDMTypes.pDataType, attr.getAttrDataType());//数据类型 "80000002": "VARCHAR(50)",
        p.put(LDMTypes.pIsNotNull, attr.getAttrNull());//是否为null "80100033": false,
        p.put(LDMTypes.pDataStandardRef, attr.getAttrDomainId());//数据标准 80500058L
        p.put(LDMTypes.pDefaultValue, attr.getAttrDefaultValue());//默认值
        webDto.setProperties(p);
        return webDto;
    }

    private ModelElementWebDto convertTableElementWebDto(Long modelId, DdmL4ExcelDto entity, Long elementId, Long parentId,
                                                         HashMap<String, DdmModelUdpDto> tableUdpMap){
        ModelElementWebDto webDto = new ModelElementWebDto();
        webDto.setModelId(modelId);
        webDto.setElementId(elementId);
        webDto.setName(entity.getEntityEnglishName());
        webDto.setAlias(entity.getEntityName());
        webDto.setObjectClass("Datablau.LDM.EntityComposite");
        webDto.setParentId(parentId);
        webDto.setTypeId(LDMTypes.oEntity);
        Map<Long, Object> p = new HashMap<>();
        p.put(LDMTypes.pLogicalName, entity.getEntityName()); //表中文名 80100005L
        p.put(LDMTypes.pName, entity.getEntityEnglishName()); //英文名 90000003L
        p.put(LDMTypes.pTypeId, LDMTypes.oEntity); //类型 90000001L
        p.put(LDMTypes.pId, elementId); //elementId 90000002L
        p.put(LDMTypes.pDefinition, entity.getEntityDescription()); //定义 90000004L

        //扩展属性 数据管家
        DdmModelUdpDto dataSteward = tableUdpMap.get("数据管家");
        if(dataSteward != null){
            p.put(dataSteward.getUdpId(), entity.getEntityDataSteward());
        }
        //扩展属性 数据分类
        DdmModelUdpDto dataClassification = tableUdpMap.get("数据分类");
        if(dataClassification != null){
            p.put(dataClassification.getUdpId(), entity.getEntityDataClassification());
        }
        //扩展属性 来源系统
        DdmModelUdpDto sourceSystem = tableUdpMap.get("来源系统");
        if(sourceSystem != null){
            p.put(sourceSystem.getUdpId(), entity.getEntitySourceSystem());
        }

        webDto.setProperties(p);
        return webDto;
    }

    private ModelElementWebDto convertShapeElementWebDto(Long currentElementId, Long modelId, Long shapeId, Long diagramId){
        ModelElementWebDto webDto = new ModelElementWebDto();
        webDto.setModelId(modelId);
        webDto.setTypeId(LDMTypes.oShape);
        webDto.setElementId(shapeId);
        webDto.setParentId(diagramId);
        webDto.setName("Entity_" + currentElementId);
        Map<Long, Object> properties = new HashMap<>();
        properties.put(LDMTypes.pLocation, "380,120");
        properties.put(LDMTypes.pShapeSize, "171,127");
        properties.put(LDMTypes.pEntityBodyBackgroundColor, "NamedColor:White");
        properties.put(LDMTypes.pEntityBorderColor, "NamedColor:Black");
        properties.put(LDMTypes.pEntityBorderWidth, 1);
        properties.put(LDMTypes.pIsEntityBorderDashed, false);
        properties.put(LDMTypes.pEntityHeaderBackgroundColor, "NamedColor:Control");
        properties.put(LDMTypes.pEntityHeaderSelectedColor, "NamedColor:LightSteelBlue");
        properties.put(LDMTypes.pEntityRoundingSize, 0);
        properties.put(LDMTypes.pEntityHeaderTextAlignment, "MiddleCenter");
        properties.put(LDMTypes.pEntityHeaderTextFont, "Arial, 9.75pt, style=Bold");
        properties.put(LDMTypes.pEntityHeaderTextColor, "NamedColor:Black");
        properties.put(LDMTypes.pIsAutoSizing, true);
        properties.put(LDMTypes.pBOBackgroundColor, "NamedColor:Black");
        properties.put(LDMTypes.pIsBOBorderDashed, false);
        properties.put(LDMTypes.pBOBorderWidth, 1);
        properties.put(LDMTypes.pBORoundingSize, 0);
        properties.put(LDMTypes.pBOTextColor, "NamedColor:Black");
        properties.put(LDMTypes.pBOTextFont, "Tahoma, 8.25pt");
        properties.put(LDMTypes.pBOTextAlignment, "MiddleCenter");
        properties.put(LDMTypes.pId, shapeId);
        properties.put(LDMTypes.pName, "Entity_" + currentElementId);
        properties.put(LDMTypes.pUniqueId, UUID.randomUUID().toString());
        properties.put(LDMTypes.pTypeId, LDMTypes.oShape);
        // 属于哪个表
        properties.put(LDMTypes.pOwneeRef, currentElementId);
        webDto.setProperties(properties);
        webDto.setObjectClass("Datablau.ERD.ShapeEntity");
        return webDto;
    }

    public List<DdmModelUdpDto> getDdmModelUdp() {
        List<DdmModelUdpDto> result = new ArrayList<>();
        List<ModelUdpObject> udps = modelUdpDao.getAllUdps();
        if (udps != null && !udps.isEmpty()) {
            for (ModelUdpObject udp : udps) {
                DdmModelUdpDto dto = new DdmModelUdpDto();
                BeanUtils.copyProperties(udp, dto, "valueType", "enumValues");
                dto.setValueType(udp.getValueType().name());
                List<UdpValueObject> enumValues = udp.getEnumValues();
                if (enumValues != null && !enumValues.isEmpty()) {
                    List<DdmModelUdpValueDto> udpValues = new ArrayList<>();
                    for (UdpValueObject e : enumValues) {
                        DdmModelUdpValueDto ddmModelUdpDto = new DdmModelUdpValueDto();
                        BeanUtils.copyProperties(e, ddmModelUdpDto);
                        udpValues.add(ddmModelUdpDto);
                    }
                    dto.setEnumValues(udpValues);
                }
                result.add(dto);
            }
        }
        return result;
    }

    @Override
    public String getElementsChangesBetweenTwoVersions(Long modelId, Long baseVerId, Long targetVerId, boolean showAll) throws Exception {
        VersionElementChangesDto changes = modelService.getElementsChangesBetweenTwoVersions(modelId, baseVerId, targetVerId, showAll);
        ObjectMapper mapper = new ObjectMapper();
        return mapper.writeValueAsString(changes);
    }

}


















