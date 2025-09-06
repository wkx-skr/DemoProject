package com.datablau.archy.server.controller;

import com.datablau.archy.server.jpa.entity.ArchyDiagramCategory;
import com.datablau.archy.server.service.ArchyDiagramCategoryService;
import com.datablau.data.common.controller.BaseController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/diagram")
@Tag(name = "Archy流转图目录相关REST API", description = "Archy流转图目录REST API")
public class ArchyDiagramCategoryController extends BaseController {

    @Autowired
    private ArchyDiagramCategoryService archyDiagramCategoryService;

    @Operation(summary = "查询流转图目录树")
    @GetMapping("/category/tree")
    public List<ArchyDiagramCategory> findArchyDiagramCategoryTree(@Parameter(description = "是否查询目录下的应用") @RequestParam(required = false, defaultValue = "false") boolean setArchyDiagram) {
        return archyDiagramCategoryService.findArchyDiagramCategoryTree(setArchyDiagram);
    }

    @Operation(summary = "根据ID查询流转图目录")
    @GetMapping("/category/{categoryId}")
    public ArchyDiagramCategory findArchyDiagramCategoryById(@Parameter(description = "目录ID", required = true) @PathVariable(name = "categoryId") Long id) {
        return archyDiagramCategoryService.findArchyDiagramCategoryById(id);
    }

    @Operation(summary = "创建流转图目录")
    @PostMapping("/category")
    public ArchyDiagramCategory createArchyDiagramCategory(@RequestBody ArchyDiagramCategory archyDiagramCategory) {
        return archyDiagramCategoryService.createArchyDiagramCategory(archyDiagramCategory);
    }

    @Operation(summary = "更新流转图目录")
    @PutMapping("/category")
    public ArchyDiagramCategory updateArchyDiagramCategory(@RequestBody ArchyDiagramCategory archyDiagramCategory) {
        return archyDiagramCategoryService.updateArchyDiagramCategory(archyDiagramCategory);
    }

    @Operation(summary = "删除流转图目录")
    @DeleteMapping("/category/{categoryId}")
    public void deleteArchyDiagramCategory(@Parameter(description = "目录ID", required = true) @PathVariable(name = "categoryId") Long categoryId) {
        archyDiagramCategoryService.deleteArchyDiagramCategory(categoryId);
    }

}
