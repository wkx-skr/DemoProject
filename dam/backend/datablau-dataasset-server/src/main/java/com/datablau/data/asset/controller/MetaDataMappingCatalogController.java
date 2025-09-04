package com.datablau.data.asset.controller;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.data.PageResult;
import com.datablau.data.asset.dto.ManualMappingImportResultDto;
import com.datablau.data.asset.dto.MetaDataAutoMappingDto;
import com.datablau.data.asset.dto.MetaDataManualMappingExcelDto;
import com.datablau.data.asset.dto.MetaDataMappingCatalogDto;
import com.datablau.data.asset.dto.MetaDataMappingQueryParamDto;
import com.datablau.data.asset.jpa.entity.MetaDataMappingCatalogLog;
import com.datablau.data.asset.service.MetaDataMappingCatalogService;
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

@Tag(name = "资产-元数据映射相关 API")
@RestController
@RequestMapping(value = "/meta/mapping")
public class MetaDataMappingCatalogController {

    private static final Logger logger = LoggerFactory.getLogger(MetaDataMappingCatalogController.class);

    @Autowired
    private MetaDataMappingCatalogService metaDataMappingCatalogService;
    @Autowired
    private InstantJobService instantJobService;

    @Operation(summary = "自动映射")
    @PostMapping("/createAutoMapping")
    public void createAutoMapping(@RequestBody MetaDataAutoMappingDto autoMappingDto) {
        try {
            metaDataMappingCatalogService.createAutoMapping(autoMappingDto);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Operation(summary = "/分页查询映射")
    @PostMapping("/queryMappingPage")
    public PageResult<MetaDataMappingCatalogDto> queryMappingPage(@RequestBody MetaDataMappingQueryParamDto queryParamDto) throws Exception {
        return metaDataMappingCatalogService.queryMappingPage(queryParamDto);
    }

    @Operation(summary = "查看映射记录")
    @GetMapping("/queryMappingLog")
    public List<MetaDataMappingCatalogLog> queryMappingLog(@RequestParam Long mappingId) {
        return metaDataMappingCatalogService.queryMappingLogByMappingId(mappingId);
    }

    @Operation(summary = "取消映射记录")
    @PostMapping("/cancelMapping")
    public void cancelMapping(@RequestBody List<Long> mappingIds) {
        metaDataMappingCatalogService.cancelMapping(mappingIds);
    }
    @Operation(summary = "下载元数据映射关系模板")
    @PostMapping("/downloadMetaDataMappingTemplate")
    public void downloadMetaDataMappingTemplate(HttpServletResponse response) {
        File file = metaDataMappingCatalogService.downloadMetaDataMappingTemplate();
        String realName = "";

        try {
            realName = URLEncoder.encode("映射关系模板", "UTF-8");
            realName = realName.replace("+", "%20");
        } catch (Exception ex) {
            logger.warn("Failed to convert template file name");
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
        List<MetaDataManualMappingExcelDto> manualMappingExcelDtos = Lists.newArrayList();
        List<Object> objects = ExcelUtil.readMultipartFile(multipartFile);
        MetaDataManualMappingExcelDto mappingExcelDto;
        for (Object data : objects) {
            HashMap<String, String> excelData = (HashMap<String, String>) data;
            mappingExcelDto = new MetaDataManualMappingExcelDto();
            mappingExcelDto.setCatalogL3Name(excelData.get("DL3英文名"));
            mappingExcelDto.setCatalogL4Name(excelData.get("DL4英文名"));
            mappingExcelDto.setCatalogL5Name(excelData.get("DL5英文名"));
            mappingExcelDto.setModelCategoryName(excelData.get("应用系统名称"));
            mappingExcelDto.setModelName(excelData.get("数据源"));
            mappingExcelDto.setDatabaseName(excelData.get("数据库"));
            mappingExcelDto.setTableName(excelData.get("表英文名"));
            mappingExcelDto.setColumnName(excelData.get("字段英文名"));
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
                    importResult = metaDataMappingCatalogService.upload(manualMappingExcelDtos);;
                    FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                    result.setErrorMessage(JsonUtils.toJSon(importResult));
                    result.setJobStatus(InstantJobStage.FINISHED);
                    return result;
                }
            }, "元数据手动映射导入" + sdf.format(new Date()), currentUser, EnumJobType.IMPORT.name());
        } catch (Exception ex) {
            logger.error(ex.getMessage());
            throw new UnexpectedStateException(ex.getMessage());
        }
        return submitJob;
    }

}
