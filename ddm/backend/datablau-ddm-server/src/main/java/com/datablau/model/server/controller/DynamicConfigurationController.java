package com.datablau.model.server.controller;

import com.andorj.common.core.annotation.Description;
import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.jpa.entity.DynamicConfiguration;
import com.datablau.model.data.security.UserRights;
import com.datablau.model.data.utility.DynamicConfigurations;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang.StringUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;
/**
 * @author yudonghai - 数语科技有限公司
 * date 2023/7/4 14:22
 */
@RestController("dynamicConfigurationController")
@ConditionalOnMissingBean(name = "dynamicConfigurationControllerExt")
@RequestMapping("/configs")
@Description("编辑可以及时生效的配置REST API")
public class DynamicConfigurationController extends BaseController {

    @GetMapping("/")
    @Description("获取所有属性")
    public List<DynamicConfiguration> getAllConfigs() {
        return DynamicConfigurations.INSTANCE.getAll();
    }

    @PutMapping("/")
    @Description("修改一个属性")
    @PreAuthorize(UserRights.HAS_CONTROL_MANAGE_ROLE)
    public void updateConfiguration(@RequestBody DynamicConfiguration configuration) {
        DynamicConfigurations.INSTANCE.setProperty(configuration.getPropertyName(),
                configuration.getPropertyValue(), configuration.getPropertyDescription());
    }

    @GetMapping("/get_one") // 统一使用POST, 2021/12/30
    @Description("获取一个配置信息, jsonp: callback name: 'jsonp'")
    public String getConfiguration(
            @RequestParam("name") String name,
            @RequestParam(name = "jsonp", required = false) String jsonp,
            HttpServletRequest request, HttpServletResponse response) throws JsonProcessingException {
        DynamicConfiguration configuration = DynamicConfigurations.INSTANCE.getProperty(name);
        ObjectMapper objectMapper = new ObjectMapper();
        if (StringUtils.isBlank(jsonp)) {
            //response.setContentType("application/json; charset=UTF-8");
            return objectMapper.writeValueAsString(configuration);
        } else {
            //response.setContentType("text/javascript; charset=UTF-8");
            return jsonp + "(" + objectMapper.writeValueAsString(configuration) + ")";
        }
    }

    @GetMapping("/{configName}")
    @Description("获取一个配置信息")
    public DynamicConfiguration getConfiguration(@PathVariable String configName) {
        return DynamicConfigurations.INSTANCE.getProperty(configName);
    }

}