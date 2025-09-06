package com.datablau.model.server.controller;

import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.api.PermissionHelper;
import com.datablau.model.data.api.PermissionService;
import com.datablau.model.data.dto.PermissionUserDto;
import com.datablau.model.data.dto.SimpleUserDto;
import com.datablau.model.data.dto.UserPermissionDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * @Author Nicky - 蓝图明册科技有限公司
 * @Date 2017/11/30 15:44
 */
@RestController("permissionController")
@ConditionalOnMissingBean(name = "permissionControllerExt")
@RequestMapping("/permissions")
@Tag(name = "权限相关的REST API", description = "权限相关的REST API")
public class PermissionController extends BaseController {

    @Autowired
    protected PermissionHelper permissionHelper;

    @Autowired
    protected PermissionService permissionService;

    @GetMapping("/flush")
    @Operation(summary = "刷新用户权限", description = "刷新用户权限")
    public Boolean flushUserPermission() {
        try {
            permissionHelper.reloadCurrentUserAuth(true, true);
            return true;
        } catch (Exception e) {
        }
        return false;
    }

    @GetMapping("/categories/{categoryId}")
    @Operation(summary = "获取当前用户对于指定目录的权限", description = "获取当前用户对于指定目录的权限")
    @Parameters({@Parameter(name = "categoryId", description = "目录ID", in = ParameterIn.PATH, required = true)})
    public UserPermissionDto getUserPermissionOfCategory(@PathVariable("categoryId") Long categoryId) {
        return permissionHelper.getUserPermissionsOfCategory(categoryId);
    }

    @GetMapping("/categories/")
    @Operation(summary = "获取当前用户对于目录列表的权限", description = "获取当前用户对于目录的权限")
    public Map<Long, UserPermissionDto> getUserPermissionsOfCategorys(@RequestParam(value = "categoryIds", required = false) Set<Long> categoryIds) {
        return permissionHelper.getUserPermissionsOfCategorys(categoryIds);
    }

    @GetMapping("/models/{modelId}")
    @Operation(summary = "获取当前用户对于指定模型的权限", description = "获取当前用户对于指定模型的权限")
    @Parameters({@Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public UserPermissionDto getUserPermissionOfModel(@PathVariable("modelId") Long modelId) {
        return permissionHelper.getUserPermissionsOfModel(modelId);
    }

    @GetMapping("/models/")
    @Operation(summary = "获取当前用户自己模型列表的权限", description = "获取当前用户自己模型列表的权限")
    public Map<Long, UserPermissionDto> getUserPermissionOfModels() {
        return permissionHelper.getUserPermissionsOfModels();
    }

    @GetMapping("/models/{modelId}/visible")
    @Operation(summary = "获取当前用户对于指定模型是否可访问的权限", description = "获取当前用户对于指定模型是否可访问的权限，如果有所在目录的权限，模型也可被访问")
    @Parameters({@Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public UserPermissionDto getModelUserPermission(@PathVariable("modelId") Long modelId) {
        return permissionHelper.getModelUserPermission(modelId);
    }

    @GetMapping("/categories/{categoryId}/users")
    @Operation(summary = "获取拥有指定目录访问权限的用户列表", description = "获取拥有指定目录访问权限的用户列表")
    @Parameters({@Parameter(name = "categoryId", description = "目录ID", in = ParameterIn.PATH, required = true)})
    public PermissionUserDto getUsersOfCategory(@PathVariable("categoryId") Long categoryId) {
        return permissionService.getCategoryPermission(categoryId);
    }

    @RequestMapping(value = "/categories/{categoryId}/users", method = RequestMethod.PUT)
    @Operation(summary = "修改一个目录用户权限", description = "修改一个目录用户权限")
    @Parameters({@Parameter(name = "categoryId", description = "目录ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "applyToChildren", description = "是否把权限强制设置到子目录上，会覆盖子目录权限，默认是false", in = ParameterIn.QUERY, required = false)})
    public PermissionUserDto updateUsersOfCategory(@PathVariable("categoryId") Long categoryId,
                                                   @RequestParam(name = "applyToChildren", defaultValue = "false") Boolean applyToChildren,
                                                   @RequestParam(name = "applyToModel", defaultValue = "false") Boolean applyToModel,
                                                   @Parameter(description = "用户权限列表", required = true) @RequestBody PermissionUserDto users) {
        return permissionService.saveCategoryPermission(categoryId, users, applyToChildren, applyToModel);
    }

    @GetMapping("/models/{modelId}/users")
    @Operation(summary = "获取一个模型所有的用户列表", description = "获取一个模型所有的用户列表")
    @Parameters({@Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public PermissionUserDto getUsersOfModel(@PathVariable("modelId") Long modelId) {
        return permissionService.getModelPermission(modelId);
    }

    @RequestMapping(value = "/models/{modelId}/users", method = RequestMethod.PUT)
    @Operation(summary = "更新一个模型的用户权限", description = "更新一个模型的用户权限")
    @Parameters({@Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public PermissionUserDto updateUsersOfModel(@PathVariable("modelId") Long modelId, @Parameter(description = "用户权限列表", required = true) @RequestBody PermissionUserDto users) {
        return permissionService.saveModelPermission(modelId, users);
    }

    @GetMapping("/users")
    @Operation(summary = "得到系统中所有用户列表", description = "得到系统中所有用户列表")
    public List<SimpleUserDto> getUsers() {
        return permissionHelper.getUsers();
    }
}
