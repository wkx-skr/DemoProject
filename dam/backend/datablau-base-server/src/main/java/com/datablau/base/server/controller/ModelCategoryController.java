package com.datablau.base.server.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.base.api.ModelCategoryService70;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.base.data.ModelCategoryParamDto;
import com.datablau.base.data.ModelCategoryToUserDto;
import com.datablau.base.data.UserToModelCategoryDto;
import com.datablau.base.server.dto.ModelCategoryExtDto;
import com.datablau.base.server.dto.ModelCategoryParamExtDto;
import com.datablau.base.server.dto.ModelCategoryTreeNodeDto;
import com.datablau.base.server.service.ModelCategoryServiceExt;
import com.datablau.base.server.utility.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.dto.SimpleUserDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.Collection;
import java.util.List;

/**
 * @Author Nicky - 数语科技有限公司
 * @Date 2018/5/14 11:39
 */
@RestController
@RequestMapping("/modelCategory")
@Tag(name = "应用系统", description = "/modelCategories")
public class ModelCategoryController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(ModelCategoryController.class);

    @Autowired
    private MessageService msgService;
    @Autowired
    private ModelCategoryService70 modelCategoryService;

    @Autowired
    private ModelCategoryServiceExt modelCategoryServiceExt;

    public ModelCategoryController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "db_model_category",
