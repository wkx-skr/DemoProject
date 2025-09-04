package com.datablau.data.asset.controller;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.data.PageResult;
import com.datablau.catalog.jpa.entity.CommonCatalog;
import com.datablau.data.asset.dto.DdmAutoMappingDto;
import com.datablau.data.asset.dto.DdmAutoMappingQueryParamDto;
import com.datablau.data.asset.dto.DdmManualMappingExcelDto;
import com.datablau.data.asset.dto.ManualMappingImportResultDto;
import com.datablau.data.asset.dto.DdmMappingCatalogDto;
import com.datablau.data.asset.dto.DdmMappingQueryParamDto;
import com.datablau.data.asset.jpa.entity.DdmMappingCatalogLog;
import com.datablau.data.asset.service.DdmMappingCatalogService;
import com.datablau.data.common.api.instantjob.InstantJob;
import com.datablau.data.common.api.instantjob.InstantJobProgressMonitor;
import com.datablau.data.common.api.instantjob.InstantJobService;
import com.datablau.data.common.data.instantjob.EnumJobType;
import com.datablau.data.common.data.instantjob.FileGenerateInstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobStage;
import com.datablau.data.common.util.ExcelUtil;
import com.datablau.data.common.util.JsonUtils;
import com.datablau.security.management.utils.AuthTools;
import com.google.common.collect.Lists;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

@Tag(name = "资产-模型映射相关 API")
@RestController
@RequestMapping(value = "/ddm/mapping")
public class DdmMappingCatalogController {
    private static final Logger LOGGER = LoggerFactory.getLogger(DdmMappingCatalogController.class);

    @Autowired
    private DdmMappingCatalogService ddmMappingCatalogService;

    @Autowired
    private InstantJobService instantJobService;

    @Operation(summary = "业务对象查询")
    @PostMapping("/queryBusinessObject")
    public List<CommonCatalog> queryBusinessDomain(@RequestBody DdmAutoMappingQueryParamDto queryDto) {
        return ddmMappingCatalogService.queryBusinessDomain(queryDto);
    }


    @Operation(summary = "自动映射")
    @PostMapping("/createAutoMapping")
    public void createAutoMapping(@RequestBody DdmAutoMappingDto autoMappingDto) throws Exception {
        ddmMappingCatalogService.createAutoMapping(autoMappingDto);
    }

    @Operation(summary = "模型映射管理查询")
    @PostMapping("/queryDdmMappingCatalogPage")
    public PageResult<DdmMappingCatalogDto> queryDdmMappingCatalogPage(@RequestBody DdmMappingQueryParamDto paramDto) throws Exception {
        return ddmMappingCatalogService.queryDdmMappingCatalogPage(paramDto);
    }

    @Operation(summary = "查看映射记录")
    @GetMapping("/queryMappingLog")
    public List<DdmMappingCatalogLog> queryDdmMappingCatalogLog(@RequestParam Long mappingId) throws Exception {
        return ddmMappingCatalogService.queryDdmMappingCatalogLogs(mappingId);
    }

    @Operation(summary = "取消映射记录")
    @PostMapping("/cancelMapping")
    public void cancelMapping(@RequestBody List<Long> mappingIds) {
        ddmMappingCatalogService.cancelMapping(mappingIds);
    }

    @Operation(summary = "下载映射关系模板")
    @PostMapping("/downloadMappingTemplate")
    public void downloadMappingTemplate(HttpServletResponse response) throws Exception {
        File file = ddmMappingCatalogService.downloadMappingTemplate();
        String realName = "";

        try {
            realName = URLEncoder.encode("映射关系模板", "UTF-8");
            realName = realName.replace("+", "%20");
        } catch (Exception ex) {
            LOGGER.warn("Failed to convert template file name");
        }


        response.setHeader("Content-disposition", "attachment; filename=" + realName + ".xlsx");
        response.setHeader("Content-Length", String.valueOf(file.length()));

        try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream(file));
             BufferedOutputStream bos = new BufferedOutputStream(response.getOutputStream())) {
            byte[] buff = new byte[2048];
            int bytesRead;
            while (-1 != (bytesRead = bis.read(buff, 0, buff.length))) {
                bos.write(buff, 0, bytesRead);
            }

        } catch (Exception ex) {
            throw new UnexpectedStateException("下载模板失败", ex);
        }
    }

    @Operation(summary = "上传映射文件")
    @PostMapping("/upload")
    public String upload(@RequestBody MultipartFile multipartFile) throws Exception {

        String currentUser = AuthTools.currentUsernameFailFast();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        final SecurityContext context = SecurityContextHolder.getContext();
        String submitJob;
        List<DdmManualMappingExcelDto> manualMappingExcelDtos = Lists.newArrayList();
        List<Object> objects = ExcelUtil.readMultipartFile(multipartFile);
        DdmManualMappingExcelDto mappingExcelDto;
        for (Object data : objects) {
            HashMap<String, String> excelData = (HashMap<String, String>) data;
            mappingExcelDto = new DdmManualMappingExcelDto();
            mappingExcelDto.setCatalogL3Name(excelData.get("DL3英文名"));
            mappingExcelDto.setCatalogL4Name(excelData.get("DL4英文名"));
            mappingExcelDto.setCatalogL5Name(excelData.get("DL5英文名"));
            mappingExcelDto.setDdmCategoryPath(excelData.get("模型路径"));
            mappingExcelDto.setDdmModelName(excelData.get("模型名称"));
            mappingExcelDto.setDdmModelEntityName(excelData.get("模型实体英文名"));
            mappingExcelDto.setDdmModelColumnName(excelData.get("模型属性英文名"));
            manualMappingExcelDtos.add(mappingExcelDto);
        }
        try {
            submitJob = instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                                               @Override
                                                               public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                                               }

                                                               @Override
                                                               public InstantJobResult call() throws Exception {
                                                                   SecurityContextHolder.setContext(context);
                                                                   ManualMappingImportResultDto importResult = new ManualMappingImportResultDto();
                                                                   importResult = ddmMappingCatalogService.upload(manualMappingExcelDtos);;
                                                                   FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                                   result.setErrorMessage(JsonUtils.toJSon(importResult));
                                                                   result.setJobStatus(InstantJobStage.FINISHED);
                                                                   return result;
                                                               }
                                                           }, "模型手动映射导入" + sdf.format(new Date()), currentUser, EnumJobType.IMPORT.name());
        } catch (Exception ex) {
            LOGGER.error(ex.getMessage());
            throw new UnexpectedStateException(ex.getMessage());
        }
        return submitJob;
    }

    @Operation(summary = "业务对象查询")
    @PostMapping("/queryLogicDataEntity")
    public List<CommonCatalog> queryLogicDataEntity(@RequestBody DdmAutoMappingQueryParamDto queryDto) {
        Long businessObjectId = queryDto.getBusinessObjectId();
        return ddmMappingCatalogService.queryLogicDataEntity(businessObjectId);
    }
}
