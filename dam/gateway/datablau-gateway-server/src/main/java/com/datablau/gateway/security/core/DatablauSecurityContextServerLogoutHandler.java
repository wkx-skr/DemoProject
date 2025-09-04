package com.datablau.gateway.security.core;

import com.datablau.gateway.config.RedissonClientConfiguration;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.logout.ServerLogoutHandler;
import org.springframework.security.web.server.context.ServerSecurityContextRepository;
import org.springframework.security.web.server.context.WebSessionServerSecurityContextRepository;
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
    private RedissonClient redissonClient;

    @Override
    public Mono<Void> logout(WebFilterExchange exchange,
        Authentication authentication) {
        return save(exchange.getExchange());
    }


    public Mono<Void> save(ServerWebExchange exchange) {
        return exchange.getSession()
            .doOnNext(session -> {
                redissonClient.getBucket(RedissonClientConfiguration.getKeyPrefixSessionId(session.getId())).delete();
                redissonClient.getBucket(RedissonClientConfiguration.getExpiresKeyPrefixSessionId(session.getId())).delete();
            })
            .then();
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
