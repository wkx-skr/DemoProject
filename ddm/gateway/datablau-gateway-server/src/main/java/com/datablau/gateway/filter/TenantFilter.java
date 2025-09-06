package com.datablau.gateway.filter;

import com.andorj.common.utils.MultiTenantIdHolder;
import com.datablau.gateway.dto.TenantParams;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.List;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date :2024/7/8
 */
@Component
@Order(1)
public class TenantFilter implements WebFilter {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        List<String> tenantId = exchange.getRequest().getHeaders().get(TenantParams.TENANT_HEADER_ID);
        if(tenantId == null || tenantId.isEmpty()){
            MultiTenantIdHolder.setTenantId(TenantParams.DEFAULT_TENANT);
            return chain.filter(exchange).subscriberContext(context ->
                    context.put(TenantParams.TENANT_ID, TenantParams.DEFAULT_TENANT));
        }else {
            MultiTenantIdHolder.setTenantId(tenantId.get(0));
            return chain.filter(exchange).subscriberContext(context ->
                    context.put(TenantParams.TENANT_ID, tenantId.get(0))
            );
        }
    }

}
