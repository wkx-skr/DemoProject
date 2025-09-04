package com.datablau.gateway.filter;


import com.datablau.gateway.api.TokenService;
import com.datablau.gateway.filter.AccessGatewayFilter.UserInfo;
import com.datablau.gateway.security.core.DataBlauReactiveUserDetailsServiceImpl;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.dto.GatewayUserDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;
import org.redisson.spring.session.RedissonSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.session.ReactiveSessionRepository;
import org.springframework.session.Session;
import org.springframework.util.CollectionUtils;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * @author zhangKun - 数语科技有限公司
 * date 2022/12/05 17:24
 */
public class EntTokenFilter implements WebFilter {

    private final Logger logger = LoggerFactory.getLogger(EntTokenFilter.class);
    private final ObjectMapper mapper = new ObjectMapper();

    private String[] dataAgentIgnoreUrls;


    private TokenService tokenService;

    private UserService userService;

    private ReactiveSessionRepository reactiveSessionRepository;

    public EntTokenFilter(String[] dataAgentIgnoreUrls, TokenService tokenService, UserService userService, ReactiveSessionRepository reactiveSessionRepository) {
        this.dataAgentIgnoreUrls = dataAgentIgnoreUrls;
        this.tokenService = tokenService;
        this.userService = userService;
        this.reactiveSessionRepository = reactiveSessionRepository;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain webFilterChain) {
        if (Arrays.asList(dataAgentIgnoreUrls).stream()
            .anyMatch(uri -> exchange.getRequest().getPath().value().indexOf(uri) >= 0)) {
            AtomicReference<String> sessionId = new AtomicReference<>();
            ServerHttpResponse originalResponse = exchange.getResponse();
            // 获取token
            List<String> tokens = exchange.getRequest().getHeaders().get("token");
            if (!CollectionUtils.isEmpty(tokens)) {
                try {
                    String username = tokenService.validateToken(tokens.get(0));
                    UserInfo userInfo = new UserInfo();
                    userInfo.setUsername(username);
                    String userInfoStr = mapper.writeValueAsString(userInfo);
                    sessionId.set(setTokenSession(userInfoStr, exchange));
                } catch (Exception e) {
                    logger.error("token解析失败，token原始值：" + tokens.get(0) + "，失败原因："
                        + e.getMessage());
                    throw new RuntimeException(e);
                }
                // request header add Cookie

                StringBuffer sb = new StringBuffer();
                sb.append("SESSION=");
                sb.append(sessionId.get());
                sb.append("; path=/;");
                sb.append(" HttpOnly;");
                HttpHeaders httpHeaders = HttpHeaders.writableHttpHeaders(
                    exchange.getRequest().getHeaders());
                httpHeaders.remove(HttpHeaders.COOKIE);
                httpHeaders.add(HttpHeaders.COOKIE, sb.toString());

            }
            return webFilterChain.filter(exchange.mutate().response(originalResponse).build());
        }
        return webFilterChain.filter(exchange);
    }

    private String setTokenSession(String userInfoStr, ServerWebExchange exchange) {
        try {
            UserInfo userInfo = mapper.readValue(userInfoStr, UserInfo.class);

            List<String> roles = userInfo.getRoles();
            Collection<SimpleGrantedAuthority> simpleRoles = null;
            if (roles != null && !roles.isEmpty()) {
                for (String role : roles) {
                    if (simpleRoles == null) {
                        simpleRoles = new ArrayList<>();
                    }
                    simpleRoles.add(new SimpleGrantedAuthority(role));

                }
            }

            GatewayUserDto user = userService.getEnabledUserByUsernameForGateway(userInfo.getUsername());

            Set<GrantedAuthority> authorities = user.getAuthorities();
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                userInfo.getUsername(), userInfo.getUsername(), authorities);

            SecurityContextImpl securityContext = new SecurityContextImpl(authenticationToken);

            return setSecurityContext(securityContext);
        } catch (JsonProcessingException e) {
            logger.error("parse token userInfo failed cause by:" + e.getMessage(), e);
            throw new RuntimeException("parse token userInfo failed cause by:" + e.getMessage(), e);
        }
    }

    private String setSecurityContext(SecurityContext securityContext) {
        try {
            Class<? extends ReactiveSessionRepository> aClass = reactiveSessionRepository
                .getClass();

            Field repository = aClass.getDeclaredField("repository");
            repository.setAccessible(true);
            RedissonSessionRepository repository1 = (RedissonSessionRepository) repository.get(
                reactiveSessionRepository);

            Session session = repository1.createSession();

            session.setAttribute("SPRING_SECURITY_CONTEXT", securityContext);
            return session.getId();
        } catch (Exception e) {
            logger.error("set security context falied cause by:" + e.getMessage());
        }
        return null;
    }
}
