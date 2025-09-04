package com.datablau.metadata.main.controller;

import com.andorj.common.core.model.LDMTypes;
import com.andorj.model.common.api.MessageService;
import com.datablau.data.common.api.OperationLogService;
import com.datablau.data.common.operation.type.OperationLogType;
import com.datablau.data.common.operation.type.OperationModuleType;
import com.datablau.metadata.common.api.DataManagerService;
import com.datablau.metadata.common.dto.DataManagerTableDto;
import com.datablau.metadata.main.dao.DataManagerRepository;
import com.datablau.metadata.main.entity.DataManagerTable;
import com.datablau.metadata.main.entity.metadata.DataObject;
import com.datablau.metadata.main.entity.report.DataReport;
import com.datablau.metadata.main.entity.share.file.DataShareFile;
import com.datablau.metadata.main.service.metadata.api.DataObjectService;
import com.datablau.metadata.main.service.report.api.DataReportService;
import com.datablau.metadata.main.service.share.file.api.DataShareFileService;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * lishfe-数语科技有限公司
 * 2021-5-14
 */
@RestController
@RequestMapping("/dataManager")
@Tag(name = "数据关联相关API")
public class DataManagerController extends LocalBaseController {

    private static final Logger log = LoggerFactory.getLogger(DataManagerController.class);

    @Autowired
    private DataManagerService dataManagerService;
    @Autowired
    private DataObjectService dataObjectService;
    @Autowired
    private DataManagerRepository dataManagerRepository;
    @Autowired
    private MessageService msgService;
    @Autowired
    private OperationLogService operationLogService;
    @Autowired
    private DataReportService dataReportService;
    @Autowired
    private DataShareFileService dataShareFileService;

    public DataManagerController(@Autowired RoleService roleService) {
        super(roleService);
    }


    @RequestMapping(method = RequestMethod.GET, value = "/")
    public List<DataManagerTableDto> getAllDataManagerTables() throws Exception {
        return dataManagerService.findAll();
    }

