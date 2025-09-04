package com.datablau.data.asset.service;

import java.io.File;
import java.util.Collection;
import java.util.Map;

public interface AssetsExcelExporter {


    File exportExcel(Class<?> var1, Collection<?> var2, String var3, Integer var4, String var5) throws Exception;

    File exportExcel(Class<?> var1, Collection<?> var2, String var3, Integer var4, String var5, Map<Long, String> var6) throws Exception;

    File exportExcelUseTemplate(String var1, Class<?> var2, Collection<?> var3, String var4, Integer var5, String var6, Map<Long, String> var7) throws Exception;

    File exportExcelUseTemplate(String var1, Class<?> var2, Collection<?> var3, String var4, Integer var5, String var6) throws Exception;

    File exportExcelUseTemplate(String var1, Class<?> var2, Collection<?> var3, String var4, String var5, Map<Long, String> var6) throws Exception;

    File exportExcelUseTemplate(String var1, Class<?> var2, Collection<?> var3, String var4, String var5) throws Exception;

}
