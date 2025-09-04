package com.datablau.data.asset.service.impl;//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//


import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.model.common.annotation.ExcelColumn;
import com.andorj.model.common.utility.BeanHelper;
import com.andorj.model.common.utility.FileUtility;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.data.asset.service.AssetsExcelExporter;
import com.datablau.data.common.api.EditionService;
import com.datablau.data.common.api.LocaleColumnProxy;
import com.google.common.base.Strings;
import org.apache.commons.io.FileUtils;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.lang.reflect.Field;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;


@Service
public class AssetsExcelExporterImpl implements AssetsExcelExporter {
    private static final Logger LOGGER = LoggerFactory.getLogger(AssetsExcelExporterImpl.class);
    public static final Map<String, CellStyle> STYLE_MAP = new HashMap();

    public AssetsExcelExporterImpl() {
    }

    public XSSFWorkbook exportExcelSheet(XSSFWorkbook workbook, Class<?> clazz, Collection<?> collection, String sheetName, Integer headRowNum, Map<Long, String> udpMap, boolean useTemplate) throws Exception {
        Map<Field, Map<String, String>> fieldMappingMap = new HashMap();
        EditionService editionService = (EditionService)BeanHelper.getBean(EditionService.class);
        Field[] fields = clazz.getDeclaredFields();
        HashMap<Field, ExcelColumn> fieldExcelColumnHashMap = new HashMap();
        List<String> headerList = new ArrayList();
        List<String> headerCodeList = new ArrayList();
        Field[] var14 = fields;
        int var15 = fields.length;

        int var21;
        int j;
        String headerName;
        for(int var16 = 0; var16 < var15; ++var16) {
            Field field = var14[var16];
            ExcelColumn columnAnnotation = (ExcelColumn)field.getAnnotation(ExcelColumn.class);
            if (columnAnnotation != null) {
                columnAnnotation = LocaleColumnProxy.getLocaleColumn(columnAnnotation);
                if (columnAnnotation.onlyForFeatureCodes() != null && columnAnnotation.onlyForFeatureCodes().length > 0) {
                    boolean containsFeatureCode = false;
                    String[] var20 = columnAnnotation.onlyForFeatureCodes();
                    var21 = var20.length;

                    for(int var22 = 0; var22 < var21; ++var22) {
                        String featureCode = var20[var22];
                        if (editionService.checkFeature(new String[]{featureCode})) {
                            containsFeatureCode = true;
                            break;
                        }
                    }

                    if (!containsFeatureCode) {
                        continue;
                    }
                }

                fieldExcelColumnHashMap.put(field, columnAnnotation);
                if (columnAnnotation.excelValues().length > 0 && columnAnnotation.dbValues().length > 0) {
                    Map<String, String> mapping = new HashMap();

                    for(j = 0; j < columnAnnotation.excelValues().length; ++j) {
                        String value = columnAnnotation.excelValues()[j];
                        headerName = columnAnnotation.dbValues()[j];
                        mapping.put(headerName, value);
                    }

                    fieldMappingMap.put(field, mapping);
                }

                field.setAccessible(true);
                String columnName = columnAnnotation.columnNames()[0];
                if (!headerCodeList.contains(field.getName()) && !columnAnnotation.asMultipleCols() && !columnAnnotation.isUdp()) {
                    headerList.add(columnName);
                    headerCodeList.add(field.getName());
                }
            }
        }

        if (fieldExcelColumnHashMap.isEmpty()) {
            throw new UnexpectedStateException("No attributes found that need to be exported");
        } else {
            List<Map<String, String>> dtos = new ArrayList();
            List<String> headerUdpList = (List)udpMap.values().stream().collect(Collectors.toList());
            Iterator var30 = collection.iterator();

            while(var30.hasNext()) {
                Object object = var30.next();
                Map<String, String> map = new LinkedHashMap();
                Field[] var42 = clazz.getDeclaredFields();
                j = var42.length;

                for(var21 = 0; var21 < j; ++var21) {
                    Field field = var42[var21];
                    if (fieldExcelColumnHashMap.containsKey(field)) {
                        ExcelColumn excelColumn = (ExcelColumn)fieldExcelColumnHashMap.get(field);
                        String columnName = excelColumn.columnNames()[0];
                        field.setAccessible(true);
                        String val = "";
                        String s;
                        if (field.getType().equals(Date.class)) {
                            s = "yyyy-MM-dd hh:mm:ss";
                            if (excelColumn.dateFormat().length != 0) {
                                s = excelColumn.dateFormat()[0];
                            }

                            SimpleDateFormat sdf = new SimpleDateFormat(s);
                            val = field.get(object) == null ? "" : sdf.format(field.get(object));
                        } else if (field.getType().equals(Map.class)) {
                            if (excelColumn.isUdp()) {
                                Map<Long, String> o = (Map)field.get(object);
                                if (o == null) {
                                    continue;
                                }

                                o.entrySet().stream().forEach((vl) -> {
                                    if (udpMap != null && udpMap.containsKey(vl.getKey())) {
                                        String key = (String)udpMap.get(vl.getKey());
                                        map.put(key, (String)vl.getValue());
                                    }

                                });
                            }
                        } else if (field.getType().equals(String.class)) {
                            val = field.get(object) == null ? "" : (String)field.get(object);
                        } else {
                            val = field.get(object) == null ? "" : field.get(object).toString();
                        }

                        if (fieldMappingMap.containsKey(field)) {
                            s = (String)((Map)fieldMappingMap.get(field)).get(val);
                            if (!Strings.isNullOrEmpty(s)) {
                                val = s;
                            }
                        }

                        map.put(columnName, val);
                    }
                }

                dtos.add(map);
            }

            this.initCellStyle(workbook);
            XSSFSheet sheet;
            if (workbook.getSheet(sheetName) == null) {
                sheet = workbook.createSheet(sheetName);
            } else {
                sheet = workbook.getSheet(sheetName);
            }

            XSSFRow headerRow;
            XSSFCell cell;
            if (useTemplate) {
                headerRow = sheet.getRow(headRowNum);
                ArrayList<String> templateHeader = new ArrayList();
                int columnNum = 0;
                Iterator var45 = headerRow.iterator();

                while(var45.hasNext()) {
                    Cell cell1 = (Cell)var45.next();
                    ++columnNum;
                    headerName = cell1.getStringCellValue();
                    templateHeader.add(headerName);
                }

                headerList = new ArrayList(templateHeader);
                headerList.addAll(headerUdpList);

                for(j = columnNum; j < headerList.size(); ++j) {
                    cell = headerRow.createCell(j);
                    cell.setCellValue((String)headerList.get(j));
                    cell.setCellStyle((CellStyle)STYLE_MAP.get("cellData"));
                }
            } else {
                sheet.setDefaultColumnWidth(25);
                headerRow = sheet.createRow(headRowNum);
                headerList.addAll(headerUdpList);

                for(int i = 0; i < headerList.size(); ++i) {
                    XSSFCell cell2 = headerRow.createCell(i);
                    cell2.setCellValue((String)headerList.get(i));
                    cell2.setCellStyle((CellStyle)STYLE_MAP.get("cellData"));
                }
            }

            for(int i = 0; i < dtos.size(); ++i) {
                Map<String, String> map = (Map)dtos.get(i);
                XSSFRow row = sheet.createRow(i + 1 + headRowNum);

                for(j = 0; j < headerList.size(); ++j) {
                    cell = row.createCell(j);
                    headerName = (String)headerList.get(j);
                    cell.setCellValue((String)map.get(headerName));
                    cell.setCellType(CellType.STRING);
                    if ("√".equalsIgnoreCase((String)map.get(headerName))) {
                        cell.setCellStyle((CellStyle)STYLE_MAP.get("cellStyleCenterWrap"));
                    } else {
                        cell.setCellStyle((CellStyle)STYLE_MAP.get("cellStyleWrap"));
                    }
                }
            }

            return workbook;
        }
    }

