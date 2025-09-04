package com.datablau.domain.management.controller;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.datablau.domain.management.constants.DomainCheckState;
import com.datablau.domain.management.dto.DomainDto;
import com.datablau.domain.management.dto.DomainExtDto;
import com.datablau.domain.management.dto.StandardCodeDto;
import com.datablau.domain.management.impl.DomainExtServiceImpl;
import com.datablau.domain.management.impl.DomainProcessServiceExt;
import com.datablau.domain.management.impl.DomainServiceImpl;
import com.datablau.domain.management.jpa.entity.Domain;
import com.google.common.collect.Sets;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
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
public class WorkFlowController extends BaseController {

    @Autowired
    private DomainProcessServiceExt workflowProcessService;

    @Autowired
    private DomainExtServiceImpl domainExtService;

    @Autowired
    private DomainServiceImpl domainService;

    /**
     * 申请发布
     * 数据标准
     * 指标标准
     * 领域数据标准
     */
    @PostMapping(value = "/domain/applyPublish")
    public void applyDomainPublish(@RequestBody List<String> domainIds) {
     //   for (String domainId : domainIds) {

            workflowProcessService.applyDomainPublishBatch(domainIds,getCurrentUser());
      //  }
    }

    /**
     * 申请变更
     * 数据标准
     * 指标标准
     * 领域数据标准
     */
    @PostMapping(value = "/domain/applyUpdate")
    public void applyDomainUpdate(@RequestBody DomainExtDto domainDto) {
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
       // for (String domainId : domainIds) {
        //todo
            workflowProcessService.applyDomainAbolishBatch(domainIds,getCurrentUser());
       // }
    }

    /**
     * 查询流程申请详情，适用于单个标准的发布-变更-废弃
     *
     * @throws Exception e
     */
    @PostMapping(value = "/domain/getProcessDetail")
    public DomainDto getProcessDomainDetail(@Parameter(name = "domainId", description = "数据标准id")
                                            @RequestParam(value = "domainId", required = false) String domainId,
                                            @Parameter(name = "processInstanceId", description = "流程实例")
                                            @RequestParam("processInstanceId") String processInstanceId) throws Exception {
        return workflowProcessService.getProcessDomainDetail(domainId, processInstanceId);
    }

    /**
     * 申请发布 标准代码、领域标准代码
     */
    @PostMapping(value = "/standard/applyPublish")
    public void applyStandardPublish(@RequestBody List<String> codes) {

        Set<String> codeSet = codes.stream().collect(Collectors.toSet());
        List<DomainExtDto> domains = domainExtService.findDomainExtDtosByCodes(codeSet);
        if(codeSet.size() != domains.size()) {
            throw new InvalidArgumentException("部分标准找不到关联的参考数据");
        }
        if(domains.stream().filter(v -> DomainCheckState.uncheckOrUnpassOrNull(v.getCheckState())).findFirst().isPresent()) {
            throw new InvalidArgumentException("部分标准未通过相似度检查");
        }
        List<String> domainIds = domains.stream().map(DomainExtDto::getDomainId).collect(Collectors.toList());
//        for (String code : codeSet) {
//            String domainId = domains.stream().filter(v -> v.getReferenceCode().equals(code)).findFirst().get().getDomainId();
//            workflowProcessService.applyStandardCodePublish(domainId, code);
//        }
        workflowProcessService.applyDomainPublishBatch(domainIds,getCurrentUser());
    }

    /**
     * 申请变更 标准代码、领域标准代码
     */
    @PostMapping(value = "/standard/applyUpdate")
    public void applyStandardUpdate(@RequestBody StandardCodeDto dto) {
        HashSet<String> codeSet = Sets.newHashSet(dto.getCode());
        List<Domain> domains = domainExtService.findDomainsByCodes(codeSet);
        if(codeSet.size() != domains.size()) {
            if(domains.stream().filter(v -> v.getCopyDomain()).findFirst().isPresent()) {
                throw new InvalidArgumentException("数据标准正在审批中");
            }
            throw new InvalidArgumentException("部分标准找不到关联的参考数据");
        }
        workflowProcessService.applyStandardCodeUpdate(domains.get(0).getDomainId(), dto);
    }

    /**
     * 申请废弃 标准代码、领域标准代码
     */
    @PostMapping(value = "/standard/applyAbolish")
    public void applyStandardAbolish(@RequestBody List<String> codes) {
        Set<String> codeSet = codes.stream().collect(Collectors.toSet());
        List<Domain> domains = domainExtService.findDomainsByCodes(codeSet);
        if(codeSet.size() != domains.size()) {
            if(domains.stream().filter(v -> v.getCopyDomain()).findFirst().isPresent()) {
                throw new InvalidArgumentException("数据标准正在审批中");
            }
            throw new InvalidArgumentException("部分标准找不到关联的参考数据");
        }
//        for (String code : codeSet) {
//            workflowProcessService.applyStandardCodeAbolish(domains.stream().filter(v -> v.getReferenceCode().equals(code)).findFirst().get().getDomainId(), code);
//        }
        List<String> domainIds = domains.stream().map(Domain::getDomainId).collect(Collectors.toList());
        workflowProcessService.applyDomainAbolishBatch(domainIds,getCurrentUser());
    }

    /**
     * 查询流程申请详情，适用于单个标准代码、领域标准代码的发布-变更-废弃
     *
     * @throws Exception e
     */
    @PostMapping(value = "/standard/getProcessDetail")
    public StandardCodeDto getProcessStandardDetail(@Parameter(name = "code", description = "标准代码code")
                                                    @RequestParam(value = "code",required = false) String code,
                                                    @Parameter(name = "processInstanceId", description = "流程实例")
                                                    @RequestParam("processInstanceId") String processInstanceId) throws Exception {
        return workflowProcessService.getProcessStandardDetail(code, processInstanceId);
    }


    /**
     * 根据processInstanceId 查询当前审批流中的标准或者指标等 id
     */
    @PostMapping(value = "/getIdByProcessInstanceId")
    public String getIdByProcessInstanceId(@Parameter(name = "processInstanceId", description = "流程实例")
                                           @RequestParam("processInstanceId") String processInstanceId) {
        return workflowProcessService.getIdByProcessInstanceId(processInstanceId);
    }



    /**
     * 根据processInstanceId 查询当前审批流中的标准或者指标等 id
     */
    @GetMapping(value = "/deleteCopyDomainById")
    public void deleteCopyDomainById(@RequestParam(name = "domainId") String domainId) {
        domainService.deleteCopyDomain(domainId, true, getCurrentUser());
    }


}
