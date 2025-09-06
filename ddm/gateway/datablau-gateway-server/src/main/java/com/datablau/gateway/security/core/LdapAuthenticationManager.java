package com.datablau.gateway.security.core;

import com.andorj.model.common.utility.DigestUtils;
import com.datablau.gateway.error.CommonExceptionThrow;
import java.util.List;
import java.util.Set;
import javax.annotation.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.ldap.core.DirContextOperations;
import org.springframework.ldap.core.LdapTemplate;
import org.springframework.ldap.core.support.AbstractContextMapper;
import org.springframework.ldap.query.ContainerCriteria;
import org.springframework.ldap.query.LdapQueryBuilder;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Scheduler;
import reactor.core.scheduler.Schedulers;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2022/7/5 11:17
 */
@Component
@ConditionalOnProperty(name="datablau.ldap.enable", havingValue = "true", matchIfMissing = false)
public class LdapAuthenticationManager implements ReactiveAuthenticationManager, DataBlauLdapManager {

    @Resource(name = "ldapTemplate")
    private LdapTemplate ldapTemplate;

    @Value("${datablau.ldap.base:'dc=datablau,dc=com'}")
    private String baseDn;

    @Value("${datablau.ldap.queryItem:'uid'}")
    private String queryItem;

    @Autowired
    DataBlauReactiveUserDetailsServiceImpl userDetailsService;

    private Scheduler scheduler = Schedulers.boundedElastic();

    private static final String USER_NOT_EXISTS = "用户不存在或被禁用";

    @Override
    public Mono<Authentication> authenticate(Authentication authentication) {
        final String username = authentication.getName();
        final String presentedPassword = (String) authentication.getCredentials();
        try {
            return retrieveUser(username, presentedPassword)
                .publishOn(scheduler)
                .switchIfEmpty(Mono.defer(() -> Mono.error(new BadCredentialsException("Invalid Credentials"))))
                .flatMap(u -> {
                    return Mono.just(u);
                })
                .flatMap(userDetails -> {
                    return Mono.just(userDetails);
                })
                .map(u -> new UsernamePasswordAuthenticationToken(u.getUsername(), presentedPassword, u.getAuthorities()));
        }catch (Exception e){
            return CommonExceptionThrow.throwException(e);
        }
    }

    @Override
    public Mono<UserDetails> retrieveUser(String username, String password){
        //检测账号是否被禁用
        boolean disabled = userDetailsService.isDisabled(username);
        if(disabled) return Mono.error(new UsernameNotFoundException(USER_NOT_EXISTS));

        Set<GrantedAuthority> fullAuthorities = authenticate(username, password);
        UserDetails userDetails = new User(username, username, fullAuthorities);
        return Mono.just(userDetails);
    }

    @Override
    public Set<GrantedAuthority> authenticate(String userName, String password) {
        String decodePassword = DigestUtils.decryptEncodedContent(password);

        ldapTemplate.setIgnorePartialResultException(true);

        ContainerCriteria criteria = LdapQueryBuilder.query()
            .base(baseDn)
            .where(queryItem)
            .is(userName);

        ldapTemplate.authenticate(criteria, decodePassword);
        List<String> search = ldapTemplate
            .search(criteria, new AbstractContextMapper<String>() {
                @Override
                protected String doMapFromContext(DirContextOperations ctx) {
                    return ctx.getNameInNamespace();
                }
            });

        if (search.size() != 1) {
            return null;
        }

        //check是不是已经创建，没有则创建账号
        return userDetailsService.createUser(search.get(0), userName);
    }

    @Override
    public String findUserDn(String userName) {
        ldapTemplate.setIgnorePartialResultException(true);
        List<String> result = ldapTemplate.search(LdapQueryBuilder.query().where("uid").is(userName), new AbstractContextMapper<String>() {
            @Override
            protected String doMapFromContext(DirContextOperations ctx) {
                return ctx.getNameInNamespace();
            }
        });

        if (result.size() != 1) {
            return null;
        }
        return result.get(0);
    }
}
