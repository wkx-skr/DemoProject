package com.datablau.dataSecurity.controller;

import com.alibaba.nacos.common.utils.MapUtils;
import com.andorj.common.core.exception.IllegalOperationException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.search.FieldInCriteria;
import com.datablau.data.common.data.FileDescriptor;
import com.datablau.data.common.data.instantjob.EnumJobType;
import com.datablau.data.common.data.instantjob.InstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobStage;
import com.datablau.category.service.api.UniversalCategoryService;
import com.datablau.common.utils.IpUtil;
import com.datablau.data.common.api.instantjob.InstantJob;
import com.datablau.data.common.api.instantjob.InstantJobProgressMonitor;
import com.datablau.data.common.api.instantjob.InstantJobService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.data.instantjob.FileGenerateInstantJobResult;
import com.datablau.data.common.util.ExcelUtil;
import com.datablau.dataAccess.dto.ResResultDto;
import com.datablau.dataAccess.utility.ServerConstants;
import com.datablau.dataAccess.utils.FileUtility;
import com.datablau.dataSecurity.dto.AlgorithmAndRuleSearchDto;
import com.datablau.dataSecurity.dto.DataSecurityCommonImportResultDto;
import com.datablau.dataSecurity.dto.DataSecurityDiscernRuleDetailDto;
import com.datablau.dataSecurity.dto.DiscernCombineDto;
import com.datablau.dataSecurity.dto.DiscernRuleDto;
import com.datablau.dataSecurity.dto.TestRuleDto;
import com.datablau.dataSecurity.dto.TestRuleResultDto;
import com.datablau.dataSecurity.jpa.entity.DataSecurityDiscernRule;
import com.datablau.dataSecurity.service.api.CheckRuleService;
import com.datablau.dataSecurity.service.api.DataSecurityDiscernRuleService;
import com.datablau.dataSecurity.utils.DDSKafkaLogUtil;
import com.datablau.job.scheduler.api.JobService;
import com.datablau.job.scheduler.dto.JobDto;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.datablau.dataSecurity.utils.JsonUtils.toJSon;

/**
 * Description: 识别规则api
 *
 * @author liuhao
 * @version 1.0
 * @date 2022/12/12 9:53
 */
@RestController
@RequestMapping(value = "/datasecurity/rule")
public class DataSecurityDiscernRuleController extends BaseController {
    @Autowired
    private DataSecurityDiscernRuleService ruleService;
    @Autowired
    @Qualifier("datablauJobService")
    private JobService jobService;
    @Autowired
    private CheckRuleService checkRuleService;
    @Autowired
    private UniversalCategoryService categoryService;
    @Autowired
    private InstantJobService instantJobService;
    @Autowired
    private FileUtility storedFileService;

    @Autowired
    private DDSKafkaLogUtil logUtils;

