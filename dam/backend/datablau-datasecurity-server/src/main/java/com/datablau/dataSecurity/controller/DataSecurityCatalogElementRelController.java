package com.datablau.dataSecurity.controller;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.data.PageResult;
import com.datablau.base.api.ModelCategoryService;
import com.datablau.base.api.PermissionHelper;
import com.datablau.base.api.TagService;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.base.data.TagDto;
import com.datablau.catalog.jpa.entity.CommonCatalog;
import com.datablau.catalog.jpa.repository.CommonCatalogRepository;
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
import com.datablau.dataAccess.service.impl.DataSecurityLocalMetadataServiceImpl;
import com.datablau.dataAccess.utility.ServerConstants;
import com.datablau.dataAccess.utils.FileUtility;
import com.datablau.dataSecurity.dto.AssociatedToSecurityDto;
import com.datablau.dataSecurity.dto.DataCheckCountDto;
import com.datablau.dataSecurity.dto.DataCheckDto;
import com.datablau.dataSecurity.dto.DataSecurityCheckAssetsDto;
import com.datablau.dataSecurity.dto.DataSecurityCheckQueryDto;
import com.datablau.dataSecurity.dto.DataSecurityPublishAssetDto;
import com.datablau.dataSecurity.dto.DataStandardElementDto;
import com.datablau.dataSecurity.dto.SearchProgressDto;
import com.datablau.dataSecurity.dto.StandardElementRequestDto;
import com.datablau.dataSecurity.dto.export.DiscernResultExport;
import com.datablau.dataSecurity.enums.EnumCombStatus;
import com.datablau.dataSecurity.jpa.entity.DataSecurityCatalogElementRel;
import com.datablau.dataSecurity.jpa.repository.DataSecurityCatalogElementRelRepository;
import com.datablau.dataSecurity.service.api.DataSecurityCatalogElementRelService;
import com.datablau.dataSecurity.service.api.ESForAssetsService;
import com.datablau.dataSecurity.utils.DDSKafkaLogUtil;
import com.datablau.metadata.common.dto.metadata.DataObjectDto;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import com.google.common.collect.Lists;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.CollectionUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import static com.datablau.dataSecurity.enums.EnumCombStatus.NOT_COMB;
import static com.datablau.dataSecurity.enums.EnumCombStatus.PUBLISH;
import static com.datablau.dataSecurity.enums.EnumCombStatus.UN_COMB;
import static com.datablau.dataSecurity.enums.EnumCombStatus.UN_CONFIRMED;
import static com.datablau.dataSecurity.utils.JsonUtils.toJSon;

/**
 * Description: new java files header..
 *
 * @author liuhao
 * @version 1.0
 * @date 2022/11/14 16:34
 */
@Tag(name = "数据盘点")
@RestController
@RequestMapping("/datasecurity/check")
public class DataSecurityCatalogElementRelController extends BaseController {
    private static final Logger log = LoggerFactory.getLogger(DataSecurityCatalogElementRelController.class);

    @Autowired
    private RedissonClient redissonClient;
    @Autowired
    private FileUtility fileUtility;
    @Autowired
    private DDSKafkaLogUtil logUtils;
    @Autowired
    private PermissionHelper permissionHelper;

    @Autowired
    private DataSecurityCatalogElementRelService dataSecurityCatalogElementRelService;
    @Autowired
    private InstantJobService instantJobService;
    @Autowired
    private DataSecurityLocalMetadataServiceImpl localMetadataService;
    @Autowired
    private ModelCategoryService modelCategoryService;
    @Autowired
    private ESForAssetsService esService;
    @Autowired
    private TagService tagService;

    @Autowired
    private CommonCatalogRepository catalogRepository;
    @Autowired
    private DataSecurityCatalogElementRelRepository relRepository;

