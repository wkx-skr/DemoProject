package com.datablau.metadata.main.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.core.annotation.EndpointDoc;
import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.api.MessageService;
import com.datablau.base.api.TagService;
import com.datablau.base.data.ObjectContainerDto;
import com.datablau.base.data.ReTagDto;
import com.datablau.base.data.TagDto;
import com.datablau.base.data.TagItemRelationDto;
import com.datablau.base.data.TagRelationDto;
import com.datablau.base.data.TagRelationQueryDto;
import com.datablau.base.data.TagUdpDto;
import com.datablau.common.kafka.producer.KafkaProducer;
import com.datablau.data.common.api.OperationLogService;
import com.datablau.data.common.operation.type.OperationLogType;
import com.datablau.data.common.operation.type.OperationModuleType;
import com.datablau.metadata.common.dto.tag.SyncTagDto;
import com.datablau.metadata.main.dao.metadata.DataObjectRepository;
import com.datablau.metadata.main.entity.metadata.DataObject;
import com.datablau.metadata.main.entity.share.file.DataShareFile;
import com.datablau.metadata.main.service.lineage.impl.LineageFolderServiceImpl;
import com.datablau.metadata.main.service.metadata.api.DataObjectService;
import com.datablau.metadata.main.service.share.file.api.DataShareFileService;
import com.datablau.metadata.main.service.tag.TagServiceLocal;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import com.google.common.collect.Lists;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static com.datablau.base.data.TagItemType.OBJECT_TYPE;

/**
 * @program: datablau-metadata
 * @description: 元数据标签绑定关系;  每个微服务单独处理绑定关系;
 * @author: wang tong
 * @create: 2023-07-10 15:50
 **/
@RestController
@RequestMapping("/tag")
@Tag(name = "元数据部分 标签绑定")
public class TagRelationController extends LocalBaseController {
    private static final Logger logger = LoggerFactory.getLogger(TagRelationController.class);

    @Autowired
    private TagService tagService;

    @Autowired
    private DataObjectService dataObjectService;

    @Autowired
    private DataObjectRepository dataObjectRepo;

    @Autowired
    private MessageService msgService;

    @Autowired
    private TagServiceLocal tagServiceLocal;
    @Autowired
    private KafkaProducer kafkaProducer;
    @Autowired
    private OperationLogService operationLogService;
    @Autowired
    private DataShareFileService dataShareFileService;

    @Value("${datablau.kafka-topic.tag-update}")
    public String updateTagTopic;

    public TagRelationController(@Autowired RoleService roleService) {
        super(roleService);
    }


    @RequestMapping(method = RequestMethod.POST, value = "/tags/add")
    @Description("给对象打上标签")
    @EndpointDoc(bodyExample = "[123,456]")
    public void addEntityTags(@Description("对象的ID") @RequestParam("objectId") Long objectId,
                              @RequestBody Set<Long> tagIds,
                              @Description("对象的类型ID") @RequestParam("typeId") Long typeId) {

        if (tagIds == null || tagIds.isEmpty() || objectId == null) {
            return;
        }
        List<String> itemIds = new ArrayList<>();
        itemIds.add(objectId.toString());
        TagRelationDto relationDto = new TagRelationDto(tagIds, itemIds, true, OBJECT_TYPE,
                false, AuthTools.currentUsername());
        tagServiceLocal.addTagsToItems(relationDto);
    }


    @PostMapping(value = "/tags/choose")
    @Description("给对象打上标签")
    @EndpointDoc(bodyExample = "[123,456]")
    @Operation(summary = "给对象打上标签")
    public void chooseEntityTags(@Parameter(name = "objectId", description = "对象的ID") @Description("对象的ID") @RequestParam("objectId") Long objectId,
                                 @RequestBody Set<Long> tagIds,
                                 @Parameter(name = "typeId", description = "对象的类型ID") @Description("对象的类型ID") @RequestParam("typeId") Long typeId) {
        DataObject dataObject = dataObjectService.getDataObjectByObjectId(objectId);
        checkMetadataEditPermissions(dataObject);

        if (tagIds == null || tagIds.isEmpty() || objectId == null) {
            return;
        }
        DataObject o = dataObjectService.getDataObjectByObjectId(objectId);
        Set<Long> oldTagIds = tagService.getTagIdsOfItem(o.getObjectId().toString(), o.getTypeId());
        HashSet<Long> removeTagIds = new HashSet<>(oldTagIds);
        removeTagIds.removeAll(tagIds);
        tagIds.removeAll(oldTagIds);

        tagServiceLocal.updateTagsOfObjects(tagIds, removeTagIds, Lists.newArrayList(objectId), true);

        //增加日志
        addEntityTagModifyLog(o);
    }

