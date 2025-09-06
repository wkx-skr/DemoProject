package com.datablau.audit.jdbcgateway.controller;

import com.datablau.audit.jdbcgateway.dto.CommonMsgDto;
import com.datablau.audit.jdbcgateway.dto.ResResultDto;
import com.datablau.audit.jdbcgateway.dto.SystemLogQueryDto;
import com.datablau.audit.jdbcgateway.service.api.GatewayAuditSearchService;
import com.datablau.audit.jdbcgateway.utils.FileUtility;
import com.datablau.audit.jdbcgateway.utils.ServerConstants;
import com.datablau.audit.jdbcgateway.utils.SystemLogExportUtil;
import com.datablau.data.common.api.instantjob.InstantJob;
import com.datablau.data.common.api.instantjob.InstantJobProgressMonitor;
import com.datablau.data.common.api.instantjob.InstantJobService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.data.FileDescriptor;
import com.datablau.data.common.data.instantjob.EnumJobType;
import com.datablau.data.common.data.instantjob.FileGenerateInstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobStage;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

/**
 * 系统日志相关接口
 *
 * @author weijiakun
 * @create 2023-12-19 16:50
 */
@RestController
@RequestMapping("/sys")
@Tag(name = "系统日志", description = "系统日志 controller")
public class SystemLogAuditController extends BaseController {

    private static final Logger LOGGER = LoggerFactory.getLogger(SecurityGatewayAuditController.class);

    @Autowired
    private GatewayAuditSearchService gatewayAuditSearchService;
    @Autowired
    private FileUtility fileUtility;
    @Autowired
    private InstantJobService instantJobService;

    public SystemLogAuditController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    /**
     * 查询系统日志
     * @param queryDto dto
     * @return 记录
     */
//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "audit-system-log",
//            systemModule = OperationModuleType.SYSTEM_SERVERLOG,
//            description = "查询服务日志"
//    )
    @Operation(summary = "查询系统日志")
    @PostMapping(value = "/log")
    public ResResultDto<CommonMsgDto> getUserOperationLog(@RequestBody SystemLogQueryDto queryDto) {

        return ResResultDto.ok(gatewayAuditSearchService
                .getSystemLog(
                        queryDto.getQueryStr(),
                        queryDto.getServerName(),
                        queryDto.getLoggerLevel(),
                        queryDto.getStartTime(),
                        queryDto.getEndTime(),
                        queryDto.getPageSize(),
                        queryDto.getPageNum()
                ));
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "audit-system-log",
//            systemModule = OperationModuleType.SYSTEM_SERVERLOG,
//            description = "导出服务日志"
//    )
    @Operation(summary = "下载日志文件")
    @PostMapping(value = "/log/download")
    public ResResultDto<?> downloadSysLogByQuery(@RequestBody SystemLogQueryDto queryDto) {

        SystemLogExportUtil systemLogExportUtil = new SystemLogExportUtil();
        queryDto.setPageNum(1);
        queryDto.setPageSize(10000);
//        CommonMsgDto conut = gatewayAuditSearchService
//                .getSystemLog(
//                        queryDto.getQueryStr(),
//                        queryDto.getServerName(),
//                        queryDto.getLoggerLevel(),
//                        queryDto.getStartTime(),
//                        queryDto.getEndTime(),
//                        queryDto.getPageSize(),
//                        queryDto.getPageNum()
//                );
        //获取总数
        CommonMsgDto systemLog = gatewayAuditSearchService
                .getSystemLog(
                        queryDto.getQueryStr(),
                        queryDto.getServerName(),
                        queryDto.getLoggerLevel(),
                        queryDto.getStartTime(),
                        queryDto.getEndTime(),
                        queryDto.getPageSize(),
                        queryDto.getPageNum()
                );
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        String currentUser = getCurrentUser();
        String submitJob = instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                                           @Override
                                                           public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                                           }

                                                           @Override
                                                           public InstantJobResult call() throws Exception {
                                                               File file =  systemLogExportUtil.getStoreFile(systemLog.getMessages());
                                                               FileDescriptor storedFile = fileUtility.uploadFile(file, "服务日志.csv", currentUser, false);
                                                               LOGGER.info("系统日志导出fileId:{}", storedFile.getFileId());
                                                               FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                               result.setFileId(storedFile.getFileId());
                                                               result.setJobStatus(InstantJobStage.FINISHED);
                                                               return result;
                                                           }
                                                       }
                , "服务日志导出" + sdf.format(new Date()), currentUser, EnumJobType.EXPORT.name());

        return ResResultDto.ok(submitJob);

    }

    @Operation(summary = "获取所有的的服务名称")
    @PostMapping(value = "/server")
    public ResResultDto<List<String>> getServerName() {
        return ResResultDto.ok(gatewayAuditSearchService.getSystemServerName());
    }
}
