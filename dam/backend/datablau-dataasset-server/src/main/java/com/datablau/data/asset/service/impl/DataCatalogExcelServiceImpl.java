package com.datablau.data.asset.service.impl;

import cn.hutool.poi.excel.ExcelUtil;
import cn.hutool.poi.excel.ExcelWriter;
import com.datablau.data.asset.constants.CatalogExcelConstants;
import com.datablau.data.asset.service.DataCatalogExcelService;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * @author: hxs
 * @date: 2025/4/16 12:38
 */
@Service
public class DataCatalogExcelServiceImpl implements DataCatalogExcelService {

    @Override
    public ExcelWriter exportCatalog(Map<String, List<List<Object>>> catalogMap) {
        ExcelWriter writer = ExcelUtil.getBigWriter();
        //业务域
        this.businessDomainSheet(writer, "业务域", catalogMap.getOrDefault("业务域", new ArrayList<>()));
        //主体域
        this.subjectDomainSheet(writer, "主题域", catalogMap.getOrDefault("主题域", new ArrayList<>()));
        //业务对象
        this.businessObjectSheet(writer, "业务对象", catalogMap.getOrDefault("业务对象", new ArrayList<>()));
        //填写说明
        this.describeSheet(writer,"填写说明");
        // 删除默认的 Sheet1（如果存在）
        Workbook workbook = writer.getWorkbook();
        if (workbook.getNumberOfSheets() > 0 && "sheet1".equals(workbook.getSheetName(0))) {
            workbook.removeSheetAt(0);
        }
        return writer;
    }

    @Override
    public ExcelWriter exportCatalogTemplate(){
        ExcelWriter writer = ExcelUtil.getBigWriter();

        //业务域
        this.businessDomainSheet(writer, "业务域", new ArrayList<>());
        //主体域
        this.subjectDomainSheet(writer, "主题域", new ArrayList<>());
        //业务对象
        this.businessObjectSheet(writer, "业务对象", new ArrayList<>());
        //填写说明
        this.describeSheet(writer,"填写说明");

        // 删除默认的 Sheet1（如果存在）
        Workbook workbook = writer.getWorkbook();
        if (workbook.getNumberOfSheets() > 0 && "sheet1".equals(workbook.getSheetName(0))) {
            workbook.removeSheetAt(0);
        }
        return writer;
    }

    //业务域
    private void businessDomainSheet(ExcelWriter writer, String sheetName, List<List<Object>> datas) {
        writer.setSheet(sheetName);
        Workbook workbook = writer.getWorkbook();
        ArrayList<CVS> headerData = new ArrayList<>();
        headerData.add(new CVS("业务域编码", IndexedColors.RED));
        headerData.add(new CVS("业务域中文名", IndexedColors.RED));
        headerData.add(new CVS("业务域英文名", IndexedColors.RED));
        headerData.add(new CVS("业务域定义", IndexedColors.RED));
//        headerData.add(new CVS("审批人", IndexedColors.RED));
        headerData.add(new CVS("数据主官", IndexedColors.RED));
        this.doHandleHeader(writer, workbook, headerData);

        //数据从第2行开始
        if(!CollectionUtils.isEmpty(datas)){
            int startRow = 1;
            writer.setCurrentRow(startRow);
            for (List<Object> data : datas) {
                writer.writeRow(data);
                writer.setCurrentRow(writer.getCurrentRow());
            }
        }
    }

    //主体域
    private void subjectDomainSheet(ExcelWriter writer, String sheetName, List<List<Object>> datas) {
        writer.setSheet(sheetName);
        Workbook workbook = writer.getWorkbook();
        ArrayList<CVS> headerData = new ArrayList<>();
        headerData.add(new CVS("业务域编码", IndexedColors.GREY_25_PERCENT));
        headerData.add(new CVS("业务域中文名", IndexedColors.RED));
        headerData.add(new CVS("主题域编码", IndexedColors.GREY_25_PERCENT));
        headerData.add(new CVS("主题域中文名", IndexedColors.RED));
        headerData.add(new CVS("主题域英文名", IndexedColors.RED));
        headerData.add(new CVS("主题域定义", IndexedColors.RED));
        headerData.add(new CVS("数据主官", IndexedColors.RED));
        this.doHandleHeader(writer, workbook, headerData);

        //数据从第2行开始
        if(!CollectionUtils.isEmpty(datas)){
            int startRow = 1;
            writer.setCurrentRow(startRow);
            for (List<Object> data : datas) {
                writer.writeRow(data);
                writer.setCurrentRow(writer.getCurrentRow());
            }
        }
    }

