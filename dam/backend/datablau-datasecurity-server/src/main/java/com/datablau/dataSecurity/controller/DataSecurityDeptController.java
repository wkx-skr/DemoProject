package com.datablau.dataSecurity.controller;

import com.datablau.data.common.controller.BaseController;
import com.datablau.dataAccess.dto.ResResultDto;
import com.datablau.dataAccess.utility.ServerConstants;
import com.datablau.dataSecurity.dto.DataSecuritySystemDto;
import com.datablau.dataSecurity.service.api.DataSecurityDeptService;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "数据梳理业务目录")
@RestController
@RequestMapping(value = "/security/dept")
public class DataSecurityDeptController extends BaseController {


    @Autowired
    private DataSecurityDeptService dataSecurityDeptService;

    public DataSecurityDeptController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "业务目录")
    @GetMapping(value = "/")
    public ResResultDto<List<DataSecuritySystemDto>> getDept() {

        List<DataSecuritySystemDto> dept = dataSecurityDeptService.getDept();
        return ResResultDto.ok(dept);
    }
}
