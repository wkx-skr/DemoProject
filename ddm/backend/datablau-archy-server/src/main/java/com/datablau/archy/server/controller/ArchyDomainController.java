package com.datablau.archy.server.controller;

import com.andorj.common.core.exception.InvalidArgumentException;

import com.andorj.model.common.dto.ExcelLoadJobResult;
import com.datablau.archy.common.enums.ArchyState;
import com.datablau.archy.common.enums.ArchyType;
import com.datablau.archy.server.dto.*;
import com.datablau.archy.server.dto.excel.ArchyDomainExcelDto;
import com.datablau.archy.server.dto.query.ArchyDomainQueryDto;
import com.datablau.archy.server.dto.release.ArchyReleaseDto;
import com.datablau.archy.server.enums.ProcessType;
import com.datablau.archy.server.jpa.entity.ArchyDomain;
import com.datablau.archy.server.jpa.entity.ArchyUdp;
import com.datablau.archy.server.service.ArchyCommonService;
import com.datablau.archy.server.service.ArchyDomainService;
import com.datablau.archy.server.service.ArchyUdpService;
import com.datablau.archy.server.service.LocalWorkflowService;
import com.datablau.archy.server.utils.DataUtility;
import com.datablau.data.common.api.ExcelLoader;
import com.datablau.data.common.controller.BaseController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * @Author yudonghai - 北京数语科技有限公司
 * @Date 2022/7/27 16:27
 */
@Deprecated
@RestController
@RequestMapping("/domain")
@Tag(name = "Archy业务领域相关REST API", description = "Archy业务领域相关REST API")
public class ArchyDomainController extends BaseController {

    @Autowired
    private ArchyDomainService archyDomainService;

    @Autowired
    private ArchyCommonService archyCommonService;

    @Autowired
    private ArchyUdpService archyUdpService;

    @Autowired
    private LocalWorkflowService localWorkflowService;

    @Autowired
    private ExcelLoader excelLoader;

    @Operation(summary = "根据ID查询业务领域")
    @GetMapping("/domain/{uuid}")
    public ArchyDomain findArchyDomainById(@Parameter(description = "业务领域ID", required = true) @PathVariable(name = "uuid") String uuid) {
        return archyDomainService.findArchyDomainById(uuid);
    }

    @Operation(summary = "根据条件查询业务领域")
    @PostMapping("/domains")
    public Page<ArchyDomain> findArchyDomains(@RequestBody ArchyDomainQueryDto archyDomainQueryDto,
                                              @Parameter(description = "当前页，默认值是1") @RequestParam(name = "currentPage", required = false, defaultValue = "1") Integer currentPage,
                                              @Parameter(description = "页面大小") @RequestParam(name = "pageSize", required = false, defaultValue = "999999") Integer pageSize) {
        return archyDomainService.findArchyDomains(archyDomainQueryDto, currentPage, pageSize);
    }

    @Operation(summary = "查询所有已发布的业务领域")
    @GetMapping("/domains/accepted")
    public List<ArchyDomain> findAcceptedArchyDomains() {
        return archyDomainService.findAcceptedArchyDomains();
    }


    @Operation(summary = "查询业务领域的历史版本")
    @GetMapping("/domain/history")
    public List<ArchyDomain> findArchyDomainHistory(@Parameter(description = "业务对象ID", required = true) @RequestParam(name = "uuid") String uuid,
                                                    @Parameter(description = "是否去掉最新版本") @RequestParam(name = "decapitation", required = false) Boolean decapitation) {
        return archyDomainService.findArchyDomainHistory(uuid, decapitation);
    }

    @Operation(summary = "创建业务领域", description = "创建业务领域时，可以先不绑定模型。默认版本为:1，默认状态为:待审核")
    @PostMapping("/domain")
    public ArchyDomain createArchyDomain(@RequestBody ArchyDomain archyDomain) {
        return archyDomainService.createArchyDomain(archyDomain);
    }

    @Operation(summary = "修改业务领域", description = "对待审核的业务对象直接修改，或对已发布的业务对象申请变更")
    @PutMapping("/domain")
    public ArchyDomain updateArchyDomain(@RequestBody ArchyDomain archyDomain) {
        ArchyDomain saved = archyDomainService.updateArchyDomain(archyDomain);
        // 发起评审
        if (saved.getState().equals(ArchyState.C)) {
            archyDomainService.archyDomainApplyVerification(saved, ProcessType.ARCHY_DOMAIN_UPDATE);
            try {
                localWorkflowService.applyDomainProcess(saved, ProcessType.ARCHY_DOMAIN_UPDATE);
            } catch (Exception e) {
                // 发起评审异常处理 1.删除新创建的数据 2.将原有数据的updateId置为NULL
                archyDomainService.deleteArchyDomainById(saved.getId());
                archyDomainService.updateArchyDomainUpdateId(archyDomain.getId(), null);
                throw new InvalidArgumentException("变更申请失败：" + e.getMessage());
            }
        }
        return saved;
    }

