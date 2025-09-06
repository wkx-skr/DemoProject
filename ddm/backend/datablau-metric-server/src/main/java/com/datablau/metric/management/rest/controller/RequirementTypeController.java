package com.datablau.metric.management.rest.controller;

import com.andorj.common.data.PageResult;
import com.datablau.metric.management.api.metric.RequirementTypeService;
import com.datablau.metric.management.dto.RequirementTypeDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @Author: zzl
 * @createTime 11 18:16
 * @description
 */
@RestController
@RequestMapping("/requirementType")
@Tag(name = "需求类型")
public class RequirementTypeController {

    @Autowired
    private RequirementTypeService requirementTypeService;

    /**
     * 查看
     *
     * @param id
     * @return
     */
    @Operation(summary = "查看需求类型")
    @RequestMapping(value = "/get", method = RequestMethod.POST)
    public RequirementTypeDto findById(@Parameter(name = "目录id") @RequestParam("id") Long id) {
        return requirementTypeService.findById(id);
    }

    /**
     * 更新
     *
     * @param requirementTypeDto
     */
    @Operation(summary = "更新需求类型")
    @RequestMapping(value = "/update", method = RequestMethod.POST)
    public void updateRequirementType(@RequestBody RequirementTypeDto requirementTypeDto) {
        requirementTypeService.updateRequirementType(requirementTypeDto);
    }

    /**
     * 新建
     *
     * @param requirementTypeDto
     */
    @Operation(summary = "创建需求类型")
    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public void createRequirementType(@RequestBody RequirementTypeDto requirementTypeDto) {
        requirementTypeService.createRequirementType(requirementTypeDto);
    }

    /**
     * 删除
     *
     * @param id
     */
    @Operation(summary = "删除需求类型")
    @RequestMapping(value = "/delete", method = RequestMethod.POST)
    public void deleteRequirementType(@Parameter(name = "目录id") @RequestParam("id") Long id) {
        requirementTypeService.deleteRequirementType(id);
    }

    /**
     * 分页
     *
     * @param pageSize
     * @param currentPage
     * @return
     */
    @Operation(summary = "需求类型分页")
    @RequestMapping(value = "/page", method = RequestMethod.POST)
    public PageResult<RequirementTypeDto> findePage(@RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize,
                                                    @RequestParam(value = "currentPage", defaultValue = "1") Integer currentPage) {
        return requirementTypeService.requirementeTypePageInfo(pageSize, currentPage);

    }

}
