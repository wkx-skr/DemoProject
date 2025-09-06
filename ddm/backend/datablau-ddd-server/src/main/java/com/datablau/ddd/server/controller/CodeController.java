package com.datablau.ddd.server.controller;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
import com.datablau.ddd.common.constant.Constants;
import com.datablau.ddd.common.dto.Property;
import com.datablau.ddd.common.dto.ResultWrapper;
import com.datablau.ddd.common.exception.BusinessException;
import com.datablau.ddd.data.dto.CodeConflictDto;
import com.datablau.ddd.data.dto.CodeDetailDto;
import com.datablau.ddd.data.dto.CodeDetailHistoryDto;
import com.datablau.ddd.data.dto.CodeTreeNodeDto;
import com.datablau.ddd.data.dto.ResResultDto;
import com.datablau.ddd.data.enums.OperandType;
import com.datablau.ddd.data.enums.OperationType;
import com.datablau.ddd.data.jpa.entity.CodeDetail;
import com.datablau.ddd.data.jpa.entity.CodeDetailHistory;
import com.datablau.ddd.data.jpa.entity.CodeTreeNode;
import com.datablau.ddd.data.jpa.entity.DsProjectMapping;
import com.datablau.ddd.data.jpa.entity.FileWorkFlowMapping;
import com.datablau.ddd.data.jpa.entity.ProjectAuth;
import com.datablau.ddd.data.jpa.entity.type.OperationProjectType;
import com.datablau.ddd.data.jpa.repository.ProjectAuthRepository;
import com.datablau.ddd.data.utility.type.ProjectAuthType;
import com.datablau.ddd.ds.service.DolphinSchedulerDataxService;
import com.datablau.ddd.security.utility.AuthTools;
import com.datablau.ddd.server.annotation.OperaLog;
import com.datablau.ddd.server.service.api.CodeTreeService;
import com.datablau.ddd.server.service.api.DsEnvService;
import com.datablau.ddd.server.service.api.DsProjectBindingService;
import com.datablau.ddd.server.service.api.FileOperateService;
import com.datablau.ddd.server.service.api.ProjectService;
import com.datablau.workflow.common.api.DatablauRemoteWorkflowService;
import io.swagger.v3.oas.annotations.Operation;

@RestController()
@RequestMapping("/code")
public class CodeController {

    public static final String FOLDER_NOT_EXIST = "folderNotExist";
    @Autowired
    MessageService msgService;

    @Autowired
    CodeTreeService codeTreeService;

    @Autowired
    DsProjectBindingService dsProjectBindingService;

    @Autowired
    FileOperateService fileOperateService;

    @Autowired
    ProjectService projectService;

    @Autowired
    DatablauRemoteWorkflowService datablauRemoteWorkflowService;

    @Autowired
    DolphinSchedulerDataxService dolphinSchedulerDataxService;

    @Autowired
    DsEnvService dsEnvService;

    @Autowired
    ProjectAuthRepository projectAuthRepository;

    @Value("${resource.secretKey}")
    private String secretKey;

    @Value("${git.namespace}")
    private String namespace;

    @Value("${ddd.realtime.update}")
    private boolean update;

    @Operation(summary = "根据项目id获取项目目录结构", description = "根据项目id获取项目目录结构")
    @PostMapping("/tree/{projectId}/{branch}")
    public CodeTreeNode getTree(@PathVariable(value = "projectId") Long projectId,
                                @PathVariable(value = "branch") String branch) {
        return codeTreeService.getTree(projectId, branch);
    }

    @Operation(summary = "根据Dolphinscheduler项目Code获取项目目录结构", description = "根据Dolphinscheduler项目Code获取项目目录结构")
    @GetMapping("/tree/ds/{dsProjectCode}")
    public CodeTreeNode getTreeByDsProjectCode(@PathVariable(value = "dsProjectCode") Long dsProjectCode) {
        DsProjectMapping dsProjectMapping = dsProjectBindingService.getDsProjectMappingByDsProjectCode(dsProjectCode);
        if (dsProjectMapping == null) {
            throw new BusinessException(msgService.getMessage("bindingNotExist"));
        }
        return codeTreeService.getTree(dsProjectMapping.getDddProjectId(), "master");
    }

