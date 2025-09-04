package com.datablau.metadata.main.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.data.common.api.OperationLogService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.operation.type.OperationLogType;
import com.datablau.data.common.operation.type.OperationModuleType;
import com.datablau.metadata.main.entity.share.file.DataShareFileTree;
import com.datablau.metadata.main.service.share.file.api.DataShareFileTreeService;
import com.datablau.metadata.main.service.share.file.dto.DataFileTreeNodeDto;
import com.datablau.metadata.main.service.share.file.dto.DataShareFileExportResult;
import com.datablau.metadata.main.util.ServerConstants;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.List;

/**
 * @Author: lianyongwei - 数语科技有限公司
 * @Date: 2022/1/11 15:15
 */

@RestController
@RequestMapping("/filetree")
@Description("元数据-文件tree的相关REST API")
@Tag(name = "元数据-文件tree", description = "元数据-文件tree的相关REST API")
public class DataFileTreeController extends BaseController {
    private static final Logger log = LoggerFactory.getLogger(DataFileTreeController.class);


    @Autowired
    private DataShareFileTreeService shareFileTreeService;
    @Autowired
    private OperationLogService operationLogService;
    @Autowired
    private MessageService msgService;

    public DataFileTreeController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @RequestMapping(value = "tree", method = RequestMethod.GET)
    @Description("获取文件tree")
    @Operation(summary = "获取文件tree", description = "获取文件tree")
    public List<DataFileTreeNodeDto> arrayToTree() {
        List<DataShareFileTree> fileTrees = shareFileTreeService.findFileTrees();
        return shareFileTreeService.arrayToFileTree(fileTrees);
    }

    @RequestMapping(value = "/{treeId}/export", method = RequestMethod.POST)
    @Description("根据treeId下载文件")
    @Operation(summary = "根据treeId下载文件", description = "根据treeId下载文件")
    @Parameters({@Parameter(name = "treeId", description = "当前treeId", in = ParameterIn.PATH, required = true)})
    public void exportTreeFile(@PathVariable("treeId") Long treeId, HttpServletResponse response)
            throws IOException {
        OutputStream os = null;
        Workbook wb = null;

        DataShareFileExportResult exportResult = shareFileTreeService.exportTreeFile(treeId);

        try {
            os = response.getOutputStream();
            wb = exportResult.getContent();
            wb.write(os);
            response.addHeader("cache-Control", "no-cache, no-store, must-revalidate");
            response.addHeader("Pragma", "no-cache");
            response.addHeader("Expires", "0");
            response.addHeader("charset", "utf-8");
            response.addHeader("Content-Disposition", "attachment;filename=\"" + URLEncoder
                    .encode(GeneralUtility.getMessageService().getMessage("metadata.file.name") + ".xlsx", "utf-8") + "\"");
        } finally {
            if (os != null) {
                os.close();
            }
            if (wb != null) {
                wb.close();
            }
        }

        //增加日志
        addDataShareFileExportLog(exportResult.getExportNumber());
    }

    @RequestMapping(value = "/export", method = RequestMethod.POST)
    @Description("根据文件id点选下载文件")
    @Operation(summary = "根据文件id点选下载文件", description = "根据文件id点选下载文件")
    @Parameters({@Parameter(name = "fileList", description = "点选的treeId", required = true)})
    public void exportFileByIds(@RequestBody List<Long> fileList, HttpServletResponse response)
            throws IOException {
        OutputStream os = null;
        Workbook wb = null;
        try {
            os = response.getOutputStream();
            wb = shareFileTreeService.exportFileByIds(fileList);
            wb.write(os);
            response.addHeader("cache-Control", "no-cache, no-store, must-revalidate");
            response.addHeader("Pragma", "no-cache");
            response.addHeader("Expires", "0");
            response.addHeader("charset", "utf-8");
            response.addHeader("Content-Disposition", "attachment;filename=\"" + URLEncoder
                    .encode(GeneralUtility.getMessageService().getMessage("metadata.file.name") + ".xlsx", "utf-8") + "\"");
        } finally {
            if (os != null) {
                os.close();
            }
            if (wb != null) {
                wb.close();
            }
        }

        //增加日志
        addDataShareFileExportLog(fileList.size());
    }

    private void addDataShareFileExportLog(Integer size) {
        try {
            String logMessage = msgService.getMessage("metadata.file.log.export", size);
            operationLogService.generateOperationLog(OperationModuleType.METADATA_DATA, "dam_share_file",
                    OperationLogType.DATA_EXPORT, logMessage, AuthTools.currentUsername(), 0);
        } catch (Exception e) {
            log.error(e.getMessage());
        }
    }

}
