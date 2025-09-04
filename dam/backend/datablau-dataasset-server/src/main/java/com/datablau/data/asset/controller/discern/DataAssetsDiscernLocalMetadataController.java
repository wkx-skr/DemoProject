package com.datablau.data.asset.controller.discern;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.data.PageResult;
import com.datablau.data.asset.api.discern.DataAssetsDiscernLocalMetadataService;
import com.datablau.data.asset.dto.ResResultDto;
import com.datablau.data.asset.utils.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.datasource.data.DatasourceProperties;
import com.datablau.metadata.common.dto.model.ModelDto;
import com.datablau.security.management.api.RoleService;
import com.datablau.metadata.common.dto.ModelQueryDto;
import io.swagger.v3.oas.annotations.Operation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Collection;
import java.util.List;

/**
 * 数据安全元数据相关接口
 *
 * @author weijiakun
 * @create 2023-12-05 14:16
 */
@RestController
@RequestMapping(value = "/metadata")
public class DataAssetsDiscernLocalMetadataController extends BaseController {

    private static final Logger LOGGER = LoggerFactory.getLogger(DataAssetsDiscernLocalMetadataController.class);

    @Autowired
    private DataAssetsDiscernLocalMetadataService localMetadataService;

    public DataAssetsDiscernLocalMetadataController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "获取当前系统下所有的逻辑数据源")
    @GetMapping("/{categoryId}/logic/")
    public ResResultDto<List<ModelDto>> getLogicModelByCategoryId(@PathVariable("categoryId") Long categoryId) {
        return ResResultDto.ok(localMetadataService.getLogicModelDtoListByCategoryId(categoryId));
    }

    @Operation(summary = "数据源下拉列表")
    @GetMapping("/model/{modelId}")
    public ResResultDto<List<ModelDto>> searchItemDataSource(@PathVariable("modelId")Long modelId) {
        return ResResultDto.ok(localMetadataService.getModelDtoListByModelId(modelId));
    }

    @Operation(summary = "获取当前数据源连接信息")
    @GetMapping("/datasource/prop/{modelId}")
    public ResResultDto<List<DatasourceProperties>> getDatasourcePropertiesById(@PathVariable("modelId")Long modelId) {
        return ResResultDto.ok(localMetadataService.getDatasourceEntityDtoById(modelId));
    }

    @Operation(summary = "通过类型获取数据源")
    @PostMapping(value = "/type")
    public ResResultDto<Collection<ModelDto>> getModelsByType(@RequestParam(value = "type") String type) {
        return ResResultDto.ok(localMetadataService.getModelDtosOfType(type));
    }

    @Operation(summary = "分页获取数据源")
    @PostMapping("/models/fromre/page")
    @Description("分页获取数据源")
    public PageResult<ModelDto> getModelsPage(
            @Description("显示逻辑模型，而不显示逻辑模型之下的") @RequestParam(value = "showLogicalModel", defaultValue = "false") boolean showLogicalModel,
            @RequestBody ModelQueryDto queryDto) {
        return localMetadataService.getModelsPageWithSort(queryDto, showLogicalModel,null);
    }

}
