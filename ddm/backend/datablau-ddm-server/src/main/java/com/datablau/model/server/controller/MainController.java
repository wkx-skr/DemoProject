package com.datablau.model.server.controller;

import com.andorj.cloud.remoting.EurekaServiceClientInterceptor;
import com.andorj.cloud.remoting.RemoteServerInfo;
import com.datablau.archy.common.service.RemoteArchyService;
import com.datablau.base.api.ModelCategoryService;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.api.LocalDomainService;
import com.datablau.model.data.api.ModelEditAuditService;
import com.datablau.model.data.api.ModelService;
import com.datablau.model.data.dto.SimpleUserDto;
import com.datablau.model.data.general.OperationType;
import com.datablau.model.local.utility.Configurations;
import com.datablau.model.local.utility.ServerConstants;
import com.datablau.model.message.api.MailMessageService;
import com.datablau.model.security.jpa.entity.auth.UserLogin;
import com.datablau.model.security.repository.UserLoginRepository;
import com.datablau.model.security.utility.AuthTools;
import com.datablau.model.server.dto.AvailableTaskDto;
import com.datablau.model.server.dto.AvailbleTaskRequestDto;
import com.datablau.model.server.dto.SystemNodeDto;
import com.datablau.model.server.dto.UserInfoDto;
import com.datablau.model.server.service.api.TokenService;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.dto.AuthorityDto;
import com.datablau.security.management.dto.UserDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @Author Nicky - 蓝图明册科技有限公司
 * @Date 2017/10/27 0027 下午 3:59
 */
@RestController("mainController")
@ConditionalOnMissingBean(name = "mainControllerExt")
@RequestMapping("/main")
@Tag(name = "系统常用功能REST API", description = "系统常用功能REST API")
public class MainController extends BaseController {

    protected static final Logger logger = LoggerFactory.getLogger(MainController.class);

    @Autowired
    protected MailMessageService mailMessageService;

    @Autowired
    protected UserLoginRepository userLoginDao;

    @Autowired
    protected ModelService modelService;

    @Autowired
    protected UserService userService;

    @Autowired
    protected LocalDomainService localDomainService;

    @Autowired
    protected TokenService tokenService;

    @Autowired
    protected ModelEditAuditService modelEditAuditService;

    @Autowired
    @Qualifier("modelCategoryService")
    protected ModelCategoryService modelCategoryService;

    @Autowired
    @Qualifier("remoteArchyService")
    protected RemoteArchyService remoteArchyService;

    @Value("${datablau.archy.enable:false}")
    protected boolean archyEnable;

    @Value("${datablau.bpmn.enable:false}")
    protected boolean bpmnEnable;

    @PostConstruct
    protected void init() {

    }

    @RequestMapping("/ping")
    @Operation(summary = "ping测试服务器连通性", description = "ping测试服务器连通性")
    public void ping() {
        return;
    }

    @RequestMapping("/damConnectable")
    @Operation(summary = "是否可以连接DAM服务器", description = "是否可以连接DAM服务器")
    public Boolean isDamConnectable() {
        return Configurations.INSTANCE.isDamConnectable();
    }

    @RequestMapping("/connectable")
    @Operation(summary = "可以连接的微服务", description = "可以连接的微服务")
    public Map<String, Boolean> isArchyConnectable() {
        Map<String, Boolean> map = new HashMap<>();
        map.put("DAM", Configurations.INSTANCE.isDamConnectable());
        map.put("ARCHY", archyEnable);
        map.put("BPMN", bpmnEnable);
        return map;
    }

    @RequestMapping("/authUserOnDam")
    @Operation(summary = "是否通过DAM服务器做用户验证", description = "是否通过DAM服务器做用户验证")
    public Boolean isAuthUserOnDam() {
        return Configurations.INSTANCE.isAuthUserOnDam();
    }

    @RequestMapping("/forceUpdateDomain")
    @Operation(summary = "强制从DAM同步更新数据标准", description = "强制从DAM同步更新数据标准")
    public Integer forceUpdateDomain() {
        logger.info(AuthTools.currentUsernameFailFast() + " is updating domains forcibly");
        return localDomainService.forceSyncDomainFromDam();
    }

    @RequestMapping("/login")
    //@Transactional(readOnly = true)
    @Operation(summary = "获取当前登录用户的信息", description = "获取当前登录用户的信息")
    public UserInfoDto loginUser() throws Exception {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        UserInfoDto result = new UserInfoDto();
        result.setUsername(username);

        UserDto details = userService.getUser(username);
        if (details != null) {
            SimpleUserDto userDto = new SimpleUserDto(details);
            result.setDetails(userDto);
        } else {
            //Should never be here
        }

        List<String> roles = new ArrayList<>();
        Set<GrantedAuthority> authorities = userService.getUserFullAuthorities(username, ServerConstants.APPNAME, false);
        for (GrantedAuthority authority : authorities) {
            roles.add(authority.getAuthority());
        }
        result.setRoles(roles);

        UserLogin login = userLoginDao.findByUsernameEquals(AuthTools.currentUsernameFailFast());

        if (login != null) {
            result.setLastLoginAddress(login.getAddress());
            result.setLastAuthTimestamp(login.getTimestamp());
        }

        result.setNotificationEnabled(mailMessageService.isMailServerConfigured());
        result.setRepositoryId(modelService.getModelRepositoryId());

        modelEditAuditService.logOperationForLogon(OperationType.LOGIN_MODEL_STORE);

        logger.debug("=>user " + username + " is logged in");
        return result;
    }

