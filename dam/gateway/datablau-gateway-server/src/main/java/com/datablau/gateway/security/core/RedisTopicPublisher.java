package com.datablau.gateway.security.core;

import com.andorj.model.common.utility.RootBeanHelper;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;
import org.redisson.api.RTopic;
import org.redisson.api.RedissonClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.web.server.ServerWebExchange;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2023/1/5 14:12
 */
public abstract class RedisTopicPublisher {

    @Value("${datablau.redisTopic.enable:false}")
    private Boolean isEnable;

    private static final Logger logger = LoggerFactory.getLogger(SecurityLogoutSuccessHandler.class);

    private static  final ObjectMapper mapper = new ObjectMapper();

    protected void publishTopic(WebFilterExchange webFilterExchange, String username, boolean isLogin){
        if(!isEnable) return;
        ServerWebExchange exchange = webFilterExchange.getExchange();
        try {
            RTopic topic = RootBeanHelper.getBean(RedissonClient.class).getTopic("topic_log");
            String host= exchange.getRequest().getRemoteAddress().getAddress().getHostAddress();
            String value = exchange.getRequest().getPath().value();

            Map<String, Object> loginMap = new HashMap<>();
            loginMap.put("operator", username);
            loginMap.put("dateTime", System.currentTimeMillis());
            loginMap.put("systemModule", "系统管理-用户登录");
            loginMap.put("ip", host);
            loginMap.put("url", value);
            if(isLogin){
                loginMap.put("operation", "登录");
                loginMap.put("description", "用户登录");
            }else {
                loginMap.put("operation", "登出");
                loginMap.put("description", "用户登出");
            }
            String loginInfo = mapper.writeValueAsString(loginMap);
            topic.publish(loginInfo);
        } catch (Exception e) {
            logger.warn(e.getMessage(), e);
        }

    }

}
