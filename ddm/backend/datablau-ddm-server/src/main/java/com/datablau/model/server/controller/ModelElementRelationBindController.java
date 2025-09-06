package com.datablau.model.server.controller;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.model.LDMTypes;
import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.api.ModelElementRelationBindService;
import com.datablau.model.data.dto.ElementChildNodeDto;
import com.datablau.model.data.dto.ModelElementRelationBindDto;
import com.datablau.model.data.jpa.entity.Model;
import com.datablau.model.data.jpa.entity.ModelElement;
import com.datablau.model.data.jpa.entity.ModelElementRelationBind;
import com.datablau.model.data.jpa.repository.ModelElementRelationBindRepository;
import com.datablau.model.data.jpa.repository.ModelElementRepository;
import com.datablau.model.data.jpa.repository.ModelRepository;
import com.datablau.model.data.model.enums.ModelElementRelationType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @Author yudonghai - 北京数语科技有限公司
 * @Date 2022/5/18 13:53
 */

@RestController("modelElementRelationBindController")
@ConditionalOnMissingBean(name = "modelElementRelationBindControllerExt")
@RequestMapping("/model/relation/bind")
@Tag(name = "元素绑定相关REST API", description = "元素绑定相关REST API")
public class ModelElementRelationBindController extends BaseController {
    @Autowired
    ModelElementRelationBindService modelElementRelationBindService;

    @Autowired
    ModelElementRelationBindRepository elementRelationBindDao;

    @Autowired
    ModelElementRepository modelElementDao;

    @Autowired
    ModelRepository modelDao;

    @Operation(summary = "校验元素绑定关系是否成环", description = "ownerId,dependerIds,RelationCode必传。return -> true:是环状结构 false:不是环状结构")
    @PostMapping("/elements/isCircular")
    public boolean checkCircularDependency(@RequestBody ModelElementRelationBindDto elementRelationBindDto) {
        return modelElementRelationBindService.checkCircularDependency(elementRelationBindDto);
    }

    @Operation(summary = "绑定元素关系", description = "ownerId,dependerIds,RelationCode必传。isIncrement 是否增量更新 true:增量更新，只添加不删除 false:全量覆盖，添加和删除")
    @PostMapping("/elements")
    public void bind(@RequestBody ModelElementRelationBindDto elementRelationBindDto,
                     @RequestParam(name = "isIncrement", required = false, defaultValue = "true") boolean isIncrement) {
        modelElementRelationBindService.bindElements(elementRelationBindDto, isIncrement);
    }

    @Operation(summary = "查询元素绑定的子元素", description = "ownerId必传，RelationCode和DependerType非必传")
    @PostMapping("/elements/children")
    public List<ModelElementRelationBind> getElementRelationBindChildren(@RequestBody ModelElementRelationBindDto elementRelationBindDto) {
        return modelElementRelationBindService.getElementRelationBinds(elementRelationBindDto, true);
    }

    @Operation(summary = "查询元素绑定的父元素", description = "ownerId必传，RelationCode和DependerType非必传")
    @PostMapping("/elements/parent")
    public List<ModelElementRelationBind> getElementRelationBindParent(@RequestBody ModelElementRelationBindDto elementRelationBindDto) {
        return modelElementRelationBindService.getElementRelationBinds(elementRelationBindDto, false);
    }

    @Operation(summary = "删除元素关系(旧接口)", description = "ownerId,dependerIds,RelationCode必传")
    @DeleteMapping("/elements")
    public void deleteElementRelationBinds(@RequestBody ModelElementRelationBindDto elementRelationBindDto) {
        modelElementRelationBindService.deleteElementRelationBinds(elementRelationBindDto, true);
    }

    @Operation(summary = "删除元素绑定的子元素", description = "ownerId必传,dependerIds非必传")
    @DeleteMapping("/elements/children")
    public void deleteElementRelationBindChildren(@RequestBody ModelElementRelationBindDto elementRelationBindDto) {
        modelElementRelationBindService.deleteElementRelationBinds(elementRelationBindDto, true);
    }

