package com.datablau.metadata.main.job;

import com.andorj.model.common.utility.BeanHelper;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.job.scheduler.adapter.DatablauJobAdapter;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.job.scheduler.data.DatablauJobExecutionException;
import com.datablau.metadata.common.dto.SimpleJobStatusDto;
import com.datablau.metadata.main.job.descriptor.SyncEtlLineageJobDescriptor;
import com.datablau.metadata.main.service.SimpleJobService;
import com.datablau.metadata.main.service.lineage.api.LineageImportService;
import com.google.common.base.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.http.SdkHttpClient;
import software.amazon.awssdk.http.apache.ApacheHttpClient;
import software.amazon.awssdk.http.SdkHttpConfigurationOption;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.utils.AttributeMap;

import java.io.File;
import java.io.FileOutputStream;
import java.net.URI;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;


public class SyncEtlLineageJob extends DatablauJobAdapter {

    private Logger logger = LoggerFactory.getLogger(SyncEtlLineageJob.class);


    public SyncEtlLineageJobDescriptor jobDescriptor;

    private String bucketName;
    private String objectKey;
    private String accessKey;
    private String secretKey;
    private String endpoint;
    private Environment environment;

    private LineageImportService importService;
    private SimpleJobService simpleJobService;

    private List<String> failedFiles = new ArrayList();
    private List<String> processedFiles = new LinkedList();

    public SyncEtlLineageJob () {

    }

    public SyncEtlLineageJob(DatablauJobDescriptor descriptor) {
        this.jobDescriptor = new SyncEtlLineageJobDescriptor(descriptor);
    }


    public void prepare() throws Exception {
        this.environment = BeanHelper.getBean(Environment.class);

        //桶名
        bucketName = environment.getProperty("sync.aws.etlLineage.bucketName");
        if (Strings.isNullOrEmpty(bucketName)) {
            throw new DatablauJobExecutionException("Cannot find bucketName");
        }
        logger.info("bucketName:{}", bucketName);
        //桶下的文件名
        objectKey = environment.getProperty("sync.aws.etlLineage.objectKey");
        if (Strings.isNullOrEmpty(objectKey)) {
            throw new DatablauJobExecutionException("Cannot find objectKey");
        }
        logger.info("objectKey:{}", objectKey);

        //公钥
        accessKey = environment.getProperty("sync.aws.etlLineage.accessKey");
        if (Strings.isNullOrEmpty(accessKey)) {
            throw new DatablauJobExecutionException("Cannot find accessKey");
        }
        logger.info("accessKey:{}", accessKey);


        //私钥
        secretKey = environment.getProperty("sync.aws.etlLineage.secretKey");
        if (Strings.isNullOrEmpty(secretKey)) {
            throw new DatablauJobExecutionException("Cannot find secretKey");
        }
        logger.info("secretKey:{}", secretKey);


        //访问地址
        endpoint = environment.getProperty("sync.aws.etlLineage.endpoint");
        if (Strings.isNullOrEmpty(endpoint)) {
            throw new DatablauJobExecutionException("Cannot find endpoint");
        }
        logger.info("endpoint:{}", endpoint);
        logger.info("Downloading object: {} from bucket: {}", objectKey, bucketName);
        this.importService = BeanHelper.getBean(LineageImportService.class);
        this.simpleJobService = BeanHelper.getBean(SimpleJobService.class);

        if (this.importService == null) {
            throw new DatablauJobExecutionException("Cannot find importService");
        }

        if (this.simpleJobService == null) {
            throw new DatablauJobExecutionException("Cannot find simpleJobService");
        }
    }

