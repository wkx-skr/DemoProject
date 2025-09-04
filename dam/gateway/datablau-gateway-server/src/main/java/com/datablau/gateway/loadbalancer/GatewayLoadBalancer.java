package com.datablau.gateway.loadbalancer;

import com.datablau.gateway.loadbalancer.balancer.LoadBalancerFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.loadbalancer.*;
import org.springframework.cloud.gateway.config.GatewayLoadBalancerProperties;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.ReactiveLoadBalancerClientFilter;
import org.springframework.cloud.gateway.support.DelegatingServiceInstance;
import org.springframework.cloud.gateway.support.NotFoundException;
import org.springframework.cloud.gateway.support.ServerWebExchangeUtils;
import org.springframework.cloud.loadbalancer.core.ReactorLoadBalancer;
import org.springframework.cloud.loadbalancer.support.LoadBalancerClientFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2022/6/20 10:24
 */
@Component
public class GatewayLoadBalancer extends ReactiveLoadBalancerClientFilter {

    private static final Logger LOGGER = LoggerFactory.getLogger(GatewayLoadBalancer.class);
    private final LoadBalancerClientFactory clientFactory;

    @Value("${gateway.balancer.type:base}")
    private String balancerType;

    private Map<String, ReactorLoadBalancer<ServiceInstance>> balancerMap = new ConcurrentHashMap();

    public GatewayLoadBalancer(
            LoadBalancerClientFactory clientFactory,
            GatewayLoadBalancerProperties properties) {
        super(clientFactory, properties);
        this.clientFactory = clientFactory;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        URI url = exchange.getAttribute(ServerWebExchangeUtils.GATEWAY_REQUEST_URL_ATTR);
        String schemePrefix = exchange.getAttribute(ServerWebExchangeUtils.GATEWAY_SCHEME_PREFIX_ATTR);
        if (url != null && ("lb".equals(url.getScheme()) || "lb".equals(schemePrefix))) {
            ServerWebExchangeUtils.addOriginalRequestUrl(exchange, url);

            URI requestUri = exchange.getAttribute(ServerWebExchangeUtils.GATEWAY_REQUEST_URL_ATTR);
            String serviceId = requestUri.getHost();
            DefaultRequest<RequestDataContext> lbRequest = new DefaultRequest(new RequestDataContext(new RequestData(exchange.getRequest()), getHint(serviceId)));
            return this.choose(lbRequest, serviceId).doOnNext((response) -> {
                if (!response.hasServer()) {
                    throw NotFoundException.create(true, "Unable to find instance for " + url.getHost());
                } else {
                    ServiceInstance retrievedInstance = response.getServer();
                    URI uri = exchange.getRequest().getURI();
                    String overrideScheme = retrievedInstance.isSecure() ? "https" : "http";
                    if (schemePrefix != null) {
                        overrideScheme = url.getScheme();
                    }
                    DelegatingServiceInstance serviceInstance = new DelegatingServiceInstance(retrievedInstance, overrideScheme);
                    URI requestUrl = this.reconstructURI(serviceInstance, uri);
                    exchange.getAttributes().put(ServerWebExchangeUtils.GATEWAY_REQUEST_URL_ATTR, requestUrl);
                    exchange.getAttributes().put(ServerWebExchangeUtils.GATEWAY_LOADBALANCER_RESPONSE_ATTR, response);
                }
            }).then(chain.filter(exchange)).doOnError((throwable) -> {
                LOGGER.trace(throwable.getMessage(), throwable);
            });
        } else {
            return chain.filter(exchange);
        }
    }

    private String getHint(String serviceId) {
        LoadBalancerProperties loadBalancerProperties = this.clientFactory.getProperties(serviceId);
        Map<String, String> hints = loadBalancerProperties.getHint();
        String defaultHint = hints.getOrDefault("default", "default");
        String hintPropertyValue = hints.get(serviceId);
        return hintPropertyValue != null ? hintPropertyValue : defaultHint;
    }
    public Mono<Response<ServiceInstance>> choose(Request<RequestDataContext> lbRequest, String serviceId) {
        ReactorLoadBalancer<ServiceInstance> loadBalancer = balancerMap.get(serviceId);

        if(loadBalancer == null){
            loadBalancer = loadBalancer(serviceId);
        }

        if (loadBalancer == null) {
            throw new NotFoundException("No loadbalancer available for " + serviceId);
        } else {
            return loadBalancer.choose(lbRequest);
        }
    }


    private ReactorLoadBalancer<ServiceInstance> loadBalancer(String serviceId){
        ReactorLoadBalancer<ServiceInstance> loadBalancer = LoadBalancerFactory.createLoadBalancer(balancerType, serviceId);
        balancerMap.put(serviceId, loadBalancer);
        return loadBalancer;
    }
}
