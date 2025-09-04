package com.datablau.data.asset.controller;


import com.andorj.common.core.annotation.Description;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.data.PageResult;
import com.andorj.lineage.data.LineageContainer;
import com.andorj.lineage.data.LineageStep;
import com.andorj.model.common.api.MessageService;
import com.datablau.base.data.TagUdpDto;
import com.datablau.catalog.enums.EnumAssetsCatalogStatus;
import com.datablau.catalog.enums.EnumCodeType;
import com.datablau.catalog.enums.EnumSupportType;
import com.datablau.common.utils.JsonUtils;
import com.datablau.data.asset.api.DataAssetLocalMetadataService;
import com.datablau.data.asset.api.DataAssetsCatalogAuthService;
import com.datablau.data.asset.api.DataAssetsCatalogService;
import com.datablau.data.asset.api.DataAssetsCodeGenerateService;
import com.datablau.data.asset.api.DataAssetsService;
import com.datablau.data.asset.api.DataAssetsStatisticService;
import com.datablau.data.asset.api.DataAssetsVisitService;
import com.datablau.data.asset.api.ESService;
import com.datablau.data.asset.config.ThreadPoolInstance;
import com.datablau.data.asset.dto.AssetCheckTaskDto;
import com.datablau.data.asset.dto.CodeDto;
import com.datablau.data.asset.dto.DataAssetDetailDto;
import com.datablau.data.asset.dto.DataAssetsCatalogAuthDto;
import com.datablau.data.asset.dto.DataAssetsCatalogDto;
import com.datablau.data.asset.dto.DataAssetsDto;
import com.datablau.data.asset.dto.DataObjectPropertyDto;
import com.datablau.data.asset.dto.ResResultDto;
import com.datablau.data.asset.dto.SearchAssetsDto;
import com.datablau.data.asset.dto.SearchDto;
import com.datablau.data.asset.dto.TableAssetDto;
import com.datablau.data.asset.dto.TableAssetSearchDto;
import com.datablau.data.asset.enums.EnumAuthStatusType;
import com.datablau.data.asset.enums.EnumAuthType;
import com.datablau.data.asset.enums.EnumSearchRange;
import com.datablau.data.asset.enums.EnumSyncRange;
import com.datablau.data.asset.job.DataAssetsDiscernJob;
import com.datablau.data.asset.jpa.entity.DataAssets;
import com.datablau.data.asset.upload.DDCAssetImportResultDto;
import com.datablau.data.asset.utils.FileUtility;
import com.datablau.data.asset.utils.KafkaLogUtils;
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
import com.datablau.data.security.api.RemoteDataSecurityCatalogElementRelService;
import com.datablau.dataasset.utils.IpUtil;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.job.scheduler.data.JobParameter;
import com.datablau.metadata.common.api.DatablauRemoteMetadataService;
import com.datablau.metadata.common.dto.RemoteKeyDto;
import com.datablau.metadata.common.dto.RemoteTechRuleEntityResultDto;
import com.datablau.metadata.common.dto.metadata.DataObjectDto;
import com.datablau.metadata.common.dto.metadata.DataSampleDto;
import com.datablau.metadata.common.dto.metadata.query.DataSampleQueryDto;
import com.datablau.security.management.api.OrganizationService;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.dto.OrganizationDto;
import com.datablau.security.management.dto.UserDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.commons.lang.time.DateFormatUtils;
import org.apache.commons.lang3.StringUtils;
import org.elasticsearch.index.query.TermQueryBuilder;
import org.redisson.api.RBucket;
import org.redisson.api.RedissonClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;


/**
 * 数据资产控制层
 */
@Tag(name = "数据资产")
@RestController
@RequestMapping("/assets")
public class DataAssetsController extends BaseController {
    private static ObjectMapper mapper = new ObjectMapper();
    private static final Logger LOGGER = LoggerFactory.getLogger(DataAssetsController.class);

    @Autowired
    private DataAssetsService dataAssetsService;
    @Autowired
    private DataAssetsCatalogService dataAssetsCatalogService;
    @Autowired
    private KafkaLogUtils kafkaLogUtils;

    @Autowired
    private DataAssetsCatalogAuthService authService;

    @Autowired
    private InstantJobService instantJobService;
    @Autowired
    private FileUtility storedFileService;
    @Autowired
    private DataAssetsCodeGenerateService codeGenerateService;
    @Autowired
    private ESService esService;
    @Autowired
    private DataAssetLocalMetadataService dataAssetLocalMetadataService;

