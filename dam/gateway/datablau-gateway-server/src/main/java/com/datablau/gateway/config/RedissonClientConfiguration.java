package com.datablau.gateway.config;

import com.andorj.model.common.utility.RootBeanHelper;
import com.datablau.data.common.api.PropertyService;
import com.datablau.data.common.api.impl.PropertyServiceImpl;
import com.datablau.data.common.util.DatablauRedissonRegionFactory;
import com.datablau.gateway.util.DatablauWebSessionManager;
import com.datablau.gateway.util.DatablauWebSessionServerSecurityContextRepository;
import java.io.IOException;
import org.redisson.api.RedissonClient;
import org.redisson.spring.data.connection.RedissonConnectionFactory;
import org.redisson.spring.session.ReactiveRedissonSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.Resource;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.security.web.server.context.ServerSecurityContextRepository;
import org.springframework.session.ReactiveSessionRepository;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;
import org.springframework.session.web.server.session.SpringSessionWebSessionStore;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.session.WebSessionManager;
import org.springframework.web.server.session.WebSessionStore;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2021/11/30 16:52
 */
@Configuration
@EnableRedisHttpSession
public class RedissonClientConfiguration implements
    ApplicationEventPublisher {

    private static final Logger logger = LoggerFactory.getLogger(RedissonClientConfiguration.class);

    public static final String keyPrefix = "datablau:session:";

    @Value("${datablau.session.maxInterval:1800}")
    private int maxInactiveInterval;

    @Value("${spring.redis.redisson.config}")
    private String configFile;

    @Autowired
    private RedissonClient redissonClient;
    @Autowired
    private WebSessionStore webSessionStore;

    @Override
    public void publishEvent(Object event) {

    }

    @Bean
    public RedissonConnectionFactory redissonConnectionFactory(RedissonClient redisson) {
        return new RedissonConnectionFactory(redisson);
    }

    @Bean
    public PropertyService propertyService(){
        return new PropertyServiceImpl();
    }

    @Bean
    public RootBeanHelper rootBeanHelper(){
        return new RootBeanHelper();
    }

    @Bean
    @DependsOn({"propertyService", "rootBeanHelper"})
    public RedissonClient redisson() throws IOException {
        return DatablauRedissonRegionFactory.createRedissonClient(configFile);
    }

    @Bean(value = "reactiveSessionRepository")
    @Primary
    public ReactiveSessionRepository reactiveSessionRepository(){
        ReactiveRedissonSessionRepository sessionRepository = new ReactiveRedissonSessionRepository(redissonClient, this::publishEvent, keyPrefix);
        sessionRepository.setDefaultMaxInactiveInterval(maxInactiveInterval);
        return sessionRepository;
    }

    @Bean(value = "webSessionStore")
    public WebSessionStore webSessionStore(ReactiveSessionRepository reactiveSessionRepository){
        return new SpringSessionWebSessionStore(reactiveSessionRepository);
    }

    @Bean(value = "webSessionManager")
    public WebSessionManager webSessionManager(){
        DatablauWebSessionManager manager = new DatablauWebSessionManager();
//        manager.setSessionIdResolver(new CustCookieWebSessionIdResolver());
        manager.setSessionStore(webSessionStore);
        return manager;
    }

    @Bean("originalRestTemplate")
    public RestTemplate originalRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        //客户端与服务端建立连接超时时间
        factory.setConnectTimeout(5000);
        //客户端从服务端读取数据的超时时间
        factory.setReadTimeout(60000);
        RestTemplate template = new RestTemplate(factory);
        return template;
    }

    @Bean
    public ServerSecurityContextRepository serverSecurityContextRepository(){
        return new DatablauWebSessionServerSecurityContextRepository();
    }

    public static String getKeyPrefixSessionId(String sessionId){
        return keyPrefix+sessionId;
    }

    public static String getExpiresKeyPrefixSessionId(String sessionId){
        return keyPrefix+"sessions:expires:"+sessionId;
    }
}
