package com.datablau.domain.management.controller;

import com.datablau.domain.management.api.BusinessTermProcessService;
import com.datablau.domain.management.dto.BusinessTermDto;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @program: datablau-datastandard
 * @description: 数据标准服务涉及审批流 的请求
 * @author: wang tong
 * @create: 2023-07-21 17:06
 **/
@RestController
@RequestMapping("/flow")
@Tag(name = "数据标准服务涉及审批流的 REST API")
public class BusinessTermWorkFlowController extends BaseController {

    @Autowired
    private BusinessTermProcessService businessTermProcessService;

    /**
     * 申请发布
     * 数据标准
     * 指标标准
     * 领域数据标准
     */
    @PostMapping(value = "/businessTerm/applyPublish")
    public void applyDomainPublish(@RequestBody Set<Long> businessTermIds) {
        // 由于 批次名称按照 数据的一级目录进行区分，所以要分组，因此这里不适合for来进行
//        for (Long id : businessTermIds) {
//            businessTermProcessService.applyBusinessTermPublish(id, getCurrentUser());
//        }
        businessTermProcessService.applyBusinessTermPublishBatch(businessTermIds,getCurrentUser());
    }

    /**
     * 申请变更
     * 数据标准
     * 指标标准
     * 领域数据标准
     */
    @PostMapping(value = "/businessTerm/applyUpdate")
    public void applyDomainUpdate(@RequestBody List<BusinessTermDto> businessTermDtos) {
        Map<Long, BusinessTermDto> collect = businessTermDtos.stream().collect(Collectors.toMap(v -> v.getId(), v -> v));
        for (BusinessTermDto dto : collect.values()) {
            businessTermProcessService.applyBusinessTermUpdate(dto,getCurrentUser());
        }
    }

    /**
     * 申请废弃
     * 数据标准
     * 指标标准
     * 领域数据标准
     */
    @PostMapping(value = "/businessTerm/applyAbolish")
    public void applyDomainAbolish(@RequestBody Set<Long> businessTermIds) {
   //     for (Long domainId : businessTermIds) {
        businessTermProcessService.applyBusinessTermAbolishBatch(businessTermIds,getCurrentUser());
    //    }
    }




    /**
     * 查询流程申请详情，适用于单个标准的发布-变更-废弃
     *
     * @throws Exception e
     */
    @PostMapping(value = "/businessTerm/getProcessDetail")
    public BusinessTermDto getProcessDomainDetail(@Parameter(name = "domainId", description = "数据标准id")
                                            @RequestParam(value = "domainId", required = false) Long domainId,
                                            @Parameter(name = "processInstanceId", description = "流程实例")
                                            @RequestParam("processInstanceId") String processInstanceId) throws Exception {
        return businessTermProcessService.getProcessBusinessTermDtoDetail(domainId, processInstanceId);
    }
}
