package com.datablau.gateway.controller;

import com.alibaba.cloud.nacos.discovery.NacosDiscoveryClient;
import com.andorj.model.common.utility.BeanHelper;
import org.apache.commons.lang.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.codec.multipart.FormFieldPart;
import org.springframework.web.reactive.function.server.RequestPredicates;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerResponse;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2023/5/12 17:14
 */
@Configuration
public class ServiceEnableController extends BaseController {

    @Value("#{${datablau.server.map}}")
    private Map<String, String> serverMaps;

    @Value("${common.dam.connectable:true}")
    private boolean damConnect;

    @Value("${common.ddm.connectable:true}")
    private boolean ddmConnect;

    @Value("${common.datablau.dam.service}")
    private String damServices;

    @Value("${common.datablau.ddm.service:DDM}")
    private String ddmService;

    @Value("${common.datablau.ddd.service:DDD}")
    private String dddService;

    @Bean
    public RouterFunction<ServerResponse> serviceEnable() {

        return RouterFunctions.route()
                .POST("/gateway/server/getEnable", RequestPredicates.accept(MediaType.MULTIPART_FORM_DATA), request -> {
                    return request.multipartData().flatMap(data -> {
                        NacosDiscoveryClient discoveryClient = BeanHelper.getBean(NacosDiscoveryClient.class);
                        if (data.isEmpty() || !data.containsKey("serverName"))
                            return ResponseHandler.responseNullParamHandler();
                        ;

                        if (discoveryClient == null || discoveryClient.getServices().isEmpty())
                            return ResponseHandler.responseHandler(false);
                        FormFieldPart serverName = (FormFieldPart) data.get("serverName").get(0);
                        String key = serverName.value();
                        String configServerName = serverMaps.get(key);
                        return ResponseHandler.responseHandler(discoveryClient.getServices().stream()
                                .anyMatch(server -> ObjectUtils.equals(server, configServerName)));
                    });
                })
                .POST("/gateway/server/getEnableList", RequestPredicates.accept(MediaType.ALL), request -> {
                    NacosDiscoveryClient discoveryClient = BeanHelper.getBean(NacosDiscoveryClient.class);
                    if (discoveryClient == null || discoveryClient.getServices().isEmpty())
                        return ResponseHandler.responseHandler("[]");

                    Set<String> serverSets = discoveryClient.getServices().stream()
                            .filter(server -> serverMaps.containsValue(server))
                            .collect(Collectors.toSet());
                    Set<String> resSets = serverMaps.entrySet().stream()
                            .filter(server -> serverSets.contains(server.getValue()))
                            .map(server -> server.getKey()).collect(Collectors.toSet());
                    return ResponseHandler.responseHandler(resSets.toString());
                }).GET("/gateway/server/config", RequestPredicates.accept(MediaType.ALL), request -> {
                    HashMap<String, String[]> connect = new HashMap<>();
                    connect.put("DAM", damServices.split(","));
                    connect.put("DDM", ddmService.split(","));
                    connect.put("DDD", dddService.split(","));
                    return ResponseHandler.responseHandler(connect);
                }).GET("/gateway/server/configConnect", RequestPredicates.accept(MediaType.ALL), request -> {
                    HashMap<String, Boolean> connect = new HashMap<>();
                    connect.put("dam", damConnect);
                    connect.put("ddm", ddmConnect);
                    return ResponseHandler.responseHandler(connect);
                })
                .build();
    }
}
