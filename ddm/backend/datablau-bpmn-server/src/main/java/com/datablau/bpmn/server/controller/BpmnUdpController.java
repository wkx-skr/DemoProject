package com.datablau.bpmn.server.controller;


import com.andorj.model.common.api.MessageService;
import com.datablau.bpmn.server.jpa.entity.BpmnUdp;
import com.datablau.bpmn.server.service.api.BpmnUdpService;
import com.datablau.data.common.controller.BaseController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/udps")
@Tag(name = "模型库UDP操作相关REST API", description = "模型库UDP操作相关REST API")
public class BpmnUdpController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(BpmnUdpController.class);

    @Autowired
    private BpmnUdpService bpmnUdpService;

    @Autowired
    private MessageService msgService;

    @GetMapping("/")
    @Operation(summary = "获取所有UDP", description = "获取所有UDP")
    public List<BpmnUdp> getAllUdps() {
        return bpmnUdpService.getAllUdps();
    }


    @RequestMapping(value = "/", method = RequestMethod.POST)
    @Operation(summary = "创建UDP", description = "创建UDP, valueType的可选值为STRING, INTEGER, DOUBLE, DATETIME, LONGTEXT, 需要有自定义属性的管理权限")
    public List<BpmnUdp> createUdp(@Parameter(description = "模型UDP对象", required = true) @RequestBody List<BpmnUdp> udp) {
        return bpmnUdpService.createUdpObject(udp);
    }


    @RequestMapping(value = "/save", method = RequestMethod.POST)
    @Operation(summary = "全量保存UDP", description = "全量保存UDP")
    public void saveAllUdp(@Parameter(description = "模型UDP对象", required = true) @RequestBody List<BpmnUdp> udp) {
       bpmnUdpService.saveAllUdp(udp);
    }


    @RequestMapping(value = "/delete", method = RequestMethod.DELETE)
    @Operation(summary = "删除UDP", description = "删除UDP, 需要有自定义属性的管理权限")
    public void deleteUdpById(@Parameter(description = "UDP IDS", required = true) @RequestBody List<Long> udpIds) {
        bpmnUdpService.deleteUdpObject(udpIds);
    }

}
