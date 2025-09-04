package com.datablau.metadata.main.ext.impl;

import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.core.model.ObjectX;
import com.andorj.enhance.sql.data.Pair;
import com.datablau.base.data.ModelCategoryDto;
import com.datablau.base.data.TagDto;
import com.datablau.domain.management.dto.DomainDto;
import com.datablau.domain.management.dto.StandardCodeDto;
import com.datablau.metadata.common.dto.DataDepartmentTableDto;
import com.datablau.metadata.common.dto.DataManagerTableDto;
import com.datablau.metadata.main.dto.metadata.DataObjectExportDto;
import com.datablau.metadata.main.dto.metadata.DataObjectExportResult;
import com.datablau.metadata.main.entity.metadata.AbstractDataObject;
import com.datablau.metadata.main.entity.metadata.DataObject;
import com.datablau.metadata.main.entity.model.Model;
import com.datablau.metadata.main.service.model.dto.ModelImportErrorDto;
import com.datablau.metadata.main.service.model.impl.DataModelServiceImpl;
import com.datablau.metadata.main.service.model.utils.LogicalModelExporter;
import com.datablau.metadata.main.util.RemoteServiceGetter;
import com.datablau.security.management.api.OrganizationService;
import com.datablau.security.management.dto.OrganizationDto;
import com.datablau.udp.jpa.entity.MetadataUserDefinedProperty;
import com.datablau.udp.jpa.entity.MetadataUserDefinedPropertyValue;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import org.apache.commons.lang.StringUtils;
import org.apache.poi.common.usermodel.HyperlinkType;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFHyperlink;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * @ClassName：DataModelServiceImplExt
 * @Author: dingzicheng
 * @Date: 2025/7/28 18:21
 * @Description: DataModelServiceImpl扩展
 */
@Service("dataModelServiceExt")
public class DataModelServiceImplExt extends DataModelServiceImpl {
    private static final Logger logger = LoggerFactory.getLogger(DataModelServiceImplExt.class);

    @Override
    public DataObjectExportResult exportMetadataToFile(Long modelId, List<Long> tableIds, DataObjectExportDto exportDto, boolean isSimple) {
        Model model = this.dataModelRepo.findByModelIdEquals(modelId);
        if ("DATADICTIONARY_LOGICAL".equals(model.getType())) {
            try {
                return (new LogicalModelExporter(model, tableIds, exportDto.getOriginalSchemas())).export().getExportResult();
            } catch (Exception var26) {
                throw new AndorjRuntimeException(var26.getMessage(), var26);
            }
        } else {
            SimpleMetadataExporter exporter = new SimpleMetadataExporter(modelId, tableIds, exportDto.getSchemas());

            try {
                XSSFWorkbook workbook = exporter.export();
                if ("DATADICTIONARY".equals(model.getType())) {
                    workbook.removeSheetAt(1);
                    workbook.removeSheetAt(2);
                }

                String tempFolder = com.andorj.model.common.utility.FileUtility.getTempFolder();
                File folder = new File(tempFolder);
                if (!folder.exists()) {
                    try {
                        Files.createDirectory(Paths.get(tempFolder));
                    } catch (Exception var28) {
                        throw new IllegalStateException(this.msgService.getMessage("createTemporaryCatalogFailed", new Object[]{var28.getMessage()}));
                    }
                }

                String var10000 = com.andorj.model.common.utility.FileUtility.getTempFolder();
                String filename = var10000 + File.separator + UUID.randomUUID().toString().replaceAll("-", "") + ".xlsx";
                FileOutputStream out = null;

                try {
                    out = new FileOutputStream(filename);
                    workbook.write(out);
                } catch (IOException var27) {
                    logger.error("Failed to create template file", var27);
                    throw new IllegalStateException(this.msgService.getMessage("createFileFailed", new Object[]{var27.getMessage()}));
                } finally {
                    if (out != null) {
                        try {
                            out.close();
                        } catch (Exception var25) {
                        }
                    }

                    if (workbook != null) {
                        try {
                            workbook.close();
                        } catch (Exception var24) {
                        }
                    }

                }

                return new DataObjectExportResult(new File(filename), exporter.tables.size(), exporter.views.size(), this.msgService.getMessage("modelControl.uploadFile"));
            } catch (Exception var30) {
                logger.error("Failed to export metadata file", var30);
                throw new UnexpectedStateException(this.msgService.getMessage("createModelDocumentFailed", new Object[]{var30.getMessage()}));
            }
        }
    }

    public class SimpleMetadataExporter {
        Map<String, CellStyle> styleMap = new HashMap<>();
        Long modelId;
        List<Long> tableIds;
        List<String> shcemas;
        List<Long> objectIds;

        List<MetadataUserDefinedProperty> tableUdps;
        List<MetadataUserDefinedProperty> viewUdps;
        List<MetadataUserDefinedProperty> colUdps;
        //        Set<Long> objectIds = new HashSet<>();
        Map<Long, Set<Long>> tagItemMap = new HashMap<>();
        Map<Long, String> tagMap;
        Map<Long, Pair<String, String>> dataDeptMap;
        Map<Long, String> userMap;
        public String techDepartment;
        public Map<Long, String> techDepartmentMap;
        public Long udpGroupId;

        List<DataObject> tables = new ArrayList<>();
        List<DataObject> views = new ArrayList<>();

        SimpleMetadataExporter(Long modelId, List<Long> tableIds, List<String> schemas) {
            this.modelId = modelId;
            this.tableIds = tableIds;
            this.shcemas = schemas;

            udpGroupId = dataModelRepo.findUdpGroupIdByModelId(modelId);
        }

        SimpleMetadataExporter(List<Long> objectIds) {
            this.objectIds = objectIds;
            Long firstObjectId = objectIds.get(0);
            udpGroupId = dataModelRepo.findUdpGroupIdByObjectId(firstObjectId);
        }

        public XSSFWorkbook exportItem() throws Exception {
            tableUdps = udpService.getTypeBindUdps(LDMTypes.oEntity, udpGroupId);
            tableUdps.sort(Comparator.comparing(MetadataUserDefinedProperty::getOrder));
            viewUdps = udpService.getTypeBindUdps(LDMTypes.oView, udpGroupId);
            viewUdps.sort(Comparator.comparing(MetadataUserDefinedProperty::getOrder));

            colUdps = udpService.getTypeBindUdps(LDMTypes.oAttribute, udpGroupId);
            colUdps.sort(Comparator.comparing(MetadataUserDefinedProperty::getOrder));

            XSSFWorkbook workbook = new XSSFWorkbook();
            createCellStyle(workbook);


            List<DataObject> dataObjects = dataObjectService.getDataObjectsByIds(objectIds);
            if (dataObjects == null || dataObjects.isEmpty()) return null;
            Set<Long> categorys = dataObjects.stream().map(obj -> obj.getModelCategoryId())
                    .collect(Collectors.toSet());
            initTechDepartments(categorys);
            List<DataObject> tables = new ArrayList<>();
            List<DataObject> views = new ArrayList<>();
            List<DataObject> tableColumns = new ArrayList<>();
            List<DataObject> viewColumns = new ArrayList<>();
            Set<Long> columnsParentIds = new HashSet<>();


            for (DataObject dataObject : dataObjects) {
                Long typeId = dataObject.getTypeId();
                if (LDMTypes.oEntity == typeId) {
                    tables.add(dataObject);
                }
                if (LDMTypes.oView == typeId) {
                    views.add(dataObject);
                }
                if (LDMTypes.oAttribute == typeId) {
                    tableColumns.add(dataObject);
                    columnsParentIds.add(dataObject.getParentId());
                }
            }

            List<DataObject> allTableAndView = dataObjectService.getDataObjectsByIds(columnsParentIds);
            Set<Long> isTable  = allTableAndView.stream().filter(o->o.getTypeId()==LDMTypes.oEntity).map(DataObject::getObjectId).collect(Collectors.toSet());


            List<Long> tableIds = tables.stream().map(DataObject::getObjectId)
                    .collect(Collectors.toList());

            viewColumns = tableColumns.stream().filter(o -> !isTable.contains(o.getParentId())).collect(Collectors.toList());
            tableColumns = tableColumns.stream().filter(o -> isTable.contains(o.getParentId())).collect(Collectors.toList());

            Set<Long> existsTableColumns = tableColumns.stream().map(DataObject::getObjectId).collect(Collectors.toSet());
            Set<Long> existsViewColumns = viewColumns.stream().map(DataObject::getObjectId).collect(Collectors.toSet());

            for (List<Long> ids : Lists.partition(tableIds, 999)) {
                for (DataObject dataObject : dataObjectRepository.findColumnByTableIds(ids)) {
                    if (!existsTableColumns.contains(dataObject.getObjectId())) {
                        tableColumns.add(dataObject);
                    }
                }
            }

            List<Long> viewIds = views.stream().map(DataObject::getObjectId)
                    .collect(Collectors.toList());
            for (List<Long> ids : Lists.partition(viewIds, 999)) {
                for (DataObject dataObject : dataObjectRepository.findColumnByTableIds(ids)) {
                    if (!existsViewColumns.contains(dataObject.getObjectId())) {
                        viewColumns.add(dataObject);
                    }
                }
            }

            List<Long> items = new ArrayList<>(objectIds);
            tableColumns.stream().forEach(item -> items.add(item.getObjectId()));
            viewColumns.stream().forEach(item -> items.add(item.getObjectId()));

            tagItemMap = tagServiceLocal.getTagIdsOfItemsExceptSecurityTag(items);

            List<TagDto> allTag = tagServiceLocal.getTagExceptSecurityTag();
            tagMap = allTag.stream().collect(Collectors.toMap(TagDto::getTagId, TagDto::getName));

            //获取数据权属部门相关数据
            List<DataObject> objects = new ArrayList<>();
            objects.addAll(tables);
            objects.addAll(views);
            getDataDepartments(objects);
            //获取数据管家
            getDataManagers(objects);


            createTableItemIndexSheet(tables, workbook);
            createViewItemIndexSheet(views, workbook);
            exportAttributeItem(tableColumns, workbook);

            Map<Long, DataObject> viewMap = views.stream().collect(Collectors.toMap(DataObject::getObjectId, item -> item));
            exportViewAttributeItem(viewColumns, workbook);

            return workbook;
        }

