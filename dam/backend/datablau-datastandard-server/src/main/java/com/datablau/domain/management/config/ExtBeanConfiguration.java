package com.datablau.domain.management.config;

import com.andorj.cloud.utils.RemoteServiceProxyFactoryBean;
import com.datablau.project.api.RemoteArchyExtendService;
import com.datablau.project.api.RemoteBaseExtendService;
import com.datablau.project.api.RemoteDataAssetExtendService;
import com.datablau.project.api.impl.EmptyRemoteArchyExtendService;
import com.datablau.project.api.impl.EmptyRemoteBaseExtendServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-27 11:14
 * @description
 */
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




    @Bean(value = "remoteDataAssetExtendService")
    public RemoteServiceProxyFactoryBean remoteDataAssetExtendService() {
        RemoteServiceProxyFactoryBean remoteServiceProxyFactoryBean = new RemoteServiceProxyFactoryBean();
        remoteServiceProxyFactoryBean.setClient(discoveryClient);
        remoteServiceProxyFactoryBean.setEnabled(true);
        remoteServiceProxyFactoryBean.setRemoteHostAddress(clientName);
        remoteServiceProxyFactoryBean.setRmiFactory(false);
        remoteServiceProxyFactoryBean.setLocalBeanClass(EmptyRemoteArchyExtendService.class);
        remoteServiceProxyFactoryBean.setServiceUrl(getServiceUrl("assets", "RemoteDataAssetExtendService"));
        remoteServiceProxyFactoryBean.setTargetApplicationName("datablau_dataasset");
        remoteServiceProxyFactoryBean.setServiceInterface(RemoteDataAssetExtendService.class);
        remoteServiceProxyFactoryBean.setServerRefreshInterval(3000L);
        return remoteServiceProxyFactoryBean;
    }


    @Bean(value = "remoteArchyExtendService")
    public RemoteServiceProxyFactoryBean remoteArchyExtendService() {
        RemoteServiceProxyFactoryBean remoteServiceProxyFactoryBean = new RemoteServiceProxyFactoryBean();
        remoteServiceProxyFactoryBean.setClient(discoveryClient);
        remoteServiceProxyFactoryBean.setEnabled(true);
        remoteServiceProxyFactoryBean.setRemoteHostAddress(clientName);
        remoteServiceProxyFactoryBean.setRmiFactory(false);
        remoteServiceProxyFactoryBean.setLocalBeanClass(EmptyRemoteArchyExtendService.class);
        remoteServiceProxyFactoryBean.setServiceUrl(getServiceUrl("archy", "RemoteArchyExtendService"));
        remoteServiceProxyFactoryBean.setTargetApplicationName("datablau_archy");
        remoteServiceProxyFactoryBean.setServiceInterface(RemoteArchyExtendService.class);
        remoteServiceProxyFactoryBean.setServerRefreshInterval(3000L);
        return remoteServiceProxyFactoryBean;
    }


    @Bean({"remoteBaseExtendService"})
    public RemoteServiceProxyFactoryBean clientRemoteBaseExtendServiceConfig() {
        String serviceUrl = this.getServiceUrl("base", "RemoteBaseExtendService");
        RemoteServiceProxyFactoryBean remoteServiceProxyFactoryBean = new RemoteServiceProxyFactoryBean();
        remoteServiceProxyFactoryBean.setClient(this.discoveryClient);
        remoteServiceProxyFactoryBean.setEnabled(true);
        remoteServiceProxyFactoryBean.setRemoteHostAddress(this.clientName);
        remoteServiceProxyFactoryBean.setRmiFactory(false);
        remoteServiceProxyFactoryBean.setLocalBeanClass(EmptyRemoteBaseExtendServiceImpl.class);
        remoteServiceProxyFactoryBean.setServiceUrl(serviceUrl);
        remoteServiceProxyFactoryBean.setTargetApplicationName("datablau_base");
        remoteServiceProxyFactoryBean.setServiceInterface(RemoteBaseExtendService.class);
        remoteServiceProxyFactoryBean.setServerRefreshInterval(10000L);
        return remoteServiceProxyFactoryBean;
    }



}
