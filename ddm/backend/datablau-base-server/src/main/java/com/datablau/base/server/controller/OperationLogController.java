package com.datablau.base.server.controller;

import com.andorj.common.data.PageResult;
import com.andorj.model.common.search.QueryParameterCriteria;
import com.datablau.base.server.service.LocalOperationLogService;
import com.datablau.base.server.utility.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.data.OperationLogDto;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @author nicky - 数语科技有限公司
 * date 2023/5/10 15:51
 */

@RestController
@RequestMapping("/operationLogs")
@Tag(name = "操作日志", description = "/operationLogs")
public class OperationLogController extends BaseController {

    @Autowired
    private LocalOperationLogService localOperationLogService;

    public OperationLogController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "日志查询")
    @PostMapping(value = "/getOperations")
    public PageResult<OperationLogDto> pageOperationLogListChangeTuAcct(@RequestBody QueryParameterCriteria criteria) throws Exception {
        PageResult<OperationLogDto> operationLogPageResult = localOperationLogService.queryLogs(criteria);
        return operationLogPageResult;
    }
    @Operation(summary = "删除日志")
    @PostMapping(value = "/deleteOperations")
    public void deleteOperationLog(@RequestBody List<Long> ids) {
        localOperationLogService.deleteByIds(ids);
    }
}
