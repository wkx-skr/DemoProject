package com.datablau.data.asset.controller;

import com.datablau.data.asset.dto.*;
import com.datablau.data.asset.jpa.entity.CheckBuName;
import com.datablau.data.asset.jpa.entity.CheckResultHandlerResult;
import com.datablau.data.asset.jpa.entity.CheckUserName;
import com.datablau.data.asset.jpa.repository.CheckBuNameRepository;
import com.datablau.data.asset.jpa.repository.CheckUserNameRepository;
import com.datablau.data.asset.service.PipeAssetsCheckService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.util.ExcelUtil;
import com.google.common.collect.Lists;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.util.*;
import java.util.stream.Collectors;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-05-27 09:21
 * @description
 */

@Tag(name = "数据资产检查 API")
@RestController
@RequestMapping(value = "/checkResult")
public class DataAssetsCheckResultController extends BaseController {

    @Autowired
    private CheckUserNameRepository checkUserNameRepository;

    @Autowired
    private CheckBuNameRepository checkBuNameRepository;

    @Autowired
    private PipeAssetsCheckService pipeAssetsCheckService;


    @Operation(summary = "用户列表")
    @GetMapping(value = "/user/list")
    public List<CheckUserName> userList() {
        return (List<CheckUserName>)checkUserNameRepository.findAll();
    }


    @Operation(summary = "业务域列表")
    @GetMapping(value = "/bu/list")
    public List<CheckBuName> buNamesList() {
        return (List<CheckBuName>)checkBuNameRepository.findAll();
    }

    // 获取月度趋势图




  //  获取各业务排名
    @PostMapping(value = "/simple/bu/ac/rate")
    public List<BuAcRateDto> simpleBuAcRate(@RequestBody CheckQueryDto queryDto) {
       return pipeAssetsCheckService.getBuAcRateWithQuery(queryDto);
    }


    // 负责人统计纬度指标详情
    @PostMapping(value = "/user/ac/rate")
    public Page<BuAcRateDetailDto> userAcRate(@RequestBody CheckQueryDetailDto queryDto) {
        return pipeAssetsCheckService.getBuAcUserRateWithQuery(queryDto);
    }

    @PostMapping(value = "/bu/ac/rate")
    public Page<BuAcRateDetailDto> buAcRate(@RequestBody CheckQueryDetailDto queryDto) {
        return pipeAssetsCheckService.getBuAcUBuRateWithQuery(queryDto);
    }

    @GetMapping(value = "/bu/ac/rate/test")
    public void buAcRateTest() {
         pipeAssetsCheckService.checkAssetsElement();
    }


    // 月度变化
    @PostMapping(value = "/month")
    public List<AssetsDetailResultDto> monthChange(@RequestBody CheckQueryDto queryDto){
        List<AssetsDetailResultDto> result =   pipeAssetsCheckService.monthChange(queryDto);
        return result;
    }


    @PostMapping(value = "/need/check")
    public  Page<CheckResultHandlerResult> needCheck(@RequestBody CheckQueryDto queryDto){
        Page<CheckResultHandlerResult> result =   pipeAssetsCheckService.needHandle(queryDto);
        return result;
    }



    @PostMapping("/need/check/export")
    public   void exportBatchInfo(@RequestBody CheckQueryDto queryDto, HttpServletResponse response) {
        List<CheckResultHandlerResult> all = pipeAssetsCheckService.exportData(queryDto);
        Map<String, List<List<Object>>> sheets = new LinkedHashMap<>();

        if (!CollectionUtils.isEmpty(all)) {
            // 转 DTO
            List<CheckResultHandlerResultDto> dtos = all.stream().map(entity -> {
                CheckResultHandlerResultDto dto = new CheckResultHandlerResultDto();
                dto.setTypeId(entity.getTypeId());
                dto.setBuName(entity.getBuName());
                dto.setUserName(entity.getUserName());
                dto.setCnName(entity.getCnName());
                dto.setEnName(entity.getEnName());
                dto.setBatchNu(entity.getBatchNu());
                return dto;
            }).collect(Collectors.toList());
            // 分批切分，每 100w 条数据一个 sheet
            int num = 1;
            for (List<CheckResultHandlerResultDto> part : Lists.partition(dtos, 1_000_000)) {
                sheets.put("sheet" + num, ExcelUtil.getSheetData(part));
                num++;
            }
        }

        // 即使没有数据也导出空 sheet
        ExcelUtil.exportManySheetByList(response, "数据处理结果", sheets);
    }













}
