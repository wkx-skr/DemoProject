package com.datablau.gateway.controller;

import com.datablau.gateway.dto.UserInfoDto;
import com.datablau.security.management.dto.SimpleUserDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.codec.multipart.FormFieldPart;
import org.springframework.http.codec.multipart.Part;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2023/5/22 11:09
 */
public class BaseController {

    private static final Logger logger = LoggerFactory.getLogger(BaseController.class);

    protected static final ObjectMapper mapper = new ObjectMapper();

    /**
     * 获取formdata传参
     * @param data
     * @param key
     * @return
     */
    String getParam(MultiValueMap<String, Part> data, String key){
        String resData;
        if(data.isEmpty()){
            resData = null;
        }else {
            FormFieldPart usernamePart = (FormFieldPart)data.getFirst(key);
            resData = usernamePart.value();
        }

        return resData;
    }

    static class ResponseHandler{
//        public static Mono<ServerResponse> responseHandler(Map<Long, SimpleUserDto> result){
//
//            try {
//                String convertResult = mapper.writeValueAsString(result);
//
//                return ServerResponse.ok()
//                    .contentType(MediaType.APPLICATION_JSON)
//                    .bodyValue(convertResult);
//            } catch (JsonProcessingException e) {
//                logger.warn("parse result data failed cause by:" + e.getMessage());
//                throw new RuntimeException("parse result data failed cause by:" + e.getMessage(), e);
//            }
//        }

        public static <T> Mono<ServerResponse> responseHandler(T result){

            if(result instanceof String){
                return ServerResponse.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(result);
            }

            if(result instanceof Boolean){
                return ServerResponse.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(result);
            }

            try {
                String convertResult = mapper.writeValueAsString(result);

                return ServerResponse.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(convertResult);
            } catch (JsonProcessingException e) {
                logger.warn("parse result data failed cause by:" + e.getMessage());
                throw new RuntimeException("parse result data failed cause by:" + e.getMessage(), e);
            }
        }

        public static Mono<ServerResponse> responseHandler(HttpStatus httpStatus, String message){
            return ServerResponse.status(httpStatus)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(message);
        }
//
//        public static Mono<ServerResponse> responseHandler(String resBody) {
//            return ServerResponse.ok()
//                .contentType(MediaType.APPLICATION_JSON)
//                .bodyValue(resBody);
//        }
//
//        public static Mono<ServerResponse> responseHandler(Boolean resBody) {
//            return ServerResponse.ok()
//                .contentType(MediaType.APPLICATION_JSON)
//                .bodyValue(resBody);
//        }

        public static Mono<ServerResponse> responseNullParamHandler(){
            return ServerResponse.status(599)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("参数不能为空");
        }

        public static Mono<ServerResponse> responseOKHandler(){
            return ServerResponse.status(HttpStatus.OK)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue("success");
        }

        public static Mono<ServerResponse> response599Handler(String message){
            return ServerResponse.status(599)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(message);
        }

    }


}
