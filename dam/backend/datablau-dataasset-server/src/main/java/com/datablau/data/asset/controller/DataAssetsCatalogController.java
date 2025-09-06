package com.datablau.data.asset.controller;

import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.model.common.api.MessageService;
import com.datablau.base.api.FavoriteService;
import com.datablau.base.data.FavoriteDto;
import com.datablau.catalog.dto.CommonCatalogDto;
import com.datablau.catalog.enums.EnumAssetsCatalogStatus;
import com.datablau.catalog.enums.EnumCatalogPublicType;
import com.datablau.catalog.enums.EnumSupportType;
import com.datablau.catalog.jpa.entity.CommonCatalog;
import com.datablau.data.asset.api.DataAssetsCatalogCollectionService;
import com.datablau.data.asset.api.DataAssetsCatalogCompleteAlgorithmService;
import com.datablau.data.asset.api.DataAssetsCatalogService;
import com.datablau.data.asset.api.DataAssetsCatalogStructureService;
import com.datablau.data.asset.api.DataAssetsVisitService;
import com.datablau.data.asset.dto.*;
import com.datablau.data.asset.jpa.entity.CatalogExt;
import com.datablau.data.asset.jpa.entity.DataAssets;
import com.datablau.data.asset.jpa.entity.DataAssetsCatalogCollection;
import com.datablau.data.asset.jpa.repository.CatalogExtRepository;
import com.datablau.data.asset.jpa.repository.DataAssetsRepository;
import com.datablau.data.asset.service.DataAssetsCatalogArchyService;
import com.datablau.data.asset.service.DataCatalogExcelService;
import com.datablau.data.asset.upload.DDCCatalogImportResultDto;
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
import cn.hutool.poi.excel.ExcelWriter;
import com.datablau.data.common.util.ExcelUtil;
import com.datablau.data.common.util.JsonUtils;
import com.datablau.dataasset.enums.EnumSyncType;
import com.datablau.dataasset.utils.IpUtil;
import com.datablau.domain.management.api.DomainService;
import com.datablau.domain.management.dto.DomainDto;
import com.datablau.security.management.api.OrganizationService;
import com.datablau.security.management.api.RoleService;
import com.fasterxml.jackson.core.JsonProcessingException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.File;
import java.text.SimpleDateFormat;
import java.util.*;
import javax.servlet.http.HttpServletResponse;

import org.elasticsearch.common.Strings;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.CollectionUtils;
import org.springframework.validation.annotation.Validated;
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


/**
 * 获取目录
 */
@Tag(name = "数据目录")
@RestController
@RequestMapping(value = "/catalog")
public class DataAssetsCatalogController extends BaseController {

    private static final Logger LOGGER = LoggerFactory.getLogger(DataAssetsCatalogController.class);

    @Autowired
    private FileUtility fileUtility;
    @Autowired
    private KafkaLogUtils kafkaLogUtils;
    @Autowired
    private RedissonClient redissonClient;

    @Autowired
    private InstantJobService instantJobService;
    @Autowired
    private FavoriteService favoriteService;
    @Autowired
    private OrganizationService organizationService;
    @Autowired
    private DataAssetsCatalogService dataAssetsCatalogService;
    @Autowired
    private DataAssetsCatalogStructureService structureService;
//    @Autowired
//    private DataSecuritySyncCatalogService dataSecurityCatalogService;
    @Autowired
    private DataAssetsVisitService dataAssetsCatalogVisitService;
    @Autowired
    private DataAssetsCatalogCompleteAlgorithmService dataAssetsCatalogCompleteAlgorithmService;
    @Autowired
    private DataAssetsCatalogCollectionService collectionService;

    @Autowired
    private MessageService messageService;
    @Autowired
    protected DataAssetsRepository assetsRepository;
    @Autowired
    private DataAssetsCatalogArchyService dataAssetsCatalogArchyService;
    @Autowired
    private CatalogExtRepository catalogExtRepository;
    @Autowired
    private DataCatalogExcelService catalogExcelService;

