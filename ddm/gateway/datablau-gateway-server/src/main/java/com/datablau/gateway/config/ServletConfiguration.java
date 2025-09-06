package com.datablau.gateway.config;

import com.andorj.cloud.service.HealthService;
import com.andorj.cloud.service.impl.EmptyHealthServiceImpl;
import com.andorj.cloud.utils.RemoteServiceProxyFactoryBean;
import com.andorj.license.utility.lic.DamLicense3j;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.api.impl.MessageServiceImpl;
import com.andorj.model.common.utility.BeanHelper;
import com.datablau.ddd.api.RemoteDddCommonService;
import com.datablau.ddd.api.emptyImpl.EmptyRemoteDddCommonServiceImpl;
import com.datablau.security.management.api.OrganizationService;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.mail.api.MailMessageService;
import com.datablau.security.management.mail.api.MailTemplateService;
import com.datablau.security.management.mail.utils.EmptyMailMessageServiceImpl;
import com.datablau.security.management.mail.utils.EmptyMailTemplateServiceImpl;
import com.datablau.security.management.utils.EmptyOrganizationServiceImpl;
import com.datablau.security.management.utils.EmptyUserServiceImpl;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;
import java.nio.charset.Charset;
import java.util.List;
import javax.annotation.Resource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.remoting.httpinvoker.HttpInvokerProxyFactoryBean;
import org.springframework.web.client.RestTemplate;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2021/11/22 14:06
 */
@Configuration
public class ServletConfiguration {

    @Resource
    private DiscoveryClient discoveryClient;

    @Value("${datablau.server.address}")
    private String clientName;

    @Value("${datablau.data-agent.urls}")
    private String userBaseUrl;

    private HttpMessageConverter createStringHttpMessageConverter() {
        StringHttpMessageConverter converter = new StringHttpMessageConverter(Charset.forName("UTF-8"));
        converter.setSupportedMediaTypes(Lists.newArrayList(
            MediaType.TEXT_PLAIN,
            MediaType.parseMediaType("text/json;charset=UTF-8")
        ));

        return converter;
    }

    private HttpMessageConverter createJsonHttpMessageConverter() {
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setSupportedMediaTypes(getJsonSupportMediaTypes());
        ObjectMapper mapper = new ObjectMapper();
        mapper.setSerializationInclusion(Include.NON_NULL);
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        converter.setObjectMapper(mapper);

        return converter;
    }

    private List<MediaType> getJsonSupportMediaTypes() {
        return Lists.newArrayList(MediaType.parseMediaType("text/json"), MediaType.APPLICATION_JSON);
    }

