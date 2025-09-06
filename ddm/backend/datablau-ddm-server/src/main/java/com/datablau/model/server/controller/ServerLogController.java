package com.datablau.model.server.controller;

import com.andorj.cloud.service.LogFileCollector;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.security.UserRights;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import net.lingala.zip4j.ZipFile;
import net.lingala.zip4j.model.ZipParameters;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
/**
 * @author nicky - 数语科技有限公司
 * date 2021/9/17 11:21
 */
@RestController("serverLogController")
@ConditionalOnMissingBean(name = "serverLogControllerExt")
@RequestMapping("/logs")
@Tag(name = "下载系统日志的REST API", description = "下载系统日志的REST API")
public class ServerLogController extends BaseController {
    protected static final Logger logger = LoggerFactory.getLogger(ServerLogController.class);

    @Autowired
    protected LogFileCollector logFileCollector;

    @GetMapping(value = "/all")
    @Operation(summary = "下载系统中所有服务的当前日志", description = "下载系统中所有服务的当前日志，只有超管可以调用此API")
    @PreAuthorize(UserRights.HAS_OPS_LOG_MANAGE_ROLE)
    public synchronized void downloadLogs(HttpServletResponse response) throws Exception {
        String logfolder = logFileCollector.collectAllLogs();
        String fileName = "log" + System.currentTimeMillis() + ".zip";
        String tempFile = GeneralUtility.getWebRootPath() + "/resources/temp/" + fileName;

        try {
            ZipFile zipFile = new ZipFile(tempFile);
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
        }
    }

}