    public DataSecurityCatalogElementRelController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "扫描数据源:1就是版本一致,不需要扫描,同时返回数据源更新进度,1就是更新完成")
    @GetMapping("/{modelId}/version/")
    public ResResultDto<Map<String, Object>> check(@PathVariable("modelId") Long modelId) {
        return ResResultDto.ok(dataSecurityCatalogElementRelService.checkVersion(modelId));
    }

    @Operation(summary = "true就是需要更新")
    @GetMapping("/v2/{modelId}/version/")
    public ResResultDto<Map<String, Object>> checkV2(@PathVariable("modelId") Long modelId) {
        return ResResultDto.ok(dataSecurityCatalogElementRelService.checkVersionV2(modelId));
    }

    @Operation(summary = "扫描数据源")
    @GetMapping("/v2/scan/{datasourceId}/{modelId}")
    public void scanV2(@PathVariable("datasourceId") Long datasourceId,@PathVariable("modelId") Long modelId) {
        RLock lock = redissonClient.getLock("bind_assets_lock");
        try {
            lock.lock();
            dataSecurityCatalogElementRelService.scanDataV2(datasourceId, modelId);
        } catch (Exception e) {
            throw new UnexpectedStateException("正在更新资产，请勿多次点击");
        } finally {
            lock.forceUnlock();
        }
    }

//    @Operation(summary = "扫描数据源")
//    @GetMapping("/scan/{modelId}")
//    public void scan(@PathVariable("modelId") Long modelId) {
//        dataSecurityCatalogElementRelService.scanData(modelId);
//    }

    @Operation(summary = "搜索资产")
    @PostMapping("/search")
    public ResResultDto<PageResult<DataCheckDto>> search(@RequestBody DataCheckDto dataCheckDto) {
        return ResResultDto.ok(dataSecurityCatalogElementRelService.searchAssets(dataCheckDto));
    }

//    @Operation(summary = "获取梳理进度")
//    @PostMapping("/progress")
//    public ResResultDto<Long> getProgress(@RequestBody SearchProgressDto dto) {
//        return ResResultDto.ok(dataSecurityCatalogElementRelService.getProgress(dto));
//    }

    @Operation(summary = "获取梳理进度")
    @PostMapping("/v2/progress")
    public ResResultDto<Long> getProgressV2(@RequestBody SearchProgressDto dto) {
        return ResResultDto.ok(dataSecurityCatalogElementRelService.getProgressV2(dto));
    }

