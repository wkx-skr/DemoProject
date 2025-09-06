package com.datablau.ddd.server.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.andorj.model.common.search.MultipleCriteria;
import com.datablau.ddd.data.dto.ModelQueryDto;
import com.datablau.ddd.data.dto.ResResultDto;
import com.datablau.ddd.data.dto.dolphinscheduler.DsDataSourceParamDTO;
import com.datablau.ddd.server.service.api.DataSourceSyncService;
import com.datablau.ddd.server.utils.DatasourceSyncUtils;
import com.datablau.metadata.common.dto.model.ModelDto;
import com.fasterxml.jackson.core.JsonProcessingException;
import io.swagger.v3.oas.annotations.Operation;

/**
 * @author Lx
 * 数据源同步
 */
@RestController
@RequestMapping("/dataSourceSync")
public class DataSourceSyncController {

    @Autowired
    private DataSourceSyncService dataSourceSyncService;

    @Operation(summary = "新增数据源", description = "新增数据源")
    @PostMapping
    public ResResultDto<Object> createDataSource(@RequestBody DsDataSourceParamDTO dsDTO) {

        return dataSourceSyncService.createDataSource(dsDTO, false);
    }

    @Operation(summary = "删除数据源", description = "删除数据源")
    @DeleteMapping("/{id}")
    public ResResultDto<Object> deleteDataSource(@PathVariable(value = "id") Long id,
                                                 @RequestParam("env") String env) {
        return dataSourceSyncService.deleteDataSource(id, env);
    }

    @Operation(summary = "修改数据源", description = "修改数据源")
    @PutMapping
    public ResResultDto<Object> updateDataSource(@RequestBody DsDataSourceParamDTO dsDTO) {

        return dataSourceSyncService.updateDataSource(dsDTO);
    }

    @Operation(summary = "通过id查询数据源", description = "通过id查询数据源")
    @GetMapping("/{id}")
    public ResResultDto<Object> queryDataSource(@PathVariable(value = "id") Long id,
                                                @RequestParam("env") String env) {
        return dataSourceSyncService.queryDataSource(id, env);
    }

    @Operation(summary = "datasourceId查采集Id", description = "datasourceId查采集Id")
    @PostMapping("/getModelId")
    public ResResultDto<Object> getModelId(@RequestBody ModelQueryDto dto) {

        MultipleCriteria criteria = new MultipleCriteria();
        criteria.addFieldEqualsCriteria("datasourceId", dto.getDatasourceId(), false);

        if (DatasourceSyncUtils.isSchema(dto.getType())) {
            criteria.addFieldEqualsCriteria("schema", dto.getDatabase(), false);
        } else {
            criteria.addFieldEqualsCriteria("database", dto.getDatabase(), false);
        }

        List<ModelDto> models = dataSourceSyncService.getModels(criteria);
        if (CollectionUtils.isEmpty(models)) {
            return ResResultDto.ok();
        }
        return ResResultDto.ok(models.stream().map(ModelDto::getModelId).distinct().toList());
    }

    @Operation(summary = "测试连接", description = "测试连接")
    @PostMapping("/verify")
    public ResResultDto<Object> verifyConnect(@RequestBody DsDataSourceParamDTO dsDTO) throws JsonProcessingException {

        return dataSourceSyncService.verifyConnect(dsDTO);

    }

}
