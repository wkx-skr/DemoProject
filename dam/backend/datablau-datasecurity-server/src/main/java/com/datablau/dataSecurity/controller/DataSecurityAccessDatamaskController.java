package com.datablau.dataSecurity.controller;

import com.datablau.common.utils.IpUtil;
import com.datablau.data.common.controller.BaseController;
import com.datablau.dataAccess.dto.ColumnMaskDto;
import com.datablau.dataAccess.dto.DataSecurityAccessControlDto;
import com.datablau.dataAccess.dto.DataSecurityAccessStrategyDto;
import com.datablau.dataAccess.dto.MaskSearchDto;
import com.datablau.dataAccess.dto.ResResultDto;
import com.datablau.dataAccess.dto.TableMaskDetailDto;
import com.datablau.dataAccess.dto.TableMaskDto;
import com.datablau.dataAccess.service.api.DataSecurityAccessDatamaskService;
import com.datablau.dataAccess.utility.ServerConstants;
import com.datablau.dataAccess.utils.CommonUtil;
import com.datablau.dataSecurity.utils.DDSKafkaLogUtil;
import com.datablau.metadata.common.api.DatablauRemoteMetadataService;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Description: new java files header..
 *
 * @author liuhao
 * @version 1.0
 * @date 2023/2/22 15:41
 */
@RestController
@RequestMapping("/accessStrategy/mask")
public class DataSecurityAccessDatamaskController extends BaseController {

    @Autowired
    private DataSecurityAccessDatamaskService datamaskService;

    @Autowired
    private DDSKafkaLogUtil ddsKafkaLogUtil;

    public DataSecurityAccessDatamaskController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "新增字段级脱敏策略")
    @PutMapping("/column")
    public void addColumnMask(@RequestBody ColumnMaskDto columnMaskDto) {
        columnMaskDto.setCreator(AuthTools.currentUsernameFailFast());
        datamaskService.addColumnMask(columnMaskDto);
        ddsKafkaLogUtil.addAccessStrategy(columnMaskDto.getAccessStrategyName(), getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
    }

    @Operation(summary = "新增表级脱敏策略")
    @PutMapping("/table")
    public void addTableMask(@RequestBody TableMaskDto tableMaskDto) {
        tableMaskDto.setCreator(AuthTools.currentUsernameFailFast());
        datamaskService.addTableMask(tableMaskDto);
        ddsKafkaLogUtil.addAccessStrategy(tableMaskDto.getAccessStrategyName(), getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
    }

    @Operation(summary = "获取字段级脱敏策略详情")
    @PostMapping("/column")
    public ResResultDto<Map<String, Object>> getColumnMask(@RequestBody MaskSearchDto maskSearchDto) {
        return ResResultDto.ok(datamaskService.getColumnMask(maskSearchDto));
    }

    @Operation(summary = "获取表级脱敏策略详情")
    @PostMapping("/table")
    public ResResultDto<List<TableMaskDetailDto>> getTableMask(@RequestBody MaskSearchDto maskSearchDto) {
        return ResResultDto.ok(datamaskService.getTableMask(maskSearchDto));
    }

    @Operation(summary = "获取表级脱敏策略适用范围")
    @PostMapping("/table/scope")
    public ResResultDto<Map<String, Object>> getTableScopeMask(@RequestBody MaskSearchDto maskSearchDto) {
        return ResResultDto.ok(datamaskService.getTableMaskScope(maskSearchDto));
    }

    @Operation(summary = "修改字段级脱敏策略")
    @PostMapping("/column/modify")
    public void modifyColumnMask(@RequestBody ColumnMaskDto columnMaskDto) {
        datamaskService.modifyColumnMask(columnMaskDto);
        ddsKafkaLogUtil.modifyAccessStrategy(columnMaskDto.getAccessStrategyName(), getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
    }

    @Operation(summary = "修改表级脱敏策略")
    @PostMapping("/table/modify")
    public void modifyTableMask(@RequestBody TableMaskDto tableMaskDto) {
        datamaskService.modifyTableMask(tableMaskDto);
        ddsKafkaLogUtil.modifyAccessStrategy(tableMaskDto.getAccessStrategyName(), getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
    }

    @Operation(summary = "删除脱敏策略")
    @DeleteMapping("/")
    public void deleteMasks(@RequestBody List<Long> accessIds) {
        List<DataSecurityAccessControlDto> controlDtoList = datamaskService.deleteMasks(accessIds);
        ddsKafkaLogUtil.deleteAccessStrategy(controlDtoList, getCurrentUser(), IpUtil.getUserIp(), IpUtil.getUrl());
    }


}
