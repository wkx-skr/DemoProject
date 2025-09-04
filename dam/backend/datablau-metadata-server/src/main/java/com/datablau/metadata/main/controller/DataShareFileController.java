package com.datablau.metadata.main.controller;

import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.api.MessageService;
import com.datablau.base.api.ObjectVisitService;
import com.datablau.common.kafka.producer.KafkaProducer;
import com.datablau.data.common.api.OperationLogService;
import com.datablau.data.common.operation.type.OperationLogType;
import com.datablau.data.common.operation.type.OperationModuleType;
import com.datablau.metadata.common.dto.metadata.DataShareFileDto;
import com.datablau.metadata.main.entity.share.file.DataShareFile;
import com.datablau.metadata.main.service.share.file.api.DataShareFileService;
import com.datablau.metadata.main.service.share.file.dto.DataShareFileCatalogDto;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.net.URLEncoder;
import java.util.List;

@RestController
@RequestMapping("/shareFile")
@Tag(name = "文件分享 API ")
public class DataShareFileController extends LocalBaseController {
    private static final Logger log = LoggerFactory.getLogger(DataShareFileController.class);


    @Autowired
    DataShareFileService shareFileService;
    @Autowired
    private ObjectVisitService objectVisitService;
    @Autowired
    private KafkaProducer kafkaProducer;
    @Autowired
    private OperationLogService operationLogService;
    @Autowired
    private MessageService msgService;


    @Value("${datablau.kafka-topic.file-desc-update}")
    public String updateFileTopic;

    public DataShareFileController(@Autowired RoleService roleService) {
        super(roleService);
    }

    @Operation(summary = "获取用户详细信息")
    @GetMapping(value = "/folder")
    public PageResult<DataShareFile> getDataShareFile(DataShareFileDto dto){
        return shareFileService.getDataShareFile(dto);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "dam_share_file",
//            systemModule = OperationModuleType.METADATA_SHAREFILE,
//            description = "查询文件"
//    )
    @Operation(summary = "获取某个tree节点下所有文件")
    @PostMapping(value = "/folder/page")
    public PageResult<DataShareFileDto> getDataShareFileNew(@RequestBody DataShareFileDto dto){
        return shareFileService.getDataShareFileNew(dto);
    }

    @Operation(summary = "删除某个文件")
    @DeleteMapping(value = "/folder/{id}")
    public void deleteDataShareFileById(@PathVariable(value = "id") Long id){
        shareFileService.deleteDataShareFileById(id);
    }

    @Operation(summary = "删除多个文件")
    @DeleteMapping(value = "/folder/")
    public void deleteDataShareFileByIds(@RequestBody List<Long> ids){
        shareFileService.deleteDataShareFileByIds(ids);
    }

    @Operation(summary = "更新文件id")
    @PostMapping(value = "/folder")
    public void updateDataShareFileById(@RequestBody DataShareFile assets){
        shareFileService.updateDataShareFileById(assets);
        //同步数据资产es
        DataShareFileDto fileDto = new DataShareFileDto();
        fileDto.setId(assets.getId());
        fileDto.setDescription(assets.getDescription());
        kafkaProducer.sendMessage(updateFileTopic,fileDto);

        //增加日志
        addDataShareFileCommonLog(msgService.getMessage("metadata.file.desc.log.modify", assets.getName()),
                OperationLogType.TABLE_MODIFY);
    }

    @Operation(summary = "搜索文件")
    @Parameters({@Parameter(name = "id", description = "文件id", in = ParameterIn.PATH)})
    @GetMapping(value = "/folder/{id}")
    public DataShareFile findDataShareFileById(@PathVariable("id") Long id){
        DataShareFile dataShareFile = shareFileService.findDataShareFileById(id);
        objectVisitService.asyncIncrementVisitCount(id.toString(),
            LDMTypes.oUnstructuredDataAssets, AuthTools.currentUsernameFailFast());

        //增加日志
        addDataShareFileCommonLog(msgService.getMessage("metadata.file.log.query", dataShareFile.getName()),
                OperationLogType.TABLE_QUERY);

        return dataShareFile;
    }

    protected void addDataShareFileCommonLog(String logMessage, OperationLogType operationLogType) {
        try {
            operationLogService.generateOperationLog(OperationModuleType.METADATA_SHAREFILE, "dam_share_file",
                    operationLogType, logMessage, AuthTools.currentUsername(), 0);
        } catch (Exception e) {
            log.error(e.getMessage());
        }
    }


    @Operation(summary = "获取文件目录")
    @GetMapping(value = "/catalog")
    public DataShareFileCatalogDto getShareFileCatalog() {
        return shareFileService.getShareFileCatalog();
    }

    @Operation(summary = "下载某个文件")
    @Parameters({@Parameter(name = "fileId", description = "文件id", in = ParameterIn.PATH)})
    @GetMapping(value = "/download/{fileId}")
    public ResponseEntity<byte[]> downloadFileById(@PathVariable("fileId") Long id) throws Exception{
        File file = shareFileService.downloadFileById(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);

        String realName = file.getName();
        try {
            realName = URLEncoder.encode(realName, "UTF-8");
            realName = realName.replace("+", "%20");
        } catch (Exception ex) {

        }

        headers.setContentDispositionFormData("attachment", realName);
        return new ResponseEntity<>(FileUtils.readFileToByteArray(file), headers, HttpStatus.CREATED);
    }


}
