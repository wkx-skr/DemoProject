/*
 * Copyright (c) 2017, Datablau. All rights reserved.
 */


package com.datablau.security.management.rest.controller;

import cn.hutool.poi.excel.ExcelReader;
import cn.hutool.poi.excel.ExcelUtil;
import com.andorj.common.core.exception.IllegalOperationException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.ItemNotFoundException;
import com.andorj.license.utility.lic.DamLicense3j;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.utility.Constants;
import com.andorj.model.common.utility.DigestUtils;
import com.andorj.security.common.util.UserPasswordEncoder;
import com.datablau.data.common.controller.BaseController;
import com.datablau.project.util.UserRights;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.dao.CreateOrUpdateGroupRequestDto;
import com.datablau.security.management.dao.CreateUserRequestDto;
import com.datablau.security.management.dao.GroupDao;
import com.datablau.security.management.dao.PasswordDto;
import com.datablau.security.management.dao.SimpleObjectDto;
import com.datablau.security.management.dao.SimpleObjectDto.SimpleObjectType;
import com.datablau.security.management.data.UserDetails;
import com.datablau.security.management.data.UserGroupDetails;
import com.datablau.security.management.data.UserRoleDetails;
import com.datablau.security.management.dto.AuthorityDto;
import com.datablau.security.management.dto.OrgAndUserDto;
import com.datablau.security.management.dto.OrganizationDto;
import com.datablau.security.management.dto.RoleUserExcelDto;
import com.datablau.security.management.dto.SimpleUserDto;
import com.datablau.security.management.dto.UserDto;
import com.datablau.security.management.jpa.entity.Authority;
import com.datablau.security.management.jpa.entity.Organization;
import com.datablau.security.management.jpa.entity.User;
import com.datablau.security.management.jpa.repository.AuthorityRepository;
import com.datablau.security.management.jpa.repository.GroupRepository;
import com.datablau.security.management.jpa.repository.OrganizationRepository;
import com.datablau.security.management.jpa.repository.UserRepository;
import com.datablau.security.management.util.IntegrateCryptoUtils;
import com.datablau.security.management.util.SM2Utils;
import com.datablau.security.management.utility.ServerConstants;
import com.datablau.security.management.utils.AuthTools;
import com.datablau.security.management.utils.PasswordUtility;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import com.google.common.collect.Sets;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.hadoop.util.hash.Hash;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
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
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * @author Nicky
 * @since 1.0
 */

@RestController
@RequestMapping("/usermanagement")
@Tag(name = "用户管理", description = "/usermanagement")
public class UserManagementController extends BaseController {

    private static final Logger LOGGER = LoggerFactory.getLogger(UserManagementController.class);

    @Autowired
    private UserService userService;
    @Autowired
    private TransactionTemplate transactionTemplate;
    @Autowired
    private MessageService msgService;
    @Autowired
    private OrganizationRepository organizationRepository;
    @Autowired
    private AuthorityRepository authorityRepository;
    @Autowired
    private GroupRepository groupRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private GroupDao groupDao;
    @Autowired
    private DamLicense3j lic;
    @Autowired
    private SM2Utils sm2Utils;
    @Autowired
    private IntegrateCryptoUtils cryptoUtils;



//    public UserManagementController(@Autowired RoleService roleService){
//        super(ServerConstants.SERVER_TYPE, roleService);
//    }

    /**
     * 创建用户接口
     *
     * @param user 用户dto
     * @return 返回创建成功的用户信息
     * @throws InvalidArgumentException 如果用户信息不存在则抛出异常
     */
    //@OperatorLog(
    //        operation = OperationLogType.TABLE_ADD,
    //        operateTable = "db_auth_users",
    //        systemModule = OperationModuleType.SYSTEM_STAFF,
    //        description = "新增用户：{param}",
    //        descriptionParamClass = CreateUserRequestDto.class,
    //        descriptionParamMethod = "getUsername"
    //)
    @RequestMapping(path = "/users", method = RequestMethod.POST)
    @Transactional
    @Operation(summary = "新增用户")
    public UserDetails createUser(@RequestBody CreateUserRequestDto user) {
        UserDetails userDetails = user.getUserDetail();
        Set<Long> roles = user.getUserRoles();

        if (userDetails == null) {
            throw new InvalidArgumentException(msgService.getMessage("userInfoNull"));
        }

        if (roles == null || roles.isEmpty()) {
            UserRoleDetails role = userService.getRoleByRoleName(AuthTools.ROLE_USER);
            roles = Collections.singleton(role.getUserRoleId());
        }

        user.getUserDetail().setPassword(DigestUtils.decryptEncodedContent(user.getUserDetail().getPassword()));

        //手机号加密,先使用sm2加密再调用密服平台
        String phoneNumber = userDetails.getPhoneNumber();
        if (!Strings.isNullOrEmpty(phoneNumber)) {
            String sm2Encrypt = sm2Utils.sm2Encrypt(phoneNumber);
            LOGGER.info("sm2Encrypt:{}", sm2Encrypt);
            String encryptMobile = cryptoUtils.encryptMobile(sm2Encrypt);
            user.getUserDetail().setPhoneNumber(encryptMobile);
        }
        Long userId = userService.createUser(user.getUserDetail(), roles, ServerConstants.APPNAME);
        userDetails.setUserId(userId);
        return userDetails;
    }

