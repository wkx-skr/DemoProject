package com.datablau.domain.management.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.annotation.web.configurers.ExpressionUrlAuthorizationConfigurer;

@Configuration("webSecurityConfigExt")
@EnableWebSecurity
@EnableGlobalMethodSecurity(
        prePostEnabled = true
)
public class WebSecurityConfigExt extends WebSecurityConfigurerAdapter {
    public WebSecurityConfigExt() {
    }

    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests().antMatchers("/**").permitAll()
                .antMatchers("/dop/flow/notice/bulk").permitAll()
                .antMatchers("/apply/batch/flow/bind/bulk").permitAll()
                .antMatchers("/apply/batch/validate/bulk").permitAll()
                .antMatchers("/apply/batch/flow/notice/bulk").permitAll()
                .antMatchers("/apply/batch/flow/bind").permitAll()
                .antMatchers("/apply/batch/validate/{batchId}").permitAll()
                .antMatchers("/apply/batch/flow/notice").permitAll();

        ((HttpSecurity)((ExpressionUrlAuthorizationConfigurer.AuthorizedUrl)((ExpressionUrlAuthorizationConfigurer.AuthorizedUrl)((ExpressionUrlAuthorizationConfigurer.AuthorizedUrl)http.authorizeRequests()
                .antMatchers(new String[]{"/hello"})).permitAll().antMatchers(new String[]{"/login"})).permitAll().anyRequest()).authenticated().and())
                .anonymous().and()
                .csrf().disable();
    }

    public void configure(WebSecurity web) throws Exception {
        web.ignoring().antMatchers(new String[]{"/static/**", "/DomainService/**", "/MetricService/**", "/DomainCategoryPermissionService/**", "/LogCollectService/**", "/StandardService/**", "/MeasurementService/**"});
    }
}
