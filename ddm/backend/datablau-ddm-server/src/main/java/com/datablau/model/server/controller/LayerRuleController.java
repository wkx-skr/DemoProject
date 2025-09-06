package com.datablau.model.server.controller;

import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.model.common.api.MessageService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.api.LayerRuleService;
import com.datablau.model.data.api.WebModelExcelService;
import com.datablau.model.data.dto.*;
import com.datablau.model.data.jpa.entity.LayerRule;
import com.datablau.model.data.jpa.entity.Model;
import com.datablau.model.data.model.enums.CommonRelationMappingEnum;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.validation.constraints.NotNull;
import java.io.File;
import java.net.URLEncoder;
import java.util.List;

/**
 * @author qingminyan
 */
@RestController
@RequestMapping(value = "/layer")
public class LayerRuleController extends BaseController {
    protected static final Logger logger = LoggerFactory.getLogger(LayerRuleController.class);

    @Resource
    MessageService msgService;
    @Resource
    LayerRuleService layerRuleService;
    @Resource
    WebModelExcelService webModelExcelService;

    /**
     * 初始化分层
     */
    @Operation(summary = "初始化分层", description = "初始化分层")
    @PutMapping("/init")
    public void initLayer() {
        layerRuleService.initLayerRule();
    }


    /**
     * 分页获取所有分层规范
     *
     * @param currentPage 页码
     * @param pageSize    个数
     * @return page
     */
    @Operation(summary = "分页获取所有分层规范", description = "分页获取所有分层规范")
    @GetMapping("/page")
    public PageableResult<LayerRule> getAllLayerRules(@RequestParam Integer currentPage,
                                                      @RequestParam Integer pageSize) {
        long total = layerRuleService.getTotalNumber();
        List<LayerRule> layerRuleList = layerRuleService.getAllLayerRules(currentPage, pageSize);
        PageableResult<LayerRule> pageableResult = new PageableResult<>();
        pageableResult.setTotalItems(total);
        pageableResult.setContent(layerRuleList);
        pageableResult.setCurrentPage(currentPage);
        pageableResult.setPageSize(pageSize);
        return pageableResult;
    }


    /**
     * 分层树
     *
     * @return 根节点
     */
    @Operation(summary = "分层树", description = "分层树")
    @GetMapping("/tree")
    public LayerRuleDto getLayerTree() {
        return layerRuleService.getTree();
    }


    /**
     * 根据id获取分层规范
     *
     * @param layerRuleId id
     * @return LayerRule
     */
    @Operation(summary = "根据id获取分层规范", description = "根据id获取分层规范")
    @GetMapping("/{layerRuleId}")
    public LayerRule getLayerRule(@PathVariable(value = "layerRuleId") @NotNull Long layerRuleId) {
        LayerRule layerRule = layerRuleService.getLayerRuleById(layerRuleId);

        if (layerRule == null) {
            throw new IllegalArgumentException(msgService.getMessage("layerRuleNotExist"));
        }

        return layerRule;
    }

    /**
     * 根据parentId获取分层规范
     *
     * @param layerRuleParentId parentId
     * @return list
     */
    @Operation(summary = "根据parentId获取分层规范", description = "根据parentId获取分层规范")
    @GetMapping("/parent/{layerRuleParentId}")
    public List<LayerRule> getLayerRuleByParentId(@PathVariable(value = "layerRuleParentId") @NotNull Long layerRuleParentId) {
        return layerRuleService.getLayerRuleByParentId(layerRuleParentId);
    }

    /**
     * 获取分层已经绑定的模型列表
     *
     * @return IdList
     */
    @Operation(summary = "获取分层已经绑定的模型列表", description = "获取分层已经绑定的模型列表")
    @GetMapping("/model/filter")
    public List<Long> getLayerRuleByParentId() {
        return layerRuleService.filterModelList();
    }


    @Operation(summary = "获取模型列表", description = "获取模型列表")
    @GetMapping("/model/list/all")
    public List<Model> getLayerModelList() {
        return layerRuleService.getAllLayerModels();
    }

