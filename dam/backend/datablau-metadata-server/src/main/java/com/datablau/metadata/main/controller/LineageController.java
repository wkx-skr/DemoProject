package com.datablau.metadata.main.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.core.annotation.EndpointDoc;
import com.andorj.common.core.data.CommonModelElement;
import com.andorj.common.core.data.CommonPair;
import com.andorj.common.core.data.CommonShallowModel;
import com.andorj.common.core.data.CommonTableDescriptor;
import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.core.exception.IllegalOperationException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.ItemNotFoundException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.data.PageResult;
import com.andorj.lineage.data.LineageColumn;
import com.andorj.lineage.data.LineageContainer;
import com.andorj.lineage.data.LineageKnownProperty;
import com.andorj.lineage.data.LineageLine;
import com.andorj.lineage.data.LineageStep;
import com.andorj.lineage.service.ClickHouseService;
import com.andorj.lineage.service.DataStageLineageService;
import com.andorj.lineage.service.GBaseLineageService;
import com.andorj.lineage.service.GaussDBLineageService;
import com.andorj.lineage.service.HqlLineageService;
import com.andorj.lineage.service.InformaticaLineageService;
import com.andorj.lineage.service.KettleLineageService;
import com.andorj.lineage.service.LineageService;
import com.andorj.lineage.service.MySqlLineageService;
import com.andorj.lineage.service.PlSqlLineageService;
import com.andorj.lineage.service.PostgreSqlLineageService;
import com.andorj.lineage.service.RedshiftLineageService;
import com.andorj.lineage.service.RestCloudLineageService;
import com.andorj.lineage.service.SSISLineageService;
import com.andorj.lineage.service.SparkSqlService;
import com.andorj.lineage.service.SqlServerTSqlLineageService;
import com.andorj.lineage.service.TableauLineageService;
import com.andorj.lineage.sql.flink.FlinkSqlScriptParser;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.utility.DigestUtils;
import com.andorj.model.common.utility.FileUtility;
import com.datablau.base.api.ModelCategoryService;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.data.common.api.ExcelService;
import com.datablau.data.common.api.OperationLogService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.util.ShareKit;
import com.datablau.data.quality.service.DataQualityRemoteService;
import com.datablau.domain.management.dto.DomainDto;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.metadata.common.dto.lineage.FolderModelInfoDto;
import com.datablau.metadata.common.dto.lineage.LineageDto;
import com.datablau.metadata.common.dto.lineage.LineageFolderDto;
import com.datablau.metadata.common.dto.lineage.LineageFolderRefDto;
import com.datablau.metadata.common.dto.lineage.LineageFolderRefType;
import com.datablau.metadata.common.dto.lineage.LineageType;
import com.datablau.metadata.common.dto.metadata.DataObjectDto;
import com.datablau.metadata.main.dto.GeneralSearchCriteriaDto;
import com.datablau.metadata.main.dto.lineage.BatchImportLineageRequest;
import com.datablau.metadata.main.dto.lineage.LineageColumnBindResult;
import com.datablau.metadata.main.dto.lineage.LineageEndpointBindRequestDto;
import com.datablau.metadata.main.dto.lineage.LineageFolderNode;
import com.datablau.metadata.main.dto.lineage.LineageParseParamDto;
import com.datablau.metadata.main.dto.lineage.LineageParsedTableDto;
import com.datablau.metadata.main.dto.lineage.LineageRelationshipDto;
import com.datablau.metadata.main.dto.lineage.LineageRelationshipEndpointDto;
import com.datablau.metadata.main.dto.lineage.LineageScriptInfoDto;
import com.datablau.metadata.main.dto.lineage.LineageScriptQueryDto;
import com.datablau.metadata.main.dto.lineage.LineageScriptTestDto;
import com.datablau.metadata.main.dto.lineage.LineageStepBindResult;
import com.datablau.metadata.main.dto.lineage.LineageTypeInfoDto;
import com.datablau.metadata.main.dto.lineage.ModelLineageDto;
import com.datablau.metadata.main.dto.lineage.ObjectLineageRequest;
import com.datablau.metadata.main.dto.metadata.BasicInfoDataObject;
import com.datablau.metadata.main.dto.metadata.CommonTableEnhanceDescriptor;
import com.datablau.metadata.main.dto.metadata.DataObjectHistoryDto;
import com.datablau.metadata.main.entity.lineage.Lineage;
import com.datablau.metadata.main.entity.lineage.LineageObjectBind;
import com.datablau.metadata.main.entity.lineage.LineageParsedTable;
import com.datablau.metadata.main.entity.lineage.LineageScript;
import com.datablau.metadata.main.entity.metadata.DataObject;
import com.datablau.metadata.main.entity.metadata.ViewAndSPObject;
import com.datablau.metadata.main.entity.model.Model;
import com.datablau.metadata.main.service.lineage.api.LineageFolderService;
import com.datablau.metadata.main.service.lineage.api.LineageImportService;
import com.datablau.metadata.main.service.lineage.api.LineageMappingService;
import com.datablau.metadata.main.service.lineage.api.LineageScriptService;
import com.datablau.metadata.main.service.lineage.api.LineageStorageService;
import com.datablau.metadata.main.service.lineage.dto.LineageQualityInfo;
import com.datablau.metadata.main.service.lineage.dto.LineageSearchCriteriaDto;
import com.datablau.metadata.main.service.metadata.api.DataObjectService;
import com.datablau.metadata.main.service.model.api.DataModelService;
import com.datablau.metadata.main.util.ConfigurationUtility;
import com.datablau.metadata.main.util.DataUtility;
import com.datablau.metadata.main.util.RemoteServiceGetter;
import com.datablau.metadata.main.util.ServerConstants;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import jcifs.CIFSContext;
import jcifs.Configuration;
import jcifs.config.PropertyConfiguration;
import jcifs.context.BaseContext;
import jcifs.smb.NtlmPasswordAuthenticator;
import jcifs.smb.SmbException;
import jcifs.smb.SmbFile;
import net.lingala.zip4j.ZipFile;
import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.time.DateFormatUtils;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.reflections.Reflections;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.lang.reflect.Method;
import java.net.URLEncoder;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * @author Nicky
 * @since 1.0
 */
@RestController
@RequestMapping("/lineage")
//todo 70 lic
//@Feature(LicenseInfo.FE_LINEAGE)
@Tag(name = "血缘相关API")
public class LineageController extends BaseController {
    private static ObjectMapper mapper = new ObjectMapper();
    private static final Logger logger = LoggerFactory.getLogger(LineageContainer.class);

//    @Autowired
//    private InfoEntryRepository infoEntryRepo;

    @Autowired
    private KettleLineageService kettleParser;

    @Autowired
    private TableauLineageService tableauParser;

    @Autowired
    private DataStageLineageService datastageParser;

    @Autowired
    private SSISLineageService ssisLineageParser;

    @Autowired
    private RestCloudLineageService restCloudParser;

    @Autowired
    private InformaticaLineageService informaticaParser;

    @Autowired
    private SqlServerTSqlLineageService sqlServerTsqlParser;

    @Autowired
    private PlSqlLineageService plSqlParser;

    @Autowired
    private GaussDBLineageService gaussDBParser;

    @Autowired
    private HqlLineageService hqlParser;

    @Autowired
    private PostgreSqlLineageService postgreSqlParser;

    @Autowired
    private FlinkSqlScriptParser flinkParser;

    @Autowired
    private GBaseLineageService gbaseLineageParser;


    @Value(value = "${lineage.var.mapping:}")
    private String lineageVarMapping;

    @Autowired
    private ExcelService excelService;

    @Autowired
    private ClickHouseService clickHouseParser;

    @Autowired
    private RedshiftLineageService redshiftLineageParser;

    @Autowired
    private MySqlLineageService mySqlLineageParser;

    @Autowired
    private SparkSqlService sparkSqlParser;

    @Autowired
    private DataQualityRemoteService dataQualityRemoteService;

    private Map<String, String> lineageVarMap;

    public LineageController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @PostConstruct
    public void initVarMap() {
        if (!Strings.isNullOrEmpty(lineageVarMapping)) {
            String[] mapping = lineageVarMapping.split(",");

            lineageVarMap = new HashMap<>();
            String key = null;
            String value = null;
            for (int i = 0; i < mapping.length; i++) {
                if (i % 2 == 0) {
                    key = mapping[i];
                } else {
                    value = mapping[i];

                    if (!Strings.isNullOrEmpty(key) && !Strings.isNullOrEmpty(value)) {
                        logger.info("add lineage val mapping: " + key + " -> " + value);
                        lineageVarMap.put(key, value);
                    }
                }
            }
        }

        if (lineageVarMap != null) {
            plSqlParser.setContentParamterMapping(lineageVarMap);
            hqlParser.setContentParamterMapping(lineageVarMap);
            postgreSqlParser.setContentParamterMapping(lineageVarMap);
            sqlServerTsqlParser.setContentParamterMapping(lineageVarMap);
        }
    }

    @Autowired
    private LineageMappingService mappingService;

    @Autowired
    private DataObjectService objectService;

    @Autowired
    private DataModelService modelService;

    @javax.annotation.Resource
    private ModelCategoryService modelCategoryService;

    @Autowired
    private LineageStorageService lineageDao;

    @Autowired
    private MessageService msgService;

    @Autowired
    private LineageImportService importService;

    @Autowired
    private LineageScriptService lineageScriptService;

    @Autowired
    private LineageFolderService lineageFolderService;

    @Autowired
    private OperationLogService operationLogService;

    @RequestMapping(value = "/imported", method = RequestMethod.POST)
    //@PreAuthorize(UserRights.BLODD_VIEW)
    @Operation(summary = "获取血缘列表", description = "获取血缘列表")
    @Description("获取血缘列表")
    public PageResult<LineageDto> getAllImportedLineage(
            @Parameter(name = "srcCatId", description = "源catagoryId", required = false)
            @RequestParam(value = "srcCatId", required = false) Long srcCategoryId,
            @Parameter(name = "dstCatId", description = "目标catagoryId", required = false)
            @RequestParam(value = "dstCatId", required = false) Long dstCategoryId,
            @Parameter(name = "srcTableId", description = "源tableId", required = false)
            @RequestParam(value = "srcTableId", required = false) Long srcTableId,
            @Parameter(name = "dstTableId", description = "目标tableId", required = false)
            @RequestParam(value = "dstTableId", required = false) Long dstTableId,
            @Parameter(name = "srcDdm", description = "源是否来自ddm", required = false)
            @RequestParam(value = "srcDdm", required = false) Boolean srcDdm,
            @Parameter(name = "dstDdm", description = "目标是否来自ddm", required = false)
            @RequestParam(value = "dstDdm", required = false) Boolean dstDdm,
            @Parameter(name = "srcModelId", description = "源modelId", required = false)
            @RequestParam(value = "srcModelId", required = false) Long srcModelId,
            @Parameter(name = "dstModelId", description = "目标modelId", required = false)
            @RequestParam(value = "dstModelId", required = false) Long dstModelId,
            @RequestBody GeneralSearchCriteriaDto searchCriteriaDto) {
        PageRequest page = PageRequest.of(searchCriteriaDto.getCurrentPage(), searchCriteriaDto.getPageSize());

        if (srcCategoryId != null && dstCategoryId != null) {
            return convertTo(lineageDao.getLineagesFromSrcModelCategoryToDstModelCategory(srcCategoryId, dstCategoryId, page));
        } else if (srcModelId != null && dstModelId != null && srcDdm != null && dstDdm != null && srcTableId != null && dstTableId != null) {
            return convertTo(lineageDao.getLineagesFromSrcTableToDstTable(srcModelId, srcTableId, srcDdm, dstModelId, dstTableId, dstDdm, page));
        } else {
            PageResult<Lineage> result = lineageDao.findPagableLineage(searchCriteriaDto.getKeyword(), searchCriteriaDto.getUser(),
                    searchCriteriaDto.getTypes(), searchCriteriaDto.getFolderId(), page);

            return convertTo(result);
        }
    }

