package com.datablau.data.asset.controller;

import com.datablau.data.asset.api.DataAssetsDetailService;
import com.datablau.data.asset.dto.*;
import com.datablau.data.common.controller.BaseController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * Description: new java files header..
 *
 * @author liuhao
 * @version 1.0
 * @date 2023/11/6 15:16
 */
@Tag(name = "数据资产详情")
@RestController
@RequestMapping("/detail")
public class DataAssetsDetailController extends BaseController {
    @Autowired
    private DataAssetsDetailService detailService;

    @Operation(summary = "报表基本查询")
    @GetMapping("/report/base/{assetId}")
    public ResResultDto<ReportBaseDto> getReportBaseInfo(@PathVariable("assetId") Long assetId) {
        return ResResultDto.ok(detailService.getReportBaseInfo(assetId, getCurrentUser()));
    }

    @Operation(summary = "报表详情查询")
    @GetMapping("/report/detail/{assetId}")
    public ResResultDto<ReportDetailDto> getReportDetail(@PathVariable("assetId") Long assetId) {
        return ResResultDto.ok(detailService.getReportDetail(assetId));
    }

    @Operation(summary = "报表其他信息查询")
    @GetMapping("/report/other/{assetId}")
    public ResResultDto<ReportOtherDto> getReportOtherInfo(@PathVariable("assetId") Long assetId) {
        return ResResultDto.ok(detailService.getReportOtherInfo(assetId));
    }

    @Operation(summary = "获取文件基本信息")
    @GetMapping(value = "/file/base/{assetId}")
    public ResResultDto<FileBaseDto> getFileBaseInfo(@PathVariable("assetId") Long assetId) {
        return ResResultDto.ok(detailService.getFileBaseInfo(assetId, getCurrentUser()));
    }

    @Operation(summary = "报表其他信息查询")
    @GetMapping("/file/detail/{assetId}")
    public ResResultDto<FileDetailDto> getFileDetail(@PathVariable("assetId") Long assetId) {
        return ResResultDto.ok(detailService.getFileDetail(assetId));
    }
}
