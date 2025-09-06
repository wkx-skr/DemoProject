package com.datablau.data.asset.util;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.file.transfer.api.RemoteFileLoader;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.base.api.FileService;
import com.datablau.data.common.data.FileDescriptor;
import com.datablau.security.management.utils.AuthTools;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.util.Collections;
import java.util.List;

@Component
public class DatablauFileUtil {

    /**
     * FileService依赖，需要在使用前确保已注入
     */
    @Autowired(required = false)
    public FileService fileService;
    @Autowired
    public RemoteFileLoader remoteFileLoader;

    public DatablauFileUtil() {
    }

    public FileDescriptor uploadFileToRemote(File file, boolean delete) {
        FileDescriptor newFile = this.fileService.createFile(file.getName(), AuthTools.currentUsernameNullSafe(), (String)null);
        this.remoteFileLoader.uploadFileToRemote(newFile.getFileId(), file);
        this.fileService.commitFiles(Collections.singleton(newFile.getFileId()));
        if (delete) {
            file.delete();
        }

        return newFile;
    }

    public FileDescriptor uploadFileToRemote(File file, String originFilename, String uploader, boolean delete) {
        FileDescriptor newFile = this.fileService.createFile(originFilename, uploader, (String)null);
        this.remoteFileLoader.uploadFileToRemote(newFile.getFileId(), file);
        this.fileService.commitFiles(Collections.singleton(newFile.getFileId()));
        if (delete) {
            file.delete();
        }

        return newFile;
    }

    public File getFileById(String fileId) {
        List<FileDescriptor> storedFiles = this.fileService.getFileByIds(Collections.singleton(fileId));
        if (CollectionUtils.isEmpty(storedFiles)) {
            throw new InvalidArgumentException(GeneralUtility.getMessageService().getMessage("cannotFindFileById"));
        } else {
            FileDescriptor file = (FileDescriptor)storedFiles.iterator().next();
            File localFile = this.remoteFileLoader.loadFileToLocal(file.getFileId(), file.getFileName());
            return localFile;
        }
    }

    public static File uploadFile(MultipartFile file) throws Exception {
        return uploadFile(file.getInputStream(), file.getOriginalFilename());
    }

    public static File uploadFile(InputStream sourceStream, String name) throws Exception {
        File uploadFile = createTempFile(name);

        try {
            FileOutputStream fos = new FileOutputStream(uploadFile);

            try {
                OutputStream destStream = new BufferedOutputStream(fos);

                try {
                    byte[] buffer = new byte[8192];

                    int bytesRead;
                    while((bytesRead = sourceStream.read(buffer, 0, 8192)) != -1) {
                        destStream.write(buffer, 0, bytesRead);
                    }
                } catch (Throwable var15) {
                    try {
                        destStream.close();
                    } catch (Throwable var14) {
                        var15.addSuppressed(var14);
                    }

                    throw var15;
                }

                destStream.close();
            } catch (Throwable var16) {
                try {
                    fos.close();
                } catch (Throwable var13) {
                    var16.addSuppressed(var13);
                }

                throw var16;
            }

            fos.close();
        } finally {
            if (sourceStream != null) {
                sourceStream.close();
            }

        }

        return uploadFile;
    }

    public static File createTempFile(String name) throws IOException {
        String var10000 = getResourcePath("/temp");
        String tempFolder = var10000 + File.separator;
        File container = new File(tempFolder);
        
        // 确保目录存在
        if (!container.exists()) {
            container.mkdirs();
        }
        
        int idx = name.lastIndexOf(".");
        String fileName = null;
        String ext = ".tmp";
        if (idx < 0) {
            fileName = name;
        } else {
            fileName = name.substring(0, idx);
            ext = name.substring(idx);
        }

        fileName = DigestUtils.md5Hex(fileName.getBytes("GBK"));
        File uploadFile = File.createTempFile(fileName, ext, container);
        uploadFile.deleteOnExit();
        return uploadFile;
    }

    public static String getResourcePath(String path) {
        String var10000 = System.getProperty("webapp.realpath");
        return var10000 + File.separator + "resources" + path;
    }
}
