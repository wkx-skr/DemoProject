package com.datablau.ddd.server.controller;

import io.swagger.v3.oas.annotations.Parameter;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.ss.formula.functions.T;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import javax.servlet.http.HttpServletResponse;
import javax.validation.constraints.NotNull;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.andorj.model.common.api.MessageService;
import com.datablau.ddd.common.enums.ProjectStatusEnum;
import com.datablau.ddd.common.enums.ProjectTypeEnum;
import com.datablau.ddd.common.exception.BusinessException;
import com.datablau.ddd.data.dto.DsProjectMappingDto;
import com.datablau.ddd.data.dto.PageableResult;
import com.datablau.ddd.data.dto.ProjectAuthDto;
import com.datablau.ddd.data.dto.ProjectDto;
import com.datablau.ddd.data.dto.ProjectExportDto;
import com.datablau.ddd.data.dto.ProjectUserDto;
import com.datablau.ddd.data.dto.PublishWorkflowDto;
import com.datablau.ddd.data.dto.RequirementDto;
import com.datablau.ddd.data.dto.ResResultDto;
import com.datablau.ddd.data.dto.dolphinscheduler.DsTenantDto;
import com.datablau.ddd.data.dto.dolphinscheduler.ResultDto;
import com.datablau.ddd.data.enums.OperandType;
import com.datablau.ddd.data.enums.OperationType;
import com.datablau.ddd.data.jpa.entity.DsProjectMapping;
import com.datablau.ddd.data.jpa.entity.ProdDatasourceMapping;
import com.datablau.ddd.data.jpa.entity.Project;
import com.datablau.ddd.data.jpa.entity.ProjectAuth;
import com.datablau.ddd.data.jpa.entity.type.OperationProjectType;
import com.datablau.ddd.data.jpa.vdp.OperationLog;
import com.datablau.ddd.ds.service.DolphinSchedulerProjectService;
import com.datablau.ddd.ds.service.DolphinSchedulerUserService;
import com.datablau.ddd.lineage.service.ProjectLineageImportService;
import com.datablau.ddd.security.utility.AuthTools;
import com.datablau.ddd.server.annotation.OperaLog;
import com.datablau.ddd.server.service.api.DsProjectBindingService;
import com.datablau.ddd.server.service.api.OperationLogService;
import com.datablau.ddd.server.service.api.PermissionHelper;
import com.datablau.ddd.server.service.api.ProjectAuthService;
import com.datablau.ddd.server.service.api.ProjectService;
import com.datablau.metric.management.api.MetricService;
import com.datablau.server.DatasourceBaseService;
import com.datablau.workflow.common.api.DatablauRemoteWorkflowService;
import com.fasterxml.jackson.core.JsonProcessingException;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "项目管理")
@RestController
@RequestMapping(value = "/project")
public class ProjectController {

    @Autowired
    MessageService msgService;
    @Autowired
    ProjectService projectService;

    @Autowired
    OperationLogService operationLogService;
    @Autowired
    MessageService messageService;

    @Autowired
    PermissionHelper permissionHelper;

    @Autowired
    DsProjectBindingService dsProjectBindingService;

    @Autowired
    ProjectAuthService projectAuthService;

    @Autowired
    DolphinSchedulerProjectService dolphinSchedulerProjectService;
    @Autowired
    DatablauRemoteWorkflowService datablauRemoteWorkflowService;
    @Autowired
    DolphinSchedulerUserService dolphinSchedulerUserService;
    @Autowired
    DatasourceBaseService datasourceBaseService;

    @Autowired
    private ProjectLineageImportService projectLineageImportService;

    @Autowired
    MetricService metricService;

    private final String PROJECTNOTFOUND = "projectNotExist";

    @Operation(summary = "获取所有项目列表", description = "获取所有项目列表")
    @GetMapping("/list")
    public PageableResult<Project> getAllProjects(@RequestParam Integer currentPage,
                                                  @RequestParam Integer pageSize,
                                                  @RequestParam(required = false) String orgId,
                                                  @RequestParam(required = false) String name,
                                                  @RequestParam(required = false) Integer type,
                                                  @RequestParam(required = false, defaultValue = "createTime") String orderBy,
                                                  @RequestParam(required = false, defaultValue = "false") Boolean asc,
                                                  @RequestParam(required = false) String labelId) {
        return projectService.getAllProjects(currentPage, pageSize, orgId, name, type, orderBy, asc, labelId);
    }

