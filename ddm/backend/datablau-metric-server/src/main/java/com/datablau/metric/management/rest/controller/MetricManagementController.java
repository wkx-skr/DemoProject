package com.datablau.metric.management.rest.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.core.exception.IllegalOperationException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.lineage.data.LineageContainer;
import com.andorj.model.common.api.MessageService;
import com.datablau.metadata.common.api.DatablauRemoteLineageService;
import com.datablau.metric.management.api.DomainInternalService;
import com.datablau.metric.management.api.DomainService;
import com.datablau.metric.management.api.metric.MetricAuthService;
import com.datablau.metric.management.api.metric.MetricManagementService;
import com.datablau.metric.management.api.metric.QueryThemeService;
import com.datablau.metric.management.data.CategoryType;
import com.datablau.metric.management.data.CronType;
import com.datablau.metric.management.data.formula.BaseMetricFormula;
import com.datablau.metric.management.dto.DomainDto;
import com.datablau.metric.management.dto.DomainFolderAccessListDto;
import com.datablau.metric.management.dto.DomainQueryDto;
import com.datablau.metric.management.dto.DomainTreeNodeDto;
import com.datablau.metric.management.dto.MappingDetails;
import com.datablau.metric.management.dto.MetricAuthDto;
import com.datablau.metric.management.dto.MetricDimensionValueDto;
import com.datablau.metric.management.dto.MetricMappingResultDto;
import com.datablau.metric.management.dto.MetricWarningResultDto;
import com.datablau.metric.management.dto.common.DataQueryDto;
import com.datablau.metric.management.dto.metric.DomainInfoDto;
import com.datablau.metric.management.dto.metric.MetricAuthApplyDto;
import com.datablau.metric.management.jpa.entity.DomainFolderAccessList;
import com.datablau.metric.management.jpa.entity.metric.MetricDimensionValue;
import com.datablau.metric.management.jpa.entity.metric.MetricMapping;
import com.datablau.metric.management.jpa.entity.metric.MetricWarning;
import com.datablau.metric.management.jpa.entity.metric.MetricWarningSetting;
import com.datablau.metric.management.jpa.entity.metric.WarningJob;
import com.datablau.metric.management.jpa.repository.DomainFolderAccessListRepository;
import com.datablau.metric.management.jpa.repository.metric.MetricWarningSettingRepository;
import com.datablau.metric.management.jpa.repository.metric.WarningJobRepository;
import com.datablau.metric.management.type.PermissionLevel;
import com.datablau.metric.management.type.PermissionType;
import com.datablau.metric.management.utility.DataUtility;
import com.datablau.metric.management.utility.QuartzUtils;
import com.datablau.security.management.api.OrganizationService;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.dto.OrganizationDto;
import com.datablau.security.management.dto.UserDto;
import com.datablau.security.management.utils.AuthTools;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.net.URLEncoder;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.elasticsearch.common.Strings;
import org.quartz.Scheduler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * @author zhangKun - 数语科技有限公司
 * date 2022/02/14 14:28
 */
@RestController
@RequestMapping("/metricManagement")
@Tag(name = "指标管理")
public class MetricManagementController extends BaseController {

    protected static final Logger logger = LoggerFactory.getLogger(
            MetricManagementController.class);

    @Autowired
    private MessageService msgService;

    private final MetricManagementService metricManagementService;

    @Autowired
    private MetricAuthService metricAuthService;
    @Autowired
    private QueryThemeService queryThemeService;

    @Autowired
    private DomainService domainService;

    @Autowired
    private DomainInternalService domainInternalService;

    @Autowired
    @Qualifier("userService")
    private UserService userService;

    @Autowired
    @Qualifier("organizationService")
    private OrganizationService organizationService;

    @Autowired
    private DomainFolderAccessListRepository domainFolderAccessListRepo;

    @Autowired
    private Scheduler scheduler;

    @Autowired
    private MetricWarningSettingRepository metricWarningSettingRepository;

    @Autowired
    private WarningJobRepository warningJobRepository;

    @Autowired
    private DatablauRemoteLineageService datablauRemoteLineageService;

    private LoadingCache<Long, List<DomainFolderAccessListDto>> domainFolderAccessListCache
            = CacheBuilder.newBuilder().expireAfterAccess(2, TimeUnit.MINUTES)
            .build(new CacheLoader<Long, List<DomainFolderAccessListDto>>() {
                @Override
                public List<DomainFolderAccessListDto> load(Long categoryId) throws Exception {
                    return convertTo(domainFolderAccessListRepo.findByCategoryIdEqualsOrderByIdDesc(categoryId));
                }
            });


