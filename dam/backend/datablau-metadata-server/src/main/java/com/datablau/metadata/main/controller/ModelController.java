/*
 * Copyright (c) 2017, Datablau. All rights reserved.
 */
package com.datablau.metadata.main.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.core.annotation.EndpointDoc;
import com.andorj.common.core.annotation.Ignore;
import com.andorj.common.core.api.data.ApiModelVerEditDetailLog;
import com.andorj.common.core.api.data.ApiModelVerEditLog;
import com.andorj.common.core.data.CommonColumn;
import com.andorj.common.core.data.CommonModelWithPath;
import com.andorj.common.core.data.CommonTable;
import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.core.exception.UnexpectedSystemException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.core.model.ObjectX;
import com.andorj.common.data.Data;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.utility.BeanHelper;
import com.andorj.model.common.utility.GeneralUtility;
import com.andorj.model.common.utility.RootBeanHelper;
import com.datablau.base.api.ModelCategoryService;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.base.data.PageQueryDto;
import com.datablau.base.data.TagDto;
import com.datablau.common.kafka.msg.BasicMsg;
import com.datablau.common.kafka.producer.KafkaProducer;
import com.datablau.data.common.api.DynamicLoadingService;
import com.datablau.data.common.api.MessageQueueService;
import com.datablau.data.common.api.OperationLogService;
import com.datablau.data.common.api.PropertyService;
import com.datablau.data.common.api.instantjob.InstantJob;
import com.datablau.data.common.api.instantjob.InstantJobProgressMonitor;
import com.datablau.data.common.api.instantjob.InstantJobService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.data.DataBlauHttpServletRequest;
import com.datablau.data.common.data.FileDescriptor;
import com.datablau.data.common.data.instantjob.FileGenerateInstantJobResult;
import com.datablau.data.common.data.instantjob.ImportInstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobStage;
import com.datablau.data.common.operation.type.OperationLogType;
import com.datablau.data.common.operation.type.OperationModuleType;
import com.datablau.data.common.type.InstantJobType;
import com.datablau.data.common.util.ExcelUtil;
import com.datablau.datasource.api.JdbcDatasource;
import com.datablau.datasource.data.DataConnect;
import com.datablau.datasource.data.DatasourceKnownParameterType;
import com.datablau.datasource.data.DatasourceProperties;
import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.dto.DomainDto;
import com.datablau.domain.management.dto.StandardCodeDto;
import com.datablau.domain.management.mq.message.UpdateDataStandardMessage;
import com.datablau.metadata.common.dto.ModelQueryDto;
import com.datablau.metadata.common.dto.domain.verify.DomainUsage;
import com.datablau.metadata.common.dto.metadata.SearchCriteriaDto;
import com.datablau.metadata.common.dto.model.ModelDto;
import com.datablau.metadata.common.dto.model.ModelParamDto;
import com.datablau.metadata.common.dto.report.BIReportType;
import com.datablau.metadata.main.dao.metadata.DataObjectRepository;
import com.datablau.metadata.main.dao.model.ModelMappingRepository;
import com.datablau.metadata.main.dao.model.ModelRepository;
import com.datablau.metadata.main.dto.MetaDataIncrementDto;
import com.datablau.metadata.main.dto.UdpObjectIdMsgDto;
import com.datablau.metadata.main.dto.metadata.BaseDataObject;
import com.datablau.metadata.main.dto.metadata.DataObjectExportDto;
import com.datablau.metadata.main.dto.metadata.DataObjectExportResult;
import com.datablau.metadata.main.dto.model.BaseModelVersion;
import com.datablau.metadata.main.dto.model.MetadataSyncJobDto;
import com.datablau.metadata.main.dto.model.ModelInfoDto;
import com.datablau.metadata.main.dto.model.ModelRequestDto;
import com.datablau.metadata.main.dto.model.ModelSyncHistoryDto;
import com.datablau.metadata.main.dto.model.ModelTreeNodeDto;
import com.datablau.metadata.main.dto.model.SimpleModel;
import com.datablau.metadata.main.dto.report.bi.BIReport;
import com.datablau.metadata.main.dto.report.bi.BIServerInfo;
import com.datablau.metadata.main.dto.report.bi.BIServerStaticValue;
import com.datablau.metadata.main.entity.metadata.DataObject;
import com.datablau.metadata.main.entity.metadata.DataObjectCompare;
import com.datablau.metadata.main.entity.model.Model;
import com.datablau.metadata.main.entity.model.ModelCompareResult;
import com.datablau.metadata.main.entity.model.ModelMapping;
import com.datablau.metadata.main.ext.impl.AServiec;
import com.datablau.metadata.main.service.metadata.api.DataObjectService;
import com.datablau.metadata.main.service.metamodel.MetaModelService;
import com.datablau.metadata.main.service.model.api.DataModelService;
import com.datablau.metadata.main.service.model.api.DataModelVersionService;
import com.datablau.metadata.main.service.model.api.DataModelXService;
import com.datablau.metadata.main.service.model.dto.CCompareDto;
import com.datablau.metadata.main.service.model.dto.LogicalModelUploaderResultDto;
import com.datablau.metadata.main.service.model.dto.ModelImportErrorDto;
import com.datablau.metadata.main.service.model.impl.DataModelServiceImpl;
import com.datablau.metadata.main.service.model.utils.LogicalModelExporter;
import com.datablau.metadata.main.service.report.api.DataReportService;
import com.datablau.metadata.main.service.report.bi.base.api.BIParserService;
import com.datablau.metadata.main.service.report.bi.base.api.BIParserServiceFactory;
import com.datablau.metadata.main.service.share.file.api.DataShareFileService;
import com.datablau.metadata.main.service.tag.TagServiceLocal;
import com.datablau.metadata.main.type.LogicNameSyncType;
import com.datablau.metadata.main.type.ModelTreeNodeType;
import com.datablau.metadata.main.util.DataUtility;
import com.datablau.metadata.main.util.DatasourceHelper;
import com.datablau.metadata.main.util.FileUtility;
import com.datablau.metadata.main.util.RemoteServiceGetter;
import com.datablau.metadata.main.util.ServerConstants;
import com.datablau.reverse.engineering.worker.nonjdbc.ReverseForwardStrategyDataDictionary;
import com.datablau.reverse.engineering.worker.nonjdbc.ReverseForwardStrategyLogicalDataDictionary;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.dto.OrganizationDto;
import com.datablau.security.management.utils.AuthTools;
import com.datablau.udp.jpa.entity.MetadataUserDefinedProperty;
import com.datablau.udp.jpa.entity.MetadataUserDefinedPropertyValue;
import com.datablau.udp.service.api.MetadataUserDefinedPropertyService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.xml.sax.SAXException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.ParserConfigurationException;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Properties;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

/**
 * @author baobao
 */
@RestController
@RequestMapping("/models")
@Tag(name = "数据源", description = "/models")
public class ModelController extends BaseController {
    private static final Logger logger = LoggerFactory.getLogger(ModelController.class);
    private static final ObjectMapper mapper = new ObjectMapper();

    @Autowired
    private DataModelService dataModelService;
    @Autowired
    private DataModelXService dataModelXService;
    @Autowired
    private DataModelVersionService dataModelVersionService;
    @Autowired
    private DataObjectService dataObjectService;
    @Autowired
    private ModelMappingRepository modelMappingRepo;
    //todo 7.0 tag
//    @Autowired
//    private TagDao tagDao;
    //todo 7.0 安全
//    @Autowired
//    private DataSecurityInfoService dataSecurityInfoService;
    @Autowired
    private MessageService msgService;
    @Autowired
    private DynamicLoadingService dynamicLoadingService;
    @Autowired
    private DataShareFileService fileService;
    @Autowired
    private FileUtility fileUtility;
    @Autowired
    private RestTemplate restTemplate;
    @Autowired
    private InstantJobService instantJobService;
    //todo 7.0 job
//    @Autowired
//    protected JobRepository jobRepo;
    @Autowired
    PropertyService propertyService;

    @Autowired
    private DatasourceHelper datasourceHelper;

    @Autowired
    private UserService userService;
    @Autowired
    private OperationLogService operationLogService;
    @Autowired
    private MetaModelService metaModelService;
    @Autowired
    private KafkaProducer kafkaProducer;

    @Autowired
    private DataObjectRepository dataObjectRepository;

    @Value("${datablau.kafka-topic.metadata-increment:datablau-metadata-increment}")
    private String metadataIncrementKafkaTopic;


    SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");

    private static String TablePattern = "DUMP_TABLES";

    //todo 7.0 安全
//    @Autowired
//    private DataSecurityCatalogElementRelService dataSecurityCatalogElementRelService;
    @javax.annotation.Resource
    private ModelCategoryService modelCategoryService;

    @Value("${ddm.server.rest.base_url:}")
    private String ddmRestBaseUrl;

    public ModelController(@Autowired RoleService roleService){
        super(ServerConstants.SERVER_TYPE, roleService);
    }


    @RequestMapping("/number")
    public long validateModelMumber() {
        return 1000L;
    }

    @Operation(summary = "获取所有RE出来的数据源")
    @RequestMapping("/fromre/")
    @Description("获取所有RE出来的数据源")
    public Collection<ModelDto> getUserModels(
        @Description("显示逻辑模型，而不显示逻辑模型之下的") @RequestParam(value = "showLogicalModel", defaultValue = "false") boolean showLogicalModel,
        @Description("只返回jdbc类型的数据源") @RequestParam(value = "onlyJdbc", defaultValue = "false") boolean onlyJdbcModels,
        @Description("是否返回逻辑实体") @RequestParam(value = "includeLogicalEntity", defaultValue = "true") boolean includeLogicalEntity,
        @Description("是否返回可连接数据源") @RequestParam(value = "dataConnection", defaultValue = "false") boolean dataConnection) {
        Collection<Model> models = dataModelService.getUserModels(showLogicalModel);
        if (onlyJdbcModels) {
            models = models.stream().filter(m->m.getJdbcModel()).collect(Collectors.toList());
        }
        models.removeIf(m -> {
            if(!includeLogicalEntity && ReverseForwardStrategyLogicalDataDictionary.LOGICAL_MODEL_TYPE.equals(m.getType())) {
                return true;
            }
            if (dataConnection) {
                if (DataConnect.DISABLED.equals(m.getDataConnect()) ||
                        getNotConnectionModelType().contains(m.getType())) {
                    return true;
                }
            }
            return false;
        });

        return convertToModelDtos(models, false);
    }

    @Operation(summary = "获取所有RE出来的数据源")
    @RequestMapping("/fromre/hive")
    @Description("获取所有RE出来的数据源")
    public Collection<ModelDto> getUserModelsByHive(
            @Description("显示逻辑模型，而不显示逻辑模型之下的") @RequestParam(value = "showLogicalModel", defaultValue = "false") boolean showLogicalModel,
            @Description("只返回jdbc类型的数据源") @RequestParam(value = "onlyJdbc", defaultValue = "false") boolean onlyJdbcModels,
            @RequestParam(value = "categoryId", required = false ) Long categoryId, @RequestParam(value = "type", defaultValue = "HIVE") String type) {
        Collection<Model> models = dataModelService.getUserModels(showLogicalModel);
        if (onlyJdbcModels) {
            models = models.stream().filter(m->m.getJdbcModel()).collect(Collectors.toList());
        }
        //返回hive类型数据源
        models = models.stream().filter(m -> type.equals(m.getType())).collect(Collectors.toList());
        if (Objects.nonNull(categoryId)) {
            models = models.stream().filter(m -> m.getCategoryId().equals(categoryId)).collect(Collectors.toList());
        }
        return convertToModelDtos(models, false);
    }


    @Operation(summary = "获取所有RE出来的数据源")
    @RequestMapping("/fromreByCatelog")
    @Description("获取所有RE出来的数据源")
    public Collection<ModelDto> getUserModelsByCatelog(
            @Description("显示逻辑模型，而不显示逻辑模型之下的") @RequestParam(value = "showLogicalModel", defaultValue = "false") boolean showLogicalModel,
            @Description("只返回jdbc类型的数据源") @RequestParam(value = "onlyJdbc", defaultValue = "false") boolean onlyJdbcModels,
            @RequestParam(value = "categoryId", required = false ) Long categoryId) {
        Collection<Model> models = dataModelService.getUserModels(showLogicalModel);
        if (onlyJdbcModels) {
            models = models.stream().filter(m->m.getJdbcModel()).collect(Collectors.toList());
        }

        if (Objects.nonNull(categoryId)) {
            models = models.stream().filter(m -> m.getCategoryId().equals(categoryId)).collect(Collectors.toList());
        }
        return convertToModelDtos(models, false);
    }

