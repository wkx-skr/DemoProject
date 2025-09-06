package com.datablau.model.server.controller;

import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.api.ModelPhaseService;
import com.datablau.model.data.jpa.entity.ModelPhase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
/**
 * Create by: lijing.
 * Create time: 2021/11/25 17:20.
 */

@RestController("modelPhaseController")
@ConditionalOnMissingBean(name = "modelPhaseControllerExt")
@RequestMapping("/phases")
@Tag(name = "自定义模型发布状态相关 API", description = "自定义模型发布状态相关 API")
public class ModelPhaseController extends BaseController {
    @Autowired
    ModelPhaseService modelPhaseService;

    @RequestMapping("/")
    @Operation(summary = "获取所有发布状态", description = "获取所有发布状态")
    public List<ModelPhase> getAllPhases() {
        return modelPhaseService.getAllModelPhases();
    }

    @RequestMapping(value = "/", method = RequestMethod.POST)
    @Operation(summary = "创建发布状态", description = "创建发布状态, 需要有自定义状态的管理权限")
    public ModelPhase createModelPhase(@Parameter(description = "模型发布状态", required = true) @RequestBody ModelPhase modelPhase) {
        return modelPhaseService.createModelPhase(modelPhase);
    }


    @RequestMapping(value = "/update", method = RequestMethod.PUT)
    @Operation(summary = "修改模型发布状态", description = "修改模型发布状态, 需要有自定义状态的管理权限")
    @Parameters({@Parameter(name = "modelPhaseId", description = "Model Phase ID", in = ParameterIn.QUERY, required = true)})
    public ModelPhase updateModelPhase(@RequestParam(value = "modelPhaseId") Long modelPhaseId,
                                       @Parameter(description = "模型发布状态", required = true) @RequestBody ModelPhase modelPhase) {
        return modelPhaseService.updateModelPhase(modelPhase);
    }

    @RequestMapping(value = "/delete", method = RequestMethod.DELETE)
    @Operation(summary = "删除一个发布状态", description = "删除一个发布状态, 需要有自定义状态的管理权限")
    @Parameters({@Parameter(name = "modelPhaseId", description = "Model Phase ID", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "doDeleted", description = "Delete Model Phase whatever it is used or not", in = ParameterIn.QUERY)})
    public String deleteModelPhaseById(@RequestParam(value = "modelPhaseId") Long modelPhaseId,
                                       @RequestParam(value = "doDeleted", defaultValue = "false") Boolean doDeleted) {
        return modelPhaseService.deleteModelPhase(modelPhaseId, doDeleted);
    }

    @RequestMapping(value = "/forbidden", method = RequestMethod.PUT)
    @Operation(summary = "禁用内建发布状态设置", description = "禁用内建发布状态设置, 需要有自定义状态的管理权限")
    @Parameters({@Parameter(name = "modelPhaseId", description = "Model Phase ID", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "Forbidden", description = "Forbid or Unforbid Model Phase", in = ParameterIn.QUERY, required = true)})
    public void forbidBuildInModelPhase(@RequestParam(value = "modelPhaseId") Long modelPhaseId,
                                        @RequestParam(value = "Forbidden") Boolean forbidden) {
        modelPhaseService.forbidModelPhase(modelPhaseId, forbidden);
    }

    @RequestMapping(value = "/set", method = RequestMethod.PUT)
    @Operation(summary = "设置模型发布状态", description = "设置模型发布状态")
    @Parameters({@Parameter(name = "modelPhaseCode", description = "Model Phase Code", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "modelId", description = "Model ID", in = ParameterIn.QUERY, required = true)})
    public void setModelPhaseOnModel(@RequestParam(value = "modelPhaseCode") Integer modelPhaseCode,
                                     @RequestParam(value = "modelId") Long modelId) {
        modelPhaseService.setModelPhaseToModel(modelPhaseCode, modelId);
    }
}