    public DataAssetsCatalogController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "获取所有展示的结构")
    @GetMapping(value = "/structures")
    public Collection<DataAssetsStructureDto> structures(@RequestParam("fromPage") String fromPage) {
        return dataAssetsCatalogService.getStructure(this.getCurrentUser(), fromPage);
    }

    @Operation(summary = "资产管理")
    @GetMapping(value = "/manage/{structureId}/{catalogId}")
    public Collection<DataAssetsCatalogDto> manageCatalog(@PathVariable("structureId") Long structureId, @PathVariable("catalogId") Long catalogId) {
        return dataAssetsCatalogArchyService.findManageCatalogs(this.getCurrentUser(), structureId, catalogId);
    }

//    @Operation(summary = "资产管理")
    @GetMapping(value = "/manage0/{structureId}/{catalogId}")
    public Collection<DataAssetsCatalogDto> manageCatalog0(@PathVariable("structureId") Long structureId, @PathVariable("catalogId") Long catalogId) {
        return dataAssetsCatalogArchyService.findManageCatalogs0(structureId, catalogId);
    }

    @Operation(summary = "目录顺序")
    @PostMapping(value = "/sort")
    public void sort(@RequestBody List<CatalogSortDto> dtos) {
        dataAssetsCatalogService.saveSort(dtos);
    }

    @Operation(summary = "资产管理搜索")
    @GetMapping(value = "/manage/{structureId}/search")
    public List<DataAssetsCatalogDto> searchManage(@PathVariable("structureId") Long structureId, @RequestParam("keywords") String keywords) {
        return dataAssetsCatalogService.searchTree(this.getCurrentUser(), structureId, keywords, null, "MANAGE");
    }

    @Operation(summary = "资产浏览")
    @GetMapping(value = "/browse/{structureId}/{catalogId}")
    public Collection<DataAssetsCatalogDto> browseCatalog(@PathVariable("structureId") Long structureId, @PathVariable("catalogId") Long catalogId) {
        return dataAssetsCatalogService.findBrowseCatalogs(this.getCurrentUser(), structureId, catalogId);
    }

    @Operation(summary = "资产浏览搜索")
    @GetMapping(value = "/browse/{structureId}/search")
    public List<DataAssetsCatalogDto> searchBrowse(@PathVariable("structureId") Long structureId, @RequestParam("keywords") String keywords) {
        return dataAssetsCatalogService.searchTree(this.getCurrentUser(), structureId, keywords, EnumAssetsCatalogStatus.PUBLISHED, "BROWSE");
    }

    @Operation(summary = "是否有权限在只是图谱中跳转")
    @GetMapping(value = "/graph/{catalogId}")
    public Map<String, Object> checkGraphAuthAndStatus(@PathVariable("catalogId") Long catalogId,
                                                       @RequestParam(value = "status", required = false) EnumAssetsCatalogStatus status) {
        Map<String, Object> resMap = new HashMap<>();
        resMap.put("auth", dataAssetsCatalogService.checkGraph(this.getCurrentUser(), catalogId, status));
        resMap.put("status", dataAssetsCatalogService.getById(catalogId).getStatus());
        return resMap;
    }

    @Operation(summary = "获取目录详情")
    @GetMapping(value = "/detail/{id}")
    public ResResultDto catalogDetails(@PathVariable Long id) {
        DataAssetsCatalogDetailsDto infoCatalog = dataAssetsCatalogService.getCatalogAssetsType(this.getCurrentUser(), id);
        kafkaLogUtils.getCatalogDetail(this.getCurrentUser(), infoCatalog, dataAssetsCatalogService.getFullPathByCatalogId(infoCatalog.getId()), IpUtil.getUserIp(), IpUtil.getUrl());
        return ResResultDto.ok(infoCatalog);
    }

    @Operation(summary = "获取目录详情(不统计日志)")
    @GetMapping(value = "/detail/{id}/nolog")
    public ResResultDto catalogDetailsNolog(@PathVariable Long id) {
        DataAssetsCatalogDetailsDto infoCatalog = dataAssetsCatalogService.getCatalogAssetsType(this.getCurrentUser(), id);
        return ResResultDto.ok(infoCatalog);
    }

    @Operation(summary = "获取目录上下级列表关系")
    @PostMapping(value = "/relation")
    public ResResultDto<DataAssetsCatalogRelationDto> catalogRelation(@RequestBody SearchSubCatalogDto searchSubCatalogDto) {
        String username = getCurrentUser();
        DataAssetsCatalogRelationDto catalogRelation = dataAssetsCatalogService.getCatalogRelation(searchSubCatalogDto.getCatalogId(), username, searchSubCatalogDto.getStatus());
        return ResResultDto.ok(catalogRelation);
    }

    @Operation(summary = "获取子目录数据")
    @PostMapping(value = "/subCatalog")
    public ResResultDto<List<SubCatalogDto>> findSudCatalog(@Validated @RequestBody SearchSubCatalogDto basePage) {
        List<SubCatalogDto> subCatalogVoPage = dataAssetsCatalogService.findSudCatalogInfo(getCurrentUser(), basePage);
        return ResResultDto.ok(subCatalogVoPage);
    }

    @Operation(summary = "发布资产目录", parameters = {
            @Parameter(name = "id", description = "目录id", in = ParameterIn.PATH),
            @Parameter(name = "status", description = "状态 UNPUBLISHED：待发布  UNDER_REVIEW：审核中   PUBLISHED：已发布   OFFLINE：下线", in = ParameterIn.PATH)
    })
    @PutMapping(value = "/publish/{id}/{status}")
    public ResResultDto<?> publish(@PathVariable Long id, @PathVariable EnumAssetsCatalogStatus status) {
        dataAssetsCatalogService.publish(id, status);
        return ResResultDto.ok();
    }

    @Operation(summary = "新建资产目录")
    @PostMapping("/add")
    public ResResultDto<CommonCatalog> addCatalog(@RequestBody DataAssetsCatalogDto dto) {
        CommonCatalog save = dataAssetsCatalogArchyService.save(dto, getCurrentUser());
        kafkaLogUtils.addNewCatalog(this.getCurrentUser(), save, dataAssetsCatalogArchyService.getFullPathByCatalogId(save.getId()), IpUtil.getUserIp(), IpUtil.getUrl());

        // send sync msg to kafka
        CommonCatalogDto catalogDto = new CommonCatalogDto();
        BeanUtils.copyProperties(save, catalogDto);
        kafkaLogUtils.syncCatalog(EnumSyncType.ADD, catalogDto, null, null);
        return ResResultDto.ok(save);
    }

    @PostMapping("/test")
    public void test() {
        dataAssetsCatalogArchyService.test();
    }

    @Operation(summary = "修改资产目录")
    @PutMapping("/update")
    public void updateCatalog(@RequestBody DataAssetsCatalogDto dto) {
        CommonCatalog update = dataAssetsCatalogArchyService.update(dto);
        kafkaLogUtils.changeCatalog(this.getCurrentUser(), dto,
                dataAssetsCatalogService.getFullPathByCatalogId(update.getId()),
                /*organizationService.getOrganizationsByBm(dto.getBm()).getFullName()*/"", IpUtil.getUserIp(), IpUtil.getUrl());

        // send sync msg to kafka
        CommonCatalogDto catalogDto = new CommonCatalogDto();
        BeanUtils.copyProperties(update, catalogDto);
        kafkaLogUtils.syncCatalog(EnumSyncType.MODIFY, catalogDto, dto.getName(), null);
    }

    @Operation(summary = "验证修改后完成度")
    @PutMapping("/update/check/complete")
    public boolean checkComplete(@RequestBody DataAssetsCatalogDto dto) {
        return dataAssetsCatalogCompleteAlgorithmService.checkCompleteRatio(dto);
    }

    @Operation(summary = "移动资产目录")
    @Parameters({@Parameter(name = "id", description = "要移动得目录id", in = ParameterIn.QUERY),
            @Parameter(name = "parentId", description = "移动到父级目录id", in = ParameterIn.QUERY)})
    @PutMapping("/move")
    public void moveCatalog(@RequestParam("id") Long id, @RequestParam("parentId") Long parentId) {
        CommonCatalog origin = dataAssetsCatalogService.getById(id);
        if (origin.getParentId().equals(parentId)) {
            return;
        }
        List<CommonCatalog> catalogList = dataAssetsCatalogService.move(id, parentId);
        //移动数据架构侧
        LOGGER.info("开始同步数据架构。。。");
        dataAssetsCatalogArchyService.moveArchyForCatalog(origin, parentId);
        LOGGER.info("开始同步数据架构完事。。。");

        String originPath = dataAssetsCatalogService.getFullPathByCatalogId(catalogList.get(0).getParentId()) + "/" + origin.getName();
        String targetPath = dataAssetsCatalogService.getFullPathByCatalogId(parentId) + "/" + origin.getName();
        kafkaLogUtils.moveCatalog(this.getCurrentUser(), id, originPath, targetPath, IpUtil.getUserIp(), IpUtil.getUrl());

        // send sync msg to kafka
        CommonCatalogDto originDto = new CommonCatalogDto();
        CommonCatalogDto targetDto = new CommonCatalogDto();
        BeanUtils.copyProperties(catalogList.get(0), originDto);
        BeanUtils.copyProperties(catalogList.get(1), targetDto);
        kafkaLogUtils.syncCatalog(EnumSyncType.MOVE, originDto, null, targetDto);
    }

    @Operation(summary = "删除资产目录")
    @Parameters({@Parameter(name = "id", description = "要删除得目录id", in = ParameterIn.PATH)})
    @DeleteMapping("/del/{id}")
    public void delete(@PathVariable("id") Long id) {
        CommonCatalog catalog = dataAssetsCatalogArchyService.delete(id);
        String path = catalog.getParentId() == 0 ? catalog.getName() : (dataAssetsCatalogService.getFullPathByCatalogId(catalog.getParentId()) + "/" + catalog.getName());
        kafkaLogUtils.deleteCatalog(this.getCurrentUser(), catalog, path, IpUtil.getUserIp(), IpUtil.getUrl());

        // send sync msg to kafka
        CommonCatalogDto catalogDto = new CommonCatalogDto();
        BeanUtils.copyProperties(catalog, catalogDto);
        kafkaLogUtils.syncCatalog(EnumSyncType.DELETE, catalogDto, null, null);
    }

    //用于测试调接口删除
    @PostMapping("/deltest/{id}")
    public void dels(@PathVariable("id") Long id){
        dataAssetsCatalogArchyService.deleteByIds(id);
    }

    @Operation(summary = "修改目录公开")
    @Parameters({@Parameter(name = "id", description = "目录id", in = ParameterIn.PATH),
            @Parameter(name = "publicType", description = "公开枚举", in = ParameterIn.QUERY)})
    @PostMapping("/public/read/{id}")
    public void changePublicType(@PathVariable("id") Long id, @RequestParam("publicType") EnumCatalogPublicType publicType) {
        CommonCatalog dataAssetsCatalog = dataAssetsCatalogService.update(id, publicType);
        kafkaLogUtils.changeVisible(id, dataAssetsCatalog.getStatus());
        kafkaLogUtils.changePublicType(this.getCurrentUser(), dataAssetsCatalog, dataAssetsCatalogService.getFullPathByCatalogId(id), publicType, IpUtil.getUserIp(), IpUtil.getUrl());
    }

    @Operation(summary = "修改权属")
    @Parameters({@Parameter(name = "id", description = "目录id", in = ParameterIn.PATH),
            @Parameter(name = "bm", description = "机构编码", in = ParameterIn.PATH)})
    @PostMapping("/org/{id}/{bm}")
    public void changeDep(@PathVariable("id") Long id, @PathVariable("bm") String bm) {
        dataAssetsCatalogService.updateOrg(id, bm);
        String catalogName = dataAssetsCatalogService.getFullPathByCatalogId(id);
        String deptName = organizationService.getOrganizationsByBm(bm).getFullName();
        kafkaLogUtils.changeDept(this.getCurrentUser(), id, catalogName, deptName, IpUtil.getUserIp(), IpUtil.getUrl());
    }

    @Operation(summary = "修改数据管家")
    @Parameters({@Parameter(name = "id", description = "目录id", in = ParameterIn.PATH),
            @Parameter(name = "butler", description = "用户名", in = ParameterIn.QUERY)})
    @PostMapping("/butler/{id}")
    public void changeButler(@PathVariable("id") Long id, @RequestParam("butler") String butler) {
        dataAssetsCatalogService.update(id, butler);
        String catalogName = dataAssetsCatalogService.getFullPathByCatalogId(id);
        kafkaLogUtils.changeButler(this.getCurrentUser(), id, catalogName, butler, IpUtil.getUserIp(), IpUtil.getUrl());
    }

    @Operation(summary = "绑定资产")
    @PutMapping("/bind")
    public ResResultDto bindAssets(@RequestBody BindAssetsDto bindAssetsDtoList) {
        RLock lock = redissonClient.getLock("bind_assets_lock");
        try {
            lock.lock();
            //判断该资产目录下只能注册一个资产
            List<DataAssets> allByCatalogId = assetsRepository.findAllByCatalogId(bindAssetsDtoList.getCatalogId());
            if(!CollectionUtils.isEmpty(allByCatalogId)){
                throw new RuntimeException("资产目录只允许注册一个数据资产");
            }

            if(bindAssetsDtoList.getSubAssetsType().equals(EnumSupportType.DATA_OBJECT.name()) || bindAssetsDtoList.getSubAssetsType().equals(EnumSupportType.TABLE.name()) ){
                List<Long> objectIds = bindAssetsDtoList.getObjectId();
                List<DataAssets> existAssets = assetsRepository.findAllByItemIdIn(objectIds.stream().map(String::valueOf).toList());
                if(!CollectionUtils.isEmpty(existAssets)){
                    List<String> names = existAssets.stream().map(DataAssets::getItemName).toList();
                    throw new RuntimeException("资产【" + names + "】已经被绑定不能重复绑定");
                }
            }

            List<String> strings = dataAssetsCatalogService.bindAssets(bindAssetsDtoList);
            String fullPath = dataAssetsCatalogService.getFullPathByCatalogId(bindAssetsDtoList.getCatalogId());
            kafkaLogUtils.bindAssets(this.getCurrentUser(), bindAssetsDtoList, fullPath, IpUtil.getUserIp(), IpUtil.getUrl());
            return ResResultDto.ok(strings);
        } catch (Exception e) {
            throw new UnexpectedStateException(e.getMessage());
        } finally {
            lock.forceUnlock();
        }
    }


    @Operation(summary = "获取资产目录属性")
    @GetMapping("/getcatalogpropery")
    public ResResultDto<CatalogPropertyDto> getCatalogPropery(Long catalogId) {
        String currentUser = getCurrentUser();
        CatalogPropertyDto result = dataAssetsCatalogArchyService.getCatalogPropery(catalogId, currentUser);

        return ResResultDto.ok(result);
    }

    @Operation(summary = "收藏资产目录")
    @PostMapping("/collect/{catalogId}/{catalogName}")
    public void collect(@PathVariable("catalogId") Long catalogId, @PathVariable("catalogName") String catalogName) {
        String currentUser = getCurrentUser();
        if (collectionService.isCollected(catalogId, currentUser)) {
            synchronized (this) {
                if (collectionService.isCollected(catalogId, currentUser)) {
                    dataAssetsCatalogService.collect(new DataAssetsCatalogCollection(catalogId, currentUser));
                    FavoriteDto favoriteDto = new FavoriteDto();
                    favoriteDto.setObjId(String.valueOf(catalogId));
                    favoriteDto.setObjectName(catalogName);
                    favoriteDto.setTypeId(LDMTypes.oCatalog);
                    favoriteDto.setOwner(currentUser);
                    favoriteDto.setCreateTime(new Date());
                    favoriteService.favouriteCatalog(favoriteDto);
                }
            }
        }
    }

    @Operation(summary = "获取结构id")
    @GetMapping("/{catalogId}")
    public ResResultDto<Long> getStructureId(@PathVariable("catalogId") Long catalogId){
        return ResResultDto.ok(dataAssetsCatalogService.getStructureId(catalogId));
    }

    @Operation(summary = "取消收藏资产目录")
    @PostMapping("/cancel/{catalogId}")
    public void cancelCollection(@PathVariable("catalogId") Long catalogId) {
        String currentUser = getCurrentUser();
        dataAssetsCatalogService.cancelCollection(new DataAssetsCatalogCollection(catalogId, currentUser));
        favoriteService.deleteByIdAndUser(currentUser, String.valueOf(catalogId));
    }

    @Operation(summary = "访问目录")
    @PostMapping("/visit/{structureId}/{catalogId}")
    public void visit(@PathVariable("structureId") Long structureId, @PathVariable("catalogId") Long catalogId) {
        String currentUser = getCurrentUser();
        dataAssetsCatalogVisitService.visitCatalog(structureId, catalogId, currentUser);
    }

    @Operation(summary = "目录导出")
    @PostMapping("/export/{structureId}")
    public String export(@PathVariable("structureId") Long structureId) throws Exception {
        String currentUser = getCurrentUser();
//        Map<String, List<List<Object>>> exportCatalog = dataAssetsCatalogService.exportCatalog(currentUser, null, structureId);
        File file = dataAssetsCatalogArchyService.exportCatalogNew(currentUser, null, structureId);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        String submitJob = instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                                           @Override
                                                           public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                                           }

                                                           @Override
                                                           public InstantJobResult call() throws Exception {
//                                                               File file = ExcelUtil.export(exportCatalog);
                                                               FileDescriptor storedFile = fileUtility.uploadFile(file, messageService.getMessage("assetsCatalogList") + ".xlsx", currentUser, false);
                                                               FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                               result.setFileId(storedFile.getFileId());
                                                               result.setJobStatus(InstantJobStage.FINISHED);
                                                               return result;
                                                           }
                                                       }
                , messageService.getMessage("exportDataAssetCatalog") + sdf.format(new Date()), currentUser, EnumJobType.EXPORT.name());
        kafkaLogUtils.exportCatalog(this.getCurrentUser(), structureId, structureService.findSingleVoById(structureId).getName(), IpUtil.getUserIp(), IpUtil.getUrl());
        LOGGER.info("The asset catalog export is complete");
        return submitJob;
    }


    @Operation(summary = "目录模板导出")
    @PostMapping("/export/template/{structureId}")
    public void exportTemplate(@PathVariable("structureId") Long structureId, HttpServletResponse response) {
        dataAssetsCatalogArchyService.exportCatalogTemplate(structureId, response);
        kafkaLogUtils.exportCatalogTemplate(this.getCurrentUser(), structureId, IpUtil.getUserIp(), IpUtil.getUrl());
    }

    @Operation(summary = "目录导入")
    @PostMapping("/upload")
    public String upload(@RequestBody MultipartFile multipartFile,
                         @RequestParam EnumAssetsCatalogStatus status,
                         @RequestParam(name = "structureId") Long structureId) {

        String currentUser = getCurrentUser();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");
        try {
            List<Object> imports = new ArrayList<>();
            Map<String, List<Object>> sheets = ExcelUtil.readFileManySheet(multipartFile);
            for (String sheetName : List.of("业务域", "主题域", "业务对象")) {
                if(!sheets.containsKey(sheetName)){
                    throw new RuntimeException("导入模板没有【" + sheetName + "】的sheet页");
                }
            }
//            List<String> collect = new ArrayList<>();
//            collect.add(messageService.getMessage("firstCatalog"));
//            collect.add(messageService.getMessage("secondCatalog"));
//            collect.add(messageService.getMessage("thirdCatalog"));
//            collect.add(messageService.getMessage("fourthCatalog"));
//            collect.add(messageService.getMessage("fifthCatalog"));
//            Set<String> sheetName = new HashSet<>(sheets.keySet());
//            sheetName.removeAll(collect);
//            sheetName.remove(messageService.getMessage("fileImport.fillingExplanation"));
            final SecurityContext context = SecurityContextHolder.getContext();
            String submitJob = instantJobService.submitJob(new InstantJob<InstantJobResult>() {
                                                               @Override
                                                               public void setProgressMonitor(InstantJobProgressMonitor monitor) {

                                                               }

                                                               @Override
                                                               public InstantJobResult call() {
                                                                   SecurityContextHolder.setContext(context);
                                                                   DDCCatalogImportResultExtDto importResult = new DDCCatalogImportResultExtDto();
                                                                   importResult = dataAssetsCatalogArchyService.uploadCatalog0(multipartFile, sheets, importResult, structureId, currentUser, status);
//                                                                   if (sheetName.size() == 0) {
//                                                                       for (String key : collect) {
//                                                                           if (sheets.containsKey(key)) {
//                                                                               imports.clear();
//                                                                               imports.addAll(sheets.get(key));
//                                                                               if (imports.isEmpty()) continue;
//                                                                               importResult = dataAssetsCatalogService.uploadCatalog(imports, key, importResult, status, structureId, getCurrentUser());
//                                                                           }
//                                                                       }
//                                                                   } else {
//                                                                       importResult.getErrorMsg().add(messageService.getMessage("importTemplateFileError"));
//                                                                   }
                                                                   FileGenerateInstantJobResult result = new FileGenerateInstantJobResult();
                                                                   result.setErrorMessage(JsonUtils.toJSon(importResult));
                                                                   result.setFileId(importResult.getFileId());
                                                                   result.setJobStatus(InstantJobStage.FINISHED);
                                                                   return result;
                                                               }
                                                           }
                    , messageService.getMessage("importDataAssetCatalog") + sdf.format(new Date()), currentUser, EnumJobType.IMPORT.name());
            kafkaLogUtils.importCatalog(this.getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl(), structureId, structureService.findSingleVoById(structureId).getName());
            return submitJob;
        } catch (Exception e) {
            e.printStackTrace();
            throw new UnexpectedStateException(messageService.getMessage("fileReadError"));
        }
    }

    @PostMapping("/uploadCatalogTwo")
    public String uploadCatalogTwo(@RequestBody MultipartFile multipartFile,
                         @RequestParam EnumAssetsCatalogStatus status,
                         @RequestParam(name = "structureId") Long structureId) throws Exception {

        String currentUser = getCurrentUser();
        Map<String, List<Object>> sheets = ExcelUtil.readFileManySheet(multipartFile);
        for (String sheetName : List.of("业务域", "主题域", "业务对象")) {
            if(!sheets.containsKey(sheetName)){
                throw new RuntimeException("导入模板没有【" + sheetName + "】的sheet页");
            }
        }
        DDCCatalogImportResultDto importResult = new DDCCatalogImportResultDto();
        dataAssetsCatalogArchyService.uploadCatalogTwo(sheets, importResult, structureId, currentUser, EnumAssetsCatalogStatus.UNPUBLISHED);
        return "";
    }


    /**
     * 门户列表
     *
     * @return
     */
    @Operation(summary = "门户目录列表")
    @GetMapping(value = "/home/catalog")
    public ResResultDto<List<HomeCatalogDto>> getHomeCatalog() {
        String currentUser = getCurrentUser();
        List<HomeCatalogDto> homeCatalog = dataAssetsCatalogService.findHomeCatalog(currentUser);
        return ResResultDto.ok(homeCatalog);
    }

    @Operation(summary = "查看当前目录所有子目录是否都满足发布条件")
    @GetMapping(value = "/check/subs/{structureId}")
    public ResResultDto<List<String>> checkPub(@PathVariable("structureId") Long structureId, @RequestParam("path") String path) {
        return ResResultDto.ok(dataAssetsCatalogService.checkCatalog(structureId, path));
    }

    @GetMapping("/getDomainId")
    public CatalogExt getCatalogExt(@RequestParam("catalogId") Long catalogId){
        return dataAssetsCatalogArchyService.getCatalogExt(catalogId);
    }

