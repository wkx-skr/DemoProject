package com.datablau.gateway.filter;

import static com.datablau.gateway.security.SecurityConfig.getWhiteString;

import cn.hutool.http.HttpResponse;
import cn.hutool.http.HttpUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.datablau.gateway.util.DopTokenHttpUtil;
import com.datablau.gateway.util.GatewayDigestUtilsSm2;
import com.datablau.gateway.util.SM2Utils;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.data.UserDetails;
import com.datablau.security.management.data.UserRoleDetails;
import com.datablau.security.management.dto.UserDto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.Serializable;
import java.lang.reflect.Field;
import java.security.PrivateKey;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;
import javax.annotation.PostConstruct;
import javax.servlet.ServletRequest;

import org.apache.commons.lang.StringUtils;
import org.bouncycastle.jcajce.provider.asymmetric.ec.BCECPrivateKey;
import org.reactivestreams.Publisher;
import org.redisson.spring.session.RedissonSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpRequestDecorator;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.http.server.reactive.ServerHttpResponseDecorator;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.session.ReactiveSessionRepository;
import org.springframework.session.Session;
import org.springframework.util.ObjectUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2021/11/22 10:23
 */
@Configuration
public class AccessGatewayFilter implements GlobalFilter, Ordered{
    private final Logger logger = LoggerFactory.getLogger(AccessGatewayFilter.class);
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${datablau.security-url.client-token}")
    private String clientTokenUri;

    @Value("${datablau.security-url.ignore}")
    private String whiteStr;

    @Value("${sso.wesis_ip}")
    private String wesisIp;

    @Value("${sso.redirect_url}")
    private String redirectUrl;

    @Value("${sso.token_url}")
    private String tokenUrl;

    @Value("${sso.user_url}")
    private String userUrl;

    @Value("${sso.decrypt_id}")
    private String decryptId;
//    @Value("${sso.client_secret}")
//    private String clientSecret;
    @Value("${sso.client_id}")
    private String clientId;
    @Value("${sso.dam_ip}")
    private String damIp;
    @Value("${sso.dam_path}")
    private String damPath;
    @Value("${dop.dam_ip}")
    private String  dopDamIp;
    //  dop:
    //    model: MINE   #两个选项 第一个mine 为走自己的情况，第二种dop为去解析客户的情况 均为全部大写
    //    dopUrl : http://10.37.19.188/  # 开发测试环境：http://10.37.201.24:8000/  UAT环境：http://10.37.19.188/   生产环境：https://dop.pipechina.com.cn



    @Value("${datablau.token-check-urls}")
    private List<String> tokenCheckUrls;

    @Value("${datablau.dop.model}")
    private String  modelType;

    @Value("${datablau.dop.dopUrl}")
    private String  dopUrl;

    @Value("${integrate.encryptUrl:https://dataplat-portal.pipechina.com.cn:8080/encrypt}")
    private String encryptUrl;
    @Value("${integrate.encryptAppId:DataArchPlatform}")
    private String encryptAppId;

    @Autowired
    private UserService userService;
    @Autowired
    private SM2Utils sm2Utils;

    @Autowired
    private ReactiveSessionRepository reactiveSessionRepository;

    private String[] whiteUrl;

    @PostConstruct
    private void init(){
        whiteUrl = getWhiteString(whiteStr);
    }

