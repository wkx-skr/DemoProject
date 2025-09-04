package com.datablau.domain.management.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.core.annotation.EndpointDoc;
import com.andorj.common.core.exception.IllegalOperationException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.utility.BeanHelper;
import com.datablau.base.api.TagService;
import com.datablau.base.data.*;
import com.datablau.data.common.api.impl.KafkaPublishService;
import com.datablau.domain.management.api.DomainService;
import com.datablau.domain.management.api.StandardService;
import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.dto.DomainDto;
import com.datablau.domain.management.dto.StandardCodeDto;
import com.datablau.domain.management.dto.SyncDomainTagDto;
import com.datablau.domain.management.dto.TagInsertDto;
import com.datablau.security.management.utils.AuthTools;
import com.google.common.collect.Lists;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.commons.lang.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.util.Pair;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * @description: 标签绑定
 * @author: wang tong
 * @create: 2023-07-18 10:12
 **/
@RestController
@RequestMapping("/tag")
@Tag(name = "数据标准部分 标签绑定")
public class TagRelationController extends BaseController {

    public static final int DOMAIN_TYPE = 3;
    public static final int GIVEN_TYPE = 5;
    public static final int METRICS_TYPE = 6;
    public static final int DATASTANDARDCODE_TYPE = 7;


    @Autowired
    private TagService tagService;

    @Autowired
    private DomainService domainService;

    @Autowired
    private StandardService standardService;

    @Autowired
    private MessageService msgService;

    @Value("${datablau.kafka-topic.domain-tag-update}")
    public String updateTagTopic;

    @RequestMapping("/getTagUsagesName")
    @Operation(summary = "得到数据标准服务相关标签的使用情况")
    public PageResult<ObjectContainerDto> getTagUsages(@RequestBody TagRelationQueryDto queryDto) {

        PageResult<TagItemRelationDto> tagItemRelationDtoPageResult = tagService.getTagUsages(queryDto);
        PageResult<ObjectContainerDto> result = new PageResult<>();
        List<ObjectContainerDto> list = convertToObjectContainerDto(tagItemRelationDtoPageResult.getContent());
        result.setContentDirectly(list);
        result.setTotalItems((long) list.size());
        result.setCurrentPage(tagItemRelationDtoPageResult.getCurrentPage());
        result.setPageSize(tagItemRelationDtoPageResult.getPageSize());
        return result;

    }


    @PostMapping(value = "/tags/select")
    @Description("给数据标准、指标、基础代码打上标签")
    @EndpointDoc(bodyExample = "[123,456]")
    @Operation(summary = "给数据标准或指标或基础代码打上标签")
    public void selectEntityTags(@RequestBody TagInsertDto dto) {
        if (dto.getTypeId() == LDMTypes.oDataStandardCode) {
            chooseTagsToStdcode(dto.getTagIds(), dto.getId(), dto.getTypeId());
        } else if (dto.getTypeId() == LDMTypes.oDataStandard || dto.getTypeId() == LDMTypes.oMetrics) {
            chooseTagsToDomain(dto.getTagIds(), dto.getId(), dto.getTypeId());
        }
        KafkaPublishService kafkaPublishService = (KafkaPublishService) BeanHelper.getBeanByName("kafkaService");
        SyncDomainTagDto syncDomainTagDto = new SyncDomainTagDto(dto.getId(), dto.getTypeId());
        kafkaPublishService.sendMessage(updateTagTopic, syncDomainTagDto);
    }

    @PostMapping(value = "/tags/delete")
    public void deleteTags(@RequestParam("objectId") String objectId,
                           @RequestParam("typeId") Long typeId,
                           @RequestBody List<ReTagDto> tags) {
        for (ReTagDto tag : tags) {
            tagService.removeTagFromObject(tag.getName(), objectId, typeId);
        }
        KafkaPublishService kafkaPublishService = (KafkaPublishService) BeanHelper.getBeanByName("kafkaService");
        SyncDomainTagDto syncDomainTagDto = new SyncDomainTagDto(objectId, typeId);
        kafkaPublishService.sendMessage(updateTagTopic, syncDomainTagDto);
    }

