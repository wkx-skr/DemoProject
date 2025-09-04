//package com.datablau.base.server.bean;
//
//import cn.hutool.core.util.ReflectUtil;
//import cn.hutool.core.util.StrUtil;
//import com.andorj.common.core.exception.InvalidArgumentException;
//import com.andorj.model.common.api.MessageService;
//import com.datablau.base.server.config.CompressionRoutingDataSource;
//import com.datablau.base.server.jpa.entity.StoredFileContent;
//import com.datablau.base.server.jpa.repository.StoredFileContentRepository;
//import com.datablau.common.service.impl.MinIoFileContentComponent;
//import org.apache.commons.lang.StringUtils;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Primary;
//import org.springframework.jdbc.core.JdbcTemplate;
//import org.springframework.stereotype.Component;
//
//import javax.annotation.PostConstruct;
//import javax.persistence.Column;
//import javax.persistence.Id;
//import javax.persistence.Lob;
//import javax.persistence.Table;
//import java.io.ByteArrayOutputStream;
//import java.io.File;
//import java.io.FileInputStream;
//import java.lang.reflect.Field;
//import java.nio.file.Files;
//import java.util.Collection;
//import java.util.Optional;
//
///**
// * @author zhiqiang
// * 重写文件保存逻辑，解决文件保存到数据库oom问题
// */
//@Component
//@Primary
//public class FileContentComponent {
//    private static final Logger LOGGER = LoggerFactory.getLogger(FileContentComponent.class);
//    @Value("${datablau.minio.enable:false}")
//    private boolean enable;
//    @Value("${datablau.minio.endpoint:http://192.168.2.202:9100}")
//    private String endpoint;
//    @Value("${datablau.minio.region:us-east-1}")
//    private String region;
//    @Value("${datablau.minio.bucket:datablau-bucket}")
//    private String bucket;
//    @Value("${datablau.minio.accessKey:Efs61HDnQLc7LMBl}")
//    private String accessKey;
//    @Value("${datablau.minio.secretKey:PEA3Mltp41X7RxoNdO1oYowhyCeHbPFZ}")
//    private String secretKey;
//    @Autowired
//    private MessageService msgService;
//    private MinIoFileContentComponent minIoFileContentComponent;
//    @Autowired
//    private StoredFileContentRepository storedFileContentRepository;
//
//    @Autowired
//    private JdbcTemplate jdbcTemplate;
//
//    public FileContentComponent() {
//    }
//
//    @PostConstruct
//    private void init() {
//        if (this.enable) {
//            this.minIoFileContentComponent = new MinIoFileContentComponent(this.endpoint, this.region, this.bucket, this.accessKey, this.secretKey);
//            if (!this.minIoFileContentComponent.bucketExists(this.bucket)) {
//                this.minIoFileContentComponent.createBucket(this.bucket);
//            }
//        }
//
//    }
//
//    public Optional<StoredFileContent> findById(String id) {
//        Optional<StoredFileContent> contentOptional = this.storedFileContentRepository.findById(id);
//        if (contentOptional.isPresent() && this.enable) {
//            ((StoredFileContent) contentOptional.get()).setFileContent(this.minIoFileContentComponent.findById(id));
//        }
//
//        return contentOptional;
//    }
//
//
//    public void save(String fileId, File file) {
//        StoredFileContent content = new StoredFileContent();
//        content.setFileId(fileId);
//        if (this.enable) {
//            this.minIoFileContentComponent.save(fileId, file);
//            this.storedFileContentRepository.save(content);
//        }else{
//            //此处保存文件到数据库导致内存升高的主要原因有两个
//            //1.使用了mysql useCompression参数，但是此处保存二进制文件时此压缩参数无意义并且会造成堆内存占用急剧升高
//            //2.使用hibernate的save方法保存大文件时，也会导致内存占用过高
//            //3.this.getFileContent也有问题
//            String nativeSql = getNativeSql();
//            getMemory("to db begin");
//            if (nativeSql!=null) {
//                LOGGER.info("使用jdbcTemplate 保存大文件到数据库..");
//                //动态修改connection 不使用Compression
//                CompressionRoutingDataSource.disableCompression();
//                jdbcTemplate.update(nativeSql, ps -> {
//                    ps.setString(1, fileId);
//                    try {
//                        ps.setBlob(2, Files.newInputStream(file.toPath()));
//                    } catch (Exception e) {
//                        ps.setObject(2, null);
//                    }
//                });
//
//            } else {
//                LOGGER.info("使用hibernate保存大文件到数据库..");
//                content.setFileContent(this.getFileContent(file,false));
//                this.storedFileContentRepository.save(content);
//            }
//            getMemory("to db end");
//        }
//
//    }
//
//    /**
//     * 根据类的属性反射获取原生sql
//     * @return
//     */
//    private String getNativeSql(){
//        String idColName= "";
//        String contentColName= "";
//        //此处考虑到 StoredFileContent 对象未来的变更，所以采用反射的方式获取属性，这样一旦有变更的时候，可以在报出编译器错误，以便后期修改
//        Class<StoredFileContent> clazz = StoredFileContent.class;
//        Table table = clazz.getAnnotation(Table.class);
//        Field[] fields = ReflectUtil.getFields(clazz);
//        for (Field field : fields) {
//            Id idAnnotation = field.getAnnotation(Id.class);
//            if(idAnnotation!=null){
//                Column column = field.getAnnotation(Column.class);
//                if(column!=null&&StringUtils.isNotBlank(column.name())){
//                    idColName = column.name();
//                }
//            }
//            Lob lobAnnotation = field.getAnnotation(Lob.class);
//            if(lobAnnotation!=null){
//                Column column = field.getAnnotation(Column.class);
//                if(column!=null&&StringUtils.isNotBlank(column.name())){
//                    contentColName = column.name();
//                }
//            }
//        }
//        String sqlTemplate = "INSERT INTO " + table.name() + " ({},{}) VALUES (?,?)";
//        if(StringUtils.isNotBlank(idColName)&&StringUtils.isNotBlank(contentColName)){
//            return StrUtil.format(sqlTemplate,idColName,contentColName);
//        }else {
//            return null;
//        }
//    }
//
//    public void delete(String id) {
//        if (this.enable) {
//            this.minIoFileContentComponent.delete(id);
//        }
//
//        this.storedFileContentRepository.deleteByFileId(id);
//    }
//
//    public void deleteByFileIdIn(Collection<String> ids) {
//        if (this.enable) {
//            this.minIoFileContentComponent.deleteFileIdIn(ids);
//        }
//
//        this.storedFileContentRepository.deleteByFileIdIn(ids);
//    }
//
//    public void getMemory(String prefix) {
//        System.out.println(prefix + "--使用的堆内存:" + (Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory()) / 1024 / 1024);
//    }
//
//    private byte[] getFileContent(File file, boolean deleteFile) {
//        if (file == null) {
//            throw new IllegalArgumentException(this.msgService.getMessage("storeFileFileAlreadyDeleted"));
//        } else {
//            byte[] buffer = null;
//            try {
//                FileInputStream fis = new FileInputStream(file);
//
//                try {
//                    ByteArrayOutputStream bos = new ByteArrayOutputStream();
//
//                    try {
//                        byte[] b = new byte[1024];
//
//                        while (true) {
//                            int n;
//                            if ((n = fis.read(b)) == -1) {
//                                buffer = bos.toByteArray();
//                                break;
//                            }
//
//                            bos.write(b, 0, n);
//                        }
//                    } catch (Throwable var17) {
//                        try {
//                            bos.close();
//                        } catch (Throwable var16) {
//                            var17.addSuppressed(var16);
//                        }
//
//                        throw var17;
//                    }
//
//                    bos.close();
//                } catch (Throwable var18) {
//                    try {
//                        fis.close();
//                    } catch (Throwable var15) {
//                        var18.addSuppressed(var15);
//                    }
//
//                    throw var18;
//                }
//
//                fis.close();
//            } catch (Exception var19) {
//                throw new InvalidArgumentException(this.msgService.getMessage("storeFileGetContentFailed"));
//            } finally {
//                if (file.exists() && deleteFile) {
//                    LOGGER.info("delete file ...");
//                    file.delete();
//                }
//
//            }
//            return buffer;
//        }
//    }
//}
