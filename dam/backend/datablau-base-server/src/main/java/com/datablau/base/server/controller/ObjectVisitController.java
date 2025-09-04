package com.datablau.base.server.controller;

import com.datablau.base.api.ObjectVisitService70;
import com.datablau.base.data.ObjectVisitQueryDto;
import com.datablau.base.data.ObjectVisitTopDto;
import com.datablau.base.server.utility.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;


@RestController
@RequestMapping("/objectVisit")
@Tag( name = "对象浏览相关API")
public class ObjectVisitController extends BaseController {

    @Autowired
    private ObjectVisitService70 objectVisitService;

    public ObjectVisitController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "获取指定资源的top用户")
    @PostMapping(value = "/getTopUser")
    public List<ObjectVisitTopDto> getTopUser(@RequestBody ObjectVisitQueryDto queryDto) {
        if (queryDto.getTopNumber() <= 0) {
            return new ArrayList<>();
        }
        return objectVisitService.getTopUserByTypeIdAndObjectId(queryDto.getObjectId(),
                queryDto.getTypeId(), queryDto.getTopNumber());
    }

    @Operation(summary = "更新某个资产的点击数+1")
    @PostMapping("/updateClickCount")
    public void updateClickCount(@RequestBody ObjectVisitQueryDto queryDto) {
        objectVisitService.asyncIncrementVisitCount(queryDto.getObjectId(),
                queryDto.getTypeId(), AuthTools.currentUsernameFailFast());
    }

    @Operation(summary = "获取某个资产的点击数")
    @PostMapping("/getClickCount")
    public Long getClickCount(@RequestBody ObjectVisitQueryDto queryDto) {
        return objectVisitService.getVisitCount(queryDto.getObjectId(), queryDto.getTypeId());
    }

}
