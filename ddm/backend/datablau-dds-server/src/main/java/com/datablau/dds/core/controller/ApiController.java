package com.datablau.dds.core.controller;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.api.MessageService;
import com.datablau.dds.common.api.DatablauRemoteDdsApiCallService;
import com.datablau.dds.common.api.DatablauRemoteDdsApiService;
import com.datablau.dds.common.api.constant.ApiStatusConstants;
import com.datablau.dds.common.api.dto.ApiCallCountDto;
import com.datablau.dds.common.api.dto.ApiCallDto;
import com.datablau.dds.common.api.dto.ApiCallSearchQueryCriteria;
import com.datablau.dds.common.api.dto.ApiCatalogDto;
import com.datablau.dds.common.api.dto.ApiDto;
import com.datablau.dds.common.api.dto.ApiEntityDto;
import com.datablau.dds.common.api.dto.ApiSearchQueryCriteria;
import com.datablau.dds.common.api.dto.AppApiAuthDto;
import com.datablau.dds.common.api.dto.AppApiAuthSearchQueryCriteria;
import com.datablau.dds.common.api.dto.CallCountByMonthDto;
import com.datablau.dds.common.api.dto.CallCountDto;
import com.datablau.dds.common.api.dto.Result;
import com.datablau.dds.core.server.ESService;
import com.datablau.security.management.utils.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import java.io.IOException;
import java.text.ParseException;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Description;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ApiController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(ApiController.class);

    @Autowired
    private DatablauRemoteDdsApiService apiService;

    @Autowired
    private MessageService msgService;

    @Autowired
    private DatablauRemoteDdsApiCallService apiCallService;

    @Autowired
    private ESService esService;

    @RequestMapping(value = "/info", method = RequestMethod.POST)
    public ApiDto create(@RequestBody ApiDto apiDto)
        throws IllegalAccessException, InstantiationException {
        apiDto.getApi().setCreator(AuthTools.currentUsernameFailFast());
        return apiService.createApi(apiDto);
    }

    @RequestMapping(value = "/info", method = RequestMethod.PUT)
    public ApiDto update(@RequestBody ApiDto apiDto)
        throws IllegalAccessException, InstantiationException {
        apiDto.setUser(AuthTools.currentUsernameFailFast());
        ApiDto apiDtoRes = apiService.updateApi(apiDto);
        Map<String, Object> params = new HashMap<>();
        params.put("assetsName", apiDto.getApi().getName());
        params.put("apiType", apiDto.getApi().getApiCatalog());
        esService.updateAssets(String.valueOf(apiDto.getApi().getId()), LDMTypes.oDataService,
            params);
        return apiDtoRes;
    }

    @RequestMapping(value = "/status/{apiId}", method = RequestMethod.PUT)
    public void releaseOrOfflineApi(@PathVariable("apiId") Long apiId,
        @RequestBody ApiStatusConstants apiStatusEnum) {
        apiService.releaseOrOfflineApi(apiId, apiStatusEnum);
    }

    @RequestMapping(value = "/{apiId}", method = RequestMethod.DELETE)
    @Description("删除API")
    public void deleteApi(@PathVariable("apiId") Long apiId) {
        apiService.deleteApi(apiId);
    }


    @RequestMapping(value = "/test/{apiId}", method = RequestMethod.GET)
    @Description("测试API")
    public Object runApiTest(@PathVariable("apiId") Long apiId) throws IOException {
        return apiService.runApiTest(apiId);
    }

    @RequestMapping(value = "/{apiId}", method = RequestMethod.GET)
    public ApiDto findApiInfo(@PathVariable("apiId") Long apiId)
        throws IllegalAccessException, InstantiationException {
        return apiService.findApiInfo(apiId);
    }

    @RequestMapping(value = "/base/url",method = RequestMethod.GET)
    public String getBaseUrl() {
        return apiService.getBaseUrl();
    }

    @RequestMapping(value = "/auth", method = RequestMethod.POST)
    @Description("申请API")
    public void authorizationApi(@RequestBody AppApiAuthDto appApiAuthEntity) {
        appApiAuthEntity.setApplyUser(AuthTools.currentUsernameFailFast());
        apiService.authorizationApi(appApiAuthEntity);
    }

    @RequestMapping(value = "/search", method = RequestMethod.POST)
    @Description("申请API列表")
    public PageResult<AppApiAuthDto> pageAppApiAuth(@RequestBody AppApiAuthSearchQueryCriteria criteria) throws IllegalAccessException, InstantiationException {
        if (criteria.getPageSize() <= 0) {
            throw new InvalidArgumentException(msgService.getMessage("invalidPageParam"));
        }

        return apiService.pageAppApiAuth(criteria);
    }

    @RequestMapping(value = "/apis/search", method = RequestMethod.POST)
    public PageResult<ApiEntityDto> pageApis(@RequestBody ApiSearchQueryCriteria criteria) throws IllegalAccessException, InstantiationException {
        if (criteria.getPageSize() <= 0) {
            throw new InvalidArgumentException(msgService.getMessage("invalidPageParam"));
        }

        return apiService.pageApi(criteria);
    }

    @RequestMapping(value = "/apicall/search", method = RequestMethod.POST)
    public PageResult<CallCountDto> pageApiCall(@RequestBody ApiCallSearchQueryCriteria criteria) throws IllegalAccessException, InstantiationException {
        if (criteria.getPageSize() <= 0) {
            throw new InvalidArgumentException(msgService.getMessage("invalidPageParam"));
        }

        return apiCallService.pageApiCall(criteria);
    }

    @RequestMapping(value = "/apicall/{apiCallId}",method = RequestMethod.GET)
    public ApiCallDto findApiCall(@PathVariable("apiCallId") Long apiCallId) {
        return apiCallService.findApiCall(apiCallId);
    }

    @RequestMapping(value = "/myApis/search", method = RequestMethod.POST)
    public PageResult<ApiEntityDto> pageMyApis(@RequestBody ApiSearchQueryCriteria criteria) throws IllegalAccessException, InstantiationException {
        if (criteria.getPageSize() <= 0) {
            throw new InvalidArgumentException(msgService.getMessage("invalidPageParam"));
        }

        return apiService.pageMyApi(criteria);
    }

    @RequestMapping(value = "/catalogs",method = RequestMethod.GET)
    @Description("查询分类list")
    public List<ApiCatalogDto> findAllCatalog() throws InstantiationException, IllegalAccessException {
        return apiService.findAllApiCatalog();
    }

    @RequestMapping(value = "/apiCallCount",method = RequestMethod.GET)
    @Description("首页接口调用驾驶舱头部统计接口")
    public ApiCallCountDto apiCallCount() {
        return apiService.findApiCallCount();
    }

    @RequestMapping(value = "/callCount",method = RequestMethod.POST)
    @Description("月度活跃统计")
    public List<CallCountByMonthDto> findCallCountByYear(@RequestBody CallCountByMonthDto countByMonthDto) throws InstantiationException, IllegalAccessException, ParseException {
        return apiService.findCallCountByYear(countByMonthDto.getFomTime());
    }

    @RequestMapping(value = "/catalog", method = RequestMethod.POST)
    @Description("创建分类")
    public void createApiCatalog(@RequestBody ApiCatalogDto apiCatalogDto) {
        apiCatalogDto.setCreator(AuthTools.currentUsernameFailFast());
        apiCatalogDto.setCreateTime(new Date());
        apiCatalogDto.setModifyUser(AuthTools.currentUsernameFailFast());
        apiCatalogDto.setModifyTime(new Date());
        apiService.createApiCatalog(apiCatalogDto);
    }

    @RequestMapping(value = "/catalog", method = RequestMethod.PUT)
    @Description("修改分类")
    public void modifyApiCatalog(@RequestBody ApiCatalogDto apiCatalogDto) {
        apiCatalogDto.setModifyUser(AuthTools.currentUsernameFailFast());
        apiCatalogDto.setModifyTime(new Date());
        apiService.modifyApiCatalog(apiCatalogDto);
    }

    @RequestMapping(value = "/audit/search", method = RequestMethod.POST)
    @Description("需要审核得api申请")
    public PageResult<AppApiAuthDto> pageMyAuditAppApiAuth(
        @RequestBody AppApiAuthSearchQueryCriteria criteria)
        throws IllegalAccessException, InstantiationException {
        if (criteria.getPageSize() <= 0) {
            throw new InvalidArgumentException(msgService.getMessage("invalidPageParam"));
        }
        criteria.setUser(AuthTools.currentUsernameFailFast());
        return apiService.pageMyAuditAppApiAuth(criteria);
    }

    @Operation(summary = "根据datasourceId，以及数据库的名字获取所有的table的名字")
    @GetMapping("/{datasourceId}/{schemaName}/raw-tables")
    public PageResult<String> getRawTablesByModelAndSchema(@PathVariable("datasourceId") Long datasourceId,
        @PathVariable("schemaName") String schemaName,
        @RequestParam("currentPage") Integer currentPage,
        @RequestParam("pageSize") Integer pageSize,
        @RequestParam("search") String search) throws Exception {
        return apiService.getRawTablesByModelAndSchema(datasourceId, schemaName, currentPage, pageSize,
            search);
    }

    @RequestMapping(value = "/testSql",method = RequestMethod.POST)
    @Description("测试sql")
    public Object testSql(@RequestBody ApiDto apiDto) throws Exception {
        return apiService.testSql(apiDto);
    }
    @RequestMapping(value = "/batch/rel",method = RequestMethod.POST)
    @Description("批量发布")
    public Result batchReleaseApi(@RequestBody Collection<Long> ids) throws InstantiationException, IllegalAccessException, ParseException {
        return apiService.batchReleaseApi(ids);
    }

    @RequestMapping(value = "/batch/del",method = RequestMethod.POST)
    @Description("批量删除")
    public Result batchDelApi(@RequestBody Collection<Long> ids) throws InstantiationException, IllegalAccessException, ParseException {
        return apiService.batchDelApi(ids);
    }

    @RequestMapping(value = "/catalog/{catalogId}",method = RequestMethod.DELETE)
    @Description("删除分类")
    public void deleteCatalog(@PathVariable("catalogId") Long catalogId) {
        apiService.deleteApiCatalog(catalogId);
    }

    @RequestMapping(value = "/batch/off",method = RequestMethod.POST)
    @Description("批量下线")
    public Result batchOfflineApi(@RequestBody Collection<Long> ids)
        throws InstantiationException, IllegalAccessException, ParseException {
        return apiService.batchOfflineApi(ids);
    }

    @RequestMapping(value = "/audit", method = RequestMethod.POST)
    @Description("审批api申请")
    public void auditApiAuth(@RequestBody AppApiAuthSearchQueryCriteria criteria)
        throws IllegalAccessException, InstantiationException {
        apiService.auditApiAuth(criteria.getId(), criteria.getStatus(), criteria.getComment(),
            AuthTools.currentUsernameFailFast());
    }

    @RequestMapping(value = "/return/{id}", method = RequestMethod.PUT)
    @Description("归还")
    public void returnApi(@PathVariable("id") Long id)
        throws InstantiationException, IllegalAccessException, ParseException {
        apiService.returnApi(id, AuthTools.currentUsernameFailFast());
    }

    @RequestMapping(value = "/del/{id}", method = RequestMethod.DELETE)
    @Description("删除应用下的APi")
    public void delAppApiAuth(@PathVariable("id") Long id)
        throws InstantiationException, IllegalAccessException, ParseException {
        apiService.delAppApiAuth(id, AuthTools.currentUsernameFailFast());
    }

    @RequestMapping(value = "/re/auth", method = RequestMethod.POST)
    @Description("重新申请API")
    public void reApplyApi(@RequestBody AppApiAuthDto appApiAuthEntity) {
        appApiAuthEntity.setApplyUser(AuthTools.currentUsernameFailFast());
        apiService.reApplyApi(appApiAuthEntity);
    }
}
