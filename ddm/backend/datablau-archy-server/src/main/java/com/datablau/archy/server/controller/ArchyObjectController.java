package com.datablau.archy.server.controller;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.model.common.utility.RootBeanHelper;
import com.datablau.archy.common.enums.ArchyState;
import com.datablau.archy.common.enums.ArchyType;
import com.datablau.archy.server.dto.*;
import com.datablau.archy.server.dto.diagram.DiagramArchyObjectDto;
import com.datablau.archy.server.dto.parsed.ParsedObject;
import com.datablau.archy.server.dto.query.ArchyObjectQueryDto;
import com.datablau.archy.server.dto.release.ArchyReleaseDto;
import com.datablau.archy.server.enums.ProcessType;
import com.datablau.archy.server.jpa.entity.ArchyObject;
import com.datablau.archy.server.jpa.entity.ArchyUdp;
import com.datablau.archy.server.jpa.repository.ArchyObjectRepository;
import com.datablau.archy.server.service.ArchyCommonService;
import com.datablau.archy.server.service.ArchyObjectService;
import com.datablau.archy.server.service.ArchyUdpService;
import com.datablau.archy.server.service.LocalWorkflowService;
import com.datablau.archy.server.service.impl.ArchyObjectExtendServiceImpl;
import com.datablau.archy.server.utils.DataUtility;
import com.datablau.data.common.api.instantjob.InstantJob;
import com.datablau.data.common.api.instantjob.InstantJobProgressMonitor;
import com.datablau.data.common.api.instantjob.InstantJobService;
import com.datablau.data.common.controller.BaseController;

import com.datablau.data.common.data.instantjob.EnumJobType;
import com.datablau.data.common.data.instantjob.FileGenerateInstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobStage;
import com.datablau.data.common.util.ExcelUtil;
import com.datablau.data.common.util.JsonUtils;
import com.datablau.model.common.dto.DiagramInfoDto;
import com.datablau.project.api.DatablauRemoteDdmModelServiceNew;
import com.datablau.project.api.DomainExtService;
import com.datablau.project.api.dto.BatchApplyDetailRemoteDto;
import com.datablau.project.api.dto.BatchApplyRemoteDto;
import com.datablau.project.api.dto.DdmElementExtDto;
import com.datablau.project.api.dto.DdmModelVersionDto;
import com.datablau.project.api.dto.DdmModelVersionQueryDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.CollectionUtils;
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

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

/**
 * @Author yudonghai - 北京数语科技有限公司
 * @Date 2022/7/21 19:00
 */
@RestController
@RequestMapping("/object")
@Tag(name = "Archy业务对象相关REST API", description = "Archy业务对象相关REST API")
public class ArchyObjectController extends BaseController {

    @Autowired
    private ArchyCommonService archyCommonService;

    @Autowired
    private ArchyObjectService archyObjectService;

    @Autowired
    private ArchyUdpService archyUdpService;

    @Autowired
    private LocalWorkflowService localWorkflowService;

    @Autowired
    private ArchyObjectRepository archyObjectDao;

    @Autowired
    private ArchyObjectExtendServiceImpl archyObjectExtendService;

    @Autowired
    private DomainExtService domainExtService;

    @Autowired
    DatablauRemoteDdmModelServiceNew datablauRemoteDdmModelServiceNew;
    @Autowired
    private InstantJobService instantJobService;
    @Operation(summary = "根据ID查询业务对象")
    @GetMapping("/object/{uuid}")
    public ArchyObject findArchyObjectById(@Parameter(description = "业务对象ID") @PathVariable(name = "uuid") String uuid,
                                           @Parameter(description = "版本ID") @RequestParam(name = "version", required = false) Integer version) {
        if (version == null) {
            return archyObjectService.findArchyObjectById(uuid);
        }
        return archyObjectService.findArchyObjectByIdAndVersion(uuid, version);
    }

    @Operation(summary = "根据条件查询业务对象")
    @PostMapping("/objects")
    public Page<ArchyObjectSearchDto> findArchyObjects(@RequestBody ArchyObjectQueryDto archyObjectQueryDto,
                                              @Parameter(description = "当前页，默认值是1") @RequestParam(name = "currentPage", required = false, defaultValue = "1") Integer currentPage,
                                              @Parameter(description = "页面大小") @RequestParam(name = "pageSize", required = false, defaultValue = "999999") Integer pageSize) {
//        return archyObjectService.findArchyObjects(archyObjectQueryDto, currentPage, pageSize);
        return archyObjectExtendService.findArchyObjects0(archyObjectQueryDto, currentPage, pageSize);
    }

