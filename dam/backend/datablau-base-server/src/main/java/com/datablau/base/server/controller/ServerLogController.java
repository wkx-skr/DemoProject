package com.datablau.base.server.controller;

import com.andorj.cloud.service.LogFileCollector;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.base.server.utility.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import net.lingala.zip4j.ZipFile;
import net.lingala.zip4j.model.ZipParameters;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;

/**
 * @Author Nicky - 数语科技有限公司
 * @Date 2019/1/30 18:11
 */
@RestController
@RequestMapping("/logs")
@Tag(name = "日志api")
public class ServerLogController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(ServerLogController.class);

    @Autowired
    private LogFileCollector logFileCollector;

    public ServerLogController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "下载多文件压缩包")
    @PostMapping(value = "/getAllLogs")
    public synchronized void downloadLogs(HttpServletResponse response) throws Exception{
        String logfolder = logFileCollector.collectAllLogs();
        String fileName = "log" + System.currentTimeMillis() + ".zip";
        String zipPath = GeneralUtility.getWebRootPath() + "/resources/temp/";
        String tempFile = zipPath + fileName;

        try (ZipFile zipFile = new ZipFile(tempFile);){
            if (!new File(zipPath).exists()) {
                FileUtils.forceMkdir(new File(zipPath));
            }

            ZipParameters zipParameters = new ZipParameters();
            zipParameters.setIncludeRootFolder(false);
            zipFile.addFolder(new File(logfolder), zipParameters);

            File file = new File(tempFile);

            if (file.exists()) {
                response.setContentType("application/octet-stream");
                String realName = "logs.zip";

                response.setHeader("Content-disposition", "attachment; filename=" + realName);
                response.setHeader("Content-Length", String.valueOf(file.length()));

                try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream(file));
                    BufferedOutputStream bos = new BufferedOutputStream(response.getOutputStream())) {
                    byte[] buff = new byte[2048];
                    int bytesRead;
                    while (-1 != (bytesRead = bis.read(buff, 0, buff.length))) {
                        bos.write(buff, 0, bytesRead);
                    }

                } catch (Exception ex) {
                    throw new IllegalStateException("failed to download zipped log file");
                }
            }
        } finally {
            File targetFile = new File(tempFile);
            if (targetFile.exists()) {
                try {
                    targetFile.delete();
                } catch (Exception ex) {
                    logger.info("failed to delete " + tempFile + " caused by:" + ex.getMessage());
                }
            }
            File logFolderFile = new File(logfolder);
            //如果logfolder文件夹存在则删除该文件夹
            if (logFolderFile.exists()) {
                try {
                    FileUtils.deleteDirectory(logFolderFile);
                } catch (Exception ex) {
                    logger.info("failed to delete " + logFolderFile + " caused by:" + ex.getMessage());
                }
            }
        }
    }
}
