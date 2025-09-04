package com.datablau.metric.management.rest.controller;

import com.andorj.common.data.PageResult;
import com.datablau.metric.management.api.metric.QueryThemeService;
import com.datablau.metric.management.dto.QueryTableDto;
import com.datablau.metric.management.dto.QueryThemeDto;
import com.datablau.metric.management.dto.QueryThemePageDto;
import com.datablau.metric.management.dto.SelectQueryDataEx;
import com.datablau.metric.management.dto.common.DataQueryDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @Author feng
 * Date 2022/03/07
 */
@RequestMapping("/querytheme")
@RestController
@Tag( name = "主题目录 REST API")
public class QueryThemeController extends BaseController {
    private static final Logger LOGGER = LoggerFactory.getLogger(QueryThemeController.class);

    @Autowired
    private QueryThemeService queryThemeService;


    /**
     * 查询主题信息
     */
    @Operation(summary = "查询主题信息", description = "根据目录分页查询")
    @RequestMapping(value = "/page", method = RequestMethod.POST)
    public PageResult<QueryThemeDto> getQueryThemePage(@RequestBody QueryThemePageDto queryThemePageDto) {
        return queryThemeService.queryThemePageInfo(queryThemePageDto);
    }


    @Operation(summary = "获取全部的主题信息")
    @RequestMapping(value = "/findall", method = RequestMethod.POST)
    public List<QueryThemeDto> findAllQueryTheme() {
        return queryThemeService.findAllQueryTheme();
    }


    /**
     * 获取单个主题
     */
    @Operation(summary = "获取单个主题")
    @RequestMapping(value = "/get", method = RequestMethod.POST)
    public QueryThemeDto getQueryTheme(@RequestParam("id") Long id) {
        return queryThemeService.findById(id);
    }


    /**
     * 创建主题
     *
     * @param queryThemeDto
     */
    @Operation(summary = "创建主题")
    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public QueryThemeDto createQueryTheme(@RequestBody QueryThemeDto queryThemeDto) {
        return queryThemeService.createQueryTheme(queryThemeDto);
    }


    /**
     * 更新主题
     *
     * @param queryThemeDto
     */

    @Operation(summary = "更新主题")
    @RequestMapping(value = "/update", method = RequestMethod.POST)
    public QueryThemeDto updateQueryTheme(@RequestBody QueryThemeDto queryThemeDto) {
        return queryThemeService.updateQueryTheme(queryThemeDto);
    }

    /**
     * 删除主题
     *
     * @param dimensionList
     */
    @Operation(summary = "删除主题")
    @RequestMapping(value = "/delete", method = RequestMethod.POST)
    public Boolean deleteQueryThemeList(@RequestBody List<Long> dimensionList) {
        queryThemeService.deleteQueryThemes(dimensionList);
        return true;
    }


    // 获取表对应的全部维度和指标信息

    /**
     * @param tableId
     * @return
     */
    @Operation(summary = "获取表对应的全部维度和指标信息")
    @RequestMapping(value = "/mapping/list/get", method = RequestMethod.POST)
    public QueryTableDto getMappings(@RequestParam("tableId") Long tableId) {
        return queryThemeService.getMetricMappings(tableId);
    }

    /**
     * @param sqlData
     * @return
     * @throws Exception
     */
    @Operation(summary = "执行页面拼接的SQL进行执行，并返回查询结果")
    @RequestMapping(value = "/mapping/to/execute", method = RequestMethod.POST)
    public DataQueryDto toExecuteSqlData(@RequestBody SelectQueryDataEx sqlData) throws Exception {
        return queryThemeService.translateToSql(sqlData);
    }
}