    @Operation(summary = "查询业务对象的历史版本")
    @GetMapping("/object/history")
    public List<ArchyObject> findArchyObjectHistory(@Parameter(description = "业务对象ID", required = true) @RequestParam(name = "uuid") String uuid,
                                                    @Parameter(description = "是否去掉最新版本") @RequestParam(name = "decapitation", required = false) Boolean decapitation) {
        return archyObjectService.findArchyObjectHistory(uuid, decapitation);
    }

    @Operation(summary = "查询已存在的主题")
    @GetMapping("/objects/subjectTag")
    public List<String> findDistinctSubjectTag() {
        return archyObjectService.findDistinctSubjectTag();
    }

    @Operation(summary = "创建业务对象", description = "创建业务对象时，可以先不绑定模型。默认版本为:1，默认状态为:待审核")
    @PostMapping("/object")
    public ArchyObject createArchyObject(@RequestBody ArchyObject archyObject) {
        return archyObjectService.createArchyObject(archyObject);
    }

    @Operation(summary = "修改业务对象", description = "对待审核的业务对象直接修改，或对已发布的业务对象申请变更")
    @PutMapping("/object")
    public ArchyObject updateArchyObject(@RequestBody ArchyObject archyObject) {
        ArchyObject saved = archyObjectService.updateArchyObject(archyObject);
        // 发起变更申请
        if (saved.getState().equals(ArchyState.C)) {
            archyObjectService.archyObjectApplyVerification(saved, ProcessType.ARCHY_OBJECT_UPDATE);
            try {
                localWorkflowService.applyObjectProcess(saved, ProcessType.ARCHY_OBJECT_UPDATE);
            } catch (Exception e) {
                // 发起评审异常处理 1.删除新创建的数据 2.将原有数据的updateId置为NULL
                archyObjectService.deleteArchyObjectById(saved.getId());
                archyObjectService.updateArchyObjectUpdateId(archyObject.getId(), null);
                throw new InvalidArgumentException("变更申请失败：" + e.getMessage());
            }
        }
        return saved;
    }

    @Operation(summary = "删除业务对象", description = "对待审核的业务对象直接删除，或对已发布的业务对象申请废弃")
    @DeleteMapping("/object/{uuid}")
    public void deleteDevelopmentArchyObject(@Parameter(description = "业务对象ID", required = true) @PathVariable(name = "uuid") String uuid) {
        ArchyObject archyObject = archyObjectService.abolishArchyObject(uuid);
        // 发起评审
        if (archyObject != null) {
            archyObjectService.archyObjectApplyVerification(archyObject, ProcessType.ARCHY_OBJECT_ABOLISH);
            try {
                localWorkflowService.applyObjectProcess(archyObject, ProcessType.ARCHY_OBJECT_ABOLISH);
            } catch (Exception e) {
                // 发起评审异常处理 1.删除新创建的数据 2.将原有数据的updateId置为NULL
                archyObjectService.deleteArchyObjectById(archyObject.getId());
                archyObjectService.updateArchyObjectUpdateId(uuid, null);
                throw new InvalidArgumentException("废弃申请失败：" + e.getMessage());
            }
        }
    }

    @Operation(summary = "批量删除业务对象", description = "只能批量删除待评审的业务对象")
    @DeleteMapping("/objects/delete")
    public void deleteArchyObjects(@RequestBody List<String> ids) {
        archyObjectService.deleteArchyObjectByIds(ids);
    }

    @PostMapping("/objects/import")
    @Operation(summary = "导入业务对象")
    public Map<String, Integer> importArchyObjects2(@Parameter(description = "导入业务对象的excel文件") @RequestParam("file") MultipartFile multipartFile) throws Exception {
        return archyObjectService.importArchyObjects(multipartFile);
    }

    @PostMapping(value = "/objects/export/template")
    @Operation(summary = "导出业务对象模板")
    public ResponseEntity<byte[]> exportArchyObjectTemplate() {
        return DataUtility.generalResponseEntityByFile(archyObjectService.exportArchyObjects(null));
    }

