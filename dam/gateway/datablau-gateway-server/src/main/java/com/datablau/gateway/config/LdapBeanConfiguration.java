package com.datablau.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.ldap.core.LdapTemplate;
import org.springframework.ldap.core.support.LdapContextSource;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2022/7/8 10:56
 */
@Configuration
public class LdapBeanConfiguration {

    @Value("${datablau.ldap.urls:'ldap://localhost:389'}")
    private String ldapUrl;
    @Value("${datablau.ldap.base:'dc=datablau,dc=com'}")
    private String ldapBase;
    @Value("${datablau.ldap.username:'dc=manager,dc=datablau,dc=com'}")
    private String ldapUserDn;
    @Value("${datablau.ldap.password:'DataBlau@1'}")
    private String ldapPassword;

    @Value("${datablau.ad.urls:'ldap://localhost:389'}")
    private String adUrl;
    @Value("${datablau.ad.base:'dc=datablau,dc=com'}")
    private String adBase;
    @Value("${datablau.ad.username:'manager@datablau.com'}")
    private String adUserDn;
    @Value("${datablau.ad.password:'DataBlau@1'}")
    private String adPassword;

    @Bean(name = "ldapTemplate")
    @ConditionalOnProperty(name="datablau.ldap.enable", havingValue = "true", matchIfMissing = false)
    public LdapTemplate getLdapTemplate(){
        LdapContextSource contextSource = new LdapContextSource();

        contextSource.setUrl(ldapUrl);
        contextSource.setUserDn(ldapUserDn);
        contextSource.setPassword(ldapPassword);
        contextSource.setPooled(false);
        contextSource.afterPropertiesSet();
        return new LdapTemplate(contextSource);
    }

    @Bean(name = "adTemplate")
    @ConditionalOnProperty(name="datablau.ad.enable", havingValue = "true", matchIfMissing = false)
    public LdapTemplate getAdTemplate(){
        LdapContextSource contextSource = new LdapContextSource();

        contextSource.setUrl(adUrl);
        contextSource.setBase(adBase);
        contextSource.setUserDn(adUserDn);
        contextSource.setPassword(adPassword);
        contextSource.setPooled(false);
        contextSource.afterPropertiesSet();
        return new LdapTemplate(contextSource);
    }

}
