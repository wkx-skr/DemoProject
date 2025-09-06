package com.datablau.domain.management.controller;

import com.andorj.common.data.PageResult;
import com.datablau.domain.management.api.metric.ModifierTypeService;
import com.datablau.domain.management.dto.ModifierTypePageDto;
import com.datablau.domain.management.dto.ModifierValuePageDto;
import com.datablau.domain.management.dto.metric.ModifierTypeDto;
import com.datablau.domain.management.jpa.entity.metric.ModifierValue;
import com.datablau.domain.management.utility.DataUtility;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.elasticsearch.common.Strings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author zhangKun - 数语科技有限公司
 * date 2023/01/16 17:09
 */
@RestController
@RequestMapping("/modifier")
@Tag(name = "修饰类型")
public class ModifierTypeController extends BaseController {

    @Autowired
    private ModifierTypeService modifierTypeService;

    /**
     * 查询修饰类型
     */
    @Operation(summary = "查询修饰类型", description = "根据目录分页查询")
    @RequestMapping(value = "/page", method = RequestMethod.POST)
    public PageResult<ModifierTypeDto> getDimensionPage(@RequestBody ModifierTypePageDto modifierTypePageDto) {
        return modifierTypeService.getModifierTypePage(modifierTypePageDto);
    }

    /**
     * 根据id查询修饰类型
     */
    @Operation(summary = "根据id查询修饰类型")
    @RequestMapping(value = "/getType", method = RequestMethod.POST)
    public ModifierTypeDto getType(@Parameter(name = "id",description = "修饰类型、时间周期id") @RequestParam(name = "id") Long id) {
        return modifierTypeService.getModifierTypeById(id);
    }

    /**
     * 创建修饰类型
     *
     * @param modifierTypeDto
     */
    @Operation(summary = "创建修饰类型")
    @PostMapping(value = "/createModifierType")
    public void createModifierType(@RequestBody ModifierTypeDto modifierTypeDto) {
        modifierTypeService.createModifierType(modifierTypeDto);
    }

    @Operation(summary = "更新修饰类型")
    @PostMapping(value = "/updateModifierType")
    public void updateModifierType(@RequestBody ModifierTypeDto modifierTypeDto) {
        modifierTypeService.updateModifierType(modifierTypeDto);
    }

    @Operation(summary = "删除修饰类型")
    @PostMapping(value = "/deleteModifierType")
    public void deleteModifierType(@Parameter(name = "修饰类型id") @RequestParam(name = "id") List<Long> id) {
        for (Long one : id) {
            modifierTypeService.deleteModifierType(one);
        }
    }

    @Operation(summary = "创建修饰词")
    @PostMapping(value = "/createModifierValue")
    public void createModifierValue(@RequestBody ModifierValue modifierValue) {
        modifierTypeService.createModifierValue(modifierValue);
    }

    @Operation(summary = "更新修饰词")
    @PostMapping(value = "/updateModifierValue")
    public void updateModifierValue(@RequestBody ModifierValue modifierValue) {
        modifierTypeService.updateModifierValue(modifierValue);
    }

    @Operation(summary = "修饰词分页")
    @PostMapping(value = "/getModifierValuePage")
    public PageResult<ModifierValue> updateModifierValue(@RequestBody ModifierValuePageDto modifierValuePageDto) {
        return modifierTypeService.getModifierValuePage(modifierValuePageDto);
    }

    /**
     * 根据id查询修饰词
     */
    @Operation(summary = "根据id查询修饰词")
    @RequestMapping(value = "/getValue", method = RequestMethod.POST)
    public ModifierValue getValue(@Parameter(name = "id",description = "修饰词、时间周期id") @RequestParam(name = "id") Long id) {
        return modifierTypeService.getValueById(id);
    }


    @Operation(summary = "删除修饰词")
    @PostMapping(value = "/deleteModifierValue")
    public void deleteModifierValue(@Parameter(name = "修饰词id") @RequestParam(name = "id") Long id) {
        modifierTypeService.deleteModifierValue(id);
    }

    @Operation(summary = "下载模板")
    @PostMapping(value = "/downloadTemplate")
    public ResponseEntity<byte[]> downloadTemplate(
            @Parameter(name = "type", description = "BASE:基础修饰类型, TIME_PERIOD:时间周期")
            @RequestParam(name = "type") String modifierTypeCategory) throws Exception {
        return modifierTypeService.downloadTemplate(modifierTypeCategory);
    }

    @Operation(summary = "导出修饰词")
    @RequestMapping(value = "/exportModifier", method = RequestMethod.POST)
    public ResponseEntity<byte[]> exportModifier(
            @Parameter(name = "catalogId") @RequestParam("catalogId") Long catalogId,
            @Parameter(name = "ids") @RequestParam(value = "ids", required = false) String ids,
            @Parameter(name = "type", description = "BASE:基础修饰类型, TIME_PERIOD:时间周期")
            @RequestParam("type") String modifierTypeCategory) throws Exception {
        List<Long> idList = new ArrayList<>();
        if (!Strings.isNullOrEmpty(ids)) {
            idList = Arrays.asList(ids.split(",")).stream().map(s -> Long.valueOf(s)).collect(Collectors.toList());
        }
        return modifierTypeService.exportModifier(catalogId, modifierTypeCategory, idList);
    }

    @Operation(summary = "导入修饰词")
    @RequestMapping(value = "/importModifier", method = RequestMethod.POST)
    public void importModifier(
            @Parameter(name = "file", description = "文件", required = true)
            @RequestParam("file") MultipartFile multipartFile,
            @Parameter(name = "type", description = "BASE:基础修饰类型, TIME_PERIOD:时间周期")
            @RequestParam("type") String modifierTypeCategory) throws Exception {
        File uploadedFile = DataUtility.uploadFile(multipartFile);
        try {
            modifierTypeService.importModifier(uploadedFile, modifierTypeCategory);
        }finally {
            uploadedFile.delete();
        }
    }


}
