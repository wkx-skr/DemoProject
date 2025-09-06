package com.datablau.gateway.security.core;

import com.andorj.model.common.utility.DigestUtils;
import com.datablau.ddd.api.RemoteDddCommonService;
import com.datablau.gateway.util.PasswordEncoderUtil;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.data.GatewayUserDetails;
import com.datablau.security.management.dto.GatewayUserDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import javax.annotation.Resource;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.ReactiveUserDetailsPasswordService;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import reactor.core.publisher.Mono;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2021/12/2 10:55
 */
@Component
public class DataBlauReactiveUserDetailsServiceImpl implements ReactiveUserDetailsService,
    ReactiveUserDetailsPasswordService {


    private static final Logger logger = LoggerFactory.getLogger(
        DataBlauReactiveUserDetailsServiceImpl.class);

    private ObjectMapper mapper = new ObjectMapper();

    @Resource
    private UserService userService;

    private static final String USER_NOT_EXISTS = "用户不存在或被禁用";

    @Value("${datablau.sso-ddt.enable:false}")
    private Boolean ssoEnable;

    @Value("${datablau.sso-ddt.url}")
    private String ssoUrl;

    @Value("${datablau.sso-ddt.verify-enable:false}")
    private Boolean verifyEnable;

    @Value("${common.ds.common-password:DataBlau@1}")
    private String dsCommonPassword;

    @Autowired
    @Qualifier("originalRestTemplate")
    private RestTemplate restTemplate;

    @Autowired
    BCryptPasswordEncoder bCryptPasswordEncoder;

    @Resource
    private RemoteDddCommonService remoteDddCommonService;

    @Override
    public Mono<UserDetails> findByUsername(String username) {

        GatewayUserDto user = userService.getEnabledUserByUsernameForGateway(username);
        if(user == null){
            return null;
        }
        if(user.isLdapUser()) return null;

        Set<GrantedAuthority> fullAuthorities = user.getAuthorities();

        UserDetails userDetails = new User(user.getUsername(), user.getPassword(), fullAuthorities);

        return Mono.just(userDetails);
    }

    public Mono<UserDetails> findByUsername(String username, String password) {
        return Mono.subscriberContext().map(context -> context.getOrDefault("tenantId", "test"))
                .flatMap(value -> {
                    GatewayUserDto user = userService.getEnabledUserByUsernameForGateway(username);
                    if(user == null || user.isLdapUser()){
//            return Mono.error(new UsernameNotFoundException(USER_NOT_EXISTS));
                        throw new UsernameNotFoundException(USER_NOT_EXISTS);
                    }

                    if(PasswordEncoderUtil.passCheck(user.getPassword(), password)){
                        Set<GrantedAuthority> fullAuthorities = user.getAuthorities();


                        userService.resetLoginFailCount(user.getId());
                        //登录sso
                        String identify = username;
                        if(ssoEnable){
                            // 调用检查逻辑
                            String ssoPassword = password;
                            if(verifyEnable && !checkDsUserExists(username,dsCommonPassword,user)){
                                // 如果返回false，则使用通用密码
                                ssoPassword = dsCommonPassword;
                            }

                            String sessionId = loginSSO(username, ssoPassword);
                            identify = StringUtils.isEmpty(sessionId) ? username:"SSO" + sessionId;
                        }

                        UserDetails userDetails = new User(user.getUsername(), identify, fullAuthorities);
                        return Mono.just(userDetails);
                    }else {
                        userService.updateLoginFailCount(username);
                        logger.warn("Invalid Credentials");
                    }
                    return Mono.empty();
                });
    }


    @Override
    public Mono<UserDetails> updatePassword(UserDetails user, String newPassword) {
        return null;
    }


    public Set<GrantedAuthority> createUser(String userDn, String username){
        boolean exists = userService.checkIfUsernameExists(username);
        if(exists){
            return userService.getUserFullAuthorities(username);
        }

        GatewayUserDetails userDetails = new GatewayUserDetails();
        userDetails.setBm("@ROOT");
        userDetails.setEnabled(true);
        userDetails.setCreationTimestamp(new Date());
        userDetails.setFullUserName(username);
        userDetails.setLdapUser(true);
        userDetails.setPassword(username);
        userDetails.setUsername(username);
        userDetails.setLdapDistinguishedName(userDn);

        userService.createUserFromGateway(userDetails, "");

        return userService.getUserFullAuthorities(username);
    }

    public Set<GrantedAuthority> createUser(String username){
        boolean exists = userService.checkIfUsernameExists(username);
        if(exists){
            return userService.getUserFullAuthorities(username);
        }

        GatewayUserDetails userDetails = new GatewayUserDetails();
        userDetails.setBm("@ROOT");
        userDetails.setEnabled(true);
        userDetails.setCreationTimestamp(new Date());
        userDetails.setFullUserName(username);
        userDetails.setLdapUser(true);
        userDetails.setPassword(username);
        userDetails.setUsername(username);

        userService.createUserFromGateway(userDetails, "");

        return userService.getUserFullAuthorities(username);
    }

    public boolean isDisabled(String username){
        boolean exists = userService.checkIfUsernameExists(username);
        if(!exists) return false;

        GatewayUserDto user = userService.getEnabledUserByUsernameForGateway(username);

        if(user == null) return true;

        return false;
    }


    private String loginSSO(String username, String password){

        MultiValueMap map = new LinkedMultiValueMap();
        map.add("userName", username);
        map.add("userPassword", DigestUtils.decryptEncodedContent(password));
        try{
            String loginInfo = getPostString(MediaType.APPLICATION_FORM_URLENCODED, map, restTemplate, ssoUrl);
            Map<Object, Object> readValue = null;
            try {
                readValue = mapper
                    .readValue(loginInfo, new TypeReference<Map<Object, Object>>() {
                    });
            } catch (Exception e) {
                logger.warn("error read data to map cause by:" + e.getMessage(), e);
//            throw new RuntimeException("sso login failed cause by:" + e.getMessage(), e);
            }
            Boolean success = false;
            if(readValue != null){
                success = (Boolean) readValue.get("success");
            }
            if(success){
                Map<Object, Object> data = (LinkedHashMap)readValue.get("data");
                return (String) data.get("sessionId");
            }else {
                logger.warn("sso login failed cause by:" + readValue.get("msg").toString());
            }
        }catch (Exception e){
            logger.warn("sso login happen exception cause by:" + e.getMessage());
        }
        //check是不是已经创建，没有则创建账号
        return null;
    }

    public static String getPostString(MediaType mediaType, MultiValueMap map, RestTemplate restTemplate, String url){
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(mediaType);
        ResponseEntity<String> exchange = restTemplate
            .exchange(url, HttpMethod.POST,
                new HttpEntity(map, headers), String.class);

        return exchange.getBody();
    }

    private boolean checkDsUserExists(String username, String dsCommonPassword, GatewayUserDto user) {
        try {
            return remoteDddCommonService.verifyUser(username,dsCommonPassword, user.getEmailAddress(),user.getPhoneNumber());
        } catch (Exception e){
            logger.warn("verify user happen exception cause by:" + e.getMessage());
        }
        return true;
    }
}
