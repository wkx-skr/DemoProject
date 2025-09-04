package com.datablau.metadata.main.controller;


import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.model.common.api.MessageService;
import com.datablau.common.excel.ExcelUtil;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.util.ShareKit;
import com.datablau.metadata.main.dto.metadata.ShallowSystemCall;
import com.datablau.metadata.main.dto.metadata.SystemCallSearchQueryCriteria;
import com.datablau.metadata.main.entity.metadata.SystemCall;
import com.datablau.metadata.main.service.metadata.api.SystemCallService;
import com.datablau.metadata.main.util.ServerConstants;
import com.datablau.project.util.UserRights;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import com.google.common.base.Strings;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * @Author Nicky - 数语科技有限公司
 * @Date 2018/10/9 16:58
 */
@RestController
@RequestMapping("/systemcall")
@Tag(name = "系统调用api")
public class SystemCallController extends BaseController {

    private static Logger logger = LoggerFactory.getLogger(SystemCallController.class);

    @Autowired
    private SystemCallService systemCallService;
    @Autowired
    private MessageService msgService;

    public SystemCallController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "新增或编辑系统调用的内容")
//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_sys_call",
//            systemModule = OperationModuleType.SYSTEM_SYSTEMCALL,
//            description = "新增或编辑系统调用: {param}",
//            descriptionParamClass = SystemCall.class,
//            descriptionParamMethod = "toString"
//    )
    @RequestMapping(value = "/", method = RequestMethod.POST)
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    public SystemCall createOrUpdateSystemCall(@RequestBody SystemCall systemCall) {
        return systemCallService.createOrUpdateSystemCall(systemCall);
    }

    @Operation(summary = "删除系统调用")
