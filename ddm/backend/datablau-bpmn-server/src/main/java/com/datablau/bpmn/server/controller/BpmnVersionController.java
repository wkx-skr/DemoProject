package com.datablau.bpmn.server.controller;

import com.datablau.bpmn.server.jpa.entity.BpmnVersion;
import com.datablau.bpmn.server.service.api.BpmnVersionService;
import com.datablau.data.common.controller.BaseController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/version")
@Tag(name = "模型版本操作相关REST API", description = "模型版本操作相关REST API")
public class BpmnVersionController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(BpmnVersionController.class);

    @Autowired
    private BpmnVersionService bpmnVersionService;


    @PostMapping(value = "/update")
    @Operation(summary = "修改模型迁出版本的信息", description = "修改模型迁出版本的信息, 需要有模型的编辑管理权限")
    public BpmnVersion updateModelVersion(
            @Parameter(description = "是否为第一个记录") @RequestParam(name = "isFirst", defaultValue = "false") Boolean isFirst,
            @Parameter(description = "模型版本信息", required = true) @RequestBody BpmnVersion modelVersion) {
        return bpmnVersionService.updateModelVersion(isFirst, modelVersion);
    }
}
