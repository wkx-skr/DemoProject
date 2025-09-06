package com.datablau.model.server.controller;

import com.andorj.model.common.api.MessageService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.api.MappingCategoryService;
import com.datablau.model.data.jpa.entity.MappingCategory;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
/**
 * @Author Jing - 北京数语科技有限公司
 * @Date 4/8/2021 2:16 PM
 */
@RestController("mappingCategoryController")
@ConditionalOnMissingBean(name = "mappingCategoryControllerExt")
@RequestMapping("/mappingCategories")
@Tag(name = "Mapping模型库目录相关Rest API", description = "Mapping模型库目录相关Rest API")
public class MappingCategoryController extends BaseController {
    protected static final Logger logger = LoggerFactory.getLogger(MappingCategoryController.class);

    @Autowired
    protected MappingCategoryService mappingCategoryService;

    @Autowired
    protected MessageService msgService;

    @RequestMapping("/")
    @Operation(summary = "获取所有Mapping模型库目录", description = "获取所有Mapping模型库目录，返回的是目录数组")
    public List<MappingCategory> getMappingCategories() {
        return mappingCategoryService.getCategories();
    }


    @RequestMapping(value = "/", method = RequestMethod.POST)
    @Operation(summary = "创建一个目录", description = "创建一个目录")
    public MappingCategory createMappingCategory(@RequestBody MappingCategory mappingCategory) {
        if (mappingCategory.getParentId() == null || mappingCategory.getParentId() < 1) {
            throw new IllegalArgumentException(msgService.getMessage("invalidID"));
        }
        return mappingCategoryService.createCategory(mappingCategory);
    }

    @RequestMapping(value = "/{categoryId}", method = RequestMethod.DELETE)
    @Operation(summary = "删除指定的目录", description = "删除指定的目录")
    public void deleteCategory(@Parameter(description = "目录ID") @PathVariable("categoryId") Long categoryId) {
        if (categoryId == null || categoryId < 1) {
            throw new IllegalArgumentException(msgService.getMessage("invalidID"));
        }
        mappingCategoryService.deleteCategory(categoryId);
    }

}