    @Operation(summary = "删除业务领域", description = "对待审核的业务对象直接删除，或对已发布的业务对象申请废弃")
    @DeleteMapping("/domain/{uuid}")
    public void deleteCurrentVersionArchyDomain(@Parameter(description = "业务领域ID", required = true) @PathVariable(name = "uuid") String uuid) {
        ArchyDomain archyDomain = archyDomainService.abolishArchyDomain(uuid);
        // 发起评审
        if (archyDomain != null) {
            archyDomainService.archyDomainApplyVerification(archyDomain, ProcessType.ARCHY_DOMAIN_ABOLISH);
            try {
                localWorkflowService.applyDomainProcess(archyDomain, ProcessType.ARCHY_DOMAIN_ABOLISH);
            } catch (Exception e) {
                // 发起评审异常处理 1.删除新创建的数据 2.将原有数据的updateId置为NULL
                archyDomainService.deleteArchyDomainById(archyDomain.getId());
                archyDomainService.updateArchyDomainUpdateId(uuid, null);
                throw new InvalidArgumentException("废弃申请失败：" + e.getMessage());
            }
        }
    }

    @Operation(summary = "批量删除业务领域", description = "只能批量删除待评审的业务领域")
    @DeleteMapping("/domains/delete")
    public void deleteArchyDomains(@RequestBody List<String> ids) {
        archyDomainService.deleteArchyDomainByIds(ids);
    }

    @PostMapping("/domains/import")
    @Operation(summary = "导入业务领域")
    public Map<String, String> importArchyDomains(@Parameter(description = "导入业务领域的excel文件") @RequestParam("file") MultipartFile multipartFile) throws Exception {
        String filePath = DataUtility.uploadFile(multipartFile).getAbsolutePath();
        ExcelLoadJobResult<ArchyDomainExcelDto> loadJobResult = excelLoader.loadFile(filePath, 0, ArchyDomainExcelDto.class);
        List<ArchyDomain> developmentDomains = new ArrayList<>();
        Map<String, String> message = archyDomainService.importArchyDomains(loadJobResult.getLoaded(), developmentDomains);
        for (ArchyDomain archyDomain : developmentDomains) {
            // 发起变更申请
            if (archyDomain.getState().equals(ArchyState.C)) {
                archyDomainService.archyDomainApplyVerification(archyDomain, ProcessType.ARCHY_DOMAIN_UPDATE);
                try {
                    localWorkflowService.applyDomainProcess(archyDomain, ProcessType.ARCHY_DOMAIN_UPDATE);
                } catch (Exception e) {
                    // 发起评审异常处理 1.删除新创建的数据 2.将原有数据的updateId置为NULL
                    archyDomainService.deleteArchyDomainById(archyDomain.getId());
                    archyDomainService.updateArchyDomainUpdateId(archyDomain.getUpdateId(), null);
                    message.put(archyDomain.getName() + "-" + archyDomain.getCode(), "发起评审失败:" + e.getMessage());
                }
            }
        }
        return message;
    }

    @PostMapping(value = "/domains/export/template")
    @Operation(summary = "导出业务领域模板")
    public ResponseEntity<Resource> exportArchyDomainTemplate() throws Exception {
        return archyDomainService.exportArchyDomainTemplate();
    }

    @PostMapping(value = "/domains/export")
    @Operation(summary = "导出业务领域")
    public ResponseEntity<byte[]> exportArchyDomains(@RequestBody ArchyDomainQueryDto archyDomainQueryDto) {
        return DataUtility.generalResponseEntityByFile(archyDomainService.exportArchyDomains(archyDomainQueryDto, null));
    }

    @PostMapping(value = "/domains/export/selected")
    @Operation(summary = "导出选中的业务领域")
    public ResponseEntity<byte[]> exportArchyDomains(@RequestBody List<String> ids) {
        return DataUtility.generalResponseEntityByFile(archyDomainService.exportArchyDomains(null, ids));
    }

    @PostMapping("/domain/{uuid}/process/apply")
    @Operation(summary = "发布业务领域")
    public void releaseArchyDomain(@Parameter(description = "业务领域ID", required = true) @PathVariable(name = "uuid") String uuid) {
        ArchyDomain archyDomain = archyDomainService.findArchyDomainById(uuid);
        if (archyDomain == null) {
            throw new InvalidArgumentException("业务领域不存在");
        }
        archyDomainService.archyDomainApplyVerification(archyDomain, ProcessType.ARCHY_DOMAIN_PUBLISH);
        localWorkflowService.applyDomainProcess(archyDomain, ProcessType.ARCHY_DOMAIN_PUBLISH);
    }

