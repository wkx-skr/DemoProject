package com.datablau.metadata.main.controller;

import com.andorj.common.data.PageResult;
import com.datablau.data.common.controller.BaseController;
import com.datablau.domain.management.dto.DomainQueryDto;
import com.datablau.domain.management.dto.measurement.ObjectFullPathDto;
import com.datablau.metadata.main.dao.DashboardReportRepository;
import com.datablau.metadata.main.dto.DashboardReportDto;
import com.datablau.metadata.main.dto.domain.DomainDashboardDto;
import com.datablau.metadata.main.dto.domain.DomainDepartmentQueryDto;
import com.datablau.metadata.main.entity.DashboardReport;
import com.datablau.metadata.main.entity.domain.DomainDepartmentCount;
import com.datablau.metadata.main.entity.domain.DomainDetailCount;
import com.datablau.metadata.main.service.domain.api.DomainDashboardService;
import com.datablau.metadata.main.util.ServerConstants;
import com.datablau.security.management.api.RoleService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * @Author senyan
 * @Date
 */
@RestController
@RequestMapping("/dashboard")
public class DashboardController extends BaseController {
    private static final Logger LOGGER = LoggerFactory.getLogger(DashboardController.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Autowired
    private DashboardReportRepository dashboardReportJobDao;
    @Autowired
    private DomainDashboardService domainDashboardService;

    public DashboardController(@Autowired RoleService roleService){
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    /**
     * 获取dashboard
     * @return
     */
//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "dam_dashboard_report",
//            systemModule = OperationModuleType.METADATA_DASHBOARD,
//            description = "查询元数据概览"
//    )
    @RequestMapping("/main")
    public DashboardReportDto getDashboardReport() {
        try {
            Pageable pageable = PageRequest.of(0, 1);

            List<DashboardReport> reports = dashboardReportJobDao.getDashboardReport(pageable);
            int size = reports.size();
            if (size == 1) {
                DashboardReport report = reports.get(0);
                if (report != null) {
                    return MAPPER.readValue(report.getReport(), DashboardReportDto.class);
                }
            }
        } catch (Exception ex) {
            LOGGER.error("read dashboard error: " + ex.getMessage());
        }

        return null;
    }

    @RequestMapping("/domain/count")
    public DomainDashboardDto getDomainDashboardCount() {
        return domainDashboardService.getDomainDashboardCount();
    }

    @RequestMapping("/domain/count/cache/update")
    public void getDomainDashboardCountUpdate() {
        domainDashboardService.domainCountUpdateCache();
    }

    @RequestMapping("/domain/count/department/drop")
    public Map<String, List<String>> getDomainDepartmentCountDrop() {
        return domainDashboardService.getDomainDepartmentCountDrop();
    }

    @PostMapping("/domain/count/department")
    public PageResult<DomainDepartmentCount> getDomainDepartmentCount(@RequestBody DomainDepartmentQueryDto queryDto) {
        return domainDashboardService.getDomainDepartmentCount(queryDto);
    }

    @PostMapping("/domain/count/department/export")
    public ResponseEntity<byte[]> getDomainDepartmentCountExport(@RequestBody DomainDepartmentQueryDto queryDto) {
        return domainDashboardService.getDomainDepartmentCountExport(queryDto);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "dam_domain_detail_count",
//            systemModule = OperationModuleType.DOMAIN_COUNT,
//            description = "查询统计"
//    )
    @PostMapping("/domain/count/theme/detail")
    public PageResult<DomainDetailCount> getDomainThemeDetail(@RequestBody DomainDepartmentQueryDto queryDto) {
        return domainDashboardService.getDomainDetailCount(queryDto);
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "dam_domain_detail_count",
//            systemModule = OperationModuleType.DOMAIN_COUNT,
//            description = "导出查询统计"
//    )
    @PostMapping("/domain/count/theme/detail/export")
    public ResponseEntity<byte[]> getDomainThemeDetailExport(@RequestBody DomainDepartmentQueryDto queryDto) {
        return domainDashboardService.getDomainDetailCountExport(queryDto);
    }

    @RequestMapping("/domain/count/theme/detail/drop")
    public Map<String, List<String>> getDomainThemeDetailDrop() {
        return domainDashboardService.getDomainDetailCountDrop();
    }

    @PostMapping("/domain/getDomainUsagesPage")
    @Operation(summary = "分页查询一个数据标准的使用情况")
    public PageResult<ObjectFullPathDto> getDomainUsagesPage(@RequestBody DomainQueryDto queryDto) {
        return domainDashboardService.getDomainUsagesPage(queryDto);
    }

}