    @Operation(summary = "根据项目id获取项目", description = "根据项目id获取项目")
    @GetMapping("/id/{projectId}")
    public Project getProjectById(@PathVariable(value = "projectId") @NotNull Long projectId) {
        Project project = projectService.getProjectById(projectId);

        if (project == null) {
            throw new BusinessException(msgService.getMessage(PROJECTNOTFOUND));
        }

        return project;
    }

    @Operation(summary = "根据Dolphinscheduler项目Code获取项目", description = "根据Dolphinscheduler项目Code获取项目")
    @GetMapping("/dscode/{projectCode}")
    public Project getProjectByDsProjectCode(@PathVariable(value = "projectCode") @NotNull Long projectCode) {
        DsProjectMapping dsProjectMapping = dsProjectBindingService.getDsProjectMappingByDsProjectCode(projectCode);
        if (dsProjectMapping == null) {
            throw new BusinessException(msgService.getMessage("bindingNotExist"));
        }

        Project project = projectService.getProjectById(dsProjectMapping.getDddProjectId());
        if (project == null) {
            throw new BusinessException(msgService.getMessage(PROJECTNOTFOUND));
        }

        return project;
    }

    @GetMapping("/ds-project-mapping/{dddProjectId}")
    public DsProjectMapping getDsProjectMapping(@PathVariable(value = "dddProjectId") @NotNull Long dddProjectId) {
        return dsProjectBindingService.getDsProjectMappingByDddProjectId(dddProjectId);
    }