    private PageResult<LineageDto> convertTo(PageResult<Lineage> lineages) {
        List<LineageDto> dtos = new ArrayList<>();
        List<Long> lineageIds = lineages.getContent().stream().map(Lineage::getId)
            .collect(Collectors.toList());
        Map<Long, Long> refLineageIdMapping = lineageDao.getRefLineageIdMapping(lineageIds);
        for (Lineage lineage : lineages.getContent()) {
            LineageDto lineageDto = lineage.toDto();
            lineageDto.setObjectLineageId(refLineageIdMapping.get(lineage.getId()));
            dtos.add(lineageDto);
        }

        PageResult<LineageDto> result = new PageResult<>();
        result.setTotalItems(lineages.getTotalItems());
        result.setPageSize(lineages.getPageSize());
        result.setCurrentPage(lineages.getCurrentPage());
        result.setContentDirectly(dtos);

        return result;
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "修改血缘,名为:"
//    )
    @RequestMapping(value = "/{lineageId}/name", method = RequestMethod.PUT)
    @Description("修改某一个血缘的名称, 请求的body是血缘的新的名称")
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    @Operation(summary = "修改某一个血缘的名称, 请求的body是血缘的新的名称", description = "修改某一个血缘的名称, 请求的body是血缘的新的名称")
    public Lineage updateNameOfLineage(
            @Parameter(name = "lineageId", description = "血缘ID", required = true)
            @Description("血缘ID") @PathVariable("lineageId") Long lineageId,
            @Parameter(name = "name", description = "血缘名", required = true)
            @RequestBody String name) {
        return lineageDao.updateLineageName(lineageId, name);
    }

//    @RequestMapping("/lineagebind/{lineageId}")
//    @Operation(summary = "根据血缘ID获取血缘关系", description = "根据血缘ID获取血缘关系")
//    @Parameter(name = "lineageId", description = "血缘ID", in = ParameterIn.PATH, required = true)
//    @Description("根据血缘ID获取血缘关系")
//    public List<LineageDiscoveredMapping> getLineageExtractBindings(
//            @Parameter(name = "stepId", description = "血缘stepId", required = true)
//            @RequestParam("stepId") String stepId,
//            @Parameter(name = "columnId", description = "血缘字段Id", required = true)
//            @RequestParam(value = "columnId", required = false) String columnId,
//            @Parameter(name = "lineageId", description = "血缘Id", required = true)
//            @PathVariable("lineageId") Long lineageId) {
//
//        if (Strings.isNullOrEmpty(columnId)) {
//            return lineageDao.findDiscoveredMappingsByStepId(lineageId, stepId);
//        } else {
//            return lineageDao.findDiscoveredMappingsByIds(lineageId, stepId, columnId);
//        }
//    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "将血缘绑定到某个对象：{param}",
//            descriptionParamClass = LineageEndpointBindRequestDto.class,
//            descriptionParamMethod = "getObjectId"
//    )
    @RequestMapping(value = "/lineagebind", method = RequestMethod.POST)
    @Transactional
    @Operation(summary = "将血缘绑定到某个对象", hidden = true, description = "将血缘绑定到某个对象")
    @Description("将血缘绑定到某个对象")
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    @Deprecated
    public void bindLineageEndpointToObject(
            @RequestBody LineageEndpointBindRequestDto request) {
        Lineage lineage = lineageDao.getLineageById(request.getLineageId());
        LineageContainer lineageContainer = null;
        try {
            lineageContainer = mapper.readValue(lineage.getContent(), LineageContainer.class);
        } catch (IOException ioe) {
            throw new UnexpectedStateException(
                msgService.getMessage("deserializeLineageFailed", ioe.getMessage()));
        }
        mappingService.bindLineageTerminalToObject(lineage, lineageContainer,
            request.getStepId(), request.getColumnId(), request.getObjectId(), request.getModelId(),
            request.isDdmObject(), request.isCheckName(), false, request.isBindOnTable());
        lineageDao.updateLineageContent(lineage, lineageContainer);
        // 绑定元数据
        mappingService.bindLineageObject(lineage, lineageContainer);
    }

    @RequestMapping("/endpoints/columns")
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    @Operation(summary = "获取血缘字段的绑定关系", hidden = true, description = "获取血缘字段的绑定关系")
    @Description("获取血缘字段的绑定关系")
    @Deprecated
    public LineageColumnBindResult findColumnBinding(
            @Parameter(name = "lineageId", description = "血缘ID", required = true)
            @RequestParam("lineageId") Long lineageId,
            @Parameter(name = "stepId", description = "血缘表Id", required = true)
            @RequestParam("stepId") String stepId,
            @Parameter(name = "columnId", description = "血缘字段ID", required = true)
            @RequestParam("columnId") String columnId) {
//        List<LineageEndpointBinding> binding = mappingService.findColumnBinding(lineageId, stepId, columnId);
//        if (binding == null) {
//            return null;
//        }

//        List<LineageStepBindResult> result = buildBindingResult(binding);
        List<LineageStepBindResult> result = new ArrayList<>();
        return result.get(0).getColumns().get(0);
    }

    @RequestMapping("/endpoints/steps")
    @Operation(summary = "获取血缘表的绑定关系", hidden = true, description = "获取血缘表的绑定关系")
    @Description("获取血缘表的绑定关系")
    @Deprecated
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    public LineageStepBindResult findStepBindings(
            @Parameter(name = "lineageId", description = "血缘ID", required = true)
            @RequestParam("lineageId") Long lineageId,
            @Parameter(name = "stepId", description = "血缘表Id", required = true)
            @RequestParam("stepId") String stepId) {

        Lineage lineage = lineageDao.getLineageById(lineageId);
        LineageContainer lineageContainer = null;
        try {
            lineageContainer = mapper.readValue(lineage.getContent(), LineageContainer.class);
        } catch (IOException ioe) {
            throw new UnexpectedStateException(
                msgService.getMessage("deserializeLineageFailed", ioe.getMessage()));
        }
        return buildBindingResult(lineageContainer.getStepsSet(), lineageId, stepId).get(0);
    }

    @RequestMapping("/endpoints/lineage")
    @Operation(summary = "获取血缘的绑定关系", hidden = true, description = "获取血缘的绑定关系")
    @Description("获取血缘的绑定关系")
    @Deprecated
    public List<LineageStepBindResult> findLineageBindings(
            @Parameter(name = "lineageId", description = "血缘ID", required = true)
            @RequestParam("lineageId") Long lineageId) {
        Lineage lineage = lineageDao.getLineageById(lineageId);
        LineageContainer lineageContainer = null;
        try {
            lineageContainer = mapper.readValue(lineage.getContent(), LineageContainer.class);
        } catch (IOException ioe) {
            throw new UnexpectedStateException(
                msgService.getMessage("deserializeLineageFailed", ioe.getMessage()));
        }
        return buildBindingResult(lineageContainer.getStepsSet(), lineageId, null);
    }

    private List<LineageStepBindResult> buildBindingResult(Collection<LineageStep> bindings,
        Long lineageId, String findStepId) {
        if (bindings == null || bindings.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, LineageStepBindResult> stepMap = new HashMap<>();

        Set<Long> tableIds = new HashSet<>();
        List<CommonModelElement> tableElements = new LinkedList<>();

        for (LineageStep lineageStep : bindings) {

            String stepId = lineageStep.getId();
            if (findStepId != null && !stepId.equals(findStepId)) {
                continue;
            }
            if (!lineageStep.hasProperty(LineageKnownProperty.BIND_OBJECT_ID.getPropertyName())) {
                continue;
            }
            Long tableObjectId = Long.valueOf(lineageStep.getProperty(
                LineageKnownProperty.BIND_OBJECT_ID.getPropertyName()));
            Long modelId = Long.valueOf(lineageStep.getProperty(
                LineageKnownProperty.MODEL_ID.getPropertyName()));
            boolean isDdm = "true".equals(
                lineageStep.getProperty(LineageKnownProperty.DDM_OBJECT.getPropertyName()));

            if (isDdm) {
                String ddmTableId =
                    "ddm-" + modelId + "-" + tableObjectId;
                if (!stepMap.containsKey(lineageStep.getId())) {
                    LineageStepBindResult step = new LineageStepBindResult();
                    step.setDdmStep(true);
                    step.setLineageId(lineageId);
                    step.setStepId(stepId);
                    step.setTableObjectId(ddmTableId);
                    stepMap.put(stepId, step);
                    step.setColumns(new LinkedList<>());

                    CommonModelElement element = new CommonModelElement();
                    element.setElementId(tableObjectId);
                    element.setModelId(modelId);
                    tableElements.add(element);
                    ArrayList<LineageColumnBindResult> crs = new ArrayList<>();
                    for (LineageColumn column : lineageStep.getColumns()) {
                        if (column.getProperties() == null || !column.getProperties()
                            .containsKey(LineageKnownProperty.BIND_OBJECT_ID.getPropertyName())) {
                            continue;
                        }
                        Long columnId = Long.valueOf(column.getProperty(
                            LineageKnownProperty.BIND_OBJECT_ID.getPropertyName()));
                        LineageColumnBindResult cr = new LineageColumnBindResult();
                        cr.setColumnId(column.getId());
                        cr.setColumnObjectId(columnId);
                        crs.add(cr);

                    }
                    step.setColumns(crs);
                }
            } else {
                if (!stepMap.containsKey(stepId)) {
                    LineageStepBindResult step = new LineageStepBindResult();
                    step.setDdmStep(false);
                    step.setLineageId(lineageId);
                    step.setStepId(stepId);
                    step.setTableObjectId(tableObjectId.toString());
                    stepMap.put(stepId, step);
                    step.setColumns(new LinkedList<>());

                    tableIds.add(tableObjectId);
                    ArrayList<LineageColumnBindResult> crs = new ArrayList<>();
                    for (LineageColumn column : lineageStep.getColumns()) {
                        if (column.getProperties() == null || !column.getProperties()
                            .containsKey(LineageKnownProperty.BIND_OBJECT_ID.getPropertyName())) {
                            continue;
                        }
                        Long columnId = Long.valueOf(column.getProperty(
                            LineageKnownProperty.BIND_OBJECT_ID.getPropertyName()));
                        LineageColumnBindResult cr = new LineageColumnBindResult();
                        cr.setColumnId(column.getId());
                        cr.setColumnObjectId(columnId);
                        crs.add(cr);

                    }
                    step.setColumns(crs);
                }

            }
        }

        Map<Long, ModelCategoryDto> categoryMap = new HashMap<>();
        Map<String, ModelCategoryDto> categoryNameMap = new HashMap<>();
        for (DataObject object : objectService.getDataObjectsByObjectIdsWithoutPermissionCheck(
            tableIds)) {
            for (LineageStepBindResult value : stepMap.values()) {
                if (ObjectUtils.equals(value.getTableObjectId(), object.getObjectId().toString())) {
                    value.setTableName(object.getPhysicalName());
                    value.setModelName(object.getParentPhysicalName());

                    if (!categoryMap.containsKey(object.getModelCategoryId())) {
                        ModelCategoryDto category = modelCategoryService.getModelCategory(
                            object.getModelCategoryId());
                        categoryMap.put(category.getCategoryId(), category);
                    }

                    ModelCategoryDto category = categoryMap.get(object.getModelCategoryId());
                    if (!categoryNameMap.containsKey(category.getCategoryName())) {
                        categoryNameMap.put(category.getCategoryName(), category);
                    }
                    value.setModelCategoryName(
                        category.getCategoryName() + "(" + category.getCategoryAbbreviation()
                            + ")");
                }
            }
        }

        LinkedList<LineageStepBindResult> toBeCleared = new LinkedList<>();
        for (CommonModelElement tableElem : tableElements) {
            for (LineageStepBindResult value : stepMap.values()) {
                if (ObjectUtils.equals(value.getTableObjectId(),
                    "ddm-" + tableElem.getModelId() + "-" + tableElem.getElementId())) {
                    try {
                        CommonModelElement table = RemoteServiceGetter.getDatablauRemoteModelService()
                            .getModelElementById(tableElem.getModelId(), tableElem.getElementId(),
                                false);
                        value.setTableName(table.getPhysicalName());

                        CommonShallowModel model = RemoteServiceGetter.getDatablauRemoteModelService()
                            .getModel(table.getModelId());
                        value.setModelName(
                            model.getReferredModelName() == null ? model.getModelName()
                                : model.getReferredModelName());

                        if (!categoryNameMap.containsKey(model.getCategoryName())) {
                            ModelCategoryDto category = modelCategoryService.getModelCategoryByName(
                                model.getCategoryName());
                            if (category != null) {
                                categoryNameMap.put(category.getCategoryName(), category);
                            }
                        }

                        ModelCategoryDto category = categoryNameMap.get(model.getCategoryName());
                        if (category != null) {
                            value.setModelCategoryName(category.getCategoryName() + "("
                                + category.getCategoryAbbreviation() + ")");
                        } else {
                            value.setModelCategoryName(model.getCategoryName());
                        }
                    } catch (InvalidArgumentException ie) {
                        logger.warn("The model has been updated," + ie.getMessage());
                        toBeCleared.add(value);
                        continue;
                    }
                }
            }
        }

        LinkedList<LineageStepBindResult> result = new LinkedList<>(stepMap.values());
        if (!toBeCleared.isEmpty()) {
            Iterator<LineageStepBindResult> iter = result.iterator();
            while (iter.hasNext()) {
                LineageStepBindResult re = iter.next();
                if (toBeCleared.contains(re)) {
                    iter.remove();
                }
            }
        }

        return result;
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "导入kettle类型的血缘文件，任务名称为："
//    )
    @RequestMapping(value = "/kettle/job/{jobName}", method = RequestMethod.POST)
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    @Operation(summary = "导入kettle类型的血缘文件", description = "导入kettle类型的血缘文件")
    @Description("导入kettle类型的血缘文件")
    @Parameter(name = "jobName", description = "任务名", in = ParameterIn.PATH, required = true)
    public Long createParseKettleJob(
            @Parameter(name = "jobName", description = "任务名", required = true)
            @PathVariable("jobName") String jobName,
            @Parameter(name = "file", description = "文件", required = true)
            @RequestParam("file") MultipartFile multipartFile,
            @Parameter(name = "originalLineageId", description = "原始血缘Id", required = false)
            @RequestParam(value = "originalLineageId", required = false) Long originalLineageId,
        @Parameter(name = "folderId", description = "目录ID")
        @RequestParam(value = "folderId", required = false) Long folderId) throws Exception {
        File file = null;
        try {
            file = DataUtility.uploadFile(multipartFile);
        } catch (Exception ex) {
            logger.error("failed to upload file", ex);
            throw new UnexpectedStateException(msgService.getMessage("failedToUploadFileParam", ex.getMessage()));
        }


        if (originalLineageId == null) {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    kettleParser, false, "Kettle", true, true, folderId);
        } else {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    kettleParser, originalLineageId, "Kettle", folderId);
        }
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "导入informatica类型的血缘文件，任务名称为："
//    )
    @RequestMapping(value = "/informatica/job/{jobName}", method = RequestMethod.POST)
    @Operation(summary = "导入informatica类型的血缘文件", description = "导入informatica类型的血缘文件")
    @Description("导入informatica类型的血缘文件")
    @Parameter(name = "jobName", description = "任务名", in = ParameterIn.PATH, required = true)
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    public Long createParseInformaticaJob(
            @Parameter(name = "jobName", description = "任务名", required = true)
            @PathVariable("jobName") String jobName,
            @Parameter(name = "file", description = "文件", required = true)
            @RequestParam("file") MultipartFile multipartFile,
            @Parameter(name = "originalLineageId", description = "原始血缘Id")
            @RequestParam(value = "originalLineageId", required = false) Long originalLineageId,
        @Parameter(name = "folderId", description = "目录ID")
        @RequestParam(value = "folderId", required = false) Long folderId) throws Exception {
        File file = null;
        try {
            file = DataUtility.uploadFile(multipartFile);
        } catch (Exception ex) {
            logger.error("failed to upload file", ex);
            throw new UnexpectedStateException(msgService.getMessage("failedToUploadFileParam", ex.getMessage()));
        }


        if (originalLineageId == null) {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    informaticaParser, false, "Informatica", true, true, folderId);
        } else {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    informaticaParser, originalLineageId, "Informatica", folderId);
        }
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "导入tableau类型的血缘文件，任务名称为："
//    )
    @RequestMapping(value = "/tableau/job/{jobName}", method = RequestMethod.POST)
    @Operation(summary = "导入tableau类型的血缘文件", description = "导入tableau类型的血缘文件")
    @Description("导入tableau类型的血缘文件")
    @Parameter(name = "jobName", description = "任务名", in = ParameterIn.PATH, required = true)
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    public Long createParseTableauJob(
            @Parameter(name = "jobName", description = "任务名", required = true)
            @PathVariable("jobName") String jobName,
            @Parameter(name = "file", description = "文件", required = true)
            @RequestParam("file") MultipartFile multipartFile,
            @Parameter(name = "originalLineageId", description = "原始血缘Id")
            @RequestParam(value = "originalLineageId", required = false) Long originalLineageId,
        @Parameter(name = "folderId", description = "目录ID")
        @RequestParam(value = "folderId", required = false) Long folderId) throws Exception {
        File file = null;
        try {
            file = DataUtility.uploadFile(multipartFile);
        } catch (Exception ex) {
            logger.error("failed to upload file", ex);
            throw new UnexpectedStateException(msgService.getMessage("failedToUploadFileParam", ex.getMessage()));
        }


        if (originalLineageId == null) {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    tableauParser, false, "Tableau", true, true, folderId);
        } else {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    tableauParser, originalLineageId, "Tableau", folderId);
        }
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "导入script-tsql类型的血缘文件，任务名称为："
//    )
    @RequestMapping(value = "/script-tsql/job/{jobName}", method = RequestMethod.POST)
    @Operation(summary = "导入script-tsql类型的血缘文件", description = "导入script-tsql类型的血缘文件")
    @Description("导入script-tsql类型的血缘文件")
    @Parameter(name = "jobName", description = "任务名", in = ParameterIn.PATH, required = true)
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    public Long createParseTsqlJob(
            @Parameter(name = "jobName", description = "任务名", required = true)
            @PathVariable("jobName") String jobName,
            @Parameter(name = "file", description = "文件", required = true)
            @RequestParam("file") MultipartFile multipartFile,
            @Parameter(name = "originalLineageId", description = "原始血缘Id")
            @RequestParam(value = "originalLineageId", required = false) Long originalLineageId,
        @Parameter(name = "folderId", description = "目录ID")
        @RequestParam(value = "folderId", required = false) Long folderId) throws Exception {
        File file = null;
        try {
            file = DataUtility.uploadFile(multipartFile);
        } catch (Exception ex) {
            logger.error("failed to upload file", ex);
            throw new UnexpectedStateException(msgService.getMessage("failedToUploadFileParam", ex.getMessage()));
        }


        if (originalLineageId == null) {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    sqlServerTsqlParser, false, "TSqlScript", true, true, folderId);
        } else {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    sqlServerTsqlParser, originalLineageId, "TSqlScript", folderId);
        }
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "导入script-plsql类型的血缘文件，任务名称为："
//    )
    @RequestMapping(value = "/script-plsql/job/{jobName}", method = RequestMethod.POST)
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    @Operation(summary = "导入script-plsql类型的血缘文件", description = "导入script-plsql类型的血缘文件")
    @Description("导入script-plsql类型的血缘文件")
    @Parameter(name = "jobName", description = "任务名", in = ParameterIn.PATH, required = true)
    public Long createParsePlSqlJob(
            @Parameter(name = "jobName", description = "任务名", required = true)
            @PathVariable("jobName") String jobName,
            @Parameter(name = "file", description = "文件", required = true)
            @RequestParam("file") MultipartFile multipartFile,
            @Parameter(name = "originalLineageId", description = "原始血缘Id")
            @RequestParam(value = "originalLineageId", required = false) Long originalLineageId,
        @Parameter(name = "folderId", description = "目录ID")
        @RequestParam(value = "folderId", required = false) Long folderId) throws Exception {
        File file = null;
        try {
            file = DataUtility.uploadFile(multipartFile);
        } catch (Exception ex) {
            logger.error("failed to upload file", ex);
            throw new UnexpectedStateException(msgService.getMessage("failedToUploadFileParam", ex.getMessage()));
        }


        if (originalLineageId == null) {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    plSqlParser, false, "PLSqlScript", true, true, folderId);
        } else {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    plSqlParser, originalLineageId, "PLSqlScript", folderId);
        }
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "导入script-postgresql类型的血缘文件，任务名称为："
//    )
    @RequestMapping(value = "/script-postgresql/job/{jobName}", method = RequestMethod.POST)
    @Operation(summary = "导入script-postgresql类型的血缘文件", description = "导入script-postgresql类型的血缘文件")
    @Description("导入script-postgresql类型的血缘文件")
    @Parameter(name = "jobName", description = "任务名", in = ParameterIn.PATH, required = true)
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    public Long createParsePostgreSqlJob(
            @Parameter(name = "jobName", description = "任务名", required = true)
            @PathVariable("jobName") String jobName,
            @Parameter(name = "file", description = "文件", required = true)
            @RequestParam("file") MultipartFile multipartFile,
            @Parameter(name = "originalLineageId", description = "原始血缘Id")
            @RequestParam(value = "originalLineageId", required = false) Long originalLineageId,
        @Parameter(name = "folderId", description = "目录ID")
        @RequestParam(value = "folderId", required = false) Long folderId) throws Exception {
        File file = null;
        try {
            file = DataUtility.uploadFile(multipartFile);
        } catch (Exception ex) {
            logger.error("failed to upload file", ex);
            throw new UnexpectedStateException(msgService.getMessage("failedToUploadFileParam", ex.getMessage()));
        }

        if (originalLineageId == null) {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    postgreSqlParser, false, "PostgreSqlScript", true, true, folderId);
        } else {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    postgreSqlParser, originalLineageId, "PostgreSqlScript", folderId);
        }
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "导入script-gaussdb类型的血缘文件，任务名称为："
//    )
    @RequestMapping(value = "/script-gaussdb/job/{jobName}", method = RequestMethod.POST)
    @Operation(summary = "导入script-gaussdb类型的血缘文件", description = "导入script-gaussdb类型的血缘文件")
    @Description("导入script-gaussdb类型的血缘文件")
    @Parameter(name = "jobName", description = "任务名", in = ParameterIn.PATH, required = true)
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    public Long createParseGaussdbSqlJob(
            @Parameter(name = "jobName", description = "任务名", required = true)
            @PathVariable("jobName") String jobName,
            @Parameter(name = "file", description = "文件", required = true)
            @RequestParam("file") MultipartFile multipartFile,
            @Parameter(name = "originalLineageId", description = "原始血缘Id")
            @RequestParam(value = "originalLineageId", required = false) Long originalLineageId,
        @Parameter(name = "folderId", description = "目录ID")
        @RequestParam(value = "folderId", required = false) Long folderId) throws Exception {
        File file = null;
        try {
            file = DataUtility.uploadFile(multipartFile);
        } catch (Exception ex) {
            logger.error("failed to upload file", ex);
            throw new UnexpectedStateException(msgService.getMessage("failedToUploadFileParam", ex.getMessage()));
        }

        if (originalLineageId == null) {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    gaussDBParser, false, "GaussDBScript", true, true, folderId);
        } else {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    gaussDBParser, originalLineageId, "GaussDBScript", folderId);
        }
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "导入script-flink类型的血缘文件，任务名称为："
//    )
    @RequestMapping(value = "/script-flink/job/{jobName}", method = RequestMethod.POST)
    @Operation(summary = "导入script-flink类型的血缘文件", description = "导入script-flink类型的血缘文件")
    @Description("导入script-flink类型的血缘文件")
    @Parameter(name = "jobName", description = "任务名", in = ParameterIn.PATH, required = true)
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    public Long createParseFlinkSqlJob(
            @Parameter(name = "jobName", description = "任务名", required = true)
            @PathVariable("jobName") String jobName,
            @Parameter(name = "file", description = "文件", required = true)
            @RequestParam("file") MultipartFile multipartFile,
            @Parameter(name = "originalLineageId", description = "原始血缘Id")
            @RequestParam(value = "originalLineageId", required = false) Long originalLineageId,
        @Parameter(name = "folderId", description = "目录ID")
        @RequestParam(value = "folderId", required = false) Long folderId) throws Exception {
        File file = null;
        try {
            file = DataUtility.uploadFile(multipartFile);
        } catch (Exception ex) {
            logger.error("failed to upload file", ex);
            throw new UnexpectedStateException(msgService.getMessage("failedToUploadFileParam", ex.getMessage()));
        }

        if (originalLineageId == null) {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    flinkParser, false, "FlinkSqlScript", true, true, folderId);
        } else {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    flinkParser, originalLineageId, "FlinkSqlScript", folderId);
        }
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "导入script-hql类型的血缘文件，任务名称为："
//    )
    @RequestMapping(value = "/script-hql/job/{jobName}", method = RequestMethod.POST)
    @Operation(summary = "导入script-hql类型的血缘文件", description = "导入script-hql类型的血缘文件")
    @Description("导入script-hql类型的血缘文件")
    @Parameter(name = "jobName", description = "任务名", in = ParameterIn.PATH, required = true)
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    public Long createParseHqlJob(
            @Parameter(name = "jobName", description = "任务名", required = true)
            @PathVariable("jobName") String jobName,
            @Parameter(name = "file", description = "文件", required = true)
            @RequestParam("file") MultipartFile multipartFile,
            @Parameter(name = "originalLineageId", description = "原始血缘Id")
            @RequestParam(value = "originalLineageId", required = false) Long originalLineageId,
        @Parameter(name = "folderId", description = "目录ID")
        @RequestParam(value = "folderId", required = false) Long folderId) throws Exception {
        File file = null;
        try {
            file = DataUtility.uploadFile(multipartFile);
        } catch (Exception ex) {
            logger.error("failed to upload file", ex);
            throw new UnexpectedStateException(msgService.getMessage("failedToUploadFileParam", ex.getMessage()));
        }

        if (originalLineageId == null) {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    hqlParser, false, "HqlScript", true, true, folderId);
        } else {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    hqlParser, originalLineageId, "HqlScript", folderId);
        }
    }

    /*
    @RequestMapping(value = "/batchimport", method = RequestMethod.POST)
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    public Long createBatchImportJob(@RequestBody BatchImportLineageRequest request) {
        if (Strings.isNullOrEmpty(request.getFolder())) {
            throw new InvalidArgumentException("没有给定导入目录");
        }

        File dir = new File(request.getFolder());
        if (!dir.exists() || !dir.isDirectory()) {
            throw new InvalidArgumentException("给定的路径不存在或者不是一个目录");
        }

        if (!dir.canRead()) {
            throw new InvalidArgumentException("给定的路径不可读取");
        }

        String lineageType = request.getType();
        if (Strings.isNullOrEmpty(lineageType)) {
            throw new InvalidArgumentException("没有给定血缘类型");
        }

        LineageService service = null;
        switch (lineageType.toLowerCase()) {
            case "datastage":
                service = datastageParser;
                break;
            case "ssis":
                service = ssisLineageParser;
                break;
            case "tableau":
                service = tableauParser;
                break;
            case "kettle":
                service = kettleParser;
                break;
            case "excel":
                service = new LineageSimpleTemplateParser();
                break;
            case "informatica":
                service = informaticaParser;
                break;
            case "script-tsql":
                service = sqlServerTsqlParser;
                break;
            case "script-plsql":
                service = plSqlParser;
                break;
            case "script-hql":
                service = hqlParser;
                break;
            default:
                throw new InvalidArgumentException("不支持的血缘类型[" + lineageType + "]");
        }

        BatchLineageParser batchLineageParser = new BatchLineageParser(dir, service);
        return simpleJobService.createJob("LineageBatchImport", batchLineageParser);
    }
    */

