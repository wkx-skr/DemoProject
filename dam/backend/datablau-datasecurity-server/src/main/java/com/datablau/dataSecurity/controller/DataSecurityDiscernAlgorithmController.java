package com.datablau.dataSecurity.controller;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.datablau.data.common.data.FileDescriptor;
import com.datablau.data.common.data.instantjob.EnumJobType;
import com.datablau.data.common.data.instantjob.InstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobStage;
import com.datablau.common.utils.IpUtil;
import com.datablau.data.common.api.instantjob.InstantJob;
import com.datablau.data.common.api.instantjob.InstantJobProgressMonitor;
import com.datablau.data.common.api.instantjob.InstantJobService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.data.instantjob.FileGenerateInstantJobResult;
import com.datablau.data.common.util.ExcelUtil;
import com.datablau.dataAccess.dto.ResResultDto;
import com.datablau.dataAccess.utility.ServerConstants;
import com.datablau.dataAccess.utils.FileUtility;
import com.datablau.dataSecurity.dto.AlgorithmAndRuleSearchDto;
import com.datablau.dataSecurity.dto.AlgorithmTestDto;
import com.datablau.dataSecurity.dto.DataSecurityCommonImportResultDto;
import com.datablau.dataSecurity.dto.DataSecurityDiscernAlgorithmDetailDto;
import com.datablau.dataSecurity.dto.DiscernAlgorithmDto;
import com.datablau.dataSecurity.jpa.entity.DataSecurityDiscernAlgorithm;
import com.datablau.dataSecurity.service.api.DataSecurityDiscernAlgorithmService;
import com.datablau.dataSecurity.utils.DDSKafkaLogUtil;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

import static com.datablau.dataSecurity.utils.JsonUtils.toJSon;

/**
 * Description: 识别算法api
 *
 * @author liuhao
 * @version 1.0
 * @date 2022/12/12 9:52
 */
@RestController
@RequestMapping(value = "/datasecurity/algorithm")
public class DataSecurityDiscernAlgorithmController extends BaseController {
    @Autowired
    private DataSecurityDiscernAlgorithmService algorithmService;
    @Autowired
    private InstantJobService instantJobService;
    @Autowired
    private FileUtility storedFileService;

    @Autowired
    private DDSKafkaLogUtil ddsKafkaLogUtil;