        public void exportAttributeItem(List<DataObject> columns, XSSFWorkbook workbook)
                throws Exception {
            Sheet sheet = workbook.createSheet("所有字段");

            int rowIndex = 0;

            // set column width
            sheet.setColumnWidth(0, 30 * 256);
            sheet.setColumnWidth(1, 30 * 256);
            sheet.setColumnWidth(2, 30 * 256);
            sheet.setColumnWidth(3, 30 * 256);
            sheet.setColumnWidth(4, 20 * 256);
            sheet.setColumnWidth(5, 10 * 256);
            sheet.setColumnWidth(6, 12 * 256);
            sheet.setColumnWidth(7, 10 * 256);
            sheet.setColumnWidth(8, 10 * 256);
            sheet.setColumnWidth(9, 16 * 256);
            sheet.setColumnWidth(10, 14 * 256);
            sheet.setColumnWidth(11, 30 * 256);
            sheet.setColumnWidth(12, 25 * 256);
            sheet.setColumnWidth(13, 25 * 256);
            sheet.setColumnWidth(14, 30 * 256);
            sheet.setColumnWidth(15, 25 * 256);
            sheet.setColumnWidth(16, 30 * 256);

            Row rowMetadata = sheet.createRow(rowIndex++);
            int colIdx = 0;
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "Schema");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "表中文名\n(Table Logical Name)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "表名\n(Table Physical Name)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "字段中文名\n(Column Logical Name)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "字段名\n(Column Physical Name)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "数据类型\n(Data Type)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "主键\n(PK)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "非空\n(NOT NULL)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "唯一\n(UNIQUE)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "外键\n(FK)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "自增\n(Auto Increment)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "默认值\n(Default Value)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "定义\n(Definition)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "数据标准编码\n(Data Standard Code)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "数据标准\n(Data Standard)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "代码编号\n(Standard Code)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "代码中文名\n(Standard)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "标签\n(Tag)");

            for (MetadataUserDefinedProperty udp : colUdps) {
                int idx = colIdx++;
                createStringCell(rowMetadata, idx, styleMap.get("cellMetadata"), udp.getName());
                sheet.setColumnWidth(idx, 25 * 256);
            }
            List<Long> colIds = columns.stream().map(x -> x.getObjectId())
                    .collect(Collectors.toList());
            Map<String, Map<Long, MetadataUserDefinedPropertyValue>> colUdpValues = udpService.getObjectsUdpValues(
                    colIds);

            Set<String> domainIds = columns.stream()
                    .filter(x -> !Strings.isNullOrEmpty(x.getDomainId())).map(x -> x.getDomainId())
                    .collect(Collectors.toSet());

            Set<String> codeIds = columns.stream()
                    .filter(x -> !Strings.isNullOrEmpty(x.getDomainCode())).map(x -> x.getDomainCode())
                    .collect(Collectors.toSet());

            Map<String, DomainDto> domainMap = new HashMap<>();
            Map<String, StandardCodeDto> codeMap = new HashMap<>();

            // wangxin comment out temp
            for (List<String> dp : Lists.partition(new ArrayList<>(domainIds), 999)) {
                List<DomainDto> domains = RemoteServiceGetter.getDomainService().getDomainsByDomainIds(
                        new HashSet<>(dp));
                domains.forEach(x -> domainMap.put(x.getDomainId(), x));
            }
            for (List<String> dp : Lists.partition(new ArrayList<>(codeIds), 999)) {
                List<StandardCodeDto> codes = RemoteServiceGetter.getDomainService().getCodesByCodeNumbers(
                        Lists.newArrayList(dp), null);
                codes.forEach(x -> codeMap.put(x.getCode(), x));
            }


            Set<Long> tableIds = columns.stream()
                    .map(DataObject::getParentId)
                    .collect(Collectors.toSet());
            List<DataObject> tables = dataObjectService.getDataObjectsByIds(tableIds);
            Map<Long, DataObject> tableMap = tables.stream()
                    .collect(Collectors.toMap(DataObject::getObjectId, dataObject -> dataObject));

            // keyGroup 单独存在数据库中, 需要手动给tableX 注入
            List<DataObject> keyGroups = dataObjectService.getDataObjectsByIdsAndType(tableIds, LDMTypes.oKeyGroup);
            Map<Long, List<ObjectX>> keyMap = new HashMap<>();
            for (DataObject o : keyGroups) {
                ObjectX attr = new ObjectX();
                attr.deserialize(o.getObjectNode());
                if(keyMap.get(o.getParentId())==null){
                    List<ObjectX> objectXs = new ArrayList<>();
                    objectXs.add(attr);
                    keyMap.put(o.getParentId(), objectXs);
                }else{
                    keyMap.get(o.getParentId()).add(attr);
                }
            }

