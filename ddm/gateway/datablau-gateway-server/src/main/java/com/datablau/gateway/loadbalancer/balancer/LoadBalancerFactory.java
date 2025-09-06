package com.datablau.gateway.loadbalancer.balancer;

import org.apache.commons.lang.StringUtils;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.loadbalancer.core.ReactorLoadBalancer;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date :2024/1/22
 */
public class LoadBalancerFactory {
    public static ReactorLoadBalancer<ServiceInstance> createLoadBalancer(String type, String serverId){
        type = StringUtils.isEmpty(type) ? "base": type;
        switch (type){
            case "session":
                return new SessionLoadBalancer(serverId);
            case "base":
            default: return new BaseLoadBalancer(serverId);
        }
    }
}
