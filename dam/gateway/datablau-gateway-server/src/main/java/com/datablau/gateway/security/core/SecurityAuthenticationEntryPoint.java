package com.datablau.gateway.security.core;

import com.datablau.gateway.util.RebuildExchangeUtil;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.server.ServerAuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2021/12/2 14:03
 */
@Component
public class SecurityAuthenticationEntryPoint implements ServerAuthenticationEntryPoint {

    @Override
    public Mono<Void> commence(ServerWebExchange exchange, AuthenticationException exception) {

        Map<String, Object> data = new HashMap<>();
        if(exception instanceof AuthenticationCredentialsNotFoundException){
            data.put("exception", "未授权");
        }
        else {
            data.put("exception", "未知错误:"+exception.getMessage());
        }

        ServerHttpResponse response = exchange.getResponse();

        response.beforeCommit(() ->{
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            response.getHeaders().add(HttpHeaders.SET_COOKIE, "SESSION=; Path=/dam/service/; Max-Age=0; HttpOnly; SameSite=Lax");
            response.getHeaders().add(HttpHeaders.SET_COOKIE, "SESSION=; Path=/ddm/service/; Max-Age=0; HttpOnly; SameSite=Lax");
            response.getHeaders().add(HttpHeaders.SET_COOKIE, "SESSION=; Path=/ddm/service; Max-Age=0; HttpOnly; SameSite=Lax");
            response.getHeaders().add(HttpHeaders.SET_COOKIE, "SESSION=; Path=/domain; Max-Age=0; HttpOnly; SameSite=Lax");
            response.getHeaders().add(HttpHeaders.SET_COOKIE, "SESSION=; Path=/domain/; Max-Age=0; HttpOnly; SameSite=Lax");
            response.getHeaders().add(HttpHeaders.SET_COOKIE, "SESSION=; Path=/base; Max-Age=0; HttpOnly; SameSite=Lax");
            response.getHeaders().add(HttpHeaders.SET_COOKIE, "SESSION=; Path=/base/; Max-Age=0; HttpOnly; SameSite=Lax");
            response.getHeaders().add(HttpHeaders.SET_COOKIE, "sessionId=; Path=/dolphinscheduler; Max-Age=0; HttpOnly; SameSite=Lax");
            response.getHeaders().set(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
            return Mono.empty();
        });
        return RebuildExchangeUtil.processResData(data, response);
    }

    public static void main(String[] args) {
        String s = "/^ssss$/";
        String s2 = "/^ssss$/";

        System.out.println(s.indexOf("/^") == 0 && ((s.length() - s.lastIndexOf("$/")) == 2));
        System.out.println(s2.indexOf("/") == 0 && ((s2.length() - s2.lastIndexOf("/")) == 2));
    }
}
