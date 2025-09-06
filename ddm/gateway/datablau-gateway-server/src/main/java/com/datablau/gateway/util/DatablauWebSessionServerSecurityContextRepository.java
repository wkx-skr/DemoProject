package com.datablau.gateway.util;

import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.web.server.context.WebSessionServerSecurityContextRepository;
import org.springframework.util.Assert;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebSession;
import reactor.core.publisher.Mono;

/**
 * @author nicky - 数语科技有限公司
 * date 2022/11/4 10:19
 */
public class DatablauWebSessionServerSecurityContextRepository extends
    WebSessionServerSecurityContextRepository {

    private String springSecurityContextAttrName = DEFAULT_SPRING_SECURITY_CONTEXT_ATTR_NAME;

    public void setSpringSecurityContextAttrName(String springSecurityContextAttrName) {
        Assert.hasText(springSecurityContextAttrName, "springSecurityContextAttrName cannot be null or empty");
        this.springSecurityContextAttrName = springSecurityContextAttrName;
        super.setSpringSecurityContextAttrName(springSecurityContextAttrName);
    }

    public Mono<SecurityContext> load(ServerWebExchange exchange) {
        if (exchange.getRequest().getPath().value().indexOf("/gateway/health") >= 0) {
            return Mono.empty();
        }

        return exchange.getSession()
            .map(WebSession::getAttributes)
            .flatMap( attrs -> {
                SecurityContext context = (SecurityContext) attrs.get(this.springSecurityContextAttrName);
                return Mono.justOrEmpty(context);
            });
    }

}