    public DataSecurityDiscernAlgorithmController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "添加识别算法")
    @PutMapping("/add")
    public void addAlgorithm(@RequestBody DiscernAlgorithmDto algorithmDto) {
        algorithmService.addAlgorithm(algorithmDto);
        ddsKafkaLogUtil.addDiscernAlgorithm(algorithmDto, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
    }

    @Operation(summary = "获取父级下拉框列表")
    @GetMapping("/get/select")
    public ResResultDto<List<DataSecurityDiscernAlgorithm>> getSelectAlgorithms() {
        List<DataSecurityDiscernAlgorithm> algorithms = algorithmService.getSelectAlgorithms();
        return ResResultDto.ok(algorithms);
    }

    @Operation(summary = "删除识别算法")
    @PostMapping("/delete")
    public ResResultDto<Map<String, Object>> deleteAlgorithms(@RequestBody List<Long> algorithmIds) {
        Map<String, Object> objectMap = algorithmService.deleteAlgorithms(algorithmIds);
        ddsKafkaLogUtil.deleteDiscernAlgorithm(algorithmIds, objectMap, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        return ResResultDto.ok(objectMap);
    }

    @Operation(summary = "修改识别算法前判断(true:无规则引用，正常修改)")
    @GetMapping("/toUpdate/{algorithmId}")
    public ResResultDto<Boolean> toUpdateAlgorithm(@PathVariable("algorithmId") Long algorithmId) {
        return ResResultDto.ok(algorithmService.toUpdateAlgorithm(algorithmId));
    }

    @Operation(summary = "测试算法")
    @PostMapping("/test")
    public ResResultDto<Boolean> testAlgorithm(@RequestBody AlgorithmTestDto testDto) {
        return ResResultDto.ok(algorithmService.test(testDto));
    }

    @Operation(summary = "获取识别算法列表")
    @PostMapping("/get")
    public ResResultDto<Map<String, Object>> getAlgorithms(@RequestBody AlgorithmAndRuleSearchDto searchDto) {
        return ResResultDto.ok(algorithmService.getAlgorithms(searchDto));
    }

    @Operation(summary = "获取识别算法")
    @GetMapping("/get/{algorithmId}")
    public ResResultDto<DataSecurityDiscernAlgorithmDetailDto> getAlgorithm(@PathVariable("algorithmId") Long algorithmId,
                                                                            @RequestParam(value = "log", defaultValue = "false") Boolean log) {
        DataSecurityDiscernAlgorithmDetailDto detailVo = algorithmService.getAlgorithm(algorithmId);
        if (log) {
            ddsKafkaLogUtil.getDiscernAlgorithm(detailVo, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        }
        return ResResultDto.ok(detailVo);
    }

    @Operation(summary = "修改识别算法")
    @PostMapping("/update")
    public void updateAlgorithm(@RequestBody DiscernAlgorithmDto algorithmDto) {
        algorithmService.updateAlgorithm(algorithmDto);
        ddsKafkaLogUtil.modifyDiscernAlgorithm(algorithmDto, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
    }

    @Operation(summary = "导入算法")
    @PostMapping("/import")
    public String importAlgorithm(@RequestParam("file") MultipartFile file) {
        try {
            final SecurityContext context = SecurityContextHolder.getContext();
            SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
            String currentUser = AuthTools.currentUsernameFailFast();
            Map<String, List<Object>> sheets = ExcelUtil.readFileManySheet(file);
            String submitJob = instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                                               @Override
                                                               public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                                               }

                                                               @Override
                                                               public InstantJobResult call() {
                                                                   SecurityContextHolder.setContext(context);
                                                                   DataSecurityCommonImportResultDto dataSecurityCommonImportResultDto = algorithmService.importAlgorithm(sheets);
                                                                   FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                                   result.setErrorMessage(toJSon(dataSecurityCommonImportResultDto));
                                                                   result.setJobStatus(InstantJobStage.FINISHED);
                                                                   return result;
                                                               }
                                                           }
                    , "识别算法导入" + sdf.format(new Date()), currentUser, EnumJobType.IMPORT.name());
            ddsKafkaLogUtil.importDiscernAlgorithm(getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
            return submitJob;
        } catch (Exception e) {
            e.printStackTrace();
            throw new UnexpectedStateException("文件读取错误！请检查所使用的模板文件！");
        }
    }

    @Operation(summary = "导出算法")
    @PostMapping("/export")
    public String exportAlgorithm(HttpServletResponse response, @RequestBody AlgorithmAndRuleSearchDto searchDto) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        String currentUser = AuthTools.currentUsernameFailFast();
        Map<String, List<List<Object>>> exportMap = algorithmService.exportAlgorithm(response, searchDto);
        String submitJob = instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                                           @Override
                                                           public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                                           }

                                                           @Override
                                                           public InstantJobResult call() throws Exception {
                                                               File file = ExcelUtil.export(exportMap);
                                                               FileDescriptor storedFile = storedFileService.uploadFile(file, "识别算法列表.xlsx", currentUser, false);
                                                               FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                               result.setFileId(storedFile.getFileId());
                                                               result.setJobStatus(InstantJobStage.FINISHED);
                                                               return result;
                                                           }
                                                       }
                , "识别算法导出" + sdf.format(new Date()), currentUser, EnumJobType.EXPORT.name());
        ddsKafkaLogUtil.exportDiscernAlgorithm(getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        return submitJob;
    }

    @Operation(summary = "导出选中的算法")
    @PostMapping("/export/selected")
    public String exportAlgorithm(HttpServletResponse response, @RequestBody List<Long> ids) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        String currentUser = getCurrentUser();
        Map<String, List<List<Object>>> exportMap = algorithmService.exportSelectedAlgorithms(response, ids);
        String submitJob = instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                                           @Override
                                                           public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                                           }

                                                           @Override
                                                           public InstantJobResult call() throws Exception {
                                                               File file = ExcelUtil.export(exportMap);
                                                               FileDescriptor storedFile = storedFileService.uploadFile(file, "识别算法列表.xlsx", currentUser, false);
                                                               FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                               result.setFileId(storedFile.getFileId());
                                                               result.setJobStatus(InstantJobStage.FINISHED);
                                                               return result;
                                                           }
                                                       }
                , "识别算法导出" + sdf.format(new Date()), currentUser, EnumJobType.EXPORT.name());
        ddsKafkaLogUtil.exportDiscernAlgorithm(getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        return submitJob;

    }

    @Operation(summary = "下载算法模板")
    @PostMapping("/download")
    public void downloadTemplate(HttpServletResponse response) {
        algorithmService.downloadTemplate(response);
    }

    @Operation(summary = "记录识别任务运行日志")
    @GetMapping("/algorithm/log")
    public void downloadAlgorithmLog() {
        algorithmService.outPutTaskRunLog();
    }

    @Operation(summary = "文件解析")
    @GetMapping("/log/decrypt")
    public void decryptLogFile(HttpServletResponse response) {
        algorithmService.decryptAlgorithmLogFile(null, response);
    }
}
