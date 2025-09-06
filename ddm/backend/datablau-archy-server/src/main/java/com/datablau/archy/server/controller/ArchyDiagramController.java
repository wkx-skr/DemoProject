package com.datablau.archy.server.controller;

import com.datablau.archy.server.dto.query.ArchyDiagramQueryDto;
import com.datablau.archy.server.jpa.entity.ArchyDiagram;
import com.datablau.archy.server.service.ArchyDiagramService;
import com.datablau.data.common.controller.BaseController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/diagram")
@Tag(name = "Archy流转图相关REST API", description = "Archy流转图REST API")
public class ArchyDiagramController extends BaseController {

    @Autowired
    private ArchyDiagramService archyDiagramService;

    @Operation(summary = "根据条件查询流转图")
    @PostMapping("/diagrams")
    public Page<ArchyDiagram> findArchyDiagramsByCategoryId(@RequestBody ArchyDiagramQueryDto archyDiagramQueryDto,
                                                            @Parameter(description = "当前页，默认值是1") @RequestParam(name = "currentPage", required = false, defaultValue = "1") Integer currentPage,
                                                            @Parameter(description = "页面大小") @RequestParam(name = "pageSize", required = false, defaultValue = "9999") Integer pageSize) {
        return archyDiagramService.findArchyDiagrams(archyDiagramQueryDto, currentPage, pageSize);
    }

    @Operation(summary = "创建流转图")
    @PostMapping("/diagram")
    public ArchyDiagram createArchyDiagram(@RequestBody ArchyDiagram diagram) {
        return archyDiagramService.createArchyDiagram(diagram);
    }

    @Operation(summary = "更新流转图")
    @PutMapping("/diagram")
    public ArchyDiagram updateArchyDiagram(@RequestBody ArchyDiagram diagram) {
        return archyDiagramService.updateArchyDiagram(diagram);
    }

    @Operation(summary = "删除流转图")
    @DeleteMapping("/diagram/{diagramId}")
    public void deleteArchyDiagram(@Parameter(description = "系统域ID", required = true) @PathVariable Long diagramId) {
        archyDiagramService.deleteArchyDiagram(diagramId);
    }
}
