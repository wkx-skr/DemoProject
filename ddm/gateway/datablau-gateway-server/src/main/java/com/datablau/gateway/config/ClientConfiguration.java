package com.datablau.gateway.config;


import java.util.Locale;

import com.alibaba.cloud.nacos.NacosConfigManager;
import com.datablau.data.common.util.DynamicConfigurations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;

/**
 * @author Nicky - 数语科技有限公司
 * date 2020/9/22 10:07
 */
@Configuration
public class ClientConfiguration {

    @Autowired
    private NacosConfigManager nacosConfigManager;

    @Bean
    public MessageSource messageSource() {
        ReloadableResourceBundleMessageSource messageSource = new ReloadableResourceBundleMessageSource();
        messageSource.setBasename("classpath:resources/i18n/message");
        messageSource.setDefaultEncoding("UTF-8");
        messageSource.setCacheSeconds(-1);
        messageSource.setDefaultLocale(Locale.SIMPLIFIED_CHINESE);
        return messageSource;
    }

    @Bean
    public DynamicConfigurations dynamicConfigurations() {
        return new DynamicConfigurations(nacosConfigManager.getConfigService());
    }
}
