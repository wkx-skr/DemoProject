package com.datablau.data.quality.controller;

import com.andorj.common.core.annotation.EndpointDoc;
import com.andorj.common.data.PageResult;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.data.DataType;
import com.datablau.data.quality.data.FuncDescriptor;
import com.datablau.data.quality.data.FunctionInstance;
import com.datablau.data.quality.data.ParameterValueLevel;
import com.datablau.data.quality.jpa.entity.QualityFunction;
import com.datablau.data.quality.jpa.entity.QualityFunctionResult;
import com.datablau.data.quality.metadata.service.FunctionObjectBindingService;
import com.datablau.data.quality.util.ParameterResolver;
import com.datablau.data.quality.utility.ServerConstants;
import com.datablau.func.data.FunctionBuilder;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * @author nicky - 数语科技有限公司
 * date 2021/7/29 14:24
 */
@RestController
@RequestMapping("/funcs")
@Tag(name = "函数相关的Controller")
public class FunctionController extends BaseController {

    @Autowired
    private FunctionObjectBindingService fobService;

    public FunctionController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @RequestMapping("/registered")
    @Operation(summary = "得到现在可用的函数模板")
    @EndpointDoc(responseExample =
            "{\n"
        + "    \"32be4cec-36b5-4ae3-8dc6-7ebe82f968de\": {\n"
        + "        \"name\": \"正则表达式匹配函数\",\n"
        + "        \"uuid\": \"32be4cec-36b5-4ae3-8dc6-7ebe82f968de\",\n"
        + "        \"description\": \"给定一个正则表达，判断是否包含或者完全匹配\",\n"
        + "        \"returnType\": \"BOOLEAN\",\n"
        + "        \"className\": \"com.datablau.func.pack.RegexMatchFunction\",\n"
        + "        \"ignore\": false,\n"
        + "        \"params\": {\n"
        + "            \"正则表达式\": {\n"
        + "                \"name\": \"正则表达式\",\n"
        + "                \"bindName\": \"expression\",\n"
        + "                \"description\": \"要匹配的正则表达式\",\n"
        + "                \"type\": \"STRING\",\n"
        + "                \"required\": true\n"
        + "            },\n"
        + "            \"是否完全匹配\": {\n"
        + "                \"name\": \"是否完全匹配\",\n"
        + "                \"bindName\": \"match\",\n"
        + "                \"description\": \"是否完全匹配正则表达式,true代表完全匹配，false代表只要包含, 默认为true\",\n"
        + "                \"type\": \"BOOLEAN\",\n"
        + "                \"required\": false\n"
        + "            }\n"
        + "        }\n"
        + "    }\n"
        + "}")
    public Map<String, FuncDescriptor> getRegisteredFunctions() {
        return FunctionBuilder.getRegisteredFunctions();
    }

    /**
     * 创建一个新的函数
     * @param funcBody
     * @return
     */
    @Operation(summary = "创建一个新的函数")
    @EndpointDoc(bodyExample = "{\n"
        + "    \"funcTypeId\" : \"62612d2e-a7fb-a394-91ca-eeaab11fdb9a\",\n"
        + "    \"funcInstanceName\" : \"比较数值大于20\",\n"
        + "    \"parameters\" : {\n"
        + "        \"min\": {\n"
        + "            \"name\" : \"min\",\n"
        + "            \"value\" : 20\n"
        + "        }\n"
        + "    }\n"
        + "}",
    responseExample = "{\n"
        + "    \"funcId\": 1,\n"
        + "    \"funcName\": \"比较数值大于20\",\n"
        + "    \"funcReturnType\": \"BOOLEAN\",\n"
        + "    \"enabled\": true,\n"
        + "    \"funcBody\": {\n"
        + "        \"funcTypeId\": \"62612d2e-a7fb-a394-91ca-eeaab11fdb9a\",\n"
        + "        \"funcInstanceName\": \"比较数值大于20\",\n"
        + "        \"enabled\": true,\n"
        + "        \"parameters\": {\n"
        + "            \"min\": {\n"
        + "                \"name\": \"min\",\n"
        + "                \"value\": 20,\n"
        + "                \"expression\": null,\n"
        + "                \"function\": null\n"
        + "            }\n"
        + "        }\n"
        + "    }\n"
        + "}")
    @RequestMapping(value = "/new", method = RequestMethod.POST)
    public QualityFunction createFunction(@RequestBody FunctionInstance funcBody) {
        return fobService.createFunction(funcBody);
    }


