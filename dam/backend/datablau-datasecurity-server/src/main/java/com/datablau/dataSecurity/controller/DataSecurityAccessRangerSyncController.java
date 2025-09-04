package com.datablau.dataSecurity.controller;

import com.datablau.common.utils.IpUtil;
import com.datablau.data.common.controller.BaseController;
import com.datablau.dataAccess.dto.DataSecurityAccessRangerSyncDto;
import com.datablau.dataAccess.dto.ResResultDto;
import com.datablau.dataAccess.service.api.DataSecurityAccessRangerSyncService;
import com.datablau.dataAccess.utility.ServerConstants;
import com.datablau.dataSecurity.utils.DDSKafkaLogUtil;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * ranger同步表接口
 *
 * @author weijiakun
 * @create 2023-05-17 15:51
 */
@RequestMapping("/ranger/sync")
@RestController
@Tag(name = "数据安全访问策略 REST API")
public class DataSecurityAccessRangerSyncController extends BaseController {

    @Autowired
    private DataSecurityAccessRangerSyncService rangerSyncService;
    @Autowired
    private DDSKafkaLogUtil ddsKafkaLogUtil;

    public DataSecurityAccessRangerSyncController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @PostMapping("/add")
    @Operation(summary = "新增数据安全ranger同步")
    public ResResultDto<?> addDataSecurityAccessRangerSync(@RequestBody DataSecurityAccessRangerSyncDto rangerSyncDto) {
        rangerSyncDto.setCreator(AuthTools.currentUsernameFailFast());
        return ResResultDto.ok(rangerSyncService.addRangerSync(rangerSyncDto));
    }

    @PostMapping("/all")
    @Operation(summary = "获取所有数据安全ranger同步")
    public ResResultDto<?> getAllDataSecurityAccessRangerSync() {
        return ResResultDto.ok(rangerSyncService.getAllRangerSync());
    }

    @PostMapping("/delete/{syncId}")
    @Operation(summary = "删除数据安全ranger同步")
    public ResResultDto<?> deleteDataSecurityAccessRangerSync(@PathVariable("syncId") Long syncId) {
        rangerSyncService.deleteRangerSync(syncId);
        return ResResultDto.ok();
    }

    @PostMapping("/modify/{status}")
    @Operation(summary = "修改数据安全ranger同步状态")
    public ResResultDto<?> modifyDataSecurityAccessRangerSyncStatus(@PathVariable("status") Boolean status) {
        rangerSyncService.modifyRangerStatus(status);
        ddsKafkaLogUtil.modifyRangerSync(rangerSyncService.getAllRangerSync(), status,
                getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
        return ResResultDto.ok();
    }
}
