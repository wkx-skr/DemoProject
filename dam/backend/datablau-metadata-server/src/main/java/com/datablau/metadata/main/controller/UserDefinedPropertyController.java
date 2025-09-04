package com.datablau.metadata.main.controller;

import com.andorj.common.core.model.LDMTypes;
import com.andorj.model.common.api.MessageService;
import com.datablau.common.kafka.msg.BasicMsg;
import com.datablau.common.kafka.producer.KafkaProducer;
import com.datablau.data.common.api.OperationLogService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.operation.type.OperationLogType;
import com.datablau.data.common.operation.type.OperationModuleType;
import com.datablau.data.common.udp.MetadataUdpEntry;
import com.datablau.metadata.main.dto.MetaDataIncrementDto;
import com.datablau.metadata.main.dto.UdpObjectIdMsgDto;
import com.datablau.metadata.main.entity.metadata.DataObject;
import com.datablau.metadata.main.entity.report.DataReport;
import com.datablau.metadata.main.entity.share.file.DataShareFile;
import com.datablau.metadata.main.service.metadata.api.DataObjectService;
import com.datablau.metadata.main.service.report.api.DataReportService;
import com.datablau.metadata.main.service.share.file.api.DataShareFileService;
import com.datablau.metadata.main.util.ServerConstants;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import com.datablau.udp.jpa.entity.MetadataUserDefinedProperty;
import com.datablau.udp.jpa.entity.MetadataUserDefinedPropertyValue;
import com.datablau.udp.jpa.repository.MetadataUserDefinedPropertyRepository;
import com.datablau.udp.service.api.MetadataUserDefinedPropertyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * @author nicky - 数语科技有限公司
 * date 2023/5/16 15:12
 */
@RestController
@RequestMapping("/udps")
public class UserDefinedPropertyController extends BaseController {
    private static final Logger LOGGER = LoggerFactory.getLogger(UserDefinedPropertyController.class);

    @Autowired
    private MetadataUserDefinedPropertyService udpService;
    @Autowired
    private OperationLogService operationLogService;
    @Autowired
    private MessageService msgService;
    @Autowired
    private DataObjectService dataObjectService;
    @Autowired
    private DataShareFileService dataShareFileService;
    @Autowired
    private DataReportService dataReportService;

    @Autowired
    private MetadataUserDefinedPropertyRepository metadataUdpDao;

    public UserDefinedPropertyController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @PostMapping("/getUdpsOfType")
    @Operation(summary = "得到一个类型的所有udp")
    public List<MetadataUserDefinedProperty> getTypeUdps(@Parameter(name = "typeId", description = "类型ID")
                                                         @RequestParam("typeId") Long typeId,
                                                         @RequestParam(value = "groupId", required = false) Long groupId) {
        if (groupId == null) {
            return udpService.getTypeBindUdps(typeId);
        } else {
            return udpService.getTypeBindUdps(typeId, groupId);
        }
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
//        operateTable = "dam_data_udp",
//        systemModule = OperationModuleType.METADATA_DATA,
//        description = "编辑扩展属性，名称为: {param}",
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
        if (udp.getGroupId() == null) {
            udp.setGroupId(MetadataUserDefinedPropertyService.TEMP_PHYSICAL_GROUP_ID);
        }
        return udpService.createOrUpdateMetadataUdp(udp);
    }

//    @OperatorLog(
//        operation = OperationLogType.TABLE_DELETE,
//        operateTable = "dam_data_udp,met_data_udp_val",
//        systemModule = OperationModuleType.METADATA_DATA,
//        description = "删除扩展属性，id为: {param}",
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
//        operateTable = "dam_data_udp",
//        systemModule = OperationModuleType.METADATA_DATA,
//        description = "设置自定义扩展属性属性值"
//    )
    @PostMapping(value = "/updateItemUdpValue")
    @Operation(summary = "创建一个自定义属性值")
    public MetadataUserDefinedPropertyValue createUdpValue(
        @Parameter(name = "itemId", description = "对象的id") @RequestParam("itemId") String itemId,
        @Parameter(name = "udpId", description = "udp的id") @RequestParam("udpId") Long udpId,
        @Parameter(name = "containerType", description = "上层集合对象类型ID， 比如Datasource, Table")  @RequestParam("containerType") String containerType,
        @Parameter(name = "containerId", description = "上层集合对象的id") @RequestParam("containerId") String containerId,
        @RequestBody(required = false) String value) {

        MetadataUserDefinedPropertyValue propertyValue = udpService.createUdpValue(itemId, udpId, containerType, containerId, value);
        MetadataUserDefinedProperty udp = this.metadataUdpDao.findById(udpId).get();
        if(udp.getTypeId() == 80000004L || udp.getTypeId() == 80000005L){
            this.tokafkaMetaDataIncrement(List.of(Long.valueOf(itemId)));
        }
        //增加日志
        addUdpLog(propertyValue);

        return propertyValue;
    }

