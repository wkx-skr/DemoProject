package com.datablau.dataSecurity.controller;

import com.datablau.data.common.controller.BaseController;
import com.datablau.security.management.api.RoleService;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author weijiakun
 * @create 2023-10-17 10:44
 */
@RestController
public class DataSecurityBaseController extends BaseController {

    /**
     * 用户微服务不存在的时候需要注释掉该方法
     */
    public DataSecurityBaseController(String serverType, RoleService roleService) {
        super(serverType, roleService);
    }

}
