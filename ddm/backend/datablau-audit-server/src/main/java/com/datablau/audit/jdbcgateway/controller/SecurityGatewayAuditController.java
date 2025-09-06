package com.datablau.audit.jdbcgateway.controller;


import com.andorj.model.common.search.FieldEqualsCriteria;
import com.datablau.audit.jdbcgateway.dto.CommonMsgDto;
import com.datablau.audit.jdbcgateway.dto.GatewayLogExportDto;
import com.datablau.audit.jdbcgateway.dto.GatewayQueryLogQueryDto;
import com.datablau.audit.jdbcgateway.dto.OperationLogQueryDto;
import com.datablau.audit.jdbcgateway.service.api.GatewayAuditSearchService;
import com.datablau.audit.jdbcgateway.utils.FileUtility;
import com.datablau.audit.jdbcgateway.utils.JsonUtils;
import com.datablau.audit.jdbcgateway.utils.ServerConstants;
import com.datablau.base.api.ModelCategoryService;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.common.excel.ExcelUtil;
import com.datablau.data.common.api.instantjob.InstantJob;
import com.datablau.data.common.api.instantjob.InstantJobProgressMonitor;
import com.datablau.data.common.api.instantjob.InstantJobService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.data.FileDescriptor;
import com.datablau.data.common.data.instantjob.EnumJobType;
import com.datablau.data.common.data.instantjob.FileGenerateInstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobStage;
import com.datablau.metadata.common.api.DatablauRemoteDamModelService;
import com.datablau.metadata.common.dto.model.ModelDto;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 安全网关审计 controller
 *
 * @author weijiakun
 */
@RestController
@RequestMapping("/jdbc")
@Tag(name = "安全网关审计", description = "安全网关审计 controller")
public class SecurityGatewayAuditController extends BaseController {

    private static final Logger LOGGER = LoggerFactory.getLogger(SecurityGatewayAuditController.class);

    @Autowired
    private GatewayAuditSearchService gatewayAuditSearchService;
    @Autowired
    @Qualifier("datablauRemoteDamModelService")
    private DatablauRemoteDamModelService modelService;
    @Autowired
    private ModelCategoryService modelCategoryService;
    @Autowired
    private FileUtility fileUtility;
    @Autowired
    private InstantJobService instantJobService;


    public SecurityGatewayAuditController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    /**
     * 条件查询用户连接信息
     *
     * @param userName       userName
     * @param type           type
     * @param datasourceName datasourceName
     * @param gatewayName    gatewayName
     * @param pageSize       pageSize
     * @param pageNum        pageNum
     * @param startTime      startTime
     * @param endTime        endTime
     * @return ConnectionLogMsg
     */
    @Operation(summary = "条件查询用户连接信息")
    @RequestMapping(value = "/connection", method = RequestMethod.GET)
    public CommonMsgDto getConnectionLogMsg(@Parameter(description = "登录名") String userName,
                                            @Parameter(description = "数据源类型") String type,
                                            @Parameter(description = "数据源名称") String datasourceName,
                                            @Parameter(description = "网关名称") String gatewayName,
                                            @Parameter(description = "每页数量") Integer pageSize,
                                            @Parameter(description = "页码") Integer pageNum,
                                            @Parameter(description = "起始时间") Long startTime,
                                            @Parameter(description = "结束时间") Long endTime) {
        String errorMsg = null;

        try {
            return gatewayAuditSearchService.getConnectionLogMsg(userName, type, datasourceName, gatewayName, pageSize, pageNum, startTime, endTime);
        } catch (Exception e) {
            errorMsg = e.getMessage();
        }
        if (errorMsg != null) {
            List<Map<String, Object>> error = new ArrayList<>();
            Map<String, Object> msg = new LinkedHashMap<>();
            msg.put("errorMsg", errorMsg);
            error.add(msg);
            CommonMsgDto commonMsgDto = new CommonMsgDto();
            commonMsgDto.setMessages(error);
            commonMsgDto.setTotalHits(0L);
            return commonMsgDto;
        }
        return null;
    }