    @Operation(summary = "根据项目id以及当前目录id获取项目子目录结构树", description = "根据项目id以及当前目录id获取项目子目录结构树")
    @GetMapping("/subTree/{projectId}/{parentId}")
    public List<CodeTreeNode> getSubTree(@PathVariable(value = "projectId") Long projectId,
                                         @PathVariable(value = "parentId") Long parentId) {
        return codeTreeService.getSubTree(projectId, parentId, null);
    }
    @OperaLog(operation = OperationType.INSERT, operand = OperandType.FILE, operateTable = "ddd_code_tree_node", systemModule = OperationProjectType.PROJECT_MANAGEMENT, description = {
            "创建文件"})
    @Operation(summary = "创建文件", description = "创建文件")
    @PostMapping("/file")
    public CodeTreeNode createFile(@RequestBody @Validated CodeTreeNodeDto codeTreeNodeDto) {
        List<CodeTreeNode> suspectDupFile = codeTreeService.getSuspectDup(codeTreeNodeDto);

        if (!suspectDupFile.isEmpty()) {
            throw new BusinessException(msgService.getMessage("duplicateFileNames"));
        }

        return codeTreeService.createFile(codeTreeNodeDto);
    }

    @Operation(summary = "根据文件id得到文件")
    @GetMapping("/file/{fileDetailId}")
    public CodeDetail getFile(@PathVariable(value = "fileDetailId") Long fileDetailId,
                              @RequestParam(value = "projectId") Long projectId) {
        String username = AuthTools.currentUsernameFailFast();
        if (username.equals("admin")) {
            return codeTreeService.getFile(fileDetailId);
        }
        ProjectAuth auth = projectAuthRepository.findProjectAuthByProjectIdAndUsername(projectId, username);
        List<ProjectAuthType> authTypes = new ArrayList<>();
        if (auth != null) {
            authTypes = auth.getAuthType();
        }
        if (authTypes.contains(ProjectAuthType.PROCEDURE_VIEW) || authTypes.contains(ProjectAuthType.PROCEDURE_EDIT)) {
            return codeTreeService.getFile(fileDetailId);
        } else {
            throw new BusinessException("用户没有访问程序的权限, 请联系管理员添加二级权限");
        }
    }

    @OperaLog(operation = OperationType.DELETE, operand = OperandType.FILE, operateTable = "ddd_code_tree_node", systemModule = OperationProjectType.PROJECT_MANAGEMENT, description = {
            "删除文件"})
    @Operation(summary = "删除文件", description = "删除文件")
    @DeleteMapping("/file")
    public void deleteFile(@RequestBody @Validated CodeTreeNodeDto codeTreeNodeDto) {
        codeTreeService.deleteFile(codeTreeNodeDto);
    }

    @Operation(summary = "文件迁入新版本", description = "文件迁入新版本")
    @PostMapping("/file/version")
    public CodeDetailHistory checkInNewVersion(@RequestBody @Validated CodeDetailHistoryDto codeDetailHistoryDto) {
        CodeDetailHistory codeDetailHistory = codeTreeService.getFileHistoryByIdAndVersion(codeDetailHistoryDto);

        if (codeDetailHistory != null) {
            throw new BusinessException(msgService.getMessage("duplicateVersionNames"));
        }

        return codeTreeService.checkInNewVersion(codeDetailHistoryDto);
    }

    @Operation(summary = "根据文件id得到文件历史", description = "根据文件id得到文件历史")
    @GetMapping("/file/history")
    public List<CodeDetailHistory> getFileHistory(@RequestParam Long codeDetailId) {
        return codeTreeService.getFileHistory(codeDetailId);
    }
    @OperaLog(operation = OperationType.UPDATE, operand = OperandType.FILE, operateTable = "ddd_code_detail", systemModule = OperationProjectType.PROJECT_MANAGEMENT, description = {
            "更新文件"})
    @Operation(summary = "更新文件", description = "更新文件")
    @PutMapping("/file")
    public CodeConflictDto updateFile(@RequestBody @Validated CodeDetailDto codeDetailDto) {
        CodeConflictDto codeConflictDto = new CodeConflictDto();
        CodeDetail codeDetail = codeTreeService.getFile(codeDetailDto.getId());
        if (codeDetail == null) {
            throw new BusinessException(msgService.getMessage("fileNotExist"));
        }

        CodeTreeNode codeTreeNode = codeTreeService.getCodeTreeNodeByCodeDetailId(codeDetailDto.getId());
        Integer isLock = codeTreeNode.getIsLock();

        if (Constants.LOCKED.equals(isLock)) {
            throw new BusinessException(msgService.getMessage("file is locked"));
        }

        if (!codeDetail.getCurId().equals(codeDetailDto.getCurId())) {
            codeConflictDto.setConflict(true);
            codeConflictDto.setContent(codeDetail);
            return codeConflictDto;
        }

        CodeDetail updatedCodeDetail = codeTreeService.updateFile(codeDetailDto, codeDetail);
        codeConflictDto.setConflict(false);
        codeConflictDto.setContent(updatedCodeDetail);
        return codeConflictDto;
    }

