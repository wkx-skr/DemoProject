package com.datablau.archy.server.controller;

import com.datablau.archy.common.enums.ArchyType;
import com.datablau.archy.server.jpa.entity.ArchyDomainCategory;
import com.datablau.archy.server.jpa.entity.ArchyUdp;
import com.datablau.archy.server.service.ArchyDomainCategoryService;
import com.datablau.archy.server.service.ArchyUdpService;
import com.datablau.data.common.controller.BaseController;

import com.google.common.base.Strings;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @Author yudonghai - 北京数语科技有限公司
 * @Date 2022/7/27 16:27
 */
@Deprecated
@RestController
@RequestMapping("/domain")
@Tag(name = "Archy业务领域目录相关REST API", description = "Archy业务领域目录相关REST API")
public class ArchyDomainCategoryController extends BaseController {

    @Autowired
    private ArchyDomainCategoryService archyDomainCategoryService;

    @Autowired
    private ArchyUdpService archyUdpService;

    @Operation(summary = "查询目录")
    @GetMapping("/category")
    public Page<ArchyDomainCategory> findArchyDomainCategoriesByKeyword(@Parameter(description = "目录名", required = false) @RequestParam(name = "name", required = false) String keyword,
                                                                        @Parameter(description = "当前页，默认值是1", required = false) @RequestParam(name = "currentPage", required = false, defaultValue = "1") Integer currentPage,
                                                                        @Parameter(description = "页面大小", required = false) @RequestParam(name = "pageSize", required = false, defaultValue = "9999") Integer pageSize) {
        if (Strings.isNullOrEmpty(keyword)) {
            return archyDomainCategoryService.findArchyDomainCategories(PageRequest.of(currentPage - 1, pageSize));
        } else {
            return archyDomainCategoryService.findArchyDomainCategoriesByKeyword(keyword, PageRequest.of(currentPage - 1, pageSize));
        }
    }

    @Operation(summary = "查询目录树")
    @GetMapping("/category/tree")
    public List<ArchyDomainCategory> findArchyDomainCategoriesTree(@Parameter(description = "是否查询目录下的业务领域") @RequestParam(required = false, defaultValue = "true") boolean setArchyDomain) {
        return archyDomainCategoryService.findArchyDomainCategoriesTree(setArchyDomain);
    }

    @Operation(summary = "根据ID查询目录")
    @GetMapping("/category/{categoryId}")
    public ArchyDomainCategory findArchyDomainCategoryById(@Parameter(description = "目录ID", required = true) @PathVariable(name = "categoryId") Long id) {
        return archyDomainCategoryService.findArchyDomainCategoryById(id);
    }

    @Operation(summary = "创建目录")
    @PostMapping("/category")
    public ArchyDomainCategory createArchyDomainCategory(@RequestBody ArchyDomainCategory ArchyDomainCategory) {
        return archyDomainCategoryService.createArchyDomainCategory(ArchyDomainCategory);
    }

    @Operation(summary = "更新目录")
    @PutMapping("/category")
    public ArchyDomainCategory updateArchyDomainCategory(@RequestBody ArchyDomainCategory ArchyDomainCategory) {
        return archyDomainCategoryService.updateArchyDomainCategory(ArchyDomainCategory);
    }

    @Operation(summary = "删除目录")
    @DeleteMapping("/category/{categoryId}")
    public void deleteArchyDomainCategory(@Parameter(description = "目录ID", required = true) @PathVariable(name = "categoryId") Long id) {
        archyDomainCategoryService.deleteArchyDomainCategory(id);
    }

    @GetMapping(value = "/category/udps")
    @Operation(summary = "查询UDP")
    public List<ArchyUdp> getArchyDomainCategoryUdps() {
        return archyUdpService.getUdps(ArchyType.DOMAIN_CATEGORY);
    }

    @PostMapping(value = "/category/udp")
    @Operation(summary = "创建UDP")
    public void createArchyDomainCategoryUdp(@RequestBody List<ArchyUdp> udpList,
                                             @Parameter(description = "是否删除旧数据") @RequestParam(required = false, defaultValue = "false") Boolean forceClear) {
        archyUdpService.createUdps(udpList, ArchyType.DOMAIN_CATEGORY, forceClear);
    }

}