    /**
     * 获取表相关的所有结果
     * @param tableObjectId
     * @return
     */
    @Operation(summary = "获取表相关的所有结果")
    @Parameters({@Parameter(name = "tableObjectId", description = "表的元数据ID", in = ParameterIn.PATH)})
    @RequestMapping("/objects/tables/{tableObjectId}")
    public List<QualityFunctionResult> getTableFunctionResult(@PathVariable("tableObjectId")Long tableObjectId) {
        return fobService.getTableProblems(tableObjectId);
    }

    /**
     * 获取字段相关的所有结果
     * @param columnObjectId
     * @return
     */
    @Operation(summary = "获取字段相关的所有结果")
    @Parameters({@Parameter(name = "columnObjectId", description = "列的元数据ID", in = ParameterIn.PATH)})
    @RequestMapping("/objects/columns/{columnObjectId}")
    public List<QualityFunctionResult> getColumnFunctionResult(@PathVariable("columnObjectId")Long columnObjectId) {
        return fobService.getColumnProblems(columnObjectId);
    }

    /**
     * 更新一个函数，函数的返回值类型不能变，其它的可以改变
     * @param funcId
     * @param funcBody
     * @return
     */
    @Operation(summary = "更新一个函数，函数的返回值类型不能变，其它的可以改变")
    @Parameters({@Parameter(name = "funcId", description = "函数的ID", in = ParameterIn.PATH)})
    @RequestMapping(value = "/{funcId}/update", method = RequestMethod.POST)
    public QualityFunction updateFunc(@PathVariable("funcId") Long funcId, @RequestBody FunctionInstance funcBody) {
        return fobService.updateFunction(funcId, funcBody);
    }

    /**
     * 删除指定的函数
     * @param funcId
     */
    @Operation(summary = "删除指定的函数")
    @Parameters({@Parameter(name = "funcId", description = "函数的ID", in = ParameterIn.PATH)})
    @RequestMapping(value = "/{funcId}/del", method = RequestMethod.POST)
    public void deleteFunc(@PathVariable("funcId") Long funcId) {
        fobService.deleteFunction(funcId);
    }

    /**
     * 测试一个函数实例
     * @param funcBody
     * @param param
     * @param level
     * @param itemId
     * @return
     */
    @Operation(summary = "测试一个函数实例")
    @Parameters({@Parameter(name = "param", description = "函数测试参数", in = ParameterIn.QUERY),
            @Parameter(name = "plevel", description = "规则参数的层级, 可选值GLOBAL_LEVEL, RULE_LEVEL, TASK_LEVEL", in = ParameterIn.QUERY),
            @Parameter(name = "pid", description = "规则参数的绑定对象ID, 必须和规则参数层级匹配", in = ParameterIn.QUERY)})
    @RequestMapping(value = "/test", method = RequestMethod.POST)
    public Serializable testFunction(@RequestBody FunctionInstance funcBody,
                                     @RequestParam("param")String param,
                                     @RequestParam(name = "plevel", defaultValue = "GLOBAL_LEVEL") ParameterValueLevel level,
                                     @RequestParam(name = "pid", defaultValue = "-1") Long itemId) {

        ParameterResolver.setParameterTargetId(itemId);
        ParameterResolver.setCurrentParameterLevel(level);
        try {
            return fobService.testFunction(funcBody, param);
        } finally {
            ParameterResolver.resetToDefault();
        }
    }

    /**
     * 分页查询函数
     * @param currentPage
     * @param pageSize
     * @param keyword
     * @param dataType
     * @return
     */
    @Operation(summary = "分页查询函数")
    @Parameters({@Parameter(name = "currentPage", description = "当前页码", in = ParameterIn.QUERY),
            @Parameter(name = "pageSize", description = "页面大小", in = ParameterIn.QUERY),
            @Parameter(name = "keyword", description = "函数名关键字", in = ParameterIn.QUERY),
            @Parameter(name = "dataType", description = "数据类型", in = ParameterIn.QUERY)})
    @RequestMapping(value = "/search", method = RequestMethod.POST)
    public PageResult<QualityFunction> queryFunctions(@RequestParam("currentPage") int currentPage,
                                                      @RequestParam("pageSize") int pageSize,
                                                      @RequestParam(value = "keyword", required = false) String keyword,
                                                      @RequestParam(value = "dataType", required = false)DataType dataType) {
        return fobService.getFunctions(keyword, dataType, PageRequest.of(currentPage, pageSize));
    }

    /**
     * 根据id查询函数
     * @param funcId
     * @return
     */
    @Operation(summary = "根据id查询函数")
    @Parameters({@Parameter(name = "funcId", description = "函数ID", in = ParameterIn.PATH)})
    @RequestMapping(value = "/{funcId}", method = RequestMethod.GET)
    public QualityFunction getFunc(@PathVariable("funcId") Long funcId) {
        return fobService.getFunctionById(funcId);
    }
}
