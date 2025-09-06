package com.datablau.ddd.server.controller;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.andorj.common.data.PageResult;
import com.datablau.ddd.data.dto.PageableResult;
import com.datablau.ddd.data.dto.ProgramGrammarRuleDto;
import com.datablau.ddd.data.dto.rulecheck.ProgramRuleDto;
import com.datablau.ddd.data.dto.rulecheck.ProgramRuleQueryDto;
import com.datablau.ddd.data.jpa.entity.ProgramGrammarRule;
import com.datablau.ddd.data.jpa.entity.ProgramRule;
import com.datablau.ddd.server.service.api.RuleManagementService;
import com.datablau.ddd.server.service.impl.ProgramGrammarRuleServiceImpl;
import io.swagger.v3.oas.annotations.Operation;

/**
 * 规则、策略管理
 * @author Lx
 */
@RestController
@RequestMapping("/ruleManagement")
public class RuleManagementController {

    @Autowired
    private RuleManagementService ruleManagementService;

    @Autowired
    private ProgramGrammarRuleServiceImpl grammarRuleService;

    @Operation(summary = "保存规则", description = "保存规则")
    @PostMapping("/rule")
    public ProgramRule saveRule(@RequestBody ProgramRuleDto checkRule) {
        return ruleManagementService.saveRule(checkRule);
    }

    @Operation(summary = "修改规则", description = "修改规则")
    @PutMapping("/rule")
    public ProgramRuleDto updateRule(@RequestBody ProgramRuleDto checkRule) {
        return ruleManagementService.updateRule(checkRule);
    }

    @Operation(summary = "删除规则", description = "删除规则")
    @DeleteMapping("/rule/{ruleId}")
    public void deleteRule(@PathVariable Long ruleId) {
        ruleManagementService.deleteRule(ruleId);
    }

    @Operation(summary = "查询一条规则", description = "查询一条规则")
    @GetMapping("/rule/{ruleId}")
    public List<ProgramRuleDto> getRuleById(@PathVariable Long ruleId) {

        return ruleManagementService.getRuleByIds(Collections.singletonList(ruleId));

    }

    @Operation(summary = "分页条件查询", description = "分页条件查询")
    @PostMapping("/rule/getAllRules")
    public PageResult<ProgramRuleDto> getAllRules(@RequestBody ProgramRuleQueryDto queryDto) {
        return ruleManagementService.getAllRules(queryDto);
    }

    @Operation(summary = "查询所有语法规则", description = "查询所有语法规则")
    @GetMapping("/grammarRule/getAllGrammarRules")
    public PageableResult<ProgramGrammarRule> getAllGrammarRules(@RequestParam(value = "currentPage") Integer currentPage,
                                                                 @RequestParam(value = "pageSize") Integer pageSize) {
        return grammarRuleService.getGrammarRuleList(currentPage, pageSize);

    }

    @Operation(summary = "更新语法规则信息", description = "更新语法规则信息")
    @GetMapping("/grammarRule/updateGrammarRule")
    public ProgramGrammarRule updateGrammarRule(@RequestBody ProgramGrammarRuleDto grammarRuleDto) {
        return grammarRuleService.updateGrammarRule(grammarRuleDto);

    }

}
