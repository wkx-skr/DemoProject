package com.datablau.job.scheduler.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.core.data.CommonModel;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.search.FieldEqualsCriteria;
import com.andorj.model.common.search.QueryParameterCriteria;
import com.datablau.data.common.api.OperationLogService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.operation.type.OperationLogType;
import com.datablau.data.common.operation.type.OperationModuleType;
import com.datablau.job.scheduler.api.JobService;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.job.scheduler.dto.JobDto;
import com.datablau.job.scheduler.dto.JobEvent;
import com.datablau.job.scheduler.dto.JobQueryDto;
import com.datablau.job.scheduler.dto.JobResultDto;
import com.datablau.job.scheduler.jpa.entity.CommonJob;
import com.datablau.job.scheduler.service.LocalJobService;
import com.datablau.metadata.common.api.DatablauRemoteDamModelService;
import com.datablau.metadata.common.api.DatablauRemoteShareFileService;
import com.datablau.metadata.common.dto.model.ModelDto;
import com.datablau.project.util.UserRights;
import com.datablau.security.management.utils.AuthTools;
import com.google.common.collect.Lists;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import javax.servlet.http.HttpServletResponse;
import java.util.Date;
import java.util.List;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2023/3/22 9:27
 */
@RestController
@RequestMapping("/main")
@Description("任务相关REST API")
@Tag(name = "任务controller", description = "/main")
public class JobController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(JobController.class);

    @Autowired
    private JobService jobService;
    @Autowired
    private LocalJobService localJobService;
    @Autowired
    private OperationLogService operationLogService;
    @Autowired
    private MessageService msgService;
    @Autowired
    @Qualifier("datablauRemoteDamModelService")
    private DatablauRemoteDamModelService datablauRemoteDamModelService;

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "sch_job",
//            systemModule = OperationModuleType.SYSTEM_JOB_SCH,
//            description = "启动任务，id为: {param}",
//            descriptionParamClass = Long.class,
//            descriptionParamMethod = "toString"
//    )
    @PostMapping("/startJob")
    @Operation(summary = "启动任务")
    public void startJob(@Parameter(name = "任务ID", required = true) Long jobId,
        @Parameter(name = "执行任务人员", required = true) String executor) throws Exception {
        jobService.executeJob(jobId, executor);

        //增加日志
        addJobStartLog(jobId);
    }

    protected void addJobStartLog(Long jobId) {
        try {
            CommonJob commonJob = localJobService.getJobById(jobId);

            if ("MODEL_ID".equals(commonJob.getResourceType())) {
                addModelJobStartLog(commonJob);
            } else if ("质量核检任务".equals(commonJob.getJobType()) || "标准核检任务".equals(commonJob.getJobType())) {
                addQualityJobStartLog(commonJob);
            }
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
        }
    }

    protected void addQualityJobStartLog(CommonJob commonJob) {
        String logMessage = msgService.getMessage("quality.job.log.start", commonJob.getName());

        operationLogService.generateOperationLog(OperationModuleType.QUALITY_QUALITY_JOB, "dc_job",
                OperationLogType.BASIC_JOB_START, logMessage, AuthTools.currentUsername(), 0);
    }

    protected void addModelJobStartLog(CommonJob commonJob) {
        FieldEqualsCriteria idCriteria = new FieldEqualsCriteria();
        idCriteria.setFieldName("modelId");
        idCriteria.setCompareValue(commonJob.getResourceId());
        idCriteria.setNotEqual(false);
        ModelDto model = datablauRemoteDamModelService.getDataModel(idCriteria).singleton();

        OperationLogType logType;
        String logMessage;
        if ("BI报表更新扫描任务".equals(commonJob.getJobType())) {
            logType = OperationLogType.BASIC_RE;
            logMessage = msgService.getMessage("metadata.model.report.log.re", model.getDefinition());
        } else if ("元数据-更新扫描任务".equals(commonJob.getJobType())) {
            logType = OperationLogType.BASIC_RE;
            List<String> fileModels = Lists.newArrayList("DATADICTIONARY", "DATADICTIONARY_LOGICAL", "TABLEAU");
            if (fileModels.contains(model.getType())) {
                logMessage = msgService.getMessage("metadata.model.file.log.re", model.getDefinition());
            } else {
                logMessage = msgService.getMessage("metadata.model.log.re", model.getDefinition());
            }
        } else if ("元数据-数据源与模型差异比较与同步任务".equals(commonJob.getJobType())) {
            logType = OperationLogType.BASIC_COMPARE;
            List<String> fileModels = Lists.newArrayList("DATADICTIONARY", "DATADICTIONARY_LOGICAL", "TABLEAU");
            if (fileModels.contains(model.getType())) {
                logMessage = msgService.getMessage("metadata.model.file.log.compare", model.getDefinition());
            } else {
                logMessage = msgService.getMessage("metadata.model.log.compare", model.getDefinition());
            }
        } else {
            return;
        }

        operationLogService.generateOperationLog(OperationModuleType.METADATA_MODEL, "dam_model",
                logType, logMessage, AuthTools.currentUsername(), 0);
    }



    //    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "sch_job",
