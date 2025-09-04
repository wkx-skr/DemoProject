package com.datablau.dataSecurity.controller;

import com.alibaba.nacos.common.utils.IPUtil;
import com.datablau.data.common.controller.BaseController;
import com.datablau.dataAccess.dto.ResResultDto;
import com.datablau.dataAccess.utility.ServerConstants;
import com.datablau.dataSecurity.dto.BusinessSystemStatisticsDto;
import com.datablau.dataSecurity.jpa.entity.DataSecurityClassificationSummary;
import com.datablau.dataSecurity.service.api.DataSecurityDashboardService;
import com.datablau.dataSecurity.utils.DDSKafkaLogUtil;
import com.datablau.dataasset.utils.IpUtil;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;


@Tag(name = "数据安全dashboard")
@RestController
@RequestMapping(value = "/datasecurity/dashboard")
public class DataSecurityDashboardController extends BaseController {

    @Autowired
    private DDSKafkaLogUtil logUtils;
    @Autowired
    private DataSecurityDashboardService dataSecurityDashboardService;

    public DataSecurityDashboardController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "资产分级饼图")
    @GetMapping(value = "/assetClassification")
    public ResResultDto<Map<String, Map<String, String>>> assetClassification() {
        Map<String, Map<String, String>> assetClassification = dataSecurityDashboardService.getAssetClassification();
        logUtils.writerSecurityDashboardRecord("资产分级饼图",getCurrentUser(), IpUtil.getUserIp(),IpUtil.getUrl());
        return ResResultDto.ok(assetClassification);
    }


    @Operation(summary = "资产分类分级概览")
    @GetMapping(value = "/assetClassification/summary")
    public ResResultDto<Map<String, List<DataSecurityClassificationSummary>>> assetClassificationSummary() {
        Map<String, List<DataSecurityClassificationSummary>> assetClassificationSummary = dataSecurityDashboardService.getAssetClassificationSummary();
        //logUtils.writerSecurityDashboardRecord("资产分类分级概览",getCurrentUser(), IpUtil.getUserIp(),IpUtil.getUrl());
        return ResResultDto.ok(assetClassificationSummary);
    }

    @Operation(summary = "业务部门统计")
    @GetMapping(value = "/businessUnit/summary")
    public ResResultDto<?> businessUnit() {
        Map<String, Map<String, Map<String, Object>>> businessUnit = dataSecurityDashboardService.businessUnit();
        //logUtils.writerSecurityDashboardRecord("业务部门统计",getCurrentUser(), IpUtil.getUserIp(),IpUtil.getUrl());
        return ResResultDto.ok(businessUnit);
    }

    @Operation(summary = "业务系统统计")
    @GetMapping(value = "/businessSystem/summary")
    public ResResultDto<List<BusinessSystemStatisticsDto>> businessSystem() {
        List<BusinessSystemStatisticsDto> businessSystemStatisticsDtos = dataSecurityDashboardService.businessSystemStatistics();
        //logUtils.writerSecurityDashboardRecord("业务系统统计",getCurrentUser(), IpUtil.getUserIp(),IpUtil.getUrl());
        return ResResultDto.ok(businessSystemStatisticsDtos);
    }

    @Operation(summary = "统计任务")
    @GetMapping(value = "/run")
    public void runJob() {
        dataSecurityDashboardService.saveAssetClassificationSummary();
    }

}