    @Operation(summary = "删除元素绑定的父元素", description = "ownerId必传,dependerIds非必传")
    @DeleteMapping("/elements/parent")
    public void deleteElementRelationBindParent(@RequestBody ModelElementRelationBindDto elementRelationBindDto) {
        modelElementRelationBindService.deleteElementRelationBinds(elementRelationBindDto, false);
    }

    @Operation(summary = "查询元素的子孙树或者祖先树", description = "getChildren is true 查询child, getChildren is false 查询parent")
    @GetMapping("/elements/tree")
    public ElementChildNodeDto getModelElementChildOrParentNode(@Parameter(name = "元素复合ID") @RequestParam String id,
                                                                @Parameter(name = "关系代码") @RequestParam(value = "relationCode") ModelElementRelationType relationCode,
                                                                @Parameter(name = "子孙树或者祖先树") @RequestParam(value = "getChildren") boolean getChildren) {
        return modelElementRelationBindService.getModelElementChildOrParentNode(id, Collections.singletonList(relationCode), getChildren);
    }

    @Operation(summary = "绑定模型", description = "适用于不知道模型ElementId的情况")
    @PostMapping("/models")
    public void bindModels(@Parameter(name = "模型1ID") @RequestParam(value = "modelId1") Long modelId1,
                           @Parameter(name = "模型2ID") @RequestParam(value = "modelId2") Long modelId2,
                           @Parameter(name = "关系代码") @RequestParam(value = "relationCode") ModelElementRelationType relationCode) {
        modelElementRelationBindService.bindModels(modelId1, modelId2, relationCode);
    }

    @Operation(summary = "获取模型绑定的子模型或父模型")
    @GetMapping("/models")
    public List<Model> getModelRelationBinds(@Parameter(name = "模型ID") @RequestParam(value = "modelId") Long modelId,
                                             @Parameter(name = "模型的角色代码") @RequestParam(value = "relationCode") ModelElementRelationType relationCode,
                                             @Parameter(name = "子孙树或者祖先树") @RequestParam(value = "getChildren") boolean getChildren) {
        List<Long> modelIds;
        if (getChildren) {
            List<ModelElementRelationBind> elementBindList = elementRelationBindDao.findRelationsByOModelIdAndCode(modelId, relationCode);
            modelIds = elementBindList.stream().map(ModelElementRelationBind::getDependencyModelId).collect(Collectors.toList());
        } else {
            List<ModelElementRelationBind> elementBindList = elementRelationBindDao.findRelationsByDModelIdAndCode(modelId, relationCode);
            modelIds = elementBindList.stream().map(ModelElementRelationBind::getOwnerModelId).collect(Collectors.toList());
        }
        return modelDao.findByIdIn(modelIds);
    }

    @Operation(summary = "删除绑定的模型")
    @DeleteMapping("/models")
    public void unbindModels(@Parameter(name = "模型1ID") @RequestParam(value = "modelId1") Long modelId1,
                             @Parameter(name = "模型2ID") @RequestParam(value = "modelId2") Long modelId2,
                             @Parameter(name = "模型1的角色代码") @RequestParam(value = "relationCode") ModelElementRelationType relationCode) {
        modelElementRelationBindService.unbindModels(modelId1, modelId2, relationCode);
    }

    @Operation(summary = "查询模型绑定的子孙树或者祖先树", description = "getChildren is true 查询child, getChildren is false 查询parent")
    @GetMapping("/models/tree")
    public ElementChildNodeDto getModelChildOrParent(@Parameter(name = "模型ID") @RequestParam(value = "modelId") Long modelId,
                                                     @Parameter(name = "模型的角色代码") @RequestParam(value = "relationCode") ModelElementRelationType relationCode,
                                                     @Parameter(name = "子孙树或者祖先树") @RequestParam(value = "getChildren") boolean getChildren) {
        return modelElementRelationBindService.getModelElementChildOrParentNode(modelElementRelationBindService.getModelCombinedId(modelId), Collections.singletonList(relationCode), getChildren);
    }

