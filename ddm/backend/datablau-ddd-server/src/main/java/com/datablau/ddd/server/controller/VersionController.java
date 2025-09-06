package com.datablau.ddd.server.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.alibaba.fastjson.JSONArray;
import com.andorj.model.common.api.MessageService;
import com.datablau.ddd.common.dto.ResultWrapper;
import com.datablau.ddd.common.enums.FileTypeEnum;
import com.datablau.ddd.common.exception.BusinessException;
import com.datablau.ddd.data.dto.ProjectVersionDto;
import com.datablau.ddd.data.dto.ResResultDto;
import com.datablau.ddd.data.enums.OperandType;
import com.datablau.ddd.data.enums.OperationType;
import com.datablau.ddd.data.jpa.entity.FileWorkFlowMapping;
import com.datablau.ddd.data.jpa.entity.type.OperationProjectType;
import com.datablau.ddd.data.jpa.repository.DsProjectMappingRepository;
import com.datablau.ddd.ds.service.DolphinSchedulerDataxService;
import com.datablau.ddd.ds.service.DolphinSchedulerProjectService;
import com.datablau.ddd.server.annotation.OperaLog;
import com.datablau.ddd.server.service.api.CodeTreeService;
import com.datablau.ddd.server.service.api.DsEnvService;
import com.datablau.ddd.server.service.api.ProjectService;
import com.datablau.ddd.server.service.api.VersionService;
import com.datablau.security.management.utils.AuthTools;
import com.datablau.workflow.common.api.DatablauRemoteWorkflowService;
import com.datablau.workflow.common.entity.dto.WorkflowFormDto;
import com.datablau.workflow.common.entity.dto.query.WorkflowApplyQueryDto;
import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/version")
public class VersionController {

    @Autowired
    DatablauRemoteWorkflowService datablauRemoteWorkflowService;

    @Autowired
    DolphinSchedulerDataxService dolphinSchedulerDataxService;

    @Autowired
    DsEnvService dsEnvService;

    @Autowired
    VersionService versionService;

    @Autowired
    CodeTreeService codeTreeService;

    @Autowired
    MessageService msgService;

    @Autowired
    DsProjectMappingRepository dsProjectMappingRepository;

    @Autowired
    DolphinSchedulerProjectService dolphinSchedulerProjectService;

    @Autowired
    ProjectService projectService;

    @OperaLog(operation = OperationType.ONCLICK, operand = OperandType.PUBLISH, operateTable = "ddd_project_version", systemModule = OperationProjectType.PROJECT_MANAGEMENT, description = {
            "版本发布"})
    @Operation(summary = "版本发布", description = "版本发布")
    @PostMapping(value = "/file/publish/{projectName}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResResultDto<String> publishVersion(@RequestPart(required = false) MultipartFile multipartFile,
                                               @RequestParam Long projectId,
                                               @RequestParam String version,
                                               @RequestParam List<Long> workflowCode,
                                               @PathVariable String projectName,
                                               @RequestParam String requirementName,
                                               @RequestParam(value = "env", required = false) String env) throws IOException {
        String username = AuthTools.currentUsernameFailFast();

        WorkflowApplyQueryDto applyQueryDto = new WorkflowApplyQueryDto();
        List<WorkflowFormDto> list = new ArrayList<>();
        JSONArray idJson = new JSONArray();
        list.add(new WorkflowFormDto("projectId", String.valueOf(projectId)));
        list.add(new WorkflowFormDto("dataModelInfo", version));

        List<Long> codeDetailIds = new ArrayList<>();
        List<Long> modelTreeNodeIds = new ArrayList<>();
        StringBuilder exportCodes = new StringBuilder();
        workflowCode.forEach(item -> {
            exportCodes.append(item).append(",");
            ResultWrapper<?> resultWrapper = codeTreeService.getMapping(String.valueOf(item));
            ArrayList<FileWorkFlowMapping> resultList = (ArrayList) ((HashMap) resultWrapper.getData()).get(item);
            resultList.forEach(relativeItem -> {
                if (FileTypeEnum.FILE == relativeItem.getFileType()) {
                    codeDetailIds.add(relativeItem.getFileDetailId());
                }
                if (FileTypeEnum.MODEL == relativeItem.getFileType()) {
                    modelTreeNodeIds.add(relativeItem.getFileDetailId());
                }
            });
        });
        boolean flag = versionService.IsExistedVersion(projectId, version);
        if (flag) {
            throw new BusinessException(msgService.getMessage("重复版本或该版本待审批"));
        }

        Long projectCode = dsProjectMappingRepository.getProjectCodeByProjectId(projectId);
        String processDefinition = dolphinSchedulerProjectService.exportWorkflow(projectCode, workflowCode, "test");
        Long id = versionService.publishVersion(projectId, version,
                codeDetailIds, modelTreeNodeIds, username, processDefinition, multipartFile, requirementName);
        idJson.add(String.valueOf(id));
        idJson.add(projectName);
        list.add(new WorkflowFormDto("dataModelType", idJson.toJSONString()));

        // 7.0新增 任何流程必填的三类表单 申请人和流程名称
        list.add(new WorkflowFormDto(DatablauRemoteWorkflowService.START_USER_ID, username));
        list.add(new WorkflowFormDto(DatablauRemoteWorkflowService.PROCESS_INSTANCE_NAME,
                projectName + "(" + version + ")"));

        applyQueryDto.setProcessCode("PROJECT_PUBLISH_INIT");
        applyQueryDto.setFormDefs(list);
        try {
            datablauRemoteWorkflowService.applyProcess(applyQueryDto);
        } catch (Exception e) {
            versionService.deleteVersionById(id);
            return ResResultDto.error("工作流发布失败");
        }

        return ResResultDto.ok(String.valueOf(id));
    }

    @Operation(summary = "获取项目下版本列表", description = "获取项目下版本列表")
    @GetMapping("/list")
    public List<ProjectVersionDto> getProjectVersions(@RequestParam("projectId") Long projectId) {
        return versionService.getProjectVersions(projectId);
    }

    @OperaLog(operation = OperationType.ONCLICK, operand = OperandType.PUBLISH, operateTable = "ddd_project_version", systemModule = OperationProjectType.PROJECT_MANAGEMENT, description = {
            "下载版本文档"})
    @Operation(summary = "下载版本文档", description = "下载版本文档")
    @PostMapping("/document/{id}")
    public HttpServletResponse downloadDocument(@PathVariable(value = "id") Long id,
                                                HttpServletResponse response) throws IOException {
        return versionService.downloadDocument(id, response);
    }

    @OperaLog(operation = OperationType.ONCLICK, operand = OperandType.PUBLISH, operateTable = "ddd_project_version", systemModule = OperationProjectType.PROJECT_MANAGEMENT, description = {
            "下载工作流信息"})
    @Operation(summary = "下载工作流信息", description = "下载工作流信息")
    @PostMapping("/workflow/{id}")
    public void downloadWorkflow(@PathVariable(value = "id") Long id,
                                 @RequestParam("env") String env,
                                 HttpServletResponse response) throws IOException {
        versionService.downloadWorkflow(id, env, response);
    }

    @Operation(summary = "下载审批信息", description = "下载审批信息")
    @PostMapping("/approval/{id}")
    public void downloadApproval(@PathVariable(value = "id") Long id,
                                 HttpServletResponse response) throws IOException {
        versionService.downloadApproval(id, response);
    }

    @Operation(summary = "获取ddd版本信息", description = "获取ddd版本信息")
    @GetMapping("/about")
    public String versionAbout() {
        return "7.0";
    }
}
