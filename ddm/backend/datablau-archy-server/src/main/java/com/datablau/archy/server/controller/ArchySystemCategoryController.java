package com.datablau.archy.server.controller;

import com.datablau.archy.common.enums.ArchyType;
import com.datablau.archy.server.jpa.entity.ArchySystemCategory;
import com.datablau.archy.server.jpa.entity.ArchyUdp;
import com.datablau.archy.server.service.ArchySystemCategoryService;
import com.datablau.archy.server.service.ArchyUdpService;
import com.datablau.data.common.controller.BaseController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @Author yudonghai - 北京数语科技有限公司
 * @Date 2022/7/20 18:52
 */
@RestController
@RequestMapping("/system")
@Tag(name = "Archy系统目录相关REST API", description = "Archy系统目录REST API")
public class ArchySystemCategoryController extends BaseController {

    @Autowired
    private ArchySystemCategoryService archySystemCategoryService;

    @Autowired
    private ArchyUdpService archyUdpService;

//    @Operation(summary = "查询系统目录")
//    @GetMapping("/categories")
//    public Page<ArchySystemCategory> findArchySystemCategoriesByKeyword(@Parameter(description = "系统目录名") @RequestParam(name = "name", required = false) String keyword,
//                                                                        @Parameter(description = "当前页，默认值是1") @RequestParam(name = "currentPage", required = false, defaultValue = "1") Integer currentPage,
//                                                                        @Parameter(description = "页面大小") @RequestParam(name = "pageSize", required = false, defaultValue = "9999") Integer pageSize) {
//        if (Strings.isNullOrEmpty(keyword)) {
//            return archySystemCategoryService.findArchySystemCategories(PageRequest.of(currentPage - 1, pageSize));
//        } else {
//            return archySystemCategoryService.findArchySystemCategoriesByKeyword(keyword, PageRequest.of(currentPage - 1, pageSize));
//        }
//    }

    @Operation(summary = "查询系统目录树")
    @GetMapping("/category/tree")
    public List<ArchySystemCategory> findArchySystemCategoryTree(@Parameter(description = "是否查询目录下的应用系统") @RequestParam(required = false, defaultValue = "true") boolean setArchySystem) {
        return archySystemCategoryService.findArchySystemCategoryTree(setArchySystem);
    }

    @Operation(summary = "查询系统分类")
    @GetMapping("/category/tree/rough")
    public List<ArchySystemCategory> findArchySystemCategoryTree() {
        return archySystemCategoryService.findArchySystemCategoryTreeRough();
    }

    @Operation(summary = "根据ID查询系统目录")
    @GetMapping("/category/{categoryId}")
    public ArchySystemCategory findArchySystemCategoryById(@Parameter(description = "系统目录ID", required = true) @PathVariable(name = "systemId") Long id) {
        return archySystemCategoryService.findArchySystemCategoryById(id);
    }

    @Operation(summary = "创建系统目录")
    @PostMapping("/category")
    public ArchySystemCategory createArchySystemCategory(@RequestBody ArchySystemCategory archySystemCategory) {
        return archySystemCategoryService.createArchySystemCategory(archySystemCategory);
    }

    @Operation(summary = "更新系统目录")
    @PutMapping("/category")
    public ArchySystemCategory updateArchySystemCategory(@RequestBody ArchySystemCategory archySystemCategory) {
        return archySystemCategoryService.updateArchySystemCategory(archySystemCategory);
    }

    @Operation(summary = "删除系统目录")
    @DeleteMapping("/category/{categoryId}")
    public void deleteArchySystemCategory(@Parameter(description = "系统目录ID", required = true) @PathVariable(name = "categoryId") Long categoryId) {
        archySystemCategoryService.deleteArchySystemCategory(categoryId);
    }

    @GetMapping(value = "/category/udps")
    @Operation(summary = "查询UDP")
    public List<ArchyUdp> getArchySystemCategoryUdps() {
        return archyUdpService.getUdps(ArchyType.SYSTEM_CATEGORY);
    }

    @PostMapping(value = "/category/udp")
    @Operation(summary = "创建UDP")
    public void createArchySystemCategoryUdp(@RequestBody List<ArchyUdp> udpList,
                                             @Parameter(description = "是否删除旧数据") @RequestParam(required = false, defaultValue = "false") Boolean forceClear) {
        archyUdpService.createUdps(udpList, ArchyType.SYSTEM_CATEGORY, forceClear);
    }
}
