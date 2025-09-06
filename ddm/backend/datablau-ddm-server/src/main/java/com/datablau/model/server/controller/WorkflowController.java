package com.datablau.model.server.controller;

import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.model.common.api.MessageService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.api.LocalWorkflowService;
import com.datablau.model.data.api.ModelQualityReportService;
import com.datablau.model.data.dto.ModelQualityReportData;
import com.datablau.model.data.enums.ProcessType;
import com.datablau.model.data.jpa.entity.ModelQualityReport;
import com.datablau.model.data.jpa.entity.WorkflowProcessRecord;
import com.datablau.model.data.jpa.repository.WorkflowProcessRecordRepository;
import com.datablau.model.security.utility.AuthTools;
import com.datablau.model.server.dto.ReportCompleteInfo;
import com.datablau.model.server.utils.MicroserviceUtils;
import com.datablau.model.server.utils.enums.MicroserviceType;
import com.datablau.security.management.api.OrganizationService;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.dto.OrganizationDto;
import com.datablau.security.management.dto.UserDto;
import com.datablau.workflow.common.entity.dto.NodeHistoryDto;
import com.datablau.workflow.common.entity.dto.TaskDto;
import com.datablau.workflow.common.entity.dto.WorkflowProcessSceneQueryDto;
import com.datablau.workflow.common.entity.dto.query.TaskCompleteQueryDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

/**
 * 工作流相关api
 */
@RestController("workflowController")
@ConditionalOnMissingBean(name = "workflowControllerExt")
@RequestMapping("/workflow")
@Tag(name = "工作流相关REST API", description = "工作流相关REST API")
public class WorkflowController extends BaseController {

    protected static final ObjectMapper MAPPER = new ObjectMapper();

    @Value("${datablau.workflow.enable:false}")
    protected boolean workflowEnable;

    @Autowired
    protected ModelQualityReportService reportService;
    @Autowired
    protected MessageService msgService;
    @Autowired
    protected MicroserviceUtils microserviceUtils;
    @Autowired
    protected LocalWorkflowService localWorkflowService;
    @Autowired
    @Qualifier("userService")
    protected UserService userService;
    @Autowired
    @Qualifier("organizationService")
    protected OrganizationService organizationService;
    @Autowired
    protected WorkflowProcessRecordRepository workflowProcessRecordDao;

    @RequestMapping("/enable")
    @Operation(summary = "是否启用workflow微服务", description = "是否启用workflow微服务")
    public Map<String, String> workflowEnable() {
        Map<String, String> map = new HashMap<>();
        map.put("workflow_enable", String.valueOf(workflowEnable));
        return map;
    }

    @RequestMapping("/model/report/apply")
    @Operation(summary = "申请模型报告流程", description = "申请模型报告流程， id为模型报告id")
    public void modelReportProcessApply(@RequestParam Long id) {
        if (!workflowEnable) {
            throw new UnexpectedStateException("未启用workflow微服务");
        }
        // 1.校验当前报告是否正在审批中
        ModelQualityReportData report = reportService.getDdmModelQualityReportDetail(id, false);
        if (!Strings.isNullOrEmpty(report.getProcessInstanceId())) {
            throw new AndorjRuntimeException(msgService.getMessage("workflowModelReportApplying"));
        }
        // 2.组装请求参数，申请流程，返回实例ID
        WorkflowProcessRecord processRecord = new WorkflowProcessRecord();
        processRecord.setItemId(String.valueOf(report.getId()));
        processRecord.setItemType(ProcessType.MODEL_REPORT);
        processRecord.setItemName(report.getName());
        try {
            processRecord.setItemContent(MAPPER.writeValueAsString(report));
        } catch (Exception ignore) {
        }
        String instanceId = localWorkflowService.applyWorkflowProcess(processRecord, report.getModelId());
        // 3.更新模型流程ID
        reportService.updateDdmModelQualityReportWithProcessInstanceId(id, instanceId);
    }

    @RequestMapping("/model/report/task/complete")
    @Operation(summary = "办理任务", description = "办理任务nextFlow为是否通过，taskId为任务id，opinion为审批意见")
    public void taskComplete(@RequestHeader("Cookie") String cookie, @RequestBody ReportCompleteInfo reportCompleteInfo) {
        if (!workflowEnable) {
            throw new UnexpectedStateException("未启用workflow微服务");
        }
        String workflowUrl = microserviceUtils.getMicroserviceUrl(MicroserviceType.WORKFLOW);
        TaskCompleteQueryDto queryDto = new TaskCompleteQueryDto();
        queryDto.setComment(reportCompleteInfo.getOpinion());
        queryDto.setNextFlow(reportCompleteInfo.getNextFlow());
        queryDto.setTaskId(reportCompleteInfo.getTaskId());
        queryDto.setUsername(AuthTools.currentUsername());
        localWorkflowService.taskComplete(cookie, workflowUrl, queryDto);
    }

    @RequestMapping("/model/report/task/list")
    @Operation(summary = "获取模型报告的审批人信息", description = "获取模型报告的审批人信息")
    public Map<String, Object> modelReportProcessTaskList(@RequestHeader("Cookie") String cookie, @RequestParam Long id) {
        if (!workflowEnable) {
            throw new UnexpectedStateException("未启用workflow微服务");
        }

        ModelQualityReportData report = reportService.getDdmModelQualityReportDetail(id, false);
        if (report == null || Strings.isNullOrEmpty(report.getProcessInstanceId())) {
            return new HashMap<>();
        }

        String workflowUrl = microserviceUtils.getMicroserviceUrl(MicroserviceType.WORKFLOW);
        NodeHistoryDto[] nodeList = localWorkflowService.getInstanceNodeList(cookie, workflowUrl, report.getProcessInstanceId());
        List<TaskDto> tasks = new LinkedList<>();
        for (NodeHistoryDto dto : nodeList) {
            List<TaskDto> taskList = dto.getTasks();
            if (taskList != null) {
                for (TaskDto taskDto : taskList) {
                    UserDto user = userService.getUser(taskDto.getAssignee());
                    if (user != null) {
                        OrganizationDto organization = organizationService.getOrganizationsByBm(user.getBm());
                        if (organization != null) {
                            taskDto.setDepartment(organization.getFullName());
                        }
                    }
                }
                tasks.addAll(taskList);
            }
        }
        Map<String, Object> map = new HashMap<>();
        map.put("tasks", tasks);
        return map;
    }

    @PostMapping("/scene/bind")
    @Operation(summary = "绑定某个场景下流程的关系")
    public void bindProcessScene(@RequestHeader("Cookie") String cookie,
                                 @RequestBody WorkflowProcessSceneQueryDto queryDto) {
        if (!workflowEnable) {
            throw new UnexpectedStateException("未启用workflow微服务");
        }
        String key = queryDto.getKey();
        if (Strings.isNullOrEmpty(key)) {
            throw new InvalidArgumentException("模型id不能为空");
        }
        String workflowUrl = microserviceUtils.getMicroserviceUrl(MicroserviceType.WORKFLOW);
        localWorkflowService.bindProcessScene(cookie, workflowUrl, queryDto, Long.valueOf(key));
    }

    @GetMapping("/process/{instanceId}")
    @Operation(summary = "查询本地审批表单记录")
    public WorkflowProcessRecord findWorkflowProcessRecordById(@PathVariable String instanceId) {
        return workflowProcessRecordDao.findWorkflowProcessRecordById(instanceId);
    }
}
