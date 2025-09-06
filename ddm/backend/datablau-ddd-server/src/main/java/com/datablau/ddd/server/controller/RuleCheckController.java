package com.datablau.ddd.server.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.datablau.ddd.server.service.api.RuleCheckService;
import io.swagger.v3.oas.annotations.Operation;
/**
 * @author Lx
 * @version 1.0
 * @description: sql检查controller
 * @date 2023/6/6 14:33
 */
@RestController
@RequestMapping("/check")
public class RuleCheckController {

    @Autowired
    RuleCheckService ruleCheckService;

    @Operation(summary = "传入项目id，检查该项目下的sql", description = "传入项目id，检查该项目下的sql")
    @GetMapping("/startCheck/{projectId}/{policyId}")
    public String startCheck(@PathVariable(value = "projectId") Long projectId,
                             @PathVariable(value = "policyId") Long policyId) {
        return ruleCheckService.startCheck(projectId, policyId);
    }

    @Operation(summary = "传入项目id，查询检查结果", description = "传入项目id，查询检查结果")
    @GetMapping("/getResult/{projectId}")
    public Map<String, Object> getResult(@PathVariable(value = "projectId") Long projectId,
                                         @RequestParam Integer currentPage,
                                         @RequestParam Integer pageSize) {

        return ruleCheckService.getResult(projectId, currentPage, pageSize);
    }

}
