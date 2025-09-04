package com.datablau.base.server.controller;

import com.datablau.base.server.utility.ServerConstants;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.udp.MetadataUdpEntry;
import com.datablau.security.management.api.RoleService;
import com.datablau.udp.jpa.entity.MetadataUserDefinedProperty;
import com.datablau.udp.jpa.entity.MetadataUserDefinedPropertyValue;
import com.datablau.udp.service.api.MetadataUserDefinedPropertyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * @author nicky - 数语科技有限公司
 * date 2023/5/16 15:12
 */
@RestController
@RequestMapping("/udps")
public class UserDefinedPropertyController extends BaseController {

    @Autowired
    private MetadataUserDefinedPropertyService udpService;

    public UserDefinedPropertyController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @PostMapping("/getUdpsOfType")
    @Operation(summary = "得到一个类型的所有udp")
    public List<MetadataUserDefinedProperty> getTypeUdps(@Parameter(name = "typeId", description = "类型ID")
        @RequestParam("typeId") Long typeId) {
        return udpService.getTypeBindUdps(typeId);
    }

    @PostMapping("/getValuesOfUdp")
    @Operation(summary = "得到一个UDP的所有已经被使用的值的列表")
    public Set<String> getValuesOfUdp(
        @Parameter(name = "udpId", description = "udp的id")
        @RequestParam("udpId") Long udpId) {
        return udpService.getAllValuesOfUdp(udpId);
    }

    @PostMapping(value = "/getValuesOfGivenUdps")
    @Operation(summary = "得到指定的UDP的已经被使用的值")
    public Map<Long, Set<String>> getValuesOfUdpMap(@RequestBody List<Long> udpIds) {
        return udpService.getAllValuesOfUdpMap(udpIds);
    }

//    @OperatorLog(
//        operation = OperationLogType.TABLE_MODIFY,
//        operateTable = "met_data_udp",
//        systemModule = OperationModuleType.SYSTEM_CATEGORY,
//        description = "编辑业务属性: {param}",
//        descriptionParamClass = MetadataUserDefinedProperty.class,
//        descriptionParamMethod = "getName"
//    )
    @PostMapping(value = "/updateUdpOfType")
    @Operation(summary = "对一种类型创建或者更新一条udp")
    public MetadataUserDefinedProperty createOrUpdateUdp(
        @Parameter(name = "typeId", description ="类型ID")
        @RequestParam("typeId") Long typeId,
        @RequestBody MetadataUserDefinedProperty udp) {
        udp.setTypeId(typeId);
        return udpService.createOrUpdateMetadataUdp(udp);
    }

//    @OperatorLog(
//        operation = OperationLogType.TABLE_DELETE,
//        operateTable = "met_data_udp,met_data_udp_val",
//        systemModule = OperationModuleType.SYSTEM_CATEGORY,
//        description = "删除业务属性，id为: {param}",
//        descriptionParamClass = Long.class,
//        descriptionParamMethod = "toString"
//    )
    @PostMapping(value = "/deleteUdp")
    @Operation(summary = "删除一个udp")
    public void deleteUdp(@Parameter(name = "udpId", description = "udp的ID") @RequestParam("udpId") Long udpId) {
        udpService.deleteUdp(udpId);
    }

//    @OperatorLog(
//        operation = OperationLogType.TABLE_ADD,
//        operateTable = "met_data_udp",
//        systemModule = OperationModuleType.SYSTEM_CATEGORY,
//        description = "创建自定义业务属性值"
//    )
    @PostMapping(value = "/updateItemUdpValue")
    @Operation(summary = "创建一个自定义属性值")
    public MetadataUserDefinedPropertyValue createUdpValue(
        @Parameter(name = "itemId", description = "对象的id") @RequestParam("itemId") String itemId,
        @Parameter(name = "udpId", description = "udp的id") @RequestParam("udpId") Long udpId,
        @Parameter(name = "containerType", description = "上层集合对象类型ID， 比如Datasource, Table")  @RequestParam("containerType") String containerType,
        @Parameter(name = "containerId", description = "上层集合对象的id") @RequestParam("containerId") String containerId,
        @RequestBody String value) {

        return udpService.createUdpValue(itemId, udpId, containerType, containerId, value);
    }

//    @OperatorLog(
//        operation = OperationLogType.TABLE_MODIFY,
//        operateTable = "met_data_udp",
//        systemModule = OperationModuleType.SYSTEM_CATEGORY,
//        description = "编辑自定义业务属性值"
//    )
    @PostMapping(value = "/updateUdpValue")
    @Operation(summary = "修改UDP值")
    public MetadataUserDefinedPropertyValue updateUdpValue(
        @Parameter(name = "valueId", description = "udp值的ID") @RequestParam("valueId") String valueId,
        @RequestBody(required = false) String value) {
        return udpService.updateUdpValue(valueId, value);
    }

    @PostMapping("/getItemUdps")
    @Operation(summary = "获取对象的UDP")
    public List<MetadataUdpEntry> getUdpValuesByItemIdAndTypeId(
        @Parameter(name = "itemId", description = "对象id") @RequestParam("itemId") String itemId,
        @Parameter(name = "typeId", description = "对象类型id") @RequestParam("typeId") Long typeId) {
        return udpService.getUdpsByItemIdAndTypeId(itemId, typeId);
    }

    @PostMapping("/select")
    @Operation(summary = "提供udp的分类，用作下拉框")
    public List<String> getUdpCatalogSelect() {
        return udpService.getUdpCatalogSelect();
    }
}
