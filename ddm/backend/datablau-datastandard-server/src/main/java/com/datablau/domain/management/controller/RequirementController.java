package com.datablau.domain.management.controller;


import com.andorj.common.data.PageResult;
import com.datablau.domain.management.api.metric.RequirementDataobjectService;
import com.datablau.domain.management.api.metric.RequirementService;
import com.datablau.domain.management.dto.RequirementAnalysisDataobjectDto;
import com.datablau.domain.management.dto.RequirementAnalysisDto;
import com.datablau.domain.management.dto.RequirementAnalysisUdpDto;
import com.datablau.domain.management.dto.RequirementPageDto;
import com.datablau.domain.management.utility.DataUtility;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;

/**
 * @author feng - 数语科技有限公司
 * date 2022/02/14 14:28
 */
@RestController
@RequestMapping("/requirementmanagement")
@Tag( name = "需求管理")
public class RequirementController extends BaseController {

    @Autowired
    private RequirementService requirementService;

    @Autowired
    private RequirementDataobjectService requirementObjectService;


    /**
     * 查询需求分析信息
     */
    @Operation(summary = "查询需求分析信息", description = "根据目录分页查询")
    @RequestMapping(value = "/page", method = RequestMethod.POST)
    public PageResult<RequirementAnalysisDto> getMetricPage(@RequestBody RequirementPageDto requirementPageDto) {
        return requirementService.searchRequirementAnaly(requirementPageDto);
    }

    /**
     * 获取全部的需求分析
     */
    @Operation(summary = "获取全部的需求分析")
    @RequestMapping(value = "/getall", method = RequestMethod.POST)
    public List<RequirementAnalysisDto> getRequirement() {
        return requirementService.getRequirementAnalysis();
    }

    /**
     * 获取单个需求信息
     */
    @Operation(summary = "获取单个需求")
    @RequestMapping(value = "/get", method = RequestMethod.POST)
    public RequirementAnalysisDto getRequirement(@RequestParam("id") Long id) {
        return requirementService.getRequirementAnalysis(id);
    }


    /**
     * 创建需求
     *
     * @param requirementAnalysisDto
     */
    @Operation(summary = "创建需求")
    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public RequirementAnalysisDto createRequirement(@RequestBody RequirementAnalysisDto requirementAnalysisDto) {
        return requirementService.createRequirementAnalysis(requirementAnalysisDto);
    }


    /**
     * 更新需求
     *
     * @param requirementAnalysisDto
     */

    @Operation(summary = "更新需求")
    @RequestMapping(value = "/update", method = RequestMethod.POST)
    public RequirementAnalysisDto updateRequirement(@RequestBody RequirementAnalysisDto requirementAnalysisDto) {
        return requirementService.updateRequirementAnalysis(requirementAnalysisDto);
    }

    /**
     * 删除需求
     *
     * @param requirementList
     */
    @Operation(summary = "删除需求")
    @RequestMapping(value = "/delete", method = RequestMethod.POST)
    public Boolean deleteRequirementList(@RequestBody List<Long> requirementList) {
        return requirementService.deleteRequirementAnalysisList(requirementList);
    }


    /**
     * 获取需求的元数据信息
     *
     * @param
     * @return
     */
    @Operation(summary = "获取需求的元数据信息")
    @RequestMapping(value = "/requirementdataobjects/get", method = RequestMethod.POST)
    public List<RequirementAnalysisDataobjectDto> getRequirementDataObjects(@RequestBody List<Long> ids) {
        return requirementObjectService.getRequirementDataObjects(ids);
    }

    /**
     * 获取需求的元数据信息
     *
     * @param requestId
     * @return
     */
    @Operation(summary = "获取需求的元数据信息")
    @RequestMapping(value = "/requirementdataobject/get/list", method = RequestMethod.POST)
    public List<RequirementAnalysisDataobjectDto> getRequirementDataObject(@RequestBody Long requestId) {
        return requirementObjectService.getRequirementDataObject(requestId);
    }

    /**
     * 维护需求的元数据信息
     *
     * @param requirementId
     * @param requirementAnalysisDataobjectDtos
     * @return
     */
    @Operation(summary = "维护需求的元数据信息")
    @RequestMapping(value = "/requirementdataobject/maintain", method = RequestMethod.POST)
    public List<RequirementAnalysisDataobjectDto> maintainRequirementDataObject(@Parameter(name = "需求id", required = true) @RequestParam("requirementId") Long requirementId,
                                                                                @RequestBody List<RequirementAnalysisDataobjectDto> requirementAnalysisDataobjectDtos) {
        return requirementObjectService.maintainRequirementAnalysisDataObjects(requirementId, requirementAnalysisDataobjectDtos);
    }

    /**
     * 获取指标udp
     *
     * @param
     */
    @Operation(summary = "获取指标udp")
    @RequestMapping(value = "/udp/get", method = RequestMethod.POST)
    public List<RequirementAnalysisUdpDto> getRequirementAnalysisUdp() {
        return requirementService.getRequirementAnalysisUdp();
    }

    /**
     * 创建指标udp
     *
     * @param requirementAnalysisUdpDto
     * @return
     */
    @Operation(summary = "创建指标udp")
    @RequestMapping(value = "/udp/create", method = RequestMethod.POST)
    public RequirementAnalysisUdpDto createRequirementUdp(@RequestBody RequirementAnalysisUdpDto requirementAnalysisUdpDto) {
        return requirementService.creataRequirementAnalysisUdp(requirementAnalysisUdpDto);
    }

    /**
     * 更新指标udp
     *
     * @param requirementAnalysisUdpDto
     * @return
     */
    @Operation(summary = "更新指标udp")
    @RequestMapping(value = "/udp/update", method = RequestMethod.POST)
    public RequirementAnalysisUdpDto updateRequirementUdp(@RequestBody RequirementAnalysisUdpDto requirementAnalysisUdpDto) {
        return requirementService.updateRequirementAnalysisUdp(requirementAnalysisUdpDto);
    }


    /**
     * 删除指标udp
     *
     * @param udpIds
     * @return
     */
    @Operation(summary = "删除指标UDP")
    @RequestMapping(value = "/udp/delete", method = RequestMethod.POST)
    public Boolean deleteRequirementUdp(@RequestBody List<Long> udpIds) {
        return requirementService.deleteRequirementAnalysisUdps(udpIds);
    }


    /**
     * @param requirementPageDto
     * @return
     * @throws Exception
     */
    @Operation(summary = "导出需求")
    @RequestMapping(value = "/export", method = RequestMethod.POST)
    public ResponseEntity<byte[]> exportRequirement(@RequestBody RequirementPageDto requirementPageDto) throws Exception {
        return requirementService.exportRequirement(requirementPageDto);
    }

    /**
     * @param multipartFile
     * @throws Exception
     */
    @Operation(summary = "导入需求")
    @RequestMapping(value = "/upload", method = RequestMethod.POST)
    public void uploadRequirement(@RequestParam("file") MultipartFile multipartFile)
            throws Exception {
        File uploadFile = DataUtility.uploadFile(multipartFile);
        try {
            requirementService.uploadRequirement(uploadFile);
        } finally {
            uploadFile.delete();
        }

    }
}