            for (DataObject col : columns) {
//                ObjectX attr = new ObjectX();
//                attr.deserialize(col.getObjectNode());
                ObjectX attr = col.getObjectX();
                DataObject tableObject = tableMap.get(col.getParentId());
//                ObjectX table = new ObjectX();
//                table.deserialize(tableObject.getObjectNode());
                ObjectX table = tableObject.getObjectX();
                if (table == null) {
                    return;
                }

                if (keyMap.get(col.getParentId()) != null) {
                    for (ObjectX o : keyMap.get(col.getParentId())) {
                        table.addObject(o);
                    }
                }

                Row rowCol = sheet.createRow(rowIndex++);
                colIdx = 0;
                createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"), col.getSchema());
                createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                        table.getLogicalName());
                createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"), table.getName());
                createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                        col.getLogicalName());
                createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                        col.getPhysicalName());


                Object datatype = attr.getProperty(LDMTypes.pDataType);
                createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                        datatype == null ? null : datatype.toString());

                if (isKeyMember(table, attr, "PrimaryKey")) {
                    createCheckedCell(rowCol, colIdx++, styleMap.get("cellStyleCenterWrap"));
                } else {
                    colIdx++;
                }

                if (getBooleanProperty(attr, LDMTypes.pIsNotNull)) {
                    createCheckedCell(rowCol, colIdx++, styleMap.get("cellStyleCenterWrap"));
                } else {
                    colIdx++;
                }

                if (isKeyMember(table, attr, "UniqueKey")) {
                    createCheckedCell(rowCol, colIdx++, styleMap.get("cellStyleCenterWrap"));
                } else {
                    colIdx++;
                }

                if (isKeyMember(table, attr, "ForeignKey")) {
                    createCheckedCell(rowCol, colIdx++, styleMap.get("cellStyleCenterWrap"));
                } else {
                    colIdx++;
                }

                if (getBooleanProperty(attr, LDMTypes.pIsAutoIncrement)) {
                    createCheckedCell(rowCol, colIdx++, styleMap.get("cellStyleCenterWrap"));
                } else {
                    colIdx++;
                }

                createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                        getDefaultValue(attr));
                createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                        col.getDefinition());


                if (!Strings.isNullOrEmpty(col.getDomainId())) {
                    DomainDto domain = domainMap.get(col.getDomainId());
                    if (domain != null) {
                        createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                                domain.getDomainCode());
                        createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                                domain.getChineseName());
                    } else {
                        colIdx += 2;
                    }
                } else {
                    colIdx += 2;
                }

                if (!Strings.isNullOrEmpty(col.getDomainCode())) {
                    StandardCodeDto codeDto = codeMap.get(col.getDomainCode());
                    if (codeDto != null) {
                        createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                                codeDto.getCode());
                        createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                                codeDto.getName());
                    } else {
                        colIdx += 2;
                    }
                } else {
                    colIdx += 2;
                }

                Set<Long> tagIds = tagItemMap.get(col.getObjectId());
                if (!CollectionUtils.isEmpty(tagIds)) {
                    StringJoiner tagNames = new StringJoiner(",");
                    for (Long tagId : tagIds) {
                        tagNames.add(tagMap.get(tagId));
                    }
                    createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                            tagNames.toString());
                } else {
                    colIdx++;
                }

                for (MetadataUserDefinedProperty udp : colUdps) {
                    createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                            getPropVal(attr.getId(), udp.getId(), colUdpValues));
                }
            }
        }

        public void exportViewAttributeItem(List<DataObject> cols, XSSFWorkbook workbook)
                throws Exception {
            Sheet sheet = workbook.createSheet("视图字段");

            int rowIndex = 0;

            // set column width
            sheet.setColumnWidth(0, 30 * 256);
            sheet.setColumnWidth(1, 31 * 257);
            sheet.setColumnWidth(2, 32 * 258);
            sheet.setColumnWidth(3, 33 * 259);
            sheet.setColumnWidth(4, 20 * 260);
            sheet.setColumnWidth(5, 10 * 261);

            sheet.setColumnWidth(6, 11 * 262);

            sheet.setColumnWidth(7, 25 * 263);
            sheet.setColumnWidth(8, 26 * 264);
            sheet.setColumnWidth(9, 34 * 265);
            sheet.setColumnWidth(10, 26 * 264);
            sheet.setColumnWidth(11, 34 * 265);

            Row rowMetadata = sheet.createRow(rowIndex++);
            int colIdx = 0;
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "Schema");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "视图中文名\n(View Logical Name)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "视图名\n(View Physical Name)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "字段中文名\n(Column Logical Name)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "字段名\n(Column Physical Name)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "数据类型\n(Data Type)");

            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "非空\n(NOT NULL)");

            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "定义\n(Definition)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "数据标准编码\n(Data Standard Code)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "数据标准\n(Data Standard)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "代码编号\n(Standard Code)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "代码中文名\n(Standard)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "标签\n(Tag)");

            for (MetadataUserDefinedProperty udp : colUdps) {
                int idx = colIdx++;
                createStringCell(rowMetadata, idx, styleMap.get("cellMetadata"), udp.getName());
                sheet.setColumnWidth(idx, 25 * 256);
            }

            Map<Long, DataObject> viewMap  =new HashMap<>();
            List<Long> parentIds = cols.stream().map(DataObject::getParentId).toList();
            List<DataObject> viewList = dataObjectService.getDataObjectsByIds(parentIds);
            viewMap = viewList.stream().collect(Collectors.toMap(o -> o.getObjectId(), o -> o));

            List<Long> colIds = cols.stream().map(x -> x.getObjectId())
                    .collect(Collectors.toList());
            Map<String, Map<Long, MetadataUserDefinedPropertyValue>> colUdpValues = udpService.getObjectsUdpValues(
                    colIds);

            Set<String> domainIds = cols.stream()
                    .filter(x -> !Strings.isNullOrEmpty(x.getDomainId())).map(x -> x.getDomainId())
                    .collect(Collectors.toSet());

            Set<String> codeIds = cols.stream()
                    .filter(x -> !Strings.isNullOrEmpty(x.getDomainCode())).map(x -> x.getDomainCode())
                    .collect(Collectors.toSet());

            Map<String, DomainDto> domainMap = new HashMap<>();
            Map<String, StandardCodeDto> codeMap = new HashMap<>();

            for (List<String> dp : Lists.partition(new ArrayList<>(codeIds), 999)) {
                List<StandardCodeDto> codes = RemoteServiceGetter.getDomainService().getCodesByCodeNumbers(
                        Lists.newArrayList(dp), null);
                codes.forEach(x -> codeMap.put(x.getCode(), x));
            }

            // wangxin comment out temp
            for (List<String> dp : Lists.partition(new ArrayList<>(domainIds), 999)) {
                List<DomainDto> domains = RemoteServiceGetter.getDomainService().getDomainsByDomainIds(
                        new HashSet<>(dp));
                domains.forEach(x -> domainMap.put(x.getDomainId(), x));
            }

            cols.sort(Comparator.comparing(DataObject::getObjectId));

            for (DataObject col : cols) {
                DataObject table = viewMap.get(col.getParentId());
                if (table == null){
                    continue;
                }

                Row rowCol = sheet.createRow(rowIndex++);
                colIdx = 0;
                createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                        table.getSchema());
                createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                        table.getLogicalName());
                createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                        table.getPhysicalName());
                createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                        col.getLogicalName());
                createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                        col.getPhysicalName());

//                ObjectX attr = new ObjectX();
//                attr.deserialize(col.getObjectNode());
                ObjectX attr = col.getObjectX();
                Object datatype = attr.getProperty(LDMTypes.pDataType);
                createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                        datatype == null ? null : datatype.toString());

                if (getBooleanProperty(attr, LDMTypes.pIsNotNull)) {
                    createCheckedCell(rowCol, colIdx++, styleMap.get("cellStyleCenterWrap"));
                } else {
                    colIdx++;
                }

                createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                        col.getDefinition());

                if (!Strings.isNullOrEmpty(col.getDomainId())) {
                    DomainDto domain = domainMap.get(col.getDomainId());
                    if (domain != null) {
                        createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                                domain.getDomainCode());
                        createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                                domain.getChineseName());
                    } else {
                        colIdx += 2;
                    }
                } else {
                    colIdx += 2;
                }

                if (!Strings.isNullOrEmpty(col.getDomainCode())) {
                    StandardCodeDto codeDto = codeMap.get(col.getDomainCode());
                    if (codeDto != null) {
                        createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                                codeDto.getCode());
                        createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                                codeDto.getName());
                    } else {
                        colIdx += 2;
                    }
                } else {
                    colIdx += 2;
                }

                Set<Long> tagIds = tagItemMap.get(col.getObjectId());
                if (!CollectionUtils.isEmpty(tagIds)) {
                    StringJoiner tagNames = new StringJoiner(",");
                    for (Long tagId : tagIds) {
                        tagNames.add(tagMap.get(tagId));
                    }
                    createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                            tagNames.toString());
                } else {
                    colIdx++;
                }

                for (MetadataUserDefinedProperty udp : colUdps) {
                    createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                            getPropVal(attr.getId(), udp.getId(), colUdpValues));
                }
            }
        }

        public void createViewItemIndexSheet(List<DataObject> views, XSSFWorkbook wb) {
            Sheet sheet = wb.createSheet(msgService.getMessage("dataModel.export.vCatalogSheet"));

            int rowIndex = 0;

            int index = 0;
            // set column width
            sheet.setColumnWidth(index++, 18 * 256);
            sheet.setColumnWidth(index++, 38 * 256);
            sheet.setColumnWidth(index++, 38 * 256);
            sheet.setColumnWidth(index++, 75 * 256);
            sheet.setColumnWidth(index++, 75 * 256);
            sheet.setColumnWidth(index++, 75 * 256);
            sheet.setColumnWidth(index++, 75 * 256);
            sheet.setColumnWidth(index++, 75 * 256);
            sheet.setColumnWidth(index++, 75 * 256);
//            sheet.setColumnWidth(index++, 75 * 256);

            index = 0;
            Row rowSheetCol = sheet.createRow(rowIndex++);
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.vCatalogSheet.type"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.vCatalogSheet.logical"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), "Schema");
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.vCatalogSheet.name"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.vCatalogSheet.def"));
//            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.vCatalogSheet.dep"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.vCatalogSheet.dataDep"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.vCatalogSheet.dataDepC"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.vCatalogSheet.dataOwner"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.vCatalogSheet.tag"));

            for (MetadataUserDefinedProperty udp : viewUdps) {
                createStringCell(rowSheetCol, index, styleMap.get("cellMetadata"), udp.getName());
                sheet.setColumnWidth(index++, 38 * 256);
            }

            Row rowIndexSheet = sheet.createRow(rowIndex++);
            createStringCell(rowIndexSheet, 0, styleMap.get("cellStyleWrap"), msgService.getMessage("dataModel.export.vCatalogSheet.index"));
            createLinkCell(wb, rowIndexSheet, 1, styleMap.get("cellStyleLink"), msgService.getMessage("dataModel.export.vCatalogSheet"), msgService.getMessage("dataModel.export.vCatalogSheet"));

            List<Long> tableIds = views.stream().map(x -> x.getObjectId()).collect(Collectors.toList());
            Map<String, Map<Long, MetadataUserDefinedPropertyValue>> valueMap = udpService.getObjectsUdpValues(tableIds);


            for (DataObject dataObject : views) {
                if (dataObject == null)
                    continue;

                index = 0;

                Row rowTableSheet = sheet.createRow(rowIndex++);

                createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), msgService.getMessage("dataModel.export.vCatalogSheet.view"));
                createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), dataObject.getLogicalName());
                createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), dataObject.getSchema());
                createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), dataObject.getPhysicalName());
                createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), dataObject.getDefinition());
