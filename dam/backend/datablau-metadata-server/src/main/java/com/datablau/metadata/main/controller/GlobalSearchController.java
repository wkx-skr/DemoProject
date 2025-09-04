package com.datablau.metadata.main.controller;

import com.andorj.common.data.PageResult;
import com.datablau.data.common.controller.BaseController;
import com.datablau.metadata.main.dto.global.search.GlobalSearchQueryDto;
import com.datablau.metadata.main.dto.global.search.GlobalSearchResult;
import com.datablau.metadata.main.service.elastic.api.GlobalSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/global/search")
public class GlobalSearchController extends BaseController {

    @Autowired
    private GlobalSearchService globalSearchService;

    @PostMapping("/test")
    public void getGlobalSearchPageResult() throws Exception {
        globalSearchService.syncGlobalSearch();

//        MetaDataObjectSync dataObjectSync = new MetaDataObjectSync(Sets.newHashSet(37900100L));
//        dataObjectSync.selfIncrementSync();
    }

    @PostMapping("/getPage")
    public PageResult<GlobalSearchResult> getGlobalSearchPage(@RequestBody GlobalSearchQueryDto queryDto) throws Exception {
        return globalSearchService.getGlobalSearchPage(queryDto);
    }

}
