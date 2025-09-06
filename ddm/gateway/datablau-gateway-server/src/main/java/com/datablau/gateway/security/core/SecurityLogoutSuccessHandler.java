package com.datablau.gateway.security.core;


import com.datablau.gateway.util.RebuildExchangeUtil;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.logout.ServerLogoutSuccessHandler;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * @author Nicky - 数语科技有限公司
 * date 2021/7/1 11:03
 */
@Component
public class SecurityLogoutSuccessHandler extends RedisTopicPublisher implements ServerLogoutSuccessHandler {

    @Override
    public Mono<Void> onLogoutSuccess(WebFilterExchange exchange, Authentication authentication) {
        ServerHttpResponse response = exchange.getExchange().getResponse();
        response.setStatusCode(HttpStatus.OK);
        response.getHeaders().set(HttpHeaders.CONTENT_TYPE, "application/json; charset=UTF-8");
        response.getHeaders().add(HttpHeaders.SET_COOKIE, "SESSION=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
        response.getHeaders().add(HttpHeaders.SET_COOKIE, "sessionId=; Path=/dolphinscheduler; Max-Age=0; HttpOnly; SameSite=Lax");
        Map<String, Object> data = new HashMap<>();
        data.put("success", "登出成功");
        publishTopic(exchange, authentication.getName(), false);
        return RebuildExchangeUtil.processResData(data, response);
    }

}