    /**
     * gateway自定义核心拦截器
     * @param exchange
     * @param chain
     * @return
     */
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        logger.info("当前请求地址{}", exchange.getRequest().getPath().value());
        if (exchange.getRequest().getPath().value().indexOf(clientTokenUri) >= 0) {
            logger.info("当前请求地址1");
            AtomicReference<String> sessionId = new AtomicReference<>();
            ServerHttpResponse originalResponse = exchange.getResponse();
            ServerHttpResponseDecorator decoratedResponse = new ServerHttpResponseDecorator(originalResponse) {
                @Override
                public Mono<Void> writeWith(Publisher<? extends DataBuffer> body) {
                    if (getStatusCode().equals(HttpStatus.OK) && body instanceof Flux) {
                        Flux<? extends DataBuffer> fluxBody = Flux.from(body);
                        return super.writeWith(fluxBody.buffer().map(dataBuffers -> {
                            List<String> list = new ArrayList<String>();
                            dataBuffers.forEach(dataBuffer -> {
                                byte[] content = new byte[dataBuffer.readableByteCount()];
                                dataBuffer.read(content);
                                DataBufferUtils.release(dataBuffer);
                                try {
                                    list.add(new String(content, "utf-8"));
                                } catch (IOException e) {
                                    logger.error("read response data failed cause by:" + e.getMessage());
                                }
                            });
                            String userInfoStr = list.stream().collect(Collectors.joining());
                            sessionId.set(setTokenSession(userInfoStr, exchange));
                            return bufferFactory().wrap(userInfoStr.getBytes());
                        }));
                    }
                    return super.writeWith(body);
                }
            };
            // replace response with decorator
            ServerHttpResponse response = exchange.getResponse();

            response.beforeCommit(() -> {
                StringBuffer sb = new StringBuffer();
                sb.append("SESSION=");
                sb.append(sessionId.get());
                sb.append("; path=/;");
                sb.append(" HttpOnly;");
                response.getHeaders().add(HttpHeaders.SET_COOKIE, sb.toString());
                return Mono.empty();
            });

            return chain.filter(exchange.mutate().response(decoratedResponse).build());
        } else if (exchange.getRequest().getPath().value().indexOf(redirectUrl) >= 0) {
            logger.info("当前请求地址2");
            ServerHttpResponse response = exchange.getResponse();
            ServerHttpRequest request = exchange.getRequest();

            //1、回调拿tgt
            String tgt = null;
            try {
                tgt = request.getQueryParams().get("tgt").get(0);
            } catch (RuntimeException e) {
                //调用getToken接口，进行身份验证
                String url = this.getRedirectUrl();
                response.beforeCommit(() -> {
                    logger.info("跳转地址: {}", url);
                    response.getHeaders().add(HttpHeaders.LOCATION, url);
                    response.setStatusCode(HttpStatus.FOUND);
                    return Mono.empty();
                });
            }
            String username = null;
            String chineseName = null;
            String email = null;
            String mobile = null;

            if (!StringUtils.isEmpty(tgt)) {
                try {
                    logger.info("获取的tgt: {}", tgt);
                    //获取用户信息
                    Map<String, String> ssoUser = this.getSSOUser(tgt);
                    username = ssoUser.get("username");
                    chineseName = ssoUser.get("name");
                    email = ssoUser.get("email");
                    mobile = ssoUser.get("mobile");
                    logger.info("用户: {} 请求登录..", username);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }

            if (!StringUtils.isEmpty(username)) {
                AtomicReference<String> sessionId = new AtomicReference<>();
                //4、登录建用户
                sessionId.set(this.setSSOTokenSession(username, chineseName, email, mobile));
                response.beforeCommit(() -> {
                    StringBuffer sb = new StringBuffer();
                    sb.append("SESSION=");
                    sb.append(sessionId.get());
                    sb.append("; path=/;");
                    sb.append(" HttpOnly;");
                    response.getHeaders().add(HttpHeaders.SET_COOKIE, sb.toString());
                    String refPath = damIp + damPath;
                    logger.info("跳转地址: {}", refPath);
                    response.getHeaders().add(HttpHeaders.LOCATION, refPath);
                    response.setStatusCode(HttpStatus.FOUND);
                    return Mono.empty();
                });
            }

            return chain.filter(exchange);
        } else if (tokenCheckUrls.stream().anyMatch(url -> exchange.getRequest().getPath().value().startsWith(url))) {
            logger.info("当前请求地址3");
            String baseUrl = dopDamIp;
            logger.info("当前请求:" + exchange.getRequest().getPath());
            ServerHttpRequest request = exchange.getRequest();
            ServerHttpResponse response = exchange.getResponse();

            // 获取 token 参数
            String token = request.getQueryParams().getFirst("token");
            if (StringUtils.isEmpty(token)) {
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return response.setComplete();
            }

            String buName = null;
            // 将buName参数编码后添加到重定向URL中
            try {
                logger.info("获取业务参数");
                buName = request.getQueryParams().getFirst("buName");
                logger.info("获取成功" +buName);
                buName = java.net.URLEncoder.encode(buName, "UTF-8");
                logger.info("获取到的参数{}", buName);
            } catch (Exception e) {
                logger.error("获取参数失败" + e.getMessage());
            }
            String username = null;
            try {
                // 使用 SM2 解密 token 获取原始信息（格式：username|timestamp|uuid）
                if (modelType.equals("MINE")) {
                    String rawToken = GatewayDigestUtilsSm2.decryptEncodedSm2(token);
                    logger.info("Token 解密结果: {}", rawToken);
                    String[] parts = rawToken.split("\\|");
                    username = parts[0];
                    logger.info("Token 提取用户名: {}", username);
                } else {
                    try {
                        String s = DopTokenHttpUtil.fetchAccount(dopUrl, token);
                        logger.info("解析出来的用户" + s);
                        username = s;
                    } catch (Exception e) {
                        logger.error(e.getMessage());
                    }
                }

                String redirectUrl = null;
                // 后续跳转/逻辑判断（按路径分发）
                String path = request.getPath().value();
                if (path.startsWith("/domain/apply/batchManager")) {
                    // 示例：记录访问日志或跳转
                    redirectUrl = baseUrl + "/ddc-app/#/dop/batchManager";
                    logger.info("进入 batchManager 页面，用户：{}", username);
                }else if (path.startsWith("/domain/apply/batchHomeOut")) {
                    String batchId = exchange.getRequest().getQueryParams().getFirst("batchId");
                    redirectUrl = baseUrl + "/ddc-app/#/dop/batchDetail?id=" + batchId+"&hideBack=true";
                    logger.info("跳转地址:{}",redirectUrl);
                    logger.info("进入外部审批页面，用户：{}", username);
                } else if (path.startsWith("/domain/apply/digitalOperationPlatform/asset")) {
                    // 如果是 DL1-DL3 那么需要到这条件进行操作 避免出现转义 这里使用英文
                    if (ObjectUtils.isEmpty(buName)) {
                        redirectUrl = baseUrl + "/ddc-app/#/dop/batchManager?state=CONFIRMED&operate=asset";
                    } else {
                        redirectUrl = baseUrl + "/ddc-app/#/dop/batchManager?state=CONFIRMED&operate=asset&buName=" + buName;
                    }
                    logger.info("跳转地址:{}",redirectUrl);
                    logger.info("进入 DOP 页面，用户：{}", username);
                } else if (path.startsWith("/domain/apply/digitalOperationPlatform/model")) {
                    // 如果是 DL4-DL5 那么需要到这条件进行操作 避免出现转义 这里使用英文
                    if (ObjectUtils.isEmpty(buName)) {
                        redirectUrl = baseUrl + "/ddc-app/#/dop/batchManager?state=CONFIRMED&operate=model";
                    } else {
                        redirectUrl = baseUrl + "/ddc-app/#/dop/batchManager?state=CONFIRMED&operate=model&buName=" + buName;
                    }
                    logger.info("跳转地址:{}",redirectUrl);
                    logger.info("进入 DOP 页面，用户：{}", username);
                } else if (path.startsWith("/domain/apply/digitalOperationPlatform/standard")) {
                    // 如果是 DL4-DL5 那么需要到这条件进行操作 避免出现转义 这里使用英文
                    if (ObjectUtils.isEmpty(buName)) {
                        redirectUrl = baseUrl + "/ddc-app/#/dop/batchManager?state=CONFIRMED&operate=standard";
                    } else {
                        redirectUrl = baseUrl + "/ddc-app/#/dop/batchManager?state=CONFIRMED&operate=standard&buName=" + buName;
                    }
                    logger.info("跳转地址:{}",redirectUrl);
                    logger.info("进入 DOP 页面，用户：{}", username);
                } else if (path.startsWith("/domain/apply/digitalOperationPlatform")) {
                    redirectUrl = baseUrl + "/ddc-app/#/dop/batchManager?state=CONFIRMED";
                    logger.info("进入 DOP 页面，用户：{}", username);
                }


                final String targetUrl = redirectUrl;
                if (!StringUtils.isEmpty(username)) {
                    AtomicReference<String> sessionId = new AtomicReference<>();
                    //4、登录建用户
                    sessionId.set(this.setSSOTokenSession(username, username, null, null));
                    response.beforeCommit(() -> {
                        StringBuffer sb = new StringBuffer();
                        sb.append("SESSION=");
                        sb.append(sessionId.get());
                        sb.append("; path=/;");
                        sb.append(" HttpOnly;");
                        sb.append(" SameSite=None;");
                        sb.append(" Secure;");
                        response.getHeaders().add(HttpHeaders.SET_COOKIE, sb.toString());

                        logger.info("跳转地址: {}", targetUrl);
                        response.getHeaders().add(HttpHeaders.LOCATION, targetUrl);
                        response.setStatusCode(HttpStatus.FOUND);
                        return Mono.empty();
                    });
                }

            } catch (Exception e) {
                logger.error("Token 解析失败: {}", e.getMessage(), e);
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return response.setComplete();
            }

            return chain.filter(exchange);
        } else {
//            ServerHttpResponse response = exchange.getResponse();
            ServerWebExchange modifiedExchange = exchange;
            if (Arrays.stream(whiteUrl).anyMatch(uri -> exchange.getRequest().getPath().value().indexOf(uri) >= 0)) {
//                HttpHeaders headers = exchange.getRequest().getHeaders();
//                headers = HttpHeaders.writableHttpHeaders(headers);
//                headers.remove(HttpHeaders.COOKIE);

                ServerHttpRequest servletHttpRequest = exchange.getRequest();
                HttpHeaders newHeaders = new HttpHeaders();
                for (Map.Entry<String, List<String>> entry : servletHttpRequest.getHeaders().entrySet()) {
                    if (!HttpHeaders.COOKIE.equals((entry.getKey()))) {
                        newHeaders.addAll(entry.getKey(), entry.getValue());
                    }
                }

                ServerHttpRequest modifiedRequest = new ServerHttpRequestDecorator(servletHttpRequest) {
                    @Override
                    public HttpHeaders getHeaders() {
                        return newHeaders;
                    }

                    ;
                };
                modifiedExchange = exchange.mutate().request(modifiedRequest).build();
            }

            ServerHttpResponse response = modifiedExchange.getResponse();
            response.beforeCommit(() -> {
                List<String> list = response.getHeaders().get(HttpHeaders.SET_COOKIE);
                if (list != null && list.size() > 0) response.getHeaders().remove(HttpHeaders.COOKIE);
                return Mono.empty();
            });

            return chain.filter(exchange);
        }
    }