//            systemModule = OperationModuleType.SYSTEM_JOB_SCH,
//            description = "查询任务调度"
//    )
    @PostMapping(value = "/query/jobs/byDto")
    @Operation(summary = "查询任务列表,包含关联表数据")
    @PreAuthorize(UserRights.HAS_BASE_TASK_SCHEDULER_MANAGE_ROLE)
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

    @PostMapping("/query/jobEvents/byCriteria/sse")
    @Operation(summary = "根据RunningEvent，以sse方式查询消息")
    public SseEmitter queryJobEventResultsBySse(@RequestBody QueryParameterCriteria criteria, HttpServletResponse response) {
        response.setContentType("text/event-stream");
        response.setCharacterEncoding("UTF-8");
        return jobService.queryJobEventResultsBySse(criteria);
    }

    @PostMapping("/rescheduleJob")
    @Operation(summary = "修改任务调度时间")
    public Date rescheduleJob(@Parameter(name = "任务ID", required = true) Long jobId,
        @Parameter(name = "调度时间cron表达式", required = true) String schedule){

        return jobService.rescheduleJob(jobId, schedule);
    }

    @PostMapping("/forciblyStopJob")
    @Operation(summary = "强制停止任务")
    public void forciblyStopJob(@Parameter(name = "任务执行ID", required = true) Long jobId) throws Exception {
        logger.info("job id:" + jobId);
        jobService.forciblyStopJob(jobId);
    }

    @PostMapping("/stopJob")
    @Operation(summary = "停止任务")
    public void stopJob(@Parameter(name = "任务执行ID", required = true) Long jobId){
        jobService.stopJob(jobId);
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

    @PostMapping("/updateJobInfo")
    @Operation(summary = "更新任务信息")
    public JobDto updateJobInfo(@Parameter(name = "任务ID", required = true) Long jobId,
        @Parameter(name = "job content的内容", required = true)@RequestBody DatablauJobDescriptor descriptor)throws Exception{
        descriptor.setId(jobId);
        return jobService.updateJobInfo(descriptor);
    }

    @PostMapping("/findLogByInstanceId")
    @Operation(summary = "查询任务日志")
    public List<String> findJobInstanceLog(@Parameter(name = "查询实体", required = true) @RequestBody JobQueryDto queryDto){
        return jobService.findJobInstanceLog(queryDto);
    }

    @PostMapping(value = "/canExecuteToday")
    @Operation(summary = "是否今天可以执行")
    public boolean canExecuteToday(@Parameter(name = "任务ID", required = true) Long jobId) {
        return localJobService.canExecuteToday(jobId, false);
    }

    @PostMapping(value = "/setStatusToFailed")
    @Operation(summary = "强制重置任务状态")
    public void updateJobStatusToFailed(@Parameter(name = "任务ID", required = true) Long jobId) {
        localJobService.setJobStatusToFailed(jobId);
    }


    @GetMapping(value = "/query/jobs/byDto/byName")
    @Operation(summary = "查询任务列表,包含关联表数据")
  //  @PreAuthorize(UserRights.HAS_BASE_TASK_SCHEDULER_MANAGE_ROLE)
    public JobDto queryJobsByName(){
        /**
         *
         */
        JobQueryDto queryDto = new JobQueryDto();
        queryDto.setPageSize(20);
        queryDto.setCurrentPage(1);
        // —— 业务过滤条件（写死） ——
        queryDto.setName("元数据相似度检查");
       // queryDto.setType("任务类型");           // _type
      //  queryDto.setStatus(null);              // status

        Page<JobDto> jobDtos = jobService.queryAllJobs(queryDto);
        JobDto jobDto = jobDtos.getContent().get(0);
        return jobDto;
    }

}