//                createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), techDepartmentMap.get(dataObject.getModelCategoryId()));
                if (dataDeptMap != null && dataDeptMap.containsKey(dataObject.getObjectId())) {
                    createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), dataDeptMap.get(dataObject.getObjectId()).getSecond());
                    createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), dataDeptMap.get(dataObject.getObjectId()).getFirst());
                } else {
                    index += 2;
                }
                if (userMap != null && userMap.containsKey(dataObject.getObjectId())) {
                    createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), userMap.get(dataObject.getObjectId()));
                } else {
                    index++;
                }

                Set<Long> tagIds = tagItemMap.get(dataObject.getObjectId());
                if (!CollectionUtils.isEmpty(tagIds)) {
                    StringJoiner tagNames = new StringJoiner(",");
                    for (Long tagId : tagIds) {
                        tagNames.add(tagMap.get(tagId));
                    }
                    createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), tagNames.toString());
                } else {
                    index++;
                }

                for (MetadataUserDefinedProperty udp : viewUdps) {
                    createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), getPropVal(dataObject.getObjectId(), udp.getId(), valueMap));
                }

            }

            Row rowViewAllAttrsSheet = sheet.createRow(rowIndex++);
            createStringCell(rowViewAllAttrsSheet, 0, styleMap.get("cellStyleWrap"), msgService.getMessage("dataModel.export.vCatalogSheet.list"));
            createLinkCell(wb, rowViewAllAttrsSheet, 1, styleMap.get("cellStyleLink"), msgService.getMessage("dataModel.export.viewSheet"), msgService.getMessage("dataModel.export.viewSheet"));

            wb.setSheetOrder(sheet.getSheetName(), 1);
        }

        public void createTableItemIndexSheet(List<DataObject> tables, XSSFWorkbook wb) {
            Sheet sheet = wb.createSheet(msgService.getMessage("dataModel.export.catalogSheet"));

            int rowIndex = 0;

            // set column width
            int index = 0;
            sheet.setColumnWidth(index++, 18 * 256);
            sheet.setColumnWidth(index++, 38 * 256);
            sheet.setColumnWidth(index++, 38 * 256);
            sheet.setColumnWidth(index++, 75 * 256);
            sheet.setColumnWidth(index++, 75 * 256);
            sheet.setColumnWidth(index++, 75 * 256);
            sheet.setColumnWidth(index++, 75 * 256);
            sheet.setColumnWidth(index++, 75 * 256);
            sheet.setColumnWidth(index++, 75 * 256);
//            sheet.setColumnWidth(9, 75 * 256);

            Row rowSheetCol = sheet.createRow(rowIndex++);
            index = 0;
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.catalogSheet.type"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.catalogSheet.logical"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), "Schema");
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.catalogSheet.name"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.catalogSheet.def"));
//            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.catalogSheet.dep"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.catalogSheet.dataDep"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.catalogSheet.dataDepC"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.catalogSheet.dataOwner"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.catalogSheet.tag"));

            for (MetadataUserDefinedProperty udp : tableUdps) {
                createStringCell(rowSheetCol, index, styleMap.get("cellMetadata"), udp.getName());
                sheet.setColumnWidth(index++, 38 * 256);
            }

            Row rowIndexSheet = sheet.createRow(rowIndex++);
            createStringCell(rowIndexSheet, 0, styleMap.get("cellStyleWrap"), msgService.getMessage("dataModel.export.catalogSheet.index"));
            createLinkCell(wb, rowIndexSheet, 1, styleMap.get("cellStyleLink"), msgService.getMessage("dataModel.export.catalogSheet.catalog"), msgService.getMessage("dataModel.export.catalogSheet.catalog"));

            List<Long> tableIds = tables.stream().map(x -> x.getObjectId()).collect(Collectors.toList());
            Map<String, Map<Long, MetadataUserDefinedPropertyValue>> valueMap = udpService.getObjectsUdpValues(tableIds);


            for (DataObject dataObject : tables) {
                if (dataObject == null)
                    continue;

                index = 0;
                Row rowTableSheet = sheet.createRow(rowIndex++);
                createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), msgService.getMessage("dataModel.export.catalogSheet.table"));
                createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), dataObject.getLogicalName());
                createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), dataObject.getSchema());
                createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), dataObject.getPhysicalName());
                createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), dataObject.getDefinition());
