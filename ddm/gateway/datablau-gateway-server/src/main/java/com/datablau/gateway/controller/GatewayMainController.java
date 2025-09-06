package com.datablau.gateway.controller;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.utils.MultiTenantIdHolder;
import com.andorj.license.utility.lic.DamLicense3j;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.utility.DigestUtils;
import com.chenlb.mmseg4j.MMSeg;
import com.chenlb.mmseg4j.MaxWordSeg;
import com.chenlb.mmseg4j.Seg;
import com.chenlb.mmseg4j.Word;
import com.chenlb.mmseg4j.analysis.MMSegAnalyzer;
import com.datablau.data.common.util.DynamicConfigurations;
import com.datablau.gateway.dto.AboutDto;
import com.datablau.gateway.dto.PasswordDto;
import com.datablau.gateway.dto.TenantParams;
import com.datablau.gateway.dto.UserInfoDto;
import com.datablau.security.management.api.OrganizationService;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.data.UserDetails;
import com.datablau.security.management.data.UserRoleDetails;
import com.datablau.security.management.dto.OrganizationDto;
import com.datablau.security.management.dto.SimpleUserDto;
import com.datablau.security.management.dto.UserDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.google.common.base.Strings;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.ReactiveHashOperations;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.web.reactive.function.server.RequestPredicates;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;

import javax.annotation.Resource;
import java.io.StringReader;
import java.util.*;
import java.util.function.Consumer;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2023/5/18 14:02
 */
@Configuration
public class GatewayMainController extends BaseController {

    private static final Logger LOGGER = LoggerFactory.getLogger(GatewayMainController.class);

    @Value("${datablau.server.build.timstamp}")
    private String buildTimestamp;

    @Value("${datablau.server.build.version}")
    private String version;

    @Value("${datablau.server.build.number}")
    private String buildNumber;

    @Value("${datablau.server.build.release}")
    private boolean isRelease;

    @Value("${common.ddc.enable:false}")
    private boolean ddcEnable;

    @Value("${datablau.graph.enable:false}")
    private boolean graphEnable;

    @Autowired
    private ReactiveRedisTemplate<String, String> reactiveRedisTemplate;

    @Resource
    private UserService userService;

    @Resource
    private MessageService messageService;

    @Resource
    private OrganizationService organizationService;

    private AboutDto about;

    @Autowired
    private DamLicense3j lic;

    @Autowired
    private DynamicConfigurations dynamicConfig;

    @Value("${datablau.session.maxInterval:1800}")
    private int maxInactiveInterval;

