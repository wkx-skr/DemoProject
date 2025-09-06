package com.datablau.base.server.controller;

import com.datablau.base.data.UsageInfo;
import com.datablau.base.server.service.UsageRegister;
import com.datablau.base.server.utility.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.security.management.api.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/usage")
public class UsageRegisterController extends BaseController {
    @Autowired
    private UsageRegister usageRegister;

    public UsageRegisterController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @RequestMapping("/getRegisteredUsage")
    public List<UsageInfo> getRegisteredUsage() {
        return usageRegister.getRegisteredUsage();
    }

    @RequestMapping("/getRegisteredUsageByType")
    public List<UsageInfo> getRegisteredUsageByType(@RequestParam("type") String type) {
        return usageRegister.getRegisteredUsage(type);
    }
}
