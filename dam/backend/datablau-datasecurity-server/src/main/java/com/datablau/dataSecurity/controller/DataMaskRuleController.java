package com.datablau.dataSecurity.controller;

import com.andorj.file.transfer.data.FileTrunk;
import com.datablau.base.api.FileService;
import com.datablau.data.common.data.FileDescriptor;
import com.datablau.data.common.data.instantjob.EnumJobType;
import com.datablau.data.common.data.instantjob.InstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobStage;
import com.datablau.common.kafka.enums.BasicActionEnum;
import com.datablau.common.utils.IpUtil;
import com.datablau.data.common.api.instantjob.InstantJob;
import com.datablau.data.common.api.instantjob.InstantJobProgressMonitor;
import com.datablau.data.common.api.instantjob.InstantJobService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.data.instantjob.FileGenerateInstantJobResult;
import com.datablau.data.common.util.ExcelUtil;
import com.datablau.dataAccess.dto.DataMaskRuleDto;
import com.datablau.dataAccess.dto.DataMaskRuleSearchDto;
import com.datablau.dataAccess.dto.ResResultDto;
import com.datablau.dataAccess.dto.ViewMaskRuleLogDto;
import com.datablau.dataAccess.jpa.entity.DataMaskRule;
import com.datablau.dataAccess.service.api.DataMaskRuleService;
import com.datablau.dataAccess.utility.ServerConstants;
import com.datablau.dataAccess.utils.FileUtility;
import com.datablau.dataAccess.vo.ImportResultVo;
import com.datablau.dataSecurity.utils.DDSKafkaLogUtil;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import java.util.HashMap;
import java.util.Optional;
import org.apache.commons.compress.utils.Lists;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.InputStream;
import java.nio.file.Files;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

import static com.datablau.dataSecurity.utils.JsonUtils.toJSon;

/**
 * Description: new java files header..
 *
 * @author liuhao
 * @version 1.0
 * @date 2023/4/13 16:14
 */
@RestController
@RequestMapping("/mask/rule")
public class DataMaskRuleController extends BaseController {
    @Autowired
    private DataMaskRuleService dataMaskRuleService;
    @Autowired
    private DDSKafkaLogUtil logUtils;
    @Autowired
    private InstantJobService instantJobService;
    @Autowired
    private FileUtility storedFileService;

