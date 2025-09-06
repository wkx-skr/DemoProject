package com.datablau.model.server.controller;

import com.andorj.model.common.api.MessageService;
import com.datablau.model.common.api.LicReportDDMRmiService;
import com.datablau.model.data.jpa.entity.CompanyInfo;
import com.datablau.model.data.security.UserRights;
import com.datablau.model.server.dto.CompanyInfoDto;
import com.datablau.model.server.service.api.CompanyInfoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.datablau.data.common.controller.BaseController;

/**
 * @author wgao
 * TASK#853
 */
@RestController("companyInfoController")
@ConditionalOnMissingBean(name = "companyInfoControllerExt")
@RequestMapping("/company")
@Tag(name = "企业信息REST API", description = "企业信息REST API")
public class CompanyInfoController extends BaseController {

    protected static final Logger logger = LoggerFactory.getLogger(CompanyInfoController.class);

    @Value("${lic.recommendedActiveFactor:60}")
    protected int recommendedActiveFactor;
    @Value("${lic.recommendedIncreaseFactor:150}")
    protected int recommendedIncreaseFactor;

    @Autowired
    protected MessageService msgService;
    @Autowired
    protected CompanyInfoService companyInfoService;
    @Qualifier("licDDMRmiService")
    @Autowired
    protected LicReportDDMRmiService licReportDDMRmiService;

    @PreAuthorize(UserRights.HAS_OPS_REPORT_ROLE)
    @RequestMapping(value = "/info", method = {RequestMethod.GET})
    @Operation(summary = "获取默认企业信息", description = "获取默认企业信息")
    public CompanyInfoDto getInfo() {
        CompanyInfo companyInfo = companyInfoService.getDefault();
        CompanyInfoDto companyInfoDto = new CompanyInfoDto(companyInfo);
        companyInfoDto.setBorrowedLicAmount(licReportDDMRmiService.getBorrowedLicAmount());
        companyInfoDto.setActualLicAmount(licReportDDMRmiService.getTotalLicAmount());
        companyInfoDto.setLicStartDate(licReportDDMRmiService.getCreatedDate());
        //companyInfoDto.setLicStartDate(licReportDDMRmiService.getCreatedDate());
        companyInfoDto.setLicEndDate(licReportDDMRmiService.getExpiredDate());
        if (companyInfoDto.getLicStatMaxPeakAmount() * 100 > licReportDDMRmiService.getTotalLicAmount() * recommendedActiveFactor) {
            companyInfoDto.setRecommendedLicAmount((licReportDDMRmiService.getTotalLicAmount() * recommendedIncreaseFactor) / 100);
        }
        return companyInfoDto;
    }

    @PreAuthorize(UserRights.HAS_OPS_REPORT_ROLE)
    @RequestMapping(value = "/info", method = {RequestMethod.PUT})
    @Operation(summary = "更新默认企业信息", description = "更新默认企业信息")
    public CompanyInfoDto updateInfo(
            @Parameter(name = "name", description = "企业名称", required = true) @RequestParam(value = "name") String nameRequest,
            @Parameter(name = "licAmount", description = "授权数量", required = true) @RequestParam(value = "licAmount") Integer licAmountRequest
    ) {

        if (licAmountRequest < 5) {
            throw new IllegalArgumentException(msgService.getMessage("certificateNumberLess", "5"));
        }

        CompanyInfo companyInfo = companyInfoService.getDefault();
        companyInfo.setName(nameRequest);
        companyInfo.setLicAmount(licAmountRequest);
        companyInfoService.updateDefault(companyInfo);
        CompanyInfoDto companyInfoDto = new CompanyInfoDto(companyInfo);
        companyInfoDto.setBorrowedLicAmount(licReportDDMRmiService.getBorrowedLicAmount());
        return companyInfoDto;
    }
}