    public DataSecurityDiscernRuleController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "添加识别规则")
    @PutMapping("/add")
    public void addRule(@RequestBody DiscernRuleDto ruleDto) {
        ruleService.addRule(ruleDto);
        logUtils.addDiscernRule(ruleDto,getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
    }

    @Operation(summary = "测试识别规则")
    @PutMapping("/test")
    public ResResultDto<Map<String, Boolean>> testRule(@RequestBody DiscernCombineDto discernCombineDto) {
        return ResResultDto.ok(checkRuleService.checkLogic(discernCombineDto));
    }

    @Operation(summary = "编辑识别规则前判断(true:无任务引用或者没有下一次运行的任务)")
    @GetMapping("/toUpdate/{ruleId}")
    public ResResultDto<Boolean> toUpdateRule(@PathVariable("ruleId") Long ruleId) {

        List<Long> jobIds = ruleService.getJobIds(ruleId);
        if (!CollectionUtils.isEmpty(jobIds)) {
            FieldInCriteria inCriteria = new FieldInCriteria("jobId", jobIds, true);
            List<JobDto> commonJobList = jobService.queryAllJobs(inCriteria).toList();
            List<String> scheduleList = commonJobList.stream().map(JobDto::getSchedule).collect(Collectors.toList());
            return ResResultDto.ok(ruleService.toUpdateRule(ruleId, scheduleList));
        }
        return ResResultDto.ok(true);
    }

    @Operation(summary = "删除识别规则")
    @PostMapping("/delete")
    public ResResultDto<List<Long>> deleteRule(@RequestBody List<Long> ruleIds) {
        List<Long> failDelList = new ArrayList<>();

        ruleIds.forEach(ruleId->{
            DataSecurityDiscernRuleDetailDto detailVo = ruleService.getRule(ruleId);
            DiscernRuleDto ruleDto = new DiscernRuleDto();
            BeanUtils.copyProperties(detailVo, ruleDto);
            logUtils.deleteDiscernRule(ruleDto, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        });

        ruleIds.forEach(ruleId -> {
            List<Long> jobIds = ruleService.getJobIds(ruleId);
            if (!CollectionUtils.isEmpty(jobIds)) {
                FieldInCriteria inCriteria = new FieldInCriteria("jobId", jobIds, true);
                List<JobDto> commonJobList = jobService.queryAllJobs(inCriteria).toList();
                List<String> scheduleList = commonJobList.stream().map(JobDto::getSchedule).collect(Collectors.toList());
                if (ruleService.deleteDiscernRules(ruleId, scheduleList) != null) {
                    failDelList.add(ruleId);
                }
            } else {
                ruleService.deleteRule(ruleId);
            }
        });
        return ResResultDto.ok(failDelList);
    }

    @Operation(summary = "获取识别规则列表")
    @PostMapping("/get")
    public ResResultDto<Map<String, Object>> getRules(@RequestBody AlgorithmAndRuleSearchDto searchDto) {
        return ResResultDto.ok(ruleService.getRules(searchDto));
    }

    @Operation(summary = "获取识别规则列表(过滤信息项不存在)")
    @PostMapping("/filter")
    public ResResultDto<PageResult<DataSecurityDiscernRule>> filterRules(@RequestBody AlgorithmAndRuleSearchDto searchDto) {
        return ResResultDto.ok(ruleService.filterRules(searchDto));
    }

    @Operation(summary = "获取识别规则")
    @GetMapping("/get/{ruleId}")
    public ResResultDto<DataSecurityDiscernRuleDetailDto> getRule(@PathVariable("ruleId") Long ruleId,@RequestParam(required = false,defaultValue = "false") Boolean log) {
        DataSecurityDiscernRuleDetailDto detailVo = ruleService.getRule(ruleId);
        DiscernRuleDto ruleDto = new DiscernRuleDto();
        BeanUtils.copyProperties(detailVo, ruleDto);
        if (log) {
            logUtils.getDiscernRule(ruleDto, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        }
        return ResResultDto.ok(detailVo);
    }

    @Operation(summary = "修改识别规则")
    @PostMapping("/update")
    public void updateRule(@RequestBody DiscernRuleDto ruleDto) {
        ruleService.updateRule(ruleDto);
        logUtils.modifyDiscernRule(ruleDto, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
    }

    @Operation(summary = "修改识别规则")
    @PostMapping("/to/update")
    public void toUpdateRule(@RequestParam(name = "ruleId", required = false) Long ruleId,
                             @RequestParam(name = "algorithmId", required = false) Long algorithmId) {
        ruleService.toEditRuleOrAlgorithm(ruleId, algorithmId);
    }

    //使用统一删除接口
    @Deprecated
    @DeleteMapping("/{categoryId}")
    public void deleteCategory(@PathVariable("categoryId") Long categoryId) {
        Boolean exist = ruleService.existRule(categoryId);
        if (exist) {
            throw new IllegalOperationException("目录内存在识别规则，无法删除！");
        }
        categoryService.deleteCategoryById(categoryId);
    }

    @Operation(summary = "导入规则")
    @PostMapping("/import")
    public String importRules(@RequestParam("file") MultipartFile file) {
        try {
            final SecurityContext context = SecurityContextHolder.getContext();
            SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
            String currentUser = AuthTools.currentUsernameFailFast();
            Map<String, List<Object>> sheets = ExcelUtil.readFileManySheet(file);
            logUtils.importDiscernRule(getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
            String submitJob = instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                                               @Override
                                                               public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                                               }

                                                               @Override
                                                               public InstantJobResult call() {
                                                                   SecurityContextHolder.setContext(context);
                                                                   DataSecurityCommonImportResultDto dataSecurityCommonImportResultDto = ruleService.importRules(sheets);
                                                                   FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                                   result.setErrorMessage(toJSon(dataSecurityCommonImportResultDto));
                                                                   result.setJobStatus(InstantJobStage.FINISHED);
                                                                   return result;
                                                               }
                                                           }
                    , "识别规则导入" + sdf.format(new Date()), currentUser, EnumJobType.IMPORT.name());
            return submitJob;
        } catch (Exception e) {
            e.printStackTrace();
            throw new UnexpectedStateException("文件读取错误！请检查所使用的模板文件！");
        }
    }

    @Operation(summary = "导出规则")
    @PostMapping("/export")
    public String exportRules(@RequestBody AlgorithmAndRuleSearchDto searchDto) {
        Map<String, List<List<Object>>> exportRules = ruleService.exportRules(searchDto);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        String currentUser = AuthTools.currentUsernameFailFast();
        logUtils.exportDiscernRule(getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        String submitJob = instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                                           @Override
                                                           public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                                           }

                                                           @Override
                                                           public InstantJobResult call() throws Exception {
                                                               FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                               if (MapUtils.isEmpty(exportRules)) {
                                                                   result.setJobStatus(InstantJobStage.FAILED);
                                                                   return result;
                                                               }
                                                               File file = ExcelUtil.export(exportRules);
                                                               FileDescriptor storedFile = storedFileService.uploadFile(file, "识别规则列表.xlsx", currentUser, false);
                                                               result.setFileId(storedFile.getFileId());
                                                               result.setJobStatus(InstantJobStage.FINISHED);
                                                               return result;
                                                           }
                                                       }
                , "识别规则导出" + sdf.format(new Date()), currentUser, EnumJobType.EXPORT.name());
        return submitJob;
    }

    @Operation(summary = "导出选中的规则")
    @PostMapping("/export/selected")
    public String exportRules(@RequestBody List<Long> ids) {
        Map<String, List<List<Object>>> exportRules = ruleService.exportSelectedRules(ids);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        String currentUser = getCurrentUser();
        logUtils.exportDiscernRule(getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        String submitJob = instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                                           @Override
                                                           public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                                           }

                                                           @Override
                                                           public InstantJobResult call() throws Exception {
                                                               FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                               if (MapUtils.isEmpty(exportRules)) {
                                                                   result.setJobStatus(InstantJobStage.FAILED);
                                                                   return result;
                                                               }
                                                               File file = ExcelUtil.export(exportRules);
                                                               FileDescriptor storedFile = storedFileService.uploadFile(file, "识别规则列表.xlsx", currentUser, true);
                                                               result.setFileId(storedFile.getFileId());
                                                               result.setJobStatus(InstantJobStage.FINISHED);
                                                               return result;
                                                           }
                                                       }
                , "识别规则导出" + sdf.format(new Date()), currentUser, EnumJobType.EXPORT.name());
        return submitJob;
    }

    @Operation(summary = "下载规则模板")
    @PostMapping("/download")
    public void downloadTemplate(HttpServletResponse response) {
        ruleService.downloadTemplate(response);
    }

    @Operation(summary = "删除目录")
    @DeleteMapping("/catalog/{catalogId}")
    public void deleteCatalog(@PathVariable("catalogId") Long catalogId) {
        ruleService.deleteCatalog(catalogId);
    }

    @Operation(summary = "测试规则")
    @PostMapping("/test")
    public TestRuleResultDto testRule(@RequestBody TestRuleDto dto) {
        return ruleService.testRule(dto);
    }
}
