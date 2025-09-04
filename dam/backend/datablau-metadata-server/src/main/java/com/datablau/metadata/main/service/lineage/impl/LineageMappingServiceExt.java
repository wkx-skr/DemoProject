package com.datablau.metadata.main.service.lineage.impl;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.lineage.data.LineageColumn;
import com.andorj.lineage.data.LineageContainer;
import com.andorj.lineage.data.LineageLine;
import com.andorj.lineage.data.LineageStep;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.metadata.common.dto.lineage.LineageFolderRefType;
import com.datablau.metadata.main.dao.DataObjectFullRepository;
import com.datablau.metadata.main.dao.ETLSourceInfoBindRepository;
import com.datablau.metadata.main.dao.lineage.LineageFolderRefRepository;
import com.datablau.metadata.main.dto.LineageMappingExcelDto;
import com.datablau.metadata.main.entity.ETLSourceInfoBind;
import com.datablau.metadata.main.entity.lineage.LineageFolderRef;
import com.datablau.metadata.main.entity.metadata.DataObject;
import com.datablau.metadata.main.entity.model.Model;
import com.datablau.metadata.main.ext.EtlSourceService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.google.common.base.Strings;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.openxml4j.opc.PackageAccess;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.*;

@Service("lineageMappingServiceExt")
public class LineageMappingServiceExt extends LineageMappingServiceImpl implements EtlSourceService {

    private static final Logger logger = LoggerFactory.getLogger(LineageMappingServiceExt.class);

    @Autowired
    protected LineageFolderRefRepository folderRefRepository;

    @Autowired
    private DataObjectFullRepository dataObjectFullRepository;

    @Autowired
    private ETLSourceInfoBindRepository etlSourceInfoBindRepository;

    public LineageContainer getLineageOfObject(Long objectId, String type) {
        DataObject object = this.objectService.getDataObjectByObjectId(objectId);
        if (object == null) {
            throw new InvalidArgumentException(this.msgService.getMessage("bloodLineageObjectQueryNotNull"));
        } else {
            boolean isLdmType = true;
            LineageContainer lineageContainer = null;
            Model model = null;
            if (!object.getTypeId().equals(80000004L) && !object.getTypeId().equals(80500008L)) {
                if (object.getTypeId().equals(80000005L)) {
                    lineageContainer = this.findColumnFullLineage(object, type, false, (Integer)null);
                } else {
                    model = this.modelService.getDataModelById(object.getModelId());
                    isLdmType = Strings.isNullOrEmpty(model.getMetaModelCode()) || "LDM".equals(model.getMetaModelCode());
                    if (!isLdmType) {
                        lineageContainer = this.findMetaModelLineage(object);
                    }
                }
            } else {
                lineageContainer = this.findTableLineage(object, type, (Integer)null);
            }

            if (lineageContainer != null && !Objects.equals("left", type) && !object.getTypeId().equals(80500008L)) {
                this.findReportLineage(lineageContainer);
                this.findIndicatorsLineage(lineageContainer);
            }

            if (lineageContainer != null) {
                this.findRefMetaModelLineage(lineageContainer, type, object);
            }

            //add properties
            Set<LineageLine> lines = lineageContainer.getLines();
            for (LineageLine line : lines) {
                Long source = Long.parseLong(line.getSource());
                Long target = Long.parseLong(line.getTarget());

                ETLSourceInfoBind etlBind = etlSourceInfoBindRepository.findBySrcObjectIdAndTargetObjectId(source, target);

                if(etlBind == null) continue;

                DataObject etlInfo = dataObjectRepository.findByObjectId(etlBind.getEtlObjectId());

                Map<String, String> bindMap = new HashMap<>();
                bindMap.put("etlObjectId", etlBind.getEtlObjectId().toString());
                bindMap.put("etlName", etlBind.getEtlName());
                if (etlInfo != null) {
                    bindMap.put("type", getTypeNameByTypeId(etlInfo.getTypeId()));
                }
                String bindJson = "";
                try {
                    bindJson = mapper.writeValueAsString(bindMap);
                } catch (JsonProcessingException e) {
                    logger.warn("bindMap json parse error cause by:" + e.getMessage());
                    continue;
                }
                line.addProperties(Map.of("etlSource", bindJson));
            }
            return lineageContainer;
        }
    }

    public static String getTypeNameByTypeId(Long typeId) {
        if (typeId == null) {
            return "META_MODEL";
        }
        switch (typeId.intValue()) {
            case 80000005:
                return "COLUMN";
            case 80000004:
                return "TABLE";
            case 80500008:
                return "VIEW";
            case 80010118:
                return "STORED_PROCEDURE";
            case 82800024:
                return "PACKAGE";
            case 80010119:
                return "FUNCTION";
            default:
                return "META_MODEL";
        }
    }

