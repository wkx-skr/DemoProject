package com.datablau.gateway.security.core;

import com.datablau.gateway.dto.AuthenticationToken;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.authentication.ServerFormLoginAuthenticationConverter;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2021/12/2 10:52
 */
@Component
public class AuthenticationConverter extends ServerFormLoginAuthenticationConverter {
    private String usernameParameter = "j_username";

    private String passwordParameter = "j_password";

    @Override
    public Mono<Authentication> convert(ServerWebExchange exchange) {
        HttpHeaders headers = exchange.getRequest().getHeaders();
        String host = headers.getHost().getHostName();
        List<String> authToken = headers.get("Authorization");
        if(authToken != null && authToken.size() > 0){
            Optional<String> basic = authToken.stream().filter(token -> token.startsWith("Basic"))
                .findAny();
            if(basic.isPresent()){
                String baseStr = new String(Base64.getDecoder().decode(basic.get().substring(6)), StandardCharsets.UTF_8);
                String[] split = baseStr.split(":");
                return Mono.just(new AuthenticationToken(split[0], split[1], null, host));
            }
        }

        return exchange.getFormData()
            .map(data -> {
                String username = data.getFirst(this.usernameParameter);
                String password = data.getFirst(this.passwordParameter);
                return new AuthenticationToken(username, password, null, host);
            });
    }
}