//                createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), techDepartmentMap.get(dataObject.getModelCategoryId()));
                if (dataDeptMap != null && dataDeptMap.containsKey(dataObject.getObjectId())) {
                    createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), dataDeptMap.get(dataObject.getObjectId()).getSecond());
                    createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), dataDeptMap.get(dataObject.getObjectId()).getFirst());
                } else {
                    index += 2;
                }
                if (userMap != null && userMap.containsKey(dataObject.getObjectId())) {
                    createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), userMap.get(dataObject.getObjectId()));
                } else {
                    index++;
                }

                Set<Long> tagIds = tagItemMap.get(dataObject.getObjectId());
                if (!CollectionUtils.isEmpty(tagIds)) {
                    StringJoiner tagNames = new StringJoiner(",");
                    for (Long tagId : tagIds) {
                        tagNames.add(tagMap.get(tagId));
                    }
                    createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), tagNames.toString());
                } else {
                    index++;
                }

                for (MetadataUserDefinedProperty udp : tableUdps) {
                    createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), getPropVal(dataObject.getObjectId(), udp.getId(), valueMap));
                }

            }

            Row rowAllAttrsSheet = sheet.createRow(rowIndex++);
            createStringCell(rowAllAttrsSheet, 0, styleMap.get("cellStyleWrap"), msgService.getMessage("dataModel.export.catalogSheet.list"));
            createLinkCell(wb, rowAllAttrsSheet, 1, styleMap.get("cellStyleLink"), msgService.getMessage("dataModel.export.colSheet"), msgService.getMessage("dataModel.export.colSheet"));

            wb.setSheetOrder(sheet.getSheetName(), 0);
        }

        XSSFWorkbook export() throws Exception {
            tableUdps = udpService.getTypeBindUdps(LDMTypes.oEntity, udpGroupId);
            tableUdps.sort(Comparator.comparing(MetadataUserDefinedProperty::getOrder));
            viewUdps = udpService.getTypeBindUdps(LDMTypes.oView, udpGroupId);
            viewUdps.sort(Comparator.comparing(MetadataUserDefinedProperty::getOrder));

            colUdps = udpService.getTypeBindUdps(LDMTypes.oAttribute, udpGroupId);
            colUdps.sort(Comparator.comparing(MetadataUserDefinedProperty::getOrder));
            initTechDepartment(modelId);

            XSSFWorkbook workbook = new XSSFWorkbook();
            createCellStyle(workbook);

            tables.addAll(dataObjectService.getModelTables(modelId, tableIds));
            views.addAll(dataObjectService.getModelViews(modelId, tableIds));


            if (tableIds.isEmpty()) {
                tableIds = tables.stream().map(AbstractDataObject::getObjectId).collect(Collectors.toList());
            }
            List<ObjectX> tableXs = new ArrayList<>();
            Map<Long, String> objectIdToSchema = new HashMap<>();
            // 表
            for (DataObject table : tables) {
                if (!shcemas.isEmpty() && !shcemas.contains(table.getSchema().toLowerCase())) {
                    continue;
                }
                //objectIds.add(table.getObjectId());
//                ObjectX tableX = new ObjectX();
//                tableX.deserialize(table.getObjectNode());
                ObjectX tableX = table.getObjectX();
                tableX.setProperty(LDMTypes.pLogicalName, table.getLogicalName());
                tableX.setDefinition(table.getDefinition());
                objectIdToSchema.put(table.getObjectId(), table.getSchema());
                tableXs.add(tableX);
            }
            // 视图
            ArrayList<ObjectX> viewXs = new ArrayList<>();
            for (DataObject view : views) {
                if (!shcemas.isEmpty() && !shcemas.contains(view.getSchema().toLowerCase())) {
                    continue;
                }

                ObjectX viewX = new ObjectX();
                viewX.deserialize(view.getObjectNode());

                viewX.setProperty(LDMTypes.pLogicalName, view.getLogicalName());
                viewX.setDefinition(view.getDefinition());
                objectIdToSchema.put(view.getObjectId(), view.getSchema());
                viewXs.add(viewX);
            }

            // get all tag item
            List<Long> objIds = new ArrayList<>();
            for (List<ObjectX> part : Lists.partition(tableXs, 300)) {
                List<Long> tableIds = part.stream().map(ObjectX::getId).collect(Collectors.toList());
                objIds.addAll(tableIds);
            }

            objIds.addAll(tableXs.stream().map(table -> table.getId()).collect(Collectors.toList()));

            List<DataObject> tableCols = dataObjectService.getModelColumns(modelId,
                    new ArrayList<>(tableXs.stream().map(ObjectX::getId).collect(Collectors.toList())));
            if (!CollectionUtils.isEmpty(tableCols)) {
                objIds.addAll(tableCols.stream().map(o -> o.getObjectId()).collect(Collectors.toList()));
            }


            for (ObjectX viewX : viewXs) {
                objIds.add(viewX.getId());
            }
            //对于上面 view 获取不到字段的情况,这里查一遍库
            List<DataObject> cols = dataObjectService.getModelColumns(modelId,
                    new ArrayList<>(viewXs.stream().map(ObjectX::getId).collect(Collectors.toList())));
            if (cols != null && !cols.isEmpty()) {
                objIds.addAll(cols.stream().map(AbstractDataObject::getObjectId).toList());
            }

            tagItemMap.putAll(tagServiceLocal.getTagIdsOfItemsExceptSecurityTag(objIds));

            List<TagDto> allTag = tagServiceLocal.getTagExceptSecurityTag();
            tagMap = allTag.stream().collect(Collectors.toMap(TagDto::getTagId, TagDto::getName));

            //获取数据权属部门相关数据
            List<DataObject> objects = new ArrayList<>();
            objects.addAll(tables);
            objects.addAll(views);
            getDataDepartments(objects);
            //获取数据管家
            getDataManagers(objects);

            createIndexSheet(tableXs, workbook, objectIdToSchema);
            createViewIndexSheet(viewXs, workbook, objectIdToSchema);
            exportAllAttributes(tableXs, workbook, objectIdToSchema);
            exportViewAttributes(viewXs, workbook, objectIdToSchema);

            return workbook;
        }

        public void initTechDepartment(Long modelId) {
            Model model = dataModelRepo.findByModelIdEquals(modelId);
            if (model == null) return;
            ModelCategoryDto category = modelCategoryService.getModelCategory(model.getCategoryId());
            if (category == null || org.apache.commons.lang3.StringUtils.isEmpty(category.getItDepartment())) {
                return;
            }

            OrganizationService organizationService = RemoteServiceGetter.getOrganizationService();
            OrganizationDto organizationDto = organizationService.getOrganizationsByBm(category.getItDepartment());

            if (organizationDto != null) {
                techDepartment = organizationDto.getFullName();
            }
        }

        public void initTechDepartments(Set<Long> categoryIds) {
            techDepartmentMap = new HashMap<>();
            List<ModelCategoryDto> categories = modelCategoryService
                    .getModelCategoriesByIds(categoryIds);
            if (categories == null || categories.isEmpty()) {
                return;
            }

            OrganizationService organizationService = RemoteServiceGetter.getOrganizationService();
            List<String> bms = categories.stream().map(map -> map.getItDepartment())
                    .collect(Collectors.toList());
            List<OrganizationDto> organizationsByBms = organizationService
                    .getOrganizationsByBms(bms);

            if (organizationsByBms != null && !organizationsByBms.isEmpty()) {
                Map<String, String> orgMap = organizationsByBms.stream().collect(
                        Collectors.toMap(OrganizationDto::getBm, OrganizationDto::getFullName));
                categories.stream().forEach(item -> {
                    techDepartmentMap.put(item.getCategoryId(), orgMap.get(item.getItDepartment()));
                });
            }
        }

        public void getDataDepartments(List<DataObject> tables) {
            dataDeptMap = new HashMap<>();
            Map<String, List<DataDepartmentTableDto>> departments = new HashMap<>();
            for (List<DataObject> part : Lists.partition(tables, 300)) {
                List<String> list = part.stream().map(item -> item.getObjectId().toString())
                        .collect(Collectors.toList());
                Map<String, List<DataDepartmentTableDto>> department = dataDepartmentService
                        .findDepartmentByObjectIds(list);

                if (department != null && !department.isEmpty()) {
                    departments.putAll(department);
                }
            }

            if (departments != null && !departments.isEmpty()) {
                Set<Long> depts = departments.entrySet().stream().map(entry -> entry.getValue())
                        .flatMap(val -> val.stream().map(va -> va.getDepartmentId()))
                        .collect(Collectors.toSet());
                List<OrganizationDto> organizations = getOrganizationService()
                        .findOrganizationByIds(depts);
                Map<Long, OrganizationDto> dtoMap = organizations.stream().collect(
                        Collectors.toMap(organizationDto -> organizationDto.getId(), organizationDto -> organizationDto));
                if (organizations != null && !organizations.isEmpty()) {
                    departments.entrySet().stream().forEach(entry -> {

                        List<DataDepartmentTableDto> values = entry.getValue();
                        AtomicReference<String> key = new AtomicReference<>("");
                        AtomicReference<String> value = new AtomicReference<>("");
                        values.stream().map(val -> val.getDepartmentId())
                                .forEach(dept -> {
                                    if (dtoMap.containsKey(dept)) {
                                        key.set(StringUtils.isEmpty(key.get()) ? dtoMap.get(dept).getBm() : (key.get() + "," + dtoMap.get(dept).getBm()));
                                        value.set(StringUtils.isEmpty(value.get()) ? dtoMap.get(dept).getFullName() : (value.get() + "," + dtoMap.get(dept).getFullName()));
                                    }
                                });
                        if (!StringUtils.isEmpty(key.get())) {
                            dataDeptMap.put(Long.parseLong(entry.getKey()), Pair.of(key.get(), value.get()));
                        }

                    });
                }
            }
        }

        public void getDataManagers(List<DataObject> tables) {
            userMap = new HashMap<>();
            Map<String, List<DataManagerTableDto>> managers = new HashMap<>();
            for (List<DataObject> part : Lists.partition(tables, 300)) {
                List<String> list = part.stream().map(item -> item.getObjectId().toString()).distinct()
                        .collect(Collectors.toList());
                Map<String, List<DataManagerTableDto>> manager = dataManagerService
                        .findUserManagerByDataIds(list);

                if (manager != null && !manager.isEmpty()) {
                    managers.putAll(manager);
                }
            }

            if (managers != null && !managers.isEmpty()) {
                managers.entrySet().stream().forEach(map -> {
                    List<String> list = map.getValue().stream().map(item -> item.getUsername())
                            .collect(Collectors.toList());
                    userMap.put(Long.parseLong(map.getKey()), StringUtils.join(list, ","));
                });
            }
        }

        public void createIndexSheet(List<ObjectX> tables, Workbook wb, Map<Long, String> objectIdToSchema) throws Exception {
            Sheet sheet = wb.createSheet(msgService.getMessage("dataModel.export.catalogSheet"));

            int rowIndex = 0;
            int index = 0;
            // set column width
            sheet.setColumnWidth(index++, 18 * 256);
            sheet.setColumnWidth(index++, 38 * 256);
            sheet.setColumnWidth(index++, 38 * 256);
            sheet.setColumnWidth(index++, 75 * 256);
            sheet.setColumnWidth(index++, 75 * 256);
            sheet.setColumnWidth(index++, 75 * 256);
            sheet.setColumnWidth(index++, 75 * 256);
            sheet.setColumnWidth(index++, 75 * 256);
            sheet.setColumnWidth(index++, 75 * 256);
            sheet.setColumnWidth(index++, 75 * 256);
            sheet.setColumnWidth(index++, 75 * 256);

            index = 0;

            Row rowSheetCol = sheet.createRow(rowIndex++);
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.catalogSheet.type"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.catalogSheet.logical"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), "Schema");
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.catalogSheet.name"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.catalogSheet.def"));
//            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.catalogSheet.dep"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.catalogSheet.dataDep"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.catalogSheet.dataDepC"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.catalogSheet.dataOwner"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.catalogSheet.tag"));

            for (MetadataUserDefinedProperty udp : tableUdps) {
                createStringCell(rowSheetCol, index, styleMap.get("cellMetadata"), udp.getName());
                sheet.setColumnWidth(index++, 38 * 256);
            }

            Row rowIndexSheet = sheet.createRow(rowIndex++);
            createStringCell(rowIndexSheet, 0, styleMap.get("cellStyleWrap"), msgService.getMessage("dataModel.export.catalogSheet.index"));
            createLinkCell(wb, rowIndexSheet, 1, styleMap.get("cellStyleLink"), msgService.getMessage("dataModel.export.catalogSheet.catalog"), msgService.getMessage("dataModel.export.catalogSheet.catalog"));

            List<Long> tableIds = tables.stream().map(x -> x.getId()).collect(Collectors.toList());
            Map<String, Map<Long, MetadataUserDefinedPropertyValue>> valueMap = udpService.getObjectsUdpValues(tableIds);


            for (ObjectX table : tables) {
                if (table == null)
                    continue;

                index = 0;
                Row rowTableSheet = sheet.createRow(rowIndex++);
                createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), msgService.getMessage("dataModel.export.catalogSheet.table"));
                createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), table.getLogicalName());
                createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), objectIdToSchema.get(table.getId()));
                createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), table.getName());
                createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), table.getDefinition());