    @Operation(summary = "根据项目名获取项目", description = "根据项目名获取项目")
    @GetMapping("/name/{projectName}")
    public Project getProjectByName(@PathVariable(value = "projectName") @NotNull String projectName) {
        Project project = projectService.getProjectByName(projectName);

        if (project == null) {
            throw new BusinessException(msgService.getMessage(PROJECTNOTFOUND));
        }

        return project;
    }
    @OperaLog(operation = OperationType.INSERT, operand = OperandType.PROJECT, operateTable = "ddd_project", systemModule = OperationProjectType.PROJECT_MANAGEMENT, description = {
            "创建项目"})
    @Operation(summary = "创建项目", description = "创建项目")
    @PostMapping("/")
    public Project createProject(@RequestBody @Validated ProjectDto projectDto) {
        Project project = projectService.getProjectByName(projectDto.getName());

        if (project != null) {
            throw new BusinessException(msgService.getMessage("projectNameAlreadyExist"));
        }

        // 检查项目是否在Dolphin中存在
        ResultDto<?> dsProject =
                null;
        try {
            dsProject = dolphinSchedulerProjectService.getDolphinProjects(1000L, 1L, projectDto.getName(),
                    projectDto.getEnv());
        } catch (JsonProcessingException e) {
            throw new BusinessException("获取Dolphin项目列表时失败");
        }
        if ((Integer) (((LinkedHashMap<?, ?>) dsProject.getData()).get("total")) > 0) {
            List<?> totalList = ((ArrayList<?>) (((LinkedHashMap<?, ?>) dsProject.getData())
                    .get("totalList")));
            List<String> dsProjectNames = new ArrayList<>();
            totalList.forEach(item -> dsProjectNames.add(((LinkedHashMap<?, ?>) item).get("name").toString()));
            if (dsProjectNames.contains(projectDto.getName())) {
                throw new BusinessException("Dolphin中已存在同名项目, 请检查");
            }
        }

        if (projectLineageImportService.folderNameExists(projectDto.getName())) {
            throw new BusinessException("血缘目录名已存在, 请检查");
        }

        return projectService.createProject(projectDto);
    }
    @OperaLog(operation = OperationType.UPDATE, operand = OperandType.PROJECT, operateTable = "ddd_project", systemModule = OperationProjectType.PROJECT_MANAGEMENT, description = {
            "更新项目"})
    @Operation(summary = "更新项目", description = "更新项目")
    @PutMapping("/")
    public Project updateProject(@RequestBody @Validated ProjectDto projectDto) {
        Project project = null;
        if (projectDto.getId() != null) {
            project = projectService.getProjectById(projectDto.getId());
        }

        if (project == null) {
            throw new BusinessException(msgService.getMessage(PROJECTNOTFOUND));
        }

        return projectService.updateProject(project, projectDto);
    }
    @OperaLog(operation = OperationType.DELETE, operand = OperandType.PROJECT, operateTable = "ddd_project", systemModule = OperationProjectType.PROJECT_MANAGEMENT, description = {
            "删除项目"})
    @Operation(summary = "根据项目id删除项目", description = "根据项目id删除项目")
    @DeleteMapping("/{projectId}")
    public void deleteProject(@PathVariable(value = "projectId") Long projectId) {
        Project project = projectService.getProjectById(projectId);

        if (project == null) {
            throw new BusinessException(messageService.getMessage("projectTypeNotFound"));
        }

        projectService.deleteProject(project.getId());
        // 如果绑定需求 删除绑定关系
        List<Integer> requirementIds = project.getRequirementId();
        if (!requirementIds.isEmpty()) {
            List<Long> requirements = new ArrayList<>();
            requirementIds.forEach(requirementId -> requirements.add(requirementId.longValue()));
            metricService.unbindingRequirement(requirements);
        }
    }
    @Operation(summary = "获取项目类型集合", description = "获取项目类型集合")
    @GetMapping("/type")
    public List<Map<Integer, String>> getAllProjectTypes() {
        ArrayList<Map<Integer, String>> list = new ArrayList<>();
        Map<Integer, String> ProjectTypeEnumMap = new HashMap<>();
        ProjectTypeEnumMap.put(ProjectTypeEnum.QUART_ANALYSIS.code(), ProjectTypeEnum.QUART_ANALYSIS.text());
        ProjectTypeEnumMap.put(ProjectTypeEnum.WIDE_TABLE_MODELING.code(), ProjectTypeEnum.WIDE_TABLE_MODELING.text());
        ProjectTypeEnumMap.put(ProjectTypeEnum.DIMENSIONAL_MODELING.code(),
                ProjectTypeEnum.DIMENSIONAL_MODELING.text());
        ProjectTypeEnumMap.put(ProjectTypeEnum.CUSTOM.code(), ProjectTypeEnum.CUSTOM.text());

        list.add(ProjectTypeEnumMap);
        return list;
    }
    @Operation(summary = "获取项目状态集合", description = "获取项目状态集合")
    @GetMapping("/status")
    public List<Map<Integer, String>> getAllProjectStatus() {

        ArrayList<Map<Integer, String>> list = new ArrayList<>();
        Map<Integer, String> ProjectStatusEnumMap = new HashMap<>();
        ProjectStatusEnumMap.put(ProjectStatusEnum.DEPLOYED.code(), ProjectStatusEnum.DEPLOYED.text());
        ProjectStatusEnumMap.put(ProjectStatusEnum.PUBLISHED.code(), ProjectStatusEnum.PUBLISHED.text());
        ProjectStatusEnumMap.put(ProjectStatusEnum.UNDER_DEVELOPMENT.code(),
                ProjectStatusEnum.UNDER_DEVELOPMENT.text());

        list.add(ProjectStatusEnumMap);
        return list;
    }

    @GetMapping("/log")
    @Operation(summary = "搜索项目操作日志", description = "搜索项目操作日志")
    public PageableResult<OperationLog> searchProjectLog(
                                                         @RequestParam(name = "projectId", required = false) Long projectId,
                                                         @RequestParam(name = "itemName", required = false) String itemName,
                                                         @RequestParam(name = "itemId", required = false) Long itemId,
                                                         @RequestParam(name = "operation", required = false) String operation,
                                                         @RequestParam(name = "user", required = false) String user,
                                                         @RequestParam(name = "start", required = false) Long start,
                                                         @RequestParam(name = "end", required = false) Long end,
                                                         @RequestParam(name = "orderBy", required = false, defaultValue = "createTime") String orderBy,
                                                         @RequestParam(name = "asc", required = false, defaultValue = "false") Boolean asc,
                                                         @RequestParam("currentPage") Integer currentPage,
                                                         @RequestParam("pageSize") Integer pageSize) {
        return operationLogService.searchProjectLog(projectId, itemName, itemId, operation, user, start, end, orderBy,
                asc, currentPage, pageSize);
    }

