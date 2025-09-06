package com.datablau.model.server.controller;

import com.andorj.common.core.exception.IllegalOperationException;
import com.andorj.common.core.exception.ItemNotFoundException;
import com.andorj.common.core.exception.UnexpectedSystemException;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.utility.DigestUtils;
import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.api.PermissionHelper;
import com.datablau.data.common.api.PropertyService;
import com.datablau.model.data.dto.SimpleUserDto;
import com.datablau.model.data.security.UserRights;
import com.datablau.model.local.utility.ServerConstants;
import com.datablau.model.message.api.MailMessageService;
import com.datablau.model.security.utility.AuthTools;
import com.datablau.model.security.utility.SecurityExceptionCode;
import com.datablau.model.server.utils.ActiveDirectoryUtils;
import com.datablau.model.server.utils.ServerExceptionCode;
import com.datablau.security.management.api.OrganizationService;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.data.UserDetails;
import com.datablau.security.management.data.UserRoleDetails;
import com.datablau.security.management.dto.UserDto;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Set;

import static com.datablau.model.security.utility.AuthTools.ROLE_LDAP;
import static com.datablau.model.security.utility.AuthTools.ROLE_SUPERUSER;
import static com.datablau.model.security.utility.AuthTools.ROLE_USER;

/**
 * @Author Nicky - 蓝图明册科技有限公司
 * @Date 2017/12/5 17:39
 */
@RequestMapping("/users")
@RestController("userController")
@ConditionalOnMissingBean(name = "userControllerExt")
@Tag(name = "用户相关REST API", description = "用户相关REST API")
public class UserController extends BaseController {

    protected static UserRoleDetails superuserRole;
    protected static UserRoleDetails normalUserRole;
    protected static UserRoleDetails ldapUserRole;
    protected static UserRoleDetails webEditorRole;
    @Autowired
    @Qualifier("userService")
    protected UserService userService;
    @Autowired
    protected MessageService msgService;
    @Autowired
    protected PermissionHelper permissionHelper;
    @Autowired
    protected MailMessageService mailMessageService;
    @Autowired
    protected PropertyService propertyService;

    @RequestMapping(value = "/password", method = RequestMethod.PUT)
    @Operation(summary = "修改用户密码", description = "修改用户密码")
    @Parameters({@Parameter(name = "password", description = "新密码", required = true)})
    public void updateUserPassword(@RequestBody String password) {
        userService.updateUserPassword(AuthTools.currentUsernameFailFast(), password);
    }

    @RequestMapping(value = "/self")
    @Operation(summary = "获取当前用户信息", description = "获取当前用户信息")
    public UserDetails getLoginCurrentUser() {
        return userService.getUserDetails(AuthTools.currentUsernameFailFast());
    }

    @RequestMapping(value = "/{userId}/password", method = RequestMethod.PUT)
    @PreAuthorize(UserRights.HAS_USER_MANAGE)
    @Operation(summary = "修改其他用户密码，必须是超级管理员才能调用", description = "修改其他用户密码，必须是超级管理员才能调用")
    @Parameters({@Parameter(name = "password", description = "新密码", required = true), @Parameter(name = "userId", description = "用户Id", in = ParameterIn.PATH, required = true)})
    public void updateOtherUserPassword(@RequestBody String password, @PathVariable("userId") Long userId) {
        UserDetails user = userService.getUserDetails(userId);

        if (user == null) {
            throw new ItemNotFoundException(msgService.getMessage("userIdNotFound", userId),
                    SecurityExceptionCode.SECURITY_USER_ID_CANNOT_BE_FOUND);
        }
        userService.updateUserPassword(user.getUsername(), password);
    }

