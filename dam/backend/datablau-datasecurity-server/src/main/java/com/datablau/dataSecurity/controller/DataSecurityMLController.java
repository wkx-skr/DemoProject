package com.datablau.dataSecurity.controller;

import com.andorj.model.common.utility.BeanHelper;
import com.datablau.aic.ml.api.RemoteSynonymService;
import com.datablau.common.utils.IpUtil;
import com.datablau.data.common.controller.BaseController;
import com.datablau.dataAccess.dto.ResResultDto;
import com.datablau.dataAccess.utility.ServerConstants;
import com.datablau.dataSecurity.dto.MlResultDto;
import com.datablau.dataSecurity.service.api.DataSecurityDiscernRuleService;
import com.datablau.dataSecurity.utils.DDSKafkaLogUtil;
import com.datablau.security.management.api.RoleService;
import com.google.common.collect.Lists;
import io.swagger.v3.oas.annotations.Operation;
import java.util.List;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @Author: leipengfei
 * @CreateTime: 2023-01-18  14:59
 * @Description: 机器学习算法
 */
@RestController
@RequestMapping(value = "/datasecurity/ml")
public class DataSecurityMLController extends BaseController {
    @Autowired
    private DataSecurityDiscernRuleService ruleService;

    private RemoteSynonymService synonymService;

    @Autowired
    private DDSKafkaLogUtil logUtils;

    private RemoteSynonymService getSynonymService() {
        if (synonymService == null) {
            synonymService = (RemoteSynonymService) BeanHelper.getBeanByName("synonymService");
        }
        return synonymService;
    }

    public DataSecurityMLController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "牛刀小试")
    @GetMapping(value = "/mlcalresult")
    public ResResultDto<List<MlResultDto>> mlCalResult(String seq) {
        logUtils.getMlAlgorithm(getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        if (StringUtils.isBlank(seq)) {
            return ResResultDto.ok(Lists.newArrayList());
        }
        List<MlResultDto> data = ruleService.mlCalResult(seq);
        return ResResultDto.ok(data);
    }

    @Operation(summary = "词汇量")
    @GetMapping(value = "/getwordnumber")
    public ResResultDto<Integer> getWordNumber() {
        return ResResultDto.ok(getSynonymService().getWordNumber());
    }


    @Operation(summary = "机器学习服务探针")
    @GetMapping(value = "/enable")
    public ResResultDto<Boolean> needle() {
        try {
            getSynonymService().getWordNumber();
            return ResResultDto.ok(true);
        } catch (Exception e) {
            return ResResultDto.ok(false);
        }
    }
}
