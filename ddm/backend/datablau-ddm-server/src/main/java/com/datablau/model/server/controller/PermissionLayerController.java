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
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * @Author Nicky - 蓝图明册科技有限公司
 * @Date 2017/11/30 15:44
 */
@RestController("permissionLayerController")
@ConditionalOnMissingBean(name = "permissionLayerControllerExt")
@RequestMapping("/permissions/layer")
@Tag(name = "分层权限相关的REST API", description = "分层权限相关的REST API")
public class PermissionLayerController extends BaseController {

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


    /**
     * 获取当前用户对于分层列表的权限
     * @param layerIds
     * @return
     */
    @GetMapping("/")
    @Operation(summary = "获取当前用户对于分层列表的权限", description = "获取当前用户对于分层的权限")
    public Map<Long, UserPermissionDto> getUserPermissionsOfLayers(@RequestParam(value = "layerIds",
            required = false) Set<Long> layerIds) {
        return permissionHelper.getUserPermissionsOfLayers(layerIds);
    }


    /**
     * 获取拥有指定分层访问权限的用户列表
     * @param layerId
     * @return
     */
    @GetMapping("/{layerId}/users")
    @Operation(summary = "获取拥有指定分层访问权限的用户列表", description = "获取拥有指定分层访问权限的用户列表")
    @Parameters({@Parameter(name = "layerId", description = "分层ID", in = ParameterIn.PATH, required = true)})
    public PermissionUserDto getUsersOfLayer(@PathVariable("layerId") Long layerId) {
        return permissionService.getLayerPermission(layerId);
    }


    /**
     * 修改一个分层用户权限
     * @param layerId
     * @param applyToChildren
     * @param applyToTable
     * @param users
     * @return
     */
    @RequestMapping(value = "/{layerId}/users", method = RequestMethod.PUT)
    @Operation(summary = "修改一个分层用户权限", description = "修改一个分层用户权限")
    @Parameters({@Parameter(name = "layerId", description = "分层ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "applyToChildren", description = "是否把权限强制设置到子分层上，会覆盖子分层权限，默认是false", in =
                    ParameterIn.QUERY, required = false)})
    public PermissionUserDto updateUsersOfLayer(@PathVariable("layerId") Long layerId,
                                                @RequestParam(name = "applyToChildren", defaultValue = "false") Boolean applyToChildren,
                                                @RequestParam(name = "applyToTable", defaultValue = "false") Boolean applyToTable,
                                                @Parameter(description = "用户权限列表", required = true) @RequestBody PermissionUserDto users) {
        return permissionService.saveLayerPermission(layerId, users, applyToChildren, applyToTable);
    }


    /**
     * 获取一个表所有的用户列表
     * @param modelId
     * @param tableId
     * @return
     */
    @GetMapping("/tables/{modelId}/{tableId}/users")
    @Operation(summary = "获取一个表所有的用户列表", description = "获取一个表所有的用户列表")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "tableId", description = "表ID", in = ParameterIn.PATH, required = true)})
    public PermissionUserDto getUsersOfTable(@PathVariable("modelId") Long modelId,
                                             @PathVariable("tableId") Long tableId) {
        return permissionService.getTablePermission(modelId+"/"+tableId);
    }

    /**
     * 更新一个表的用户权限
     * @param modelId
     * @param tableId
     * @param users
     * @return
     */
    @RequestMapping(value = "/tables/{modelId}/{tableId}/users", method = RequestMethod.PUT)
    @Operation(summary = "更新一个表的用户权限", description = "更新一个表的用户权限")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "tableId", description = "表ID", in = ParameterIn.PATH, required = true)})
    public PermissionUserDto updateUsersOfTable(@PathVariable("modelId") Long modelId,@PathVariable("tableId") Long tableId, @Parameter(description =
            "用户权限列表", required = true) @RequestBody PermissionUserDto users) {
        return permissionService.saveTablePermission(modelId,tableId, users);
    }

    /**
     * 得到系统中所有用户列表
     * @return
     */
    @GetMapping("/users")
    @Operation(summary = "得到系统中所有用户列表", description = "得到系统中所有用户列表")
    public List<SimpleUserDto> getUsers() {
        return permissionHelper.getUsers();
    }

    @GetMapping("/tables/{layerId}")
    @Operation(summary = "获取当前用户自己表列表的权限", description = "获取当前用户自己表列表的权限")
    @Parameters({@Parameter(name = "layerId", description = "分层ID", in = ParameterIn.PATH, required = true)})
    public Map<String, UserPermissionDto> getUserPermissionOfTables(@PathVariable("layerId") Long layerId) {
        return permissionHelper.getUserPermissionOfTables(layerId);
    }
}