    private String setSecurityContext(SecurityContext securityContext){
        try {
            Class<? extends ReactiveSessionRepository> aClass = reactiveSessionRepository
                .getClass();

            Field repository = aClass.getDeclaredField("repository");
            repository.setAccessible(true);
            RedissonSessionRepository repository1 = (RedissonSessionRepository)repository.get(reactiveSessionRepository);

            Session session = repository1.createSession();

            session.setAttribute("SPRING_SECURITY_CONTEXT", securityContext);
            return session.getId();
        } catch (Exception e) {
            logger.error("set security context falied cause by:" + e.getMessage());
        }
        return null;
    }

    private String setTokenSession(String userInfoStr, ServerWebExchange exchange){
        try {
            UserInfo userInfo = mapper.readValue(userInfoStr, UserInfo.class);


            List<String> roles = userInfo.getRoles();
            Collection<SimpleGrantedAuthority> simpleRoles = null;
            if(roles != null && !roles.isEmpty()){
                for (String role : roles) {
                    if(simpleRoles == null) simpleRoles = new ArrayList<>();
                    simpleRoles.add(new SimpleGrantedAuthority(role));

                }
            }
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(userInfo.getUsername(), userInfo.getUsername(), simpleRoles);

            SecurityContextImpl securityContext = new SecurityContextImpl(authenticationToken);

            return setSecurityContext(securityContext);
        } catch (JsonProcessingException e) {
            logger.error("parse token userInfo failed cause by:"+e.getMessage(), e);
            throw new RuntimeException("parse token userInfo failed cause by:"+e.getMessage(), e);
        }
    }

