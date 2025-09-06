package com.datablau.gateway.security.core;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.ReactiveAuthorizationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.authorization.AuthorizationContext;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2021/12/2 10:56
 */
@Component
public class AuthorizeConfigManager implements ReactiveAuthorizationManager<AuthorizationContext> {

    @Override
    public Mono<AuthorizationDecision> check(Mono<Authentication> authentication,
        AuthorizationContext authorizationContext) {
        return authentication.map(auth -> {
            return new AuthorizationDecision(auth.isAuthenticated());
        }).defaultIfEmpty(new AuthorizationDecision(false));
    }

    @Override
    public Mono<Void> verify(Mono<Authentication> authentication, AuthorizationContext object) {
        return check(authentication, object)
            .filter(d -> d.isGranted())
            .switchIfEmpty(Mono.defer(() -> {
                return Mono.error(new AccessDeniedException("无权访问"));
            }))
            .flatMap(d -> Mono.empty());
    }
}
