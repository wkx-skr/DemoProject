package com.datablau.dataSecurity.controller;


import com.andorj.model.common.search.QueryParameterCriteria;
import com.datablau.base.data.PageQueryDto;
import com.datablau.common.utils.IpUtil;
import com.datablau.data.common.controller.BaseController;
import com.datablau.dataAccess.dto.ResResultDto;
import com.datablau.dataAccess.utility.ServerConstants;
import com.datablau.dataSecurity.dto.DataSecurityDiscernTaskDetailDto;
import com.datablau.dataSecurity.dto.DiscernTaskDto;
import com.datablau.dataSecurity.dto.TaskSearchDto;
import com.datablau.dataSecurity.service.api.DataSecurityDiscernTaskExecuteService;
import com.datablau.dataSecurity.service.api.DataSecurityDiscernTaskService;
import com.datablau.dataSecurity.utils.DDSKafkaLogUtil;
import com.datablau.job.scheduler.api.JobService;
import com.datablau.job.scheduler.dto.JobDto;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.ws.rs.Path;
import java.util.List;
import java.util.Map;

/**
 * Description: 识别任务api
 *
 * @author liuhao
 * @version 1.0
 * @date 2022/12/12 9:53
 */
@RestController
@RequestMapping(value = "/datasecurity/task")
public class DataSecurityDiscernTaskController extends BaseController {
    @Autowired
    private DataSecurityDiscernTaskService taskService;
    @Autowired
    private DDSKafkaLogUtil logUtils;
    @Autowired
    @Qualifier("datablauJobService")
    private JobService jobService;

    public DataSecurityDiscernTaskController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @PostMapping("/query/jobs/byCriteria")
    @Operation(summary = "根据commonJob，查询任务数据")
    public Page<JobDto> queryAllJobs(@RequestBody QueryParameterCriteria criteria) {
        return jobService.queryAllJobs(criteria);
    }

    @Operation(summary = "添加识别任务")
    @PutMapping(value = "/add")
    public void addTask(@RequestBody DiscernTaskDto discernTaskDto) {
        discernTaskDto.setTaskCreator(AuthTools.currentUsernameFailFast());
        discernTaskDto.setUpdater(AuthTools.currentUsernameFailFast());
        taskService.addTask(discernTaskDto);
        logUtils.discernTask(discernTaskDto.getTaskName(), discernTaskDto.getModelName(), getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl(), "add");
    }

    @Operation(summary = "复制识别任务")
    @PostMapping(value = "/copy")
    public void copyTask(@RequestBody Map<String, Object> params) {
        DiscernTaskDto discernTaskDto = taskService.copyTask(params, getCurrentUser());
        logUtils.discernTask(discernTaskDto.getTaskName(), null, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl(), "copy");
    }

    @Operation(summary = "删除识别任务")
    @DeleteMapping(value = "/{taskId}")
    public void deleteTask(@PathVariable("taskId") Long taskId) {
        DataSecurityDiscernTaskDetailDto discernTaskDetailVo = taskService.deleteTask(taskId);
        logUtils.discernTask(discernTaskDetailVo.getTaskName(), discernTaskDetailVo.getModelName(), getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl(), "delete");

    }

    @Operation(summary = "修改识别任务")
    @PostMapping(value = "/update")
    public void updateTask(@RequestBody DiscernTaskDto discernTaskDto) {
        discernTaskDto.setUpdater(AuthTools.currentUsernameFailFast());
        taskService.updateTask(discernTaskDto);
        logUtils.discernTask(discernTaskDto.getTaskName(), discernTaskDto.getModelName(), getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl(), "modify");

    }

    @Operation(summary = "获取识别任务")
    @GetMapping(value = "/{taskId}")
    public ResResultDto<DataSecurityDiscernTaskDetailDto> getTask(@PathVariable("taskId") Long taskId) {
        return ResResultDto.ok(taskService.getTask(taskId));
    }

    @Operation(summary = "获取识别任务列表")
    @PostMapping(value = "/get")
    public ResResultDto<Map<String, Object>> getTasks(@RequestBody TaskSearchDto taskSearchDto) {
        return ResResultDto.ok(taskService.getTasks(taskSearchDto));
    }

    @Operation(summary = "停止/启动任务")
    @GetMapping(value = "/{taskId}/{enabled}")
    public void enabled(@PathVariable("taskId") Long taskId, @PathVariable("enabled") Boolean enabled) {
        String taskName = taskService.enabledTask(enabled, taskId);
        String op = enabled ? "enable" : "disable";
        logUtils.discernTask(taskName, null, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl(), op);
    }

    @Operation(summary = "运行任务")
    @PutMapping(value = "/{jobId}/{taskId}/run")
    public void runJobImmediately(@PathVariable("jobId") Long jobId,
                                  @PathVariable("taskId") Long taskId) throws Exception {
        jobService.executeJob(jobId, getCurrentUser());
        logUtils.discernTask(taskService.getTaskName(taskId), null, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl(), "run");
    }

    @Operation(summary = "校验cron")
    @PostMapping(value = "/cron")
    public void checkCron(@RequestBody Map<String, String> cron) {
        taskService.checkCron(cron.get("cron"));
    }

    @Operation(summary = "获取数据源使用信息")
    @PostMapping(value = "/getStrategyUsagesName")
    public Page<Map<String, Object>> findDatasourceUsage(@RequestBody PageQueryDto queryDto) {
        return taskService.findMetadataUsages(queryDto);
    }

    @Autowired
    private DataSecurityDiscernTaskExecuteService executeService;

    @GetMapping("/run/{taskId}")
    public void run(@PathVariable("taskId")Long taskId){
        try {
            executeService.executeDiscern(taskId);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Operation(summary = "获取识别任务绑定的规则")
    @GetMapping(value = "/rule/{taskId}")
    public ResResultDto<List<Map<String, Object>>> getRuleList(@PathVariable("taskId") Long taskId) {
        return ResResultDto.ok(taskService.getRuleList(taskId));
    }
}
