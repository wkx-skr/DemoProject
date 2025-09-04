package com.datablau.base.server.service.impl;


import com.andorj.common.core.data.CommonSystem;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.model.common.dto.ExcelLoadJobResult;
import com.datablau.base.api.ModelCategoryService70;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.base.data.ModelCategoryExcelDto;
import com.datablau.base.mq.message.CreateModelCategoryDto;
import com.datablau.base.server.dto.ModelCategoryExcelExtDto;
import com.datablau.base.server.dto.ModelCategoryExtDto;
import com.datablau.base.server.dto.ModelCategoryParamExtDto;
import com.datablau.base.server.dto.ModelCategoryTreeNodeDto;
import com.datablau.base.server.impl.ModelCategoryServiceImpl;
import com.datablau.base.server.jpa.entity.DatasourceEntity;
import com.datablau.base.server.jpa.entity.ModelCategory;
import com.datablau.base.server.jpa.entity.ModelCategoryFolder;
import com.datablau.base.server.jpa.repository.ModelCategoryFolderRepository;
import com.datablau.base.server.service.ModelCategoryServiceExt;
import com.datablau.data.common.udp.MetadataUdpEntry;
import com.datablau.security.management.dto.OrganizationDto;
import com.datablau.security.management.dto.OrganizationEntityDto;
import com.datablau.security.management.dto.SimpleUserDto;
import com.datablau.security.management.dto.UserDto;
import com.datablau.security.management.utils.AuthTools;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.io.File;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;


@Service("modelCategoryServiceExt")
public class ModelCategoryServiceImplExt extends ModelCategoryServiceImpl {
    private static final Logger logger = LoggerFactory.getLogger(ModelCategoryServiceImplExt.class);

    @Autowired
    private ModelCategoryFolderRepository modelCategoryFolderRepository;