    public MetricManagementController(
            MetricManagementService metricManagementService) {
        this.metricManagementService = metricManagementService;
    }

    /**
     * 创建一个数据标准
     *
     * @throws IllegalOperationException
     */
    @PostMapping("/domain/createDomain")
    @Operation(summary = "创建一个数据标准")
    public DomainDto createDomain(
            @RequestBody DomainDto domain,
            @Parameter(name = "published", description = "是否直接发布，当通过推荐标准创建的时候，此值需要是true", required = true)
            @RequestParam(name = "published", defaultValue = "false") Boolean published,
            HttpServletRequest request) {
        if (!AuthTools.hasAnyRole(AuthTools.ROLE_SUPERUSER)) {
            if (!hasPermissionToFolder(AuthTools.currentUsernameFailFast(),
                    domain.getFolderId(), PermissionLevel.WRITE)) {
                throw new IllegalOperationException(msgService.getMessage("notAllowedToEditFolder"));
            }
        }
        return domainService.addDomain(getCurrentUser(request), domain, published);
    }

    @Operation(summary = "指标预警定时任务")
    @GetMapping("/metricWarning/execute")
    public void executeMetricWarningJob() {
        WarningJob warningJob = new WarningJob();
        warningJob.setJobClass("com.datablau.metric.management.impl.metric.MetricWarningJobImpl");
        warningJob.setJobName("Metric_Warning_Job");
        warningJob.setCreateDate(new Date());
        warningJob.setStatus(2);
        WarningJob savedJob = warningJobRepository.save(warningJob);
        new Thread(() -> {
            try {
                savedJob.setStartDate(new Date());
                metricManagementService.executeMertricWarningOnce();
            }catch (Exception e) {
                savedJob.setEndDate(new Date());
                savedJob.setStatus(0);
                savedJob.setExecutionResult(e.getMessage());
                warningJobRepository.save(savedJob);
                logger.error("预警任务执行失败: " + e.getMessage());
                return;
            }
            savedJob.setEndDate(new Date());
            savedJob.setStatus(1);
            warningJobRepository.save(savedJob);
            logger.info("预警任务执行成功");
        }).start();
    }

    @Operation(summary = "指标预警任务设置修改")
    @PutMapping("/metricWarning/setting")
    public void updateMetricWarningJob(@RequestBody MetricWarningSetting metricWarningSetting) {
        metricWarningSettingRepository.save(metricWarningSetting);
        try {
            QuartzUtils.deleteScheduleJob(scheduler, "Metric_Warning_Job");
        } catch (Exception e) {
            logger.error(e.getMessage());
        }

        if (metricWarningSetting.getEnable()) {
            WarningJob warningJob = new WarningJob();
            warningJob.setJobClass("com.datablau.metric.management.impl.metric.MetricWarningJobImpl");
            warningJob.setJobName("Metric_Warning_Job");
            warningJob.setCronExpression(metricWarningSetting.getCronExpression());
            QuartzUtils.createScheduleJob(scheduler, warningJob);
        }
    }

    @Operation(summary = "指标预警任务列表")
    @GetMapping("/metricWarning/tasks")
    public List<WarningJob> getMetricWarningList() {
        return metricManagementService.getMetricWarningList();
    }

