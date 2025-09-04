package com.datablau.domain.management.controller;

import com.andorj.common.data.EditHistory;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.api.MessageService;
import com.datablau.data.common.api.instantjob.InstantJob;
import com.datablau.data.common.api.instantjob.InstantJobProgressMonitor;
import com.datablau.data.common.api.instantjob.InstantJobService;
import com.datablau.data.common.data.instantjob.ImportInstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobStage;
import com.datablau.data.common.type.InstantJobType;
import com.datablau.domain.management.api.BusinessTermService;
import com.datablau.domain.management.api.DomainService;
import com.datablau.domain.management.dto.*;
import com.datablau.domain.management.impl.upload.BusinessTermExportFile;
import com.datablau.domain.management.utility.DataUtility;
import com.datablau.domain.management.utility.DatablauUtility;
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
import org.springframework.web.bind.annotation.*;
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
import java.util.Map;

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
    private BusinessTermService businessTermService;

    @PostMapping(value = "/category/getCategories")
    @Operation(summary = "得到业务术语所有分类")
    public List<String> getAllCategories() {
        return domainService.getAllCategories();
    }

    @GetMapping(value = "/ns/getNs/{id}")
    @Operation(summary = "查看业务术语详情")
    public BusinessTermDto queryBusinessTermById(@PathVariable("id") Long nsId) {
        return businessTermService.queryBusinessTermById(nsId);
    }

    @PostMapping("/ns/getNs")
    @Operation(summary = "查询业务术语")
    public PageResult<BusinessTermDto> getNamingStandards(@RequestBody BusinessTermQueryDto queryDto) {
        return businessTermService.getPageOfBusinessTermDto(queryDto);
    }

    @PostMapping(value = "/ns/createNs")
    @Operation(summary = "创建业务术语")
    public BusinessTermDto createNamingStandards(@RequestBody BusinessTermDto businessTermDto,
                                                 @RequestParam(name = "published", defaultValue = "false") Boolean published,
                                                 HttpServletRequest request) {
        return businessTermService.addBusinessTerm(businessTermDto, getCurrentUser(request), published);
    }

    @GetMapping(value = "/ns/chart")
    @Operation(summary = "获取业务术语统计结果")
    public BusinessTermChartDto getNsChart() {
        return businessTermService.getNsChart();
    }

    @PostMapping("/ns/checkNSNameConflicts")
    @Operation(summary = "检查业务术语是否唯一")
    public Boolean checkBusinessNameConflicts(@RequestBody String nsName) {
        return businessTermService.checkNsNameConflicts(nsName);
    }

    @PostMapping(value = "/ns/updateNs")
    @Operation(summary = "更新业务术语")
    public BusinessTermDto updateNamingStandards(@RequestBody BusinessTermDto businessTermDto,
                                                 HttpServletRequest request) {
        return businessTermService.updateBusinessTerm(businessTermDto, getCurrentUser(request));
    }
    @PostMapping(value = "/ns/moveNs")
    @Operation(summary = "移动业务术语")
    public Boolean moveNamingStandards(@RequestParam("id") Long id, @RequestBody List<BusinessTermDto> businessTermDtos,
                                                 HttpServletRequest request) {
        return businessTermService.moveTo(id, businessTermDtos, getCurrentUser(request));
    }

    @Parameters({
            @Parameter(name = "ids", description = "业务术语集合", required = true)
    })
    @PostMapping(value = "/ns/deleteNs")
    @Operation(summary = "批量删除业务术语")
    public void deleteNamingStandards(@RequestBody List<Long> ids, HttpServletRequest request) {
        businessTermService.deleteBusinessTerm(ids, getCurrentUser(request));
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
        return businessTermService.getNamingStandardHistory(queryDto);
    }

    @PostMapping("/ns/exportNs")
    @Operation(summary = "导出业务术语")
    public ResponseEntity<byte[]> exportNamingStandards(@RequestBody(required = false) List<Long> ids) throws Exception {
        BusinessTermExportFile exportFile = (new BusinessTermExportFile(ids)).addUdpAttributeToTemplate().exportStandardCode();
//        return new StandardExportResult(exportFile.getCopyFile(), exportFile.getExportNumbers());
        return DataUtility.generalResponseEntityByFile(exportFile.getCopyFile());
    }

    @Parameters({
            @Parameter(name = "file", description = "上传的文件", required = true)
    })
    @PostMapping("/ns/uploadNs")
    @Operation(summary = "创建导入业务术语的简单任务，返回任务的ID, 可以参见/simplejobs相关REST API")
    public String updateNamingStandardFile(@RequestParam("file") MultipartFile multipartFile,
                                           @RequestParam(value = "categoryId", defaultValue = "1") Long categoryId,
                                           @RequestParam(value = "published", defaultValue = "false") Boolean published,
                                           @RequestParam(value = "ignoreError", defaultValue = "false") boolean ignoreError,
//                                           @RequestParam(value = "autoGenCode", defaultValue = "false") boolean autoGenCode,
                                           @Parameter(name = "publishUpload", description = "是否发布导入", required = true)
                                           @RequestParam(value = "publishUpload", defaultValue = "false") boolean publishUpload,
                                           HttpServletRequest request) throws Exception {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        File file = DataUtility.uploadFile(multipartFile);
        String user = getCurrentUser(request);

        boolean autoGenCode = true;
        return instantJobService.submitJob(
                new InstantJob<>() {
                    @Override
                    public void setProgressMonitor(InstantJobProgressMonitor monitor) {
                    }

                    @Override
                    public InstantJobResult call() {
                        ImportInstantJobResult result = new ImportInstantJobResult();

                        try {
                            result = businessTermService.importBusinessTerm(autoGenCode, file, published, user, ignoreError, categoryId, publishUpload);
                        } catch (Exception e) {
                            result.setJobStatus(InstantJobStage.FAILED);
                            result.setErrorMessage(e.getMessage());
                            LOGGER.error(e.getMessage(), e);
                        } finally {
                            file.delete();
                        }

                        result.setJobStatus(InstantJobStage.FINISHED);
                        return result;
                    }
                }, msgService.getMessage("import.businessTerm") + sdf.format(new Date()), AuthTools.currentUsernameFailFast(), InstantJobType.IMPORT.toString());

    }

    @PostMapping("/ns/exportTemplate")
    @Operation(summary = "导出命名词典模板")
    public ResponseEntity<Resource> exportNsTemplate() throws Exception {
        ByteArrayOutputStream bos = null;
        try {
            String loc = DatablauUtility.getResourcePath("/domain/business_term_template.xlsx");

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
                    .encode("业务术语模版.xlsx", "utf-8") + "\"");

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
