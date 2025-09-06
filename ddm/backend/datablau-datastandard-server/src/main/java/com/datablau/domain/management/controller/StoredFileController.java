package com.datablau.domain.management.controller;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.file.transfer.api.RemoteFileLoader;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.utility.BeanHelper;
import com.datablau.base.api.FileService;
import com.datablau.data.common.data.FileDescriptor;
import com.datablau.data.common.util.ShareKit;
import com.datablau.domain.management.utility.RemoteServiceGetter;
import com.datablau.security.management.utils.AuthTools;
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

import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URLEncoder;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * @Author huajun.li
 */
@RequestMapping("/files")
@RestController
@Tag(name = "文件操作REST API")
public class StoredFileController extends BaseController {
    private static final Logger LOGGER = LoggerFactory.getLogger(StoredFileController.class);

    @Autowired
    private MessageService msgService;


    /**
     * 上传文件
     *
     * @throws Exception
     */
    @PostMapping("/file/uploadFile")
    @Operation(summary = "上传文件")
    public FileDescriptor uploadFile(@RequestParam("file") MultipartFile multipartFile) throws Exception {
        FileService fileService = RemoteServiceGetter.getFileService();
        File uploadedFile = ShareKit.uploadFile(multipartFile);

        FileDescriptor newFile = fileService.createFile(multipartFile.getOriginalFilename(), AuthTools
                .currentUsernameNullSafe(), null);

        RemoteFileLoader remoteFileLoader = BeanHelper.getBean(RemoteFileLoader.class);
        remoteFileLoader.uploadFileToRemote(newFile.getFileId(), uploadedFile);
        fileService.commitFiles(Collections.singleton(newFile.getFileId()));

        uploadedFile.delete();
        return newFile;
    }

    /**
     * 提交文件
     */
    @PostMapping(value = "/file/commitFile")
    @Operation(summary = "提交文件")
    public void commitFiles(@RequestParam("fileIds") String fileIds) {
        String[] fileIdArr = fileIds.split(",");
        RemoteServiceGetter.getFileService().commitFiles(Arrays.asList(fileIdArr));
    }

    /**
     * 下载文件
     *
     * @throws Exception
     * @throws UnexpectedStateException
     */
    @PostMapping("/file/downloadFile")
    @Operation(summary = "下载文件")
    @Parameters({@Parameter(name = "fileId", description = "文件id", in = ParameterIn.QUERY, required = true)})
    public void downloadFile(@RequestParam("fileId") String fileId,
                             HttpServletResponse response) throws Exception {
        List<FileDescriptor> storedFiles = RemoteServiceGetter.getFileService().getFileByIds(Collections.singleton(fileId));
        if (CollectionUtils.isEmpty(storedFiles)) {
            throw new InvalidArgumentException(msgService.getMessage("storeFileCannotFindFileById", fileId));
        }

        FileDescriptor file = storedFiles.iterator().next();
        RemoteFileLoader remoteFileLoader = BeanHelper.getBean(RemoteFileLoader.class);
        File localFile = remoteFileLoader.loadFileToLocal(file.getFileId(), file.getFileName());
//        storedFileDao.updateFileLastAccessTime(file.getFileId());

        response.setContentType("application/octet-stream");
        response.setHeader("Content-disposition", "attachment; filename=" + getEncodeStr(file.getFileName()));
        response.setHeader("Content-Length", String.valueOf(localFile.length()));
        try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream(localFile));
             BufferedOutputStream bos = new BufferedOutputStream(response.getOutputStream())) {
            byte[] buff = new byte[2048];
            int bytesRead;
            while (-1 != (bytesRead = bis.read(buff, 0, buff.length))) {
                bos.write(buff, 0, bytesRead);
            }
        } catch (Exception ex) {
            throw new UnexpectedStateException(msgService.getMessage("downloadFailed"), ex);
        } finally {
            if (localFile.exists()) {
                LOGGER.info("delete file ...");
                localFile.delete();
            }
        }
    }

    @PostMapping("/file/getFile")
    @Operation(summary = "获取文件详情")
    public FileDescriptor getFile(@Parameter(name = "fileId", description = "文件id", required = true)
                                  @RequestParam("fileId") String fileId) {
        List<FileDescriptor> res = RemoteServiceGetter.getFileService().getFileByIds(Collections.singleton(fileId));
        return res != null && !res.isEmpty() ? res.get(0) : null;
    }

    @PostMapping("/file/getFiles")
    @Operation(summary = "获取文件详情")
    public List<FileDescriptor> getFile(@RequestBody List<String> fileIds) {
        return RemoteServiceGetter.getFileService().getFileByIds(fileIds);
    }

    private String getEncodeStr(String targetStr) throws UnsupportedEncodingException {
        StringBuffer sb = new StringBuffer();
        int length = targetStr.length();
        String checkStr = null;
        String encode = null;
        for (int i = 0; i < length; i++) {
            checkStr = String.valueOf(targetStr.charAt(i));
            try {
                if (checkStr.getBytes("UTF-8").length > 1) {
                    encode = URLEncoder.encode(checkStr, "UTF-8");
                    sb.append(encode);
                } else {
                    sb.append(checkStr);
                }
            } catch (UnsupportedEncodingException e) {
                LOGGER.error("encode file name failed cause by:" + e.getMessage(), e);
                return URLEncoder.encode(targetStr, "UTF-8");
            }
        }
        return sb.toString();
    }

}