//            systemModule = OperationModuleType.SYSTEM_CATEGORY,
//            description = "查询应用系统"
//    )
    @PostMapping("/getModelCategories")
    public List<ModelCategoryDto> getModelCategoriesWithUdp() {
        return modelCategoryService.getModelCategoriesWithUdp();
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "db_model_category",
//            systemModule = OperationModuleType.SYSTEM_CATEGORY,
//            description = "新建应用系统：{param}",
//            descriptionParamClass = ModelCategoryParamDto.class,
//            descriptionParamMethod = "getCategoryName"
//    )
    @Operation(summary = "新建应用系统")
    @PostMapping(value = "/createModelCategory")
    public ModelCategoryDto createModelCategory(@RequestBody ModelCategoryParamDto category) {
        return modelCategoryService.createModelCategory(category, category.getAppName());
    }

    @Operation(summary = "新建应用系统")
    @PostMapping(value = "/createModelCategoryNew")
    public ModelCategoryExtDto createModelCategoryNew(@RequestBody ModelCategoryParamExtDto category) {
        return modelCategoryServiceExt.createModelCategoryNew(category, category.getAppName());
    }

    @Operation(summary = "修改应用系统")
    @PostMapping(value = "/updateModelCategoryNew")
    public ModelCategoryExtDto updateModelCategoryNew(@RequestBody ModelCategoryParamExtDto category) {
        return modelCategoryServiceExt.updateModelCategoryNew(category);
    }

    @GetMapping("/getTree")
    @Operation(summary = "获取应用系统目录")
    public ModelCategoryTreeNodeDto loadStandardTree() {
        return modelCategoryServiceExt.loadStandardCodeTree();
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "db_model_category",
//            systemModule = OperationModuleType.SYSTEM_CATEGORY,
//            description = "修改应用系统：{param}",
//            descriptionParamClass = ModelCategoryParamDto.class,
//            descriptionParamMethod = "getCategoryName"
//    )
    @Operation(summary = "修改应用系统")
    @PostMapping(value = "/updateModelCategory")
    public void updateModelCategory(@RequestBody ModelCategoryParamDto category) {
        modelCategoryService.updateModelCategory(category);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_model_category",
//            systemModule = OperationModuleType.SYSTEM_CATEGORY,
//            description = "删除应用系统,ID为：{param}",
//            descriptionParamClass = ModelCategoryParamDto.class,
//            descriptionParamMethod = "getCategoryId"
//    )
    @Operation(summary = "删除应用系统")
    @PostMapping(value = "/deleteModelCategory")
    public void deleteModelCategory(@RequestBody ModelCategoryParamDto category) {
        //modelCategoryService.deleteModelCategory(category.getCategoryId(), category.getAppName());
        modelCategoryServiceExt.deleteModelCategory(category.getCategoryId(), category.getAppName());
    }

    @Description("根据系统id查询指定系统")
    @Operation(summary = "根据系统id查询指定系统")
    @PostMapping(value = "/getModelCategoryById")
    public ModelCategoryDto getModelCategoryById(@Parameter(name = "categoryId", description = "应用系统id", required = true)
                                                 @RequestParam("categoryId") Long categoryId) {
        return modelCategoryService.getModelCategory(categoryId);
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "db_model_category",
//            systemModule = OperationModuleType.SYSTEM_CATEGORY,
//            description = "导入应用系统"
//    )
    @Operation(summary = "导入系统")
    @PostMapping(value = "/uploadModelCategory")
    public int uploadModelCategories(
            @Parameter(name = "file", description = "系统文件", required = true)
            @RequestParam("file") MultipartFile multipartFile,
            @Parameter(name = "appName", description = "服务名称", required = true)
            @RequestParam(value = "appName", defaultValue = "DAM") String appName) throws Exception {
        String path = GeneralUtility.getWebRootPath() + "/resources/templates/" + multipartFile.getOriginalFilename();
        File file = new File(path);
        FileUtils.copyInputStreamToFile(multipartFile.getInputStream(), file);
        if (!file.exists()) {
            throw new UnexpectedStateException(msgService.getMessage("failedToUploadFile"));
        }

        return modelCategoryService.uploadModelCategories(file.getAbsolutePath(), appName);
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "db_model_category",
//            systemModule = OperationModuleType.SYSTEM_CATEGORY,
//            description = "导出应用系统"
//    )
    @Operation(summary = "应用系统列表文件导出")
    @PostMapping("/exportModelCategory")
    @Description("应用系统列表文件导出")
    public ResponseEntity<byte[]> exportSysList(@RequestBody List<Long> categoryIds) throws Exception {
        return modelCategoryService.exportModelCategories(categoryIds);
    }

    @Operation(summary = "下载应用系统模板")
    @PostMapping("/exportTemplate")
    @Description("下载应用系统模板")
    public ResponseEntity<byte[]> exportModelCategoryTemplate() throws Exception {
        return modelCategoryService.exportModelCategoryTemplate();
    }

    @Operation(summary = "获取指定系统的用户")
    @PostMapping("/getModelCategoryUsers")
    public List<SimpleUserDto> getModelCategoryUsers(@RequestBody ModelCategoryParamDto param) {
        return modelCategoryService.getUsersOfModelCategory(param.getCategoryId(), param.getAppName());
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "db_model_category",
//            systemModule = OperationModuleType.SYSTEM_CATEGORY,
//            description = "更新系统的用户"
//    )
    @Operation(summary = "更新某个系统的用户")
    @PostMapping("/updateModelCategoryUsers")
    public List<SimpleUserDto> updateModelCategoryUsers(@RequestBody ModelCategoryToUserDto request) {
        return modelCategoryService.updateUsersOfModelCategory(request);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "usr_auth_groups",
//            systemModule = OperationModuleType.SYSTEM_CATEGORY,
//            description = "将用户添加到系统"
//    )
    @Operation(summary = "将用户添加到系统")
    @PostMapping(value = "/addModelCategoryUsers")
    public void addUserToGroups(@RequestBody UserToModelCategoryDto request) {
        modelCategoryService.addUserToModelCategoryOwnerGroups(request);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "usr_auth_groups",
//            systemModule = OperationModuleType.SYSTEM_CATEGORY,
//            description = "把用户从系统移除"
//    )
    @Operation(summary = "把用户从系统移除")
    @PostMapping(value = "/removeModelCategoryUsers")
    public void removeUserFromGroups(@RequestBody UserToModelCategoryDto request) {
        modelCategoryService.removeUserFromModelCategoryOwnerGroups(request);
    }

    @Operation(summary = "获取某个用户的系统")
    @PostMapping("/getModelCategoryIdByUsername")
    public Collection<Long> getUserAccessibleModelCategoryIds(
            @Parameter(name = "username", description = "用户名", required = true)
            @RequestParam("username") String username,
            @Parameter(name = "appName", description = "服务名称", required = true)
            @RequestParam(value = "appName", defaultValue = "DAM") String appName) {
        return modelCategoryService.getModelCategoryOwnerGroupIdsOfUser(username, appName);
    }

}
