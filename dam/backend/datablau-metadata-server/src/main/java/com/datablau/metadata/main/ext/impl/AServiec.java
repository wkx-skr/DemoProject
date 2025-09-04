package com.datablau.metadata.main.ext.impl;

import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.core.model.ObjectX;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.base.data.TagDto;
import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.dto.DomainDto;
import com.datablau.domain.management.dto.StandardCodeDto;
import com.datablau.metadata.common.dto.domain.verify.DomainUsage;
import com.datablau.metadata.main.dao.metadata.DataObjectRepository;
import com.datablau.metadata.main.dao.model.ModelRepository;
import com.datablau.metadata.main.dto.UdpObjectIdMsgDto;
import com.datablau.metadata.main.entity.metadata.DataObject;
import com.datablau.metadata.main.service.model.api.DataModelService;
import com.datablau.metadata.main.service.model.dto.ModelImportErrorDto;
import com.datablau.metadata.main.service.model.impl.DataModelServiceImpl;
import com.datablau.metadata.main.service.tag.TagServiceLocal;
import com.datablau.metadata.main.util.RemoteServiceGetter;
import com.datablau.security.management.dto.OrganizationDto;
import com.datablau.security.management.utils.AuthTools;
import com.datablau.udp.jpa.entity.MetadataUserDefinedProperty;
import com.datablau.udp.jpa.entity.MetadataUserDefinedPropertyValue;
import com.datablau.udp.service.api.MetadataUserDefinedPropertyService;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.xml.sax.SAXException;

import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @author: hxs
 * @date: 2025/5/23 21:14
 */
@Service
public class AServiec {
    @Autowired
    protected ModelRepository dataModelRepo;
    @Autowired
    protected MetadataUserDefinedPropertyService udpService;
    @Autowired
    protected TagServiceLocal tagServiceLocal;
    @Autowired
    private MessageService msgService;
    @Autowired
    private DataModelService dataModelService;

