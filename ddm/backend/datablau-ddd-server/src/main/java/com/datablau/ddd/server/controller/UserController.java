package com.datablau.ddd.server.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.Resource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.CollectionUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.andorj.common.core.exception.IllegalOperationException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.ItemNotFoundException;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.utility.DigestUtils;
import com.datablau.base.api.ModelCategoryService70;
import com.datablau.ddd.common.exception.BusinessException;
import com.datablau.ddd.common.sqlparam.CreateUserRequestDto;
import com.datablau.ddd.common.utility.ServerConstants;
import com.datablau.ddd.data.dto.PasswordDto;
import com.datablau.ddd.data.dto.ResResultDto;
import com.datablau.ddd.data.dto.dolphinscheduler.DsTenantDto;
import com.datablau.ddd.data.jpa.entity.DsDatasourceMapping;
import com.datablau.ddd.data.jpa.entity.DsEnv;
import com.datablau.ddd.data.jpa.entity.DsProjectMapping;
import com.datablau.ddd.data.jpa.repository.DsEnvRepository;
import com.datablau.ddd.data.jpa.repository.DsProjectMappingRepository;
import com.datablau.ddd.ds.service.DolphinSchedulerDataSourceService;
import com.datablau.ddd.ds.service.DolphinSchedulerProjectService;
import com.datablau.ddd.ds.service.DolphinSchedulerUserService;
import com.datablau.ddd.security.utility.AuthTools;
import com.datablau.ddd.server.service.api.DatasourceService;
import com.datablau.ddd.server.service.api.DsEnvService;
import com.datablau.ddd.server.service.api.ProjectAuthService;
import com.datablau.ddd.server.utils.CheckUtils;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.data.UserDetails;
import com.datablau.security.management.data.UserRoleDetails;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.google.common.base.Strings;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "用户中心")
@RestController
@RequestMapping(value = "/user")
public class UserController {

    @Autowired
    private MessageService msgService;

    @Resource
    private UserService userService;

    @Autowired
    private DolphinSchedulerUserService dolphinSchedulerUserService;

    @Autowired
    private DsEnvService dsEnvService;

    @Autowired
    private DatasourceService datasourceService;

    @Autowired
    private DolphinSchedulerDataSourceService dolphinSchedulerDataSourceService;

    @Autowired
    private DsProjectMappingRepository dsProjectMappingRepository;

    @Autowired
    private DolphinSchedulerProjectService dolphinSchedulerProjectService;

    @Autowired
    private RoleService roleService;

    @Autowired
    private ModelCategoryService70 modelCategoryService;

    @Autowired
    private ProjectAuthService projectAuthService;

    @Value("${common.ds.common-password:DataBlau@1}")
    private String dsCommonPassword;

    @Autowired
    private DsEnvRepository dsEnvRepository;
    private static final String NO_ENV = "请先配置调度环境";
    private static final String NO_USER = "Dolphin中不存在此用户,请先在Dolphin中创建";

    @Operation(summary = "创建用户")
    @PostMapping(value = "/create")
    public UserDetails createUser(@RequestBody @Validated CreateUserRequestDto user) throws BusinessException {
        String password = DigestUtils.decryptEncodedContent(user.getUserDetail().getPassword());

        boolean damUser = userService.checkIfUsernameExists(user.getUserDetail().getUsername());
        if (damUser) {// dam
            throw new BusinessException(msgService.getMessage("用户名在dam中已存在"));
        }

        UserDetails userDetails = user.getUserDetail();
        Set<Long> roles = user.getUserRoles();

        if (userDetails == null) {
            throw new InvalidArgumentException(msgService.getMessage("userInfoNull"));
        }
        if (!CheckUtils.checkEmail(userDetails.getEmailAddress())) {
            throw new BusinessException(msgService.getMessage("邮箱格式错误"));
        }
        if (!CheckUtils.checkPhone(userDetails.getPhoneNumber())) {
            throw new BusinessException(msgService.getMessage("电话格式错误"));
        }

        if (roles == null || roles.isEmpty()) {
            UserRoleDetails role = userService.getRoleByRoleName(AuthTools.ROLE_USER);
            roles = Collections.singleton(role.getUserRoleId());
        }
        user.getUserDetail().setPassword(password);
        Long userId = userService.createUser(user.getUserDetail(), roles, ServerConstants.APPNAME);
        userDetails.setUserId(userId);

        try {
            dolphinSchedulerUserService.createDsUser(user.getUserDetail().getUsername(), dsCommonPassword,
                    user.getTenant(),
                    user.getUserDetail().getEmailAddress(), user.getUserDetail().getPhoneNumber(), "test");
        } catch (JsonProcessingException e) {
            throw new BusinessException("Dolphin创建用户时失败");
        }

        return userDetails;
    }