    @Autowired
    @Qualifier("remoteMetadataService")
    private DatablauRemoteMetadataService metadataService;

    @Autowired
    @Qualifier("remoteDataSecurityCatalogElementRelService")
    private RemoteDataSecurityCatalogElementRelService dataSecurityCatalogElementRelService;


    @Autowired
    private DataAssetsVisitService dataAssetsCatalogVisitService;
    @Autowired
    private OrganizationService organizationService;
    @Autowired
    private UserService userService;

    @Autowired
    private RedissonClient redissonClient;

    @Autowired
    private MessageService messageService;

    public DataAssetsController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    /**
     * 资产列表
     *
     * @param searchDto
     * @return
     */
    @Operation(summary = "资产列表")
    @PostMapping(value = "/list")
    public ResResultDto<Map<String, Object>> list(@RequestBody SearchDto searchDto) {
        searchDto.setUser(getCurrentUser());
        boolean fromBrowse = searchDto.getIsFromBrowse() != null && searchDto.getIsFromBrowse();
        Map<String, Object> map = new HashMap<>();
        List<DataAssetsCatalogAuthDto> catalogAuths = new ArrayList<>();
        if (!searchDto.getRange().equals(EnumSearchRange.BROWSE)) {
            catalogAuths = authService.getAllCatalog(searchDto, getCurrentUser(), fromBrowse);
            if (CollectionUtils.isEmpty(catalogAuths)) {
                return ResResultDto.ok(map);
            }
        }
        switch (searchDto.getRange()) {
            case LIST: //管理
                if (fromBrowse) {
                    catalogAuths.stream().filter(auth -> auth.getAuthType().equals(EnumAuthType.READ)).collect(Collectors.toSet());
                } else {
                    catalogAuths.stream().filter(auth -> auth.getAuthType().equals(EnumAuthType.MANAGER) || auth.getAuthType().equals(EnumAuthType.EDIT)).collect(Collectors.toSet());
                }
                searchDto.setCatalogIds(catalogAuths.stream().map(DataAssetsCatalogAuthDto::getCatalogId).collect(Collectors.toSet()));
                map = dataAssetsService.searchAssets(searchDto);
                break;
            case BROWSE: //浏览
                if (!searchDto.getCurCatalog()) {
                    Map<String, Object> resMap = dataAssetsCatalogService.getSubCatalogAuthStatus(searchDto, this.getCurrentUser());
                    Map<Long, EnumAuthStatusType> catalogAuthStatus = (Map<Long, EnumAuthStatusType>) resMap.get("status");
                    searchDto.setCatalogIds(catalogAuthStatus.keySet());
                    map = dataAssetsService.searchAssets(searchDto);
                    map.put("status", catalogAuthStatus);
                } else {
                    map = dataAssetsService.searchAssets(searchDto);
                }
                //bug 17381 fix
//                if (map.containsKey("catalogIdSet")) {
//                    map.put("status", catalogAuthStatus);
//                }
                break;
            default:
        }
        return ResResultDto.ok(map);
    }

    @PostMapping("/level/one")
    public ResResultDto<List<DataAssetsCatalogDto>> getLevelOneCatalogs(@RequestBody List<Long> structureIds) {
        Long structureId = null;
        if (!CollectionUtils.isEmpty(structureIds)) {
            structureId = structureIds.get(0);
        }
        return ResResultDto.ok(dataAssetsCatalogService.getLevelOneCatalogs(structureId, getCurrentUser()));
    }

    /**
     * 资产是否认证
     *
     * @param itemId 资产ID
     * @return
     */
    @Operation(summary = "资产是否认证")
    @GetMapping(value = "/{itemId}/isVerified")
    public ResResultDto<Boolean> isVerified(@PathVariable String itemId) {
        Boolean verified = dataAssetsService.isVerified(itemId);
        return ResResultDto.ok(verified);
    }

    @Operation(summary = "获取该目录下未发布以及下线的资产")
    @PostMapping(value = "/getAssetsByStatus")
    public ResResultDto<List<DataAssetsDto>> getUnpublishedAndOfflineAssets(@RequestBody SearchAssetsDto searchAssetsDto) {
        List<DataAssetsDto> assets = dataAssetsService.getAssetsByStatus(searchAssetsDto.getCatalogId(), searchAssetsDto.getStatus());
        return ResResultDto.ok(assets);
    }