    @RequestMapping(method = RequestMethod.GET, value = "/{dataId}/{dataType}")
    @Operation(summary = "通过唯一id获取所有数据管理")
    public List<DataManagerTableDto> getAllDataManagersByDataId(@Parameter(name = "dataId", description = "唯一id")
                                                             @PathVariable("dataId") String dataId,
                                                             @Parameter(name = "dataType", description = "数据类型")
                                                             @PathVariable("dataType") Long dataType) throws Exception {
        return dataManagerService.findDataManagerTablesByDataIdAndAndDataType(dataId, dataType);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/{username}")
    //todo 7.0 AuditLog
    //@AuditLog
    public List<DataManagerTableDto> findDataManagerTablesByUsername(@PathVariable("username") String username) throws Exception {
        return dataManagerService.findDataManagerTablesByUsername(username);
    }

    @RequestMapping(value = "/save", method = RequestMethod.POST)
    public void createDataManagerTable(@RequestBody DataManagerTable dataManagerTable) throws Exception {
        checkEditMetadataManagerPermissions(dataManagerTable);
        dataManagerService.save(dataManagerTable.toDto());
    }

    @RequestMapping(value = "/saves", method = RequestMethod.POST)
    @Operation(summary = "创建数据管理表")
    public void createDataManagerTables(@RequestBody List<DataManagerTable> dataManagerTables) throws Exception {
        for (DataManagerTable dataManagerTable : dataManagerTables) {
            checkEditMetadataManagerPermissions(dataManagerTable);
        }
        dataManagerService.saves(dataManagerTables.stream().map(DataManagerTable::toDto).collect(
            Collectors.toList()));
        //同步数据资产es
        dataManagerService.sendMsg(dataManagerTables.stream().map(DataManagerTable::toDto).collect(
            Collectors.toList()));

        //增加日志
        addModifyDataManagermentLog(dataManagerTables);
    }

    protected void addModifyDataManagermentLog(List<DataManagerTable> dataManagerTables) {
        try {
            Set<Long> entityIds = new HashSet<>();
            Set<Long> reportIds = new HashSet<>();
            Set<Long> fileIds = new HashSet<>();

            dataManagerTables.forEach(d -> {
                if (d.getDataType() == LDMTypes.oEntity || d.getDataType() == LDMTypes.oView) {
                    entityIds.add(Long.parseLong(d.getDataId()));
                } else if (d.getDataType() == LDMTypes.oDataReport) {
                    reportIds.add(Long.parseLong(d.getDataId()));
                } else if (d.getDataType() == LDMTypes.oUnstructuredDataAssets) {
                    fileIds.add(Long.parseLong(d.getDataId()));
                }
            });

            for (DataObject dataObject : dataObjectService.getDataObjectsByIds(entityIds)) {
                String entityName = dataObject.getFullName();
                String logMessage = msgService.getMessage("metadata.table.dataManager.log.modify", entityName);
                operationLogService.generateOperationLog(OperationModuleType.METADATA_DATA, "dam_data_manager",
                        OperationLogType.TABLE_MODIFY, logMessage, AuthTools.currentUsername(), 0);
            }
            for (DataReport dataReport : dataReportService.getDataReportsByIds(reportIds)) {
                String logMessage = msgService.getMessage("metadata.report.dataManager.log.modify", dataReport.getName());
                operationLogService.generateOperationLog(OperationModuleType.METADATA_REPORT, "dam_data_manager",
                        OperationLogType.TABLE_MODIFY, logMessage, AuthTools.currentUsername(), 0);
            }
            for (DataShareFile dataShareFile : dataShareFileService.findDataShareFileByIds(new ArrayList<>(fileIds))) {
                String logMessage = msgService.getMessage("metadata.file.dataManager.log.modify", dataShareFile.getName());
                operationLogService.generateOperationLog(OperationModuleType.METADATA_SHAREFILE, "dam_data_manager",
                        OperationLogType.TABLE_MODIFY, logMessage, AuthTools.currentUsername(), 0);
            }
        } catch (Exception e) {
            log.error(e.getMessage());
        }
    }

    @RequestMapping(value = "/update", method = RequestMethod.PUT)
    public void updateDataManagerTable(@RequestBody DataManagerTable dataManagerTable) throws Exception {
        checkEditMetadataManagerPermissions(dataManagerTable);
        dataManagerService.save(dataManagerTable.toDto());
    }

    @RequestMapping(value = "/del/{id}", method = RequestMethod.POST)
    @Operation(summary = "删除ataManagerTable")
    public void deleteDataManagerTable(@PathVariable("id") Long id) throws Exception {
        Optional<DataManagerTable> byId = dataManagerRepository.findById(id);
        if (byId.isPresent()) {
            DataManagerTable dataManagerTable = byId.get();
            checkEditMetadataManagerPermissions(dataManagerTable);
        }
        dataManagerService.delete(id);
        //同步数据资产es
        List<DataManagerTable> dataManagerTables = new ArrayList<>();
        dataManagerTables.add(byId.get());
        dataManagerService.sendMsg(dataManagerTables.stream().map(DataManagerTable::toDto).collect(
            Collectors.toList()));

        //增加日志
        addModifyDataManagermentLog(dataManagerTables);
    }

    @RequestMapping(value = "/dels/{ids}", method = RequestMethod.POST)
    public void deleteDataManagerTables(@PathVariable("ids") List<Long> ids) throws Exception {
        for (DataManagerTable dataManagerTable : dataManagerRepository.findAllById(ids)) {
            checkEditMetadataManagerPermissions(dataManagerTable);
        }
        dataManagerService.deletes(ids);
    }

    private void checkEditMetadataManagerPermissions(DataManagerTable dataManagerTable) {
        if (dataManagerTable != null && dataManagerTable.getDataType() == LDMTypes.oEntity) {
            DataObject dataObject = dataObjectService.getDataObjectByObjectId(
                    dataManagerTable.getDataId());
            if (dataObject != null) {
                checkMetadataEditPermissions(dataObject);
            }
        }
    }

}