    @Operation(summary = "下载一个文件", description = "下载一个文件")
    @PostMapping("/file/download")
    public ResponseEntity<Resource> downloadFile(@RequestBody @Validated CodeTreeNodeDto codeTreeNodeDto) throws UnsupportedEncodingException {
        return fileOperateService.downloadFile(codeTreeNodeDto);
    }

    @Operation(summary = "下载一个文件夹", description = "下载一个文件夹")
    @PostMapping("/folder/download")
    public void downloadFolder(@RequestParam(value = "projectId") Long projectId,
                               @RequestParam(value = "folderId") Long folderId,
                               HttpServletResponse response) throws IOException {
        fileOperateService.downloadFolder(projectId, folderId, response);
    }

    @Operation(summary = "上传一个代码zip文件夹", description = "上传一个代码zip文件夹")
    @PostMapping(value = "/folder/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public String uploadFolder(@RequestPart("file") MultipartFile uploadFile,
                               @RequestParam("projectId") Long projectId,
                               @RequestParam("parentId") Long parentId,
                               @RequestParam("fileTypeId") Integer fileTypeId) throws IOException {
        String fileName = uploadFile.getOriginalFilename();
        assert fileName != null;
        if (!fileName.endsWith("zip")) {
            throw new BusinessException("必须上传zip文件");
        }
        fileOperateService.uploadFolder(uploadFile, projectId, parentId, fileTypeId);
        return "Done";
    }
    @OperaLog(operation = OperationType.INSERT, operand = OperandType.FOLDER, operateTable = "ddd_code_tree_node", systemModule = OperationProjectType.PROJECT_MANAGEMENT, description = {
            "创建文件夹"})
    @Operation(summary = "创建文件夹", description = "创建文件夹")
    @PostMapping("/folder")
    public CodeTreeNode createFolder(@RequestBody @Validated CodeTreeNodeDto codeTreeNodeDto) {
        List<CodeTreeNode> suspectDup = codeTreeService.getSuspectDup(codeTreeNodeDto);

        if (!suspectDup.isEmpty()) {
            throw new BusinessException(msgService.getMessage("duplicateFolderNames"));
        }
        return codeTreeService.createFolder(codeTreeNodeDto);
    }
    @OperaLog(operation = OperationType.UPDATE, operand = OperandType.FOLDER, operateTable = "ddd_code_tree_node", systemModule = OperationProjectType.PROJECT_MANAGEMENT, description = {
            "更新文件夹"})
    @Operation(summary = "更新文件夹", description = "更新文件夹")
    @PutMapping("/folder")
    public CodeTreeNode updateFolder(@RequestBody @Validated CodeTreeNodeDto codeTreeNodeDto) {
        CodeTreeNode folder = codeTreeService.getCodeTreeNodeById(codeTreeNodeDto.getId());
        if (folder == null) {
            throw new BusinessException(msgService.getMessage(FOLDER_NOT_EXIST));
        }

        List<CodeTreeNode> suspectDup = codeTreeService.getSuspectDup(codeTreeNodeDto);
        if (!suspectDup.isEmpty() && !suspectDup.get(0).getId().equals(codeTreeNodeDto.getId())) {
            throw new BusinessException(msgService.getMessage("duplicateFolderNames"));
        }

        return codeTreeService.updateFolder(codeTreeNodeDto);
    }
    @OperaLog(operation = OperationType.DELETE, operand = OperandType.FOLDER, operateTable = "ddd_code_tree_node", systemModule = OperationProjectType.PROJECT_MANAGEMENT, description = {
            "删除文件夹"})
    @Operation(summary = "删除文件夹", description = "删除文件夹")
    @DeleteMapping("/folder/{folderId}")
    public void deleteFolder(@PathVariable(value = "folderId") Long folderId) {
        CodeTreeNode folder = codeTreeService.getCodeTreeNodeById(folderId);
        if (folder == null) {
            throw new BusinessException(msgService.getMessage(FOLDER_NOT_EXIST));
        }
        List<CodeTreeNode> deleteList = new ArrayList<>();
        deleteList.add(folder);
        codeTreeService.deleteFolder(deleteList);
    }

    @Operation(summary = "锁定文件", description = "锁定文件")
    @GetMapping("/folder/lockFolder/{folderId}/{isLock}")
    public void lockFolder(@PathVariable(value = "folderId") Long folderId,
                           @PathVariable(value = "isLock") Integer isLock) {
        CodeTreeNode folder = codeTreeService.getCodeTreeNodeById(folderId);
        if (folder == null) {
            throw new BusinessException(msgService.getMessage(FOLDER_NOT_EXIST));
        }
        List<CodeTreeNode> list = new ArrayList<>();
        list.add(folder);
        codeTreeService.lockFolder(list, isLock);
    }

