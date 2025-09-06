package com.datablau.ddd.server.controller;

import java.util.List;

import javax.validation.constraints.NotNull;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.andorj.model.common.api.MessageService;
import com.datablau.ddd.common.exception.BusinessException;
import com.datablau.ddd.data.dto.LayerRuleDto;
import com.datablau.ddd.data.dto.PageableResult;
import com.datablau.ddd.data.jpa.entity.LayerRule;
import com.datablau.ddd.server.service.api.LayerRuleService;
import io.swagger.v3.oas.annotations.Operation;

@RestController
public class LayerRuleController {

    @Autowired
    MessageService msgService;
    @Autowired
    LayerRuleService layerRuleService;

    @Operation(summary = "分页获取所有分层规范", description = "分页获取所有分层规范")
    @GetMapping("/layers")
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

    @Operation(summary = "根据id获取分层规范", description = "根据id获取分层规范")
    @GetMapping("/layer/{layerRuleId}")
    public LayerRule getLayerRule(@PathVariable(value = "layerRuleId") @NotNull Long layerRuleId) {
        LayerRule layerRule = layerRuleService.getLayerRuleById(layerRuleId);

        if (layerRule == null) {
            throw new BusinessException(msgService.getMessage("layerRuleNotExist"));
        }

        return layerRule;
    }

    @Operation(summary = "创建分层规范", description = "创建分层规范")
    @PostMapping("/layer")
    public LayerRule createLayerRule(@RequestBody @Validated LayerRuleDto layerRuleDto) {
        LayerRule layerRuleByName = layerRuleService.getLayerRuleByName(layerRuleDto.getName());
        LayerRule layerRuleByLayerId = layerRuleService.getLayerRuleByLayerId(layerRuleDto.getLayerId());

        if (layerRuleByName != null) {
            throw new BusinessException(msgService.getMessage("分层名称已经存在"));
        }

        if (layerRuleByLayerId != null) {
            throw new BusinessException(msgService.getMessage("分层ID已经存在"));
        }

        return layerRuleService.createLayerRule(layerRuleDto);
    }

    @Operation(summary = "更新分层规范", description = "更新分层规范")
    @PutMapping("/layer")
    public LayerRule updateLayerRule(@RequestBody @Validated LayerRuleDto layerRuleDto) {
        LayerRule layerRule = null;
        if (layerRuleDto.getId() != null) {
            layerRule = layerRuleService.getLayerRuleById(layerRuleDto.getId());
        }

        if (layerRule == null) {
            throw new BusinessException(msgService.getMessage("layerRuleNotExist"));
        }

        return layerRuleService.updateLayerRule(layerRule, layerRuleDto);
    }

    @Operation(summary = "删除分层规范", description = "删除分层规范")
    @DeleteMapping("/layer/{layerRuleId}")
    public void deleteLayerRule(@PathVariable(value = "layerRuleId") Long layerRuleId) {
        LayerRule layerRule = layerRuleService.getLayerRuleById(layerRuleId);

        if (layerRule == null) {
            throw new BusinessException(msgService.getMessage("projectNotExist"));
        }

        layerRuleService.deleteLayerRule(layerRule.getId());
    }

}
