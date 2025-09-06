package com.datablau.gateway.security.core;

import com.datablau.gateway.error.CommonExceptionThrow;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AbstractUserDetailsReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Scheduler;
import reactor.core.scheduler.Schedulers;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2021/12/2 10:54
 */
@Component
public class NormalAuthenticationManager extends AbstractUserDetailsReactiveAuthenticationManager {

    private Scheduler scheduler = Schedulers.boundedElastic();

    @Autowired
    private DataBlauReactiveUserDetailsServiceImpl reactiveUserDetailsService;

    @Override
    public Mono<Authentication> authenticate(Authentication authentication) {
        final String username = authentication.getName();
        final String presentedPassword = (String) authentication.getCredentials();
        try {
//            return retrieveUser(username)
//                .publishOn(scheduler)
//                .filter(u -> PasswordEncoderUtil.passCheck(u.getPassword(), presentedPassword))
//                .switchIfEmpty(Mono.defer(() -> {
//                    userService.updateLoginFailCount(username);
//                    return Mono.error(new BadCredentialsException("Invalid Credentials"));
//                }))
//                .flatMap(u -> {
//                    return Mono.just(u);
//                })
//                .flatMap(userDetails -> {
//                    // 省略业务代码
//                    return Mono.just(userDetails);
//                })
////            .map(u -> new AuthenticationToken(u, u.getPassword(), u.getAuthorities()));
//                .map(u -> {
//                    //登录成功
//                    userService.resetLoginFailCount(Long.parseLong(u.getPassword()));
//                    return new UsernamePasswordAuthenticationToken(u.getUsername(), presentedPassword, u.getAuthorities());
//                });

            return retrieveUser(username, presentedPassword)
                .publishOn(scheduler)
                .flatMap(u -> {
                    return Mono.just(u);
                })
                .flatMap(userDetails -> {
                    // 省略业务代码
                    return Mono.just(userDetails);
                })
//            .map(u -> new AuthenticationToken(u, u.getPassword(), u.getAuthorities()));
                .map(u -> {
                    return new UsernamePasswordAuthenticationToken(u.getUsername(), u.getPassword(), u.getAuthorities());
                });
        }catch (Exception e){
            logger.warn(e.getMessage(), e);
            return CommonExceptionThrow.throwException(e);
        }
    }

    @Override
    protected Mono<UserDetails> retrieveUser(String username) {
        return reactiveUserDetailsService.findByUsername(username);
    }


    protected Mono<UserDetails> retrieveUser(String username, String password) {
        return reactiveUserDetailsService.findByUsername(username, password);
    }
}
