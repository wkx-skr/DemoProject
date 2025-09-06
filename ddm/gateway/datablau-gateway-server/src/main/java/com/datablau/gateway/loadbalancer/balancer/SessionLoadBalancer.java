package com.datablau.gateway.loadbalancer.balancer;

import com.alibaba.cloud.nacos.discovery.NacosDiscoveryClient;
import com.andorj.model.common.utility.RootBeanHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.loadbalancer.*;
import org.springframework.cloud.loadbalancer.core.*;
import org.springframework.util.CollectionUtils;
import org.springframework.util.MultiValueMap;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date :2024/1/18
 */
public class SessionLoadBalancer implements ReactorServiceInstanceLoadBalancer {
    private static Logger LOGGER = LoggerFactory.getLogger(SessionLoadBalancer.class);
    private NacosDiscoveryClient nacosDiscoveryClient;

    final AtomicInteger position;
    private String serverId;

    public SessionLoadBalancer(String serverId) {
        nacosDiscoveryClient =  RootBeanHelper.getBean(NacosDiscoveryClient.class);
        this.serverId = serverId;
        this.position = new AtomicInteger((new Random()).nextInt(1000));
    }

    public Mono<Response<ServiceInstance>> choose(Request request) {
        return Mono.just(processInstanceResponse(request));
    }

    private Response<ServiceInstance> processInstanceResponse(Request request) {
        List<ServiceInstance> instances = nacosDiscoveryClient.getInstances(serverId);
        Response<ServiceInstance> serviceInstanceResponse = this.getInstanceResponse(instances, request);

        return serviceInstanceResponse;
    }

    private Response<ServiceInstance> getInstanceResponse(List<ServiceInstance> instances, Request request) {
        if (instances.isEmpty()) {
            return new EmptyResponse();
        } else if (instances.size() == 1) {
            return new DefaultResponse(instances.get(0));
        } else {
            RequestDataContext requestDataContext = (RequestDataContext)request.getContext();
            MultiValueMap<String, String> cookies = requestDataContext.getClientRequest().getCookies();
            List<String> session = cookies.get("SESSION");
            ServiceInstance instance;
            if(!CollectionUtils.isEmpty(session)){
                instance = instances.get(Math.abs(session.get(0).hashCode() % instances.size()));
            }else {
                int pos = this.position.incrementAndGet() & Integer.MAX_VALUE;
                instance = instances.get(pos % instances.size());
            }
            return new DefaultResponse(instance);
        }
    }
}
