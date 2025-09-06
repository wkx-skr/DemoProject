### Gateway产品开发使用说明

[TOC]



#### 一.gateway配置配文件说明

**动态路由配置**

> ```java
> spring: 
>   cloud: 
>     gateway:
>       routes:            #gateway 路由配置
>         - id: dam         #dam路由配置
>           uri: lb://dam-web   #动态路由，去eureka注册列表，查找对应微服务的ip:port
>           predicates:       #断言匹配
>             - Path=/dam/**
>         - id: ddm             #ddm路由配置
>           uri: lb://ddm-web
>           predicates:
>             - Path=/ddm/**
>         - id: domain          #数据标准路由配置
>           uri: lb://domain-web
>           predicates:
>             - Path=/domain/**
> 
> ```
>

**url拦截配置**

> ```java
> datablau:
>   security-url:
>     login:            #form表单登录地址
>       /gateway/login
>     logout:           #登出地址
>       /gateway/logout
>     ignore:           #gateway不拦截的地址
>       /actuator/**,
>       /gateway/refresh, 
>       /ddm/service/main/login/web/client,
>       /ddm/*.html*,
>       /ddm/service/workflow/callback/**,
>       /ddm/service/v2/api-docs,
>       /domain/domains/**
>     client-login:         #客户端登录地址
>       /ddm/service/main/login
>     client-token:         #ddm打开客户端认证地址
>       /ddm/service/main/login/web/client
> 
> ```
>



#### 二.微服务支持gateway改造



step1:引入jar包

> ```java
> 
> <dependency>
>   <groupId>org.springframework.boot</groupId>
>   <artifactId>spring-boot-starter-security</artifactId>
> </dependency>
>     
> ```
>

step2:编写WebSecurityConfigurerAdapter的实现类重写configure方法    

> ```java
> package com.datablau.domain.management.security;
> 
> 
> import org.springframework.context.annotation.Bean;
> import org.springframework.context.annotation.Configuration;
> import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
> import org.springframework.security.config.annotation.web.builders.HttpSecurity;
> import org.springframework.security.config.annotation.web.builders.WebSecurity;
> import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
> import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
> import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
> import org.springframework.security.crypto.password.PasswordEncoder;
> 
> @Configuration
> @EnableWebSecurity
> @EnableGlobalMethodSecurity(prePostEnabled = true)
> public class WebSecurityConfig extends WebSecurityConfigurerAdapter {
> 
>     @Override
>     protected void configure(HttpSecurity http) throws Exception {
>         http.authorizeRequests()   //权限拦截配置
>                 .antMatchers("/hello").permitAll()
>                 .antMatchers("/login").permitAll()
>                 .antMatchers("/DomainService").permitAll()
>                 .anyRequest()
>                 .authenticated()
>             .and()
>             //.formLogin()  //配置form表单登录，入不需要登录认证，可以不配置
>             //.usernameParameter("username")
>             //.passwordParameter("password")
>             //.successHandler(successHandler)
>             //.failureForwardUrl("/error.html")
>             //.loginPage("/datablau.html")
>             //.loginProcessingUrl("/login")
> 		 .and()
>             .csrf().disable();
>     }
> 
>  @Override
>  public void configure(WebSecurity web) throws Exception {
>         //配置静态文件不需要认证
>         web.ignoring().antMatchers("/static/**");
>     }
>    
>     /**
>      * 指定加密方式
>         */
>     @Bean
>     public PasswordEncoder passwordEncoder(){
>         // 使用BCrypt加密密码
>         return new BCryptPasswordEncoder();
>     }
> }
> 
> ```

step3:指定session的存储redis的实现类

