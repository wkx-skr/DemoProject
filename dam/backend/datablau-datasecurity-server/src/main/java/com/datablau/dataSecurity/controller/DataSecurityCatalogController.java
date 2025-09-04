package com.datablau.dataSecurity.controller;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.data.PageResult;
import com.datablau.catalog.jpa.entity.CommonCatalogTypeIcon;
import com.datablau.common.utils.IpUtil;
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
import com.datablau.dataAccess.dto.ResResultDto;
import com.datablau.dataAccess.utility.ServerConstants;
import com.datablau.dataAccess.utils.FileUtility;
import com.datablau.dataSecurity.dto.ClassifyDataObjectDto;
import com.datablau.dataSecurity.dto.DataSecurityCatalogDetailDto;
import com.datablau.dataSecurity.dto.DataSecurityCatalogDto;
import com.datablau.dataSecurity.dto.DataSecurityCatalogImportResult;
import com.datablau.dataSecurity.dto.DataSecurityCatalogValueDto;
import com.datablau.dataSecurity.dto.QuerySensitiveDataDto;
import com.datablau.dataSecurity.dto.SensitiveDataDto;
import com.datablau.dataSecurity.enums.EnumCombStatus;
import com.datablau.dataSecurity.jpa.entity.DataSecurityAuthStandard;
import com.datablau.dataSecurity.jpa.entity.DataSecurityCatalogElementRel;
import com.datablau.dataSecurity.service.api.DataSecurityAuthStandardService;
import com.datablau.dataSecurity.service.api.DataSecurityCatalogElementRelService;
import com.datablau.dataSecurity.service.api.DataSecurityCatalogService;
import com.datablau.dataSecurity.service.api.DataSecurityCatalogTypeService;
import com.datablau.dataSecurity.service.api.DataSecurityRegulationService;
import com.datablau.dataSecurity.utils.DDSKafkaLogUtil;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
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
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static com.datablau.dataSecurity.utils.JsonUtils.toJSon;

/**
 * @ClassName : DataSecurityStructureController
 * @Description : 数据安全的结构相关
 * @Author : Xu XiaoQian
 * @Date : 2022/10/21
 **/
