package com.datablau.metadata.main.controller;

import com.andorj.common.core.model.LDMTypes;
import com.andorj.model.common.api.MessageService;
import com.datablau.data.common.api.OperationLogService;
import com.datablau.data.common.operation.type.OperationLogType;
import com.datablau.data.common.operation.type.OperationModuleType;
import com.datablau.metadata.common.api.DataDepartmentService;
import com.datablau.metadata.common.dto.DataDepartmentTableDto;
import com.datablau.metadata.main.dao.DataDepartmentRepository;
import com.datablau.metadata.main.entity.DataDepartmentTable;
import com.datablau.metadata.main.entity.metadata.DataObject;
import com.datablau.metadata.main.entity.report.DataReport;
import com.datablau.metadata.main.service.metadata.api.DataObjectService;
import com.datablau.metadata.main.service.report.api.DataReportService;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.utils.AuthTools;
import com.google.common.collect.Lists;
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

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * lishfe-数语科技有限公司
 * 2021-5-14
 */
@RestController
@RequestMapping("/dataDepartment")
@Tag(name = "dataDepartment相关API")
public class DataDepartmentController extends LocalBaseController {

    private static final Logger log = LoggerFactory.getLogger(DataDepartmentController.class);

    @Autowired
    private DataDepartmentService dataDepartmentService;
    @Autowired
    private DataObjectService dataObjectService;
    @Autowired
    private DataDepartmentRepository dataDepartmentRepository;
    @Autowired
    private MessageService msgService;
    @Autowired
    private OperationLogService operationLogService;
    @Autowired
    private DataReportService dataReportService;

    public DataDepartmentController(@Autowired RoleService roleService) {
        super(roleService);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/")
    public List<DataDepartmentTableDto> getAllDataDepartmentTables() throws Exception {
        return dataDepartmentService.findAll();
    }

    @RequestMapping(method = RequestMethod.GET, value = "/{dataId}/{dataType}")
    @Operation(summary = "获取所有DataDepartments")
    public List<DataDepartmentTableDto> getAllDataDepartmentsByDataId(@Parameter(name = "dataId", description = "数据id")
                                                                      @PathVariable("dataId") String dataId,
                                                                      @Parameter(name = "dataType", description = "数据类型")
                                                                      @PathVariable("dataType") Long dataType) throws Exception {
        return dataDepartmentService.findDataDepartmentByDataIdAndAndDataType(dataId, dataType);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/{departmentId}")
    public List<DataDepartmentTableDto> findDataDepartmentTablesByUsername(@PathVariable("departmentId") Long departmentId) throws Exception {
        return dataDepartmentService.findDataDepartmentByDepartmentId(departmentId);
    }

    @RequestMapping(value = "/save", method = RequestMethod.POST)
    @Operation(summary = "创建数据权属")
    public void createDataDepartmentTable(@RequestBody DataDepartmentTable dataDepartmentTable) throws Exception {
        checkEditMetadataDepartmentPermissions(dataDepartmentTable);
        dataDepartmentService.save(dataDepartmentTable.toDto());

        //资产
        dataDepartmentService.sendMsg(dataDepartmentTable.toDto());
    }

    @RequestMapping(value = "/saves", method = RequestMethod.POST)
    public void createDataDepartmentTasensitivebles(@RequestBody List<DataDepartmentTable> dataDepartmentTables) throws Exception {

        for (DataDepartmentTable dataDepartmentTable : dataDepartmentTables) {
            checkEditMetadataDepartmentPermissions(dataDepartmentTable);
        }
        dataDepartmentService.saves(dataDepartmentTables.stream().map(DataDepartmentTable::toDto).collect(
                Collectors.toList()));
        dataDepartmentTables.forEach(d -> dataDepartmentService.sendMsg(d.toDto()));

        //增加日志
        addModifyDataDepartmentLog(dataDepartmentTables);
    }

    protected void addModifyDataDepartmentLog(List<DataDepartmentTable> dataDepartmentTables) {
        try {
            Set<Long> entityIds = new HashSet<>();
            Set<Long> reportIds = new HashSet<>();

            dataDepartmentTables.forEach(d -> {
                if (d.getDataType() == LDMTypes.oEntity || d.getDataType() == LDMTypes.oView) {
                    entityIds.add(Long.parseLong(d.getDataId()));
                } else if (d.getDataType() == LDMTypes.oDataReport) {
                    reportIds.add(Long.parseLong(d.getDataId()));
                }
            });

            for (DataObject dataObject : dataObjectService.getDataObjectsByIds(entityIds)) {
                String entityName = dataObject.getFullName();
                String logMessage = msgService.getMessage("metadata.table.dataDepartment.log.modify", entityName);
                operationLogService.generateOperationLog(OperationModuleType.METADATA_DATA, "dam_data_department",
                        OperationLogType.TABLE_MODIFY, logMessage, AuthTools.currentUsername(), 0);
            }
            for (DataReport dataReport : dataReportService.getDataReportsByIds(reportIds)) {
                String logMessage = msgService.getMessage("metadata.report.dataDepartment.log.modify", dataReport.getName());
                operationLogService.generateOperationLog(OperationModuleType.METADATA_DATA, "dam_data_department",
                        OperationLogType.TABLE_MODIFY, logMessage, AuthTools.currentUsername(), 0);
            }
        } catch (Exception e) {
            log.error(e.getMessage());
        }
    }

    @RequestMapping(value = "/update", method = RequestMethod.PUT)
    public void updateDataDepartmentTable(@RequestBody DataDepartmentTable dataDepartmentTable) throws Exception {
        checkEditMetadataDepartmentPermissions(dataDepartmentTable);
        dataDepartmentService.save(dataDepartmentTable.toDto());
    }

    @RequestMapping(value = "/del/{id}", method = RequestMethod.POST)
    @Operation(summary = "删除DataDepartmentTable")
    public void deleteDataDepartmentTable(@PathVariable("id") Long id) throws Exception {
        DataDepartmentTable dataDepartmentTable = dataDepartmentRepository.findById(id).get();

        checkEditMetadataDepartmentPermissions(dataDepartmentTable);
        dataDepartmentService.delete(id);

        //资产
        dataDepartmentService.sendMsg(dataDepartmentTable.toDto());

        //增加日志
        addModifyDataDepartmentLog(Lists.newArrayList(dataDepartmentTable));
    }

    @RequestMapping(value = "/dels/{ids}", method = RequestMethod.POST)
    public void deleteDataDepartmentTables(@PathVariable("ids") List<Long> ids) throws Exception {
        for (DataDepartmentTable dataDepartmentTable : dataDepartmentRepository.findAllById(ids)) {
            checkEditMetadataDepartmentPermissions(dataDepartmentTable);
        }
        dataDepartmentService.deletes(ids);
    }

    private void checkEditMetadataDepartmentPermissions(DataDepartmentTable dataDepartmentTable) {
        if (dataDepartmentTable != null && dataDepartmentTable.getDataType() == LDMTypes.oEntity) {
            DataObject dataObject = dataObjectService.getDataObjectByObjectId(
                    dataDepartmentTable.getDataId());
            if (dataObject != null) {
                checkMetadataEditPermissions(dataObject);
            }
        }
    }

}
