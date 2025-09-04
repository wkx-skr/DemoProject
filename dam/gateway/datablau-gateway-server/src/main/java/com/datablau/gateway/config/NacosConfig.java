package com.datablau.gateway.config;

import com.alibaba.cloud.nacos.registry.NacosAutoServiceRegistration;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2023/2/3 18:50
 */
public class NacosConfig implements ApplicationContextAware {

    @Autowired(required = false)
    private NacosAutoServiceRegistration registration;


    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        registration.start();
    }
}
