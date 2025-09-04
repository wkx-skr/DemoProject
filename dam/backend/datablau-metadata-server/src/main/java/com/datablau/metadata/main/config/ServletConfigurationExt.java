package com.datablau.metadata.main.config;

import com.andorj.cloud.utils.RemoteServiceProxyFactoryBean;
import com.datablau.dataasset.api.RemoteDataAssetsCatalogService;
import com.datablau.project.api.DomainExtService;
import com.datablau.project.api.impl.EmptyDomainExtServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * @program: dam
 * @description:
 * @create: 2025-06-26 10:05
 **/
@Configuration("servletConfigurationExt")
public class ServletConfigurationExt extends ServletConfiguration {


    @Bean(value = "remoteDataAssetsCatalogService")
    @Primary
    public RemoteServiceProxyFactoryBean remoteDataAssetsCatalogService() {
        RemoteServiceProxyFactoryBean remoteServiceProxyFactoryBean = new RemoteServiceProxyFactoryBean();
        remoteServiceProxyFactoryBean.setClient(discoveryClient);
        remoteServiceProxyFactoryBean.setEnabled(true);
        remoteServiceProxyFactoryBean.setRemoteHostAddress(clientName);
        remoteServiceProxyFactoryBean.setRmiFactory(false);
        remoteServiceProxyFactoryBean.setServiceUrl(getServiceUrl("assets", "RemoteDataAssetsCatalogService"));
        remoteServiceProxyFactoryBean.setTargetApplicationName("datablau_dataasset");
        remoteServiceProxyFactoryBean.setServiceInterface(RemoteDataAssetsCatalogService.class);
        remoteServiceProxyFactoryBean.setServerRefreshInterval(3000L);
        return remoteServiceProxyFactoryBean;
    }

    @Bean(value = "domainExtService")
    public RemoteServiceProxyFactoryBean domainExtService() {
        RemoteServiceProxyFactoryBean remoteServiceProxyFactoryBean = new RemoteServiceProxyFactoryBean();
        remoteServiceProxyFactoryBean.setClient(discoveryClient);
        remoteServiceProxyFactoryBean.setEnabled(true);
        remoteServiceProxyFactoryBean.setRemoteHostAddress(clientName);
        remoteServiceProxyFactoryBean.setRmiFactory(false);
        remoteServiceProxyFactoryBean.setLocalBeanClass(EmptyDomainExtServiceImpl.class);
        remoteServiceProxyFactoryBean.setServiceUrl(getServiceUrl("domain", "DomainExtService"));
        remoteServiceProxyFactoryBean.setTargetApplicationName("datablau_domain");
        remoteServiceProxyFactoryBean.setServiceInterface(DomainExtService.class);
        remoteServiceProxyFactoryBean.setServerRefreshInterval(3000L);
        return remoteServiceProxyFactoryBean;
    }

}
