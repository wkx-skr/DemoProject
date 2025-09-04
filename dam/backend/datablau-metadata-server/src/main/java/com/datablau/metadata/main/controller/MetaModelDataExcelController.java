package com.datablau.metadata.main.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.core.model.ModelX;
import com.andorj.model.common.api.MessageService;
import com.datablau.data.common.api.instantjob.InstantJob;
import com.datablau.data.common.api.instantjob.InstantJobProgressMonitor;
import com.datablau.data.common.api.instantjob.InstantJobService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.data.FileDescriptor;
import com.datablau.data.common.data.instantjob.FileGenerateInstantJobResult;
import com.datablau.data.common.data.instantjob.ImportInstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobStage;
import com.datablau.data.common.type.InstantJobType;
import com.datablau.metadata.common.dto.metamodel.MetaModelDataDto;
import com.datablau.metadata.common.dto.metamodel.MetaModelDataUpdateDto;
import com.datablau.metadata.common.dto.metamodel.MetaModelDto;
import com.datablau.metadata.main.entity.model.Model;
import com.datablau.metadata.main.service.metadata.api.MetaModelDataService;
import com.datablau.metadata.main.service.metamodel.MetaModelService;
import com.datablau.metadata.main.service.model.api.DataModelService;
import com.datablau.metadata.main.util.DataUtility;
import com.datablau.metadata.main.util.FileUtility;
import com.datablau.metadata.main.util.ModelUtility;
import com.datablau.metadata.main.util.metamodel.excel.MetaObjectEntity;
import com.datablau.metadata.main.util.metamodel.excel.MetaObjectExcelWriter;
import com.datablau.metadata.main.util.metamodel.excel.MetaObjectGenerateUtility;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.utils.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.xml.sax.SAXException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.ParserConfigurationException;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * M0 數據導入到處
 */
@Tag(name = "元模型Excel 导入导出", description = "/mm/data/excel")
@RequestMapping("/mm/data/excel")
@RestController
public class MetaModelDataExcelController extends BaseController {
    private static final Logger LOGGER = LoggerFactory.getLogger(MetaModelDataExcelController.class);


    @Autowired
    private MetaModelService metaModelService;

    @Autowired
    private MetaModelDataService metaModelDataService;

    @Autowired
    public MessageService msgService;

    @Autowired
    private InstantJobService instantJobService;

    @Autowired
    private FileUtility fileUtility;

    @Autowired
    private UserService userService;

    @Autowired
    private DataModelService dataModelService;

