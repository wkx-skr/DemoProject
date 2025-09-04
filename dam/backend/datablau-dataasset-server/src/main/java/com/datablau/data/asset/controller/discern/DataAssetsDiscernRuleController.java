package com.datablau.data.asset.controller.discern;

import com.alibaba.nacos.common.utils.MapUtils;
import com.andorj.common.core.exception.IllegalOperationException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.search.FieldInCriteria;
import com.datablau.data.asset.api.discern.CheckRuleService;
import com.datablau.data.asset.api.discern.DataAssetsDiscernRuleService;
import com.datablau.data.asset.dto.ResResultDto;
import com.datablau.data.asset.dto.discern.AlgorithmAndRuleSearchDto;
import com.datablau.data.asset.dto.discern.DataAssetsDiscernCommonImportResultDto;
import com.datablau.data.asset.dto.discern.DataAssetsDiscernRuleDetailDto;
import com.datablau.data.asset.dto.discern.DiscernCombineDto;
import com.datablau.data.asset.dto.discern.DiscernRuleDto;
import com.datablau.data.asset.dto.discern.TestRuleDto;
import com.datablau.data.asset.dto.discern.TestRuleResultDto;
import com.datablau.data.asset.jpa.entity.discern.DataAssetsDiscernRule;
import com.datablau.data.asset.jpa.entity.discern.DataAssetsDiscernRuleTaskRel;
import com.datablau.data.asset.jpa.entity.discern.DataAssetsDiscernTask;
import com.datablau.data.asset.jpa.repository.discern.DataAssetsDiscernRuleTaskRelRepository;
import com.datablau.data.asset.jpa.repository.discern.DataAssetsDiscernTaskRepository;
import com.datablau.data.asset.utils.FileUtility;
import com.datablau.data.asset.utils.ServerConstants;
import com.datablau.data.common.api.instantjob.InstantJob;
import com.datablau.data.common.api.instantjob.InstantJobProgressMonitor;
import com.datablau.data.common.api.instantjob.InstantJobService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.data.FileDescriptor;
import com.datablau.data.common.data.instantjob.EnumJobType;
import com.datablau.data.common.data.instantjob.FileGenerateInstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobStage;
import com.datablau.data.common.util.ExcelUtil;
import com.datablau.job.scheduler.api.JobService;
import com.datablau.job.scheduler.dto.JobDto;
import com.datablau.job.scheduler.enumtype.DatablauJobStatus;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import org.apache.commons.lang3.StringUtils;
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

import static com.datablau.common.utils.JsonUtils.toJSon;


/**
 * Description: 识别规则api
 *
 * @author liuhao
 * @version 1.0
 * @date 2022/12/12 9:53
 */
@RestController
@RequestMapping(value = "/discern/rule")
public class DataAssetsDiscernRuleController extends BaseController {

    @Autowired
    @Qualifier("datablauJobService")
    private JobService jobService;
    @Autowired
    private FileUtility storedFileService;
    @Autowired
    private CheckRuleService checkRuleService;
    @Autowired
    private InstantJobService instantJobService;
    @Autowired
    private DataAssetsDiscernRuleService ruleService;
    @Autowired
    private DataAssetsDiscernRuleTaskRelRepository ruleTaskRelRepository;
    @Autowired
    private DataAssetsDiscernTaskRepository taskRepository;

    public DataAssetsDiscernRuleController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "添加识别规则")
    @PutMapping("/add")
    public void addRule(@RequestBody DiscernRuleDto ruleDto) {
        ruleService.addRule(ruleDto);
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

        for (Long ruleId : ruleIds) {
            List<DataAssetsDiscernRuleTaskRel> taskRelList = ruleTaskRelRepository.findByRuleId(ruleId);

            if (!CollectionUtils.isEmpty(taskRelList)) {
                failDelList.add(ruleId);
                continue;
            }

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
        }

        return ResResultDto.ok(failDelList);
    }

    @Operation(summary = "获取识别规则列表")
    @PostMapping("/get")
    public ResResultDto<Map<String, Object>> getRules(@RequestBody AlgorithmAndRuleSearchDto searchDto) {
        return ResResultDto.ok(ruleService.getRules(searchDto));
    }

    @Operation(summary = "获取识别规则列表(过滤信息项不存在)")
    @PostMapping("/filter")
    public ResResultDto<PageResult<DataAssetsDiscernRule>> filterRules(@RequestBody AlgorithmAndRuleSearchDto searchDto) {
        return ResResultDto.ok(ruleService.filterRules(searchDto));
    }

    @Operation(summary = "获取识别规则")
    @GetMapping("/get/{ruleId}")
    public ResResultDto<DataAssetsDiscernRuleDetailDto> getRule(@PathVariable("ruleId") Long ruleId, @RequestParam(required = false,defaultValue = "false") Boolean log) {
        DataAssetsDiscernRuleDetailDto detailVo = ruleService.getRule(ruleId);
        return ResResultDto.ok(detailVo);
    }

    @Operation(summary = "修改识别规则")
    @PostMapping("/update")
    public void updateRule(@RequestBody DiscernRuleDto ruleDto) {
        ruleService.updateRule(ruleDto);
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
    }

    @Operation(summary = "导入规则")
    @PostMapping("/import")
    public String importRules(@RequestParam("file") MultipartFile file) {
        try {
            final SecurityContext context = SecurityContextHolder.getContext();
            SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
            String currentUser = AuthTools.currentUsernameFailFast();
            Map<String, List<Object>> sheets = ExcelUtil.readFileManySheet(file);
            String submitJob = instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                                               @Override
                                                               public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                                               }

                                                               @Override
                                                               public InstantJobResult call() {
                                                                   SecurityContextHolder.setContext(context);
                                                                   DataAssetsDiscernCommonImportResultDto dataAssetsDiscernCommonImportResultDto = ruleService.importRules(sheets);
                                                                   FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                                   result.setErrorMessage(toJSon(dataAssetsDiscernCommonImportResultDto));
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