    @Bean
    public RouterFunction<ServerResponse> gatewayMainRoute(){

        return RouterFunctions.route()
                .POST("/gateway/main/user/getUserLists", RequestPredicates.accept(MediaType.MULTIPART_FORM_DATA), request ->
                        request.multipartData()
                                .flatMap(data -> {
                                    String roles = getParam(data, "roles");
                                    Map<Long, SimpleUserDto> result = new HashMap<>();
                                    if (Strings.isNullOrEmpty(roles)) {
                                        Map<Long, UserDetails> users = userService.getUsersList();
                                        for (Map.Entry<Long, UserDetails> entry : users.entrySet()) {
                                            UserDetails userDetails = entry.getValue();
                                            result.put(entry.getKey(), new SimpleUserDto(userDetails.getUserId(),
                                                    userDetails.getUsername(),
                                                    null, null, userDetails.getFullUserName()));
                                        }
                                    } else {
                                        String[] roleNames = roles.split(",");
                                        Set<Long> roleIds = new HashSet<>();
                                        for (String roleName : roleNames) {
                                            UserRoleDetails role = userService.getRoleByRoleName(roleName);
                                            if (role != null) {
                                                roleIds.add(role.getUserRoleId());
                                            }
                                        }
                                        Set<UserDto> foundUsers = userService.getUsersByRoleIds(roleIds);
                                        for (UserDto user : foundUsers) {
                                            SimpleUserDto userDto = new SimpleUserDto();
                                            userDto.setFullName(user.getFullUserName());
                                            userDto.setUsername(user.getUsername());
                                            userDto.setUserId(user.getId());
                                            result.put(userDto.getUserId(), userDto);
                                        }
                                    }
                                    return ResponseHandler.responseHandler(result);
                                })
                )
                .POST("/gateway/main/update/password", RequestPredicates.accept(MediaType.APPLICATION_JSON), request -> {
                    Mono<PasswordDto> body = request.bodyToMono(PasswordDto.class);

                    return body.switchIfEmpty(Mono.defer(()->Mono.error(new InvalidArgumentException(messageService.getMessage("invalidParams")))))
                            .flatMap(passwordDto -> {
                                return ReactiveSecurityContextHolder.getContext().flatMap(securityContext -> {
                                    LOGGER.info("current user name is:" + securityContext.getAuthentication().getPrincipal().toString());
                                    boolean b = userService.checkUserNameAndPassword(securityContext.getAuthentication().getPrincipal().toString(), DigestUtils
                                            .decryptEncodedContent(passwordDto.getOldPassword()));
                                    if (b) {
                                        if (!StringUtils.isEmpty(passwordDto.getUsername())) {
                                            //修改别人
                                            Collection<? extends GrantedAuthority> authorities = securityContext.getAuthentication().getAuthorities();
                                            boolean hasRole = authorities.stream().anyMatch(auth ->
                                                    StringUtils.equals("BASE_USER_MANAGE", auth.getAuthority())
                                                            || StringUtils.equals("ROLE_USER_MANAGE_DDM", auth.getAuthority())
                                                            || StringUtils.equals("USER_VIEW_DDD", auth.getAuthority())
                                            );
                                            if (hasRole) {
                                                try{
                                                    userService.updateUserPassword(passwordDto.getUsername(),
                                                            DigestUtils.decryptEncodedContent(passwordDto.getNewPassword()));
                                                }catch (Exception e){
                                                    return Mono.error(new InvalidArgumentException(messageService.getMessage("passwordDuplicate")));
                                                }
                                                return ServerResponse.ok().build();
                                            } else {
                                                return Mono.error(new InvalidArgumentException(messageService.getMessage("userNoPermition")));
                                            }
                                        } else {
                                            userService.updateUserPassword(securityContext.getAuthentication().getPrincipal().toString(),
                                                    DigestUtils.decryptEncodedContent(passwordDto.getNewPassword()));
                                            return ServerResponse.ok().build();
                                        }
                                    } else {
                                        return Mono.error(new InvalidArgumentException(messageService.getMessage("oldPasswordError")));
                                    }
                                });
                            });

                })
                .POST("/gateway/main/about", RequestPredicates.accept(MediaType.ALL), request -> {
                    if (about == null) {
                        synchronized (this) {
                            if (about == null) {
                                about = new AboutDto();
                                about.setBuildNumber(buildNumber);
                                about.setVersion(version);
                                about.setBuildTimestamp(buildTimestamp);
                                about.setLicUser(lic.getLicenseUser());
                                about.setLicCompany(lic.getCompany());
                                about.setLicExpireTime(lic.getExpiredDate());
                                about.setCreateTime(lic.getCreateTime());
                                about.setLicModelNumber(lic.getModelNumber());
                                about.setRelease(isRelease);
                            }
                        }
                    }
                    about.setFeatures(lic.getRv());
                    ReactiveHashOperations<String, String, String> ops = reactiveRedisTemplate.opsForHash();
                    ops.scan("dynamic_configurations").collectList().subscribe(new Consumer<List<Map.Entry<String, String>>>() {
                        @Override
                        public void accept(List<Map.Entry<String, String>> entries) {
                            String tenantId = getTenantId() == null ? TenantParams.DEFAULT_TENANT : getTenantId();
                            for (Map.Entry<String, String> entry : entries) {
                                String val = "false";
                                if (entry.getKey().endsWith(tenantId + "_configurable.user.force.strong.password") ||
                                    entry.getKey().endsWith(tenantId + "configurable.user.force.strong.password")) {
                                    val = entry.getValue();
                                }
                                about.setStrongPassword(Boolean.parseBoolean(val));
                            }
                        }
                    });
                    about.setKnowledgeGraphEnabled(graphEnable);
                    about.setEsEnabled(ddcEnable);
                    about.setMaxInterval(maxInactiveInterval);
                    try {
                        return ResponseHandler.responseHandler(HttpStatus.OK, mapper.writeValueAsString(about));
                    } catch (JsonProcessingException e) {
                        LOGGER.warn("parse data failed cause by:" + e.getMessage());
                        return ResponseHandler.responseHandler(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
                    }
                })
                .POST("/gateway/main/wordz", RequestPredicates.accept(MediaType.MULTIPART_FORM_DATA), request ->
                        request.multipartData().flatMap(data -> {
                            String text = getParam(data, "word");

                            StringBuilder sb = new StringBuilder();
                            Seg seg = new MaxWordSeg(new MMSegAnalyzer().getDict());
                            MMSeg mmSeg = new MMSeg(new StringReader(text), seg);
                            Word word = null;
                            boolean first = true;
                            try{
                                while ((word = mmSeg.next()) != null) {
                                    if (!first) {
                                        sb.append("|");
                                    }
                                    String w = word.getString();
                                    sb.append(w);
                                    first = false;
                                }
                            }catch (Exception e){
                                LOGGER.warn(e.getMessage(), e);
                                return ResponseHandler.responseHandler(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
                            }

                            return ResponseHandler.responseHandler(HttpStatus.OK, sb.toString());
                        })
                )
                .POST("/gateway/main/getUserInfo", RequestPredicates.accept(MediaType.ALL), request ->
                        ReactiveSecurityContextHolder.getContext().flatMap(context -> {

                            Authentication auth = context.getAuthentication();
                            UserInfoDto result = new UserInfoDto();
                            result.setUsername(auth.getName());
                            UserDto user = userService.getUser(auth.getName());
                            result.setUserid(user.getId());
                            result.setFullname(user.getFullUserName());

                            OrganizationDto organizationDto = organizationService
                                    .getOrganizationsByBm(user.getBm());
                            if (organizationDto != null) {
                                result.setOrgId(organizationDto.getId());
                                result.setOrgName(organizationDto.getFullName());
                            }

                            Set<String> roles = new HashSet<>();

                            for (GrantedAuthority authority : auth.getAuthorities()) {
                                if (authority instanceof SimpleGrantedAuthority) {
                                    roles.add(authority.getAuthority());
                                }
                            }
                            result.setRoles(new ArrayList<>(roles));

                            return ResponseHandler.responseHandler(result);
                        })
                )
                .build();
    }

    private String getTenantId() {
        String tenantId = MultiTenantIdHolder.getTenantId();
        if (MultiTenantIdHolder.NO_TENANT.equals(tenantId)) {
            return null;
        } else {
            return tenantId;
        }
    }
}
