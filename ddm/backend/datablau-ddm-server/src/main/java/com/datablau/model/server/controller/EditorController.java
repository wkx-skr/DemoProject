package com.datablau.model.server.controller;

import com.andorj.model.common.api.MessageService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.api.ModelService;
import com.datablau.model.data.api.PermissionHelper;
import com.datablau.model.data.api.semantic.RuleChecker;
import com.datablau.model.data.dto.CreateModelDto;
import com.datablau.model.data.dto.CreateModelVersionDto;
import com.datablau.model.data.dto.EditedElementDto;
import com.datablau.model.data.dto.EditedResponseDto;
import com.datablau.model.data.dto.EditorRequest;
import com.datablau.model.data.dto.EditorTableDto;
import com.datablau.model.data.dto.SaveWebModelDto;
import com.datablau.model.data.dto.SessionListDto;
import com.datablau.model.data.jpa.entity.Model;
import com.datablau.model.data.security.UserRights;
import com.datablau.security.management.exception.DatablauPermissionException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController("editorController")
@ConditionalOnMissingBean(name = "editorControllerExt")
@RequestMapping("/editor")

@Tag(name = "Web编辑器使用的REST API", description = "Web编辑器使用的REST API")
public class EditorController extends BaseController {

    @Autowired
    protected ModelService modelService;

    @Autowired
    protected MessageService msgService;

    @Autowired
    protected RuleChecker ruleChecker;

    @Autowired
    protected PermissionHelper permissionHelper;

    @RequestMapping(value = "/models/{modelId}/table", method = RequestMethod.POST)
    @Operation(summary = "创建一个表", description = "创建一个表")
//    @PreAuthorize(UserRights.HAS_WEB_EDITOR_ROLE)
    public EditedElementDto addTable(
            @Parameter(description = "模型ID") @PathVariable("modelId") Long modelId,
            @Parameter(description = "自增版本号") @RequestParam("ver") Long ver,
            @RequestBody EditorTableDto table) throws Exception {
        EditedElementDto dto = modelService.addTable(modelId, ver, table);
        ruleChecker.check(modelId);
        return dto;
    }

    @RequestMapping(value = "/models/{modelId}/table", method = RequestMethod.PUT)
    @Operation(summary = "修改一个表", description = "修改一个表, 修改表的时候表的elementId必填。修改字段，字段的elementId必填")
//    @PreAuthorize(UserRights.HAS_WEB_EDITOR_ROLE)
    public EditedElementDto modifyTable(
            @Parameter(description = "模型ID") @PathVariable("modelId") Long modelId,
            @Parameter(description = "自增版本号") @RequestParam("ver") Long ver,
            @RequestBody EditorTableDto table) throws Exception {

        EditedElementDto dto = modelService.modifyTable(modelId, ver, table);
        ruleChecker.check(modelId);
        return dto;
    }

    @RequestMapping(value = "/models/{modelId}", method = RequestMethod.PUT)
    @Operation(summary = "web端单主题域下修改模型", description = "web端单主题域下修改模型")
//    @PreAuthorize(UserRights.HAS_WEB_EDITOR_ROLE)
    public EditedResponseDto modifyDiagram(
            @Parameter(description = "模型ID") @PathVariable("modelId") Long modelId,
            @Parameter(description = "自增版本号") @RequestParam("ver") Long ver,
            @RequestBody EditorRequest request) throws Exception {
        EditedResponseDto dto = modelService.editModel(modelId, ver, request);
        ruleChecker.check(modelId);
        return dto;
    }

    @RequestMapping(value = "/models/{modelId}/save", method = RequestMethod.PUT)
    @Operation(summary = "web端保存一个模型", description = "web端保存一个模型")
    public EditedResponseDto updateModel(
            @RequestBody SaveWebModelDto saveWebModelDto) throws Exception {
        try {
            EditedResponseDto dto = modelService.saveWebModel(saveWebModelDto);
            return dto;
        } finally {
            ruleChecker.check(saveWebModelDto.getModelId());
        }
    }

    @RequestMapping(value = "/models/{modelId}/tables/{tableId}", method = RequestMethod.DELETE)
    @Operation(summary = "删除一个实体", description ="删除一个实体，包括表，视图，业务对象")
//    @PreAuthorize(UserRights.HAS_WEB_EDITOR_ROLE)
    public EditedElementDto deleteTable(
            @Parameter(description = "模型ID") @PathVariable("modelId") Long modelId,
            @Parameter(description = "自增版本号") @RequestParam("ver") Long ver,
            @Parameter(description = "表的ID") @PathVariable("tableId") Long tableId) {
        EditedElementDto dto = modelService.deleteTable(modelId, ver, tableId);
        ruleChecker.check(modelId);
        return dto;
    }

    @RequestMapping(value = "/{modelId}/lock", method = RequestMethod.PUT)
    @Operation(summary = "web端加锁", description = "web端加锁")
    public boolean sessionLock(@Parameter(description = "模型ID") @PathVariable("modelId") Long modelId) {
        permissionHelper.reloadCurrentUserAuth(true, true);
        modelService.sessionLock(modelId);
        return true;
    }

    @RequestMapping(value = "/{modelId}/heart", method = RequestMethod.PUT)
    @Operation(summary = "保持心跳", description = "保持心跳，一分钟一次，五分钟没接收到即解锁该模型")
    public boolean modelHeart(@Parameter(description = "模型ID") @PathVariable("modelId") Long modelId) {
        return modelService.keepHeart(modelId);
    }

    @RequestMapping(value = "/{modelId}/unlock", method = RequestMethod.POST)
    @Operation(summary = "解锁指定的模型或分支", description = "解锁指定的模型或分支")
    public boolean stopHeart(@Parameter(description = "模型ID") @PathVariable("modelId") Long modelId) {
        return modelService.stopHeart(modelId);
    }

    @RequestMapping(value = "/session")
    @PreAuthorize(UserRights.HAS_EDITING_STATUS_ROLE)
    @Operation(summary = "查看模型在线编辑状态", description = "查看模型在线编辑状态，必须有在线编辑状态的权限")
    public SessionListDto getSessionDto() {
        return modelService.getSessionDtoList();
    }

    @RequestMapping(value = "/", method = RequestMethod.POST)
    @Operation(summary = "web端创建一个模型", description = "web端创建一个模型")
    public Model createModel(
            @Parameter(description = "模型对象", required = true) @RequestBody CreateModelDto createModelRequest)
            throws Exception {
        Model model = modelService.createWebModel(createModelRequest);
        ruleChecker.check(model.getId());
        return model;
    }

    @RequestMapping("/{modelId}/versions/try")
    @Operation(summary = "测试模型能不能迁入版本", description = "检查模型能不能迁入版本")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public void tryUpdateVersion(@PathVariable("modelId") Long modelId,
                                 @RequestBody CreateModelVersionDto createModelVersionRequest) {
        try {
            createModelVersionRequest.setModelId(modelId);
            modelService.tryCreateModelVersion(createModelVersionRequest);
        } catch (AccessDeniedException ade) {
            throw new DatablauPermissionException(msgService
                    .getMessage("dontHaveModelEditorPermission",
                            modelService.findModelAdmin(modelId)));
        }
    }
}
