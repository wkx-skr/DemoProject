package com.datablau.gateway.filter;

import static com.datablau.gateway.security.SecurityConfig.getWhiteString;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.Serializable;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;
import javax.annotation.PostConstruct;
import org.reactivestreams.Publisher;
import org.redisson.spring.session.RedissonSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.http.server.reactive.ServerHttpResponseDecorator;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.session.ReactiveSessionRepository;
import org.springframework.session.Session;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2021/11/22 10:23
 */
@Configuration
public class AccessGatewayFilter implements GlobalFilter, Ordered{
    private final Logger logger = LoggerFactory.getLogger(AccessGatewayFilter.class);
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${datablau.security-url.client-token}")
    private String clientTokenUri;

    @Value("${datablau.security-url.ignore}")
    private String whiteStr;

    @Autowired
    private ReactiveSessionRepository reactiveSessionRepository;

    private String[] whiteUrl;

    @PostConstruct
    private void init(){
        whiteUrl = getWhiteString(whiteStr);
    }

    /**
     * gateway自定义核心拦截器
     * @param exchange
     * @param chain
     * @return
     */
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        if(exchange.getRequest().getPath().value().indexOf(clientTokenUri)>=0){
            AtomicReference<String> sessionId = new AtomicReference<>();
            ServerHttpResponse originalResponse = exchange.getResponse();
            ServerHttpResponseDecorator decoratedResponse = new ServerHttpResponseDecorator(originalResponse) {
                @Override
                public Mono<Void> writeWith(Publisher<? extends DataBuffer> body) {
                    if (getStatusCode().equals(HttpStatus.OK) && body instanceof Flux) {
                        Flux<? extends DataBuffer> fluxBody = Flux.from(body);
                        return super.writeWith(fluxBody.buffer().map(dataBuffers -> {
                            List<String> list = new ArrayList<String>();
                            dataBuffers.forEach(dataBuffer -> {
                                byte[] content = new byte[dataBuffer.readableByteCount()];
                                dataBuffer.read(content);
                                DataBufferUtils.release(dataBuffer);
                                try {
                                    list.add(new String(content, "utf-8"));
                                } catch (IOException e) {
                                    logger.error("read response data failed cause by:" + e.getMessage());
                                }
                            });
                            String userInfoStr = list.stream().collect(Collectors.joining());
                            sessionId.set(setTokenSession(userInfoStr, exchange));
                            return bufferFactory().wrap(userInfoStr.getBytes());
                        }));
                    }
                    return super.writeWith(body);
                }
            };
            // replace response with decorator
            ServerHttpResponse response = exchange.getResponse();

            response.beforeCommit(()->{
                StringBuffer sb = new StringBuffer();
                sb.append("SESSION=");
                sb.append(sessionId.get());
                sb.append("; path=/;");
                sb.append(" HttpOnly;");
                response.getHeaders().add(HttpHeaders.SET_COOKIE, sb.toString());
                return Mono.empty();
            });

            return chain.filter(exchange.mutate().response(decoratedResponse).build());
        }else {
            ServerHttpResponse response = exchange.getResponse();

            if(Arrays.stream(whiteUrl).anyMatch(uri -> exchange.getRequest().getPath().value().indexOf(uri)>=0)){
                HttpHeaders headers = exchange.getRequest().getHeaders();
                headers = HttpHeaders.writableHttpHeaders(headers);
                headers.remove(HttpHeaders.COOKIE);
            }

            response.beforeCommit(() -> {
                List<String> list = response.getHeaders().get(HttpHeaders.SET_COOKIE);
                if(list != null && list.size() > 0) response.getHeaders().remove(HttpHeaders.COOKIE);
                return Mono.empty();
            });

            return chain.filter(exchange);
        }
    }


    private String setSecurityContext(SecurityContext securityContext){
        try {
            Class<? extends ReactiveSessionRepository> aClass = reactiveSessionRepository
                .getClass();

            Field repository = aClass.getDeclaredField("repository");
            repository.setAccessible(true);
            RedissonSessionRepository repository1 = (RedissonSessionRepository)repository.get(reactiveSessionRepository);

            Session session = repository1.createSession();

            session.setAttribute("SPRING_SECURITY_CONTEXT", securityContext);
            return session.getId();
        } catch (Exception e) {
            logger.error("set security context falied cause by:" + e.getMessage());
        }
        return null;
    }
//            Mono<Session> byId = reactiveSessionRepository.findById("bc798fb7-34ee-4598-ab98-7c4f8df3ddd7");
//
//            AtomicReference<SecurityContextImpl> securityContext = new AtomicReference<>();
//
//            byId.subscribe(session -> {
//                securityContext.set((SecurityContextImpl) session.getAttribute("SPRING_SECURITY_CONTEXT"));
//            });

//            SecurityContextImpl securityContext1 = securityContext.get();

    private String setTokenSession(String userInfoStr, ServerWebExchange exchange){
        try {
            UserInfo userInfo = mapper.readValue(userInfoStr, UserInfo.class);


            List<String> roles = userInfo.getRoles();
            Collection<SimpleGrantedAuthority> simpleRoles = null;
            if(roles != null && !roles.isEmpty()){
                for (String role : roles) {
                    if(simpleRoles == null) simpleRoles = new ArrayList<>();
                    simpleRoles.add(new SimpleGrantedAuthority(role));

                }
            }
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(userInfo.getUsername(), userInfo.getUsername(), simpleRoles);

            SecurityContextImpl securityContext = new SecurityContextImpl(authenticationToken);

            return setSecurityContext(securityContext);
        } catch (JsonProcessingException e) {
            logger.error("parse token userInfo failed cause by:"+e.getMessage(), e);
            throw new RuntimeException("parse token userInfo failed cause by:"+e.getMessage(), e);
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class UserInfo implements Serializable {
        @JsonProperty("username")
        private String username;
        @JsonProperty("roles")
        private List<String> roles;

        public UserInfo() {
        }

        public UserInfo(String username, List<String> roles) {
            this.username = username;
            this.roles = roles;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public List<String> getRoles() {
            return roles;
        }

        public void setRoles(List<String> roles) {
            this.roles = roles;
        }
    }

    @Override
    public int getOrder() {
        return -2;
    }
}
