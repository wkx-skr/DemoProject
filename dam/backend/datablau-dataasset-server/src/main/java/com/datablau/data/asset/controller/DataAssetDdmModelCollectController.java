package com.datablau.data.asset.controller;


import com.andorj.common.data.PageResult;
import com.datablau.data.asset.dto.DdmCollectElementTaskParamDto;
import com.datablau.data.asset.dto.DdmModelCollectDto;
import com.datablau.data.asset.dto.DdmRelModelCategoryDto;
import com.datablau.data.asset.service.DataAssetDdmModelCollectService;
import com.datablau.data.asset.service.DdmRelModelCategoryService;
import com.datablau.project.api.dto.DdmModelInfoQueryDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "资产-模型元数据采集相关 API")
@RestController
@RequestMapping(value = "/ddm/collect")
public class DataAssetDdmModelCollectController {

    @Autowired
    private DataAssetDdmModelCollectService dataAssetDdmModelCollectService;
    @Autowired
    private DdmRelModelCategoryService ddmRelModelCategoryServicel;


    @Operation(summary = "模型元数据采集查询")
    @PostMapping("/queryDdmModelInfoPage")
    public PageResult<DdmModelCollectDto> queryDdmModelInfoPage(@RequestBody DdmModelInfoQueryDto queryDto) {
        PageResult<DdmModelCollectDto> dtoPageResult = dataAssetDdmModelCollectService.queryDdmModelInfoPage(queryDto);
        return dtoPageResult;
    }

    @Operation(summary = "模型元数据采集-关联应用系统")
    @PostMapping("/updateDdmRelModelCategory")
    public void saveOrUpdateDdmRelModelCategory(@RequestBody DdmRelModelCategoryDto relModelCategoryDto) {
        ddmRelModelCategoryServicel.saveOrUpdateDdmRelModelCategory(relModelCategoryDto);
    }

    @Operation(summary = "创建模型元数据采集任务")
    @PostMapping("/createDdmCollectTask")
    public Long createDdmCollectElementTask(@RequestBody DdmCollectElementTaskParamDto paramDto) throws Exception {
        return dataAssetDdmModelCollectService.createTask(paramDto);
    }

    @Operation(summary = "创建模型元数据采集任务")
    @GetMapping("/test")
    public void test(@RequestParam Long ddmModelId) throws Exception {
        dataAssetDdmModelCollectService.test(ddmModelId);
    }

}
