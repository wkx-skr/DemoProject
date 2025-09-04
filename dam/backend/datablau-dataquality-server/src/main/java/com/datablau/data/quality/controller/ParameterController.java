package com.datablau.data.quality.controller;

import com.andorj.common.core.annotation.Description;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.quality.data.ParameterDto;
import com.datablau.data.quality.data.ParameterValueDto;
import com.datablau.data.quality.data.ParameterValueLevel;
import com.datablau.data.quality.dto.DataQualityTechRuleDto;
import com.datablau.data.quality.impl.LocalJobRegistryAdapter;
import com.datablau.data.quality.job.data.DataQualityJobDescriptor;
import com.datablau.data.quality.service.ParameterService;
import com.datablau.data.quality.utility.ServerConstants;
import com.datablau.job.scheduler.dto.JobDto;
import com.datablau.security.management.api.RoleService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @Author Nicky - 数语科技有限公司
 * @Date 2018/7/9 16:24
 */
@RestController
@RequestMapping("/parameters")
@Tag(name = "参数控制器REST API")
public class ParameterController extends BaseController {
    private static final Logger LOGGER = LoggerFactory.getLogger(ParameterController.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final Pattern PARAM_PATTERN = Pattern
            .compile("\\[\\[[\\s,\\w,\\u4e00-\\u9fa5]+\\]\\]");

    @Autowired
    private ParameterService parameterService;

    @Autowired
    private LocalJobRegistryAdapter localJobRegistryAdapter;

    public ParameterController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "db_param",
//            systemModule = OperationModuleType.QUALITY_PARAM,
//            description = "查询参数"
//    )
    @Operation(summary = "获取所有参数配置")
    @RequestMapping("/")
    public List<ParameterDto> getAllParameters() {
        return parameterService.getParameters();
    }

    @Operation(summary = "获取参数配置")
    @RequestMapping("/{parameterId}")
    public ParameterDto getParameter(@Parameter(name = "parameterId", description = "参数id") @PathVariable("parameterId")Long parameterId) {
        return parameterService.getParameter(parameterId);
    }

    @Operation(summary = "添加系统参数")
//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "db_param",
//            systemModule = OperationModuleType.QUALITY_PARAM,
//            description = "添加参数: {param}",
//            descriptionParamClass = ParameterDto.class,
//            descriptionParamMethod = "getName"
//    )
    @RequestMapping(value = "/", method = RequestMethod.POST)
    public ParameterDto createParameter(@RequestBody ParameterDto param) {
        return parameterService.createParameter(param);
    }

    @Operation(summary = "修改系统参数")
//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "db_param",
//            systemModule = OperationModuleType.QUALITY_PARAM,
//            description = "修改参数: {param}",
//            descriptionParamClass = ParameterDto.class,
//            descriptionParamMethod = "getName"
//    )
    @RequestMapping(value = "/{parameterId}", method = RequestMethod.PUT)
    public ParameterDto updateParameter(@RequestBody ParameterDto param,
                                        @Parameter(name = "parameterId", description = "参数id") @PathVariable("parameterId") Long parameterId) {
        param.setParamId(parameterId);
        return parameterService.updateParameter(param);
    }

    @Operation(summary = "设置参数的值")
    @RequestMapping(value = "/{parameterId}/value", method = RequestMethod.POST)
    public ParameterValueDto setValueToParameter(@RequestBody ParameterValueDto value,
                                                 @Parameter(name = "parameterId", description = "参数id") @PathVariable("parameterId") Long parameterId) {
        return parameterService.setValueToParameter(value, parameterId);
    }

    @Operation(summary = "获取参数的值")
    @RequestMapping("/{parameterId}/value")
    public ParameterValueDto getValueOfParameter(@Parameter(name = "parameterId", description = "参数id") @PathVariable("parameterId") Long parameterId) {
        return parameterService.getValueOfParameter(parameterId, true);
    }

    @Operation(summary = "测试系统参数")
//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "db_param",
//            systemModule = OperationModuleType.QUALITY_PARAM,
//            description = "测试参数: {param}",
//            descriptionParamClass = Long.class,
//            descriptionParamMethod = "toString"
//    )
    @RequestMapping("/{parameterId}/value/test")
    public String generateParameterValue(@Parameter(name = "parameterId", description = "参数id") @PathVariable("parameterId")Long parameterId) {
        return parameterService.calculateParameterValue(parameterId);
    }

    @Operation(summary = "删除系统参数")
//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_param",
//            systemModule = OperationModuleType.QUALITY_PARAM,
//            description = "删除参数: {param}",
//            descriptionParamClass = Long.class,
//            descriptionParamMethod = "toString"
//    )
    @RequestMapping(value = "/{parameterId}", method = RequestMethod.DELETE)
    public void deleteParameter(@Parameter(name = "parameterId", description = "参数id") @PathVariable("parameterId") Long parameterId) {
        parameterService.deleteParameter(parameterId);
    }

    @Operation(summary = "根据参数名获取当前参数信息及参数当前值")
    @RequestMapping(value = "/{level}/{itemId}", method = RequestMethod.POST)
    public List<ParameterDto> getAllParametersByName(@RequestBody List<DataQualityTechRuleDto> dataQualityTechRuleDtos ,
                                                     @Description("GLOBAL_LEVEL：全局，RULE_LEVEL：规则级别，TASK_LEVEL：任务级别") @PathVariable("level") String level,
                                                     @Description("level为RULE_LEVEL时，为对应ruleId，TASK_LEVEL为对应jobId") @PathVariable("itemId") Long itemId) {
        ArrayList<ParameterDto> parameterDtoList = new ArrayList<>();
        ParameterValueLevel parameterValueLevel = ParameterValueLevel.valueOf(level);
        List<Long> ruleIds = new ArrayList<>();

        if (parameterValueLevel != null && ParameterValueLevel.TASK_LEVEL.equals(parameterValueLevel) && itemId != -1) {
            JobDto job = localJobRegistryAdapter.queryJobById(itemId);
            try {
                DataQualityJobDescriptor descriptor = MAPPER.readValue(job.getJobContent(), DataQualityJobDescriptor.class);
                ruleIds = descriptor.getTechRuleIds();
            } catch (JsonProcessingException e) {
                LOGGER.warn("Data serialization exception");
            }
        }
        for (DataQualityTechRuleDto dataQualityTechRuleDto : dataQualityTechRuleDtos) {
            HashSet<String> parameterNames = new HashSet<>();

            getParams(parameterNames, dataQualityTechRuleDto.getFormattedContent());
            getParams(parameterNames, dataQualityTechRuleDto.getContent());
            getParams(parameterNames,dataQualityTechRuleDto.getCountProblemSql());
            getParams(parameterNames,dataQualityTechRuleDto.getCountTotalSql());
            getParams(parameterNames,dataQualityTechRuleDto.getPreScript());
            getParams(parameterNames,dataQualityTechRuleDto.getPostScript());
            parameterNames.addAll(dataQualityTechRuleDto.getParameterNames());

            if (!ruleIds.contains(dataQualityTechRuleDto.getId()) && ParameterValueLevel.TASK_LEVEL.equals(parameterValueLevel) && itemId != -1) {
                parameterDtoList.addAll(parameterService.getParametersAndValuesByName(parameterNames, ParameterValueLevel.RULE_LEVEL.toString(), dataQualityTechRuleDto.getId()));
            } else {
                parameterDtoList.addAll(parameterService.getParametersAndValuesByName(parameterNames, level, itemId));
            }

        }
        return parameterDtoList;
    }

    private void getParams(HashSet<String> parameterNames, String content) {
        if (Strings.isNullOrEmpty(content)) {
            return;
        }
        Matcher m = PARAM_PATTERN.matcher(content);
        while (m.find()) {
            String group = m.group();
            parameterNames.add(group.substring(2, group.length() - 2));
        }
    }
}