    @Override
    public void execute() throws Exception {

        logger.info("构建s3请求参数");
        AwsBasicCredentials awsBasicCredentials = AwsBasicCredentials.create(accessKey, secretKey);
        StaticCredentialsProvider credentialsProvider = StaticCredentialsProvider.create(awsBasicCredentials);

        // 配置忽略证书验证（仅用于测试环境）
        AttributeMap attributeMap = AttributeMap.builder()
                .put(SdkHttpConfigurationOption.TRUST_ALL_CERTIFICATES, true)
                .build();
        SdkHttpClient sdkHttpClient = ApacheHttpClient.builder().buildWithDefaults(attributeMap);

        Region region = Region.of("regiongwxz");
        S3Client s3 = S3Client.builder()
                .region(region)
                .credentialsProvider(credentialsProvider)
                .endpointOverride(URI.create(endpoint))
                .httpClient(sdkHttpClient)
                .build();
        logger.info("构建参数完成");
        // 调用下载方法
        File etlLineageFile = getAwsEtlLineage(s3, bucketName, objectKey);
        s3.close();

        //调用系统血缘任务执行方法
        logger.info("调用系统血缘任务执行方法开始");
        processSingleFile(etlLineageFile, etlLineageFile.getName());
        logger.info("调用系统血缘任务执行方法结束");

    }


    private File getAwsEtlLineage(S3Client s3, String bucketName, String objectKey) throws Exception {
        try {
            logger.info("发送s3请求开始");
            logger.info("getAwsEtlLineage bucketName:{}", bucketName);
            logger.info("getAwsEtlLineage objectKey:{}", objectKey);
            // 创建GetObjectRequest
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey) // 使用objectKey指定文件路径
                    .build();


            // 下载对象
            ResponseBytes<GetObjectResponse> responseBytes = s3.getObjectAsBytes(getObjectRequest);
            logger.info("发送s3请求结束");

            // 创建一个临时文件
            String targetFilePath = "/opt/syncAws/etlLineage/etl_blood_data.xlsx";
            // 指定目标文件路径
            File targetFile = new File(targetFilePath);

            // 将下载的内容写入临时文件
            try (FileOutputStream fileOutputStream = new FileOutputStream(targetFilePath)) {
                fileOutputStream.write(responseBytes.asByteArray());
            }
            logger.info("Object: {} has been downloaded to temporary file: {}", objectKey, targetFile.getAbsolutePath());

            return targetFile;
        } catch (Exception e) {
            logger.error("Error occurred while downloading the object: ", e);
            throw  new DatablauJobExecutionException(e.getMessage());
        }
    }

    private void processSingleFile(File lineageFile, String originalFileName) throws Exception {
        logger.info("processing single file:{} / lineage file:{}", originalFileName, lineageFile.getAbsolutePath());
        logger.info(GeneralUtility.getMessageService().getMessage("workingWithFilesName", new Object[]{originalFileName}));
        this.processFile(lineageFile, originalFileName);
        this.processedFiles.add(originalFileName);
        logger.info(GeneralUtility.getMessageService().getMessage("fileProcessedName", new Object[]{originalFileName}));
    }
    private void processFile(File targetFile, String originalFileName) throws Exception {
        Long jobId = null;

        //对方提供模板是Datablau格式
        try {
            jobId = importService.createSimpleTemplateLoadJob(targetFile, originalFileName, originalFileName, true, false, false, 1L);
        } catch (Exception e) {
            this.failedFiles.add(GeneralUtility.getMessageService().getMessage("processedFailedCause", new Object[]{originalFileName, e.getMessage()}));
            this.addEvent(GeneralUtility.getMessageService().getMessage("fileResolutionFailed2", new Object[]{originalFileName, e.getMessage()}));
            return;
        }

        while(!this.waitForJob(jobId)) {
            Thread.sleep(3000L);
        }

        SimpleJobStatusDto jobStatusDto = this.simpleJobService.getJobStatus(jobId);
        if (jobStatusDto.getJobStatus().isFailed()) {
            this.failedFiles.add(GeneralUtility.getMessageService().getMessage("lineageParseFailed", new Object[]{originalFileName, jobStatusDto.getErrorMessage()}));
            logger.info(GeneralUtility.getMessageService().getMessage("fileResolutionFailed2", new Object[]{originalFileName, jobStatusDto.getErrorMessage()}));
        }

    }

    private boolean waitForJob(Long jobId) {
        SimpleJobStatusDto jobStatus = this.simpleJobService.getJobStatus(jobId);
        return jobStatus.getJobStatus().isFinished();
    }
}