    @PostMapping("/domains/process/apply")
    @Operation(summary = "发布业务领域")
    public void releaseArchyDomains(@Parameter(description = "业务领域ID集合", required = true) @RequestBody Set<String> uuids) {
        uuids.forEach(this::releaseArchyDomain);
    }

    @PostMapping(value = "/domain/info/{uuid}/{modelType}")
    @Operation(summary = "查询业务领域绑定的模型基本信息")
    public ArchyBindModelBasicInfoDto getModelInfo(@Parameter(description = "业务领域ID", required = true) @PathVariable(name = "uuid") String uuid,
                                                   @Parameter(description = "模型类型：LogicalBusinessDomain、ConceptualBusinessDomain", required = true) @PathVariable(name = "modelType") String modelType,
                                                   @Parameter(description = "版本") @RequestParam(name = "version", required = false, defaultValue = "0") int version) {
        return archyDomainService.getModelInfo(uuid, modelType, version);
    }

    @GetMapping(value = "/domain/release/versions/{modelId}/{modelType}")
    @Operation(summary = "查询模型的发布版本列表")
    public List<ArchyModelVersionReleaseDto> getArchyModelVersions(@Parameter(description = "模型ID", required = true) @PathVariable(name = "modelId") Long modelId,
                                                                   @Parameter(description = "模型类型", required = true) @PathVariable(name = "modelType") String modelType) {
        return archyDomainService.getArchyModelVersions(modelId, modelType);
    }

    @GetMapping(value = "/domain/elements/relationship/{uuid}")
    @Operation(summary = "获取对象之间的关系列表")
    public List<ElementRelationshipDto> getElementRelationship(@Parameter(description = "领域UUID", required = true) @PathVariable(name = "uuid") String uuid) {
        return archyCommonService.getElementRelationship(uuid, ArchyType.DOMAIN);
    }

    @GetMapping(value = "/domain/release/contrast/{modelId}/{modelVersionId}")
    @Operation(summary = "发布模型前校验")
    public ArchyReleaseDto releaseModelContrast(@Parameter(description = "模型ID", required = true) @PathVariable(name = "modelId") Long modelId,
                                                @Parameter(description = "模型版本ID", required = true) @PathVariable(name = "modelVersionId") Long modelVersionId) {
        return archyCommonService.releaseModelContrast(modelId, modelVersionId, ArchyType.DOMAIN);
    }

    @PostMapping(value = "/domain/release/{modelId}/{modelVersionId}")
    @Operation(summary = "发布模型")
    public ArchyDomain releaseModel(@Parameter(description = "模型ID", required = true) @PathVariable(name = "modelId") Long modelId,
                                    @Parameter(description = "模型版本ID", required = true) @PathVariable(name = "modelVersionId") Long modelVersionId,
                                    @Parameter(description = "是否校验业务对象", required = true) @RequestParam(name = "check", required = false, defaultValue = "true") boolean check) {
        ArchyDomain archyDomain = archyDomainService.releaseModel(modelId, modelVersionId, check);
        if (archyDomain != null && archyDomain.getState().equals(ArchyState.C)) {
            archyDomainService.archyDomainApplyVerification(archyDomain, ProcessType.ARCHY_DOMAIN_UPDATE);
            try {
                localWorkflowService.applyDomainProcess(archyDomain, ProcessType.ARCHY_DOMAIN_UPDATE);
            } catch (Exception e) {
                archyDomainService.deleteArchyDomainById(archyDomain.getId());
                archyDomainService.updateArchyDomainUpdateId(archyDomain.getUpdateId(), null);
                throw new InvalidArgumentException("发布模型失败：" + e.getMessage());
            }
        } else if (archyDomain != null && archyDomain.getState().equals(ArchyState.D)) {
            archyDomainService.archyDomainApplyVerification(archyDomain, ProcessType.ARCHY_DOMAIN_PUBLISH);
            try {
                localWorkflowService.applyDomainProcess(archyDomain, ProcessType.ARCHY_DOMAIN_PUBLISH);
            } catch (Exception e) {
                archyDomainService.deleteArchyDomainById(archyDomain.getId());
                throw new InvalidArgumentException("发布模型失败：" + e.getMessage());
            }
        }
        return archyDomain;
    }

    @GetMapping(value = "/domain/udps")
    @Operation(summary = "查询UDP")
    public List<ArchyUdp> getArchyDomainUdps() {
        return archyUdpService.getUdps(ArchyType.DOMAIN);
    }

    @PostMapping(value = "/domain/udp")
    @Operation(summary = "创建UDP")
    public void createArchyDomainUdp(@RequestBody List<ArchyUdp> udpList,
                                     @Parameter(description = "是否删除旧数据") @RequestParam(required = false, defaultValue = "false") Boolean forceClear) {
        archyUdpService.createUdps(udpList, ArchyType.DOMAIN, forceClear);
    }
}
