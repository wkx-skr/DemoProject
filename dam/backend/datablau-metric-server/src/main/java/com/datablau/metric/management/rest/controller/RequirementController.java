package com.datablau.metric.management.rest.controller;


import com.andorj.common.data.PageResult;
import com.datablau.metric.management.api.metric.RequirementDataobjectService;
import com.datablau.metric.management.api.metric.RequirementService;
import com.datablau.metric.management.dto.RequirementAnalysisDataobjectDto;
import com.datablau.metric.management.dto.RequirementAnalysisDto;
import com.datablau.metric.management.dto.RequirementAnalysisUdpDto;
import com.datablau.metric.management.dto.RequirementPageDto;
import com.datablau.metric.management.jpa.entity.StoredFile;
import com.datablau.metric.management.jpa.entity.metric.RequirementAnalysis;
import com.datablau.metric.management.jpa.entity.metric.RequirementAnalysisHistory;
import com.datablau.metric.management.utility.DataUtility;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.File;
import java.io.IOException;
import java.util.List;
import javax.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

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
     * 根据需求分析ID,获取多个需求信息
     */
    @Operation(summary = "根据需求分析ID获取需求信息")
    @PostMapping(value = "/requirements")
    public List<RequirementAnalysisDto> getRequirementsByIds(@RequestBody List<Long> requirements) {
        return requirementService.getRequirementAnalysisByIds(requirements);
    }

    /**
     * 查询需求分析信息, 过滤参数中的需求ID
     */
    @Operation(summary = "查询需求分析信息并过滤")
    @RequestMapping(value = "/page/filter", method = RequestMethod.POST)
    public PageResult<RequirementAnalysisDto> getMetricPageByFilter(@RequestBody RequirementPageDto requirementPageDto) {
        return requirementService.searchRequirementAnalyByFilter(requirementPageDto);
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

    @Operation(summary = "上传文件")
    @PostMapping(value = "/file/upload")
    public StoredFile uploadFile(@RequestPart("file") MultipartFile multipartFile) throws IOException {
        return requirementService.uploadFile(multipartFile);
    }

    @Operation(summary = "删除文件")
    @GetMapping(value = "/file/delete")
    public void deleteFile(@RequestParam("fileId") String fileId) {
        requirementService.deleteFile(fileId);
    }

    @Operation(summary = "下载文件")
    @GetMapping("/file/download")
    public void downloadFile(@RequestParam("fileId") String fileId,
                             HttpServletResponse response) {
        requirementService.downloadFile(fileId, response);
    }

    @Operation(summary = "获取上传文件列表")
    @GetMapping("/file")
    public List<StoredFile> getUploadFiles(@RequestParam("fileIds") String fileIds) {
        return requirementService.getUploadFiles(fileIds);
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


    /**
     * 需求申请变更
     * @param requirementAnalysis
     */
    @Operation(summary = "申请变更")
    @RequestMapping(value = "/apply/change", method = RequestMethod.POST)
    public RequirementAnalysis requirementChangedApprove(@RequestBody RequirementAnalysis requirementAnalysis) {
        return requirementService.requirementChangedApprove(requirementAnalysis);
    }

    /**
     * 需求申请废弃
     * @param requirementAnalysis
     */
    @Operation(summary = "申请废弃")
    @RequestMapping(value = "/apply/abolish", method = RequestMethod.POST)
    public void requirementAbolishApprove(@RequestBody RequirementAnalysis requirementAnalysis) {
        requirementService.requirementAbolishApprove(requirementAnalysis);
    }

    /**
     * 查询需求变更后历史
     * @param requirementId
     * @return
     */
    @Operation(summary = "查询历史")
    @RequestMapping(value = "/history", method = RequestMethod.GET)
    public List<RequirementAnalysisHistory> findHistoryByRequirementId(@RequestParam("id") Long requirementId) {
        return requirementService.findHistoryByRequirementId(requirementId);
    }

    /**
     * 根据版本号查询历史详情
     * @param requirementId
     * @param version
     * @return
     */
    @Operation(summary = "根据版本号查询历史详情")
    @RequestMapping(value = "/history/detail", method = RequestMethod.GET)
    public RequirementAnalysisHistory findHistoryDetailByRequirementIdAndVersion(@RequestParam("id") Long requirementId,
                                                                                 @RequestParam("version") Long version) {
        return requirementService.findHistoryDetailByRequirementIdAndVersion(requirementId, version);
    }
}
