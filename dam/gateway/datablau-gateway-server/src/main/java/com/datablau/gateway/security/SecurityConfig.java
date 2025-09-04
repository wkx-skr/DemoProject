package com.datablau.gateway.security;

import com.datablau.gateway.api.TokenService;
import com.datablau.gateway.filter.EntTokenFilter;
import com.datablau.gateway.security.core.AdAuthenticationManager;
import com.datablau.gateway.security.core.AuthenticationConverter;
import com.datablau.gateway.security.core.AuthorizeConfigManager;
import com.datablau.gateway.security.core.DataBlauDelegatingAuthenticationManager;
import com.datablau.gateway.security.core.DatablauSecurityContextServerLogoutHandler;
import com.datablau.gateway.security.core.LdapAuthenticationManager;
import com.datablau.gateway.security.core.LoginFailureHandler;
import com.datablau.gateway.security.core.LoginSuccessHandler;
import com.datablau.gateway.security.core.NormalAuthenticationManager;
import com.datablau.gateway.security.core.SecurityAuthenticationEntryPoint;
import com.datablau.gateway.security.core.SecurityLogoutSuccessHandler;
import java.util.LinkedList;
import java.util.concurrent.atomic.AtomicBoolean;

import com.datablau.security.management.api.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.AuthenticationWebFilter;
import org.springframework.security.web.server.context.ServerSecurityContextRepository;
import org.springframework.session.ReactiveSessionRepository;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2021/12/2 10:46
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Autowired
    private LoginSuccessHandler loginSuccessHandler;

    @Autowired
    private LoginFailureHandler loginFailureHandler;

    @Autowired
    private SecurityAuthenticationEntryPoint authenticationEntryPoint;

    @Autowired
    private SecurityLogoutSuccessHandler logoutSuccessHandler;

    @Autowired
    private NormalAuthenticationManager normalAuthenticationManager;

    @Autowired(required = false)
    private LdapAuthenticationManager ldapAuthenticationManager;

    @Autowired(required = false)
    private AdAuthenticationManager adAuthenticationManager;

    @Autowired
    private AuthorizeConfigManager authorizeConfigManager;

    @Autowired
    private AuthenticationConverter authenticationConverter;

    @Autowired
    private ServerSecurityContextRepository securityContextRepository;

    @Autowired
    private DatablauSecurityContextServerLogoutHandler serverLogoutHandler;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UserService userService;
    @Autowired
    private ReactiveSessionRepository reactiveSessionRepository;

    @Value("${datablau.security-url.ignore}")
    private String whiteStr;
    @Value("${datablau.security-url.login}")
    private String loginUrls;
    @Value("${datablau.security-url.logout}")
    private String logoutUrls;
    @Value("${datablau.ldap.enable:false}")
    private boolean ldapEnable;
    @Value("${datablau.ad.enable:false}")
    private boolean adEnable;

    @Value("${datablau.data-agent.ignore-url:}")
    private String[] dataAgentIgnoreUrls;

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        SecurityWebFilterChain chain = http
            .addFilterBefore(new EntTokenFilter(dataAgentIgnoreUrls, tokenService, userService, reactiveSessionRepository), SecurityWebFiltersOrder.SECURITY_CONTEXT_SERVER_WEB_EXCHANGE)
            .formLogin()
            .loginPage(loginUrls)
            // 登录成功handler
            .authenticationSuccessHandler(loginSuccessHandler)
            // 登陆失败handler
            .authenticationFailureHandler(loginFailureHandler)
            // 无访问权限handler
            .authenticationEntryPoint(authenticationEntryPoint)
            .and()
            .logout()
            .logoutUrl(logoutUrls)
            .logoutHandler(serverLogoutHandler)
            .logoutSuccessHandler(logoutSuccessHandler)
            .and()
            .csrf().disable()
            .httpBasic()
            .authenticationManager(ReactiveAuthenticationManager())
            .authenticationEntryPoint(authenticationEntryPoint)
            .and()
            .authorizeExchange()
            // 白名单放行
            .pathMatchers(getWhiteString(whiteStr)).permitAll()
            // 访问权限控制
            .anyExchange().access(authorizeConfigManager)
            .and().securityContextRepository(securityContextRepository)
            .build();
        // 设置自定义登录参数转换器
        //特殊处理HttpBasic登录
        AtomicBoolean isHttpBasic = new AtomicBoolean(false);
        chain.getWebFilters()
            .filter(webFilter -> webFilter instanceof AuthenticationWebFilter)
            .subscribe(webFilter -> {
                AuthenticationWebFilter filter = (AuthenticationWebFilter) webFilter;
                filter.setSecurityContextRepository(securityContextRepository);
                if(isHttpBasic.get()){
                    filter.setServerAuthenticationConverter(authenticationConverter);
                }
                isHttpBasic.set(true);
            });

        return chain;
    }

    /**
     * 注册用户信息验证管理器，可按需求添加多个按顺序执行
     * @return
     */
    @Bean
    @Primary
    ReactiveAuthenticationManager ReactiveAuthenticationManager() {
        LinkedList<ReactiveAuthenticationManager> managers = new LinkedList<>();
        managers.add(normalAuthenticationManager);
        if(ldapEnable){
            managers.add(ldapAuthenticationManager);
        }
        if(adEnable){
            managers.add(adAuthenticationManager);
        }
        return new DataBlauDelegatingAuthenticationManager(managers);
    }

    /**
     * 处理白名单
     * @param whiteStr
     * @return
     */
    public static String[] getWhiteString(String whiteStr){
        String dealWhiteStr = whiteStr.trim().replaceAll(" ", "").replaceAll("/n", "").replaceAll("/r/n", "");
        return dealWhiteStr.split(",");
    }

    /**
     * BCrypt密码编码
     * @return
     */
    @Bean
    public BCryptPasswordEncoder bcryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

}
