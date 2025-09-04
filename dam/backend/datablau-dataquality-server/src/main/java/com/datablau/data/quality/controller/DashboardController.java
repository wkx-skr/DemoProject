package com.datablau.data.quality.controller;

import com.datablau.data.common.controller.BaseController;
import com.datablau.data.quality.dashboard.data.DataQualityDashboardQueryDto;
import com.datablau.data.quality.dashboard.data.DataQualityDashboardResult;
import com.datablau.data.quality.dashboard.data.QualityDashboardRuleDto;
import com.datablau.data.quality.data.DashboardProblem;
import com.datablau.data.quality.data.DataQualityCategoryCountExcelDto;
import com.datablau.data.quality.data.DataQualityClassCountExcelDto;
import com.datablau.data.quality.data.DataQualityDashboardDto;
import com.datablau.data.quality.data.DataQualityDateCountExcelDto;
import com.datablau.data.quality.data.DataQualityTaskUserDto;
import com.datablau.data.quality.jpa.entity.DataQualityDashboardReport;
import com.datablau.data.quality.jpa.repository.DataQualityDashboardReportRepository;
import com.datablau.data.quality.jpa.repository.DataQualityTaskRepository;
import com.datablau.data.quality.service.DataQualityDashboardService;
import com.datablau.data.quality.util.QualityDashboardDateUtil;
import com.datablau.data.quality.utility.ServerConstants;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import org.apache.poi.ss.usermodel.Workbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @Author senyan
 * @Date
 */
