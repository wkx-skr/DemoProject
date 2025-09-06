package com.datablau.ddd.server.controller;

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

import com.andorj.model.common.api.MessageService;
import com.datablau.ddd.common.exception.BusinessException;
import com.datablau.ddd.data.dto.PageableResult;
import com.datablau.ddd.data.dto.rulecheck.ProgramRulePolicyDto;
import com.datablau.ddd.data.jpa.entity.ProgramRulePolicy;
import com.datablau.ddd.server.service.api.ProgramRulePolicyService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * @author 17805
 */
@Tag(name = "策略规则管理")
@RestController()
@RequestMapping("/policy")
public class PolicyManagementController {

    @Autowired
    private MessageService msgService;

    @Autowired
    private ProgramRulePolicyService policyRuleService;

    @Operation(summary = "获取策略管理列表", description = "获取策略管理列表")
    @GetMapping("/list")
    public PageableResult<ProgramRulePolicy> getPolicyList(
                                                           @RequestParam(value = "currentPage", required = false) Integer currentPage,
                                                           @RequestParam(value = "pageSize", required = false) Integer pageSize) {
        return policyRuleService.getList(currentPage, pageSize);
    }

    @Operation(summary = "获取策略管理信息", description = "获取策略管理信息")
    @GetMapping("/{id}")
    public ProgramRulePolicyDto getPolityInfo(@PathVariable("id") Long id) {
        return policyRuleService.getPolityInfo(id);
    }

    @Operation(summary = "删除策略管理", description = "删除策略管理")
    @DeleteMapping("/deletePolicy")
    public void deletePolicy(@RequestParam("id") Long id) {
        ProgramRulePolicy programRulePolicy = policyRuleService.getById(id);
        if (programRulePolicy == null) {
            throw new BusinessException(msgService.getMessage("删除失败，该策略不存在！"));
        }
        policyRuleService.deletePolicy(id);
    }

    @Operation(summary = "新增策略管理", description = "新增策略管理")
    @PostMapping("/addPolicy")
    public ProgramRulePolicy addPolity(@RequestBody ProgramRulePolicyDto policy) {
        ProgramRulePolicy programPolicy = policyRuleService.getByNme(policy.getPolicyName());
        if (programPolicy != null) {
            throw new BusinessException("添加失败，策略名已存在！");
        }
        return policyRuleService.addPolity(policy);
    }

    @Operation(summary = "修改策略管理", description = "修改策略管理")
    @PutMapping("/putPolicy")
    public ProgramRulePolicy putPolity(@RequestBody ProgramRulePolicyDto policy) {
        ProgramRulePolicy policyById = policyRuleService.getById(policy.getId());
        if (policyById == null) {
            throw new BusinessException("修改失败，策略不存在！");
        }

        ProgramRulePolicy policyByName = policyRuleService.getByNme(policy.getPolicyName());
        if (policyByName != null) {
            throw new BusinessException("添加失败，策略名已存在！");
        }

        return policyRuleService.putPolity(policy);
    }

}
