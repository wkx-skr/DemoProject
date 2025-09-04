package com.datablau.data.quality.controller;

import com.andorj.model.common.api.MessageService;
import com.datablau.data.common.api.instantjob.InstantJob;
import com.datablau.data.common.api.instantjob.InstantJobProgressMonitor;
import com.datablau.data.common.api.instantjob.InstantJobService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.data.instantjob.ImportInstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobStage;
import com.datablau.data.common.type.InstantJobType;
import com.datablau.data.common.util.ShareKit;
import com.datablau.data.quality.data.DataQualityTechRuleTemplateDto;
import com.datablau.data.quality.data.DataQualityTemplateVo;
import com.datablau.data.quality.jpa.entity.DataQualityTemplate;
import com.datablau.data.quality.metadata.service.DataQualityTemplateService;
import com.datablau.data.quality.utility.ServerConstants;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.poi.ss.usermodel.Workbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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
import java.net.URLEncoder;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * @author Sean - Datablau
 * @date Mon, Jul 13, 2020
 */
@RestController
@RequestMapping("/template")
@Tag(name = "数据质量规则模板REST API")
public class DataQualityTemplateController extends BaseController {

    private static final Logger LOGGER = LoggerFactory.getLogger(DataQualityTemplateController.class);

    @Autowired
    private DataQualityTemplateService dataQualityTemplateService;

    @Autowired
    private InstantJobService instantJobService;
    @Autowired
    private MessageService msgService;

    public DataQualityTemplateController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "创建单个数据质量规则模板前调用本接口，获取自动生成的规则模板名字")
    @GetMapping(value = "/name")
    public String getTemplateName() {
        return dataQualityTemplateService.getTemplateName();
    }


    @Operation(summary = "创建单个数据质量规则模板")
//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "db_data_quality_template",
//            systemModule = OperationModuleType.QUALITY_RULE_TEMPLATE,
//            description = "新增规则模板，名为: {param}",
//            descriptionParamClass = DataQualityTemplate.class,
//            descriptionParamMethod = "getTemplateName"
//    )
    //@PreAuthorize(UserRights.QUALITY_RULE_TEMPLATE_ADD)
    @PostMapping(value = "/create")
    public Boolean createTemplate(@RequestBody DataQualityTemplate dataQualityTemplate) {
        return dataQualityTemplateService.createTemplate(dataQualityTemplate);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "db_data_quality_template",
//            systemModule = OperationModuleType.QUALITY_RULE_TEMPLATE,
//            description = "查询规则模板"
//    )
    @Operation(summary = "查询所有数据质量规则模板")
    @GetMapping(value = "/query")
    public List<DataQualityTemplate> queryTemplateListChangeTuAcct() {
        return dataQualityTemplateService.queryTemplate();
    }

    @Operation(summary = "查询所有数据质量规则模板")
    //@PreAuthorize(UserRights.QUALITY_RULE_TEMPLATE_VIEW)
    @PostMapping(value = "/query/page")
    public DataQualityTechRuleTemplateDto queryTemplatePage(
        @RequestBody DataQualityTechRuleTemplateDto reqDto) throws ParseException {
        return dataQualityTemplateService.queryTemplatePage(reqDto);
    }

    @Operation(summary = "修改数据质量规则模板")
//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "db_data_quality_template",
//            systemModule = OperationModuleType.QUALITY_RULE_TEMPLATE,
//            description = "修改规则模板，名称为: {param}",
//            descriptionParamClass = DataQualityTemplate.class,
//            descriptionParamMethod = "getTemplateName"
//    )
    @PostMapping(value = "/update")
    public Boolean updateTemplate(@RequestBody DataQualityTemplate dataQualityTemplate) {
        return dataQualityTemplateService.updateTemplate(dataQualityTemplate);
    }

    @Operation(summary = "测试数据质量规则模板")
    @PostMapping(value = "/test")
    public Boolean testTemplate(@RequestBody DataQualityTemplateVo vo) throws Exception {
        return dataQualityTemplateService.testTemplate(vo.getContent(),vo.getModelId());
    }

    @Operation(summary = "删除数据质量规则模板")
//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_data_quality_template",
//            systemModule = OperationModuleType.QUALITY_RULE_TEMPLATE,
//            description = "删除规则模板，id为: {param}",
//            descriptionParamClass = ArrayList.class,
//            descriptionParamMethod = "toString"
//    )
    //@PreAuthorize(UserRights.QUALITY_RULE_TEMPLATE_DELETE)
    @PostMapping(value = "/delete")
    public Boolean deleteTemplate(@RequestBody List<Long> ids) {
        return dataQualityTemplateService.deleteTemplate(ids);
    }

    @Operation(summary = "导出数据质量规则模板")
    //@PreAuthorize(UserRights.QUALITY_RULE_TEMPLATE_EXPORT)
    @PostMapping(value = "/export")
    public ResponseEntity<Resource> exportTemplate(@RequestBody List<Long> templateIds)
        throws Exception {
        ByteArrayOutputStream bos = null;
        Workbook wb = null;
        try {
            wb = dataQualityTemplateService.exportTemplates(templateIds);
            bos = new ByteArrayOutputStream();
            wb.write(bos);
            wb.close();
            HttpHeaders headers = new HttpHeaders();
            headers.add("cache-Control", "no-cache, no-store, must-revalidate");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");
            headers.add("charset", "utf-8");
            headers.add("Content-Disposition",
                "attachment;filename=\"" + URLEncoder.encode("数据质量规则模板.xlsx", "utf-8") + "\"");
            Resource resource = new InputStreamResource(
                new ByteArrayInputStream(bos.toByteArray()));
            return ResponseEntity.ok().headers(headers)
                .contentType(MediaType.parseMediaType("application/octet-stream")).body(resource);
        } finally {
            if (bos != null) {
                bos.close();
            }
        }
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "db_data_quality_template",
//            systemModule = OperationModuleType.QUALITY_RULE_TEMPLATE,
//            description = "导入规则模板"
//    )
    @Operation(summary = "导入数据质量规则模板")
    @Parameters({@Parameter(name = "file", description = "文件", in = ParameterIn.QUERY)})
    //@PreAuthorize(UserRights.QUALITY_RULE_TEMPLATE_IMPORT)
    @PostMapping(value = "/import")
    public String importTemplateByExcel(@RequestParam("file") MultipartFile originalFile,
                                        @Parameter(name = "ignoreError", description = "遇到错误是否继续导入", required = false)
                                        @RequestParam(value = "ignoreError", defaultValue = "false") boolean ignoreError,
                                        HttpServletRequest request)
        throws Exception {
        File file = ShareKit.uploadFile(originalFile);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        String user = getCurrentUser(request);

        return instantJobService.submitJob(
                new InstantJob<>() {
                    @Override
                    public void setProgressMonitor(InstantJobProgressMonitor monitor) {
                    }
                    @Override
                    public InstantJobResult call() {
                        ImportInstantJobResult result = new ImportInstantJobResult();

                        try {
                            result = dataQualityTemplateService.importTemplates(file, ignoreError, user);
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
                }, msgService.getMessage("import.template") + sdf.format(new Date()), AuthTools.currentUsernameFailFast(), InstantJobType.IMPORT.toString());
    }


    public String getCurrentUser(HttpServletRequest request) {
        String username = AuthTools.currentUsername();
        if (org.springframework.util.StringUtils.isEmpty(username)) {
            return request.getHeader("username");
        } else {
            return username;
        }
    }
}
