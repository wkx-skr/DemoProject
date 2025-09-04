
package com.datablau.data.asset.controller;

import com.datablau.catalog.jpa.entity.CommonCatalog;
import com.datablau.data.asset.api.DataAssetsCatalogService;
import com.datablau.data.asset.api.DataAssetsCatalogUdpService;
import com.datablau.data.asset.dto.DataAssetsCatalogUdpDto;
import com.datablau.data.asset.dto.DataAssetsCatalogUdpValDto;
import com.datablau.data.asset.dto.ResResultDto;
import com.datablau.data.asset.utils.KafkaLogUtils;
import com.datablau.data.asset.utils.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.dataasset.utils.IpUtil;
import com.datablau.security.management.api.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.Parameters;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Tag(name = "资产目录扩展属性")
@RestController
@RequestMapping("/catalog/udp")
public class DataAssetsCatalogUdpController extends BaseController {


    @Autowired
    private KafkaLogUtils kafkaLogUtils;
    @Autowired
    private DataAssetsCatalogService dataAssetsCatalogService;
    @Autowired
    private DataAssetsCatalogUdpService dataAssetsCatalogUdpService;

    public DataAssetsCatalogUdpController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @GetMapping("/getcatalogudpbycatalogtypeid")
    @Operation(summary = "查询某目录类型的扩展属性列表")
    public ResResultDto<List<DataAssetsCatalogUdpDto>> getCatalogUdpBycatalogTypeId(Long catalogTypeId) {
        List<DataAssetsCatalogUdpDto> result = dataAssetsCatalogUdpService.getCatalogUdpByCatalogTypeId(catalogTypeId);
        return ResResultDto.ok(result);
    }

    @PostMapping("/addorupdatecatalogudp")
    @Operation(summary = "新增/编辑某目录类型的扩展属性")
    public ResResultDto addOrUpdateCatalogUdp(@RequestBody List<DataAssetsCatalogUdpDto> dtoList) {
        return dataAssetsCatalogUdpService.addOrUpdateCatalogUdpV2(dtoList) ? ResResultDto.ok()
                : ResResultDto.error("新增/编辑扩展属性失败");
    }

    @DeleteMapping("/{udpId}")
    @Operation(summary = "删除某个扩展属性")
    @Parameter(name = "udpId",description = "目录扩展属性ID")
    public ResResultDto deleteUpd(@PathVariable("udpId") Long udpId) {

        return dataAssetsCatalogUdpService.deleteUdp(udpId) ? ResResultDto.ok()
                : ResResultDto.error("删除扩展属性失败");
    }

    @Operation(summary = "单个目录扩展属性查询")
    @Parameters({@Parameter(name = "catalogId",description = "目录ID")})
    @GetMapping("/{catalogId}")
    public ResResultDto<Map<String, List<Map<String,Object>>>> getCatalogUpds(@PathVariable("catalogId") Long catalogId) {
        CommonCatalog catalog = dataAssetsCatalogService.getById(catalogId);
        Map<String, List<Map<String,Object>>> result = dataAssetsCatalogUdpService.getCatalogUdps(catalog.getCatalogTypeId(), catalogId);
        return ResResultDto.ok(result);
    }

    @PostMapping("/addorupdateupdval")
    @Operation(summary = "批量扩展属性值新增/编辑")
    public ResResultDto addOrUpdateUpdVal(@RequestBody List<DataAssetsCatalogUdpValDto> boList) {
        dataAssetsCatalogUdpService.addOrUpdateUpdVal(boList);
        boList.forEach(bo->{
            String fullPathByCatalogPath = dataAssetsCatalogService.getFullPathByCatalogId(bo.getCatalogId());
            bo.setCatalogName(fullPathByCatalogPath);
        });
        kafkaLogUtils.changeUdps(this.getCurrentUser(), boList, IpUtil.getUserIp(), IpUtil.getUrl());
        return ResResultDto.ok();
    }
}
