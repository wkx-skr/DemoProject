/*
 * Copyright (c) 2017, Datablau. All rights reserved.
 */

package com.datablau.data.quality.controller;

import com.andorj.common.core.annotation.Feature;
import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.core.exception.ItemNotFoundException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.data.PageResult;
import com.andorj.license.utility.lic.LicenseInfo;
import com.andorj.model.common.api.MessageService;
import com.datablau.base.api.FileService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.operation.annotation.OperatorLog;
import com.datablau.data.common.operation.type.OperationLogType;
import com.datablau.data.common.operation.type.OperationModuleType;
import com.datablau.data.common.util.DynamicConfigurations;
import com.datablau.data.common.util.ShareKit;
import com.datablau.data.quality.data.DataQualityBusinessRuleQueryDto;
import com.datablau.data.quality.data.DataQualityBusinessRuleReport;
import com.datablau.data.quality.data.DataQualityDispatchDto;
import com.datablau.data.quality.data.DataQualityDispatchQueryDto;
import com.datablau.data.quality.data.DataQualityResultPage;
import com.datablau.data.quality.data.DataQualityResultQueryCriteria;
import com.datablau.data.quality.data.DataQualityResultQueryCriteria.SolveStatus;
import com.datablau.data.quality.data.QualityTaskSearchCriteriaDto;
import com.datablau.data.quality.data.TaskDispatchDto;
import com.datablau.data.quality.dto.DataQualityCategoryDto;
import com.datablau.data.quality.dto.DataQualityTaskNative;
import com.datablau.data.quality.dto.DataQualityTechRuleDto;
import com.datablau.data.quality.dto.DataQualityTechRulePageSearchDto;
import com.datablau.data.quality.dto.DataQualityTechRuleProcessQueryDto;
import com.datablau.data.quality.dto.DataQualityTechRuleReport;
import com.datablau.data.quality.dto.TechRuleInfoDto;
import com.datablau.data.quality.jpa.entity.DataQualityBusinessRule;
import com.datablau.data.quality.jpa.entity.DataQualityDispatch;
import com.datablau.data.quality.jpa.entity.DataQualitySolution;
import com.datablau.data.quality.jpa.entity.DataQualityTask;
import com.datablau.data.quality.jpa.entity.DataQualityTaskHistory;
import com.datablau.data.quality.jpa.entity.DataQualityTechRule;
import com.datablau.data.quality.jpa.entity.KnowledgeDoc;
import com.datablau.data.quality.metadata.service.DataQualityDao;
import com.datablau.data.quality.metadata.service.DataQualityTaskService;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.metadata.common.dto.metadata.DataObjectDto;
import com.datablau.security.management.dto.UserDto;
import com.datablau.security.management.dto.UserQueryDto;
import com.datablau.security.management.utils.AuthTools;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import javax.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
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

/**
 * @author Nicky
 * @since 1.0
 */
@RestController
@RequestMapping("/quality")
@Feature(LicenseInfo.FE_QUALITY)
@Tag(name = "数据质量REST API")
public class DataQualityController extends BaseController {
    private static final Logger LOGGER = LoggerFactory.getLogger(DataQualityController.class);

    @Autowired
    private DataQualityDao dataQualityDao;

    @Autowired
    private MessageService msgService;

    @Autowired
    private FileService fileService;

    @Autowired
    private DataQualityTaskService taskService;
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

    @Operation(summary = "获取所有数据质量业务规则")
    @GetMapping(value = "/rules/bu")
    public List<DataQualityBusinessRule> getQualityBusinessRules() throws Exception {
        return dataQualityDao.getAllBusinessRules();
    }

    @Operation(summary = "获取某个业务规则详情")
    @Parameters({@Parameter(name = "ruleId", description = "业务规则id")})
    @GetMapping(value = "/rule/bu/getRuleById")
    public DataQualityBusinessRule getQualityBusinessRuleById(@RequestParam(value = "ruleId", required = false) Long ruleId) throws Exception {
        return dataQualityDao.getBusinessRuleById(ruleId);
    }

    @Operation(summary = "获取所有数据质量业务规则报告")
    @GetMapping(value = "/rules/bu/report")
    public List<DataQualityBusinessRuleReport> getQualityBusinessRulesReport() throws Exception {
        return dataQualityDao.getAllBusinessRulesReport();
    }