> ```java
> package com.datablau.domain.management.config;
> 
> import org.redisson.api.RedissonClient;
> import org.redisson.spring.session.RedissonSessionRepository;
> import org.springframework.beans.factory.annotation.Autowired;
> import org.springframework.context.ApplicationEventPublisher;
> import org.springframework.context.annotation.Bean;
> import org.springframework.context.annotation.Configuration;
> import org.springframework.context.annotation.Primary;
> import org.springframework.session.web.http.CookieHttpSessionIdResolver;
> import org.springframework.session.web.http.DefaultCookieSerializer;
> import org.springframework.session.web.http.SessionRepositoryFilter;
> 
> /**
>  * @Author :lishfe - 数语科技有限公司
>  * @Date   :2022/3/2 15:00
>  */
> @Configuration
> public class SecurityBeanConfiguration implements ApplicationEventPublisher {
> 
>     @Autowired
>     RedissonClient redissonClient;
> 
>     private final String keyPrefix = "datablau:session:";
>     private final int interval = 1800;
> 
>     @Bean
>     @Primary
>     public SessionRepositoryFilter sessionRepositoryFilter(){
>         RedissonSessionRepository repository = new RedissonSessionRepository(redissonClient, this,
>             keyPrefix);
>         repository.setDefaultMaxInactiveInterval(interval);
>         SessionRepositoryFilter repositoryFilter = new SessionRepositoryFilter(repository);
>         DefaultCookieSerializer cookieSerializer = new DefaultCookieSerializer();
>         cookieSerializer.setUseBase64Encoding(false);
>         CookieHttpSessionIdResolver sessionIdResolver = new CookieHttpSessionIdResolver();
>         sessionIdResolver.setCookieSerializer(cookieSerializer);
>         repositoryFilter.setHttpSessionIdResolver(sessionIdResolver);
>         return repositoryFilter;
>     }
> 
> 
>     @Override
>     public void publishEvent(Object event) {
>         //todo when session create|delete|expire  publish custom Event
>         //todo you can create event listener to accept, then do some thing
>     }
> }
> ```

step4:将webserver的ip端口号注册到Eureka上

> ```java
> package com.datablau.domain.management.utility;
> 
> import com.netflix.appinfo.ApplicationInfoManager;
> import com.netflix.appinfo.EurekaInstanceConfig;
> import com.netflix.appinfo.HealthCheckHandler;
> import com.netflix.appinfo.InstanceInfo;
> import com.netflix.discovery.EurekaClient;
> import com.netflix.discovery.EurekaClientConfig;
> import java.util.HashMap;
> import java.util.Map;
> import javax.annotation.PostConstruct;
> import org.springframework.beans.BeansException;
> import org.springframework.beans.factory.ObjectProvider;
> import org.springframework.beans.factory.annotation.Autowired;
> import org.springframework.beans.factory.annotation.Value;
> import org.springframework.cloud.commons.util.InetUtils;
> import org.springframework.cloud.commons.util.InetUtilsProperties;
> import org.springframework.cloud.netflix.eureka.CloudEurekaClient;
> import org.springframework.cloud.netflix.eureka.EurekaClientConfigBean;
> import org.springframework.cloud.netflix.eureka.EurekaInstanceConfigBean;
> import org.springframework.cloud.netflix.eureka.InstanceInfoFactory;
> import org.springframework.cloud.netflix.eureka.serviceregistry.EurekaAutoServiceRegistration;
> import org.springframework.cloud.netflix.eureka.serviceregistry.EurekaRegistration;
> import org.springframework.cloud.netflix.eureka.serviceregistry.EurekaServiceRegistry;
> import org.springframework.context.ApplicationContext;
> import org.springframework.context.ApplicationContextAware;
> import org.springframework.context.ApplicationEvent;
> import org.springframework.context.ApplicationEventPublisher;
> import org.springframework.stereotype.Component;
> 
> /**
>  * @Author :lishfe - 数语科技有限公司
>  * @Date   :2021/12/20 13:38
>  */
> @Component
> public class DataBlauEurekaService implements ApplicationContextAware, ApplicationEventPublisher {
> 
>     private ApplicationContext applicationContext;
> 
>     @Autowired(required = false)
>     private ObjectProvider<HealthCheckHandler> healthCheckHandler;
> 
>     @Value("${datablau.web-instance.name:domain-web}")
>     private String appName;
> 
>     @Value("${datablau.server.address}")
>     private String hostName;
> 
>     @Value("${datablau.server.port}")
>     private int port;
> 
>     @Value("${datablau.eureka.address}")
>     private String defaultZone;
> 
>     @Value("${datablau.web-instance.enable:false}")
>     private boolean isEnable;
> 
>     @Override
>     public void publishEvent(ApplicationEvent event) {
>         applicationContext.publishEvent(event);
>     }
> 
>     @Override
>     public void publishEvent(Object event) {
> 
>     }
> 
>     private ApplicationInfoManager initializeApplicationInfoManager(
>         EurekaInstanceConfig instanceConfig) {
>         InstanceInfo instanceInfo = new InstanceInfoFactory().create(instanceConfig);
>         return new ApplicationInfoManager(instanceConfig, instanceInfo);
>     }
> 
>     private EurekaClient initializeEurekaClient(ApplicationInfoManager applicationInfoManager, EurekaClientConfig clientConfig) {
>         return new CloudEurekaClient(applicationInfoManager, clientConfig, this);
>     }
> 
>     @Override
>     public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
>         this.applicationContext = applicationContext;
>     }
> 
>     @PostConstruct
>     private void init(){
>         if(!isEnable){
>             return;
>         }
>         InetUtils inetUtils = new InetUtils(new InetUtilsProperties());
>         EurekaInstanceConfigBean instance = new EurekaInstanceConfigBean(inetUtils);
>         instance.setAppname(appName);
>         instance.setVirtualHostName(appName);
>         instance.setHostname(hostName);
>         instance.setNonSecurePort(port);
>         String instanceId = appName + ":" + hostName + ":" + port;
>         instance.setInstanceId(instanceId);
>         instance.setPreferIpAddress(false);
>         instance.setSecurePortEnabled(false);
> 
>         ApplicationInfoManager applicationInfoManager = initializeApplicationInfoManager(instance);
> 
>         EurekaClientConfigBean clientConfigBean = new EurekaClientConfigBean();
> 
>         Map<String, String> urlMap = new HashMap<>();
>         urlMap.put("defaultZone", defaultZone);
>         clientConfigBean.setServiceUrl(urlMap);
> 
>         EurekaClient eurekaClient = initializeEurekaClient(applicationInfoManager, clientConfigBean);
>         EurekaRegistration build = EurekaRegistration.builder(instance).with(eurekaClient)
>             .with(applicationInfoManager).with(healthCheckHandler).build();
>         EurekaAutoServiceRegistration registration = new EurekaAutoServiceRegistration(applicationContext, new EurekaServiceRegistry(), build);
>         registration.start();
>     }
> }
> 
> ```

