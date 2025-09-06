package com.datablau.archy.server.controller;

import com.datablau.archy.server.dto.query.ArchyModelQueryDto;
import com.datablau.archy.server.jpa.entity.ArchyModel;
import com.datablau.archy.server.service.ArchyModelService;
import com.datablau.data.common.controller.BaseController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/model")
@Tag(name = "Archy模型相关REST API", description = "Archy模型REST API")
public class ArchyModelController extends BaseController {

    @Autowired
    private ArchyModelService archyModelService;

    @Operation(summary = "根据条件查询模型")
    @PostMapping("/models")
    public Page<ArchyModel> findModels(@RequestBody ArchyModelQueryDto archyModelQueryDto,
                                       @Parameter(description = "当前页，默认值是1") @RequestParam(name = "currentPage", required = false, defaultValue = "1") Integer currentPage,
                                       @Parameter(description = "页面大小") @RequestParam(name = "pageSize", required = false, defaultValue = "9999") Integer pageSize) {
        return archyModelService.findModels(archyModelQueryDto, currentPage, pageSize);
    }
}
