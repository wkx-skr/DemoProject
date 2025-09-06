package com.datablau.domain.management.controller;

import com.andorj.common.data.EditHistory;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.api.MessageService;
import com.datablau.data.common.api.OperationLogService;
import com.datablau.data.common.api.instantjob.InstantJob;
import com.datablau.data.common.api.instantjob.InstantJobProgressMonitor;
import com.datablau.data.common.api.instantjob.InstantJobService;
import com.datablau.data.common.data.DataBlauHttpServletRequest;
import com.datablau.data.common.data.instantjob.ImportInstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobStage;
import com.datablau.data.common.operation.annotation.OperatorLog;
import com.datablau.data.common.operation.type.OperationLogType;
import com.datablau.data.common.operation.type.OperationModuleType;
import com.datablau.data.common.type.InstantJobType;
import com.datablau.domain.management.api.DomainService;
import com.datablau.domain.management.dto.NamingStandardDto;
import com.datablau.domain.management.dto.NamingStandardQueryDto;
import com.datablau.domain.management.dto.NsExportResult;
import com.datablau.domain.management.utility.DataUtility;
import com.datablau.domain.management.utility.DatablauUtility;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.utils.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Set;

/**
 * @Author huajun.li
 */
@RestController
@RequestMapping("/ns")
@Tag(name = "业务术语相关的REST API")
public class NamingStandardController extends BaseController {
    private static final Logger LOGGER = LoggerFactory.getLogger(NamingStandardController.class);

    @Autowired
    private MessageService msgService;
    @Autowired
    private DomainService domainService;
    @Autowired
    private InstantJobService instantJobService;
    @Autowired
    private OperationLogService operationLogService;
    @Autowired
    private UserService userService;

