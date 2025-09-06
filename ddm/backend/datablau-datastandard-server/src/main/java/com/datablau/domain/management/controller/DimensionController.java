package com.datablau.domain.management.controller;

import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.data.PageResult;
import com.datablau.domain.management.api.metric.DimensionService;
import com.datablau.domain.management.dto.*;
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
import java.util.List;

/**
 * @Author Nicky - 数语科技有限公司
 * @Date 2018/7/18 15:43
 */
@RestController
@RequestMapping("/dimension")
@Tag(name = "维度")
public class DimensionController extends BaseController {

    @Autowired
    private DimensionService dimensionService;


    /**
     * 查询需维度信息
     */
    @Operation(summary = "查询需维度信息", description = "根据目录分页查询")
    @RequestMapping(value = "/page", method = RequestMethod.POST)
    public PageResult<DimensionDto> getDimensionPage(@RequestBody DimensionPageDto dimensionPageDto) {
        return dimensionService.getDimensionPage(dimensionPageDto);
    }

    /**
     * 获取全部的维度信息
     */
    @Operation(summary = "获取全部的维度信息")
    @RequestMapping(value = "/getall", method = RequestMethod.POST)
    public List<DimensionDto> getDimensions() {
        return dimensionService.findAllDimension();
    }


    /**
     * 获取需求关联的维度信息
     */
    @Operation(summary = "获取需求关联的维度信息")
    @RequestMapping(value = "/requirement/get", method = RequestMethod.POST)
    public List<DimensionDto> getRequirementDimensions(@Parameter(name = "需求id") @RequestParam("id") Long id) {
        return dimensionService.getRequirementDimensions(id);
    }

    /**
     * 获取单个维度
     */
    @Operation(summary = "获取单个维度")
    @RequestMapping(value = "/get", method = RequestMethod.POST)
    public DimensionDto getDimension(@RequestParam("id") Long id) {
        return dimensionService.getDimension(id);
    }


    /**
     * 创建维度
     *
     * @param dimensionDto
     */
    @Operation(summary = "创建维度")
    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public DimensionDto createDimension(@RequestBody DimensionDto dimensionDto) {
        return dimensionService.createDimension(dimensionDto);
    }


    /**
     * 更新维度
     *
     * @param dimensionDto
     */

    @Operation(summary = "更新维度")
    @RequestMapping(value = "/update", method = RequestMethod.POST)
    public DimensionDto updateDimension(@RequestBody DimensionDto dimensionDto) {
        return dimensionService.updateDimension(dimensionDto);
    }

    /**
     * 删除维度
     *
     * @param dimensionList
     */
    @Operation(summary = "删除维度")
    @RequestMapping(value = "/delete", method = RequestMethod.POST)
    public Boolean deleteDimensionList(@RequestBody List<Long> dimensionList) {
        dimensionService.deleteDimensions(dimensionList);
        return true;
    }


    /**
     * 获取维度的纬度值树
     */
    @Operation(summary = "获取维度的纬度值树")
    @RequestMapping(value = "/tree/get", method = RequestMethod.POST)
    public List<DimensionValueTreeDto> getDimensionValueTree(@RequestParam("id") Long id) {
        return dimensionService.getDimensionValueTree(id);
    }

    /**
     * 获取维度的纬度值集合
     */
    @Operation(summary = "获取维度的纬度值集合")
    @RequestMapping(value = "/list/get", method = RequestMethod.POST)
    public List<DimensionValueTreeDto> getDimensionValueList(@RequestParam("id") Long id) {
        return dimensionService.getDimensionValueList(id);
    }


    /**
     * 创建维度值
     *
     * @param dimensionValueDto
     */
    @Operation(summary = "创建维度值")
    @RequestMapping(value = "/value/create", method = RequestMethod.POST)
    public DimensionValueTreeDto createDimensionValue(@RequestBody DimensionValueDto dimensionValueDto) {
        return dimensionService.createDimensionValue(dimensionValueDto);
    }


    /**
     * 更新维度值
     *
     * @param dimensionValueDto
     */

    @Operation(summary = "更新维度值")
    @RequestMapping(value = "/value/update", method = RequestMethod.POST)
    public DimensionValueTreeDto updateDimensionValue(@RequestBody DimensionValueDto dimensionValueDto) {
        return dimensionService.updateDimensionValue(dimensionValueDto);
    }

    /**
     * 删除维度值
     *
     * @param dimensionValueList
     */
    @Operation(summary = "删除维度值")
    @RequestMapping(value = "/value/delete", method = RequestMethod.POST)
    public Boolean deleteDimensionValueList(@RequestBody List<Long> dimensionValueList) {
        return dimensionService.deleteDimensionValueTrees(dimensionValueList);
    }