    @Operation(summary = "获取所有RE出来的数据源不做权限校验")
    @RequestMapping("/fromreunsafe/")
    @Description("获取所有RE出来的数据源不做权限校验")
    public Collection<ModelDto> getJdbcModels(
        @Description("显示逻辑模型，而不显示逻辑模型之下的") @RequestParam(value = "showLogicalModel", defaultValue = "false") boolean showLogicalModel) {
        return convertToModelDtos(dataModelService.getJdbcModels(showLogicalModel), false);
    }

    @Operation(summary = "分页获取数据源")
    @PostMapping("/fromre/page")
    @Description("分页获取数据源")
    public PageResult<ModelDto> getModelsPage(
        @Description("显示逻辑模型，而不显示逻辑模型之下的") @RequestParam(value = "showLogicalModel", defaultValue = "false") boolean showLogicalModel,
        @RequestBody ModelQueryDto queryDto) {
        return dataModelService.getModelsPageWithSort(queryDto, showLogicalModel, queryDto.getFilterModelTypes());
    }

    @Operation(summary = "分页获取数据源不包括共享文件夹和报表")
    @PostMapping("/fromre/filter/page")
    @Description("分页获取数据源")
    public PageResult<ModelDto> getModelsPageFilter(
            @Description("显示逻辑模型，而不显示逻辑模型之下的") @RequestParam(value = "showLogicalModel", defaultValue = "false") boolean showLogicalModel,
            @RequestBody ModelQueryDto queryDto) {

        List<String> filterType = Arrays.asList("SMBSHAREFILE",
                BIReportType.FINE.getDisplayName(),
                BIReportType.FINE_REPORT.getDisplayName(),
                BIReportType.SMARTBI.getDisplayName(),
                BIReportType.YONGHONG.getDisplayName(),
                BIReportType.COGNOS.getDisplayName(),
                BIReportType.DAVINCI.getDisplayName());

        return dataModelService.getModelsPageWithSort(queryDto, showLogicalModel, filterType);
    }

    @Operation(summary = "获取所有RE出来的数据源，不包括文件类数据源")
    @RequestMapping("/fromre/range")
    @Description("获取所有RE出来的数据源，不包括文件类数据源")
    public Collection<ModelDto> getDataRangeModelsFromRE(
        @Description("显示逻辑模型，而不显示逻辑模型之下的") @RequestParam(value = "showLogicalModel", defaultValue = "false") boolean showLogicalModel,
        @Description("是否返回逻辑实体") @RequestParam(value = "includeLogicalEntity", defaultValue = "true") boolean includeLogicalEntity) {
        Collection<ModelDto> modelDtos = convertToModelDtos(dataModelService.getUserModels(showLogicalModel), false);
        Iterator<ModelDto> iter = modelDtos.iterator();
        while (iter.hasNext()) {
            ModelDto dto = iter.next();
            if (dto.getType().equals("SMBSHAREFILE")) {
                iter.remove();
            }
        }
        modelDtos.removeIf(m -> !includeLogicalEntity && ReverseForwardStrategyLogicalDataDictionary.LOGICAL_MODEL_TYPE.equals(m.getType()));
        return modelDtos;
    }

    @Operation(summary = "获取模型树，路径是模型所属的系统相关属性")
    @RequestMapping("/modeltree")
    @Description("获取模型树，路径是模型所属的系统相关属性")
    public ModelTreeNodeDto getModelTree(@RequestParam(required = false) Boolean dataConnection,
                                         @RequestParam(required = false) Boolean includeLogicalEntity,
                                         @RequestParam(required = false) String metaModels) {
        ModelTreeNodeDto root = new ModelTreeNodeDto();
        root.setType(ModelTreeNodeType.ROOT);
        root.setName("_root");

        Map<String, ModelTreeNodeDto> itDepartMap = new HashMap<>();
        Map<Long, ModelTreeNodeDto> modelCategoryMap = new HashMap<>();

        for (ModelCategoryDto category : modelCategoryService.getModelCategories()) {
            ModelTreeNodeDto node = new ModelTreeNodeDto();
            if (!itDepartMap.containsKey(category.getItDepartmentPath())) {
                ModelTreeNodeDto itNode = new ModelTreeNodeDto();
                itNode.setName(category.getItDepartmentPath());
                itNode.setType(ModelTreeNodeType.IT_DEPART);
                root.addSubNode(itNode);
                itDepartMap.put(itNode.getName(), itNode);
            }

            ModelTreeNodeDto parent = itDepartMap.get(category.getItDepartmentPath());
            node.setType(ModelTreeNodeType.MODEL_CATEGORY);
            node.setId(category.getCategoryId());
            node.setName(category.getCategoryName() + "(" + category.getCategoryAbbreviation() + ")");
            parent.addSubNode(node);
            modelCategoryMap.put(node.getId(), node);
        }

        Map<Long, List<String>> schemaMap = dataObjectService.getAllModelSchemas();

        Map<Long, ModelTreeNodeDto> modelNodeMap = new HashMap<>();

        List<String> notConnectDatasourceType = Lists.newArrayList("DATADICTIONARY", "DATADICTIONARY_LOGICAL",
                "SMBSHAREFILE", "YONGHONG", "COGNOS", "FINE", "SMARTBI", "DAVINCI", "FINE_REPORT",
                "ES", "MONGODB", "HBASE");


        for (SimpleModel model : dataModelService.getSimpleModelsUnsafe()) {
            if (includeLogicalEntity != null && !includeLogicalEntity) {
                if (ReverseForwardStrategyLogicalDataDictionary.LOGICAL_MODEL_TYPE.equals(model.getDatasourceType())) {
                    continue;
                }
            }
            if (!modelCategoryMap.containsKey(model.getCategoryId())) {
                continue;
            }
            if (!Strings.isNullOrEmpty(metaModels)) {
                List<String> metaModelList = Arrays.asList(metaModels.split(","));
                if (!metaModelList.contains(model.getMetaModelCode())) {
                    continue;
                }
            }
            if (dataConnection != null && dataConnection) {
                if (DataConnect.DISABLED.equals(model.getDataConnect()) ||
                        getNotConnectionModelType().contains(model.getDatasourceType())) {
                    continue;
                }
                if (notConnectDatasourceType.contains(model.getDatasourceType())) {
                    continue;
                }
            }
            if (model.getDatasourceType() != null && "SMBSHAREFILE".equals(model.getDatasourceType()))
                continue;

            if ((Strings.isNullOrEmpty(model.getMetaModelCode()) || Objects.equals(model.getMetaModelCode(), "LDM"))
                    && model.getNotLoaded() && !model.getLogicalModel()) {
                continue;
            }

            ModelTreeNodeDto node = new ModelTreeNodeDto();
            node.setName(model.getName());
            node.setType(ModelTreeNodeType.MODEL);
            node.setId(model.getId());
            node.setMetaModelCode(model.getMetaModelCode());
            if (!Strings.isNullOrEmpty(model.getSelectedSchema()) && !model.getLogicalModel()) {
                node.setName(model.getSelectedSchema());
                node.setType(ModelTreeNodeType.MODEL_SCHEMA);
                if (model.getParentModelId() != model.getId()) {
                    node.setParentId(model.getParentModelId());
                    node.addModelId(node.getId());
                }
            } else {
                List<String> schemas = schemaMap.get(model.getId());
                if (schemas != null) {
                    for (String schema : schemas) {
                        ModelTreeNodeDto schemaNode = new ModelTreeNodeDto();
                        schemaNode.setType(ModelTreeNodeType.SCHEMA);
                        schemaNode.setName(schema);
                        schemaNode.setId(node.getId());
                        node.addSubNode(schemaNode);
                    }
                }
                node.addModelId(node.getId());
                modelCategoryMap.get(model.getCategoryId()).addSubNode(node);
            }

            modelNodeMap.put(node.getId(), node);
        }

        modelNodeMap.values().forEach(m->{
            if (m.getParentId() != null) {
                ModelTreeNodeDto node = modelNodeMap.get(m.getParentId());
                if (node != null) {
                    node.addSubNode(m);
                }
            }
        });

        return root;
    }

    protected List<String> getNotConnectionModelType() {
        return Lists.newArrayList("ES", "OFFLINEDUMP_RAW", "OFFLINEDUMP", "MONGODB",
                "DATADICTIONARY", "DATADICTIONARY_LOGICAL", "SMBSHAREFILE", "YONGHONG", "COGNOS",
                "FINE", "SMARTBI", "DAVINCI", "FINE_REPORT", "ES", "MONGODB", "HBASE");
    }

    @Operation(summary = "获得一个系统下的所有数据源信息")
    @RequestMapping("/category/{categoryId}")
    @Description("获得一个系统下的所有数据源信息")
    public Collection<ModelDto> getModelsOfCategory(
            @Parameter(name = "categoryId", description = "系统id", required = true)
            @PathVariable("categoryId") Long categoryId) {
        return convertToModelDtos(dataModelService.getModelsOfCategory(categoryId), false);
    }

    @Operation(summary = "获得一个系统下的所有数据源简单信息")
    @RequestMapping("/category/{categoryId}/simple")
    @Description("获得一个系统下的所有数据源简单信息")
    public Collection<ModelInfoDto> getSimpleModelsOfCategory(
            @Parameter(name = "categoryId", description = "系统id", required = true)
            @PathVariable("categoryId") Long categoryId) {
        return dataModelService.getSimpleModelsOfCategory(categoryId);
    }

    //@RequestMapping("/{modelId}/compareResult")
    public CCompareDto compareDamModelToDdmModel(@PathVariable("modelId") Long modelId) {
        //return dataModelVersionService.compareDamModelToBindedDdmModel(modelId);
        return dataModelVersionService.getCompareResultForDamModelAndBindedDdmModel(modelId);
    }

