package com.datablau.archy.server.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;


/**
 * @author: hxs
 * @date: 2025/4/8 11:38
 */
@Configuration("webSecurityConfigExt")
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class WebSecurityConfigExt extends WebSecurityConfigurerAdapter{
//    @Autowired
//    private AuthenticationProvider authenticationProvider;
//
//    @Override
//    protected void configure(HttpSecurity http) throws Exception {
//        http.authorizeRequests()
//                .antMatchers("/hello").permitAll()
//                .antMatchers("/login").permitAll()
//                .antMatchers("/RemoteArchyService").permitAll()
//                .antMatchers("/RemoteArchyExtendService").permitAll()
//                .anyRequest().authenticated()
//                .and().httpBasic()
//                .and()
//                .csrf().disable();
//    }
//
//    @Override
//    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
//        auth.authenticationProvider(authenticationProvider);
//        super.configure(auth);
//    }
//
//    @Override
//    public void configure(WebSecurity web) throws Exception {
////        //配置静态文件不需要认证
////        web.ignoring().antMatchers("/UserService/**",
////                "/OrganizationService/**",
////                "/OrganizationVirtualService/**",
////                "/RoleService/**",
////                "/LogCollectService/**",
////                "/MailTemplateService/**");
//    }


    @Autowired
    private AuthenticationProvider authenticationProvider;

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
                .antMatchers("/hello").permitAll()
                .antMatchers("/login").permitAll()
                .antMatchers("/RemoteArchyService").permitAll()
                .antMatchers("/RemoteArchyExtendService").permitAll()
                .anyRequest().authenticated()
                .and().httpBasic()
                .and()
                .csrf().disable();
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.authenticationProvider(authenticationProvider);
        super.configure(auth);
    }

    @Override
    public void configure(WebSecurity web) throws Exception {
//        //配置静态文件不需要认证
//        web.ignoring().antMatchers("/UserService/**",
//                "/OrganizationService/**",
//                "/OrganizationVirtualService/**",
//                "/RoleService/**",
//                "/LogCollectService/**",
//                "/MailTemplateService/**");
    }

    /**
     * 指定加密方式
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        // 使用BCrypt加密密码
        return new BCryptPasswordEncoder();
    }

}
