package com.datablau.gateway.security.core;

import java.util.Arrays;
import java.util.List;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.util.Assert;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2022/7/6 15:39
 */
public class DataBlauDelegatingAuthenticationManager implements ReactiveAuthenticationManager{
    private final List<ReactiveAuthenticationManager> delegates;

    public DataBlauDelegatingAuthenticationManager(
        ReactiveAuthenticationManager... entryPoints) {
        this(Arrays.asList(entryPoints));
    }

    public DataBlauDelegatingAuthenticationManager(
        List<ReactiveAuthenticationManager> entryPoints) {
        Assert.notEmpty(entryPoints, "entryPoints cannot be null");
        this.delegates = entryPoints;
    }

    public Mono<Authentication> authenticate(Authentication authentication) {
        return Flux.fromIterable(this.delegates)
            .concatMap(m -> m.authenticate(authentication))
            .next().switchIfEmpty(Mono.defer(() -> Mono.error(new BadCredentialsException("Invalid Credentials"))));
    }
}
