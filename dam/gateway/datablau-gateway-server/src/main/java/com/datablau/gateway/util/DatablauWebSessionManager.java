package com.datablau.gateway.util;

import java.util.List;

import com.datablau.ddd.api.RemoteDddCommonService;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.util.Assert;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebSession;
import org.springframework.web.server.session.CookieWebSessionIdResolver;
import org.springframework.web.server.session.DefaultWebSessionManager;
import org.springframework.web.server.session.InMemoryWebSessionStore;
import org.springframework.web.server.session.WebSessionIdResolver;
import org.springframework.web.server.session.WebSessionManager;
import org.springframework.web.server.session.WebSessionStore;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import javax.annotation.Resource;

/**
 * 基本上全部复制黏贴于DefaultWebSessionManager
 * 只是重载了getSession方法，用来放过一些完全不需要session的request
 *
 * @author nicky - 数语科技有限公司
 * date 2022/11/4 11:05
 */
public class DatablauWebSessionManager implements WebSessionManager {

    private static final Log logger = LogFactory.getLog(DefaultWebSessionManager.class);


    private WebSessionIdResolver sessionIdResolver = new CookieWebSessionIdResolver();

    private WebSessionStore sessionStore = new InMemoryWebSessionStore();

    @Value("${datablau.security-url.login}")
    private String loginUrls;

    @Value("${datablau.sso-ddt.enable:false}")
    private Boolean ssoEnable;

    @Resource
    private RemoteDddCommonService remoteDddCommonService;

    /**
     * Configure the id resolution strategy.
     * <p>By default an instance of {@link CookieWebSessionIdResolver}.
     * @param sessionIdResolver the resolver to use
     */
    public void setSessionIdResolver(WebSessionIdResolver sessionIdResolver) {
        Assert.notNull(sessionIdResolver, "WebSessionIdResolver is required");
        this.sessionIdResolver = sessionIdResolver;
    }

    /**
     * Return the configured {@link WebSessionIdResolver}.
     */
    public WebSessionIdResolver getSessionIdResolver() {
        return this.sessionIdResolver;
    }

    /**
     * Configure the persistence strategy.
     * <p>By default an instance of {@link InMemoryWebSessionStore}.
     * @param sessionStore the persistence strategy to use
     */
    public void setSessionStore(WebSessionStore sessionStore) {
        Assert.notNull(sessionStore, "WebSessionStore is required");
        this.sessionStore = sessionStore;
    }

    /**
     * Return the configured {@link WebSessionStore}.
     */
    public WebSessionStore getSessionStore() {
        return this.sessionStore;
    }


    @Override
    public Mono<WebSession> getSession(ServerWebExchange exchange) {
        //只有登录接口才会创建session
        if(exchange.getRequest().getPath().value().indexOf(loginUrls) >= 0){
            return Mono.defer(() -> retrieveSession(exchange)
                .switchIfEmpty(createWebSession())
                .doOnNext(session -> exchange.getResponse().beforeCommit(() -> save(exchange, session))));
        }else {
            return Mono.defer(() -> retrieveSession(exchange));
        }

    }

    private Mono<WebSession> createWebSession() {
        Mono<WebSession> session = this.sessionStore.createWebSession();
        if (logger.isDebugEnabled()) {
            session = session.doOnNext(s -> logger.debug("Created new WebSession."));
        }
        return session;
    }

    private Mono<WebSession> retrieveSession(ServerWebExchange exchange) {
        return Flux.fromIterable(getSessionIdResolver().resolveSessionIds(exchange))
            .concatMap(this.sessionStore::retrieveSession)
            .next();
    }

    private Mono<Void> save(ServerWebExchange exchange, WebSession session) {
        List<String> ids = getSessionIdResolver().resolveSessionIds(exchange);

        if (!session.isStarted() || session.isExpired()) {
            if (!ids.isEmpty()) {
                // Expired on retrieve or while processing request, or invalidated..
                if (logger.isDebugEnabled()) {
                    logger.debug("WebSession expired or has been invalidated");
                }
                this.sessionIdResolver.expireSession(exchange);
            }
            return Mono.empty();
        }

        if (ids.isEmpty() || !session.getId().equals(ids.get(0))) {
            this.sessionIdResolver.setSessionId(exchange, session.getId());
        }

        return session.save();
    }

}