    public DataMaskRuleController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "添加规则")
    @PutMapping("/add")
    public void addRule(@RequestBody DataMaskRuleDto dataMaskRuleDto) {
        dataMaskRuleDto.setRuleCreator(AuthTools.currentUsernameFailFast());
        dataMaskRuleDto.setUpdater(AuthTools.currentUsernameFailFast());
        dataMaskRuleService.addRule(dataMaskRuleDto);
        logUtils.maskRuleLog(dataMaskRuleDto, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl(), BasicActionEnum.BASIC_ADD);
    }

    @Operation(summary = "删除规则")
    @PostMapping("/delete")
    public ResResultDto<List<Map<String, Object>>> deleteRules(@RequestBody List<Long> ruleIds) {
        List<Map<String, Object>> logMap = dataMaskRuleService.deleteRulesLogMap(ruleIds);
        List<Map<String, Object>> maps = dataMaskRuleService.deleteRules(ruleIds);
        logUtils.deleteMaskRule(logMap,getCurrentUser(),IpUtil.getUserIp(),IpUtil.getUrl());
        return ResResultDto.ok(maps);
    }

    @Operation(summary = "查看脱敏规则")
    @PostMapping("/view/log")
    public ResResultDto<?> viewRules(@RequestBody ViewMaskRuleLogDto viewMaskRuleLogDto) {
        logUtils.viewMaskRule(viewMaskRuleLogDto,getCurrentUser(),IpUtil.getUserIp(),IpUtil.getUrl());
        return ResResultDto.ok();
    }


    @Operation(summary = "修改规则")
    @PostMapping("/modify")
    public void modifyRule(@RequestBody DataMaskRuleDto dataMaskRuleDto) {
        dataMaskRuleDto.setUpdater(AuthTools.currentUsernameFailFast());
        dataMaskRuleService.modifyRule(dataMaskRuleDto);
        logUtils.maskRuleLog(dataMaskRuleDto, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl(), BasicActionEnum.BASIC_EDIT);
    }

    @Operation(summary = "查询规则列表")
    @PostMapping("/list")
    public ResResultDto<Map<String, Object>> getRules(@RequestBody DataMaskRuleSearchDto searchDto) {
        return ResResultDto.ok(dataMaskRuleService.getRules(searchDto));
    }

    @Operation(summary = "查询规则详情")
    @GetMapping("/{ruleId}")
    public ResResultDto<DataMaskRuleDto> getRule(@PathVariable("ruleId") Long ruleId) {
        DataMaskRuleDto rule = dataMaskRuleService.getRule(ruleId);
        logUtils.maskRuleLog(rule, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl(), BasicActionEnum.BASIC_SEARCH);
        return ResResultDto.ok(rule);
    }

    @Operation(summary = "修改/删除规则前校验")
    @GetMapping("/op/{ruleId}")
    public void judgeRule(@PathVariable("ruleId") Long ruleId) {
        dataMaskRuleService.judgeRule(ruleId);
    }


    @Operation(summary = "脱敏规则上传")
    @RequestMapping(value = "/upload", method = RequestMethod.POST)
    public String uploadExcel(@RequestBody MultipartFile file) {
        try {
            final SecurityContext context = SecurityContextHolder.getContext();
            SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
            String currentUser = getCurrentUser();
            Map<String, List<Object>> sheets = ExcelUtil.readFileManySheet(file);

            logUtils.importMaskRule(getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
            String submitJob = instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                                               @Override
                                                               public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                                               }

                                                               @Override
                                                               public InstantJobResult call() {
                                                                   SecurityContextHolder.setContext(context);
                                                                   ImportResultVo importResultVo = dataMaskRuleService.importRules(sheets);
                                                                   FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                                   result.setErrorMessage(toJSon(importResultVo));
                                                                   result.setJobStatus(InstantJobStage.FINISHED);
                                                                   return result;
                                                               }
                                                           }
                    , "脱敏规则导入" + sdf.format(new Date()), currentUser, EnumJobType.IMPORT.name());
            return submitJob;
        } catch (Exception e) {
            throw new RuntimeException("error when read file, fileName: " + file.getOriginalFilename());
        }
    }

    @Operation(summary = "下载规则模板")
    @PostMapping("/download")
    public void downloadTemplate(HttpServletResponse response) {
        dataMaskRuleService.downloadTemplate(response);
    }

    @Operation(summary = "导出规则")
    @PostMapping("/export")
    public String exportRules(@RequestBody DataMaskRuleSearchDto searchDto) {
        Map<String, List<List<Object>>> exportRules = dataMaskRuleService.exportRules(searchDto);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        String currentUser = getCurrentUser();
        logUtils.exportMaskRule(currentUser, IpUtil.getUserIp(), IpUtil.getUrl());
        String submitJob = instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                                           @Override
                                                           public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                                           }

                                                           @Override
                                                           public InstantJobResult call() throws Exception {
                                                               File file = ExcelUtil.export(exportRules);
                                                               FileDescriptor storedFile = storedFileService.uploadFile(file, "脱敏规则列表.xlsx", currentUser, false);
                                                               FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                               result.setFileId(storedFile.getFileId());
                                                               result.setJobStatus(InstantJobStage.FINISHED);
                                                               return result;
                                                           }
                                                       }
                , "脱敏规则导出" + sdf.format(new Date()), currentUser, EnumJobType.EXPORT.name());
        return submitJob;
    }

    @Operation(summary = "导出规则")
    @PostMapping("/export/selected")
    public String exportRules(@RequestBody List<Long> ruleIds) {
        Map<String, List<List<Object>>> exportRules = dataMaskRuleService.exportRules(ruleIds);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        String currentUser = getCurrentUser();
        logUtils.exportMaskRule(currentUser, IpUtil.getUserIp(), IpUtil.getUrl());
        String submitJob = instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                                           @Override
                                                           public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                                           }

                                                           @Override
                                                           public InstantJobResult call() throws Exception {
                                                               File file = ExcelUtil.export(exportRules);
                                                               FileDescriptor storedFile = storedFileService.uploadFile(file, "脱敏规则列表.xlsx", currentUser, false);
                                                               FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                               result.setFileId(storedFile.getFileId());
                                                               result.setJobStatus(InstantJobStage.FINISHED);
                                                               return result;
                                                           }
                                                       }
                , "脱敏规则导出" + sdf.format(new Date()), currentUser, EnumJobType.EXPORT.name());
        return submitJob;
    }
}