    /**
     * 根据username 查询用户用户接口
     *
     * @param username 用户名
     */
    @PostMapping(path = "/user/getUserByUsername")
    @Operation(summary = "根据username 查询用户用户接口")
    @Parameters({@Parameter(name = "username", description = "用户名", in = ParameterIn.QUERY, required = true)})
    public UserDto getUserByUsername(@RequestParam String username) {
        return userService.getUser(username);
    }


    @GetMapping(path = "/user/getUserByUsername")
    @Operation(summary = "根据username 查询用户用户接口")
    @Parameters({@Parameter(name = "username", description = "用户名", in = ParameterIn.QUERY, required = true)})
    public UserDto getFullUserByUsername(@RequestParam String username) {
        return userService.getUserFullInfo(username);
    }

    /**
     * 根据username 批量查询用户用户接口
     *
     * @param usernames 用户名列表
     */
    @PostMapping(path = "/user/getUsersByUsernames")
    @Operation(summary = "根据username 批量查询用户用户接口")
    public List<SimpleUserDto> getUsersByUsernames(@RequestBody List<String> usernames) {
        //当前人有用户管理就行
        boolean f = false;
        for (GrantedAuthority authority : SecurityContextHolder.getContext().getAuthentication().getAuthorities()) {
            if(authority instanceof SimpleGrantedAuthority && ObjectUtils.equals("BASE_USER_MANAGE", authority.getAuthority())){
                f = true;
            }
        }
        if(!f){
            throw new RuntimeException("当前用户没有权限访问改接口");
        }
        return userService.getUsersByUsernames(usernames);
    }

    @RequestMapping(value = "/userstatus", method = RequestMethod.GET)
    @Operation(summary = "所有用户状态")
    //@PreAuthorize(UserRights.HAS_SUPERUSER_ROLE)
    public Map<String, Boolean> getAllUserStatus() {
        return userService.getUsersStatus();
    }

