package com.datablau.audit.jdbcgateway.controller;

import com.datablau.audit.jdbcgateway.service.api.SecurityGatewayAuditService;
import com.datablau.audit.dto.GatewayLogDto;
import com.datablau.data.common.controller.BaseController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 测试
 *
 * @author weijiakun
 * @create 2023-07-10 14:10
 */
@RestController
@RequestMapping("/audit")
public class TestController extends BaseController {

    @Autowired
    private SecurityGatewayAuditService securityGatewayAuditService;


    @PostMapping("/gateway")
    public void testGateway(@RequestBody GatewayLogDto gatewayLogDto) {
        securityGatewayAuditService.addGatewayLogMsg(gatewayLogDto);
    }

    @PostMapping("/table")
    public void testable(@RequestBody GatewayLogDto gatewayLogDto) {
        securityGatewayAuditService.addTableSearchResultMsg(gatewayLogDto);
    }

    @PostMapping("/count")
    public void testCount(@RequestBody GatewayLogDto gatewayLogDto) {
        securityGatewayAuditService.addTableCount(gatewayLogDto);
    }



}