    @Operation(summary = "给一个用户授权多个项目", description = "给一个用户授权多个项目")
    @PostMapping("/projects/user")
    public ResResultDto<String> addUsersToProject(@RequestBody ProjectUserDto projectUserDto) throws JsonProcessingException {
        permissionHelper.addUserToProjects(projectUserDto.getUsername(), projectUserDto.getProjectIds(),
                projectUserDto.getEnv());
        return ResResultDto.ok();
    }

    @Operation(summary = "绑定项目到Dolphinscheduler项目", description = "绑定项目到Dolphinscheduler项目")
    @PostMapping("/bind")
    public void bindProjectToDolphinschedulerProject(@RequestBody @Validated DsProjectMappingDto dsProjectMappingDto) {
        dsProjectBindingService.bindDddProjectToDsProject(dsProjectMappingDto);
    }

    @Operation(summary = "解除项目到Dolphinscheduler项目绑定", description = "解除项目到Dolphinscheduler项目绑定")
    @PostMapping("/unbind")
    public void unbindProjectToDolphinschedulerProject(@RequestBody @Validated DsProjectMappingDto dsProjectMapping) {
        dsProjectBindingService.unbindDddProjectToDsProject(dsProjectMapping);
    }

    @Operation(summary = "给项目赋权", description = "给项目赋权")
    @PostMapping("/auth")
    public void addAuthToProject(@RequestBody ProjectAuthDto auth) {
        projectAuthService.addAuthToProject(auth);
    }

    @OperaLog(operation = OperationType.INSERT, operand = OperandType.USER, operateTable = "ddd_project_auth", systemModule = OperationProjectType.PROJECT_MANAGEMENT, description = {
            "添加成员"})
    @Operation(summary = "给项目赋权多个用户", description = "给项目赋权多个用户")
    @PostMapping("/auths")
    public void addUsersAuthToProject(@RequestBody List<ProjectAuth> auths,
                                      @RequestParam(value = "env", required = false, defaultValue = "test") String env) {
        projectAuthService.addAuthsToProject(auths, env);
    }

    @OperaLog(operation = OperationType.UPDATE, operand = OperandType.USER, operateTable = "ddd_project_auth", systemModule = OperationProjectType.PROJECT_MANAGEMENT, description = {
            "修改成员权限"})
    @Operation(summary = "修改项目赋权", description = "修改项目赋权")
    @PutMapping("/auth")
    public void modifyAuthWithProject(@RequestBody ProjectAuthDto auth) {
        projectAuthService.modifyAuthWithProject(auth);
    }

    @Operation(summary = "批量修改项目赋权", description = "批量修改项目赋权")
    @PutMapping("/auths")
    public void modifyAuthsWithProject(@RequestBody List<ProjectAuth> auths) {
        projectAuthService.modifyAuthsWithProject(auths);
    }

    @OperaLog(operation = OperationType.DELETE, operand = OperandType.USER, operateTable = "ddd_project_auth", systemModule = OperationProjectType.PROJECT_MANAGEMENT, description = {
            "删除成员"})
    @Operation(summary = "删除项目赋权", description = "删除项目赋权")
    @DeleteMapping("/auth")
    public void removeAuthFromProject(@RequestBody ProjectAuthDto auth) {
        projectAuthService.removeAuthFromProject(auth);
    }

    @Operation(summary = "批量删除项目赋权", description = "批量删除项目赋权")
    @DeleteMapping("/auths")
    public void removeAuthsFromProject(@RequestBody List<ProjectAuth> auths) {
        projectAuthService.removeAuthsFromProject(auths);
    }