step5:修改application.yml的配置文件

> ```java
> datablau:
>   web-instance:
>     name: domain-web   //注册到eureka的实例名
>     enable: true		//是否注册到eureka
> ```



#### 三.前端开启gateway配置项

修改前端 xxx-web/public/static/conf/setting.js文件

> ```
> gatewayEnable: true   //true  gateway的方式登录，false原来登录方式
> ```

#### 四.运维实施，修改Nginx配置文件

修改nginx的nginx.conf配置文件

添加gateway的代理配置

>     upstream gateway{
>     server 192.168.1.150:18082;
>     }

将原来指向dam，ddm的代理路径，改成指向gateway代理路径

> ```json
> http {
>  
> #    upstream dam {
> #	server 192.168.1.150:18080;
> #         }
> 
> #    upstream ddm{
> #	server 192.168.1.150:18081;
> #	 }
> 	
>     upstream gateway{
> 	server 192.168.1.150:18082;
>     }
> 
>   upstream workflow{
> 	server 192.168.1.150:18085;
> 	 }
>   upstream dds {
>         server 192.168.1.150:18101;
>         server 192.168.1.248:18101;
>         } 	
>     server {
>         listen     58080 default_server;
>         server_name  192.168.1.150;	     
>         
>         location / {
>           root /opt/dam_web;
> 	  		index   index.html;
> 		}
> 
>         location /gateway {
>           proxy_pass http://gateway;
>         }
> 
>         location /domain {
>           proxy_pass http://gateway;
>         }
> 
>         location /dam {
>           proxy_pass http://gateway;
>         }
>         location /workflow {
>           proxy_pass http://workflow;
>         }
>         
>         location /dds/ {
>           proxy_pass http://dds/;
>         }
> 
>     }
> 	
>      server {
>         listen       58081 default_server;
>         server_name  192.168.1.150;   
> 
>         location / {
>           root /opt/ddm_web;
> 		}
> 
>         location /gateway {
>           proxy_pass http://gateway;
>           index   index.html;
>         }
> 
>         location /domain {
>           proxy_pass http://gateway;
>           index   index.html;
>         }
> 
> 
>         location /ddm {
>           proxy_pass http://gateway;
>           index   index.html;
>         }
> 
>         location /workflow {
>           proxy_pass http://workflow;
>         }
>     }
> }
> 
> ```