    @PostMapping(value = "/objects/export")
    @Operation(summary = "导出业务对象")
    public ResponseEntity<byte[]> exportArchyObjects(@RequestBody ArchyObjectQueryDto archyObjectQueryDto) {
        archyObjectQueryDto.setState(Collections.singleton(ArchyState.A));
        Page<ArchyObject> archyObjects = archyObjectService.findArchyObjects(archyObjectQueryDto, 1, 999999);
        return DataUtility.generalResponseEntityByFile(archyObjectService.exportArchyObjects(archyObjects.getContent()));
    }

    @PostMapping(value = "/objects/export/selected")
    @Operation(summary = "导出选中的业务对象")
    public ResponseEntity<byte[]> exportArchyObjects(@RequestBody List<String> ids) {
        List<ArchyObject> archyObjects = archyObjectService.findArchyObjectByIds(ids);
        return DataUtility.generalResponseEntityByFile(archyObjectService.exportArchyObjects(archyObjects));
    }

    @PostMapping("/object/{uuid}/process/apply")
    @Operation(summary = "发布业务对象")
    public void releaseArchyObject(@Parameter(description = "业务对象ID", required = true) @PathVariable(name = "uuid") String uuid) {
        ArchyObject arc = archyObjectService.findArchyObjectById(uuid);
        if (arc == null) {
            throw new InvalidArgumentException("业务对象不存在");
        }
        archyObjectService.archyObjectApplyVerification(arc, ProcessType.ARCHY_OBJECT_PUBLISH);
//        try {
//            localWorkflowService.applyObjectProcess(archyObject, ProcessType.ARCHY_OBJECT_PUBLISH);
//        } catch (Exception e) {
//            archyObject.setState(ArchyState.D);
//            archyObjectDao.save(archyObject);
//            throw new InvalidArgumentException(e.getMessage());
//        }
        List<ArchyObject> archyObjectByIds = new ArrayList<>();
        archyObjectByIds.add(arc);
        List<DdmModelVersionQueryDto> list = new ArrayList<>();
        for (ArchyObject a : archyObjectByIds) {
            DdmModelVersionQueryDto dto = new DdmModelVersionQueryDto();
            dto.setModelId(a.getLogicalModelId());
            dto.setModelVersionId(a.getLogicalModelVersionId());
            list.add(dto);
        }
        //获取模型的版本信息
        List<DdmModelVersionDto> ddmModelVersionDto = datablauRemoteDdmModelServiceNew.getDdmModelVersionDto(list);
        Map<Long, DdmModelVersionDto> dtoMap;
        if (Objects.nonNull(ddmModelVersionDto)) {
            dtoMap = ddmModelVersionDto.stream().collect(Collectors.toMap(DdmModelVersionDto::getModelVersionId, d -> d));
        } else {
            dtoMap = new HashMap<>();
        }

        Map<String, List<ArchyObject>> groupedBySecondLevel = archyObjectByIds.stream()
                .filter(obj -> obj.getPath() != null)
                .filter(obj -> obj.getPath().split("/").length >= 2)
                .collect(Collectors.groupingBy(obj -> obj.getPath().split("/")[1]));
        String currentUser = getCurrentUser();
        ObjectMapper mapper = new ObjectMapper();
        groupedBySecondLevel.forEach((k,v)->{
            BatchApplyRemoteDto batchApplyRemoteDto = new BatchApplyRemoteDto();
            batchApplyRemoteDto.setApplyCreator(currentUser);
            batchApplyRemoteDto.setApplyCreateTime(new Date());
            batchApplyRemoteDto.setApplyType("业务模型");
            batchApplyRemoteDto.setApplyOperation("发布");
            batchApplyRemoteDto.setApplyName(k);
            //  code
            List<BatchApplyDetailRemoteDto> detailRemoteDtos  = new ArrayList<>();
            for (ArchyObject archyObject : v) {
                BatchApplyDetailRemoteDto detailRemoteDto = new BatchApplyDetailRemoteDto();
                detailRemoteDto.setCode(archyObject.getCode());
//                detailRemoteDto.setOrderState();
                detailRemoteDto.setEnName(archyObject.getAlias());
                detailRemoteDto.setCnName(archyObject.getName());
                detailRemoteDto.setNeId(archyObject.getId());
                detailRemoteDto.setDataType("业务模型");
                detailRemoteDto.setSubmitUser(currentUser);
                detailRemoteDto.setOrderType("发布");
                //   detailRemoteDto.setOrderType();

                //两个模型版本的增量数据
                try {
                    DdmModelVersionDto versionDto = dtoMap.get(archyObject.getLogicalModelVersionId());
                    Long modelCurrentVersionId = versionDto.getModelCurrentVersionId();
                    CompareResultDto resultDto = archyObjectExtendService.getElementsChangesBetweenTwoVersions(archyObject.getLogicalModelId(), archyObject.getLogicalModelVersionId(),
                            modelCurrentVersionId, true, archyObject.getName());
                    detailRemoteDto.setNeData(mapper.writeValueAsString(resultDto));
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }

                detailRemoteDtos.add(detailRemoteDto);
            }
            batchApplyRemoteDto.setDetails(detailRemoteDtos);
            domainExtService.remoteCreateUpdateApple(batchApplyRemoteDto,"bu_pub");

        });
    }