    //业务对象
    private void businessObjectSheet(ExcelWriter writer, String sheetName, List<List<Object>> datas) {
        writer.setSheet(sheetName);
        Workbook workbook = writer.getWorkbook();
        ArrayList<CVS> headerData = new ArrayList<>();
        headerData.add(new CVS("业务域编码", IndexedColors.GREY_25_PERCENT));
        headerData.add(new CVS("业务域中文名", IndexedColors.RED));
        headerData.add(new CVS("主题域编码", IndexedColors.GREY_25_PERCENT));
        headerData.add(new CVS("主题域中文名", IndexedColors.RED));
        headerData.add(new CVS("业务对象编码", IndexedColors.GREY_25_PERCENT));
        headerData.add(new CVS("业务对象中文名", IndexedColors.RED));
        headerData.add(new CVS("业务对象英文名", IndexedColors.RED));
        headerData.add(new CVS("业务对象定义", IndexedColors.RED));
        headerData.add(new CVS("数据主官", IndexedColors.RED));
        headerData.add(new CVS("数据管家", IndexedColors.RED));
        this.doHandleHeader(writer, workbook, headerData);

        //数据从第2行开始
        if(!CollectionUtils.isEmpty(datas)){
            int startRow = 1;
            writer.setCurrentRow(startRow);
            for (List<Object> data : datas) {
                writer.writeRow(data);
                writer.setCurrentRow(writer.getCurrentRow());
            }
        }
    }

    private void doHandleHeader(ExcelWriter writer, Workbook workbook, ArrayList<CVS> headerData){
        int curTitleRow = writer.getCurrentRow();
        writer.writeRow(headerData);
        for (int i = 0; i < headerData.size(); i++) {
            Cell cell = writer.getCell(i, curTitleRow);
            CVS cvs = headerData.get(i);
            IndexedColors indexed = cvs.getIndexed();
            if(indexed != null){
                CellStyle colorStyle = createColorStyle(workbook, indexed);
                cell.setCellStyle(colorStyle);
            }
        }
        int maxColumns = headerData.size();
        int fixedColumnWidth = 20; // 每列固定宽度20字符
        for (int col = 0; col < maxColumns; col++) {
            writer.setColumnWidth(col, fixedColumnWidth);
        }
    }

    private void describeSheet(ExcelWriter writer, String sheetName){
        writer.setSheet(sheetName);
        Workbook workbook = writer.getWorkbook();
        LinkedHashMap<String, List<List<CVS>>> data = describeData();
        for (Map.Entry<String, List<List<CVS>>> entry : data.entrySet()) {
            String title = entry.getKey();
            List<List<CVS>> rows = entry.getValue();
            if (rows.isEmpty()) {
                continue;
            }

            // 确定列数（取首行数据长度）
            int columns = rows.get(0).size();

            //写入合并标题行
            int titleRow = writer.getCurrentRow();
            writer.writeCellValue(0, titleRow, title);  // 写入标题到第一个单元格
            writer.merge(titleRow, titleRow, 0, columns - 1, title, false);

            //移动到下一行
            writer.passCurrentRow();

            //写入数据行
            for (List<CVS> rowData : rows) {
                int curTitleRow = writer.getCurrentRow();
                writer.writeRow(rowData);
                for (int i = 0; i < rowData.size(); i++) {
                    Cell cell = writer.getCell(i, curTitleRow);
                    CVS cvs = rowData.get(i);
                    IndexedColors indexed = cvs.getIndexed();
                    if(indexed != null){
                        CellStyle colorStyle = createColorStyle(workbook, indexed);
                        cell.setCellStyle(colorStyle);
                    }
                }
            }
            //在不同组之间留空行
            writer.passRows(3);
        }
        Sheet sheet = writer.getSheet();
        int maxColumns = 0;
        for (Row row : sheet) {
            int currentColumns = row.getPhysicalNumberOfCells();
            if (currentColumns > maxColumns) {
                maxColumns = currentColumns;
            }
        }

        int fixedColumnWidth = 20; // 每列固定宽度20字符
        for (int col = 0; col < maxColumns; col++) {
            writer.setColumnWidth(col, fixedColumnWidth);
        }
    }

    // 工具方法：创建颜色样式
    private CellStyle createColorStyle(Workbook workbook, IndexedColors color) {
        CellStyle style = workbook.createCellStyle();
        style.setWrapText(true);
        style.setFillForegroundColor(color.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER); // 水平居中
        style.setVerticalAlignment(VerticalAlignment.CENTER); // 垂直居中
        Font font = workbook.createFont();
        font.setBold(true); // 标题加粗
        style.setFont(font);
        return style;
    }

