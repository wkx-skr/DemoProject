package com.datablau.gateway.security.core;

import com.datablau.gateway.error.DataBlauLdapException;
import com.datablau.gateway.error.DataBlauRmiException;
import com.datablau.gateway.util.RebuildExchangeUtil;
import com.datablau.security.management.exception.DatablauAuthException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.ServerAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * @Author Nicky - 数语科技有限公司
 * @Date 2018/3/14 13:53
 */
@Component
public class LoginFailureHandler implements ServerAuthenticationFailureHandler {
    private static final ObjectMapper mapper = new ObjectMapper();

    @Override
    public Mono<Void> onAuthenticationFailure(WebFilterExchange webFilterExchange,
        AuthenticationException exception) {
        Map<String, Object> data = new HashMap<>();
        if (exception instanceof DisabledException) {
            data.put("exception", "用户被禁用，请联系管理员");
        }else if (exception instanceof DatablauAuthException) {
            data.put("exception", exception.getMessage());
        } else if (exception instanceof UsernameNotFoundException) {
            data.put("exception", "用户不存在或被禁用");
        }else if(exception instanceof AuthenticationCredentialsNotFoundException){
            data.put("exception", "未授权");
        }else if(exception instanceof DataBlauRmiException){
            data.put("exception", "用户服务连接异常");
        }else if(exception instanceof DataBlauLdapException){
            data.put("exception", exception.getMessage());
        }
        else {
            data.put("exception", "用户名或密码错误");
        }
        ServerHttpResponse response = webFilterExchange.getExchange().getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().set(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
//        response.getHeaders().set(HttpHeaders.SET_COOKIE, null);
        return RebuildExchangeUtil.processResData(data, response);
    }

}