    @PostMapping("/objects/process/apply")
    @Operation(summary = "批量发布业务对象")
    public void releaseArchyObjects(@Parameter(description = "业务对象ID集合", required = true) @RequestBody Set<String> uuids) {
        List<String> uuidList = new ArrayList<>(uuids);
        List<ArchyObject> archyObjectByIds = archyObjectService.findArchyObjectByIds(uuidList);

        for (ArchyObject  archyObjectById: archyObjectByIds) {
            archyObjectExtendService.archyObjectApplyVerification(archyObjectById, ProcessType.ARCHY_OBJECT_PUBLISH);
        }

        List<DdmModelVersionQueryDto> list = new ArrayList<>();
        for (ArchyObject archyObject : archyObjectByIds) {
            DdmModelVersionQueryDto dto = new DdmModelVersionQueryDto();
            dto.setModelId(archyObject.getLogicalModelId());
            dto.setModelVersionId(archyObject.getLogicalModelVersionId());
            list.add(dto);
        }
        //获取模型的版本信息
        List<DdmModelVersionDto> ddmModelVersionDto = datablauRemoteDdmModelServiceNew.getDdmModelVersionDto(list);
        Map<Long, DdmModelVersionDto> dtoMap;
        if (Objects.nonNull(ddmModelVersionDto)) {
            dtoMap = ddmModelVersionDto.stream().collect(Collectors.toMap(DdmModelVersionDto::getModelVersionId, d -> d));
        } else {
            dtoMap = new HashMap<>();
        }

        Map<String, List<ArchyObject>> groupedBySecondLevel = archyObjectByIds.stream()
                .filter(obj -> obj.getPath() != null)
                .filter(obj -> obj.getPath().split("/").length >= 2)
                .collect(Collectors.groupingBy(obj -> obj.getPath().split("/")[1]));
        String currentUser = getCurrentUser();
        ObjectMapper mapper = new ObjectMapper();
        groupedBySecondLevel.forEach((k,v)->{
            BatchApplyRemoteDto batchApplyRemoteDto = new BatchApplyRemoteDto();
            batchApplyRemoteDto.setApplyCreator(currentUser);
            batchApplyRemoteDto.setApplyCreateTime(new Date());
            batchApplyRemoteDto.setApplyType("业务模型");
            batchApplyRemoteDto.setApplyOperation("发布");
            batchApplyRemoteDto.setApplyName(k);
            List<BatchApplyDetailRemoteDto> detailRemoteDtos  = new ArrayList<>();
            for (ArchyObject archyObject : v) {
                BatchApplyDetailRemoteDto detailRemoteDto = new BatchApplyDetailRemoteDto();
                detailRemoteDto.setCode(archyObject.getCode());
//                detailRemoteDto.setOrderState();
                detailRemoteDto.setEnName(archyObject.getName());
                detailRemoteDto.setCnName(archyObject.getAlias());
                detailRemoteDto.setNeId(archyObject.getId());
                detailRemoteDto.setDataType("业务模型");
                detailRemoteDto.setSubmitUser(currentUser);
                detailRemoteDto.setOrderType("发布");
             //   detailRemoteDto.setOrderType();

                //两个模型版本的增量数据
                try {
                    DdmModelVersionDto versionDto = dtoMap.get(archyObject.getLogicalModelVersionId());
                    Long modelCurrentVersionId = versionDto.getModelCurrentVersionId();
                    CompareResultDto resultDto = archyObjectExtendService.getElementsChangesBetweenTwoVersions(archyObject.getLogicalModelId(), archyObject.getLogicalModelVersionId(),
                            modelCurrentVersionId, true, archyObject.getName());
                    detailRemoteDto.setNeData(mapper.writeValueAsString(resultDto));
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }

                detailRemoteDtos.add(detailRemoteDto);
            }
            batchApplyRemoteDto.setDetails(detailRemoteDtos);
            domainExtService.remoteCreateUpdateApple(batchApplyRemoteDto,"bu_pub");

        });

     //   uuids.forEach(this::releaseArchyObject);
    }

