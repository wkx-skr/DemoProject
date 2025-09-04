package com.datablau.gateway.filter;

import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.cloud.gateway.support.NotFoundException;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

/**
 * @author: hxs
 * @date: 2025/7/7 15:09
 */

@Component
@Order(-1)
public class NotFoundHandler implements ErrorWebExceptionHandler  {


    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
        HttpStatus status = determineHttpStatus(ex);
        if(status == HttpStatus.NOT_FOUND){
            ServerHttpResponse response = exchange.getResponse();

            // 已提交响应时直接返回
            if (response.isCommitted()) {
                return Mono.error(ex);
            }

            // 设置HTTP状态码
            response.setStatusCode(status);
            response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

            // 构建自定义JSON响应
            String jsonBody = "{\"code\":404,\"message\":\"请求的接口不存在\",\"path\":\"" + exchange.getRequest().getPath() + "\"}";

            // 写入响应体
            byte[] bytes = jsonBody.getBytes(StandardCharsets.UTF_8);
            DataBuffer buffer = response.bufferFactory().wrap(bytes);
            return response.writeWith(Mono.just(buffer));
        }
        return Mono.error(ex);
    }

    private HttpStatus determineHttpStatus(Throwable ex) {
        if (ex instanceof NotFoundException) {
            return HttpStatus.NOT_FOUND;
        }
        if (ex instanceof ResponseStatusException) {
            return ((ResponseStatusException) ex).getStatus();
        }
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }

}