    private static final Pattern PASS_CHECK =
            Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[~!@#$%^&*()_+`\\-={}:\";'<>?,.\\/]).{8,}$");

    /**
     * 启用用户
     */
    //@PreAuthorize(UserRights.HAS_SUPERUSER_ROLE)
    //@OperatorLog(
    //        operation = OperationLogType.TABLE_MODIFY,
    //        operateTable = "db_auth_users",
    //        systemModule = OperationModuleType.SYSTEM_STAFF,
    //        description = "启用用户：{param}",
    //        descriptionParamClass = String.class,
    //        descriptionParamMethod = "toString"
    //)
    @RequestMapping(value = "/users/restore", method = RequestMethod.PUT)
    @Operation(summary = "启用用户")
    public void restoreUser(@RequestBody String username) {
        userService.restoreUser(username);
    }

    /**
     * 禁用用户
     */
//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "db_auth_users",
//            systemModule = OperationModuleType.SYSTEM_STAFF,
//            description = "禁用用户: {param}",
//            descriptionParamClass = String.class,
//            descriptionParamMethod = "toString"
//    )
    @RequestMapping(path = "/users/disable", method = RequestMethod.PUT)
    @Operation(summary = "禁用用户")
    public void disableUser(@RequestBody String username) {
        userService.disableUser(username, AuthTools.currentUsernameFailFast());
    }

    /**
     * 校验用户名
     *
     * @throws InvalidArgumentException 如果参数为空则抛出异常
     */
    @PostMapping(path = "/users/checkName")
    @Operation(summary = "校验用户名")
    public SimpleObjectDto checkUserName(@RequestBody SimpleObjectDto username) {
        if (Strings.isNullOrEmpty(username.getValue())) {
            throw new InvalidArgumentException(msgService.getMessage("usernameNull"));
        }

        SimpleObjectDto result = new SimpleObjectDto();
        result.setValue(
                Boolean.toString(userService.checkIfUsernameExists(username.getValue().toString())));
        result.setType(SimpleObjectType.BOOLEAN);

        return result;
    }

    /**
     * 修改用户
     *
     * @throws ItemNotFoundException 如果用户找不到则抛出异常
     */
//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "db_auth_users",
//            systemModule = OperationModuleType.SYSTEM_STAFF,
//            description = "修改用户为: {param}",
//            descriptionParamClass = CreateUserRequestDto.class,
//            descriptionParamMethod = "getUsername"
//    )
    @RequestMapping(path = "/users/{userId}", method = RequestMethod.PUT)
    @Transactional
    @Operation(summary = "修改用户")
    @Parameters({@Parameter(name = "userId", description = "用户id", in = ParameterIn.PATH, required = true)})
    public UserDetails updateUser(@RequestBody CreateUserRequestDto user,
                                  @PathVariable("userId") Long userId) {
        UserDetails savedUser = userService.getUserDetails(userId);

        if (savedUser == null) {
            throw new ItemNotFoundException(msgService.getMessage("invalidUserId", userId));
        }

        UserDetails details = user.getUserDetail();
        savedUser.setFullUserName(details.getFullUserName());
        savedUser.setEmailAddress(details.getEmailAddress());
        //手机号加密,先使用sm2加密再调用密服平台
        if (!Strings.isNullOrEmpty(details.getPhoneNumber()) && details.getPhoneNumber().length() == 11) {
            String sm2Encrypt = sm2Utils.sm2Encrypt(details.getPhoneNumber());
            String encryptMobile = cryptoUtils.encryptMobile(sm2Encrypt);
            savedUser.setPhoneNumber(encryptMobile);
        } else {
            savedUser.setPhoneNumber(details.getPhoneNumber());
        }
        savedUser.setTitle(details.getTitle());
        savedUser.setGender(details.getGender());
        savedUser.setBm(details.getBm());

        if (details.getEnabled() != null) {
            savedUser.setEnabled(details.getEnabled());
        }

        userService.updateUserDetails(userId, savedUser);

        if (!StringUtils.equalsIgnoreCase("admin", user.getUserDetail().getUsername())) {
            Set<Long> roles = user.getUserRoles();
            if (CollectionUtils.isEmpty(roles)) {
                UserRoleDetails role;
                role = userService.getRoleByRoleName(AuthTools.ROLE_USER);
                roles = Collections.singleton(role.getUserRoleId());
            }

            if (null == user.getAppName()) {
                user.setAppName(ServerConstants.APPNAME);
            }
            userService.setUserRolesByRoleId(userId, roles, user.getAppName());
        }

        return userService.getUserDetails(userId);
    }

    /**
     * 获取用户详细信息
     */
    @RequestMapping(path = "/users/details/self")
    @Operation(summary = "获取用户详细信息")
    public UserDetails getUserDetails() {
        UserDetails details = userService.getUserDetails(AuthTools.currentUsernameFailFast());

        if (details != null) {
            details.setPassword(null);
        }

        return details;
    }

    /**
     * 更新用户详细信息
     *
     * @throws ItemNotFoundException 如果找不到则抛出异常
     */
    @RequestMapping(path = "/users/details/self", method = RequestMethod.PUT)
    @Operation(summary = "更新用户详细信息")
    public UserDetails updateUserDetails(@RequestBody UserDetails details) {
        UserDetails savedUser = userService.getUserDetails(AuthTools.currentUsernameFailFast());

        if (savedUser != null) {
            throw new ItemNotFoundException(msgService.getMessage("userInfoNotFound"));
        }

        savedUser.setEmailAddress(details.getEmailAddress());
        savedUser.setFullUserName(details.getFullUserName());
        savedUser.setPhoneNumber(details.getPhoneNumber());
        savedUser.setTitle(details.getTitle());
        savedUser.setGender(details.getGender());
        savedUser.setBm(details.getBm());

        userService.updateUserDetails(savedUser.getUserId(), savedUser);

        return savedUser;
    }

    /**
     * 更新指定用户的密码
     *
     * @throws ItemNotFoundException     找不到用户
     * @throws IllegalOperationException 如果是ldap用户
     * @throws InvalidArgumentException  如果密码为null
     * @throws IllegalOperationException 禁止修改密码
     * @throws Exception                 向上抛出异常
     */
    @RequestMapping(path = "/users/{userId}/password", method = RequestMethod.PUT)
    @Operation(summary = "更新指定用户的密码")
    @Parameters({@Parameter(name = "userId", description = "用户id", in = ParameterIn.PATH, required = true)})
    public UserDetails updatePassword(@RequestBody UserDetails user,
                                      @PathVariable("userId") Long userId) throws Exception {
        UserDetails savedUser = userService.getUserDetails(userId);

        if (savedUser == null) {
            throw new ItemNotFoundException(msgService.getMessage("invalidUserId", userId));
        }

        if (savedUser.isLdapUser()) {
            throw new IllegalOperationException(msgService.getMessage("refuseChangePassword"));
        }

        if (Strings.isNullOrEmpty(user.getPassword())) {
            throw new InvalidArgumentException(msgService.getMessage("passwordNull"));
        }

        if (!ObjectUtils.equals(savedUser.getUsername(), AuthTools.currentUsernameFailFast())
                && !AuthTools.hasAnyRole("BASE_USER_MANAGE")// base用户管理
                && !AuthTools.hasAnyRole("ROLE_USER_MANAGE_DDM")// DDM 用户管理
                && !AuthTools.hasAnyRole("USER_VIEW_DDD") // DDD 用户管理
        ) {
            throw new IllegalOperationException(msgService.getMessage("insufficientPermissionsModifyUser"));
        }

        String newPass = DigestUtils.decryptEncodedContent(user.getPassword());
        if (PasswordUtility.isSHA256PasswordEqual(savedUser.getPassword(), newPass)) {
            throw new InvalidArgumentException(msgService.getMessage("passwordDuplicate"));
        }

        UserPasswordEncoder u = new UserPasswordEncoder();
        savedUser.setPassword(u.passwordEncoder("", DigestUtils.decryptEncodedContent(user.getPassword())));

        userService.updateUserDetails(userId, savedUser);

        return userService.getUserDetails(userId);
    }

    /**
     * 更新指定用户的密码
     *
     * @throws ItemNotFoundException     找不到用户
     * @throws IllegalOperationException 如果是ldap用户
     * @throws InvalidArgumentException  如果密码为null
     * @throws IllegalOperationException 禁止修改密码
     */
    @RequestMapping(path = "/users/{userId}/password/update", method = RequestMethod.PUT)
    @Operation(summary = "更新指定用户的密码")
    @Parameters({@Parameter(name = "userId", description = "用户id", in = ParameterIn.PATH, required = true)})
    public UserDetails updatePassword(@RequestBody PasswordDto user,
                                      @PathVariable("userId") Long userId) {
        UserDetails savedUser = userService.getUserDetails(userId);
        if (savedUser == null) {
            throw new ItemNotFoundException(msgService.getMessage("invalidUserId", userId));
        }

        if (savedUser.isLdapUser()) {
            throw new IllegalOperationException(msgService.getMessage("refuseChangePassword"));
        }

        if (Strings.isNullOrEmpty(user.getOldPassword())) {
            throw new InvalidArgumentException(msgService.getMessage("passwordNull"));
        }

        if (!ObjectUtils.equals(savedUser.getUsername(), AuthTools.currentUsernameFailFast())
                && !AuthTools.hasAnyRole("BASE_USER_MANAGE")// base用户管理
                && !AuthTools.hasAnyRole("ROLE_USER_MANAGE_DDM")// DDM 用户管理
                && !AuthTools.hasAnyRole("USER_VIEW_DDD") // DDD 用户管理
        ) {
            throw new IllegalOperationException(msgService.getMessage("insufficientPermissionsModifyUser"));
        }

        boolean b = userService.checkUserNameAndPassword(savedUser.getUsername(), DigestUtils.decryptEncodedContent(user.getOldPassword()));
        if (b) {
            userService.updateUserPassword(savedUser.getUsername(),
                    DigestUtils.decryptEncodedContent(user.getNewPassword()));
        } else {
            throw new InvalidArgumentException(
                    msgService.getMessage("oldPasswordIsMissMatch"));
        }

        return userService.getUserDetails(userId);
    }

    /**
     * 新增角色
     *
     * @throws InvalidArgumentException 参数为null
     */
//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "db_auth_roles",
//            systemModule = OperationModuleType.SYSTEM_ROLE,
//            description = "新增角色,名为: {param}",
//            descriptionParamClass = CreateOrUpdateGroupRequestDto.class,
//            descriptionParamMethod = "getName"
//    )
    @RequestMapping(path = "/groups", method = RequestMethod.POST)
    @Operation(summary = "新增角色")
    public UserGroupDetails createGroup(@RequestBody CreateOrUpdateGroupRequestDto group) {
        if (group.getId() != null) {
            group.setId(null);
        }

        if (Strings.isNullOrEmpty(group.getName())) {
            throw new InvalidArgumentException(msgService.getMessage("groupNameNull"));
        }

        if (group.getName().startsWith(Constants.SYS_GROUP_PREFIX)) {
            throw new InvalidArgumentException(msgService.getMessage("invalidGroupName"));
        }

        UserGroupDetails details = new UserGroupDetails();
        details.setDescription(group.getDescription());
        details.setName(group.getName());
        details.setUserIds(group.getUserIds());
        details.setAppName(group.getAppName());

        details.setGroupRoles(new HashSet<>(userService.getUserRolesByIds(group.getRoleIds())));
        Long groupId = userService.createUserGroup(details);
        details.setId(groupId);

        return details;
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "db_auth_roles",
//            systemModule = OperationModuleType.SYSTEM_ROLE,
//            description = "修改角色为: {param}",
//            descriptionParamClass = CreateOrUpdateGroupRequestDto.class,
//            descriptionParamMethod = "getName"
//    )
    @RequestMapping(path = "/groups/{groupId}", method = RequestMethod.PUT)
    @Operation(summary = "修改角色中的权限，支持修改角色成员")
    @Parameters({@Parameter(name = "groupId", description = "角色id", in = ParameterIn.PATH, required = true)})
    public UserGroupDetails updateGroup(@RequestBody CreateOrUpdateGroupRequestDto group,
                                        @PathVariable("groupId") Long groupId) {
        return updateGroupBase(group, groupId, true);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "db_auth_roles",
//            systemModule = OperationModuleType.SYSTEM_ROLE,
//            description = "修改角色权限: {param}",
//            descriptionParamClass = CreateOrUpdateGroupRequestDto.class,
//            descriptionParamMethod = "getName"
//    )
    @RequestMapping(path = "/groups/{groupId}/onlyRole", method = RequestMethod.POST)
    @Operation(summary = "修改角色中的权限，不能修改角色的用户成员")
    @Parameters({@Parameter(name = "groupId", description = "角色id", in = ParameterIn.PATH, required = true)})
    public UserGroupDetails updateGroupRole(@RequestBody CreateOrUpdateGroupRequestDto group,
                                            @PathVariable("groupId") Long groupId) {
        return updateGroupBase(group, groupId, false);
    }

    private UserGroupDetails updateGroupBase(CreateOrUpdateGroupRequestDto group, Long groupId, boolean updateUser) {
        UserGroupDetails savedGroup = userService.getGroupBaseInfo(groupId);

        if (savedGroup == null) {
            throw new ItemNotFoundException(msgService.getMessage("foundGroupWithGroupIdInvalid", groupId));
        }

        if (savedGroup.getName().startsWith(Constants.SYS_GROUP_PREFIX)) {
            throw new IllegalOperationException(msgService.getMessage("refusedModifySysGroup"));
        }

        UserGroupDetails details = new UserGroupDetails();
        details.setDescription(group.getDescription());
        details.setName(group.getName());
        details.setUserIds(group.getUserIds());
        details.setSystemDefault(group.isSystemDefault());
        details.setGroupRoles(new HashSet<>(userService.getUserRolesByIds(group.getRoleIds())));
        details.setId(savedGroup.getId());

        userService.updateUserGroup(details, updateUser);
        return userService.getGroupBaseInfo(groupId);
    }

    @RequestMapping(path = "/users/{userId}/roles", method = RequestMethod.GET)
    @Operation(summary = "获取用户权限")
    @Parameters({@Parameter(name = "userId", description = "用户id", in = ParameterIn.PATH, required = true)})
    public Set<UserRoleDetails> getUserRoles(@PathVariable("userId") Long userId) {
        Set<UserRoleDetails> roles = userService.getRolesForUser(userId);
        return filterRoles(roles);
    }

    private Set<UserRoleDetails> filterRoles(Set<UserRoleDetails> roles) {
        if (roles == null || roles.isEmpty()) {
            return Collections.emptySet();
        }
        HashSet<UserRoleDetails> result = new HashSet<>();
        for (UserRoleDetails role : roles) {
            result.add(role);
        }
        return result;
    }

    @RequestMapping(path = "/groups/{groupId}/roles", method = RequestMethod.GET)
    @Operation(summary = "根据组获取所有角色")
    @Parameters({@Parameter(name = "groupId", description = "角色id", in = ParameterIn.PATH, required = true)})
    public Set<UserRoleDetails> getGroupRoles(@PathVariable("groupId") Long groupId) {
        Set<UserRoleDetails> roles = userService.getRolesForGroup(groupId);
        return filterRoles(roles);
    }

    /**
     * 更新某个用户的角色
     *
     * @throws ItemNotFoundException 如果用户不存在，抛出异常
     */
    @RequestMapping(path = "/users/{userId}/roles", method = RequestMethod.PUT)
    @Operation(summary = "更新某个用户的角色")
    @Parameters({@Parameter(name = "userId", description = "用户id", in = ParameterIn.PATH, required = true)})
    public Set<UserRoleDetails> updateUserRoles(@RequestBody Set<Long> newRoles,
                                                @PathVariable("userId") Long userId,
                                                @RequestParam(value = "appName", required = false) String appName) {

        Set<UserRoleDetails> userRoles = userService.getRolesForUser(userId);

        if (userRoles == null) {
            throw new ItemNotFoundException(msgService.getMessage("invalidUserId", userId));
        }

        Map<Long, UserRoleDetails> roleMap = getRoleMap(appName);
        Set<UserRoleDetails> updateRoles = new HashSet<>();
        for (Long id : newRoles) {
            UserRoleDetails role = roleMap.get(id);
            if (role != null) {
                updateRoles.add(role);
            }
        }

        if (null == appName) {
            appName = ServerConstants.APPNAME;
        }
        userService.setUserRoles(userId, updateRoles, appName);

        return updateRoles;
    }

    /**
     * 获取指定用户的角色
     *
     * @param userId 用户id
     * @throws InvalidArgumentException 如果找不到用户则抛出异常
     */
    @RequestMapping("/users/{userId}/groups")
    @Operation(summary = "获取指定用户的角色")
    @Parameters({@Parameter(name = "userId", description = "用户id", in = ParameterIn.PATH, required = true)})
    public Collection<UserGroupDetails> getUserGroups(@PathVariable("userId") Long userId,
                                                      @RequestParam(value = "appName", required = false) String appName) {
        UserDetails user = userService.getUserDetails(userId);

        if (user == null) {
            throw new InvalidArgumentException(msgService.getMessage("invalidUserId", userId));
        }

//        if (appName == null) {
//            appName = ServerConstants.APPNAME;
//        }
        List<UserGroupDetails> groups = new LinkedList<>();
        for (UserGroupDetails group : userService.getGroupDetailsBaseInfoByUser(user.getUsername(), appName, false)) {
            groups.add(group);
        }

        return groups;
    }

    /**
     * 修改用户的角色
     *
     * @throws InvalidArgumentException 如果用户不存在，则抛出异常
     */
//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "db_auth_users",
//            systemModule = OperationModuleType.SYSTEM_STAFF,
//            description = "修改用户的角色"
//    )
    @RequestMapping(value = "/users/{userId}/groups", method = RequestMethod.POST)
    @Operation(summary = "修改用户的角色")
    @Parameters({@Parameter(name = "userId", description = "用户id", in = ParameterIn.PATH, required = true)})
    public void updateUserGroups(@PathVariable("userId") Long userId,
                                 @RequestBody Set<Long> groupIds,
                                 @RequestParam(value = "appName", required = false) String appName) {
        UserDetails user = userService.getUserDetails(userId);

        if (user == null) {
            throw new InvalidArgumentException(msgService.getMessage("invalidUserId", userId));
        }

        Set<Long> currentGroupIds = new HashSet<>();

        if (null == appName) {
            appName = "DAM";
        }
        for (UserGroupDetails group : userService.getGroupDetailsBaseInfoByUser(user.getUsername(), appName, false)) {
            currentGroupIds.add(group.getId());
        }

        Set<Long> toBeAdd = new HashSet<>(Sets.difference(groupIds, currentGroupIds));
        Set<Long> toBeRemove = new HashSet<>(Sets.difference(currentGroupIds, groupIds));

        transactionTemplate.execute((TransactionStatus status) -> {
            try {
                if (!toBeAdd.isEmpty()) {
                    userService.addUserToGroups(toBeAdd, userId);
                }

                if (!toBeRemove.isEmpty()) {
                    userService.removeUserFromGroups(toBeRemove, userId);
                }
            } catch (Exception ex) {
                status.setRollbackOnly();
                throw ex;
            }

            return null;
        });
    }

    /**
     * 更新用户角色
     *
     * @throws ItemNotFoundException     找不到角色
     * @throws IllegalOperationException 禁止修改系统角色
     */
    @RequestMapping(path = "/groups/{groupId}/roles", method = RequestMethod.PUT)
    @Operation(summary = "更新用户角色")
    @Parameters({@Parameter(name = "groupId", description = "角色id", in = ParameterIn.PATH, required = true)})
    public Set<UserRoleDetails> updateGroupRoles(@RequestBody Set<Long> newRoles,
                                                 @PathVariable("groupId") Long groupId,
                                                 @RequestParam(value = "appName", required = false) String appName) {

        UserGroupDetails group = userService.getGroupBaseInfo(groupId);

        if (group == null) {
            throw new ItemNotFoundException(msgService.getMessage("foundGroupWithGroupIdInvalid", groupId));
        }

        if (group.getName().startsWith(Constants.SYS_GROUP_PREFIX)) {
            throw new IllegalOperationException(msgService.getMessage("refusedModifySysGroup"));
        }

        Map<Long, UserRoleDetails> roleMap = getRoleMap(appName);
        Set<UserRoleDetails> updateRoles = new HashSet<>();
        for (Long id : newRoles) {
            UserRoleDetails role = roleMap.get(id);
            if (role != null) {
                updateRoles.add(role);
            }
        }

        userService.setGroupRoles(groupId, updateRoles);

        return updateRoles;
    }

    /**
     * 删除用户
     */
    @RequestMapping(path = "/users/{userId}", method = RequestMethod.DELETE)
    @Transactional
    @Operation(summary = "删除用户")
    @Parameters({@Parameter(name = "userId", description = "用户id", in = ParameterIn.PATH, required = true)})
    public void deleteUser(@PathVariable("userId") Long userId) {
        UserDetails user = userService.getUserDetails(userId);
        if (user != null) {
            userService.deleteUser(userId, AuthTools.currentUsernameFailFast());
        }
    }

    private String convertUserInfo(UserDetails userDetails) {
        String username = userDetails.getUsername();
        String fullusername = userDetails.getFullUserName();
        String email = userDetails.getEmailAddress();
        if (Strings.isNullOrEmpty(fullusername)) {
            fullusername = "null";
        }

        if (Strings.isNullOrEmpty(email)) {
            email = "null";
        }
        return username + "@@" + fullusername + "@@" + email;
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_auth_roles",
//            systemModule = OperationModuleType.SYSTEM_ROLE,
//            description = "删除角色,ID为: {param}",
//            descriptionParamClass = Long.class,
//            descriptionParamMethod = "toString"
//    )
    @RequestMapping(path = "/groups/{groupId}", method = RequestMethod.DELETE)
    @Operation(summary = "删除角色")
    @Parameters({@Parameter(name = "groupId", description = "角色id", in = ParameterIn.PATH, required = true)})
    public void deleteGroup(@PathVariable("groupId") Long groupId) {
        userService.deleteUserGroup(groupId);
    }

    /**
     * 把用户添加到某个角色中
     *
     * @throws ItemNotFoundException 角色不存在则抛出异常
     */
    @RequestMapping(path = "/groups/{groupId}/users", method = RequestMethod.PUT)
    @Operation(summary = "把用户添加到某个角色中")
    @Parameters({@Parameter(name = "groupId", description = "角色id", in = ParameterIn.PATH, required = true)})
    public void addUsersToGroup(@RequestBody Set<Long> userIds,
                                @PathVariable("groupId") Long groupId) {
        UserGroupDetails group = userService.getGroupBaseInfo(groupId);

        if (group == null) {
            throw new ItemNotFoundException(msgService.getMessage("foundGroupWithGroupIdInvalid", groupId));
        }

        userService.addUsersToGroup(userIds, groupId);
    }

    /**
     * 获取所有用户
     */
    @RequestMapping(path = "/users", method = RequestMethod.GET)
    @Operation(summary = "获取所有用户")
    //@PreAuthorize(UserRights.USER_VIEW)
    public Map<Long, UserDetails> getAllUsers(
            @Parameter(name = "includeDisabled", description = "是否包含禁用的用户", required = true)
            @RequestParam(value = "includeDisabled", defaultValue = "false") Boolean includeDisabled) {
        Map<Long, UserDetails> users = userService.getUsersList(includeDisabled);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        //boolean isUserAdmin = false;
        //boolean isSuperuser = false;

        //for (GrantedAuthority authority : auth.getAuthorities()) {
        //    if (authority.getAuthority().equals(ROLE_SUPERUSER)) {
        //        isSuperuser = true;
        //    }
        //}

        //if (isSuperuser) {
        return users;
        //} else {
        //    return Collections.emptyMap();
        //}
    }


    /**
     * 根据用户名获取用户信息
     */
    @RequestMapping(path = "/users/{username}", method = RequestMethod.GET)
    @Operation(summary = "根据用户名获取用户信息")
    //@PreAuthorize(UserRights.USER_VIEW)
    public UserDto getUserDtoByUsername(@PathVariable("username") String username) {
        return userService.getUserInfoByUsername(username);
    }

    /**
     * 获取所有角色
     */
//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "db_auth_roles",
//            systemModule = OperationModuleType.SYSTEM_ROLE,
//            description = "查询角色"
//    )
    @Operation(summary = "获取所有角色")
    @RequestMapping(path = "/groups", method = RequestMethod.GET)
    @PreAuthorize(UserRights.HAS_BASE_ROLE_MANAGE_ROLE)
    public Collection<UserGroupDetails> getAllGroups(@RequestParam(value = "appName", required = false) String appName) {
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        boolean isSuperuser = false;

        //for (GrantedAuthority authority : auth.getAuthorities()) {
        //    if (authority.getAuthority().equals(ROLE_SUPERUSER)) {
        //        isSuperuser = true;
        //    }
        //}

//        if (null == appName) {
//            appName = ServerConstants.APPNAME;
//        }
//        Collection<UserGroupDetails> groups = userService.getUsersGroups(appName);

        //if (isSuperuser) {
        return userService.getUsersGroups(appName);
        //} else {
        //    return Collections.emptyList();
        //}
    }

    /**
     * 获取所有可用的权限
     */
    @RequestMapping(path = "/roles", method = RequestMethod.GET)
    @Operation(summary = "获取所有可用的权限")
    public Set<UserRoleDetails> getAvaiableRoles() {
        return filterRoles(userService.getAvailableRoles());
    }

    /**
     * 把用户从某个角色中移除
     */
    @RequestMapping(path = "/groups/{groupId}/users/{userId}", method = RequestMethod.DELETE)
    @Operation(summary = "把用户从某个角色中移除")
    @Parameters({@Parameter(name = "groupId", description = "角色id", in = ParameterIn.PATH, required = true),
            @Parameter(name = "userId", description = "用户id", in = ParameterIn.PATH, required = true)})
    public void removeUserFromGroup(@PathVariable("groupId") Long groupId,
                                    @PathVariable("userId") Long userId) {
        userService.removeUsersFromGroup(Collections.singletonList(userId), groupId);
    }

    /**
     * 判断某个角色是不是系统默认角色
     * 根据名称判断
     */
    @RequestMapping(path = "/groups/ifDefaultGroup", method = RequestMethod.POST)
    @Operation(summary = "判断某个角色是不是系统默认角色")
    @Parameters({@Parameter(name = "appName", description = "系统名", in = ParameterIn.QUERY, required = false)})
    public Map<String, Boolean> checkGroupNameIfDefault(@RequestBody List<String> groupNames, @RequestParam(value = "appName", required = false) String appName) {
        return userService.checkGroupNameIfDefault(groupNames, appName);
    }

    /**
     * 重置系统角色
     */
    @RequestMapping(path = "/groups/resetDefaultGroup", method = RequestMethod.POST)
    @Operation(summary = "重置系统角色")
    @Parameters({@Parameter(name = "groupName", description = "角色名", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "appName", description = "系统名", in = ParameterIn.QUERY, required = true)})
    public void resetDefaultGroup(@RequestParam("groupId") Long groupId) {
        userService.resetUserGroup(groupId);
    }


    private Map<Long, UserRoleDetails> getRoleMap(String appName) {
        Set<UserRoleDetails> allRoles = filterRoles(userService.getAvailableRoles(appName));
        Map<Long, UserRoleDetails> roleMap = new HashMap<>();

        for (UserRoleDetails role : allRoles) {
            roleMap.put(role.getUserRoleId(), role);
        }

        return roleMap;
    }

    /**
     * 判断当前用户是否是【数据质量管理员】
     *
     * @return 1-是；0-否
     */
    @RequestMapping(value = "/dqmuser", method = RequestMethod.GET)
    @Operation(summary = "判断当前用户是否是【数据质量管理员】")
    @Parameters({@Parameter(name = "username", description = "用户名", in = ParameterIn.QUERY, required = true)})
    public String existsByUsername(@RequestParam("username") String username) {
        return userService.existsByUsername(username);
    }

    /**
     * 获取dam系统角色，包括每个角色人数
     */
    @RequestMapping(value = "/group/getGroupBaseInfo", method = RequestMethod.POST)
    @Operation(summary = "获取dam系统角色，包括每个角色人数")
    public Collection<UserGroupDetails> getUsersGroupsBaseInfo() {
        return userService.getUsersGroupsBaseInfo(ServerConstants.APPNAME);
    }

    /**
     * 根据角色id查询用户信息
     */
    @RequestMapping(value = "/user/getUserByGroupId", method = RequestMethod.POST)
    @Operation(summary = "根据角色id查询用户信息")
    @Parameters({@Parameter(name = "groupId", description = "角色id", in = ParameterIn.QUERY, required = true)})
    public List<UserDto> getUserByGroupId(@RequestParam("groupId") Long groupId) {
        return userService.getUsersByGroupId(groupId);
    }

    /**
     * 根据用户组id查询用户信息
     */
    @RequestMapping(value = "/user/getUserByOrgVirtualId", method = RequestMethod.POST)
    @Operation(summary = "根据用户组id查询用户信息")
    @Parameters({@Parameter(name = "orgVirtualId", description = "用户组id", in = ParameterIn.QUERY, required = true)})
    public List<UserDto> getUserByOrgVirtualId(@RequestParam("orgVirtualId") Long orgVirtualId) {
        return userService.getUserByOrgVirtualId(orgVirtualId);
    }

    /**
     * 根据机构编码查询用户信息
     */
    @RequestMapping(value = "/user/getUserByBm", method = RequestMethod.POST)
    @Operation(summary = "根据机构编码查询用户信息")
    @Parameters({@Parameter(name = "bm", description = "机构编码", in = ParameterIn.QUERY, required = true)})
    public List<UserDto> getUsersBaseInfoByBm(@RequestParam("bm") String bm) {
        return userService.getUsersBaseInfoByBm(bm);
    }

    /**
     * 根据用户名和中文名模糊查询用户信息，不分页
     */
    @RequestMapping(value = "/user/getUserByKeyword", method = RequestMethod.POST)
    @Operation(summary = "根据用户名和中文名模糊查询用户信息，不分页")
    @Parameters({@Parameter(name = "keyword", description = "关键字", in = ParameterIn.QUERY, required = true)})
    public List<UserDto> getUsersBaseInfoByKeyword(@RequestParam("keyword") String keyword) {
        return userService.getUsersBaseInfoByKeyword(keyword);
    }

    /**
     * 判断当前用户是否有 超管权限
     * If have, return ROLE_SUPERUSER ; else return null;
     * */
    @RequestMapping(value = "/getUserRole/{userName}", method = RequestMethod.POST)
    public String getUserRoleByUserName(@PathVariable("userName") String userName) {
        List<Authority> list = authorityRepository.getUserAuthorities(userName);
        String res = null;
        for (Authority a : list) {
            if (a.getAuthorityString().equals("ROLE_SUPERUSER")) {
                res = "ROLE_SUPERUSER";
                break;
            }
        }
        return res;
    }

    /**
     * CUM  接收 EUM 推送的信息
     *
     *
     * */
    @RequestMapping(value = "/user/receive", method = RequestMethod.POST)
    @Transactional
    public void getDetailFromEum(@RequestBody OrgAndUserDto dto) {
        LOGGER.info("接收推送用户机构信息  开始");
        if (dto == null || dto.getOrgs().isEmpty()) {
            throw new IllegalArgumentException(msgService.getMessage("部门不能为空"));
        }
        //部门默认只传一个
//        String bm = dto.getOrgs().get(0).getBm();
        //先删除本地数据，再存传入的数据
//        userRepository.deleteAll();
//        organizationRepository.deleteAll();
//        authorityRepository.deleteAll();

        List<User> saveUser = new ArrayList<>();
        for (UserDto o : dto.getUsers()) {
            User u = User.toEntity(o);
            saveUser.add(u);
        }
        if (!saveUser.isEmpty()) {

            LOGGER.info("接收用户数： " + saveUser.size());
            userRepository.saveAll(saveUser);
        }

        List<Organization> saveOrg = new ArrayList<>();
        for (OrganizationDto o : dto.getOrgs()) {
            Organization t = Organization.toOrganization(o);
            saveOrg.add(t);
        }
        if (!saveOrg.isEmpty()) {
            LOGGER.info("接收部门数： " + saveOrg.size());
            organizationRepository.saveAll(saveOrg);
        }

        List<Authority> saveAuthority = new ArrayList<>();
        for (AuthorityDto a : dto.getAuthorities()) {
            Authority authority = Authority.toEntity(a);
            saveAuthority.add(authority);
        }
        if (!saveAuthority.isEmpty()) {
            LOGGER.info("接收权限数： " + saveAuthority.size());
            authorityRepository.saveAll(saveAuthority);
            Set<String> user = saveAuthority.stream().map(Authority::getUsername).collect(Collectors.toSet());
            List<User> roleUser = userRepository.findByUsernames(user);
            Long groupId = groupRepository.findUserGroupIdByNameAndAppName("平台管理员", ServerConstants.APPNAME);
            groupDao.innerAddUsers(groupId, roleUser);
        }


        LOGGER.info("接收推送用户机构信息  结束 ");

    }

    /**
     * 迁移数据接口，导入用户角色关联关系表
     */
    @PostMapping("/uploadRoleUserTwo")
    public void uploadDomainTwo(@RequestParam("file") MultipartFile multipartFile) throws Exception {
        // 使用Hutool读取Excel
        ExcelReader reader = ExcelUtil.getReader(multipartFile.getInputStream());
        // 设置表头别名映射（Excel列名 -> 实体属性名）
        reader.addHeaderAlias("角色名称", "roleName");
        reader.addHeaderAlias("用户工号", "userName");
        // 读取所有行数据（从第2行开始，跳过表头）
        List<RoleUserExcelDto> results = reader.readAll(RoleUserExcelDto.class);

        // 过滤空行
        List<RoleUserExcelDto> userRoles = new ArrayList<>();
        for (RoleUserExcelDto item : results) {
            if (item.getRoleName() != null && item.getUserName() != null &&
                    !item.getRoleName().isBlank() && !item.getUserName().isBlank()) {
                userRoles.add(item);
            }
        }
        ObjectMapper mapper = new ObjectMapper();
        LOGGER.info("角色用户：" + mapper.writeValueAsString(userRoles));

        //角色集合
        Collection<UserGroupDetails> groups = userService.getUsersGroups("DAM");
        Map<String, UserGroupDetails> groupMap = groups.stream().collect(Collectors.toMap(UserGroupDetails::getName, a -> a));

        HashMap<String, Set<Long>> userRolesIdsMap = new HashMap<>();
        for (RoleUserExcelDto userRole : userRoles) {
            if(!userRolesIdsMap.containsKey(userRole.getUserName())){
                userRolesIdsMap.put(userRole.getUserName(), new HashSet<>());
            }
            UserGroupDetails userGroupDetails = groupMap.get(userRole.getRoleName());
            if(userGroupDetails != null){
                Long groupId = userGroupDetails.getId();
                userRolesIdsMap.get(userRole.getUserName()).add(groupId);
            }
        }

        for (Map.Entry<String, Set<Long>> entry : userRolesIdsMap.entrySet()) {
            User user = userRepository.findByUsername(entry.getKey());
            if(user != null){
                this.updateUserGroups(user.getId(), entry.getValue(), "DAM");
            }
        }
    }

}