//                createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), techDepartment);
                if (dataDeptMap != null && dataDeptMap.containsKey(table.getId())) {
                    createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), dataDeptMap.get(table.getId()).getSecond());
                    createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), dataDeptMap.get(table.getId()).getFirst());
                } else {
                    index += 2;
                }
                if (userMap != null && userMap.containsKey(table.getId())) {
                    createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), userMap.get(table.getId()));
                } else {
                    index++;
                }

                Set<Long> tagIds = tagItemMap.get(table.getId());
                if (!CollectionUtils.isEmpty(tagIds)) {
                    StringJoiner tagNames = new StringJoiner(",");
                    for (Long tagId : tagIds) {
                        tagNames.add(tagMap.get(tagId));
                    }
                    createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), tagNames.toString());
                } else {
                    index++;
                }

                for (MetadataUserDefinedProperty udp : tableUdps) {
                    createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), getPropVal(table.getId(), udp.getId(), valueMap));
                }
            }

            Row rowAllAttrsSheet = sheet.createRow(rowIndex++);
            createStringCell(rowAllAttrsSheet, 0, styleMap.get("cellStyleWrap"), msgService.getMessage("dataModel.export.catalogSheet.list"));
            createLinkCell(wb, rowAllAttrsSheet, 1, styleMap.get("cellStyleLink"), msgService.getMessage("dataModel.export.colSheet"), msgService.getMessage("dataModel.export.colSheet"));

            wb.setSheetOrder(sheet.getSheetName(), 0);
        }

        public void createViewIndexSheet(List<ObjectX> viewXs, Workbook wb, Map<Long, String> objectIdToSchema) throws Exception {
            Sheet sheet = wb.createSheet(msgService.getMessage("dataModel.export.vCatalogSheet"));

            int rowIndex = 0;
            int index = 0;

            // set column width
            sheet.setColumnWidth(index++, 18 * 256);
            sheet.setColumnWidth(index++, 38 * 256);
            sheet.setColumnWidth(index++, 38 * 256);
            sheet.setColumnWidth(index++, 75 * 256);
            sheet.setColumnWidth(index++, 75 * 256);
            sheet.setColumnWidth(index++, 75 * 256);
            sheet.setColumnWidth(index++, 75 * 256);
            sheet.setColumnWidth(index++, 75 * 256);
            sheet.setColumnWidth(index++, 75 * 256);
//            sheet.setColumnWidth(index++, 75 * 256);

            index = 0;

            Row rowSheetCol = sheet.createRow(rowIndex++);
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.vCatalogSheet.type"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.vCatalogSheet.logical"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), "Schema");
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.vCatalogSheet.name"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.vCatalogSheet.def"));
//            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.vCatalogSheet.dep"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.vCatalogSheet.dataDep"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.vCatalogSheet.dataDepC"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.vCatalogSheet.dataOwner"));
            createStringCell(rowSheetCol, index++, styleMap.get("cellMetadata"), msgService.getMessage("dataModel.export.vCatalogSheet.tag"));

            for (MetadataUserDefinedProperty udp : viewUdps) {
                createStringCell(rowSheetCol, index, styleMap.get("cellMetadata"), udp.getName());
                sheet.setColumnWidth(index++, 38 * 256);
            }

            Row rowIndexSheet = sheet.createRow(rowIndex++);
            createStringCell(rowIndexSheet, 0, styleMap.get("cellStyleWrap"), msgService.getMessage("dataModel.export.vCatalogSheet.index"));
            createLinkCell(wb, rowIndexSheet, 1, styleMap.get("cellStyleLink"), msgService.getMessage("dataModel.export.vCatalogSheet"), msgService.getMessage("dataModel.export.vCatalogSheet"));

            List<Long> tableIds = viewXs.stream().map(x -> x.getId()).collect(Collectors.toList());
            Map<String, Map<Long, MetadataUserDefinedPropertyValue>> valueMap = udpService.getObjectsUdpValues(tableIds);


            for (ObjectX table : viewXs) {
                if (table == null)
                    continue;

                index = 0;

                Row rowTableSheet = sheet.createRow(rowIndex++);

                createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), msgService.getMessage("dataModel.export.vCatalogSheet.view"));
                createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), table.getLogicalName());
                createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), objectIdToSchema.get(table.getId()));
                createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), table.getName());
                createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), table.getDefinition());
