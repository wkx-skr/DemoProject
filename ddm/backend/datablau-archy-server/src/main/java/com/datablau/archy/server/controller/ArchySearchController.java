package com.datablau.archy.server.controller;

import com.datablau.archy.common.enums.ArchyType;
import com.datablau.archy.server.dto.SearchResultDto;
import com.datablau.archy.server.dto.query.ArchySearchQueryDto;
import com.datablau.archy.server.service.ArchySearchService;
import com.datablau.data.common.controller.BaseController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/search")
@Tag(name = "Archy首页搜索REST API", description = "Archy首页搜索REST API")
public class ArchySearchController extends BaseController {

    @Autowired
    private ArchySearchService archySearchService;

    @Operation(summary = "全局搜索")
    @PostMapping("/")
    public List<SearchResultDto> search(@RequestBody ArchySearchQueryDto searchQueryDto) {
        return archySearchService.search(searchQueryDto);
    }

    @Operation(summary = "统计信息")
    @GetMapping("/statistics")
    public Map<ArchyType, Integer> statistics() {
        return archySearchService.statistics();
    }

    @Operation(summary = "最近热搜")
    @GetMapping("/hot")
    public List<Map<String, Integer>> getHotSearch(){
        return archySearchService.getHotSearch();
    }

}
