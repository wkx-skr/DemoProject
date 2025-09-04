package com.datablau.data.asset.controller.discern;


import com.andorj.model.common.search.MultipleCriteria;
import com.andorj.model.common.search.QueryParameterCriteria;
import com.datablau.base.api.ModelCategoryService;
import com.datablau.base.api.PermissionHelper;
import com.datablau.base.data.BaseModelCategory;
import com.datablau.base.data.PageQueryDto;
import com.datablau.data.asset.api.discern.DataAssetsDiscernTaskExecuteService;
import com.datablau.data.asset.api.discern.DataAssetsDiscernTaskService;
import com.datablau.data.asset.dto.ResResultDto;
import com.datablau.data.asset.dto.discern.DataAssetsDiscernTaskDetailDto;
import com.datablau.data.asset.dto.discern.DiscernTaskDto;
import com.datablau.data.asset.dto.discern.TaskSearchDto;
import com.datablau.data.asset.utils.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.job.scheduler.api.JobService;
import com.datablau.job.scheduler.dto.JobDto;
import com.datablau.metadata.common.api.DatablauRemoteDamModelService;
import com.datablau.metadata.common.dto.model.ModelDto;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.domain.Page;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Description: 识别任务api
 *
 * @author liuhao
 * @version 1.0
 * @date 2022/12/12 9:53
 */
@RestController
@RequestMapping(value = "/discern/task")
public class DataAssetsDiscernTaskController extends BaseController {

    private static final Logger LOGGER = LoggerFactory.getLogger(DataAssetsDiscernTaskController.class);

    @Autowired
    @Qualifier("datablauJobService")
    private JobService jobService;
    @Autowired
    @Qualifier("datablauRemoteDamModelService")
    private DatablauRemoteDamModelService datablauRemoteDamModelService;


    @Autowired
    private PermissionHelper permissionHelper;
    @Autowired
    private ModelCategoryService modelCategoryService;
    @Autowired
    private DataAssetsDiscernTaskService taskService;
    @Autowired
    private DataAssetsDiscernTaskExecuteService executeService;

    public DataAssetsDiscernTaskController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @GetMapping("/all/logic/model")
    @Operation(summary = "查找所有的逻辑数据源")
    public ResResultDto<List<ModelDto>> getAllLogicModel() {
        //用户下的用户系统
//        List<Long> filter = Lists.newArrayList(permissionHelper.getUserAccesibleModelCategoryIds(AuthTools.currentUsernameFailFast(), "DAM"));
        //全部系统列表
        List<BaseModelCategory> dataList = modelCategoryService.getAllBaseModelCategories();
        //过滤只有当前用户有权限的系统返回
//        List<BaseModelCategory> result = dataList.stream().filter(data -> filter.contains(data.getId())).collect(Collectors.toList());
        if (CollectionUtils.isEmpty(dataList)){
            return ResResultDto.ok(new ArrayList<>());
        }
        return ResResultDto.ok(this.getAllLogicModelDto(dataList.stream().map(BaseModelCategory::getId).collect(Collectors.toList())));
    }

    private List<ModelDto> getAllLogicModelDto(List<Long> categoryIds) {
        MultipleCriteria multipleCriteria = new MultipleCriteria();
//        multipleCriteria.addFieldEqualsCriteria("jdbcModel", true, false);
//        multipleCriteria.addFieldEqualsCriteria("logicalModel", true, false);
//        multipleCriteria.addFieldInCriteria("categoryId",categoryIds,true);
//        multipleCriteria.addFieldEqualsCriteria("type", "DATADICTIONARY", true);
//        multipleCriteria.addFieldEqualsCriteria("type", "DATADICTIONARY_LOGICAL", true);
        multipleCriteria.addFieldEqualsCriteria("type", "SMBSHAREFILE", true);
        List<ModelDto> modelDtoList = datablauRemoteDamModelService.getDataModel(multipleCriteria).list();

        Iterator<ModelDto> iterator = modelDtoList.iterator();
        while (iterator.hasNext()) {
            ModelDto modelDto = iterator.next();
            if (null != modelDto.getCategoryId()
                    && !categoryIds.contains(modelDto.getCategoryId())){
                iterator.remove();
            }
        }

        return modelDtoList;
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
//        logUtils.discernTask(discernTaskDto.getTaskName(), discernTaskDto.getModelName(), getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl(), "add");
    }

    @Operation(summary = "复制识别任务")
    @PostMapping(value = "/copy")
    public void copyTask(@RequestBody Map<String, Object> params) {
        DiscernTaskDto discernTaskDto = taskService.copyTask(params, getCurrentUser());
//        logUtils.discernTask(discernTaskDto.getTaskName(), null, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl(), "copy");
    }

    @Operation(summary = "删除识别任务")
    @DeleteMapping(value = "/{taskId}")
    public void deleteTask(@PathVariable("taskId") Long taskId) {
        DataAssetsDiscernTaskDetailDto discernTaskDetailVo = taskService.deleteTask(taskId);
//        logUtils.discernTask(discernTaskDetailVo.getTaskName(), discernTaskDetailVo.getModelName(), getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl(), "delete");

    }

    @Operation(summary = "修改识别任务")
    @PostMapping(value = "/update")
    public void updateTask(@RequestBody DiscernTaskDto discernTaskDto) {
        discernTaskDto.setUpdater(AuthTools.currentUsernameFailFast());
        taskService.updateTask(discernTaskDto);

    }

    @Operation(summary = "获取识别任务")
    @GetMapping(value = "/{taskId}")
    public ResResultDto<DataAssetsDiscernTaskDetailDto> getTask(@PathVariable("taskId") Long taskId) {
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
        taskService.enabledTask(enabled, taskId);
    }

    @Operation(summary = "运行任务")
    @PutMapping(value = "/{jobId}/{taskId}/run")
    public void runJobImmediately(@PathVariable("jobId") Long jobId,
                                  @PathVariable("taskId") Long taskId) throws Exception {
        jobService.executeJob(jobId, getCurrentUser());
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
