/*
 * Copyright (c) 2017, Datablau. All rights reserved.
 */

package com.datablau.base.server.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.core.annotation.EndpointDoc;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.utility.MultiConditionQueryUtils;
import com.datablau.base.api.TagService70;
import com.datablau.base.data.TagDto;
import com.datablau.base.data.TagGroupDto;
import com.datablau.base.data.TagItemRelationDto;
import com.datablau.base.data.TagRelationQueryDto;
import com.datablau.base.data.TagTreeDto;
import com.datablau.base.server.jpa.entity.TagItemRelation;
import com.datablau.base.server.utility.ServerConstants;
import com.datablau.data.common.api.OperationLogService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.operation.type.OperationLogType;
import com.datablau.data.common.operation.type.OperationModuleType;
import com.datablau.metadata.common.api.DatablauRemoteShareFileService;
import com.datablau.metadata.common.dto.metadata.DataShareFileDto;
import com.datablau.project.util.UserRights;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import org.apache.commons.lang.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @Author Nicky - 蓝图明册科技有限公司
 * @Date 2017/8/1 0001 下午 2:08
 */
@RestController
@RequestMapping("/tags")
@Description("标签相关REST API")
@io.swagger.v3.oas.annotations.tags.Tag(name = "标签管理", description = "/tags")
public class TagController extends BaseController {
    private static final Logger logger = LoggerFactory.getLogger(TagController.class);


    @Autowired
    private TagService70 tagService;
    @Autowired
    private MessageService msgService;
    @Autowired
    private MultiConditionQueryUtils queryUtils;
    @Autowired
    private OperationLogService operationLogService;
    @Autowired
    @Qualifier("datablauRemoteShareFileService")
    private DatablauRemoteShareFileService datablauRemoteShareFileService;

    public TagController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }


