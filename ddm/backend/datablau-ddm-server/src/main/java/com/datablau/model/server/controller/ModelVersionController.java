package com.datablau.model.server.controller;

import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.api.ModelVersionService;
import com.datablau.model.data.jpa.entity.ModelVersion;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController("modelVersionController")
@ConditionalOnMissingBean(name = "modelVersionControllerExt")
@RequestMapping("/version")
@Tag(name = "模型版本操作相关REST API", description = "模型版本操作相关REST API")
public class ModelVersionController extends BaseController {
    protected static final Logger logger = LoggerFactory.getLogger(ModelVersionController.class);

    @Autowired
    protected ModelVersionService modelVersionService;


    @PostMapping(value = "/update")
    @Operation(summary = "修改模型迁出版本的信息", description = "修改模型迁出版本的信息, 需要有模型的编辑管理权限")
    public ModelVersion updateModelVersion(
            @Parameter(description = "是否为第一个记录") @RequestParam(name = "isFirst", defaultValue = "false") Boolean isFirst,
            @Parameter(description = "模型版本信息", required = true) @RequestBody ModelVersion modelVersion) {
        return modelVersionService.updateModelVersion(isFirst, modelVersion);
    }
}