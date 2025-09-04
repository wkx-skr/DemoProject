package com.datablau.data.asset.controller;

import com.datablau.catalog.jpa.entity.CommonCatalog;
import com.datablau.data.asset.api.DataAssetsCatalogAuthService;
import com.datablau.data.asset.api.DataAssetsCatalogService;
import com.datablau.data.asset.dto.AuthRelDto;
import com.datablau.data.asset.dto.CommonAuthDto;
import com.datablau.data.asset.dto.MandateObjDto;
import com.datablau.data.asset.enums.EnumMandateType;
import com.datablau.data.asset.jpa.entity.DataAssetsCatalogAuth;
import com.datablau.data.asset.utils.KafkaLogUtils;
import com.datablau.data.asset.utils.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.dataasset.utils.IpUtil;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @ClassName : DataAssetsAuthRelController
 * @Description : 权限相关
 * @Author : Xu XiaoQian
 * @Date : 2022/7/1
 **/
@Tag(name = "数据目录权限相关 API")
@RestController
@RequestMapping(value = "/auth")
public class DataAssetsAuthRelController extends BaseController {

    @Autowired
    private KafkaLogUtils kafkaLogUtils;
    @Autowired
    private DataAssetsCatalogAuthService authService;
    @Autowired
    private DataAssetsCatalogService catalogService;

    public DataAssetsAuthRelController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @Operation(summary = "获取目录得所有权限")
    @Parameters({@Parameter(name = "catalogId", description = "目录id", in = ParameterIn.PATH)})
    @GetMapping("/list/{catalogId}/{mandateType}")
    public CommonAuthDto get(@PathVariable("catalogId") Long catalogId, @PathVariable("mandateType") EnumMandateType type) {
        return authService.findCatalogAuthByMandateType(catalogId, type);
    }

    @Operation(summary = "添加新得权限")
    @Parameters({@Parameter(name = "catalogId", description = "目录id", in = ParameterIn.PATH)})
    @PostMapping("/manage/{catalogId}")
    public void addAuth(@PathVariable("catalogId") Long catalogId, @RequestBody AuthRelDto authRelDto) {
        List<Long> ids = authRelDto.getMandateObjDtos().stream().filter(m -> m.getRelId() != null && !m.isDelete()).map(MandateObjDto::getRelId).toList();
        List<String> users = authRelDto.getMandateObjDtos().stream().map(m -> authRelDto.getMandateType() == EnumMandateType.PERSON ? m.getUsername() : m.getName()).toList();
        Map<Long, DataAssetsCatalogAuth> originMap = authService.findByRelIds(ids).stream().collect(Collectors.toMap(DataAssetsCatalogAuth::getId, a -> a));
        String path = catalogService.getFullPathByCatalogId(catalogId);
        List<CommonCatalog> subCatalogs = new ArrayList<>();
        Map<String, DataAssetsCatalogAuth> extendMap = new HashMap<>();
        if (authRelDto.isExtendSub()) {
            subCatalogs = catalogService.getSubCatalogs(catalogId, false);
            if (!subCatalogs.isEmpty()) {
                List<DataAssetsCatalogAuth> catalogsAndUsers = authService.findByCatalogsAndUsers(authRelDto.getMandateType(), subCatalogs.stream().map(CommonCatalog::getId).toList(), users);
                catalogsAndUsers.forEach(a -> extendMap.put(a.getCatalogId() + a.getTargetId(), a));
            }

        }

        authService.manage(this.getCurrentUser(), catalogId, authRelDto);
        kafkaLogUtils.addAuth(this.getCurrentUser(), authRelDto, catalogId, path, originMap, IpUtil.getUserIp(), IpUtil.getUrl());

        subCatalogs.forEach(s -> {
            String subPath = catalogService.getFullPathByCatalogId(s.getId());
            kafkaLogUtils.extendAuth(this.getCurrentUser(), authRelDto, s.getId(), subPath, extendMap, IpUtil.getUserIp(), IpUtil.getUrl());
        });

    }

}
