package com.datablau.model.server.controller;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.file.transfer.api.RemoteFileLoader;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.utility.BeanHelper;
import com.andorj.model.common.utility.RootBeanHelper;
import com.datablau.base.api.FileService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.data.FileDescriptor;
import com.datablau.data.common.util.ShareKit;
import com.datablau.model.data.dto.StoredFileDto;
import com.datablau.model.local.utility.ServerConstants;
import com.datablau.model.security.utility.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * @Author Nicky - 数语科技有限公司
 * @Date 2018/8/30 11:52
 */
@RequestMapping("/files")
@RestController("storedFileController")
@ConditionalOnMissingBean(name = "storedFileControllerExt")
@Tag(name = "文件存储REST API", description = "文件存储REST API")
public class StoredFileController extends BaseController {

    protected static final Logger logger = LoggerFactory.getLogger(StoredFileController.class);

    @Autowired
    protected MessageService msgService;

    @Autowired
    @Qualifier("fileService")
    protected FileService fileService;


    @Operation(summary = "上传文件")
    @Parameters({@Parameter(name = "file", description = "文件", in = ParameterIn.QUERY, required = true)})
    @RequestMapping(value = "/upload", method = RequestMethod.POST)
    public StoredFileDto uploadFile(@RequestParam("file") MultipartFile multipartFile) throws Exception {
        //new
        File uploadedFile = ShareKit.uploadFile(multipartFile);
        FileDescriptor newFile = fileService.createFile(multipartFile.getOriginalFilename(), AuthTools.currentUsernameNullSafe(), null);
        RemoteFileLoader remoteFileLoader = RootBeanHelper.getBean(RemoteFileLoader.class);
        remoteFileLoader.uploadFileToRemote(newFile.getFileId(), uploadedFile);
        fileService.commitFiles(Collections.singleton(newFile.getFileId()));

        StoredFileDto storedFile = new StoredFileDto();
        storedFile.setFileId(newFile.getFileId());
        storedFile.setFileOrginalName(newFile.getFileName());
        storedFile.setUploader(newFile.getUploader());
        storedFile.setUploadTimestamp(newFile.getCreateTime());
        storedFile.setFileDeleted(false);
        storedFile.setCommitted(true);
        storedFile.setFileSize(newFile.getFileSize());
        storedFile.setFileContent(getFileContent(uploadedFile, true));
        return storedFile;
    }

    @RequestMapping(value = "/upload/driver", method = RequestMethod.POST)
    @Operation(summary = "上传驱动", description = "上传驱动")
    public StoredFileDto uploadFileForDriver(@RequestParam("file") MultipartFile multipartFile) throws Exception {
        return uploadFile(multipartFile);
    }