//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "db_tag",
//            systemModule = OperationModuleType.SYSTEM_TAG,
//            description = "新建标签分类: {param}",
//            descriptionParamClass = TagDto.class,
//            descriptionParamMethod = "getName"
//    )
    @RequestMapping(value = "/category", method = RequestMethod.POST)
    @Operation(summary = "新建一个标签分类")
    @EndpointDoc(bodyExample = "{\"name\":\"测试分类\",\"properties\":\"{\\\"description\\\":\\\"我是标签描述\\\"}\"}")
    public TagDto createCategoryTag(@RequestBody TagDto tag) {
        return tagService.addTagCategory(tag.getName(), tag.getParentId(), tag.getProperties(),
                tag.getAssociatedTags(), tag.getTagGroupId());
    }

    @RequestMapping(value = "/category/reorder", method = RequestMethod.POST)
    @Operation(summary = "对标签目录或标签进行排序")
    @Parameters({@Parameter(name = "categoryId", description = "目录的ID", required = true),
            @Parameter(name = "newOrder", description = "排序", required = true)})
    public void reorderTagCategory(@RequestParam("categoryId") Long categoryId,
                                   @RequestParam("newOrder") Long newOrder) {
        tagService.reorderTagCategory(categoryId, newOrder);
    }

    @RequestMapping(value = "/group/reorder", method = RequestMethod.POST)
    @Operation(summary = "对标签分组进行排序")
    @Parameters({@Parameter(name = "id", description = "分组的ID", required = true),
            @Parameter(name = "newOrder", description = "排序", required = true)})
    public void reorderTagGroup(@RequestParam("id") Long id,
                                @RequestParam("newOrder") Long newOrder) {
        tagService.reorderTagGroup(id, newOrder);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_tag",
//            systemModule = OperationModuleType.SYSTEM_TAG,
//            description = "删除标签的名称为: {param}",
//            descriptionParamClass = TagDto.class,
//            descriptionParamMethod = "getName"
//    )
    @RequestMapping(value = "/categories", method = RequestMethod.POST)
    @Operation(summary = "删除指定名称的标签")
    @Parameters({@Parameter(name = "tagName", description = "标签名称", required = true)})
    public void deleteCategoryTag(@RequestParam("tagName") String tagName) {
        tagService.deleteTagCategory(tagName);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "db_tag",
//            systemModule = OperationModuleType.SYSTEM_TAG,
//            description = "修改标签名为: {param}",
//            descriptionParamClass = TagDto.class,
//            descriptionParamMethod = "getName"
//    )
    @RequestMapping(value = "/updateTag", method = RequestMethod.POST)
    @Operation(summary = "更改标签的内容，但是不会改变标签的可否被删除属性")
    @EndpointDoc(bodyExample = "{\"tagId\":15,\"name\":\"遗传数据\",\"builtIn\":true,\"category\":false,\"parentId\":11,\"parentName\":\"GDPR\",\"properties\":\"{\\\"description\\\":\\\"我是标签描述\\\"}\"}")
    public TagDto updateTag(@RequestBody TagDto updateTag) {
        if (updateTag.getTagId() == null) {
            throw new InvalidArgumentException(msgService.getMessage("tagIdNull"));
        }
        return tagService.updateTag(updateTag);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_tag",
//            systemModule = OperationModuleType.SYSTEM_TAG,
//            description = "删除标签,ID为: {param}",
//            descriptionParamClass = Long.class,
//            descriptionParamMethod = "toString"
//    )
    @RequestMapping(value = "/deleteTag", method = RequestMethod.POST)
    @Operation(summary = "删除指定的标签")
    @Parameters({@Parameter(name = "tagId", description = "标签ID", required = true)})
    public void deleteTag(@RequestParam("tagId") Long tagId) {
        tagService.deleteTag(tagId);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "db_tag",
//            systemModule = OperationModuleType.SYSTEM_TAG,
//            description = "新增标签名为: {param}",
//            descriptionParamClass = TagDto.class,
//            descriptionParamMethod = "getName"
//    )
    @RequestMapping(value = "/createTag", method = RequestMethod.POST)
    @Operation(summary = "新建标签")
    @EndpointDoc(bodyExample = "{\"name\":\"遗传数据\",\"builtIn\":true,\"category\":false,\"parentId\":11,\"parentName\":\"GDPR\",\"properties\":\"{\\\"description\\\":\\\"我是标签描述\\\"}\"}")
    public TagDto createTag(@RequestBody TagDto tag) {
        return tagService
                .addTag(tag.getName(), tag.getParentId(), tag.getCatalogId(), tag.getProperties(),
                        tag.getAssociatedTags(), null, false, false, null);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "db_tag",
//            systemModule = OperationModuleType.SYSTEM_TAG,
//            description = "更改一个标签可不可以删除的属性"
//    )
    @RequestMapping(value = "/deletable", method = RequestMethod.POST)
    @Operation(summary = "更改一个标签可否删除的属性")
    @Parameters({@Parameter(name = "tagId", description = "标签ID", required = true),
            @Parameter(name = "value", description = "可以删除与否", required = true)})
    public TagDto changeTagBuiltInProperty(
            @Description("标签ID") @RequestParam("tagId") Long tagId,
            @Description("可以删除与否") @RequestParam("value") boolean deletable) {
        return tagService.setTagBuiltIn(tagId, !deletable);
    }


    @PostMapping("/getAllTags")
    @Operation(summary = "获取所有标签")
    @PreAuthorize(UserRights.HAS_BASE_TAG_VIEW_ROLE)
    @Parameters({@Parameter(name = "catalogName", description = "标签分组名称", in = ParameterIn.QUERY, required = true)})
    public Set<TagDto> getAllTags(@RequestParam(value = "catalogName", required = false) String catalogName) {
        return tagService.getAllTags(catalogName);
    }


    @PostMapping("/getAllTagCategories")
    @Operation(summary = "获取所有标签目录")
    public Set<TagDto> getAllTagCategories() {
        return tagService.getAllTagCategories();
    }

    @RequestMapping("/getTagUsages")
    @Operation(summary = "得到标签的使用情况")
    @Parameters({@Parameter(name = "tagId", description = "标签ID", in = ParameterIn.QUERY, required = true)})
    public List<TagItemRelationDto> getTagUsages(
            @Description("标签ID") @RequestParam("tagId") Long tagId,
            @Description("标签类型") @RequestBody List<Long> typeIds) {


        List<TagItemRelationDto> relations = tagService.findTagUsages(tagId, typeIds);

        int total = relations.size();

        if (ObjectUtils.equals(total, 0)) {
            List<TagItemRelationDto> emptyObjList = new ArrayList<>();
            return emptyObjList;
        }

        return relations;
    }


    @PostMapping(value = "/usages/page")
    @Operation(summary = "分页得到标签的使用情况")
    public PageResult<TagItemRelationDto> getTagUsages(@RequestBody TagRelationQueryDto queryDto) {
        return tagService.getTagUsages(queryDto);
    }


//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "db_tag_item",
//            systemModule = OperationModuleType.SYSTEM_TAG,
//            description = "绑定标签"
//    )
    @PostMapping("/addTagRelations")
    @Operation(summary = "给其他类型绑定标签")
    public void addTagsToItems(@RequestBody List<TagItemRelationDto> list) {
        tagService.addTagsToItems(list);
    }


//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_tag_item",
//            systemModule = OperationModuleType.SYSTEM_TAG,
//            description = "删除绑定标签"
//    )
    @PostMapping("/removeTagsToItems")
    @Operation(summary = "删除绑定标签")
    public void removeTagsToItems(@RequestBody List<TagItemRelation> tagItemRelations) {
        Map<Long, List<TagItemRelation>> collect = tagItemRelations.stream().collect(Collectors.groupingBy(TagItemRelation::getTypeId));

        for (Map.Entry<Long, List<TagItemRelation>> entry : collect.entrySet()) {
            tagService.removeTagsFromItemsByType(entry.getValue().stream().map(TagItemRelation::getTagId).collect(Collectors.toList()),
                    entry.getValue().stream().map(TagItemRelation::getItemId).collect(Collectors.toList()), entry.getKey());
        }

        //增加日志
        addRemoveTagLog(tagItemRelations);
    }

    protected void addRemoveTagLog(List<TagItemRelation> tagItemRelations) {
        try {
            List<Long> shareFileIds = new ArrayList<>();
            for (TagItemRelation itemRelation : tagItemRelations) {
                if (itemRelation.getTypeId() == LDMTypes.oUnstructuredDataAssets) {
                    shareFileIds.add(Long.parseLong(itemRelation.getItemId()));
                }
            }

            for (DataShareFileDto shareFile : datablauRemoteShareFileService.findByIdInItems(shareFileIds)) {
                String logMessage = msgService.getMessage("metadata.file.tag.log.modify", shareFile.getFileName());
                operationLogService.generateOperationLog(OperationModuleType.METADATA_DATA, "db_tag_item",
                        OperationLogType.TABLE_MODIFY, logMessage, AuthTools.currentUsername(), 0);
            }

        } catch (Exception e) {
            logger.error(e.getMessage());
        }
    }

    @RequestMapping("/getTagsOfItem")
    @Operation(summary = "获得绑定标签")
    @Parameters({@Parameter(name = "itemId", description = "itemId", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "withoutCategory", description = "是否带目录", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "type", description = "类型", in = ParameterIn.QUERY)})
    public Set<TagDto> getTagsOfItem(@RequestParam String itemId,
                                     @RequestParam boolean withoutCategory,
                                     @RequestParam(value = "type", required = false) Long type) {
        if (type == null) {
            return tagService.getTagsOfItem(itemId, withoutCategory);
        }
        return tagService.getTagsOfItemAndType(itemId, withoutCategory, type);
    }

    @RequestMapping("/tree")
    @Operation(summary = "获取所有树形结构标签")
    public List<TagTreeDto> getTagsTree() {
        return tagService.getTagsTrees();
    }


    @PostMapping("/createTagGroup")
    @Operation(summary = "新建或者更新分组")
    public void createTagGroup(@RequestBody TagGroupDto tagGroup) {
        tagService.createTagGroup(tagGroup);


        //增加日志
//        try {
//            String table = "bas_tag_group";
//            String logMessage;
//            OperationLogType logType;
//
//            if (tagGroup.getId() == null) {
//                logMessage = String.format(msgService.getMessage("TagGroup.add.log"), tagGroup.getName());
//                logType = OperationLogType.TABLE_ADD;
//            } else {
//                logMessage = String.format(msgService.getMessage("TagGroup.modify.log"), tagGroup.getId(), tagGroup.getName());
//                logType = OperationLogType.TABLE_MODIFY;
//            }
//
//            operationLogService.generateOperationLog(OperationModuleType.SYSTEM_TAG, table,
//                    logType, logMessage, AuthTools.currentUsername(), 0);
//        } catch (Exception e) {
//            logger.error(e.getMessage());
//        }
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "db_tag_group",
//            systemModule = OperationModuleType.SYSTEM_TAG,
//            description = "查询标签管理"
//    )
    @PostMapping("/getTagGroup")
    @Operation(summary = "查询所有分组")
    @PreAuthorize(UserRights.HAS_BASE_TAG_VIEW_ROLE)
    public List<TagGroupDto> getTagGroup() {
        return tagService.getTagGroups();
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_tag_group",
//            systemModule = OperationModuleType.SYSTEM_TAG,
//            description = "删除标签分组，id为: {param}",
//            descriptionParamClass = Long.class,
//            descriptionParamMethod = "toString"
//    )
    @PostMapping("/deleteGroup")
    @Operation(summary = "删除分组")
    @Parameters({@Parameter(name = "groupId", description = "组id", in = ParameterIn.QUERY, required = true)})
    public void deleteGroup(@RequestParam("groupId") Long tagGroupId) {
        tagService.deleteGroup(tagGroupId);
    }


    @RequestMapping("/getTagsOfItemWithGroup")
    @Operation(summary = "获得绑定标签并返回标签组")
    @Parameters({@Parameter(name = "itemId", description = "itemId", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "withoutCategory", description = "是否带目录", in = ParameterIn.QUERY, required = true),
            @Parameter(name = "type", description = "类型", in = ParameterIn.QUERY)})
    public Map<String, Set<TagDto>> getTagsOfItemWithGroup(@RequestParam String itemId,
                                                        @RequestParam boolean withoutCategory,
                                                        @RequestParam(value = "type", required = false) Long type) {
        return tagService.getTagsOfItemWithGroup(itemId, withoutCategory, type);
    }


}