    public List<Long> getObjectIdByExcel(Long modelId, Workbook wb) throws Exception {
        ArrayList<Long> res = new ArrayList<>();

        ModelX model = loadUpdateModelX(modelId, wb, new ModelImportErrorDto());

        Long udpGroupId = dataModelRepo.findUdpGroupIdByModelId(modelId);

        List<MetadataUserDefinedProperty> tableUdps = udpService.getTypeBindUdps(LDMTypes.oEntity, udpGroupId);
        List<MetadataUserDefinedProperty> viewUdps = udpService.getTypeBindUdps(LDMTypes.oView, udpGroupId);
        List<MetadataUserDefinedProperty> colUdps = udpService.getTypeBindUdps(LDMTypes.oAttribute, udpGroupId);
        List<DomainDto> domains = RemoteServiceGetter.getDomainService()
                .loadDomains(DomainState.A, 1L, AuthTools.currentUsername());
        List<DomainDto> metric = RemoteServiceGetter.getDomainService()
                .loadDomains(DomainState.A, 2L, AuthTools.currentUsername());
        List<StandardCodeDto> codeDtos = RemoteServiceGetter.getDomainService()
                .getPublicCodes(DomainState.A, 1L);

        if(metric != null){
            domains.addAll(metric);
        }

        Map<String, MetadataUserDefinedProperty> tableNameUdpMap = new HashMap<>();
        Map<String, MetadataUserDefinedProperty> viewNameUdpMap = new HashMap<>();
        Map<String, MetadataUserDefinedProperty> colNameUdpMap = new HashMap<>();

        for (MetadataUserDefinedProperty udp : tableUdps) {
            tableNameUdpMap.put(udp.getName(), udp);
        }

        for (MetadataUserDefinedProperty udp : viewUdps) {
            viewNameUdpMap.put(udp.getName(), udp);
        }

        for (MetadataUserDefinedProperty udp : colUdps) {
            colNameUdpMap.put(udp.getName(), udp);
        }

        Map<Long, String> schemaMap = new HashMap<>();
        for (ObjectX schema : model.getTypedChildren(LDMTypes.oSchema)) {
            schemaMap.put(schema.getId(), schema.getName());
        }
        int sheetcnt = wb.getNumberOfSheets();
        if (sheetcnt == 0) {
            return res;
        }

        String errNotCorrectExcel = msgService.getMessage("excelExportFailed");

        Map<String, ObjectX> tableDict = new HashMap<>();
        Map<String, ObjectX> viewDict = new HashMap<>();

        for (ObjectX table : model.getTypedChildren(LDMTypes.oEntity)) {
            Object schemaRef = table.getProperty(LDMTypes.pSchemaRef);
            if (schemaRef != null) {
                String schemaRefStr = schemaRef.toString();
                Long id = Long.parseLong(schemaRefStr);
                String schemaName = schemaMap.get(id);
                if(schemaName == null) {
                    continue;
                }
                tableDict.put(schemaName.toLowerCase() + "." + table.getPhysicalName().toLowerCase(), table);
            } else {
                tableDict.put(table.getPhysicalName().toLowerCase(), table);
            }
        }
        for (ObjectX table : model.getTypedChildren(LDMTypes.oView)) {
            Object schemaRef = table.getProperty(LDMTypes.pSchemaRef);
            if (schemaRef != null) {
                String schemaRefStr = schemaRef.toString();
                Long id = Long.parseLong(schemaRefStr);
                String schemaName = schemaMap.get(id);
                if(schemaName == null) {
                    continue;
                }
                viewDict.put(schemaName.toLowerCase() + "." + table.getPhysicalName().toLowerCase(), table);
            } else {
                viewDict.put(table.getPhysicalName().toLowerCase(), table);
            }
        }

        Sheet sheet = wb.getSheet(msgService.getMessage("dataModel.export.colSheet"));
        if(sheet == null) {
            throw new AndorjRuntimeException( msgService.getMessage("excelExportFailed"));
        }

        if (sheet != null) {
            Row row = sheet.getRow(0);
            //CheckColMetadataRow(row);
            int colSchemaNameColIdx = -1;
            int colTableLogicNameIdx = -1;
            int coltableNameColIdx = -1;
            int colLoNameColIdx = -1;
            int colNameColIdx = -1;
            int colDefColIdx = -1;
            int colDSColIdx = -1;
            int colSDColIdx = -1;
            int colTagIdx = -1;

            for (int idx = 0; idx < row.getLastCellNum(); idx++){
                String value = row.getCell(idx).getStringCellValue();
                if (!Strings.isNullOrEmpty(value)){
                    if (ObjectUtils.equals("表中文名\n(Table Logical Name)", value)){
                        colTableLogicNameIdx = idx;
                    }
                    if (ObjectUtils.equals("表名\n(Table Physical Name)", value)){
                        coltableNameColIdx = idx;
                    }
                    else if (ObjectUtils.equals("字段中文名\n(Column Logical Name)", value)){
                        colLoNameColIdx = idx;
                    }
                    else if (ObjectUtils.equals("字段名\n(Column Physical Name)", value)){
                        colNameColIdx = idx;
                    }
                    else if (ObjectUtils.equals("定义\n(Definition)", value)){
                        colDefColIdx = idx;
                    }
                    else if (ObjectUtils.equals("数据标准编码\n(Data Standard Code)", value)){
                        colDSColIdx = idx;
                    }else if (ObjectUtils.equals("代码编号\n(Standard Code)", value)){
                        colSDColIdx = idx;
                    } else if (ObjectUtils.equals("Schema", value)) {
                        colSchemaNameColIdx = idx;
                    } else if (ObjectUtils.equals("标签\n(Tag)", value)) {
                        colTagIdx = idx;
                    }
                }
            }

            Map<Integer, MetadataUserDefinedProperty> colUdpMap = new HashMap<>();

            for (int i = 18; i < row.getLastCellNum(); i++ ){
                String value = GeneralUtility.getCellStringValue(row.getCell(i));
                if (Strings.isNullOrEmpty(value)) {
                    continue;
                }

                MetadataUserDefinedProperty udp = colNameUdpMap.get(value);
                if (udp != null) {
                    colUdpMap.put(i, udp);
                }
            }

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                row = sheet.getRow(i);
                if (row != null) {
                    Cell schemaCell = row.getCell(colSchemaNameColIdx);
                    Cell tableLogicNameCell = row.getCell(colTableLogicNameIdx);
                    Cell tableNameCell = row.getCell(coltableNameColIdx);
                    Cell colLoNameCell = colLoNameColIdx < 0 ? null : row.getCell(colLoNameColIdx);
                    Cell colNameCell = row.getCell(colNameColIdx);
                    Cell colDefCell = colDefColIdx < 0 ? null : row.getCell(colDefColIdx);
                    Cell colDSCodeCell = colDSColIdx < 0 ? null : row.getCell(colDSColIdx);
                    Cell colSDCodeCell = colSDColIdx < 0 ? null : row.getCell(colSDColIdx);
                    Cell colTagCell = colTagIdx < 0 ? null : row.getCell(colTagIdx);

                    String schemaName = schemaCell == null ? "" : schemaCell.toString();
                    String tableLogicName = tableLogicNameCell == null ? "" : tableLogicNameCell.toString();
                    String tableName = tableNameCell == null ? "" : tableNameCell.toString();
                    String colLoName = colLoNameCell == null ? "" : colLoNameCell.toString();
                    String colName = colNameCell == null ? "" : colNameCell.toString();
                    String colDef = colDefCell == null ? "" : colDefCell.toString();
                    String tagName = colTagCell == null ? "" : colTagCell.toString();

                    if(StringUtils.isEmpty(schemaName)){
                        continue;
                    }

                    if(StringUtils.isEmpty(tableName)){
                        continue;
                    }

                    if(StringUtils.isEmpty(colName)){
                        continue;
                    }

                    String searchTableName = Strings.isNullOrEmpty(schemaName) ? tableName.toLowerCase() : schemaName.toLowerCase() + "." + tableName.toLowerCase();

                    if (tableDict.containsKey(searchTableName)) {
                        ObjectX table = tableDict.get(searchTableName);

                        ObjectX attr = table.getColumnByName(colName);
                        if (attr != null) {
                            Long objectId = attr.getId();
                            if (objectId != null) {
                                res.add(objectId);
                            }
                        }else {
                        }
                    }else {
                        //打印 错误行
                    }
                }
            }
        }