    public File exportExcel(Class<?> clazz, Collection<?> collection, String sheetName, Integer headRowNum, String fileName) throws Exception {
        return this.exportExcel(clazz, collection, sheetName, headRowNum, fileName, new HashMap());
    }

    public File exportExcel(Class<?> clazz, Collection<?> collection, String sheetName, Integer headRowNum, String fileName, Map<Long, String> udpMap) throws Exception {
        XSSFWorkbook workbook = new XSSFWorkbook();
        this.exportExcelSheet(workbook, clazz, collection, sheetName, headRowNum, udpMap, false);
        return this.workbookToFile(fileName, workbook);
    }

    public File exportExcelUseTemplate(String templatePath, Class<?> clazz, Collection<?> collection, String sheetName, Integer headRowNum, String fileName, Map<Long, String> udpMap) throws Exception {
        if (!templatePath.toLowerCase().endsWith(".xlsx")) {
            throw new InvalidArgumentException(GeneralUtility.getMessageService().getMessage("onlySupportXlsxExcel"));
        } else {
            File templateFile = new File(templatePath);
            String var10000 = FileUtility.getTempFolder();
            String templatePathTemp = var10000 + File.separator + templateFile.getName().replaceAll(".xlsx", "") + "_" + System.currentTimeMillis() + ".xlsx";

            try {
                FileUtils.copyFile(templateFile, new File(templatePathTemp));
            } catch (Exception var12) {
                Exception e = var12;
                throw new InvalidArgumentException("copy file failed：" + e.getMessage());
            }

            OPCPackage pkg = OPCPackage.open(templatePathTemp);
            XSSFWorkbook workbook = new XSSFWorkbook(pkg);
            this.exportExcelSheet(workbook, clazz, collection, sheetName, headRowNum, udpMap, true);
            return this.workbookToFile(fileName, workbook);
        }
    }

