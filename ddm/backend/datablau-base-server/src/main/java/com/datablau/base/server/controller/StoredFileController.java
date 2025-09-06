package com.datablau.base.server.controller;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.file.transfer.api.RemoteFileLoader;
import com.andorj.model.common.api.MessageService;
import com.datablau.base.api.FileService70;
import com.datablau.base.server.service.StoredFileDao;
import com.datablau.base.server.utility.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.data.FileDescriptor;
import com.datablau.data.common.util.ShareKit;
import com.datablau.security.management.api.RoleService;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * @author nicky - 数语科技有限公司
 * date 2023/4/23 17:23
 */
@RequestMapping("/files")
@RestController
@Tag(name = "文件管理", description = "文件管理")
public class StoredFileController extends BaseController {

    private static final Logger LOGGER = LoggerFactory.getLogger(StoredFileController.class);

    @Autowired
    private FileService70 storedFileService;
    @Autowired
    private RemoteFileLoader remoteFileLoader;
    @Autowired
    private MessageService msgService;
    @Autowired
    private StoredFileDao storedFileDao;

    public StoredFileController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

//    @OperatorLog(
//        operation = OperationLogType.DATA_IMPORT,
//        operateTable = "db_file",
//        systemModule = OperationModuleType.COMMON_FILE,
//        description = "上传文件"
//    )
    @Operation(summary = "上传文件")
    @Parameters({@Parameter(name = "file", description = "文件", in = ParameterIn.QUERY, required = true)})
    @RequestMapping(value = "/upload", method = RequestMethod.POST)
    public FileDescriptor uploadFile(@RequestParam("file") MultipartFile multipartFile) throws Exception {
        File uploadedFile = ShareKit.uploadFile(multipartFile);

        FileDescriptor newFile = storedFileService.createFile(multipartFile.getOriginalFilename(), AuthTools
            .currentUsernameNullSafe(), null);

        remoteFileLoader.uploadFileToRemote(newFile.getFileId(), uploadedFile);

        List<FileDescriptor> files = storedFileDao.findByFileIds(Collections.singleton(newFile.getFileId()));
        FileDescriptor fileDescriptor = files.get(0);
        // 将文件状态设置为unCommit
        storedFileDao.unCommitFiles(Collections.singleton(newFile.getFileId()));
        fileDescriptor.setCommitted(false);

        uploadedFile.delete();
        return fileDescriptor;
    }

    /**
     * 提交文件
     */
//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "db_file",
//            systemModule = OperationModuleType.COMMON_FILE,
//            description = "提交文件"
//    )
    @PostMapping(value = "/commitFile")
    @Operation(summary = "提交文件")
    public void commitFiles(@RequestParam("fileIds") String[] fileIds) {
        storedFileService.commitFiles(Arrays.asList(fileIds));
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "db_file_content",
//            systemModule = OperationModuleType.COMMON_FILE,
//            description = "下载文件，fileId: {param}",
//            descriptionParamClass = String.class,
//            descriptionParamMethod = "toString"
//    )
    @Operation(summary = "下载文件")
    @Parameters({@Parameter(name = "fileId", description = "文件id", in = ParameterIn.QUERY, required = true)})
    @PostMapping("/download")
    public void getFile(@RequestParam(name = "fileId") String fileId, HttpServletResponse response) throws Exception{
        List<FileDescriptor> storedFiles = storedFileService.getFileByIds(Collections.singleton(fileId));
        if (CollectionUtils.isEmpty(storedFiles)) {
            throw new InvalidArgumentException("找不到id为\'" + fileId + "\'的文件");
        }

        FileDescriptor file = storedFiles.iterator().next();
        File localFile = remoteFileLoader.loadFileToLocal(file.getFileId(), file.getFileName());
        storedFileDao.updateFileLastAccessTime(file.getFileId());

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

    @Operation(summary = "get请求下载文件，兼容图片下载")
    @Parameters({@Parameter(name = "fileId", description = "文件id", in = ParameterIn.QUERY, required = true)})
    @GetMapping("/download")
    public void downloadFile(@RequestParam(name = "fileId") String fileId, HttpServletResponse response) throws Exception{
        List<FileDescriptor> storedFiles = storedFileService.getFileByIds(Collections.singleton(fileId));
        if (CollectionUtils.isEmpty(storedFiles)) {
            throw new InvalidArgumentException("找不到id为\'" + fileId + "\'的文件");
        }

        FileDescriptor file = storedFiles.iterator().next();
        File localFile = remoteFileLoader.loadFileToLocal(file.getFileId(), file.getFileName());
        storedFileDao.updateFileLastAccessTime(file.getFileId());

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

    @PostMapping("/getFilesInfo")
    @Operation(summary = "获取文件详情")
    public List<FileDescriptor> getFile(@Parameter(name = "fileIds", description = "文件id列表", required = true)
                                 @RequestParam("fileIds") String[] fileIds) {
        List<FileDescriptor> fileByIds = storedFileService.getFileByIds(Arrays.asList(fileIds));
        return fileByIds;
    }


//    @OperatorLog(
//        operation = OperationLogType.TABLE_DELETE,
//        operateTable = "db_file",
//        systemModule = OperationModuleType.COMMON_FILE,
//        description = "删除文件"
//    )
    @Operation(summary = "删除文件")
    @Parameters({@Parameter(name = "fileId", description = "文件id", in = ParameterIn.QUERY, required = true)})
    @PostMapping(value = "/deleteFile")
    public void deleteFile(@RequestParam("fileId") String fileId) {
        storedFileService.deleteFileByIds(Collections.singleton(fileId), AuthTools.currentUsernameNullSafe());
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
