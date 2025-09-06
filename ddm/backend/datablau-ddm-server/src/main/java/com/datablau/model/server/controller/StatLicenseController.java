package com.datablau.model.server.controller;

import com.andorj.model.common.api.MessageService;
import com.datablau.model.data.jpa.entity.CompanyInfo;
import com.datablau.model.data.jpa.entity.LicenseStatDay;
import com.datablau.model.data.jpa.entity.LicenseStatWeek;
import com.datablau.model.data.security.UserRights;
import com.datablau.model.local.utility.CalendarUtils;
import com.datablau.model.local.utility.CalendarUtils.CalendarFormat;
import com.datablau.model.security.utility.AuthTools;
import com.datablau.model.server.dto.StatLicenseDaysDto;
import com.datablau.model.server.dto.StatLicenseWeeksDto;
import com.datablau.model.server.excel.ExportLicenseStatLog;
import com.datablau.model.server.service.api.CompanyInfoService;
import com.datablau.model.server.service.api.LicenseStatService;
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
import java.text.ParseException;
import java.util.Calendar;
import java.util.List;
import com.datablau.data.common.controller.BaseController;

/**
 * @author wgao
 * TASK#853
 */

@RestController("statLicenseController")
@ConditionalOnMissingBean(name = "statLicenseControllerExt")
@RequestMapping("/stat/license")
@Tag(name = "许可证统计REST API", description = "许可证统计REST API")
public class StatLicenseController extends BaseController {
    protected static final Logger logger = LoggerFactory.getLogger(StatLicenseController.class);

    @Autowired
    protected MessageService msgService;
    @Autowired
    protected LicenseStatService licenseStatService;
    @Autowired
    protected CompanyInfoService companyInfoService;

    @PreAuthorize(UserRights.HAS_OPS_REPORT_ROLE)
    @RequestMapping(value = "/days", method = {RequestMethod.GET})
    @Operation(summary = "日活曲线图", description = "日活曲线图")
    @Parameters({
            @Parameter(name = "startDate", description = "查询范围起始日期 例如:2020-12-1 (必填,日期类型 yyyy-MM-dd)", required = true, in = ParameterIn.QUERY),
            @Parameter(name = "endDate", description = "查询范围结束日期 例如:2020-12-15 (必填,日期类型 yyyy-MM-dd)", required = true, in = ParameterIn.QUERY),
            @Parameter(name = "orderBy", description = "date(日期) / dau(日活) / licPeakAmount(峰值人数) / changedItemAmount(变更项目数量)", in = ParameterIn.QUERY),
            @Parameter(name = "order", description = "asc(正序) / desc(倒序)", in = ParameterIn.QUERY),
            @Parameter(name = "currentPage", description = "当前页, 起始页为1", in = ParameterIn.QUERY),
            @Parameter(name = "pageSize", description = "每页大小, 10 - 60 之间", in = ParameterIn.QUERY)
    })
    public StatLicenseDaysDto getDays(
            @RequestParam(value = "startDate", required = true) String startDateRequest,
            @RequestParam(value = "endDate", required = true) String endDateRequest,
            @RequestParam(value = "orderBy", required = false, defaultValue = "date") String orderByRequest,
            @RequestParam(value = "order", required = false, defaultValue = "asc") String orderRequest,
            @RequestParam(value = "currentPage", required = false, defaultValue = "1") int currentPageRequest,
            @RequestParam(value = "pageSize", required = false, defaultValue = "10") int pageSizeRequest
    ) {
        Calendar startCal = null;
        Calendar endCal = null;
        try {
            startCal = CalendarUtils.StringToCalendar(startDateRequest, CalendarFormat.YYYY_MM_DD);
            endCal = CalendarUtils.StringToCalendar(endDateRequest, CalendarFormat.YYYY_MM_DD);
        } catch (ParseException e) {
            logger.error("Invalid date fromat", e);
            throw new IllegalArgumentException(msgService.getMessage("datetimeFormatInvalid"));
        }
        Page<LicenseStatDay> page = licenseStatService.getAllDaysWithPage(startCal, endCal, orderByRequest,
                orderRequest, currentPageRequest, pageSizeRequest);

        StatLicenseDaysDto statLicenseDaysDto = new StatLicenseDaysDto(page);

        return statLicenseDaysDto;
    }

