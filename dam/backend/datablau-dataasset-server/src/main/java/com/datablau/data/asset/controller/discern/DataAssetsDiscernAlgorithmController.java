package com.datablau.data.asset.controller.discern;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.datablau.data.asset.api.discern.DataAssetsDiscernAlgorithmService;
import com.datablau.data.asset.dto.ResResultDto;
import com.datablau.data.asset.dto.discern.AlgorithmAndRuleSearchDto;
import com.datablau.data.asset.dto.discern.AlgorithmTestDto;
import com.datablau.data.asset.dto.discern.DataAssetsDiscernCommonImportResultDto;
import com.datablau.data.asset.dto.discern.DataAssetsDiscernAlgorithmDetailDto;
import com.datablau.data.asset.dto.discern.DiscernAlgorithmDto;
import com.datablau.data.asset.jpa.entity.discern.DataAssetsDiscernAlgorithm;
import com.datablau.data.asset.utils.FileUtility;
import com.datablau.data.asset.utils.ServerConstants;
import com.datablau.data.common.api.instantjob.InstantJob;
import com.datablau.data.common.api.instantjob.InstantJobProgressMonitor;
import com.datablau.data.common.api.instantjob.InstantJobService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.data.FileDescriptor;
import com.datablau.data.common.data.instantjob.EnumJobType;
import com.datablau.data.common.data.instantjob.FileGenerateInstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobStage;
import com.datablau.data.common.util.ExcelUtil;
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

import static com.datablau.common.utils.JsonUtils.toJSon;

/**
 * Description: 识别算法api
 *
 * @author liuhao
 * @version 1.0
 * @date 2022/12/12 9:52
 */
@RestController
@RequestMapping(value = "/discern/algorithm")
public class DataAssetsDiscernAlgorithmController extends BaseController {

    @Autowired
    private FileUtility storedFileService;
    @Autowired
    private InstantJobService instantJobService;
    @Autowired
    private DataAssetsDiscernAlgorithmService algorithmService;

    public DataAssetsDiscernAlgorithmController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "添加识别算法")
    @PutMapping("/add")
    public void addAlgorithm(@RequestBody DiscernAlgorithmDto algorithmDto) {
        algorithmService.addAlgorithm(algorithmDto);
    }

    @Operation(summary = "获取父级下拉框列表")
    @GetMapping("/get/select")
    public ResResultDto<List<DataAssetsDiscernAlgorithm>> getSelectAlgorithms() {
        List<DataAssetsDiscernAlgorithm> algorithms = algorithmService.getSelectAlgorithms();
        return ResResultDto.ok(algorithms);
    }

    @Operation(summary = "删除识别算法")
    @PostMapping("/delete")
    public ResResultDto<Map<String, Object>> deleteAlgorithms(@RequestBody List<Long> algorithmIds) {
        Map<String, Object> objectMap = algorithmService.deleteAlgorithms(algorithmIds);
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
    public ResResultDto<DataAssetsDiscernAlgorithmDetailDto> getAlgorithm(@PathVariable("algorithmId") Long algorithmId,
                                                                          @RequestParam(value = "log", defaultValue = "false") Boolean log) {
        DataAssetsDiscernAlgorithmDetailDto detailVo = algorithmService.getAlgorithm(algorithmId);
        return ResResultDto.ok(detailVo);
    }

    @Operation(summary = "修改识别算法")
    @PostMapping("/update")
    public void updateAlgorithm(@RequestBody DiscernAlgorithmDto algorithmDto) {
        algorithmService.updateAlgorithm(algorithmDto);
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
                                                                   DataAssetsDiscernCommonImportResultDto dataAssetsDiscernCommonImportResultDto = algorithmService.importAlgorithm(sheets);
                                                                   FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                                   result.setErrorMessage(toJSon(dataAssetsDiscernCommonImportResultDto));
                                                                   result.setJobStatus(InstantJobStage.FINISHED);
                                                                   return result;
                                                               }
                                                           }
                    , "识别算法导入" + sdf.format(new Date()), currentUser, EnumJobType.IMPORT.name());
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
        return submitJob;

    }

    @Operation(summary = "下载算法模板")
    @PostMapping("/download")
    public void downloadTemplate(HttpServletResponse response) {
        algorithmService.downloadTemplate(response);
    }

}
