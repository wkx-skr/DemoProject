package com.datablau.gateway.security.core;

import com.datablau.gateway.config.RedissonClientConfiguration;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.logout.ServerLogoutHandler;
import org.springframework.security.web.server.context.ServerSecurityContextRepository;
import org.springframework.security.web.server.context.WebSessionServerSecurityContextRepository;
import org.springframework.session.ReactiveSessionRepository;
import org.springframework.session.data.redis.DatablauReactSessionRepository;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2021/12/7 16:58
 */
@Component
public class DatablauSecurityContextServerLogoutHandler implements ServerLogoutHandler {
    @Autowired
    private ServerSecurityContextRepository securityContextRepository;

    @Autowired
    private ReactiveRedisTemplate<String, String> reactiveRedisTemplate;

    @Autowired
    private DatablauReactSessionRepository reactiveSessionRepository;

    @Override
    public Mono<Void> logout(WebFilterExchange exchange,
        Authentication authentication) {
        return save(exchange.getExchange());
    }


    public Mono<Void> save(ServerWebExchange exchange) {
        return Mono.subscriberContext().map(context -> context.getOrDefault("tenantId", "0001"))
                .flatMap(key -> {
                    return exchange.getSession()
                            .doOnNext(session -> {
                                String sessionKey = reactiveSessionRepository.getSessionKey(key, session.getId());
                                reactiveRedisTemplate.delete(sessionKey);
                            })
                            .then();
                });

    }

    /**
     * Sets the {@link ServerSecurityContextRepository} that should be used for logging
     * out. Default is {@link WebSessionServerSecurityContextRepository}
     *
     * @param securityContextRepository the {@link ServerSecurityContextRepository}
     * to use.
     */
    public void setSecurityContextRepository(
        ServerSecurityContextRepository securityContextRepository) {
        Assert.notNull(securityContextRepository,
            "securityContextRepository cannot be null");
        this.securityContextRepository = securityContextRepository;
    }
}
