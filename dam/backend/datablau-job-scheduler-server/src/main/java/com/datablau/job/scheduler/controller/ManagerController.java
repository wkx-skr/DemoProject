package com.datablau.job.scheduler.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.data.common.api.ExcelExporter;
import com.datablau.data.common.api.OperationLogService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.job.scheduler.data.JobInfoNode;
import com.datablau.job.scheduler.data.JobMainInfo;
import com.datablau.job.scheduler.dto.JobFileMappingDto;
import com.datablau.job.scheduler.dto.JobJarManiFest;
import com.datablau.job.scheduler.service.FileMappingService;
import com.datablau.job.scheduler.service.JobProcessService;
import com.datablau.job.scheduler.utils.DatablauUtility;
import com.datablau.project.util.UserRights;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.jar.JarFile;
import java.util.jar.Manifest;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2023/3/22 9:27
 */
@RestController
@RequestMapping("/manager")
@Description("任务管理相关REST API")
@Tag(name = "任务controller", description = "/manager")
public class ManagerController extends BaseController {
    private static final Logger LOGGER = LoggerFactory.getLogger(ManagerController.class);

    @Autowired
    private FileMappingService fileMappingService;
    @Autowired
    private JobProcessService jobProcessService;
    @Autowired
    private MessageService msgService;
    @Autowired
    private OperationLogService operationLogService;
    @Autowired
    private ExcelExporter excelExporter;

    //    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "no_table",
//            systemModule = OperationModuleType.SYSTEM_JOB_LISTENER,
//            description = "查询任务监控"
//    )
    @PostMapping("/getJobInstances")
    @Operation(summary = "查询节点实例")
    @PreAuthorize(UserRights.HAS_BASE_TASK_MONITOR_MANAGE_ROLE)
    public Collection<JobInfoNode> getInstanceList(){
        return jobProcessService.getJobInfoNodes();
    }

    @PostMapping("/getFileMapping")
    @Operation(summary = "查询任务jar上传情况")
    @PreAuthorize(UserRights.HAS_BASE_TASK_FILE_MANAGE_ROLE)
    public Collection<JobFileMappingDto> getJobFileMappingDto(){
        return fileMappingService.getFileMappings();
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "no_table",
//            systemModule = OperationModuleType.SYSTEM_JOB_LISTENER,
//            description = "查询服务日志，服务id为: {param}",
//            descriptionParamClass = String.class,
//            descriptionParamMethod = "toString"
//    )
    @PostMapping("/getInstProcess")
    @Operation(summary = "查询服务实例下的process进程")
    public JobMainInfo getInstProcess(String serverId){
        return jobProcessService.getJobMainInfo(serverId);
    }


    @PostConstruct
    public void init() throws Exception {
//        String jarPath1 = "/opt/jobjar/datablau_metadata-8.0.0-SNAPSHOT.jar";
        ArrayList<String> jarPaths = new ArrayList<>();
        jarPaths.add("/opt/jobjar/datablau_metadata-8.0.0-SNAPSHOT.jar");
        jarPaths.add("/opt/jobjar/datablau_domain-8.0.0-SNAPSHOT.jar");
        jarPaths.add("/opt/jobjar/datablau_dataasset-8.0.0-SNAPSHOT.jar");

        for (String jarPath : jarPaths) {
            File file = new File(jarPath);
            if(file.exists()){
                LOGGER.info("开始保存Jar包：【" + jarPath + "】");
                JarFile jarFile = new JarFile(file);
                Manifest manifest = jarFile.getManifest();
                JobJarManiFest jarManiFest;
                try{
                    jarManiFest = new JobJarManiFest(manifest);
                }catch (Exception e){
                    LOGGER.info(GeneralUtility.getMessageService().getMessage("jobJarIsInvalid"));
                    throw new RuntimeException(GeneralUtility.getMessageService().getMessage("jobJarIsInvalid"));
                }
                if(!jarManiFest.getFind()){
                    throw new AndorjRuntimeException("current jar manifest is invalid:" + jarManiFest.toString());
                }

                JobJarManiFest jobJarManiFest = fileMappingService.uploadJobJar(file, jarManiFest);
                LOGGER.info("保存完任务jar包：【" + jarPath + "】");
            }else {
                LOGGER.info("找不到任务Jar包：【" + jarPath + "】");
            }
        }

    }


    @PostMapping("/uploadJobJar")
    @Operation(summary = "上传任务jar包")
    public JobJarManiFest uploadJobJarFile(@RequestParam("file") MultipartFile multipartFile)
        throws Exception {

        File file = DatablauUtility.uploadFile(multipartFile);
        JarFile jarFile = new JarFile(file);
        Manifest manifest = jarFile.getManifest();
        JobJarManiFest jarManiFest;
        try{
            jarManiFest = new JobJarManiFest(manifest);
        }catch (Exception e){
            LOGGER.info(GeneralUtility.getMessageService().getMessage("jobJarIsInvalid"));
            throw new RuntimeException(GeneralUtility.getMessageService().getMessage("jobJarIsInvalid"));
        }

        if(!jarManiFest.getFind()){
            throw new AndorjRuntimeException("current jar manifest is invalid:" + jarManiFest.toString());
        }

        JobJarManiFest jobJarManiFest = fileMappingService.uploadJobJar(file, jarManiFest);
        return jobJarManiFest;
    }

    @PostMapping("/restartJobServer")
    @Operation(summary = "重启任务服务")
    public void restartJobServer(@Parameter(name = "server的Id", required = true) String serverInstanceId,
        @Parameter(name = "任务服务名", required = true) String appName){
        jobProcessService.restartJobServer(serverInstanceId, appName);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "no_table",
//            systemModule = OperationModuleType.SYSTEM_JOB_LISTENER,
//            description = "停止任务服务，服务名: {param}",
//            descriptionParamClass = String.class,
//            descriptionParamMethod = "toString"
//    )
    @PostMapping("/stopJobServer")
    @Operation(summary = "停止任务服务")
    public void stopJobServer(@Parameter(name = "server的Id", required = true) String serverInstanceId,
        @Parameter(name = "任务服务名", required = true) String appName,
        @Parameter(name = "进程号", required = false) Long pid){
        jobProcessService.stopJobServer(serverInstanceId, appName, pid);
    }

}