    public File exportExcelUseTemplate(String templatePath, Class<?> clazz, Collection<?> collection, String sheetName, Integer headRowNum, String fileName) throws Exception {
        return this.exportExcelUseTemplate(templatePath, clazz, collection, sheetName, headRowNum, fileName, new HashMap());
    }

    public File exportExcelUseTemplate(String templatePath, Class<?> clazz, Collection<?> collection, String sheetName, String fileName, Map<Long, String> udpMap) throws Exception {
        return this.exportExcelUseTemplate(templatePath, clazz, collection, sheetName, 0, fileName, udpMap);
    }

    public File exportExcelUseTemplate(String templatePath, Class<?> clazz, Collection<?> collection, String sheetName, String fileName) throws Exception {
        return this.exportExcelUseTemplate(templatePath, clazz, collection, sheetName, 0, fileName);
    }

    public void initCellStyle(Workbook workbook) {
        CellStyle cellStyleCenterWrap = workbook.createCellStyle();
        cellStyleCenterWrap.setAlignment(HorizontalAlignment.CENTER);
        cellStyleCenterWrap.setWrapText(true);
        STYLE_MAP.put("cellStyleCenterWrap", cellStyleCenterWrap);
        CellStyle cellStyleWrap = workbook.createCellStyle();
        cellStyleWrap.setWrapText(true);
        cellStyleWrap.setAlignment(HorizontalAlignment.CENTER);
        cellStyleWrap.setDataFormat(workbook.createDataFormat().getFormat("@"));
        STYLE_MAP.put("cellStyleWrap", cellStyleWrap);
        CellStyle cellStyleLink = workbook.createCellStyle();
        cellStyleLink.setWrapText(true);
        Font iFont = workbook.createFont();
        iFont.setColor((short)12);
        iFont.setUnderline((byte)1);
        cellStyleLink.setFont(iFont);
        STYLE_MAP.put("cellStyleLink", cellStyleLink);
        CellStyle cellMetadata = workbook.createCellStyle();
        cellMetadata.setAlignment(HorizontalAlignment.CENTER);
        cellMetadata.setWrapText(true);
        cellMetadata.setBorderBottom(BorderStyle.THIN);
        cellMetadata.setBorderLeft(BorderStyle.THIN);
        cellMetadata.setBorderRight(BorderStyle.THIN);
        cellMetadata.setBorderTop(BorderStyle.THIN);
        cellMetadata.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        cellMetadata.setFillForegroundColor((short)54);
        STYLE_MAP.put("cellData", cellMetadata);
        Font font = workbook.createFont();
        font.setColor((short)9);
        cellMetadata.setFont(font);
        CellStyle cellStyleAttr = workbook.createCellStyle();
        cellStyleAttr.setAlignment(HorizontalAlignment.CENTER);
        cellStyleAttr.setWrapText(true);
        cellStyleAttr.setBorderBottom(BorderStyle.THIN);
        cellStyleAttr.setBorderLeft(BorderStyle.THIN);
        cellStyleAttr.setBorderRight(BorderStyle.THIN);
        cellStyleAttr.setBorderTop(BorderStyle.THIN);
        cellStyleAttr.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        cellStyleAttr.setFillForegroundColor((short)46);
        STYLE_MAP.put("cellStyleAttr", cellStyleAttr);
    }

    private File workbookToFile(String fileName, XSSFWorkbook workbook) {
        String var10000 = FileUtility.getTempFolder();
        String filename = var10000 + File.separator + fileName + ".xlsx";
        FileOutputStream out = null;

        try {
            out = new FileOutputStream(filename);
            workbook.write(out);
        } catch (IOException var16) {
            IOException ex = var16;
            LOGGER.error("Failed to create template file", ex);
            throw new IllegalStateException("Failed to create file");
        } finally {
            if (out != null) {
                try {
                    out.close();
                } catch (Exception var15) {
                }
            }

            if (workbook != null) {
                try {
                    workbook.close();
                } catch (Exception var14) {
                }
            }

        }

        return new File(filename);
    }
}