    @RequestMapping(value = "/{userId}/superuser", method = RequestMethod.PUT)
    @PreAuthorize(UserRights.HAS_USER_MANAGE)
    @Operation(summary = "修改用户角色为超级用户角色", description = "修改用户角色为超级用户角色")
    @Parameters({
            @Parameter(name = "userId", description = "用户ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "addRole", description = "是否是添加超级用户角色给指定用户， true为添加，false为删除", in = ParameterIn.QUERY)})
    public void updateUserRoles(@PathVariable("userId") Long userId,
                                @RequestParam(name = "add", defaultValue = "true") Boolean addRole) {
        UserRoleDetails superUserRole = getSuperuserRole();
        if (addRole) {
            userService.addRoleToUser(userId, superUserRole);
        } else {
            userService.deleteRoleFromUser(userId, superUserRole);
        }
    }

    @RequestMapping(value = "/web-editors")
    //@Operation(summary = "获取所有的WEBEDITOR用户", description = "获取所有的WEBEDITOR用户" )
    @Operation(summary = "6.0开始已废弃,使用session动态管理web lic")
    public Collection<UserDetails> getAllWebEditors() {
//        UserRoleDetails webEditorRole = getWebEditorRole();
//
//        Set<UserDetails> users = userService
//                .getUsersForRole(webEditorRole.getUserRoleId());
//        return users;
        return Collections.emptyList();
    }

    @RequestMapping(value = "/web-editors", method = RequestMethod.POST)
    @PreAuthorize(UserRights.HAS_USER_MANAGE)
    @Operation(summary = "6.0开始已废弃,使用session动态管理web lic")
    @Deprecated
    public void updateWebEditors(@RequestBody Set<Long> userIds) {
//        if (!web3j.validateModelNum(userIds.size())) {
//            throw new LicenseNotSupportException(
//                    msgService.getMessage("operationNotSupportedbyCurrentCertificateNumber"),
//                    getClass().getSimpleName(), "updateWebEditors");
//        }
//
//        UserRoleDetails webEditorRole = getWebEditorRole();
//
//        Set<UserDetails> users = userService
//                .getUsersForRole(webEditorRole.getUserRoleId());
//
//        Set<Long> currentUserIds = new HashSet<>();
//        for (UserDetails user : users) {
//            currentUserIds.add(user.getUserId());
//        }
//
//        Set<Long> addUsers = Sets.difference(userIds, currentUserIds);
//        Set<Long> removeUsers = Sets.difference(currentUserIds, userIds);
//
//        for (Long userId : addUsers) {
//            userService.addRoleToUser(userId, webEditorRole);
//        }
//
//        for (Long userId : removeUsers) {
//            userService.deleteRoleFromUser(userId, webEditorRole);
//        }
    }

    @RequestMapping(value = "/", method = RequestMethod.POST)
    @PreAuthorize(UserRights.HAS_USER_MANAGE)
    @Operation(summary = "创建或者更新用户", description = "创建或者更新用户")
    public SimpleUserDto createUser(@Parameter(name = "user", description = "用户") @RequestBody SimpleUserDto user,
                                    @Parameter(name = "ldap", description = "此用户是否需要通过LDAP验证") @RequestParam(name = "ldap", defaultValue = "false") Boolean ldapUser) {
        UserDetails userDetails;
        UserRoleDetails role = null;

        UserDto savedUser = userService.getUser(user.getUsername().toLowerCase());
        //if the user is already exists but it's just disabled, we reenable it
        if (savedUser != null && !savedUser.getEnabled()) {
            UserDetails savedUserDetails = createUserDetail(savedUser);
            savedUserDetails.setEmailAddress(user.getEmail());
            savedUserDetails.setFullUserName(user.getFirstname());
            savedUserDetails.setEnabled(true);
            savedUserDetails.setUserId(savedUser.getId());
            userService.updateUserDetails(savedUser.getId(), savedUserDetails);
            if (!savedUserDetails.isLdapUser()) {
                try {
                    userService
                            .updateUserPassword(user.getUsername().toLowerCase(), user.getPassword());
                } catch (Exception exception) {
                    userService.disableUser(user.getUsername(), AuthTools.currentUsernameFailFast());
                    throw exception;
                }
            }
            return new SimpleUserDto(savedUserDetails);
        }

        if (ldapUser) {
            userDetails = new UserDetails();
            userDetails.setUsername(user.getUsername());
            if (userDetails != null) {
                userDetails.setLdapUser(true);
                userDetails.setEnabled(true);
                role = getLdapUserRole();
            } else {
                throw new UnexpectedSystemException(
                        msgService.getMessage("cannotFindUserInAd", user.getUsername()),
                        ServerExceptionCode.SERVER_USER_AD_USERNAME_DO_NOT_EXIST);
            }
        } else {
            userDetails = new UserDetails();
            userDetails.setUsername(user.getUsername());
            userDetails.setPassword(user.getPassword());
            userDetails.setEmailAddress(user.getEmail());
            userDetails.setFullUserName(user.getFirstname());
            userDetails.setLdapUser(false);
            userDetails.setEnabled(true);
            userDetails.setBm(OrganizationService.ORG_ROOT_BM);
            role = getNormalUserRole();
        }

        Long userId = userService
                .createUser(userDetails, Collections.singleton(role.getUserRoleId()),
                        ServerConstants.APPNAME);

        user.setUserId(userId);
        return user;
    }

    @RequestMapping(value = "/{userId}", method = RequestMethod.DELETE)
    @Operation(summary = "删除指定用户", description = "删除指定用户")
    @Parameter(name = "userId", description = "被删除用户ID", in = ParameterIn.PATH, required = true)
    public void deleteUserById(@PathVariable("userId") Long userId) {
        permissionHelper.deleteUserById(userId);

        UserDetails user = userService.getUserDetails(userId);
        if (user != null) {
            mailMessageService.clearUserSubscription(user.getUsername());
        }
    }

    @RequestMapping(value = "/update", method = RequestMethod.PUT)
    @Transactional
    @Operation(summary = "更新用户描述信息", description = "更新用户描述信息，如果有用户管理权限，则管理body中指定用户，如果不是就只能改自己的忽略body中的用户名")
    public void updateCurrentUser(@Parameter(name = "user", description = "用户") @RequestBody SimpleUserDto user) {
        boolean hasUserManage = AuthTools.hasRole(AuthTools.ROLE_USER_VIEW);

        UserDetails details =
                (hasUserManage ? userService.getUserDetails(user.getUsername()) :
                        userService.getUserDetails(AuthTools.currentUsernameFailFast()));
        details.setFullUserName(user.getFirstname());
        details.setEmailAddress(user.getEmail());

        userService.updateUserDetails(details.getUserId(), details);
    }

    @RequestMapping(value = "/ad/search", method = RequestMethod.GET)
    @Operation(summary = "通过域来搜索用户", description = "通过域来搜索用户")
    public List<SimpleUserDto> searchUsersInAD(
            @Parameter(description = "域名") @RequestParam("partial") String partial) {
        if (partial.length() < 3) {
            throw new IllegalOperationException(msgService.getMessage("searchWordAtLeast3Chars"),
                    ServerExceptionCode.SERVER_USER_AD_SEARCH_KEYWORD_AT_LEAST_3_CHARS);
        }

        List<SimpleUserDto> result = new ArrayList<>(50);

        for (UserDetails user : innerSearchUsersInAD(partial)) {
            result.add(new SimpleUserDto(user));
        }

        return result;
    }

    public Collection<UserDetails> innerSearchUsersInAD(String partialOfUsername) {
        ActiveDirectoryUtils utils = getADUtil();

        try {
            return utils
                    .getAllPotentialUsers("(userPrincipalName=" + partialOfUsername + "*)", 100);
        } catch (Exception ex) {
            return Collections.emptyList();
        }
    }

    protected ActiveDirectoryUtils utils;

    protected synchronized ActiveDirectoryUtils getADUtil() {
        if (utils == null) {
            String isAdEnabled = propertyService
                    .getProperty("use.active.directory.authentication", "false");
            if (Boolean.valueOf(isAdEnabled)) {
                String url = propertyService.getProperty("use.active.directory.url", "");
                if (Strings.isNullOrEmpty(url)) {
                    utils = ActiveDirectoryUtils.NULL_INSTANCE;
                    return utils;
                }

                String prefix = url.substring(0, url.indexOf("//") + 2);
                String port =
                        url.lastIndexOf(":") > 0 ? url.substring(url.lastIndexOf(":") + 1) : "";
                String hostPart = url.substring(prefix.length(),
                        port.equals("") ? url.length() : url.length() - port.length() - 1);
                Boolean useSsl = false;
                if (prefix.toLowerCase().equals("ldaps://")) {
                    useSsl = true;
                }

                String domain = propertyService.getProperty("use.active.directory.domain", "");
                if (Strings.isNullOrEmpty(domain)) {
                    utils = ActiveDirectoryUtils.NULL_INSTANCE;
                    return utils;
                }
                String[] parts = domain.split("\\.");
                for (int i = 0; i < parts.length; i++) {
                    parts[i] = "dc=" + parts[i];
                }
                String searchContext = org.apache.logging.log4j.util.Strings
                        .join(Lists.newArrayList(parts), ',');

                String username = propertyService
                        .getProperty("use.active.directory.user.username", "");
                String password = propertyService
                        .getProperty("use.active.directory.user.password", "");

                if (Strings.isNullOrEmpty(username) || Strings.isNullOrEmpty(password)) {
                    utils = ActiveDirectoryUtils.NULL_INSTANCE;
                    return utils;
                }

                utils = new ActiveDirectoryUtils(username,
                        DigestUtils.decryptIfIsEncrypted(password), hostPart, searchContext, port,
                        useSsl, true);
            }
        }

        return utils;
    }

    @RequestMapping(value = "/restore", method = RequestMethod.PUT)
    @PreAuthorize(UserRights.HAS_USER_MANAGE)
    @Operation(summary = "重新激活用户, request body 就是用户名", description = "重新激活用户")
    public void restoreUser(@Parameter(name = "username", description = "用户名") @RequestBody String username) {
        userService.restoreUser(username);
    }

    protected UserDetails createUserDetail(UserDto user) {
        UserDetails userDetails = new UserDetails();
        userDetails.setUsername(user.getUsername());
        userDetails.setFullUserName(user.getFullUserName());
        userDetails.setEmailAddress(user.getEmailAddress());
        userDetails.setPhoneNumber(user.getPhoneNumber());
        //userDetails.setStaffId(user.getStaffId());
        userDetails.setTitle(user.getTitle());
        userDetails.setPassword(user.getPassword());
        if (user.getBm() == null) {
            user.setBm(OrganizationService.ORG_ROOT_BM);
        }
        return userDetails;
    }

    protected synchronized UserRoleDetails getSuperuserRole() {
        if (superuserRole == null) {
            superuserRole = userService.getRoleByRoleName(ROLE_SUPERUSER);
        }

        return superuserRole;
    }

    protected synchronized UserRoleDetails getNormalUserRole() {
        if (normalUserRole == null) {
            normalUserRole = userService.getRoleByRoleName(ROLE_USER);
        }

        return normalUserRole;
    }

//    protected synchronized UserRoleDetails getWebEditorRole() {
//        if (webEditorRole == null) {
//            webEditorRole = userService.getRoleByRoleName(ROLE_WEB_EDITOR);
//        }
//
//        return webEditorRole;
//    }

    protected synchronized UserRoleDetails getLdapUserRole() {
        if (ldapUserRole == null) {
            ldapUserRole = userService.getRoleByRoleName(ROLE_LDAP);
        }

        return ldapUserRole;
    }
}
