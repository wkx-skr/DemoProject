package com.datablau.dataSecurity.controller;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.data.PageResult;
import com.datablau.catalog.jpa.entity.CommonCatalog;
import com.datablau.catalog.jpa.entity.CommonCodeGenerate;
import com.datablau.common.kafka.enums.BasicActionEnum;
import com.datablau.data.common.api.instantjob.InstantJob;
import com.datablau.data.common.api.instantjob.InstantJobProgressMonitor;
import com.datablau.data.common.api.instantjob.InstantJobService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.data.instantjob.EnumJobType;
import com.datablau.data.common.data.instantjob.FileGenerateInstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobStage;
import com.datablau.data.common.util.ExcelUtil;
import com.datablau.dataAccess.dto.ResResultDto;
import com.datablau.dataAccess.dto.StandardExportDto;
import com.datablau.dataAccess.utility.ServerConstants;
import com.datablau.dataSecurity.dto.*;
import com.datablau.dataSecurity.jpa.entity.DataSecurityAuthStandard;
import com.datablau.dataSecurity.jpa.entity.DataSecurityAuthStandardUdp;
import com.datablau.dataSecurity.service.api.DataSecurityAuthStandardCodeGenerateService;
import com.datablau.dataSecurity.service.api.DataSecurityAuthStandardService;
import com.datablau.dataSecurity.service.api.DataSecurityAuthStandardUdpService;
import com.datablau.dataSecurity.service.api.DataSecurityAuthStandardUdpValService;
import com.datablau.dataSecurity.service.api.DataSecuritySensitiveCatalogService;
import com.datablau.dataSecurity.utils.DDSKafkaLogUtil;
import com.datablau.dataasset.utils.IpUtil;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.commons.lang3.ObjectUtils;
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
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;

import static com.datablau.dataSecurity.utils.JsonUtils.toJSon;

/**
 * @ClassName : DataSecurityAuthStandardController
 * @Description : 分类信息项
 * @Author : Xu XiaoQian
 * @Date : 2022/11/15
 **/
@Tag(name = "分类信息项API")
@RestController
@RequestMapping("/datasecurity/sensitive")
public class DataSecurityAuthStandardController extends BaseController {

    @Autowired
    private DataSecurityAuthStandardService authStandardService;
    @Autowired
    private DataSecurityAuthStandardUdpService standardUdpService;
    @Autowired
    private DataSecurityAuthStandardUdpValService standardUdpValService;
    @Autowired
    private DataSecuritySensitiveCatalogService sensitiveCatalogService;
    @Autowired
    private DataSecurityAuthStandardCodeGenerateService codeGenerateService;
    @Autowired
    private InstantJobService instantJobService;
    @Autowired
    private DDSKafkaLogUtil logUtils;