    @Autowired
    private KafkaProducer kafkaProducer;
    @Value("${datablau.kafka-topic.metadata-increment:datablau-metadata-increment}")
    private String metadataIncrementKafkaTopic;

    private void tokafkaMetaDataIncrement(List<Long> result) {
        if(CollectionUtils.isEmpty(result)){
            LOGGER.info("没有产生新的ObjectId");
            return;
        }
        LOGGER.info("产生新的Id{}", result);
        kafkaProducer.sendMessage(metadataIncrementKafkaTopic, new MetaDataIncrementDto(result));
    }

//    private void tokafkaToUdp(Long typeId, String itemId) {
//        LOGGER.info("变更扩展属性的Id：" + itemId + "， 类型是：" + typeId);
//
//        String topic = "datablau-metadata-udpObjectId";
//        List<UdpObjectIdMsgDto> res = List.of(new UdpObjectIdMsgDto(typeId, itemId));
//        kafkaProducer.sendMessage(topic, new BasicMsg(res.toString()));
//    }

    protected void addUdpLog(MetadataUserDefinedPropertyValue propertyValue) {
        try {
            MetadataUserDefinedProperty property = udpService.getUdpPropertyById(propertyValue.getUdpId());

            String logMessage;
            Long typeId = property.getTypeId();
            String itemId = propertyValue.getItemId();
            OperationModuleType moduleType = OperationModuleType.METADATA_DATA;
            if (typeId == LDMTypes.oEntity) {
                DataObject dataObject = dataObjectService.getDataObjectByObjectId(Long.parseLong(itemId));
                logMessage = msgService.getMessage("metadata.table.udp.log.modify", dataObject.getFullName());
            } else if (typeId == LDMTypes.oView) {
                DataObject dataObject = dataObjectService.getDataObjectByObjectId(Long.parseLong(itemId));
                logMessage = msgService.getMessage("metadata.view.udp.log.modify", dataObject.getFullName());
            } else if (typeId == LDMTypes.oAttribute) {
                DataObject dataObject = dataObjectService.getDataObjectByObjectId(Long.parseLong(itemId));
                logMessage = msgService.getMessage("metadata.column.udp.log.modify", dataObject.getFullName());
            } else if (typeId == LDMTypes.oUnstructuredDataAssets) {
                DataShareFile shareFile = dataShareFileService.findDataShareFileById(Long.parseLong(itemId));
                logMessage = msgService.getMessage("metadata.file.udp.log.modify", shareFile.getName());
                moduleType = OperationModuleType.METADATA_SHAREFILE;
            } else if (typeId == LDMTypes.oDataReport) {
                DataReport dataReport = dataReportService.loadDataReport(Long.parseLong(itemId));
                logMessage = msgService.getMessage("metadata.report.udp.log.modify", dataReport.getName());
                moduleType = OperationModuleType.METADATA_REPORT;
            }  else {
                return;
            }

            operationLogService.generateOperationLog(moduleType, "db_udp_val",
                    OperationLogType.TABLE_MODIFY, logMessage, AuthTools.currentUsername(), 0);
        } catch (Exception e) {
            LOGGER.error(e.getMessage());
        }
    }

    //    @OperatorLog(
//        operation = OperationLogType.TABLE_MODIFY,
//        operateTable = "dam_data_udp",
//        systemModule = OperationModuleType.METADATA_DATA,
//        description = "修改自定义扩展属性属性值"
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
}
