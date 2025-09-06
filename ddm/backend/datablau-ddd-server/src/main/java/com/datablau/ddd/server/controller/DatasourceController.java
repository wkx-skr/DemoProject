package com.datablau.ddd.server.controller;

import org.apache.commons.lang3.StringUtils;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.datablau.ddd.data.dto.DsDatasourceMappingDto;
import com.datablau.ddd.data.dto.ProdDatasourceMappingDto;
import com.datablau.ddd.data.dto.ResResultDto;
import com.datablau.ddd.data.dto.dolphinscheduler.ResultDto;
import com.datablau.ddd.data.jpa.entity.DsDatasourceMapping;
import com.datablau.ddd.data.jpa.entity.ProdDatasourceMapping;
import com.datablau.ddd.ds.service.DolphinSchedulerDataSourceService;
import com.datablau.ddd.server.service.api.DatasourceService;
import com.fasterxml.jackson.core.JsonProcessingException;
@RestController
@RequestMapping("/datasource")
public class DatasourceController {

    @Autowired
    DatasourceService datasourceService;

    @Autowired
    DolphinSchedulerDataSourceService dolphinSchedulerDataSourceService;

    @GetMapping("/")
    public List<DsDatasourceMapping> getDatasources(@RequestParam(value = "projectId", required = false) Long projectId) {
        return datasourceService.getDatasources(projectId);
    }

    @GetMapping("/getMapping/{damDatasourceId}")
    public DsDatasourceMapping getMappingByDamDatasourceId(@PathVariable(value = "damDatasourceId") Long id) {
        return datasourceService.getMappingByDamDatasourceId(id);
    }

    @PostMapping("/type/{type}")
    public List<DsDatasourceMapping> getDatasourcesByType(@PathVariable("type") String type) {
        return datasourceService.getDatasourcesByType(type);
    }

    @DeleteMapping("/{modelId}")
    public ResResultDto<String> deleteDsMappingById(@PathVariable("modelId") Long modelId) {
        datasourceService.deleteDsMappingById(modelId);
        return ResResultDto.ok();
    }

    @PostMapping("/bind")
    public void createDsMapping(@RequestBody DsDatasourceMappingDto dsDatasourceMappingDto) {
        datasourceService.createOrUpdateDsMapping(dsDatasourceMappingDto);
    }

    @GetMapping("/mapping")
    public List<ProdDatasourceMapping> getProdDatasourceMappingList() {
        return datasourceService.getProdDatasourceMappingList();
    }

    /**
     * 绑定生产数据源映射关系
     * @param prodDatasourceMappingDto
     */
    @PostMapping("/env/bind")
    public void createEnvDsMapping(@RequestBody ProdDatasourceMappingDto prodDatasourceMappingDto) {
        datasourceService.createEnvDsMapping(prodDatasourceMappingDto);
    }

    /**
     * 删除生产数据源映射关系
     * @param id
     */
    @DeleteMapping("/env/bind")
    public void deleteEnvDsMapping(@RequestParam("id") Long id) {
        datasourceService.deleteEnvDsMapping(id);
    }

    /**
     * 修改生产数据源映射关系
     * @param prodDatasourceMappingDto
     */
    @PutMapping("/env/bind")
    public void updateEnvDsMapping(@RequestBody ProdDatasourceMappingDto prodDatasourceMappingDto) {
        datasourceService.updateEnvDsMapping(prodDatasourceMappingDto);
    }

    @GetMapping("/dolphin")
    public List<ProdDatasourceMapping> getDolphinDatasourceList(@RequestParam(value = "searchVal", required = false, defaultValue = "") String searchVal,
                                                                @RequestParam(value = "type", required = false) String type,
                                                                @RequestParam(value = "env", required = false, defaultValue = "test") String env) throws JsonProcessingException {
        ResultDto<Object> datasourceList;
        if (StringUtils.isBlank(type)) {
            datasourceList =
                    dolphinSchedulerDataSourceService.getDataSourceList(env, type, 1, 10000, searchVal);
        } else {
            datasourceList =
                    dolphinSchedulerDataSourceService.getDataSourceList(env, "", 1, 10000, searchVal);
        }
        if (!datasourceList.isFailed()) {
            return (List<ProdDatasourceMapping>) ((LinkedHashMap) datasourceList.getData()).get("totalList");
        }
        return new ArrayList<>();
    }

    @GetMapping("/auth/refresh")
    public ResResultDto<String> refreshDolphinDatasourceAuth(@RequestParam("projectId") Long projectId,
                                                             @RequestParam(value = "env", required = false, defaultValue = "test") String env) {
        return datasourceService.refreshDolphinDatasourceAuth(projectId, env);
    }
}