//    @Autowired
//    RemoteDataAssetExtendServiceImpl remoteDataAssetExtendServiceImpl;
//
//    @GetMapping("/a/{id}")
//    public void a(@PathVariable("id")  Long id){
//
//        remoteDataAssetExtendServiceImpl.updateCatalogStatus(Set.of(id),
//                EnumAssetsCatalogStatus.PUBLISHED, LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
//    }
//
//    @PostMapping("/b/{l3Id}/{username}")
//    public void b(@PathVariable("l3Id") Long l3Id, @PathVariable("username") String username, @RequestBody List<L4Dto> l4DtoList){
//
//        remoteDataAssetExtendServiceImpl.syncL4AndL5(l3Id,
//                username, l4DtoList);
//    }

    @Autowired
    DomainService domainService;

    @GetMapping("/getDomainIdCount")
    public Integer getDomainIdCount(){
        ArrayList<String> domainIds = new ArrayList<>();
        List<CatalogExt> all = catalogExtRepository.findAll();
        for (CatalogExt ext : all) {
            if(!Strings.isEmpty(ext.getDomainId())){
                domainIds.add(ext.getDomainId());
            }
        }
        List<DomainDto> domains = domainService.getDomainsByDomainIds(domainIds);
        return domains.size();
    }


    @PostMapping("/need/apply/asset")
    public void exportBatchInfo(@RequestBody List<Long> ids, HttpServletResponse response) {
        // 验证输入参数
        if (CollectionUtils.isEmpty(ids)) {
            throw new RuntimeException("目录ID列表不能为空");
        }
        
        try {
            Map<String, List<List<Object>>> catalogMap = dataAssetsCatalogArchyService.exportCatalogWithId(ids);
            
            // 验证返回的数据结构
            if (catalogMap == null || catalogMap.isEmpty()) {
                throw new RuntimeException("未找到可导出的数据");
            }
            
            // 使用catalogExcelService.exportCatalog生成Excel
            ExcelWriter writer = catalogExcelService.exportCatalog(catalogMap);
            
            // 设置响应头
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename=\"目录导出_" + System.currentTimeMillis() + ".xlsx\"");
            
            // 写入响应流 - 使用flush方法写入到输出流
            writer.flush(response.getOutputStream());
            writer.close();
            
        } catch (Exception e) {
            LOGGER.error("导出失败: {}", e.getMessage(), e);
            throw new RuntimeException("导出失败: " + e.getMessage());
        }
    }



    @GetMapping("/dop/catalog/detail/{id}")
    public ResResultDto<CommonCatalogDopExtDto> dopCatalogDetail(@PathVariable("id") Long id) {
        CommonCatalogDopExtDto commonCatalogDopExtDtoById = dataAssetsCatalogArchyService.getCommonCatalogDopExtDtoById(id);
        if (commonCatalogDopExtDtoById != null) {
            return ResResultDto.ok(commonCatalogDopExtDtoById);
        } else {
            return ResResultDto.error("未找到ID为" + id + "的目录信息");
        }
    }

    //获取资产目录L123的树结构
    @GetMapping(value = "/manageTree/{structureId}")
    public Collection<DataAssetsCatalogDto> manageTree(@PathVariable("structureId") Long structureId) throws Exception {
        return dataAssetsCatalogArchyService.manageTree(structureId, 0L);
    }

    //根据123的id查出来对应的l4
    @GetMapping(value = "/findL4ByParentId")
    public Collection<DataAssetsCatalogDto> findL4ByParentId(@RequestParam("parentId") Long parentId) throws Exception {
        return List.of();
    }
}
