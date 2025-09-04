package com.datablau.base.server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.data.redis.config.ConfigureRedisAction;
import org.springframework.web.client.RestTemplate;

/**
 * <h3></h3>
 *
 * @author : myf
 * @version : 1.0
 * &#064;date  : 2025-04-14  11:42
 */
@Configuration
public class configExt  {

    /**
     * 关闭Spring-session中对CONFIG的操作
     *
     * @return ConfigureRedisAction
     */
    @Bean
    public static ConfigureRedisAction configureRedisAction() {
        return ConfigureRedisAction.NO_OP;
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
