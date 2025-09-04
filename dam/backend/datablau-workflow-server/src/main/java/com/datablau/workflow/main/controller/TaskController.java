package com.datablau.workflow.main.controller;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.model.common.api.MessageService;
import com.datablau.data.common.api.OperationLogService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.project.util.UserRights;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import com.datablau.workflow.common.entity.dto.NodeHistoryDto;
import com.datablau.workflow.common.entity.dto.ProcessInstanceDto;
import com.datablau.workflow.common.entity.dto.TaskDto;
import com.datablau.workflow.common.entity.dto.query.TaskCompleteQueryDto;
import com.datablau.workflow.common.entity.dto.query.TaskQueryDto;
import com.datablau.workflow.common.utils.PageVo;
import com.datablau.workflow.main.service.ProcessCommonService;
import com.datablau.workflow.main.service.ProcessService;
import com.datablau.workflow.main.service.TaskService;
import com.datablau.workflow.main.service.TaskServiceExt;
import com.datablau.workflow.main.util.ServerConstants;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URLDecoder;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 任务节点api
 */
@RestController
@RequestMapping("/task")
public class TaskController extends BaseController {
    private static final Logger LOGGER = LoggerFactory.getLogger(TaskController.class);

    private ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Autowired
    private TaskService taskService;
    @Autowired
    private MessageService msgService;
    @Autowired
    private ProcessCommonService commonService;
    @Autowired
    private ProcessService processService;
    @Autowired
    private OperationLogService operationLogService;

    @Autowired
    private TaskServiceExt taskServiceExt;