    @Override
    @Transactional
    public int uploadModelCategories(String path, String appName) throws Exception {
        // 1. 加载Excel数据
        ExcelLoadJobResult<ModelCategoryExcelDto> result = this.excelLoader.loadFile(path, 0, ModelCategoryExcelDto.class);
        List<ModelCategoryExcelDto> loadCategories = result.getLoaded();
        Map<String, ModelCategory> categoryMap = new HashMap<>();
        Map<String, String> categoryNameMap = new HashMap<>();

        // 2. 转换Excel数据到ModelCategory对象
        for (ModelCategoryExcelDto categoryDto : loadCategories) {
            ModelCategory category = new ModelCategory();
            BeanUtils.copyProperties(categoryDto, category);
            String[] split = categoryDto.getCategoryName().split("/");
            if (split.length == 1) {
                categoryMap.put(category.getCategoryName(), category);
            } else if (split.length == 2) {
                category.setCategoryName(split[1]);
                categoryMap.put(split[1], category);
                categoryNameMap.put(split[1], split[0]);
            } else {
                throw new InvalidArgumentException("只允许导入两层应用系统");
            }
        }

        // 3. 更新已存在分类的ID
        Map<String, ModelCategory> allCategoryMap = this.dataModelCategoryRepo.findAllModelCategories()
                .stream()
                .collect(Collectors.toMap(ModelCategory::getCategoryName, Function.identity()));
        categoryMap.values().forEach(category -> {
            ModelCategory existing = allCategoryMap.get(category.getCategoryName());
            if (existing != null) {
                category.setCategoryId(existing.getCategoryId());
            }
        });

        // 4. 预加载校验数据
        List<ModelCategory> values = new ArrayList<>(categoryMap.values());
        List<String> newAbbrs = values.stream()
                .map(ModelCategory::getCategoryAbbreviation)
                .collect(Collectors.toList());

        // 批量查询优化
        Set<String> existingAbbrs = this.dataModelCategoryRepo.findModelCategoriesByCategoryAbbreviationIn(newAbbrs)
                .stream()
                .map(ModelCategory::getCategoryAbbreviation)
                .collect(Collectors.toSet());

        Set<String> existingNamesAsAbbr = this.dataModelCategoryRepo.findModelCategoriesByCategoryNameIn(newAbbrs)
                .stream()
                .map(ModelCategory::getCategoryName)
                .collect(Collectors.toSet());

        // 批量获取用户和组织信息
        Set<String> owners = values.stream()
                .map(ModelCategory::getOwner)
                .filter(StringUtils::isNotBlank)
                .collect(Collectors.toSet());
        Map<String, SimpleUserDto> ownerMap = this.getUserService().getUsersByUsernames(owners)
                .stream()
                .collect(Collectors.toMap(SimpleUserDto::getUsername, Function.identity()));



        List<String> bms = this.getOrganizationService().findAllOrganizationBms();

        // 5. 完整校验逻辑
        Set<String> localAbbrSet = new HashSet<>(values.size());
        for (ModelCategory category : values) {
            String abbr = category.getCategoryAbbreviation();
            String categoryName = category.getCategoryName();

            // 缩写校验
            if (existingAbbrs.contains(abbr)) {
                throw new InvalidArgumentException(this.msgService.getMessage("duplicateSysNameAndAbbreviation",
                        new Object[]{categoryName, abbr}));
            }
            if (!localAbbrSet.add(abbr)) {
                throw new InvalidArgumentException(this.msgService.getMessage("duplicateSysAbbreviation"));
            }
            if (existingNamesAsAbbr.contains(abbr)) {
                throw new InvalidArgumentException(this.msgService.getMessage("duplicateSysAbbreviation",
                        new Object[]{categoryName}));
            }

            // 必填字段校验
            if (category.getCategoryName() == null) {
                throw new IllegalArgumentException(this.msgService.getMessage("sysNameNotNull"));
            }
            if (category.getCategoryAbbreviation() == null) {
                throw new IllegalArgumentException(this.msgService.getMessage("sysSimpleNameNotNull"));
            }

            // 负责人校验
            if (StringUtils.isBlank(category.getOwner())) {
                throw new IllegalArgumentException(this.msgService.getMessage("ownerNotNull"));
            }
            if (!ownerMap.containsKey(category.getOwner())) {
                throw new IllegalArgumentException(this.msgService.getMessage("ownerNotFound",
                        new Object[]{category.getOwner()}));
            }

            // 部门校验
            OrganizationDto itOrg = this.getOrganizationService().findOrganizationByPath(category.getItDepartment());
            //OrganizationDto itOrg = orgMap.get(category.getItDepartment());
            if (itOrg == null) {
                throw new InvalidArgumentException(this.msgService.getMessage("sysDeptNameNotExists",
                        new Object[]{category.getItDepartment()}));
            }
            //OrganizationDto bizOrg = orgMap.get(category.getBusinessDepartment());
            OrganizationDto bizOrg = this.getOrganizationService().findOrganizationByPath(category.getBusinessDepartment());

            if (bizOrg == null) {
                throw new InvalidArgumentException(this.msgService.getMessage("sysDeptNameNotExists",
                        new Object[]{category.getBusinessDepartment()}));
            }

            // BM校验
            String itBm = itOrg.getBm();
            String bizBm = bizOrg.getBm();
            category.setItDepartment(itBm);
            category.setBusinessDepartment(bizBm);

            if (!bms.contains(itBm)) {
                throw new InvalidArgumentException(this.msgService.getMessage("sysDeptBmNotExists",
                        new Object[]{itBm}));
            }
            if (!bms.contains(bizBm)) {
                throw new InvalidArgumentException(this.msgService.getMessage("sysDeptBmNotExists",
                        new Object[]{bizBm}));
            }
        }

        // 6. 保存分类数据
        List<ModelCategory> savedCategories = StreamSupport.stream(this.dataModelCategoryRepo.saveAll(values).spliterator(), false)
                .collect(Collectors.toList());
        // 7. 目录处理
        Map<String, ModelCategoryFolder> categoryFolderMap = modelCategoryFolderRepository.findAll()
                .stream()
                .collect(Collectors.toMap(ModelCategoryFolder::getName, Function.identity()));

        // 第一阶段：处理第一层目录
        List<ModelCategoryFolder> firstLevelFolders = new ArrayList<>();
        for (ModelCategory category : savedCategories) {
            String categoryName = category.getCategoryName();
            if (!categoryNameMap.containsKey(categoryName)) { // 第一层目录
                if (!categoryFolderMap.containsKey(categoryName)) {
                    ModelCategoryFolder folder = new ModelCategoryFolder(
                            categoryName,
                            category.getCategoryId(),
                            0L
                    );
                    firstLevelFolders.add(folder);
                }
            }
        }
        if (!firstLevelFolders.isEmpty()) {
            List<ModelCategoryFolder> savedFolders =
            StreamSupport.stream(modelCategoryFolderRepository.saveAll(firstLevelFolders).spliterator(), false)
                    .collect(Collectors.toList());;
            savedFolders.forEach(f -> categoryFolderMap.put(f.getName(), f));
        }

        // 第二阶段：处理第二层目录
        List<ModelCategoryFolder> secondLevelFolders = new ArrayList<>();
        for (ModelCategory category : savedCategories) {
            String categoryName = category.getCategoryName();
            if (categoryNameMap.containsKey(categoryName)) { // 第二层目录
                String parentName = categoryNameMap.get(categoryName);
                ModelCategoryFolder parentFolder = categoryFolderMap.get(parentName);

                if (parentFolder == null) {
                    throw new IllegalArgumentException("请先插入父系统：" + parentName);
                }

                if (!categoryFolderMap.containsKey(categoryName)) {
                    ModelCategoryFolder folder = new ModelCategoryFolder(
                            categoryName,
                            category.getCategoryId(),
                            parentFolder.getFolderId()
                    );
                    secondLevelFolders.add(folder);
                }
            }
        }
        if (!secondLevelFolders.isEmpty()) {
            modelCategoryFolderRepository.saveAll(secondLevelFolders);
        }


        // 9. 创建权限组
        List<ModelCategoryDto> resultList = this.convertModelCategoryToDtoList(savedCategories, false);
        this.permissionHelper.createGroupsForModelCategories(resultList, appName);

        // 10. 添加当前用户权限
        String currentUser = AuthTools.currentUsername();
        Set<Long> categoryIdSet = resultList.stream()
                .filter(dto -> !Objects.equals(currentUser, dto.getOwner()))
                .map(ModelCategoryDto::getCategoryId)
                .collect(Collectors.toSet());
        this.permissionHelper.addUserToModelCategories(currentUser, categoryIdSet, appName);

        // 11. 添加超级用户权限
        Set<Long> allCategoryIds = resultList.stream()
                .map(ModelCategoryDto::getCategoryId)
                .collect(Collectors.toSet());
        this.permissionHelper.addAllSuperusersToModelCategories(allCategoryIds, appName);

        // 12. 导入UDP值
        List<Map<String, String>> udpMaps = this.importUdpValues(path);
        List<Long> sortedIds = savedCategories.stream()
                .map(ModelCategory::getCategoryId)
                .collect(Collectors.toList());
        this.udpService.importUdpValues(sortedIds, udpMaps);

        // 13. 发送Kafka消息
        List<CommonSystem> kafkaData = savedCategories.stream()
                .map(this::convertTo)
                .collect(Collectors.toList());
        this.kafkaService.sendMessage("topic.base.application.edit", new CreateModelCategoryDto(kafkaData));

        return resultList.size();
    }