//                createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), techDepartment);
                if (dataDeptMap != null && dataDeptMap.containsKey(table.getId())) {
                    createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), dataDeptMap.get(table.getId()).getSecond());
                    createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), dataDeptMap.get(table.getId()).getFirst());
                } else {
                    index += 2;
                }
                if (userMap != null && userMap.containsKey(table.getId())) {
                    createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), userMap.get(table.getId()));
                } else {
                    index++;
                }

                Set<Long> tagIds = tagItemMap.get(table.getId());
                if (!CollectionUtils.isEmpty(tagIds)) {
                    StringJoiner tagNames = new StringJoiner(",");
                    for (Long tagId : tagIds) {
                        tagNames.add(tagMap.get(tagId));
                    }
                    createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), tagNames.toString());
                } else {
                    index++;
                }

                for (MetadataUserDefinedProperty udp : viewUdps) {
                    createStringCell(rowTableSheet, index++, styleMap.get("cellStyleWrap"), getPropVal(table.getId(), udp.getId(), valueMap));
                }
            }

            Row rowViewAllAttrsSheet = sheet.createRow(rowIndex++);
            createStringCell(rowViewAllAttrsSheet, 0, styleMap.get("cellStyleWrap"), msgService.getMessage("dataModel.export.vCatalogSheet.list"));
            createLinkCell(wb, rowViewAllAttrsSheet, 1, styleMap.get("cellStyleLink"), msgService.getMessage("dataModel.export.viewSheet"), msgService.getMessage("dataModel.export.viewSheet"));

            wb.setSheetOrder(sheet.getSheetName(), 1);
        }

        public boolean isKeyMember(ObjectX table, ObjectX column, String keyGroupType) throws Exception {
            ObjectX pkGroup = null;
            for (ObjectX keyGroup : table.getTypedChildren(LDMTypes.oKeyGroup)) {
                if (keyGroupType.equals(keyGroup.getProperty(LDMTypes.pKeyGroupType))) {
                    pkGroup = keyGroup;
                    break;
                }
            }

            if (pkGroup != null) {
                String refs = (String) pkGroup.getProperty(LDMTypes.pKeyGroupMemberRefs);
                if (Strings.isNullOrEmpty(refs)) {
                    return false;
                }

                try {
                    Map<String, Map> map = OBJECT_MAPPER.readValue(refs, HashMap.class);

                    for (Map member : map.values()) {
                        Object id = member.get("Id");
                        if (id != null && column.getId().equals(Long.parseLong(id.toString()))) {
                            return true;
                        }
                    }
                } catch (JsonProcessingException je) {
                    String[] members = refs.split(";");
                    for (String member : members) {
                        if (column.getName().equalsIgnoreCase(member)) {
                            return true;
                        }
                    }
                }

                return false;

            } else {
                return false;
            }
        }

        public String getPropVal(Long objectId, Long udpId, Map<String, Map<Long, MetadataUserDefinedPropertyValue>> map) {
            Map<Long, MetadataUserDefinedPropertyValue> vm = map.get(objectId.toString());
            if (vm == null) {
                return "";
            }

            MetadataUserDefinedPropertyValue val = vm.get(udpId);
            if (val == null) {
                return "";
            }

            if (val.getValue() == null) {
                return "";
            } else {
                return val.getValue();
            }
        }

        public Cell createCheckedCell(Row row, int index, CellStyle cellStyle) {
            Cell cell = row.createCell(index);
            cell.setCellStyle(cellStyle);
            cell.setCellValue("√");

            return cell;
        }

        public String getDefaultValue(ObjectX obj) {
            Object o = obj.getProperty(LDMTypes.pDefaultValue);
            if (o == null) {
                return "";
            } else {
                return o.toString();
            }
        }

        public boolean getBooleanProperty(ObjectX obj, Long type) {
            Object o = obj.getProperty(type);
            if (o == null) {
                return false;
            }

            return Boolean.valueOf(o.toString());
        }

        public void createCellStyle(Workbook workbook) {
            CellStyle cellStyleCenterWrap = workbook.createCellStyle();
            cellStyleCenterWrap.setAlignment(HorizontalAlignment.CENTER);
            cellStyleCenterWrap.setWrapText(true);
            styleMap.put("cellStyleCenterWrap", cellStyleCenterWrap);


            CellStyle cellStyleWrap = workbook.createCellStyle();
            cellStyleWrap.setWrapText(true);
            styleMap.put("cellStyleWrap", cellStyleWrap);

            CellStyle cellStyleLink = workbook.createCellStyle();
            cellStyleLink.setWrapText(true);
            Font iFont = workbook.createFont();
            iFont.setColor((short) 12);
            iFont.setUnderline(Font.U_SINGLE);
            cellStyleLink.setFont(iFont);
            styleMap.put("cellStyleLink", cellStyleLink);

            CellStyle cellMetadata = workbook.createCellStyle();
            cellMetadata.setAlignment(HorizontalAlignment.CENTER);
            cellMetadata.setWrapText(true);
            cellMetadata.setBorderBottom(BorderStyle.THIN);
            cellMetadata.setBorderLeft(BorderStyle.THIN);
            cellMetadata.setBorderRight(BorderStyle.THIN);
            cellMetadata.setBorderTop(BorderStyle.THIN);
            cellMetadata.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            cellMetadata.setFillForegroundColor((short) 54);
            styleMap.put("cellMetadata", cellMetadata);

            Font font = workbook.createFont();
            font.setColor((short) 9);
            cellMetadata.setFont(font);

            CellStyle cellStyleAttr = workbook.createCellStyle();
            //cellStyleAttr.Alignment = NPOI.SS.UserModel.HorizontalAlignment.Center;
            cellStyleAttr.setWrapText(true);
            cellStyleAttr.setBorderBottom(BorderStyle.THIN);
            cellStyleAttr.setBorderLeft(BorderStyle.THIN);
            cellStyleAttr.setBorderRight(BorderStyle.THIN);
            cellStyleAttr.setBorderTop(BorderStyle.THIN);
            cellStyleAttr.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            cellStyleAttr.setFillForegroundColor((short) 46);
            styleMap.put("cellStyleAttr", cellStyleAttr);
        }

        public Cell createStringCell(Row row, int index, CellStyle cellStyle, String value) {
            if (!Strings.isNullOrEmpty(value)) {
                Cell cell = row.createCell(index);
                cell.setCellStyle(cellStyle);
                cell.setCellValue(value);

                return cell;
            } else {
                return null;
            }
        }

        public Cell createIntegerCell(Row row, int index, CellStyle cellStyle, int value) {
            Cell cell = row.createCell(index);
            cell.setCellStyle(cellStyle);
            cell.setCellValue(value);

            return cell;
        }

        public Cell createLinkCell(Workbook wb, Row row, int index, CellStyle cellStyle, String value, String link) {
            if (!Strings.isNullOrEmpty(value)) {
                Cell cell = row.createCell(index);
                cell.setCellStyle(cellStyle);
                cell.setCellValue(value);

                CreationHelper createHelper = wb.getCreationHelper();
                Hyperlink hyperlink = (XSSFHyperlink) createHelper.createHyperlink(HyperlinkType.DOCUMENT);
                hyperlink.setAddress("'" + link + "'!A1");

                cell.setHyperlink(hyperlink);

                return cell;
            } else {
                return null;
            }
        }

        public void exportAllAttributes(List<ObjectX> tables, Workbook workbook, Map<Long, String> objectIdToSchema) throws Exception {
            Sheet sheet = workbook.createSheet("所有字段");

            int rowIndex = 0;

            // set column width
            sheet.setColumnWidth(0, 30 * 256);
            sheet.setColumnWidth(1, 30 * 256);
            sheet.setColumnWidth(2, 30 * 256);
            sheet.setColumnWidth(3, 30 * 256);
            sheet.setColumnWidth(4, 20 * 256);
            sheet.setColumnWidth(5, 10 * 256);
            sheet.setColumnWidth(6, 12 * 256);
            sheet.setColumnWidth(7, 10 * 256);
            sheet.setColumnWidth(8, 10 * 256);
            sheet.setColumnWidth(9, 16 * 256);
            sheet.setColumnWidth(10, 14 * 256);
            sheet.setColumnWidth(11, 30 * 256);
            sheet.setColumnWidth(12, 25 * 256);
            sheet.setColumnWidth(13, 25 * 256);
            sheet.setColumnWidth(14, 30 * 256);
            sheet.setColumnWidth(15, 25 * 256);
            sheet.setColumnWidth(16, 30 * 256);

            Row rowMetadata = sheet.createRow(rowIndex++);
            int colIdx = 0;
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "Schema");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "表中文名\n(Table Logical Name)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "表名\n(Table Physical Name)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "字段中文名\n(Column Logical Name)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "字段名\n(Column Physical Name)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "数据类型\n(Data Type)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "主键\n(PK)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "非空\n(NOT NULL)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "唯一\n(UNIQUE)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "外键\n(FK)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "自增\n(Auto Increment)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "默认值\n(Default Value)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "定义\n(Definition)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "数据标准编码\n(Data Standard Code)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "数据标准\n(Data Standard)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "代码编号\n(Standard Code)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "代码中文名\n(Standard)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "标签\n(Tag)");


            for (MetadataUserDefinedProperty udp : colUdps) {
                int idx = colIdx++;
                createStringCell(rowMetadata, idx, styleMap.get("cellMetadata"), udp.getName());
                sheet.setColumnWidth(idx, 25 * 256);
            }

            // keyGroup 单独存在数据库中, 需要手动给tableX 注入
            List<DataObject> keyGroups = dataObjectService.getDataObjectsByIdsAndType(tableIds, LDMTypes.oKeyGroup);
            Map<Long, List<ObjectX>> keyMap = new HashMap<>();
            for (DataObject o : keyGroups) {
                ObjectX attr = new ObjectX();
                attr.deserialize(o.getObjectNode());
                if (keyMap.get(o.getParentId()) == null) {
                    List<ObjectX> objectXs = new ArrayList<>();
                    objectXs.add(attr);
                    keyMap.put(o.getParentId(), objectXs);
                } else {
                    keyMap.get(o.getParentId()).add(attr);
                }
            }

            for (List<ObjectX> part : Lists.partition(tables, 300)) {

                Map<Long, ObjectX> tableMap = part.stream().collect(Collectors.toMap(ObjectX::getId, Function.identity()));
                List<DataObject> cols = dataObjectService.getModelColumns(modelId, new ArrayList<>(tableMap.keySet()));
                List<Long> colIds = cols.stream().map(x -> x.getObjectId()).collect(Collectors.toList());
                Map<String, Map<Long, MetadataUserDefinedPropertyValue>> colUdpValues = udpService.getObjectsUdpValues(colIds);

                Set<String> domainIds = cols.stream().filter(x -> !Strings.isNullOrEmpty(x.getDomainId())).map(x -> x.getDomainId()).collect(Collectors.toSet());
                Set<String> codeIds = cols.stream()
                        .filter(x -> !Strings.isNullOrEmpty(x.getDomainCode())).map(x -> x.getDomainCode())
                        .collect(Collectors.toSet());

                Map<String, DomainDto> domainMap = new HashMap<>();
                Map<String, StandardCodeDto> codeMap = new HashMap<>();

                for (List<String> dp : Lists.partition(new ArrayList<>(codeIds), 999)) {
                    List<StandardCodeDto> codes = RemoteServiceGetter.getDomainService().getCodesByCodeNumbers(
                            Lists.newArrayList(dp), null);
                    codes.forEach(x -> codeMap.put(x.getCode(), x));
                }
                // wangxin comment out temp
                for (List<String> dp : Lists.partition(new ArrayList<>(domainIds), 999)) {
                    List<DomainDto> domains = RemoteServiceGetter.getDomainService().getDomainsByDomainIds(new HashSet<>(dp));
                    domains.forEach(x -> domainMap.put(x.getDomainId(), x));
                }

                for (DataObject col : cols) {
                    ObjectX table = tableMap.get(col.getParentId());
                    if (table == null)
                        return;

                    if (keyMap.get(col.getParentId()) != null) {
                        for (ObjectX o : keyMap.get(col.getParentId())) {
                            table.addObject(o);
                        }
                    }

                    Row rowCol = sheet.createRow(rowIndex++);
                    colIdx = 0;
                    createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"), objectIdToSchema.get(table.getId()));
                    createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"), table.getLogicalName());
                    createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"), table.getName());
                    createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"), col.getLogicalName());
                    createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"), col.getPhysicalName());


//                    ObjectX attr = new ObjectX();
//                    attr.deserialize(col.getObjectNode());
                    ObjectX attr = col.getObjectX();
                    Object datatype = attr.getProperty(LDMTypes.pDataType);
                    createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"), datatype == null ? null : datatype.toString());

                    if (isKeyMember(table, attr, "PrimaryKey")) {
                        createCheckedCell(rowCol, colIdx++, styleMap.get("cellStyleCenterWrap"));
                    } else {
                        colIdx++;
                    }

                    if (getBooleanProperty(attr, LDMTypes.pIsNotNull)) {
                        createCheckedCell(rowCol, colIdx++, styleMap.get("cellStyleCenterWrap"));
                    } else {
                        colIdx++;
                    }

                    if (isKeyMember(table, attr, "UniqueKey")) {
                        createCheckedCell(rowCol, colIdx++, styleMap.get("cellStyleCenterWrap"));
                    } else {
                        colIdx++;
                    }

                    if (isKeyMember(table, attr, "ForeignKey")) {
                        createCheckedCell(rowCol, colIdx++, styleMap.get("cellStyleCenterWrap"));
                    } else {
                        colIdx++;
                    }

                    if (getBooleanProperty(attr, LDMTypes.pIsAutoIncrement)) {
                        createCheckedCell(rowCol, colIdx++, styleMap.get("cellStyleCenterWrap"));
                    } else {
                        colIdx++;
                    }

                    createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"), getDefaultValue(attr));
                    createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"), col.getDefinition());

                    if (!Strings.isNullOrEmpty(col.getDomainId())) {
                        DomainDto domain = domainMap.get(col.getDomainId());
                        if (domain != null) {
                            createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"), domain.getDomainCode());
                            createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"), domain.getChineseName());
                        } else {
                            colIdx += 2;
                        }
                    } else {
                        colIdx += 2;
                    }

                    if (!Strings.isNullOrEmpty(col.getDomainCode())) {
                        StandardCodeDto codeDto = codeMap.get(col.getDomainCode());
                        if (codeDto != null) {
                            createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                                    codeDto.getCode());
                            createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                                    codeDto.getName());
                        } else {
                            colIdx += 2;
                        }
                    } else {
                        colIdx += 2;
                    }

                    Set<Long> tagIds = tagItemMap.get(col.getObjectId());
                    if (!CollectionUtils.isEmpty(tagIds)) {
                        StringJoiner tagNames = new StringJoiner(",");
                        for (Long tagId : tagIds) {
                            tagNames.add(tagMap.get(tagId));
                        }
                        createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"), tagNames.toString());
                    } else {
                        colIdx++;
                    }

                    for (MetadataUserDefinedProperty udp : colUdps) {
                        createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"), getPropVal(attr.getId(), udp.getId(), colUdpValues));
                    }
                }

            }
        }

        public void exportViewAttributes(List<ObjectX> views, Workbook workbook, Map<Long, String> objectIdToSchema) throws Exception {
            Sheet sheet = workbook.createSheet("视图字段");

            int rowIndex = 0;

            // set column width
            sheet.setColumnWidth(0, 30 * 256);
            sheet.setColumnWidth(1, 31 * 257);
            sheet.setColumnWidth(2, 32 * 258);
            sheet.setColumnWidth(3, 33 * 259);
            sheet.setColumnWidth(4, 20 * 260);
            sheet.setColumnWidth(5, 10 * 261);

            sheet.setColumnWidth(6, 11 * 262);

            sheet.setColumnWidth(7, 25 * 263);
            sheet.setColumnWidth(8, 26 * 264);
            sheet.setColumnWidth(9, 34 * 265);
            sheet.setColumnWidth(10, 26 * 264);
            sheet.setColumnWidth(11, 34 * 265);

            Row rowMetadata = sheet.createRow(rowIndex++);
            int colIdx = 0;
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "Schema");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "视图中文名\n(View Logical Name)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "视图名\n(View Physical Name)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "字段中文名\n(Column Logical Name)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "字段名\n(Column Physical Name)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "数据类型\n(Data Type)");

            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "非空\n(NOT NULL)");

            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "定义\n(Definition)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "数据标准编码\n(Data Standard Code)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"),
                    "数据标准\n(Data Standard)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "代码编号\n(Standard Code)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "代码中文名\n(Standard)");
            createStringCell(rowMetadata, colIdx++, styleMap.get("cellMetadata"), "标签\n(Tag)");

            for (MetadataUserDefinedProperty udp : colUdps) {
                int idx = colIdx++;
                createStringCell(rowMetadata, idx, styleMap.get("cellMetadata"), udp.getName());
                sheet.setColumnWidth(idx, 25 * 256);
            }

            for (List<ObjectX> part : Lists.partition(views, 300)) {

                Map<Long, ObjectX> tableMap = part.stream()
                        .collect(Collectors.toMap(ObjectX::getId, Function.identity()));
                List<DataObject> cols = dataObjectService.getModelColumns(modelId,
                        new ArrayList<>(tableMap.keySet()));
                List<Long> colIds = cols.stream().map(x -> x.getObjectId())
                        .collect(Collectors.toList());
                Map<String, Map<Long, MetadataUserDefinedPropertyValue>> colUdpValues = udpService.getObjectsUdpValues(
                        colIds);

                Set<String> domainIds = cols.stream()
                        .filter(x -> !Strings.isNullOrEmpty(x.getDomainId())).map(x -> x.getDomainId())
                        .collect(Collectors.toSet());

                Set<String> codeIds = cols.stream()
                        .filter(x -> !Strings.isNullOrEmpty(x.getDomainCode())).map(x -> x.getDomainCode())
                        .collect(Collectors.toSet());

                Map<String, DomainDto> domainMap = new HashMap<>();
                Map<String, StandardCodeDto> codeMap = new HashMap<>();

                for (List<String> dp : Lists.partition(new ArrayList<>(codeIds), 999)) {
                    List<StandardCodeDto> codes = RemoteServiceGetter.getDomainService().getCodesByCodeNumbers(
                            Lists.newArrayList(dp), null);
                    codes.forEach(x -> codeMap.put(x.getCode(), x));
                }

                // wangxin comment out temp
                for (List<String> dp : Lists.partition(new ArrayList<>(domainIds), 999)) {
                    List<DomainDto> domains = RemoteServiceGetter.getDomainService().getDomainsByDomainIds(
                            new HashSet<>(dp));
                    domains.forEach(x -> domainMap.put(x.getDomainId(), x));
                }

                for (DataObject col : cols) {
                    ObjectX table = tableMap.get(col.getParentId());
                    if (table == null)
                        return;

                    Row rowCol = sheet.createRow(rowIndex++);
                    colIdx = 0;
                    createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                            objectIdToSchema.get(table.getId()));
                    createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                            table.getLogicalName());
                    createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                            table.getName());
                    createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                            col.getLogicalName());
                    createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                            col.getPhysicalName());

