package com.datablau.base.server.controller;

import com.datablau.base.server.jpa.entity.LocalPluginFile;
import com.datablau.base.server.service.LocalPluginManagementService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.util.ShareKit;
import com.datablau.plugin.manager.data.PluginDescriptor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;

/**
 * @author nicky - 数语科技有限公司
 * date 2023/11/14 15:46
 */
@RequestMapping("/plugins")
@RestController
@Tag(name = "插件管理", description = "/plugins")
public class PluginController extends BaseController {

    private static final Logger LOGGGER = LoggerFactory.getLogger(PluginController.class);

    @Autowired
    private LocalPluginManagementService localPluginManagementService;

//    @OperatorLog(
//        operation = OperationLogType.DATA_UPLOAD,
//        operateTable = "db_file",
//        systemModule = OperationModuleType.SYSTEM_PLUGIN,
//        description = "上传插件"
//    )
    @Operation(summary = "上传插件压缩包")
    @Parameters({
        @Parameter(name = "file", description = "文件", in = ParameterIn.QUERY, required = true)})
    @PostMapping(value = "/uploadPlugin")
    public PluginDescriptor uploadFile(@RequestParam("file") MultipartFile multipartFile,
        @RequestParam("pluginType") Integer pluginType) throws Exception {
        File uploadedFile = ShareKit.uploadFile(multipartFile);

        try {
            return localPluginManagementService.uploadFile(uploadedFile, pluginType);
        } finally {
            uploadedFile.delete();
        }
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "db_plugin_info",
//            systemModule = OperationModuleType.SYSTEM_PLUGIN,
//            description = "查询插件"
//    )
    @PostMapping(value = "/getAllPlugins")
    public List<LocalPluginFile> getAllPluginsOfType(@RequestParam("pluginType") int pluginType) {
        return localPluginManagementService.getAllPluginsOfType(pluginType);
    }

    @PostMapping(value = "/deletePlugin")
    public void deletePlugin(@RequestBody List<Long> pluginIds) {
        if (CollectionUtils.isEmpty(pluginIds)) {
            return;
        }

        localPluginManagementService.deletePluginByIds(pluginIds);
    }
}