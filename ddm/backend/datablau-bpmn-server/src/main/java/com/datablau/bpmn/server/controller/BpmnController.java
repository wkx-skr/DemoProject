package com.datablau.bpmn.server.controller;


import com.andorj.model.common.api.MessageService;
import com.datablau.bpmn.server.jpa.converter.ParsedModel;
import com.datablau.bpmn.server.jpa.dto.*;
import com.datablau.bpmn.server.jpa.entity.BpmnModel;
import com.datablau.bpmn.server.jpa.entity.BpmnVersion;
import com.datablau.bpmn.server.service.api.BpmnModelService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.security.management.exception.DatablauPermissionException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/editor")
@Tag(name = "Web编辑器使用的REST API", description = "Web编辑器使用的REST API")
public class BpmnController extends BaseController {


    @Autowired
    private BpmnModelService bpmnModelService;

    @Autowired
    private MessageService msgService;


    @RequestMapping("/")
    @Operation(summary = "获取模型的树形结构", description = "获取模型的树形结构")
    public ModelTreeNodeDto getModelTree() {
        return bpmnModelService.getModelTree(null);
    }


    @RequestMapping(value = "/", method = RequestMethod.POST)
    @Operation(summary = "web端创建一个模型", description = "web端创建一个模型")
    public BpmnModel createModel(
            @Parameter(description = "模型对象", required = true) @RequestBody CreateModelDto createModelRequest)
            throws Exception {
        return bpmnModelService.createWebModel(createModelRequest);
    }



    @RequestMapping("/{modelId}/direct/content/json")
    @Operation(summary = "获取模型和它的直接子元素", description = "获取模型和它的直接子元素，使用JSON返回，此API搭配/{modelId}/elements/{elementId}/content/json来实现延迟加载")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "versionId", description = "模型版本ID", in = ParameterIn.QUERY)})
    public ParsedModel getModelAndItsDirectChildrenContent(
            @RequestParam(value = "versionId", required = false) Long versionId,
            @PathVariable("modelId") Long modelId,
            @Parameter(description = "类型过滤器") @RequestParam(value = "typeFilter", required = false) Set<Long> filteredTypeIds,
            @Parameter(description = "key是否为typeId") @RequestParam(value = "longKey", defaultValue = "false") Boolean longKey)
            throws Exception {
        return bpmnModelService.getModelAndDirectChildrenJsonObject(modelId, versionId, filteredTypeIds, longKey);
    }



    @Operation(summary = "根据条件分页查询模型对象")
    @PostMapping("/modelObjects")
    public Page<BpmnModel> findArchyObjects(@RequestBody ObjectQueryDto objectQueryDto,
                                              @Parameter(description = "当前页，默认值是1") @RequestParam(name = "currentPage", required = false, defaultValue = "1") Integer currentPage,
                                              @Parameter(description = "页面大小") @RequestParam(name = "pageSize", required = false, defaultValue = "999999") Integer pageSize) {
        return bpmnModelService.findArchyObjects(objectQueryDto, currentPage, pageSize);
    }



    @RequestMapping(value = "/{modelId}/save", method = RequestMethod.PUT)
    @Operation(summary = "web端保存一个模型", description = "web端保存一个模型")
    public EditedResponseDto updateModel(
            @RequestBody SaveWebModelDto saveWebModelDto) throws Exception {

        return bpmnModelService.saveWebModel(saveWebModelDto);
    }



    @RequestMapping(value = "/{modelId}/versions", method = RequestMethod.POST)
    @Operation(summary = "创建模型的版本", description = "创建模型的版本, 自动把从上一个版本开始到目前所有的改动变成新的版本")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public BpmnVersion createModelVersion(@PathVariable("modelId") Long modelId, @RequestBody CreateModelVersionDto createModelVersionRequest) {
        createModelVersionRequest.setModelId(modelId);
        return bpmnModelService.createUserDefinedModelVersion(createModelVersionRequest);
    }


    @RequestMapping("/model/{modelId}")
    @Operation(summary = "获取一个模型信息", description = "获取一个模型信息")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true),
            @Parameter(name = "withPath", description = "是否带路径信息", in = ParameterIn.QUERY)})
    public BpmnModel getModel(@PathVariable("modelId") Long modelId,
                              @RequestParam(value = "withPath", defaultValue = "false") Boolean withPath) {

        BpmnModel model = bpmnModelService.getModelById(modelId);
        if (withPath) {
            ModelWithPath wp = new ModelWithPath(model);
            String fullPath = bpmnModelService.getModelPath(model.getCategoryId(), wp.getCategories(), "/" + model.getName());
            wp.setPath(bpmnModelService.getModelPath(modelId), fullPath);
            return wp;
        } else
            return model;

    }


    @RequestMapping(value = "/model/{modelId}", method = RequestMethod.DELETE)
    @Operation(summary = "删除指定的模型", description = "删除指定的模型")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public void deleteModel(@PathVariable("modelId") Long modelId) {
        bpmnModelService.permanentlyDeleteModel(modelId);
    }


    @RequestMapping(value = "/model/{modelId}", method = RequestMethod.PUT)
    @Operation(summary = "修改一个模型属性", description = "修改一个模型属性")
    @Parameters({
            @Parameter(name = "modelId", description = "模型ID", in = ParameterIn.PATH, required = true)})
    public BpmnModel modifyModel(@PathVariable("modelId") Long modelId,
                             @Parameter(description = "模型属性对象", required = true) @RequestBody BpmnModel model) {
            model.setId(modelId);
            return bpmnModelService.updateModel(model);
    }


    @RequestMapping(value = "/element/info", method = RequestMethod.POST)
    @Operation(summary = "获取bpmn流程数据属性", description = "获取bpmn流程数据属性")
    public DataProInfoDto elementDataInfo(@RequestBody DataProInfoDto dataProInfoDto) throws Exception {
        return bpmnModelService.elementDataInfo(dataProInfoDto);
    }


    @RequestMapping(value = "/{modelId}/lock", method = RequestMethod.PUT)
    @Operation(summary = "web端加锁", description = "web端加锁")
    public boolean sessionLock(@Parameter(description = "模型ID") @PathVariable("modelId") Long modelId) {
        bpmnModelService.sessionLock(modelId);
        return true;
    }


    @RequestMapping(value = "/{modelId}/unlock", method = RequestMethod.POST)
    @Operation(summary = "解锁指定的模型或分支", description = "解锁指定的模型或分支")
    public boolean stopHeart(@Parameter(description = "模型ID") @PathVariable("modelId") Long modelId) {
        return bpmnModelService.stopHeart(modelId);
    }


    @RequestMapping(value = "/{modelId}/heart", method = RequestMethod.PUT)
    @Operation(summary = "保持心跳", description = "保持心跳，一分钟一次，五分钟没接收到即解锁该模型")
    public boolean modelHeart(@Parameter(description = "模型ID") @PathVariable("modelId") Long modelId) {
        return bpmnModelService.keepHeart(modelId);
    }
}