//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "导入datastage类型的血缘文件，任务名称为："
//    )
    @RequestMapping(value = "/datastage/job/{jobName}", method = RequestMethod.POST)
    @Operation(summary = "导入datastage类型的血缘文件", description = "导入datastage类型的血缘文件")
    @Description("导入datastage类型的血缘文件")
    @Parameter(name = "jobName", description = "任务名", in = ParameterIn.PATH, required = true)
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    public Long createParseDataStageJob(
            @Parameter(name = "jobName", description = "任务名", required = true)
            @PathVariable("jobName") String jobName,
            @Parameter(name = "file", description = "文件", required = true)
            @RequestParam("file") MultipartFile multipartFile,
            @Parameter(name = "originalLineageId", description = "原始血缘Id")
            @RequestParam(value = "originalLineageId", required = false) Long originalLineageId,
        @Parameter(name = "folderId", description = "目录ID")
        @RequestParam(value = "folderId", required = false) Long folderId) throws Exception {
        File file = null;
        try {
            file = DataUtility.uploadFile(multipartFile);
        } catch (Exception ex) {
            logger.error("failed to upload file", ex);
            throw new UnexpectedStateException(msgService.getMessage("failedToUploadFileParam", ex.getMessage()));
        }

        if (originalLineageId == null) {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    datastageParser, false, "DataStage", true, true, folderId);
        } else {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    datastageParser, originalLineageId, "DataStage", folderId);
        }
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "导入ssis类型的血缘文件，任务名称为："
//    )
    @RequestMapping(value = "/ssis/job/{jobName}", method = RequestMethod.POST)
    @Operation(summary = "导入ssis类型的血缘文件", description = "导入ssis类型的血缘文件")
    @Description("导入ssis类型的血缘文件")
    @Parameter(name = "jobName", description = "任务名", in = ParameterIn.PATH, required = true)
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    public Long createParseSSISJob(
            @Parameter(name = "jobName", description = "任务名", required = true)
            @PathVariable("jobName") String jobName,
            @Parameter(name = "file", description = "文件", required = true)
            @RequestParam("file") MultipartFile multipartFile,
            @Parameter(name = "originalLineageId", description = "原始血缘Id")
            @RequestParam(value = "originalLineageId", required = false) Long originalLineageId,
        @Parameter(name = "folderId", description = "目录ID")
        @RequestParam(value = "folderId", required = false) Long folderId) throws Exception {
        File file = null;
        try {
            file = DataUtility.uploadFile(multipartFile);
        } catch (Exception ex) {
            logger.error("failed to upload file", ex);
            throw new UnexpectedStateException(msgService.getMessage("failedToUploadFileParam", ex.getMessage()));
        }

        if (originalLineageId == null) {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    ssisLineageParser, false, "SSIS", true, true, folderId);
        } else {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    ssisLineageParser, originalLineageId, "SSIS", folderId);
        }
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "导入restcloud类型的血缘文件，任务名称为："
//    )
    @RequestMapping(value = "/restcloud/job/{jobName}", method = RequestMethod.POST)
    @Operation(summary = "导入restcloud类型的血缘文件", description = "导入restcloud类型的血缘文件")
    @Description("导入restcloud类型的血缘文件")
    @Parameter(name = "jobName", description = "任务名", in = ParameterIn.PATH, required = true)
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    public Long createParseRestcloudJob(
            @Parameter(name = "jobName", description = "任务名", required = true)
            @PathVariable("jobName") String jobName,
            @Parameter(name = "file", description = "文件", required = true)
            @RequestParam("file") MultipartFile multipartFile,
            @Parameter(name = "originalLineageId", description = "原始血缘Id")
            @RequestParam(value = "originalLineageId", required = false) Long originalLineageId,
        @Parameter(name = "folderId", description = "目录ID")
        @RequestParam(value = "folderId", required = false) Long folderId) throws Exception {
        File file = null;
        try {
            file = DataUtility.uploadFile(multipartFile);
        } catch (Exception ex) {
            logger.error("failed to upload file", ex);
            throw new UnexpectedStateException(msgService.getMessage("failedToUploadFileParam", ex.getMessage()));
        }

        if (originalLineageId == null) {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    restCloudParser, false, "RESTCLOUD", true, true, folderId);
        } else {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    restCloudParser, originalLineageId, "RESTCLOUD", folderId);
        }
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "导入generalsql类型的血缘文件，任务名称为："
//    )
    @RequestMapping(value = "/generalsql/job/{jobName}", method = RequestMethod.POST)
    @Operation(summary = "导入generalsql类型的血缘文件", description = "导入generalsql类型的血缘文件")
    @Description("导入generalsql类型的血缘文件")
    @Parameter(name = "jobName", description = "任务名", in = ParameterIn.PATH, required = true)
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    public Long createParseGeneralSqlJob(
            @Parameter(name = "jobName", description = "任务名", required = true)
            @PathVariable("jobName") String jobName,
            @Parameter(name = "file", description = "文件", required = true)
            @RequestParam("file") MultipartFile multipartFile,
        @Parameter(name = "folderId", description = "目录ID")
        @RequestParam(value = "folderId", required = false) Long folderId
    ) throws Exception {
        File file = null;
        try {
            file = DataUtility.uploadFile(multipartFile);
        } catch (Exception ex) {
            logger.error("failed to upload file", ex);
            throw new UnexpectedStateException(msgService.getMessage("failedToUploadFileParam", ex.getMessage()));
        }

        return importService.createLoadGeneralSqlJob(file, multipartFile.getOriginalFilename(), jobName, folderId);
    }


//    @OperatorLog(
//        operation = OperationLogType.DATA_IMPORT,
//        operateTable = "dam_lineage_content",
//        systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//        description = "导入datax类型的血缘文件，任务名称为："
//    )
    @RequestMapping(value = "/datax/job/{jobName}", method = RequestMethod.POST)
    @Operation(summary = "导入datax类型的血缘文件", description = "导入datax类型的血缘文件")
    @Description("导入datax类型的血缘文件")
    @Parameter(name = "jobName", description = "任务名", in = ParameterIn.PATH, required = true)
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    public Long createParseDataXJob(
        @Parameter(name = "jobName", description = "任务名", required = true)
        @PathVariable("jobName") String jobName,
        @Parameter(name = "file", description = "文件", required = true)
        @RequestParam("file") MultipartFile multipartFile,
        @Parameter(name = "originalLineageId", description = "原始血缘Id")
        @RequestParam(value = "originalLineageId", required = false) Long originalLineageId,
        @Parameter(name = "folderId", description = "目录ID")
        @RequestParam(value = "folderId", required = false) Long folderId)
        throws Exception {

        File file = null;
        try {
            file = DataUtility.uploadFile(multipartFile);
        } catch (Exception ex) {
            logger.error("failed to upload file", ex);
            throw new UnexpectedStateException(
                msgService.getMessage("failedToUploadFileParam", ex.getMessage()));
        }

        return importService.createLoadDataXJob(file, multipartFile.getOriginalFilename(), jobName,
            true,
            false, originalLineageId, folderId);
    }