    @GetMapping("/findrelationship")
    public String findRelationship(@RequestParam(name = "modelid") Long modelId,
                                   @RequestParam(name = "entityid") Long elementId,
                                   @RequestParam(name = "ismodel", required = false, defaultValue = "false") Boolean isModel,
                                   @RequestParam(name = "parent", required = false, defaultValue = "false") Boolean getParent,
                                   @RequestParam(name = "child", required = false, defaultValue = "true") Boolean getChild,
                                   @RequestParam(name = "relationCodes", required = false, defaultValue = "R,D") String relationCodes) {

        // 1. 解析当前需要查询的关系代码
        Set<ModelElementRelationType> codes = new HashSet<>();
        String[] split = relationCodes.split(",");
        for (String code : split) {
            try {
                codes.add(ModelElementRelationType.valueOf(code));
            } catch (Exception ignored) {
            }
        }

        // 2. 查询当前模型和当前元素是否存在
        Model rootModel = modelDao.findByIdEquals(modelId);
        if (rootModel == null) {
            throw new InvalidArgumentException("当前元素所属模型不存在");
        }
        ModelElement rootModelElement;
        if (Objects.equals(1L, elementId)) { //web查询模型血缘，默认传ElementId=1L
            List<ModelElement> modelSourceList = modelElementDao.findAllModelSubElements(modelId, LDMTypes.oModelSource);
            if (modelSourceList == null || modelSourceList.isEmpty()) {
                throw new InvalidArgumentException("当前元素不存在");
            } else {
                rootModelElement = modelSourceList.get(0);
            }
        } else {
            rootModelElement = modelElementDao.findModelElementByCombinedId(modelId + "/" + elementId);
            if (rootModelElement == null) {
                throw new InvalidArgumentException("当前元素不存在");
            }
        }

        // 3.根据不同场景，构建血缘树时加入Archy血缘
        ElementChildNodeDto proxyParentNodeDto = null;
        ElementChildNodeDto proxyChildrenNodeDto = null;
        if (isModel) {
            // 查询模型的子元素，如果当前模型是领域或者对象，则查询其引用的业务对象
            if (getChild) {
                List<ElementChildNodeDto> modelElementChildrenList = modelElementRelationBindService.getModelElementChildOrParentList(
                        Collections.singletonList(rootModelElement), new ArrayList<>(),
                        codes, true, new ArrayList<>(), new HashMap<>());
                proxyChildrenNodeDto = modelElementRelationBindService.wrapElementChildNodeDto(rootModelElement, rootModel, modelElementChildrenList);
            }
            if (getParent) {
                // 查询模型的父元素，如果当前模型是Archy业务对象，则查询其所属主题和被引用的领域。
                List<ElementChildNodeDto> modelElementParentList = modelElementRelationBindService.getModelElementChildOrParentList(
                        Collections.singletonList(rootModelElement), new ArrayList<>(),
                        codes, false, new ArrayList<>(), new HashMap<>());
                proxyParentNodeDto = modelElementRelationBindService.wrapElementChildNodeDto(rootModelElement, rootModel, modelElementParentList);
            }
        } else {
            // 查询元素的父元素,如果当前元素是业务对象，则需要查询其所属主题和被引用的领域
            if (getParent) {
                Map<String, Boolean> objectMap = new HashMap<>();
                objectMap.put(modelId + "/" + elementId, rootModel.getUseProto());
                List<ElementChildNodeDto> modelElementParentList = modelElementRelationBindService.getModelElementChildOrParentList(
                        Collections.singletonList(rootModelElement), new ArrayList<>(),
                        codes, false, new ArrayList<>(), objectMap);
                proxyParentNodeDto = modelElementRelationBindService.wrapElementChildNodeDto(rootModelElement, rootModel, modelElementParentList);
            }
        }
        return modelElementRelationBindService.findRelationship(modelId, elementId, isModel, getParent, getChild, codes, proxyChildrenNodeDto, proxyParentNodeDto);
    }

}