    @Operation(summary = "获取该目录下未发布以及下线的资产（不分页）")
    @PostMapping(value = "/getAssetsByStatus/{catalogId}")
    public ResResultDto<List<Map<String, Object>>> getUnpublishedAndOfflineAssetsWithoutPage(@PathVariable("catalogId") Long catalogId, @RequestBody List<EnumAssetsCatalogStatus> statusList) {
        return ResResultDto.ok(dataAssetsService.getAllAssetsByStatus(catalogId, statusList, false));
    }


    @Operation(summary = "目录下资产是否存在未发布的资产")
    @GetMapping(value = "/exist/unpublishedAssets/{catalogId}")
    public ResResultDto<Boolean> existUnpublishedAssets(@PathVariable Long catalogId) {
        Boolean unpublishedAssets = dataAssetsService.existUnpublishedAssets(catalogId);
        return ResResultDto.ok(unpublishedAssets);
    }


    @Operation(summary = "获取该目录下，以及子目录资产清单")
    @PostMapping(value = "/getAllSubAssetsByCatalogId/{catalogId}/{structureId}")
    public ResResultDto<?> getAllSubAssetsByCatalogId(@PathVariable Long structureId, @PathVariable Long catalogId, @RequestBody List<EnumAssetsCatalogStatus> statusList) {
        List<Map<String, Object>> subHavePermissionAssets = dataAssetsService.getSubHavePermissionAssets(structureId, catalogId, statusList, getCurrentUser());
        return ResResultDto.ok(subHavePermissionAssets);
    }


    /**
     * 删除资产数据
     *
     * @param ids 资产ID 集合
     * @return ResResultDto
     */
    @Operation(summary = "删除资产数据")
    @DeleteMapping(value = "/")
    public ResResultDto delete(@RequestBody List<Long> ids) {
        Map<Long, List<String>> delete = dataAssetsService.deleteBatch(ids);
        kafkaLogUtils.deleteAssets(this.getCurrentUser(), delete, IpUtil.getUserIp(), IpUtil.getUrl());
        return ResResultDto.ok();
    }


    @Operation(summary = "资产数据详情")
    @GetMapping(value = "/{id}/{type}")
    public ResResultDto<Boolean> details(@PathVariable Long id, @PathVariable EnumSupportType type) {
        return ResResultDto.ok(dataAssetsService.getAssets(id, type));
    }

