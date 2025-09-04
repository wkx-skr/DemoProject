package com.datablau.audit.jdbcgateway.controller;


import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.model.common.search.FieldEqualsCriteria;
import com.datablau.audit.jdbcgateway.dto.CommonMsgDto;
import com.datablau.audit.jdbcgateway.dto.GatewayLogExportDto;
import com.datablau.audit.jdbcgateway.dto.GatewayQueryLogQueryDto;
import com.datablau.audit.jdbcgateway.dto.OperationLogQueryDto;
import com.datablau.audit.jdbcgateway.dto.UserOperationIndexDto;
import com.datablau.audit.jdbcgateway.service.api.GatewayAuditSearchService;
import com.datablau.audit.jdbcgateway.utils.ElasticClientUtil;
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
import com.datablau.data.common.operation.type.OperationModuleType;
import com.datablau.metadata.common.api.DatablauRemoteDamModelService;
import com.datablau.metadata.common.dto.model.ModelDto;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.dto.UserDto;
import com.google.common.base.Strings;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.commons.lang.StringUtils;
import org.apache.solr.parser.QueryParser;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.Operator;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.SearchHit;
import org.elasticsearch.search.builder.SearchSourceBuilder;
import org.elasticsearch.search.sort.SortOrder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

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

    @Value("${datablau.elastic.client:http://localhost:9200}")
    protected String elasticIps;
    protected final String typeName = "_doc";
    @Value("${datablau.elastic.basic_auth_enabled}")
    protected boolean authEnable;
    @Value("${datablau.elastic.username}")
    protected String username;
    @Value("${datablau.elastic.password}")
    protected String password;
    @Autowired
    private UserService userService;

    public RestHighLevelClient getClient() {
        ElasticClientUtil elasticClientUtil = new ElasticClientUtil();
        return elasticClientUtil.getRestClient(this.elasticIps, this.username, this.password, this.authEnable);
    }

    @RequestMapping(value = "/record/a", method = RequestMethod.POST)
    public CommonMsgDto getUserOperationLog0(@RequestBody OperationLogQueryDto queryDto) throws IOException {
//        SearchRequest searchRequest = new SearchRequest();
//        searchRequest.indices("audit_common_operation");
        List<Map<String, Object>> proxyMsgList = new ArrayList();
        CommonMsgDto proxyMsg = new CommonMsgDto();
//        this.isOperationDocExist = this.checkESIndex(UserOperationIndexDto.class, this.operationDoc, this.isOperationDocExist);

//        try {
            SearchRequest searchRequest = new SearchRequest();
            searchRequest.indices("audit_common_operation");
//            startTime = startTime == null ? (new Date(0L)).getTime() : startTime;
//            endTime = endTime == null ? (new Date()).getTime() : endTime;
            SearchSourceBuilder searchSourceBuilder = (new SearchSourceBuilder()).trackTotalHits(true);
            BoolQueryBuilder boolQueryBuilder = QueryBuilders.boolQuery();
//            if (StringUtils.isNotBlank(query)) {
//                String keyword = QueryParser.escape(query);
//                BoolQueryBuilder innerQuery = QueryBuilders.boolQuery();
//                innerQuery.should(QueryBuilders.wildcardQuery("operator.raw", "*" + keyword + "*"));
//                innerQuery.should(QueryBuilders.wildcardQuery("description.raw", "*" + keyword + "*"));
//                boolQueryBuilder.must(innerQuery);
//            }
            String module = "数据资产-数据资产管理";
            if (StringUtils.isNotBlank(module)) {
                if (OperationModuleType.DATA_SECURITY_SECURITY.getModule().equals(module)) {
                    boolQueryBuilder.must(QueryBuilders.termsQuery("module.raw", new String[]{OperationModuleType.DATA_SECURITY_CATALOG_DESIGN.getModule(), OperationModuleType.DATA_SECURITY_DASHBOARD.getModule(), OperationModuleType.DATA_SECURITY_CONFIGURATION.getModule(), OperationModuleType.DATA_SECURITY_REGULATION.getModule(), OperationModuleType.DATA_SECURITY_STRATEGY.getModule(), OperationModuleType.DATA_SECURITY_AUTH_STANDARD.getModule(), OperationModuleType.DATA_SECURITY_REVIEW_PUBLISH.getModule(), OperationModuleType.DATA_SECURITY_DISCERN_ALGORITHM.getModule(), OperationModuleType.DATA_SECURITY_CATALOG.getModule(), OperationModuleType.DATA_SECURITY_DESENSITIZATION_STATIC_RULE.getModule(), OperationModuleType.DATA_SECURITY_CATALOG_ELEMENT.getModule(), OperationModuleType.DATA_SECURITY_DISCERN_RULE.getModule(), OperationModuleType.DATA_SECURITY_SECURITY.getModule(), OperationModuleType.DATA_SECURITY_LEVEL.getModule()}));
                } else {
                    boolQueryBuilder.must(QueryBuilders.matchQuery("module.raw", module).operator(Operator.AND));
                }
            }

//            if (StringUtils.isNotBlank(basicAction)) {
//                boolQueryBuilder.must(QueryBuilders.matchQuery("action", basicAction).operator(Operator.AND));
//            }

//            if (StringUtils.isNotBlank(operationObject)) {
//                boolQueryBuilder.must(QueryBuilders.matchQuery("operationObject", operationObject).operator(Operator.AND));
//            }

//            if (StringUtils.isNotBlank(operationObjectType)) {
//                boolQueryBuilder.must(QueryBuilders.matchQuery("operationObjectType", operationObjectType).operator(Operator.AND));
//            }

//            if (operationObjectId != null && operationObjectId != 0L) {
//                boolQueryBuilder.must(QueryBuilders.matchQuery("operationObjectId", operationObjectId).operator(Operator.AND));
//            }

//            boolQueryBuilder.must(QueryBuilders.rangeQuery("operationDate").gte(startTime).lte(endTime));
            Integer pageSize = queryDto.getPageSize();
            Integer pageNum = queryDto.getPageNum();

            searchSourceBuilder.from((pageNum - 1) * pageSize);
            searchSourceBuilder.size(pageSize);
            searchSourceBuilder.sort("operationDate", SortOrder.DESC);
            searchSourceBuilder.query(boolQueryBuilder);
            searchRequest.source(searchSourceBuilder);
            SearchResponse response = this.getClient().search(searchRequest, RequestOptions.DEFAULT);
            SearchHit[] hits = response.getHits().getHits();
            proxyMsg.setTotalHits(response.getHits().getTotalHits().value);
            SearchHit[] var18 = hits;
            int var19 = hits.length;

            for(int var20 = 0; var20 < var19; ++var20) {
                SearchHit hit = var18[var20];
                proxyMsgList.add(hit.getSourceAsMap());
            }
//        } catch (IOException var22) {
//            IOException e = var22;
////            LOGGER.error("search from " + this.operationDoc + " error!", e);
//            throw new UnexpectedStateException("查询失败，请稍后再试...");
//        }

//        this.setUserOperationMsgProperties(proxyMsgList);
        proxyMsg.setMessages(proxyMsgList);
        return proxyMsg;
    }

    protected void setUserOperationMsgProperties(List<Map<String, Object>> proxyMsgList) {
        if (!org.apache.commons.collections.CollectionUtils.isEmpty(proxyMsgList)) {
            Set<String> usernames = new HashSet();
            Iterator var3 = proxyMsgList.iterator();

            while(var3.hasNext()) {
                Map<String, Object> map = (Map)var3.next();
                if (map.containsKey("operator")) {
                    Object username = map.get("operator");
                    if (username != null) {
                        usernames.add(username.toString());
                    }
                }
            }
            Map<String, UserDto> userMap = (Map)this.userService.getUserDtoByUsernames(usernames).stream().collect(Collectors.toMap(UserDto::getUsername, (u) -> {
                return u;
            }));
            Iterator var9 = proxyMsgList.iterator();

            while(var9.hasNext()) {
                Map<String, Object> map = (Map)var9.next();
                if (map.containsKey("operator") && map.get("operator") != null) {
                    String username = map.get("operator").toString();
                    if (userMap.containsKey(username)) {
                        UserDto user = (UserDto)userMap.get(username);
                        if (!Strings.isNullOrEmpty(user.getFullUserName())) {
                            map.put("operator", String.format("%s(%s)", user.getFullUserName(), username));
                        }
                    }
                }
            }

        }
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
