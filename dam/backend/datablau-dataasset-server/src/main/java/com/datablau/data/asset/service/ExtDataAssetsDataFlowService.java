package com.datablau.data.asset.service;

import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.dto.ExcelLoadJobResult;
import com.andorj.model.common.utility.MultiConditionQueryUtils;
import com.datablau.base.api.ModelCategoryService;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.catalog.jpa.entity.CommonCatalog;
import com.datablau.data.asset.dto.*;
import com.datablau.data.asset.enums.ExtDataAssetsDataFlowPermissions;
import com.datablau.data.asset.jpa.entity.CatalogExt;
import com.datablau.data.asset.jpa.entity.ExtDataAssetsDataFlow;
import com.datablau.data.asset.jpa.entity.ExtDataAssetsDataFlowId;
import com.datablau.data.asset.jpa.repository.CatalogExtRepository;
import com.datablau.data.asset.jpa.repository.CommonCatalogExtRepository;
import com.datablau.data.asset.jpa.repository.ExtCommonCatalogRepository;
import com.datablau.data.asset.jpa.repository.ExtDataAssetsDataFlowRepository;
import com.datablau.data.common.api.ExcelExporter;
import com.datablau.data.common.api.ExcelLoader;
import com.datablau.metadata.common.api.DatablauRemoteDamModelService;
import com.datablau.metadata.common.api.DatablauRemoteMetadataService;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.io.File;
import java.net.URLEncoder;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ExtDataAssetsDataFlowService {

  private static final Logger LOGGER = LoggerFactory.getLogger(ExtDataAssetsDataFlowService.class);

  @Autowired
  private ExtCommonCatalogRepository extCommonCatalogRepository;
  @Autowired
  private CatalogExtRepository catalogExtRepository;
  @Autowired
  private ExtDataAssetsDataFlowRepository extDataAssetsDataFlowRepository;
  @Autowired
  private MultiConditionQueryUtils queryUtils;
  @Autowired
  protected ExcelLoader excelLoader;

  @Autowired
  protected AssetsExcelExporter excelExporter;

  @Autowired
  private ModelCategoryService modelCategoryService;
  @Autowired
  private DatablauRemoteDamModelService datablauRemoteDamModelService;
  @Autowired
  private DatablauRemoteMetadataService remoteMetadataService;


  @Transactional
  public ExtDataAssetsDataFlowSyncResult sync() {
    LOGGER.info("sync DataAssetsDataFlow ...");
    ExtDataAssetsDataFlowSyncResult result = new ExtDataAssetsDataFlowSyncResult();
    
    try {
      Iterable<CatalogExt> allCatalogExt = catalogExtRepository.findAll();
      Map<Long, CatalogExt> catalogExtMap = new HashMap<>();
      allCatalogExt.forEach(catalogExt -> {
        catalogExtMap.put(catalogExt.getCatalogId(), catalogExt);
      });
      List<CommonCatalog> commonCatalogList = extCommonCatalogRepository.findAllPublishedL4List();
      List<CommonCatalog> commonCatalogL3List = extCommonCatalogRepository.findAllPublishedL3List();
      Map<Long, String> l3Map = commonCatalogL3List.stream().collect(Collectors.toMap(CommonCatalog::getId, CommonCatalog::getCode));
      result.setTotalCatalogs(commonCatalogList.size());
      
      // 预先查询所有已存在记录的key集合，在数据库层面直接拼接
      Set<String> existingKeys = extDataAssetsDataFlowRepository.findAllKeys();
      Set<String> allL4Codes = extDataAssetsDataFlowRepository.findAllL4Code();

      // 构建当前有效的key集合（从commonCatalogList）
      Set<String> validKeys = new HashSet<>();
      
      // 在循环中直接过滤并构建最终数据列表
      List<ExtDataAssetsDataFlow> dataList = new ArrayList<>();
      int skippedExistingCount = 0;
      int skippedInvalidCount = 0;
      
      for (CommonCatalog commonCatalog : commonCatalogList) {
        // 检查l4Code是否为空，如果为空则跳过
        String l4Code = commonCatalog.getCode();
        if (l4Code == null || l4Code.trim().isEmpty()) {
          LOGGER.warn("sync skip, l4Code is null or empty. catalogId={}, catalogName={}", 
                     commonCatalog.getId(), commonCatalog.getName());
          skippedInvalidCount++;
          continue;
        }
        
        ExtDataAssetsDataFlow extDataAssetsDataFlow = new ExtDataAssetsDataFlow();
        if (l3Map.containsKey(commonCatalog.getParentId())){
          extDataAssetsDataFlow.setL3Code(l3Map.get(commonCatalog.getParentId()));
        }
        extDataAssetsDataFlow.setL4Code(l4Code);
        extDataAssetsDataFlow.setDataFlowPermissions(9); // 默认权限CD
        CatalogExt catalogExt = catalogExtMap.get(commonCatalog.getId());
        if (catalogExt != null) {
          String sourceSystemIdStr = catalogExt.getSourceSystem();
          if (sourceSystemIdStr != null) {
            extDataAssetsDataFlow.setModelCategoryId(Long.valueOf(sourceSystemIdStr));
          }
        }
        if (extDataAssetsDataFlow.getModelCategoryId() == null) {
          LOGGER.warn("sync skip, model category id is null. catalogId={}, catalogName={}, catalogCode={}", commonCatalog.getId(), commonCatalog.getName(), commonCatalog.getCode());
          skippedInvalidCount++;
          continue;
        }
        
        // 检查是否已存在
        String key = extDataAssetsDataFlow.getL4Code() + "_" + extDataAssetsDataFlow.getModelCategoryId();
        validKeys.add(extDataAssetsDataFlow.getL4Code());
        if (existingKeys.contains(key)) {
          LOGGER.debug("sync skip existing record. l4Code={}, modelCategoryId={}", 
                      extDataAssetsDataFlow.getL4Code(), extDataAssetsDataFlow.getModelCategoryId());
          skippedExistingCount++;
          continue;
        }
        
        dataList.add(extDataAssetsDataFlow);
      }
      
      // 保存新增记录
      if (!dataList.isEmpty()) {
        extDataAssetsDataFlowRepository.saveAll(dataList);
      }

      // 找出需要删除的记录（在existingKeys中存在但不在validKeys中）
      Set<String> keysToDelete = new HashSet<>(allL4Codes);
      keysToDelete.removeAll(validKeys);

      long deletedCount = 0;
      if (!keysToDelete.isEmpty()) {
        LOGGER.info("删除keys:"+ keysToDelete);
        // 根据key删除记录
        deletedCount = extDataAssetsDataFlowRepository.deleteByL4CodeIn(keysToDelete);
        LOGGER.info("Deleted {} obsolete records", deletedCount);
      }
      
      // 设置结果信息
      result.setAddedCount(dataList.size());
      result.setSkippedExistingCount(skippedExistingCount);
      result.setSkippedInvalidCount(skippedInvalidCount);
      result.setSuccess(true);
      result.setMessage(result.getSummary());
      
      LOGGER.info("sync DataAssetsDataFlow completed. {}", result.getSummary());
      
    } catch (Exception e) {
      LOGGER.error("sync DataAssetsDataFlow failed", e);
      result.setSuccess(false);
      result.setMessage("同步失败：" + e.getMessage());
    }
    
    return result;
  }

  public ExtDataAssetsDataFlowResDto getPage(ExtDataAssetsDataFlowReqDto reqDto) {
    Set<Long> modelCategoryIds = new HashSet<>();
    String modelCategoryName = reqDto.getModelCategoryName();
    List<ModelCategoryDto> modelCategoryDtoList = modelCategoryService.getModelCategories();
    Map<Long, ModelCategoryDto> modelCategoryDtoMap = new HashMap<>();
    for (ModelCategoryDto modelCategoryDto : modelCategoryDtoList) {
      if (modelCategoryName != null && !modelCategoryName.trim().isEmpty()) {
        if (!modelCategoryDto.getCategoryName().contains(modelCategoryName)) {
          continue;
        }
      }
      modelCategoryIds.add(modelCategoryDto.getCategoryId());
      modelCategoryDtoMap.put(modelCategoryDto.getCategoryId(), modelCategoryDto);
    }
    if (modelCategoryName != null && !modelCategoryName.trim().isEmpty() && modelCategoryIds.isEmpty()) {
      ExtDataAssetsDataFlowResDto result = new ExtDataAssetsDataFlowResDto();
      result.setCurrentPage(reqDto.getCurrentPage());
      result.setPageSize(reqDto.getPageSize());
      result.setTotalItems(0L);
      result.setContent(new ArrayList<>());
      return result;
    }
    String catalogNameL3 = reqDto.getL3Name();
    Set<Long> catalogIds3 = new HashSet<>();
    Map<Long, CommonCatalog> commonCatalogMap3 = new HashMap<>();
    List<CommonCatalog> commonCatalogList3 = extCommonCatalogRepository.findAllPublishedL3List();
    for (CommonCatalog commonCatalog : commonCatalogList3) {
      if (catalogNameL3 != null && !catalogNameL3.trim().isEmpty()) {
        if (!commonCatalog.getName().contains(catalogNameL3)) {
          continue;
        }
      }
      catalogIds3.add(commonCatalog.getId());
      commonCatalogMap3.put(commonCatalog.getId(), commonCatalog);
    }
    if (catalogNameL3 != null && !catalogNameL3.trim().isEmpty() && catalogIds3.isEmpty()) {
      ExtDataAssetsDataFlowResDto result = new ExtDataAssetsDataFlowResDto();
      result.setCurrentPage(reqDto.getCurrentPage());
      result.setPageSize(reqDto.getPageSize());
      result.setTotalItems(0L);
      result.setContent(new ArrayList<>());
      return result;
    }
    String catalogNameL4 = reqDto.getL4Name();
    Set<String> catalogCodes4 = new HashSet<>();
    Map<String, CommonCatalog> commonCatalogMap4 = new HashMap<>();
    List<CommonCatalog> commonCatalogList4 = extCommonCatalogRepository.findAllPublishedL4List();
    for (CommonCatalog commonCatalog : commonCatalogList4) {
      if (catalogNameL4 != null && !catalogNameL4.trim().isEmpty()) {
        if (!commonCatalog.getName().contains(catalogNameL4)) {
          continue;
        }
      }
      if (!catalogIds3.isEmpty()) {
        if (!catalogIds3.contains(commonCatalog.getParentId())) {
          continue;
        }
      }
      catalogCodes4.add(commonCatalog.getCode());
      commonCatalogMap4.put(commonCatalog.getCode(), commonCatalog);
    }
    if (catalogCodes4.isEmpty()) {
      ExtDataAssetsDataFlowResDto result = new ExtDataAssetsDataFlowResDto();
      result.setCurrentPage(reqDto.getCurrentPage());
      result.setPageSize(reqDto.getPageSize());
      result.setTotalItems(0L);
      result.setContent(new ArrayList<>());
      return result;
    }
    MultiConditionQueryUtils.MultiConditionQuery<ExtDataAssetsDataFlow> query = queryUtils.createQuery(ExtDataAssetsDataFlow.class);
    query.andIsIn("modelCategoryId", modelCategoryIds);
    query.andIsIn("l4Code", catalogCodes4);
    query.addOrder("l3Code",true);
    query.addOrder("l4Code",true);
    query.setPageInfo(reqDto.getCurrentPage(), reqDto.getPageSize());
    PageResult<ExtDataAssetsDataFlow> page = query.page();
    ExtDataAssetsDataFlowResDto result = new ExtDataAssetsDataFlowResDto();
    result.setCurrentPage(reqDto.getCurrentPage());
    result.setPageSize(reqDto.getPageSize());
    result.setTotalItems(page.getTotalItems());
    List<ExtDataAssetsDataFlow> extDataAssetsDataFlowList = page.getContent();
    List<ExtDataAssetsDataFlowDto> extDataAssetsDataFlowDtoList = new ArrayList<>();
    for (ExtDataAssetsDataFlow extDataAssetsDataFlow : extDataAssetsDataFlowList) {
      ExtDataAssetsDataFlowDto extDataAssetsDataFlowDto = new ExtDataAssetsDataFlowDto();
      Integer permissionsMask = extDataAssetsDataFlow.getDataFlowPermissions();
      String permissionsCrud = ExtDataAssetsDataFlowPermissions.maskToCrud(permissionsMask);
      extDataAssetsDataFlowDto.setDataFlowPermissions(permissionsCrud);
      CommonCatalog commonCatalog4 = commonCatalogMap4.get(extDataAssetsDataFlow.getL4Code());
      extDataAssetsDataFlowDto.setL4Name(commonCatalog4.getName());
      extDataAssetsDataFlowDto.setL4Code(commonCatalog4.getCode());
      
      // 构建完整层级路径
      String logicalEntityPath = buildLogicalEntityPath(commonCatalog4, commonCatalogMap3);
      extDataAssetsDataFlowDto.setL4FullPath(logicalEntityPath);
      
      CommonCatalog commonCatalog3 = commonCatalogMap3.get(commonCatalog4.getParentId());
      extDataAssetsDataFlowDto.setL3Name(commonCatalog3.getName());
      extDataAssetsDataFlowDto.setL3Code(commonCatalog3.getCode());
      ModelCategoryDto modelCategoryDto = modelCategoryDtoMap.get(extDataAssetsDataFlow.getModelCategoryId());
      if (modelCategoryDto != null) {
        extDataAssetsDataFlowDto.setModelCategoryName(modelCategoryDto.getCategoryName());
        // 没看到系统编码，先把系统简称当作编码
        extDataAssetsDataFlowDto.setModelCategoryCode(modelCategoryDto.getCategoryAbbreviation());
        extDataAssetsDataFlowDto.setModelCategoryId(extDataAssetsDataFlow.getModelCategoryId());
      } else {
        LOGGER.warn("ModelCategory is null by ID {}", extDataAssetsDataFlow.getModelCategoryId());
      }
      Boolean distributionSource = extDataAssetsDataFlow.getDistributionSource();
      extDataAssetsDataFlowDto.setDistributionSource(distributionSource);
      if (null != distributionSource) {
        extDataAssetsDataFlowDto.setDistributionSourceStr(distributionSource ? "是" : "否");
      }
      extDataAssetsDataFlowDtoList.add(extDataAssetsDataFlowDto);
    }
    result.setContent(extDataAssetsDataFlowDtoList);
    return result;
  }

  // 构建逻辑实体完整层级路径
  private String buildLogicalEntityPath(CommonCatalog l4Catalog, Map<Long, CommonCatalog> l3CatalogMap) {
    if (l4Catalog == null) {
      return "N/A";
    }
    
    // 获取L3（业务对象）
    CommonCatalog l3Catalog = l3CatalogMap.get(l4Catalog.getParentId());
    if (l3Catalog == null) {
      return l4Catalog.getName();
    }
    
    // 获取L2（主题域）
    CommonCatalog l2Catalog = null;
    try {
      l2Catalog = extCommonCatalogRepository.findById(l3Catalog.getParentId()).orElse(null);
    } catch (Exception e) {
      LOGGER.debug("Failed to load L2 catalog: {}", e.getMessage());
    }
    
    // 获取L1（业务域）
    CommonCatalog l1Catalog = null;
    if (l2Catalog != null) {
      try {
        l1Catalog = extCommonCatalogRepository.findById(l2Catalog.getParentId()).orElse(null);
      } catch (Exception e) {
        LOGGER.debug("Failed to load L1 catalog: {}", e.getMessage());
      }
    }
    
    // 构建路径
    StringBuilder pathBuilder = new StringBuilder();
    if (l1Catalog != null) {
      pathBuilder.append(l1Catalog.getName());
    }
    if (l2Catalog != null) {
      if (pathBuilder.length() > 0) pathBuilder.append(" / ");
      pathBuilder.append(l2Catalog.getName());
    }
    if (pathBuilder.length() > 0) pathBuilder.append(" / ");
    pathBuilder.append(l3Catalog.getName());
    pathBuilder.append(" / ");
    pathBuilder.append(l4Catalog.getName());
    
    return pathBuilder.toString();
  }

  public ExtDataAssetsDataFlowImportResult uploadDataFlow(String fileAbsolutePath) throws Exception {
    // 创建导入结果对象
    ExtDataAssetsDataFlowImportResult importResult = new ExtDataAssetsDataFlowImportResult();
    
    List<ModelCategoryDto> modelCategoryDtoList = modelCategoryService.getModelCategories();
    List<CommonCatalog> allPublishedL3List = extCommonCatalogRepository.findAllPublishedL3List();
    List<CommonCatalog> allPublishedL4List = extCommonCatalogRepository.findAllPublishedL4List();
    //List<String> allPublishedL3Name = allPublishedL3List.stream().map(CommonCatalog::getName).toList();
    //List<String> allPublishedL4Name = allPublishedL4List.stream().map(CommonCatalog::getName).toList();
    Map<String, CommonCatalog> allPublishedL3NameMap = allPublishedL3List.stream().collect(Collectors.toMap(CommonCatalog::getName, Function.identity()));
    Map<String, Long> allPublishedL3IdCodeMap = allPublishedL3List.stream().collect(Collectors.toMap(CommonCatalog::getCode, CommonCatalog::getId));
    Map<Long, List<CommonCatalog>>  allPublishedL4ByL3= allPublishedL4List.stream().collect(Collectors.groupingBy(CommonCatalog::getParentId));
    List<String> categoryNames = modelCategoryDtoList.stream().map(ModelCategoryDto::getCategoryName).toList();
    Map<String, ModelCategoryDto> modelCategoryNameMap = modelCategoryDtoList.stream().collect(Collectors.toMap(ModelCategoryDto::getCategoryName, Function.identity()));
    Map<String, ModelCategoryDto> modelCategoryDtoMap = new HashMap<>();
    for (ModelCategoryDto modelCategoryDto : modelCategoryDtoList) {
      modelCategoryDtoMap.put(modelCategoryDto.getCategoryName(), modelCategoryDto);
    }
    ExcelLoadJobResult<ExtDataAssetsDataFlowDto> extDataAssetsDashboardDtoExcelLoadJobResult = excelLoader.loadFile(fileAbsolutePath, 0, ExtDataAssetsDataFlowDto.class);
    List<ExtDataAssetsDataFlowDto> loaded = extDataAssetsDashboardDtoExcelLoadJobResult.getLoaded();
    
    // 设置总处理记录数
    importResult.setTotalCount(loaded.size());

      int currentRow = 1; // Excel行号，从1开始（不包括标题行）
      for (ExtDataAssetsDataFlowDto dto : loaded) {
        currentRow++;
        if (StringUtils.isBlank(dto.getModelCategoryName())){
            String reason = String.format("第%d行：系统名称'%s'为空", currentRow, dto.getModelCategoryName());
            importResult.addSkipReason(reason);
            LOGGER.warn("系统名称{}不能为空", dto.getModelCategoryName());
            continue;
        }

        if (StringUtils.isBlank(dto.getL3Name())){
            String reason = String.format("第%d行：业务对象名称'%s'为空", currentRow, dto.getL3Name());
            importResult.addSkipReason(reason);
            LOGGER.warn("业务对象名称{}不能为空", dto.getL3Name());
            continue;
        }

        if (StringUtils.isBlank(dto.getL4Name())){
            String reason = String.format("第%d行：逻辑实体名称'%s'为空", currentRow, dto.getL4Name());
            importResult.addSkipReason(reason);
            LOGGER.warn("逻辑实体名称{}不能为空", dto.getL4Name());
            continue;
        }

        if (!categoryNames.contains(dto.getModelCategoryName())){
            String reason = String.format("第%d行：系统名称'%s'不存在", currentRow, dto.getModelCategoryName());
            importResult.addSkipReason(reason);
            LOGGER.warn("系统名称{}不存在", dto.getModelCategoryName());
            continue;
        }

        if (!allPublishedL3NameMap.containsKey(dto.getL3Name())){
            String reason = String.format("第%d行：业务对象名称'%s'不存在", currentRow, dto.getL3Name());
            importResult.addSkipReason(reason);
            LOGGER.warn("业务对象名称{}不存在", dto.getL3Name());
            continue;
        }else {
            dto.setL3Code(allPublishedL3NameMap.get(dto.getL3Name()).getCode());
        }


        Long L3Id = allPublishedL3IdCodeMap.get(dto.getL3Code());
        String L4Code = "";
        if (allPublishedL4ByL3.containsKey(L3Id)){
            List<CommonCatalog> L4commonCatalogs = allPublishedL4ByL3.get(L3Id);
            Map<String, String> L4Map = L4commonCatalogs.stream().collect(Collectors.toMap(CommonCatalog::getName, CommonCatalog::getCode));
            if (!L4Map.containsKey(dto.getL4Name())){
                String reason = String.format("第%d行：逻辑实体名称'%s'不存在", currentRow, dto.getL4Name());
                importResult.addSkipReason(reason);
                LOGGER.warn("逻辑实体名称{}不存在", dto.getL4Name());
                continue;
            }else {
                L4Code = L4Map.get(dto.getL4Name());
                dto.setL4Code(L4Code);
            }
        }
        if (StringUtils.isNotBlank(dto.getModelCategoryName()) && modelCategoryNameMap.containsKey(dto.getModelCategoryName())){
          dto.setModelCategoryCode(modelCategoryNameMap.get(dto.getModelCategoryName()).getCategoryAbbreviation());
        }
    }
    
    // 检测权限转移模式
    List<DataFlowTransferPattern> transferPatterns = detectTransferPatterns(loaded, modelCategoryDtoMap);

    // 执行有效的权限转移
    Set<String> transferredEntities = new HashSet<>();
    for (DataFlowTransferPattern pattern : transferPatterns) {
      if (pattern.isValidTransfer()) {
        executeTransfer(pattern, importResult);
        transferredEntities.add(pattern.getL4Code());
        LOGGER.info("自动执行权限转移：逻辑实体{} 从{}转移至{}", 
          pattern.getL4Code(), 
          pattern.getFromSystem().getSystemCode(), 
          pattern.getToSystem().getSystemCode());
      } else {
        for (String error : pattern.getValidationErrors()) {
          importResult.addSkipReason("权限转移验证失败：" + error);
        }
      }
    }
    
    List<ExtDataAssetsDataFlow> result = new ArrayList<>();
    Map<String, Long> containsUL4Map = new HashMap<>();
    Map<String, Long> containsCL4Map = new HashMap<>();
    
    int currentRow1 = 1; // Excel行号，从1开始（不包括标题行）
    for (ExtDataAssetsDataFlowDto dto : loaded) {
      currentRow1++;
      String L4Code = dto.getL4Code();
      String L3Code = dto.getL3Code();

      // 跳过已经通过权限转移处理的实体
      if (transferredEntities.contains(L4Code)) {
        LOGGER.debug("跳过第{}行，该逻辑实体{}已通过权限转移处理", currentRow, L4Code);
        continue;
      }
      
      ExtDataAssetsDataFlow extDataAssetsDataFlow = new ExtDataAssetsDataFlow();
      extDataAssetsDataFlow.setL4Code(L4Code);
      extDataAssetsDataFlow.setL3Code(L3Code);
      String modelCategoryName = dto.getModelCategoryName();
      ModelCategoryDto modelCategoryDto = modelCategoryDtoMap.get(modelCategoryName);
      if (modelCategoryDto != null) {
        extDataAssetsDataFlow.setModelCategoryId(modelCategoryDto.getCategoryId());
      }
      /*else {
        String reason = String.format("第%d行：系统简称'%s'不存在", currentRow, modelCategoryCode);
        importResult.addSkipReason(reason);
        LOGGER.warn("Model category code {} not found", modelCategoryCode);
        continue;
      }*/
      String permissionsCrud = dto.getDataFlowPermissions();
      
      // 更合理的U权限与数据源关系处理逻辑
      Boolean distributionSource;
      if (permissionsCrud.contains("U")) {
        // 如果包含U权限，数据源字段有意义
        String distributionSourceStr = dto.getDistributionSourceStr();
        if (distributionSourceStr != null && distributionSourceStr.trim().equals("是")) {
          distributionSource = true;
        } else if (distributionSourceStr != null && distributionSourceStr.trim().equals("否")) {
          distributionSource = false;
        } else {
          // Excel中没有填写，错误数据
          //distributionSource = false;
          String reason = String.format("第%d行：逻辑实体'%s'包含数据权限U,《是否分发源头》列需必填", currentRow, dto.getL4Name());
          importResult.addSkipReason(reason);
          LOGGER.warn("逻辑实体{}包含数据权限U,《是否分发源头》列需必填", dto.getL4Name());
          continue;
        }
      } else {
        // 如果不包含U权限，数据源概念不适用，设为null
        distributionSource = null;
      }
      extDataAssetsDataFlow.setDistributionSource(distributionSource);



      // 同一个逻辑实体只能有一个C的
      if (permissionsCrud.contains("C")) {
        List<ExtDataAssetsDataFlow> byL4CodeList = extDataAssetsDataFlowRepository.findByL4CodeEquals(L4Code);
        for (ExtDataAssetsDataFlow byL4Code : byL4CodeList) {
          Integer permissionsInt = byL4Code.getDataFlowPermissions();
          String permissionsStr = ExtDataAssetsDataFlowPermissions.maskToCrud(permissionsInt);
          if (permissionsStr.contains("C") && !Objects.equals(byL4Code.getModelCategoryId(), extDataAssetsDataFlow.getModelCategoryId())) {
            String reason = String.format("第%d行：逻辑实体'%s'已存在C权限，同一实体只能有一个C权限", currentRow, dto.getL4Name());
            importResult.addSkipReason(reason);
            LOGGER.warn("同一个逻辑实体只能有一个C的");
            permissionsCrud = permissionsCrud.replace("C", "");
          }
        }
        if (permissionsCrud.contains("C")) {
          Long id = containsCL4Map.get(extDataAssetsDataFlow.getL4Code());
          if (id == null) {
            containsCL4Map.put(extDataAssetsDataFlow.getL4Code(), extDataAssetsDataFlow.getModelCategoryId());
          } else {
            String reason = String.format("第%d行：逻辑实体'%s'在当前导入文件中存在多个C权限，同一实体只能有一个C权限", currentRow, dto.getL4Name());
            importResult.addSkipReason(reason);
            permissionsCrud = permissionsCrud.replace("C", "");
          }
        }
      }
      
      // 校验：源U权限独占性 - 双向检查（导入时记录错误但继续处理其他数据）
      boolean currentIsSourceU = permissionsCrud.contains("U") && Boolean.TRUE.equals(distributionSource);
      boolean currentHasC = permissionsCrud.contains("C");
      
      if (currentHasC || currentIsSourceU) {
        // 检查当前导入文件内部冲突
        if (containsUL4Map.containsKey(dto.getL4Name()) && !containsUL4Map.get(dto.getL4Name()).equals(extDataAssetsDataFlow.getModelCategoryId())) {
          String reason = String.format("第%d行：逻辑实体'%s'在当前导入文件中已存在源U权限，不允许再定义C权限或源U权限", currentRow, dto.getL4Name());
          importResult.addSkipReason(reason);
          LOGGER.warn("导入跳过：该实体已存在源U权限: {}", dto.getL4Code());
          continue;
        }
        
        // 检查与数据库现有记录的冲突
        List<ExtDataAssetsDataFlow> byL4CodeList = extDataAssetsDataFlowRepository.findByL4CodeEquals(L4Code);
        boolean shouldSkip = false;
        String skipReason = null;
        
        for (ExtDataAssetsDataFlow byL4Code : byL4CodeList) {
          // 跳过当前系统自己的记录
          if (byL4Code.getModelCategoryId().equals(extDataAssetsDataFlow.getModelCategoryId())) {
            continue;
          }
          
          Integer permissionsInt = byL4Code.getDataFlowPermissions();
          String permissionsStr = ExtDataAssetsDataFlowPermissions.maskToCrud(permissionsInt);
          Boolean existingDistributionSource = byL4Code.getDistributionSource();
          boolean existingIsSourceU = permissionsStr.contains("U") && (existingDistributionSource != null && existingDistributionSource);
          boolean existingHasC = permissionsStr.contains("C");
          
          // 检查1：如果当前要创建C或源U权限，不能与现有源U权限冲突
          if ((currentHasC || currentIsSourceU) && existingIsSourceU) {
            skipReason = String.format("第%d行：逻辑实体'%s'已存在源U权限，不允许再定义C权限或源U权限", currentRow, dto.getL4Name());
            LOGGER.warn("导入跳过：实体'{}' 已存在源U权限，不允许再定义C或源U权限", dto.getL4Name());
            shouldSkip = true;
            break;
          }
          
          // 检查2：如果当前要创建源U权限，不能与现有C权限冲突
          if (currentIsSourceU && existingHasC) {
            skipReason = String.format("第%d行：逻辑实体'%s'已存在C权限，不允许再定义源U权限", currentRow, dto.getL4Name());
            LOGGER.warn("导入跳过：实体'{}' 已存在C权限，不允许再定义源U权限", dto.getL4Name());
            shouldSkip = true;
            break;
          }
        }
        
        if (shouldSkip) {
          importResult.addSkipReason(skipReason);
          continue;
        }
      }
      if (permissionsCrud.contains("U") && Boolean.TRUE.equals(distributionSource)) {
        containsUL4Map.put(dto.getL4Name(), extDataAssetsDataFlow.getModelCategoryId());
      }
      
      // 检查权限是否为空
      if (permissionsCrud.trim().isEmpty()) {
        String reason = String.format("第%d行：权限不能为空", currentRow);
        importResult.addSkipReason(reason);
        continue;
      }
      
      int permissionsMask = ExtDataAssetsDataFlowPermissions.crudToMask(permissionsCrud);
      extDataAssetsDataFlow.setDataFlowPermissions(permissionsMask);
      result.add(extDataAssetsDataFlow);
    }
    
    // 保存成功的记录
    extDataAssetsDataFlowRepository.saveAll(result);
    
    // 设置导入结果
    importResult.setSuccessCount(result.size());
    importResult.setSuccess(importResult.getSkipCount() == 0);
    
    return importResult;
  }

  public void createDataFlow(ExtDataAssetsDataFlowReqDto reqDto) {
    ExtDataAssetsDataFlow extDataAssetsDataFlow = new ExtDataAssetsDataFlow();
    extDataAssetsDataFlow.setL4Code(reqDto.getL4Code());
    extDataAssetsDataFlow.setModelCategoryId(reqDto.getModelCategoryId());
    CommonCatalog l4ByCode = extCommonCatalogRepository.findPublishedL4ByCode(reqDto.getL4Code());
    Optional<CommonCatalog> commonCatalog = extCommonCatalogRepository.findById(l4ByCode.getParentId());
    commonCatalog.ifPresent(catalog -> extDataAssetsDataFlow.setL3Code(catalog.getCode()));


    String permissionsCrud = reqDto.getDataFlowPermissions();
    
    // 更合理的U权限与数据源关系处理逻辑
    Boolean distributionSource = reqDto.getDistributionSource();
    if (permissionsCrud.contains("U")) {
      // 如果包含U权限，数据源字段有意义，使用用户设置的值
      // 如果用户没有设置，则默认为false
      if (distributionSource == null) {
        distributionSource = false;
      }
    } else {
      // 如果不包含U权限，数据源概念不适用，设为null
      distributionSource = null;
    }
    extDataAssetsDataFlow.setDistributionSource(distributionSource);
    
    // 校验：同一个逻辑实体只能有一个C权限
    if (permissionsCrud.contains("C")) {
      List<ExtDataAssetsDataFlow> byL4CodeList = extDataAssetsDataFlowRepository.findByL4CodeEquals(reqDto.getL4Code());
      for (ExtDataAssetsDataFlow byL4Code : byL4CodeList) {
        Integer permissionsInt = byL4Code.getDataFlowPermissions();
        String permissionsStr = ExtDataAssetsDataFlowPermissions.maskToCrud(permissionsInt);
        if (permissionsStr.contains("C") && !Objects.equals(byL4Code.getModelCategoryId(), extDataAssetsDataFlow.getModelCategoryId())) {
          ;
          throw new RuntimeException("同一个实体只允许同时存在一个c或者分发源头u");
        }
      }
    }
    
    // 校验：源U权限独占性 - 双向检查
    List<ExtDataAssetsDataFlow> byL4CodeList = extDataAssetsDataFlowRepository.findByL4CodeEquals(reqDto.getL4Code());
    boolean currentIsSourceU = permissionsCrud.contains("U") && distributionSource != null && distributionSource;
    boolean currentHasC = permissionsCrud.contains("C");
    
    for (ExtDataAssetsDataFlow byL4Code : byL4CodeList) {
      // 跳过当前系统自己的记录
      if (byL4Code.getModelCategoryId().equals(reqDto.getModelCategoryId())) {
        continue;
      }
      
      Boolean existingDistributionSource = byL4Code.getDistributionSource();
      Integer permissionsInt = byL4Code.getDataFlowPermissions();
      String permissionsStr = ExtDataAssetsDataFlowPermissions.maskToCrud(permissionsInt);
      boolean existingIsSourceU = permissionsStr.contains("U") && (existingDistributionSource != null && existingDistributionSource);
      boolean existingHasC = permissionsStr.contains("C");
      
      // 检查1：如果当前要创建C或源U权限，不能与现有源U权限冲突
      if ((currentHasC || currentIsSourceU) && existingIsSourceU) {
        LOGGER.warn("同一个实体只允许同时存在一个c或者分发源头u");
        throw new RuntimeException("同一个实体只允许同时存在一个c或者分发源头u");
      }
      
      // 检查2：如果当前要创建源U权限，不能与现有C权限冲突
      if (currentIsSourceU && existingHasC) {
        LOGGER.warn("同一个实体只允许同时存在一个c或者分发源头u");
        throw new RuntimeException("同一个实体只允许同时存在一个c或者分发源头u");
      }
    }
    
    // 校验权限字符串不能为空
    if (permissionsCrud == null || permissionsCrud.trim().isEmpty()) {
      LOGGER.warn("权限字符串为空，无法创建数据流权限");
      throw new RuntimeException("操作失败：权限不能为空，请至少选择一个数据权限");
    }
    
    int permissionsMask = ExtDataAssetsDataFlowPermissions.crudToMask(permissionsCrud);
    extDataAssetsDataFlow.setDataFlowPermissions(permissionsMask);
    extDataAssetsDataFlowRepository.save(extDataAssetsDataFlow);
  }

  @Transactional
  public void deleteDataFlow(List<ExtDataAssetsDataFlowId> extDataAssetsDataFlowIdList) {
    for (ExtDataAssetsDataFlowId extDataAssetsDataFlowId : extDataAssetsDataFlowIdList) {
      Long modelCategoryId = extDataAssetsDataFlowId.getModelCategoryId();
      String l4Code = extDataAssetsDataFlowId.getL4Code();
      extDataAssetsDataFlowRepository.deleteByModelCategoryIdAndL4CodeEquals(modelCategoryId, l4Code);
    }
  }

  public List<ExtDataAssetsCatalogDto> getCatalogs(Long parentId) {
    if (parentId == null) {
      return null;
    }
    List<ExtDataAssetsCatalogDto> catalogs = new ArrayList<>();
    extCommonCatalogRepository.findAllListByParentId(parentId).forEach(catalog -> {
      ExtDataAssetsCatalogDto catalogDto = new ExtDataAssetsCatalogDto();
      catalogDto.setCatalogId(catalog.getId());
      catalogDto.setCatalogName(catalog.getName());
      catalogDto.setCatalogCode(catalog.getCode());
      catalogDto.setCatalogLevel(catalog.getLevel());
      catalogs.add(catalogDto);
    });
    return catalogs;
  }

  public ExtDataAssetsCatalogDto getCatalogByCode(String code) {
    if (code == null || code.trim().isEmpty()) {
      return null;
    }
    CommonCatalog catalog = extCommonCatalogRepository.findPublishedL4ByCode(code);
    if (catalog == null) {
      return null;
    }
    ExtDataAssetsCatalogDto catalogDto = new ExtDataAssetsCatalogDto();
    catalogDto.setCatalogId(catalog.getId());
    catalogDto.setCatalogName(catalog.getName());
    catalogDto.setCatalogCode(catalog.getCode());
    catalogDto.setCatalogLevel(catalog.getLevel());
    catalogDto.setParentId(catalog.getParentId());
    return catalogDto;
  }

  public ExtDataAssetsCatalogDto getCatalogById(Long catalogId) {
    if (catalogId == null) {
      return null;
    }
    try {
      CommonCatalog catalog = extCommonCatalogRepository.findById(catalogId).orElse(null);
      if (catalog == null) {
        return null;
      }
      ExtDataAssetsCatalogDto catalogDto = new ExtDataAssetsCatalogDto();
      catalogDto.setCatalogId(catalog.getId());
      catalogDto.setCatalogName(catalog.getName());
      catalogDto.setCatalogCode(catalog.getCode());
      catalogDto.setCatalogLevel(catalog.getLevel());
      catalogDto.setParentId(catalog.getParentId());
      return catalogDto;
    } catch (Exception e) {
      LOGGER.error("Error finding catalog by id: {}", catalogId, e);
      return null;
    }
  }

  public List<ExtDataAssetsCatalogDto> searchLogicalEntities(String keyword) {
    if (keyword == null || keyword.trim().isEmpty()) {
      return new ArrayList<>();
    }
    
    List<ExtDataAssetsCatalogDto> result = new ArrayList<>();
    try {
      // 获取所有已发布的L4级目录（逻辑实体）
      List<CommonCatalog> l4Catalogs = extCommonCatalogRepository.findAllPublishedL4List();
      
      // 获取所有L3级目录（业务对象）用于构建路径
      List<CommonCatalog> l3Catalogs = extCommonCatalogRepository.findAllPublishedL3List();
      Map<Long, CommonCatalog> l3CatalogMap = new HashMap<>();
      for (CommonCatalog l3Catalog : l3Catalogs) {
        l3CatalogMap.put(l3Catalog.getId(), l3Catalog);
      }
      
      // 根据关键字过滤并构建返回结果
      String lowerKeyword = keyword.toLowerCase().trim();
      for (CommonCatalog l4Catalog : l4Catalogs) {
        if (l4Catalog.getName().toLowerCase().contains(lowerKeyword)
            // || l4Catalog.getCode().toLowerCase().contains(lowerKeyword)
        ) {
          
          ExtDataAssetsCatalogDto catalogDto = new ExtDataAssetsCatalogDto();
          catalogDto.setCatalogId(l4Catalog.getId());
          catalogDto.setCatalogName(l4Catalog.getName());
          catalogDto.setCatalogCode(l4Catalog.getCode());
          catalogDto.setCatalogLevel(l4Catalog.getLevel());
          catalogDto.setParentId(l4Catalog.getParentId());
          
          // 构建完整路径
          String fullPath = buildLogicalEntityPath(l4Catalog, l3CatalogMap);
          catalogDto.setFullPath(fullPath);
          
          result.add(catalogDto);
        }
      }
      
      // 限制返回结果数量，避免过多数据
      if (result.size() > 50) {
        result = result.subList(0, 50);
      }
      
    } catch (Exception e) {
      LOGGER.error("Error searching logical entities with keyword: {}", keyword, e);
    }
    
    return result;
  }

  public Map<Long,Map<String, List<DataFlowDto>>> getAllDiagrams() {
    List<Long> allModelCategoryId = extDataAssetsDataFlowRepository.findAllModelCategoryId();
    List<ModelCategoryDto> modelCategoryDtoList = modelCategoryService.getModelCategories();
    Map<Long, ModelCategoryDto> modelCategoryDtoMap = new HashMap<>();
    for (ModelCategoryDto modelCategoryDto : modelCategoryDtoList) {
      modelCategoryDtoMap.put(modelCategoryDto.getCategoryId(), modelCategoryDto);
    }
    Map<Long,Map<String, List<DataFlowDto>>> result = new HashMap<>();
    for (Long modelCategoryId : allModelCategoryId) {
      Map<String, List<DataFlowDto>> diagrams = this.getDiagrams(modelCategoryId);
      result.put(modelCategoryId,diagrams);
    }
    return result;
  }



  public Map<String, List<DataFlowDto>> getDiagrams(Long modelCategoryId) {
    Map<String, List<DataFlowDto>> result = new HashMap<>();
    result.put("left", new ArrayList<>());
    result.put("right", new ArrayList<>());
    
    List<ModelCategoryDto> modelCategoryDtoList = modelCategoryService.getModelCategories();
    Map<Long, ModelCategoryDto> modelCategoryDtoMap = new HashMap<>();
    for (ModelCategoryDto modelCategoryDto : modelCategoryDtoList) {
      modelCategoryDtoMap.put(modelCategoryDto.getCategoryId(), modelCategoryDto);
    }
    
    List<ExtDataAssetsDataFlow> extDataAssetsDataFlowList = extDataAssetsDataFlowRepository.findByModelCategoryIdEquals(modelCategoryId);
    
    // 查找上下游关系：基于观察系统的所有实体，分析其他系统的角色
    for (ExtDataAssetsDataFlow dataFlow : extDataAssetsDataFlowList) {
      List<ExtDataAssetsDataFlow> byL4CodeList = extDataAssetsDataFlowRepository.findByL4CodeEquals(dataFlow.getL4Code());

      String permissions = ExtDataAssetsDataFlowPermissions.maskToCrud(dataFlow.getDataFlowPermissions());
      boolean isUpstream = permissions.contains("C") ||
              (permissions.contains("U") && dataFlow.isDistributionSource());
      if (!isUpstream){
        //该系统在该实体没有c或者源U权限
        continue;
      }
      LOGGER.info("L4code:" + dataFlow.getL4Code());
      CommonCatalog publishedL4ByCode = extCommonCatalogRepository.findPublishedL4ByCode(dataFlow.getL4Code());
      CommonCatalog commonCatalog = null;
      if (null != publishedL4ByCode){
        commonCatalog = extCommonCatalogRepository.findById(publishedL4ByCode.getParentId()).get();
      }

      for (ExtDataAssetsDataFlow otherDataFlow : byL4CodeList) {
        if (otherDataFlow.getModelCategoryId().equals(modelCategoryId)) {
          continue;
        }
        
        String otherPermissions = ExtDataAssetsDataFlowPermissions.maskToCrud(otherDataFlow.getDataFlowPermissions());
        Long otherModelCategoryId = otherDataFlow.getModelCategoryId();
        
        // 判断其他系统在该实体上的角色
        boolean otherIsUpstream = otherPermissions.contains("C") || 
                                 (otherPermissions.contains("U") && otherDataFlow.isDistributionSource());
        
        ModelCategoryDto otherCategory = modelCategoryDtoMap.get(otherModelCategoryId);

        DataFlowDto dataFlowDto = new DataFlowDto();
        dataFlowDto.setModelCategoryDto(otherCategory);
        if (null != commonCatalog){
          dataFlowDto.setL3Name(commonCatalog.getName());
        }
        dataFlowDto.setCategoryId(otherCategory.getCategoryId());
        dataFlowDto.setCategoryName(otherCategory.getCategoryName());
        dataFlowDto.setCategoryAbbreviation(otherCategory.getCategoryAbbreviation());
        dataFlowDto.setDescription(otherCategory.getDescription());

        if (dataFlowDto != null) {
          // 如果其他系统是上游 → 放入left（上游）
          if (otherIsUpstream && !result.get("left").contains(dataFlowDto)) {
            result.get("left").add(dataFlowDto);
          }
          
          // 如果其他系统是下游 → 放入right（下游）
          if (!otherIsUpstream && !result.get("right").contains(dataFlowDto)) {
            result.get("right").add(dataFlowDto);
          }
        }
      }
    }
    
    return result;
  }

  /**
   * 检测权限转移模式
   */
  private List<DataFlowTransferPattern> detectTransferPatterns(List<ExtDataAssetsDataFlowDto> importData, 
                                                               Map<String, ModelCategoryDto> modelCategoryDtoMap) {
    List<DataFlowTransferPattern> transferPatterns = new ArrayList<>();
    Map<String, List<ExtDataAssetsDataFlowDto>> entityGroupMap = new HashMap<>();
    
    // 按逻辑实体code分组
    for (ExtDataAssetsDataFlowDto dto : importData) {
      entityGroupMap.computeIfAbsent(dto.getL4Code(), k -> new ArrayList<>()).add(dto);
    }
    
    // 对每个逻辑实体检测权限转移模式
    for (Map.Entry<String, List<ExtDataAssetsDataFlowDto>> entry : entityGroupMap.entrySet()) {
      String l4Code = entry.getKey();
      List<ExtDataAssetsDataFlowDto> entityImports = entry.getValue();
      
      // 查询该实体的现有权限
      List<ExtDataAssetsDataFlow> existingRecords = extDataAssetsDataFlowRepository.findByL4CodeEquals(l4Code);
      Map<String, ExtDataAssetsDataFlow> existingMap = new HashMap<>();
      for (ExtDataAssetsDataFlow record : existingRecords) {
        ModelCategoryDto categoryDto = modelCategoryDtoMap.values().stream()
          .filter(cat -> cat.getCategoryId().equals(record.getModelCategoryId()))
          .findFirst().orElse(null);
        if (categoryDto != null) {
          existingMap.put(categoryDto.getCategoryName(), record);
        }
      }
      
      // 检测权限转移模式
      DataFlowTransferPattern.TransferSystemInfo fromSystem = null;
      DataFlowTransferPattern.TransferSystemInfo toSystem = null;
      
      for (ExtDataAssetsDataFlowDto importDto : entityImports) {
        ExtDataAssetsDataFlow existing = existingMap.get(importDto.getModelCategoryName());
        
        // 构建转移信息
        DataFlowTransferPattern.TransferSystemInfo systemInfo = new DataFlowTransferPattern.TransferSystemInfo();
        systemInfo.setSystemCode(importDto.getModelCategoryName());
        ModelCategoryDto modelCategoryDto = modelCategoryDtoMap.get(importDto.getModelCategoryName());
        if (modelCategoryDto != null) {
          systemInfo.setModelCategoryId(modelCategoryDto.getCategoryId());
        }
        systemInfo.setNewPermissions(importDto.getDataFlowPermissions());
        
        // 解析新的分发源头设置
        Boolean newDistributionSource = null;
        if (importDto.getDataFlowPermissions().contains("U")) {
          String distributionSourceStr = importDto.getDistributionSourceStr();
          if (distributionSourceStr != null && distributionSourceStr.trim().equals("是")) {
            newDistributionSource = true;
          } else if (distributionSourceStr != null && distributionSourceStr.trim().equals("否")) {
            newDistributionSource = false;
          } else {
            newDistributionSource = false; // 默认为false
          }
        }
        systemInfo.setNewDistributionSource(newDistributionSource);
        
        // 设置现有权限信息
        if (existing != null) {
          systemInfo.setOldPermissions(ExtDataAssetsDataFlowPermissions.maskToCrud(existing.getDataFlowPermissions()));
          systemInfo.setOldDistributionSource(existing.getDistributionSource());
        }
        
        // 判断是失去还是获得源U权限
        if (systemInfo.isLosingSourceU()) {
          fromSystem = systemInfo;
        } else if (systemInfo.isGainingSourceU()) {
          toSystem = systemInfo;
        }
        
        // 检测C权限转移模式
        if (systemInfo.isLosingC()) {
          fromSystem = systemInfo;
        } else if (systemInfo.isGainingC()) {
          toSystem = systemInfo;
        }
      }
      
      // 如果检测到完整的转移模式，创建转移对象
      if (fromSystem != null && toSystem != null) {
        DataFlowTransferPattern pattern = new DataFlowTransferPattern();
        pattern.setL4Code(l4Code);
        pattern.setFromSystem(fromSystem);
        pattern.setToSystem(toSystem);
        
        // 验证转移的合理性
        validateTransferPattern(pattern, existingRecords);
        transferPatterns.add(pattern);
      }
    }
    
    return transferPatterns;
  }
  
  /**
   * 验证权限转移模式的合理性
   */
  private void validateTransferPattern(DataFlowTransferPattern pattern, List<ExtDataAssetsDataFlow> existingRecords) {
    pattern.setValidTransfer(true);
    
    // 验证1：确保源系统确实拥有要转移的权限
    boolean isSourceUTransfer = pattern.getFromSystem().isLosingSourceU() && pattern.getToSystem().isGainingSourceU();
    boolean isCTransfer = pattern.getFromSystem().isLosingC() && pattern.getToSystem().isGainingC();
    
    if (isSourceUTransfer) {
      boolean fromSystemHasSourceU = existingRecords.stream()
        .anyMatch(record -> record.getModelCategoryId().equals(pattern.getFromSystem().getModelCategoryId()) &&
                  ExtDataAssetsDataFlowPermissions.maskToCrud(record.getDataFlowPermissions()).contains("U") &&
                  record.getDistributionSource() != null && record.getDistributionSource());
      
      if (!fromSystemHasSourceU) {
        pattern.addValidationError("源系统" + pattern.getFromSystem().getSystemCode() + "当前不拥有源U权限");
        pattern.setValidTransfer(false);
      }
    } else if (isCTransfer) {
      boolean fromSystemHasC = existingRecords.stream()
        .anyMatch(record -> record.getModelCategoryId().equals(pattern.getFromSystem().getModelCategoryId()) &&
                  ExtDataAssetsDataFlowPermissions.maskToCrud(record.getDataFlowPermissions()).contains("C"));
      
      if (!fromSystemHasC) {
        pattern.addValidationError("源系统" + pattern.getFromSystem().getSystemCode() + "当前不拥有C权限");
        pattern.setValidTransfer(false);
      }
    }
    
    // 验证2：确保目标系统不会导致权限冲突
    if (isSourceUTransfer) {
      // 源U权限转移：目标系统不能已经拥有C权限
      boolean toSystemHasC = existingRecords.stream()
        .anyMatch(record -> record.getModelCategoryId().equals(pattern.getToSystem().getModelCategoryId()) &&
                  ExtDataAssetsDataFlowPermissions.maskToCrud(record.getDataFlowPermissions()).contains("C"));
      
      if (toSystemHasC) {
        pattern.addValidationError("目标系统" + pattern.getToSystem().getSystemCode() + "已拥有C权限，不能再获得源U权限");
        pattern.setValidTransfer(false);
      }
    } else if (isCTransfer) {
      // C权限转移：目标系统不能已经拥有源U权限
      boolean toSystemHasSourceU = existingRecords.stream()
        .anyMatch(record -> record.getModelCategoryId().equals(pattern.getToSystem().getModelCategoryId()) &&
                  ExtDataAssetsDataFlowPermissions.maskToCrud(record.getDataFlowPermissions()).contains("U") &&
                  record.getDistributionSource() != null && record.getDistributionSource());
      
      if (toSystemHasSourceU) {
        pattern.addValidationError("目标系统" + pattern.getToSystem().getSystemCode() + "已拥有源U权限，不能再获得C权限");
        pattern.setValidTransfer(false);
      }
    }
    
    // 验证3：确保只有一个系统拥有要转移的权限
    if (isSourceUTransfer) {
      long sourceUCount = existingRecords.stream()
        .mapToLong(record -> ExtDataAssetsDataFlowPermissions.maskToCrud(record.getDataFlowPermissions()).contains("U") &&
                            record.getDistributionSource() != null && record.getDistributionSource() ? 1 : 0)
        .sum();
      
      if (sourceUCount > 1) {
        pattern.addValidationError("该逻辑实体存在多个源U权限，无法进行自动转移");
        pattern.setValidTransfer(false);
      }
    } else if (isCTransfer) {
      long cCount = existingRecords.stream()
        .mapToLong(record -> ExtDataAssetsDataFlowPermissions.maskToCrud(record.getDataFlowPermissions()).contains("C") ? 1 : 0)
        .sum();
      
      if (cCount > 1) {
        pattern.addValidationError("该逻辑实体存在多个C权限，无法进行自动转移");
        pattern.setValidTransfer(false);
      }
    }
  }
  
  /**
   * 执行权限转移
   */
  private void executeTransfer(DataFlowTransferPattern pattern, ExtDataAssetsDataFlowImportResult importResult) {
    try {
      // 步骤1：先给目标系统添加源U权限
      ExtDataAssetsDataFlow newRecord = new ExtDataAssetsDataFlow();
      newRecord.setL4Code(pattern.getL4Code());
      newRecord.setModelCategoryId(pattern.getToSystem().getModelCategoryId());
      newRecord.setDataFlowPermissions(ExtDataAssetsDataFlowPermissions.crudToMask(pattern.getToSystem().getNewPermissions()));
      newRecord.setDistributionSource(pattern.getToSystem().getNewDistributionSource());
      
      extDataAssetsDataFlowRepository.save(newRecord);
      
      // 步骤2：更新源系统的权限（移除源U权限）
      ExtDataAssetsDataFlow existingRecord = extDataAssetsDataFlowRepository.findByModelCategoryIdAndL4Code(
        pattern.getFromSystem().getModelCategoryId(), pattern.getL4Code());
      if (existingRecord != null) {
        existingRecord.setDataFlowPermissions(ExtDataAssetsDataFlowPermissions.crudToMask(pattern.getFromSystem().getNewPermissions()));
        existingRecord.setDistributionSource(pattern.getFromSystem().getNewDistributionSource());
        extDataAssetsDataFlowRepository.save(existingRecord);
      }
      
      // 确定转移类型用于日志记录
      String transferType = pattern.getFromSystem().isLosingSourceU() ? "源U权限" : "C权限";
      importResult.addSkipReason(String.format("自动执行权限转移：%s(%s→%s) %s转移至 %s(%s)", 
        pattern.getFromSystem().getSystemCode(), 
        pattern.getFromSystem().getOldPermissions(),
        pattern.getFromSystem().getNewPermissions(),
        transferType,
        pattern.getToSystem().getSystemCode(),
        pattern.getToSystem().getNewPermissions()));
        
    } catch (Exception e) {
      LOGGER.error("执行权限转移失败: " + pattern.getL4Code(), e);
      importResult.addSkipReason("权限转移执行失败: " + e.getMessage());
    }
  }

  public List<ExtDataAssetsDataFlowDiagramsLineResDto> getLineDetails(ExtDataAssetsDataFlowDiagramsLineReqDto reqDto) {
    List<ExtDataAssetsDataFlowDiagramsLineResDto> result = new ArrayList<>();
    ModelCategoryDto modelCategory = modelCategoryService.getModelCategory(reqDto.getModelCategoryId());
    ModelCategoryDto modelCategoryOther = modelCategoryService.getModelCategory(reqDto.getModelCategoryIdOther());
    List<ExtDataAssetsDataFlow> extDataAssetsDataFlowList = extDataAssetsDataFlowRepository.findByModelCategoryIdEquals(reqDto.getModelCategoryId());
    List<ExtDataAssetsDataFlow> otherExtDataAssetsDataFlowList = extDataAssetsDataFlowRepository.findByModelCategoryIdEquals(reqDto.getModelCategoryIdOther());
    Boolean flag = reqDto.getFlag();
    
//    if (flag) {
      // 求解上游线条（other → current）
      for (ExtDataAssetsDataFlow currentDataFlow : extDataAssetsDataFlowList) {
        String currentPermissions = ExtDataAssetsDataFlowPermissions.maskToCrud(currentDataFlow.getDataFlowPermissions());
        
        // 当前系统必须是下游（不拥有C权限且不拥有源U权限）
        boolean currentIsDownstream = !currentPermissions.contains("C") && 
                                    !(currentPermissions.contains("U") && currentDataFlow.isDistributionSource());
        
        if (currentIsDownstream) {
          // 查找同一逻辑实体中其他系统的记录
          for (ExtDataAssetsDataFlow otherDataFlow : otherExtDataAssetsDataFlowList) {
            if (!otherDataFlow.getL4Code().equals(currentDataFlow.getL4Code())) {
              continue;
            }
            
            String otherPermissions = ExtDataAssetsDataFlowPermissions.maskToCrud(otherDataFlow.getDataFlowPermissions());
            
            // 其他系统必须是上游（拥有C权限或源U权限）
            boolean otherIsUpstream = otherPermissions.contains("C") || 
                                    (otherPermissions.contains("U") && otherDataFlow.isDistributionSource());
            
            if (otherIsUpstream) {
              ExtDataAssetsDataFlowDiagramsLineResDto dto = new ExtDataAssetsDataFlowDiagramsLineResDto();
              if (modelCategoryOther != null) {
                dto.setModelCategoryNameLeft(modelCategoryOther.getCategoryName());
              }
              dto.setPermissionsCrudLeft(otherPermissions);
              dto.setPermissionsCrudRight(currentPermissions);
              if (modelCategory != null) {
                dto.setModelCategoryNameRight(modelCategory.getCategoryName());
              }
              CommonCatalog publishedL4ByCode = extCommonCatalogRepository.findPublishedL4ByCode(currentDataFlow.getL4Code());
              if (publishedL4ByCode != null) {
                CommonCatalog commonCatalog = extCommonCatalogRepository.findById(publishedL4ByCode.getParentId()).get();
                dto.setL3Name(commonCatalog.getName());
                dto.setL4Name(publishedL4ByCode.getName());
              } else {
                dto.setL3Name("");
                dto.setL4Name(currentDataFlow.getL4Code());
              }
              result.add(dto);
            }
          }
        }
      }
//    }
//    else {
      // 求解下游线条（current → other）
      for (ExtDataAssetsDataFlow currentDataFlow : extDataAssetsDataFlowList) {
        String currentPermissions = ExtDataAssetsDataFlowPermissions.maskToCrud(currentDataFlow.getDataFlowPermissions());
        
        // 当前系统必须是上游（拥有C权限或源U权限）
        boolean currentIsUpstream = currentPermissions.contains("C") || 
                                  (currentPermissions.contains("U") && currentDataFlow.isDistributionSource());
        
        if (currentIsUpstream) {
          // 查找同一逻辑实体中其他系统的记录
          for (ExtDataAssetsDataFlow otherDataFlow : otherExtDataAssetsDataFlowList) {
            if (!otherDataFlow.getL4Code().equals(currentDataFlow.getL4Code())) {
              continue;
            }
            
            String otherPermissions = ExtDataAssetsDataFlowPermissions.maskToCrud(otherDataFlow.getDataFlowPermissions());
            
            // 其他系统必须是下游（不拥有C权限且不拥有源U权限）
            boolean otherIsDownstream = !otherPermissions.contains("C") && 
                                      !(otherPermissions.contains("U") && otherDataFlow.isDistributionSource());
            
            if (otherIsDownstream) {
              ExtDataAssetsDataFlowDiagramsLineResDto dto = new ExtDataAssetsDataFlowDiagramsLineResDto();
              if (modelCategory != null) {
                dto.setModelCategoryNameLeft(modelCategory.getCategoryName());
              }
              dto.setPermissionsCrudLeft(currentPermissions);
              dto.setPermissionsCrudRight(otherPermissions);
              if (modelCategoryOther != null) {
                dto.setModelCategoryNameRight(modelCategoryOther.getCategoryName());
              }
              CommonCatalog publishedL4ByCode = extCommonCatalogRepository.findPublishedL4ByCode(currentDataFlow.getL4Code());
              if (publishedL4ByCode != null) {
                CommonCatalog commonCatalog = extCommonCatalogRepository.findById(publishedL4ByCode.getParentId()).get();
                dto.setL3Name(commonCatalog.getName());
                dto.setL4Name(publishedL4ByCode.getName());
              } else {
                dto.setL3Name("");
                dto.setL4Name(currentDataFlow.getL4Code());
              }
              result.add(dto);
            }
          }
        }
      }
//    }
    return result;
  }

  public ResponseEntity<byte[]> exportDataFlow(ExtDataAssetsDataFlowReqDto reqDto) throws Exception {
    if (reqDto.getPageSize() == null){
      reqDto.setCurrentPage(1);
      reqDto.setPageSize(10000);
    }
    List<ExtDataAssetsDataFlowDto> contents = this.getPage(reqDto).getContent();

    File exportExcel = excelExporter.exportExcel(ExtDataAssetsDataFlowDto.class, contents, "数据流管理", 0, "数据流管理.xlsx");
    return this.generalResponseEntityByFile(exportExcel);
  }

  public ResponseEntity<byte[]> generalResponseEntityByFile(File file) {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
    String realName = file.getName();

    try {
      realName = URLEncoder.encode(realName, "UTF-8");
      realName = realName.replace("+", "%20");
    } catch (Exception var12) {
      LOGGER.warn("Failed to convert template file name");
    }

    headers.setContentDispositionFormData("attachment", realName);
    ResponseEntity<byte[]> result = null;

    try {
      result = new ResponseEntity(FileUtils.readFileToByteArray(file), headers, HttpStatus.OK);
    } catch (Exception var10) {
      Exception e = var10;
      throw new AndorjRuntimeException(e.getLocalizedMessage());
    } finally {
      file.delete();
    }

    return result;
  }

}
