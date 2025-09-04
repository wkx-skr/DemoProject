package com.datablau.dataSecurity.controller;


import com.datablau.common.utils.IpUtil;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.security.type.EnumMandateType;
import com.datablau.dataAccess.dto.DataSecurityAccessControlDto;
import com.datablau.dataAccess.dto.DataSecurityRowAccessStrategyDto;
import com.datablau.dataAccess.dto.ResResultDto;
import com.datablau.dataAccess.jpa.entity.DataSecurityAccessControl;
import com.datablau.dataAccess.service.api.RowAccessStrategyService;
import com.datablau.dataAccess.utility.ServerConstants;
import com.datablau.dataSecurity.utils.DDSKafkaLogUtil;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;

/**
 * @ClassName : DataSecurityRowAccessController
 * @Description : 行级访问策略
 * @Author : Xu XiaoQian
 * @Date : 2023/3/1
 **/
@RequestMapping("/accessStrategy/row")
@RestController
@Tag(name = "行级访问策略 REST API")
public class DataSecurityRowAccessController extends BaseController {

    @Autowired
    private RowAccessStrategyService rowAccessStrategyService;

    @Autowired
    private DDSKafkaLogUtil ddsKafkaLogUtil;

    public DataSecurityRowAccessController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @GetMapping("/get/{accessControlId}/{scopeType}")
    @Operation(summary = "获取行级访问详情列表")
    public ResResultDto<DataSecurityRowAccessStrategyDto> getRowStrategy(@PathVariable("accessControlId") Long accessControlId,
                                                                         @PathVariable("scopeType") EnumMandateType scopeType) {
        return ResResultDto.ok(rowAccessStrategyService.getStrategyDetail(accessControlId, scopeType));
    }

    @PostMapping("/add")
    @Operation(summary = "新增或修改数据安全访问策略")
    public ResResultDto<DataSecurityAccessControl> addRowStrategy(@RequestBody DataSecurityRowAccessStrategyDto dto) {
        DataSecurityAccessControl rowStrategy = rowAccessStrategyService.addRowStrategy(AuthTools.currentUsernameFailFast(), dto);
        if (dto.getId() != null) {
            ddsKafkaLogUtil.modifyAccessStrategy(rowStrategy.getAccessStrategyName(), getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        } else {
            ddsKafkaLogUtil.addAccessStrategy(rowStrategy.getAccessStrategyName(), getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        }
        return ResResultDto.ok(rowStrategy);
    }

    @PostMapping("/delete/{accessControlId}")
    @Operation(summary = "删除数据安全访问策略")
    public ResResultDto<DataSecurityAccessControl> deleteRowStrategy(@PathVariable("accessControlId") Long accessControlId) {
        DataSecurityAccessControl rowStrategy = rowAccessStrategyService.deleteRowStrategy(accessControlId);
        DataSecurityAccessControlDto controlDto = new DataSecurityAccessControlDto();
        BeanUtils.copyProperties(rowStrategy, controlDto);
        ddsKafkaLogUtil.deleteAccessStrategy(Collections.singletonList(controlDto), getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        return ResResultDto.ok(rowStrategy);
    }

}
