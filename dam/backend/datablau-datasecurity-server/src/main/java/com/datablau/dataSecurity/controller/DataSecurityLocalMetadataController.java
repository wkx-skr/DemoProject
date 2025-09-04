package com.datablau.dataSecurity.controller;

import com.andorj.model.common.search.MultipleCriteria;
import com.datablau.data.common.controller.BaseController;
import com.datablau.dataAccess.dto.ResResultDto;
import com.datablau.dataAccess.service.api.DataSecurityLocalMetadataService;
import com.datablau.dataAccess.utility.ServerConstants;
import com.datablau.datasource.data.DatasourceProperties;
import com.datablau.metadata.common.api.DatablauRemoteDamModelService;
import com.datablau.metadata.common.dto.model.ModelDto;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 数据安全元数据相关接口
 *
 * @author weijiakun
 * @create 2023-12-05 14:16
 */
@RestController
@RequestMapping(value = "/metadata")
public class DataSecurityLocalMetadataController extends BaseController {

    private static final Logger LOGGER = LoggerFactory.getLogger(DataSecurityLocalMetadataController.class);

    @Autowired
    private DataSecurityLocalMetadataService localMetadataService;

    @Autowired
    @Qualifier("datablauRemoteDamModelService")
    protected DatablauRemoteDamModelService datablauRemoteDamModelService;

    public DataSecurityLocalMetadataController(@Autowired RoleService roleService) {
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

    @Operation(summary = "根据系统获取数据源下拉列表")
    @GetMapping("/{categoryId}/model")
    public ResResultDto<List<ModelDto>> searchDataSource(@PathVariable("categoryId")Long categoryId) {
        MultipleCriteria multipleCriteria = new MultipleCriteria();
        multipleCriteria.addFieldEqualsCriteria("categoryId", categoryId, false);
//        multipleCriteria.addFieldEqualsCriteria("logicalModel", true, true);
        return ResResultDto.ok(datablauRemoteDamModelService.getDataModel(multipleCriteria).list().stream().filter(m -> !m.getType().equals("SMBSHAREFILE")).collect(Collectors.toList()));
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


}
