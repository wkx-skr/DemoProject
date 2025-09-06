package com.datablau.base.server.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.core.annotation.EndpointDoc;
import com.datablau.base.server.jpa.entity.FrontendWidget;
import com.datablau.base.server.service.FrontEndWidgetService;
import com.datablau.base.server.utility.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.security.management.api.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/widget")
public class FrontEndWidgetController extends BaseController {

    @Autowired
    private FrontEndWidgetService frontEndWidgetService;

    public FrontEndWidgetController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }


    @PostMapping(value = "/saveWidgetConfig")
    @Description("保存UI组件的配置")
    @EndpointDoc(bodyExample = "{\"widgetId\":\"example1\", \"content\":\"configurations\"")
    public void saveGraphConfig(@RequestBody FrontendWidget widget) {
        frontEndWidgetService.saveGraphConfig(widget);
    }

    @PostMapping(value = "/getWidgetConfig")
    @Description("获取UI组件的配置")
    public FrontendWidget getWidgetConfig(@Description("组件的ID") @RequestParam("id") String widgetId) {
        return frontEndWidgetService.getWidgetConfig(widgetId);
    }
}