    /**
     * 创建分层规范
     *
     * @param layerRuleDto dto
     * @return dto
     */
    @Operation(summary = "创建分层规范", description = "创建分层规范")
    @PostMapping
    public LayerRule createLayerRule(@RequestBody @Validated LayerRuleDto layerRuleDto) {
        LayerRule layerRuleByName = layerRuleService.getLayerRuleByName(layerRuleDto.getName());

        if (layerRuleByName != null) {
            throw new IllegalArgumentException(msgService.getMessage("分层名称已经存在"));
        }

        if (layerRuleDto.getAlias() != null) {
            LayerRule layerRuleByAlias = layerRuleService.getLayerRuleByAlias(layerRuleDto.getAlias());
            if (layerRuleByAlias != null) {
                throw new IllegalArgumentException(msgService.getMessage("英文简称已经存在"));
            }
        }
        return layerRuleService.createLayerRule(layerRuleDto);
    }

    /**
     * 更新分层规范
     *
     * @param layerRuleDto dto
     * @return dto
     */
    @Operation(summary = "更新分层规范", description = "更新分层规范")
    @PutMapping
    public LayerRule updateLayerRule(@RequestBody @Validated LayerRuleDto layerRuleDto) {
        return layerRuleService.updateLayerRule(layerRuleDto);
    }


    /**
     * 删除分层规范
     *
     * @param layerRuleId id
     */
    @Operation(summary = "删除分层规范", description = "删除分层规范")
    @DeleteMapping("/{layerRuleId}")
    public void deleteLayerRule(@PathVariable(value = "layerRuleId") Long layerRuleId) {
        layerRuleService.deleteLayerRule(layerRuleId);
    }

    /**
     * 解绑分层绑定的主题
     *
     * @param layerRuleId 分层ID
     * @param subjectId   主题ID
     */
    @Operation(summary = "解绑分层绑定的主题", description = "删除分层规范")
    @DeleteMapping("/{layerRuleId}/{subjectId}")
    public void unBindSubject(@PathVariable(value = "layerRuleId") Long layerRuleId, @PathVariable(value = "subjectId") Long subjectId) {
        layerRuleService.unBindCommonRelations(layerRuleId, subjectId, CommonRelationMappingEnum.LAYER_RULE_TO_THEME);
    }


    /**
     * 获取分层下的主题
     *
     * @param layerRuleId 分层ID
     */
    @Operation(summary = "获取分层下的主题", description = "获取分层下的主题")
    @GetMapping("/{layerRuleId}/subjects")
    public List<SubjectDto> getSubjects(@PathVariable(value = "layerRuleId") Long layerRuleId) {

        return layerRuleService.getSubjects(layerRuleId);
    }

    /**
     * 获取分层下的表
     *
     * @param layerRuleId 分层ID
     */
    @Operation(summary = "获取分层下的表", description = "获取分层下的表")
    @GetMapping("/{layerRuleId}/tables")
    public List<TableRefDto> getTables(@PathVariable(value = "layerRuleId") Long layerRuleId) {
        return layerRuleService.getTables(layerRuleId);
    }

    /**
     * 获取DW模型下，所有表对应分层、主题、实体模版的绑定关系
     *
     * @param modelId 模型ID
     * @return list
     */
    @GetMapping("/{modelId}/dw/tables/relation")
    public List<TableRelationDto> getDwTablesRelation(@PathVariable Long modelId) {
        return layerRuleService.getModelSubTablesRelation(modelId);
    }

    /**
     * 获取DW模型下，获取表对应分层、主题、实体模版的绑定关系
     *
     * @param modelId 模型ID
     * @param tableId 表ID
     * @return list
     */
    @GetMapping("/{modelId}/dw/table/{tableId}/relation")
    public TableRelationDto getDwTableRelation(@PathVariable Long modelId, @PathVariable Long tableId) {
        return layerRuleService.getTablesRelation(modelId, tableId);
    }

    @RequestMapping(value = "/models/{modelId}/save", method = RequestMethod.PUT)
    @Operation(summary = "web端保存一个模型", description = "web端保存一个模型")
    public EditedResponseDto updateModel(
            @RequestBody SaveWebModelJsonDto saveWebModelDto) throws Exception {
        return layerRuleService.updateModel(saveWebModelDto);
    }