    @Bean
    public BeanHelper beanHelper() {
        return new BeanHelper();
    }

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate template = new RestTemplate();
        template.setMessageConverters(
            Lists.newArrayList(createStringHttpMessageConverter(), createJsonHttpMessageConverter()));
        return template;
    }

    @Bean
    public MessageService messageService(){
        return new MessageServiceImpl();
    }

    @Bean
    public DamLicense3j damLicense3j() {
        return new DamLicense3j();
    }

    @Bean(value = "userService")
    @ConditionalOnProperty(name="datablau.data-agent.enable", havingValue = "false", matchIfMissing = false)
    public RemoteServiceProxyFactoryBean userService() {
        RemoteServiceProxyFactoryBean remoteServiceProxyFactoryBean = new RemoteServiceProxyFactoryBean();
        remoteServiceProxyFactoryBean.setClient(discoveryClient);
        remoteServiceProxyFactoryBean.setEnabled(true);
        remoteServiceProxyFactoryBean.setRmiFactory(false);
        remoteServiceProxyFactoryBean.setRemoteHostAddress(clientName);
        remoteServiceProxyFactoryBean.setLocalBeanClass(EmptyUserServiceImpl.class);
        remoteServiceProxyFactoryBean.setServiceUrl( "http://@{serverIpAddress}:@{serverPort}/user/UserService");
        remoteServiceProxyFactoryBean.setTargetApplicationName("datablau_usermgmt");
        remoteServiceProxyFactoryBean.setServiceInterface(UserService.class);
        remoteServiceProxyFactoryBean.setServerRefreshInterval(10000L);
        return remoteServiceProxyFactoryBean;
    }

    @Bean(value = "userService")
    @ConditionalOnProperty(name="datablau.data-agent.enable", havingValue = "true", matchIfMissing = false)
    public HttpInvokerProxyFactoryBean invoker() {
        HttpInvokerProxyFactoryBean invoker = new HttpInvokerProxyFactoryBean();
        invoker.setServiceUrl(userBaseUrl + "/user/UserService");
        invoker.setServiceInterface(UserService.class);
        return invoker;
    }


    @Bean(value = "userHealthService")
    public RemoteServiceProxyFactoryBean userHealthService() {
        RemoteServiceProxyFactoryBean remoteServiceProxyFactoryBean = new RemoteServiceProxyFactoryBean();
        remoteServiceProxyFactoryBean.setClient(discoveryClient);
        remoteServiceProxyFactoryBean.setEnabled(true);
        remoteServiceProxyFactoryBean.setRmiFactory(false);
        remoteServiceProxyFactoryBean.setRemoteHostAddress(clientName);
        remoteServiceProxyFactoryBean.setLocalBeanClass(EmptyHealthServiceImpl.class);
        remoteServiceProxyFactoryBean.setServiceUrl("http://@{serverIpAddress}:@{serverPort}/HealthService");
        remoteServiceProxyFactoryBean.setTargetApplicationName("datablau_usermgmt");
        remoteServiceProxyFactoryBean.setServiceInterface(HealthService.class);
        remoteServiceProxyFactoryBean.setServerRefreshInterval(10000L);
        return remoteServiceProxyFactoryBean;
    }

    @Bean(value = "damHealthService")
    public RemoteServiceProxyFactoryBean damHealthService() {
        RemoteServiceProxyFactoryBean remoteServiceProxyFactoryBean = new RemoteServiceProxyFactoryBean();
        remoteServiceProxyFactoryBean.setClient(discoveryClient);
        remoteServiceProxyFactoryBean.setEnabled(true);
        remoteServiceProxyFactoryBean.setRmiFactory(false);
        remoteServiceProxyFactoryBean.setRemoteHostAddress(clientName);
        remoteServiceProxyFactoryBean.setLocalBeanClass(EmptyHealthServiceImpl.class);
        remoteServiceProxyFactoryBean.setServiceUrl("http://@{serverIpAddress}:@{serverPort}/dam/service/HealthService");
        remoteServiceProxyFactoryBean.setTargetApplicationName("dam");
        remoteServiceProxyFactoryBean.setServiceInterface(HealthService.class);
        remoteServiceProxyFactoryBean.setServerRefreshInterval(10000L);
        return remoteServiceProxyFactoryBean;
    }


    @Bean(value = "ddmHealthService")
    public RemoteServiceProxyFactoryBean ddmHealthService() {
        RemoteServiceProxyFactoryBean remoteServiceProxyFactoryBean = new RemoteServiceProxyFactoryBean();
        remoteServiceProxyFactoryBean.setClient(discoveryClient);
        remoteServiceProxyFactoryBean.setEnabled(true);
        remoteServiceProxyFactoryBean.setRmiFactory(false);
        remoteServiceProxyFactoryBean.setRemoteHostAddress(clientName);
        remoteServiceProxyFactoryBean.setLocalBeanClass(EmptyHealthServiceImpl.class);
        remoteServiceProxyFactoryBean.setServiceUrl("http://@{serverIpAddress}:@{serverPort}/ddm/service/HealthService");
        remoteServiceProxyFactoryBean.setTargetApplicationName("ddm");
        remoteServiceProxyFactoryBean.setServiceInterface(HealthService.class);
        remoteServiceProxyFactoryBean.setServerRefreshInterval(10000L);
        return remoteServiceProxyFactoryBean;
    }


    @Bean(value = "mailMessageService")
    @Primary
    public RemoteServiceProxyFactoryBean mailMessageService() {
        RemoteServiceProxyFactoryBean remoteServiceProxyFactoryBean = new RemoteServiceProxyFactoryBean();
        remoteServiceProxyFactoryBean.setClient(discoveryClient);
        remoteServiceProxyFactoryBean.setEnabled(true);
        remoteServiceProxyFactoryBean.setRemoteHostAddress(clientName);
        remoteServiceProxyFactoryBean.setRmiFactory(false);
        remoteServiceProxyFactoryBean.setLocalBeanClass(EmptyMailMessageServiceImpl.class);
        remoteServiceProxyFactoryBean.setServiceUrl("http://@{serverIpAddress}:@{serverPort}/user/MailMessageService");
        remoteServiceProxyFactoryBean.setTargetApplicationName("datablau_usermgmt");
        remoteServiceProxyFactoryBean.setServiceInterface(MailMessageService.class);
        remoteServiceProxyFactoryBean.setServerRefreshInterval(3000L);
        return remoteServiceProxyFactoryBean;
    }

    @Bean(value = "mailTemplateService")
    @Primary
    public RemoteServiceProxyFactoryBean mailTemplateService() {
        RemoteServiceProxyFactoryBean remoteServiceProxyFactoryBean = new RemoteServiceProxyFactoryBean();
        remoteServiceProxyFactoryBean.setClient(discoveryClient);
        remoteServiceProxyFactoryBean.setEnabled(true);
        remoteServiceProxyFactoryBean.setRemoteHostAddress(clientName);
        remoteServiceProxyFactoryBean.setRmiFactory(false);
        remoteServiceProxyFactoryBean.setLocalBeanClass(EmptyMailTemplateServiceImpl.class);
        remoteServiceProxyFactoryBean.setServiceUrl("http://@{serverIpAddress}:@{serverPort}/user/MailTemplateService");
        remoteServiceProxyFactoryBean.setTargetApplicationName("datablau_usermgmt");
        remoteServiceProxyFactoryBean.setServiceInterface(MailTemplateService.class);
        remoteServiceProxyFactoryBean.setServerRefreshInterval(3000L);
        return remoteServiceProxyFactoryBean;
    }

    @Bean(value = "organizationService")
    public RemoteServiceProxyFactoryBean organizationService() {
        RemoteServiceProxyFactoryBean remoteServiceProxyFactoryBean = new RemoteServiceProxyFactoryBean();
        remoteServiceProxyFactoryBean.setClient(discoveryClient);
        remoteServiceProxyFactoryBean.setEnabled(true);
        remoteServiceProxyFactoryBean.setRemoteHostAddress(clientName);
        remoteServiceProxyFactoryBean.setRmiFactory(false);
        remoteServiceProxyFactoryBean.setLocalBeanClass(EmptyOrganizationServiceImpl.class);
        remoteServiceProxyFactoryBean.setServiceUrl("http://@{serverIpAddress}:@{serverPort}/user/OrganizationService");
        remoteServiceProxyFactoryBean.setTargetApplicationName("datablau_usermgmt");
        remoteServiceProxyFactoryBean.setServiceInterface(OrganizationService.class);
        remoteServiceProxyFactoryBean.setServerRefreshInterval(3000L);
        return remoteServiceProxyFactoryBean;
    }

    @Bean(value = "remoteDddCommonService")
    public RemoteServiceProxyFactoryBean remoteDddCommonService() {
        RemoteServiceProxyFactoryBean remoteServiceProxyFactoryBean = new RemoteServiceProxyFactoryBean();
        remoteServiceProxyFactoryBean.setClient(discoveryClient);
        remoteServiceProxyFactoryBean.setEnabled(true);
        remoteServiceProxyFactoryBean.setRemoteHostAddress(clientName);
        remoteServiceProxyFactoryBean.setServiceUrl("http://@{serverIpAddress}:@{serverPort}/ddd/RemoteDddCommonService");
        remoteServiceProxyFactoryBean.setRmiFactory(false);
        remoteServiceProxyFactoryBean.setTargetApplicationName("datablau_ddd");
        remoteServiceProxyFactoryBean.setLocalBeanClass(EmptyRemoteDddCommonServiceImpl.class);
        remoteServiceProxyFactoryBean.setServiceInterface(RemoteDddCommonService.class);
        remoteServiceProxyFactoryBean.setServerRefreshInterval(10000L);
        return remoteServiceProxyFactoryBean;
    }
}
