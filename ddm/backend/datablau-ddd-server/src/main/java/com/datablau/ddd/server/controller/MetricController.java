package com.datablau.ddd.server.controller;

import static com.datablau.ddd.server.controller.CodeController.FOLDER_NOT_EXIST;

import org.apache.poi.ss.formula.functions.T;

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

import cn.hutool.core.lang.tree.Tree;

import com.datablau.ddd.common.dto.ResultWrapper;
import com.datablau.ddd.common.exception.BusinessException;
import com.datablau.ddd.data.dto.MetricDto;
import com.datablau.ddd.data.dto.MetricInfoDto;
import com.datablau.ddd.data.jpa.entity.Metric;
import com.datablau.ddd.server.service.api.MetricTreeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "metricsController")
@RestController()
@RequestMapping("/metrics")
public class MetricController {

    @Autowired
    MetricTreeService metricTreeService;

    @Operation(summary = "指标开发", description = "指标开发")
    @PostMapping("/build/metrics")
    public ResultWrapper<Metric> saveMetrics(@RequestBody MetricInfoDto metric) {
        List<Metric> metricList = metricTreeService.getSuspectDup(metric.getMetric());
        if (metricList.size() > 0) {
            throw new BusinessException("已存在同名的建模分析文件");
        }
        return metricTreeService.saveMetrics(metric);
    }

    @Operation(summary = "指标开发", description = "指标开发")
    @PutMapping("/build/metrics")
    public ResultWrapper<Metric> updateMetrics(@RequestBody MetricInfoDto metric) {
        Metric m = metricTreeService.getMetricsById(metric.getMetric().getId());
        if (m == null) {
            throw new BusinessException(FOLDER_NOT_EXIST);
        }
        List<Metric> metricList = metricTreeService.getSuspectDup(metric.getMetric());
        if (metricList.size() > 1) {
            throw new BusinessException("duplicateFolderNames");
        }
        return metricTreeService.updateMetrics(metric);
    }

    @Operation(summary = "指标开发", description = "指标开发")
    @GetMapping("/build/getMetricsTree/{projectId}")
    public ResultWrapper<List<Tree<Long>>> getMetricsTree(@PathVariable(value = "projectId") Long projectId) {
        return metricTreeService.getMetricsTree(projectId);
    }

    @Operation(summary = "指标开发", description = "指标开发")
    @GetMapping("/build/getMetricsTree/{projectId}/Dir")
    public ResultWrapper<List<Tree<Long>>> getMetricsTreeDir(@PathVariable(value = "projectId") Long projectId) {
        return metricTreeService.getMetricsTreeDir(projectId);
    }

    @Operation(summary = "指标开发", description = "指标开发")
    @GetMapping("/build/getMetrics")
    public ResultWrapper<Metric> getMetrics(@RequestParam("id") Long id) {
        return metricTreeService.getMetrics(id);
    }

    @Operation(summary = "指标开发", description = "指标开发")
    @DeleteMapping("/build/deleteMetrics")
    public ResultWrapper<T> deleteMetrics(@RequestParam("id") Long id) {
        Metric m = metricTreeService.getMetricsById(id);
        if (m == null) {
            throw new BusinessException(FOLDER_NOT_EXIST);
        }
        return metricTreeService.deleteMetrics(id);
    }

    @Operation(summary = "自动建模获取SQL前去重")
    @PostMapping("/build/duplicate")
    public void duplicateColumn(@RequestBody List<MetricDto> columns) {
        metricTreeService.duplicateColumn(columns);
    }

    @Operation(summary = "获取sql", description = "获取sql")
    @PostMapping("/build/getSql")
    public ResultWrapper<String> getSql(@RequestBody List<MetricDto> columns) {
        return metricTreeService.getSql(columns);
    }
}
