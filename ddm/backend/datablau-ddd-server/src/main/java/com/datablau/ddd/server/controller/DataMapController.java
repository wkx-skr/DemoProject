package com.datablau.ddd.server.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.datablau.ddd.data.dto.D3LineageSourceDto;
import com.datablau.ddd.data.dto.ProjectDto;
import com.datablau.ddd.server.service.api.DataMapService;
import io.swagger.v3.oas.annotations.Operation;

/**
 * @author Lx
 * 数据地图
 */
@RestController
@RequestMapping("/dataMap")
public class DataMapController {

    @Autowired
    private DataMapService dataMapService;

    @Operation(summary = "通过系统id查项目", description = "通过系统id查项目")
    @GetMapping("/{categoryId}")
    public List<ProjectDto> getProjectByCategoryId(@PathVariable(value = "categoryId") Long categoryId) {
        return dataMapService.getProjectByCategoryId(categoryId);
    }

    @Operation(summary = "传入系统间的血缘关系,查询血缘文件和开发程序", description = "传入系统间的血缘关系,查询血缘文件和开发程序")
    @GetMapping("/{sourceId}/{targetId}/{type}")
    public List<D3LineageSourceDto> getLineageSource(@PathVariable(value = "sourceId") Long sourceId,
                                                     @PathVariable(value = "targetId") Long targetId,
                                                     @PathVariable(value = "type") Integer type) {
        return dataMapService.getLineageSource(sourceId, targetId, type);
    }

}
