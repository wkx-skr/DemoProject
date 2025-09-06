1.版本信息
spring-cloud-starter-gateway -- 2.2.3.RELEASE
spring-boot-starter-webflux  -- 2.2.3.RELEASE

2.服务端口信息配置信息
servlet 服务端口 18082
eureka  注册端口 5199

3.支持登录方式
security Form-Login  Form表单登录
security HttpBasic   安全认证登录

4.security认证授权架构
不同于spring-security的传统安全架构
由于gateway是基于WebFlux。
WebFlux相对于普通Web架构，采用NIO同步非阻塞IO，降低了gateway作为网关的资源消耗，也提高了并发和吞吐量
由于认证集成到了gateway网关，采用Reactive Spring Security兼容gateway的WebFlux底层web架构
(SecurityContextHold 在Reactive下变成了ReactorSecurityContextHold，不在一个线程是获取不到SecurityContext的上下问内容，
解决办法，在SecurityWebFilterChain中load加载context时，采用redisson缓存，在GlobalFilterChain中通过Redis才能获取context)


5.核心类说明
AuthenticationConverter 兼容HttpBasic和Form-login 参数解析
AuthenticationManager   登录认证器，采用RMI调用usermant用户微服务，验证用户的合法性
AuthenticationToken     认证信息传递实体Bean
AuthorizeConfigManager  访问权限控制器
DataBlauSessionServerSecurityContextRepository  获取登录上下文Context工具类
HttpBasicServerWebExchangeMatcher  基于HttpBasic认证时，由于HttpBasic没有指定登录URL，需要指定登录url匹配器，否则每次请求都会执行认证FIlter
LoginSuccessHandler LoginFailureHandler 主要是针对Form-Login的认证方式才生效
DBReactiveUserDetailsServiceImpl 用户信息合法性校验类

6.配置文件说明



datablau:
  security-url:
    login:                     //dam,ddm统一Form-login
      /dam/login
    logout:                    //Form-login统一登出
      /datablau/logout
    ignore:                    //请求白名单
      /ddm/static/**,
      /dam/static/**
    client-login:              //客户端HttpBasic登录
      /ddm/service/main/login




