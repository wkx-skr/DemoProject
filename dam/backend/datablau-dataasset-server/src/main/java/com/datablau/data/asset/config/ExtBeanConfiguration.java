package com.datablau.data.asset.config;

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

/**
 * @author: hxs
 * @date: 2025/4/7 17:54
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

//    @Bean(value = "customizeDatablauRemoteDdmModelService")
//    public RemoteServiceProxyFactoryBean datablauRemoteCustomDamModelService() {
//        String serviceUrl = getServiceUrl("ddm", "CustomizeDatablauRemoteDdmModelService" );
//        RemoteServiceProxyFactoryBean remoteServiceProxyFactoryBean = new RemoteServiceProxyFactoryBean();
//        remoteServiceProxyFactoryBean.setClient(discoveryClient);
//        remoteServiceProxyFactoryBean.setEnabled(true);
//        remoteServiceProxyFactoryBean.setRemoteHostAddress(clientName);
//        remoteServiceProxyFactoryBean.setRmiFactory(false);
//        remoteServiceProxyFactoryBean.setLocalBeanClass(EmptyCustomizeRemoteDdmModelServiceImpl.class);
//        remoteServiceProxyFactoryBean.setServiceUrl(serviceUrl);
//        remoteServiceProxyFactoryBean.setTargetApplicationName("ddm");
//        remoteServiceProxyFactoryBean.setServiceInterface(CustomizeDatablauRemoteDdmModelService.class);
//        remoteServiceProxyFactoryBean.setServerRefreshInterval(3000L);
//        return remoteServiceProxyFactoryBean;
//    }

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

    @Bean("datablauRemoteDdmModelServiceNew")
    public RemoteServiceProxyFactoryBean datablauRemoteDdmModelServiceNewImpl() {
        RemoteServiceProxyFactoryBean remoteServiceProxyFactoryBean = new RemoteServiceProxyFactoryBean();
        remoteServiceProxyFactoryBean.setClient(this.discoveryClient);
        remoteServiceProxyFactoryBean.setEnabled(true);
        remoteServiceProxyFactoryBean.setRemoteHostAddress(this.clientName);
        remoteServiceProxyFactoryBean.setRmiFactory(false);
        remoteServiceProxyFactoryBean.setLocalBeanClass(EmptyDatablauRemoteDdmModelServiceNewImpl.class);
        remoteServiceProxyFactoryBean.setServiceUrl(getServiceUrl("ddm", "DatablauRemoteDdmModelServiceNew"));
        remoteServiceProxyFactoryBean.setTargetApplicationName("ddm");
        remoteServiceProxyFactoryBean.setServiceInterface(DatablauRemoteDdmModelServiceNew.class);
        remoteServiceProxyFactoryBean.setServerRefreshInterval(3000L);
        return remoteServiceProxyFactoryBean;
    }

    @Bean("remoteJobSchedulerServiceNew")
    public RemoteServiceProxyFactoryBean remoteJobSchedulerServiceNew() {
        RemoteServiceProxyFactoryBean remoteServiceProxyFactoryBean = new RemoteServiceProxyFactoryBean();
        remoteServiceProxyFactoryBean.setClient(this.discoveryClient);
        remoteServiceProxyFactoryBean.setEnabled(true);
        remoteServiceProxyFactoryBean.setRemoteHostAddress(this.clientName);
        remoteServiceProxyFactoryBean.setRmiFactory(false);
        remoteServiceProxyFactoryBean.setLocalBeanClass(EmptyRemoteJobSchedulerNewServiceImpl.class);
        remoteServiceProxyFactoryBean.setServiceUrl(getServiceUrl("job", "RemoteJobSchedulerServiceNew"));
        remoteServiceProxyFactoryBean.setTargetApplicationName("datablau_job_scheduler");
        remoteServiceProxyFactoryBean.setServiceInterface(RemoteJobSchedulerServiceNew.class);
        remoteServiceProxyFactoryBean.setServerRefreshInterval(3000L);
        return remoteServiceProxyFactoryBean;
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

    @Bean
    public ExcelLoaderImpl excelLoader() {
        return new ExcelLoaderImpl();
    }
}
