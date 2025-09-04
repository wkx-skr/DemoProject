package com.datablau.security.management.rest.controller;

import cn.hutool.poi.excel.ExcelReader;
import cn.hutool.poi.excel.ExcelUtil;
import com.andorj.common.data.PageResult;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.data.restApi.RestApiDescriptorSimple;
import com.datablau.data.common.util.RestApiExporter;
import com.datablau.security.management.api.RoleService70;
import com.datablau.security.management.dao.GroupDao;
import com.datablau.security.management.dto.RoleDto;
import com.datablau.security.management.dto.RoleTreeDto;
import com.datablau.security.management.dto.RoleUserExcelDto;
import com.datablau.security.management.jpa.repository.AppApiRegistryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/role")
@Tag(name = "权限的rest api")
public class RoleController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(RoleController.class);

    @Autowired
    private AppApiRegistryRepository appApiRegistryRepo;

    @Autowired
    private RoleService70 roleService;

    /**
     * 创建角色
     *
     * @param roleDto 角色
     */
    @Operation(summary = "创建角色")
    @RequestMapping(value = "/", method = RequestMethod.POST)
    public void createRole(@RequestBody RoleDto roleDto) {
        roleService.createRole(roleDto);
    }

    /**
     * 校验角色唯一性
     *
     * @param roleDto 角色
     */
    @Operation(summary = "校验角色唯一性")
    @RequestMapping(value = "/checkRoleNameUnique", method = RequestMethod.POST)
    public boolean checkRoleNameUnique(@RequestBody RoleDto roleDto) {
        return roleService.checkRoleNameUnique(roleDto.getRoleName());
    }

    /**
     * 修改角色
     *
     * @param roleDto 角色
     */
    @Operation(summary = "修改角色")
    @RequestMapping(value = "/", method = RequestMethod.PUT)
    public void modifyRole(@RequestBody RoleDto roleDto) {
        roleService.modifyRole(roleDto);
    }

    /**
     * 删除角色
     *
     * @param id 角色id
     */
    @Operation(summary = "删除角色")
    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public void deleteRole(@Parameter(name = "id", description = "角色id", required = true)
                           @PathVariable Long id) {
        roleService.deleteRole(id);
    }

    /**
     * 获取角色下拉查询条件
     */
    @Operation(summary = "获取角色下拉查询条件")
    @RequestMapping(value = "/options", method = RequestMethod.POST)
    public Map<String, List<String>> getRoleOptions(@RequestBody List<String> appNames) {
        return roleService.getRoleOptions(appNames);
    }

    /**
     * 查询角色
     *
     * @param roleDto 角色
     */
    @Operation(summary = "查询角色")
    @RequestMapping(value = "/page", method = RequestMethod.POST)
    public PageResult<RoleDto> queryRole(@RequestBody RoleDto roleDto) {
        return roleService.queryRole(roleDto);
    }

    /**
     * 获取所有角色
     */
    @Operation(summary = "获取服务中角色")
    @RequestMapping(value = "/service", method = RequestMethod.POST)
    public List<String> getServiceRole(@RequestBody List<String> appNames) {
        return roleService.getServiceRole(appNames);
    }

    /**
     * 获取所有角色
     */
    @Operation(summary = "获取所有角色")
    @RequestMapping(value = "/all/tree", method = RequestMethod.GET)
    public RoleTreeDto getRolesTree() {
//        //过滤掉不存在的微服务
//        List<String> toBeFilter = new ArrayList<>();
//        boolean authEnabled = "true".equalsIgnoreCase(propertyService.getProperty("datablau.auth.server.enable", "false"));
//        if (!authEnabled) {
//            toBeFilter.add("数据安全");
//        }
//
//        if (appName == null) {
//            appName = ServerConstants.APPNAME;
//        }
//        RoleTreeDto roleTreeDto = roleService.getRolesTree(appName);
//        List<RoleTreeDto> filteredChildren = new ArrayList<>();
//        for (RoleTreeDto module : roleTreeDto.getChildren()) {
//            if (!toBeFilter.contains(module.getModule())) {
//                filteredChildren.add(module);
//            }
//        }
//        roleTreeDto.setChildren(filteredChildren);
//        return roleTreeDto;
        return roleService.getRolesTree();
    }

    @Operation(summary = "根据appName获取对应角色")
    @RequestMapping(value = "/app/tree", method = RequestMethod.POST)
    public RoleTreeDto getRolesTree(@RequestBody List<String> appNames) {
        if (CollectionUtils.isEmpty(appNames)) {
            return null;
        }
        ArrayList<String> appNameRes = new ArrayList<>();
        for (String appName : appNames) {
            if ("DATA_QUALITY".equals(appName)){
                continue;
            }
            appNameRes.add(appName);
        }
        return roleService.getRolesTree(appNameRes);
    }

    /**
     * 生成角色文件
     *
     * @throws Exception 抛出异常
     */
    @Operation(summary = "生成角色文件")
    @RequestMapping(value = "/createFile", method = RequestMethod.POST)
    public void createFile(HttpServletResponse response) throws Exception {
        exportFile(roleService.createRoleFile(), response, "role.csv");
    }

    /**
     * 获取所有rul
     */
    @Operation(summary = "获取所有rul")
    @GetMapping(value = "/all/api")
    public List<RestApiDescriptorSimple> getAllApi() {
        RestApiExporter restApiExporter = new RestApiExporter();
        List<RestApiDescriptorSimple> allApi = restApiExporter.getAllApi(
                "com.datablau.security.management.rest.controller");
        appApiRegistryRepo.findAll().forEach(r -> allApi.addAll(r.getApiDescriptors()));
        return allApi;
    }



}
