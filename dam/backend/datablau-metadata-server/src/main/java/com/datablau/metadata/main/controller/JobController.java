package com.datablau.metadata.main.controller;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.model.common.search.QueryParameterCriteria;
import com.datablau.data.common.controller.BaseController;
import com.datablau.job.scheduler.api.JobService;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.job.scheduler.data.JobParameter;
import com.datablau.job.scheduler.dto.JobDto;
import com.datablau.job.scheduler.dto.JobEvent;
import com.datablau.job.scheduler.dto.JobQueryDto;
import com.datablau.job.scheduler.dto.JobResultDto;
import com.datablau.metadata.main.job.BIReportSyncJob;
import com.datablau.metadata.main.job.LocalJobRegistryAdapter;
import com.datablau.metadata.main.job.descriptor.JobDescriptorHandler;
import com.datablau.metadata.main.job.descriptor.MetadataJobDescriptor;
import com.datablau.metadata.main.util.ServerConstants;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Date;
import java.util.List;
import java.util.Objects;

/**
 * @author nicky - 数语科技有限公司
 * date 2023/7/22 15:39
 */
@RequestMapping("/jobs")
@RestController
@Tag(name = "编辑元数据任务相关的REST API")
public class JobController  extends BaseController {

    @Autowired
    private LocalJobRegistryAdapter localJobRegistryAdapter;

    @Autowired
    private JobService jobService;

    public JobController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }


//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "sch_job",
//            systemModule = OperationModuleType.METADATA_JOB,
//            description = "编辑任务: {param}",
//            descriptionParamClass = DatablauJobDescriptor.class,
//            descriptionParamMethod = "getName"
//    )
    @PostMapping("/updateJob")
    @Operation(summary = "更新任务的参数并校验", description = "更新任务的参数并校验")
    public DatablauJobDescriptor updateJobDescriptor(@RequestParam(name = "jobId") Long jobId,
        @RequestBody DatablauJobDescriptor newDesc) {

        if (Strings.isNullOrEmpty(newDesc.getTypeName())) {
            throw new InvalidArgumentException("Type name is not given");
        }

        JobDto job = localJobRegistryAdapter.queryJobById(jobId);
        if (job == null) {
            throw new InvalidArgumentException("unable to find job by ID " + jobId);
        }

        if (!Objects.equals(job.getJobType(), newDesc.getTypeName())) {
            throw new InvalidArgumentException("The jobType does not equals to " + job.getJobType());
        }

        boolean found = false;
        for (JobDescriptorHandler handler : MetadataJobDescriptor.getHandlers()) {
            if (handler.canHandle(newDesc.getTypeName())) {
                handler.validateJobDescriptor(newDesc);
                found = true;
                break;
            }
        }
        if (!found) {
            throw new InvalidArgumentException("Unable to find jobDescriptorHandler for type " + newDesc.getTypeName());
        }

        localJobRegistryAdapter.updateJob(newDesc, jobId);

        return newDesc;
    }


//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "sch_job",
//            systemModule = OperationModuleType.METADATA_JOB,
//            description = "新建任务: {param}",
//            descriptionParamClass = DatablauJobDescriptor.class,
//            descriptionParamMethod = "getName"
//    )
    @PostMapping("/createJob")
    @Operation(summary = "创建任务的参数并校验", description = "创建任务的参数并校验")
    public DatablauJobDescriptor createJobDescriptor(@RequestBody DatablauJobDescriptor newDesc) {

        if (Strings.isNullOrEmpty(newDesc.getTypeName())) {
            throw new InvalidArgumentException("Type name is not given");
        }

        JobDescriptorHandler handler = MetadataJobDescriptor.getHandler(newDesc.getTypeName());
        if (handler == null) {
            throw new InvalidArgumentException("Unable to find jobDescriptorHandler for type " + newDesc.getTypeName());
        }
        DatablauJobDescriptor template = handler.getTemplate();
        List<JobParameter> templateParameters = template.getParameters();
        for (JobParameter templateParameter : templateParameters) {
            JobParameter parameterByName = newDesc.getParameterByName(templateParameter.getParameterName());
            if (parameterByName != null) {
                templateParameter.setValue(parameterByName.getValue());
            }
        }

        newDesc.setBoundResourceType(template.getBoundResourceType());
        newDesc.setParameters(templateParameters);
        newDesc.setCreator(AuthTools.currentUsername());
        localJobRegistryAdapter.registerJobInfo(Lists.newArrayList(newDesc));
        return newDesc;
    }

    @PostMapping("/startJob")
    @Operation(summary = "启动任务")
    public void startJob(@Parameter(name = "任务ID", required = true) Long jobId,
        @Parameter(name = "执行任务人员", required = true) String executor) throws Exception {
        jobService.executeJob(jobId, executor);
    }

    @PostMapping(value = "/query/jobs/byDto")
    @Operation(summary = "查询任务列表,包含关联表数据")
    public Page<JobDto> queryAllJobs(@RequestBody JobQueryDto queryDto){

        return jobService.queryAllJobs(queryDto);
    }

    @PostMapping("/query/jobs/byCriteria")
    @Operation(summary = "根据commonJob，查询任务数据")
    public Page<JobDto> queryAllJobs(@RequestBody QueryParameterCriteria criteria){

        return jobService.queryAllJobs(criteria);
    }

    @PostMapping("/query/jobResults/byCriteria")
    @Operation(summary = "根据CommonJobResult, 查询任务执行结果")
    public Page<JobResultDto> queryJobResults(@RequestBody QueryParameterCriteria criteria){
        return jobService.queryJobResults(criteria);
    }

    @PostMapping("/query/jobEvents/byCriteria")
    @Operation(summary = "根据RunningEvent，查询消息")
    public Page<JobEvent> queryJobEventResults(@RequestBody QueryParameterCriteria criteria){
        return jobService.queryJobEventResults(criteria);
    }

    @PostMapping("/rescheduleJob")
    @Operation(summary = "修改任务调度时间")
    public Date rescheduleJob(@Parameter(name = "任务ID", required = true) Long jobId,
        @Parameter(name = "调度时间cron表达式", required = true) String schedule){

        return jobService.rescheduleJob(jobId, schedule);
    }


    @PostMapping("/stopJob")
    @Operation(summary = "停止任务")
    public void forciblyStopJob(@Parameter(name = "任务执行ID", required = true) Long jobInstanceId) throws Exception {

        jobService.forciblyStopJob(jobInstanceId);
    }

    @PostMapping("/enableJob")
    @Operation(summary = "启用任务")
    public void enableJob(@Parameter(name = "任务ID", required = true)Long jobId) throws Exception{

        jobService.enableJob(jobId);
    }

    @PostMapping("/disableJob")
    @Operation(summary = "禁用任务")
    public void disableJob(@Parameter(name = "任务ID", required = true) Long jobId) throws Exception{

        jobService.disableJob(jobId);
    }

    @GetMapping("/test")
    public void test(@RequestParam("jobId") Long jobId) throws Exception {
        JobDto job = localJobRegistryAdapter.queryJobById(jobId);
        DatablauJobDescriptor datablauJobDescriptor = new ObjectMapper().readValue(job.getJobContent(), DatablauJobDescriptor.class);
        BIReportSyncJob loadLineageJob = new BIReportSyncJob(datablauJobDescriptor);
        loadLineageJob.run();
    }

}