    /**
     * 条件查询用户查询信息
     *
     * @param uuidC     uuidC
     * @param query     query
     * @param pageSize  pageSize
     * @param pageNum   pageNum
     * @param startTime startTime
     * @param endTime   endTime
     * @return QueryLogMsg
     */
    @Operation(summary = "条件查询用户查询信息")
    @RequestMapping(value = "/query", method = RequestMethod.GET)
    public CommonMsgDto getQueryLogMsg(@Parameter(description = "uuidC") String uuidC,
                                       @Parameter(description = "查询语句") String query,
                                       @Parameter(description = "每页数量") Integer pageSize,
                                       @Parameter(description = "页码") Integer pageNum,
                                       @Parameter(description = "起始时间") Long startTime,
                                       @Parameter(description = "结束时间") Long endTime) {
        String errorMsg = null;

        try {
            return gatewayAuditSearchService.getQueryLogMsg(uuidC, query, pageSize, pageNum, startTime, endTime);
        } catch (Exception e) {
            errorMsg = e.getMessage();
        }
        if (errorMsg != null) {
            List<Map<String, Object>> error = new ArrayList<>();
            Map<String, Object> msg = new LinkedHashMap<>();
            msg.put("errorMsg", errorMsg);
            error.add(msg);
            CommonMsgDto commonMsgDto = new CommonMsgDto();
            commonMsgDto.setMessages(error);
            commonMsgDto.setTotalHits(0L);
            return commonMsgDto;
        }
        return null;
    }


    /**
     * 条件查询用户查询结果信息
     *
     * @param uuidC     uuidC
     * @param uuidQ     uuidQ
     * @param pageSize  pageSize
     * @param pageNum   pageNum
     * @param startTime startTime
     * @param endTime   endTime
     * @return ResultLogMsg
     */
    @Operation(summary = "条件查询用户查询结果信息")
    @RequestMapping(value = "/result", method = RequestMethod.GET)
    public CommonMsgDto getResultLogMsg(@Parameter(description = "uuidC") String uuidC,
                                        @Parameter(description = "uuidQ") String uuidQ,
                                        @Parameter(description = "每页数量") Integer pageSize,
                                        @Parameter(description = "页码") Integer pageNum,
                                        @Parameter(description = "起始时间") Long startTime,
                                        @Parameter(description = "结束时间") Long endTime) {
        String errorMsg = null;

        try {
            return gatewayAuditSearchService.getResultLogMsg(uuidC, uuidQ, pageSize, pageNum, startTime, endTime);
        } catch (Exception e) {
            errorMsg = e.getMessage();
        }
        if (errorMsg != null) {
            List<Map<String, Object>> error = new ArrayList<>();
            Map<String, Object> msg = new LinkedHashMap<>();
            msg.put("errorMsg", errorMsg);
            error.add(msg);
            CommonMsgDto commonMsgDto = new CommonMsgDto();
            commonMsgDto.setMessages(error);
            commonMsgDto.setTotalHits(0L);
            return commonMsgDto;
        }
        return null;
    }

    /**
     * 查询代理网关查询记录
     *
     * @param pageSize pageSize
     * @param pageNum  pageNum
     * @return ProxyLogMsg
     */
    @Operation(summary = "查询代理网关查询记录")
    @RequestMapping(value = "/proxy", method = RequestMethod.GET)
    public CommonMsgDto getProxyLogMsg(
            @Parameter(name = "每页数量") Integer pageSize,
            @Parameter(name = "页码") Integer pageNum) {
        String errorMsg = null;

        try {
            return gatewayAuditSearchService.getProxyLogMsg(pageSize, pageNum);
        } catch (Exception e) {
            errorMsg = e.getMessage();
        }
        if (errorMsg != null) {
            List<Map<String, Object>> error = new ArrayList<>();
            Map<String, Object> msg = new LinkedHashMap<>();
            msg.put("errorMsg", errorMsg);
            error.add(msg);
            CommonMsgDto commonMsgDto = new CommonMsgDto();
            commonMsgDto.setMessages(error);
            commonMsgDto.setTotalHits(0L);
            return commonMsgDto;
        }
        return null;
    }


    /**
     * 查询用户操作记录
     *
     * @param queryDto dto
     * @return 记录
     */
    @Operation(summary = "查询用户操作记录")
    @RequestMapping(value = "/record", method = RequestMethod.POST)
    public CommonMsgDto getUserOperationLog(@RequestBody OperationLogQueryDto queryDto) {

        String action = queryDto.getBasicAction() == null ? "" : queryDto.getBasicAction().name();

        return gatewayAuditSearchService
                .getUserOperationMsg(
                        queryDto.getQuery(),
                        queryDto.getModule(),
                        queryDto.getOperationObject(),
                        action,
                        queryDto.getOperationObjectType(),
                        queryDto.getOperationObjectId(),
                        queryDto.getStartTime(),
                        queryDto.getEndTime(),
                        queryDto.getPageSize(),
                        queryDto.getPageNum()
                );
    }

