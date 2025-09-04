package com.datablau.base.server.controller;

import com.datablau.base.api.SelectOptionService70;
import com.datablau.base.data.SelectOptionDto;
import com.datablau.base.data.SelectOptionReqDto;
import com.datablau.base.data.SelectOptionResDto;
import com.datablau.base.server.dto.ResResultDto;
import com.datablau.base.server.utility.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/select/option")
@Tag(name = "查询选项")
public class SelectOptionController extends BaseController {

    @Autowired
    private SelectOptionService70 selectOptionService;

    public SelectOptionController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "获取选项")
    @PostMapping("/get")
    public List<SelectOptionResDto> getSelectOption(@RequestBody SelectOptionReqDto reqDto) {
        return selectOptionService.getSelectOption(reqDto);
    }

    @Operation(summary = "获取选项by父选项id")
    @PostMapping("/getByParentId")
    public List<SelectOptionResDto> getSelectOption(@Parameter(name = "parentId") @RequestParam Long parentId) {
        return selectOptionService.getSelectOptionByParentId(parentId);
    }

    @Operation(summary = "无实现")
    @PostMapping("/query/page")
    public List<SelectOptionResDto> getSelectOptionPage() {
        return null;
    }

    @Operation(summary = "添加规则")
    @PostMapping("/rule")
    public void addSelectOption(@RequestBody SelectOptionDto selectOptionDto) {
        selectOptionService.saveSelectOption(selectOptionDto);
    }

    @Operation(summary = "获取规则")
    @GetMapping("/rule/list")
    public ResResultDto<List<SelectOptionResDto>> getSelectOptions() {
        return ResResultDto.ok(selectOptionService.getRuleOptionsTree());
    }

    @Operation(summary = "删除规则")
    @PostMapping("/rule/delete")
    public ResResultDto<Boolean> deleteSelectOptions(@RequestParam("code") String code) {
       return ResResultDto.ok(selectOptionService.deleteRule(code));
    }

    @Operation(summary = "删除规则")
    @GetMapping("/rule/{id}")
    public ResResultDto<List<String>> deleteSelectOptions(@PathVariable("id") Integer id) {
       return ResResultDto.ok(selectOptionService.deleteRuleById(id));
    }

    @Operation(summary = "查询规则")
    @PostMapping("/rule/part")
    public ResResultDto<List<SelectOptionResDto>> getSelectOptions(@RequestParam("name") String name) {
       return ResResultDto.ok(selectOptionService.getOptions(name));
    }



}