    @RequestMapping("/{modelId}/{modelVersionId}/compareResult/{mappingId}/{ddmModelId}/{ddmModelVersionId}")
    public CCompareDto getCompareResultForDamModelAndDdmModel(@PathVariable("modelId") Long modelId, @PathVariable("modelVersionId") Long modelVersionId,
                                                              @PathVariable("mappingId") Long mappingId,
                                                              @PathVariable("ddmModelId") Long ddmModelId, @PathVariable("ddmModelVersionId") String ddmModelVersionId) {
        //return dataModelVersionService.compareDamModelToBindedDdmModel(modelId);
        Long ddmModelVersion = null;
        if (!ddmModelVersionId.equalsIgnoreCase("null")) {
            ddmModelVersion = Long.parseLong(ddmModelVersionId);
        }

        return dataModelVersionService.getCompareResultForDamModelAndBindedDdmModel(mappingId, modelId, modelVersionId, ddmModelId, ddmModelVersion);
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "dam_model",
//            systemModule = OperationModuleType.METADATA_DATA,
//            description = "导出模型差异详情"
//    )
    @RequestMapping("/{modelId}/{modelVersionId}/compareResultFile/{mappingId}/{ddmModelId}/{ddmModelVersionId}")
    public ResponseEntity<Resource> getCompareResultFileForDamModelAndDdmModel(@PathVariable("modelId") Long modelId, @PathVariable("modelVersionId") Long modelVersionId,
                                                                               @PathVariable("mappingId") Long mappingId,
                                                                               @PathVariable("ddmModelId") Long ddmModelId, @PathVariable("ddmModelVersionId") String ddmModelVersionId) throws Exception {
        Long ddmModelVersion = null;
        if (!ddmModelVersionId.equalsIgnoreCase("null")) {
            ddmModelVersion = Long.parseLong(ddmModelVersionId);
        }

        ByteArrayOutputStream bos = null;
        try {
            Workbook wb = dataModelVersionService.exportCompareResultForDamModelAndBindedDdmModel(mappingId, modelId, modelVersionId, ddmModelId, ddmModelVersion);
            bos = new ByteArrayOutputStream();
            wb.write(bos);
            wb.close();

            Model model = dataModelService.getModelByIdUnsafe(modelId);
            String filename = msgService.getMessage("modelControl.compareFile", model.getDefinition());

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

//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "dam_element",
//            systemModule = OperationModuleType.METADATA_DATA,
//            description = "下载详情"
//    )
    @RequestMapping("/{modelId}/{modelVersionId}/updateCompareResultFile")
    public ResponseEntity<Resource> getCompareResultFileForDamModelAndDdmModel(@PathVariable("modelId") Long modelId, @PathVariable("modelVersionId") Long modelVersionId) throws Exception {
        ByteArrayOutputStream bos = null;
        try {
            Workbook wb = dataModelVersionService.exportCompareResultForDamModelVersion(modelId, modelVersionId);
            bos = new ByteArrayOutputStream();
            wb.write(bos);
            wb.close();

            Model model = dataModelService.getModelByIdUnsafe(modelId);
            String filename = msgService.getMessage("modelControl.versionFile", model.getDefinition(), modelVersionId);

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

    @RequestMapping("/sync/history/{mappingId}")
    public List<ModelSyncHistoryDto> getModelSyncHistory(@PathVariable("mappingId") Long mappingId) {
        return dataModelService.getModelSyncHistory(mappingId);
    }

    @RequestMapping("/sync/history/{mappingId}/{syncTime}")
    public ModelSyncHistoryDto getModelSyncHistoryByMappingIdAndSyncTime(@PathVariable("mappingId") Long mappingId, @PathVariable("syncTime") Long syncTime) {
        return dataModelService.getModelSyncHistoryByMappingIdAndTime(mappingId, syncTime);
    }


    @RequestMapping("/{modelId}/schemas")
    public List<String> getSchemasOfDamModel(@PathVariable("modelId") Long modelId) throws Exception {
        //return dataModelVersionService.compareDamModelToBindedDdmModel(modelId);
        return dataModelService.getSchemas(modelId);
    }

    @RequestMapping("/{modelId}/compareMappings")
    public List<ModelMapping> getDamModelToDdmModelMappings(@PathVariable("modelId") Long modelId) {
        //return dataModelVersionService.compareDamModelToBindedDdmModel(modelId);
        return modelMappingRepo.getByDamModelId(modelId);
    }

    @PostMapping("/model/modelNames")
    public Map<Long, String> getDamModelToDdmModelMappings(@RequestBody List<Long> modelIds) {
        if (modelIds == null || modelIds.isEmpty()) return null;
        return dataModelService.findModelNames(modelIds);
    }

    @RequestMapping(value = "/{modelId}/{mappingId}/compareResultHistory")
    public List<ModelCompareResult> compareDamModelToDdmModelList(@PathVariable("modelId") Long modelId, @PathVariable("mappingId") Long mappingId) {
        //return dataModelVersionService.compareDamModelToBindedDdmModel(modelId);
        return dataModelVersionService.getCompareResultHistoryForDamModelMapping(modelId, mappingId);
    }
    //todo 7.0 这个应该不再需要了，因为连接测试在datasource里面，在base里面，这里暂时标注下
//
//    @Operation(summary = "模型连接测试")
//    @RequestMapping("/connection/test/{modelId}")
//    //@PreAuthorize(UserRights.PRE_AUTH_ADMIN_MODEL_BY_ID)
//    //todo 7.0 AuditLog
////    @AuditLog(auditParams = true)
//    public void checkConnective(
//            @Parameter(name = "modelId", description = "数据源ID", required = true)
//            @PathVariable("modelId") Long modelId) throws Exception {
//        Model model = dataModelService.getModelEntity(modelId);
//        dataModelService.tryAdminModel(model);
//        DatasourceProperties properties = model.getConnectionInfo();
//        testConnectionInfo(properties);
//    }
//
//    @Operation(summary = "测试模型连接信息是否正确")
//    @RequestMapping(value = "/connection/test", method = RequestMethod.POST)
//    //todo 7.0 AuditLog
////    @AuditLog(auditParams = true)
//    public void testConnectionInfo(@RequestBody DatasourceProperties datasource) throws Exception {
//        if (datasource.getType() == null) {
//            Map<String, String> parameterMap = datasource.getParameterMap();
//            String jobId = parameterMap.get(BIServerStaticValue.BI_JOB_ID);
//            if (jobId != null) {
//                String biServerInfo = parameterMap.get(BIServerStaticValue.BI_SERVER_INFO);
//                BIServerInfo biServer = mapper.readValue(biServerInfo, BIServerInfo.class);
//                String biType = parameterMap.get(BIServerStaticValue.BI_TYPE);
//                boolean isConnect = biReportImportService
//                        .testConnectionToBIServer(biServer, BIReportType.valueOf(biType));
//                if (isConnect == true) return;
//                throw new InvalidArgumentException(msgService.getMessage("typeOfDatasourceNotpreset"));
//            }
//        }
//
//        DataAccessDriver driver = driverService.getAccessDriver(datasource);
//        if (driver == null) {
//            throw new InvalidArgumentException(
//                    msgService.getMessage("currentDatasourceTypeNotSupported"));
//        }
//
//        try {
//            if (driver != null && driver.connect()) {
//                driver.testConnection();
//            } else {
//                throw new UnexpectedStateException(msgService.getMessage("datasourceDisconnected"));
//            }
//        } finally {
//            if (driver != null) {
//                driver.close();
//            }
//        }
//    }

    @Operation(summary = "获取某个模型的详细信息")
    @RequestMapping("/{modelId}/plain")
    public ModelDto getModelById(
            @Parameter(name = "modelId", description = "数据源ID", required = true)
            @PathVariable("modelId") Long modelId) {
        Model modelByIdUnsafe = dataModelService.getModelByIdUnsafe(modelId);
        ModelDto modelDto = convertToModelDto(modelByIdUnsafe, false);

        if (modelDto != null && modelDto.getLogicalModel()) {
            List<Model> children = dataModelService.findByParentId(modelDto.getModelId());
            if (!children.isEmpty()) {
                modelDto.setChildrenModelIds(children.stream().map(Model::getModelId).collect(Collectors.toSet()));
                StringBuilder schemas = new StringBuilder();
                StringBuilder owners = new StringBuilder();
                for (Model o : children) {
                    if (!Strings.isNullOrEmpty(o.getSchema())) {
                        schemas.append(o.getSchema()).append(";");
                    }
                    if (!Strings.isNullOrEmpty(o.getOwner())) {
                        owners.append(o.getOwner()).append(";");
                    }
                }
                modelDto.setOwner(Strings.isNullOrEmpty(owners.toString()) ? null : owners.toString());
                modelDto.setSchema(Strings.isNullOrEmpty(schemas.toString()) ? null : schemas.toString());
            }
        }

        if (modelByIdUnsafe.getDatasourceId() != null) {
            DatasourceProperties datasourceProperties = datasourceHelper.getDatasourcePropertiesByDatasourceId(modelByIdUnsafe.getDatasourceId());
            Map<String, String> parameterMap = datasourceProperties.getParameterMap();
            modelDto.getReverseOptions().putAll(parameterMap);
            modelDto.setDatasourceName(datasourceProperties.getSourceName());
            modelDto.setDriverId(datasourceProperties.getDriverId());
        }

        if (modelByIdUnsafe.getBackupDatasourceId() != null) {
            DatasourceProperties backupDatasource = datasourceHelper.getDatasourcePropertiesByDatasourceId(modelByIdUnsafe.getBackupDatasourceId());
            if (backupDatasource != null) {
                modelDto.setBackupDatasourceName(backupDatasource.getSourceName());
            }
        }
        return modelDto;
    }

    @RequestMapping("/{modelId}/xml")
    public String getModelContext(@PathVariable("modelId") Long modelId) throws Exception {
        ModelX model = dataModelXService.loadModelx(modelId, null);
        return model.exportXML();
    }


//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "dam_model",
//            systemModule = OperationModuleType.METADATA_MODEL,
//            description = "删除数据源，modelId为: {param}",
//            descriptionParamClass = ModelRequestDto.class,
//            descriptionParamMethod = "getModelIds"
//    )
    @Operation(summary = "删除数据源，返回jobId")
    @RequestMapping(value = "/delmodel", method = RequestMethod.POST)
    public String removeDataModel(@RequestBody ModelRequestDto dto) throws Exception {
        String jobId = dataModelService.deleteModel(dto.getModelIds());

        //增加日志
        addModelDeleteLog(dto);

        return jobId;
    }

    protected void addModelDeleteLog(ModelRequestDto dto) {
        try {
            List<Model> models = dataModelService.getDataModelByIds(dto.getModelIds());
            for (Model model : models) {
                String logMessage = msgService.getMessage("metadata.model.log.delete", model.getDefinition());
                operationLogService.generateOperationLog(OperationModuleType.METADATA_MODEL, "dam_model",
                        OperationLogType.TABLE_DELETE, logMessage, AuthTools.currentUsername(), 0);
            }
        } catch (Exception e) {
            logger.error(e.getMessage());
        }
    }

    @Operation(summary = "修改数据源的所有者")
    @RequestMapping(value = "/{modelId}/owner", method = RequestMethod.PUT)
    @Description("修改数据源的所有者")
    public void changeModelOwner(@Description("数据源ID")
                                 @Parameter(name = "modelId", description = "数据源ID", required = true)
                                 @PathVariable("modelId") Long modelId,

                                 @Description("新的所有者")
                                 @Parameter(name = "owner", description = "新的所有者", required = true)
                                 @RequestParam("owner") String owner) {
        dataModelService.changeModelOwner(modelId, owner);
    }

    //todo 7.0 修改数据源接口这个要重写，需要重新定义一下
//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_common_job",
//            systemModule = OperationModuleType.METADATA_MODEL,
//            description = {"修改数据源,名为:", "2", "sourceName"}
//    )
//    @Operation(summary = "修改数据源")
//    @RequestMapping(value = "/{modelId}", method = RequestMethod.PUT)
//    //@PreAuthorize(UserRights.EDIT_DATA_SOURCE)
//    public ModelDto updateModel(
//            @Parameter(name = "modelId", description = "数据源ID", required = true)
//            @PathVariable("modelId") Long modelId,
//            @RequestBody DatasourceProperties datasource) {
//
//        Model saved = dataModelService.tryAdminModel(modelId);
//
//        checkDatasourceNameDuplication(datasource.getSourceName(), modelId, datasource.getModelCategoryId());
//        Model model = new Model();
//        model.setModelId(modelId);
//        model.setDefinition(datasource.getSourceName());
//        if (datasource.getCredentialInfo() == null) {
//            datasource.setCredentialInfo(saved.getConnectionInfo().getCredentialInfo());
//            datasource.getCredentialInfo().setPassword(
//                    DigestUtils.decryptIfIsEncrypted(datasource.getCredentialInfo().getPassword()));
//        }
//        model.setConnectionInfo(datasource);
//        model.setCategoryId(datasource.getModelCategoryId());
//        model.setType(datasource.getType());
//        model.setDataConnect(datasource.getDataConnect());
//        model.setBackupDatasourceId(datasource.getBackupDatasourceId());
//        model.setDriverId(datasource.getDriverId());
//        model.setDataSample(datasource.getDataSample());
//        dataSecurityInfoService.refresh(modelId);
//        return convertToModelDto(dataModelService.updateModel(model, datasource.getType()), true);
//    }

    @Operation(summary = "测试文件类数据源连接信息是否正确")
    @RequestMapping(value = "/re/shareFile", method = RequestMethod.PUT)
    public void getShareFile(@RequestBody DatasourceProperties datasource) throws Exception {
        fileService.testConnected(datasource);
    }

    //todo 7.0 这个也要移动到base里面
//    @Operation(summary = "获取所有数据库")
//    @RequestMapping(value = "/re/dbs", method = RequestMethod.PUT)
//    public String getDatabases(@RequestBody DatasourceProperties datasource) throws Exception {
//
//        //set time zone
//        String timeZone = BeanHelper.getBean(PropertyService.class).getProperty("server.db.timeZone", "CST");
//        datasource.getParameterMap().put(DatasourceKnownParameterType.TimeZone.name(), "&serverTimezone=" + timeZone);
//
//        String metadataxml = null;
//        if (datasource != null) {
//            DataAccessDriver driver = driverService.getAccessDriver(datasource);
//            try {
//                if (driver != null && driver.connect()) {
//                    String allDatabases = driver.getDatabases();
//                    Collection<String> metadataxmlCollection = new ArrayList<>();
//                    if (driver.getType() == DatasourceType.MYSQL || driver.getType() == DatasourceType.GAUSSDB || driver.getType() == DatasourceType.TIDB) {
//                        Collection<String> reserved = new ArrayList<String>(Arrays.asList("information_schema", "performance_schema", "mysql"));
//                        String[] allSchemas = allDatabases.split(";");
//                        for (String schema : allSchemas) {
//                            if (!reserved.contains(schema.toLowerCase())) {
//                                metadataxmlCollection.add(schema);
//                            }
//                        }
//                        metadataxml = String.join(";", metadataxmlCollection);
//                    } else {
//                        metadataxml = allDatabases;
//                    }
//                }
//            } finally {
//                if (driver != null) {
//                    try {
//                        driver.close();
//                    } catch (Exception ex) {
//                    }
//                }
//            }
//
//        }
//        if (metadataxml == null)
//            throw new Exception("Connection Fails");
//        return metadataxml;
//    }

    //todo 7.0 移动到base里面
//    @Operation(summary = "获取所有的schema")
//    @RequestMapping(value = "/re/schemas", method = RequestMethod.PUT)
//    public String getSchemas(@RequestBody DatasourceProperties datasource) throws Exception {
//        String metadataxml = null;
//
//        if (datasource != null) {
//            DataAccessDriver driver = driverService.getAccessDriver(datasource);
//            try {
//                if (driver != null && driver.connect()) {
//                    String allSchemasString = driver.getSchemas();
//                    Collection<String> metadataxmlCollection = new ArrayList<>();
//                    if (driver.getType() == DatasourceType.ORACLE) {
//                        Collection<String> reserved = new ArrayList<String>(Arrays.asList("anonymous", "appqossys", "audsys", "ctxsys", "dbsfwuser", "dbsnmp", "dip", "dvf", "dvsys", "ggsys", "gsmadmin_internal", "gsmcatuser", "gsmrootuser", "gsmuser", "hr", "lbacsys", "mddata", "mdsys", "ojvmsys", "olapsys", "oracle_ocm", "orddata", "ordplugins", "ordsys", "outln", "remote_scheduler_agent", "si_informtn_schema", "sys", "sys$umf", "sysbackup", "sysdg", "syskm", "sysrac", "system", "wmsys", "xdb", "xs$null"));
//                        String[] allSchemas = allSchemasString.split(";");
//                        for (String schema : allSchemas) {
//                            if (!reserved.contains(schema.toLowerCase())) {
//                                metadataxmlCollection.add(schema);
//                            }
//                        }
//                        metadataxml = String.join(";", metadataxmlCollection);
//                    } else {
//                        metadataxml = allSchemasString;
//                    }
//                }
//            } finally {
//                if (driver != null) {
//                    try {
//                        driver.close();
//                    } catch (Exception ex) {
//                    }
//                }
//            }
//        }
//        if (metadataxml == null)
//            throw new Exception("Connection Fails");
//        return metadataxml;
//    }

    //todo 7.0 移动到base里面
//    @Operation(summary = "获取当前的schema")
//    @RequestMapping(value = "/re/curschema", method = RequestMethod.PUT)
//    public String getCurrentSchema(@RequestBody DatasourceProperties datasource) throws Exception {
//        String metadataxml = null;
//        if (datasource != null) {
//            DataAccessDriver driver = driverService.getAccessDriver(datasource);
//            try {
//                if (driver != null && driver.connect()) {
//                    metadataxml = driver.getCurrentSchema();
//
//                    if (metadataxml == null) {
//                        metadataxml = "";
//                    }
//                }
//            } finally {
//                if (driver != null) {
//                    try {
//                        driver.close();
//                    } catch (Exception ex) {
//                    }
//                }
//            }
//        }
//        if (metadataxml == null)
//            throw new Exception("Connection Fails");
//        return metadataxml;
//    }


    @Operation(summary = "获取所有database")
    @RequestMapping(value = "/getOfflineDatabase", method = RequestMethod.POST)
    public List<String> getOfflineDatabase(@RequestParam(value = "datasourceId") Long datasourceId) {
        DatasourceProperties datasourceProperties = datasourceHelper.getDatasourcePropertiesByDatasourceId(datasourceId);
        String schema = datasourceProperties.getSchemas();


        String sql = "select DISTINCT DATABASE_INFO from "
                + (Strings.isNullOrEmpty(schema) ? "" : schema + ".") + TablePattern;

        List<String> databaseList = new ArrayList<>();

        try (JdbcDatasource jdbcDatasource = datasourceHelper.getJdbcDatasource(datasourceProperties);
             Connection connection = jdbcDatasource.getConnection();
             Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery(sql);) {
            while (resultSet.next()) {
                databaseList.add(resultSet.getString(1));
            }
        } catch (Exception e) {
            logger.error("get offline database error, sql:{}", sql, e);
            throw new UnexpectedSystemException("get offline database error", e);
        }
        return databaseList;
    }

    @Operation(summary = "获取所有的schema")
    @RequestMapping(value = "/getOfflineSchema", method = RequestMethod.POST)
    public List<String> getOfflineSchema(@RequestParam(value = "datasourceId") Long datasourceId, @RequestParam(value = "database") String database) {
        DatasourceProperties datasourceProperties = datasourceHelper.getDatasourcePropertiesByDatasourceId(datasourceId);

        String schema = datasourceProperties.getSchemas();


        String sql = "select DISTINCT TABLE_SCHEM from "
                + (Strings.isNullOrEmpty(schema) ? "" : schema + ".") + TablePattern
                + " where DATABASE_INFO = '" + database + "'";

        List<String> schemaList = new ArrayList<>();
        try (JdbcDatasource jdbcDatasource = datasourceHelper.getJdbcDatasource(datasourceProperties);
             Connection connection = jdbcDatasource.getConnection();
             Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery(sql);) {
            while (resultSet.next()) {
                schemaList.add(resultSet.getString(1));
            }
        } catch (Exception e) {
            logger.error("get offline schemas error, sql:{}", sql, e);
            throw new UnexpectedSystemException("get offline schemas error", e);
        }
        return schemaList;
    }





    //todo 7.0 移动到base里面
//    @Operation(summary = "获取离线数据库")
//    @RequestMapping(value = "/re/offlinedump/databases", method = RequestMethod.POST)
//    public List<String> getOfflineDumpDatabaseCandidates(@RequestBody DatasourceProperties datasource) throws Exception {
//        DataAccessDriver driver = driverService.getAccessDriver(datasource);
//
//        if (driver instanceof DataAccessDriverOfflineRawDump) {
//            try {
//                if (driver.connect()) {
//                    return new ArrayList<>(((DataAccessDriverOfflineRawDump) driver).getAvailableDatabases());
//                } else {
//                    throw new InvalidArgumentException("连不上数据库");
//                }
//            } finally {
//                if (driver != null) {
//                    try {
//                        driver.close();
//                    } catch (Exception ex) {
//
//                    }
//                }
//            }
//
//        } else {
//            throw new InvalidArgumentException("只有offlinedump的数据源可以调用此接口");
//        }
//    }


    //todo 7.0 这个创建数据源接口也要修改，引用base里的datasource
//    @RequestMapping(value = "/syncre", method = RequestMethod.POST)
//    @Transactional
//    public ModelDto createDatasourceSync(@RequestBody DatasourceProperties datasource,
//                                         @RequestParam(value = "options", required = false) String optionsString)
//            throws Exception {
//        ModelX model = null;
//        checkDatasourceParameter(datasource);
//        datasource.getCredentialInfo().encryptPassword();
//
//        Map<String, Object> options = new HashMap<>();
//
//        if (!Strings.isNullOrEmpty(optionsString)) {
//            options = mapper.readValue(optionsString, HashMap.class);
//        }
//
//        if (!datasource.getType().equals("ERWIN")) {
//            //todo 7.0 re
////            model = getDatasourceMetadata(datasource, options);
//        } else {
//            String filenames = datasource
//                    .getParameter(DatasourceKnownParameterType.FileNames.toString());
//            if (filenames != null) {
//                String[] filenameArr = filenames.split(
//                        datasource.getParameter(DatasourceKnownParameterType.Delimiter.toString()));
//
//                if (filenameArr.length == 1) {
//                    //todo 7.0 re
////                    model = getDatasourceMetadata(datasource, options);
//                }
//            }
//        }
//
//        if (model != null) {
//            Model createdModel = dataModelService.getModelEntity(model.getId());
//            dataModelService.createModel(createdModel);
//            if (datasource.getCredentialInfo() != null) {
//                datasource.getCredentialInfo().setPassword(null);
//            }
//            return convertToModelDto(createdModel, false);
//        } else {
//            throw new IllegalStateException("Failed to RE the datasource");
//        }
//    }

    //todo 7.0 re
//    private ModelX getDatasourceMetadata(DatasourceProperties datasource,
//                                         Map<String, Object> options) throws Exception {
//        DataAccessDriver driver = null;
//        ModelX metadataxml = null;
//        try {
//            if (datasource != null) {
//                driver = driverService.getAccessDriver(datasource);
//                if (driver != null) {
//                    boolean connected = false;
//                    if (driver instanceof DataAccessDriverJdbc) {
//                        connected = driver.connect(null, true);
//                    } else {
//                        connected = driver.connect();
//                    }
//
//                    if (connected) {
//                        options.put(DataAccessDriver.REVERSE_FINISH_CALLBACK,
//                                new ReverseFinishCallback() {
//                                    @Override
//                                    public void execute(ModelX modelx, ReverseForwardStrategy strategy)
//                                            throws Exception {
//                                        jobService.createMetadataSyncJob(modelx.getId(), modelx.getName());
//                                    jobService.createDomainVerifyJob(modelx.getId(), modelx.getName());
//                                        if (!(strategy instanceof ReverseForwardStrategyShareFile)) {
//                                            jobService.createDamDdmModelCompareJob(modelx.getId(), modelx.getName());
//                                        }
//                                    }
//
//                                    @Override
//                                    public void persist(ModelX model, DatasourceProperties datasource)
//                                            throws Exception {
//                                        ModelUtility.saveModelX(model, datasource);
//                                    }
//                                });
//
//                        options.put(ReverseForwardStrategy.PROGRESS_SAVER, new ReverseForwardObjectSaver(
//                                BeanHelper.getBean(DataObjectService.class),
//                                BeanHelper.getBean(DataModelService.class),
//                                datasource));
//
//                        metadataxml = driver.reverseEngineerModel(options, true);
//                    } else {
//                        throw new IllegalStateException(msgService.getMessage("datasourceDisconnected"));
//                    }
//                }
//            }
//        } catch (Exception e) {
//            throw e;
//        } finally {
//            if (driver != null) {
//                driver.close();
//            }
//        }
//
//        return metadataxml;
//    }

    @Operation(summary = "导出自定义jdbc的jar")
    @RequestMapping(value = "/upload", method = RequestMethod.POST)
    @Description("upload customized jdbc jar")
    public boolean uploadCustJdbcJar(@RequestParam("file") MultipartFile multipartFile) throws Exception {
        File uploadedFile = DataUtility.uploadFile(multipartFile);

        try {
            return dynamicLoadingService.uploadJar(uploadedFile, multipartFile.getOriginalFilename(), AuthTools.currentUsernameNullSafe());
        } finally {
            try {
                uploadedFile.delete();
            } catch (Throwable tw) {

            }
        }
    }


    //todo 7.0 re
//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "dam_common_job",
//            systemModule = OperationModuleType.METADATA_MODEL,
//            description = {"新增数据源名为:", "1", "sourceName"}
//    )
//    @Operation(summary = "创建一个RE的job，返回的是job的ID")
//    @RequestMapping(value = "/re", method = RequestMethod.POST)
//    @Description("创建一个RE的job，返回的是job的ID")
//    @EndpointDoc(bodyExample = "{\n" +
//            "    \"sourceName\": \"test-localhost-20210617142711\",\n" +
//            "    \"@class\": \"com.datablau.dam.data.dto.DatasourceProperties\",\n" +
//            "    \"type\": \"MYSQL\",\n" +
//            "    \"versioning\": true,\n" +
//            "    \"createTime\": \"2021-06-17 14:27:07\",\n" +
//            "    \"connectType\": \"JDBC\",\n" +
//            "    \"parameterMap\": {\n" +
//            "        \"TagIds\": \"\",\n" +
//            "        \"CommentToLogicalName\": true,\n" +
//            "        \"Zone\": \"\",\n" +
//            "        \"Deploy\": \"\",\n" +
//            "        \"State\": \"\",\n" +
//            "        \"Description\": \"\",\n" +
//            "        \"HostServer\": \"localhost\",\n" +
//            "        \"PortNumber\": \"3306\",\n" +
//            "        \"AuthenticationType\": 0,\n" +
//            "        \"DatabaseName\": \"stdcode\",\n" +
//            "        \"ViewFiltered\": false,\n" +
//            "        \"ProceduresFiltered\": false,\n" +
//            "        \"FunctionFiltered\": false\n" +
//            "    },\n" +
//            "    \"categoryId\": 1,\n" +
//            "    \"categoryName\": \"测试系统\",\n" +
//            "    \"modelCategoryId\": 1,\n" +
//            "    \"latestVersion\": \"version_1\",\n" +
//            "    \"credentialInfo\": {\n" +
//            "        \"user\": \"root\",\n" +
//            "        \"password\": \"root\"\n" +
//            "    },\n" +
//            "    \"readMetadata\":false,\n" +
//            "    \"dataConnect\": \"BACKUP\",\n" +
//            "    \"backupDatasourceId\":245100\n" +
//            "\n" +
//            "}")
//    public String createDatasourceAsync(@RequestBody DatasourceProperties datasource,
//                                        @Description("额外的属性")
//                                        @Parameter(name = "options", description = "额外的属性")
//                                        @RequestParam(value = "options", required = false) String optionsString)
//            throws Exception {
//        String jobId = null;
//
//        checkDatasourceParameter(datasource);
//        if (datasource.getCredentialInfo() != null) {
//            datasource.getCredentialInfo().encryptPassword();
//        }
//        Map<String, Object> options = new HashMap<>();
//        if (!Strings.isNullOrEmpty(optionsString)) {
//            options = mapper.readValue(optionsString, HashMap.class);
//        }
//        options.put("readMetadata", datasource.isReadMetadata());
//
//        // enterprise agent re validate license alone
//        if( datasource.getType() == DatasourceType.AGENT) {
//            long fe = lic.getRv();
//            if (ObjectUtils.notEqual(fe & LicenseInfo.FE_ENT, LicenseInfo.FE_ENT)) {
//                throw new LicenseNotSupportException("The operation is not supported by "
//                        + "the current certificate", "ModelController", "createDatasourceAsync");
//            }
//        }
//
//        if(datasource.getType() != DatasourceType.ERWIN){
//            if(datasource.getType() == DatasourceType.AGENT){
//                datasource.getParameterMap().put("agentUsername", AuthTools.currentUsernameFailFast());
//                logger.info("configurable.agent.batch.size:" + DynamicConfigurations.INSTANCE.getPropertyValue("configurable.agent.batch.size"));
//                datasource.getParameterMap().put("batchSize", DynamicConfigurations.INSTANCE.getPropertyValue("configurable.agent.batch.size"));
//            }
//            jobId = getDatasourceMetadataAsync(datasource, options);
//        } else {
//            String filenames = datasource
//                    .getParameter(DatasourceKnownParameterType.FileNames.toString());
//            if (filenames != null) {
//                String[] filenameArr = filenames.split(
//                        datasource.getParameter(DatasourceKnownParameterType.Delimiter.toString()));
//
//                if (filenameArr.length == 1) {
//                    jobId = getDatasourceMetadataAsync(datasource, options);
//                }
//            }
//        }
//
//        return jobId;
//    }

    @Operation(summary = "创建报表数据源")
    @RequestMapping(value = "/re/report", method = RequestMethod.POST)
    public Long createReportDataSource(@RequestBody ModelParamDto model) {

        try {
            Long jobId = dataModelService.createReportDataSource(model);

            //增加日志
            addModelCommonLog(model, "metadata.model.report.log");

            return jobId;
        } catch (Exception e) {
            logger.warn(e.getMessage(), e);
            throw new UnexpectedStateException(msgService.getMessage("modelControl.sourceFailed"), e);
        }
    }

    public void deleteReportDataSource() {

    }


    //todo 7.0 job
//    @RequestMapping("/re/{jobId}/progress")
//    public JobProgress getJobProgress(@PathVariable("jobId") String jobId) throws Throwable {
//        JobProgress progress = jobMonitor.getCurrentStatus(jobId);
//        if (progress == null) {
//            return null;
//        }
//
//        return progress;
//    }

    //todo 7.0 re
//    @Operation(summary = "获取数据源任务执行结果")
//    @RequestMapping("/re/{jobId}/result")
//    public ModelDto getJobResult(
//            @Parameter(name = "jobId", description = "任务id", required = true)
//            @PathVariable("jobId") String jobId) throws Throwable {
//        ModelX model = DataAccessDriverBase.getReverseEngineerModelResult(jobId);
//
//        if (model == null) {
//            return null;
//        } else {
//            return convertToModelDto(dataModelService.getModelEntity(model.getId()), false);
//        }
//    }

    private ModelDto convertToModelDto(Model model, boolean simple) {
        return convertToModelDtos(Arrays.asList(model), simple).get(0);
    }

    private List<ModelDto> convertToModelDtos(Collection<Model> models, boolean simple) {
        if (models == null || models.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> modelIds = models.stream().map(x -> x.getModelId()).collect(Collectors.toList());
        Map<Long, String> owners = dataObjectService.getObjectOwners(modelIds);

        List<ModelDto> result = new ArrayList<>(models.size());
        Set<Long> categoryIds = new HashSet<>();

        for (Model model : models) {
            ModelDto modelDto = model.toDto();
            if (StringUtils.isNotBlank(owners.get(model.getModelId()))) {
                modelDto.setOwner(owners.get(model.getModelId()));
            }
            result.add(modelDto);
            categoryIds.add(model.getCategoryId());
        }

        Map<Long, ModelCategoryDto> categoryMap = new HashMap<>();
        for (ModelCategoryDto category : modelCategoryService.getModelCategoriesByIds(categoryIds)) {
            categoryMap.put(category.getCategoryId(), category);
        }

        for (ModelDto modelDto : result) {
            ModelCategoryDto category = categoryMap.get(modelDto.getCategoryId());

            if (category != null) {
                modelDto.setCategoryName(category.getCategoryName() + "(" + category.getCategoryAbbreviation() + ")");
            }
        }

        return result;
    }

    //todo 7.0 re
//    private String getDatasourceMetadataAsync(DatasourceProperties datasource,
//                                              Map<String, Object> options) throws Exception {
//        DataAccessDriver driver = null;
//        String jobId = null;
//
//        try {
//            if (datasource != null) {
//                driver = driverService.getAccessDriver(datasource);
//                if (driver != null) {
//                    boolean connected = false;
//                    if (driver instanceof DataAccessDriverJdbc) {
//                        connected = driver.connect(null, true);
//                    } else {
//                        connected = driver.connect();
//                    }
//                    if (connected) {
//                        options.put(DataAccessDriver.REVERSE_FINISH_CALLBACK,
//                                new ReverseFinishCallback() {
//                                    @Override
//                                    public void execute(ModelX modelx, ReverseForwardStrategy strategy)
//                                            throws Exception {
//                                        jobService.createMetadataSyncJob(modelx.getId(), modelx.getName());
//                                    jobService.createDomainVerifyJob(modelx.getId(), modelx.getName());
//                                        if (!(strategy instanceof ReverseForwardStrategyShareFile)) {
//                                            jobService.createDamDdmModelCompareJob(modelx.getId(), modelx.getName());
//                                            //todo
//                                            jobService.createMetadataCompareJob(modelx.getId(), modelx.getName());
//                                            jobService.createMetadataLineageJob(modelx.getId(), modelx.getName());
//                                        }
//                                    }
//
//                                    @Override
//                                    public void persist(ModelX model, DatasourceProperties datasource)
//                                            throws Exception {
//                                        ModelUtility.saveModelX(model, datasource);
//                                    }
//                                });
//
//                        options.put(ReverseForwardStrategy.PROGRESS_SAVER, new ReverseForwardObjectSaver(
//                                BeanHelper.getBean(DataObjectService.class),
//                                BeanHelper.getBean(DataModelService.class),
//                                datasource));
//
//                        jobId = driver.reverseEngineerModelAsync(options, true);
//                    } else {
//                        throw new IllegalStateException("Failed to connect to the datasource");
//                    }
//                }
//            }
//        } catch (Exception e) {
//            throw e;
//        } finally {
////            if (driver != null) {
////                driver.close();
////            }
//        }
//
//        return jobId;
//    }

    @RequestMapping(method = RequestMethod.PUT, value = "/objects/")
    public DataObject saveDataObject(@RequestBody DataObject dataObject) throws IOException {
        Long objectId = dataObject.getObjectId();
        DataObject origin = null;

        try {
            origin = dataObjectService.getDataObjectByObjectId(objectId);
        } catch (Exception ex) {
            //the object doesn't exist
        }
        //DataObject newObject = dataObject.toDataObject();

        if (origin != null && ObjectUtils.equals(origin.getTypeId(), LDMTypes.oModelSource)) {
            Model model = dataModelService.getModelEntity(dataObject.getModelId());
            model.setDefinition(dataObject.getPhysicalName());
            dataModelService.updateModel(model, "ORACLE");
        }


        if (origin != null) {
            origin.syncContent(dataObject);
            return dataObjectService.saveDataObject(origin, origin.getModelCategoryId());
        } else {
            return dataObjectService.saveDataObject(dataObject, origin.getModelCategoryId());
        }
    }

//    @RequestMapping("/{modelId}/delta")
//    public CCompareDto getModelDelta(@PathVariable("modelId") Long modelId)
//        throws Exception {
//        return dataModelVersionService.incrementalReverseEngineer(modelId);
//    }

    @RequestMapping("/{modelId}/version/{versionId}/delta")
    public CCompareDto getModelVersionDelta(@PathVariable("modelId") Long modelId, @PathVariable("versionId") Long versionId)
            throws Exception {
        return dataModelVersionService.getModelVersionDelta(modelId, versionId);
    }

    /**
     * 修改模型历史版本的名称
     *
     * @param version 模型历史
     */
    @Description("修改模型历史版本的名称")
    @EndpointDoc(bodyExample = "" +
            "{\n" +
            "    \"modelId\": 7450,\n" +
            "    \"version\": 1,\n" +
            "    \"versionName\": \"测试版本1\"\n" +
            "}")
    @RequestMapping(value = "/version/name/delta", method = RequestMethod.PUT)
    public void updateModelVersionName(@RequestBody BaseModelVersion version) {
        dataModelVersionService.updateModelVersionName(version);
    }

    @RequestMapping("/{modelId}/versions/simple")
    public List<BaseModelVersion> getModelVersionsSimple(@PathVariable("modelId") Long modelId)
            throws Exception {
        return dataModelVersionService.getVersionInfoSimple(modelId);
    }

    @RequestMapping("/{modelId}/versions")
    public String getModelVersions(@PathVariable("modelId") Long modelId)
            throws Exception {
        return dataModelVersionService.getVersionInfos(modelId);
    }

    @RequestMapping(value = "/{modelId}/categories/{categoryId}", method = RequestMethod.PUT)
    public void changeModelCategoryOfModel(@PathVariable("modelId") Long modelId, @PathVariable("categoryId") Long categoryId) {
        dataModelService.changeModelCategoryOfModel(modelId, categoryId);
        //todo 7.0 安全
//        dataSecurityCatalogElementRelService.updateSystemOfDataSource(modelId, categoryId);
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "dam_element",
//            systemModule = OperationModuleType.METADATA_DATA,
//            description = "导出数据集"
//    )
    @PostMapping(value = "/{modelId}/exportAsync")
    //@PreAuthorize(UserRights.EXPORT_METADATA)
    @Operation(summary = "异步下载元数据")
    public String exportModelAsync(@Parameter(name = "modelId", description = "模型编号") @PathVariable("modelId") Long modelId,
                                   @Parameter(name = "tableIds", description = "表编码", required = false) @RequestParam(name = "tableIds", required = false) String tableIdsStr,
                                   @Parameter(name = "tagIds", description = "标签编码", required = false) @RequestParam(name = "tagIds", required = false) String tagIdStr,
                                   @Parameter(name = "isSimple", description = "简单表", required = false) @RequestParam(name = "isSimple", defaultValue = "false") boolean isSimple,
                                   @RequestBody DataObjectExportDto exportDto, HttpServletRequest request) {

        final List<Long> tableIds = new ArrayList<>();
        final List<Long> tagIds = new ArrayList<>();
        if (!Strings.isNullOrEmpty(tagIdStr)) {
            String[] ids = tagIdStr.split(",");
            for (String id : ids) {
                tagIds.add(Long.parseLong(id));
            }
            //todo 7.0 tag
//            tableIds.addAll(tagDao.getTableIdsByModelIdAndTagIds(modelId, tagIds));
        } else if (!Strings.isNullOrEmpty(tableIdsStr)) {
            String[] ids = tableIdsStr.split(",");
            for (String id : ids) {
                tableIds.add(Long.parseLong(id));
            }
        }

        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        final String username = AuthTools.currentUsernameFailFast();

        DataBlauHttpServletRequest dataBlauRequest = new DataBlauHttpServletRequest(request);

        // 提交任务执行
        return instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                               @Override
                                               public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                               }

                                               @Override
                                               public InstantJobResult call() throws Exception {
                                                   try {
                                                       Set<GrantedAuthority> grantedAuthorities = userService.getUserFullAuthorities(username);
                                                       UsernamePasswordAuthenticationToken runAsAuthentication = new UsernamePasswordAuthenticationToken(username, "ignore it", grantedAuthorities);
                                                       SecurityContextHolder.setContext(SecurityContextHolder.createEmptyContext());
                                                       SecurityContextHolder.getContext().setAuthentication(runAsAuthentication);

                                                       DataObjectExportResult exportResult = dataModelService
                                                               .exportMetadataToFile(modelId, tableIds, exportDto, isSimple);
                                                       File file = exportResult.getContent();
                                                       FileDescriptor fileDescriptor = fileUtility.uploadFile(file, exportResult.getFileName(), username, false);
                                                       FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                       result.setFileId(fileDescriptor.getFileId());
                                                       result.setJobStatus(InstantJobStage.FINISHED);

                                                       //增加日志
                                                       addMetadataExportLog(exportResult.getTableNumber() + exportResult.getViewNumber(), dataBlauRequest);
                                                       return result;
                                                   } catch (Exception e) {
                                                       logger.error(e.getMessage(), e);
                                                       throw new AndorjRuntimeException(e.getMessage(), e);
                                                   } finally {
                                                       SecurityContextHolder.clearContext();
                                                   }

                                               }
                                           }
                , msgService.getMessage("modelControl.exportFile") + sdf.format(new Date()), AuthTools.currentUsernameFailFast(), InstantJobType.EXPORT.toString());
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "dam_element",
//            systemModule = OperationModuleType.METADATA_DATA,
//            description = "导出数据集"
//    )
    @RequestMapping(value = "/{modelId}/export", method = RequestMethod.POST)
    //@PreAuthorize(UserRights.EXPORT_METADATA)
    @Operation(summary = "下载元数据")
    public void exportModel(@Parameter(name = "modelId", description = "模型编号") @PathVariable("modelId") Long modelId,
                            @Parameter(name = "tableIds", description = "表编码", required = false) @RequestParam(name = "tableIds", required = false) String tableIdsStr,
                            @Parameter(name = "tagIds", description = "标签编码", required = false) @RequestParam(name = "tagIds", required = false) String tagIdStr,
                            @Parameter(name = "isSimple", description = "简单表", required = false) @RequestParam(name = "isSimple", defaultValue = "false") boolean isSimple,
                            @RequestBody DataObjectExportDto exportDto,
                            HttpServletResponse response) {
        List<Long> tableIds = new ArrayList<>();
        List<Long> tagIds = new ArrayList<>();
        if (!Strings.isNullOrEmpty(tagIdStr)) {
            String[] ids = tagIdStr.split(",");
            for (String id : ids) {
                tagIds.add(Long.parseLong(id));
            }

            //todo 7.0 tag
//            tableIds = tagDao.getTableIdsByModelIdAndTagIds(modelId, tagIds);
        } else if (!Strings.isNullOrEmpty(tableIdsStr)) {
            String[] ids = tableIdsStr.split(",");
            for (String id : ids) {
                tableIds.add(Long.parseLong(id));
            }
        }

        DataObjectExportResult exportResult = dataModelService.exportMetadataToFile(modelId, tableIds, exportDto, isSimple);

        File file = exportResult.getContent();
        String filename = exportResult.getFileName();

        if (file.exists()) {
            response.setContentType("application/octet-stream");
            response.setHeader("Content-disposition", "attachment; filename=\"" + URLEncoder.encode(filename, StandardCharsets.UTF_8) + "\"");
            response.setHeader("Content-Length", String.valueOf(file.length()));

            try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream(file));
                 BufferedOutputStream bos = new BufferedOutputStream(response.getOutputStream())) {

                byte[] buff = new byte[2048];
                int bytesRead;
                while (-1 != (bytesRead = bis.read(buff, 0, buff.length))) {
                    bos.write(buff, 0, bytesRead);
                }

            } catch (Exception ex) {
                throw new IllegalStateException(msgService.getMessage("failedToExportModelFile", ex.getMessage()));
            } finally {
                if (file != null) {
                    file.delete();
                }
            }
        }

        //增加日志
        addMetadataExportLog(tableIds.size());
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "dam_element",
//            systemModule = OperationModuleType.METADATA_DATA,
//            description = "导出数据集"
//    )
    @RequestMapping(value = "/metadata/export", method = RequestMethod.POST)
    //@PreAuthorize(UserRights.EXPORT_METADATA)
    public void exportModel(@RequestParam(name = "objectIds", required = false) String objectIdsStr,
                            HttpServletResponse response) throws Exception {
        ArrayList<Long> objectIds = new ArrayList<>();
        if (!Strings.isNullOrEmpty(objectIdsStr)) {
            String[] ids = objectIdsStr.split(",");
            for (String id : ids) {
                objectIds.add(Long.parseLong(id));
            }
        }

        DataObjectExportResult exportResult = dataModelService.exportItemMetadataToFile(objectIds);

        File file = exportResult.getContent();
        String filename = exportResult.getFileName();

        if (file.exists()) {
            response.setContentType("application/octet-stream");
            response.setHeader("Content-disposition", "attachment; filename=\"" + URLEncoder.encode(filename, StandardCharsets.UTF_8) + "\"");
            response.setHeader("Content-Length", String.valueOf(file.length()));

            try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream(file));
                 BufferedOutputStream bos = new BufferedOutputStream(response.getOutputStream())) {

                byte[] buff = new byte[2048];
                int bytesRead;
                while (-1 != (bytesRead = bis.read(buff, 0, buff.length))) {
                    bos.write(buff, 0, bytesRead);
                }

            } catch (Exception ex) {
                throw new IllegalStateException(
                        msgService.getMessage("failedToExportModelFile", ex.getMessage()));
            } finally {
                if (file != null) {
                    file.delete();
                }
            }
        }

        //增加日志
        addMetadataExportLog(objectIds.size());
    }

    protected void addMetadataExportLog(int size) {
        try {
            String logMessage = msgService.getMessage("metadata.table.log.export", size);
            operationLogService.generateOperationLog(OperationModuleType.METADATA_DATA, "dam_element",
                    OperationLogType.DATA_EXPORT, logMessage, AuthTools.currentUsername(), 0);
        } catch (Exception e) {
            logger.error(e.getMessage());
        }
    }

    protected void addMetadataExportLog(int size, DataBlauHttpServletRequest request) {
        try {
            String logMessage = msgService.getMessage("metadata.table.log.export", size);
            operationLogService.generateOperationLog(OperationModuleType.METADATA_DATA, "dam_element",
                    OperationLogType.DATA_EXPORT, logMessage, AuthTools.currentUsername(), 0, request);
        } catch (Exception e) {
            logger.error(e.getMessage());
        }
    }

    //    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "dam_element",
//            systemModule = OperationModuleType.METADATA_DATA,
//            description = "导入数据集，modelId为: {param}",
//            descriptionParamClass = Long.class,
//            descriptionParamMethod = "toString"
//    )
    @Autowired
    private AServiec aServiec;

    @RequestMapping(method = RequestMethod.POST, value = "/{modelId}/updateMetadata/{ignoreError}")
    //@PreAuthorize(UserRights.UPDATA_METADATA)
    public String uploadMetadataExcelAsync(@PathVariable("modelId") Long modelId, @PathVariable("ignoreError") Boolean ignoreError, @RequestParam("file") MultipartFile multipartFile)
            throws Exception {
        logger.info(AuthTools.currentUsernameNullSafe() + " is uploading file " + multipartFile.getOriginalFilename());
        String fileName = multipartFile.getOriginalFilename();
        if (fileName == null) throw new UnexpectedStateException(msgService.getMessage("fileNameIsNull"));
        String type = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        if (!"xlsx".equals(type)) {
            throw new UnexpectedStateException(msgService.getMessage("fileNameOnlySupport"));
        }

        String username = AuthTools.currentUsernameFailFast();

        File uploadedFile = DataUtility.uploadFile(multipartFile);

        Model model = dataModelService.getDataModelById(modelId);
        String jobName = msgService.getMessage("metadataImportUpdateTask");
        if (ReverseForwardStrategyDataDictionary.MODEL_TYPE.equals(model.getType())) {
            jobName = "数据字典导入更新";
        } else if (ReverseForwardStrategyLogicalDataDictionary.LOGICAL_MODEL_TYPE.equals(model.getType())) {
            jobName = "逻辑实体导入更新";
        }

        String jobId = instantJobService.submitJob(new InstantJob<InstantJobResult>() {

            @Override
            public void setProgressMonitor(InstantJobProgressMonitor instantJobProgressMonitor) {

            }

            @Override
            public InstantJobResult call() throws Exception {
                try {
                    Set<GrantedAuthority> grantedAuthorities = userService.getUserFullAuthorities(username);
                    UsernamePasswordAuthenticationToken runAsAuthentication = new UsernamePasswordAuthenticationToken(username, "ignore it", grantedAuthorities);
                    SecurityContextHolder.setContext(SecurityContextHolder.createEmptyContext());
                    SecurityContextHolder.getContext().setAuthentication(runAsAuthentication);

                    ModelImportErrorDto errorDto = new ModelImportErrorDto();
                    ImportInstantJobResult jobResult = new ImportInstantJobResult();
                    try(InputStream is = new FileInputStream(uploadedFile);
                        XSSFWorkbook wb = new XSSFWorkbook(is)) {

                        Model model = dataModelService.getDataModelById(modelId);
                        //逻辑实体导入逻辑和物理模型不一样
                        if (ReverseForwardStrategyDataDictionary.isDataDictionary(model.getType())) {
                            LogicalModelUploaderResultDto result = dataModelService.updateDataDictModel(modelId, uploadedFile, fileName);
                            //上传文件
                            jobResult.setJobStatus(InstantJobStage.FINISHED);
                            jobResult.setSuccess(result.getSuccessNumber());
                            jobResult.setFailed(result.getErrorNumber());
//                            jobResult.setShowNumber(false);
                            if (result.hasError()) {
                                jobResult.setFileId(result.getFileId());
                                logger.info("upload excel question id is:" + result.getFileId());
                            }
                        } else {
                            dataModelService.updateModelMetadataFromFile(modelId, wb, ignoreError, errorDto);
                            List<Long> res = aServiec.getObjectIdByExcel(modelId, wb);
                            logger.info("objectIds ::" + res);
//                            String topic = "datablau-metadata-udpObjectId";
//                            kafkaProducer.sendMessage(topic, new BasicMsg(res.toString()));
                            if(!CollectionUtils.isEmpty(res)){
                                logger.info("产生新的Id{}", res);
                                kafkaProducer.sendMessage(metadataIncrementKafkaTopic, new MetaDataIncrementDto(res));
                            }

                            //上传文件
                            jobResult.setJobStatus(InstantJobStage.FINISHED);
                            jobResult.setSuccess(errorDto.getSuccessCounts());
                            jobResult.setFailed(errorDto.getFailedCounts());
                            if(errorDto.hasErrorData()){
                                if(!errorDto.getViewCols().isEmpty()){
                                    ExcelUtil.fillingImportError(wb, 3, errorDto.getViewCols(), false);
                                }else {
                                    wb.removeSheetAt(3);
                                }

                                if(!errorDto.getTableCols().isEmpty()){
                                    ExcelUtil.fillingImportError(wb, 2, errorDto.getTableCols(), false);
                                }else {
                                    wb.removeSheetAt(2);
                                }

                                if(!errorDto.getView().isEmpty()){
                                    ExcelUtil.fillingImportError(wb, 1, errorDto.getView(), false);
                                }else {
                                    wb.removeSheetAt(1);
                                }

                                //此处需要直接返回
                                if(!errorDto.getTable().isEmpty()){
                                    ExcelUtil.fillingImportError(wb, 0, errorDto.getTable(), false);
                                }else {
                                    //清空数据
                                    wb.removeSheetAt(0);
                                }

                                //上传文件
                                try(FileOutputStream fos = new FileOutputStream(uploadedFile, false)){
                                    wb.write(fos);
                                }
                                FileDescriptor fileDescriptor = fileUtility.uploadFile(uploadedFile, msgService.getMessage("errorExcelDataFileName"), AuthTools.currentUsernameFailFast(), false);

                                jobResult.setFileId(fileDescriptor.getFileId());
                                logger.info("upload excel question id is:" + fileDescriptor.getFileId());

                                if(!ignoreError){
                                    jobResult.setSuccess(0);
                                    jobResult.setFailed(errorDto.getTotalCount());
                                }
                            }
                        }

                    } catch (Throwable e) {
                        logger.warn(e.getMessage(), e);
                        throw new AndorjRuntimeException(e.getMessage(), e);
                    }

                    return jobResult;
                } catch (Throwable e) {
                    logger.warn(e.getMessage(), e);
                    throw new AndorjRuntimeException(e.getMessage(), e);
                } finally {
                    SecurityContextHolder.clearContext();
                    uploadedFile.delete();
                }
            }
        }, jobName + sdf.format(new Date()), username, "IMPORT");

        return jobId;
    }

    private void tokafkaMetaDataIncrement(List<Long> result) {
        if(CollectionUtils.isEmpty(result)){
            logger.info("没有产生新的ObjectId");
            return;
        }
        logger.info("产生新的Id{}", result);
        kafkaProducer.sendMessage(metadataIncrementKafkaTopic, new MetaDataIncrementDto(result));
    }
    
    @KafkaListener(
            topics = "datablau-metadata-increment",
            groupId = "hxstest"
    )
    public void domainUpdateEvent(MetaDataIncrementDto message) {
        logger.info("hxstest+datablau-metadata-increment::: " + message.getObjectIds());
    }


    @RequestMapping(value = "/binding/ddm/model", method = RequestMethod.POST)
    public void bindModelAndStrategyToDdmModel(@RequestBody ModelMapping mapping) {
        try {
            dataModelService.bindModelAndStrategyToDdm(mapping);
        } catch (DataIntegrityViolationException ex) {
            throw new InvalidArgumentException(msgService.getMessage("bingSchemaExists"));
        }
    }

    @RequestMapping(value = "binding/compareObject", method = RequestMethod.POST)
    public void bindCompareObject(@RequestBody DataObjectCompare compare) {
        dataModelService.bindCompareObject(compare);
    }

    @RequestMapping(value = "/binding/{modelId}/delete/{mappingId}", method = RequestMethod.DELETE)
    public void removeBindCompareObject(@PathVariable("modelId") Long modelId, @PathVariable("compareId") Long compareId) {
        dataModelService.unbindCompareObject(compareId, modelId);
    }

    @RequestMapping(value = "/binding/{modelId}/ddm/model/{mappingId}", method = RequestMethod.DELETE)
    public void removeBindModelToDdmModel(@PathVariable("modelId") Long modelId, @PathVariable("mappingId") Long mappingId) {
        dataModelService.unbindModelToDdmModel(mappingId, modelId);
    }

    // KEN REST
    @RequestMapping(value = "/ddm/models", produces = {"application/json"})
    public String getDdmModelTree() {
        if (!Strings.isNullOrEmpty(ddmRestBaseUrl)) {
            String resource = "/public_models/";
            String url = ddmRestBaseUrl + resource;
            return restTemplate.getForObject(url, String.class);
        } else {
            return dataModelService.getDdmModelTree();
        }
    }

    // KEN REST
    @RequestMapping(value = "/ddm/models/{modelId}/baselines", produces = {"application/json"})
    @Ignore
    public String getDdmModelBaselines(@PathVariable("modelId") Long modelId) {
        if (!Strings.isNullOrEmpty(ddmRestBaseUrl)) {
            String resource = "/public_models/" + modelId + "/baselines";
            String url = ddmRestBaseUrl + resource;
            return restTemplate.getForObject(url, String.class);
        } else {
            return dataModelService.getDdmModelBaselines(modelId);
        }
    }

    // KEN REST
    @RequestMapping(value = "/ddm/models/{modelId}", produces = {"application/json;charset=UTF-8"})
    @ResponseBody
    @Ignore
    public String getDdmModel(@PathVariable("modelId") Long modelId) {
        if (!Strings.isNullOrEmpty(ddmRestBaseUrl)) {
            String resource = "/public_models/" + modelId;
            String url = ddmRestBaseUrl + resource;
            return restTemplate.getForObject(url, String.class);
        } else {
            return dataModelService.getDdmModel(modelId);
        }
    }

    @RequestMapping(value = "/ddm/models/{modelId}/versions", produces = {"application/json"})
    @ResponseBody
    @Ignore
    public String getDdmModelVersions(@PathVariable("modelId") Long modelId) {
        return dataModelService.getDdmModelVersions(modelId);
    }

    @RequestMapping(value = "/ddm/models/{modelId}/details", produces = {"application/json"})
    @Ignore
    public String getDdmModelDomainApplicationStatus(@PathVariable("modelId") Long modelId) {
        return dataModelService.getDdmModelDomainApplicationStatus(modelId);
    }

    @RequestMapping(value = "/ddm/models/{modelId}/content/json", produces = {"application/json"})
    public String getDdmModelJsonContent(@PathVariable("modelId") Long modelId, @RequestParam(name = "versionId", required = false) Long versionId) {
        return dataModelService.getDdmModelJsonContent(modelId, versionId);
    }

    @RequestMapping(value = "/ddm/models/{modelId}/tables")
    @Ignore
    public List<CommonTable> getTableFromDdmModel(@PathVariable("modelId") Long modelId) {
        return dataModelService.getTablesOfModelsFromDDMServer(modelId);
    }

    @RequestMapping(value = "/ddm/models/{modelId}/table/{tableId}")
    @Ignore
    public List<CommonColumn> getColumnsOfTableFromDdmModel(@PathVariable("modelId") Long modelId, @PathVariable("tableId") Long tableId) {
        return dataModelService.getColumnsOfTableFromDDMServer(modelId, tableId);
    }

    @RequestMapping(value = "/ddm/models/{modelId}/rulecheck", produces = {"application/json"})
    @Ignore
    @Description("从DDM获取模型规则检查结果")
    public String getDdmModelRuleCheckResult(@Description("模型ID") @PathVariable("modelId") Long modelId) {
        return dataModelService.getDdmModelRuleCheckResult(modelId);
    }

    @RequestMapping(value = "/ddm/systems/{modelCategoryId}/models")
    @Ignore
    @Description("获取一个系统下的所有DDM模型")
    public List<CommonModelWithPath> getDdmModelsOfModelCategory(@Description("系统ID") @PathVariable("modelCategoryId") Long modelCategoryId) {
        return dataModelService.getDdmModelsOfCategory(modelCategoryId);
    }

    @RequestMapping(value = "/{modelId}/editlog/list")
    @Ignore
    @Description("获取小版本变更的操作用户和时间列表")
    public List<ApiModelVerEditLog> getModelEditAuditLog(@Description("模型ID") @PathVariable("modelId") Long modelId) {
        return dataModelService.getModelVerEditLog(modelId);
    }

    @RequestMapping(value = "/{modelId}/editlog")
    @Ignore
    @Description("获取数个小版本操作的具体内容, 对于老的版本有可能记录会被从数据库删除，只保留在ddmserver的log文件中")
    public List<ApiModelVerEditDetailLog> getModelEditDetailAuditLog(@Description("模型ID") @PathVariable("modelId") Long modelId,
                                                                     @Description("最小的自增版本号, 一般是1") @RequestParam(name = "startVer") Long startVer, @Description("最大的自增版本号") @RequestParam(name = "endVer") Long endVer) {
        return dataModelService.getModelVerDetailEditLog(modelId, startVer, endVer);
    }

    /*
     * 此接口与上面已有的接口重复，因而被注释
    @RequestMapping(value = "/{modelId}/versions/simple", method = RequestMethod.GET)
    @Description("元数据历史版本浏览")
    public List<ModelVersion> getVersionHistory(@PathVariable("modelId") Long modelId) {
        return dataModelService.getVersionHistory(modelId);
    }
     */

//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "dam_element",
//            systemModule = OperationModuleType.METADATA_DATA,
//            description = "导出数据集"
//    )
    @RequestMapping(value = "/search/metadata/export", method = RequestMethod.POST)
    @Description("导出元数据分页查询")
    //@PreAuthorize(UserRights.EXPORT_METADATA)
    public PageResult<BaseDataObject> searchDataObjectExport(@RequestBody SearchCriteriaDto criteriaDto) {
        return dataModelService.searchDataObjectsExport(criteriaDto.getPageSize(), criteriaDto.getCurrentPage(),
                criteriaDto.getKeyword(), criteriaDto.getModelIds(), criteriaDto.getSchemas());
    }

    @RequestMapping("/model/{baseModelId}/compare/{targetModelId}")
    @Ignore
    @Description("获取两个数据源的对比详情")
    public CCompareDto compareDataObjectModel(
            @Description("基底模型ID") @PathVariable("baseModelId") Long baseModelId,
            @Description("目标模型ID") @PathVariable("targetModelId") Long targetModelId,
            @Description("对象类型") @RequestParam(value = "objectType", required = false) Integer objectType,
            @Description("更改类型") @RequestParam(value = "changeType", required = false) String changeType) throws Exception {

        return dataModelVersionService.compareDataObjectModel(baseModelId, targetModelId, objectType, changeType, false);
    }

    @RequestMapping("/model/{baseModelId}/compare/{targetModelId}/download")
    @Ignore
    @Description("获取并下载两个数据源的对比详情文件")
    public ResponseEntity<Resource> compareDataObjectModelDownload(
            @Description("基底模型ID") @PathVariable("baseModelId") Long baseModelId,
            @Description("目标模型ID") @PathVariable("targetModelId") Long targetModelId,
            @Description("对象类型") @RequestParam(value = "objectType", required = false) Integer objectType,
            @Description("更改类型") @RequestParam(value = "changeType", required = false) String changeType) throws Exception {

        CCompareDto cCompareDto = dataModelVersionService.compareDataObjectModel(baseModelId, targetModelId, objectType, changeType, true);
        ByteArrayOutputStream bos = null;
        try {
            Workbook wb = dataModelVersionService.exportCompareResultForDamModelVersion(baseModelId,
                    targetModelId, cCompareDto);

            bos = new ByteArrayOutputStream();
            wb.write(bos);
            wb.close();

            Model baseModel = dataModelService.getModelByIdUnsafe(baseModelId);
            Model targetModel = dataModelService.getModelByIdUnsafe(targetModelId);
            String filename = msgService.getMessage("modelControl.fileName", baseModel.getDefinition(), targetModel.getDefinition());

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

    @Operation(summary = "获取可连接数据的数据源")
    @RequestMapping("/fromre/data")
    @Description("获取可连接数据的数据源")
    public Collection<ModelDto> getDataModelsFromRE(
        @Description("显示逻辑模型，而不显示逻辑模型之下的") @RequestParam(value = "showLogicalModel", defaultValue = "false") boolean showLogicalModel) {
        Collection<ModelDto> modelDtos = convertToModelDtos(dataModelService.getUserModels(showLogicalModel), false);
        Iterator<ModelDto> iter = modelDtos.iterator();
        while (iter.hasNext()) {
            ModelDto dto = iter.next();
            if (!dto.getDataConnect().equals(DataConnect.SELF)) {
                iter.remove();
            }
        }
        return modelDtos;
    }

    @RequestMapping("/template")
    @Description("获取添加数据源下载数据字典模板")
    public void exportSampleTemplate(HttpServletResponse response, @RequestParam(required = false, value = "logical", defaultValue = "false") Boolean isLogical) throws Exception {
        File templateFile;

        response.setContentType("application/octet-stream");

        LogicalModelExporter exporter = new LogicalModelExporter();
        if (isLogical) {
//            templateFile = new File(GeneralUtility.getWebRootPath() + "/resources/datadict/sample_logical_new.xlsx");
            templateFile = exporter.getLogicalTempFile();
        } else {
//            templateFile = new File(GeneralUtility.getWebRootPath() + "/resources/datadict/sample_physical_new.xlsx");
            templateFile = exporter.getPhysicalTempFile();
        }

        String fileName = (isLogical ? "Data Dictionary(Logical).xlsx" : "Data Dictionary(Physical).xlsx");

        response.setHeader("Content-disposition", "attachment; filename=" + fileName);
        response.setHeader("Content-Length", String.valueOf(templateFile.length()));

        try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream(templateFile));
             BufferedOutputStream bos = new BufferedOutputStream(response.getOutputStream())) {
            byte[] buff = new byte[2048];
            int bytesRead;
            while (-1 != (bytesRead = bis.read(buff, 0, buff.length))) {
                bos.write(buff, 0, bytesRead);
            }
        } catch (Exception ex) {
            throw new UnexpectedStateException(msgService.getMessage("failedToExportSampleFile", ex.getMessage()), ex);
        }
    }

    //todo 7.0 job
//    @RequestMapping(value = "/{jobId}/update" , method = RequestMethod.POST)
//    @Description("逻辑数据源上传新文件，更新原model连接信息")
//    public boolean updateConnectionInfo(@RequestBody DatasourceProperties datasourceProperties ,@PathVariable String jobId) {
//        CommonJob job = jobRepo.findByJobIdEquals(Long.valueOf(jobId));
//        if (job == null) {
//            return false;
//        }
//        Long modelId = job.getResourceId();
//        Model model = dataModelService.getDataModelById(modelId);
//        if (model == null) {
//            return false;
//        }
//        DatasourceProperties properties = model.getConnectionInfo();
//        Map<String, String> map = properties.getParameterMap();
//        map.put("FileNames", datasourceProperties.getParameterMap().get("FileNames"));
//        map.put("FilePath", datasourceProperties.getParameterMap().get("FilePath"));
//
//        properties.setParameterMap(map);
//        // 设置可以产生版本
//        properties.setVersioning(true);
//        model.setConnectionInfo(properties);
//        dataModelService.updateModel(model, model.getType());
//
//        return true;
//    }


//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "dam_model",
//            systemModule = OperationModuleType.METADATA_MODEL,
//            description = "新建或编辑数据源，名为: {param}",
//            descriptionParamClass = ModelParamDto.class,
//            descriptionParamMethod = "getDefinition"
//    )
    @Operation(summary = "创建数据源，70之后都不执行元数据采集，仅创建数据源，需要手动运行采集任务")
    @RequestMapping(value = "/createModel", method = RequestMethod.POST)
    public List<ModelDto> createModel(@RequestBody ModelParamDto paramDto) throws Exception {
        List<ModelDto> result = dataModelService.createModelByParam(paramDto);

        //增加日志
        addModelCreateLog(paramDto);

        return result;
    }

    @GetMapping("/a")
    public void a(){
        MessageQueueService messageQueueService = (MessageQueueService) RootBeanHelper.getBean(MessageQueueService.class);
        KafkaTemplate kafkaTemplate = (KafkaTemplate)RootBeanHelper.getBean(KafkaTemplate.class);
        ProducerFactory producerFactory = kafkaTemplate.getProducerFactory();
        logger.info("xxxxxxxxxxxxxxxxxxxxxxx");
        // 2. 获取配置映射（适用于 DefaultKafkaProducerFactory）
        if (producerFactory instanceof DefaultKafkaProducerFactory) {
            DefaultKafkaProducerFactory<?, ?> defaultFactory =
                    (DefaultKafkaProducerFactory<?, ?>) producerFactory;
            logger.info("yyyyyyyyyyyyyyyyyyyy");
            // 3. 获取完整配置Map
            Map<String, Object> configs = defaultFactory.getConfigurationProperties();

            // 打印所有配置
            configs.forEach((key, value) ->
                    logger.info(key + " = " + value));

            // 获取特定配置示例
//            String bootstrapServers = (String) configs.get(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG);
//            String saslMechanism = (String) configs.get("sasl.mechanism");
        }
        logger.info("zzzzzzzzzzzzzzzzzzzzz");
        logger.info(messageQueueService.getClass().getName());
        messageQueueService.sendMessage("datablau-graph.graph.save", "哈哈哈哈哈哈");
        logger.info("发送成功");
    }

    private void addModelCreateLog(ModelParamDto paramDto) {
        try {
            List<String> fileModels = Lists.newArrayList("DATADICTIONARY", "DATADICTIONARY_LOGICAL", "TABLEAU");
            String modelType = paramDto.getType();
            String messagePrefix;
            if (fileModels.contains(modelType)) {
                messagePrefix = "metadata.model.file.log";
            } else if ("SMBSHAREFILE".equals(paramDto.getType())) {
                messagePrefix = "metadata.model.shareFile.log";
            } else {
                messagePrefix = "metadata.model.log";
            }
            addModelCommonLog(paramDto, messagePrefix);
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
        }
    }

    protected void addModelCommonLog(ModelParamDto paramDto, String message) {
        try {
            OperationLogType operator;
            String logMessage;
            if (paramDto.getModelId() != null) {
                operator = OperationLogType.TABLE_MODIFY;
                logMessage = msgService.getMessage(message + ".modify", paramDto.getDefinition());
            } else {
                operator = OperationLogType.TABLE_ADD;
                logMessage = msgService.getMessage(message + ".add", paramDto.getDefinition());
            }

            operationLogService.generateOperationLog(OperationModuleType.METADATA_MODEL, "dam_model",
                    operator, logMessage, AuthTools.currentUsername(), 0);
        } catch (Exception e) {
            logger.error(e.getMessage());
        }
    }


    @Operation(summary = "执行数据源的采集，主要用于测试")
    @RequestMapping(value = "/re", method = RequestMethod.POST)
    public void createModel(@RequestParam("modelId") Long modelId) throws Exception {
        MetadataSyncJobDto syncJobDto = new MetadataSyncJobDto();
        syncJobDto.setSyncType(LogicNameSyncType.SYNC_NULL);
        dataModelVersionService.reverseEngineer(modelId, syncJobDto, false);
    }


    @RequestMapping(value = "/getDatasourceUsage", method = RequestMethod.POST)
    @Operation(summary = "获取数据源连接的引用")
    public Page<Map<String, Object>> findDatasourceUsage(@RequestBody PageQueryDto queryDto){
        return dataModelService.findMetadataUsages(queryDto);
    }

    @RequestMapping(value = "/confirmDelete", method = RequestMethod.POST)
    @Operation(summary = "数据源删除确认")
    public Collection<Long> confirmDelete(@RequestBody PageQueryDto queryDto){
        return dataModelService.confirmDelete(queryDto);
    }


    @RequestMapping(value = "/testFineReport", method = RequestMethod.POST)
    @Operation(summary = "测试帆软report采集")
    public void testFineReport(@RequestParam  Long jobId,
                               @RequestParam Long modelId) throws Exception {
        BIParserServiceFactory factory = BeanHelper.getBean(BIParserServiceFactory.class);
        BIParserService parserService = factory.getBIParserService(BIReportType.FINE_REPORT);
        DataReportService dataReportService = BeanHelper.getBean(DataReportService.class);

        Model reportModel = dataModelService.getModelByIdUnsafe(modelId);
        HashMap map = mapper.readValue(reportModel.getReverseOptions(), HashMap.class);
        //todo BIServerInfo参数
        BIServerInfo info =  mapper.readValue(String.valueOf(map.get(BIServerStaticValue.BI_SERVER_INFO)), BIServerInfo.class);

        try{
            parserService.parser(info);
        }catch (Exception ex){
            logger.error("parse BI report failed, error msg : " + ex.getMessage(), ex);
            throw new UnexpectedStateException(GeneralUtility.getMessageService().getMessage("failedReadBIReport", ex.getMessage()));
        }

        List<BIReport> reports = parserService.getReports();
        try {
            dataReportService.importBIReports(reports, BIReportType.FINE_REPORT, jobId);
        }catch (Exception e){
            logger.error("import report failed, error msg : ", e);
            throw new UnexpectedStateException(GeneralUtility.getMessageService().getMessage("failedImportReport"));
        }
    }

    @Operation(summary = "创建逻辑实体数据源")
    @RequestMapping(value = "/createDataDictionaryModel", method = RequestMethod.POST)
    public String createDataDictionaryModel(@RequestBody ModelParamDto paramDto) throws Exception {
        Model oldModel = null;
        try {
            oldModel = dataModelService.getDataModelById(paramDto.getModelId());
        } catch (Exception e) {

        }

        //创建数据源
        List<ModelDto> modelList = dataModelService.createModelByParam(paramDto);
        //增加日志
        addModelCreateLog(paramDto);

        if (oldModel != null) {
            //判断文件是否发生过变化，如果没变不跑更新任务
            Map<String, String> reverseParameters = mapper.readValue(oldModel.getReverseOptions(), HashMap.class);
            String fileKey = DatasourceKnownParameterType.FilePath.name();
            if (ObjectUtils.equals(reverseParameters.get(fileKey), paramDto.getReverseOptions().get(fileKey))) {
                return null;
            }
        }

        String username = AuthTools.currentUsername();
        String jobName = "逻辑实体创建";
        if (ReverseForwardStrategyDataDictionary.MODEL_TYPE.equals(paramDto.getType())) {
            jobName = "数据字典创建";
        }
        return instantJobService.submitJob(new InstantJob<>() {

            @Override
            public void setProgressMonitor(InstantJobProgressMonitor instantJobProgressMonitor) {

            }

            @Override
            public InstantJobResult call() throws Exception {
                try {
                    Set<GrantedAuthority> grantedAuthorities = userService.getUserFullAuthorities(username);
                    UsernamePasswordAuthenticationToken runAsAuthentication = new UsernamePasswordAuthenticationToken(username, "ignore it", grantedAuthorities);
                    SecurityContextHolder.setContext(SecurityContextHolder.createEmptyContext());
                    SecurityContextHolder.getContext().setAuthentication(runAsAuthentication);

                    try {
                        LogicalModelUploaderResultDto result = dataModelVersionService.reverseDataDictionaryEngineer(modelList.get(0).getModelId());

                        ImportInstantJobResult jobResult = new ImportInstantJobResult();
                        //上传文件
                        jobResult.setJobStatus(InstantJobStage.FINISHED);
                        jobResult.setSuccess(result.getSuccessNumber());
                        jobResult.setFailed(result.getErrorNumber());
//                        jobResult.setShowNumber(false);
                        if (result.hasError()) {
                            jobResult.setFileId(result.getFileId());
                            logger.info("upload excel question id is:" + result.getFileId());
                        }

                        return jobResult;
                    } catch (Exception e) {
                        logger.error(e.getMessage(), e);
                        throw new AndorjRuntimeException(e.getMessage(), e);
                    }
                } catch (Exception e) {
                    logger.warn(e.getMessage(), e);
                    throw new AndorjRuntimeException(e.getMessage(), e);
                } finally {
                    SecurityContextHolder.clearContext();
                }
            }
        }, jobName + sdf.format(new Date()), username, "IMPORT");
    }

    @RequestMapping(value = "/fixObjectContentData", method = RequestMethod.GET)
    @Transactional
    public void fixObjectContentData() {
        List<Model> models = StreamSupport.stream(dataModelService.getModelsUnsafe().spliterator(), false).collect(Collectors.toList());
        List<Long> modelIdList = models.stream().filter(m -> m.getType().equals("HIVE") || m.getType().equals("CLICKHOUSE"))
                .map(m -> m.getModelId()).collect(Collectors.toList());
        List<DataObject> saveList = new ArrayList<>();
        for (Long modelId : modelIdList) {
            List<DataObject> tables = dataObjectService.getAllTablesByModelId(modelId);
            for (DataObject dataObject : tables) {
                Boolean save = false;
                ObjectX objectX = dataObject.getObjectX();
                if (objectX.getProperties().containsKey(70000001L)) {
                    objectX.getProperties().remove(70000001L);
                    save = true;
                }
                if (objectX.getProperties().containsKey(70000002L)) {
                    objectX.getProperties().remove(70000002L);
                    save = true;
                }
                if (objectX.getProperties().containsKey(70000003L)) {
                    objectX.getProperties().remove(70000003L);
                    save = true;
                }
                if (objectX.getProperties().containsKey(70000004L)) {
                    objectX.getProperties().remove(70000004L);
                    save = true;
                }
                if (save) {
                    Data.ProtoObjectX.Builder builder = Data.ProtoObjectX.newBuilder();
                    objectX.serialize(builder);
                    dataObject.setContent(builder.build().toByteArray());
                    saveList.add(dataObject);
                }
            }

        }

        if (!CollectionUtils.isEmpty(saveList)) {
            dataObjectRepository.saveAll(saveList);
        }
    }

}