    @PostMapping(value = "/category/getCategories")
    @Operation(summary = "得到业务术语所有分类")
    public List<String> getAllCategories() {
        return domainService.getAllCategories();
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "db_ns",
//            systemModule = OperationModuleType.DOMAIN_NS,
//            description = "查询命名词典"
//    )
    @PostMapping("/ns/getNs")
    @Operation(summary = "查询业务术语")
    public PageResult<NamingStandardDto> getNamingStandards(@RequestBody NamingStandardQueryDto queryDto) {
        return domainService.getPageOfNamingStandard(queryDto);
    }

    @OperatorLog(
            operation = OperationLogType.TABLE_ADD,
            operateTable = "db_ns",
            systemModule = OperationModuleType.DOMAIN_NS,
            description = "新建【命名词典】：{param}",
            descriptionParamClass = NamingStandardDto.class,
            descriptionParamMethod = "getChineseName"
    )
    @PostMapping(value = "/ns/createNs")
    @Operation(summary = "创建业务术语")
    public NamingStandardDto createNamingStandards(@RequestBody NamingStandardDto namingStandardDto,
                                                   HttpServletRequest request) {
        return domainService.addNamingStandard(namingStandardDto, getCurrentUser(request));
    }

    @OperatorLog(
            operation = OperationLogType.TABLE_MODIFY,
            operateTable = "db_ns",
            systemModule = OperationModuleType.DOMAIN_NS,
            description = "修改【命名词典】：{param}",
            descriptionParamClass = NamingStandardDto.class,
            descriptionParamMethod = "getChineseName"
    )
    @PostMapping(value = "/ns/updateNs")
    @Operation(summary = "更新业务术语")
    public NamingStandardDto updateNamingStandards(@RequestBody NamingStandardDto namingStandard,
                                                   HttpServletRequest request) {
        return domainService.updateNamingStandard(namingStandard, getCurrentUser(request));
    }


//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_ns",
//            systemModule = OperationModuleType.DOMAIN_NS,
//            description = "删除命名词典，id为: {param}",
//            descriptionParamClass = ArrayList.class,
//            descriptionParamMethod = "toString"
//    )
    @Parameters({
            @Parameter(name = "ids", description = "业务术语集合", required = true)
    })
    @PostMapping(value = "/ns/deleteNs")
    @Operation(summary = "批量删除业务术语")
    public void deleteNamingStandards(@RequestBody List<Long> ids, HttpServletRequest request) {
        domainService.deleteNamingStandards(ids, getCurrentUser(request));
    }

//    @PostMapping (value = "/ddm/check", produces = {"application/json"})
//    @Operation(summary = "获取模型库中不符合该术语的表和字段")
//    public String checkNamingStandardInDDM(@Parameter(name = "currentPage", description = "当前页码") @RequestParam("currentPage")Integer currentPage,
//                                           @Parameter(name = "pageSize", description = "每页大小") @RequestParam("pageSize")Integer pageSize,
//                                           @Parameter(name = "modelIds", description = "模型id") @RequestParam(name = "modelIds", required = false) String modelIdsStr,
//                                           @Parameter(name = "chName", description = "中文名") @RequestParam("chName")String chName,
//                                           @Parameter(name = "abbr", description = "英文缩写") @RequestParam("abbr")String abbr,
//                                           @Parameter(name = "type", description = "查询对象类型") @RequestParam("type")long typeId,
//                                           @Parameter(name = "ignoreNonAuto", description = "是否过滤没有打开自动翻译功能的模型" ) @RequestParam(value = "ignoreNonAuto", defaultValue = "false") boolean ingoreNonAutoTranslatedModel) {
//        List<Long> modelIds = null;
//        try {
//            if (!Strings.isNullOrEmpty(modelIdsStr)) {
//                String[] ids = modelIdsStr.split(",");
//                modelIds = new ArrayList<>();
//                for (String id : ids) {
//                    modelIds.add(Long.parseLong(id));
//                }
//            } else {
//                modelIds = Collections.emptyList();
//            }
//        } catch (Exception ex) {
//            throw new IllegalArgumentException(msgService.getMessage("unknowModelId"));
//        }
//
//        return RemoteServiceGetter.getDatablauRemoteModelService()
//                .checkNamingStandard(modelIds, chName, abbr,
//                        currentPage, pageSize, typeId, ingoreNonAutoTranslatedModel);
//    }

    @PostMapping("/ns/getHistory")
    @Operation(summary = "得到业务术语的修改历史")
    public PageResult<EditHistory> getDomainHistory(@RequestBody NamingStandardQueryDto queryDto) {
        return domainService.getNamingStandardHistory(queryDto.getNsId(),
                queryDto.getPageSize(), queryDto.getCurrentPage());
    }

    @PostMapping("/ns/exportNs")
    @Operation(summary = "导出业务术语")
    public ResponseEntity<byte[]> exportNamingStandards() throws Exception {
        NsExportResult exportResult = domainService.exportNamingStandards();

        //增加日志
        addNsExportLog(exportResult.getExportNumbers());

        return DataUtility.generalResponseEntityByFile(exportResult.getContent());
    }

    protected void addNsExportLog(Integer exportNumbers) {
        try {
            String logMessage = msgService.getMessage("ns.log.export", exportNumbers);
            operationLogService.generateOperationLog(OperationModuleType.DOMAIN_NS, "db_ns",
                    OperationLogType.DATA_EXPORT, logMessage, AuthTools.currentUsername(), 0);
        } catch (Exception e) {
            LOGGER.error(e.getMessage());
        }
    }

    //    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "db_ns",
//            systemModule = OperationModuleType.DOMAIN_NS,
//            description = "导入命名词典"
//    )
    @Parameters({
            @Parameter(name = "file", description = "上传的文件", required = true)
    })
    @PostMapping("/ns/uploadNs")
    @Operation(summary = "创建导入业务术语的简单任务，返回任务的ID, 可以参见/simplejobs相关REST API")
    public String updateNamingStandardFile(@RequestParam("file") MultipartFile multipartFile,
                                         HttpServletRequest request) throws Exception {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        File file = DataUtility.uploadFile(multipartFile);
        String user = getCurrentUser(request);

        DataBlauHttpServletRequest dataBlauRequest = new DataBlauHttpServletRequest(request);

        return instantJobService.submitJob(
                new InstantJob<>() {
                    @Override
                    public void setProgressMonitor(InstantJobProgressMonitor monitor) {
                    }
                    @Override
                    public InstantJobResult call() {
                        try {
                            Set<GrantedAuthority> grantedAuthorities = userService.getUserFullAuthorities(user);
                            UsernamePasswordAuthenticationToken runAsAuthentication = new UsernamePasswordAuthenticationToken(user, "ignore it", grantedAuthorities);
                            SecurityContextHolder.setContext(SecurityContextHolder.createEmptyContext());
                            SecurityContextHolder.getContext().setAuthentication(runAsAuthentication);

                            ImportInstantJobResult result = new ImportInstantJobResult();

                            try {
                                result = domainService.importNamingStandards(file, user);

                                //增加日志
                                addNsUploadLog(result.getSuccess(), result.getFailed(), dataBlauRequest);
                            } catch (Exception e) {
                                result.setJobStatus(InstantJobStage.FAILED);
                                result.setErrorMessage(e.getMessage());
                                LOGGER.error(e.getMessage(), e);
                            } finally {
                                file.delete();
                            }

                            result.setJobStatus(InstantJobStage.FINISHED);
                            return result;
                        } finally {
                            SecurityContextHolder.clearContext();
                        }
                    }
                }, msgService.getMessage("import.naming") + sdf.format(new Date()), AuthTools.currentUsernameFailFast(), InstantJobType.IMPORT.toString());

    }

    protected void addNsUploadLog(int success, int failed, DataBlauHttpServletRequest request) {
        try {
            String logMessage = msgService.getMessage("ns.log.upload", success, failed);
            operationLogService.generateOperationLog(OperationModuleType.DOMAIN_NS, "db_ns",
                    OperationLogType.DATA_IMPORT, logMessage, AuthTools.currentUsername(), 0, request);
        } catch (Exception e) {
            LOGGER.error(e.getMessage(), e);
        }
    }

    @PostMapping("/ns/exportTemplate")
    @Operation(summary = "导出命名词典模板")
    public ResponseEntity<Resource> exportNsTemplate() throws Exception {
        ByteArrayOutputStream bos = null;
        try {
            String loc = DatablauUtility.getResourcePath("/standard/standard_template.xlsx");

            loc = URLDecoder.decode(loc, "UTF-8");

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
                    .encode("命名标准模版.xlsx", "utf-8")+ "\"");

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
