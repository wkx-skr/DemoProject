package com.datablau.data.asset.controller;

import com.datablau.catalog.enums.EnumSupportType;
import com.datablau.data.asset.api.DataAssetsCatalogService;
import com.datablau.data.asset.api.DataAssetsDashboardService;
import com.datablau.data.asset.dto.DashboardDto;
import com.datablau.data.asset.dto.DataAssetsCatalogDto;
import com.datablau.data.asset.dto.ResResultDto;
import com.datablau.data.asset.jpa.entity.DataAssetsDashboard;
import com.datablau.data.asset.jpa.entity.DataAssetsDashboardApplyTrend;
import com.datablau.data.asset.jpa.entity.DataAssetsDashboardPublishFlow;
import com.datablau.data.asset.jpa.entity.DataAssetsDashboardQuality;
import com.datablau.data.asset.jpa.entity.DataAssetsDashboardTop10;
import com.datablau.data.asset.service.DataAssetsDashboardServiceExt;
import com.datablau.data.asset.utils.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/dashboard")
public class DataAssetsDashboardController extends BaseController {

    @Autowired
    private DataAssetsDashboardService dataAssetsDashboardService;
    @Autowired
    private DataAssetsCatalogService catalogService;
    @Autowired
    private DataAssetsDashboardServiceExt dashboardServiceExt;

    @Operation(summary = "搜索")
    @GetMapping("/search/asset")
    public ResResultDto<?> searchAsset(@RequestParam(value = "keyWord") Long keyWord) {
        return ResResultDto.ok();
    }

    @Operation(summary = "数据超市收录数据情况")
    @GetMapping("/statistics")
    public ResResultDto<?> statisticsResult() {
        return ResResultDto.ok(dataAssetsDashboardService.getAssetTotalCountWithoutPermission());
    }

    @Operation(summary = "热门目录")
    @GetMapping("/top/catalog")
    public ResResultDto<?> topCatalog() {
        return ResResultDto.ok(dataAssetsDashboardService.getTopVisitCatalog(getCurrentUser()));
    }

    @Operation(summary = "推荐数据")
    @GetMapping("/recommend/data")
    public ResResultDto<?> recommendData() {
        return ResResultDto.ok(dataAssetsDashboardService.getTopVisitAsset(getCurrentUser()));
    }

    @Operation(summary = "已发布的一级目录节点")
    @GetMapping("/first/catalog/{structureId}")
    public ResResultDto<Collection<DataAssetsCatalogDto>> getFirstCatalog(@PathVariable("structureId") Long structureId) {
        return ResResultDto.ok(catalogService.getFirstCatalog(structureId, getCurrentUser()));
    }


    /**
     * 标准规范数据（个）：标准被引用到资产目录DL5的次数。
     *
     * @return
     */
    @Operation(summary = "标准规范数据（个）：标准被引用到资产目录DL5的次数。")
    @GetMapping("/getAssetsDomainNum")
    public ResResultDto<Integer> getAssetsDomainNum(){
        return ResResultDto.ok(dashboardServiceExt.getAssetsDomainNum());
    }




    public DataAssetsDashboardController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "查看资产总量以及各类型资产数量")
    @GetMapping("/sum/{structureId}")
    public ResResultDto<List<DashboardDto>> getSum(@PathVariable("structureId") Long structureId){
        return ResResultDto.ok(dataAssetsDashboardService.getSumAndRatio(structureId));
    }

    @Operation(summary = "查看资产发布流程转化")
    @GetMapping("/trans/{structureId}")
    public ResResultDto<List<DataAssetsDashboardPublishFlow>> getTrans(@PathVariable("structureId") Long structureId){
        return ResResultDto.ok(dataAssetsDashboardService.getTransIncrement(structureId));
    }

    @Operation(summary = "查看目录资产分布")
    @GetMapping("/distribution/{structureId}")
    public ResResultDto<Map<String,List<DashboardDto>>> getDistribution(@PathVariable("structureId") Long structureId){
        List<DashboardDto> dashboardDtoList = dataAssetsDashboardService.getAssetsByCatalog(structureId);
        if (CollectionUtils.isEmpty(dashboardDtoList)){
            return null;
        }
        return ResResultDto.ok(dashboardDtoList.stream().collect(Collectors.groupingBy(DashboardDto::getCatalogName)));
    }

    @Operation(summary = "查看资产安全等级占比")
    @GetMapping("/access/{structureId}")
    public ResResultDto<List<DashboardDto>> getAccess(@PathVariable("structureId") Long structureId){
        return ResResultDto.ok(dataAssetsDashboardService.getAccessLevel(structureId));
    }

    @Operation(summary = "查看目录top10")
    @GetMapping("/top/{structureId}")
    public ResResultDto<List<DataAssetsDashboardTop10>> getTop10(@PathVariable("structureId") Long structureId){
        return ResResultDto.ok(dataAssetsDashboardService.getTop10OfCatalog(structureId));
    }

    @Operation(summary = "查看目录概览")
    @GetMapping("/overview/{structureId}")
    public ResResultDto<List<DashboardDto>> getOverview(@PathVariable("structureId") Long structureId){
        return ResResultDto.ok(dataAssetsDashboardService.getCatalogInfo(structureId));
    }

    @Operation(summary = "查看质量问题数")
    @GetMapping("/quality/{structureId}")
    public ResResultDto<List<DataAssetsDashboardQuality>> getQuality(@PathVariable("structureId") Long structureId){
        return ResResultDto.ok(dataAssetsDashboardService.getQualityNums(structureId));
    }

    @Operation(summary = "查看质量问题数（按目录名）")
    @GetMapping("/quality/type/{structureId}")
    public ResResultDto<List<DataAssetsDashboardQuality>> getQualityByType(@PathVariable("structureId") Long structureId){
        return ResResultDto.ok(dataAssetsDashboardService.getQualityNumsByName(structureId));
    }

    @Operation(summary = "查看发布状态占比")
    @GetMapping("/publish/{structureId}")
    public ResResultDto<List<DataAssetsDashboard>> getPublish(@PathVariable("structureId") Long structureId){
        return ResResultDto.ok(dataAssetsDashboardService.getPublishType(structureId));
    }

    @Operation(summary = "查看各部门资产")
    @GetMapping("/dept/{structureId}")
    public ResResultDto<Map<String,List<DataAssetsDashboard>>> getDept(@PathVariable("structureId") Long structureId){
        return ResResultDto.ok(dataAssetsDashboardService.getAssetsByDept(structureId));
    }

    @Operation(summary = "查看漏斗")
    @GetMapping("/funnel/{structureId}")
    public ResResultDto<List<DataAssetsDashboard>> getFunnel(@PathVariable("structureId") Long structureId){
        return ResResultDto.ok(dataAssetsDashboardService.getFunnel(structureId));
    }


    @Operation(summary = "查看数据资产申请趋势")
    @GetMapping(value = "/assets/apply/{structureId}")
    public ResResultDto<Map<EnumSupportType, List<DataAssetsDashboardApplyTrend>>> getAssetsApplyTrend(@PathVariable Long structureId){
        Map<EnumSupportType,List<DataAssetsDashboardApplyTrend>> assetsApplyTrend = dataAssetsDashboardService.getAssetsApplyTrend(structureId);
        return ResResultDto.ok(assetsApplyTrend);
    }

}
