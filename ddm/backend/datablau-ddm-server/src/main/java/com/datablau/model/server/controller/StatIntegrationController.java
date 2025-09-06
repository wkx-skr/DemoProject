package com.datablau.model.server.controller;

import com.datablau.model.data.security.UserRights;
import com.datablau.model.server.dto.StatIntegrationDto;
import com.datablau.model.server.service.api.StatIntegrationService;
import com.datablau.model.server.task.StatLicTask;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import com.datablau.data.common.controller.BaseController;
/**
 * @author wgao TASK#853
 */

@RestController("statIntegrationController")
@ConditionalOnMissingBean(name = "statIntegrationControllerExt")
@RequestMapping("/stat/integration")
@Tag(name = "综合统计REST API", description = "综合统计REST API")
public class StatIntegrationController extends BaseController {
    protected static final Logger logger = LoggerFactory.getLogger(StatIntegrationController.class);

    @Autowired
    protected StatIntegrationService statIntegrationService;
    @Autowired
    protected StatLicTask statLicTask;

    @PreAuthorize(UserRights.HAS_OPS_REPORT_ROLE)
    @RequestMapping(value = "", method = {RequestMethod.GET})
    @Operation(summary = "综合统计接口", description = "综合统计接口")
    public StatIntegrationDto getIntegration() {

        // 系统总数
        // 暂时不统计 系统总数, 系统总数是DAM上的数据. 暂时未对接
        //long systemAmount = statIntegrationService.getSystemAmount();
        // 模型总数
        long modelAmount = statIntegrationService.getModelAmount();
        // 版本总数
        long versionAmount = statIntegrationService.getVersionAmount();
        // 实体总数
        long entityAmount = statIntegrationService.getEntityAmount();
        // 数据项总数
        long dataItemAmount = statIntegrationService.getDataItemAmount();
        // 用户总数
        long userAmount = statIntegrationService.getUserAmount();

        StatIntegrationDto statIntegrationDto = new StatIntegrationDto();
        statIntegrationDto.setDataItemAmount(dataItemAmount);// 数据项总数
        statIntegrationDto.setEntityAmount(entityAmount);// 实体总数
        statIntegrationDto.setModelAmount(modelAmount);// 模型总数
        //statIntegrationDto.setSystemAmount(systemAmount);// 系统总数
        statIntegrationDto.setUserAmount(userAmount);// 用户总数
        statIntegrationDto.setVersionAmount(versionAmount);// 版本总数

        return statIntegrationDto;
    }


    @RequestMapping(value = "/refreshStatLicTask", method = {RequestMethod.GET})
    @Operation(summary = "手动刷新", description = "手动刷新 统计接口 测试使用")
    public String refreshStatLicTask() {
        statLicTask.atomOperation();
        return "done";
    }
}