//                    ObjectX attr = new ObjectX();
//                    attr.deserialize(col.getObjectNode());
                    ObjectX attr = col.getObjectX();
                    Object datatype = attr.getProperty(LDMTypes.pDataType);
                    createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                            datatype == null ? null : datatype.toString());

                    if (getBooleanProperty(attr, LDMTypes.pIsNotNull)) {
                        createCheckedCell(rowCol, colIdx++, styleMap.get("cellStyleCenterWrap"));
                    } else {
                        colIdx++;
                    }

                    createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                            col.getDefinition());

                    if (!Strings.isNullOrEmpty(col.getDomainId())) {
                        DomainDto domain = domainMap.get(col.getDomainId());
                        if (domain != null) {
                            createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                                    domain.getDomainCode());
                            createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                                    domain.getChineseName());
                        } else {
                            colIdx += 2;
                        }
                    } else {
                        colIdx += 2;
                    }

                    if (!Strings.isNullOrEmpty(col.getDomainCode())) {
                        StandardCodeDto codeDto = codeMap.get(col.getDomainCode());
                        if (codeDto != null) {
                            createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                                    codeDto.getCode());
                            createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                                    codeDto.getName());
                        } else {
                            colIdx += 2;
                        }
                    } else {
                        colIdx += 2;
                    }

                    Set<Long> tagIds = tagItemMap.get(col.getObjectId());
                    if (!CollectionUtils.isEmpty(tagIds)) {
                        StringJoiner tagNames = new StringJoiner(",");
                        for (Long tagId : tagIds) {
                            tagNames.add(tagMap.get(tagId));
                        }
                        createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                                tagNames.toString());
                    } else {
                        colIdx++;
                    }

                    for (MetadataUserDefinedProperty udp : colUdps) {
                        createStringCell(rowCol, colIdx++, styleMap.get("cellStyleWrap"),
                                getPropVal(attr.getId(), udp.getId(), colUdpValues));
                    }
                }

            }
        }
    }
}