    private String getRedirectUrl() {
        logger.info("开始调用getToken接口.....");
        Map<String, String> tokenMap = new HashMap<>();

        //请求表单
        Map<String, Object> formParams = new HashMap<>();
        String redirectUrlCurrent = damIp + redirectUrl;
        formParams.put("app_id",clientId);
        formParams.put("source","02");
        formParams.put("redirect_url",redirectUrlCurrent);
        formParams.put("substate","");


        String tokenUrlCurrent = wesisIp + tokenUrl;
        logger.info("获取的回调地址: {}", tokenUrlCurrent);
        HttpResponse response  = HttpUtil.createPost(tokenUrlCurrent)
                .form(formParams)
                .execute();
        String redirectUrl = response.header("Location");

        logger.info("重定向地址：", redirectUrl);
        return redirectUrl;
    }

    private Map<String, String> getSSOUser(String token) throws Exception {
        logger.info("开始获取用户.....");

        Map<String, Object> formParams = new HashMap<>();
        formParams.put("app_id",clientId);
        formParams.put("tgt",token);
        formParams.put("source","02");
        formParams.put("redirect_url",damIp+redirectUrl);
        formParams.put("substate","");

        String userUrlCurrent = wesisIp+userUrl;
        logger.info("获取用户的userUrl : {}", userUrlCurrent);
        String body = HttpUtil.createPost(userUrlCurrent)
                .body(JSONUtil.toJsonStr(formParams))
                .execute()
                .body();
        logger.info("token换用户的body : {}", body);

        //对用户信息进行解密
        Map<String, String> map = mapper.readValue(body, new TypeReference<Map<String, String>>() {});
        String data = map.get("data");
        logger.info("获取的用户信息数据为：{}", data);
        if (StringUtils.isEmpty(data)) {
            throw new RuntimeException("获取的用户信息为空,data:"+data);
        }
        PrivateKey privateKey = SM2Utils.hexStringToPrivateKey(decryptId);
        String result = SM2Utils.decrypt((BCECPrivateKey) privateKey,data);
        logger.info("解密后的用户信息数据为：{}", result);

        JSONObject jsonObj = JSONUtil.parseObj(result);
        Map<String, String> userMap = new HashMap<>();

        String mobile = jsonObj.getStr("mobile");
        String username = jsonObj.getStr("uid");
//        String username = jsonObj.getStr("workNo");
        String name = jsonObj.getStr("name");
        String email = jsonObj.getStr("email");

        if (name==null) {
            name = jsonObj.getStr("username");
        }

//        if (email!=null) {
//            int atIndex = email.indexOf('@');  // 找到 @ 字符的位置
//            if (atIndex != -1) {  // 确保 @ 字符存在
//                username = email.substring(0, atIndex);  // 截取 @ 前的部分
//                System.out.println("用户名: " + username);
//            } else {
//                System.out.println("无效的邮箱地址");
//                throw new RuntimeException("无效的邮箱地址");
//            }
//        }

        userMap.put("name", name);
        userMap.put("username", username);
        userMap.put("email", email);
        userMap.put("mobile", mobile);
        return userMap;
    }


