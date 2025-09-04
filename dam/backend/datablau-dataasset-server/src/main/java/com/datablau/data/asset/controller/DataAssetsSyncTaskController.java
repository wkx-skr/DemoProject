package com.datablau.data.asset.controller;

import com.andorj.common.data.PageResult;
import com.datablau.data.asset.api.DataAssetSyncTaskService;
import com.datablau.data.asset.bi.fine.exception.SDKException;
import com.datablau.data.asset.bi.sdk.entity.BaseCatalogQueryDto;
import com.datablau.data.asset.bi.sdk.entity.BaseDatasourceQueryDto;
import com.datablau.data.asset.dto.DataAssetSyncTaskDetailDto;
import com.datablau.data.asset.dto.DataAssetSyncTaskDto;
import com.datablau.data.asset.dto.DataAssetSyncTaskQueryParamsDto;
import com.datablau.data.asset.dto.DataAssetsCatalogDto;
import com.datablau.data.asset.dto.DataAssetsStructureDto;
import com.datablau.data.asset.dto.ResResultDto;
import com.datablau.data.common.controller.BaseController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;
import java.util.List;

/**
 * @ClassName : DataAssetsSyncTaskController
 * @Description : 数据资产同步任务
 * @Author : Xu XiaoQian
 * @Date : 2024/4/3
 **/
@Tag(name = "数据资产同步任务")
@RestController
@RequestMapping("/sync/bi")
public class DataAssetsSyncTaskController extends BaseController {

    @Autowired
    private DataAssetSyncTaskService taskService;

    @Operation(summary = "获取同步任务列表")
    @PostMapping(value = "/task/list")
    public ResResultDto<PageResult<DataAssetSyncTaskDetailDto>> getTasks(@RequestBody DataAssetSyncTaskQueryParamsDto paramsDto) {
        return ResResultDto.ok(taskService.getTasks(paramsDto));
    }

    @Operation(summary = "获取任务详情")
    @GetMapping(value = "/task/detail/{taskId}")
    public ResResultDto<DataAssetSyncTaskDetailDto> getTask(@PathVariable("taskId") Long taskId) {
        return ResResultDto.ok(taskService.getTask(taskId));
    }

    @Operation(summary = "获取任务详情")
    @GetMapping(value = "/task/detail/{taskId}/{enable}")
    public ResResultDto<DataAssetSyncTaskDetailDto> setEnable(@PathVariable("taskId") Long taskId, @PathVariable("enable") boolean enable) {
        return ResResultDto.ok(taskService.enabledTask(enable, taskId));
    }

    @Operation(summary = "添加同步任务")
    @PostMapping(value = "/task/add")
    public ResResultDto<PageResult<DataAssetSyncTaskDetailDto>> add(@RequestBody DataAssetSyncTaskDto dto) {
        dto.setCreator(this.getCurrentUser());
        dto.setUpdater(this.getCurrentUser());
        taskService.addTask(dto);
        return ResResultDto.ok();
    }

    @Operation(summary = "修改同步任务")
    @PostMapping(value = "/task/modify")
    public ResResultDto<Boolean> modify(@RequestBody DataAssetSyncTaskDto dto) {
        taskService.updateTask(dto);
        return ResResultDto.ok(true);
    }

    @Operation(summary = "删除同步任务")
    @PostMapping(value = "/task/delete/{taskId}")
    public ResResultDto<Boolean> delete(@PathVariable("taskId") Long taskId) {
        taskService.deleteTask(taskId);
        return ResResultDto.ok(true);
    }

    @Operation(summary = "测试同步任务")
    @PostMapping(value = "/task/test/{taskId}")
    public ResResultDto<Boolean> testTask(@PathVariable("taskId") Long taskId) {
        try {
            taskService.testTask(taskId);
            return ResResultDto.ok(true);
        } catch (SDKException e) {
            return ResResultDto.ok(false);
        }
    }

    @Operation(summary = "获取资产空间")
    @PostMapping(value = "/task/assets/structure")
    public ResResultDto<List<DataAssetsStructureDto>> assetsStructure() {
        return ResResultDto.ok(taskService.getAssetsStructure());
    }

    @Operation(summary = "获取资产目录")
    @PostMapping(value = "/task/assets/{structureId}/{catalogId}")
    public ResResultDto<Collection<DataAssetsCatalogDto>> assetsCatalog(@PathVariable("structureId") Long structureId, @PathVariable("catalogId") Long catalogId) {
        return ResResultDto.ok(taskService.getAssetsCatalog(structureId, catalogId));
    }

    @Operation(summary = "获取资产目录")
    @PostMapping(value = "/task/assets/search/{structureId}")
    public ResResultDto<Collection<DataAssetsCatalogDto>> searchAssetsCatalog(@PathVariable("structureId") Long structureId, @RequestParam("keywords") String keywords) {
        return ResResultDto.ok(taskService.searchAssetsCatalog(structureId, keywords));
    }

    @Operation(summary = "获取资产目录")
    @PostMapping(value = "/task/assets/subs/{structureId}/{catalogId}")
    public ResResultDto<List<Object[]>> subs(@PathVariable("structureId") Long structureId, @PathVariable("catalogId") Long catalogId) throws SDKException {
        return ResResultDto.ok(taskService.getSubIds(structureId, catalogId));
    }

    @Operation(summary = "测试BI目录")
    @PostMapping(value = "/task/bi/catalog")
    public ResResultDto<List<BaseCatalogQueryDto>> biCatalog(@RequestBody DataAssetSyncTaskDto dto) throws SDKException {
        return ResResultDto.ok(taskService.getBiCatalogs(dto));
    }

    @Operation(summary = "测试BI数据源")
    @PostMapping(value = "/task/bi/datasource")
    public ResResultDto<List<BaseDatasourceQueryDto>> biDatasource(@RequestBody DataAssetSyncTaskDto dto) throws SDKException {
        return ResResultDto.ok(taskService.getBiDatasource(dto));
    }

    @Operation(summary = "检查cron表达式")
    @PostMapping(value = "/task/cron/check")
    public ResResultDto<PageResult<DataAssetSyncTaskDetailDto>> cronCheck(@RequestParam("cron") String cron) {
        taskService.checkCron(cron);
        return ResResultDto.ok();
    }

    @Operation(summary = "检查目录占用情况")
    @PostMapping(value = "/task/catalog/check/{catalogId}")
    public ResResultDto<Boolean> checkCatalog(@PathVariable("catalogId") Long catalogId) {
        return ResResultDto.ok(taskService.checkCatalog(catalogId));
    }


}
