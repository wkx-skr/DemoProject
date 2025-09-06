package com.datablau.base.server.controller;

import com.andorj.common.data.PageResult;
import com.datablau.base.api.SubscribeService70;
import com.datablau.base.data.SubscribeDto;
import com.datablau.base.server.utility.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @Author Senyan - 北京数语科技有限公司
 * @Date 2019/7/3
 */
@RestController
@RequestMapping("/subscribe")
@Tag(name = "订阅管理", description = "/subscribe")
public class SubscribeController extends BaseController {

    @Autowired
    private SubscribeService70 subService;

    public SubscribeController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "db_subscribe",
//            systemModule = OperationModuleType.COMMON_SUBSCRIBE,
//            description = "添加订阅内容: {param}",
//            descriptionParamClass = SubscribeDto.class,
//            descriptionParamMethod = "showOperationLogMessage"
//    )
    @Operation(summary = "添加订阅内容")
    @PostMapping(value = "/add")
    public void addToSubscribe(@RequestBody SubscribeDto sub) throws Exception {
        subService.addToSubscribe(sub);
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "db_subscribe",
//            systemModule = OperationModuleType.COMMON_SUBSCRIBE,
//            description = "删除订阅，id为: {param}",
//            descriptionParamClass = Long.class,
//            descriptionParamMethod = "toString"
//    )
    @Operation(summary = "删除订阅")
    @PostMapping(value = "/delete")
    public void deleteSubscribe(@Parameter(name = "subId", description = "订阅id")
                                @RequestParam("subId") Long subId) {
        subService.deleteFromSubscribe(subId);
    }

    @Operation(summary = "获取当前用户的所有订阅内容")
    @Parameters({@Parameter(name = "typeId", description = "资产类型", in = ParameterIn.QUERY, required = true)})
    @PostMapping(value = "/loadUserSub")
    public List<SubscribeDto> loadUserSub(@RequestParam(name = "typeId", required = false) Long typeId) throws Exception {
        return subService.getAllSubOfCurrentUser(typeId);
    }


    @Operation(summary = "获取分页数据")
    @PostMapping(value = "/page")
    public PageResult<SubscribeDto> loadUserSubPage(@RequestBody SubscribeDto subscribeDto) throws Exception {
        return subService.getPages(subscribeDto);
    }
}