    /**
     * 提交文件
     */
    @RequestMapping(value = "/commit", method = RequestMethod.PUT)
    @Operation(summary = "批量提交文件")
    @Parameter(name = "fileIds", description = "文件ID", in = ParameterIn.QUERY)
    public void commitFiles(@RequestParam("fileIds") String fileIds) {
        String[] fileIdArr = fileIds.split(",");
        fileService.commitFiles(Arrays.asList(fileIdArr));
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
        List<FileDescriptor> storedFiles = fileService.getFileByIds(Collections.singleton(fileId));
        if (CollectionUtils.isEmpty(storedFiles)) {
            throw new InvalidArgumentException("找不到id为\'" + fileId + "\'的文件");
        }

        FileDescriptor file = storedFiles.iterator().next();
        RemoteFileLoader remoteFileLoader = RootBeanHelper.getBean(RemoteFileLoader.class);
        File localFile = remoteFileLoader.loadFileToLocal(file.getFileId(), file.getFileName());
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
                logger.info("delete file ...");
                localFile.delete();
            }
        }
    }


    @RequestMapping("/{fileId}")
    @Operation(summary = "获取文件详情", description = "获取文件详情")
    @Parameter(name = "fileId", description = "文件ID", in = ParameterIn.PATH)
    public StoredFileDto getFile(@PathVariable("fileId") String fileId) {
        List<FileDescriptor> res = fileService.getFileByIds(Collections.singleton(fileId));
        StoredFileDto storedFile = null;
        if (res != null && res.get(0) != null) {
            FileDescriptor newFile = res.get(0);
            storedFile = new StoredFileDto();
            storedFile.setFileId(newFile.getFileId());
            storedFile.setFileOrginalName(newFile.getFileName());
            storedFile.setUploader(newFile.getUploader());
            storedFile.setUploadTimestamp(newFile.getCreateTime());
            storedFile.setFileDeleted(false);
            storedFile.setCommitted(true);
            storedFile.setFileSize(newFile.getFileSize());
        }
        return storedFile;
    }


    @RequestMapping("/")
    @Operation(summary = "根据IDs 获取文件", description = "根据IDs 获取文件")
    @Parameter(name = "fileIds", description = "文件ID", in = ParameterIn.QUERY)
    public List<StoredFileDto> getFiles(@RequestParam("fileIds") String fileIds) {
        String[] fileIdArr = fileIds.split(",");
        List<FileDescriptor> res = fileService.getFileByIds(Arrays.asList(fileIdArr));
        List<StoredFileDto> storedFiles = new ArrayList<>();
        if (res != null) {
            for (FileDescriptor fileDescriptor : res) {
                StoredFileDto storedFile = new StoredFileDto();
                storedFile.setFileId(fileDescriptor.getFileId());
                storedFile.setFileOrginalName(fileDescriptor.getFileName());
                storedFile.setUploader(fileDescriptor.getUploader());
                storedFile.setUploadTimestamp(fileDescriptor.getCreateTime());
                storedFile.setFileDeleted(false);
                storedFile.setCommitted(true);
                storedFile.setFileSize(fileDescriptor.getFileSize());
                storedFiles.add(storedFile);
            }
        }
        return storedFiles;
    }



    @RequestMapping("/search")
    @Operation(summary = "查询")
    @Parameter(name = "keyword", description = "查询关键词", in = ParameterIn.QUERY)
    public List<StoredFileDto> searchFile(@RequestParam("keyword") String keyword,
                                          @RequestParam(value = "uploader", required = false) String uploader) {
        RemoteFileLoader remoteFileLoader = BeanHelper.getBean(RemoteFileLoader.class);

        List<FileDescriptor> fileDescriptors = fileService.searchFiles(ServerConstants.APPNAME, uploader, keyword);
        List<StoredFileDto> storedFiles = new ArrayList<>();
        if (!CollectionUtils.isEmpty(fileDescriptors)) {
            for (FileDescriptor fileDescriptor : fileDescriptors) {
                File specFile = remoteFileLoader.loadFileToLocal(fileDescriptor.getFileId(), fileDescriptor.getFileName());
                StoredFileDto storedFile = new StoredFileDto(fileDescriptor.getFileId(), fileDescriptor.getFileName(), fileDescriptor.getUploader(), fileDescriptor.getCreateTime(), fileDescriptor.getFileSize(), fileDescriptor.getDeleted(), fileDescriptor.getDeletedBy(), fileDescriptor.getDeleteTime(), fileDescriptor.getCommitted());
                try (InputStream inputStream = new FileInputStream(specFile)) {
                    byte[] fileBytes = inputStream.readAllBytes();
                    storedFile.setFileContent(fileBytes);
                } catch (Exception e) {
                    e.printStackTrace();
                }
                storedFiles.add(storedFile);
            }
        }
        return storedFiles;
    }


    @RequestMapping(value = "/{fileId}", method = RequestMethod.DELETE)
    @Operation(summary = "删除文件")
    @Parameter(name = "fileId", description = "文件id", in = ParameterIn.PATH)
    public void deleteFile(@PathVariable("fileId") String fileId) {
        fileService.deleteFileByIds(Collections.singleton(fileId), AuthTools.currentUsernameNullSafe());
    }


    protected byte[] getFileContent(File file, boolean deleteFile) {
        if (file == null) {
            throw new IllegalArgumentException("指定的文件已经被删除了");
        }

        byte[] buffer = null;

        try (FileInputStream fis = new FileInputStream(file);
             ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            byte[] b = new byte[1024];

            int n;

            while ((n = fis.read(b)) != -1) {
                bos.write(b, 0, n);
            }

            buffer = bos.toByteArray();
        } catch (Exception e) {
            throw new InvalidArgumentException("获取文件内容失败");
        } finally {
            if (file.exists() && deleteFile) {
                logger.info("delete file ...");
                file.delete();
            }
        }

        return buffer;
    }

    protected String getEncodeStr(String targetStr) throws UnsupportedEncodingException {
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
                logger.error("encode file name failed cause by:" + e.getMessage(), e);
                return URLEncoder.encode(targetStr, "UTF-8");
            }
        }
        return sb.toString();
    }
}