    @GetMapping("/dolphin/addAuth")
    public void addAuthForDolphin(@RequestParam("userName") String userName,
                                  @RequestParam(value = "env", required = false, defaultValue = "test") String env) {
        Set<UserRoleDetails> userRoles = userService.getUserAllRoles(userName, "DDD");
        UserRoleDetails[] userRolesArray = userRoles.toArray(new UserRoleDetails[0]);
        boolean flag = false;
        for (UserRoleDetails userRole : userRolesArray) {
            if ("PROJECT_EDIT_DDD".equals(userRole.getRoleName()) || "PROJECT_VIEW_DDD".equals(
                    userRole.getRoleName()) || "ROLE_SUPERUSER".equals(userRole.getRoleName())) {
                flag = true;
            }
        }
        if (flag) {
            Map<String, Object> dsUserInfo = null;
            try {
                dsUserInfo = dolphinSchedulerUserService.getUserInfoByUsername(userName, env);
            } catch (JsonProcessingException e) {
                throw new BusinessException("获取Dolphin用户信息时失败");
            }
            Integer dsUserId = (Integer) dsUserInfo.get("id");
            List<Long> categoryIds =
                    (List<Long>) modelCategoryService.getModelCategoryOwnerGroupIdsOfUser(userName, "DAM");
            StringBuilder systems = new StringBuilder();
            categoryIds.forEach(system -> systems.append(system).append(","));
            systems.deleteCharAt(systems.length() - 1);
            List<Long> modelList = projectAuthService.getModelIdByCategoryIds(systems.toString());
            List<DsDatasourceMapping> datasourceMappingList = datasourceService.getDatasourcesByModelIds(modelList);
            StringBuilder mappings = new StringBuilder();
            if (!datasourceMappingList.isEmpty()) {
                datasourceMappingList.forEach(mapping -> mappings.append(mapping.getDsDsId()).append(","));
                mappings.deleteCharAt(mappings.length() - 1);
            }
            dolphinSchedulerDataSourceService.addDatasourceForUser(dsUserId, mappings.toString(), env);

            // 项目赋权
            List<DsProjectMapping> projectMappingList = dsProjectMappingRepository.findAll();
            List<Long> dsProjectIds = new ArrayList<>();
            if (!projectMappingList.isEmpty()) {
                projectMappingList.forEach(projectMapping -> dsProjectIds.add(projectMapping.getDsProjectId()));
            }
            try {
                dolphinSchedulerProjectService.addGrantProject(Long.valueOf(dsUserId), dsProjectIds, env);
            } catch (JsonProcessingException e) {
                throw new BusinessException("项目赋权时失败");
            }
        }
    }

    /**
     * 在DDD中修改用户
     * @param user
     * @param userId
     * @return
     */
    @Operation(summary = "修改用户")
    @PutMapping(value = "/{userId}")
    public UserDetails updateUser(@RequestBody CreateUserRequestDto user,
                                  @PathVariable("userId") Long userId) {
        UserDetails savedUser = userService.getUserDetails(userId);
        if (savedUser == null) {
            throw new ItemNotFoundException(msgService.getMessage("invalidUserId", userId));
        }
        UserDetails details = user.getUserDetail();

        savedUser.setFullUserName(details.getFullUserName());
        savedUser.setEmailAddress(details.getEmailAddress());
        savedUser.setPhoneNumber(details.getPhoneNumber());
        savedUser.setTitle(details.getTitle());
        savedUser.setGender(details.getGender());
        savedUser.setBm(details.getBm());

        if (details.getEnabled() != null) {
            savedUser.setEnabled(details.getEnabled());
        }

        try {
            Map<String, Object> dsUserInfo =
                    dolphinSchedulerUserService.getUserInfoByUsername(user.getUserDetail().getUsername(), "test");
            if (dsUserInfo == null)
                throw new BusinessException("dolphin没有该用户");
            if (!CheckUtils.checkEmail(details.getEmailAddress())) {
                throw new BusinessException(msgService.getMessage("邮箱格式错误"));
            }
            if (!CheckUtils.checkPhone(details.getPhoneNumber())) {
                throw new BusinessException(msgService.getMessage("电话格式错误"));
            }
            dolphinSchedulerUserService.updateDsUser(Integer.parseInt(dsUserInfo.get("id").toString()),
                    details.getUsername(), null, user.getTenant(), details.getEmailAddress(), details.getPhoneNumber(),
                    "test");
        } catch (JsonProcessingException e) {
            throw new BusinessException("dolphin修改用户时失败");
        }

        userService.updateUserDetails(userId, savedUser);

        Set<Long> roles = user.getUserRoles();
        if (CollectionUtils.isEmpty(roles)) {
            UserRoleDetails role;
            if ("admin".equals(user.getUserDetail().getUsername())) {
                role = userService.getRoleByRoleName(AuthTools.ROLE_SUPERUSER);
            } else {
                role = userService.getRoleByRoleName(AuthTools.ROLE_USER);
            }
            roles = Collections.singleton(role.getUserRoleId());
        }

        userService.setUserRolesByRoleId(userId, roles, ServerConstants.APPNAME);

        return userService.getUserDetails(userId);
    }

