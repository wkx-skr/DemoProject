package com.datablau.model.server.controller;

import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.api.TagService;
import com.datablau.model.data.jpa.entity.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Set;
/**
 * @author Nicky - 数语科技有限公司
 * date 2020/3/4 15:50
 */
@RestController("tagController")
@ConditionalOnMissingBean(name = "tagControllerExt")
@RequestMapping("/tags")
@io.swagger.v3.oas.annotations.tags.Tag(name = "标签相关的 REST API", description = "标签相关的 REST API")
public class TagController extends BaseController {

    @Autowired
    protected TagService tagService;

    @RequestMapping("/")
    @Operation(summary = "获取所有标签", description = "获取所有标签")
    public List<Tag> getAllTags() {
        return tagService.getAllTags();
    }

    @RequestMapping(value = "/", method = RequestMethod.POST)
    @Operation(summary = "创建或者修改一个标签", description = "创建或者修改一个标签，只有拥有超管权限的可以调用此接口")
    public Tag createOrUpdateTag(@Parameter(description = "标签", required = true) @RequestBody Tag tag) {
        return tagService.createOrUpdateTag(tag);
    }

    @RequestMapping(value = "/{tagId}", method = RequestMethod.DELETE)
    @Operation(summary = "删除一个标签", description = "删除一个标签")
    @Parameters({@Parameter(name = "tagId", description = "标签id", in = ParameterIn.PATH, required = true)})
    public void deleteTag(@PathVariable("tagId") Long tagId) {
        tagService.removeTag(tagId);
    }

    @RequestMapping(value = "/{tagId}/models/{modelId}/bind", method = RequestMethod.POST)
    @Operation(summary = "绑定一个标签和一个模型", description = "绑定一个标签和一个模型")
    @Parameters({@Parameter(name = "tagId", description = "标签id", in = ParameterIn.PATH, required = true)
            , @Parameter(name = "modelId", description = "模型id", in = ParameterIn.PATH, required = true)})
    public void bindTagToModel(@PathVariable("tagId") Long tagId,
                               @PathVariable("modelId") Long modelId) {
        tagService.bindModelToTag(tagId, modelId);
    }

    @RequestMapping(value = "/{tagId}/models/{modelId}/unbind", method = RequestMethod.POST)
    @Operation(summary = "解除绑定一个标签和一个模型", description = "解除绑定一个标签和一个模型")
    @Parameters({@Parameter(name = "tagId", description = "标签id", in = ParameterIn.PATH, required = true)
            , @Parameter(name = "modelId", description = "模型id", in = ParameterIn.PATH, required = true)})
    public void unbindTagToModel(@PathVariable("tagId") Long tagId,
                                 @PathVariable("modelId") Long modelId) {
        tagService.unbindModelToTag(tagId, modelId);
    }

    @RequestMapping(value = "/models/tags", method = RequestMethod.POST)
    @Operation(summary = "获取一组模型以及它们的标签", description = "获取一组模型以及它们的标签")
    public Map<Long, List<Tag>> getModelsTags(@Parameter(description = "模型id", required = true) @RequestBody Set<Long> modelIds) {
        return tagService.getModelsTags(modelIds);
    }
}
