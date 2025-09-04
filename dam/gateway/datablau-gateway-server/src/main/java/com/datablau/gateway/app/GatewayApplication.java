package com.datablau.gateway.app;

import com.alibaba.boot.nacos.discovery.autoconfigure.NacosDiscoveryAutoConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.actuate.autoconfigure.health.HealthContributorAutoConfiguration;
import org.springframework.boot.actuate.autoconfigure.ldap.LdapHealthContributorAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration;
import org.springframework.boot.autoconfigure.solr.SolrAutoConfiguration;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.netflix.eureka.EurekaClientAutoConfiguration;
import org.springframework.cloud.netflix.eureka.EurekaDiscoveryClientConfiguration;
import org.springframework.cloud.netflix.eureka.reactive.EurekaReactiveDiscoveryClientConfiguration;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2021/11/4 11:28
 */

@SpringBootApplication(scanBasePackages = "com.datablau.gateway",
exclude = {
        SolrAutoConfiguration.class,
        RedisRepositoriesAutoConfiguration.class,
        LdapHealthContributorAutoConfiguration.class,
        NacosDiscoveryAutoConfiguration.class,
        EurekaClientAutoConfiguration.class,
        EurekaDiscoveryClientConfiguration.class,
        HealthContributorAutoConfiguration.class,
        EurekaReactiveDiscoveryClientConfiguration.class
})
@EnableDiscoveryClient
public class GatewayApplication extends SpringBootServletInitializer {
    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class);
    }

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
        return builder.sources(GatewayApplication.class);
    }
}
