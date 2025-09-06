package com.datablau.gateway.security.core;

import java.time.Duration;
import org.springframework.http.ResponseCookie;
import org.springframework.util.Assert;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.session.CookieWebSessionIdResolver;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2022/9/30 17:28
 */
public class CustCookieWebSessionIdResolver extends CookieWebSessionIdResolver {

    private String cookieName = "SESSION";

    @Override
    public void setSessionId(ServerWebExchange exchange, String id) {
        Assert.notNull(id, "'id' is required");
        ResponseCookie cookie = initSessionCookie(exchange, id, getCookieMaxAge());
        exchange.getResponse().getCookies().set(this.cookieName, cookie);
    }

    @Override
    public void expireSession(ServerWebExchange exchange) {
        ResponseCookie cookie = initSessionCookie(exchange, "", Duration.ZERO);
        exchange.getResponse().getCookies().set(this.cookieName, cookie);
    }

    private ResponseCookie initSessionCookie(
        ServerWebExchange exchange, String id, Duration maxAge) {

        ResponseCookie.ResponseCookieBuilder cookieBuilder = ResponseCookie.from(this.cookieName, id)
            .path(exchange.getRequest().getPath().contextPath().value() + "/")
            .maxAge(maxAge)
            .httpOnly(true)
            .secure("https".equalsIgnoreCase(exchange.getRequest().getURI().getScheme()))
            .sameSite("None");

        return cookieBuilder.build();
    }
}
