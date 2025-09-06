package com.datablau.workflow.main.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.utils.ExceptionUtils;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.type.SystemType;
import com.datablau.security.management.api.RoleService;
import com.datablau.workflow.common.entity.dto.ProcessTypeDto;
import com.datablau.workflow.common.entity.dto.WorkflowDetailInfoDto;
import com.datablau.workflow.common.entity.dto.WorkflowFormDto;
import com.datablau.workflow.common.entity.dto.WorkflowProcessBindDto;
import com.datablau.workflow.common.entity.dto.WorkflowProcessInfoDto;
import com.datablau.workflow.common.entity.dto.WorkflowProcessParamDto;
import com.datablau.workflow.common.entity.dto.WorkflowProcessSceneDto;
import com.datablau.workflow.common.entity.dto.WorkflowProcessSceneQueryDto;
import com.datablau.workflow.common.entity.dto.query.TaskCompleteQueryDto;
import com.datablau.workflow.common.entity.dto.query.WorkflowApplyQueryDto;
import com.datablau.workflow.common.entity.dto.query.WorkflowFormQueryDto;
import com.datablau.workflow.common.entity.type.FormDefType;
import com.datablau.workflow.common.utils.PageVo;
import com.datablau.workflow.main.entity.WorkflowForm;
import com.datablau.workflow.main.entity.WorkflowFormDef;
import com.datablau.workflow.main.entity.WorkflowProcessBind;
import com.datablau.workflow.main.entity.WorkflowProcessCategory;
import com.datablau.workflow.main.service.WorkflowFormService;
import com.datablau.workflow.main.service.WorkflowProcessBindService;
import com.datablau.workflow.main.service.WorkflowProcessCategoryService;
import com.datablau.workflow.main.service.WorkflowProcessService;
import com.datablau.workflow.main.util.ServerConstants;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.util.Pair;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 流程定义相关api
 */
@RestController
@RequestMapping("/workflow/process")
@Description("流程定义相关api")
public class WorkflowProcessController extends BaseController {

    @Autowired
    private WorkflowProcessService processService;
    @Autowired
    private WorkflowFormService formService;
    @Autowired
    private WorkflowProcessBindService processBindService;
    @Autowired
    private WorkflowProcessCategoryService processCategoryService;