    @Override
    public ResponseEntity<byte[]> exportModelCategories(List<Long> categoryIds) throws Exception {
        List<ModelCategoryDto> modelCategories;
        if (CollectionUtils.isEmpty(categoryIds)) {
            modelCategories = this.getModelCategories();
        } else {
            modelCategories = this.getModelCategoriesByIds(categoryIds);
        }

        List<String> items = modelCategories.stream().map(ModelCategoryDto::getItemIds).collect(Collectors.toList());
        Map<String, List<MetadataUdpEntry>> udpValuesByItemIds = this.udpService.getListUdpValuesByItemIds(items, 80000000L);
        Map<String, Long> udpDict = this.udpService.getUdpKeyMapValByTypeId(80000000L);
        Map<Long, String> udpkv = udpDict == null ? new HashMap<>() : udpDict.entrySet().stream().collect(Collectors.toMap(Map.Entry::getValue, Map.Entry::getKey));
        List<Long> categoryId = modelCategories.stream().map(ModelCategoryDto::getCategoryId).collect(Collectors.toList());
        List<DatasourceEntity> datasourceEntities = this.datasourceRepository.findByCategoryIdIn(categoryId);
        Map<Long, List<DatasourceEntity>> datasourceEntityMap = datasourceEntities.stream().collect(Collectors.groupingBy(DatasourceEntity::getCategoryId));
        List<ModelCategoryExcelExtDto> modelCategoryExcelDtos = new ArrayList<>();

        List<ModelCategoryFolder> categoryFolders = modelCategoryFolderRepository.findAll();
        Map<Long, ModelCategoryFolder> categoryFolderCaMap = categoryFolders
                .stream()
                .collect(Collectors.toMap(ModelCategoryFolder::getCategoryId, Function.identity()));

        Map<Long, ModelCategoryFolder> categoryFolderMap = categoryFolders
                .stream()
                .collect(Collectors.toMap(ModelCategoryFolder::getFolderId, Function.identity()));


        for (ModelCategoryDto modelCategory : modelCategories) {
            ModelCategoryExcelExtDto modelCategoryExcelDto = new ModelCategoryExcelExtDto();
            BeanUtils.copyProperties(modelCategory, modelCategoryExcelDto);
            modelCategoryExcelDto.setItDepartment(modelCategory.getItDepartmentPath());
            modelCategoryExcelDto.setBusinessDepartment(modelCategory.getBusinessDepartmentPath());
            if (udpValuesByItemIds != null && udpValuesByItemIds.containsKey("" + modelCategory.getCategoryId())) {
                List<MetadataUdpEntry> entries = udpValuesByItemIds.get(modelCategory.getCategoryId().toString());
                if (entries != null) {
                    modelCategoryExcelDto.setUdpMaps(entries.stream().collect(Collectors.toMap((MetadataUdpEntry) -> {
                        return udpkv.get(MetadataUdpEntry.getId());
                    }, MetadataUdpEntry::getValue)));
                }
            }
            if (categoryFolderCaMap.containsKey(modelCategory.getCategoryId()) && categoryFolderCaMap.get(modelCategory.getCategoryId()).getParentId() != 0) {
                modelCategoryExcelDto.setParentCategoryName(categoryFolderMap.get(categoryFolderCaMap.get(modelCategory.getCategoryId()).getParentId()).getName());
            }

            modelCategoryExcelDtos.add(modelCategoryExcelDto);
            modelCategoryExcelDto.setDataSourceQuantity((long)(datasourceEntityMap.getOrDefault(modelCategory.getCategoryId(), Collections.emptyList())).size());
        }


        XSSFWorkbook workbook = this.excelService.exportExcelByDtoType((XSSFWorkbook)null, modelCategoryExcelDtos, "应用系统");
        File file = this.excelService.generalFileByWorkbook(workbook, "应用系统.xlsx");
        return this.excelService.generalResponseEntityByFile(file);
    }
}