    private String setSSOTokenSession(String username, String chineseName, String email,String mobile) {
        logger.info("获取用户 {} Session", username);
        UserDto user = userService.getUser(username);
        if (user == null) {
            logger.info("用户: {} 不存在，正在创建 ", username);
            createUser(username, chineseName, email,mobile);
            logger.info("用户: {} 已创建 ", username);
        }

        Set<GrantedAuthority> fullAuthorities = userService.getUserFullAuthorities(username);
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(username, username.toLowerCase(), fullAuthorities);
        SecurityContextImpl securityContext = new SecurityContextImpl(authenticationToken);
        logger.info("创建 Session 完成 ");
        return setSecurityContext(securityContext);
    }

    private void createUser(String username, String chineseName, String email,String mobile) {
        //手机号加密,先使用sm2加密,再调用密服平台
        String sm2Encrypt = sm2Utils.sm2Encrypt(mobile);
        String encryptMobile = encryptMobile(sm2Encrypt);

        UserDetails userDetails = new UserDetails(null, username, chineseName, email,
                username.toLowerCase(), true, false, null, null,
                encryptMobile, null, "@ROOT", null);
        UserRoleDetails role = userService.getRoleByRoleName("ROLE_USER");
        HashSet<Long> roleIds = new HashSet<>();
        roleIds.add(role.getUserRoleId());
        userService.createUser(userDetails, roleIds, "");
    }

    /**
     * 对手机号调用加密平台进行加密
     * @param mobile
     * @return
     */
    private String encryptMobile(String mobile) {
        Map<String, Object> formParams = new HashMap<>();
        formParams.put("text",mobile);
        formParams.put("id",encryptAppId);
        try(HttpResponse response = HttpUtil.createPost(encryptUrl)
                    .body(JSONUtil.toJsonStr(formParams))
                    .execute()) {
            String resp = response.body();
            JSONObject json = new JSONObject(resp);
            JSONObject data = json.getJSONObject("data");
            String resMobile= data.getStr("text");
            return resMobile;
        } catch (Exception e){
            logger.error("对手机号加密失败", e);
            throw new RuntimeException(e);
        }
    }




    @JsonIgnoreProperties(ignoreUnknown = true)
    static class UserInfo implements Serializable {
        @JsonProperty("username")
        private String username;
        @JsonProperty("roles")
        private List<String> roles;

        public UserInfo() {
        }

        public UserInfo(String username, List<String> roles) {
            this.username = username;
            this.roles = roles;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public List<String> getRoles() {
            return roles;
        }

        public void setRoles(List<String> roles) {
            this.roles = roles;
        }
    }

    @Override
    public int getOrder() {
        return -2;
    }
}
