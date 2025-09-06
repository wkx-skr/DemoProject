package com.datablau.gateway.security.core;

import com.datablau.gateway.util.RebuildExchangeUtil;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.ServerAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * @Author Nicky - 数语科技有限公司
 * @Date 2018/3/14 13:53
 */
@Component
public class LoginSuccessHandler extends RedisTopicPublisher implements ServerAuthenticationSuccessHandler {

    @Override
    public Mono<Void> onAuthenticationSuccess(WebFilterExchange webFilterExchange,
        Authentication authentication) {
        publishTopic(webFilterExchange, authentication.getName(), true);

        if(authentication.getCredentials().toString().indexOf("SSO") > -1){
            HttpHeaders headers = webFilterExchange.getExchange().getResponse().getHeaders();
            headers.add(HttpHeaders.SET_COOKIE, "sessionId="+ authentication.getCredentials().toString().substring(3) +"; Path=/dolphinscheduler; HttpOnly; SameSite=Lax");
        }
        return RebuildExchangeUtil.rebuildExchange(webFilterExchange.getExchange(), HttpStatus.OK);
    }
}