@RestController
@RequestMapping("/dashboard")
public class DashboardController extends BaseController {
    private static final Logger LOGGER = LoggerFactory.getLogger(DashboardController.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Autowired
    private DataQualityDashboardReportRepository qualityDashboardReportRepo;

    @Autowired
    private DataQualityDashboardService dataQualityDashboardService;

    @Autowired
    private DataQualityTaskRepository dataQualityTaskRepo;

    public DashboardController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @RequestMapping("/quality/main")
    //@PreAuthorize(UserRights.QUALITY_COCKPIT_VIEW)
    public Map<String, Object> getQualityDashboardMainReport() throws Exception {
        DataQualityDashboardReport top = qualityDashboardReportRepo.findFirstByOrderByCreateOnDesc();
        Map<String, Object> result = dataQualityDashboardService.qualityHeadTabCount();
        result.put("userTop", "");
        if (top != null && top.getTaskTopUsers() != null) {
            result.put("userTop", MAPPER.readValue(top.getTaskTopUsers(), new TypeReference<List<DataQualityTaskUserDto>>() {
            }));
        }
        return result;
    }

    @PostMapping("/quality/problems")
    public List<DashboardProblem> getWorkbenchQuestion() {
        return dataQualityDashboardService.getWorkbenchQuestion();
    }

    @RequestMapping("/quality/rule")
    //@PreAuthorize(UserRights.QUALITY_COCKPIT_VIEW)
    public List<QualityDashboardRuleDto> getQualityDashboardImportantReport() throws Exception {
        return dataQualityDashboardService.getAllQualityDashboardRule();
    }

    @RequestMapping("/tech/rule/class/count")
    //@PreAuthorize(UserRights.QUALITY_PLANNING_REPORT_VIEW)
    public List<DataQualityClassCountExcelDto> countQualityClass(
            @RequestParam("start") @DateTimeFormat(pattern = "yyyy-MM-dd") Date start,
            @RequestParam("end") @DateTimeFormat(pattern = "yyyy-MM-dd") Date end) {

        return dataQualityDashboardService.countQualityClass(start, end);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "db_quality_tech_rule",
//            systemModule = OperationModuleType.QUALITY_RULE_REPORT,
//            description = "查询规则报告"
//    )
    @RequestMapping("/tech/rule/class/count/v2")
    //@PreAuthorize(UserRights.QUALITY_PLANNING_REPORT_VIEW)
    public List<DataQualityDashboardDto> countQualityClassV2(
            @RequestParam("start") @DateTimeFormat(pattern = "yyyy-MM-dd") Date start,
            @RequestParam("end") @DateTimeFormat(pattern = "yyyy-MM-dd") Date end) {

        return dataQualityDashboardService.countQualityClassV2(start, end);
    }

    @RequestMapping("/tech/rule/category/count")
    //@PreAuthorize(UserRights.QUALITY_PLANNING_REPORT_VIEW)
    public List<DataQualityCategoryCountExcelDto> countQualityCategory(
            @RequestParam("start") @DateTimeFormat(pattern = "yyyy-MM-dd") Date start,
            @RequestParam("end") @DateTimeFormat(pattern = "yyyy-MM-dd") Date end) {

        return dataQualityDashboardService.countQualityCategory(start, end);
    }

    @RequestMapping("/tech/rule/date/count")
    //@PreAuthorize(UserRights.QUALITY_PLANNING_REPORT_VIEW)
    public List<DataQualityDateCountExcelDto> countQualityDate(
            @RequestParam("start") @DateTimeFormat(pattern = "yyyy-MM-dd") Date start,
            @RequestParam("end") @DateTimeFormat(pattern = "yyyy-MM-dd") Date end) {

        return dataQualityDashboardService.countQualityDate(start, end);
    }

    @RequestMapping("/tech/task/class/count")
    //@PreAuthorize(UserRights.QUALITY_PROBLEM_REPORTING_VIEW)
    public List<DataQualityClassCountExcelDto> countQualityTaskClass(
            @RequestParam("start") @DateTimeFormat(pattern = "yyyy-MM-dd") Date start,
            @RequestParam("end") @DateTimeFormat(pattern = "yyyy-MM-dd") Date end) {

        return dataQualityDashboardService.countQualityTaskClass(start, end);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "db_quality_task",
//            systemModule = OperationModuleType.QUALITY_TASK_REPORT,
//            description = "查询问题报告"
//    )
    @RequestMapping("/tech/task/class/count/v2")
    //@PreAuthorize(UserRights.QUALITY_PROBLEM_REPORTING_VIEW)
    public List<DataQualityDashboardDto> countQualityTaskClassV2(
            @RequestParam("start") @DateTimeFormat(pattern = "yyyy-MM-dd") Date start,
            @RequestParam("end") @DateTimeFormat(pattern = "yyyy-MM-dd") Date end) {

        return dataQualityDashboardService.countQualityTaskClassV2(start, end);
    }

    @RequestMapping("/tech/task/category/count")
    //@PreAuthorize(UserRights.QUALITY_PROBLEM_REPORTING_VIEW)
    public List<DataQualityCategoryCountExcelDto> countQualityTaskCategory(
            @RequestParam("start") @DateTimeFormat(pattern = "yyyy-MM-dd") Date start,
            @RequestParam("end") @DateTimeFormat(pattern = "yyyy-MM-dd") Date end) {

        return dataQualityDashboardService.countQualityTaskCategory(start, end);
    }

    @RequestMapping("/tech/task/date/count")
    //@PreAuthorize(UserRights.QUALITY_PROBLEM_REPORTING_VIEW)
    public List<DataQualityDateCountExcelDto> countQualityTaskDate(
            @RequestParam("start") @DateTimeFormat(pattern = "yyyy-MM-dd") Date start,
            @RequestParam("end") @DateTimeFormat(pattern = "yyyy-MM-dd") Date end) {

        return dataQualityDashboardService.countQualityTaskDate(start, end);
    }

    @RequestMapping("/tech/rule/count/download")
    public ResponseEntity<byte[]> downloadCountQualityRule(
            @RequestParam("start") @DateTimeFormat(pattern = "yyyy-MM-dd") Date start,
            @RequestParam("end") @DateTimeFormat(pattern = "yyyy-MM-dd") Date end,
            @RequestParam(value = "type", defaultValue = "1") int type) throws Exception {
        if (type >= 4) {
            if (!AuthTools.hasAnyRole("PROBLEM_REPORTING_DOWLOAD", "ROLE_SUPERUSER")) {
                throw new AccessDeniedException("Access is denied");
            }
        } else {
            if (!AuthTools.hasAnyRole("QUALITY_PLANNING_REPORT_DOWNLOAD", "ROLE_SUPERUSER")) {
                throw new AccessDeniedException("Access is denied");
            }
        }
        return dataQualityDashboardService.downloadCountQualityRule(start, end, type);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "db_dashboard_tech",
//            systemModule = OperationModuleType.QUALITY_DASHBOARD,
//            description = "查询质量概览"
//    )
    @PostMapping("/quality/secondDashboard")
    @Operation(summary = "获取第二版数据质量统计dashboard")
    public DataQualityDashboardResult getDataQualityDashboard(@RequestBody DataQualityDashboardQueryDto queryDto) {
        return dataQualityDashboardService.getDataQualityDashboardResult(queryDto);
    }

    @PostMapping("/quality/secondDashboard/getCutDate")
    @Operation(summary = "获取第二版数据质量统计dashboard拍照日期")
    public String getDataQualityDashboardCutDate() {
        return QualityDashboardDateUtil.getDateFormat(QualityDashboardDateUtil.getCutDate());
    }

    @PostMapping("/quality/workbench/problem")
    public Map<String, Long> getWorkbenchInfo() {
        Map<String, Long> result = new HashMap<>();
        result.put("questNumCounts",
                dataQualityTaskRepo.findQuestionNumByOwner(AuthTools.currentUsernameFailFast()));
        return result;
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "db_quality_tech_rule",
//            systemModule = OperationModuleType.QUALITY_RULE_REPORT,
//            description = "导出规则报告"
//    )
    @Operation(summary = "下载规则报告-规则类型分析")
    //@PreAuthorize(UserRights.QUALITY_TECHNICAL_REGULATION_EXPORT)
    @PostMapping("/tech/rule/count/download/v2")
    public ResponseEntity<Resource> exportTechRuleReport(
            @RequestParam("start") @DateTimeFormat(pattern = "yyyy-MM-dd") Date start,
            @RequestParam("end") @DateTimeFormat(pattern = "yyyy-MM-dd") Date end) throws Exception {
        ByteArrayOutputStream bos = null;
        try {

            if (!AuthTools.hasAnyRole("QUALITY_PLANNING_REPORT_DOWNLOAD", "ROLE_SUPERUSER")) {
                throw new AccessDeniedException("Access is denied");
            }

            Workbook wb = dataQualityDashboardService.downloadCountQualityRuleV2(start, end);
            bos = new ByteArrayOutputStream();
            wb.write(bos);
            wb.close();
            HttpHeaders headers = new HttpHeaders();
            headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");
            headers.add("charset", "utf-8");
            headers.add("Content-Disposition", "attachment;filename=\"" + URLEncoder.encode("规则类型分析.xlsx", "UTF-8") + "\"");
            Resource resource = new InputStreamResource(new ByteArrayInputStream(bos.toByteArray()));
            return ResponseEntity.ok().headers(headers).contentType(MediaType.parseMediaType("application/octet-stream")).body(resource);
        } finally {
            if (null != bos) {
                bos.close();
            }
        }

    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "db_quality_task",
//            systemModule = OperationModuleType.QUALITY_TASK_REPORT,
//            description = "导出问题报告"
//    )
    @Operation(summary = "下载规则报告-规则类型分析")
    //@PreAuthorize(UserRights.QUALITY_TECHNICAL_REGULATION_EXPORT)
    @PostMapping("/tech/problem/count/download/v2")
    public ResponseEntity<Resource> exportProblemReport(
            @RequestParam("start") @DateTimeFormat(pattern = "yyyy-MM-dd") Date start,
            @RequestParam("end") @DateTimeFormat(pattern = "yyyy-MM-dd") Date end) throws Exception {
        ByteArrayOutputStream bos = null;
        try {

            if (!AuthTools.hasAnyRole("QUALITY_PLANNING_REPORT_DOWNLOAD", "ROLE_SUPERUSER")) {
                throw new AccessDeniedException("Access is denied");
            }

            Workbook wb = dataQualityDashboardService.downloadProblemReport(start, end);
            bos = new ByteArrayOutputStream();
            wb.write(bos);
            wb.close();
            HttpHeaders headers = new HttpHeaders();
            headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");
            headers.add("charset", "utf-8");
            headers.add("Content-Disposition", "attachment;filename=\"" + URLEncoder.encode("规则类型分析.xlsx", "UTF-8") + "\"");
            Resource resource = new InputStreamResource(new ByteArrayInputStream(bos.toByteArray()));
            return ResponseEntity.ok().headers(headers).contentType(MediaType.parseMediaType("application/octet-stream")).body(resource);
        } finally {
            if (null != bos) {
                bos.close();
            }
        }

    }
}