    public DataSecurityAuthStandardController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "获取分类信息项目录")
    @GetMapping(value = "/catalog/{catalogId}")
    public DataSecurityStructureValueDto classify(@PathVariable("catalogId") Long catalogId) {
        DataSecurityStructureValueDto dataSecurityStructureValueDto = sensitiveCatalogService.findAll(catalogId);
        if (ObjectUtils.notEqual(0L, catalogId)) {  //顶级目录不记录日志
//            logUtils.searchSecurityAuthStandard(dataSecurityStructureValueDto, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        }
        return dataSecurityStructureValueDto;
    }


    /**
     * 为了添加 查看目录日志添加的接口
     */
    @Operation(summary = "查看目录添加日志")
    @PostMapping(value = "/catalog/record/logs")
    public void addViewCatalogLog(@RequestBody RecordLogsDto recordLogsDto) {
        logUtils.addViewCatalogLog(recordLogsDto, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
    }

    @Operation(summary = "搜索分类信息项目录")
    @GetMapping(value = "/search/catalog")
    public List<DataSecurityCatalogValueDto> search(@RequestParam("keywords") String keywords) {
        return sensitiveCatalogService.search(keywords);
    }

    @Operation(summary = "检查分类信息项目录名")
    @GetMapping(value = "/check/catalog")
    public boolean checkName(@RequestParam("parentId") Long parentId, @RequestParam(value = "id", required = false) Long id, @RequestParam("name") String name) {
        return sensitiveCatalogService.check(parentId, id, name);
    }

    @Operation(summary = "新建分类信息项目录")
    @PostMapping(value = "/classify/add")
    public void addNew(@RequestBody DataSecurityCatalogDto dto) {
        dto.setCreator(AuthTools.currentUsernameFailFast());
        sensitiveCatalogService.save(dto);
        logUtils.addSecurityAuthStandard(dto, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
    }

    @Operation(summary = "修改分类信息项目录")
    @PutMapping(value = "/classify/modify")
    public void update(@RequestBody DataSecurityCatalogDto dto) {
        sensitiveCatalogService.update(dto);
        logUtils.auditSecurityAuthStandard(dto, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
    }

    @Operation(summary = "删除分类信息项目录")
    @DeleteMapping(value = "/classify/{catalogId}")
    public void delete(@PathVariable("catalogId") Long catalogId) {
        CommonCatalog commonCatalog = sensitiveCatalogService.delete(catalogId);
        logUtils.deleteSecurityAuthStandard(commonCatalog, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
    }

    @Operation(summary = "获取分类信息项列表")
    @PostMapping(value = "/classify/list/{catalogId}")
    public PageResult<ClassifyDataObjectDto> list(@PathVariable("catalogId") Long catalogId, @RequestBody QueryClassifyDataDto dto) {
        return authStandardService.getClassifySensitiveObject(catalogId, dto, true);
    }

    @Operation(summary = "安全分类绑定信息项获取列表")
    @PostMapping(value = "/classify/list/{sensitiveId}/{securityId}")
    public PageResult<ClassifyDataObjectDto> list(@PathVariable("sensitiveId") Long sensitiveId, @PathVariable("securityId") Long securityId, @RequestBody QueryClassifyDataDto dto) {
        return authStandardService.getClassifySensitiveObject(sensitiveId, securityId, dto);
    }

    @Operation(summary = "拉取单个信息项得所有相关属性")
    @GetMapping("/classify/sensitive/get/{itemId}")
    public Map getSensitiveDataObject(@PathVariable("itemId") Long itemId) {
        Map<String, Object> resMap = new HashMap<>(4);
        resMap.put("base", authStandardService.findSingle(itemId));
        resMap.put("udp", standardUdpValService.getItemUdpVal(itemId));
        return resMap;
    }

    @Operation(summary = "新建或修改信息项")
    @PostMapping("/classify/sensitive/add")
    public Long addSensitiveDataObject(@RequestBody ClassifyInfoDto dto) {
        if (dto.getId() == null) {
            dto.setCreator(AuthTools.currentUsernameFailFast());
        }
        Long id = authStandardService.addOrUpdate(dto);
        logUtils.addOrUpdateSensitive(dto, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl(), id);
        return id;
    }

    @Operation(summary = "删除信息项")
    @PostMapping("/classify/sensitive/del")
    public ResResultDto<List<DataSecurityAuthStandard>> deleteSensitiveDataObject(@RequestBody List<Long> ids) {
        List<DataSecurityAuthStandard> deleteSecurityAuthStandards = authStandardService.findAllByIds(ids);
        List<DataSecurityAuthStandard> dataSecurityAuthStandards = authStandardService.delete(ids);
        logUtils.deleteDataSecurityStandard(deleteSecurityAuthStandards, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        return ResResultDto.ok(dataSecurityAuthStandards);
    }

    @Operation(summary = "获取自动生成编码配置")
    @GetMapping("/classify/generate/")
    public CommonCodeGenerate getGenerate() {
        return codeGenerateService.get();
    }

    @Operation(summary = "修改自动生成编码配置")
    @PostMapping("/classify/generate/{id}")
    public void updateGenerate(@RequestBody CommonCodeGenerate generate) {
        logUtils.updateStdCodeLog(generate, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        codeGenerateService.update(generate);
    }

    @Operation(summary = "验证是否存在编码")
    @PostMapping("/classify/code/check")
    public boolean updateGenerate(@RequestBody Map<String, Object> params) {
        if (params == null || params.isEmpty() || !params.containsKey("stdCode")) {
            throw new IllegalArgumentException("参数有误，检验失败！");
        }
        return authStandardService.checkStdCode(params.get("stdCode").toString());
    }

    @Operation(summary = "获取信息项的扩展属性")
    @GetMapping("/classify/udps")
    public List<DataSecurityAuthStandardUdp> getUdpConfig() {
        return standardUdpService.getAll();
    }

    @Operation(summary = "修改信息项的扩展属性")
    @PostMapping("/classify/udps")
    public void changeUdps(@RequestBody List<DataSecurityAuthStandardUdpDto> dto) {
        for (DataSecurityAuthStandardUdpDto dataSecurityAuthStandardUdpDto : dto) {
            logUtils.addStandardUpdLog(dataSecurityAuthStandardUdpDto, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl(),
                    dataSecurityAuthStandardUdpDto.isDelete() ? BasicActionEnum.BASIC_DELETE :
                            (ObjectUtils.isNotEmpty(dataSecurityAuthStandardUdpDto.getId()) ?
                                    BasicActionEnum.BASIC_EDIT :
                                    BasicActionEnum.BASIC_ADD));
        }
        standardUdpService.update(dto);
    }

    /**
     * 查看拓展属性
     * @param itemId 信息项ID
     * @param record 是否记录日志 0:不记录 1 ： 记录
     * @return
     */
    @Operation(summary = "获取某信息项的扩展属性以及对应的值")
    @GetMapping("/classify/udp/{itemId}/{record}")
    public List<DataSecurityAuthStandardUdpResultDto> getItemUdpVal(@PathVariable("itemId") Long itemId,
                                                                    @PathVariable String record) {
        if ("1".equals(record)){
            logUtils.addSensitiveSearch(itemId, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        }
        return standardUdpValService.getItemUdpVal(itemId);
    }

    /**
     * 导入信息项
     *
     * @param file    文件
     * @param autoNum 自动生成编码
     * @return
     * @throws Exception
     */
    @Operation(summary = "导入信息项")
    @PostMapping(value = "/import/standard")
    public String importStandard(@RequestParam("file") MultipartFile file, @RequestParam Boolean autoNum) throws Exception {

        try {
            Map<String, List<Object>> importData = ExcelUtil.readFileManySheet(file);
            final SecurityContext context = SecurityContextHolder.getContext();
            SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
            String currentUser = AuthTools.currentUsernameFailFast();

            //添加日志
            logUtils.importDataSecurityStandard(currentUser, IpUtil.getUserIp(), IpUtil.getUrl());
            return instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                                   @Override
                                                   public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                                   }

                                                   @Override
                                                   public InstantJobResult call() throws Exception {
                                                       SecurityContextHolder.setContext(context);
                                                       ImportStandardResultDto importStandardResultDto = standardUdpValService.importStandard(currentUser, autoNum, importData);
                                                       FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                       result.setErrorMessage(toJSon(importStandardResultDto));
                                                       result.setJobStatus(InstantJobStage.FINISHED);
                                                       return result;
                                                   }
                                               }
                    , "分类信息项导入" + sdf.format(new Date()), currentUser, EnumJobType.IMPORT.name());


        } catch (Exception e) {
            e.printStackTrace();
            throw new UnexpectedStateException("文件读取错误！请检查所使用的模板文件！");
        }
    }


    @Operation(summary = "导出信息项")
    @PostMapping(value = "/export/standard")
    public String exportStandard(HttpServletResponse response, @RequestBody StandardExportDto standardExportDto) throws IOException {
        logUtils.exportSecurityStandard(getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        return standardUdpValService.exportStandard(standardExportDto, response, getCurrentUser());
    }

    @Operation(summary = "下载导入信息项模板")
    @PostMapping(value = "/download/template")
    public void downloadTemplate(HttpServletResponse response) throws IOException {
        standardUdpValService.downTemplate(response);
    }
}