        sheet = wb.getSheet(msgService.getMessage("dataModel.export.catalogSheet"));
        if (sheet != null) {
            Row row = sheet.getRow(0);

            int tableLoNameColIdx = -1;
            int tableNameColIdx = -1;
            int tableDefColIdx = -1;
            int tableSchemaColIdx = -1;
            int tableTagColIdx = -1;
            int tableManagerColIdx = -1;
            int tableDepartmentColIdx = -1;

            for (int idx = 0; idx < row.getLastCellNum(); idx++){
                String value = row.getCell(idx).getStringCellValue();
                if (!Strings.isNullOrEmpty(value)){
                    if (ObjectUtils.equals(msgService.getMessage("dataModel.export.catalogSheet.logical"), value)){
                        tableLoNameColIdx = idx;
                    }
                    else if (ObjectUtils.equals(msgService.getMessage("dataModel.export.catalogSheet.name"), value)){
                        tableNameColIdx = idx;
                    }
                    else if (ObjectUtils.equals(msgService.getMessage("dataModel.export.catalogSheet.def"), value)){
                        tableDefColIdx = idx;
                    } else if (ObjectUtils.equals("Schema", value)) {
                        tableSchemaColIdx = idx;
                    } else if (ObjectUtils.equals(msgService.getMessage("dataModel.export.catalogSheet.tag"), value)) {
                        tableTagColIdx = idx;
                    }else if(ObjectUtils.equals(msgService.getMessage("dataModel.export.catalogSheet.dataOwner"), value)){
                        tableManagerColIdx = idx;
                    }else if(ObjectUtils.equals(msgService.getMessage("dataModel.export.catalogSheet.dataDepC"), value)){
                        tableDepartmentColIdx = idx;
                    }
                }
            }

            if (tableNameColIdx < 0
                    || tableSchemaColIdx < 0) {
                throw new Exception(errNotCorrectExcel);
            }

            Map<Integer, MetadataUserDefinedProperty> tableUdpMap = new HashMap<>();

            for (int i = 4; i < row.getLastCellNum(); i++ ){
                String value = GeneralUtility.getCellStringValue(row.getCell(i));
                if (Strings.isNullOrEmpty(value)) {
                    continue;
                }

                MetadataUserDefinedProperty udp = tableNameUdpMap.get(value);
                if (udp != null) {
                    tableUdpMap.put(i, udp);
                }
            }

            for (int i = 2; i <= sheet.getLastRowNum() - 1; i++) {
                row = sheet.getRow(i);
                if (row != null) {
                    Cell schemaCell = row.getCell(tableSchemaColIdx);
                    Cell tableLoNameCell = tableLoNameColIdx < 0 ? null : row.getCell(tableLoNameColIdx);
                    Cell tableNameCell = row.getCell(tableNameColIdx);
                    Cell tableDefCell = tableDefColIdx < 0 ? null : row.getCell(tableDefColIdx);
                    Cell tableTagCell = tableTagColIdx < 0 ? null : row.getCell(tableTagColIdx);
                    Cell tableDepartmentCell = tableDepartmentColIdx < 0 ? null : row.getCell(tableDepartmentColIdx);
                    Cell tableManagerCell = tableManagerColIdx < 0 ? null : row.getCell(tableManagerColIdx);

                    String schemaName = schemaCell == null ? "" : schemaCell.toString();
                    String tableLoName = tableLoNameCell == null ? "" : tableLoNameCell.toString();
                    String tableName = tableNameCell == null ? "" : tableNameCell.toString();
                    String tableDef = tableDefCell == null ? "" : tableDefCell.toString();
                    String tableDepartment = tableDepartmentCell == null ? "" : tableDepartmentCell.toString();
                    String tableManager = tableManagerCell == null ? "" : tableManagerCell.toString();
                    String tagName = tableTagCell == null ? "" : tableTagCell.toString();


                    if(StringUtils.isEmpty(schemaName)){
                        continue;
                    }

                    if(StringUtils.isEmpty(tableName)){
                        continue;
                    }


                    String schemaTableName = Strings.isNullOrEmpty(schemaName) ? tableName.toLowerCase() : schemaName.toLowerCase() + "." + tableName.toLowerCase();

                    if (tableDict.containsKey(schemaTableName)) {
                        ObjectX table = tableDict.get(schemaTableName);
                        if(table != null) {
                            Long objectId = table.getId();
                            if(objectId != null) {
                                res.add(objectId);
                            }
                        }else {
                        }
                    }else {
                    }
                }
            }
        }
        return res;
    }

    @Autowired
    protected DataObjectRepository objectRepo;

    public ModelX loadUpdateModelX(Long modelId, Workbook wb, ModelImportErrorDto errorDto)
            throws SAXException, IOException, ParserConfigurationException {
        // 查询出需要更新的表，优化构建ModelX时长
        HashMap<String, Set<String>> schemaTableMap = new HashMap<>();

        getImportTables(schemaTableMap, wb.getSheet(msgService.getMessage("dataModel.export.catalogSheet")), errorDto, true);
        getImportTables(schemaTableMap, wb.getSheet(msgService.getMessage("dataModel.export.vCatalogSheet")), errorDto, false);
        List<Long> tableIds = new ArrayList<>();
        Long tableAndViewNum = objectRepo.countByModelIdAndTypeIdInAndEndVersionIsNull(modelId,
                Lists.newArrayList(LDMTypes.oEntity, LDMTypes.oView));
        int sum = schemaTableMap.entrySet()
                .stream()
                .map(e -> e.getValue().size())
                .mapToInt(Integer::intValue)
                .sum();
        ModelX model = null;
        // 如果需要更新的元数据数量大于数据源元数据的70%，查出全部元数据
        long l = System.currentTimeMillis();
        for (Map.Entry<String, Set<String>> entry : schemaTableMap.entrySet()) {
            String schema = entry.getKey();
            Set<String> tableNames = entry.getValue();
            for (List<String> strings : Lists.partition(new ArrayList<>(tableNames), 999)) {
                List<DataObject> tables = objectRepo.findTablesByModelIdSchemaAndNames(
                        modelId, schema, strings);
                tableIds.addAll(
                        tables.stream().map(DataObject::getObjectId).collect(Collectors.toList()));

            }
        }
        model = dataModelService.loadCurrentModel(modelId, tableIds);
        return model;
    }

    public static void getImportTables(HashMap<String, Set<String>> schemaTableMap, Sheet tableSheet, ModelImportErrorDto errorDto, Boolean isTable) {
        if (tableSheet != null) {
            Row tableSheetRow = tableSheet.getRow(0);
            int tableSchemaColIdx = -1;
            int tableNameColIdx = -1;
            for (int idx = 0; idx < tableSheetRow.getLastCellNum(); idx++) {
                Cell cell = tableSheetRow.getCell(idx);
                String value = cell == null ? null : cell.getStringCellValue();
                if (!Strings.isNullOrEmpty(value)) {
                    if (ObjectUtils.equals("Schema", value)) {
                        tableSchemaColIdx = idx;
                    } else if (ObjectUtils.equals(GeneralUtility.getMessageService().getMessage("dataModel.export.catalogSheet.name"), value)) {
                        tableNameColIdx = idx;
                    }
                }
            }

            for (int i = 2; i <= tableSheet.getLastRowNum() - 1; i++) {
                Row row = tableSheet.getRow(i);
                if (row != null) {
                    Cell tableNameCell = row.getCell(tableNameColIdx);
                    Cell schemaCell = row.getCell(tableSchemaColIdx);
                    String schemaName = schemaCell == null ? "" : schemaCell.toString();
                    String tableName = tableNameCell == null ? "" : tableNameCell.toString();
                    if (schemaTableMap.containsKey(schemaName)) {
                        schemaTableMap.get(schemaName).add(tableName);
                    } else {
                        schemaTableMap.put(schemaName, Sets.newHashSet(tableName));
                    }
                }
            }
        }
    }
}
