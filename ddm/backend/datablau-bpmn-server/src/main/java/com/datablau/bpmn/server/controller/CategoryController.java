package com.datablau.bpmn.server.controller;


import com.andorj.model.common.api.MessageService;
import com.datablau.bpmn.server.jpa.entity.BpmnCategory;
import com.datablau.bpmn.server.service.api.BpmnCategoryService;
import com.datablau.data.common.controller.BaseController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/categories")
@Tag(name = "模型库目录相关REST API", description = "模型库目录相关REST API")
public class CategoryController extends BaseController {

    private static final Logger logger = LoggerFactory.getLogger(CategoryController.class);

    @Autowired
    private BpmnCategoryService bpmnCategoryService;

    @Autowired
    private MessageService msgService;


    @RequestMapping(value = "/", method = RequestMethod.POST)
    @Operation(summary = "创建一个目录", description = "创建一个目录")
    public BpmnCategory createCategory(@Parameter(description = "目录", required = true) @RequestBody BpmnCategory category) {
        if (category.getParentId() == null || category.getParentId() < 1) {
            throw new IllegalArgumentException(msgService.getMessage("invalidID"));
        }

        return bpmnCategoryService.createCategory(category);
    }


    @RequestMapping(value = "/{categoryId}", method = RequestMethod.PUT)
    @Operation(summary = "给指定的目录改名", description = "给指定的目录改名")
    @Parameters({@Parameter(name = "categoryId", description = "目录ID", in = ParameterIn.PATH, required = true)})
    public BpmnCategory renameCategory(@PathVariable("categoryId") Long categoryId,
                                   @Parameter(description = "目录", required = true) @RequestBody BpmnCategory category) {
        if (categoryId == null || categoryId < 1) {
            throw new IllegalArgumentException(msgService.getMessage("invalidID"));
        }

        return bpmnCategoryService
                .updateCategory(categoryId, category.getName(), category.getDescription(),
                        category.getAlias());
    }



    @RequestMapping(value = "/{categoryId}", method = RequestMethod.DELETE)
    @Operation(summary = "删除指定的目录", description = "删除指定的目录")
    @Parameters({@Parameter(name = "categoryId", description = "目录ID", in = ParameterIn.PATH, required = true)})
    public void deleteCategory(@PathVariable("categoryId") Long categoryId) {
        if (categoryId == null || categoryId < 1) {
            throw new IllegalArgumentException(msgService.getMessage("invalidID"));
        }

        bpmnCategoryService.deleteCategory(categoryId);
    }



    @RequestMapping(method = RequestMethod.POST, value = "/move")
    @Operation(summary = "移动目录至另一个目录", description = "移动目录至另一个目录")
    public BpmnCategory moveCategory(
            @Parameter(name = "targetCatId", description = "目标目录ID") @RequestParam(name = "targetCatId") Long targetCatId,
            @Parameter(name = "oriCatId", description = "原目录ID") @RequestParam(name = "oriCatId") Long oriCatId) {
        if (targetCatId == null || targetCatId < 1 || oriCatId == null || oriCatId < 1) {
            throw new IllegalArgumentException(msgService.getMessage("invalidID"));
        }
        return bpmnCategoryService.moveCategory(targetCatId, oriCatId);
    }


}