    @Operation(summary = "查询某个项目的所有权限", description = "查询某个项目的所有权限")
    @GetMapping("/auth/findAuthByProject")
    public List<ProjectAuthDto> findAuthByProject(@RequestParam("projectId") Long projectId) {
        return projectAuthService.findAuthByProjectId(projectId);
    }

    @Operation(summary = "查询登录用户是否是项目成员")
    @GetMapping("/member")
    public ResResultDto<String> findProjectMember(@RequestParam("projectId") Long projectId) {
        if (AuthTools.currentUsername().equals("admin")) {
            return ResResultDto.ok();
        }
        List<ProjectAuth> authList = projectAuthService.findAllProjectAuthByCurrentUser();
        for (ProjectAuth auth : authList) {
            if (Objects.equals(auth.getProjectId(), projectId)) {
                return ResResultDto.ok();
            }
        }
        return ResResultDto.error("用户没有该项目权限");
    }

    @Operation(summary = "发布工作流到生产")
    @PostMapping(value = "/publishWorkflow")
    public ResResultDto<String> publishWorkflow(@Validated @RequestBody PublishWorkflowDto publishWorkflowDto) throws IOException {
        projectService.publishWorkflow(publishWorkflowDto);
        return ResResultDto.ok();
    }

    @Operation(summary = "获取环境名称")
    @GetMapping(value = "/getEnv")
    public Map<String, List<ProdDatasourceMapping>> getEnv() {
        return dolphinSchedulerProjectService.getEnv();
    }

    @Operation(summary = "导出迁移工作流")
    @GetMapping("/exportDsWorkflow")
    public ResponseEntity<Resource> exportDsWorkflow(@RequestParam("projectCode") Long projectCode,
                                                     @RequestParam("codes") String codes,
                                                     @RequestParam("env") String env) throws UnsupportedEncodingException {
        return dolphinSchedulerProjectService.exportDsWorkflow(projectCode, codes, env);
    }

    @Operation(summary = "获取租户列表")
    @GetMapping("/tenants/list")
    public List<DsTenantDto> getAllTenants(@RequestParam String env) throws JsonProcessingException {
        return dolphinSchedulerUserService.getDsTenants(env);
    }

    @Operation(summary = "获取已绑定dsCode")
    @GetMapping("/getBindCode/list")
    public List<Long> getBindCode() {
        return dsProjectBindingService.getBindCode();
    }

    @Operation(summary = "获取ds项目列表")
    @GetMapping("/dolphin")
    public ResultDto<T> getDolphinProjects(@RequestParam("pageSize") Long pageSize,
                                           @RequestParam("pageNo") Long pageNo,
                                           @RequestParam("searchVal") String searchVal,
                                           @RequestParam("env") String env) throws JsonProcessingException {
        return dolphinSchedulerProjectService.getDolphinProjects(pageSize, pageNo, searchVal, env);
    }

    @OperaLog(operation = OperationType.INSERT, operand = OperandType.REQUIREMENT, operateTable = "ddd_project", systemModule = OperationProjectType.PROJECT_MANAGEMENT, description = {
            "绑定需求"})
    @Operation(summary = "绑定需求到项目")
    @PostMapping("/requirement/bind")
    public ResResultDto<String> bindRequirement(@RequestParam("projectId") Long projectId,
                                                @RequestBody List<RequirementDto> requirementDtos) {
        List<Integer> requirementIds = new ArrayList<>();
        requirementDtos.forEach(requirementDto -> requirementIds.add(Math.toIntExact(requirementDto.getId())));
        projectService.bindRequirement(projectId, requirementIds);
        return ResResultDto.ok();
    }

    @OperaLog(operation = OperationType.DELETE, operand = OperandType.REQUIREMENT, operateTable = "ddd_project", systemModule = OperationProjectType.PROJECT_MANAGEMENT, description = {
            "解绑需求"})
    @Operation(summary = "解绑项目下某需求")
    @GetMapping("/requirement/unbind")
    public ResResultDto<String> unbindRequirement(@RequestParam("projectId") Long projectId,
                                                  @RequestParam("requirementId") Integer requirementId,
                                                  @RequestParam("requirementName") String requirementName) {
        projectService.unbindRequirement(projectId, requirementId);
        return ResResultDto.ok();
    }

