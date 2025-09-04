package com.datablau.dataSecurity.controller;

import com.datablau.catalog.enums.EnumStructureType;
import com.datablau.catalog.jpa.entity.CommonCatalogTypeIcon;
import com.datablau.common.utils.IpUtil;
import com.datablau.data.common.controller.BaseController;
import com.datablau.dataAccess.utility.ServerConstants;
import com.datablau.dataSecurity.dto.DataSecurityStructureDto;
import com.datablau.dataSecurity.dto.DataSecurityStructureValueDto;
import com.datablau.dataSecurity.service.api.DataSecurityStructureService;
import com.datablau.dataSecurity.service.api.DataSecuritySyncCatalogService;
import com.datablau.dataSecurity.service.api.DataSecuritySyncConfigService;
import com.datablau.dataSecurity.utils.DDSKafkaLogUtil;
import com.datablau.dataasset.api.RemoteDataAssetsCatalogStructureService;
import com.datablau.dataasset.dto.DataAssetsCatalogStructureDto;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;


/**
 * @ClassName : DataSecurityStructureController
 * @Description : 数据安全的结构相关
 * @Author : Xu XiaoQian
 * @Date : 2022/10/21
 **/
@RestController
@RequestMapping("/datasecurity/structure")
public class DataSecurityStructureController extends BaseController {

    @Autowired
    private DataSecuritySyncConfigService syncConfigService;
    @Autowired
    private DataSecuritySyncCatalogService syncCatalogService;
    @Autowired
    private DataSecurityStructureService securityStructureService;
    @Autowired
    private RemoteDataAssetsCatalogStructureService remoteDataAssetsCatalogStructureService;
    @Autowired
    private DDSKafkaLogUtil logUtils;

    public DataSecurityStructureController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }


    @Operation(summary = "拉取安全的目录结构")
    @GetMapping("/list")
    public DataSecurityStructureValueDto list() {
        DataSecurityStructureValueDto structureVo = securityStructureService.getOne(EnumStructureType.DATA_SECURITY);
        structureVo.setConfigDto(syncConfigService.getSyncConfig());
        return structureVo;
    }

    @Operation(summary = "拉取资产的目录结构")
    @GetMapping("/list/ddc")
    public List<DataAssetsCatalogStructureDto> ddc() {
        return remoteDataAssetsCatalogStructureService.getAllBySecurity();
    }


    @Operation(summary = "更新安全分类结构")
    @PostMapping("/save")
    public void saveStructure(@RequestBody DataSecurityStructureDto dto) {
        String username = this.getCurrentUser();
        Long sId = securityStructureService.save(username, dto);
        logUtils.saveStructureLog(dto, username, IpUtil.getUserIp(), IpUtil.getUrl());
        if (dto.getConfig().isOpenSync() || dto.getConfig().isSersync()) {
            syncCatalogService.syncAll(sId);
            //添加日志
            logUtils.addSynchronizationStructrue(dto, username, IpUtil.getUserIp(), IpUtil.getUrl());
        }
    }

    @Operation(summary = "获取目录类型icon")
    @GetMapping("/icon/{iconId}")
    public void getIcon(HttpServletResponse response, @PathVariable("iconId") Long iconId) throws IOException {
        CommonCatalogTypeIcon icon = securityStructureService.getIcon(iconId);
        response.getOutputStream().write(icon.getIcon());
    }
}
