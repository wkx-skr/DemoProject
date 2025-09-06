package com.datablau.domain.management.controller;


import com.datablau.domain.management.api.metric.GeneralCategoryService;
import com.datablau.domain.management.dto.GeneralCategoryNodeDto;
import com.datablau.domain.management.jpa.entity.metric.GeneralCategory;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @Author Nicky - 数语科技有限公司
 * @Date 2018/7/18 15:43
 */
@RestController
@RequestMapping("/categories")
@Tag(name = "通用目录管理")
public class GeneralCategoryController extends BaseController {

    @Autowired
    private GeneralCategoryService categoryService;

    /**
     * @param category
     * @return
     */
//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "db_uni_category",
//            systemModule = OperationModuleType.DOMAIN_CATEGORY,
//            description = "创建子目录的内容"
//    )
    @Operation(summary = "创建子目录的内容", description = "第一层目录parentId传null")
    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public GeneralCategory createCategory(@RequestBody GeneralCategory category) {
        return categoryService.createCategory(category);
    }

    /**
     * @param categoryId
     */
//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_uni_category",
//            systemModule = OperationModuleType.DOMAIN_CATEGORY,
//            description = "删除子目录的Id："
//    )
    @Operation(summary = "删除子目录")
    @RequestMapping(value = "/delete", method = RequestMethod.POST)
    public void deleteCategory(@RequestParam("categoryId") Long categoryId) {
        categoryService.deleteCategoryById(categoryId);
    }

    /**
     * @param categoryId
     * @param category
     * @param merge
     * @return
     */
//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "db_uni_category",
//            systemModule = OperationModuleType.DOMAIN_CATEGORY,
//            description = "修改子目录的内容："
//    )
    @Operation(summary = "修改子目录")
    @RequestMapping(value = "/update", method = RequestMethod.POST)
    public GeneralCategory updateCategory(@RequestParam("categoryId") Long categoryId,
                                          @RequestBody GeneralCategory category,
                                          @RequestParam(name = "merge", defaultValue = "false") boolean merge) {
        category.setCategoryId(categoryId);
        return categoryService.updateCategory(category, merge);
    }

    /**
     * @param type
     * @return
     */
    @Operation(summary = "获取目录列表")
    @RequestMapping(value = "/get", method = RequestMethod.POST)
    public List<GeneralCategory> getCategories(@RequestParam("type") Long type) {
        return categoryService.getAllCategories(type);
    }

    /**
     * @param type
     * @return
     */
    @Operation(summary = "获取目录树")
    @RequestMapping(value = "/tree", method = RequestMethod.POST)
    public GeneralCategoryNodeDto getCategoryTree(@RequestParam("type") Long type) {
        return categoryService.getCategoryTreeByType(type);
    }


}
