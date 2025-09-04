package com.datablau.metadata.main.config;

import com.andorj.cloud.utils.RemoteServiceProxyFactoryBean;
import com.datablau.project.api.DomainExtService;
import com.datablau.project.api.RemoteArchyExtendService;
import com.datablau.project.api.RemoteDataAssetExtendService;
import com.datablau.project.api.impl.EmptyDomainExtServiceImpl;
import com.datablau.project.api.impl.EmptyRemoteArchyExtendService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

/**
 * @author: hxs
 * @date: 2025/4/13 13:17
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
