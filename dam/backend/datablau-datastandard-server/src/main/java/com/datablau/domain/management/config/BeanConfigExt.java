package com.datablau.domain.management.config;

import com.andorj.enhance.recommender.impl.ColumnClusterServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration("beanConfigExt")
public class BeanConfigExt extends BeanConfig {
    @Bean
    public ColumnClusterServiceImpl columnClusterService() {
        return new ColumnClusterServiceImpl();
    }

}