    //填写说明sheet数据
    private LinkedHashMap<String, List<List<CVS>>> describeData(){
        LinkedHashMap<String, List<List<CVS>>> data = new LinkedHashMap<>();
        ArrayList<List<CVS>> businessList = new ArrayList<>();
        businessList.add(Arrays.asList(
                new CVS("属性名称", IndexedColors.GREY_25_PERCENT),
                new CVS(CatalogExcelConstants.BusDomain_Code, null),
                new CVS(CatalogExcelConstants.BusDomain_ChineseName, IndexedColors.RED),
                new CVS(CatalogExcelConstants.BusDomain_EnglishName, IndexedColors.RED),
                new CVS(CatalogExcelConstants.BusDomain_Definition, IndexedColors.RED),
                new CVS(CatalogExcelConstants.DataMaster, IndexedColors.RED)));
        businessList.add(Arrays.asList(
                new CVS("是否必填", IndexedColors.GREY_25_PERCENT),
                new CVS("非必填", null),
                new CVS("必填", null),
                new CVS("必填", null),
                new CVS("必填", null),
                new CVS("必填", null)));
        businessList.add(Arrays.asList(
                new CVS("说明", IndexedColors.GREY_25_PERCENT),
                new CVS("新增业务域时，不填写，变更需求填写", null),
                new CVS("业务域的中文名", null),
                new CVS("业务域的英文名", null),
                new CVS("业务域的定义", null),
                new CVS("业务域的数据主官", null)));

        ArrayList<List<CVS>> subjectList = new ArrayList<>();
        subjectList.add(Arrays.asList(
                new CVS("属性名称", IndexedColors.GREY_25_PERCENT),
                new CVS(CatalogExcelConstants.BusDomain_Code, null),
                new CVS(CatalogExcelConstants.BusDomain_ChineseName, IndexedColors.RED),
                new CVS(CatalogExcelConstants.SubDomain_Code, null),
                new CVS(CatalogExcelConstants.SubDomain_ChineseName, IndexedColors.RED),
                new CVS(CatalogExcelConstants.SubDomain_EnglishName, IndexedColors.RED),
                new CVS(CatalogExcelConstants.SubDomain_Definition, IndexedColors.RED),
                new CVS(CatalogExcelConstants.DataMaster, IndexedColors.RED)));
        subjectList.add(Arrays.asList(
                new CVS("是否必填", IndexedColors.GREY_25_PERCENT),
                new CVS("非必填", null),
                new CVS("必填", null),
                new CVS("非必填", null),
                new CVS("必填", null),
                new CVS("必填", null),
                new CVS("必填", null),
                new CVS("必填", null)));
        subjectList.add(Arrays.asList(
                new CVS("说明", IndexedColors.GREY_25_PERCENT),
                new CVS("业务域编码", null),
                new CVS("业务域的中文名", null),
                new CVS("主题域的编码，新增主题域时，不填写，变更需求填写", null),
                new CVS("主题域的中文名", null),
                new CVS("主题域的英文名", null),
                new CVS("主题域的定义", null),
                new CVS("主题域的数据主官", null)));

        ArrayList<List<CVS>> businessObjectList = new ArrayList<>();
        businessObjectList.add(Arrays.asList(
                new CVS("属性名称", IndexedColors.GREY_25_PERCENT),
                new CVS(CatalogExcelConstants.BusDomain_Code, null),
                new CVS(CatalogExcelConstants.BusDomain_ChineseName, IndexedColors.RED),
                new CVS(CatalogExcelConstants.SubDomain_Code, null),
                new CVS(CatalogExcelConstants.SubDomain_ChineseName, IndexedColors.RED),
                new CVS(CatalogExcelConstants.BusObject_Code, null),
                new CVS(CatalogExcelConstants.BusObject_ChineseName, IndexedColors.RED),
                new CVS(CatalogExcelConstants.BusObject_EnglishName, IndexedColors.RED),
                new CVS(CatalogExcelConstants.BusObject_Definition, IndexedColors.RED),
                new CVS(CatalogExcelConstants.DataMaster, IndexedColors.RED),
                new CVS(CatalogExcelConstants.DataSteward, IndexedColors.RED)));
        businessObjectList.add(Arrays.asList(
                new CVS("是否必填", IndexedColors.GREY_25_PERCENT),
                new CVS("非必填", null),
                new CVS("必填", null),
                new CVS("非必填", null),
                new CVS("必填", null),
                new CVS("非必填", null),
                new CVS("必填", null),
                new CVS("必填", null),
                new CVS("必填", null),
                new CVS("必填", null),
                new CVS("必填", null)));
        businessObjectList.add(Arrays.asList(
                new CVS("说明", IndexedColors.GREY_25_PERCENT),
                new CVS(CatalogExcelConstants.BusDomain_Code, null),
                new CVS("业务域的中文名", null),
                new CVS("主题域的编码", null),
                new CVS("主题域的中文名", null),
                new CVS("业务对象的编码，新增业务对象时，不填写，变更需求填写", null),
                new CVS("业务对象的中文名", null),
                new CVS("业务对象的英文名", null),
                new CVS("业务对象的定义", null),
                new CVS("业务对象的数据主官姓名", null),
                new CVS("业务对象的管家", null)));

        data.put("业务域填写说明", businessList);
        data.put("主题域的填写说明", subjectList);
        data.put("业务对象的填写说明", businessObjectList);
        return data;
    }

    private class CVS{
        private String value;
        private IndexedColors indexed;

        public CVS(){}

        public CVS(String value, IndexedColors indexed) {
            this.value = value;
            this.indexed = indexed;
        }

        public String getValue() {
            return value;
        }

        public void setValue(String value) {
            this.value = value;
        }

        public IndexedColors getIndexed() {
            return indexed;
        }

        public void setIndexed(IndexedColors indexed) {
            this.indexed = indexed;
        }

        @Override
        public String toString() {
            return value;
        }
    }
}