    @PreAuthorize(UserRights.HAS_OPS_REPORT_ROLE)
    @RequestMapping(value = "/weeks", method = {RequestMethod.GET})
    @Operation(summary = "周活曲线图接口", description = "周活曲线图接口")
    @Parameters({
            @Parameter(name = "startYear", description = "查询范围起始年", required = true, in = ParameterIn.QUERY),
            @Parameter(name = "startWeek", description = "查询范围起始周数, 1月1日为第一周, 周日为每周的第一天", required = true, in = ParameterIn.QUERY),
            @Parameter(name = "endYear", description = "查询范围结束年", required = true, in = ParameterIn.QUERY),
            @Parameter(name = "endWeek", description = "查询范围结束周数, 1月1日为第一周, 周日为每周的第一天", required = true, in = ParameterIn.QUERY),
            @Parameter(name = "currentPage", description = "当前页, 起始页为1", in = ParameterIn.QUERY),
            @Parameter(name = "pageSize", description = "每页大小, 10 - 60 之间", in = ParameterIn.QUERY)
    })
    public StatLicenseWeeksDto getWeeks(
            @RequestParam(value = "startYear", required = true) int startYearRequest,
            @RequestParam(value = "startWeek", required = true) int startWeekRequest,
            @RequestParam(value = "endYear", required = true) int endYearRequest,
            @RequestParam(value = "endWeek", required = true) int endWeekRequest,
            @RequestParam(value = "currentPage", required = false, defaultValue = "1") int currentPageRequest,
            @RequestParam(value = "pageSize", required = false, defaultValue = "10") int pageSizeRequest
    ) {
        Page<LicenseStatWeek> page = licenseStatService.getAllWeeksWithPage(startYearRequest, startWeekRequest,
                endYearRequest, endWeekRequest, currentPageRequest, pageSizeRequest);

        StatLicenseWeeksDto statLicenseWeeksDto = new StatLicenseWeeksDto(page);

        return statLicenseWeeksDto;
    }

    @PreAuthorize(UserRights.HAS_OPS_REPORT_ROLE)
    @RequestMapping(value = "/excel/days", method = {RequestMethod.GET})
    @Operation(summary = "日活列表Excel下载", description = "日活列表Excel下载,时间跨度不得大于12个月")
    @Parameters({
            @Parameter(name = "startDate", description = "查询范围起始日期 例如:2020-12-1 (必填,日期类型 yyyy-MM-dd)", required = true, in = ParameterIn.QUERY),
            @Parameter(name = "endDate", description = "查询范围结束日期 例如:2020-12-15 (必填,日期类型 yyyy-MM-dd)", required = true, in = ParameterIn.QUERY)}
    )
    public void getExcelDays(
            HttpServletRequest request,
            HttpServletResponse response,
            @RequestParam(value = "startDate", required = true) String startDateRequest,
            @RequestParam(value = "endDate", required = true) String endDateRequest
    ) {
        Calendar startCal = null;
        Calendar endCal = null;
        try {
            startCal = CalendarUtils.StringToCalendar(startDateRequest, CalendarFormat.YYYY_MM_DD);
            endCal = CalendarUtils.StringToCalendar(endDateRequest, CalendarFormat.YYYY_MM_DD);
        } catch (ParseException e) {
            logger.error("Invalid date fromat", e);
            throw new IllegalArgumentException(msgService.getMessage("datetimeFormatInvalid"));
        }
        if (endCal.get(Calendar.YEAR) - startCal.get(Calendar.YEAR) > 1) {
            throw new IllegalArgumentException(msgService.getMessage("timeIsToLarge")); //Time span is too large
        }

        Page<LicenseStatDay> page = licenseStatService.getAllDaysWithPage(startCal, endCal, "date", "asc", 1, 999999);
        List<LicenseStatDay> licenseStatDays = page.getContent();

        String username = AuthTools.currentUsername();
        CompanyInfo companyInfo = companyInfoService.getDefault();
        String companyName = null;
        if (null != companyInfo) {
            companyName = companyInfo.getName();
        }

        ExportLicenseStatLog exportStatLog = new ExportLicenseStatLog(companyName, username);
        String title = "DDM " + msgService.getMessage("dailyProductivityStatistics") + " " + CalendarUtils.CalendarToString(startCal, CalendarFormat.YYYY_MM_DD) + " - " + CalendarUtils.CalendarToString(endCal, CalendarFormat.YYYY_MM_DD);

        response.setContentType("application/excel");
        response.addHeader("Content-Disposition", "attachment; filename=DDM_DailyStatistics-" + CalendarUtils.CalendarToString(Calendar.getInstance(), CalendarFormat.YYYY_MM_DD) + ".xls");
        OutputStream os = null;
        try {
            os = response.getOutputStream();
            exportStatLog.statLicenseUsageDays(title, licenseStatDays, os);
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