    @OperaLog(operation = OperationType.UPDATE, operand = OperandType.REQUIREMENT, operateTable = "ddd_project", systemModule = OperationProjectType.PROJECT_MANAGEMENT, description = {
            "审批需求"})
    @Operation(summary = "审批项目下的需求")
    @PostMapping("/requirement/publish")
    public ResResultDto<String> publishRequirement(@RequestBody RequirementDto requirementDto) {
        projectService.publishRequirement(requirementDto);
        return ResResultDto.ok();
    }

    @Operation(summary = "校验用户开发项目权限")
    @GetMapping("/auth/devlopment")
    public ResResultDto<String> getDevlopmentAuth(@RequestParam(value = "projectId", required = false) Long projectId,
                                                  @RequestParam(value = "projectName", required = false) String projectName) {
        String userName = AuthTools.currentUsername();
        if (userName.equals("admin")) {
            return ResResultDto.ok();
        }
        if (projectId == null && projectName == null) {
            throw new BusinessException("校验用户开发项目权限需根据项目ID或项目名称查询");
        }
        if (!StringUtils.isEmpty(projectName)) {
            Project project = projectService.getProjectByName(projectName);
            projectId = project.getId();
        }
        List<ProjectAuthDto> projectAuthDtos = projectAuthService.findAuthByProjectId(projectId);
        if (projectAuthDtos.isEmpty()) {
            throw new BusinessException("项目未添加任一成员, 请先添加成员");
        }
        List<String> projectUserList = new ArrayList<>();
        for (ProjectAuthDto projectAuthDto : projectAuthDtos) {
            projectUserList.add(projectAuthDto.getUsername());
        }
        if (projectUserList.contains(userName)) {
            return ResResultDto.ok();
        } else {
            throw new BusinessException("登录用户无该项目开发权限");
        }
    }

    @Operation(summary = "获取项目分支")
    @GetMapping("/git/branch")
    public List<String> getGitBranch(@RequestParam("projectId") Long projectId) {
        return projectService.getGitBranch(projectId);
    }

    @Operation(summary = "创建分支")
    @GetMapping("/git/branch/create")
    public void createGitBranch(@RequestParam("projectId") Long projectId,
                                @RequestParam("branchName") String branchName,
                                @RequestParam("ref") String ref) {
        projectService.createGitBranch(projectId, branchName, ref);
    }

    @Operation(summary = "删除分支")
    @GetMapping("/git/branch/delete")
    public void deleteGitBranch(@RequestParam("projectId") Long projectId,
                                @RequestParam("branchName") String branchName) {
        projectService.deleteGitBranch(projectId, branchName);
    }

    @Operation(summary = "项目整体导出")
    @PostMapping("/export")
    public void exportProject(@RequestParam("projectId") Long projectId,
                              @Parameter(description = "导出文件是否作为当前环境导入") @RequestParam("isCurrent") Boolean isCurrent,
                              @RequestBody ProjectExportDto projectExportDto,
                              HttpServletResponse response) throws IOException {
        projectService.exportProject(projectId, projectExportDto, isCurrent, response);
    }

    @Operation(summary = "导入前检查")
    @PostMapping("/import/check")
    public ResResultDto<String> uploadFolderCheck(@RequestPart("file") MultipartFile uploadFile) throws IOException {
        String fileName = uploadFile.getOriginalFilename();
        assert fileName != null;
        if (!fileName.endsWith("zip")) {
            throw new BusinessException("必须上传zip文件");
        }
        String flag = projectService.uploadFolderCheck(uploadFile);
        return ResResultDto.ok(flag);
    }

    @Operation(summary = "项目整体导入")
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public String uploadFolder(@RequestPart("file") MultipartFile uploadFile,
                               @RequestParam(value = "categoryId", required = false) Long categoryId) throws IOException {
        // 目前只支持同环境导入导出, 跨环境需再开发
        projectService.importProject(uploadFile, categoryId);
        return "Done";
    }
}