//    @RequestMapping(value = "/manual2/job/{jobName}", method = RequestMethod.POST)
//    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
//    public Long uploadTemplateFile(@PathVariable("jobName") String jobName,
//        @RequestParam("file") MultipartFile multipartFile) throws Exception {
//        File file = null;
//        try {
//            file = DataUtility.uploadFile(multipartFile);
//        } catch (Exception ex) {
//            logger.error("failed to upload file", ex);
//            throw new UnexpectedStateException(msgService.getMessage("failedToUploadFileParam", ex.getMessage()));
//        }
//
//        String fileMD5 = DigestUtils.getFileMd5(file);
//        checkFileMD5Existense(fileMD5);
//        LineageParser parser = new LineageParser(file, jobName, multipartFile.getOriginalFilename(),
//            new LineageTemplateParser(), fileMD5);
//        return simpleJobService
//            .createJob("Excel:" + multipartFile.getOriginalFilename(), parser);
//    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "导入zip类型的血缘文件，任务名称为："
//    )
    @RequestMapping(value = "/zip/types/{type}/job/{jobName}", method = RequestMethod.POST)
    @Operation(summary = "导入zip类型的血缘文件", description = "导入zip类型的血缘文件")
    @Description("导入zip类型的血缘文件")
    @Parameter(name = "jobName", description = "任务名", in = ParameterIn.PATH, required = true)
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    public Long uploadZipFile(
            @Parameter(name = "jobName", description = "任务名", required = true)
            @PathVariable("jobName") String jobName,
            @Parameter(name = "type", description = "血缘类型", required = true)
            @PathVariable("type") String type,
            @Parameter(name = "file", description = "文件", required = true)
            @RequestParam("file") MultipartFile multipartFile,
        @Parameter(name = "folderId", description = "目录ID")
        @RequestParam(value = "folderId", required = false) Long folderId) throws Exception {
        File file = null;
        try {
            file = DataUtility.
                    uploadFile(multipartFile);

        } catch (Exception ex) {
            logger.error("failed to upload file", ex);
            throw new UnexpectedStateException(msgService.getMessage("failedToUploadFileParam", ex.getMessage()));
        }

        String tempPath = new File(FileUtility.getTempFolder()).getCanonicalPath();
        tempPath += File.separator + UUID.randomUUID().toString().substring(0, 8);
        try {
            ZipFile zipFile = new ZipFile(file);
            zipFile.setCharset(Charset.forName("GBK"));
            zipFile.extractAll(tempPath);
        } catch (Exception ex) {
            throw new UnexpectedStateException(msgService.getMessage("failedToUnzipFileOne", ex.getMessage()));
        }

        BatchImportLineageRequest request = new BatchImportLineageRequest();
        request.setFolder(tempPath);
        request.setType(type);
        return importService.createBatchImportJob(request, folderId);
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "导入manual类型的血缘文件，任务名称为："
//    )
    @RequestMapping(value = "/manual/job/{jobName}", method = RequestMethod.POST)
    @Operation(summary = "导入manual类型的血缘文件", description = "导入manual类型的血缘文件")
    @Description("导入manual类型的血缘文件")
    @Parameter(name = "jobName", description = "任务名", in = ParameterIn.PATH, required = true)
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    public Long uploadSimpleTemplateFile(
            @Parameter(name = "jobName", description = "任务名", required = true)
            @PathVariable("jobName") String jobName,
            @Parameter(name = "file", description = "文件", required = true)
            @RequestParam("file") MultipartFile multipartFile,
            @Parameter(name = "originalLineageId", description = "原始血缘Id")
            @RequestParam(value = "originalLineageId", required = false) Long originalLineageId,
        @Parameter(name = "folderId", description = "目录ID")
        @RequestParam(value = "folderId", required = false) Long folderId) throws Exception {
        File file = null;
        try {
            file = DataUtility.uploadFile(multipartFile);
        } catch (Exception ex) {
            logger.error("failed to upload file", ex);
            throw new UnexpectedStateException(msgService.getMessage("failedToUploadFileParam", ex.getMessage()));
        }

        if (originalLineageId != null) {
            return importService.createSimpleTemplateLoadJob(file, jobName,
                multipartFile.getOriginalFilename(), originalLineageId, folderId);
        } else {
            return importService.createSimpleTemplateLoadJob(file, jobName, multipartFile.getOriginalFilename(), folderId);
        }
    }

//    @OperatorLog(
//        operation = OperationLogType.DATA_IMPORT,
//        operateTable = "dam_lineage_content",
//        systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//        description = "导入script-clickhouse类型的血缘文件，任务名称为："
//    )
    @RequestMapping(value = "/script-clickhouse/job/{jobName}", method = RequestMethod.POST)
    @Operation(summary = "导入script-clickhouse类型的血缘文件", description = "导入script-clickhouse类型的血缘文件")
    @Description("导入script-clickhouse类型的血缘文件")
    @Parameter(name = "jobName", description = "任务名", in = ParameterIn.PATH, required = true)
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    public Long createClickHouseJob(
        @Parameter(name = "jobName", description = "任务名", required = true)
        @PathVariable("jobName") String jobName,
        @Parameter(name = "file", description = "文件", required = true)
        @RequestParam("file") MultipartFile multipartFile,
        @Parameter(name = "originalLineageId", description = "原始血缘Id")
        @RequestParam(value = "originalLineageId", required = false) Long originalLineageId,
        @Parameter(name = "folderId", description = "目录ID")
        @RequestParam(value = "folderId", required = false) Long folderId) throws Exception {
        File file = null;
        try {
            file = DataUtility.uploadFile(multipartFile);
        } catch (Exception ex) {
            logger.error("failed to upload file", ex);
            throw new UnexpectedStateException(msgService.getMessage("failedToUploadFileParam", ex.getMessage()));
        }

        if (originalLineageId == null) {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                clickHouseParser, false, "ClickHouseScript", true, true, folderId);
        } else {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                clickHouseParser, originalLineageId, "ClickHouseScript", folderId);
        }
    }

//    @OperatorLog(
//        operation = OperationLogType.DATA_IMPORT,
//        operateTable = "dam_lineage_content",
//        systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//        description = "导入script-redshift类型的血缘文件，任务名称为："
//    )
    @RequestMapping(value = "/script-redshift/job/{jobName}", method = RequestMethod.POST)
    @Operation(summary = "导入script-redshift类型的血缘文件", description = "导入script-redshift类型的血缘文件")
    @Description("导入script-redshift类型的血缘文件")
    @Parameter(name = "jobName", description = "任务名", in = ParameterIn.PATH, required = true)
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    public Long createRedshiftJob(
        @Parameter(name = "jobName", description = "任务名", required = true)
        @PathVariable("jobName") String jobName,
        @Parameter(name = "file", description = "文件", required = true)
        @RequestParam("file") MultipartFile multipartFile,
        @Parameter(name = "originalLineageId", description = "原始血缘Id")
        @RequestParam(value = "originalLineageId", required = false) Long originalLineageId,
        @Parameter(name = "folderId", description = "目录ID")
        @RequestParam(value = "folderId", required = false) Long folderId) throws Exception {
        File file = null;
        try {
            file = DataUtility.uploadFile(multipartFile);
        } catch (Exception ex) {
            logger.error("failed to upload file", ex);
            throw new UnexpectedStateException(msgService.getMessage("failedToUploadFileParam", ex.getMessage()));
        }

        if (originalLineageId == null) {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                redshiftLineageParser, false, "RedshiftScript", true, true, folderId);
        } else {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                redshiftLineageParser, originalLineageId, "RedshiftScript", folderId);
        }
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "导入script-gbase类型的血缘文件，任务名称为："
//    )
    @RequestMapping(value = "/script-gbase/job/{jobName}", method = RequestMethod.POST)
    @Operation(summary = "导入script-gbase类型的血缘文件", description = "导入script-gbase类型的血缘文件")
    @Description("导入script-gbase类型的血缘文件")
    @Parameter(name = "jobName", description = "任务名", in = ParameterIn.PATH, required = true)
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    public Long createGBaseJob(
            @Parameter(name = "jobName", description = "任务名", required = true)
            @PathVariable("jobName") String jobName,
            @Parameter(name = "file", description = "文件", required = true)
            @RequestParam("file") MultipartFile multipartFile,
            @Parameter(name = "originalLineageId", description = "原始血缘Id")
            @RequestParam(value = "originalLineageId", required = false) Long originalLineageId,
            @Parameter(name = "folderId", description = "目录ID")
            @RequestParam(value = "folderId", required = false) Long folderId) throws Exception {
        File file = null;
        try {
            file = DataUtility.uploadFile(multipartFile);
        } catch (Exception ex) {
            logger.error("failed to upload file", ex);
            throw new UnexpectedStateException(msgService.getMessage("failedToUploadFileParam", ex.getMessage()));
        }

        if (originalLineageId == null) {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    gbaseLineageParser, false, "GBaseScript", true, true, folderId);
        } else {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    gbaseLineageParser, originalLineageId, "GBaseScript", folderId);
        }
    }

//    @OperatorLog(
//        operation = OperationLogType.DATA_IMPORT,
//        operateTable = "dam_lineage_content",
//        systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//        description = "导入script-mysql类型的血缘文件，任务名称为："
//    )
    @RequestMapping(value = "/script-mysql/job/{jobName}", method = RequestMethod.POST)
    @Operation(summary = "导入script-mysql类型的血缘文件", description = "导入script-mysql类型的血缘文件")
    @Description("导入script-mysql类型的血缘文件")
    @Parameter(name = "jobName", description = "任务名", in = ParameterIn.PATH, required = true)
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    public Long createMysqlJob(
        @Parameter(name = "jobName", description = "任务名", required = true)
        @PathVariable("jobName") String jobName,
        @Parameter(name = "file", description = "文件", required = true)
        @RequestParam("file") MultipartFile multipartFile,
        @Parameter(name = "originalLineageId", description = "原始血缘Id")
        @RequestParam(value = "originalLineageId", required = false) Long originalLineageId,
        @Parameter(name = "folderId", description = "目录ID")
        @RequestParam(value = "folderId", required = false) Long folderId) throws Exception {
        File file = null;
        try {
            file = DataUtility.uploadFile(multipartFile);
        } catch (Exception ex) {
            logger.error("failed to upload file", ex);
            throw new UnexpectedStateException(msgService.getMessage("failedToUploadFileParam", ex.getMessage()));
        }

        if (originalLineageId == null) {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                mySqlLineageParser, false, "MysqlScript", true, true, folderId);
        } else {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                mySqlLineageParser, originalLineageId, "MysqlScript", folderId);
        }
    }

    //todo 7.0
