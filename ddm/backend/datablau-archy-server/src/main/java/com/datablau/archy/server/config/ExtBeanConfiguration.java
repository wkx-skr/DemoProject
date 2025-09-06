package com.datablau.archy.server.config;

import com.andorj.cloud.utils.RemoteServiceProxyFactoryBean;
import com.andorj.file.transfer.api.RemoteFileLoader;
import com.andorj.file.transfer.impl.RemoteFileLoaderImpl;
import com.datablau.base.api.FileService;
import com.datablau.base.api.InstantJobDao;
import com.datablau.base.api.ModelCategoryService;
import com.datablau.base.utility.EmptyFileServiceImpl;
import com.datablau.base.utility.EmptyModelCategoryServiceImpl;
import com.datablau.base.utility.FileSelector;
import com.datablau.data.common.api.impl.instantjob.InstantJobServiceImpl;
import com.datablau.data.common.api.instantjob.InstantJobService;
import com.datablau.data.common.data.ApiVersion;
import com.datablau.domain.management.api.DomainService;
import com.datablau.domain.management.utility.EmptyDomainServiceImpl;
import com.datablau.project.api.DatablauRemoteDdmModelServiceNew;
import com.datablau.project.api.DomainExtService;
import com.datablau.project.api.RemoteDataAssetExtendService;
import com.datablau.project.api.impl.EmptyDatablauRemoteDdmModelServiceNewImpl;
import com.datablau.project.api.impl.EmptyDomainExtServiceImpl;
import com.datablau.project.api.impl.EmptyRemoteArchyExtendService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;
import org.springframework.util.StringUtils;

/**
 * @author: hxs
 * @date: 2025/4/7 18:08
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

    @Bean(value = "modelCategoryService")
    public RemoteServiceProxyFactoryBean modelCategoryService() {
        String serviceUrl = getServiceUrl("base", "ModelCategoryService" + ApiVersion.VERSION_7_0.getUrlContext());
        RemoteServiceProxyFactoryBean remoteServiceProxyFactoryBean = new RemoteServiceProxyFactoryBean();
        remoteServiceProxyFactoryBean.setClient(discoveryClient);
        remoteServiceProxyFactoryBean.setEnabled(true);
        remoteServiceProxyFactoryBean.setRemoteHostAddress(clientName);
        remoteServiceProxyFactoryBean.setRmiFactory(false);
        remoteServiceProxyFactoryBean.setLocalBeanClass(EmptyModelCategoryServiceImpl.class);
        remoteServiceProxyFactoryBean.setServiceUrl(serviceUrl);
        remoteServiceProxyFactoryBean.setTargetApplicationName("datablau_base");
        remoteServiceProxyFactoryBean.setServiceInterface(ModelCategoryService.class);
        remoteServiceProxyFactoryBean.setServerRefreshInterval(10000L);
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

    @Bean("domainService")
    public RemoteServiceProxyFactoryBean domainService() {
        String serviceUrl = getServiceUrl("domain", "DomainService" );
        RemoteServiceProxyFactoryBean remoteServiceProxyFactoryBean = new RemoteServiceProxyFactoryBean();
        remoteServiceProxyFactoryBean.setClient(discoveryClient);
        remoteServiceProxyFactoryBean.setEnabled(true);
        remoteServiceProxyFactoryBean.setRemoteHostAddress(clientName);
        remoteServiceProxyFactoryBean.setRmiFactory(false);
        remoteServiceProxyFactoryBean.setLocalBeanClass(EmptyDomainServiceImpl.class);
        remoteServiceProxyFactoryBean.setServiceUrl(serviceUrl);
        remoteServiceProxyFactoryBean.setTargetApplicationName("datablau_domain");
        remoteServiceProxyFactoryBean.setServiceInterface(DomainService.class);
        remoteServiceProxyFactoryBean.setServerRefreshInterval(10000L);
        return remoteServiceProxyFactoryBean;
    }

    @Bean
    @DependsOn(value = {"fileService"})
    public RemoteFileLoader remoteFileLoader(FileService fileService) {
        return new RemoteFileLoaderImpl(fileService);
    }

    @Bean
    public FileSelector fileSelector(){
        return new FileSelector();
    }

    @Bean(value = "instantJobDao")
    public RemoteServiceProxyFactoryBean instantJobDao() {
        RemoteServiceProxyFactoryBean remoteServiceProxyFactoryBean = new RemoteServiceProxyFactoryBean();
        remoteServiceProxyFactoryBean.setClient(discoveryClient);
        remoteServiceProxyFactoryBean.setEnabled(true);
        remoteServiceProxyFactoryBean.setRemoteHostAddress(clientName);
        remoteServiceProxyFactoryBean.setRmiFactory(false);
        remoteServiceProxyFactoryBean.setServiceUrl(getServiceUrl("base", "InstantJobDao"));
        remoteServiceProxyFactoryBean.setTargetApplicationName("datablau_base");
        remoteServiceProxyFactoryBean.setServiceInterface(InstantJobDao.class);
        remoteServiceProxyFactoryBean.setServerRefreshInterval(3000L);
        return remoteServiceProxyFactoryBean;
    }

    @Bean(value = "fileService")
    public RemoteServiceProxyFactoryBean fileService(FileSelector fileSelector) {
        RemoteServiceProxyFactoryBean remoteServiceProxyFactoryBean = new RemoteServiceProxyFactoryBean();
        remoteServiceProxyFactoryBean.setClient(discoveryClient);
        remoteServiceProxyFactoryBean.setEnabled(true);
        remoteServiceProxyFactoryBean.setRemoteHostAddress(clientName);
        remoteServiceProxyFactoryBean.setRmiFactory(false);
        remoteServiceProxyFactoryBean.setSelector(fileSelector);
        remoteServiceProxyFactoryBean.setLocalBeanClass(EmptyFileServiceImpl.class);
        remoteServiceProxyFactoryBean.setServiceUrl(getServiceUrl("base", "FileService"));
        remoteServiceProxyFactoryBean.setTargetApplicationName("datablau_base");
        remoteServiceProxyFactoryBean.setServiceInterface(FileService.class);
        remoteServiceProxyFactoryBean.setServerRefreshInterval(3000L);
        return remoteServiceProxyFactoryBean;
    }

    @Bean(value = "instantJobService")
    @DependsOn(value = {"instantJobDao", "fileService"})
    public InstantJobService instantJobService(InstantJobDao instantJobDao, FileService fileService) {
        InstantJobService service = new InstantJobServiceImpl(instantJobDao, fileService);
        return service;
    }
}
