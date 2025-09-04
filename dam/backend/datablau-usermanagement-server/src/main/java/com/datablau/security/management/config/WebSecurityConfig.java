package com.datablau.security.management.config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * @author: hxs
 * @date: 2025/3/14 14:10
 */
@Configuration("webSecurityConfigExt")
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
                .antMatchers("/hello", "/login", "/main/editionInfos",
                        "/usermanagement/user/receive", "/UserService/**",
                        "/OrganizationService/**", "/OrganizationVirtualService/**",
                        "/RoleService/**", "/ApiService/**", "/LogCollectService/**",
                        "/MailMessageService/**", "/MailTemplateService/**","/oauth/**")
                .permitAll()
                .anyRequest().authenticated()
                .and()
                .csrf().disable();
    }



    @Override
    public void configure(WebSecurity web) throws Exception {
        //配置静态文件不需要认证
        web.ignoring().antMatchers("/UserService/**", "/OrganizationService/**",
                "/OrganizationVirtualService/**", "/RoleService/**", "/LogCollectService/**",
                "/MailTemplateService/**");

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