    @Operation(summary = "移动文件夹或者文件", description = "移动文件夹或者文件")
    @PostMapping("/folder/move")
    public void moveNode(@RequestParam(value = "nodeId") Long nodeId,
                         @RequestParam(value = "projectId") Long projectId,
                         @RequestParam(value = "targetId") Long targetId,
                         @RequestParam(value = "targetParentId") Long targetParentId,
                         @RequestParam(value = "targetOrder") Long targetOrder,
                         @RequestParam(value = "type") Long type) {
        CodeTreeNode node = codeTreeService.getCodeTreeNodeById(nodeId);
        if (node == null) {
            throw new BusinessException(msgService.getMessage(FOLDER_NOT_EXIST));
        }
        codeTreeService.moveItem(node, projectId,
                targetId, targetParentId, targetOrder, type);
    }

    @Operation(summary = "获取sql中的动态参数", description = "获取sql中的动态参数")
    @GetMapping("/getParam")
    public List<Property> getDynamicParames(
                                            @RequestParam(value = "codeDetailId") Long codeDetailId) {
        return codeTreeService.getDynamicParames(codeDetailId);
    }

    @Operation(summary = "文件被哪些工作流使用", description = "文件被哪些工作流使用")
    @PostMapping("/file/recordFileMapping")
    public ResultWrapper<Iterable<FileWorkFlowMapping>> recordFileMapping(
                                                                          @RequestBody List<FileWorkFlowMapping> recordFileDto) {
        return codeTreeService.recordFile(recordFileDto);
    }

    @Operation(summary = "获取文件被哪些工作流使用", description = "获取文件被哪些工作流使用")
    @GetMapping("/file/recordFileMapping")
    public ResultWrapper<List<FileWorkFlowMapping>> recordFileMappingInfo(@RequestParam Long fileDetailId) {
        return codeTreeService.recordFileInfo(fileDetailId);
    }

    @Operation(summary = "删除工作流时清空使用记录", description = "获取文件被哪些工作流使用")
    @DeleteMapping("/file/recordFileMapping")
    public ResultWrapper<Integer> deleteFileMapping(@RequestBody List<Long> processId) {
        return codeTreeService.deleteFileMapping(processId);
    }

    @Operation(summary = "获取工作流引用的脚本文件", description = "获取工作流引用的脚本文件")
    @GetMapping("/file/getMapping")
    public ResultWrapper<Map<Long, List<FileWorkFlowMapping>>> getMapping(@RequestParam String processIds) {
        return codeTreeService.getMapping(processIds);
    }

    @Operation(summary = "签入版本", description = "签入版本")
    @PostMapping("/version")
    public ResResultDto<String> insertVersion(@RequestParam("codeDetailId") Long codeDetailId,
                                              @RequestParam("version") String version,
                                              @RequestBody CodeDetailHistoryDto codeDetailHistoryDto) {
        return codeTreeService.insertVersion(version, codeDetailId, codeDetailHistoryDto);
    }

    @Operation(summary = "查询所有版本文件", description = "查询所有版本文件")
    @GetMapping("/files")
    public List<CodeDetailHistory> getHistoricFiles(@RequestParam("codeDetailId") Long codeDetailId) {
        return codeTreeService.getHistoricFiles(codeDetailId);
    }

    @Operation(summary = "查询文件是否重名", description = "查询文件是否充重名")
    @PostMapping("/check/repeat")
    public void checkRepeatName(@RequestBody CodeTreeNodeDto codeTreeNodeDto) {
        // 检查文件是否重复
        List<CodeTreeNode> suspectDupFile = codeTreeService.getSuspectDup(codeTreeNodeDto);
        if (!suspectDupFile.isEmpty()) {
            throw new BusinessException(msgService.getMessage("duplicateFileNames"));
        }
    }

    @Operation(summary = "文件绑定任务定义taskCode", description = "文件绑定任务定义taskCode")
    @PostMapping("/bindTaskCode")
    public void bindTaskCode(@RequestParam Long codeDetailId, @RequestParam Long taskCode) {
        codeTreeService.bindTaskCode(codeDetailId, taskCode);

    }

    @Operation(summary = "根据文件id得到文件")
    @GetMapping("/file/ds/{fileDetailId}/{fileType}")
    public String getFileFromDS(@PathVariable(value = "fileDetailId") Long fileDetailId,
                                @PathVariable(value = "fileType") String fileType) {
        return codeTreeService.getFile(fileDetailId, fileType);
    }
    @GetMapping("/getRealTime")
    public boolean getRealTime() {
        return update;
    }
}