    @Operation(summary = "根据用户id删除用户", description = "根据用户id删除用户")
    @DeleteMapping("/{userId}")
    public void deleteUser(@PathVariable(value = "userId") Long userId,
                           @RequestParam(value = "env", required = false, defaultValue = "test") String env) {
        UserDetails user = userService.getUserDetails(userId);

        if (user == null) {
            throw new BusinessException(msgService.getMessage("userNotFound"));
        }
        userService.deleteUser(userId, AuthTools.currentUsernameFailFast());
    }

    @Operation(summary = "修改密码", description = "修改密码")
    @PutMapping("/{userId}/password")
    public UserDetails updatePassword(@PathVariable(value = "userId") Long userId,
                                      @RequestBody PasswordDto user,
                                      @RequestParam(value = "env", required = false, defaultValue = "test") String env) {
        if (null == user || Strings.isNullOrEmpty(user.getNewPassword())
                || Strings.isNullOrEmpty(user.getLoginPassword())) {
            throw new InvalidArgumentException(msgService.getMessage("密码不能为空"));
        }

        UserDetails savedUser = userService.getUserDetails(userId);
        if (savedUser == null) {
            throw new ItemNotFoundException(msgService.getMessage("invalidUserId", userId));
        }

        if (savedUser.isLdapUser()) {
            throw new IllegalOperationException(msgService.getMessage("此用户无法修改密码"));
        }

        boolean b = userService.checkUserNameAndPassword(savedUser.getUsername(),
                DigestUtils.decryptEncodedContent(user.getLoginPassword()));
        if (!b) {
            throw new InvalidArgumentException(
                    msgService.getMessage("原密码错误"));
        }

        userService.updateUserPassword(savedUser.getUsername(),
                DigestUtils.decryptEncodedContent(user.getNewPassword()));
        return userService.getUserDetails(userId);
    }

    @Operation(summary = "获取DS租户列表")
    @GetMapping(value = "/tenants/all")
    public List<DsTenantDto> getDsTenants(@RequestParam(value = "env", required = false, defaultValue = "test") String env) throws JsonProcessingException {
        DsEnv dsEnv = dsEnvRepository.findDsEnvByEnv(env);
        if (dsEnv == null) {
            throw new BusinessException(NO_ENV);
        }
        return dolphinSchedulerUserService.getDsTenants(env);
    }

    @Operation(summary = "根据用户名获取DS租户")
    @GetMapping(value = "/tenants")
    public String getUserTenantByUserName(@RequestParam(value = "userName") String userName,
                                          @RequestParam(value = "env", required = false, defaultValue = "test") String env) throws IOException {
        DsEnv dsEnv = dsEnvRepository.findDsEnvByEnv(env);
        if (dsEnv == null) {
            throw new BusinessException(NO_ENV);
        }
        Map<String, Object> dsMap = dolphinSchedulerUserService.getUserInfoByUsername(userName, env);
        if (dsMap == null || dsMap.isEmpty()) {
            throw new BusinessException(NO_USER);
        }
        int tenantId = Integer.parseInt(dsMap.get("tenantId").toString());
        List<DsTenantDto> tenants = dolphinSchedulerUserService.getDsTenants(env);
        JSONArray tenantsArray = JSON.parseArray(JSON.toJSONString(tenants));
        for (int i = 0; i < tenantsArray.size(); i++) {
            JSONObject tenant = (JSONObject) tenantsArray.get(i);
            if (tenantId == tenant.getInteger("id")) {
                return tenant.getString("tenantCode");
            }
        }
        return null;
    }

    @Operation(summary = "创建租户")
    @PostMapping("/tenants")
    public ResResultDto<String> createTenants(@RequestParam("tenantCode") String tenantCode,
                                              @RequestParam("queueId") Long id,
                                              @RequestParam("description") String description) {
        dolphinSchedulerProjectService.createTenants(tenantCode, id, description);
        return ResResultDto.ok();
    }

    @Operation(summary = "修改租户")
    @PutMapping("/tenants/{id}")
    public ResResultDto<String> updateTenants(@PathVariable("id") Long id,
                                              @RequestParam("tenantCode") String tenantCode,
                                              @RequestParam("queueId") Long queueId,
                                              @RequestParam("description") String description) {
        dolphinSchedulerProjectService.updateTenants(id, tenantCode, queueId, description);
        return ResResultDto.ok();
    }

    @Operation(summary = "删除租户")
    @DeleteMapping("/tenants/{id}")
    public ResResultDto<String> deleteTenants(@PathVariable("id") Long id) {
        dolphinSchedulerProjectService.deleteTenants(id);
        return ResResultDto.ok();
    }
}