@Tag(name = "数据安全分类分级API")
@RestController
@RequestMapping("/datasecurity/catalog")
public class DataSecurityCatalogController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(DataSecurityCatalogController.class);

    @Autowired
    private DataSecurityCatalogService dataSecurityCatalogService;
    @Autowired
    private DataSecurityCatalogElementRelService dataSecurityCatalogElementRelService;
    @Autowired
    private DataSecurityRegulationService dataSecurityRegulationService;
    @Autowired
    private DataSecurityAuthStandardService dataSecurityAuthStandardService;
    @Autowired
    private InstantJobService instantJobService;
    @Autowired
    private FileUtility storedFileService;
    @Autowired
    private DataSecurityCatalogTypeService catalogTypeService;

    @Autowired
    private DDSKafkaLogUtil logUtils;

    public DataSecurityCatalogController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "数据分类")
    @GetMapping(value = "/classify/{catalogId}")
    public Map<String, Object> classify(@PathVariable("catalogId") Long catalogId) {
        Map<String, Object> resMap = new HashMap<>();
        resMap.put("DataSecurityRegulation", dataSecurityRegulationService.getAll());
        resMap.put("DataSecurityStructureVo", dataSecurityCatalogService.findAllClassify(catalogId));
        return resMap;
    }

    @Operation(summary = "数据分类")
    @GetMapping(value = "/search")
    public List<DataSecurityCatalogValueDto> search(@RequestParam("keywords") String keywords) {
        return dataSecurityCatalogService.search(keywords);
    }

    @Operation(summary = "获取详情")
    @PostMapping(value = "/classify/detail/{id}")
    public DataSecurityCatalogDetailDto detail(@PathVariable("id") Long id,@RequestParam(required = false,defaultValue = "false") Boolean log) {
        DataSecurityCatalogDetailDto catalogDetailDto = dataSecurityCatalogService.getDetail(id);
        DataSecurityCatalogDto catalogDto = new DataSecurityCatalogDto();
        BeanUtils.copyProperties(catalogDetailDto, catalogDto);
        if (log) {
            logUtils.getDataSecurityCatalog(catalogDto, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        }
        return catalogDetailDto;
    }

    @Operation(summary = "创建新的分类")
    @PostMapping(value = "/classify/add")
    public Long addNew(@RequestBody DataSecurityCatalogDto dto) {
        dto.setCreator(AuthTools.currentUsernameFailFast());
        logUtils.addDataSecurityCatalog(dto, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        return dataSecurityCatalogService.save(dto);
    }


    @Operation(summary = "修改分类")
    @PutMapping(value = "/classify/modify")
    public void update(@RequestBody DataSecurityCatalogDto dto) {
        dataSecurityCatalogService.update(dto);
        logUtils.modifyDataSecurityCatalog(dto, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
    }

    @Operation(summary = "删除分类")
    @DeleteMapping(value = "/classify/{catalogId}")
    public void delete(@PathVariable("catalogId") Long catalogId) {
        dataSecurityCatalogService.delete(catalogId);
    }

    @Operation(summary = "获取数据资产列表")
    @PostMapping("/sensitive/{catalogId}")
    public PageResult<SensitiveDataDto> getSensitiveData(@PathVariable("catalogId") Long catalogId, @RequestBody QuerySensitiveDataDto dto) {
        if (catalogId == 0L) {
            throw new IllegalArgumentException("目录ID错误");
        }
        return dataSecurityCatalogElementRelService.getSensitiveData(catalogId, dto);
    }

    @Operation(summary = "重新梳理数据资产")
    @PostMapping("/reComb/sensitive/{catalogId}/")
    public List<DataSecurityCatalogElementRel> reComb(@PathVariable("catalogId") Long catalogId, @RequestBody List<Long> ids) {
        if (catalogId == 0L) {
            throw new IllegalArgumentException("目录ID错误");
        }
        return dataSecurityCatalogElementRelService.updateStatus(ids, EnumCombStatus.UN_COMB, this.getCurrentUser());
    }

    @Operation(summary = "数据资产导出")
    @GetMapping("/export/assets/{catalogId}")
    public String exportDataAssets(@PathVariable("catalogId") Long catalogId) {
        logUtils.exportDataSecurityAssets(getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        return dataSecurityCatalogElementRelService.exportAssets(catalogId, this.getCurrentUser());
    }

    @Operation(summary = "获取分类信息项")
    @PostMapping("sensitive/object/{catalogId}")
    public PageResult<ClassifyDataObjectDto> getSensitiveObject(@PathVariable("catalogId") Long catalogId, @RequestBody QuerySensitiveDataDto dto) {
        if (catalogId == 0L) {
            throw new IllegalArgumentException("目录ID错误");
        }
        return dataSecurityAuthStandardService.getSecuritySensitiveObject(catalogId, dto);
    }

    @Operation(summary = "绑定分类信息项")
    @PostMapping("bind/sensitive/object/{catalogId}")
    public void bind(@PathVariable Long catalogId, @RequestBody List<Long> ids) {
        dataSecurityCatalogService.bindSensitive(catalogId, ids);
    }

    @Operation(summary = "取消绑定分类信息项")
    @PostMapping("unBind/sensitive/object")
    public ResResultDto<List<DataSecurityAuthStandard>> unBind(@RequestBody List<Long> ids) {
        return ResResultDto.ok(dataSecurityCatalogService.unBind(ids));
    }

    @Operation(summary = "目录导出")
    @GetMapping("/export")
    public String export(HttpServletResponse response)
            throws InstantiationException, IllegalAccessException {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        String currentUser = AuthTools.currentUsernameFailFast();
        logUtils.exportDataSecurityCatalog(getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        return instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                               @Override
                                               public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                               }

                                               @Override
                                               public InstantJobResult call() throws Exception {
                                                   try {
                                                       Map<String, List<List<Object>>> exportCatalog = dataSecurityCatalogService.exportDataSecurityCatalog(
                                                           null);
                                                       File file = ExcelUtil.export(exportCatalog);
                                                       FileDescriptor storedFile = storedFileService.uploadFile(
                                                           file, "数据分类目录.xlsx", currentUser, false);
                                                       FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                       result.setFileId(storedFile.getFileId());
                                                       result.setJobStatus(
                                                           InstantJobStage.FINISHED);
                                                       return result;
                                                   }catch (Exception e){
                                                       logger.error("安全分类目录导出异常",e);
                                                       throw e;
                                                   }
                                               }
                                           }
                , "数据分类导出" + sdf.format(new Date()), currentUser, EnumJobType.EXPORT.name());
    }


    @Operation(summary = "目录导入")
    @PostMapping("/upload")
    public String upload(@RequestBody MultipartFile multipartFile) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        String currentUser = getCurrentUser();
        logUtils.importDataSecurityCatalog(getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        try {
            List<Object> imports = new ArrayList<>();
            Map<String, List<Object>> sheets = ExcelUtil.readFileManySheet(multipartFile);
            List<String> collect = new ArrayList<>();
            collect.add("一级分类目录");
            collect.add("二级分类目录");
            collect.add("三级分类目录");
            collect.add("四级分类目录");
            collect.add("五级分类目录");
            Set<String> sheetName = new HashSet<>(sheets.keySet());
            sheetName.removeAll(collect);
            sheetName.remove("填写说明");
            final SecurityContext context = SecurityContextHolder.getContext();
            String submitJob = instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                                               @Override
                                                               public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                                               }

                                                               @Override
                                                               public InstantJobResult call() {
                                                                   SecurityContextHolder.setContext(context);
                                                                   DataSecurityCatalogImportResult importResult = new DataSecurityCatalogImportResult();
                                                                   if (sheetName.size() == 0) {
                                                                       for (String key : collect) {
                                                                           if (sheets.containsKey(key)) {
                                                                               imports.clear();
                                                                               imports.addAll(sheets.get(key));
                                                                               if (imports.isEmpty()) {
                                                                                   importResult.addContentIsNull(key);
                                                                                   continue;
                                                                               }
                                                                               dataSecurityCatalogService.uploadCatalog(imports, key, importResult);
                                                                           }
                                                                       }
                                                                   } else {
                                                                       importResult.addTemplateError("导入模板错误");
                                                                   }
                                                                   FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                                   result.setErrorMessage(toJSon(importResult));
                                                                   result.setJobStatus(InstantJobStage.FINISHED);
                                                                   return result;
                                                               }
                                                           }
                    , "数据分类导入" + sdf.format(new Date()), currentUser, EnumJobType.IMPORT.name());
            return submitJob;
        } catch (Exception e) {
            e.printStackTrace();
            throw new UnexpectedStateException("文件读取错误！请检查所使用的模板文件！");
        }
    }

    @Operation(summary = "目录模板导出")
    @GetMapping("/export/template")
    public void exportTemplate(HttpServletResponse response) {
        dataSecurityCatalogService.exportCatalogTemplate(response);
    }

    @Operation(summary = "记录识别任务运行日志")
    @GetMapping("/task/log")
    public void downloadAlgorithmLog() {
        dataSecurityCatalogService.outPutTaskRunLog();
    }

    @Operation(summary = "文件解析")
    @GetMapping("/log/decrypt")
    public void decryptLogFile(HttpServletResponse response) {
        dataSecurityCatalogService.decryptCatalogLogFile(null, response);
    }

    @Operation(summary = "上传目录类型icon")
    @PostMapping("/upload/icon")
    public ResResultDto<CommonCatalogTypeIcon> uploadIcon(@RequestParam("icon") MultipartFile icon) {
        return ResResultDto.ok(catalogTypeService.upload(icon));
    }

    @Operation(summary = "获取目录类型icon")
    @GetMapping("/icon/{iconId}")
    public void getIcon(HttpServletResponse response, @PathVariable("iconId") Long iconId) throws IOException {
        CommonCatalogTypeIcon icon = catalogTypeService.getIcon(iconId);
        response.getOutputStream().write(icon.getIcon());
    }

    @Operation(summary = "恢复icon")
    @GetMapping("/recover/{imageName}")
    public ResResultDto<Long> recover(@PathVariable("imageName") String imageName) {
        CommonCatalogTypeIcon icon = catalogTypeService.getIdByName(imageName);
        return ResResultDto.ok(icon.getId());
    }

    @Operation(summary = "获取图标")
    @PutMapping("/type/icon/{id}/{iconId}")
    public void changeIcon(@PathVariable("id") Long id, @PathVariable("iconId") Long iconId) {
        catalogTypeService.changeIcon(id, iconId);
    }
}
