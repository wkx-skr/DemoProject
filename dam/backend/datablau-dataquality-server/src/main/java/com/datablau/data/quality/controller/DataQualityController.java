/*
 * Copyright (c) 2017, Datablau. All rights reserved.
 */

package com.datablau.data.quality.controller;

import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.ItemNotFoundException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.data.PageResult;
import com.andorj.file.transfer.api.RemoteFileLoader;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.edition.FeatureCode;
import com.andorj.model.common.search.QueryParameterCriteria;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.base.api.FileService;
import com.datablau.category.dto.UniversalCategoryNodeDto;
import com.datablau.category.service.api.UniversalCategoryService;
import com.datablau.category.type.UniversalCategoryType;
import com.datablau.data.common.api.EditionService;
import com.datablau.data.common.api.OperationLogService;
import com.datablau.data.common.api.instantjob.InstantJob;
import com.datablau.data.common.api.instantjob.InstantJobProgressMonitor;
import com.datablau.data.common.api.instantjob.InstantJobService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.data.DataBlauHttpServletRequest;
import com.datablau.data.common.data.FileDescriptor;
import com.datablau.data.common.data.ItemPermissionLevel;
import com.datablau.data.common.data.instantjob.ImportInstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobStage;
import com.datablau.data.common.operation.annotation.OperatorLog;
import com.datablau.data.common.operation.type.OperationLogType;
import com.datablau.data.common.operation.type.OperationModuleType;
import com.datablau.data.common.type.InstantJobType;
import com.datablau.data.common.util.DynamicConfigurations;
import com.datablau.data.common.util.ExcelUtil;
import com.datablau.data.common.util.ShareKit;
import com.datablau.data.quality.dashboard.data.DataQualityJobResultDto;
import com.datablau.data.quality.data.DataQualityBusinessRuleDto;
import com.datablau.data.quality.data.DataQualityBusinessRuleQueryDto;
import com.datablau.data.quality.data.DataQualityDispatchDto;
import com.datablau.data.quality.data.DataQualityDispatchQueryDto;
import com.datablau.data.quality.data.DataQualityJobQueryDto;
import com.datablau.data.quality.data.DataQualityResultPage;
import com.datablau.data.quality.data.DataQualityResultQueryCriteria;
import com.datablau.data.quality.data.DataQualityResultQueryCriteria.SolveStatus;
import com.datablau.data.quality.data.DataRuleResultDto;
import com.datablau.data.quality.data.ItemState;
import com.datablau.data.quality.data.QualityTaskSearchCriteriaDto;
import com.datablau.data.quality.data.RuleRelationJobDto;
import com.datablau.data.quality.data.RuleType;
import com.datablau.data.quality.data.TaskDispatchDto;
import com.datablau.data.quality.dto.DataQualityBusinessRuleProcessQueryDto;
import com.datablau.data.quality.dto.DataQualityCategoryDto;
import com.datablau.data.quality.dto.DataQualityCategoryNodeDto;
import com.datablau.data.quality.dto.DataQualityExportResult;
import com.datablau.data.quality.dto.DataQualityTaskNative;
import com.datablau.data.quality.dto.DataQualityTechRuleDto;
import com.datablau.data.quality.dto.DataQualityTechRulePageSearchDto;
import com.datablau.data.quality.dto.DataQualityTechRuleProcessQueryDto;
import com.datablau.data.quality.dto.DataQualityTechRuleReport;
import com.datablau.data.quality.dto.DataRuleRangeDto;
import com.datablau.data.quality.dto.DataRuleRangeGenerateQueryDto;
import com.datablau.data.quality.dto.DataRuleRangeQueryDto;
import com.datablau.data.quality.dto.DataRuleRangeTableDto;
import com.datablau.data.quality.dto.DataRuleResultDashboardDto;
import com.datablau.data.quality.dto.DataRuleResultQueryDto;
import com.datablau.data.quality.dto.FileObject;
import com.datablau.data.quality.dto.TechRuleExcelErrorDto;
import com.datablau.data.quality.dto.TechRuleInfoDto;
import com.datablau.data.quality.impl.LocalJobRegistryAdapter;
import com.datablau.data.quality.job.data.DataQualityJobDescriptor;
import com.datablau.data.quality.job.data.DataRuleJobDescriptor;
import com.datablau.data.quality.jpa.entity.DataQualityBusinessRule;
import com.datablau.data.quality.jpa.entity.DataQualityDispatch;
import com.datablau.data.quality.jpa.entity.DataQualitySolution;
import com.datablau.data.quality.jpa.entity.DataQualityTask;
import com.datablau.data.quality.jpa.entity.DataQualityTaskHistory;
import com.datablau.data.quality.jpa.entity.DataQualityTechRule;
import com.datablau.data.quality.jpa.entity.DataRuleRange;
import com.datablau.data.quality.jpa.entity.DataRuleRangeTable;
import com.datablau.data.quality.jpa.entity.KnowledgeDoc;
import com.datablau.data.quality.metadata.service.DataQualityDao;
import com.datablau.data.quality.metadata.service.DataQualityTaskService;
import com.datablau.data.quality.metadata.service.DataRuleService;
import com.datablau.data.quality.type.DataQualityConstant;
import com.datablau.data.quality.utility.ServerConstants;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.job.scheduler.dto.JobDto;
import com.datablau.job.scheduler.dto.JobEvent;
import com.datablau.job.scheduler.dto.JobResultDto;
import com.datablau.job.scheduler.dto.RunningJobStatusDto;
import com.datablau.metadata.common.dto.metadata.DataObjectDto;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.dto.UserDto;
import com.datablau.security.management.dto.UserQueryDto;
import com.datablau.security.management.utils.AuthTools;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import dm.jdbc.filter.stat.json.JSONArray;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.commons.io.FileUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.redisson.api.RBucket;
import org.redisson.api.RedissonClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * @author Nicky
 * @since 1.0
 */
@RestController
@RequestMapping("/quality")
@Tag(name = "数据质量REST API")
public class DataQualityController extends BaseController {
    private static final Logger LOGGER = LoggerFactory.getLogger(DataQualityController.class);
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final String FILE_ID_PREFIX = "fileId:";

    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");

    @Autowired
    private DataQualityDao dataQualityDao;

    @Autowired
    private MessageService msgService;

    @Autowired
    private FileService fileService;

    @Autowired
    private RemoteFileLoader remoteFileLoader;

    @Autowired
    private DataQualityTaskService taskService;

    @Autowired
    private LocalJobRegistryAdapter localJobRegistryAdapter;

    @Autowired
    private RedissonClient redissonClient;

    @Autowired
    private EditionService editionService;

    @Autowired
    private UniversalCategoryService universalCategoryService;

    @Autowired
    private InstantJobService instantJobService;

    @Autowired
    private UserService userService;

    @Autowired
    private OperationLogService operationLogService;

    @Autowired
    private DataRuleService dataRuleService;

    public DataQualityController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

//  TODO 7.0

//    @Operation(summary = "获取所有数据质量资源")
//    @GetMapping(value = "/sources")
//    public List<ShallowObjectDto> getAllSourceObjects() {
//        List<DataObject> objects = transformDao.getDataQualitySourceObjects();
//
//        List<ShallowObjectDto> result = new ArrayList<ShallowObjectDto>(objects.size());
//
//        for (DataObject object : objects) {
//            result.add(convertTo(object));
//        }
//
//        return result;
//    }
//
//    @Deprecated
//    @Operation(summary = "获取数据质量详情")
//    @Parameters({@Parameter(name = "objectId", description = "数据质量id", in = ParameterIn.PATH)})
//    @GetMapping(value = "/tables/{objectId}/details")
//    public String getQualityDetails(@PathVariable("objectId") Long objectId) {
//        return transformDao.getDataQualityTransform(objectId);
//    }

    @GetMapping(value = "/hello")
    public void sayHello() {

    }

    @Operation(summary = "获取所有数据质量业务规则")
    @GetMapping(value = "/rules/bu")
    public List<DataQualityBusinessRule> getQualityBusinessRules() throws Exception {
        return dataQualityDao.getAllBusinessRules(false);
    }

    @Operation(summary = "获取某个业务规则详情")
    @Parameters({@Parameter(name = "ruleId", description = "业务规则id")})
    @GetMapping(value = "/rule/bu/getRuleById")
    public DataQualityBusinessRuleDto getQualityBusinessRuleById(@RequestParam(value = "ruleId", required = false) Long ruleId) throws Exception {
        return dataQualityDao.getBusinessRuleDtoById(ruleId);
    }

    @Operation(summary = "获取所有数据质量业务规则报告")
    @GetMapping(value = "/rules/bu/report")
    public List<DataQualityBusinessRuleDto> getQualityBusinessRulesReport() throws Exception {
        return dataQualityDao.getAllBusinessRulesReport();
    }

    /**
     * 分页查询业务规则
     */
//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "db_quality_business_rule",
//            systemModule = OperationModuleType.QUALITY_BUSINESS_RULE,
//            description = "查询业务规则"
//    )
    @Operation(summary = "分页查询业务规则")
    @RequestMapping(value = "/rules/bu/report/page", method = RequestMethod.POST)
    public PageResult<DataQualityBusinessRuleDto> getQualityBusinessRulesReportPage(
            @RequestBody DataQualityBusinessRuleQueryDto queryDto) {
        return dataQualityDao.getAllBusinessRulesReportPage(queryDto);
    }

    @Operation(summary = "分页查询业务规则报告")
    @Parameters({@Parameter(name = "ruleName", description = "规则名", in = ParameterIn.QUERY),
            @Parameter(name = "ruleId", description = "规则id", in = ParameterIn.QUERY),
            @Parameter(name = "modelCategoryId", description = "模型目录id", in = ParameterIn.QUERY),
            @Parameter(name = "pageSize", description = "分页大小", in = ParameterIn.QUERY),
            @Parameter(name = "currentPage", description = "当前页码", in = ParameterIn.QUERY)})
    @GetMapping(value = "/rules/bu/report/tech/page")
    public PageResult<DataQualityBusinessRuleDto> getQualityBusinessRulesReportPageForTechRule(
            @RequestParam("currentPage") Integer currentPage,
            @RequestParam("pageSize") Integer pageSize,
            @RequestParam("ruleName") String ruleName,
            @RequestParam(value = "ruleId", required = false) Long ruleId,
            @RequestParam(value = "modelCategoryId", required = false) Long modelCategoryId) {
        return dataQualityDao.getAllBusinessRulesReportPageForTech(currentPage, pageSize, ruleName, ruleId, modelCategoryId);
    }

    @Operation(summary = "获取所有技术规则报告")
    @GetMapping(value = "/rules/tech/report")
    public List<DataQualityTechRuleReport> getQualityTechRulesReport() throws Exception {
        return dataQualityDao.getAllTechRulesReport();
    }

    @Operation(summary = "获取技术规则报告")
    @Parameters({@Parameter(name = "ruleId", description = "规则id", in = ParameterIn.PATH)})
    @RequestMapping(value = "/rule/tech/{ruleId}")
    public DataQualityTechRule getQualityTechRuleDetail(@PathVariable("ruleId") Long ruleId) {
        DataQualityTechRule techRule = dataQualityDao.getTechRuleDetailWithoutKnowledge(ruleId);

        //增加日志
        addTechRuleCommonLog(techRule, "quality.tech.log.query", OperationLogType.TABLE_QUERY);

        return techRule;
    }

    @Operation(summary = "获取技术规则")
    @Parameters({@Parameter(name = "ruleId", description = "规则id", in = ParameterIn.PATH)})
    @RequestMapping(value = "/rule/tech/{ruleId}/knowledge")
    public List<KnowledgeDoc> getQualityTechRuleRelatedKnowledge(@PathVariable("ruleId") Long ruleId) throws Exception {
        //todo 这个接口跟前端确认了目前没有用
        return new ArrayList<>();
    }

    @Operation(summary = "获取业务规则目录")
    @GetMapping(value = "/rules/bu/catalog")
    public List<String> getQualityBusinessRulesCatalog() throws Exception {
        return dataQualityDao.getAllBuQualityRuleCatalog();
    }

