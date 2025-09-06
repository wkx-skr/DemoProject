package com.datablau.model.server.controller;

import com.andorj.model.common.api.MessageService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.jpa.entity.CompanyInfo;
import com.datablau.model.data.jpa.entity.UserUseableStatMonth;
import com.datablau.model.data.security.UserRights;
import com.datablau.model.local.utility.CalendarUtils;
import com.datablau.model.local.utility.CalendarUtils.CalendarFormat;
import com.datablau.model.security.utility.AuthTools;
import com.datablau.model.server.dto.StatUserUseableMonthsDto;
import com.datablau.model.server.excel.ExportUserStatLog;
import com.datablau.model.server.service.api.CompanyInfoService;
import com.datablau.model.server.service.api.UserUseableStatService;
import com.datablau.security.management.api.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Calendar;
import java.util.List;

/**
 * @author wgao
 * TASK#853
 */
@RestController("statUserController")
@ConditionalOnMissingBean(name = "statUserControllerExt")
@RequestMapping("/stat/users")
@Tag(name = "用户统计REST API", description = "用户统计REST API")
public class StatUserController extends BaseController {
    protected static final Logger logger = LoggerFactory.getLogger(StatUserController.class);

    @Autowired
    protected MessageService msgService;
    @Autowired
    protected UserUseableStatService userUseableStatService;
    @Autowired
    protected CompanyInfoService companyInfoService;
    @Autowired
    protected UserService userService;

    @PreAuthorize(UserRights.HAS_OPS_REPORT_ROLE)
    @RequestMapping(value = "/months", method = {RequestMethod.GET})
    @Operation(summary = "人员生产力统计接口", description = "人员生产力统计接口")
    @Parameters({
            @Parameter(name = "startYear", description = "查询范围起始年", required = true, in = ParameterIn.QUERY),
            @Parameter(name = "startMonth", description = "查询范围起始月(1=一月)", required = true, in = ParameterIn.QUERY),
            @Parameter(name = "endYear", description = "查询范围结束年", required = true, in = ParameterIn.QUERY),
            @Parameter(name = "endMonth", description = "a查询范围结束月(1=一月)", required = true, in = ParameterIn.QUERY),
            @Parameter(name = "orderBy", description = "date(日期) / username(姓名) / keeplive(使用时长) / changedItemAmount(变更项目数量)", in = ParameterIn.QUERY),
            @Parameter(name = "order", description = "asc(正序) / desc(倒序)", in = ParameterIn.QUERY),
            @Parameter(name = "currentPage", description = "当前页, 起始页为1", in = ParameterIn.QUERY),
            @Parameter(name = "pageSize", description = "每页大小, 10 - 60 之间", in = ParameterIn.QUERY),})
    public StatUserUseableMonthsDto getWeeks(
            @RequestParam(value = "startYear", required = true) int startYearRequest,
            @RequestParam(value = "startMonth", required = true) int startMonthRequest,
            @RequestParam(value = "endYear", required = true) int endYearRequest,
            @RequestParam(value = "endMonth", required = true) int endMonthRequest,
            @RequestParam(value = "orderBy", required = false, defaultValue = "date") String orderByRequest,
            @RequestParam(value = "order", required = false, defaultValue = "asc") String orderRequest,
            @RequestParam(value = "currentPage", required = false, defaultValue = "1") int currentPageRequest,
            @RequestParam(value = "pageSize", required = false, defaultValue = "10") int pageSizeRequest) {
        Page<UserUseableStatMonth> page = userUseableStatService.getAllMonthsWithPage(startYearRequest, startMonthRequest - 1, endYearRequest, endMonthRequest - 1, orderByRequest, orderRequest, currentPageRequest, pageSizeRequest);
        StatUserUseableMonthsDto statUserUseableMonthsDto = new StatUserUseableMonthsDto(page, userService);
        return statUserUseableMonthsDto;
    }

    @PreAuthorize(UserRights.HAS_OPS_REPORT_ROLE)
    @RequestMapping(value = "/excel/months", method = {RequestMethod.GET})
    @Operation(summary = "人员生产力月统计Excel下载", description = "人员生产力月统计Excel下载,时间跨度不得大于12个月")
    @Parameters({
            @Parameter(name = "startYear", description = "查询范围起始年", required = true, in = ParameterIn.QUERY),
            @Parameter(name = "startMonth", description = "查询范围起始月(1=一月)", required = true, in = ParameterIn.QUERY),
            @Parameter(name = "endYear", description = "查询范围结束年", required = true, in = ParameterIn.QUERY),
            @Parameter(name = "endMonth", description = "a查询范围结束月(1=一月)", required = true, in = ParameterIn.QUERY)
    }
    )
    public void getExcelMonths(
            HttpServletRequest request,
            HttpServletResponse response,
            @RequestParam(value = "startYear", required = true) int startYearRequest,
            @RequestParam(value = "startMonth", required = true) int startMonthRequest,
            @RequestParam(value = "endYear", required = true) int endYearRequest,
            @RequestParam(value = "endMonth", required = true) int endMonthRequest
    ) {
        if (endYearRequest - startYearRequest > 1) {
            throw new IllegalArgumentException(msgService.getMessage("timeIsToLarge")); //Time span is too large
        }

        Page<UserUseableStatMonth> page = userUseableStatService.getAllMonthsWithPage(startYearRequest, startMonthRequest - 1, endYearRequest, endMonthRequest - 1, "date", "asc", 1, 999999);
        List<UserUseableStatMonth> userUseableStatMonths = page.getContent();

        String username = AuthTools.currentUsername();
        CompanyInfo companyInfo = companyInfoService.getDefault();
        String companyName = null;
        if (null != companyInfo) {
            companyName = companyInfo.getName();
        }

        String title = "DDM " + msgService.getMessage("monthlyProductivityStatistics") + " " + startYearRequest + "-" + startMonthRequest + " - " + endYearRequest + "-" + endMonthRequest;

        ExportUserStatLog exportStatLog = new ExportUserStatLog(companyName, username, userService);

        // 返回(下载)
        response.setContentType("application/excel");
        response.addHeader("Content-Disposition", "attachment; filename=DDM_MonthStatistics--" + CalendarUtils.CalendarToString(Calendar.getInstance(), CalendarFormat.YYYY_MM_DD) + ".xls");
        OutputStream os = null;
        try {
            os = response.getOutputStream();
            exportStatLog.statLicenseUsageDays(title, userUseableStatMonths, os);
        } catch (IOException ex) {
            ex.printStackTrace();
        } finally {
            try {
                exportStatLog.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
            if (null != os) {
                try {
                    os.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
