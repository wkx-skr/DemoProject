package com.datablau.metric.management.rest.controller;


import com.andorj.model.common.api.MessageService;
import com.datablau.metric.management.api.MetricCodeGenerateService;
import com.datablau.metric.management.jpa.entity.DomainCodeGenerate;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * @Author :lishfe - 数语科技有限公司
 * @Date   :2022/6/28 18:05
 */
@RestController
@RequestMapping("/generate")
@Tag(name = "自动生成标准code")
public class DomainCodeGenerateController extends BaseController {

    @Autowired
    private MessageService msgService;

    @Autowired
    private MetricCodeGenerateService generateService;

    @RequestMapping(value = "/create", method = RequestMethod.POST)
    @Operation(summary = "创建code生成器")
    public void createCodeGenerate(@RequestBody DomainCodeGenerate generate){
        generateService.createCodeGenerate(generate);
    }

    @RequestMapping(value = "/update", method = RequestMethod.POST)
    @Operation(summary = "更新code生成器")
    public void updateCodeGenerate(@RequestBody DomainCodeGenerate generate){
        generateService.updateCodeGenerate(generate);
    }


    @RequestMapping(value = "/find/state", method = RequestMethod.POST)
    @Operation(summary = "查询当前code生成器的开关状态")
    public boolean findGenerateStateByCode(@RequestBody DomainCodeGenerate generate){
        if(generate == null || generate.getDomainType() == null){
            throw new RuntimeException(msgService.getMessage("parameterNotNull"));
        }
        return generateService.findGenerateStateByCode(generate.getDomainType());
    }

    @RequestMapping(value = "/find/list", method = RequestMethod.POST)
    @Operation(summary = "查询code生成器列表")
    public List<DomainCodeGenerate> findList(){
        return generateService.findList();
    }

    @RequestMapping(value = "/deleteById", method = RequestMethod.POST)
    @Operation(summary = "根据Id删除code生成器")
    public void deleteByGenerateCode(@RequestBody DomainCodeGenerate generate){
        generateService.deleteCodeGenerate(generate.getId());
    }

}
