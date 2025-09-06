package com.datablau.ddd.server.controller;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Map;

import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.datablau.ddd.common.dto.ResultWrapper;
import com.datablau.ddd.data.dto.RunSqlDto;
import com.datablau.ddd.data.dto.UdfFunc;
import com.datablau.ddd.ds.service.impl.DolphinSchedulerUdfServiceImpl;
import com.datablau.server.DatasourceBaseService;
import com.fasterxml.jackson.core.JsonProcessingException;
import io.swagger.v3.oas.annotations.Operation;

@Slf4j
@RestController
@RequestMapping("/sqls")
public class SQLController {

    @Autowired
    DatasourceBaseService datasourceBaseService;

    @Autowired
    DolphinSchedulerUdfServiceImpl dolphinSchedulerUdfService;

    /**
     * 已经获取到的函数名称
     */
    private static final String NAME_OF_THE_PARAMETER_THAT_HAS_BEEN_OBTAINED = "getFun";

    @Operation(summary = "填充参数，然后运行SQL")
    @PostMapping("/runSql")
    public ResultWrapper<List<List<Map<String, Object>>>> runSQL(@RequestBody RunSqlDto runSqlDto) throws JsonProcessingException {

        String sql = new String(Base64.getDecoder().decode(runSqlDto.getSql()),
                StandardCharsets.UTF_8);
        // 2.注册udf脚本
        if (!runSqlDto.getFunNames().isEmpty()) {
            List<UdfFunc> udfFuncs = dolphinSchedulerUdfService.getHiveUdf("test");
            Map<String, List<String>> funcs = dolphinSchedulerUdfService.createFuncs(udfFuncs,
                    runSqlDto.getFunNames());
            if (!funcs.get(NAME_OF_THE_PARAMETER_THAT_HAS_BEEN_OBTAINED).isEmpty()
                    && runSqlDto.getFunNames().size() == funcs.get(
                            NAME_OF_THE_PARAMETER_THAT_HAS_BEEN_OBTAINED).size()) {
                runSqlDto.getFunNames().clear();
                runSqlDto.setFunNames(funcs.get("sql"));
            } else {
                return ResultWrapper.getErrorResultWrapper(
                        "部分udf函数未获取到！已获取：" + funcs.get(
                                NAME_OF_THE_PARAMETER_THAT_HAS_BEEN_OBTAINED));
            }
        }
        // 3.去除sql中的注释 否则会影响sql解析
        sql = processSqlContent(sql);
        // 5.将sql重新组合 通过base64加密
        runSqlDto.setSql(Base64.getEncoder().withoutPadding().encodeToString(sql.getBytes()));

        // 6.调用dam接口
        try {
            List<List<Map<String, Object>>> res = datasourceBaseService.runSql(runSqlDto);
            return ResultWrapper.getSuccessResultWrapper(res);
        } catch (Exception e){
            return ResultWrapper.getErrorResultWrapper(e.getMessage());
        }

    }

    /**
     * 去除注释 否则会影响sql解析
     */
    public String processSqlContent(String sql) {
        while (sql.contains("/*") || sql.contains("--")) {
            sql = sql.replaceAll("(?s)(?:/\\*.*?\\*/|--[^\\n]*)", "");
        }
        return sql;
    }

    public List<String> parseQuerySql(String sql) {
        List<String> list = new ArrayList<>();
        String[] tmpSqlList = sql.split(";");
        Arrays.stream(tmpSqlList).forEach(o -> list.add(o.trim()));
        list.removeIf(String::isEmpty);
        return list;
    }

}