    public WorkflowProcessController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }


    /**
     * 查询流程信息，不分页
     */
    @PostMapping("/list")
    @Description("根据类型查询流程列表")
    public List<WorkflowProcessInfoDto> getWorkflowProcessListByType(@RequestParam("type") String type,
                                                                     @RequestParam(name = "parentId", required = false, defaultValue = "1") String parentId) {
        List<WorkflowProcessInfoDto> result = processService.getWorkflowProcessListByType(type);
        result.forEach(info -> info.setParentId(parentId));
        return result;
    }

    /**
     * 编辑某个流程的信息
     */
    //@OperatorLog(
    //        operation = OperationLogType.TABLE_MODIFY,
    //        operateTable = "wfs_workflow_process",
    //        systemModule = OperationModuleType.SYSTEM_WORKFLOWCENTER,
    //        description = "新建或编辑流程，modelId为: {param}",
    //        descriptionParamClass = WorkflowProcessParamDto.class,
    //        descriptionParamMethod = "getName"
    //)
    @RequestMapping(value = "/", method = RequestMethod.POST)
    @Description("编辑某个流程的信息")
    public void createOrModifyWorkflowProcess(@RequestBody WorkflowProcessParamDto process) {
        processService.createOrModifyWorkflowProcess(process);
    }

    /**
     * 删除某个流程，包括节点以及绑定关系
     */
    //@OperatorLog(
    //        operation = OperationLogType.TABLE_DELETE,
    //        operateTable = "wfs_workflow_process",
    //        systemModule = OperationModuleType.SYSTEM_WORKFLOWCENTER,
    //        description = "删除流程，modelId为: {param}",
    //        descriptionParamClass = Long.class,
    //        descriptionParamMethod = "toString"
    //)
    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    @Description("删除某个流程，包括节点以及绑定关系")
    public void deleteWorkflowProcess(@PathVariable("id") Long id) {
        processService.deleteWorkflowProcess(id);
    }

    /**
     * 判断流程名称是否存在
     */
    @RequestMapping(value = "/name/exists", method = RequestMethod.GET)
    @Description("判断流程名称是否存在")
    public boolean processNameExists(@RequestParam("processName") String processName) {
        return processService.ifProcessNameExists(processName);
    }

    /**
     * 返回所有流程的类型
     */
    @RequestMapping(value = "/type", method = RequestMethod.GET)
    @Description("返回所有流程的类型")
    public List<WorkflowProcessCategory> getProcessType(@RequestParam Set<String> appName) {
        return processCategoryService.getWorkflowProcessCategory(getAppNames(appName));
    }

    /**
     * 返回所有流程的类型
     */
    //@OperatorLog(
    //        operation = OperationLogType.TABLE_QUERY,
    //        operateTable = "wfs_workflow_process_category",
    //        systemModule = OperationModuleType.SYSTEM_WORKFLOWCENTER,
    //        description = "查询流程中心"
    //)
    @PostMapping(value = "/type/info")
    @Description("返回所有流程的类型")
    public List<ProcessTypeDto> getProcessTypeInfo(@RequestParam(required = false) String keyword,
                                                   @RequestParam Set<String> appName) {
        return processService.getProcessTypeInfo(keyword, getAppNames(appName));
    }

    private Set<SystemType> getAppNames(Set<String> appName) {
        Set<SystemType> appNames = new HashSet<>();
        if (appName != null && !appName.isEmpty()) {
            for (String st : appName) {
                try {
                    appNames.add(SystemType.valueOf(st.toUpperCase()));
                } catch (Exception ignore) {
                }
            }
        }
        return appNames;
    }

    /**
     * 获取流程的绑定关系
     */
    @RequestMapping(value = "/bind", method = RequestMethod.GET)
    @Description("获取流程的绑定关系")
    public List<WorkflowProcessBindDto> getWorkflowProcessBind() {
        return processBindService.getWorkflowProcessBind();
    }

    /**
     * 编辑流程的绑定关系
     */
    @RequestMapping(value = "/bind", method = RequestMethod.POST)
    @Description("编辑流程的绑定关系")
    public void modifyWorkflowProcessBind(@RequestBody WorkflowProcessBind bind) {
        processBindService.saveOrModifyWorkflowProcessBind(bind);
    }

    /**
     * 删除流程的绑定关系
     */
    @RequestMapping(value = "/unbind/{id}", method = RequestMethod.GET)
    @Description("删除流程的绑定关系")
    public void deleteWorkflowProcessBind(@PathVariable("id") Long id) {
        processBindService.deleteWorkflowProcessBind(id);
    }

    /**
     * 添加或者修改表单
     */
    @RequestMapping(value = "/form", method = RequestMethod.POST)
    @Description("添加或者修改表单")
    public void addWorkflowProcessBind(@RequestBody WorkflowForm form) {
        formService.addWorkflowForm(form);
    }

    /**
     * 删除表单
     */
    @RequestMapping(value = "/form/{id}", method = RequestMethod.DELETE)
    @Description("删除表单")
    public void deleteWorkflowForm(@PathVariable("id") Long id) {

        formService.deleteWorkflowForm(id);
    }

    /**
     * 查询表单
     */
    @RequestMapping(value = "/form/page", method = RequestMethod.POST)
    @Description("查询表单")
    public PageVo<WorkflowForm> getWorkflowForm(@RequestBody WorkflowFormQueryDto dto) {
        return formService.getWorkflowForm(dto);
    }

    /**
     * 获得表单定义
     */
    @RequestMapping(value = "/form/def/{formId}", method = RequestMethod.GET)
    @Description("获得表单定义")
    public List<WorkflowFormDef> getWorkflowFormDefByFormId(@PathVariable("formId") Long id) {
        return formService.getWorkflowFormDefByFormId(id);
    }

    /**
     * 修改表单定义
     */
    @RequestMapping(value = "/form/def/{formId}", method = RequestMethod.POST)
    @Description("修改表单定义")
    public void saveWorkflowFormDefByFormId(@RequestBody List<WorkflowFormDef> formDefs,
                                            @PathVariable("formId") Long id) {
        formService.saveWorkflowFormDefByFormId(formDefs, id);
    }

    /**
     * 获得表单定义的数据类型
     */
    @RequestMapping(value = "/form/def/type", method = RequestMethod.GET)
    @Description("获得表单定义的数据类型")
    public List<Pair<String, String>> getWorkflowFormDefTypes() {
        List<Pair<String, String>> result = new ArrayList<>();
        for (FormDefType type : FormDefType.values()) {
            if (type.equals(FormDefType.LABEL_JSON) || type.equals(FormDefType.VALUE_JSON)) {
                continue;
            }
            result.add(Pair.of(type.toString(), type.getName()));
        }
        return result;
    }

    /**
     * 绑定表单到具体流程
     */
    @RequestMapping(value = "/form/bind", method = RequestMethod.GET)
    @Description("绑定表单到具体流程")
    public void bindWorkflowFormToProcess(@RequestParam("formId") Long formId,
                                          @RequestParam("processId") Long processId) {
        formService.bindFormToProcess(formId, processId);
    }

    /**
     * 根据流程类型返回表单数据
     */
    @RequestMapping(value = "/apply/form", method = RequestMethod.GET)
    @Description("根据流程类型返回表单数据")
    public List<WorkflowFormDto> getWorkflowFormByProcessType(@RequestParam("processType") String processType) {
        return formService.getWorkflowFormInfoByProcessType(processType);
    }

    /**
     * 部署流程
     */
    //@OperatorLog(
    //        operation = OperationLogType.TABLE_MODIFY,
    //        operateTable = "wfs_workflow_process",
    //        systemModule = OperationModuleType.SYSTEM_WORKFLOWCENTER,
    //        description = "部署流程，modelId为: {param}",
    //        descriptionParamClass = Long.class,
    //        descriptionParamMethod = "toString"
    //)
    @RequestMapping(value = "/deploy/{id}", method = RequestMethod.GET)
    @Description("部署流程")
    public void deployWorkflowProcess(@PathVariable("id") Long id) {
        processService.deployWorkflowProcess(id);
    }

    /**
     * 申请流程
     */
    @RequestMapping(value = "/apply", method = RequestMethod.POST)
    @Description("申请流程")
    public void applyWorkflowProcess(@RequestBody WorkflowApplyQueryDto applyQueryDto) {
        processService.applyWorkflowProcess(applyQueryDto);
    }

    /**
     * 流程详情
     *
     * @throws JsonProcessingException 抛出异常
     */
    @RequestMapping(value = "/detail/info", method = RequestMethod.GET)
    @Description("流程详情")
    public WorkflowDetailInfoDto applyWorkflowProcessList(
            @RequestParam("processInstanceId") String processInstanceId,
            @RequestParam(value = "taskId", required = false) String taskId,
            @RequestParam(value = "type", defaultValue = "1") int type) throws JsonProcessingException {
        return processService.getWorkflowDetailInfo(processInstanceId, taskId, type);
    }

    /**
     * 办理任务
     */
    @RequestMapping(value = "/task/complete", method = RequestMethod.POST)
    @Description("办理任务")
    public void taskComplete(@RequestBody TaskCompleteQueryDto dto) {
        try {
            processService.taskComplete(dto);
        } catch (Exception e) {
            ExceptionUtils.throwDefinitionException(e);
        }
    }

    /**
     * 复制流程图
     */
    @RequestMapping(value = "/copy/graph", method = RequestMethod.GET)
    @Description("复制流程图")
    public void copyGraph(@RequestParam("sourceProcessId") Long sourceProcessId, @RequestParam("targetProcessId") Long targetProcessId) {
        try {
            processService.copyProcessGraph(sourceProcessId, targetProcessId);
        } catch (Exception e) {
            ExceptionUtils.throwDefinitionException(e);
        }
    }

    /**
     * 查询流程实例办理结果
     */
    @RequestMapping(value = "/instance/getResult", method = RequestMethod.POST)
    @Description("查询流程实例办理结果")
    public String getProcessResult(@RequestParam String processInstanceId) {
        return processService.getProcessInstanceResult(processInstanceId);
    }

    /**
     * 获取某个场景下流程的绑定关系
     */
    @RequestMapping(value = "/scene/getScene", method = RequestMethod.POST)
    @Description("获取某个场景下流程的绑定关系")
    public List<WorkflowProcessSceneDto> getProcessSceneList(@RequestParam("scene")  String sceneCode) {
        return processService.getProcessSceneList(sceneCode);
    }

    /**
     * 绑定某个场景下流程的关系
     */
    @RequestMapping(value = "/scene/bind", method = RequestMethod.POST)
    @Description("绑定某个场景下流程的关系")
    public void bindProcessScene(@RequestBody WorkflowProcessSceneQueryDto queryDto) {
        processBindService.bindProcessScene(queryDto);
    }

    @RequestMapping(value = "/scene/getBind", method = RequestMethod.POST)
    @Description("查询某个场景下key绑定的流程")
    public WorkflowProcessBindDto getBindByItemId(@RequestBody WorkflowProcessSceneQueryDto queryDto) {
        return processBindService.getBindByItemId(queryDto.getKey(), queryDto.getSceneCode(), queryDto.getProcessType());
    }

}
