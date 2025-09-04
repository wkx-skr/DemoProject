package com.datablau.gateway.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.netty.util.CharsetUtil;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2021/12/2 13:36
 */
public class RebuildExchangeUtil {
    private static final ObjectMapper mapper = new ObjectMapper();
    private static final Logger logger = LoggerFactory.getLogger(RebuildExchangeUtil.class);

    public static Mono<Void> rebuildExchange(ServerWebExchange exchange, HttpStatus httpStatus) {
        exchange.getResponse().setStatusCode(httpStatus);
        DataBuffer buffer = exchange.getResponse()
            .bufferFactory().wrap(httpStatus.getReasonPhrase().getBytes());
        return exchange.getResponse().writeWith(Flux.just(buffer));
    }

    /**
     * 请求失败数据处理
     * @param data
     * @param response
     * @return
     */
    public static Mono<Void> processResData(Map<String, Object> data, ServerHttpResponse response){
        String resData = null;
        try {
            resData = mapper.writeValueAsString(data);
        } catch (JsonProcessingException e) {
            logger.error("parse data error cause by:"+e.getMessage());
        }
        if(resData == null){
            resData = "";
        }
        DataBuffer dataBuffer = response.bufferFactory().wrap(resData.getBytes(CharsetUtil.UTF_8));
        return response.writeWith(Mono.just(dataBuffer));
    }
}
