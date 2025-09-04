package com.datablau.gateway.security.core;

import java.util.Set;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import reactor.core.publisher.Mono;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2022/7/8 14:35
 */
public interface DataBlauLdapManager {
    Mono<UserDetails> retrieveUser(String username, String password);
    Set<GrantedAuthority> authenticate(String userName, String password);
    String findUserDn(String userName);
}