    @RequestMapping(method = RequestMethod.POST, value = "/tags/get")
    public List<TagDto> getByItemId(@RequestParam("itemId") String itemId) {
        return tagService.getTagsByItemid(itemId);
    }

    /**
     * 给标准代码打标签
     */
    public void chooseTagsToStdcode(Set<Long> tagIds, String id, Long typeId) {
        if (tagIds == null || tagIds.isEmpty() || id == null) {
            return;
        }
        StandardCodeDto standardCodeDto = domainService.getCodeByCodeNumber(id, null);
        if (standardCodeDto != null) {
            Set<Long> oldTagIds = tagService.getTagIdsOfItem(standardCodeDto.getCode(), typeId);
            HashSet<Long> removeTagIds = new HashSet<>(oldTagIds);
            removeTagIds.removeAll(tagIds);
            tagIds.removeAll(oldTagIds);

            updateTags(tagIds, removeTagIds, Lists.newArrayList(id), true, typeId);
        }
    }

    /**
     * 给数据标准或指标标准 打标签
     */
    public void chooseTagsToDomain(Set<Long> tagIds, String id, Long typeId) {
        if (tagIds == null || tagIds.isEmpty() || id == null) {
            return;
        }
        DomainDto domainDto = domainService.getDomainByDomainId(id);
        if (domainDto != null) {
            Set<Long> oldTagIds = tagService.getTagIdsOfItem(domainDto.getDomainId(), typeId);
            HashSet<Long> removeTagIds = new HashSet<>(oldTagIds);
            removeTagIds.removeAll(tagIds);
            tagIds.removeAll(oldTagIds);

            updateTags(tagIds, removeTagIds, Lists.newArrayList(id), true, typeId);
        }


    }

    public void updateTags(Collection<Long> addTagIds, Collection<Long> removeTagIds,
                           List<String> objectIds, boolean ignoreConflicts, Long typeId) {
        if (objectIds == null || objectIds.isEmpty()) {
            return;
        }

        for (List<String> ids : Lists.partition(objectIds, 999)) {
            Set<String> itemIds = ids.stream().map(Object::toString).collect(Collectors.toSet());
            if (typeId == LDMTypes.oDataStandard) {
                tagService.removeTagsFromItems(removeTagIds, itemIds, DOMAIN_TYPE);
                TagRelationDto relationDto = new TagRelationDto(addTagIds, itemIds, true, DOMAIN_TYPE,
                        ignoreConflicts, AuthTools.currentUsername());
                addTagsToItems(relationDto);
            } else if (typeId == LDMTypes.oMetrics) {
                tagService.removeTagsFromItems(removeTagIds, itemIds, METRICS_TYPE);
                TagRelationDto relationDto = new TagRelationDto(addTagIds, itemIds, true, METRICS_TYPE,
                        ignoreConflicts, AuthTools.currentUsername());
                addTagsToItems(relationDto);
            } else if (typeId == LDMTypes.oDataStandardCode) {
                tagService.removeTagsFromItems(removeTagIds, itemIds, DATASTANDARDCODE_TYPE);
                TagRelationDto relationDto = new TagRelationDto(addTagIds, itemIds, true, DATASTANDARDCODE_TYPE,
                        ignoreConflicts, AuthTools.currentUsername());
                addTagsToItems(relationDto);
            }

        }
    }