    @RequestMapping(value = "/models/{modelId}/tables/{tableId}", method = RequestMethod.DELETE)
    @Operation(summary = "删除一个实体", description = "删除一个实体，包括表，视图，业务对象")
    public EditedElementDto deleteTable(
            @Parameter(description = "模型ID") @PathVariable("modelId") Long modelId,
            @Parameter(description = "自增版本号") @RequestParam("ver") Long ver,
            @Parameter(description = "表的ID") @PathVariable("tableId") Long tableId) {

        return layerRuleService.deleteTable(modelId, ver, tableId);
    }

    @RequestMapping(value = "/{modelId}/{tableId}/lock", method = RequestMethod.PUT)
    @Operation(summary = "web端表加锁", description = "web端表加锁")
    public boolean sessionLock(@Parameter(description = "模型ID") @PathVariable("modelId") Long modelId,
                               @Parameter(description = "表ID") @PathVariable("tableId") Long tableId) {
        return layerRuleService.sessionLockOnTable(modelId, tableId);
    }

    @RequestMapping(value = "/{modelId}/{tableId}/heart", method = RequestMethod.PUT)
    @Operation(summary = "保持心跳", description = "保持心跳，一分钟一次，五分钟没接收到即解锁该表")
    public boolean modelHeart(@Parameter(description = "模型ID") @PathVariable("modelId") Long modelId,
                              @Parameter(description = "表ID") @PathVariable("tableId") Long tableId) {
        return layerRuleService.keepHeart(modelId, tableId);
    }

    @RequestMapping(value = "/{modelId}/{tableId}/unlock", method = RequestMethod.POST)
    @Operation(summary = "解锁指定的表", description = "解锁指定的表")
    public boolean stopHeart(@Parameter(description = "模型ID") @PathVariable("modelId") Long modelId,
                             @Parameter(description = "表ID") @PathVariable("tableId") Long tableId) {
        return layerRuleService.stopHeart(modelId, tableId);
    }

    @RequestMapping(value = "/export/{modelId}", method = RequestMethod.POST)
    @Operation(summary = "文件导出", description = "文件导出")
    public ResponseEntity<byte[]> export(@Parameter(description = "模型ID") @PathVariable("modelId") Long modelId,
                                         @RequestBody ExportOptionsDto optionsDto) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        File file = webModelExcelService.webModelExport(modelId, null, optionsDto);
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        String realName = file.getName();
        try {
            realName = URLEncoder.encode(realName, "UTF-8");
            realName = realName.replace("+", "%20");
        } catch (Exception ex) {
            logger.warn("Failed to convert template file name");
        }
        headers.setContentDispositionFormData("attachment", realName);

        ResponseEntity<byte[]> result;
        try {
            result = new ResponseEntity<>(FileUtils.readFileToByteArray(file), headers,
                    HttpStatus.OK);
        } catch (Exception e) {
            throw new AndorjRuntimeException("failed to export file");
        }
        return result;
    }

    @RequestMapping(value = "/option/export/{modelId}", method = RequestMethod.GET)
    @Operation(summary = "获取文件导出选项", description = "获取文件导出选项")
    public ExportOptionsDto exportOptions(@Parameter(description = "模型ID") @PathVariable("modelId") Long modelId) throws Exception {
        return webModelExcelService.exportOptions(modelId);
    }

    @RequestMapping(value = "/unbind/{modelId}/table", method = RequestMethod.GET)
    @Operation(summary = "获取可以从数据模型同步的表", description = "获取可以从数据模型同步的表")
    public List<TableRefDto> getModelUnBindTables(@Parameter(description = "模型ID") @PathVariable("modelId") Long modelId) {
        return layerRuleService.getModelUnBindTables(modelId);
    }

    @RequestMapping(value = "/bind/tables", method = RequestMethod.PUT)
    @Operation(summary = "分层绑定表", description = "分层绑定表")
    public void bindModelTables(@RequestBody LayerBindTableDto dto) {
        layerRuleService.bindModelTables(dto);
    }

}