    /**
     * 分页查询业务规则
     */
    @Operation(summary = "分页查询业务规则")
    @RequestMapping(value = "/rules/bu/report/page", method = RequestMethod.POST)
    public PageResult<DataQualityBusinessRuleReport> getQualityBusinessRulesReportPage(
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
    public PageResult<DataQualityBusinessRuleReport> getQualityBusinessRulesReportPageForTechRule(
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
        return dataQualityDao.getTechRuleDetailWithoutKnowledge(ruleId);
    }

    @Operation(summary = "获取技术规则")
    @Parameters({@Parameter(name = "ruleId", description = "规则id", in = ParameterIn.PATH)})
    @RequestMapping(value = "/rule/tech/{ruleId}/knowledge")
    public List<KnowledgeDoc> getQualityTechRuleRelatedKnowledge(@PathVariable("ruleId") Long ruleId) throws Exception {
        return dataQualityDao.getTechRuleDetailWithoutKnowledge(ruleId).getKnowledgeDocs();
    }

    @Operation(summary = "获取业务规则目录")
    @GetMapping(value = "/rules/bu/catalog")
    public List<String> getQualityBusinessRulesCatalog() throws Exception {
        return dataQualityDao.getAllBuQualityRuleCatalog();
    }

    @Operation(summary = "获取技术规则目录")
    @GetMapping(value = "/rules/tech/catalog")
    public List<String> getQualityTechRulesCatalog() throws Exception {
        return dataQualityDao.getAllTechQualityRuleCatalog();
    }

    @Operation(summary = "获取技术规则报告")
    @Parameters({@Parameter(name = "modelCategoryId", description = "模型目录id", in = ParameterIn.PATH)})
    @GetMapping(value = "/rules/tech/report/{modelCategoryId}")
    public List<DataQualityTechRuleReport> getQualityTechRulesReportByModelCategoryId(@PathVariable("modelCategoryId") int modelCategoryId) throws Exception {
        return dataQualityDao.getTechRulesReportByModelCategoryId((long)modelCategoryId);
    }

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
    @OperatorLog(
            operation = OperationLogType.TABLE_ADD,
            operateTable = "db_quality_business_rule",
            systemModule = OperationModuleType.QUALITY_BUSINESS_RULE,
            description = "新增业务规则,规则名为: {params}",
            descriptionParamClass = DataQualityBusinessRule.class,
            descriptionParamMethod = "getName"
    )
    //@PreAuthorize(UserRights.QUALITY_BUSINESS_RULE_VIEW_ADD)
    @PostMapping(value = "/rules/bu")
    public void createQualityBusinessRules(@RequestBody List<DataQualityBusinessRule> rules) throws Exception {
        for (DataQualityBusinessRule rule : rules) {
            dataQualityDao.createBusinessRule(rule);
        }
    }

    @Operation(summary = "新增技术规则")
    @OperatorLog(
            operation = OperationLogType.TABLE_ADD,
            operateTable = "db_quality_tech_rule",
            systemModule = OperationModuleType.RULE_TECH,
            description = "新增技术规则,规则名为: {params}",
            descriptionParamClass = DataQualityTechRuleDto.class,
            descriptionParamMethod = "getName"
    )
    //@PreAuthorize(UserRights.QUALITY_TECHNICAL_REGULATION_ADD)
    @PostMapping(value = "/rules/tech")
    public Long createQualityTechRules(@RequestBody List<DataQualityTechRuleDto> rules) throws Exception {
        DataQualityTechRule techRule = null;
        for (DataQualityTechRuleDto rule : rules) {
            techRule = dataQualityDao.createTechRule(rule);
        }
        return techRule.getId();
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
    @OperatorLog(
            operation = OperationLogType.TABLE_DELETE,
            operateTable = "db_quality_business_rule",
            systemModule = OperationModuleType.QUALITY_BUSINESS_RULE,
            description = "删除业务规则,ID为: {params}",
            descriptionParamClass = Long.class,
            descriptionParamMethod = "toString"
    )
    @Transactional
    //@PreAuthorize(UserRights.QUALITY_BUSINESS_RULE_VIEW_DELETE)
    @PostMapping(value = "/rules/bu/delete")
    public void deleteQualityBusinessRules(@RequestBody List<Long> rules) throws Exception {
        for (long ruleId : rules) {
            dataQualityDao.deleteBusinessRule(ruleId);
        }
    }

    @Operation(summary = "删除技术规则")
    @OperatorLog(
            operation = OperationLogType.TABLE_DELETE,
            operateTable = "dam_quality_tech_rule",
            systemModule = OperationModuleType.RULE_TECH,
            description = "删除技术规则,ID为: {params}",
            descriptionParamClass = Long.class,
            descriptionParamMethod = "toString"
    )
    @Transactional
    //@PreAuthorize(UserRights.QUALITY_TECHNICAL_REGULATION_DELETE)
    @PostMapping(value = "/rules/tech/delete")
    public void deleteQualityTechRules(@RequestBody List<Long>rules) throws Exception {
        for (long ruleId : rules) {
            dataQualityDao.deleteTechRule(ruleId);
        }
    }

    @Operation(summary = "导出业务规则")
    @Parameters({@Parameter(name = "all", description = "是否全部 默认true", in = ParameterIn.QUERY)
            ,@Parameter(name = "isTemplate", description = "是否模板 默认false", in = ParameterIn.QUERY)})
    @OperatorLog(
            operation = OperationLogType.DATA_EXPORT,
            operateTable = "db_quality_business_rule",
            systemModule = OperationModuleType.QUALITY_BUSINESS_RULE,
            description = "导出业务规则"
    )
    //@PreAuthorize(UserRights.QUALITY_BUSINESS_RULE_VIEW_EXPORT)
    @GetMapping(value = "/rules/bu/file")
    public ResponseEntity<Resource> exportBuQualityRules(@RequestParam(defaultValue = "true") Boolean all,
                                                         @RequestParam(defaultValue = "false") boolean isTemplate) throws Exception {
        String username = AuthTools.currentUsernameFailFast();
        ByteArrayOutputStream bos = null;
        try {
            Workbook wb = dataQualityDao.exportBuQualiatyRules(all, username, isTemplate);
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
                headers.add("Content-Disposition", "attachment;filename=\"QualityRules.xlsx\"");
            }

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

    @Operation(summary = "导入业务规则")
    @Parameters({@Parameter(name = "file", description = "文件", in = ParameterIn.QUERY)})
    @OperatorLog(
            operation = OperationLogType.DATA_IMPORT,
            operateTable = "db_quality_business_rule",
            systemModule = OperationModuleType.QUALITY_BUSINESS_RULE,
            description = "导入业务规则"
    )
    //@PreAuthorize(UserRights.QUALITY_BUSINESS_RULE_VIEW_IMPORT)
    @PostMapping(value = "/rules/bu/file")
    public List<String> uploadBuQualityRulesExcel(@RequestParam("file") MultipartFile multipartFile)
            throws Exception {
        File uploadedFile = ShareKit.uploadFile(multipartFile);
        try {
            return dataQualityDao.loadBuQualityRulesFromFile(uploadedFile);
        } catch (Exception e) {
          throw new AndorjRuntimeException(e.getMessage());
        } finally {
            uploadedFile.delete();
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
    @OperatorLog(
            operation = OperationLogType.DATA_EXPORT,
            operateTable = "dam_quality_business_rule",
            systemModule = OperationModuleType.RULE_TECH,
            description = "导出技术规则"
    )
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
    @OperatorLog(
            operation = OperationLogType.TABLE_MODIFY,
            operateTable = "db_quality_business_rule",
            systemModule = OperationModuleType.QUALITY_BUSINESS_RULE,
            description = "修改业务规则, 改名为: {param}",
            descriptionParamClass = DataQualityBusinessRule.class,
            descriptionParamMethod = "getName"
    )
    //@PreAuthorize(UserRights.QUALITY_BUSINESS_RULE_VIEW_EDIT)
    @PutMapping(value = "/rule/bu/{ruleId}")
    public DataQualityBusinessRule updateQualityBuRule(@PathVariable("ruleId") int ruleId,
        @RequestBody DataQualityBusinessRule rule) throws Exception {
        DataQualityBusinessRule saved = dataQualityDao.updateBusinessRule((long) ruleId, rule);
        if (saved == null) {
            throw new ItemNotFoundException("No rule with id" + ruleId);
        }

        return saved;
    }

    @Operation(summary = "修改技术规则")
    @Parameters({@Parameter(name = "ruleId", description = "规则id", in = ParameterIn.PATH)})
    @OperatorLog(
            operation = OperationLogType.TABLE_MODIFY,
            operateTable = "db_quality_tech_rule",
            systemModule = OperationModuleType.RULE_TECH,
            description = "修改技术规则,修改名称为: {param}",
            descriptionParamClass = DataQualityTechRule.class,
            descriptionParamMethod = "getName"
    )
    //@PreAuthorize(UserRights.QUALITY_TECHNICAL_REGULATION_EDIT)
    @PutMapping(value = "/rule/tech/{ruleId}")
    public void updateQualityTechRule(@PathVariable("ruleId") int ruleId,
                                      @RequestBody DataQualityTechRule rule) throws Exception {
        dataQualityDao.updateTechRule((long) ruleId, rule, true);
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
        DataQualityTask task = taskService.reassignTask(taskId, assignee);
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
                                              @RequestParam("pageSize") int pageSize) {
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
                                    @RequestParam(value = "defaultUser", required = false) String defaultUser) {
        return taskService.dispatchRowToOrg(taskId, pks, orgColumn, defaultUser);
    }

    @Operation(summary = "按照用户ID来分配问题明细")
    @Parameters({@Parameter(name = "taskId", description = "问题id", in = ParameterIn.PATH),
            @Parameter(name = "colname", description = "列", in = ParameterIn.QUERY),
            @Parameter(name = "defaultUser", description = "默认分配用户", in = ParameterIn.QUERY)})
    @PutMapping(value = "/rules/tasks/{taskId}/dispatch-user")
    public int dispatchTaskProblemsByUserCol(@PathVariable("taskId")Long taskId,
                                             @RequestBody(required = false) List<String> pks,
                                             @RequestParam("colname") String orgColumn,
                                             @RequestParam(value = "defaultUser", required = false) String defaultUser) {
        return taskService.dispatchRowToUserByUserCol(taskId, pks, orgColumn, defaultUser);
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
                                            @RequestParam(value = "defaultUser", required = false) String defaultUser) {
        return taskService.dispatchRowToUserByCustom(taskId, pks, orgColumn, dispatchId, defaultUser);
    }

    //TODO: 更新失败
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


    //TODO: 更新失败
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

//    private ShallowObjectDto convertTo(DataObject entity) {
//        ShallowObjectDto object = new ShallowObjectDto();
//        object.setLogicalName(entity.getLogicalName());
//        object.setPhysicalName(entity.getPhysicalName());
//        object.setObjectId(entity.getObjectId());
//        object.setTypeId(entity.getTypeId());
//
//        return object;
//    }

    // TODO 7.0 对接任务微服务
//    @Operation(summary = "获取数据质量任务")
//    @RequestMapping(value = "/jobs", method = RequestMethod.GET)
//    public List<DatablauJobStatusDto> getDataQualityJobs() throws Exception {
//        return jobService.getDataQualityJobDetails();
//    }
//
//    @Operation(summary = "获取数据质量任务")
//    @RequestMapping(value = "/jobs", method = RequestMethod.POST)
//    public PageResult<DatablauJobStatusDto> getDataQualityJobsListChangeTuAcct(
//            @RequestBody DataQualityJobQueryDto dto) throws Exception {
//        return jobService.getDataQualityJobDetails(dto);
//    }
//
//    @Operation(summary = "新增检查任务")
//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "dam_common_job",
//            systemModule = OperationModuleType.QUALITY_CHECK_TASK,
//            description = {"新增检查任务,任务名为:","1","name"}
//    )
//    //@PreAuthorize(UserRights.CHENCK_TASK_ADD)
//    @PostMapping(value = "/job")
//    public Long createQualityJob(@RequestBody DataQualityJobDescriptor descriptor) throws Exception {
//        return taskService.createQualityJob(descriptor);
//    }


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

    //TODO 7.0 对接任务
    @Operation(summary = "修改检查任务")
    @Parameters({@Parameter(name = "jobId", description = "任务id", in = ParameterIn.PATH)})
    @OperatorLog(
            operation = OperationLogType.TABLE_MODIFY,
            operateTable = "db_common_job",
            systemModule = OperationModuleType.QUALITY_CHECK_TASK,
            description = "修改检查任务,任务名为: {param}",
            descriptionParamClass = DatablauJobDescriptor.class,
            descriptionParamMethod = "getName"
    )
    @PutMapping(value = "/job/{jobId}")
    public DatablauJobDescriptor updateQualityJob(@PathVariable("jobId") Long jobId,
                                           @RequestBody DatablauJobDescriptor descriptor) throws Exception {
        return taskService.updateQualityJob(descriptor, jobId);
    }
//
//    @Operation(summary = "删除检查任务")
//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "dam_common_job",
//            systemModule = OperationModuleType.QUALITY_CHECK_TASK,
//            description = "删除检查任务,ID为: {param}",
//            descriptionParamClass = Long.class,
//            descriptionParamMethod = "toString"
//    )
//    //@PreAuthorize(UserRights.CHENCK_TASK_DELETE)
//    @DeleteMapping(value = "/job/{jobId}")
//    public void deleteQualityJob(@PathVariable("jobId") Long jobId) throws Exception {
//        taskService.deleteQualityJob(jobId);
//    }
//
//    @Operation(summary = "检查任务状态")
//    @RequestMapping("/jobs/status")
//    public List<JobInstanceStatusDto> getAllQualityJobInstances() {
//        return jobService.getRunningDataQualityJobStatus();
//    }
//
//    @Operation(summary = "获取任务结果")
//    @Parameters({@Parameter(name = "taskId", description = "任务id", in = ParameterIn.PATH)})
//    @GetMapping(value = "/rule/task/{taskId}/result")
//    public String getDataQualityRuleZResultByTaskId(@PathVariable("taskId") int taskId)
//        throws Exception {
//        return jobService.getRuleResultByTaskId((long) taskId);
//    }
//
//
//    @Operation(summary = "获取最后一次任务的结果")
//    @GetMapping(value = "/report/jobresult/latest")
//    public CommonJobResult getLatestQualityJobResult() throws Exception {
//        List<CommonJob> jobs = jobService.getDataQualityJobs();
//
//        CommonJobResult latest = null;
//        for (CommonJob job : jobs) {
//            CommonJobResult result = jobService.getLatestFinishedJobResult(job.getJobId());
//            if (result != null) {
//                if (latest == null || result.getEndTime().after(latest.getEndTime())) {
//                    latest = result;
//                }
//            }
//        }
//
//        return latest;
//    }
//    //@PreAuthorize(UserRights.HAS_QUALITY_JOB_VIEWER)
//    @Operation(summary = "获取数据质量规则任务历史结果")
//    @Parameters({@Parameter(name = "jobId", description = "任务id", in = ParameterIn.PATH),
//        @Parameter(name = "historyId", description = "历史id", in = ParameterIn.PATH),
//        @Parameter(name = "ruleId", description = "规则id", in = ParameterIn.PATH)})
//    @GetMapping(value = "/job/{jobId}/history/{historyId}/result/{ruleId}")
//    public String getDataQualityHistoryRuletResultByRuleId(@PathVariable("jobId") Long jobId,
//        @PathVariable("historyId") Long historyId,
//        @PathVariable("ruleId") Long ruleId)
//        throws Exception {
//        return jobService.getHistoryRuleResult(jobId, historyId, ruleId);
//    }


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
                if(!AuthTools.hasAnyRole("QUALITY_PROBLEM_MONITORING_VIEW_MY", "ROLE_SUPERUSER")) {
                    throw new AccessDeniedException("Access is denied");
                }
            } else {
                //是否有查看所有人的权限
                if(!AuthTools.hasAnyRole("QUALITY_PROBLEM_MONITORING_VIEW_ALL", "ROLE_SUPERUSER")) {
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
            systemModule = OperationModuleType.QUALITY_QUALITY,
            description = "新增问题清单名为: {param}",
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
    @OperatorLog(
            operation = OperationLogType.TABLE_DELETE,
            operateTable = "dam_quality_task",
            systemModule = OperationModuleType.QUALITY_QUALITY,
            description = "删除问题清单,ID为: {params}",
            descriptionParamClass = Long.class,
            descriptionParamMethod = "toString"
    )
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
    @OperatorLog(
            operation = OperationLogType.TABLE_MODIFY,
            operateTable = "db_quality_task",
            systemModule = OperationModuleType.QUALITY_QUALITY,
            description = "修改问题清单,名称为: {param}",
            descriptionParamClass = DataQualityTask.class,
            descriptionParamMethod = "getName"
    )
    @PutMapping(value = "/rule/task/{taskId}")
    public DataQualityTask updateQualityTask(@PathVariable("taskId") int taskId,
                                             @RequestBody DataQualityTask task) throws Exception {
        return dataQualityDao.updateTask((long) taskId, task);
    }

    @Operation(summary = "创建解决方案")
    @PostMapping(value = "/rules/solutions")
    public DataQualitySolution createSolution(@RequestBody DataQualitySolution solution) {
        return taskService.createSolution(solution);
    }

    @Operation(summary = "导出当前页质量规则到Excel文件")
    //@PreAuthorize(UserRights.QUALITY_TECHNICAL_REGULATION_EXPORT)
    @PostMapping("/rules/tech/export")
    public ResponseEntity<Resource> exportTechQualityRules(@RequestBody List<Long> ruleIds) throws Exception {
        ByteArrayOutputStream bos = null;
        try {
//            Workbook wb = dataQualityDao.exportTechQualityRules(ruleIds,null);
            Workbook wb = dataQualityDao.exportTechQualityRulesByTemplate(ruleIds,null);
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
            return ResponseEntity.ok().headers(headers).contentType(MediaType.parseMediaType("application/octet-stream")).body(resource);
        } finally {
            if (null != bos) {
                bos.close();
            }
        }

    }

    @Operation(summary = "导出质量规则模板文件")
    @GetMapping("/rules/tech/export/template")
    public ResponseEntity<Resource> exportTechQualityRulesTemplate() throws Exception {
        ByteArrayOutputStream bos = null;
        try {
            FileInputStream inputStream = new FileInputStream(ShareKit.getResourcePath("/dataquality/techrule.xlsx"));
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
    public ResponseEntity<Resource> exportTechQualityRulesByQuery(@RequestBody DataQualityTechRulePageSearchDto reqDto) throws Exception {
        ByteArrayOutputStream bos = null;
        try {

            if(!AuthTools.hasAnyRole("QUALITY_TECHNICAL_REGULATION_VIEW_ALL", "ROLE_SUPERUSER")) {
                if(AuthTools.hasAnyRole("QUALITY_TECHNICAL_REGULATION_VIEW_MY", "ROLE_SUPERUSER")) {
                    reqDto.setCreator(AuthTools.currentUsername());
                } else {
                    throw new AccessDeniedException("Access is denied");
                }
            }

//            Workbook wb = dataQualityDao.exportTechQualityRules(null,reqDto);
            Workbook wb = dataQualityDao.exportTechQualityRulesByTemplate(null, reqDto);
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
            return ResponseEntity.ok().headers(headers).contentType(MediaType.parseMediaType("application/octet-stream")).body(resource);
        } finally {
            if (null != bos) {
                bos.close();
            }
        }

    }

    @Operation(summary = "获取技术规则详情，多id")
    @PostMapping(value = "/rule/tech/multi")
    public List<DataQualityTechRuleReport> getQualityTechRuleDetail(@RequestBody List<Long> ruleIds) throws Exception {
        return dataQualityDao.getTechRuleDetailsWithoutKnowledge(ruleIds);
    }

    @Operation(summary = "从Excel文件导入质量规则")
    @Parameters({
            @Parameter(name = "file", description = "文件", in = ParameterIn.QUERY),
            @Parameter(name = "publish", description = "是否发布", in = ParameterIn.QUERY)})
    @PostMapping("/rules/tech/import")
    public void uploadTechQualityRulesExcelNew(@RequestParam("file") MultipartFile multipartFile,
                                               @RequestParam(value = "publish", defaultValue = "true") Boolean publish) throws Exception {
        File uploadedFile = ShareKit.uploadFile(multipartFile);
        try {
            dataQualityDao.loadTechQualityRulesFromFile(uploadedFile, publish);
        } finally {
            boolean b = uploadedFile.delete();
        }
    }

    @Operation(summary = "搜索任务详情")
    @Parameters({@Parameter(name = "ruleId", description = "规则id", in = ParameterIn.QUERY),
            @Parameter(name = "jobResultId", description = "任务结果id", in = ParameterIn.QUERY)})
    @GetMapping(value = "/rule/tasks/detail")
    public List<DataQualityTaskNative> searchTasksDetail(@RequestParam("ruleId") Long ruleId,
                                                   @RequestParam("jobResultId") Long jobResultId) throws Exception {

        return dataQualityDao.getTaskByJobResultId(ruleId, jobResultId);
    }

    //TODO: 7.0 job
//    @Operation(summary = "导出数据质量任务运行结果")
//    @Parameters({@Parameter(name = "jobResultId", description = "任务结果id", in = ParameterIn.QUERY)})
//    @GetMapping(value = "/rule/result/export")
//    public ResponseEntity<byte[]> exportQualityJobResult(@RequestParam("jobResultId") Long jobResultId) throws Exception {
//        return taskService.exportQualityJobResult(jobResultId);
//    }

    //    //@PreAuthorize(UserRights.QUALITY_ISSUE_DATA_EXPORT)
    @Operation(summary = "导出所有问题")
    @PostMapping(value = "/rule/task/export")
    public ResponseEntity<byte[]> exportQualityTask(@RequestBody QualityTaskSearchCriteriaDto searchCriteria) throws Exception {

        return taskService.exportQualityTask(searchCriteria);
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
    @Operation(summary = "创建自定义分配方案")
    @PostMapping(value = "/dispatch/createOrUpdateDispatch")
    public void createOrUpdateDispatch(@RequestBody DataQualityDispatchDto dispatchDto) {
        taskService.createOrUpdateQualityDispatch(dispatchDto);
    }

    /**
     * 删除自定义分配方案
     */
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
     * 查询审批副本
     * @throws Exception e
     */
    @PostMapping(value = "/rule/tech/getCopyDetail")
    public DataQualityTechRule findTechRuleCopyDetail(@RequestParam(value = "techRuleCopyId") Long techRuleCopyId) throws Exception {
        return dataQualityDao.getTechRuleCopy(techRuleCopyId);
    }

    /**
     * 修改审批副本
     * @throws Exception e
     */
    @PostMapping(value = "/rule/tech/updateCopy")
    public void updateProcessDetail(@RequestBody DataQualityTechRule techRule) throws Exception {
        dataQualityDao.updateTechRuleCopy(techRule);
    }

    /**
     * 删除审批副本
     * @throws Exception e
     */
    @PostMapping(value = "/rule/tech/deleteCopy")
    public void deleteProcessDetail(@RequestBody List<Long> techRuleIds) throws Exception {
        dataQualityDao.deleteTechRuleCopy(techRuleIds);
    }

    /**
     * 校验技术规则任务
     * @param ruleId
     */
    @RequestMapping(value = "/rule/tech/{ruleId}/check")
    public void checkQualityTechRule(@PathVariable("ruleId") Long ruleId) {
        DataQualityTechRule techRule = dataQualityDao.getTechRuleDetail(ruleId);
        dataQualityDao.checkTechRuleAuth(techRule.getBuRuleId());
    }

    //TODO 7.0 任务
//    /**
//     * 获取所有关联任务
//     * @param ruleIds
//     * @return
//     */
//    @RequestMapping(value = "/rule/tech/getRelationJobs")
//    public List<TechRuleRelationJobDto> getTechRuleRelationJobs(@RequestBody List<Long> ruleIds) {
//        return dataQualityDao.getTechRuleRelationJobs(ruleIds);
//    }

    /**
     * 一键解绑任务
     * @param ruleIds
     * @throws Exception
     */
    //TODO 7.0 任务
//    @RequestMapping(value = "/rule/tech/unbindRelationJobs")
//    public void unbindRelationJobs(@RequestBody List<Long> ruleIds) throws Exception {
//        dataQualityDao.unbindTechRuleRelationJobs(ruleIds);
//    }

    /**
     * 根据id获取问题清单
     */
    @Operation(summary = "根据id获取问题清单")
    @Parameters({@Parameter(name = "taskId", description = "规则id")})
    @PostMapping(value = "/getTaskById")
    public DataQualityTask getDataQualityTaskById(@RequestParam("taskId") Long taskId) {
        return taskService.getDataQualityTaskById(taskId);
    }
}
