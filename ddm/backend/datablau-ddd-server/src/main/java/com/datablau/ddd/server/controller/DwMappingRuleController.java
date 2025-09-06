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
import com.datablau.ddd.data.dto.DwMappingRuleDto;
import com.datablau.ddd.data.dto.PageableResult;
import com.datablau.ddd.data.jpa.entity.DwMappingRule;
import com.datablau.ddd.server.service.api.DwMappingRuleService;
import io.swagger.v3.oas.annotations.Operation;

@RestController
public class DwMappingRuleController {

    @Autowired
    MessageService msgService;
    @Autowired
    DwMappingRuleService dwMappingRuleService;

    @Operation(summary = "分页获取所有映射规则", description = "分页获取所有映射规则")
    @GetMapping("/dwmapping")
    public PageableResult<DwMappingRule> getMappingRule(@RequestParam Integer currentPage,
                                                        @RequestParam Integer pageSize) {
        long total = dwMappingRuleService.getTotalNumber();
        List<DwMappingRule> layerRuleList = dwMappingRuleService.getAllDwMappingRules(currentPage, pageSize);
        PageableResult<DwMappingRule> pageableResult = new PageableResult<>();
        pageableResult.setTotalItems(total);
        pageableResult.setContent(layerRuleList);
        pageableResult.setCurrentPage(currentPage);
        pageableResult.setPageSize(pageSize);
        return pageableResult;
    }

    @Operation(summary = "根据类型获取映射规则", description = "根据类型获取映射规则")
    @GetMapping("/dwmapping/{dwMappingType}")
    public DwMappingRule getLayerRule(@PathVariable(value = "dwMappingType") @NotNull String dwMappingType) {
        DwMappingRule dwMappingRule = dwMappingRuleService.getDwMappingRuleByMappingType(dwMappingType);

        if (dwMappingRule == null) {
            throw new BusinessException(msgService.getMessage("dwMappingRuleNotExist"));
        }

        return dwMappingRule;
    }

    @Operation(summary = "创建映射规则", description = "创建映射规则")
    @PostMapping("/dwmapping")
    public DwMappingRule createLayerRule(@RequestBody @Validated DwMappingRuleDto dwMappingRuleDto) {
        DwMappingRule dwMappingRule =
                dwMappingRuleService.getDwMappingRuleByMappingType(dwMappingRuleDto.getMappingType());

        if (dwMappingRule != null) {
            throw new BusinessException(msgService.getMessage("映射规则已存在"));
        }

        return dwMappingRuleService.createDwMappingRule(dwMappingRuleDto);
    }

    @Operation(summary = "更新映射规则", description = "更新映射规则")
    @PutMapping("/dwmapping")
    public DwMappingRule updateDwMappingRule(@RequestBody @Validated DwMappingRuleDto dwMappingRuleDto) {
        DwMappingRule dwMappingRule =
                dwMappingRuleService.getDwMappingRuleByMappingType(dwMappingRuleDto.getMappingType());

        if (dwMappingRule == null) {
            throw new BusinessException(msgService.getMessage("DwMappingRuleNotExist"));
        }

        return dwMappingRuleService.updateDwMappingRule(dwMappingRule, dwMappingRuleDto);
    }

    @Operation(summary = "删除映射规则", description = "删除映射规则")
    @DeleteMapping("/dwmapping/{dwMappingType}")
    public void deleteDwMappingRule(@PathVariable(value = "dwMappingType") String dwMappingType) {
        DwMappingRule dwMappingRule = dwMappingRuleService.getDwMappingRuleByMappingType(dwMappingType);

        if (dwMappingRule == null) {
            throw new BusinessException(msgService.getMessage("映射规则不存在"));
        }

        dwMappingRuleService.deleteDwMappingRule(dwMappingRule.getId());
    }

}