    /**
     * 维护维度值
     */
    @Operation(summary = "维护维度值")
    @RequestMapping(value = "/value/maintain", method = RequestMethod.POST)
    public List<DimensionValueTreeDto> maintainDimensionValueList(
            @Parameter(name = "维度id", required = true) @RequestParam("dimensionId") Long dimensionId,
            @RequestBody List<DimensionValueDto> dimensionValueDtos) {
        return dimensionService.maintainDimensionValueList(dimensionId, dimensionValueDtos);
    }

    /**
     * 获取维度udp
     *
     * @param
     */
    @Operation(summary = "获取维度udp")
    @RequestMapping(value = "/udp/get", method = RequestMethod.POST)
    public List<RequirementAnalysisUdpDto> getDimensionUdp(@RequestParam(name = "category", required = false) String type) {
        if (Strings.isNullOrEmpty(type)) {
            type = String.valueOf(LDMTypes.oDataDimension);
        }
        // 维度值 udp 使用id 82800032
        return dimensionService.getDimensionUdp(type);
    }

    /**
     * 创建维度udp
     *
     * @param requirementAnalysisUdpDto
     * @return
     */
    @Operation(summary = "创建维度udp")
    @RequestMapping(value = "/udp/create", method = RequestMethod.POST)
    public RequirementAnalysisUdpDto createDimensionUdp(@RequestBody RequirementAnalysisUdpDto requirementAnalysisUdpDto) {
        return dimensionService.createDimensionUdp(requirementAnalysisUdpDto);
    }

    /**
     * 更新维度udp
     *
     * @param requirementAnalysisUdpDto
     * @return
     */
    @Operation(summary = "更新维度udp")
    @RequestMapping(value = "/udp/update", method = RequestMethod.POST)
    public RequirementAnalysisUdpDto updateDimensionUdp(@RequestBody RequirementAnalysisUdpDto requirementAnalysisUdpDto) {
        return dimensionService.updateDimensionUdp(requirementAnalysisUdpDto);
    }


    /**
     * 删除维度udp
     *
     * @param udpIds
     * @return
     */
    @Operation(summary = "删除维度UDP")
    @RequestMapping(value = "/udp/delete", method = RequestMethod.POST)
    public Boolean deleteDimensionUdp(@RequestBody List<Long> udpIds) {
        return dimensionService.deleteDimensionUdps(udpIds);
    }

    @Operation(summary = "下载维度导入模板")
    @RequestMapping(value = "/downloadTemplate", method = RequestMethod.POST)
    public ResponseEntity<byte[]> downloadDimensionTemplate() throws Exception {
        return DataUtility.generalResponseEntityByFile(dimensionService.downloadDimensionTemplate());
    }


    /**
     * @param dimensionPageDto
     * @return
     * @throws Exception
     */
    @Operation(summary = "导出维度")
    @RequestMapping(value = "/export", method = RequestMethod.POST)
    public ResponseEntity<byte[]> exportDimension(@RequestBody DimensionPageDto dimensionPageDto) throws Exception {
        return dimensionService.exportDimension(dimensionPageDto);
    }

    /**
     * @param file
     * @param published
     * @throws Exception
     */
    @Operation(summary = "导入维度")
    @RequestMapping(value = "/import", method = RequestMethod.POST)
    public void importDimension(@RequestParam("file") MultipartFile file, @RequestParam(value = "published", defaultValue = "false") Boolean published)
            throws Exception {
        File uploadedFile = DataUtility.uploadFile(file);
        try {
            dimensionService.importDimension(uploadedFile, published, getCurrentUser());
        } finally {
            uploadedFile.delete();
        }

    }


    @Operation(summary = "下载层次及维度值导入模板")
    @RequestMapping(value = "/value/downloadTemplate", method = RequestMethod.POST)
    public ResponseEntity<byte[]> downloadDimensionValueTemplate(@RequestParam Long dimensionId) throws Exception {
        return DataUtility.generalResponseEntityByFile(dimensionService.downloadDimensionValueTemplate(dimensionId));
    }


    @Operation(summary = "导出层次及维度值")
    @RequestMapping(value = "/value/export", method = RequestMethod.POST)
    public ResponseEntity<byte[]> exportDimensionValue(@RequestParam Long dimensionId) throws Exception {
        return dimensionService.exportDimensionValue(dimensionId);
    }

    @Operation(summary = "导入层次及维度值")
    @RequestMapping(value = "/value/import", method = RequestMethod.POST)
    public void importDimensionValue(@RequestParam("file") MultipartFile file, @RequestParam(value = "overwrite", defaultValue = "false") Boolean overwrite, @RequestParam(value = "dimensionId") Long dimensionId)
            throws Exception {
        File uploadedFile = DataUtility.uploadFile(file);
        try {
            dimensionService.importDimensionValue(uploadedFile, overwrite, dimensionId);
        } finally {
            uploadedFile.delete();
        }

    }
}
