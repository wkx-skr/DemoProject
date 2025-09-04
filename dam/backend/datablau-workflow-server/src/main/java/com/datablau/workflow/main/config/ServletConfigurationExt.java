package com.datablau.workflow.main.config;

import com.andorj.cloud.utils.RemoteServiceProxyFactoryBean;
import com.datablau.project.api.RemoteBaseExtendService;
import com.datablau.project.api.impl.EmptyRemoteBaseExtendServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;

@Service("servletConfigurationExt")
public class ServletConfigurationExt extends ServletConfiguration {
    @Bean({"remoteBaseExtendService"})
    public RemoteServiceProxyFactoryBean clientRemoteBaseExtendServiceConfig() {
        String serviceUrl = this.getServiceUrl("base", "RemoteBaseExtendService");
        RemoteServiceProxyFactoryBean remoteServiceProxyFactoryBean = new RemoteServiceProxyFactoryBean();
        remoteServiceProxyFactoryBean.setClient(this.discoveryClient);
        remoteServiceProxyFactoryBean.setEnabled(true);
        remoteServiceProxyFactoryBean.setRemoteHostAddress(this.clientName);
        remoteServiceProxyFactoryBean.setRmiFactory(!this.useHttpInvoker);
        remoteServiceProxyFactoryBean.setLocalBeanClass(EmptyRemoteBaseExtendServiceImpl.class);
        remoteServiceProxyFactoryBean.setServiceUrl(serviceUrl);
        remoteServiceProxyFactoryBean.setTargetApplicationName("datablau_base");
        remoteServiceProxyFactoryBean.setServiceInterface(RemoteBaseExtendService.class);
        remoteServiceProxyFactoryBean.setServerRefreshInterval(10000L);
        return remoteServiceProxyFactoryBean;
    }
}
