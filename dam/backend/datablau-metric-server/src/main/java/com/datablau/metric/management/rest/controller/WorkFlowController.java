package com.datablau.metric.management.rest.controller;

import com.datablau.metric.management.api.MetricProcessService;
import com.datablau.metric.management.dto.DomainDto;
import com.datablau.metric.management.dto.MetricAuthDto;
import com.datablau.metric.management.dto.StandardCodeDto;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @program: datablau-datastandard
 * @description: 数据标准服务涉及审批流 的请求
 * @author: wang tong
 * @create: 2023-07-21 17:06
 **/
@RestController
@RequestMapping("/flow")
@Tag(name = "数据标准服务涉及审批流的 REST API")
public class WorkFlowController extends BaseController {

    @Autowired
    private MetricProcessService workflowProcessService;

    /**
     * 申请发布
     * 数据标准
     * 指标标准
     * 领域数据标准
     */
    @PostMapping(value = "/domain/applyPublish")
    public void applyDomainPublish(@RequestBody List<String> domainIds) {
        for (String domainId : domainIds) {
            workflowProcessService.applyDomainPublish(domainId);
        }
    }

    /**
     * 申请变更
     * 数据标准
     * 指标标准
     * 领域数据标准
     */
    @PostMapping(value = "/domain/applyUpdate")
    public void applyDomainUpdate(@RequestBody DomainDto domainDto) {
        workflowProcessService.applyDomainUpdate(domainDto);
    }

    /**
     * 申请废弃
     * 数据标准
     * 指标标准
     * 领域数据标准
     */
    @PostMapping(value = "/domain/applyAbolish")
    public void applyDomainAbolish(@RequestBody List<String> domainIds) {
        for (String domainId : domainIds) {
            workflowProcessService.applyDomainAbolish(domainId);
        }
    }

    @PostMapping("/domain/applyAuth")
    public void applyDomainAuth(@RequestBody MetricAuthDto metricAuthDto) {
        workflowProcessService.applyDomainAuth(metricAuthDto);
    }

    /**
     * 查询流程申请详情，适用于单个标准的发布-变更-废弃
     *
     * @throws Exception e
     */
    @PostMapping(value = "/domain/getProcessDetail")
    public DomainDto getProcessDomainDetail(@Parameter(name = "domainId", description = "数据标准id")
                                            @RequestParam("domainId") String domainId,
                                            @Parameter(name = "processInstanceId", description = "流程实例")
                                            @RequestParam("processInstanceId") String processInstanceId) throws Exception {
        return workflowProcessService.getProcessDomainDetail(domainId, processInstanceId);
    }

    /**
     * 申请发布 标准代码、领域标准代码
     */
    @PostMapping(value = "/standard/applyPublish")
    public void applyStandardPublish(@RequestBody List<String> codes) {
        for (String id : codes) {
            workflowProcessService.applyStandardCodePublish(id);
        }
    }

    /**
     * 申请变更 标准代码、领域标准代码
     */
    @PostMapping(value = "/standard/applyUpdate")
    public void applyStandardUpdate(@RequestBody StandardCodeDto dto) {
        workflowProcessService.applyStandardCodeUpdate(dto);
    }

    /**
     * 申请废弃 标准代码、领域标准代码
     */
    @PostMapping(value = "/standard/applyAbolish")
    public void applyStandardAbolish(@RequestBody List<String> codes) {
        for (String id : codes) {
            workflowProcessService.applyStandardCodeAbolish(id);
        }
    }

}
