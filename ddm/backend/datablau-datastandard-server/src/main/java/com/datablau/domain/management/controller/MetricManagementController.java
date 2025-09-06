package com.datablau.domain.management.controller;

import com.andorj.model.common.api.MessageService;
import com.datablau.domain.management.api.DomainService;
import com.datablau.domain.management.api.metric.MetricAuthService;
import com.datablau.domain.management.api.metric.MetricManagementService;
import com.datablau.domain.management.api.metric.QueryThemeService;
import com.datablau.domain.management.data.CronType;
import com.datablau.domain.management.data.formula.BaseMetricFormula;
import com.datablau.domain.management.dto.*;
import com.datablau.domain.management.dto.common.DataQueryDto;
import com.datablau.domain.management.dto.metric.MetricAuthApplyDto;
import com.datablau.domain.management.jpa.entity.metric.MetricDimensionValue;
import com.datablau.domain.management.jpa.entity.metric.MetricMapping;
import com.datablau.domain.management.jpa.entity.metric.MetricWarning;
import com.datablau.domain.management.utility.DataUtility;
import com.datablau.security.management.utils.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.sql.Timestamp;
import java.util.*;

/**
 * @author zhangKun - 数语科技有限公司
 * date 2022/02/14 14:28
 */
@RestController
@RequestMapping("/metricManagement")
@Tag(name = "指标管理")
public class MetricManagementController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(DomainController.class);
    @Autowired
    private MessageService msgService;

    private final MetricManagementService metricManagementService;

    @Autowired
    private MetricAuthService metricAuthService;
    @Autowired
    private QueryThemeService queryThemeService;

    @Autowired
    private DomainService domainService;


    public MetricManagementController(
            MetricManagementService metricManagementService) {
        this.metricManagementService = metricManagementService;
    }

    @Operation(summary = "获取指标预警调度周期")
    @RequestMapping(value = "/metricWarning/getSchedule", method = RequestMethod.POST)
    public CronType getMetricWaningSchedule(
            @Parameter(description = "指标id") @RequestParam("metricId") String metricId) {
        return metricManagementService.getMetricWaningSchedule(metricId);
    }

    @Operation(summary = "指标预警设置列表")
    @RequestMapping(value = "/metricWarning/list", method = RequestMethod.POST)
    public List<MetricWarning> getMetricWaningList(
            @Parameter(description = "指标id") @RequestParam("metricId") String metricId,
            @Parameter(description = "指标监控结果创建时间（非必填），分析与监控页面会用到")
            @RequestParam(name = "time", required = false) Date time) {
        return metricManagementService.getMetricWarningList(metricId, time);
    }

    @Operation(summary = "新增指标预警")
    @RequestMapping(value = "/metricWarning/add", method = RequestMethod.POST)
    public void createMetricWarning(@RequestBody MetricWarning metricWarning) {
        metricManagementService.addMetricWarning(metricWarning);
    }

    @Operation(summary = "获取指标预警")
    @RequestMapping(value = "/metricWarning/get", method = RequestMethod.POST)
    public MetricWarning getMetricWarning(@RequestParam("metricWarningId") Long metricWarningId) {
        return metricManagementService.getMetricWarning(metricWarningId);
    }

    @Operation(summary = "删除指标预警")
    @RequestMapping(value = "/metricWarning/delete", method = RequestMethod.POST)
    public void deleteMetricWarning(@RequestParam("metricWarningId") Long metricWarningId) {
        metricManagementService.deleteMetricWarning(metricWarningId);
    }

    @Operation(summary = "更新指标预警")
    @RequestMapping(value = "/metricWarning/update", method = RequestMethod.POST)
    public void updateMetricWarning(@RequestBody MetricWarning metricWarning) {
        metricManagementService.updateMetricWarning(metricWarning);
    }

    @Operation(summary = "更新监控周期")
    @RequestMapping(value = "/metricWarning/updateSchedule", method = RequestMethod.POST)
    public void updateSchedule(@RequestParam("metricId") String metricId,
                               @RequestParam("schedule") CronType schedule) {
        metricManagementService.updateWarningSchedule(metricId, schedule);
    }

    @Operation(summary = "分析与监控", description = "[\n"
            + "  {\n"
            + "    \"WARNING\": 12,\n"
            + "    \"createTime\": 1646214445000\n"
            + "  },\n"
            + "  {\n"
            + "    \"SERIOUS_WARNING\": 12,\n"
            + "    \"createTime\": 1646214526000\n"
            + "  },\n"
            + "  {\n"
            + "    \"WARNING\": 12,\n"
            + "    \"createTime\": 1646214528000\n"
            + "  },\n"
            + "  {\n"
            + "    \"WARNING\": 12,\n"
            + "    \"createTime\": 1646214530000\n"
            + "  },\n"
            + "  {\n"
            + "    \"WARNING\": 12,\n"
            + "    \"createTime\": 1646214532000\n"
            + "  },\n"
            + "  {\n"
            + "    \"WARNING\": 12,\n"
            + "    \"createTime\": 1646214536000\n"
            + "  },\n"
            + "  {\n"
            + "    \"WARNING\": 12,\n"
            + "    \"SERIOUS_WARNING\": 12,\n"
            + "    \"createTime\": 1646214538000\n"
            + "  },\n"
            + "  {\n"
            + "    \"WARNING\": 12,\n"
            + "    \"createTime\": 1646214527000\n"
            + "  },\n"
            + "  {\n"
            + "    \"WARNING\": 12,\n"
            + "    \"createTime\": 1646214529000\n"
            + "  },\n"
            + "  {\n"
            + "    \"WARNING\": 24,\n"
            + "    \"createTime\": 1646214531000\n"
            + "  },\n"
            + "  {\n"
            + "    \"WARNING\": 12,\n"
            + "    \"createTime\": 1646214533000\n"
            + "  },\n"
            + "  {\n"
            + "    \"SERIOUS_WARNING\": 12,\n"
            + "    \"createTime\": 1646214535000\n"
            + "  }\n"
            + "]")
    @RequestMapping(value = "/metricWarning/result", method = RequestMethod.POST)
    public List<Map> getMetricWarningResult(@RequestParam("metricId") String metricId) {
        return metricManagementService.getMetricWarningResult(metricId);
    }

    @Operation(summary = "指标分析与监控详情")
    @RequestMapping(value = "/metricWarning/result/details", method = RequestMethod.POST)
    public List<MetricWarningResultDto> getMetricWarningResultDetails(
            @RequestParam("metricId") String metricId,
            @Parameter(description = "指标预警结果时间") @RequestParam(name = "time") Long time) {
        Timestamp timestamp = new Timestamp(time);
        Date date = new Date(timestamp.getTime());
        return metricManagementService.getMetricWarningResultDetails(metricId, date);
    }


    @Operation(summary = "查看指标-是否拥有权限")
    @RequestMapping(value = "/metricAuth/getPermission", method = RequestMethod.POST)
    public Set<String> getMetricAuthPermission(@Parameter(description = "指标Id") @RequestParam("metricId") String metricId) {
        String currentUser = getCurrentUser();
        Set<String> permission = new HashSet<>();
        permission.add("查看指标基础信息");
        permission.add("指标管理");
        permission.add("指标预览");
        permission.add("指标授权");
        permission.add("指标预警");
        // 创建人/平台管理员 直接返回所有权限
        if (AuthTools.hasAnyRole(AuthTools.ROLE_SUPERUSER)) {
            return permission;
        }
        DomainDto domainByDomainId = domainService.getDomainByDomainId(metricId);
        if (domainByDomainId.getSubmitter().equals(currentUser)) {
            return permission;
        }
        return metricAuthService.findByUserNameAndMetricId(currentUser, metricId);
    }

    @Operation(summary = "查看指标-编辑指标管理权限")
    @RequestMapping(value = "/metricAuth/updatePermission", method = RequestMethod.POST)
    public void updateMetricAuthPermission(@RequestBody List<MetricAuthDto> metricAuthDtos) {
        metricAuthService.updateUserManage(metricAuthDtos);
    }

    @Operation(summary = "查看指标-创建指标管理权限")
    @RequestMapping(value = "/metricAuth/createPermission", method = RequestMethod.POST)
    public void createMetricAuthPermission(@RequestBody List<MetricAuthDto> metricAuthDtos) {
        metricAuthService.createMetricAuth(metricAuthDtos, getCurrentUser());
    }

    @Operation(summary = "查看指标-获取指标授权列表")
    @RequestMapping(value = "/metricAuth/getPermissionsList", method = RequestMethod.POST)
    public List<MetricAuthDto> getMetricAuthPermissionLists(
            @Parameter(description = "metricId") @RequestParam("metricId") String metricId) {
        return metricAuthService.getMetricAuth(metricId);
    }

    @Operation(summary = "指标管理-权限列表-禁用")
    @RequestMapping(value = "/metricAuth/locked", method = RequestMethod.POST)
    public void lockedMetricAuth(@Parameter(description = "id") @RequestParam("id") Long id) {
        metricAuthService.lockedMetricAuth(id);
    }

    @Operation(summary = "指标管理-延期")
    @PostMapping(value = "/metricAuth/extendTime")
    public void extendTime(@RequestBody MetricAuthDto metricAuthDto) {
        metricAuthService.extendedtime(metricAuthDto);
    }

    @Operation(summary = "指标权限删除")
    @PostMapping(value = "/deleteMetricAuth")
    public void deleteMetricAuth(@RequestBody List<Long> ids) {
        metricAuthService.deleteMetricAuth(ids);
    }

    @Operation(summary = "新增映射")
    @RequestMapping(value = "/mapping/add", method = RequestMethod.POST)
    public void addMapping(@RequestBody MetricMapping metricMapping) {
        metricManagementService.addMetricMapping(metricMapping);
    }

    @Operation(summary = "更新映射")
    @RequestMapping(value = "/mapping/update", method = RequestMethod.POST)
    public void updateMapping(@RequestBody MetricMapping metricMapping) {
        metricManagementService.updateMetricMapping(metricMapping);
    }

    @Operation(summary = "批量删除映射")
    @RequestMapping(value = "/mapping/delete", method = RequestMethod.POST)
    public void deleteMapping(@RequestBody List<Long> metricMappingIds) {
        metricManagementService.deleteMetricMappings(metricMappingIds);
    }

    @Operation(summary = "根据指标id获取映射列表")
    @RequestMapping(value = "/mapping/list", method = RequestMethod.POST)
    public List<MetricMapping> getMappings(@RequestParam("metricId") String metricId) {
        return metricManagementService.getMetricMappings(metricId);
    }

    @Operation(summary = "根据指标id获取映射列表")
    @RequestMapping(value = "/mapping/details", method = RequestMethod.POST)
    public MappingDetails getMappingDetails(@RequestParam("metricId") String metricId) {
        return metricManagementService.getMetricMappingDetails(metricId);
    }


    @Operation(summary = "待我审批的指标")
    @RequestMapping(value = "/auth/apply/pending", method = RequestMethod.POST)
    public List<MetricAuthApplyDto> getAuthApplyOfPending() {
        return metricManagementService.getAuthApplyOfPending();
    }


    @Operation(summary = "设置衍生指标公式")
    @RequestMapping(value = "/updateFormula", method = RequestMethod.POST)
    public void updateFormula(@RequestBody BaseMetricFormula baseMetricFormula,
                              @RequestParam("metricId") String metricId) {
        metricManagementService.updateFormula(baseMetricFormula, metricId);
    }

    @Operation(summary = "需求相关的指标")
    @RequestMapping(value = "/getMetricsByRequirementId", method = RequestMethod.POST)
    public List<DomainDto> getMetricsByRequirementId(
            @RequestParam("requirementId") Long requirementId) {
        return metricManagementService.getMetricsByRequirementId(requirementId);
    }

    @Operation(summary = "数据预览")
    @RequestMapping(value = "/dataPreview", method = RequestMethod.POST)
    public DataQueryDto dataPreview(@RequestParam("metricId") String metricId,
                                    @RequestParam("currentPage") Integer currentPage,
                                    @RequestParam("pageSize") Integer pageSize) {
        return queryThemeService.dataPreview(metricId, currentPage, pageSize);
    }

    @Operation(summary = "根据指标和维度的映射获取关联的维度值")
    @RequestMapping(value = "/getMetricDimensionValues", method = RequestMethod.POST)
    public List<MetricDimensionValueDto> getMetricDimensionValues(
            @RequestParam("mappingId") Long mappingId) {
        return metricManagementService.getMetricDimensionValuesByMappingId(mappingId);
    }

    @Operation(summary = "添加纬度值关联")
    @RequestMapping(value = "/addMetricDimensionValues", method = RequestMethod.POST)
    public void addMetricDimensionValues(
            @RequestBody List<MetricDimensionValue> metricDimensionValueList) {
        metricManagementService.addMetricDimensionValue(metricDimensionValueList);
    }

    @Operation(summary = "删除关联维度值")
    @RequestMapping(value = "/deleteMetricDimensionValues", method = RequestMethod.POST)
    public void deleteMetricDimensionValues(@RequestBody List<Long> ids) {
        metricManagementService.deleteMetricDimensionValue(ids);
    }

    @Operation(summary = "下载指标导入模板")
    @RequestMapping(value = "/downloadMetricTemplate", method = RequestMethod.POST)
    public ResponseEntity<byte[]> downloadMetricTemplate(
            @Parameter(name = "categoryId", description = "类别")
            @RequestParam(value = "categoryId",defaultValue = "2") Long categoryId) throws Exception {
        return DataUtility.generalResponseEntityByFile(
                metricManagementService.downloadMetricTemplate(categoryId));
    }

    @Operation(summary = "导入指标")
    @RequestMapping(value = "/importMetric", method = RequestMethod.POST)
    public void importMetric(
            @Parameter(name = "file", description = "文件", required = true)
            @RequestParam("file") MultipartFile multipartFile,
            @Parameter(name = "categoryId", description = "类别", required = true)
            @RequestParam(value = "categoryId",defaultValue = "2") Long categoryId,
            @Parameter(name = "published", description = "是否导入已发布标准", required = true)
            @RequestParam(value = "published", defaultValue = "false") Boolean published) throws Exception {
        File uploadedFile = DataUtility.uploadFile(multipartFile);
        try {
            metricManagementService.importMetric(uploadedFile, published, getCurrentUser(), categoryId);
        } finally {
            uploadedFile.delete();
        }
    }

    @Operation(summary = "导出指标")
    @RequestMapping(value = "/exportMetric", method = RequestMethod.POST)
    public ResponseEntity<byte[]> exportMetric(@RequestBody DomainQueryDto queryDto)
            throws Exception {
        queryDto.setCurrentUser(getCurrentUser());
        return DataUtility.generalResponseEntityByFile(metricManagementService.exportMetric(queryDto));
    }

    @Operation(summary = "下载指标映射导入模板")
    @RequestMapping(value = "/downloadMetricMappingTemplate", method = RequestMethod.POST)
    public ResponseEntity<byte[]> downloadMetricMappingTemplate() {
        return DataUtility.generalResponseEntityByFile(
                metricManagementService.downloadMetricMappingTemplate());
    }

    @Operation(summary = "导入维度映射")
    @RequestMapping(value = "/importMetricMapping", method = RequestMethod.POST)
    public void importMetricMapping(
            @Parameter(name = "file", description = "文件", required = true)
            @RequestParam("file") MultipartFile multipartFile,
            @Parameter(name = "metricId", description = "指标id", required = true)
            @RequestParam(value = "metricId") String metricId) throws Exception {
        File uploadedFile = DataUtility.uploadFile(multipartFile);
        try {
            metricManagementService.importMetricMapping(uploadedFile, metricId);
        } finally {
            uploadedFile.delete();
        }
    }
}