    public TaskController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }


    /**
     * 查询办理任务
     * @param query 查询条件
     * @return 返回分页结果
     */
    @RequestMapping(value = "/todopage", method = RequestMethod.POST)
    public PageVo<TaskDto> todoListChange(@RequestBody TaskQueryDto query) {
        String username = AuthTools.currentUsernameFailFast();
        query.setUsername(username);
        return taskService.todoList(query);
    }

    /**
     * 查询某个任务的详细信息
     * @param query 查询条件
     * @param taskId 任务节点id
     * @return 返回节点信息
     */
    @RequestMapping(value = "/todo/{taskId}", method = RequestMethod.POST)
    public TaskDto todoTaskSingleInfo(@RequestBody TaskQueryDto query,
                                          @PathVariable("taskId") String taskId) {
        String username = AuthTools.currentUsernameFailFast();
        query.setUsername(username);
        return taskService.todoTaskSingleInfo(query, taskId);
    }

    /**
     * 查询已办任务
     * @param query 查询条件
     * @return 返回分页信息
     */
    @RequestMapping(value = "/done", method = RequestMethod.POST)
    public PageVo<TaskDto> doneList(@RequestBody TaskQueryDto query) {
        String username = AuthTools.currentUsernameFailFast();
        query.setUsername(username);
        return taskService.doneList(query);
    }

    /**
     * 当年累计处理审批流程（次）：当前自然年内的数据元标准，所有发布、变更、废弃次数之和。
     * @return 返回分页信息
     */
    @RequestMapping(value = "/domainDone", method = RequestMethod.POST)
    public int domainDone() {
        return taskServiceExt.domainDone();
    }

    /**
     * 查询流程实例
     * allApply=true，查询所有人的申请（流程监控）
     * allApply=false，查询本人的申请（我的申请）
     * @param query 查询信息
     * @return 返回分页结果
     * @throws InvalidArgumentException 判断是否有查询所有人的权限
     */
    @RequestMapping(value = "/myApply", method = RequestMethod.POST)
    @PreAuthorize(UserRights.HAS_BASE_WORKFLOW_MONITOR_MANAGE_ROLE)
    public PageVo<ProcessInstanceDto> myApplyList(@RequestBody TaskQueryDto query) {
        if (!query.getAllApply()) {
            query.setStartUserId(AuthTools.currentUsernameFailFast());
        }

        PageVo<ProcessInstanceDto> pageVo = taskService.myApplyList(query);
        return pageVo;
    }

    /**
     * 办理任务
     * @param taskCompleteQueryDto 任务节点信息
     */
    @RequestMapping(value = "/complete", method = RequestMethod.POST)
    public void taskComplete(@RequestBody TaskCompleteQueryDto taskCompleteQueryDto) {
        taskCompleteQueryDto.setUsername(AuthTools.currentUsernameFailFast());
        taskService.taskComplete(taskCompleteQueryDto);
    }

    /**
     * 签收任务
     * 现在把签收放在办理任务中了
     * @param taskId 任务节点id
     */
    @RequestMapping(value = "/sign/{taskId}", method = RequestMethod.GET)
    public void signFor(@PathVariable("taskId") String taskId) {
        String username = AuthTools.currentUsernameFailFast();
        taskService.signFor(taskId, username);
    }

    /**
     * 转办任务，将任务交给另一个人办理
     * @param taskId 任务节点id
     * @param assignee 要转办给的人
     */
    @RequestMapping(value = "/transfer/{taskId}", method = RequestMethod.GET)
    public void transfer(@PathVariable("taskId") String taskId,
                         @RequestParam("assignee") String assignee) {
        try {
            assignee = URLDecoder.decode(assignee, "UTF-8");
        } catch (Exception ignored) {

        }
        taskService.signFor(taskId, assignee);
    }

    /**
     * 跳转到某个任务几点
     * @param taskId 任务id
     * @param tagTaskId 要跳转的任务id
     */
    @RequestMapping(value = "/jump/{taskId}", method = RequestMethod.GET)
    public void jumpToTask(@PathVariable("taskId") String taskId,
                           @RequestParam("tagTaskId") String tagTaskId) {
        taskService.jumpToTask(taskId, tagTaskId);
    }

    /**
     * 跳转到某个节点
     * @param taskId 当前任务id
     * @param tagActivityId 要跳转到的节点id
     */
    @RequestMapping(value = "/jump/activity/{taskId}", method = RequestMethod.GET)
    public void jumpToActivity(@PathVariable("taskId") String taskId,
                               @RequestParam("tagActivityId") String tagActivityId) {
        taskService.jumpToActivity(taskId, tagActivityId);
    }

    /**
     * 判断某个节点是否是多实例
     * @param taskId 节点id
     * @return 返回true或者false
     */
    @RequestMapping(value = "/isMultiInstance/{taskId}", method = RequestMethod.GET)
    public boolean isMultiInstance(@PathVariable("taskId") String taskId) {
        return commonService.isMultiInstance(taskId);
    }

    /**
     * 查询某个流程实例的任务节点历史
     * @param processInstanceId 流程实例id
     * @return 返回任务节点
     */
    @RequestMapping(value = "/history/node/{processInstanceId}", method = RequestMethod.GET)
    public List<NodeHistoryDto> hisTask(@PathVariable("processInstanceId") String processInstanceId) {
        return taskService.hisNodeList(processInstanceId);
    }

    @RequestMapping(value = "/counts", method = RequestMethod.POST)
    public Map<String, Long> getCounts(@RequestBody TaskQueryDto query) throws JsonProcessingException {
        String username = AuthTools.currentUsernameFailFast();
        query.setUsername(username);
        // deep copy
        TaskQueryDto applyQuery = OBJECT_MAPPER.readValue(OBJECT_MAPPER.writeValueAsString(query), TaskQueryDto.class);
        TaskQueryDto assignQuery = OBJECT_MAPPER.readValue(OBJECT_MAPPER.writeValueAsString(query), TaskQueryDto.class);
        TaskQueryDto finishedQuery = OBJECT_MAPPER.readValue(OBJECT_MAPPER.writeValueAsString(query), TaskQueryDto.class);

        Long applyCounts = taskService.getApplyingTaskCounts(applyQuery);
        Long assignCounts = taskService.getTaskAssigneeCounts(assignQuery);
        Long finishedCounts = taskService.getFinishedTaskCounts(finishedQuery);

        Map<String, Long> result = new HashMap<>();
        result.put("applyingCounts", applyCounts);
        result.put("assigneeCounts", assignCounts);
        result.put("finishedCounts", finishedCounts);

        return result;
    }

    @RequestMapping(value = "/maps", method = RequestMethod.POST)
    public Map<String, Long> getMaps(@RequestBody TaskQueryDto query){
        String username = AuthTools.currentUsernameFailFast();
        query.setUsername(username);

        return taskService.getTaskAssigneeByApplyType(query);
    }
}