//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "dam_sys_call",
//            systemModule = OperationModuleType.SYSTEM_SYSTEMCALL,
//            description = "删除系统调用，id为: {param}",
//            descriptionParamClass = Long.class,
//            descriptionParamMethod = "toString"
//    )
    @RequestMapping(value = "/{systemCallId}", method = RequestMethod.DELETE)
    @Parameters({@Parameter(name = "systemCallId", description = "系统调用ID", in = ParameterIn.PATH, required = true)})
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    public void deleteSystemCall(@PathVariable("systemCallId")Long systemCallId) {
        systemCallService.deleteSystemCall(systemCallId);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "dam_sys_call",
//            systemModule = OperationModuleType.SYSTEM_SYSTEMCALL,
//            description = "查询系统调用"
//    )
    @Operation(summary = "搜索系统调用")
    @RequestMapping(value = "/search", method = RequestMethod.POST)
    @PreAuthorize(UserRights.HAS_BASE_SYSTEM_CALL_MANAGE_ROLE)
    public Page<SystemCall> getSystemCalls(@RequestBody SystemCallSearchQueryCriteria criteria) {
        if (criteria.getPageSize() <= 0) {
            throw new InvalidArgumentException(msgService.getMessage("invalidPageParam"));
        }

        Direction sortDirection = null;
        if (criteria.isDesc()) {
            sortDirection = Direction.ASC;
        } else {
            sortDirection = Direction.DESC;
        }

        PageRequest page = null;
        if (Strings.isNullOrEmpty(criteria.getSortField())) {
            page = PageRequest.of(criteria.getCurrentPage(), criteria.getPageSize());
        } else {
            page = PageRequest.of(criteria.getCurrentPage(), criteria.getPageSize(), sortDirection, criteria.getSortField());
        }

        return systemCallService.getSystemCalls(page, criteria.getSrcModelCategoryIds(), criteria.getDstModelCategoryIds(), criteria.getFilers(), criteria.getImporters(), criteria.getKeyword());
    }

    @Operation(summary = "搜索系统调用")
    @RequestMapping("/intersystemcalls")
    @Parameters({@Parameter(name = "srcModelCategoryId", description = "model目录ID", in = ParameterIn.QUERY, required = true)})
    public List<SystemCall> getSystemCallsBetweenSystems(@RequestParam("srcModelCategoryId")Long srcModelCategoryId,
        @RequestParam("dstModelCategoryId")Long dstModelCategoryId) {
        return systemCallService.getSystemCallsBetweenSystems(srcModelCategoryId, dstModelCategoryId);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "dam_sys_call",
//            systemModule = OperationModuleType.METADATA_AREA,
//            description = "查询数据地图"
//    )
    @Operation(summary = "获取系统预览")
    @RequestMapping("/overview")
    public Set<ShallowSystemCall> getSystemCallsOverview() {
        return systemCallService.getSystemCallOverview();
    }

    @Operation(summary = "获取所有调用系统id")
    @RequestMapping("/all/callerModelIds")
    public Set<Long> findAllCallerModelCategoryId() {
        return systemCallService.findAllCallerModelCategoryId();
    }

    @Operation(summary = "获取所有调用系统id")
    @RequestMapping("/all/calleeModelIds")
    public Set<Long> findAllCalleeModelCategoryId() {
        return systemCallService.findAllCalleeModelCategoryId();
    }

//    @Operation(summary = "上传系统调用")
//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "dam_sys_call",
//            systemModule = OperationModuleType.SYSTEM_SYSTEMCALL,
//            description = "上传系统调用"
//    )
//    @RequestMapping(method = RequestMethod.POST, value = "/upload/bak")
//    @Parameters({@Parameter(name = "file", description = "文件", in = ParameterIn.QUERY, required = true)})
//    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
//    public Integer uploadTemplateBak(@RequestParam("file") MultipartFile multipartFile)
//        throws Exception {
//
//        logger.info(
//            AuthTools.currentUsernameNullSafe() + " is uploading file " + multipartFile.getName());
//        File uploadedFile = DataUtility.uploadFile(multipartFile);
//        try {
//            Integer sysCount =
//                systemCallService.importSystemCallsFromFile(uploadedFile);
//            logger.info("Total create " + sysCount + " system calls");
//            return sysCount;
//        } finally {
//            uploadedFile.delete();
//        }
//    }


    @Operation(summary = "上传系统调用")
//    @OperatorLog(
//        operation = OperationLogType.DATA_IMPORT,
//        operateTable = "dam_sys_call",
//        systemModule = OperationModuleType.SYSTEM_SYSTEMCALL,
//        description = "上传系统调用"
//    )
    @RequestMapping(method = RequestMethod.POST, value = "/upload")
    @Parameters({@Parameter(name = "file", description = "文件", in = ParameterIn.QUERY, required = true)})
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    public Integer uploadTemplate(@RequestParam("file") MultipartFile multipartFile) throws Exception {
        logger.info(AuthTools.currentUsernameNullSafe() + " is uploading file " + multipartFile.getName());

        if (!multipartFile.getOriginalFilename().toLowerCase().endsWith(".xlsx")) {
            throw new InvalidArgumentException(
                msgService.getMessage("onlySupportMicrosoftExcelXlsx"));
        }
        Map<String, List<Object>> sheets = null;
        try {
            sheets = ExcelUtil.readFileManySheet(multipartFile);
            if (!sheets.containsKey(msgService.getMessage("syscall.sheet"))) {
                throw new AndorjRuntimeException(msgService.getMessage("syscall.sheetError"));
            }
        } catch (Exception e) {
            throw new AndorjRuntimeException(msgService.getMessage("syscall.sheetError"));
        }
        Integer sysCount = systemCallService.importSystemCallsFromFile(sheets.get(msgService.getMessage("syscall.sheet")));
        logger.info("Total create " + sysCount + " system calls");
        return sysCount;
    }

    @Operation(summary = "下载系统调用模板")
//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "dam_sys_call",
//            systemModule = OperationModuleType.SYSTEM_SYSTEMCALL,
//            description = "下载系统调用模板"
//    )
    @RequestMapping(method = RequestMethod.GET, value = "/template")
    //@PreAuthorize(UserRights.HAS_LINEAGE_ADMIN)
    public ResponseEntity<Resource> exportDomainTemplate() throws Exception {
        ByteArrayOutputStream bos = null;
        try {
            String loc = ShareKit.getResourcePath("/syscall_template.xlsx");

            Workbook wb = new XSSFWorkbook(loc);
            bos = new ByteArrayOutputStream();
            wb.write(bos);
            wb.close();

            HttpHeaders headers = new HttpHeaders();
            headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");
            headers.add("charset", "utf-8");

            headers.add("Content-Disposition", "attachment;filename=\"" + URLEncoder
                .encode(msgService.getMessage("syscall.filename"), "utf-8")+ "\"");

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
