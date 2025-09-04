package com.datablau.data.asset.service;

import cn.hutool.poi.excel.ExcelWriter;

import javax.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Map;

/**
 * @author: hxs
 * @date: 2025/4/16 12:39
 */
public interface DataCatalogExcelService {

    ExcelWriter exportCatalogTemplate();

    ExcelWriter exportCatalog( Map<String, List<List<Object>>> catalogMap);
}