    @Operation(summary = "获取指标预警设置")
    @GetMapping("/metricWarning/setting")
    public MetricWarningSetting getMetricWarningSetting() {
        return metricWarningSettingRepository.queryMetricWarningSettingById(1L);
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

    @PostMapping("/domain/getPageWithInfo")
    @Operation(summary = "获取指标以及指标信息")
    public List<DomainInfoDto> getDomainPageWithInfo(@RequestBody DomainQueryDto domainQueryDto,
                                                     HttpServletRequest request) {
        domainQueryDto.setCurrentUser(getCurrentUser(request));
        return metricManagementService.getDomainPageWithInfo(domainQueryDto);
    }

    @GetMapping("/lineage")
    @Operation(summary = "获取指标血缘")
    public LineageContainer getMetricLineage(@RequestParam("metricId") String metricId,
                                             @RequestParam(name = "type", defaultValue = "all") String type) {
        List<MetricMappingResultDto> mappingResultDtos = metricManagementService.findMappingByMetricId(metricId);
        LineageContainer container = new LineageContainer();
        if (!mappingResultDtos.isEmpty()) {
            Long objectId = mappingResultDtos.get(0).getTableId();
            container = datablauRemoteLineageService.getLineageOfObject(objectId, type);
        }
        return container;
    }

    @RequestMapping(value = "/metric/excel", method = RequestMethod.GET)
    @Description("导出一个指标的血缘")
    @Operation(summary = "导出一个指标的血缘", description = "导出一个指标的血缘")
    public void getLineageExcel(
            @Parameter(name = "metricId", description = "指标ID", required = true)
            @Description("指标ID") @RequestParam("metricId") String metricId,
            @Parameter(name = "type", description = "获取目标的血缘关系, right:上游,all:全部", required = true)
            @RequestParam(name = "type", defaultValue = "right") String type,
            HttpServletResponse response) {
        Long objectId = 0L;
        List<MetricMappingResultDto> mappingResultDtos = metricManagementService.findMappingByMetricId(metricId);
        if (!mappingResultDtos.isEmpty()) {
            objectId = mappingResultDtos.get(0).getTableId();
        }
        LineageContainer container = new LineageContainer();
        try {
            container = datablauRemoteLineageService.getLineageOfObject(objectId, type);
            File file = datablauRemoteLineageService.exportLineageContainerToExcel(container);
            innerExportFile(file, response, "血缘关系");
        } catch (Exception e) {
            throw new AndorjRuntimeException(e.getMessage());
        }
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

    public boolean hasPermissionToFolder(String username, Long folderId, PermissionLevel permissionLevel) {
        DomainTreeNodeDto node = domainInternalService.getDomainTreeNode(folderId);
        if (node == null) {
            throw new InvalidArgumentException(msgService.getMessage("domainCategoryMissing", folderId));
        }

        //如果是企业级的，我们放过，默认所有人都可以，由前置检查来挡
        if (CategoryType.ENTERPRISE.equals(node.getType())) {
            return true;
        }
        //如果最上级不是领域标准，则不需要权限控制
        DomainTreeNodeDto rootFolder = domainInternalService.getDomainRootFolder(folderId);
        if (rootFolder.getFoldId() <= 4) {
            return true;
        }

        if (permissionLevel == null) {
            permissionLevel = PermissionLevel.NONE;
        }

        PermissionLevel level = getUserPermissionLevelOfCategory(node.getCategoryId(), username);

        return ((level.getMask() & permissionLevel.getMask()) != 0);
    }

    public PermissionLevel getUserPermissionLevelOfCategory(Long categoryId, String username) {
        if (isSuperUser(username)) {
            return PermissionLevel.ADMIN;
        }

        UserDto user = userService.getUser(username);
        String bm = user.getBm();

        if (categoryId == null){
            categoryId = -1L;
        }

        List<DomainFolderAccessListDto> list = domainFolderAccessListCache.getUnchecked(categoryId);
        if (list == null) {
            return PermissionLevel.NONE;
        }

        Set<String> allBms = new HashSet<>();

        if (!Strings.isNullOrEmpty(bm)) {
            OrganizationDto org = organizationService.getOrganizationsByBm(bm);
            if (org != null) {
                String path = org.getPath();

                if (!Strings.isNullOrEmpty(path)) {
                    for (String part : path.split("/")) {
                        allBms.add(part);
                    }
                }
            }
        }

        int mask = 0;
        for (DomainFolderAccessListDto dfa : list) {
            if (PermissionType.USER.equals(dfa.getType())) {
                if (username.equals(dfa.getAccessor())) {
                    mask |= dfa.getLevel().getMask();
                }
            } else {
                if (allBms.contains(dfa.getAccessor())) {
                    mask |= dfa.getLevel().getMask();
                }
            }
        }

        return PermissionLevel.valueOf(mask);
    }

    private boolean isSuperUser(String username) {
        if (username.equals(AuthTools.currentUsername())) {
            return AuthTools.hasAnyRole("ROLE_SUPERUSER");
        }
        for (GrantedAuthority authority : userService.getUserFullAuthorities(username)) {
            if (authority instanceof SimpleGrantedAuthority) {
                SimpleGrantedAuthority auth = (SimpleGrantedAuthority) authority;
                if ("ROLE_SUPERUSER".equals(auth.getAuthority())) {
                    return true;
                }
            }
        }
        return false;
    }

    private List<DomainFolderAccessListDto> convertTo(Collection<DomainFolderAccessList> list) {
        List<DomainFolderAccessListDto> res = new ArrayList<>(list.size());

        for (DomainFolderAccessList dfa : list) {
            res.add(dfa.toDto());
        }

        return res;
    }
}