    @Operation(summary = "获取技术规则报告")
    @Parameters({@Parameter(name = "modelCategoryId", description = "模型目录id", in = ParameterIn.PATH)})
    @GetMapping(value = "/rules/tech/report/{modelCategoryId}")
    public List<DataQualityTechRuleReport> getQualityTechRulesReportByModelCategoryId(@PathVariable("modelCategoryId") int modelCategoryId) throws Exception {
        return dataQualityDao.getTechRulesReportByModelCategoryId((long)modelCategoryId);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "db_quality_tech_rule",
//            systemModule = OperationModuleType.QUALITY_TECH_RULE,
//            description = "查询技术规则"
//    )
    @Operation(summary = "获取技术规则")
    @PostMapping(value = "/rules/tech/page")
    public DataQualityTechRulePageSearchDto getQualityTechRulesReportPage(@RequestBody DataQualityTechRulePageSearchDto reqDto) throws Exception {
        return dataQualityDao.getTechRulesReportPage(reqDto, true);
    }

    @Operation(summary = "测试技术规则")
    @GetMapping(value = "/rule/test")
    public void testQualityRules(@RequestBody DataQualityTechRule rule) throws Exception {
        dataQualityDao.testRule(rule);
    }

    @Operation(summary = "在保存一条质量规则之前对其进行测试")
    @PostMapping(value = "/rule/test")
    public List<String> testQualityRule(@RequestBody DataQualityTechRuleDto reqDto) throws Exception {
        try {
            return dataQualityDao.testQualityRule(reqDto);
        } catch (Throwable tw) {
            throw new Exception(tw);
        }
    }

    @Operation(summary = "新增业务规则")
    //@PreAuthorize(UserRights.QUALITY_BUSINESS_RULE_VIEW_ADD)
    @PostMapping(value = "/rules/bu")
    public void createQualityBusinessRules(@RequestBody List<DataQualityBusinessRule> rules) throws Exception {
        for (DataQualityBusinessRule rule : rules) {
            dataQualityDao.createBusinessRule(rule);

            //增加日志
            addBusinessRuleCommonLog(rule, "quality.business.log.add", OperationLogType.TABLE_ADD);
        }
    }

    protected void addBusinessRuleCommonLog(DataQualityBusinessRule rule, String message, OperationLogType logType) {
        try {
            String logMessage = msgService.getMessage(message, rule.getName());
            operationLogService.generateOperationLog(OperationModuleType.QUALITY_BUSINESS_RULE, "db_quality_business_rule",
                    logType, logMessage, AuthTools.currentUsername(), 0);
        } catch (Exception e) {
            LOGGER.error(e.getMessage());
        }
    }

    @Operation(summary = "新增技术规则")
    //@PreAuthorize(UserRights.QUALITY_TECHNICAL_REGULATION_ADD)
    @PostMapping(value = "/rules/tech")
    public Long createQualityTechRules(@RequestBody List<DataQualityTechRuleDto> rules) throws Exception {
        DataQualityTechRule techRule = null;
        for (DataQualityTechRuleDto rule : rules) {
            techRule = dataQualityDao.createTechRule(rule);

            //增加日志
            addTechRuleCommonLog(techRule, "quality.tech.log.add", OperationLogType.TABLE_ADD);
        }

        if (techRule == null) {
            return null;
        } else {
            return techRule.getId();
        }
    }

    protected void addTechRuleCommonLog(DataQualityTechRule rule, String message, OperationLogType logType) {
        try {
            String logMessage = msgService.getMessage(message, rule.getName());
            operationLogService.generateOperationLog(OperationModuleType.QUALITY_TECH_RULE, "db_quality_tech_rule",
                    logType, logMessage, AuthTools.currentUsername(), 0);
        } catch (Exception e) {
            LOGGER.error(e.getMessage());
        }
    }

    @Operation(summary = "查询质量规则血缘")
    @PostMapping(value = "/rules/sql/lineage")
    public TechRuleInfoDto getTechRuleLineage(@RequestBody TechRuleInfoDto ruleInfo) throws Exception {
        return dataQualityDao.parserSqlForTest(ruleInfo);
    }

    @Operation(summary = "保存质量规则血缘")
    @PostMapping(value = "/rules/save/lineage")
    public void saveTechRuleLineage(@RequestBody TechRuleInfoDto ruleInfo) throws Exception {
        dataQualityDao.saveTechRuleLineage(ruleInfo);
    }

    @Operation(summary = "获取质量规则血缘")
    @Parameters({@Parameter(name = "ruleId", description = "规则id", in = ParameterIn.PATH)})
    @RequestMapping(value = "/rules/{ruleId}/lineage")
    public TechRuleInfoDto getTechRuleLineage(@PathVariable("ruleId") Long ruleId){
        return dataQualityDao.getTechRuleLineage(ruleId);
    }

    @Operation(summary = "编辑质量规则的时候会影响的问题列表")
    @Parameters({@Parameter(name = "ruleId", description = "规则id", in = ParameterIn.PATH)})
    @GetMapping(value = "/rule/{ruleId}/affect-tasks")
    public List<DataQualityTask> getEditRuleAffectTasks(@PathVariable("ruleId") Long ruleId) {
        return taskService.getEditRuleEffectedNotClosedTasks(ruleId);
    }

    @Operation(summary = "删除业务规则")
    @Transactional
    //@PreAuthorize(UserRights.QUALITY_BUSINESS_RULE_VIEW_DELETE)
    @PostMapping(value = "/rules/bu/delete")
    public void deleteQualityBusinessRules(@RequestBody List<Long> rules) throws Exception {
        List<DataQualityBusinessRule> businessRules = dataQualityDao.getBusinessRulesById(rules);

        for (long ruleId : rules) {
            dataQualityDao.deleteBusinessRule(ruleId);
        }

        //增加日志
        addBusinessRuleDeleteLog(businessRules);
    }

    protected void addBusinessRuleDeleteLog(List<DataQualityBusinessRule> businessRules) {
        try {
            for (DataQualityBusinessRule businessRule : businessRules) {
                addBusinessRuleCommonLog(businessRule, "quality.business.log.delete", OperationLogType.TABLE_DELETE);
            }
        } catch (Exception e){
            LOGGER.error(e.getMessage(), e);
        }
    }

    @Operation(summary = "删除技术规则")
    @Transactional
    //@PreAuthorize(UserRights.QUALITY_TECHNICAL_REGULATION_DELETE)
    @PostMapping(value = "/rules/tech/delete")
    public void deleteQualityTechRules(@RequestBody List<Long> rules) throws Exception {
        List<DataQualityTechRule> techRules = dataQualityDao.getTechRulesById(rules);

        for (long ruleId : rules) {
            dataQualityDao.deleteTechRule(ruleId);
        }

        //增加日志
        addTechRuleDeleteLog(techRules);
    }

    protected void addTechRuleDeleteLog(List<DataQualityTechRule> techRules) {
        try {
            for (DataQualityTechRule techRule : techRules) {
                addTechRuleCommonLog(techRule, "quality.tech.log.delete", OperationLogType.TABLE_DELETE);
            }
        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
        }
    }

    @Operation(summary = "导出业务规则")
    @Parameters({@Parameter(name = "all", description = "是否全部 默认true", in = ParameterIn.QUERY)
            ,@Parameter(name = "isTemplate", description = "是否模板 默认false", in = ParameterIn.QUERY)})
    @GetMapping(value = "/rules/bu/file")
    public ResponseEntity<Resource> exportBuQualityRules(@RequestParam(defaultValue = "true") Boolean all,
                                                         @RequestParam(defaultValue = "false") boolean isTemplate) throws Exception {
        String username = AuthTools.currentUsernameFailFast();
        ByteArrayOutputStream bos = null;
        try {
            DataQualityExportResult exportResult = dataQualityDao.exportBuQualiatyRules(all, username, isTemplate);
            Workbook wb = exportResult.getContent();
            bos = new ByteArrayOutputStream();
            wb.write(bos);
            wb.close();

            HttpHeaders headers = new HttpHeaders();
            headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");
            headers.add("charset", "utf-8");

            if(isTemplate){
                headers.add("Content-Disposition", "attachment;filename=\"" + URLEncoder.encode("业务规则导入模板.xlsx", "UTF-8") + "\"");
            }else {
                headers.add("Content-Disposition", "attachment;filename=\"" + URLEncoder.encode("业务规则导出结果.xlsx", "UTF-8") + "\"");
            }

            //增加日志
            addBusinessRuleExportLog(exportResult.getExportNumbers());
            
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

    protected void addBusinessRuleExportLog(Integer exportNumbers) {
        try {
            String logMessage = msgService.getMessage("quality.business.log.export", exportNumbers);
            operationLogService.generateOperationLog(OperationModuleType.QUALITY_BUSINESS_RULE, "db_quality_business_rule",
                    OperationLogType.DATA_EXPORT, logMessage, AuthTools.currentUsername(), 0);
        } catch (Exception e) {
            LOGGER.error(e.getMessage());
        }
    }

    @Operation(summary = "导入业务规则")
    @Parameters({@Parameter(name = "file", description = "文件", in = ParameterIn.QUERY)})
    //@PreAuthorize(UserRights.QUALITY_BUSINESS_RULE_VIEW_IMPORT)
    @PostMapping(value = "/rules/bu/file")
    public String uploadBuQualityRulesExcel(@RequestParam("file") MultipartFile multipartFile,
                                                  @RequestParam(value = "publish", defaultValue = "true") Boolean publish,
                                                  @Parameter(name = "ignoreError", description = "遇到错误是否继续导入", required = false)
                                                  @RequestParam(value = "ignoreError", defaultValue = "false") boolean ignoreError,
                                                  HttpServletRequest request)
            throws Exception {
        File uploadedFile = ShareKit.uploadFile(multipartFile);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        String userName = getCurrentUser(request);

        DataBlauHttpServletRequest dataBlauRequest = new DataBlauHttpServletRequest(request);

        return instantJobService.submitJob(
                new InstantJob<>() {
                    @Override
                    public void setProgressMonitor(InstantJobProgressMonitor monitor) {
                    }
                    @Override
                    public InstantJobResult call() {
                        Set<GrantedAuthority> grantedAuthorities = userService.getUserFullAuthorities(userName);
                        UsernamePasswordAuthenticationToken runAsAuthentication = new UsernamePasswordAuthenticationToken(userName, "ignore it", grantedAuthorities);
                        SecurityContextHolder.setContext(SecurityContextHolder.createEmptyContext());
                        SecurityContextHolder.getContext().setAuthentication(runAsAuthentication);
                        ImportInstantJobResult result = new ImportInstantJobResult();

                        try {
                            result = dataQualityDao.loadBuQualityRulesFromFile(uploadedFile, publish, ignoreError, userName);

                            //增加日志
                            addBusinessRuleImportLog(result.getSuccess(), result.getFailed(), dataBlauRequest);
                        } catch (Exception e) {
                            result.setJobStatus(InstantJobStage.FAILED);
                            result.setErrorMessage(e.getMessage());
                            LOGGER.error(e.getMessage(), e);
                        } finally {
                            uploadedFile.delete();
                        }
                        SecurityContextHolder.clearContext();
                        result.setJobStatus(InstantJobStage.FINISHED);
                        return result;
                    }
                }, msgService.getMessage("import.burule") + sdf.format(new Date()), AuthTools.currentUsernameFailFast(), InstantJobType.IMPORT.toString());
    }

    protected void addBusinessRuleImportLog(int success, int failed, DataBlauHttpServletRequest request) {
        try {
            String logMessage = msgService.getMessage("quality.business.log.upload", success, failed);
            operationLogService.generateOperationLog(OperationModuleType.QUALITY_BUSINESS_RULE, "db_quality_business_rule",
                    OperationLogType.DATA_IMPORT, logMessage, AuthTools.currentUsername(), 0, request);
        } catch (Exception e) {
            LOGGER.error(e.getMessage());
        }
    }

    public String getCurrentUser(HttpServletRequest request) {
        String username = AuthTools.currentUsername();
        if (org.springframework.util.StringUtils.isEmpty(username)) {
            return request.getHeader("username");
        } else {
            return username;
        }
    }

    @Operation(summary = "新建质量规则时，根据表的ID和关键字(字段名)，模糊查询表下的字段。限制50条。")
    @Parameters({@Parameter(name = "tableId", description = "表id", in = ParameterIn.PATH)})
    @PostMapping(value = "/rules/tech/{tableId}/fields")
    public List<DataObjectDto> getFieldsUnderTable(@PathVariable("tableId") Long tableId, @RequestBody DataQualityTechRuleDto reqDto) {
        String name = reqDto.getName();
        return dataQualityDao.getFieldsUnderTable(tableId, name);
    }

    @Operation(summary = "导出技术规则")
//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "db_quality_tech_rule",
//            systemModule = OperationModuleType.QUALITY_TECH_RULE,
//            description = "导出技术规则"
//    )
    @GetMapping(value = "/rules/tech/file")
    public ResponseEntity<Resource> exportTechQualityRules(@RequestBody
        DataQualityTechRulePageSearchDto searchDto) throws Exception {
        ByteArrayOutputStream bos = null;
        try {
            Workbook wb = dataQualityDao.exportTechQualityRules(null, searchDto);
            bos = new ByteArrayOutputStream();
            wb.write(bos);
            wb.close();

            HttpHeaders headers = new HttpHeaders();
            headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");
            headers.add("charset", "utf-8");

            headers.add("Content-Disposition", "attachment;filename=\"QualityRules.xlsx\"");

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

    @Operation(summary = "修改业务规则")
    @Parameters({@Parameter(name = "ruleId", description = "规则id", in = ParameterIn.PATH)})
//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "db_quality_business_rule",
//            systemModule = OperationModuleType.QUALITY_BUSINESS_RULE,
//            description = "修改业务规则，名称为: {param}",
//            descriptionParamClass = DataQualityBusinessRule.class,
//            descriptionParamMethod = "getName"
//    )
    //@PreAuthorize(UserRights.QUALITY_BUSINESS_RULE_VIEW_EDIT)
    @PutMapping(value = "/rule/bu/{ruleId}")
    public DataQualityBusinessRule updateQualityBuRule(@PathVariable("ruleId") int ruleId,
        @RequestBody DataQualityBusinessRule rule) throws Exception {
        DataQualityBusinessRule saved = dataQualityDao.updateBusinessRule((long) ruleId, rule, true);
        if (saved == null) {
            throw new ItemNotFoundException("No rule with id" + ruleId);
        }

        //增加日志
        addBusinessRuleCommonLog(rule, "quality.business.log.modify", OperationLogType.TABLE_MODIFY);

        return saved;
    }

    @Operation(summary = "修改技术规则")
    @Parameters({@Parameter(name = "ruleId", description = "规则id", in = ParameterIn.PATH)})
    //@PreAuthorize(UserRights.QUALITY_TECHNICAL_REGULATION_EDIT)
    @PutMapping(value = "/rule/tech/{ruleId}")
    public void updateQualityTechRule(@PathVariable("ruleId") int ruleId,
                                      @RequestBody DataQualityTechRule rule) throws Exception {
        dataQualityDao.updateTechRule((long) ruleId, rule, true);

        //增加日志
        addTechRuleCommonLog(rule, "quality.tech.log.modify", OperationLogType.TABLE_MODIFY);
    }

    @Operation(summary = "接收问题")
    @Parameters({@Parameter(name = "taskId", description = "规则任务id", in = ParameterIn.PATH)})
    @PostMapping(value = "/rules/tasks/{taskId}/accept")
    public DataQualityTaskNative acceptTask(@PathVariable("taskId") Long taskId) {
        DataQualityTask task = taskService.acceptTask(taskId);
        return dataQualityDao.convert(task);
    }

    @Operation(summary = "关闭问题，requestBody是关闭的comment")
    @Parameters({@Parameter(name = "taskId", description = "规则任务id", in = ParameterIn.PATH)})
    @PostMapping(value = "/rules/tasks/{taskId}/close")
    public DataQualityTaskNative closeTask(@PathVariable("taskId") Long taskId,
        @RequestBody String closeComment) {
        DataQualityTask task = taskService.closeTask(taskId, closeComment);
        return dataQualityDao.convert(task);
    }

    @Operation(summary = "确认问题")
    @Parameters({@Parameter(name = "taskId", description = "规则任务id", in = ParameterIn.PATH)})
    @PostMapping(value = "/rules/tasks/{taskId}/confirm")
    public DataQualityTaskNative confirmTask(@PathVariable("taskId") Long taskId) {
        DataQualityTask task = taskService.confirmTask(taskId);
        return dataQualityDao.convert(task);
    }

    @Operation(summary = "修复问题")
    @Parameters({@Parameter(name = "taskId", description = "规则任务id", in = ParameterIn.PATH)})
    @PostMapping(value = "/rules/tasks/{taskId}/fix")
    public DataQualityTaskNative fixTask(@PathVariable("taskId") Long taskId) {
        DataQualityTask task = taskService.fixTask(taskId);
        return dataQualityDao.convert(task);
    }

    @PostMapping(value = "/getQualityRuleTree")
    public DataQualityCategoryNodeDto getQualityRuleTree() {
        UniversalCategoryNodeDto rootNode = universalCategoryService.getCategoryTreeByTypeForCurrentUser(UniversalCategoryType.QUALITY_RULE);

        Map<Long, List<DataQualityBusinessRuleDto>> businessRuleMap = dataQualityDao
            .getAllBusinessRules(true)
            .stream()
            .filter(bu -> bu.getUniCategoryId() != null)
            .map(bu->toSimpleDto(bu))
            .collect(Collectors.groupingBy(DataQualityBusinessRuleDto::getUniCategoryId));

        DataQualityCategoryNodeDto dataQualityCategoryNodeDto = new DataQualityCategoryNodeDto(rootNode);
        List<DataQualityCategoryNodeDto> allNodes = new LinkedList<>();
        dataQualityCategoryNodeDto.fillUpAllSubNodesToList(allNodes);

        for (DataQualityCategoryNodeDto nodeDto : allNodes) {
            if (nodeDto.getAuth() > 0) {
                List<DataQualityBusinessRuleDto> businessRules = businessRuleMap.getOrDefault(nodeDto.getId(), Collections.emptyList());
                nodeDto.setBusinessRules(businessRules);
            }
        }

        return dataQualityCategoryNodeDto;
    }

    private DataQualityBusinessRuleDto toSimpleDto(DataQualityBusinessRule buRule) {
        DataQualityBusinessRuleDto dto = new DataQualityBusinessRuleDto();
        dto.setId(buRule.getId());
        dto.setName(buRule.getName());
        dto.setUniCategoryId(buRule.getUniCategoryId());
        return dto;
    }

    @Operation(summary = "重新打开问题")
    //@PreAuthorize(UserRights.QUALITY_PROBLEM_CHECK_REOPEN)
    @PostMapping(value = "/rules/tasks/reopen")
    public int reopenTasks(@RequestBody Set<Long> taskIds) {
        return taskService.reopenTasks(taskIds);
    }


    @Operation(summary = "转发问题")
    @Parameters({@Parameter(name = "taskId", description = "规则任务id", in = ParameterIn.PATH)})
    @PostMapping(value = "/rules/tasks/{taskId}/reassign")
    public DataQualityTaskNative reassignTask(@PathVariable("taskId") Long taskId,
        @RequestParam("assignee") List<String> assignee) {
        DataQualityTask task = taskService.reassignTask(taskId, assignee, true);
        return dataQualityDao.convert(task);
    }

    @Operation(summary = "分页查看问题数据, 分页从1开始")
    @Parameters({@Parameter(name = "taskId", description = "规则任务id", in = ParameterIn.PATH),
            @Parameter(name = "pageSize", description = "分页大小", in = ParameterIn.QUERY),
            @Parameter(name = "currentPage", description = "页码", in = ParameterIn.QUERY)})
    //@PreAuthorize(UserRights.QUALITY_ISSUE_DATA)
    @PostMapping(value = "/rules/tasks/{taskId}/data")
    public DataQualityResultPage viewTaskData(@PathVariable("taskId") Long taskId,
                                              @RequestBody DataQualityResultQueryCriteria criteria,
                                              @RequestParam("currentPage") int currentPage,
                                              @RequestParam("pageSize") int pageSize) throws Exception {
        return taskService.getQualityResultPage(taskId, criteria, currentPage, pageSize);
    }

    @Operation(summary = "分页查看问题数据, 分页从1开始")
    @Parameters({@Parameter(name = "taskId", description = "规则任务id", in = ParameterIn.PATH)})
    @PostMapping(value = "/rules/tasks/{taskId}/repairRate")
    public DataQualityResultPage getRepairRate(@PathVariable("taskId") Long taskId, @RequestBody DataQualityResultQueryCriteria criteria) {
        return taskService.getRepairRate(taskId, criteria);
    }

    @Operation(summary = "更新解决方案")
    @Parameters({@Parameter(name = "solutionId", description = "方案id", in = ParameterIn.PATH)})
    @PutMapping(value = "/rules/solutions/{solutionId}")
    public DataQualitySolution updateSolution(@PathVariable("solutionId") Long solutionId,
        @RequestBody DataQualitySolution solution) {
        solution.setId(solutionId);
        return taskService.updateSolution(solution);
    }

    @Operation(summary = "获取一个问题的编辑历史")
    @Parameters({@Parameter(name = "taskId", description = "问题id", in = ParameterIn.PATH)})
    @GetMapping(value = "/rules/tasks/{taskId}/history")
    public List<DataQualityTaskHistory> getTaskEditHistoryListChangeTuAcct(@PathVariable("taskId") Long taskId) {
        return taskService.getTaskHistory(taskId);
    }

    @Operation(summary = "把具体问题分配给某一个人，requestBody是主键值列表")
    @Parameters({@Parameter(name = "taskId", description = "问题id", in = ParameterIn.PATH),
        @Parameter(name = "assignee", description = "用户", in = ParameterIn.QUERY)})
    @PostMapping(value = "/rules/tasks/{taskId}/data/dispatch")
    public int dispatchRowToUser(@PathVariable("taskId") Long taskId,
        @RequestBody List<String> pks,
        @RequestParam(value = "isAgent", required = false, defaultValue = "false") boolean isAgent,
        @RequestParam("assignee") String assignee,
        @RequestParam(value = "sendEmail", defaultValue = "false") Boolean sendEmail) {
        return taskService.dispatchRowToUser(taskId, pks, assignee, isAgent, sendEmail);
    }

    @Operation(summary = "把具体问题分配给某一个人，requestBody是主键值列表")
    @Parameters({@Parameter(name = "taskId", description = "问题id", in = ParameterIn.PATH),
        @Parameter(name = "assignee", description = "用户", in = ParameterIn.QUERY)})
    @PostMapping(value = "/rules/tasks/{taskId}/data/dispatch/agent")
    public int dispatchRowToUserByAgent(@PathVariable("taskId") Long taskId,
        @RequestBody TaskDispatchDto taskDispatchDto,
        @RequestParam(value = "isAgent", required = false, defaultValue = "false") boolean isAgent,
        @RequestParam("assignee") String assignee,
        @RequestParam(value = "sendEmail", defaultValue = "false") Boolean sendEmail) {
        return taskService.dispatchRowToUser(taskId, taskDispatchDto.getPks(), assignee, isAgent, sendEmail,
            taskDispatchDto.getUsers());
    }

    @Operation(summary = "删除某些具体问题, requestBody是主键值列表")
    @Parameters({@Parameter(name = "taskId", description = "问题id", in = ParameterIn.PATH)})
    @PostMapping(value = "/rules/tasks/{taskId}/data/delete")
    public void deleteRow(@PathVariable("taskId") Long taskId, @RequestBody List<String> pks) {
        taskService.deleteQualityResult(taskId, pks);
    }

    @Operation(summary = "按照机构编码来分配问题明细")
    @Parameters({@Parameter(name = "taskId", description = "问题id", in = ParameterIn.PATH),
            @Parameter(name = "colname", description = "列", in = ParameterIn.QUERY),
            @Parameter(name = "defaultUser", description = "默认分配用户", in = ParameterIn.QUERY)})
    @PutMapping(value = "/rules/tasks/{taskId}/dispatch-org")
    public int dispatchTaskProblems(@PathVariable("taskId")Long taskId,
                                    @RequestBody(required = false) List<String> pks,
                                    @RequestParam("colname") String orgColumn,
                                    @RequestParam(value = "sendEmail", defaultValue = "false") Boolean sendEmail,
                                    @RequestParam(value = "defaultUser", required = false) String defaultUser) throws Exception {
        return taskService.dispatchRowToOrg(taskId, pks, orgColumn, defaultUser, sendEmail);
    }

    @Operation(summary = "按照用户ID来分配问题明细")
    @Parameters({@Parameter(name = "taskId", description = "问题id", in = ParameterIn.PATH),
            @Parameter(name = "colname", description = "列", in = ParameterIn.QUERY),
            @Parameter(name = "defaultUser", description = "默认分配用户", in = ParameterIn.QUERY)})
    @PutMapping(value = "/rules/tasks/{taskId}/dispatch-user")
    public int dispatchTaskProblemsByUserCol(@PathVariable("taskId")Long taskId,
                                             @RequestBody(required = false) List<String> pks,
                                             @RequestParam("colname") String orgColumn,
                                             @RequestParam(value = "sendEmail", defaultValue = "false") Boolean sendEmail,
                                             @RequestParam(value = "defaultUser", required = false) String defaultUser) {
        return taskService.dispatchRowToUserByUserCol(taskId, pks, orgColumn, defaultUser, sendEmail);
    }

    @Operation(summary = "按照自定义分配方案来分配问题明细")
    @Parameters({@Parameter(name = "taskId", description = "问题id", in = ParameterIn.PATH),
            @Parameter(name = "colname", description = "列", in = ParameterIn.QUERY),
            @Parameter(name = "dispatchId", description = "方案id", in = ParameterIn.QUERY),
            @Parameter(name = "defaultUser", description = "默认分配用户", in = ParameterIn.QUERY)})
    @RequestMapping(value = "/rules/tasks/{taskId}/dispatch-custom", method = RequestMethod.PUT)
    public int dispatchTaskProblemsByCustom(@PathVariable("taskId")Long taskId,
                                            @RequestBody(required = false) List<String> pks,
                                            @RequestParam("colname") String orgColumn,
                                            @RequestParam("dispatchId") Long dispatchId,
                                            @RequestParam(value = "sendEmail", defaultValue = "false") Boolean sendEmail,
                                            @RequestParam(value = "defaultUser", required = false) String defaultUser) {
        return taskService.dispatchRowToUserByCustom(taskId, pks, orgColumn, dispatchId, defaultUser, sendEmail);
    }

    @Operation(summary = "更新问题某些行的解决状态, requestBody是主键值列表")
    @Parameters({@Parameter(name = "taskId", description = "问题id", in = ParameterIn.PATH),
            @Parameter(name = "solved", description = "是否解决", in = ParameterIn.QUERY)})
    @PostMapping(value = "/rules/tasks/{taskId}/data/solve")
    public void updateRowSolveState(@PathVariable("taskId") Long taskId,
                                    @RequestBody List<String> pks,
                                    @RequestParam("solved") boolean solved) {
        SolveStatus status = (solved ? SolveStatus.SOLVED : SolveStatus.NOT_SOLVED);
        taskService.updateQualityResult(taskId, pks, status);
    }

    @Operation(summary = "更新问题某些行的解决状态, requestBody是主键值列表")
    @Parameters({@Parameter(name = "taskId", description = "问题id", in = ParameterIn.PATH),
        @Parameter(name = "solved", description = "是否解决", in = ParameterIn.QUERY)})
    @PostMapping(value = "/rules/tasks/{taskId}/data/solve/agent")
    public void updateRowSolveStateAgent(@PathVariable("taskId") Long taskId,
        @RequestBody TaskDispatchDto taskDispatchDto,
        @RequestParam(value = "isAgent", required = false, defaultValue = "false") boolean isAgent,
        @RequestParam("solved") boolean solved) {
        SolveStatus status = (solved ? SolveStatus.SOLVED : SolveStatus.NOT_SOLVED);
        taskService.updateQualityResult(taskId, taskDispatchDto.getPks(), status, isAgent,
            taskDispatchDto.getAllRelatedColObjIds());
    }

    @Operation(summary = "获取问题数据某些列的具体内容，requestBody是主键值列表")
    @Parameters({@Parameter(name = "taskId", description = "问题id", in = ParameterIn.PATH)})
    @PostMapping(value = "/rules/tasks/{taskId}/data/view")
    public List<Object[]> getTaskData(@PathVariable("taskId") Long taskId, @RequestBody List<String> pks) {
        return taskService.getQualityResult(taskId, pks);
    }

    @Operation(summary = "获取问题的解决方案，一般一个问题对应一个解决方案")
    @Parameters({@Parameter(name = "taskId", description = "问题id", in = ParameterIn.PATH)})
    @GetMapping(value = "/rules/tasks/{taskId}/solutions")
    public List<DataQualitySolution> getTaskSolutions(@PathVariable("taskId") Long taskId) {
        return taskService.getSolutionsOfTask(taskId);
    }

    @Operation(summary = "基于当前的解决方案创建知识库文档, 返回文档ID")
    @Parameters({@Parameter(name = "solutionId", description = "方案id", in = ParameterIn.PATH)})
    @PostMapping(value = "/rules/solutions/{solutionId}/todoc")
    public Long publishSolutionToDoc(@PathVariable("solutionId") Long solutionId) {
        return taskService.createKnowledgeDocBasedOnSolution(solutionId);
    }

    @Operation(summary = "获取数据质量任务")
    @RequestMapping(value = "/jobs", method = RequestMethod.POST)
    public Page<JobDto> getDataQualityJobsList(
            @RequestBody DataQualityJobQueryDto dto) throws Exception {
        Page<JobDto> result = localJobRegistryAdapter.getDataQualityJobDetailsWithLastRunDetails(dto);
        return result;
    }

    @Operation(summary = "新增检查任务")
    @OperatorLog(
            operation = OperationLogType.TABLE_ADD,
            operateTable = "dc_job",
            systemModule = OperationModuleType.QUALITY_QUALITY_JOB,
            description = "新建【质量检核任务】：{param}",
            descriptionParamClass = DatablauJobDescriptor.class,
            descriptionParamMethod = "getName"
    )
    @PostMapping(value = "/job")
    public Long createQualityJob(@RequestBody DatablauJobDescriptor descriptor) throws Exception {
        return taskService.createQualityJob(descriptor);
    }

    @PostMapping(value = "/getJobTemplate")
    public DatablauJobDescriptor getJobDescriptor() {
        DataQualityJobDescriptor descriptor = new DataQualityJobDescriptor();
        descriptor.initParameters();

        return descriptor.getDescriptor();
    }

    @Operation(summary = "获取技术规则类型")
    @GetMapping(value = "/rules/tech/bizTypes")
    public List<String> getBizTypes() {
        String bizType = DynamicConfigurations.INSTANCE.getPropertyValue("configurable.tr.bizType");
        if (Strings.isNullOrEmpty(bizType)) {
            return Collections.emptyList();
        }

        String[] split = bizType.split(",");
        List<String> bizTypeList = new ArrayList<>();
        for(int i=0; i<split.length; i++) {
            bizTypeList.add(split[i]);
        }
        return bizTypeList;
    }

    @Operation(summary = "修改检查任务")
    @Parameters({@Parameter(name = "jobId", description = "任务id", in = ParameterIn.PATH)})
    @OperatorLog(
            operation = OperationLogType.TABLE_MODIFY,
            operateTable = "dc_job",
            systemModule = OperationModuleType.QUALITY_QUALITY_JOB,
            description = "修改【检核任务】：{param}",
            descriptionParamClass = DatablauJobDescriptor.class,
            descriptionParamMethod = "getName"
    )
    @PutMapping(value = "/job/{jobId}")
    public DatablauJobDescriptor updateQualityJob(@PathVariable("jobId") Long jobId,
                                           @RequestBody DatablauJobDescriptor descriptor) throws Exception {
        return taskService.updateQualityJob(descriptor, jobId);
    }

    @Operation(summary = "删除检查任务")
    @DeleteMapping(value = "/job/{jobId}")
    public void deleteQualityJob(@PathVariable("jobId") Long jobId) throws Exception {
        DatablauJobDescriptor jobDescriptor = taskService.deleteQualityJob(jobId);

        //增加日志
        addQualityJobDeleteJob(jobDescriptor);
    }

    protected void addQualityJobDeleteJob(DatablauJobDescriptor jobDescriptor) {
        try {
            String logMessage = msgService.getMessage("quality.job.log.delete", jobDescriptor.getName());
            operationLogService.generateOperationLog(OperationModuleType.QUALITY_QUALITY_JOB, "dc_job",
                    OperationLogType.TABLE_DELETE, logMessage, AuthTools.currentUsername(), 0);
        } catch (Exception e) {
            LOGGER.error(e.getMessage());
        }
    }

    @Operation(summary = "检查任务状态")
    @RequestMapping("/jobs/status")
    public List<RunningJobStatusDto> getAllQualityJobInstances() {
        return localJobRegistryAdapter.queryAllRunningJobStatus();
    }

    @Operation(summary = "获取任务实例事件")
    @Parameters({@Parameter(name = "jobInstanceId", description = "任务实例id", in = ParameterIn.PATH)})
    @RequestMapping("/jobs/{jobInstanceId}/events")
    public List<JobEvent> getJobInstanceEvent(@PathVariable("jobInstanceId")Long jobInstanceId) {
        //here if we get the events, then means we have permission to the job, no need to check further
        List<JobEvent> events = localJobRegistryAdapter.queryJobEvent(jobInstanceId);
        return events;
    }

    @Operation(summary = "获取任务")
    @GetMapping(value = "/rule/tasks")
    public List<DataQualityTaskNative> getQualityTaskByRuleId() throws Exception {
        return dataQualityDao.getAllNativeTasks();
    }

    @Operation(summary = "搜索任务")
    @PostMapping(value = "/rule/tasks")
    public PageResult<DataQualityTaskNative> searchTasks(@RequestBody QualityTaskSearchCriteriaDto searchCriteria) throws Exception {
        hasPermissionToViewTask(searchCriteria);
        if(searchCriteria.getCurrentPage() < 1 || searchCriteria.getPageSize() < 1)
            throw new IllegalArgumentException(msgService.getMessage("pageNumberAndPageSizeMustGreaterThanZero"));

        return dataQualityDao.searchTasks(searchCriteria);
    }

    private void hasPermissionToViewTask(QualityTaskSearchCriteriaDto searchCriteria) {
        String creator = CollectionUtils.isEmpty(searchCriteria.getOwner()) ? "" : searchCriteria.getOwner().get(0);
        if(searchCriteria.getMonitor() != null && searchCriteria.getMonitor()) {
            if(AuthTools.currentUsername().equals(creator)) {
                //是否有查看自己的权限
                if(!AuthTools.hasAnyRole("ROLE_SUPERUSER")) {
                    throw new AccessDeniedException("Access is denied");
                }
            } else {
                //是否有查看所有人的权限
                if(!AuthTools.hasAnyRole("ROLE_SUPERUSER")) {
                    throw new AccessDeniedException("Access is denied");
                }
            }
        } else if(searchCriteria.getVerify() != null && searchCriteria.getVerify()) {
            if(AuthTools.currentUsername().equals(creator)) {
                //是否有查看自己的权限
                if(!AuthTools.hasAnyRole("QUALITY_PROBLEM_CHECK_VIEW_MY", "ROLE_SUPERUSER")) {
                    throw new AccessDeniedException("Access is denied");
                }
            } else {
                //是否有查看所有人的权限
                if(!AuthTools.hasAnyRole("QUALITY_PROBLEM_CHECK_VIEW_ALL", "ROLE_SUPERUSER")) {
                    throw new AccessDeniedException("Access is denied");
                }
            }
        } else {
            if(AuthTools.currentUsername().equals(creator)) {
                //是否有查看自己的权限
                if(!AuthTools.hasAnyRole("QUALITY_ISSUE_LIST_VIEW_MY", "ROLE_SUPERUSER")) {
                    throw new AccessDeniedException("Access is denied");
                }
            } else {
                //是否有查看所有人的权限
                if(!AuthTools.hasAnyRole("QUALITY_ISSUE_LIST_VIEW_ALL", "ROLE_SUPERUSER")) {
                    throw new AccessDeniedException("Access is denied");
                }
            }
        }
    }

//    @RequestMapping(value = "/rule/tasks", method = RequestMethod.POST)
//    public ResponseEntity<byte[]> searchTasks() throws Exception {
//        if(searchCriteria.getCurrentPage() < 1 || searchCriteria.getPageSize() < 1)
//            throw new IllegalArgumentException(msgService.getMessage("pageNumberAndPageSizeMustGreaterThanZero"));
//
//        return dataQualityDao.searchTasks(searchCriteria);
//    }

    @Operation(summary = "获取任务")
    @Parameters({@Parameter(name = "ruleId", description = "规则id", in = ParameterIn.PATH)})
    @GetMapping(value = "/rule/{ruleId}/task")
    public List<DataQualityTask> getQualityTaskByRuleId(@PathVariable("ruleId") int ruleId) throws Exception {
        return dataQualityDao.getTasksByRuleId((long) ruleId);
    }

    @Operation(summary = "新增问题清单名为")
    @Parameters({@Parameter(name = "assignee", description = "用户", in = ParameterIn.QUERY)})
    @OperatorLog(
            operation = OperationLogType.TABLE_ADD,
            operateTable = "db_quality_task",
            systemModule = OperationModuleType.QUALITY_TASK,
            description = "新建【问题清单】：{param}",
            descriptionParamClass = DataQualityTask.class,
            descriptionParamMethod = "getName"
    )
    //@PreAuthorize(UserRights.QUALITY_ISSUE_LIST_ADD)
    @PostMapping(value = "/rule/task")
    public void createQualityTask(@RequestBody DataQualityTask task, @RequestParam("assignee") String assignee) {
        String[] arr = assignee.split(",");
        taskService.createTaskManually(task, Lists.newArrayList(arr));
    }

    @Operation(summary = "删除问题清单")
//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_quality_task",
//            systemModule = OperationModuleType.QUALITY_TASK,
//            description = "删除问题清单，id为: {params}",
//            descriptionParamClass = Long.class,
//            descriptionParamMethod = "toString"
//    )
    @Transactional
    @PostMapping(value = "/rule/task/delete")
    public void deleteQualityTasks(@RequestBody List<Long> taskIds) throws Exception {
        for (long taskId : taskIds) {
            dataQualityDao.deleteTask(taskId);
        }
    }

    @Operation(summary = "获取任务")
    @Parameters({@Parameter(name = "taskId", description = "任务id", in = ParameterIn.PATH)})
    @GetMapping(value = "/rule/task/{taskId}")
    public DataQualityTaskNative getQualityTaskByTaskId(@PathVariable("taskId") int taskId)
        throws Exception {
        return dataQualityDao.getTaskByTaskId((long) taskId);
    }

    @Operation(summary = "修改问题清单")
    @Parameters({@Parameter(name = "taskId", description = "任务id", in = ParameterIn.PATH)})
    //@OperatorLog(
    //        operation = OperationLogType.TABLE_MODIFY,
    //        operateTable = "db_quality_task",
    //        systemModule = OperationModuleType.QUALITY_TASK,
    //        description = "修改问题清单，名称为: {param}",
    //        descriptionParamClass = DataQualityTask.class,
    //        descriptionParamMethod = "getName"
    //)
    @PutMapping(value = "/rule/task/{taskId}")
    public DataQualityTask updateQualityTask(@PathVariable("taskId") int taskId,
                                             @RequestBody DataQualityTask task) throws Exception {
        return dataQualityDao.updateTask((long) taskId, task);
    }

    @Operation(summary = "获取任务结果")
    @Parameters({@Parameter(name = "taskId", description = "任务id", in = ParameterIn.PATH)})
    @GetMapping(value = "/rule/task/{taskId}/result")
    public String getDataQualityRuleZResultByTaskId(@PathVariable("taskId") Long taskId)
            throws Exception {

        DataQualityTask task = taskService.getDataQualityTaskById(taskId);
        return getRuleResultByQualityJobResultAndRuleId(getRuleResultDescByTask(task), task.getRuleId());
    }

    @Operation(summary = "下载修复任务的内容")
    @Parameters({@Parameter(name = "taskIds", description = "任务ids", in = ParameterIn.QUERY)})
//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "db_quality_task",
//            systemModule = OperationModuleType.QUALITY_TASK,
//            description = "下载修复任务的内容"
//    )
    @GetMapping(value = "/rule/taskbatch/")
    public void downloadRuleTaskFileByTaskIds(@RequestParam("taskIds")String taskIds, HttpServletResponse response) throws Exception{
        if (Strings.isNullOrEmpty(taskIds)) {
            throw new InvalidArgumentException(msgService.getMessage("IdCannotBeEmpty"));
        }
        String[] taskIdArr = taskIds.split(",");
        String tempFolder = GeneralUtility.getTempFolder();
        String downloadFolderPath = tempFolder + File.separator + UUID
            .randomUUID().toString().replaceAll("-", "").substring(8);
        File dir = new File(downloadFolderPath);
        FileUtils.forceMkdir(dir);
        File zipFile = null;

        try {
            for (String taskId : taskIdArr) {
                if (Strings.isNullOrEmpty(taskId)) {
                    continue;
                }

                try {
                    Long id = Long.parseLong(taskId);
                    //File xlsx = new File(jobService.getRuleResultPathByTaskId(id));

                    FileObject fileObj = getRuleResultFileByTaskId(id);
                    File xlsx = null;
                    String fileName = null;

                    if(fileObj == null)
                        continue;

                    if (fileObj.getFilename().startsWith(FILE_ID_PREFIX)) {
                        String name = fileObj.getFilename();
                        String fileId = name.substring(FILE_ID_PREFIX.length());
                        FileDescriptor file = getFileDescById(fileId);
                        xlsx = remoteFileLoader.loadFileToLocal(fileId, file.getFileName());
                        fileName = file.getFileName();

                    } else {
                        xlsx = fileObj.getFile();
                        fileName = fileObj.getFilename();
                    }

                    if (xlsx != null && xlsx.exists()) {
                        File jobDir = xlsx.getParentFile();
                        String parentFolder = downloadFolderPath + File.separator + jobDir.getName();
                        File parentDir = new File(parentFolder);
                        FileUtils.forceMkdir(parentDir);
                        String targetFile = parentFolder + File.separator + fileName;
                        FileUtils.copyFile(xlsx, new File(targetFile));
                    }

                } catch (NumberFormatException nfe) {
                    LOGGER.warn("unable to convert string[" + taskId + "] to number");
                }
            }

            zipFile = GeneralUtility.zipDirectory(dir, new File(tempFolder + File.separator + dir.getName() + ".zip"));

            if (zipFile.exists()) {
                response.setContentType("application/octet-stream");

                String realName = "";

                try {
                    realName = URLEncoder.encode("质量检查结果", "UTF-8");
                    realName = realName.replace("+", "%20");
                } catch (Exception ex) {
                    LOGGER.warn("Failed to convert template file name");
                }

                response.setHeader("Content-disposition", "attachment; filename=" + realName + ".zip");
                response.setHeader("Content-Length", String.valueOf(zipFile.length()));

                try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream(zipFile));
                    BufferedOutputStream bos = new BufferedOutputStream(response.getOutputStream())) {
                    byte[] buff = new byte[2048];
                    int bytesRead;
                    while (-1 != (bytesRead = bis.read(buff, 0, buff.length))) {
                        bos.write(buff, 0, bytesRead);
                    }

                } catch (Exception ex) {
                    throw new IllegalStateException(msgService.getMessage("downloadCollectionOfQualityInspectionJobFailed", ex.getMessage()));
                }
            }

        } finally {
            if (dir != null && dir.isDirectory() && dir.exists()) {
                FileUtils.deleteQuietly(dir);
            }

            if (zipFile != null && zipFile.exists()) {
                FileUtils.deleteQuietly(zipFile);
            }
        }
    }

    @Operation(summary = "下载修复任务")
    @Parameters({@Parameter(name = "taskId", description = "任务id", in = ParameterIn.PATH)})
//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "db_quality_task",
//            systemModule = OperationModuleType.QUALITY_TASK,
//            description = "下载修复任务"
//    )
    @GetMapping(value = "/rule/task/{taskId}/resultfile")
    public ResponseEntity<Resource> downloadRuleTaskFileByTaskId(@PathVariable("taskId") Long taskId)
            throws Exception {
        ByteArrayOutputStream bos = null;
        try {
            FileObject fileObj = getRuleResultFileByTaskId(taskId);
            if (fileObj == null || fileObj.getFilename() == null) {
                return null;
            }

            File file = null;
            String fileName = null;
            if (fileObj.getFilename().startsWith(FILE_ID_PREFIX)) {
                String name = fileObj.getFilename();
                String fileId = name.substring(FILE_ID_PREFIX.length());
                FileDescriptor sf = getFileDescById(fileId);
                file = remoteFileLoader.loadFileToLocal(fileId, sf.getFileName());
                fileName = sf.getFileName();

            } else {
                file = fileObj.getFile();
                fileName = fileObj.getFilename();
            }

            if(file == null)
                return null;

            Workbook wb = new XSSFWorkbook(file.getAbsolutePath());
            bos = new ByteArrayOutputStream();
            wb.write(bos);
            wb.close();

            HttpHeaders headers = new HttpHeaders();
            headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");
            headers.add("charset", "utf-8");
            //设置下载文件名
            String encodedFileName = URLEncoder.encode(fileName, "UTF-8");
            headers.add("Content-Disposition", "attachment;filename=\"" + encodedFileName + "\"");

            Resource resource = new InputStreamResource(
                    new ByteArrayInputStream(bos.toByteArray()));

            return ResponseEntity.ok().headers(headers)
                    .contentType(MediaType.parseMediaType("application/octet-stream")).body(resource);

        } catch (Exception e) {
            throw new UnexpectedStateException(msgService.getMessage("storeFileFileAlreadyDeleted"));
        } finally {
            if (null != bos) {
                bos.close();
            }
        }
    }

    @Operation(summary = "创建解决方案")
    @PostMapping(value = "/rules/solutions")
    public DataQualitySolution createSolution(@RequestBody DataQualitySolution solution) {
        return taskService.createSolution(solution);
    }

    //@PreAuthorize(UserRights.HAS_QUALITY_JOB_VIEWER)
    @Operation(summary = "按规则ID下载规则历史记录文件")
    @Parameters({@Parameter(name = "jobId", description = "任务id", in = ParameterIn.PATH),
            @Parameter(name = "historyId", description = "历史id", in = ParameterIn.PATH),
            @Parameter(name = "ruleId", description = "规则id", in = ParameterIn.PATH)})
//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "db_quality_tech_rule",
//            systemModule = OperationModuleType.QUALITY_TASK,
//            description = "按规则ID下载规则历史记录文件"
//    )
    @GetMapping(value = "/job/{jobId}/history/{historyId}/resultfile/{ruleId}")
    public ResponseEntity<Resource> downloadRuleHistoryFileByRuleId(@PathVariable("jobId") Long jobId,
                                                                    @PathVariable("historyId") Long historyId,
                                                                    @PathVariable("ruleId") Long ruleId)
            throws Exception {
        ByteArrayOutputStream bos = null;
        try {
            DataQualityTechRule rule = dataQualityDao.getTechRuleDetail(ruleId);
            if(rule == null)
                return null;

            File xlsx = new File(getHistoryRuleResultPath(jobId, historyId, ruleId));
            Workbook wb = new XSSFWorkbook(xlsx.getAbsolutePath());
            bos = new ByteArrayOutputStream();
            wb.write(bos);
            wb.close();

            HttpHeaders headers = new HttpHeaders();
            headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");
            headers.add("charset", "utf-8");
            //设置下载文件名
            String filename = URLEncoder.encode(rule.getName(), "UTF-8");
            headers.add("Content-Disposition", "attachment;filename=" + filename + ".xlsx");

            Resource resource = new InputStreamResource(
                    new ByteArrayInputStream(bos.toByteArray()));

            return ResponseEntity.ok().headers(headers)
                    .contentType(MediaType.parseMediaType("application/octet-stream")).body(resource);

        } catch (Exception e) {
            throw new UnexpectedStateException(msgService.getMessage("storeFileFileAlreadyDeleted"));
        } finally {
            if (null != bos) {
                bos.close();
            }
        }
    }

    @Operation(summary = "导出当前页质量规则到Excel文件")
    //@PreAuthorize(UserRights.QUALITY_TECHNICAL_REGULATION_EXPORT)
    @PostMapping("/rules/tech/export")
    public ResponseEntity<Resource> exportTechQualityRules(
        HttpServletRequest request,
        @RequestBody List<Long> ruleIds) throws Exception {
        ByteArrayOutputStream bos = null;
        try {
//            Workbook wb = dataQualityDao.exportTechQualityRules(ruleIds,null);
            Workbook wb = dataQualityDao.exportTechQualityRulesByTemplate(ruleIds, null).getContent();
            bos = new ByteArrayOutputStream();
            wb.write(bos);
            wb.close();
            HttpHeaders headers = new HttpHeaders();
            headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");
            headers.add("charset", "utf-8");
            headers.add("Content-Disposition",
                "attachment;filename=\"" + URLEncoder.encode("数据质量规则.xlsx", "UTF-8") + "\"");
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

    @Operation(summary = "获取导出文件的信息")
    //@PreAuthorize(UserRights.QUALITY_TECHNICAL_REGULATION_EXPORT)
    @PostMapping("/rules/tech/export/info")
    public Map<String, Object> getExportTechQualityRules(String uniqueId) throws Exception {

        RBucket<Map> bucket = redissonClient.getBucket(uniqueId);
        if(bucket.isExists()){
            return bucket.getAndDelete();
        }
        return null;
    }

    @Operation(summary = "导出质量规则模板文件")
    @GetMapping("/rules/tech/export/template")
    public ResponseEntity<Resource> exportTechQualityRulesTemplate() throws Exception {
        ByteArrayOutputStream bos = null;
        try {
            FileInputStream inputStream;
            if(editionService.checkFeature(FeatureCode.dataquality_NoSQLRuleTypes.name())){
                inputStream = new FileInputStream(ShareKit.getResourcePath("/dataquality/techrule.xlsx"));
            }else {
                inputStream = new FileInputStream(ShareKit.getResourcePath("/dataquality/techrule_p.xlsx"));
            }

            Workbook wb = new XSSFWorkbook(inputStream);
            bos = new ByteArrayOutputStream();
            wb.write(bos);
            wb.close();
            HttpHeaders headers = new HttpHeaders();
            headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");
            headers.add("charset", "utf-8");
            headers.add("Content-Disposition", "attachment;filename=\"" + URLEncoder.encode("数据质量规则导入模板.xlsx", "UTF-8") + "\"");
            Resource resource = new InputStreamResource(new ByteArrayInputStream(bos.toByteArray()));
            return ResponseEntity.ok().headers(headers).contentType(MediaType.parseMediaType("application/octet-stream")).body(resource);
        } finally {
            if (null != bos) {
                bos.close();
            }
        }

    }

    @Operation(summary = "导出全部查询结果质量规则到Excel文件")
    //@PreAuthorize(UserRights.QUALITY_TECHNICAL_REGULATION_EXPORT)
    @PostMapping("/rules/tech/export/query")
    public ResponseEntity<Resource> exportTechQualityRulesByQuery(
        HttpServletRequest request,
        @RequestBody DataQualityTechRulePageSearchDto reqDto) throws Exception {
        ByteArrayOutputStream bos = null;
        try {

            if(!AuthTools.hasAnyRole("QUALITY_TECHNICAL_REGULATION_VIEW_ALL", "ROLE_SUPERUSER")) {
                if(AuthTools.hasAnyRole("QUALITY_TECHNICAL_REGULATION_VIEW_MY", "ROLE_SUPERUSER")) {
                    reqDto.setCreator(AuthTools.currentUsername());
                } else {
                    throw new AccessDeniedException("Access is denied");
                }
            }

            DataQualityExportResult exportResult = dataQualityDao.exportTechQualityRulesByTemplate(null, reqDto);

//            Workbook wb = techRuleService.exportTechQualityRules(null,reqDto);
            Workbook wb = exportResult.getContent();
            bos = new ByteArrayOutputStream();
            wb.write(bos);
            wb.close();
            HttpHeaders headers = new HttpHeaders();
            headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");
            headers.add("charset", "utf-8");
            headers.add("Content-Disposition", "attachment;filename=\""+ URLEncoder.encode("数据质量规则.xlsx","UTF-8")+"\"");
            Resource resource = new InputStreamResource(new ByteArrayInputStream(bos.toByteArray()));

            //增加日志
            addTechRuleExportLog(exportResult.getExportNumbers());

            return ResponseEntity.ok().headers(headers).contentType(MediaType.parseMediaType("application/octet-stream")).body(resource);
        } finally {
            if (null != bos) {
                bos.close();
            }
        }

    }

    protected void addTechRuleExportLog(Integer exportNumbers) {
        try {
            String logMessage = msgService.getMessage("quality.tech.log.export", exportNumbers);
            operationLogService.generateOperationLog(OperationModuleType.QUALITY_TECH_RULE, "db_quality_tech_rule",
                    OperationLogType.DATA_EXPORT, logMessage, AuthTools.currentUsername(), 0);
        } catch (Exception e) {
            LOGGER.error(e.getMessage());
        }
    }

    @Operation(summary = "获取技术规则详情，多id")
    @PostMapping(value = "/rule/tech/multi")
    public List<DataQualityTechRuleReport> getQualityTechRuleDetail(@RequestBody List<Long> ruleIds) throws Exception {
        return dataQualityDao.getTechRuleDetailsWithoutKnowledge(ruleIds);
    }

    @Operation(summary = "获取技术规则权限")
    @PostMapping(value = "/rule/tech/multiCheck")
    public List<Long> getCurrentUserQualityTech(@RequestBody List<Long> ruleIds) throws Exception {
        return dataQualityDao.getCurrentUserTechRule(ruleIds);
    }

    @Operation(summary = "获取技术规则详情，多id")
    @PostMapping(value = "/rule/tech/multiPage")
    public PageResult<DataQualityTechRuleDto> getQualityTechRuleDetailPage(@RequestBody QueryParameterCriteria criteria) throws Exception {
        return dataQualityDao.getTechRuleDetailsPage(criteria);
    }

    @Operation(summary = "从Excel文件导入质量规则")
    @Parameters({
            @Parameter(name = "file", description = "文件", in = ParameterIn.QUERY),
            @Parameter(name = "publish", description = "是否发布", in = ParameterIn.QUERY)})
    @PostMapping("/rules/tech/import")
    public String uploadTechQualityRulesExcelNew(@RequestParam("file") MultipartFile multipartFile,
                                               @RequestParam(value = "publish", defaultValue = "true") Boolean publish,
                                               @RequestParam(value = "ignoreError", defaultValue = "false") Boolean ignoreError,
                                                 HttpServletRequest request) throws Exception {
        File uploadedFile = ShareKit.uploadFile(multipartFile);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");

        String username = AuthTools.currentUsernameFailFast();

        DataBlauHttpServletRequest dataBlauRequest = new DataBlauHttpServletRequest(request);

        String jobId = instantJobService.submitJob(new InstantJob<InstantJobResult>() {
            @Override
            public void setProgressMonitor(InstantJobProgressMonitor instantJobProgressMonitor) {

            }

            @Override
            public InstantJobResult call() throws Exception {
                TechRuleExcelErrorDto errorDto = new TechRuleExcelErrorDto();
                try {
                    Set<GrantedAuthority> grantedAuthorities = userService.getUserFullAuthorities(username);
                    UsernamePasswordAuthenticationToken runAsAuthentication = new UsernamePasswordAuthenticationToken(username, "ignore it", grantedAuthorities);
                    SecurityContextHolder.setContext(SecurityContextHolder.createEmptyContext());
                    SecurityContextHolder.getContext().setAuthentication(runAsAuthentication);



                    dataQualityDao.loadTechQualityRulesFromFile(uploadedFile, publish, ignoreError, errorDto);

                    ImportInstantJobResult fileResult = new ImportInstantJobResult();
                    fileResult.setSuccess(errorDto.successCounts());
                    fileResult.setFailed(errorDto.errorCounts());
                    fileResult.setJobStatus(InstantJobStage.FINISHED);

                    //上传文件
                    if(errorDto.hasErrorData()){
                        XSSFWorkbook wb = null;
                        //保存错误数据
                        try(InputStream is = new FileInputStream(uploadedFile)){
                            wb = new XSSFWorkbook(is);
                        }catch (Exception e){
                            throw new AndorjRuntimeException(e.getMessage(), e);
                        }

                        try(FileOutputStream fos = new FileOutputStream(uploadedFile, false)){
                            int sheets = wb.getNumberOfSheets();

                            if(sheets > 2){
                                if(!errorDto.getCompareRuleMap().isEmpty()){
                                    ExcelUtil.fillingImportError(wb, 3, errorDto.getCompareRuleMap(), false);
                                }else {
                                    wb.removeSheetAt(3);
                                }

                                if(!errorDto.getFuncRuleMap().isEmpty()){
                                    ExcelUtil.fillingImportError(wb, 2, errorDto.getFuncRuleMap(), false);
                                }else {
                                    wb.removeSheetAt(2);
                                }

                                if(!errorDto.getRegexRuleMap().isEmpty()){
                                    ExcelUtil.fillingImportError(wb, 1, errorDto.getRegexRuleMap(), false);
                                }else {
                                    wb.removeSheetAt(1);
                                }

                            }

                            if(!errorDto.getSqlRuleMap().isEmpty()){
                                ExcelUtil.fillingImportError(wb, 0, errorDto.getSqlRuleMap(), false);
                            }else {
                                wb.removeSheetAt(0);
                            }

                            wb.write(fos);


                        }catch (Exception e){
                            throw new AndorjRuntimeException(e.getMessage(), e);
                        }finally {
                            if(wb != null){
                                try {
                                    wb.close();
                                }catch (Exception e){}
                            }
                        }

                        FileDescriptor fileDescriptor = uploadFile(uploadedFile, msgService.getMessage("import.errorData") + ".xlsx", AuthTools.currentUsernameFailFast(), false);
                        fileResult.setFileId(fileDescriptor.getFileId());

                        if(!ignoreError){
                            fileResult.setSuccess(0);
                            fileResult.setFailed(errorDto.getTotalCounts());
                        }
                    }
                    LOGGER.info(errorDto.toString());

                    //增加日志
                    addTechRuleImportLog(fileResult.getSuccess(), fileResult.getFailed(), dataBlauRequest);

                    return fileResult;
                } catch (Exception e) {
                    LOGGER.info(errorDto.toString());
                    LOGGER.info(e.getMessage(), e);
                    throw new AndorjRuntimeException(e.getMessage(), e);
                } finally {
                    SecurityContextHolder.clearContext();
                    uploadedFile.delete();
                }
            }
        }, msgService.getMessage("techExcelImportTask") + sdf.format(new Date()), username, "IMPORT");

        return jobId;
    }

    protected void addTechRuleImportLog(int success, int failed, DataBlauHttpServletRequest request) {
        try {
            String logMessage = msgService.getMessage("quality.tech.log.upload", success, failed);
            operationLogService.generateOperationLog(OperationModuleType.QUALITY_TECH_RULE, "db_quality_tech_rule",
                    OperationLogType.DATA_IMPORT, logMessage, AuthTools.currentUsername(), 0, request);
        } catch (Exception e) {
            LOGGER.error(e.getMessage());
        }
    }

    public FileDescriptor uploadFile(File file, String originFilename, String uploader, boolean delete) {
        FileDescriptor newFile = fileService.createFile(originFilename, uploader, null);

        remoteFileLoader.uploadFileToRemote(newFile.getFileId(), file);
        fileService.commitFiles(Collections.singleton(newFile.getFileId()));

        if (delete) {
            file.delete();
        }
        return newFile;
    }

    @Operation(summary = "搜索任务详情")
    @Parameters({@Parameter(name = "ruleId", description = "规则id", in = ParameterIn.QUERY),
            @Parameter(name = "jobResultId", description = "任务结果id", in = ParameterIn.QUERY)})
    @GetMapping(value = "/rule/tasks/detail")
    public List<DataQualityTaskNative> searchTasksDetail(@RequestParam("ruleId") Long ruleId,
                                                   @RequestParam("jobResultId") Long jobResultId) throws Exception {

        return dataQualityDao.getTaskByJobResultId(ruleId, jobResultId);
    }

    @Operation(summary = "导出数据质量任务运行结果")
    @Parameters({@Parameter(name = "jobResultId", description = "任务结果id", in = ParameterIn.QUERY)})
    @GetMapping(value = "/rule/result/export")
    public ResponseEntity<byte[]> exportQualityJobResult(@RequestParam(value = "jobResultId", required = false, defaultValue = "") Long jobResultId) throws Exception {
        return taskService.exportQualityJobResult(jobResultId);
    }

    //    //@PreAuthorize(UserRights.ISSUE_DATA_EXPORT)
//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "db_quality_task",
//            systemModule = OperationModuleType.QUALITY_TASK,
//            description = "导出问题清单"
//    )
    @Operation(summary = "导出所有问题")
    @PostMapping(value = "/rule/task/export")
    public ResponseEntity<byte[]> exportQualityTask(@RequestBody QualityTaskSearchCriteriaDto searchCriteria) throws Exception {
        DataQualityExportResult exportResult = taskService.exportQualityTask(searchCriteria);

        //增加日志
        addTaskExportLog(exportResult.getExportNumbers());

        return exportResult.getByteContent();
    }

    protected void addTaskExportLog(Integer exportNumbers) {
        try {
            String logMessage = msgService.getMessage("quality.task.log.export", exportNumbers);
            operationLogService.generateOperationLog(OperationModuleType.QUALITY_TASK, "db_quality_task",
                    OperationLogType.DATA_EXPORT, logMessage, AuthTools.currentUsername(), 0);
        } catch (Exception e) {
            LOGGER.error(e.getMessage());
        }
    }

    @Operation(summary = "分页下载数据，分页从1开始")
    @Parameters({@Parameter(name = "taskId", description = "任务id", in = ParameterIn.PATH),
            @Parameter(name = "pageSize", description = "分页大小", in = ParameterIn.QUERY),
            @Parameter(name = "currentPage", description = "当前页码", in = ParameterIn.QUERY)})
    @PostMapping(value = "/rules/tasks/{taskId}/download")
    public void downloadTaskData(@PathVariable("taskId") Long taskId,
                                 @RequestBody DataQualityResultQueryCriteria criteria,
                                 @RequestParam("currentPage") int currentPage,
                                 @RequestParam("pageSize") int pageSize,
                                 HttpServletResponse response) throws Exception {

        File toBeDownload = taskService
                .downloadQualityResultPage(taskId, criteria, currentPage, pageSize);

        response.setContentType("application/octet-stream");
        response.setHeader("Content-Disposition", "attachment;filename=\"" + URLEncoder.encode("问题处理详情.xlsx", "utf-8") + "\"");
        response.setHeader("Content-Length", String.valueOf(toBeDownload.length()));
        try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream(toBeDownload));
             BufferedOutputStream bos = new BufferedOutputStream(response.getOutputStream())) {
            byte[] buff = new byte[2048];
            int bytesRead;
            while (-1 != (bytesRead = bis.read(buff, 0, buff.length))) {
                bos.write(buff, 0, bytesRead);
            }
            bos.flush();
        } catch (Exception ex) {
            throw new UnexpectedStateException(msgService.getMessage("downloadFailed"), ex);
        } finally {
            try {
                toBeDownload.delete();
            } catch (Exception ex) {

            }
        }

        //增加日志
        addQualityTaskDownloadLog(taskId);
    }

    protected void addQualityTaskDownloadLog(Long taskId) {
        try {
            DataQualityTask task = taskService.getDataQualityTaskById(taskId);

            String logMessage = msgService.getMessage("quality.task.log.download", task.getName());
            operationLogService.generateOperationLog(OperationModuleType.QUALITY_TASK, "db_quality_task",
                    OperationLogType.BASIC_DOWNLOAD, logMessage, AuthTools.currentUsername(), 0);
        } catch (Exception e) {
            LOGGER.error(e.getMessage());
        }
    }

    /**
     * 获取问题列表对应的技术规则解析出来的字段
     * @param taskId 问题id
     * @return 返回字段集合
     */
    @Operation(summary = "获取问题列表对应的技术规则解析出来的字段")
    @Parameters({@Parameter(name = "taskId", description = "规则id", in = ParameterIn.PATH)})
    @RequestMapping(value = "/task/{taskId}/columns")
    public List<DataObjectDto> getTaskColumnsForAuthApply(@PathVariable("taskId") Long taskId) {
        return taskService.getTaskColumnsForAuthApply(taskId);
    }

    /**
     * 分发问题查询有权限的人员
     */
    @Operation(summary = "分发问题查询有权限的人员")
    @PostMapping(value = "/usersWithHasAuth/getPage")
    public PageResult<UserDto> getUsersWithHasAuth(
            @RequestParam(value = "taskId", required = false) Long taskId,
            @RequestBody UserQueryDto userQueryDto) {
        return taskService.getUsersWithHasAuth(taskId, userQueryDto);
    }

    /**
     * 创建业务规则目录
     */
    @Operation(summary = "创建业务规则目录")
    @PostMapping(value = "/category/createCategory")
    public void createCategory(@RequestBody DataQualityCategoryDto categoryDto) {
        dataQualityDao.createUniCategory(categoryDto);
    }

    /**
     * 删除目录
     */
    @Operation(summary = "删除目录")
    @PostMapping(value = "/category/deleteCategory")
    public void deleteCategory(@RequestParam("categoryId") Long categoryId) {
        dataQualityDao.deleteUniCategory(categoryId);
    }

    /**
     * 更新业务规则目录负责人
     */
    @Operation(summary = "更新业务规则目录负责人")
    @PostMapping(value = "/category/updateCategoryOwner")
    public void updateCategoryOwner(@RequestParam("categoryId") Long categoryId,
                                    @RequestParam("owner") String owner) {
        dataQualityDao.updateUniCategoryOwner(categoryId, owner);
    }

    /**
     * 查询务规则目录负责人
     */
    @Operation(summary = "查询务规则目录负责人")
    @PostMapping(value = "/category/getCategoryOwner")
    public String getCategoryOwner(@RequestParam("categoryId") Long categoryId) {
        return dataQualityDao.getUniCategoryOwner(categoryId);
    }

    /**
     * 根据业务规则查询目录负责人列表
     */
    @Operation(summary = "根据业务规则查询目录负责人列表")
    @PostMapping(value = "/category/getSelectedOwner")
    public Set<String> getSelectedOwner(@RequestParam("buRuleId") Long buRuleId) {
        return dataQualityDao.getSelectedOwner(buRuleId);
    }

    /**
     * 创建自定义分配方案
     */
//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "db_quality_dispatch",
//            systemModule = OperationModuleType.QUALITY_TASK_DISPATCH,
//            description = "新建或编辑问题分配方案，名称为: {param}",
//            descriptionParamClass = DataQualityDispatchDto.class,
//            descriptionParamMethod = "getName"
//    )
    @Operation(summary = "创建自定义分配方案")
    @PostMapping(value = "/dispatch/createOrUpdateDispatch")
    public void createOrUpdateDispatch(@RequestBody DataQualityDispatchDto dispatchDto) {
        taskService.createOrUpdateQualityDispatch(dispatchDto);
    }

    /**
     * 删除自定义分配方案
     */
//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_quality_dispatch",
//            systemModule = OperationModuleType.QUALITY_TASK_DISPATCH,
//            description = "删除问题分配方案，id为: {params}",
//            descriptionParamClass = Long.class,
//            descriptionParamMethod = "toString"
//    )
    @Operation(summary = "删除自定义分配方案")
    @PostMapping(value = "/dispatch/deleteDispatch")
    public void deleteQualityDispatch(@RequestBody List<Long> ids) {
        taskService.deleteQualityDispatch(ids);
    }

    /**
     * 获取所有自定义分配方案
     */
    @Operation(summary = "获取所有自定义分配方案")
    @PostMapping(value = "/dispatch/getAllDispatch")
    public List<DataQualityDispatch> findAllDispatch() {
        return taskService.findAllDispatch();
    }

    /**
     * 获取某个自定义分配方案详情
     */
    @Operation(summary = "获取某个自定义分配方案详情")
    @PostMapping(value = "/dispatch/getDetailDispatch")
    public DataQualityDispatchDto findDetailDispatch(@RequestParam("id") Long id) {
        return taskService.findDetailDispatch(id);
    }

    /**
     * 获取分页自定义分配方案
     */
//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "db_quality_dispatch",
//            systemModule = OperationModuleType.QUALITY_TASK_DISPATCH,
//            description = "查询问题分配方案"
//    )
    @Operation(summary = "获取分页自定义分配方案")
    @PostMapping(value = "/dispatch/getDispatchPage")
    public PageResult<DataQualityDispatch> findDispatchPage(@RequestBody DataQualityDispatchQueryDto queryDto) {
        return taskService.findDispatchPage(queryDto);
    }

    /**
     * 导出问题分配方案模板
     */
    @Operation(summary = "导出问题分配方案模板")
    @PostMapping(value = "/dispatch/exportTemplate")
    public ResponseEntity<byte[]> exportDispatchTemplate() {
        return taskService.exportDispatchTemplate();
    }

    /**
     * 导入问题分配方案
     */
//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "db_quality_dispatch",
//            systemModule = OperationModuleType.QUALITY_TASK_DISPATCH,
//            description = "导入问题分配方案"
//    )
    @Operation(summary = "导入问题分配方案")
    @Parameters({
            @Parameter(name = "file", description = "文件", in = ParameterIn.QUERY)})
    @PostMapping(value = "/dispatch/uploadTemplate")
    public void uploadDispatchTemplate(@RequestParam("file") MultipartFile multipartFile) throws Exception {
        File uploadedFile = ShareKit.uploadFile(multipartFile);
        try {
            taskService.uploadDispatchTemplate(uploadedFile);
        } finally {
            boolean b = uploadedFile.delete();
        }
    }

    /**
     * 创建技术规则的审批副本
     * @throws Exception e
     */
    @PostMapping(value = "/rule/tech/createCopy")
    public void generateTechRuleCopy(@RequestBody DataQualityTechRuleProcessQueryDto dto) throws Exception {
        dataQualityDao.createTechRuleCopy(dto.getTechRuleId(), dto.getProcessState());
    }

    /**
     * 创建技术规则的审批副本，并保存数据
     */
    @PostMapping(value = "/rule/tech/createUpdateCopy")
    public void generateTechRuleCopyAndUpdate(@RequestBody DataQualityTechRuleProcessQueryDto dto) throws Exception {
        dataQualityDao.createTechRuleCopy(dto.getTechRuleId(), dto.getProcessState(), dto.getTechRule());

        //增加日志
        addTechRuleCommonLog(dto.getTechRule(), "quality.tech.log.modify", OperationLogType.TABLE_MODIFY);
    }

    /**
     * 查询审批副本
     *
     * @throws Exception e
     */
    @PostMapping(value = "/rule/tech/getCopyDetail")
    public DataQualityTechRule findTechRuleCopyDetail(@RequestParam(value = "techRuleCopyId") Long techRuleCopyId) throws Exception {
        DataQualityTechRule techRule = dataQualityDao.getTechRuleCopy(techRuleCopyId);

        //增加日志
        addTechRuleCommonLog(techRule, "quality.tech.log.query", OperationLogType.TABLE_QUERY);

        return techRule;
    }

    /**
     * 修改技术规则审批副本
     * @throws Exception e
     */
    @PostMapping(value = "/rule/tech/updateCopy")
    public void updateProcessDetail(@RequestBody DataQualityTechRule techRule) throws Exception {
        dataQualityDao.updateTechRuleCopy(techRule);

        //增加日志
        addTechRuleCommonLog(techRule, "quality.tech.log.modify", OperationLogType.TABLE_MODIFY);
    }

    /**
     * 删除技术规则审批副本
     * @throws Exception e
     */
    @PostMapping(value = "/rule/tech/deleteCopy")
    public void deleteProcessDetail(@RequestBody List<Long> techRuleIds) throws Exception {
        List<DataQualityTechRule> techRules = dataQualityDao.getTechRuleCopyList(techRuleIds);

        dataQualityDao.deleteTechRuleCopy(techRuleIds, false);

        //增加日志
        addTechRuleDeleteLog(techRules);
    }

    /**
     * 校验技术规则任务
     * @param ruleId
     */
    @RequestMapping(value = "/rule/tech/{ruleId}/check")
    public void checkQualityTechRule(@PathVariable("ruleId") Long ruleId) {
        DataQualityTechRule techRule = dataQualityDao.getTechRuleDetail(ruleId);
        dataQualityDao.checkTechRuleAuth(techRule.getBuRuleId(), ItemPermissionLevel.READ);
    }

    /**
     * 获取所有关联任务
     */
    @RequestMapping(value = "/rule/tech/getRelationJobs")
    public List<RuleRelationJobDto> getTechRuleRelationJobs(@RequestBody List<Long> ruleIds) {
        return localJobRegistryAdapter.queryRulesRelatedJobs(ruleIds,
            DataQualityConstant.RESOURCE_QUALITY_TECH_RULE);
    }

    /**
     * 一键解绑任务
     * @param ruleIds
     * @throws Exception
     */
    @RequestMapping(value = "/rule/tech/unbindRelationJobs")
    public void unbindRelationJobs(@RequestBody List<Long> ruleIds) throws Exception {
        dataQualityDao.unbindTechRuleRelationJobs(ruleIds);
    }

    /**
     * 根据id获取问题清单
     */
    @Operation(summary = "根据id获取问题清单")
    @Parameters({@Parameter(name = "taskId", description = "规则id")})
    @PostMapping(value = "/getTaskById")
    public DataQualityTask getDataQualityTaskById(@RequestParam("taskId") Long taskId) {
        return taskService.getDataQualityTaskById(taskId);
    }

    /**
     * 创建业务规则的审批副本
     * @throws Exception e
     */
    @PostMapping(value = "/rule/bu/createCopy")
    public void generateBusinessRuleCopy(@RequestBody DataQualityBusinessRuleProcessQueryDto dto) throws Exception {
        dataQualityDao.createBusinessRuleCopy(dto.getBuRuleId(), dto.getProcessState());
    }

    /**
     * 创建业务规则的审批副本
     * @throws Exception e
     */
    @PostMapping(value = "/rule/bu/createUpdateCopy")
    public void generateBusinessRuleCopyAndUpdate(@RequestBody DataQualityBusinessRuleProcessQueryDto dto) throws Exception {
        dataQualityDao.createBusinessRuleCopy(dto.getBuRuleId(), dto.getProcessState(), dto.getBusinessRule());

        //增加日志
        addBusinessRuleCommonLog(dto.getBusinessRule(), "quality.business.log.modify", OperationLogType.TABLE_MODIFY);
    }

    /**
     * 查询业务规则审批副本
     * @throws Exception e
     */
    @PostMapping(value = "/rule/bu/getCopyDetail")
    public DataQualityBusinessRuleDto findBusinessRuleCopyDetail(@RequestParam(value = "buRuleCopyId") Long copyId) throws Exception {
        DataQualityBusinessRuleDto businessRule = dataQualityDao.getBusinessRuleCopy(copyId);

        //增加日志
        //addBusinessRuleCopyQueryLog(businessRule);

        return businessRule;
    }

    protected void addBusinessRuleCopyQueryLog(DataQualityBusinessRuleDto businessRule) {
        try {
            DataQualityBusinessRule tempRule = new DataQualityBusinessRule();
            tempRule.setName(businessRule.getName());
            addBusinessRuleCommonLog(tempRule, "quality.business.log", OperationLogType.TABLE_QUERY);
        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
        }
    }


    /**
     * 修改业务规则审批副本
     * @throws Exception e
     */
    @PostMapping(value = "/rule/bu/updateCopy")
    public void updateBusinessRuleCopy(@RequestBody DataQualityBusinessRule businessRule) throws Exception {
        dataQualityDao.updateBusinessRuleCopy(businessRule);

        //增加日志
        addBusinessRuleCommonLog(businessRule, "quality.business.log.modify", OperationLogType.TABLE_MODIFY);
    }

    /**
     * 删除业务规则审批副本
     * @throws Exception e
     */
    @PostMapping(value = "/rule/bu/deleteCopy")
    public void deleteBusinessRuleCopy(@RequestBody List<Long> businessRuleIds) throws Exception {
        List<DataQualityBusinessRule> copyRules = dataQualityDao.getBusinessRuleCopyList(businessRuleIds);

        dataQualityDao.deleteBusinessRuleCopy(businessRuleIds);

        //增加日志
        addBusinessRuleDeleteLog(copyRules);
    }

    /**
     * 校验业务规则
     * @param ruleId
     */
    @PostMapping(value = "/rule/bu/{ruleId}/check")
    public void checkQualityBusinessRule(@PathVariable("ruleId") Long ruleId) {
        DataQualityBusinessRule businessRule = dataQualityDao.getBusinessRuleById(ruleId);
        dataQualityDao.checkBusinessRuleAuth(businessRule, ItemPermissionLevel.READ);
    }

    /**
     * 更新业务规则状态
     * @param ruleIds
     * @param state
     */
    @PostMapping(value = "/rule/bu/updateState")
    public void updateBusinessRuleState(@RequestBody List<Long> ruleIds,  @RequestParam("state") ItemState state) {
        dataQualityDao.updateBusinessRuleStatus(ruleIds, state);
    }

    @PostMapping(value = "/rule/tech/updateState")
    public void updateTechRuleState(@RequestBody List<Long> ruleIds,  @RequestParam("state") ItemState state) {
        dataQualityDao.updateTechRuleStatus(ruleIds, state);
    }


    private String getRuleResultByQualityJobResultAndRuleId(DataQualityJobResultDto jobDesc,
        Long ruleId) throws Exception {

        if (jobDesc == null || ruleId == null) {
            return null;
        }

        DataQualityTechRule rule = dataQualityDao.getTechRuleDetail(ruleId);

        if (rule == null) {
            return null;
        }

        if (rule.getType() == RuleType.Metadata) {
            Map<String, Object> result = new LinkedHashMap<String, Object>();
            String[] desc = rule.getContent().split(" ");
            result.put("Table/Column", desc[0]);
            result.put("Metadata Rule Result", desc[1].replace("应", "没"));
            JSONArray res = new JSONArray();
            res.put(result);
            return res.toString();
        } else {
            String result = excelToJson(getRuleResultPathByQualityJobResultAndRuleId(jobDesc, ruleId));
            return result == null ? null : result;
        }
    }

    private DataQualityJobResultDto getRuleResultDescByTask(DataQualityTask task) throws Exception {

        DataQualityTechRule rule = dataQualityDao.getTechRuleDetail(task.getRuleId());

        if (rule == null || rule.getJobResultId() == null) {
            return null;
        }

        return getRuleResultDescByJobResultIdAndRuleId(task.getJobResultId(), task.getRuleId());
    }

    private DataQualityJobResultDto getRuleResultDescByJobResultIdAndRuleId(Long jobResultId,
        Long ruleId) throws Exception {

        if (jobResultId == null || ruleId == null) {
            return null;
        }

        JobResultDto latestResult = localJobRegistryAdapter.queryJobResultById(jobResultId);

        DataQualityJobResultDto jobDesc =
            OBJECT_MAPPER.readValue(latestResult.getResult(), DataQualityJobResultDto.class);

        if (!jobDesc.getResultMap().containsKey(ruleId.toString())
            || jobDesc.getResultMap().get(ruleId.toString()).getOutputCnt() == 0) {
            return null;
        }

        return jobDesc;
    }


    private String excelToJson(String path) throws Exception {
        if (path == null) {
            return null;
        }

        try (FileInputStream fis = new FileInputStream(path);
            Workbook wb = new XSSFWorkbook(fis)) {
            Sheet sheet = wb.getSheetAt(0);

            int rowCount = 0;
            List<String> headers = new ArrayList<>();
            List<Map<String, Object>> array = new LinkedList<>();

            Iterator<Row> rowIterator = sheet.iterator();

            while (rowIterator.hasNext()) {

                Row row = rowIterator.next();

                if (rowCount > 1000) {
                    break;
                }

                Iterator<Cell> cellIterator = row.cellIterator();

                Map<String, Object> object = new LinkedHashMap<>();
                while (cellIterator.hasNext()) {
                    // Get the Cell object
                    Cell cell = cellIterator.next();

                    if (rowCount == 0) {
                        headers.add(cell.getStringCellValue());
                    } else {
                        Object cellValue = null;
                        if (cell != null && cell.getCellType() == CellType.NUMERIC) {
                            double doubleVal = cell.getNumericCellValue();
                            long longVal = Math.round(doubleVal);
                            if (Double.parseDouble(longVal + ".0") == doubleVal) {
                                cellValue = longVal;
                            } else {
                                cellValue = doubleVal;
                            }
                        } else {
                            cellValue = cell.toString();
                        }

                        object.put(headers.get(cell.getColumnIndex()), cellValue);
                    }
                }

                if (rowCount != 0) {
                    array.add(object);
                }
                ++rowCount;
            }

            return OBJECT_MAPPER.writeValueAsString(array);
        }
    }

    private String getRuleResultPathByQualityJobResultAndRuleId(DataQualityJobResultDto jobDesc,
        Long ruleId) {
        if (jobDesc == null || ruleId == null || dataQualityDao.getTechRuleDetail(ruleId) == null) {
            return null;
        }

        //use stored file service instead of direct file

        String fileId = jobDesc.getRuleResultFileIds().get(ruleId.toString());
        if (fileId == null) {
            return null;
        }

        File file = remoteFileLoader.loadFileToLocal(fileId, getFileDescById(fileId).getFileName());
        return file.getAbsolutePath();
    }

    public FileObject getRuleResultFileByTaskId(Long taskId) throws Exception {
        DataQualityTask task = taskService.getDataQualityTaskById(taskId);
        FileObject fileObj = new FileObject();
        if (task == null) {
            throw new IllegalArgumentException(
                msgService.getMessage("noQualityRepairJobWithTheId", taskId));
        }

        if (task != null && task.getJobResultId() != null) {

            DataQualityJobResultDto jobDesc = getRuleResultDescByTask(task);
            Long ruleId = task.getRuleId();

            DataQualityTechRule rule = dataQualityDao.getTechRuleDetail(ruleId);

            if (jobDesc == null || ruleId == null || rule == null) {
                return null;
            }

            String fileId = jobDesc.getRuleResultFileIds().get(ruleId.toString());
            fileObj.setFilename(FILE_ID_PREFIX + fileId);
        }

        return fileObj;
    }

    private FileDescriptor getFileDescById(String fileId) {
        List<FileDescriptor> files = fileService.getFileByIds(Lists.newArrayList(fileId));
        if (CollectionUtils.isEmpty(files)) {
            return null;
        }

        return files.get(0);
    }

    private String getHistoryRuleResultPath(Long jobId, Long historyId, Long ruleId)
        throws Exception {
        if (jobId == null || historyId == null || ruleId == null) {
            return null;
        }

        return getRuleResultPathByQualityJobResultAndRuleId(
            getRuleResultDescByJobResultIdAndRuleId(historyId, ruleId), ruleId);
    }

    @Operation(summary = "新增数据规则")
    @PostMapping(value = "/dataRule/generateRule")
    public void generateDataRangeRuleTemp(@RequestBody DataRuleRangeGenerateQueryDto queryDto) throws Exception {
        dataRuleService.generateDataRangeRuleTemp(queryDto);
    }

    @Operation(summary = "获取当前批次号")
    @PostMapping(value = "/dataRule/getBatchNumber")
    public String getDataRuleJobBatchNumber() {
        return dataRuleService.generateBatchNumber();
    }

    @Operation(summary = "数据规则任务界面，数据规则范围表级别配置分页查询接口")
    @PostMapping(value = "/dataRule/getTablePage")
    public PageResult<DataRuleRangeTableDto> getDataRuleTablePage(@RequestBody DataRuleRangeQueryDto queryDto) {
        return dataRuleService.getDataRuleRangeTablePage(queryDto);
    }

    @Operation(summary = "数据规则任务界面，数据规则范围字段级别查询接口")
    @PostMapping(value = "/dataRule/getColumnList")
    public List<DataRuleRangeDto> getDataRuleRangeList(@RequestParam Long ruleRangeTableId) {
        return dataRuleService.getDataRuleRangeList(ruleRangeTableId);
    }

    @Operation(summary = "编辑数据任务范围接口 --- 表级别")
    @PostMapping(value = "/dataRule/updateRuleTable")
    public DataRuleRangeTable updateDataRuleRangeTable(@RequestBody DataRuleRangeTableDto rangeDto) {
        return dataRuleService.updateDataRuleRangeTable(rangeDto);
    }

    @Operation(summary = "编辑数据任务范围接口")
    @PostMapping(value = "/dataRule/updateRule")
    public DataRuleRange updateDataRuleRange(@RequestBody DataRuleRangeDto rangeDto) {
        return dataRuleService.updateDataRuleRange(rangeDto);
    }

    @Operation(summary = "删除数据任务范围接口 --- 表级别")
    @PostMapping(value = "/dataRule/deleteRuleTable")
    public void deleteDataRuleRangeTable(@RequestParam Long dataRuleRangeTableId) {
        dataRuleService.deleteDataRuleRangeTable(dataRuleRangeTableId);
    }

    @Operation(summary = "删除数据任务范围接口 --- 字段级别")
    @PostMapping(value = "/dataRule/deleteRule")
    public void updateDataRuleRange(@RequestParam Long dataRuleRangeId) {
        dataRuleService.deleteDataRuleRange(dataRuleRangeId);
    }

    @Operation(summary = "新增数据规则检查任务")
    @OperatorLog(
            operation = OperationLogType.TABLE_ADD,
            operateTable = "dc_job",
            systemModule = OperationModuleType.QUALITY_QUALITY_JOB,
            description = "新建【标准检核任务】：{param}",
            descriptionParamClass = DatablauJobDescriptor.class,
            descriptionParamMethod = "getName"
    )
    @PostMapping(value = "/job/createDataRuleJob")
    public Long createQualityJobDataRule(@RequestBody DatablauJobDescriptor descriptor) throws Exception {
        return taskService.createDataRuleJob(descriptor);
    }

    @Operation(summary = "获取数据质量任务类型列表")
    @RequestMapping(value = "/jobs/getTypeOption", method = RequestMethod.POST)
    public Map<String, String> getDataQualityJobsList() {
        Map<String, String> option = new HashMap<>();

        option.put("质量核检任务", DataQualityJobDescriptor.JOB_TYPE_NAME);
        option.put("标准核检任务", DataRuleJobDescriptor.JOB_TYPE_NAME);

        return option;
    }

    @Operation(summary = "修改数据规则检查任务")
    @Parameters({@Parameter(name = "jobId", description = "任务id", in = ParameterIn.PATH)})
    @OperatorLog(
            operation = OperationLogType.TABLE_MODIFY,
            operateTable = "dc_job",
            systemModule = OperationModuleType.QUALITY_QUALITY_JOB,
            description = "修改【检核任务】：{param}",
            descriptionParamClass = DatablauJobDescriptor.class,
            descriptionParamMethod = "getName"
    )
    @PutMapping(value = "/job/updateDataRuleJob/{jobId}")
    public DatablauJobDescriptor updateDataRuleJob(@PathVariable("jobId") Long jobId,
                                                   @RequestBody DatablauJobDescriptor descriptor) throws Exception {
        return taskService.updateDataRuleJob(descriptor, jobId);
    }

    @Operation(summary = "数据规则任务运行结果界面")
    @PostMapping(value = "/dataRule/getJobResult")
    public PageResult<DataRuleResultDto> getDataRuleTablePage(@RequestBody DataRuleResultQueryDto queryDto) {
        return dataRuleService.getDataRuleResultPage(queryDto);
    }

    @Operation(summary = "数据规则任务运行结果统计")
    @PostMapping(value = "/dataRule/getJobResultDashboard")
    public DataRuleResultDashboardDto getDataRuleTablePage(@RequestParam Long jobInstanceId) {
        return dataRuleService.getDataRuleResultDashboard(jobInstanceId);
    }

    @Operation(summary = "导出数据规则任务运行结果")
    @Parameters({@Parameter(name = "jobInstanceId", description = "任务结果id", in = ParameterIn.QUERY)})
    @PostMapping(value = "/dataRule/exportJobResult")
    public ResponseEntity<byte[]> exportDataRuleJobResult(@RequestParam(required = false) Long jobInstanceId) throws Exception {
        return dataRuleService.exportDataRuleJobResult(jobInstanceId);
    }

    @Operation(summary = "查看某个数据规则问题清单的部分属性")
    @Parameters({@Parameter(name = "taskId", description = "问题清单id", in = ParameterIn.QUERY)})
    @PostMapping(value = "/dataRule/getByTaskId")
    public DataRuleResultDto getDataRuleResultForTask(@RequestParam Long taskId) throws Exception {
        return dataRuleService.getDataRuleResultForTask(taskId);
    }
}