    @Override
    public void saveEtlSource(File file, Long lineageId, Long folderId, LineageContainer container) throws Exception {
        if (!file.getName().toLowerCase().endsWith(".xlsx")) {
            throw new InvalidArgumentException(this.msgService.getMessage("onlySupportMicrosoftExcelXlsx"));
        } else {
            OPCPackage pkg = OPCPackage.open(file, PackageAccess.READ);
            XSSFWorkbook workbook = new XSSFWorkbook(pkg);
            XSSFSheet sheet = GeneralUtility.getFirstVisibleSheet(workbook);
            if (sheet == null) {
                throw new InvalidArgumentException(this.msgService.getMessage("noSheetCanRead"));
            } else {
                //获取血缘信息
                Map<String, LineageStep> steps = container.getSteps();
                if (steps == null || steps.isEmpty()) return;

                Map<String, String> tableNameAndIdsMap = new HashMap<>();
                Map<String, String> columnNameAndIdsMap = new HashMap<>();

                for (LineageStep step : steps.values()) {
                    tableNameAndIdsMap.put(step.getName(), step.getId());

                    Set<LineageColumn> columns = step.getColumns();
                    for (LineageColumn column : columns) {
                        columnNameAndIdsMap.put(column.getName(), column.getId());
                    }
                }

                //parse file
                List<LineageMappingExcelDto> mappings = parseExcel(sheet);

                // 获取当前血缘目录下的datasource
                List<Long> modelIds = new ArrayList<>();
                List<LineageFolderRef> lineageFolderRefs = folderRefRepository.findByFolderIdAndRefType(folderId, LineageFolderRefType.DATAOBJECT);
                if (lineageFolderRefs != null && !lineageFolderRefs.isEmpty()) {
                    modelIds = lineageFolderRefs.stream().map(LineageFolderRef::getItemId).toList();
                }
                if (modelIds == null || modelIds.isEmpty()) return;

                for (LineageMappingExcelDto mapping : mappings) {

                    String etlName = mapping.getEtlName();
                    //通过modelId + value定位一个指定的数据  如果有多条符合的  随机取一条bind
                    List<DataObject> dataObjects = dataObjectFullRepository.findDataByModelIdsAndName(modelIds, etlName);
                    if (dataObjects == null || dataObjects.isEmpty()) continue;

                    String sourceTable = mapping.getSourceTable();
                    String targetTable = mapping.getTargetTable();
                    String sourceColumn = mapping.getSourceColumn();
                    String targetColumn = mapping.getTargetColumn();

                    Long sourceTableId = Long.parseLong(tableNameAndIdsMap.get(sourceTable));
                    Long targetTableId = Long.parseLong(tableNameAndIdsMap.get(targetTable));
                    Long sourceColumnId = Long.parseLong(columnNameAndIdsMap.get(sourceColumn));
                    Long targetColumnId = Long.parseLong(columnNameAndIdsMap.get(targetColumn));

                    //如果关系已经存在 那么先删除原来的关系 再新增
                    ETLSourceInfoBind bind = null;
                    if (sourceColumnId == null && targetColumnId == null) {
                        bind = etlSourceInfoBindRepository.findBySrcObjectIdAndTargetObjectId(sourceTableId, targetTableId);
                    }else {
                        bind = etlSourceInfoBindRepository.findBySrcObjectIdAndTargetObjectId(sourceColumnId, targetColumnId);
                    }

                    if (bind != null) {
                        etlSourceInfoBindRepository.delete(bind);
                    }

                    //save
                    DataObject dataObject = dataObjects.get(0);
                    ETLSourceInfoBind save = new ETLSourceInfoBind(dataObject.getObjectId(), dataObject.getLogicalName(), sourceColumnId == null ? sourceTableId : sourceColumnId, targetColumnId == null ? targetTableId : targetColumnId);
                    etlSourceInfoBindRepository.save(save);
                }
                workbook.close();
            }
        }
    }

    public List<LineageMappingExcelDto> parseExcel(XSSFSheet sheet) {
        List<LineageMappingExcelDto> result = new ArrayList<>();

        // 第一行是表头
        Row headerRow = sheet.getRow(sheet.getFirstRowNum());
        if (headerRow == null) return result;

        // 映射列名到索引
        Map<String, Integer> columnIndexMap = new HashMap<>();
        for (Cell cell : headerRow) {
            String header = cell.getStringCellValue().trim();
            columnIndexMap.put(header, cell.getColumnIndex());
        }

        // 确认需要的列都存在
        String[] requiredHeaders = {"源表", "源列", "目标表", "目标列", "来源ETL名称"};
        for (String header : requiredHeaders) {
            if (!columnIndexMap.containsKey(header)) {
                throw new RuntimeException("缺少列头: " + header);
            }
        }

        // 从第二行开始读取数据
        for (int i = sheet.getFirstRowNum() + 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            String sourceTable = getCellString(row, columnIndexMap.get("源表"));
            String sourceColumn = getCellString(row, columnIndexMap.get("源列"));
            String targetTable = getCellString(row, columnIndexMap.get("目标表"));
            String targetColumn = getCellString(row, columnIndexMap.get("目标列"));
            String etlName = getCellString(row, columnIndexMap.get("来源ETL名称"));

            result.add(new LineageMappingExcelDto(sourceTable, sourceColumn, targetTable, targetColumn, etlName));
        }

        return result;
    }

    private String getCellString(Row row, int columnIndex) {
        Cell cell = row.getCell(columnIndex);
        if (cell == null) return "";
        cell.setCellType(CellType.STRING); // 防止数字等类型导致异常
        return cell.getStringCellValue().trim();
    }


}
