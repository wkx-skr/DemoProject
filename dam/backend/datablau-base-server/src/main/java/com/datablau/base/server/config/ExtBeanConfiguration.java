package com.datablau.base.server.config;

import com.andorj.cloud.utils.RemoteServiceProxyFactoryBean;
import com.datablau.data.common.api.impl.ExcelLoaderImpl;
import com.datablau.project.api.*;
import com.datablau.project.api.impl.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
public class ExtBeanConfiguration {

    @Autowired
    private DiscoveryClient discoveryClient;

    @Value("${datablau.server.address}")
    private String clientName;

    private String getServiceUrl(String serviceName, String serviceClass) {
        if (StringUtils.isEmpty(serviceName)) {
            return "http://@{serverIpAddress}:@{serverPort}/" + serviceClass;
        } else {
            return "http://@{serverIpAddress}:@{serverPort}/" + serviceName + "/" + serviceClass;
        }
    }
    @Bean("remoteMetaDataExtendService")
    public RemoteServiceProxyFactoryBean remoteMetaDataExtendService() {
        RemoteServiceProxyFactoryBean remoteServiceProxyFactoryBean = new RemoteServiceProxyFactoryBean();
        remoteServiceProxyFactoryBean.setClient(this.discoveryClient);
        remoteServiceProxyFactoryBean.setEnabled(true);
        remoteServiceProxyFactoryBean.setRemoteHostAddress(this.clientName);
        remoteServiceProxyFactoryBean.setRmiFactory(false);
        remoteServiceProxyFactoryBean.setLocalBeanClass(EmptyRemoteMetadataExtendServiceImpl.class);
        remoteServiceProxyFactoryBean.setServiceUrl(getServiceUrl("metadata", "RemoteMetaDataExtendService"));
        remoteServiceProxyFactoryBean.setTargetApplicationName("datablau_metadata");
        remoteServiceProxyFactoryBean.setServiceInterface(RemoteMetaDataExtendService.class);
        remoteServiceProxyFactoryBean.setServerRefreshInterval(3000L);
        return remoteServiceProxyFactoryBean;
    }
}
