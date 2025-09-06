package com.datablau.model.server.controller;

import com.andorj.model.common.api.MessageService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.api.ModelEditAuditService;
import com.datablau.model.data.dto.PageResult;
import com.datablau.model.data.general.CallFromType;
import com.datablau.model.data.general.OperationType;
import com.datablau.model.data.jpa.entity.ModelEditAudit;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.poi.ss.usermodel.Workbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.util.List;
/**
 * @Author Senyan - 北京数语科技有限公司
 * @Date 2021/2/23
 */

@RestController("modelStoreEditAuditLogController")
@ConditionalOnMissingBean(name = "modelStoreEditAuditLogControllerExt")
@RequestMapping("/auditLog")
@Tag(name = "模型库操作日志相关REST API", description = "模型库操作日志相关REST API")
public class ModelStoreEditAuditLogController extends BaseController {

    protected static final Logger logger = LoggerFactory.getLogger(ModelStoreEditAuditLogController.class);

    @Autowired
    ModelEditAuditService modelEditAuditService;

    @Autowired
    protected MessageService msgService;

    @RequestMapping("/search")
    @Operation(summary = "搜索模型库操作日志", description = "搜索模型库操作日志")
    @Parameters({@Parameter(name = "user", description = "用户", in = ParameterIn.QUERY),
            @Parameter(name = "modelId", description = "模型Id", in = ParameterIn.QUERY),
            @Parameter(name = "categoryId", description = "目录Id", in = ParameterIn.QUERY),
            @Parameter(name = "name", description = "模型或目录名称", in = ParameterIn.QUERY),
            @Parameter(name = "start", description = "开始时间", in = ParameterIn.QUERY),
            @Parameter(name = "end", description = "结束时间", in = ParameterIn.QUERY),
            @Parameter(name = "op", description = "操作类型", in = ParameterIn.QUERY),
            @Parameter(name = "cft", description = "数据渠道", in = ParameterIn.QUERY),
            @Parameter(name = "orderBy", description = "排序字段", in = ParameterIn.QUERY),
            @Parameter(name = "asc", description = "排序类型", in = ParameterIn.QUERY),
            @Parameter(name = "currentPage", description = "当前页码", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "pageSize", description = "每页大小", in = ParameterIn.QUERY, required = true)})
    public PageResult<ModelEditAudit> searchEditAuditLog(
            @RequestParam(name = "user", required = false) String user,
            @RequestParam(name = "modelId", required = false) Long modelId,
            @RequestParam(name = "categoryId", required = false) Long categoryId,
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name = "start", required = false) Long start,
            @RequestParam(name = "end", required = false) Long end,
            @RequestParam(name = "op", required = false) OperationType op,
            @RequestParam(name = "cft", required = false) CallFromType cft,
            @RequestParam(name = "orderBy", required = false, defaultValue = "timestamp") String orderBy,
            @RequestParam(name = "asc", required = false, defaultValue = "false") Boolean asc,
            @RequestParam("currentPage") Integer currentPage,
            @RequestParam("pageSize") Integer pageSize) {
        return modelEditAuditService.searchEditAuditLog(user, modelId, categoryId, name, start, end, op, cft, orderBy, asc, currentPage, pageSize);
    }

    @RequestMapping(value = "/{logId}", method = RequestMethod.DELETE)
    @Operation(summary = "删除一条指定的模型库操作日志", description = "删除一条指定的模型库操作日志")
    @Parameters({@Parameter(name = "logId", description = "日志ID", in = ParameterIn.PATH, required = true)})
    public void deleteEditAuditLog(@PathVariable("logId") Long logId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        modelEditAuditService.deleteLogById(logId);
    }

    @RequestMapping(method = RequestMethod.POST, value = "/delete")
    @Operation(summary = "删除若干条指定的模型库操作日志", description = "删除若干条指定的模型库操作日志")
    public void deleteEditAuditLogs(@Parameter(description = "日志ID", required = true) @RequestBody List<Long> logIds) {
        modelEditAuditService.deleteLogByIds(logIds);
    }

    @RequestMapping("/export")
    @Operation(summary = "导出模型库操作日志", description = "导出模型库操作日志")
    @Parameters({@Parameter(name = "user", description = "用户", in = ParameterIn.QUERY),
            @Parameter(name = "modelId", description = "模型Id", in = ParameterIn.QUERY),
            @Parameter(name = "categoryId", description = "目录Id", in = ParameterIn.QUERY),
            @Parameter(name = "name", description = "模型或目录名称", in = ParameterIn.QUERY),
            @Parameter(name = "start", description = "开始时间", in = ParameterIn.QUERY),
            @Parameter(name = "end", description = "结束时间", in = ParameterIn.QUERY),
            @Parameter(name = "op", description = "操作类型", in = ParameterIn.QUERY),
            @Parameter(name = "cft", description = "数据渠道", in = ParameterIn.QUERY),
            @Parameter(name = "orderBy", description = "排序字段", in = ParameterIn.QUERY),
            @Parameter(name = "asc", description = "排序类型", in = ParameterIn.QUERY)})
    public ResponseEntity<Resource> exportLogs(
            @RequestParam(name = "user", required = false) String user,
            @RequestParam(name = "modelId", required = false) Long modelId,
            @RequestParam(name = "categoryId", required = false) Long categoryId,
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name = "start", required = false) Long start,
            @RequestParam(name = "end", required = false) Long end,
            @RequestParam(name = "op", required = false) OperationType op,
            @RequestParam(name = "cft", required = false) CallFromType cft,
            @RequestParam(name = "orderBy", required = false, defaultValue = "timestamp") String orderBy,
            @RequestParam(name = "asc", required = false, defaultValue = "false") Boolean asc) throws Exception {

        ByteArrayOutputStream bos = null;
        try {
            Workbook wb = modelEditAuditService.exportLogs(user, modelId, categoryId, name, start, end, op, cft, orderBy, asc);
            bos = new ByteArrayOutputStream();
            wb.write(bos);
            wb.close();

            HttpHeaders headers = new HttpHeaders();
            headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");
            headers.add("charset", "utf-8");

            headers.add("Content-Disposition", "attachment;filename=\"" + URLEncoder
                    .encode(msgService.getMessage("ModelStoreOperationLogs") + ".xlsx", "utf-8") + "\"");

            Resource resource = new InputStreamResource(
                    new ByteArrayInputStream(bos.toByteArray()));

            return ResponseEntity.ok().headers(headers)
                    .contentType(MediaType.parseMediaType("application/octet-stream")).body(resource);

        } finally {
            if (null != bos) {
                bos.close();
            }
        }
    }
}
