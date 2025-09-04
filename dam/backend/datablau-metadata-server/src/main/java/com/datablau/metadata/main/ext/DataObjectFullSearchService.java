package com.datablau.metadata.main.ext;

import com.andorj.common.data.PageResult;
import com.datablau.metadata.main.dto.FullSearchDto;
import com.datablau.metadata.main.dto.objsearch.BaseSearchDto;
import com.datablau.metadata.main.dto.objsearch.FullSearchResultDto;

/**
 * @author: hxs
 * @date: 2025/4/12 14:04
 */
public interface DataObjectFullSearchService {

    PageResult<? extends BaseSearchDto> fullSearch(FullSearchDto searchDto) throws Exception;
}