    protected void addEntityTagModifyLog(DataObject object) {
        try {
            if (LDMTypes.oEntity != object.getTypeId() && LDMTypes.oView != object.getTypeId()) {
                return;
            }
            String logMessage = msgService.getMessage("metadata.table.tag.log.modify", object.getFullName());
            operationLogService.generateOperationLog(OperationModuleType.METADATA_DATA, "db_tag_item",
                    OperationLogType.TABLE_MODIFY, logMessage, AuthTools.currentUsername(), 0);
        } catch (Exception e) {
            logger.error(e.getMessage());
        }
    }

    @RequestMapping(method = RequestMethod.POST, value = "/tags/get")
    public List<TagDto> getByItemId(@RequestParam("itemId") String itemId) {
        return tagService.getTagsByItemid(itemId);
    }


    @PostMapping(value = "/tags/delete")
    @Description("解除对象和一系列标签的关系")
    @Operation(summary = "解除对象和一系列标签的关系")
    public void deleteEntityTags(@RequestParam("objectId") Long objectId,
                                 @RequestParam("typeId") Long typeId,
                                 @RequestBody List<ReTagDto> tags) {
        DataObject dataObject = dataObjectService.getDataObjectByObjectId(objectId);
        checkMetadataEditPermissions(dataObject);
        for (ReTagDto tag : tags) {
            tagService.removeTagFromObject(tag.getName(), objectId.toString(), typeId);
        }

        TagRelationDto relationDto = new TagRelationDto();
        Set<Long> tagIds = tagService.getTagIdsOfItem(objectId.toString(), typeId);
        relationDto.setTagIds(tagIds);
        relationDto.setItemIds(Lists.newArrayList(objectId.toString()));
        relationDto.setType(OBJECT_TYPE);
        tagServiceLocal.applyTagsToEs(relationDto);

        SyncTagDto syncTagDto = new SyncTagDto(objectId.toString(), typeId, tagIds);
        kafkaProducer.sendMessage(updateTagTopic, syncTagDto);

        //增加日志
        addEntityTagModifyLog(dataObject);
    }

    @RequestMapping("/getTagUsagesName")
    @Operation(summary = "得到元数据相关标签的使用情况")
    public PageResult<ObjectContainerDto> getTagUsages(@RequestBody TagRelationQueryDto queryDto) {
        queryDto.setTypeIds(Lists.newArrayList(80000004L, 82800002L, 82800008L, 80000005L, 80010118L, 80010119L, 82800024L, LineageFolderServiceImpl.LINEAGE_FOLDER_TYPE_ID, 80500008L));
        PageResult<TagItemRelationDto> tagItemRelationDtoPageResult = tagService.getTagUsages(queryDto);
        PageResult<ObjectContainerDto> result = new PageResult<>();
        List<ObjectContainerDto> list = tagServiceLocal.convertToObjectContainerDto(tagItemRelationDtoPageResult.getContent());
        result.setTotalItems(tagItemRelationDtoPageResult.getTotalItems());
        result.setContentDirectly(list);
        result.setCurrentPage(tagItemRelationDtoPageResult.getCurrentPage());
        result.setPageSize(tagItemRelationDtoPageResult.getPageSize());
        return result;

    }


    @PostMapping("/tree/summary")
    @Operation(summary = "获取指定元数据标签与扩展属性的结果")
    public Map<String, List<TagUdpDto>> getTagsTree(@Parameter(name = "objectId", description = "对象编码")
                                                    @RequestParam("objectId") Long objectId) {
        //查找元数据的typeId
        Long typeId = dataObjectRepo.findLatestTypeByObjectId(objectId);
        if (typeId == null) {
            throw new AndorjRuntimeException(
                    msgService.getMessage("cannotFindTheObjectByObjectId", objectId));
        }
        return tagServiceLocal.createTagTreeResult(
                tagService.getTagsTree(objectId, typeId), objectId, typeId);
    }

    @PostMapping("/chooseTagRelations")
    @Operation(summary = "给其他类型绑定标签")
    public void chooseTagsToItems(@RequestBody TagRelationDto relationDto) {
        relationDto.setUsername(AuthTools.currentUsername());
        tagServiceLocal.updateTagsToItems(relationDto);

        //增加日志
        addTagModifyLog(relationDto);
    }

    protected void addTagModifyLog(TagRelationDto relationDto) {
        try {
            if (relationDto.getType() != 4) {
                return;
            }

            List<Long> shareFileIds = new ArrayList<>();
            for (String id : relationDto.getItemIds()) {
                shareFileIds.add(Long.parseLong(id));
            }

            for (DataShareFile shareFile : dataShareFileService.findDataShareFileByIds(shareFileIds)) {
                String logMessage = msgService.getMessage("metadata.file.tag.log.modify", shareFile.getName());
                operationLogService.generateOperationLog(OperationModuleType.METADATA_SHAREFILE, "db_tag_item",
                        OperationLogType.TABLE_MODIFY, logMessage, AuthTools.currentUsername(), 0);
            }

        } catch (Exception e) {
            logger.error(e.getMessage());
        }
    }


}