    @Operation(summary = "查询用户网关查询记录")
    @PostMapping(value = "/security/gateway")
    public CommonMsgDto getSecurityGatewayLog(@RequestBody GatewayQueryLogQueryDto queryDto) {
        return gatewayAuditSearchService.getGatewayQueryLogMsg(
                queryDto.getUser(),
                queryDto.getGroupName(),
                queryDto.getGatewayName(),
                queryDto.getSqlString(),
                queryDto.getResult(),
                queryDto.getTable(),
                queryDto.getModelId(),
                queryDto.getWarning(),
                queryDto.getStartTime(),
                queryDto.getEndTime(),
                queryDto.getPageSize(),
                queryDto.getPageNum()
        );
    }

    @Operation(summary = "下载用户网关查询记录")
    @PostMapping(value = "/security/gateway/download")
    public String downloadSecurityGatewayLog(HttpServletResponse response,
                                             @RequestBody GatewayQueryLogQueryDto queryDto) {

        LOGGER.info("日志审计导出");
        CommonMsgDto commonMsgDto = gatewayAuditSearchService.downloadGatewayQueryLogMsg(
                queryDto.getUser(),
                queryDto.getGroupName(),
                queryDto.getGatewayName(),
                queryDto.getSqlString(),
                queryDto.getResult(),
                queryDto.getTable(),
                queryDto.getModelId(),
                queryDto.getWarning(),
                queryDto.getStartTime(),
                queryDto.getEndTime(),
                queryDto.getPageSize(),
                queryDto.getPageNum()
        );
        List<Map<String, Object>> queryLogList = commonMsgDto.getMessages();
        List<GatewayLogExportDto> gatewayLogExportDtoList = new ArrayList<>();
        for (Map<String, Object> queryLogMap : queryLogList) {
            try {
                GatewayLogExportDto gatewayLogExportDto = new GatewayLogExportDto(queryLogMap);
                //查询数据源名称、类型
                try {
                    Integer modelId = (Integer) queryLogMap.get("databaseId");
                    FieldEqualsCriteria equalsCriteria = new FieldEqualsCriteria("modelId", modelId.longValue(), false);
                    ModelDto model = modelService.getDataModel(equalsCriteria).singleton();
                    gatewayLogExportDto.setDatabaseName(model.getDefinition());
                    gatewayLogExportDto.setDatabaseType(model.getType());
                    // 查询业务系统名称
                    ModelCategoryDto modelCategory = modelCategoryService.getModelCategory(model.getCategoryId());
                    gatewayLogExportDto.setCategoryName(modelCategory.getCategoryName());
                } catch (Exception e) {
                    //如果数据源不存在了，则默认设置为空
                    LOGGER.error(e.getMessage(), e);
                }
                //获取查询的表 schema.table
                List<Map<String, String>> tableLogDtos = (List<Map<String, String>>) queryLogMap.getOrDefault("tableLogDtos", new ArrayList<>());
                for (Map<String, String> tableLogDto : tableLogDtos) {
                    gatewayLogExportDto.setTable(tableLogDto.get("tableName"));
                }
                gatewayLogExportDtoList.add(gatewayLogExportDto);
            } catch (Exception e) {
                LOGGER.error("error when parse msg:" + JsonUtils.toJSon(queryLogMap), e);
            }
        }
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        Map<String, List<List<Object>>> downloadMap = new HashMap<>();
        if (CollectionUtils.isEmpty(gatewayLogExportDtoList)) {
            gatewayLogExportDtoList.add(new GatewayLogExportDto());
        }
        downloadMap.put("安全网关日志", ExcelUtil.getSheetData(gatewayLogExportDtoList));
        String currentUser = getCurrentUser();
        String submitJob = instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                                           @Override
                                                           public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                                           }

                                                           @Override
                                                           public InstantJobResult call() throws Exception {
                                                               File export = ExcelUtil.export(downloadMap);
                                                               FileDescriptor storedFile = fileUtility.uploadFile(export, "安全网关日志.xlsx", currentUser, false);
                                                               LOGGER.info("日志审计导出fileId:{}", storedFile.getFileId());
                                                               FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                               result.setFileId(storedFile.getFileId());
                                                               result.setJobStatus(InstantJobStage.FINISHED);
                                                               return result;
                                                           }
                                                       }
                , "安全网关日志导出" + sdf.format(new Date()), currentUser, EnumJobType.EXPORT.name());
        return submitJob;
    }

    @Operation(summary = "获取模块操作动作")
    @PostMapping(value = "/action")
    public Map<String, String> getUserOperationActions(@RequestParam(value = "module", required = false) String module) {
        return gatewayAuditSearchService.getBasicActionByModule(module);
    }

    @Operation(summary = "获取模块下拉")
    @PostMapping(value = "/getModuleType")
    public List<String> getModuleTypes() {
        return gatewayAuditSearchService.getModuleTypes();
    }


}
