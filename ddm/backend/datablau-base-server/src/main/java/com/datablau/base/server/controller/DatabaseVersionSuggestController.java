package com.datablau.base.server.controller;

import com.datablau.base.server.utility.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.datasource.plugin.DatasourcePluginInfo;
import com.datablau.datasource.util.DatasourceManager;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2023/2/14 11:21
 */
@RestController
@RequestMapping("/suggest")
@Tag(name = "数据库推荐版本相关API")
public class DatabaseVersionSuggestController extends BaseController {

    @Autowired
    private DatasourceManager datasourceManager;

    public DatabaseVersionSuggestController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }


    @RequestMapping(path = "/version/byDatasourceType", method = RequestMethod.GET)
    @Operation(summary = "根据数据库类型查看推荐版本")
    public String findByDatasourceType(@Parameter(name = "datasourceType", description = "数据库类型")
        @RequestParam(name = "datasourceType") String datasourceType){

        Map<String, DatasourcePluginInfo> versionMap = datasourceManager.getSuggestVersionMap();
        if(versionMap.containsKey(datasourceType)){
            DatasourcePluginInfo pluginInfo = versionMap.get(datasourceType);

            return pluginInfo.getDisplayName() + ": " + pluginInfo.getSuggestVersion();
        }

        return null;
    }

    @RequestMapping(value = "/version/getList", method = RequestMethod.POST)
    @Operation(summary = "查询所有推荐版本")
    public List<String> findAllSuggests(){

        Map<String, DatasourcePluginInfo> suggestVersionMap = datasourceManager.getSuggestVersionMap();

        List<String> list = suggestVersionMap.values().stream()
            .filter(info -> !StringUtils.isEmpty(info.getSuggestVersion()))
            .map(info -> info.getDisplayName() + ": " + info.getSuggestVersion())
            .collect(Collectors.toList());
        list.sort((a, b) -> a.compareTo(b));

        return  list;
    }

}
