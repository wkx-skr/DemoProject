package com.datablau.domain.management.controller;

import com.datablau.domain.management.api.DomainService;
import com.datablau.domain.management.api.StandardUdpService;
import com.datablau.domain.management.dto.DomainQueryDto;
import com.datablau.domain.management.dto.StandardUdpDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/standards")
@Tag(name = "标准代码相关的REST API")
public class StandardController extends BaseController {

    @Autowired
    private StandardUdpService standardUdpService;

    @PostMapping("/udp/createUdps")
    @Operation(summary = "创建标准代码的UDP")
    public List<StandardUdpDto> createUdps(
            @RequestBody List<StandardUdpDto> udfs,
            @Parameter(name = "clear", description = "把UDP完全清除，并把当前系统中所有标准代码中的UDP清除。"
                    + "一般只有当UDP有属性被删除的时候需要传入true", required = true)
            @RequestParam(name = "clear", defaultValue = "false") Boolean forceClear,
            @Parameter(name = "categoryId", description = "UDP对应的分类的ID， "
                    + "如果不填默认是标准代码", required = true)
            @RequestParam(name = "categoryId", defaultValue = DomainService.DOMAIN_CATEGORY_ID_STR) Long categoryId) {
        return standardUdpService.batchCreateStandardUdps(udfs, categoryId, forceClear);
    }

    @PostMapping("/udp/getUdps")
    @Operation(summary = "获取所有用户自定义的标准代码属性")
    public List<StandardUdpDto> getAllUdps(@RequestBody DomainQueryDto queryDto) {
        return standardUdpService.getStandardUdps(queryDto.getCategoryId());
    }

}
