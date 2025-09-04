package com.datablau.gateway.controller;

import com.alibaba.cloud.nacos.discovery.NacosDiscoveryClient;
import com.andorj.cloud.service.HealthService;
import com.andorj.model.common.utility.BeanHelper;
import org.redisson.api.RAtomicLong;
import org.redisson.api.RedissonClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.RequestPredicates;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2022/9/21 10:35
 * 如果gateway需要写controller,采用这种webflux方式,不支持springMvc
 */
@Configuration
public class TestController {

    private static Map<String, String> appNameToHealthServiceName
            = new HashMap<>();

    static {
        appNameToHealthServiceName.put("dam", "damHealthService");
        appNameToHealthServiceName.put("ddm", "ddmHealthService");
        appNameToHealthServiceName.put("usermgmt", "userHealthService");
    }

    @Bean
    public RouterFunction<ServerResponse> helloWorld(){
        HelloHandler handler = new HelloHandler();
        StatusHandler statusHandler = new StatusHandler();
        return RouterFunctions.route().GET("/gateway/service/instance", statusHandler::getInstanceStatus)
                .GET("/gateway/hello", RequestPredicates.accept(MediaType.APPLICATION_JSON), handler::helloStr)
                .GET("/gateway/health", RequestPredicates.accept(MediaType.ALL), request -> {
                    try {
                        RedissonClient redissonClient = BeanHelper.getBean(RedissonClient.class);
                        RAtomicLong testLong = redissonClient.getAtomicLong("datablau_keepaliave");
                        testLong.get();
                    } catch (Throwable tw) {
                        return ServerResponse.status(HttpStatus.INTERNAL_SERVER_ERROR).contentType(MediaType.APPLICATION_JSON)
                                .bodyValue("FAILED");
                    }

                    Optional<String> checkServices = request.queryParam("services");
                    if  (checkServices.isPresent()) {
                        String toBeCheckedServices = checkServices.get();
                        String[] toBeCheckedServicesArr = toBeCheckedServices.split(",");

                        try {
                            for (String service : toBeCheckedServicesArr) {
                                String beanName = appNameToHealthServiceName.get(service);
                                if (beanName != null) {
                                    HealthService hs = (HealthService)BeanHelper.getBeanByName(beanName);
                                    if (hs != null) {
                                        hs.ping();
                                    } else {
                                        return ServerResponse.status(HttpStatus.SERVICE_UNAVAILABLE).contentType(MediaType.APPLICATION_JSON)
                                                .bodyValue("FAILED");
                                    }
                                }
                            }
                        } catch (Throwable tw) {
                            return ServerResponse.status(HttpStatus.INTERNAL_SERVER_ERROR).contentType(MediaType.APPLICATION_JSON)
                                    .bodyValue("FAILED");
                        }
                        return ServerResponse.ok().contentType(MediaType.APPLICATION_JSON)
                                .bodyValue("SUCCESS");
                    } else {
                        return ServerResponse.ok().contentType(MediaType.APPLICATION_JSON)
                                .bodyValue("SUCCESS");
                    }
                })
                .build();
    }


    class HelloHandler{
        public Mono<ServerResponse> helloStr(ServerRequest serverRequest) {
            return ServerResponse.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue("hello world");
        }
    }

    class StatusHandler {
        public Mono<ServerResponse> getInstanceStatus(ServerRequest serverRequest) {
            NacosDiscoveryClient discoveryClient = BeanHelper.getBean(NacosDiscoveryClient.class);
            if (discoveryClient == null || discoveryClient.getServices().isEmpty())
                return responseHandler("[]");
            Set<String> serverList = discoveryClient.getServices().stream()
                    .collect(Collectors.toSet());
            return responseHandler(serverList.toString());
        }

        public <T> Mono<ServerResponse> responseHandler(T result) {
            return ServerResponse.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(result);
        }
    }
}