    @RequestMapping("/loginInfo")
    //@Transactional(readOnly = true)
    @Operation(summary = "获取当前登录用户的信息", description = "获取当前登录用户的信息")
    public UserInfoDto loginUserInfo() throws Exception {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        UserInfoDto result = new UserInfoDto();
        result.setUsername(auth.getName());

        UserDto details = userService.getUser(auth.getName());
        if (details != null) {
            SimpleUserDto userDto = new SimpleUserDto(details);
            result.setDetails(userDto);
        } else {
            //Should never be here
        }

        List<String> roles = new ArrayList<>();

        for (GrantedAuthority authority : auth.getAuthorities()) {
            if (authority instanceof SimpleGrantedAuthority) {
                roles.add(authority.getAuthority());
            }
        }

        result.setRoles(roles);

//        UserLogin login = userLoginDao.findByUsernameEquals(AuthTools.currentUsernameFailFast());
//
//        if (login != null) {
//            result.setLastLoginAddress(login.getAddress());
//            result.setLastAuthTimestamp(login.getTimestamp());
//        }

        result.setNotificationEnabled(mailMessageService.isMailServerConfigured());
        result.setRepositoryId(modelService.getModelRepositoryId());

//        modelEditAuditService.logOperationForLogon(OperationType.LOGIN_MODEL_STORE);

        logger.debug("=>user " + AuthTools.currentUsernameFailFast() + " is logged in");
        return result;
    }

    @RequestMapping("/logout")
    @Operation(summary = "销毁当前用户的Session", description = "销毁当前用户的Session")
    public void logoutUser(HttpServletRequest request) {
        modelEditAuditService.logOperationForLogon(OperationType.LOGOUT_MODEL_STORE);

        final HttpSession session = request.getSession(false);

        if (session != null) {
            logger.trace(session.getId() + " is set to invalid");
            session.invalidate();
        }
    }

    @RequestMapping("/login/web/token")
    @Operation(summary = "获取一个用于web唤起客户端登陆的token", description = "获取一个用于web唤起客户端登陆的token")
    public String getClientLoginToken() throws Exception {
        return tokenService.acquireToken();
    }

    @RequestMapping(value = "/login/web/client", method = RequestMethod.POST)
    @Operation(summary = "web唤起客户端登陆", description = "web唤起客户端登陆")
    public UserInfoDto clientLoginFromWeb(HttpServletRequest request, @Parameter(description = "登录Token") @RequestBody String token) throws Exception {
        String username = tokenService.validateToken(token);

        UserInfoDto result = new UserInfoDto();
//        result.setUsername("admin");
//        List<String> strings = new ArrayList<>();
//        strings.add("ROLE_USER");
//        result.setRoles(strings);
        result.setUsername(username);
//
        UserDto details = userService.getUser(username);
        if (details != null) {
            SimpleUserDto userDto = new SimpleUserDto(details);
            result.setDetails(userDto);
        } else {
            // this token is invalid!
            throw new Exception("This user is not found");
        }
        result.setNotificationEnabled(mailMessageService.isMailServerConfigured());
        result.setRepositoryId(modelService.getModelRepositoryId());

        UsernamePasswordAuthenticationToken userToken = null;
        Set<GrantedAuthority> authorities = userService.getUserFullAuthorities(username, ServerConstants.APPNAME, false);
        userToken = new UsernamePasswordAuthenticationToken(username, "ignore_it", authorities);

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(userToken);
        SecurityContextHolder.setContext(context);
        // 由于security.xml中被添加了create-session="never"，因此此处手动添加session
        request.getSession();

        List<String> roles = new ArrayList<>();
        for (GrantedAuthority authority : authorities) {
            roles.add(authority.getAuthority());
        }
        result.setRoles(roles);

        logger.debug("=>user " + username + " is logged in from client by web");
        return result;
    }