    @PostMapping(value = "/objects/export/compare")
    @Operation(summary = "导出选中的业务对象")
    public ResponseEntity<byte[]> exportcompare(@RequestBody CompareResultDto resultDto) throws Exception {
        return DataUtility.generalResponseEntityByFile(archyObjectExtendService.exportcompare(resultDto));
    }

    @PostMapping("/test")
    public List<CompareResultDto> test0(@RequestBody Set<String> uuids) {
        List<String> uuidList = new ArrayList<>(uuids);
        List<ArchyObject> archyObjectByIds = archyObjectService.findArchyObjectByIds(uuidList);
        List<DdmModelVersionQueryDto> list = new ArrayList<>();
        for (ArchyObject archyObject : archyObjectByIds) {
            DdmModelVersionQueryDto dto = new DdmModelVersionQueryDto();
            dto.setModelId(archyObject.getLogicalModelId());
            dto.setModelVersionId(archyObject.getLogicalModelVersionId());
            list.add(dto);
        }
        //获取模型的版本信息
        List<DdmModelVersionDto> ddmModelVersionDto = datablauRemoteDdmModelServiceNew.getDdmModelVersionDto(list);
        Map<Long, DdmModelVersionDto> dtoMap;
        if (Objects.nonNull(ddmModelVersionDto)) {
            dtoMap = ddmModelVersionDto.stream().collect(Collectors.toMap(DdmModelVersionDto::getModelVersionId, d -> d));
        } else {
            dtoMap = new HashMap<>();
        }

        ArrayList<CompareResultDto> res = new ArrayList<>();
        for (ArchyObject archyObject : archyObjectByIds) {
            //两个模型版本的增量数据
            try {

                DdmModelVersionDto versionDto = dtoMap.get(archyObject.getLogicalModelVersionId());
                Long modelCurrentVersionId = versionDto.getModelCurrentVersionId();
                CompareResultDto res0 = archyObjectExtendService.getElementsChangesBetweenTwoVersions(archyObject.getLogicalModelId(), archyObject.getLogicalModelVersionId(),
                        modelCurrentVersionId, true, archyObject.getName());
                res.add(res0);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
        return res;
    }


    @PostMapping(value = "/object/info/{uuid}")
    @Operation(summary = "查询业务对象绑定的模型基本信息")
    public ArchyBindModelBasicInfoExtDto getModelInfo(@Parameter(description = "对象ID", required = true) @PathVariable(name = "uuid") String uuid,
                                                   @Parameter(description = "版本") @RequestParam(name = "version", required = false, defaultValue = "0") int version,
                                                   @Parameter(description = "是否加载实体") @RequestParam(name = "setEntity", required = false, defaultValue = "true") Boolean setEntity) {

        ArchyBindModelBasicInfoDto modelInfo = archyObjectService.getModelInfo(uuid, version, setEntity);
        ArchyBindModelBasicInfoExtDto resDto = new ArchyBindModelBasicInfoExtDto(modelInfo);

        List<ArchyModelElementDto> entities = modelInfo.getEntities();
        if(!CollectionUtils.isEmpty(entities)){
            List<Long> elementIds = entities.stream().map(ArchyModelElementDto::getElementId).toList();
            List<DdmElementExtDto> modelElementExts = archyObjectExtendService.getModelElementExtByElementIds(elementIds, uuid);
            Map<Long, DdmElementExtDto> elementExtMap = modelElementExts.stream().collect(Collectors.toMap(DdmElementExtDto::getModelElementId, a -> a));

            List<ArchyModelElementExtDto> res = new ArrayList<>();
            for (ArchyModelElementDto entity : entities) {
                ArchyModelElementExtDto dto = new ArchyModelElementExtDto();
                BeanUtils.copyProperties(entity, dto);

                DdmElementExtDto extDto = elementExtMap.get(entity.getElementId());
                if(extDto != null){
                    if(!Strings.isNullOrEmpty(extDto.getUpdater())){
                        dto.setOperator(extDto.getUpdater());
                    }else {
                        dto.setOperator(extDto.getCreater());
                    }

                    if(extDto.getUpdateDate() != null){
                        dto.setOperatorDate(extDto.getUpdateDate());
                    }else {
                        dto.setOperatorDate(extDto.getCreateDate());
                    }

                    res.add(dto);
                }
            }
            resDto.setEntities(res);
        }
        return resDto;
    }

    @PostMapping(value = "/object/info/tables/{uuid}")
    @Operation(summary = "查询业务对象下关联的表")
    public List<EntityRelationDto> getRelatedSubTables(@Parameter(description = "对象ID", required = true) @PathVariable(name = "uuid") String uuid) {
        return archyObjectService.getRelatedSubTables(uuid);
    }

    @GetMapping(value = "/object/release/versions/{modelId}")
    @Operation(summary = "查询模型的发布版本列表")
    public List<ArchyModelVersionReleaseDto> getArchyModelVersions(@Parameter(description = "模型ID", required = true) @PathVariable(name = "modelId") Long modelId) {
        return archyObjectService.getArchyModelVersions(modelId);
    }

    @GetMapping(value = "/object/elements/relationship/{uuid}")
    @Operation(summary = "获取对象之间的关系列表")
    public List<ElementRelationshipDto> getElementRelationship(@Parameter(description = "对象UUID", required = true) @PathVariable(name = "uuid") String uuid) {
        return archyCommonService.getElementRelationship(uuid, ArchyType.OBJECT);
    }

    @GetMapping(value = "/object/elements/{uuid}")
    @Operation(summary = "获取业务对象的子元素")
    public Map<Long, List<ElementExtendDto>> getModelElements(@Parameter(description = "对象ID", required = true) @PathVariable(name = "uuid") String uuid) {
        return archyObjectService.getModelElements(uuid);
    }

    @GetMapping(value = "/object/elements/tree/{uuid}")
    @Operation(summary = "获取业务对象的子元素")
    public Map<Long, ParsedObject> getModelElementTree(@Parameter(description = "对象ID", required = true) @PathVariable(name = "uuid") String uuid) {
       return archyObjectService.getModelElementTree(uuid);
    }

    @GetMapping(value = "/object/release/contrast/{modelId}/{modelVersionId}")
    @Operation(summary = "发布模型前校验")
    public ArchyReleaseDto releaseModelContrast(@Parameter(description = "模型ID", required = true) @PathVariable(name = "modelId") Long modelId,
                                                @Parameter(description = "模型版本ID", required = true) @PathVariable(name = "modelVersionId") Long modelVersionId) {
        return archyCommonService.releaseModelContrast(modelId, modelVersionId, ArchyType.OBJECT);
    }

    @PostMapping(value = "/object/release/{modelId}/{modelVersionId}")
    @Operation(summary = "发布模型")
    public ArchyObject releaseModel(@Parameter(description = "模型ID", required = true) @PathVariable(name = "modelId") Long modelId,
                                    @Parameter(description = "模型版本ID", required = true) @PathVariable(name = "modelVersionId") Long modelVersionId,
                                    @Parameter(description = "是否校验业务对象", required = true) @RequestParam(name = "check", required = false, defaultValue = "true") boolean check) {
        ArchyObject archyObject = archyObjectService.releaseModel(modelId, modelVersionId, check);
        if (archyObject != null && archyObject.getState().equals(ArchyState.C)) {
            archyObjectService.archyObjectApplyVerification(archyObject, ProcessType.ARCHY_OBJECT_UPDATE);
            try {
                localWorkflowService.applyObjectProcess(archyObject, ProcessType.ARCHY_OBJECT_UPDATE);
            } catch (Exception e) {
                archyObjectService.deleteArchyObjectById(archyObject.getId());
                archyObjectService.updateArchyObjectUpdateId(archyObject.getUpdateId(), null);
                throw new InvalidArgumentException("发布模型失败：" + e.getMessage());
            }
        } else if (archyObject != null && archyObject.getState().equals(ArchyState.D)) {
            archyObjectService.archyObjectApplyVerification(archyObject, ProcessType.ARCHY_OBJECT_PUBLISH);
            try {
                localWorkflowService.applyObjectProcess(archyObject, ProcessType.ARCHY_OBJECT_PUBLISH);
            } catch (Exception e) {
                archyObjectService.deleteArchyObjectById(archyObject.getId());
                throw new InvalidArgumentException("发布模型失败：" + e.getMessage());
            }
        }
        return archyObject;
    }

    @GetMapping(value = "/object/udps")
    @Operation(summary = "查询UDP")
    public List<ArchyUdp> getArchyObjectUdps() {
        return archyUdpService.getUdps(ArchyType.OBJECT);
    }

    @PostMapping(value = "/object/udp")
    @Operation(summary = "创建UDP")
    public void createArchyObjectUdp(@RequestBody List<ArchyUdp> udpList,
                                     @Parameter(description = "是否删除旧数据") @RequestParam(required = false, defaultValue = "false") Boolean forceClear) {
        archyUdpService.createUdps(udpList, ArchyType.OBJECT, forceClear);
    }

    @GetMapping("/diagram")
    @Operation(summary = "数据分布视图")
    public List<DiagramArchyObjectDto> getDiagram() {
        return archyObjectService.getCrudDiagram();
    }

    @PostMapping("/diagram/model")
    @Operation(summary = "数据流转图")
    public void generateDiagramModel(@RequestBody DiagramInfoDto info) {
        archyObjectService.generateDiagramModel(info);
    }

    @GetMapping("/updateStateForD/{modelId}")
    public void updateArchyObjectState(@PathVariable(name = "modelId") Long modelId){
        archyObjectExtendService.updateArchyObjectStateForD(modelId);
    }

    @PostMapping(value = "/L4L5/export/template")
    @Operation(summary = "l4l5模板")
    public ResponseEntity<byte[]> exportl4l5Template() throws Exception {
        return DataUtility.generalResponseEntityByFile(archyObjectExtendService.exportl4l5(null));
    }

    @PostMapping(value = "/L4L5/export")
    @Operation(summary = "l4l5导出")
    public ResponseEntity<byte[]> exportL4L5() throws Exception {
        ArrayList<ArchyObject> s = new ArrayList<>();
        for (ArchyObject a : archyObjectDao.findAll()) {
            s.add(a);
        }
        return DataUtility.generalResponseEntityByFile(archyObjectExtendService.exportl4l5(s));
    }

    @PostMapping("/L4L5/import")
    @Operation(summary = "导入l4l5")
    public String importL4L5(@Parameter(description = "导入L4L5的excel文件") @RequestParam("file") MultipartFile multipartFile) throws Exception {

        String currentUser = getCurrentUser();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        try {
            Map<String, List<Object>> sheets = ExcelUtil.readFileManySheet(multipartFile);
            for (String sheetName : List.of("逻辑数据实体", "业务属性")) {
                if (!sheets.containsKey(sheetName)) {
                    throw new RuntimeException("导入模板没有【" + sheetName + "】的sheet页");
                }
            }
            final SecurityContext context = SecurityContextHolder.getContext();
            String filePath = DataUtility.uploadFile(multipartFile).getAbsolutePath();
            String submitJob = instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                                               @Override
                                                               public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                                               }

                                                               @Override
                                                               public InstantJobResult call() throws Exception {
                                                                   SecurityContextHolder.setContext(context);
                                                                   ArchyObjectL4L5ImportResultDto importResult = new ArchyObjectL4L5ImportResultDto();
                                                                   importResult = archyObjectExtendService.importL4L5(multipartFile, sheets, filePath);
                                                                   FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                                   result.setErrorMessage(JsonUtils.toJSon(importResult));
                                                                   result.setJobStatus(InstantJobStage.FINISHED);
                                                                   result.setFileId(importResult.getFileId());
                                                                   return result;
                                                               }
                                                           }
                    , "业务对象导入" + sdf.format(new Date()), currentUser, EnumJobType.IMPORT.name());
            return submitJob;
        } catch (Exception e) {
            e.printStackTrace();
            throw new UnexpectedStateException("上传文件读取失败，", e);
        }
    }
}