//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "导入sparkSql类型的血缘文件"
//    )
    @RequestMapping(value = "/script-spark/job/{jobName}", method = RequestMethod.POST)
    @Operation(summary = "导入script-spark类型的血缘文件", description = "导入script-spark类型的血缘文件")
    @Description("导入script-spark类型的血缘文件")
    @Parameter(name = "jobName", description = "任务名", in = ParameterIn.PATH, required = true)
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    public Long createSparkJob(
            @Parameter(name = "jobName", description = "任务名", required = true)
            @PathVariable("jobName") String jobName,
            @Parameter(name = "file", description = "文件", required = true)
            @RequestParam("file") MultipartFile multipartFile,
            @Parameter(name = "originalLineageId", description = "原始血缘Id")
            @RequestParam(value = "originalLineageId", required = false) Long originalLineageId,
            @Parameter(name = "folderId", description = "目录ID")
            @RequestParam(value = "folderId", required = false) Long folderId) throws Exception {

        File file = null;
        try {
            file = DataUtility.uploadFile(multipartFile);
        } catch (Exception ex) {
            logger.error("failed to upload file", ex);
            throw new UnexpectedStateException(msgService.getMessage("failedToUploadFileParam", ex.getMessage()));
        }

        if (originalLineageId == null) {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    sparkSqlParser, false, "SparkScript", true, true, folderId);
        } else {
            return importService.createLineageImportJob(file, jobName, multipartFile.getOriginalFilename(),
                    sparkSqlParser, originalLineageId, "SparkScript", folderId);
        }
    }

    @RequestMapping("/object/{objectId}")
    @Operation(summary = "根据tableId获取血缘", description = "根据tableId获取血缘")
    @Description("根据tableId获取血缘")
    public LineageContainer getObjectLineage(
            @Parameter(name = "objectId", description = "元数据table的objectId", required = true)
            @PathVariable("objectId") Long objectId,
            @Parameter(name = "onlyImpact", description = "仅获影响血缘", required = true)
            @RequestParam(name = "onlyImpact", defaultValue = "true") Boolean onlyImpact) {
        return mappingService.getLineageOfObject(objectId, onlyImpact);
    }

    @RequestMapping("/object/{objectId}/type")
    @Description("查询一个object的血缘")
    @Operation(summary = "查询一个object的血缘")
    public LineageContainer getObjectLineageByType(@Parameter(name = "objectId", description = "唯一id")
                                                   @PathVariable("objectId") Long objectId,
                                                   @Parameter(name = "type", description = "类型")
                                                   @RequestParam(name = "type", defaultValue = "right") String type) {
        LineageContainer container =  mappingService.getLineageOfObject(objectId, type);
        setQualityProperties(container);
        return container;
    }


    @RequestMapping("/object/{objectId}/qualityInfo")
    @Operation(summary = "根据ObjectId获取数据质量数据", description = "根据ObjectId获取数据质量数据")
    @Description("根据ObjectId获取数据质量数据")
    @Parameter(name = "objectId", description = "元数据表的objectId", in = ParameterIn.PATH, required = true)
    public LineageQualityInfo getLineageQualityInfoByObjectId(@PathVariable("objectId") Long objectId) {
        return getLineageInfoByObject(objectId);
    }

    @RequestMapping("/object/{objectId}/download/{type}")
    @Operation(summary = "根据ObjectId下载数据质量问题", description = "根据ObjectId下载数据质量问题")
    @Description("根据ObjectId下载数据质量问题")
    @Parameters({
            @Parameter(name = "objectId", description = "元数据表的objectId", in = ParameterIn.PATH, required = true),
            @Parameter(name = "type", description = "血缘类型1:下载血缘分析,2:下载血缘影响", in = ParameterIn.PATH, required = true)})
    public ResponseEntity<byte[]> downLoadQualityInfoByObjectId(@PathVariable("objectId") Long objectId, @PathVariable("type") Integer type)
            throws IOException {
        //type类型1是血缘分析下载  2是影响分析下载
        if(type == 1){
            return downLoadLineageInfo(objectId);
        }
        return downLoadEffectInfo(objectId);
    }

    @RequestMapping("/report/{objectId}/type")
    @Description("查询一个报表的血缘")
    @Operation(summary = "查询一个报表的血缘", description = "查询一个报表的血缘")
    @Parameter(name = "objectId", description = "报表Id", in = ParameterIn.PATH, required = true)
    public LineageContainer getReportLineageByType(@PathVariable("objectId") Long reportId) {
        return mappingService.getLineageOfReport(reportId);
    }


    @RequestMapping(value = "/metric", method = RequestMethod.POST)
    @Description("查询一个指标的血缘")
    @Operation(summary = "查询一个指标的血缘", description = "查询一个指标的血缘")
    @Parameter(name = "metricId", description = "指标ID",  in=ParameterIn.PATH, required = true)
    public LineageContainer getMetricLineage(@RequestParam("metricId") String metricId) {
        return mappingService.getLineageOfMetric(metricId);
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "导出sql关系导入模板"
//    )
    @RequestMapping("/downloadGeneralSqlTemplate")
    @Operation(summary = "导出sql关系导入模板", description = "导出sql关系导入模板")
    @Description("导出sql关系导入模板")
    public void downloadGeneralSqlTemplate(HttpServletResponse response) {
        File file = new File(ShareKit.getResourcePath("/lineage/general_sql_template.xlsx"));
        innerExportFile(file, response, msgService.getMessage("poi.sqlTemplate"));
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "导出血缘关系导入模板"
//    )
    @RequestMapping("/downloadTemplate")
    @Operation(summary = "导出血缘关系导入模板", description = "导出血缘关系导入模板")
    @Description("导出血缘关系导入模板")
    public void downloadTemplateFile(HttpServletResponse response) {
        //File file = mappingService.createSimpleTemplateFile();
        File file = new File(ShareKit.getResourcePath("/lineage/lineage_template.xlsx"));
        innerExportFile(file, response, msgService.getMessage("poi.lineageTemplate"));
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "导出血缘关系导入模板"
//    )
    @RequestMapping("/downloadTemplate2")
    @Operation(summary = "导出血缘关系导入模板", description = "导出血缘关系导入模板")
    @Description("导出血缘关系导入模板")
    public void downloadTemplateFile(
            @Parameter(name = "modelIds", description = "模型IDs", required = false)
            @RequestParam(name = "modelIds", required = false) String modelIds,
            HttpServletResponse response) {

        List<Long> ids = null;
        if (!Strings.isNullOrEmpty(modelIds)) {
            String[] idParts = modelIds.split(",");
            ids = new ArrayList<>(idParts.length);
            for (String id : idParts) {
                try {
                    ids.add(Long.parseLong(id));
                } catch (Exception ex) {
                    logger.warn("Failed to parse table id [" + id + "]");
                }
            }
        }

        File file = mappingService.createTemplateFile(ids);
        innerExportFile(file, response, msgService.getMessage("poi.lineageTemplate"));
    }

    private void innerExportFile(File file, HttpServletResponse response, String downloadName) {
        if (file.exists()) {
            response.setContentType("application/octet-stream");

            String realName = "lineage_template";

            try {
                realName = URLEncoder.encode(downloadName, "UTF-8");
                realName = realName.replace("+", "%20");
            } catch (Exception ex) {
                logger.warn("Failed to convert template file name");
            }

            response.setHeader("Content-disposition", "attachment; filename=" + realName + ".xlsx");
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
                        msgService.getMessage("failedToExportTemplateFile", ex.getMessage()));
            }
        }
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "删除血缘,ID为:"
//    )
    @RequestMapping(value = "/{lineageId}", method = RequestMethod.DELETE)
    @Transactional
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    @Operation(summary = "删除血缘", description = "删除血缘")
    @Description("删除血缘")
    @Parameter(name = "lineageId", description = "血缘Id", in = ParameterIn.PATH, required = true)
    public void deleteLineage(@PathVariable("lineageId") Long id) throws Exception {
        Lineage entity = lineageDao.getEntityById(id);
        if (entity == null) {
            throw new ItemNotFoundException(msgService.getMessage("cannotFindLineageFileWithThisID", id));
        }
        if (entity.getViewId() != null) {
            throw new IllegalOperationException(msgService.getMessage("spLineageCannotBeDeleted", entity.getFilename()));
        }

        if (ObjectUtils.notEqual(entity.getUploader(), AuthTools.currentUsernameFailFast())
                && !AuthTools.hasAnyRole("BLODD_VIEW", AuthTools.ROLE_SUPERUSER)) {
            throw new IllegalOperationException(msgService.getMessage("haveNoPermissionToEdit"));
        }

        lineageDao.deleteEntity(entity.getId());
    }

    @PostMapping(value = "/deleteLineages")
    @Operation(summary = "删除血缘", description = "删除血缘")
    @Description("删除血缘")
    public void deleteLineages(@RequestBody List<Long> ids) {
        List<Lineage> entities = lineageDao.getLineageByIds(ids);
        List<Long> existsIds = entities.stream().map(Lineage::getId).toList();
        for (Long o : ids) {
            if (!existsIds.contains(o)) {
                throw new ItemNotFoundException(msgService.getMessage("cannotFindLineageFileWithThisID", o));
            }
        }

        for (Lineage lineage : entities) {
            if (lineage.getViewId() != null) {
                throw new IllegalOperationException(msgService.getMessage("spLineageCannotBeDeleted", lineage.getFilename()));
            }
            if (ObjectUtils.notEqual(lineage.getUploader(), AuthTools.currentUsernameFailFast())
                    && !AuthTools.hasAnyRole("BLODD_VIEW", AuthTools.ROLE_SUPERUSER)) {
                throw new IllegalOperationException(msgService.getMessage("haveNoPermissionToEdit"));
            }
        }
        lineageDao.deleteEntities(existsIds);
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "导出血缘描述"
//    )
    @RequestMapping("/overview")
    @Operation(summary = "导出血缘描述", description = "导出血缘描述")
    @Description("导出血缘描述")
    public LineageContainer getLineageOverview() {
        LinkedList<ModelLineageDto> lineages = new LinkedList<>(lineageDao.getModelLineage());

        Iterator<ModelLineageDto> iter = lineages.iterator();
        while (iter.hasNext()) {
            ModelLineageDto dto = iter.next();
            if (Strings.isNullOrEmpty(dto.getDstModelCategoryName()) || Strings.isNullOrEmpty(dto.getSrcModelCategoryName())) {
                iter.remove();
            }
        }

        LineageContainer container = new LineageContainer();
        Map<String, LineageStep> stepMap = new HashMap<>();

        for (ModelLineageDto lineage : lineages) {
            if (!stepMap.containsKey(lineage.isSrcDdm() + "/" + lineage.getSrcModelId().toString())) {
                LineageStep step = new LineageStep();
                step.setId(lineage.isSrcDdm() + "/" + lineage.getSrcModelId().toString());
                step.setName(lineage.getSrcModelName());
                step.addPropertyIfAbsent("modelCategoryId", lineage.getSrcModelCategoryId());
                step.addPropertyIfAbsent("modelCategoryName", lineage.getSrcModelCategoryName());
                step.addPropertyIfAbsent("modelCategoryAbbr", lineage.getSrcModelCategoryAbbr());
                container.addStep(step);
                stepMap.put(lineage.isSrcDdm() + "/" + lineage.getSrcModelId().toString(), step);
            }

            if (!stepMap.containsKey(lineage.isDstDdm() + "/" + lineage.getDstModelId().toString())) {
                LineageStep step = new LineageStep();
                step.setId(lineage.isDstDdm() + "/" + lineage.getDstModelId().toString());
                step.setName(lineage.getDstModelName());
                step.addPropertyIfAbsent("modelCategoryId", lineage.getDstModelCategoryId());
                step.addPropertyIfAbsent("modelCategoryName", lineage.getDstModelCategoryName());
                step.addPropertyIfAbsent("modelCategoryAbbr", lineage.getDstModelCategoryAbbr());
                container.addStep(step);
                stepMap.put(lineage.isDstDdm() + "/" + lineage.getDstModelId().toString(), step);
            }

            LineageLine line = new LineageLine();
            line.setTargetStepId(lineage.isDstDdm() + "/" + lineage.getDstModelId().toString());
            line.setSourceStepId(lineage.isSrcDdm() + "/" + lineage.getSrcModelId().toString());
            container.addLine(line);
        }

        return container;
    }

    @RequestMapping("/{lineageId}")
    @Operation(summary = "获取血缘关系内容", description = "获取血缘关系内容")
    @Description("获取血缘关系内容")
    @Parameter(name = "lineageId", description = "血缘ID", in = ParameterIn.PATH, required = true)
    public String getLineageContent(@PathVariable("lineageId") Long id) {
        Lineage entity = lineageDao.getEntityById(id);

        if (entity == null) {
            throw new ItemNotFoundException(msgService.getMessage("cannotFindLineageFileWithThisID", id));
        }

        return entity.getContent();
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "将血缘绑定到模型"
//    )
    @RequestMapping(value = "/{lineageId}/bind", method = RequestMethod.POST)
    @Operation(summary = "将血缘绑定到模型", description = "将血缘绑定到模型")
    @Description("将血缘绑定到模型")
    @Parameter(name = "lineageId", description = "血缘ID", in = ParameterIn.PATH, required = true)
    public void bindLineageStepToModel(@PathVariable("lineageId") Long lineageId,
                                                               @Parameter(name = "stepId", description = "血缘表Id", required = true)
                                                               @RequestParam("stepId") String stepId, @RequestParam("modelId") Long modelId,
                                                               @Parameter(name = "ddmModel", description = "是否是ddm的模型")
                                                               @RequestParam(name = "ddmModel", defaultValue = "false") Boolean isDdmModel,
                                                               @Parameter(name = "bindOnTable", description = "是否绑定到表")
                                                               @RequestParam(name = "bindOnTable", defaultValue = "false") Boolean bindOnTable) {
        mappingService.mappingLineageStepToModel(lineageId, stepId, modelId, isDdmModel, bindOnTable);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "解除一个血缘文件中一个表的血缘"
//    )
    @RequestMapping(value = "/{lineageId}/unbind", method = RequestMethod.PUT)
    @Description("解除一个血缘文件中一个表的血缘")
    @Operation(summary = "解除一个血缘文件中一个表的血缘", description = "解除一个血缘文件中一个表的血缘")
    @Parameter(name = "lineageId", description = "血缘ID", in = ParameterIn.PATH, required = true)
    public void unbindLineageStepFromModel(@Description("血缘文件ID") @PathVariable("lineageId") Long lineageId,
                                                                   @Parameter(name = "stepId", description = "表的Id", required = true)
                                                                   @Description("表的ID") @RequestParam("stepId") String stepId) {
        mappingService.unmappingLineageStepFromModel(lineageId, stepId);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "解除元数据中一个表的血缘"
//    )
    @RequestMapping(value = "/unbind/sp", method = RequestMethod.POST)
    @Description("解除元数据中一个表的血缘")
    @Operation(summary = "解除元数据中一个表的血缘", description = "解除元数据中一个表的血缘")
    public void unbindLineageStepFromObject(@RequestBody ViewAndSPObject spObject) {
        mappingService.unmappingLineageStepFromObject(spObject);
    }

//    @RequestMapping(value = "/queryDataStageJob", method = RequestMethod.POST, produces = {"application/json"})
//    @Description("搜索DataStage的任务项, jobType可选项为JOB和SEQ, fieldType可选项为当jobType为JOB的有:SQL_TEXT, SRC_HASH_FILE, TARGET_TABLE_NAME, TARGET_HASH_FILE, EXEC_DOS_LIST,"
//        + " 当jobType为SEQ的时候有:JOB_NAMES, EXEC_COMMANDS, SENDER_ADDRESS, RECIPIENT_ADDRESS, WAIT_FILES, 其它非分页字段都为字符串, 所有的条件都为AND")
//    @EndpointDoc(bodyExample = "{\n"
//        + "\t\"jobType\" : \"JOB\",\n"
//        + "\t\"fieldType\" : \"SQL_TEXT\",\n"
//        + "\t\"fieldName\" : \"select\",\n"
//        + "\t\"stageName\" : \"CDW\",\n"
//        + "\t\"annotation\" : null,\n"
//        + "\t\"jobName\" : null,\n"
//        + "\t\"value\" : null,\n"
//        + "\t\"currentPage\" : 1,\n"
//        + "\t\"pageSize\" : 50\n"
//        + "}")
//    public String queryDataStageJobItem(@RequestBody JobQueryCriteria criteria) {
//        return searchService.queryJobItem(criteria);
//    }

    @RequestMapping(value = "/searchTables/", method = RequestMethod.POST)
    @Description("搜索血缘中的位于端点的表, 如果lineageId为空那么搜索所有的表名，如果表名为空，那么会返回所有的表")
    @EndpointDoc(bodyExample = "{\n"
            + " \"lineageId\" : 1,\n"
            + "  \"keyword\" : \"CREDIT\",\n"
            + "  \"currentPage\" : 1,\n"
            + "  \"pageSize\" : 50\n"
            + "}")
    @Operation(summary = "搜索血缘中的位于端点的表, 如果lineageId为空那么搜索所有的表名，如果表名为空，那么会返回所有的表", description = "搜索血缘中的位于端点的表, 如果lineageId为空那么搜索所有的表名，如果表名为空，那么会返回所有的表")
    public Page<LineageParsedTableDto> searchLineageTables(@RequestBody LineageSearchCriteriaDto searchRequest) {
        return convertToDto(lineageDao.findTables(searchRequest.getKeyword(), searchRequest.getLineageId(), searchRequest.getFolderId(),
                searchRequest.getCurrentPage(), searchRequest.getPageSize()));
    }

    private Page<LineageParsedTableDto> convertToDto(Page<LineageParsedTable> tables) {
        ArrayList<LineageParsedTableDto> content = new ArrayList<>();
        for (LineageParsedTable lineageParsedTable : tables.getContent()) {
            content.add(new LineageParsedTableDto(lineageParsedTable));
        }
        Page<LineageParsedTableDto> lineageParsedTableDtos = new PageImpl<>(content, tables.getPageable(), tables.getTotalElements());
        return lineageParsedTableDtos;
    }

    @RequestMapping("/relationships")
    @Operation(summary = "根据categoryId获取血缘关系", description = "根据categoryId获取血缘关系")
    @Description("根据categoryId获取血缘关系")
    public LineageRelationshipDto findRelationships(
            @Parameter(name = "catId", description = "源categoryId", required = true)
            @RequestParam("catId") Long categoryId,
            @Parameter(name = "targetCatId", description = "目标categoryId")
            @RequestParam(name = "targetCatId", required = false) Long targetCategoryId) {

        List<LineageObjectBind> bindings = null;
        if (targetCategoryId == null) {
            bindings = lineageDao.findCategoryAllLineages(categoryId);
        } else {
            bindings = lineageDao.findCategoryLineageBetweenCategories(categoryId, targetCategoryId);
        }

        LineageRelationshipDto result = new LineageRelationshipDto();

        if (targetCategoryId == null) {
            List<CommonTableEnhanceDescriptor> allDamTables = objectService.getAllTablesOfModelCategory(categoryId);

            for (CommonTableEnhanceDescriptor table : allDamTables) {
                result.addEndpoint(new LineageRelationshipEndpointDto(table, false));
            }

            if (bindings == null || bindings.isEmpty()) {
                return result;
            }
        }

        Set<LineageRelationshipEndpointDto> toBeFillupDamEndpoints = new HashSet<>();
        Set<LineageRelationshipEndpointDto> toBeFillupDdmEndpoints = new HashSet<>();
        Collection<Model> allModels = modelService.getRealModels();
        Map<Long, Long> parentModel = new HashMap<>();
        Map<Long, String> modelName = new HashMap<>();
        if (allModels != null) {
            parentModel = allModels.stream().filter(model -> model.getParentId() != null).collect(Collectors.toMap(Model::getModelId, Model::getParentId));
            modelName = allModels.stream().collect(Collectors.toMap(Model::getModelId, Model::getDefinition));
        }

        for (LineageObjectBind binding : bindings) {
            LineageRelationshipEndpointDto src = new LineageRelationshipEndpointDto();
            LineageRelationshipEndpointDto dst = new LineageRelationshipEndpointDto();
            src.setCatId(binding.getSourceModelCategoryId());
            src.setModelId(binding.getSourceModelId());
            src.setTabId(binding.getSourceTableId());
            src.setDdm(binding.isDdmSource());

            dst.setCatId(binding.getTargetModelCategoryId());
            dst.setModelId(binding.getTargetModelId());
            dst.setTabId(binding.getTargetTableId());
            dst.setDdm(binding.isDdmTarget());
            dst.setLogicalModelId(parentModel.get(binding.getTargetModelId()));
            if (parentModel.get(binding.getTargetModelId()) != null) {
                dst.setLogicalModel(modelName.get(
                        parentModel.get(binding.getTargetModelId()))
                );
            }


            result.addRelationship(new CommonPair<>(src.getId(), dst.getId()));
            if (!result.isEndpointExists(src.getId())) {
                if (src.isDdm()) {
                    toBeFillupDdmEndpoints.add(src);
                } else {
                    toBeFillupDamEndpoints.add(src);
                }
            }

            if (!result.isEndpointExists(dst.getId())) {
                if (dst.isDdm()) {
                    toBeFillupDdmEndpoints.add(dst);
                } else {
                    toBeFillupDamEndpoints.add(dst);
                }
            }
        }

        Map<Long, ModelCategoryDto> modelCategoryMap = new HashMap<>();
        Map<Long, BasicInfoDataObject> objectMap = new HashMap<>();
        Map<String, CommonPair<Long, Long>> ddmEndpoints = new HashMap<>();

        for (LineageRelationshipEndpointDto endpointDto : toBeFillupDamEndpoints) {
            modelCategoryMap.put(endpointDto.getCatId(), null);
            objectMap.put(endpointDto.getModelId(), null);
            objectMap.put(endpointDto.getTabId(), null);
        }

        for (LineageRelationshipEndpointDto endpointDto : toBeFillupDdmEndpoints) {
            modelCategoryMap.put(endpointDto.getCatId(), null);
            ddmEndpoints.put(endpointDto.getId(), new CommonPair<>(endpointDto.getModelId(), endpointDto.getTabId()));
        }

        if (!modelCategoryMap.keySet().isEmpty()) {
            List<ModelCategoryDto> categories = modelCategoryService.getModelCategoriesByIds(new ArrayList<>(modelCategoryMap.keySet()));
            for (ModelCategoryDto category : categories) {
                modelCategoryMap.put(category.getCategoryId(), category);
            }
        }

        if (!objectMap.keySet().isEmpty()) {
            Set<BasicInfoDataObject> objects = objectService.getAllModelsAndTablesBasicInfoByIds(objectMap.keySet());
            for (BasicInfoDataObject object : objects) {
                objectMap.put(object.getObjectId(), object);
            }

            for (LineageRelationshipEndpointDto endpointDto : toBeFillupDamEndpoints) {
                Long modelId = endpointDto.getModelId();
                Long catId = endpointDto.getCatId();
                Long tableId = endpointDto.getTabId();

                BasicInfoDataObject model = objectMap.get(modelId);
                if (model == null) {
                    continue;
                }

                BasicInfoDataObject table = objectMap.get(tableId);
                if (table == null) {
                    continue;
                }

                ModelCategoryDto category = modelCategoryMap.get(catId);
                if (category == null) {
                    continue;
                }

                endpointDto.setModel(model.getPhysicalName());
                endpointDto.setTab(table.getPhysicalName());
                endpointDto.setTabAlias(table.getLogicalName());
                endpointDto.setCat(category.getCategoryName());
                result.addEndpoint(endpointDto);
            }
        }


        if (!ddmEndpoints.isEmpty() && ConfigurationUtility.INSTANCE.isDdmConnectable()) {
            List<CommonTableDescriptor> tables = RemoteServiceGetter.getDatablauRemoteModelService()
                    .getTablesInfo(new LinkedList<CommonPair<Long, Long>>(ddmEndpoints.values()));
            for (LineageRelationshipEndpointDto ddmEndpoint : toBeFillupDdmEndpoints) {
                CommonTableDescriptor table = findDdmTables(ddmEndpoint, tables);
                if (table == null) {
                    continue;
                }

                Long catId = ddmEndpoint.getCatId();
                ModelCategoryDto category = modelCategoryMap.get(catId);
                if (category == null) {
                    continue;
                }

                ddmEndpoint.setModelId(table.getModelId());
                ddmEndpoint.setModel(table.getModelName());
                ddmEndpoint.setCat(category.getCategoryName());
                ddmEndpoint.setTab(table.getTableName());
                ddmEndpoint.setTabAlias(table.getLogicalName());
                result.addEndpoint(ddmEndpoint);
            }
        }

        return result;
    }

    private CommonTableDescriptor findDdmTables(LineageRelationshipEndpointDto endpoint, List<CommonTableDescriptor> tables) {

        for (CommonTableDescriptor table : tables) {
            if (table.getCategoryId().equals(endpoint.getModelId())
                    && table.getTableId().equals(endpoint.getTabId())) {
                return table;
            }
        }

        return null;
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "dam_lineage_content",
//            systemModule = OperationModuleType.METADATA_LINEAGE_FILE,
//            description = "导出一个表的血缘"
//    )
    @RequestMapping(value = "/excel", method = RequestMethod.GET)
    @Description("导出一个表的血缘")
    @Operation(summary = "导出一个表的血缘", description = "导出一个表的血缘")
    public void getLineageExcel(
            @Parameter(name = "objectId", description = "表的ID", required = true)
            @Description("表的ID") @RequestParam("objectId") Long objectId,
            @Parameter(name = "type", description = "获取目标的血缘关系, right:上游,all:全部", required = true)
            @RequestParam(name = "type", defaultValue = "right") String type,
            HttpServletResponse response) {
        try {
            File file = mappingService.getLineageExcel(objectId, type);
            innerExportFile(file, response, msgService.getMessage("poi.lineageRelation"));
        } catch (Exception e) {
            throw new AndorjRuntimeException(e.getMessage());
        }
    }

    @RequestMapping(value = "/model/lineage", method = RequestMethod.POST, produces = {"application/json"})
    @Operation(summary = "获取模型间的血缘关系", description = "获取模型间的血缘关系")
    @Description("获取模型间的血缘关系")
    public String getModelLineage() {
        return mappingService.findModelMapping();
    }

    @RequestMapping(value = "/model/tables/{modelId}", method = RequestMethod.POST, produces = {"application/json"})
    @Operation(summary = "获取模型的血缘表", description = "获取模型的血缘表")
    @Description("获取模型的血缘表")
    @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)
    public List<DataObject> getTablesByModelId(@PathVariable(name = "modelId") Long modelId) {
        return mappingService.findTableListByModelId(modelId);
    }

    @RequestMapping(value = "/model/tables/lineage", method = RequestMethod.POST, produces = {"application/json"})
    @Operation(summary = "获取模型间表的血缘数据", description = "获取模型间表的血缘数据")
    @Description("获取模型间表的血缘数据")
    public String getTablesByLineage(@RequestBody Map<String, Long> pair) {
        return mappingService.findTableListByLineage(pair.get("src"), pair.get("dst"));
    }

    private LineageQualityInfo getLineageInfoByObject(Long objectId) {
        //根据字段查询上级表 |下级表
        List<LineageObjectBind> sourceTables = lineageDao
            .getTargetTables(Lists.newArrayList(objectId));
        List<LineageObjectBind> targetTables = lineageDao
            .getSourceTables(Lists.newArrayList(objectId));
        List<Long> targetIds = null;
        //获取血缘来源表信息
        if(targetTables != null && !targetTables.isEmpty()){
            targetIds = targetTables.stream()
                .map(LineageObjectBind::getSourceTableId).collect(Collectors.toList());
        }

        LineageQualityInfo qualityInfo = new LineageQualityInfo();
        DataObject dataObject = objectService.getDataObjectByObjectId(objectId);
        qualityInfo.setDateType(LDMTypes.oEntity);
        qualityInfo.setObjectName(dataObject.getPhysicalName());
        //设置资产目录
        //todo 7.0 资产目录
//        List<InfoEntry> infoEntries = infoEntryRepo.findByItemIdEqualsAndTypeIdEquals(objectId + "", LDMTypes.oEntity);
//        if(infoEntries != null && infoEntries.size() > 0){
//            Set<Long> categoryIds = infoEntries.stream().map(InfoEntry::getInfoCatalogId)
//                .collect(Collectors.toSet());
//            List<String> nameByIds = infoCatalogRepo.findNameByIds(categoryIds);
//            if(nameByIds != null && !nameByIds.isEmpty()) qualityInfo.setCategoryNames(nameByIds);
//        }
        //设置资产状态
        if(qualityInfo.getCategoryNames() != null && !qualityInfo.getCategoryNames().isEmpty()){
            qualityInfo.setStatus(1L);
        }else {
            qualityInfo.setStatus(0L);
        }

        //设置指标
        setDomain(objectId, qualityInfo);

        //解析数据质量问题
        getProblemInfo(objectId, qualityInfo, 1L);
        if(targetIds != null && !targetIds.isEmpty()){
            targetIds.stream().forEach(objId -> getProblemInfo(objId, qualityInfo, 2L));
        }

        //解析数据规则问题


        //解析历史变更信息
        getModifyInfoByObjectId(objectId, qualityInfo, 1L, null);
        if(targetIds != null && !targetIds.isEmpty()){
            Date date = getPreMonthDate();
            targetIds.stream().forEach(objId -> getModifyInfoByObjectId(objId, qualityInfo, 2L, date));
        }

        //设置详情分析-血缘分析
        if(targetIds != null && !targetIds.isEmpty()){
            LineageQualityInfo.LineageFrom lineageFrom = qualityInfo.new LineageFrom();
            int systemCounts = targetTables.stream().map(LineageObjectBind::getSourceModelCategoryId)
                .collect(Collectors.toSet()).size();
            lineageFrom.setSystemCounts(systemCounts);
            lineageFrom.setEntityCounts(new HashSet<>(targetIds).size());
            List<LineageQualityInfo.QualityQuestionInfo> questList = qualityInfo.getQuestList();
            if(!questList.isEmpty()){
                Long reduce = questList.stream().filter(item -> item.getType() == 2L).map(LineageQualityInfo.QualityQuestionInfo::getQuestCounts)
                    .reduce(0L, (a, b) -> a + b);
                lineageFrom.setQualityCounts(reduce);
            }
            List<LineageQualityInfo.DataObjectModify> modifyList = qualityInfo.getModifyList();
            if(!modifyList.isEmpty()){
                long count = modifyList.stream().filter(obj -> obj.getType().equals(2L)).count();
                lineageFrom.setModifyCounts(count);
            }
            qualityInfo.setLineageFrom(lineageFrom);
        }
        //设置详情分析-影响分析
        if(sourceTables != null && !sourceTables.isEmpty()){
            LineageQualityInfo.LineageEffect lineageEffect = qualityInfo.new LineageEffect();
            int systemSize = sourceTables.stream().map(LineageObjectBind::getTargetModelCategoryId)
                .collect(Collectors.toSet()).size();
            lineageEffect.setSystemCounts(systemSize);
            int tableSize = sourceTables.stream().map(LineageObjectBind::getTargetTableId)
                .collect(Collectors.toSet()).size();
            lineageEffect.setEntityCounts(tableSize);
            qualityInfo.setLineageEffect(lineageEffect);
        }
        return qualityInfo;
    }

    /**
     * 设置关联指标信息
     * @param objectId
     * @param qualityInfo
     */
    private void setDomain(Long objectId, LineageQualityInfo qualityInfo){
        List<DataObject> columns = objectService.getAllColumnsByTableObjectId(objectId);
        if(columns != null && !columns.isEmpty()){
            columns.stream().forEach(col -> {
                List<DomainDto> domains = objectService.getObjectDomains(col.getObjectId());
                if(domains != null && domains.size() > 0){
                    domains.stream().filter(domain -> domain.getCategoryId() == 2L).forEach(domain -> {
                        qualityInfo.getDomains().add(domain.getChineseName());
                    });
                }
            });
        }
    }

    /**
     * 处理数据质量查询
     * @param objectId
     * @param qualityInfo
     */
    private void getProblemInfo(Long objectId, LineageQualityInfo qualityInfo, Long typeId){
        DataObject object = objectService.getDataObjectByObjectId(objectId);
        ModelCategoryDto category = modelCategoryService.getModelCategory(object.getModelCategoryId());
        List<Map<String, Object>> problemInfo = dataQualityRemoteService.findProblemInfo(object.toDto());
        //查询数据规则问题
        if (problemInfo == null) {
            problemInfo = new ArrayList<>();
        }
        problemInfo.addAll(dataQualityRemoteService.findDataRuleProblemInfo(object.toDto()));
        if(problemInfo != null && !problemInfo.isEmpty()){
            LineageQualityInfo.QualityQuestionInfo questionInfo = null;
            for (Map<String, Object> map:problemInfo) {
                questionInfo = qualityInfo.new QualityQuestionInfo();
                questionInfo.setType(typeId);
                questionInfo.setObjectName(object.getPhysicalName());
                questionInfo.setSystemName(category.getCategoryName());
                questionInfo.setSourceName(object.getModelName());
                questionInfo.setSchemaName(object.getSchema());
                questionInfo.setQuestId((Long) map.get("id"));
                questionInfo.setQuestCounts((map.get("sum") == null?0L:(Long)map.get("sum")));
                questionInfo.setQuestName((String) map.get("name"));
                questionInfo.setChineseName(object.getLogicalName());
                questionInfo.setCheckFields((String) map.get("checkFields"));
                questionInfo.setRuleName((String) map.get("ruleName"));
                questionInfo.setCreateTime(
                    DateFormatUtils.format((Date) map.get("createOn"), "yyyy-MM-dd HH:mm:ss"));
                qualityInfo.getQuestList().add(questionInfo);
            }
        }
    }



    /**
     * 获取变更历史数据
     */
    private void getModifyInfoByObjectId(Long objectId, LineageQualityInfo qualityInfo, Long typeId, Date date) {
        List<DataObjectHistoryDto> historyDtoList = objectService.getDataObjectHistory(objectId);
        for (DataObjectHistoryDto historyDto : historyDtoList) {
            //过滤掉初始化数据
            if (historyDto.getVersion() == 1) {
                continue;
            }
            //查询date日期之后的
            if (date != null && historyDto.getCreateTime().before(date)) {
                continue;
            }
            LineageQualityInfo.DataObjectModify modify = qualityInfo.new DataObjectModify();
            modify.setModifyCounts(historyDto.getChangeHistory().size());
            modify.setModifyId(objectId);
            modify.setSystemName(historyDto.getModelCategoryName());
            modify.setSourceName(historyDto.getModelName());
            modify.setSchemaName(historyDto.getSchemaName());
            modify.setObjectName(historyDto.getPhysicalName());
            modify.setChineseName(historyDto.getLogicalName());
            modify.setVersionName(historyDto.getVersionName());
            modify.setModifyInfo(String.join(",", historyDto.getChangeHistory()));
            modify.setType(typeId);
            modify.setModifyTime(DateFormatUtils.format(historyDto.getCreateTime(), "yyyy-MM-dd"));
            modify.setVersion(historyDto.getVersion());
            modify.setModelId(historyDto.getModelId());
            qualityInfo.getModifyList().add(modify);
        }
    }


//    /**
//     * 获取变更历史数据
//     * @param objectId
//     * @param qualityInfo
//     * @param typeId
//     * @param date
//     */
//    private void getModifyInfo(Long objectId, LineageQualityInfo qualityInfo, Long typeId, Date date){
//        DataObject dataObject = objectService.getDataObjectByObjectId(objectId);
//        ModelCategory category = modelService
//            .getModelCategory(dataObject.getModelCategoryId());
//        List<ModelVersion> history = null;
//        if(typeId == 1L){
//            history = versionRepository.findByModelIdOrderByVersionDesc(dataObject.getModelId());
//        }else {
//            history = versionRepository.findByModelIdAndCreateTimeAfter(dataObject.getModelId(), date);
//        }
//
//        if(history != null && history.size() > 1){
//            history.stream().forEach(his -> {
//                String delta = his.getVersionDelta();
//                try {
//                    if(delta != null){
//                        CCompareDto compareDto = mapper.readValue(delta, CCompareDto.class);
//                        Map<String, Object> compareResult = compareDto.getCompareResult();
//
//                        if(compareResult != null && !compareResult.isEmpty()){
//                            Object schemaDiff = compareResult.get("differences");
//                            if(schemaDiff != null){
//                                List<LinkedHashMap<String, Object>> hashMaps = (List<LinkedHashMap<String, Object>>) schemaDiff;
//                                if(!hashMaps.isEmpty()){
//                                    Optional<LinkedHashMap<String, Object>> first = hashMaps
//                                        .stream().filter(map -> (dataObject.getPhysicalName()
//                                            .equalsIgnoreCase((String) map.get("rightObject")) ||
//                                            dataObject.getPhysicalName()
//                                                .equalsIgnoreCase((String) map.get("leftObject"))) && "Entity".equals((String) map.get("name")))
//                                        .findFirst();
//                                    if(first.isPresent()){
//                                        LinkedHashMap<String, Object> schemaMap = first.get();
//                                        Object tableObj = schemaMap.get("differences");
//                                        if(tableObj != null){
//                                            List<LinkedHashMap<String, Object>> tables = (List<LinkedHashMap<String, Object>>) tableObj;
//                                            if(!tables.isEmpty()){
//                                                List<Object> matchColumns = tables.stream().filter(obj -> "Attribute".equals((String) obj.get("name")))
//                                                    .map(item -> item.get("differences"))
//                                                    .collect(Collectors.toList());
//                                                if(matchColumns != null && !matchColumns.isEmpty()){
//                                                    List<String> finalList = new ArrayList<>();
//                                                    matchColumns.stream()
//                                                        .forEach(obj -> {
//                                                            List<LinkedHashMap<String, Object>> maps = (List<LinkedHashMap<String, Object>>) obj;
//                                                            maps.stream().forEach(map -> {
//                                                                if (map.get("leftObject") != null) {
//                                                                    finalList.add((String) map.get("leftObject"));
//                                                                } else if (map.get("rightObject") != null) {
//                                                                    finalList.add((String) map.get("rightObject"));
//                                                                }
//                                                            });
//                                                        });
//                                                    if(finalList != null && !finalList.isEmpty()){
//                                                        DataObjectModify modify = qualityInfo.new DataObjectModify();
//                                                        modify.setModifyCounts(finalList.size());
//                                                        modify.setModifyId(objectId);
//                                                        modify.setSystemName(category.getCategoryName());
//                                                        modify.setSourceName(dataObject.getModelName());
//                                                        modify.setSchemaName(dataObject.getSchema());
//                                                        modify.setObjectName(dataObject.getPhysicalName());
//                                                        modify.setChineseName(dataObject.getLogicalName());
//                                                        modify.setVersionName(his.getVersionName());
//                                                        modify.setModifyInfo(
//                                                            StringUtils.join(finalList, ","));
//                                                        modify.setType(typeId);
//                                                        modify.setModifyTime(DateFormatUtils.format(his.getCreateTime(), "yyyy-MM-dd"));
//                                                        modify.setVersion(his.getVersion());
//                                                        modify.setModelId(his.getModelId());
//                                                        qualityInfo.getModifyList().add(modify);
//                                                    }
//                                                }
//                                            }
//                                        }
//                                    }
//                                }
//                            }
//                        }
//                    }
//                } catch (JsonProcessingException e) {
//                    logger.warn("parse version data failed cause by:" + e.getMessage());
//                }
//            });
//        }
//    }

    /**
     * 设置技术规则的质量问题数
     * @param container
     */
    private void setQualityProperties(LineageContainer container){
        if (container == null) {
            return;
        }
        Set<LineageStep> stepsSet = container.getStepsSet();


        Set<Long> objectIds = stepsSet.stream()
                .filter(step -> {
                    if (step.getId().contains("dam-report")) {
                        return false;
                    }
                    return step.getId().contains("dam");
                })
                .map(step -> Long.parseLong(step.getId().substring(step.getId().indexOf("-") + 1)))
                .collect(Collectors.toSet());

//        object = objectService.getDataObjectByObjectId(tableId);

        if(objectIds == null || objectIds.isEmpty()) return;

        List<DataObject> objects = objectService.getDataObjectsByIds(objectIds);


        if(objects == null || objects.isEmpty()) return;
        List<DataObjectDto> dtos = new ArrayList<>();
        objects.stream().forEach(obj -> {
            DataObjectDto dto = new DataObjectDto();
            dto.setTypeId(obj.getTypeId());
            dto.setPhysicalName(obj.getPhysicalName());
            dto.setModelId(obj.getModelId());
            dto.setLogicalName(obj.getLogicalName());
            dto.setObjectId(obj.getObjectId());
            dto.setParentId(obj.getParentId());
            dtos.add(obj.toDto());
        });
        Map<Long, List<Map<String, Object>>> problemInfo = dataQualityRemoteService.findProblemInfo(dtos);

        if(problemInfo == null || problemInfo.isEmpty()) return;

        stepsSet.stream().forEach(step -> {
            try{
                if (step.getId().contains("dam-report") || !step.getId().contains("dam")) {
                    return;
                }
                Long objId = Long.parseLong(step.getId().substring(step.getId().indexOf("-") + 1));
                if(problemInfo.containsKey(objId)){
                    List<Map<String, Object>> qualityMapInfo = problemInfo.get(objId);
                    if(qualityMapInfo != null && !qualityMapInfo.isEmpty() ){
                        String info = mapper.writeValueAsString(qualityMapInfo);
                        step.getProperties().put("qualityInfo", info);
                        Long num = 0L;
                        num = qualityMapInfo.stream()
                                .mapToLong(map ->  map.get("sum") == null? 0L:(Long) map.get("sum")).sum();
                        step.getProperties().put("qualityNum", num + "");
                    }
                }
            }catch (Exception e){
                logger.error("data parse error cause by:" + e.getMessage());
            }
        });

    }

    private ResponseEntity<byte[]> downLoadLineageInfo(Long objectId) throws IOException {
        //获取血缘数据
        List<LineageObjectBind> sourceTables = lineageDao
            .getSourceTables(Lists.newArrayList(objectId));

        if(sourceTables == null || sourceTables.isEmpty()) return null;

        Set<Long> tableIds = sourceTables.stream().map(LineageObjectBind::getSourceTableId)
            .collect(Collectors.toSet());
        long systemCounts = sourceTables.stream().map(LineageObjectBind::getSourceModelCategoryId).distinct().count();

        LineageQualityInfo qualityInfo = new LineageQualityInfo();
        Date date = getPreMonthDate();
        tableIds.stream().forEach(tableId -> {
            //获取变更数据
            getModifyInfoByObjectId(tableId, qualityInfo, 2L, date);
            //获取问题数
            getProblemInfo(tableId, qualityInfo, 2L);
        });

        XSSFWorkbook workbook = new XSSFWorkbook();
        CellStyle cs = workbook.createCellStyle();
        cs.setFillForegroundColor(IndexedColors.LIGHT_ORANGE.index);
        cs.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        XSSFSheet sheet = workbook.createSheet(msgService.getMessage("downLoadLineageInfo.totalSheet"));
        XSSFRow row = sheet.createRow(0);
        row.createCell(0).setCellValue(msgService.getMessage("downLoadLineageInfo.sourceSystem"));
        row.createCell(1).setCellValue(systemCounts);
        row.getCell(0).setCellStyle(cs);
        XSSFRow row1 = sheet.createRow(1);
        row1.createCell(0).setCellValue(msgService.getMessage("downLoadLineageInfo.sourceEntity"));
        row1.createCell(1).setCellValue(tableIds.size());
        row1.getCell(0).setCellStyle(cs);
        XSSFRow row2 = sheet.createRow(2);
        row2.createCell(0).setCellValue(msgService.getMessage("downLoadLineageInfo.modify"));
        row2.createCell(1).setCellValue(0);
        row2.getCell(0).setCellStyle(cs);
        XSSFRow row3 = sheet.createRow(3);
        row3.createCell(0).setCellValue(msgService.getMessage("downLoadLineageInfo.qualityCounts"));
        row3.createCell(1).setCellValue(0);
        row3.getCell(0).setCellStyle(cs);
        int modifyCounts = 0;
        int questCounts = 0;
        //设置血缘分析-变更详情页
        XSSFSheet sheet1 = workbook.createSheet(msgService.getMessage(msgService.getMessage("downLoadLineageInfo.infoSheet")));
        XSSFRow sheet1Header = sheet1.createRow(0);
        String[] sheet1Headers = msgService.getMessageObj("downLoadLineageInfo.infoSheetHeader", true);
        for (int i = 0; i < sheet1Headers.length; i++) {
            sheet1Header.createCell(i).setCellValue(sheet1Headers[i]);
            sheet1Header.getCell(i).setCellStyle(cs);
        }
        List<LineageQualityInfo.DataObjectModify> modifyList = qualityInfo.getModifyList();
        if(!modifyList.isEmpty()){
            modifyCounts = modifyList.size();
            for (int i = 0; i < modifyList.size(); i++) {
                XSSFRow sheet1Row = sheet1.createRow(i + 1);
                sheet1Row.createCell(0).setCellValue(modifyList.get(i).getSystemName());
                sheet1Row.createCell(1).setCellValue(modifyList.get(i).getSourceName());
                sheet1Row.createCell(2).setCellValue(modifyList.get(i).getSchemaName());
                sheet1Row.createCell(3).setCellValue(modifyList.get(i).getObjectName());
                sheet1Row.createCell(4).setCellValue(modifyList.get(i).getModifyTime());
                sheet1Row.createCell(5).setCellValue(modifyList.get(i).getVersionName());
                sheet1Row.createCell(6).setCellValue(modifyList.get(i).getModifyInfo());
            }
        }
        //设置血缘分析-质量问题页
        XSSFSheet sheet2 = workbook.createSheet(msgService.getMessage("downLoadLineageInfo.qualitySheet"));
        XSSFRow sheet2Header = sheet2.createRow(0);
        String[] sheet2Headers = msgService.getMessageObj("downLoadLineageInfo.qualitySheetHeader", true);
        for (int i = 0; i < sheet2Headers.length; i++) {
            sheet2Header.createCell(i).setCellValue(sheet2Headers[i]);
            sheet2Header.getCell(i).setCellStyle(cs);
        }
        List<LineageQualityInfo.QualityQuestionInfo> questList = qualityInfo.getQuestList();
        if(!questList.isEmpty()){
            for (int i = 0; i < questList.size(); i++) {
                XSSFRow sheet2Row = sheet2.createRow(i + 1);
                sheet2Row.createCell(0).setCellValue(questList.get(i).getSystemName());
                sheet2Row.createCell(1).setCellValue(questList.get(i).getSourceName());
                sheet2Row.createCell(2).setCellValue(questList.get(i).getSchemaName());
                sheet2Row.createCell(3).setCellValue(questList.get(i).getObjectName());
                sheet2Row.createCell(4).setCellValue(questList.get(i).getRuleName());
                sheet2Row.createCell(5).setCellValue(questList.get(i).getCheckFields());
                sheet2Row.createCell(6).setCellValue(questList.get(i).getQuestName());
                sheet2Row.createCell(7).setCellValue(questList.get(i).getQuestCounts());
                sheet2Row.createCell(8).setCellValue(questList.get(i).getCreateTime());
                questCounts += questList.get(i).getQuestCounts();
            }
        }

        row2.createCell(1).setCellValue(modifyCounts);
        row3.createCell(1).setCellValue(questCounts);
        File file = excelService.generalFileByWorkbook(workbook, msgService.getMessage("downLoadLineageInfo.downFile"));

        return excelService.generalResponseEntityByFile(file);
    }

    /**
     * 获取前一个月的时间
     * @return
     */
    private Date getPreMonthDate(){
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(new Date());
        int month = calendar.get(Calendar.MONTH);
        calendar.set(Calendar.MONTH, month - 1);
        return calendar.getTime();
    }

    private ResponseEntity<byte[]> downLoadEffectInfo(Long objectId) throws IOException {
        //获取血缘数据
        List<LineageObjectBind> targetTables = lineageDao
            .getTargetTables(Lists.newArrayList(objectId));
        if(targetTables == null || targetTables.isEmpty()) return null;

        Set<Long> tableIds = targetTables.stream().map(LineageObjectBind::getTargetTableId)
            .collect(Collectors.toSet());

        long systemCounts = targetTables.stream().map(LineageObjectBind::getTargetModelCategoryId).collect(Collectors.toSet()).size();


        XSSFWorkbook workbook = new XSSFWorkbook();
        CellStyle cs = workbook.createCellStyle();
        cs.setFillForegroundColor(IndexedColors.LIGHT_ORANGE.index);
        cs.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        XSSFSheet sheet = workbook.createSheet(msgService.getMessage("downLoadEffectInfo.totalHeader"));
        XSSFRow row = sheet.createRow(0);
        row.createCell(0).setCellValue(msgService.getMessage("downLoadEffectInfo.downstream"));
        row.createCell(1).setCellValue(systemCounts);
        row.getCell(0).setCellStyle(cs);
        XSSFRow row1 = sheet.createRow(1);
        row1.createCell(0).setCellValue(msgService.getMessage("downLoadEffectInfo.entity"));
        row1.createCell(1).setCellValue(tableIds.size());
        row1.getCell(0).setCellStyle(cs);

        XSSFSheet sheet1 = workbook.createSheet(msgService.getMessage("downLoadEffectInfo.infoSheet"));
        XSSFRow sheet1Header = sheet1.createRow(0);
        String[] sheet1Headers = msgService.getMessageObj("downLoadEffectInfo.header", true);
        for (int i = 0; i < sheet1Headers.length; i++) {
            sheet1Header.createCell(i).setCellValue(sheet1Headers[i]);
            sheet1Header.getCell(i).setCellStyle(cs);
        }

        Set<Long> collect = targetTables.stream().map(entity -> entity.getTargetModelCategoryId())
            .collect(Collectors.toSet());

        List<ModelCategoryDto> categories = modelCategoryService.getModelCategoriesByIds(collect);

        Map<Long, String> collect1 = categories.stream().collect(
            Collectors.toMap(ModelCategoryDto::getCategoryId, ModelCategoryDto::getCategoryName));

        Iterator<Long> iterator = tableIds.iterator();
        int j = 1;
        while (iterator.hasNext()){
            DataObject object = objectService
                .getDataObjectByObjectId(iterator.next());
            XSSFRow sheet1Row = sheet1.createRow(j++);
            sheet1Row.createCell(0).setCellValue(collect1.get(object.getModelCategoryId()));
            sheet1Row.createCell(1).setCellValue(object.getModelName());
            sheet1Row.createCell(2).setCellValue(object.getSchema());
            sheet1Row.createCell(3).setCellValue(object.getPhysicalName());
        }
        File file = excelService.generalFileByWorkbook(workbook, msgService.getMessage("downLoadEffectInfo.downFile"));

        return excelService.generalResponseEntityByFile(file);
    }

    @RequestMapping(value = "/script/testByContent", method = RequestMethod.POST)
    @Operation(summary = "测试脚本内容", description = "测试脚本内容")
    public String testScript(@RequestBody LineageScriptTestDto testDto) {
        return lineageScriptService.testScript(testDto);
    }

    @RequestMapping(value = "/script/testByScript", method = RequestMethod.POST)
    @Operation(summary = "测试整个脚本", description = "测试整个脚本")
    public String testWholeScript(@RequestBody LineageScriptTestDto testDto) {
        return lineageScriptService.testWholeScript(testDto);
    }

    @RequestMapping(value = "/script/getLineageType", method = RequestMethod.POST)
    @Operation(summary = "获取血缘类型", description = "获取血缘类型")
    public List<String> getLineageType() throws Exception {
        List<String> result = new ArrayList<>();

        //指定扫描的包名
        Reflections reflections = new Reflections("com.andorj");
        //获取在指定包扫描的目录所有的实现类
        Set<Class<? extends LineageService>> classes = reflections.getSubTypesOf(LineageService.class);
        for (Class<? extends LineageService> aClass : classes) {
            if (!aClass.isInterface()) {
                Method getType = aClass.getMethod("getType");
                String type = (String) getType.invoke(aClass.newInstance());
                result.add(type);
            }
        }

        return result;
    }

    @RequestMapping(value = "/script/createScript", method = RequestMethod.POST)
    @Operation(summary = "创建脚本", description = "创建脚本")
    public void createScript(@RequestBody LineageScript script) {
        lineageScriptService.createLineageScript(script);
    }

    @RequestMapping(value = "/script/updateScript", method = RequestMethod.POST)
    @Operation(summary = "修改脚本", description = "修改脚本")
    public void updateScript(@RequestBody LineageScript script) {
        lineageScriptService.updateLineageScript(script);
    }

    @RequestMapping(value = "/script/deleteScript", method = RequestMethod.POST)
    @Operation(summary = "删除脚本", description = "删除脚本")
    @Parameter(name = "id", description = "脚本id", in = ParameterIn.PATH, required = true)
    public void deleteScript(@RequestParam("id") Long id) {
        lineageScriptService.deleteLineageScript(id);
    }

    @RequestMapping(value = "/script/getScript", method = RequestMethod.POST)
    @Operation(summary = "查询脚本详情", description = "查询脚本详情")
    @Parameter(name = "id", description = "脚本id", in = ParameterIn.PATH, required = true)
    public LineageScript findLineageScript(@RequestParam("id") Long id) {
        return lineageScriptService.findLineageScript(id);
    }

    @RequestMapping(value = "/script/deleteScriptBatch", method = RequestMethod.POST)
    @Operation(summary = "删除多个脚本", description = "删除多个脚本")
    public void deleteScriptBatch(@RequestBody List<Long> ids) {
        lineageScriptService.deleteLineageScriptBatch(ids);
    }

    @RequestMapping(value = "/script/enabled", method = RequestMethod.POST)
    @Operation(summary = "启用/禁用", description = "启用/禁用")
    @Parameter(name = "id", description = "脚本id", in = ParameterIn.PATH, required = true)
    public void enabledScript(@RequestParam("id") Long id) {
        lineageScriptService.enabledLineageScript(id);
    }

    @RequestMapping(value = "/script/findScript", method = RequestMethod.POST)
    @Operation(summary = "查询某个目录的脚本", description = "查询某个目录的脚本")
    @Parameter(name = "folderId", description = "目录id", in = ParameterIn.PATH, required = true)
    public List<LineageScript> findScript(@RequestParam(value = "folderId", required = false) Long folderId) {
        return lineageScriptService.findLineageScriptByFolderId(folderId);
    }

    @RequestMapping(value = "/script/page", method = RequestMethod.POST)
    @Operation(summary = "查询某个目录的脚本", description = "查询某个目录的脚本")
    public PageResult<LineageScript> findScriptPage(@RequestBody LineageScriptQueryDto queryDto) {
        return lineageScriptService.findLineageScriptPage(queryDto);
    }

    /**
     * 导入脚本
     */
    @PostMapping(value = "/script/uploadScript")
    @Operation(summary = "导入脚本")
    public void uploadDomains(@Parameter(name = "file", description = "导入脚本的excel文件", required = true)
                              @RequestParam("file") MultipartFile multipartFile,
                              HttpServletRequest request) throws Exception {
        File uploadFile = DataUtility.uploadFile(multipartFile);
        try {
            lineageScriptService.uploadScript(uploadFile);
        } finally {
            uploadFile.delete();
        }
    }

    @PostMapping(value = "/script/exportScriptTemplates")
    @Operation(summary = "导出脚本模板")
    public ResponseEntity<byte[]> exportDomainsTemplate() {
        File file = new File(ShareKit.getResourcePath("/lineage/lineage_script_template.xlsx"));
        return DataUtility.generalResponseEntityByFile(file, false);
    }

    @RequestMapping(value = "/folder/tree", method = RequestMethod.POST)
    @Operation(summary = "查询目录树", description = "查询目录树")
    public LineageFolderNode findLineageFolderTree() {
        return lineageFolderService.findFolderTree();
    }

    @RequestMapping(value = "/folder/addOrUpdateFolder", method = RequestMethod.POST)
    @Operation(summary = "新增或者修改目录", description = "新增或者修改目录")
    public Long addOrUpdateFolder(@RequestBody LineageFolderDto folderDto) {
        try {
            return lineageFolderService.addOrUpdateFolder(folderDto);
        }catch (Exception e){
            throw new RuntimeException(msgService.getMessage("lineageFolderAlreadyExists", e.getMessage()));
        }
    }

    @RequestMapping(value = "/folder/deleteFolder", method = RequestMethod.POST)
    @Operation(summary = "删除目录", description = "删除目录")
    @Parameter(name = "folderId", description = "目录id", in = ParameterIn.PATH, required = true)
    public void deleteFolder(@RequestParam("folderId") Long folderId) {
        lineageFolderService.removeFolderById(folderId);
    }

    @RequestMapping(value = "/folder/addOrUpdateFolderRef", method = RequestMethod.POST)
    @Operation(summary = "新增或者修改目录关系", description = "新增或者修改目录关系")
    public Long addOrUpdateFolderRef(@RequestBody LineageFolderRefDto folderRefDto) {
        try {
            return lineageFolderService.addOrUpdateFolderRef(folderRefDto);
        }catch (Exception e){
            throw new RuntimeException(msgService.getMessage("lineageFolderItemAlreadyExists", e.getMessage()));
        }
    }

    @RequestMapping(value = "/folder/addOrUpdateFolderRefs", method = RequestMethod.POST)
    @Operation(summary = "批量新增或者修改目录关系", description = "批量新增或者修改目录关系")
    public List<Long> addOrUpdateFolderRefs(@RequestBody List<LineageFolderRefDto> folderRefDtos) {
        try {
            return lineageFolderService.addOrUpdateFolderRefs(folderRefDtos);
        }catch (Exception e){
            throw new RuntimeException(msgService.getMessage("lineageFolderItemAlreadyExists", e.getMessage()));
        }
    }


    @RequestMapping(value = "/folder/find/model/{folderId}", method = RequestMethod.POST)
    @Operation(summary = "根据目录获取数据源关系", description = "根据目录获取数据源关系")
    public List<FolderModelInfoDto> findModelRefsByFolderId(@PathVariable("folderId") Long folderId) {
        return lineageFolderService.findModelRefDtoByFolderId(folderId);
    }

    @RequestMapping(value = "/folder/page/model/{folderId}", method = RequestMethod.POST)
    @Operation(summary = "根据目录获取数据源关系", description = "根据目录获取数据源关系")
    public PageResult<FolderModelInfoDto> pageModelRefsByFolderId(@PathVariable("folderId") Long folderId,
        @RequestParam("currentPage") Integer currentPage,
        @RequestParam("pageSize") Integer pageSize,
        @RequestParam("keyword") String keyword,
        @RequestParam("orderDesc") Boolean orderDesc) {

        List<FolderModelInfoDto> refDtoByFolderId = lineageFolderService
            .findModelRefDtoByFolderId(folderId);

        PageResult<FolderModelInfoDto> pageResult = new PageResult<>();
        pageResult.setCurrentPage(currentPage);
        pageResult.setPageSize(pageSize);

        if(refDtoByFolderId == null || refDtoByFolderId.isEmpty()){
            pageResult.setTotalItems(0L);
            return pageResult;
        }

        List<FolderModelInfoDto> finalResults = refDtoByFolderId.stream()
                .filter(dto -> {
                    if (StringUtils.isEmpty(keyword)) {
                        return true;
                    } else {
                        if (dto.getModelName() == null) {
                            return false;
                        } else {
                            return ((dto.getModelName().indexOf(keyword) > -1) || dto.getOwnerSystem().indexOf(keyword) > -1);
                        }
                    }
                }).collect(Collectors.toList());


        List<FolderModelInfoDto> infoDtos = finalResults.stream()
                .sorted(orderDesc ? Comparator.comparing(FolderModelInfoDto::getCreateTime).reversed():Comparator.comparing(FolderModelInfoDto::getCreateTime)).limit(Math.min(pageSize*currentPage, finalResults.size()))
                .collect(Collectors.toList());




        pageResult.setContent(infoDtos);
        if(CollectionUtils.isEmpty(finalResults)){
            pageResult.setTotalItems(0L);
        }else {
            pageResult.setTotalItems(Long.valueOf(finalResults.size()));
        }
        return pageResult;
    }

    @RequestMapping(value = "/folder/find/script/{folderId}", method = RequestMethod.POST)
    @Operation(summary = "根据目录获取数据源关系", description = "根据目录获取数据源关系")
    public List<LineageScriptInfoDto> findScriptRefsByFolderId(@PathVariable("folderId") Long folderId) {
        return lineageFolderService.findScriptDtoByFolderId(folderId);
    }

    @RequestMapping(value = "/folder/page/script/{folderId}", method = RequestMethod.POST)
    @Operation(summary = "分页根据目录获取数据源关系", description = "分页根据目录获取数据源关系")
    public PageResult<LineageScriptInfoDto> pageScriptRefsByFolderId(@PathVariable("folderId") Long folderId,
        @RequestParam("currentPage") Integer currentPage,
        @RequestParam("pageSize") Integer pageSize,
        @RequestParam("keyword") String keyword) {
        List<LineageScriptInfoDto> scriptDtoByFolderId = lineageFolderService
            .findScriptDtoByFolderId(folderId);

        PageResult<LineageScriptInfoDto> pageResult = new PageResult<>();
        pageResult.setCurrentPage(currentPage);
        pageResult.setPageSize(pageSize);

        if(scriptDtoByFolderId == null || scriptDtoByFolderId.isEmpty()){
            pageResult.setTotalItems(0L);
            return pageResult;
        }

        List<LineageScriptInfoDto> finalResults = scriptDtoByFolderId.stream()
            .filter(dto -> {
                if(StringUtils.isEmpty(keyword)) {
                    return true;
                }else {
                    if(dto.getScripName() == null){
                        return false;
                    }else {
                        return (dto.getScripName().indexOf(keyword) > -1);
                    }
                }
            }).collect(Collectors.toList());

        List<LineageScriptInfoDto> infoDtos = finalResults.stream()
            .sorted(Comparator.comparing(LineageScriptInfoDto::getScripName)).limit(Math.min(pageSize*currentPage, finalResults.size()))
            .collect(Collectors.toList());

        pageResult.setContent(infoDtos);
        if(CollectionUtils.isEmpty(finalResults)){
            pageResult.setTotalItems(0L);
        }else {
            pageResult.setTotalItems((long)finalResults.size());
        }
        return pageResult;
    }

    @RequestMapping(value = "/folder/deleteFolderRefs/{type}/{folderId}", method = RequestMethod.POST)
    @Operation(summary = "批量删除目录关系", description = "批量删除目录关系")
    public List<Long> deleteFolderRefs(@PathVariable("type") LineageFolderRefType type, @PathVariable("folderId") Long folderId, @RequestBody List<Long> refIds) {
        return lineageFolderService.deleteFolderRefs(refIds, folderId, type);
    }

    @RequestMapping(value = "/folder/resetInheritModel", method = RequestMethod.POST)
    @Operation(summary = "重置继承模式", description = "重置继承模式")
    @Parameter(name = "folderId", description = "目录id", in = ParameterIn.PATH, required = true)
    @Parameter(name = "refType", description = "目录id", in = ParameterIn.PATH, required = true)
    public void resetInheritModel(@RequestParam("folderId") Long folderId, @RequestParam("refType")
            LineageFolderRefType refType) {
        lineageFolderService.resetInheritModel(folderId, refType);
    }

    @RequestMapping(value = "/bind/report/{lineageId}", method = RequestMethod.GET)
    @Operation(summary = "查询绑定报告", description = "查询绑定报告")
    @Parameter(name = "lineageId", description = "血缘id", in = ParameterIn.PATH, required = true)
    public String findLineageBindReport(@PathVariable("lineageId") Long lineageId)
        throws JsonProcessingException {
        return objectService.findLineageBindReport(lineageId);
    }

    @RequestMapping(value = "/updateLinageContent", method = RequestMethod.POST)
    @Operation(summary = "更新血缘内容", description = "更新血缘内容")
    @Transactional
    public void updateLinageContent(@RequestParam("lineageId") Long lineageId,
        @RequestBody LineageContainer lineageContainer) {
        Lineage lineage = lineageDao.getLineageById(lineageId);
        if (lineage == null) {
            throw new ItemNotFoundException("cannotFindLineageById");
        }
        mappingService.bindLineageObject(lineage, lineageContainer);
        lineageDao.updateLineageContent(lineage, lineageContainer);
    }

    //todo 7.0 job
//    @Operation(summary = "新增血缘目录任务")
//    @OperatorLog(
//        operation = OperationLogType.TABLE_ADD,
//        operateTable = "dam_common_job",
//        systemModule = OperationModuleType.QUALITY_CHECK_TASK,
//        description = {"新增血缘目录,任务名为:","1","name"}
//    )
//    @PostMapping(value = "/folder/job")
//    public Long createLoadLineageJob(@RequestBody LoadLineageJobDescriptor descriptor) throws Exception {
//
//        return importService.createLoadLineageJob(descriptor);
//    }

    //todo 7.0 job
//    @Operation(summary = "根据jobID查询任务")
//    @OperatorLog(
//        operation = OperationLogType.TABLE_ADD,
//        operateTable = "dam_common_job",
//        systemModule = OperationModuleType.QUALITY_CHECK_TASK,
//        description = {"根据jobID查询任务,任务名为:","1","name"}
//    )
//    @PostMapping(value = "/folder/job/{jobId}")
//    public DatablauJobStatusDto findLoadLineageJobByJobId(@PathVariable("jobId") Long jobId) {
//        return datablauJobService.getJobStatusDtoByJobId(jobId);
//    }

    @Operation(summary = "查询目录下绑定元数据的血缘图" )
    @PostMapping(value = "/getLineageOfFolderId" )
    public LineageContainer getLineageOfFolderId(@RequestParam("folderId" ) Long folderId) {
        return mappingService.getLineageOfFolderId(folderId);
    }

    //todo 7.0 这是652的接口
//    @Operation(summary = "根据模型id直接解析出对应血缘" )
//    @PostMapping(value = "/parse" )
//    public LineageContainer getLineageOfFolderId(@RequestBody RunSqlDto runSqlDto) {
//        String sql= new String(Base64.getDecoder().decode(runSqlDto.getSql()), StandardCharsets.UTF_8);
//        for (Property param:runSqlDto.getProperties()) {
//            sql=sql.replace("${"+param.getProp()+"}","'"+param.getValue()+"'");
//        }
//        return lineageDirectParseService.parseSqlLineage(runSqlDto.getModelId(), sql);
//    }

    @PostMapping("/tryAccessShareFolder")
    public boolean tryToAccessShareFolder(@RequestBody DatablauJobDescriptor descriptor)
            throws Exception {
        Properties prop = new Properties();
        prop.put("jcifs.smb.client.enableSMB2", "true");
        prop.put("jcifs.smb.client.disableSMB1", "false");
        prop.put("jcifs.traceResources", "true");

        Configuration config = new PropertyConfiguration(prop);
        CIFSContext baseContext = new BaseContext(config);
        CIFSContext context = null;

        String username = descriptor.getParameterByName("username").getValue();
        String password = descriptor.getParameterByName("password").getValue();
        String shareFolder = descriptor.getParameterByName("shareFolder").getValue();

        if (Strings.isNullOrEmpty(username)) {
            context = baseContext.withAnonymousCredentials();
        } else {
            context = baseContext.withCredentials(new NtlmPasswordAuthenticator(username,
                    DigestUtils.decryptIfIsEncrypted(password)));
        }

        if (Strings.isNullOrEmpty(shareFolder)) {
            throw new InvalidArgumentException(
                    msgService.getMessage("pathOfSharedDirectoryIsNotSpecified"));
        }

        try (SmbFile share = new SmbFile(shareFolder.replace("\\", "/"), context)) {
            share.connect();
            if (!share.exists()) {
                throw new UnexpectedStateException(
                        msgService.getMessage("directoryCalledOnNotExist"));
            }
        } catch (SmbException se) {
            throw new UnexpectedStateException(
                    msgService.getMessage("failedToReadSMB", se.getMessage()), se);
        } catch (Exception ie) {
            throw new UnexpectedStateException(
                    msgService.getMessage("sharePathInvalid", shareFolder.replace("smb:", "")));
        }

        return true;
    }

    /**
     * 解析血缘文件
     *
     * @param
     */
    @Operation(summary = "解析血缘文件")
    @PostMapping(value = "/parse")
    public Long parseLineageFile(@Parameter(name = "file", description = "文件", required = true)
                                 @RequestParam("file") MultipartFile file,
                                 @Parameter(name = "originalLineageId", description = "原始血缘Id")
                                 @RequestParam(value = "originalLineageId", required = false) Long originalLineageId,
                                 @Parameter(name = "folderId", description = "目录ID")
                                 @RequestParam(value = "folderId", required = false) Long folderId,
                                 @Parameter(name = "description", description = "描述")
                                 @RequestParam(value = "description") String description,
                                 @Parameter(name = "type", description = "血缘类型")
                                 @RequestParam(value = "type") LineageType type) throws Exception {
        File uploadFile = null;
        try {
            uploadFile = DataUtility.uploadFile(file);
        } catch (Exception ex) {
            logger.error("failed to upload file", ex);
            throw new UnexpectedStateException(msgService.getMessage("failedToUploadFileParam", ex.getMessage()));
        }

        LineageParseParamDto lineageParseParamDto = new LineageParseParamDto();
        lineageParseParamDto.setFolderId(folderId == null ? 0 : folderId);
        lineageParseParamDto.setOriginalLineageId(originalLineageId);
        lineageParseParamDto.setType(type);
        lineageParseParamDto.setDescription(description);
        lineageParseParamDto.setOriginalFileName(file.getOriginalFilename());

        Long result = importService.parseLineageFile(uploadFile, lineageParseParamDto);

//        try {
//            String table = "dam_lineage_content";
//            String logMessage = String.format(msgService.getMessage("parseFileLineage.log"), file.getOriginalFilename());
//
//            operationLogService.generateOperationLog(OperationModuleType.METADATA_LINEAGE_FILE, table,
//                    OperationLogType.DATA_UPLOAD, logMessage, AuthTools.currentUsername(), 0);
//        } catch (Exception e) {
//            logger.error(e.getMessage());
//        }
        return result;
    }

    /**
     * 获取血缘类型
     * @return
     */
    @Operation(summary = "获取血缘类型")
    @PostMapping("/getLineageTypeInfos")
    public List<LineageTypeInfoDto> getLineageTypeInfos() {
        List<LineageTypeInfoDto> lineageTypeInfos = new ArrayList<>();
        for (LineageType lineageType : LineageType.values()) {
            lineageTypeInfos.add(new LineageTypeInfoDto(lineageType.name(), lineageType.getDisplayName(), lineageType.getSupportFileExtension()));
        }
        return lineageTypeInfos;
    }

    @PostMapping("/getObjectLineage")
    @Operation(summary = "查询一个object的血缘", description = "查询一个object的血缘")
    @Description("查询一个object的血缘")
    public LineageContainer getObjectLineage(@RequestBody ObjectLineageRequest request) {
        LineageContainer container = mappingService.getLineageOfObject(request);
        return container;
    }
}
