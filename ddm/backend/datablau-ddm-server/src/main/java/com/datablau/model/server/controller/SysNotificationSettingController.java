package com.datablau.model.server.controller;

import com.datablau.data.common.controller.BaseController;
import com.datablau.model.data.api.SysNotificationSettingService;
import com.datablau.model.data.jpa.entity.SysNotificationSetting;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @Author fengpiao - 北京数语科技有限公司
 * @Date 2022/8/24 16:33
 */
@RestController("sysNotificationSettingController")
@ConditionalOnMissingBean(name = "sysNotificationSettingControllerExt")
@RequestMapping("/sys/notification")
@Tag(name = "系统消息设置", description = "系统消息设置")
public class SysNotificationSettingController extends BaseController {
    protected static final Logger logger = LoggerFactory.getLogger(SysNotificationSettingController.class);

    @Autowired
    protected SysNotificationSettingService sysNotificationService;

    @Operation(summary = "查询全部的系统消息设置")
    @GetMapping("/")
    public List<SysNotificationSetting> findAllSysNotificationSetting() {
        return sysNotificationService.getAllNotificationConf();
    }

    @Operation(summary = "更新系统消息设置")
    @PostMapping("/update")
    public List<SysNotificationSetting> updateNotificationConf(@Parameter(name = "系统消息设置集合") @RequestBody List<SysNotificationSetting> confs) {
        return sysNotificationService.updateNotificationConf(confs);
    }
}