//    @Operation(summary = "梳理状态统计")
//    @PostMapping("/count")
//    public ResResultDto<List<DataCheckCountDto>> getCount(@RequestBody SearchProgressDto dto) {
//        return ResResultDto.ok(dataSecurityCatalogElementRelService.getCount(dto));
//    }

    @Operation(summary = "梳理状态统计")
    @PostMapping("/v2/count")
    public ResResultDto<List<DataCheckCountDto>> getCountV2(@RequestBody SearchProgressDto dto) {
        return ResResultDto.ok(dataSecurityCatalogElementRelService.getCountV2(dto));
    }

    @Operation(summary = "修改资产状态")
    @PostMapping("/update/asset/{status}")
    public void updateStatus(@RequestBody List<Long> assetIdList, @PathVariable("status") EnumCombStatus status) {
        List<DataSecurityCatalogElementRel> relList = dataSecurityCatalogElementRelService.updateStatus(assetIdList, status, AuthTools.currentUsernameFailFast());
        if (!CollectionUtils.isEmpty(relList)) {
            DataSecurityCatalogElementRel dataSecurityCatalogElementRel = relList.get(0);
            EnumCombStatus combStatus = dataSecurityCatalogElementRel.getCombStatus();
            List<String> assetNames = relList.stream().map(DataSecurityCatalogElementRel::getDataAssetName).collect(Collectors.toList());
            String op = "";
            switch (status) {
                case NOT_COMB:
                    op = "markIgnore";
                    break;
                case UN_CONFIRMED:
                    op = "underConfirm";
                    break;
                case PENDING_REVIEW:
                    op = "confirmSubmit";
                    break;
                case UN_COMB:
                    if (PUBLISH.equals(combStatus)) {
                        op = "publishedToReComb";
                    } else if (NOT_COMB.equals(combStatus)) {
                        op = "ignoreToReComb";
                    } else if (UN_CONFIRMED.equals(combStatus)) {
                        op = "confirmToReComb";
                    }
                    break;
                default:
                    break;
            }
            logUtils.catalogElement(assetNames, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl(), op);
        }
        if (status.equals(UN_COMB)) {
            relList.forEach(rel -> {
                Map<String, Object> tagMap = dataSecurityCatalogElementRelService.getTagList(rel.getObjectId(), rel.getTypeId());
                //同步数据资产es
                esService.updateAssets(String.valueOf(rel.getObjectId()), rel.getTypeId(), tagMap);
            });
        }
    }

    @Operation(summary = "修改目录")
    @PostMapping("/update/catalog/{catalogId}")
    public void updateCatalog(@RequestBody List<Long> assetIdList, @PathVariable("catalogId") Long catalogId) {
        List<String> assetNames = dataSecurityCatalogElementRelService.updateCatalog(assetIdList, catalogId);
        logUtils.catalogElement(assetNames, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl(), "updateCatalog");
    }

    @Operation(summary = "修改安全等级")
    @PostMapping("/update/level/{levelId}")
    public void updateLevel(@RequestBody List<Long> assetIdList, @PathVariable("levelId") Long levelId) {
        List<String> assetNames = dataSecurityCatalogElementRelService.updateLevel(assetIdList, levelId);
        logUtils.catalogElement(assetNames, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl(), "updateLevel");
    }

    @Operation(summary = "添加到安全分类")
    @PostMapping("/add/catalog/{catalogId}")
    public void addToCatalog(@RequestBody List<Long> assetIdList, @PathVariable("catalogId") Long catalogId) {
        List<String> assetNames = dataSecurityCatalogElementRelService.addToCatalog(assetIdList, catalogId);
        //logUtils.catalogElement(assetNames, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl(), "underConfirm");
    }

    @Operation(summary = "下载导入模板")
    @PostMapping("/download")
    public void download(HttpServletResponse response) {
        dataSecurityCatalogElementRelService.exportAssetsTemplate(response);
    }

    @Operation(summary = "导入资产")
    @PostMapping("/import/{status}")
    public String importAsset(@RequestParam("file") MultipartFile file,
                              @PathVariable("status") EnumCombStatus status) {
        try {
            final SecurityContext context = SecurityContextHolder.getContext();
            SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
            String currentUser = AuthTools.currentUsernameFailFast();
            Map<String, List<Object>> sheets;
            try {
                sheets = ExcelUtil.readFileManySheet(file);
            } catch (Exception e) {
                throw new UnexpectedStateException("解析excel错误");
            }
            String submitJob = instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                                               @Override
                                                               public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                                               }

                                                               @Override
                                                               public InstantJobResult call() {
                                                                   SecurityContextHolder.setContext(context);
                                                                   Map<String, Object> map = dataSecurityCatalogElementRelService.importAsset(sheets, status);
                                                                   List<Map<String, Object>> list = (List<Map<String, Object>>) map.get("tagMap");
                                                                   if (!CollectionUtils.isEmpty(list)) {
                                                                       list.forEach(esMap -> {
                                                                           //同步数据资产es
                                                                           esService.updateAssets(String.valueOf(esMap.get("objectId")),
                                                                                   (Long) esMap.get("typeId"), (Map<String, Object>) esMap.get("tagMap"));
                                                                       });
                                                                   }
                                                                   FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                                   result.setErrorMessage(toJSon(map.get("result")));
                                                                   result.setJobStatus(InstantJobStage.FINISHED);
                                                                   return result;
                                                               }
                                                           }
                    , "协同分类数据资产导入" + sdf.format(new Date()), currentUser, EnumJobType.IMPORT.name());
            logUtils.importAssets(getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
            return submitJob;
        } catch (Exception e) {
            e.printStackTrace();
            throw new UnexpectedStateException("文件读取错误！请检查所使用的模板文件！");
        }
    }

    @Operation(summary = "导出资产")
    @PostMapping("/export")
    public String exportExcel(HttpServletResponse response, @RequestBody DataCheckDto dataCheckDto) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        String currentUser = AuthTools.currentUsernameFailFast();
        Map<String, List<List<Object>>> exportMap = dataSecurityCatalogElementRelService.exportAsset(response, dataCheckDto);

        String submitJob = instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                                           @Override
                                                           public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                                           }

                                                           @Override
                                                           public InstantJobResult call() throws Exception {
                                                               File file = ExcelUtil.export(exportMap);
                                                               FileDescriptor storedFile = fileUtility.uploadFile(file, "协同分类数据资产列表.xlsx", currentUser, true);
                                                               FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                               result.setFileId(storedFile.getFileId());
                                                               result.setJobStatus(InstantJobStage.FINISHED);
                                                               return result;
                                                           }
                                                       }
                , "协同分类数据资产导出" + sdf.format(new Date()), currentUser, EnumJobType.EXPORT.name());
        logUtils.exportAssets(getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        return submitJob;
    }

    @Operation(summary = "导出选中的资产")
    @PostMapping("/export/{status}")
    public String exportExcel(HttpServletResponse response, @RequestBody List<Long> ids, @PathVariable("status") EnumCombStatus status) {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        String currentUser = getCurrentUser();
        Map<String, List<List<Object>>> exportMap = dataSecurityCatalogElementRelService.exportAsset(response, ids);

        String submitJob = instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                                           @Override
                                                           public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                                           }

                                                           @Override
                                                           public InstantJobResult call() throws Exception {
                                                               File file = ExcelUtil.export(exportMap);
                                                               FileDescriptor storedFile = fileUtility.uploadFile(file, "协同分类数据资产列表.xlsx", currentUser, true);
                                                               FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                               result.setFileId(storedFile.getFileId());
                                                               result.setJobStatus(InstantJobStage.FINISHED);
                                                               return result;
                                                           }
                                                       }
                , "协同分类数据资产导出" + sdf.format(new Date()), currentUser, EnumJobType.EXPORT.name());
        logUtils.exportAssets(getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        return submitJob;
    }


    @Operation(summary = "资产梳理列表")
    @PostMapping(value = "/list")
    public ResResultDto<Page<DataStandardElementDto>> getUncombed(@Validated @RequestBody StandardElementRequestDto standardElementRequestDto) {
        Page<DataStandardElementDto> objects = dataSecurityCatalogElementRelService.selectList(standardElementRequestDto);
        return ResResultDto.ok(objects);
    }


    /**
     * 数据项关联到安全标准
     *
     * @param associatedToSecurityDto
     * @return
     */
    @Operation(summary = "数据项关联到安全标准")
    @PostMapping(value = "/associatedToSecurity")
    public ResResultDto<?> associatedToSecurity(@Validated @RequestBody AssociatedToSecurityDto associatedToSecurityDto) {
        dataSecurityCatalogElementRelService.associatedToSecurity(associatedToSecurityDto);
        return ResResultDto.ok();
    }


    @Operation(summary = "业务系统下拉列表")
    @GetMapping("searchitem/business")
    public ResResultDto<List<ModelCategoryDto>> searchItemBusiness() {
        //只能选取用户本身系统
        log.info("user name:" + AuthTools.currentUsernameFailFast());
        //用户下的用户系统
        List<Long> filter = Lists.newArrayList(permissionHelper.getUserAccesibleModelCategoryIds(AuthTools.currentUsernameFailFast(), "DAM"));
        //全部系统列表
        List<ModelCategoryDto> dataList = modelCategoryService.getModelCategoriesWithUdp();
        //过滤只有当前用户有权限的系统返回
        List<ModelCategoryDto> result = dataList.stream().filter(data -> filter.contains(data.getCategoryId())).collect(Collectors.toList());
        return ResResultDto.ok(result);
    }



    @Operation(summary = "table下拉列表")
    @Parameters({@Parameter(name = "dataSourceId", description = "数据源id")})
    @GetMapping("searchitem/table")
    public ResResultDto<List<DataObjectDto>> searchItemSchema(Long dataSourceId, String schemaName) {
        List<DataObjectDto> tableList = localMetadataService.getDataObjectsByModelIdAndTypeId(dataSourceId, 80000004L);
        Map<String, List<DataObjectDto>> schemaTableMap = tableList.stream().collect(Collectors.groupingBy(DataObjectDto::getSchema));
        List<DataObjectDto> tables = schemaTableMap.get(schemaName);
        return ResResultDto.ok(tables);
    }


    @Operation(summary = "资产检索接口")
    @PostMapping("search/publishassets")
    public ResResultDto<PageResult<DataSecurityCheckAssetsDto>> searchPublishAssets(@RequestBody DataSecurityCheckQueryDto params) {
        if (params.getCategoryId() == null) {
            ResResultDto<List<ModelCategoryDto>> listResResultDto = searchItemBusiness();
            List<ModelCategoryDto> data = listResResultDto.getData();
            if (CollectionUtils.isEmpty(data)) {
                return ResResultDto.ok(new PageResult<>());
            }
            List<Long> categoryIds = data.stream().map(ModelCategoryDto::getCategoryId).collect(Collectors.toList());
            params.setCategoryIds(categoryIds);
        }else {
            params.setCategoryIds(Collections.singletonList(params.getCategoryId()));
        }
        PageResult<DataSecurityCheckAssetsDto> pageResult = dataSecurityCatalogElementRelService.searchPublishAssets(params);
        return ResResultDto.ok(pageResult);
    }

    @Operation(summary = "评审通过与驳回")
    @Parameters({@Parameter(name = "ids", description = "评审的数据id"), @Parameter(name = "approval", description = "通过(1) 驳回(-1)")})
    @PostMapping("judgesssets")
    public ResResultDto<DataSecurityPublishAssetDto> judgeAssets(@RequestParam List<Long> ids, int approval) {
        Map<String, Object> resultMap = dataSecurityCatalogElementRelService.judgeAssets(ids, approval);
        List<Map<String, Object>> list = (List<Map<String, Object>>) resultMap.get("esResult");
        DataSecurityPublishAssetDto publishAssetDto = (DataSecurityPublishAssetDto) resultMap.get("publishAssetDto");
        //写入tagItem
        if (approval == 1) {
            //logUtils.discernedResult((List<String>) resultMap.get("names"), getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl(), "publish");
            logUtils.judgeAccess((List<String>) resultMap.get("names"), getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
            list.forEach(esMap -> {
                //同步数据资产es
                esService.updateAssets(String.valueOf(esMap.get("objectId")),
                        (Long) esMap.get("typeId"), (Map<String, Object>) esMap.get("tagMap"));
            });
        } else {
            //logUtils.catalogElement((List<String>) resultMap.get("names"), getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl(), "confirmToReComb");
            logUtils.judgeReject((List<String>) resultMap.get("names"), getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        }

        if (!CollectionUtils.isEmpty(publishAssetDto.getFailAssets())) {
            return ResResultDto.error(publishAssetDto);
        }
        return ResResultDto.ok();
    }

    @Operation(summary = "分类分级结果导出")
    @GetMapping("/export")
    public void export(HttpServletResponse response, Long sourceId) {
        Map<String, List<List<Object>>> discernResult = new LinkedHashMap<>(5);
        List<Object> list = Lists.newArrayList();
        Set<TagDto> tags = tagService.getAllTags(null);
        Map<Long, TagDto> tagMap = new HashMap<>();
        for (TagDto tag : tags) {
            tagMap.put(tag.getTagId(), tag);
        }

        List<DataSecurityCatalogElementRel> results = relRepository.findAllByDataSourceIdAndCombStatus(sourceId, EnumCombStatus.PUBLISH);
        for (DataSecurityCatalogElementRel record : results) {
            try {
                DiscernResultExport obj = new DiscernResultExport();
                obj.setCategoryName("/");
                DataObjectDto table = localMetadataService.getDataObjectById(record.getTableId());


                if (table != null) {
                    obj.setTableName(table.getPhysicalName());
                    obj.setTableAlias(table.getLogicalName());
                }

                obj.setColumnName(record.getDataAssetName());
                obj.setColumnAlias(record.getAlias());


                obj.setCatalogResult(getCatalogNamePath(record.getDdcCatalogId()));
                obj.setLevelResult(tagMap.get(record.getTagId()).getName());
                list.add(obj);
            } catch (Exception e) {
                log.error("导出分类分级结果报错", e);
            }
        }

        discernResult.put("分类分级结果", ExcelUtil.getSheetData(list));
        ExcelUtil.exportManySheetByList(response, "分类分级结果", discernResult);
    }

    private String getCatalogNamePath(Long catalogId) {
        StringBuilder catalogNamePath = new StringBuilder();

        CommonCatalog currentCatalog = getCatalog(catalogId);
        if (null == currentCatalog) {
            return null;
        }
        String catalogPath = currentCatalog.getCatalogPath();

        String[] catalogParent = catalogPath.split("/");
        for (String cg : catalogParent) {
            CommonCatalog catalog = getCatalog(Long.valueOf(cg));
            if (catalog == null) {
                continue;
            }
            if (catalogNamePath.length() > 0) {
                catalogNamePath.append("-").append(catalog.getName());
            } else {
                catalogNamePath.append(catalog.getName());
            }
        }

        catalogNamePath.append("-").append(currentCatalog.getName());
        return catalogNamePath.toString();
    }

    private CommonCatalog getCatalog(Long catalogId) {
        Optional<CommonCatalog> catalogOptional = catalogRepository.findById(catalogId);
        if (!catalogOptional.isPresent()) {
            return null;
        }
        //访问此目录
        CommonCatalog catalog = catalogOptional.get();
        return catalog;
    }
}