    /**
     * 获取元模型信息，若不传参则返回全部
     */
    @GetMapping("/getTemplate/{metaModelCode}")
    public void getTemplate(
            @Description("元模型编码") @PathVariable("metaModelCode") String metaModelCode,
            HttpServletResponse response
    ) {

        // TODO 更换成 metaModelCode 直接获取 ModelX
        List<MetaModelDto> metaModels = metaModelService.getMetaModels();
        MetaModelDto restApiDto = null;
        for (MetaModelDto metaModelDto : metaModels) {
            System.out.println(metaModelDto.getCode());
            if (metaModelCode.equals(metaModelDto.getCode())) {
                restApiDto = metaModelDto;
            }
        }

        if (restApiDto == null) {
            throw new InvalidArgumentException(msgService.getMessage("metamodel.not_found", "MetaModelCode:" + metaModelCode));
        }

        ModelX modelx = null;
        try {
            modelx = ModelUtility.getMetaModel(restApiDto.getId().toString());
        } catch (ParserConfigurationException | SAXException | IOException e) {
            throw new RuntimeException(e);
        }

        OutputStream os = null;
        try {
            os = response.getOutputStream();
            MetaObjectEntity metaObjectEntity = MetaObjectGenerateUtility.convert(modelx);
            MetaObjectExcelWriter metaObjectExcelWriter = new MetaObjectExcelWriter(metaObjectEntity);
            metaObjectExcelWriter.generateExcelTemplate(os);
            os.flush();
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            if (os != null) {
                try {
                    os.close();
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
        }

        response.setContentType("application/octet-stream");
        response.setHeader("Content-Disposition", "attachment;filename=" + System.currentTimeMillis());
    }

    @PostMapping("/import/{metaModelCode}/{modelId}")
    public void importByExcel(
            @Description("元模型编码") @PathVariable("metaModelCode") String metaModelCode,
            @Description("元数据id") @PathVariable("modelId") long modelId
    ) {

    }

    @PostMapping("/export/{metaModelCode}/{modelId}")
    public void exportByExcel(
            @Description("元模型编码") @PathVariable("metaModelCode") String metaModelCode,
            @Description("元数据id") @PathVariable("modelId") long modelId
    ) {

    }


    @PostMapping("/importMetaModel")
    public String importMetaModel(@Description("数据源id") @RequestParam("modelId") long modelId,
                                  @RequestParam("file") MultipartFile multipartFile) throws Exception {
        String fileName = multipartFile.getOriginalFilename();
        if (fileName == null) {
            throw new UnexpectedStateException(msgService.getMessage("fileNameIsNull"));
        }
        String type = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        if (!"xlsx".equals(type)) {
            throw new UnexpectedStateException(msgService.getMessage("fileNameOnlySupport"));
        }
        File uploadedFile = DataUtility.uploadFile(multipartFile);

        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        String username = AuthTools.currentUsernameFailFast();
        return instantJobService.submitJob(new InstantJob<>() {
                                               @Override
                                               public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                               }

                                               @Override
                                               public InstantJobResult call() {
                                                   try {
                                                       Set<GrantedAuthority> grantedAuthorities = userService.getUserFullAuthorities(username);
                                                       UsernamePasswordAuthenticationToken runAsAuthentication = new UsernamePasswordAuthenticationToken(username, "ignore it", grantedAuthorities);
                                                       SecurityContextHolder.setContext(SecurityContextHolder.createEmptyContext());
                                                       SecurityContextHolder.getContext().setAuthentication(runAsAuthentication);

                                                       ImportInstantJobResult jobResult = new ImportInstantJobResult();
                                                       try (FileInputStream fileInputStream = new FileInputStream(uploadedFile)) {
                                                           ModelX execlUpdateDataModelXC = metaModelDataService.loadDataModelXFromExcel(modelId, fileInputStream);
                                                           metaModelDataService.saveWithCompare(modelId, execlUpdateDataModelXC, false);
                                                       } catch (Throwable e) {
                                                           //todo 记录错误数
                                                           throw new AndorjRuntimeException(e.getMessage(), e);
                                                       }
                                                       jobResult.setShowNumber(false);
                                                       jobResult.setJobStatus(InstantJobStage.FINISHED);

                                                       return jobResult;
                                                   } catch (Throwable e) {
                                                       LOGGER.error(e.getMessage(), e);
                                                       throw new AndorjRuntimeException(e.getMessage(), e);
                                                   } finally {
                                                       SecurityContextHolder.clearContext();
                                                   }
                                               }
                                           }
                , msgService.getMessage("metadataImportUpdateTask") + sdf.format(new Date()), AuthTools.currentUsernameFailFast(), InstantJobType.IMPORT.toString());
    }

    @PostMapping("/exportMetaModelTemplate")
    public void exportMetaModelTemplate(@Description("数据源id") @RequestParam("modelId") long modelId,
                                        HttpServletResponse response) {
        Model dataModel = dataModelService.getDataModelById(modelId);

        String tempPath = com.andorj.model.common.utility.FileUtility.getTempFolder();
        File file = new File(tempPath + File.separator + UUID.randomUUID() + ".xlsx");

        try (FileOutputStream fileOutputStream = new FileOutputStream(file)){
            metaModelDataService.exportTemplate(modelId, fileOutputStream);
        } catch (Throwable e) {
            throw new AndorjRuntimeException(e.getMessage(), e);
        }

        String encodedFileName = URLEncoder.encode(dataModel.getDefinition() + "-模版.xlsx", StandardCharsets.UTF_8);

        response.setContentType("application/octet-stream");
        response.setHeader("Content-disposition", "attachment; filename=" + encodedFileName);
        response.setHeader("Content-Length", String.valueOf(file.length()));

        try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream(file));
             BufferedOutputStream bos = new BufferedOutputStream(response.getOutputStream())) {
            byte[] buff = new byte[2048];
            int bytesRead;
            while (-1 != (bytesRead = bis.read(buff, 0, buff.length))) {
                bos.write(buff, 0, bytesRead);
            }
        } catch (Throwable ex) {
            throw new IllegalStateException(msgService.getMessage("failedToExportModelFile", ex.getMessage()));
        } finally {
            file.delete();
        }
    }

    @PostMapping("/exportMetaModel")
    public String exportMetaModel(@Description("数据源id") @RequestParam("modelId") long modelId) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        String username = AuthTools.currentUsernameFailFast();
        return instantJobService.submitJob(new InstantJob<>() {
                                               @Override
                                               public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                               }

                                               @Override
                                               public InstantJobResult call() {
                                                   try {
                                                       Set<GrantedAuthority> grantedAuthorities = userService.getUserFullAuthorities(username);
                                                       UsernamePasswordAuthenticationToken runAsAuthentication = new UsernamePasswordAuthenticationToken(username, "ignore it", grantedAuthorities);
                                                       SecurityContextHolder.setContext(SecurityContextHolder.createEmptyContext());
                                                       SecurityContextHolder.getContext().setAuthentication(runAsAuthentication);

                                                       String tempPath = com.andorj.model.common.utility.FileUtility.getTempFolder();
                                                       File file = new File(tempPath + File.separator + UUID.randomUUID() + ".xlsx");

                                                       try (FileOutputStream fileOutputStream = new FileOutputStream(file)) {
                                                           metaModelDataService.exportDataModelXToExcel(modelId, fileOutputStream);
                                                       } catch (Throwable e) {
                                                            throw new AndorjRuntimeException(e.getMessage(), e);
                                                       }

                                                       FileDescriptor fileDescriptor = fileUtility.uploadFile(file, msgService.getMessage("modelControl.uploadFile"), username, false);
                                                       FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                       result.setFileId(fileDescriptor.getFileId());
                                                       result.setJobStatus(InstantJobStage.FINISHED);

                                                       return result;
                                                   } catch (Throwable e) {
                                                       LOGGER.error(e.getMessage(), e);
                                                       throw new AndorjRuntimeException(e.getMessage(), e);
                                                   } finally {
                                                       SecurityContextHolder.clearContext();
                                                   }
                                               }
                                           }
                , msgService.getMessage("modelControl.exportFile") + sdf.format(new Date()), AuthTools.currentUsernameFailFast(), InstantJobType.EXPORT.toString());
    }

    /**
     * @description: 通过Json 数据导入 M0;  Json 格式：
     * @param: [modelId, JsonData]
     * @return: void
     * @author: Wang Tong
     * @date: 2025/4/11-10:29
     * @see com.datablau.metadata.main.util.metamodel.json.MetaObjectJsonReader
     */
    @PostMapping("/importData")
    public void importData(@Description("数据源id") @RequestParam("modelId") long modelId,
                           @RequestBody String JsonData) throws Exception {
        ModelX jsonDataModelXC = metaModelDataService.loadDataModelXFromJson(modelId, JsonData);
        metaModelDataService.saveWithCompare(modelId, jsonDataModelXC, false);

    }

    /**
     * 合并多个字节数组为一个大的字节数组
     *
     * @param byteArrays 字节数组列表
     * @return 合并后的字节数组
     */
    public static byte[] combineBytes(List<byte[]> byteArrays) {
        // 计算总长度
        int totalLength = byteArrays.stream().mapToInt(arr -> arr.length).sum();

        // 创建目标数组
        byte[] result = new byte[totalLength];

        // 复制数据
        int offset = 0;
        for (byte[] array : byteArrays) {
            System.arraycopy(array, 0, result, offset, array.length);
            offset += array.length;
        }

        return result;
    }

    @Deprecated
    @PostMapping(value = "/streamImportData", consumes = "application/octet-stream")
    public Mono<String> handleRawStream(@Description("数据源id") @RequestParam("modelId") long modelId,
                                        @RequestBody Flux<DataBuffer> body) {
        return body
                .map(dataBuffer -> {
                    try {
                        byte[] bytes = new byte[dataBuffer.readableByteCount()];
                        dataBuffer.read(bytes);
                        return bytes;
                    } finally {
                        DataBufferUtils.release(dataBuffer);
                    }
                })
                .collectList()
                .handle((bytesList, sink) -> {
                    try {
                        byte[] allBytes = combineBytes(bytesList);
                        String content = new String(allBytes, StandardCharsets.UTF_8);
                        ModelX model = metaModelDataService.loadDataModelXFromJson(modelId, content);
//                        metaModelDataService.saveWithCompare(modelId, model);
                        sink.next("Import successful");
                    } catch (Exception e) {
                        sink.error(new ResponseStatusException(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "Data processing failed", e));
                    }
                });


    }

    @Operation(summary = "元模型 界面手动删除数据")
    @PostMapping("/delete")
    public void deleteMetaModelData(@RequestBody MetaModelDataDto metaModelDataDto) {
        metaModelDataService.deleteData(metaModelDataDto.getModelId(), metaModelDataDto.getDataObjectIds());
    }

    @Operation(summary = "元模型 详情页面更新属性值 ")
    @PostMapping("/update")
    public void updateProperties(@RequestBody MetaModelDataUpdateDto updateDto) {
        metaModelDataService.updateProperties(updateDto.getDataObjectId(), updateDto.getUpdateProperties());
    }


}