    @RequestMapping(value = "/login/web/client/old", method = RequestMethod.POST)
    @Operation(summary = "web唤起客户端登陆", description = "web唤起客户端登陆")
    public UserInfoDto clientLoginFromWebOld(HttpServletRequest request, @Parameter(description = "token") @RequestBody String token) throws Exception {
        String username = tokenService.validateToken(token);

        UserInfoDto result = new UserInfoDto();
        result.setUsername(username);

        UserDto details = userService.getUser(username);
        if (details != null) {
            SimpleUserDto userDto = new SimpleUserDto(details);
            result.setDetails(userDto);
        } else {
            // this token is invalid!
            throw new Exception("This user is not found");
        }

        List<String> roles = new ArrayList<>();

        for (AuthorityDto authority : userService.getUserAuthorities(username)) {
            roles.add(authority.getAuthorityString());
        }

        result.setRoles(roles);

        result.setNotificationEnabled(mailMessageService.isMailServerConfigured());
        result.setRepositoryId(modelService.getModelRepositoryId());

        UsernamePasswordAuthenticationToken userToken = null;
        Set<GrantedAuthority> authorities = userService.getUserFullAuthorities(username, ServerConstants.APPNAME, false);
        userToken = new UsernamePasswordAuthenticationToken(username, "ignore_it", authorities);

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(userToken);
        SecurityContextHolder.setContext(context);
        // 由于security.xml中被添加了create-session="never"，因此此处手动添加session
        request.getSession();

        logger.debug("=>user " + username + " is logged in from client by web");
        return result;
    }

    @RequestMapping("/systems")
    @Operation(summary = "获取系统列表, 将作用于客户端的模型属性中的对应系统. 现在使用树形结构, 便与项目对接", description = "获取系统列表")
    public List<SystemNodeDto> getAllSystems() {
        if (!archyEnable) {
            return convertToSystemNodeDto(modelCategoryService.getModelCategories());
        }
        List<SystemNodeDto> list = new ArrayList<>();
        try {
            List<SystemNodeDto> categories = remoteArchyService.getSystemCategories().stream()
                    .map(c -> {
                        SystemNodeDto systemNodeDto = new SystemNodeDto();
                        systemNodeDto.setId(c.getId());
                        systemNodeDto.setName(c.getName());
                        systemNodeDto.setAbbr(c.getAbbreviation());
                        systemNodeDto.setParentId(c.getParentId());
                        systemNodeDto.setIsSystem(false);
                        return systemNodeDto;
                    }).toList();
            List<SystemNodeDto> systems = remoteArchyService.getSystems().stream()
                    .map(sys -> {
                        SystemNodeDto systemNodeDto = new SystemNodeDto();
//                    systemNodeDto.setId(sys.getId());
                        systemNodeDto.setName(sys.getName());
                        systemNodeDto.setAbbr(sys.getAbbreviation());
                        systemNodeDto.setParentId(sys.getCategoryId());
                        systemNodeDto.setIsSystem(true);
                        return systemNodeDto;
                    }).toList();
            list.addAll(categories);
            list.addAll(systems);
            return list.stream()
                    .filter(c -> c.getParentId() == 0L)
                    .peek(c -> c.setChildren(getChildren(c, list)))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            logger.info("Failed to link the archy remote service: {}", e.getMessage());
        }
        return list;
    }

    protected List<SystemNodeDto> getChildren(SystemNodeDto root, List<SystemNodeDto> all) {
        return all.stream()
                .filter(system -> (system.getParentId() != null && system.getParentId().equals(root.getId())))
                .peek(system -> system.setChildren(getChildren(system, all)))
                .sorted(Comparator.comparing(SystemNodeDto::getName))
                .collect(Collectors.toList());
    }


    @RequestMapping(value = "/remote-services")
    @Operation(summary = "获取远程服务", description = "获取远程服务")
    public Map<String, Set<RemoteServerInfo>> getRemoteServices() {
        return EurekaServiceClientInterceptor.getCopiedRegistry();
    }

    protected List<SystemNodeDto> convertToSystemNodeDto(List<ModelCategoryDto> allModelCategories) {
        List<SystemNodeDto> systems = new ArrayList<>();
        for (ModelCategoryDto mc : allModelCategories) {
            SystemNodeDto sys = new SystemNodeDto();
            sys.setName(mc.getCategoryName());
            sys.setAbbr(mc.getAttributionCenter());
            systems.add(sys);
        }

        return systems;
    }


    @RequestMapping(value = "/versions/list", method = RequestMethod.POST)
    @Operation(summary = "获取模型签入版本时的可用列表", description = "各项目需要时定制", hidden = true)
    public AvailableTaskDto getModelVersionslist(@RequestBody AvailbleTaskRequestDto reqDto) {
        return null;
    }

    @RequestMapping(value = "/login/log", method = RequestMethod.POST)
    @Operation(summary = "用户登录后调用该接口记录登录日志")
    public void logOperationForLogon() {
        modelEditAuditService.logOperationForLogon(OperationType.LOGIN_MODEL_STORE);
    }

    @RequestMapping(value = "/logout/log", method = RequestMethod.POST)
    @Operation(summary = "用户登录后调用该接口记录登录日志")
    public void logOperationForLogout() {
        modelEditAuditService.logOperationForLogon(OperationType.LOGOUT_MODEL_STORE);
    }
}
