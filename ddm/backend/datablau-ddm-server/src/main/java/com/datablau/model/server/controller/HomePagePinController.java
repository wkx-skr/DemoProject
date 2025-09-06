package com.datablau.model.server.controller;

import com.datablau.model.data.api.HomePagePinService;
import com.datablau.model.data.dto.HomePinModelDto;
import com.datablau.model.data.jpa.entity.HomePagePin;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import com.datablau.data.common.controller.BaseController;
/**
 * @Author yudonghai - 北京数语科技有限公司
 * @Date 2022/6/20 16:33
 */
@RestController("homePagePinController")
@ConditionalOnMissingBean(name = "homePagePinControllerExt")
@RequestMapping("/home/pin")
@Tag(name = "我的模型首页-固定对象", description = "我的模型首页-固定对象")
public class HomePagePinController extends BaseController {

    @Autowired
    protected HomePagePinService homePagePinService;

    @Operation(summary = "查询首页固定的模型+最近修改的模型，共20条")
    @GetMapping("/models")
    public List<HomePinModelDto> findMyPinModels() {
        return homePagePinService.findMyPinModels();
    }

    @Operation(summary = "我的模型首页-固定对象")
    @PostMapping("/object/{objectId}")
    public HomePagePin pinObject(@Parameter(name = "对象ID") @PathVariable Long objectId,
                                 @Parameter(name = "对象类型") @RequestParam(required = false, defaultValue = "MODEL") HomePagePin.PinObjectType type) {
        return homePagePinService.pinObject(objectId, type);
    }

    @Operation(summary = "我的模型首页-移除固定对象")
    @DeleteMapping("/object/{objectId}")
    public void unpinObject(@Parameter(name = "对象ID") @PathVariable Long objectId,
                            @Parameter(name = "对象类型") @RequestParam(required = false, defaultValue = "MODEL") HomePagePin.PinObjectType type) {
        homePagePinService.unpinObject(objectId, type);
    }

    @Operation(summary = "我的模型首页-更新固定对象顺序", description = "objectId、objectType、sort必传")
    @PutMapping("/object")
    public void updatePinObjectsSort(@Parameter(name = "对象集合") @RequestBody List<HomePagePin> orderModels) {
        homePagePinService.updatePinObjectsSort(orderModels);
    }

}