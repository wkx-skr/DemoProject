package com.datablau.data.quality.controller;

import com.datablau.data.common.util.DynamicConfigurations;
import com.datablau.data.quality.dto.DataQualityConfig;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/configs")
public class ConfigsController {
    /**
     * 获取所有的数据质量配置
     */
    @PostMapping("/all")
    public DataQualityConfig getAllConfigs() {
        boolean shotProcess = Boolean.parseBoolean(DynamicConfigurations.INSTANCE.getPropertyValue("configurable.quality.shot.process", "false"));
        DataQualityConfig dataQualityConfig = new DataQualityConfig();
        dataQualityConfig.setShotProcess(shotProcess);
        return dataQualityConfig;
    }
}