    private void addTagsToItems(TagRelationDto relationDto) {
        relationDto.setUsername(AuthTools.currentUsername());
        Collection<Long> tagIds = relationDto.getTagIds();
        Collection<String> itemIds = relationDto.getItemIds();

        if (tagIds == null || tagIds.size() == 0) {
            return;
        }
        if (itemIds == null || itemIds.size() == 0) {
            return;
        }
        //1.查询所有的标签，并去除目录，同时获取关联标签
        List<TagDto> tags = new ArrayList<>();
        Set<Long> associatedTagIds = new HashSet<>();
        Set<Long> catalogIds = new HashSet<>();
        List<Pair<String, Long>> objectList = new ArrayList<>();
        for (TagDto o : tagService.getTagByIds((Set<Long>) tagIds)) {
            if (!o.isCategory()) {
                tags.add(o);
                if (o.getAssociatedTags() != null && o.getAssociatedTags().size() != 0) {
                    associatedTagIds.addAll(o.getAssociatedTags());
                }
                if (o.getCatalogId() != null) {
                    catalogIds.add(o.getCatalogId());
                }
            }
        }

        tagService.addTagsToItems(convertTagRelation(tags, objectList, relationDto));

        if (relationDto.isRecursive()) {
            if (associatedTagIds != null && !associatedTagIds.isEmpty()) {
                relationDto.setTagIds(associatedTagIds);
                relationDto.setRecursive(false);
                addTagsToItems(relationDto);
            }
        }
    }

    private List<TagItemRelationDto> convertTagRelation(List<TagDto> tags, List<Pair<String, Long>> objectList, TagRelationDto tagRelationDto) {
        int type = tagRelationDto.getType();
        Long givenTypeId = tagRelationDto.getGivenType();

        List<TagItemRelationDto> relations = new ArrayList<>();

        for (String itemId : tagRelationDto.getItemIds()) {
            for (TagDto tag : tags) {
                Long typeId = null;
                if (ObjectUtils.equals(type, DOMAIN_TYPE)) {
                    typeId = LDMTypes.oDataStandard;
                } else if (ObjectUtils.equals(type, METRICS_TYPE)) {
                    typeId = LDMTypes.oMetrics;
                } else if (ObjectUtils.equals(type, DATASTANDARDCODE_TYPE)) {
                    typeId = LDMTypes.oDataStandardCode;
                } else if (ObjectUtils.equals(type, GIVEN_TYPE) && givenTypeId != null) {
                    typeId = givenTypeId;
                } else {
                    continue;
                }
                if (tagService.checkSameTagParentOnObject(tag, itemId, typeId)) {
                    if (tagRelationDto.isIgnoreConflicts()) {
                        continue;
                    } else {
                        TagDto parent = tagService.getTagById(tag.getParentId());
                        throw new IllegalOperationException(msgService
                                .getMessage("failedBindTagAsExistInCategory", parent.getName()));
                    }
                }
                TagItemRelationDto relation = new TagItemRelationDto();
                relation.setItemId(itemId);
                relation.setTagId(tag.getTagId());
                relation.setTypeId(typeId);
                relation.setTagCategoryId(tag.getParentId());
                relations.add(relation);
            }
        }

        return relations;
    }

    private List<ObjectContainerDto> convertToObjectContainerDto(List<TagItemRelationDto> items) {
        if (CollectionUtils.isEmpty(items)) {
            return new ArrayList<>();
        }

        List<ObjectContainerDto> result = new ArrayList<>();

        List<String> domainIds = new ArrayList<>();
        List<String> standCodes = new ArrayList<>();

        for (TagItemRelationDto item : items) {
            if (ObjectUtils.equals(item.getTypeId(), LDMTypes.oDataStandard)
                    || (ObjectUtils.equals(item.getTypeId(), LDMTypes.oMetrics))) {
                domainIds.add(item.getItemId());
            } else if (ObjectUtils.equals(item.getTypeId(), LDMTypes.oDataStandardCode)) {
                standCodes.add(item.getItemId());
            }
        }


        if (!domainIds.isEmpty()) {
            for (DomainDto domain : domainService.getDomainsByDomainIds(domainIds)) {
                if (DomainState.A.equals(domain.getState())) {
                    if (domain.getCategoryId() == 2L) {
                        result.add(new ObjectContainerDto(LDMTypes.oMetrics, domain));
                    } else {
                        result.add(new ObjectContainerDto(LDMTypes.oDataStandard, domain));
                    }
                }
            }
        }
        if (!standCodes.isEmpty()) {
            for (StandardCodeDto dto : standardService.findCodesByIds(standCodes)) {
                if (DomainState.A.equals(dto.getState())) {
                    result.add(new ObjectContainerDto(LDMTypes.oDataStandardCode, dto));
                }
            }
        }

        return result;
    }


}