    @Operation(summary = "导出目录中的资产")
    @PostMapping(value = "/export")
    public String exportAssetByCId(HttpServletResponse response,
                                   @RequestParam("catalogId") Long catalogId,
                                   @RequestParam("catalogName") String catalogName,
                                   @RequestParam("structureId") Long structureId,
                                   @RequestParam("parentId") Long parentId) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        String currentUser = getCurrentUser();
        String submitJob = instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                                           @Override
                                                           public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                                           }

                                                           @Override
                                                           public InstantJobResult call() throws Exception {
                                                               Map<String, List<List<Object>>> exportAssets = dataAssetsCatalogService.exportAssets(
                                                                       catalogId, catalogName, structureId, parentId);
                                                               File file = ExcelUtil.export(exportAssets);
                                                               FileDescriptor storedFile = storedFileService.uploadFile(file, messageService.getMessage("assetsList") + ".xlsx", currentUser, false);
//                                                               storedFileService.commitUploadFile(Collections.singleton(storedFile.getFileId()));
                                                               FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                               result.setFileId(storedFile.getFileId());
                                                               result.setJobStatus(InstantJobStage.FINISHED);
                                                               return result;
                                                           }
                                                       }
                , messageService.getMessage("exportDataAsset") + sdf.format(new Date()), currentUser, EnumJobType.EXPORT.name());
        kafkaLogUtils.exportAssets(this.getCurrentUser(), catalogId, dataAssetsCatalogService.getFullPathByCatalogId(catalogId), IpUtil.getUserIp(), IpUtil.getUrl());
        LOGGER.info("The export of data assets is complete");
        return submitJob;
    }

    @Operation(summary = "导出目录中的资产")
    @PostMapping(value = "/export/structure/{structureId}")
    public String exportAssetBySId(HttpServletResponse response,
                                   @PathVariable("structureId") Long structureId,
                                   @RequestParam("structureName") String structureName) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        String currentUser = getCurrentUser();
        String submitJob = instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                                           @Override
                                                           public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                                           }

                                                           @Override
                                                           public InstantJobResult call() throws Exception {
                                                               Map<String, List<List<Object>>> exportAssets = dataAssetsCatalogService.exportAssetsByStructure(structureId);
                                                               File file = ExcelUtil.export(exportAssets);
                                                               FileDescriptor storedFile = storedFileService.uploadFile(file, messageService.getMessage("assetsList") + ".xlsx", currentUser, false);
//                                                               storedFileService.commitUploadFile(Collections.singleton(storedFile.getFileId()));
                                                               FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                               result.setFileId(storedFile.getFileId());
                                                               result.setJobStatus(InstantJobStage.FINISHED);
                                                               return result;
                                                           }
                                                       }
                , messageService.getMessage("exportDataAsset") + sdf.format(new Date()), currentUser, EnumJobType.EXPORT.name());
        kafkaLogUtils.exportAssetsByStructureName(this.getCurrentUser(), structureId, structureName, IpUtil.getUserIp(), IpUtil.getUrl());
        LOGGER.info("The export of data assets is complete");
        return submitJob;
    }

    @Operation(summary = "导出目录资产模板")
    @PostMapping(value = "/export/template")
    public void exportAssetTem(HttpServletResponse response) {
        File assetTemplate = dataAssetsCatalogService.exportAssetsTemplate();

        String realName = "";

        try {
            realName = URLEncoder.encode(messageService.getMessage("importAssetsList"), "UTF-8");
            realName = realName.replace("+", "%20");
        } catch (Exception ex) {
            LOGGER.error("Failed to convert template file name");
        }

        response.setHeader("Content-disposition", "attachment; filename=" + realName + ".xlsx");
        response.setHeader("Content-Length", String.valueOf(assetTemplate.length()));

        try (BufferedInputStream bis = new BufferedInputStream(new FileInputStream(assetTemplate));
             BufferedOutputStream bos = new BufferedOutputStream(response.getOutputStream())) {
            byte[] buff = new byte[2048];
            int bytesRead;
            while (-1 != (bytesRead = bis.read(buff, 0, buff.length))) {
                bos.write(buff, 0, bytesRead);
            }

        } catch (Exception ex) {
            throw new UnexpectedStateException(messageService.getMessage("failedToExportTemplateFile", ex.getMessage()), ex);
        }
    }

    @Operation(summary = "导入资产")
    @PostMapping("/import/{structureId}/{catalogId}")
    public String importAsset(@RequestParam("file") MultipartFile file,
                              @PathVariable("structureId") Long structureId,
                              @PathVariable("catalogId") Long catalogId,
                              @RequestParam("status") EnumAssetsCatalogStatus status,
                              @RequestParam("catalogName") String catalogName) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        String currentUser = getCurrentUser();
        try {
            Map<String, List<Object>> sheets = ExcelUtil.readFileManySheet(file);
            final SecurityContext context = SecurityContextHolder.getContext();
            String submitJob = instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                                               @Override
                                                               public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                                               }

                                                               @Override
                                                               public InstantJobResult call() {
                                                                   DDCAssetImportResultDto importResult = new DDCAssetImportResultDto();
                                                                   SecurityContextHolder.setContext(context);
                                                                   List<Object> imports = new ArrayList<>();
                                                                   Set<String> sheetNames = new HashSet<>(sheets.keySet());
                                                                   if (checkSheet(sheetNames)) {
                                                                       for (String key : sheets.keySet()) {
                                                                           imports.clear();
                                                                           imports.addAll(sheets.get(key));
                                                                           if (imports.isEmpty()) continue;
                                                                           importResult = dataAssetsCatalogService.importAssets(imports, key, importResult, structureId, status, true, catalogId);
                                                                       }
                                                                   } else {
                                                                       importResult.getErrorMsg().add(messageService.getMessage("importTemplateFileError"));
                                                                   }
                                                                   FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                                   result.setErrorMessage(JsonUtils.toJSon(importResult));
                                                                   result.setJobStatus(InstantJobStage.FINISHED);
                                                                   return result;
                                                               }
                                                           }
                    , messageService.getMessage("importDataAsset") + sdf.format(new Date()), currentUser, EnumJobType.IMPORT.name());
            kafkaLogUtils.importAssets(this.getCurrentUser(), dataAssetsCatalogService.getFullPathByCatalogId(catalogId), IpUtil.getUserIp(), IpUtil.getUrl(), catalogId);
            return submitJob;
        } catch (Exception e) {
            e.printStackTrace();
            throw new UnexpectedStateException(messageService.getMessage("fileReadError"));
        }
    }

    @Operation(summary = "通过当前结构导入资产")
    @PostMapping("/import/structure/{structureId}")
    public String importAssetByStructure(@RequestParam("file") MultipartFile file,
                                         @PathVariable("structureId") Long structureId,
                                         @RequestParam("structureName") String structureName,
                                         @RequestParam("status") EnumAssetsCatalogStatus status) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        String currentUser = getCurrentUser();
        try {
            Map<String, List<Object>> sheets = ExcelUtil.readFileManySheet(file);
            final SecurityContext context = SecurityContextHolder.getContext();
            String submitJob = instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                                               @Override
                                                               public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                                               }

                                                               @Override
                                                               public InstantJobResult call() {
                                                                   DDCAssetImportResultDto importResult = new DDCAssetImportResultDto();
                                                                   SecurityContextHolder.setContext(context);
                                                                   List<Object> imports = new ArrayList<>();
                                                                   Set<String> sheetNames = new HashSet<>(sheets.keySet());
                                                                   if (checkSheet(sheetNames)) {
                                                                       for (String key : sheets.keySet()) {
                                                                           imports.clear();
                                                                           imports.addAll(sheets.get(key));
                                                                           if (imports.isEmpty()) {
                                                                               continue;
                                                                           }

                                                                           importResult = dataAssetsCatalogService.importAssets(imports, key, importResult, structureId, status, false, null);
                                                                       }
                                                                   } else {
                                                                       importResult.getErrorMsg().add(messageService.getMessage("importTemplateFileError"));
                                                                   }
                                                                   FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                                   result.setErrorMessage(JsonUtils.toJSon(importResult));
                                                                   result.setJobStatus(InstantJobStage.FINISHED);
                                                                   return result;
                                                               }
                                                           }
                    , messageService.getMessage("importDataAsset") + sdf.format(new Date()), currentUser, EnumJobType.IMPORT.name());
            kafkaLogUtils.importAssetsByStructure(this.getCurrentUser(), structureName, IpUtil.getUserIp(), IpUtil.getUrl());
            return submitJob;
        } catch (Exception e) {
            e.printStackTrace();
            throw new UnexpectedStateException(messageService.getMessage("fileReadError"));
        }
    }

    private boolean checkSheet(Set<String> keySet) {
        keySet.remove(messageService.getMessage("fileImport.dataItem"));
        keySet.remove(messageService.getMessage("fileImport.dataTable"));
        keySet.remove(messageService.getMessage("fileImport.view"));
        keySet.remove(messageService.getMessage("fileImport.file"));
        keySet.remove(messageService.getMessage("fileImport.standardCode"));
        keySet.remove(messageService.getMessage("fileImport.basicStandard"));
        keySet.remove(messageService.getMessage("fileImport.IndicatorCriteria"));
        keySet.remove(messageService.getMessage("fileImport.report"));
        keySet.remove(messageService.getMessage("fileImport.dataServices"));
        keySet.remove(messageService.getMessage("fileImport.fillingExplanation"));
        keySet.remove(messageService.getMessage("fileImport.metaData"));
        if (keySet.size() > 0) {
            return false;
        }
        return true;
    }


    @Operation(summary = "目录下已添加过的资产id")
    @PostMapping("/bound/{catalogId}")
    public List<String> getAssetIds(@PathVariable("catalogId") Long catalogId, @RequestBody List<EnumSupportType> assetsTypes) {
        return dataAssetsService.getBoundIds(catalogId, assetsTypes);
    }

    @Operation(summary = "获取资产id")
    @GetMapping("/{catalogId}/{itemId}/{assetsType}")
    public ResResultDto<Long> getAssetId(@PathVariable("catalogId") Long catalogId, @PathVariable("itemId") String itemId, @PathVariable("assetsType") Long assetsType) {
        DataAssets assets = dataAssetsService.getAssets(catalogId, itemId, assetsType);
        return ResResultDto.ok(assets == null ? 0 : assets.getId());
    }

    @Operation(summary = "跳转资产前判断")
    @PostMapping("/skip/{itemId}")
    public ResResultDto<Boolean> beforeSkipToAssetDetail(@PathVariable("itemId") String itemId, @RequestParam("assetsType") EnumSupportType assetsType) {
        ResResultDto<Boolean> ok = ResResultDto.ok(dataAssetsService.checkIsExist(itemId, assetsType));
        if (ok.getData()) {
            if (assetsType.equals(EnumSupportType.DATA_STANDARD) || assetsType.equals(EnumSupportType.DATA_STANDARD_CODE) || assetsType.equals(EnumSupportType.INDEX)) {
                DataAssets assets = dataAssetsService.getAssets(itemId, assetsType);
                dataAssetsCatalogVisitService.visitAsset(assets.getId(), assets.getItemId(), assets.getCatalogId(), getCurrentUser(), assetsType);
            }
        }
        return ok;
    }

    @Operation(summary = "图谱跳转资产前判断")
    @GetMapping("/graph/{catalogId}/{itemId}/{assetsType}")
    public Map<String, Object> checkGraph(@PathVariable("catalogId") Long catalogId,
                                          @PathVariable("itemId") String itemId,
                                          @PathVariable("assetsType") Long assetsType,
                                          @RequestParam(value = "catalogStatus", required = false) EnumAssetsCatalogStatus catalogStatus) {
        Map<String, Object> resMap = new HashMap<>();
        DataAssets assets = dataAssetsService.getAssets(catalogId, itemId, assetsType);
        String authType = dataAssetsCatalogService.checkGraph(this.getCurrentUser(), catalogId, catalogStatus);
        resMap.put("status", assets.getStatus());
        resMap.put("authType", authType);
        return resMap;
    }

    @Operation(summary = "修改资产编码")
    @PostMapping("/code/modify")
    public void modifyCode(@RequestBody List<CodeDto> codeDtoList) {
        try {
            dataAssetsService.modifyCodes(codeDtoList);
            for (CodeDto codeDto : codeDtoList) {
                Map<String, Object> params = new HashMap<>();
                params.put("assetsCode", codeDto.getCode());
                TermQueryBuilder queryBuilder = new TermQueryBuilder("assetsId", codeDto.getAssetsId());
                esService.updateAssets(queryBuilder, params);
            }
        } catch (Exception e) {
            throw new UnexpectedStateException(e.getMessage());
        }
    }

    @Operation(summary = "资产编码重复校验")
    @PostMapping("/code/check")
    public boolean checkCode(@RequestBody CodeDto codeDto) {
        if (StringUtils.isBlank(codeDto.getCode())) {
            return false;
        }
        return codeGenerateService.checkCode(EnumCodeType.DATA_ASSETS, codeDto.getCode(), codeDto.getAssetsId());
    }


    @Operation(summary = "获取资产的关联属性值")
    @GetMapping("/property/{objectId}/{assetsId}")
    public ResResultDto<DataObjectPropertyDto> getObjectProperty(
            @PathVariable("objectId") Long objectId,
            @PathVariable("assetsId") Long assetsId) {
        DataObjectPropertyDto data = dataAssetsService.getObjectProperty(objectId, assetsId);
        return ResResultDto.ok(data);
    }

    @Operation(summary = "查询一个object的血缘")
    @GetMapping("/lineage/{objectId}/{type}")
    public LineageContainer getObjectLineageByType(
            @Parameter(name = "objectId", description = "唯一id")
            @PathVariable("objectId") Long objectId,
            @Parameter(name = "type", description = "类型", required = true, example = "all")
            @PathVariable(name = "type") String type) {
        //todo 元数据提供，需要元数据提供和页面一致的接口供调用
        LineageContainer container = dataAssetsService.getLineageOfObject(objectId, type);
        setQualityProperties(container);
        return container;
    }

    @Autowired
    private DataAssetsStatisticService dataAssetsStatisticService;

    @GetMapping("/test")
    public void test() {
        dataAssetsStatisticService.deleteAll(DateFormatUtils.format(new Date(), "yyyy-MM-dd"));
        Method[] methods = dataAssetsStatisticService.getClass().getMethods();
        List<Method> methodList = Arrays.stream(methods).filter(method -> method.getName().startsWith("save")).collect(Collectors.toList());
        for (Method method : methodList) {
            try {
                method.invoke(dataAssetsStatisticService);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }


    @PostMapping("/test/sync")
    public void test2(@RequestBody List<Long> structureIds) {
        structureIds.forEach(s -> {
            dataAssetsCatalogService.syncAssetFromDBToES(EnumSyncRange.ALL, s, null);
        });
    }

    @RequestMapping("/report/{objectId}/type")
    @Description("查询一个报表的血缘")
    @Operation(summary = "查询一个报表的血缘", description = "查询一个报表的血缘")
    @Parameter(name = "objectId", description = "报表Id", in = ParameterIn.PATH, required = true)
    public LineageContainer getReportLineageByType(@PathVariable("objectId") Long reportId) {
        return dataAssetsService.getLineageOfReport(reportId);
    }

    @Operation(summary = "获取指定元数据标签与扩展属性的结果")
    @GetMapping("/tree/summary/{objectId}")
    public Map<String, List<TagUdpDto>> getTagsTree(@Parameter(name = "objectId", description = "对象编码") @PathVariable("objectId") Long objectId) {
        //查找元数据的typeId
        return metadataService.getTagsTree(objectId);
    }


    @Operation(summary = "获取资产详情")
    @GetMapping("/detail/{catalogId}/{objectId}")
    public ResResultDto<DataAssetDetailDto> getAssetDetail(@PathVariable("catalogId") Long catalogId, @PathVariable("objectId") Long objectId) {
        DataAssetDetailDto data = dataAssetsService.getAssetDetail(catalogId, objectId);
        return ResResultDto.ok(data);
    }

    @Operation(summary = "资产是否加购")
    @GetMapping("/shop/{assetId}")
    public ResResultDto<Map<String, Boolean>> shoppingCart(@PathVariable("assetId") Long assetId) {
        return ResResultDto.ok(dataAssetsService.shoppingCart(assetId, getCurrentUser()));
    }

    @Operation(summary = "获取字段信息")
    @PostMapping("/columns")
    public ResResultDto<PageResult<TableAssetDto>> getColumnsByParentId(@RequestBody TableAssetSearchDto params) {
        try {
            //先尝试从缓存获取数据
            PageResult<TableAssetDto> redisData = getSearchDataByRedis(params);
            if (Objects.nonNull(redisData)) {
                return ResResultDto.ok(redisData);
            }
            PageResult<TableAssetDto> data = dataAssetsService.getColumnsByParentId(params);
            return ResResultDto.ok(data);
        } finally {
            //异步获取下一页数据放入缓存
            asyncSetNextSearchToRedis(params);
        }
    }

    private void asyncSetNextSearchToRedis(TableAssetSearchDto params) {
        if (StringUtils.isNotBlank(params.getKeyWord())) {
            return;
        }

        ThreadPoolInstance.execute(() -> {
            params.setCurrentPage(params.getCurrentPage() + 1);
            String bucketKey = String.format("objectId_%s_currentPage_%s_pageSize_%s", params.getObjectId(), params.getCurrentPage(), params.getPageSize());
            PageResult<TableAssetDto> data = dataAssetsService.getColumnsByParentId(params);
            RBucket<PageResult<TableAssetDto>> bucket = redissonClient.getBucket(bucketKey);
            bucket.set(data, 30, TimeUnit.SECONDS);
        });
    }


    private PageResult<TableAssetDto> getSearchDataByRedis(TableAssetSearchDto params) {
        if (StringUtils.isNotBlank(params.getKeyWord())) {
            return null;
        }
        String bucketKey = String.format("objectId_%s_currentPage_%s_pageSize_%s", params.getObjectId(), params.getCurrentPage(), params.getPageSize());
        RBucket<PageResult<TableAssetDto>> bucket = redissonClient.getBucket(bucketKey);
        return bucket.get();
    }

    @Operation(summary = "获取字段信息")
    @GetMapping("/columns/key/{tableId}")
    public ResResultDto<List<RemoteKeyDto>> getColumnsKey(@PathVariable("tableId") Long tableId) {
        return ResResultDto.ok(dataAssetsService.getKeyGroupObjs(tableId));
    }

    @Operation(summary = "获取表质量统计")
    @GetMapping("/quality/{tableId}")
    public ResResultDto<RemoteTechRuleEntityResultDto> getTableQuality(@PathVariable("tableId") Long tableId) {
        return ResResultDto.ok(dataAssetsService.getTechRuleEntityDto(tableId));
    }

    @Operation(summary = "未读消息数")
    @PostMapping("/reply/count")
    public ResResultDto<Long> getNoReadCount(@RequestParam("assetId") String assetId) {
        return ResResultDto.ok(dataAssetsService.getNoReadCount(getCurrentUser(), assetId));
    }

    @Operation(summary = "未读消息设置已读")
    @PostMapping("/reply/read")
    public void setRead(@RequestParam("assetId") String assetId) {
        dataAssetsService.setRead(getCurrentUser(), assetId);
    }

    //采样数据 需要元数据提供接口供使用,同元数据接口保持一致
    @PostMapping("/data/sample")
    @Description("获取样例数据")
    @Operation(summary = "获取样例数据")
    public DataSampleDto getDataSample(@RequestBody DataSampleQueryDto queryDto) {
        return metadataService.getTableDataSample(queryDto);
    }


    @Operation(summary = "安全模块探针")
    @GetMapping("/security/needle")
    public ResResultDto<Boolean> needle() {
        try {
            String value = dataSecurityCatalogElementRelService.needle();
            if ("true".equals(value)) {
                return ResResultDto.ok(true);
            }
            return ResResultDto.ok(false);
        } catch (Exception e) {
            return ResResultDto.ok(false);
        }
    }


    @Operation(summary = "资产浏览埋点")
    @PostMapping("/visit/{catalogId}/{assetType}/{itemId}/{assetId}")
    public ResResultDto visit(@PathVariable("catalogId") Long catalogId,
                              @PathVariable("assetType") EnumSupportType assetType,
                              @PathVariable("itemId") String itemId, @PathVariable("assetId") Long assetId) {
        try {
            String currentUser = getCurrentUser();
            dataAssetsCatalogVisitService.visitAsset(assetId, itemId, catalogId, currentUser, assetType);
            return ResResultDto.ok();
        } catch (Exception e) {
            return ResResultDto.ok(false);
        }
    }

    @Operation(summary = "获取机构详情")
    @PostMapping("/org/detail")
    public ResResultDto<OrganizationDto> getOrgDetail(@RequestParam("bm") String bm) {
        return ResResultDto.ok(organizationService.getOrganizationsByBm(bm));
    }

    @Operation(summary = "获取用户详情")
    @PostMapping("/user/detail")
    public ResResultDto<UserDto> getUserDetail(@RequestParam("username") String username) {
        return ResResultDto.ok(userService.getUserFullInfo(username));

    }

    /**
     * 设置技术规则的质量问题数
     *
     * @param container
     */
    private void setQualityProperties(LineageContainer container) {
        if (container == null) {
            return;
        }
        Set<LineageStep> stepsSet = container.getStepsSet();

        stepsSet.forEach(step -> {
            DataObjectDto object = null;
            if (step.getId().contains("dam-report")) {
                return;
            }
            if (step.getId().contains("dam")) {
                Long tableId = Long.parseLong(
                        step.getId().substring(step.getId().indexOf("-") + 1));
                object = dataAssetLocalMetadataService.getDataObjectById(tableId);
            }

            if (object == null)
                return;
            //todo 7.0 数据质量
            List<Map<String, Object>> qualityMapInfo = new ArrayList<>();
//            List<Map<String, Object>> qualityMapInfo = techRuleService.findProblemInfo(object);
            try {
                if (qualityMapInfo != null && qualityMapInfo.size() > 0) {
                    String info = mapper.writeValueAsString(qualityMapInfo);
                    step.getProperties().put("qualityInfo", info);
                    Long num = 0L;
                    num = qualityMapInfo.stream()
                            .mapToLong(map -> map.get("sum") == null ? 0L : (Long) map.get("sum"))
                            .sum();
                    step.getProperties().put("qualityNum", num + "");
                }
            } catch (Exception e) {
                LOGGER.error("data parse error cause by:" + e.getMessage());
            }
        });
    }

    @GetMapping("/checkList")
    public List<AssetCheckTaskDto> getAssetList() {
        return dataAssetsService.getList();
    }


    @GetMapping("/countSumProcess")
    public BigDecimal countSumProcess() {
        return dataAssetsService.countSumProcess();
    }

    @PostMapping("/updateCheck")
    public void updateCheckTask(@RequestBody AssetCheckTaskDto assetCheckTaskDto){
        dataAssetsService.updateCheckTask(assetCheckTaskDto);
    }

    @PostMapping("/discernJobTest")
    public void discernJobTest(@RequestParam Long jobId,
                               @RequestParam Long taskId) throws Exception {
        DatablauJobDescriptor jobDescriptor = new DatablauJobDescriptor();
        List<JobParameter> jobParameters = new ArrayList<>();

        JobParameter jobParameter = new JobParameter();
        jobParameter.setParameterName("taskId");
        jobParameter.setValue(taskId.toString());

        jobParameters.add(jobParameter);

        jobDescriptor.setParameters(jobParameters);
        jobDescriptor.setId(jobId);
        DataAssetsDiscernJob discernJob = new DataAssetsDiscernJob(jobDescriptor);

        discernJob.prepare();

        discernJob.execute();
    }

    @PostMapping("/dashboardJobTest")
    public void updateCheckTask() throws Exception {
        dataAssetsStatisticService.deleteAll(DateFormatUtils.format(new Date(), "yyyy-MM-dd"));
        Method[] methods = dataAssetsStatisticService.getClass().getMethods();
        List<Method> methodList = Arrays.stream(methods).filter(method -> method.getName().startsWith("save")).toList();
        for (Method method : methodList) {
            method.invoke(dataAssetsStatisticService);
        }
    }

}
