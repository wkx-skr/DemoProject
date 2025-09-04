package com.datablau.domain.management.impl.upload;

import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.utility.BeanHelper;
import com.andorj.model.common.utility.ExcelUpdater;
import com.datablau.domain.management.api.BusinessTermService;
import com.datablau.domain.management.api.DomainService;
import com.datablau.domain.management.dto.*;
import com.datablau.domain.management.impl.DomainExportServiceExt;
import com.datablau.domain.management.utility.DatablauUtility;
import org.apache.commons.io.FileUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.util.CollectionUtils;

import java.awt.*;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.*;
import java.util.List;

public class BusinessTermExportFile {

    private final Long categoryId = DomainService.DOMAIN_CATEGORY_ID;
    private final File templateFile;
    private final File copyFile;
    //导出第几行
    private int idx = 1;
    //导出数据每行的第几列
    private int colIdx = 0;
    //key是udp的id，value是udp在excel中的第几列
    private final Map<Long, Integer> udpIndexMap = new HashMap<>();
    private final MessageService msgService;
    private final DomainService domainService;
    private final DomainExportServiceExt domainExportService;
    private final BusinessTermService businessTermService;
    private final BusinessTermQueryDto reqDto;
    private final List<Long> ids;
    private List<BusinessTermExcelDto> toBeExportCodes = new ArrayList<>();


    public BusinessTermExportFile(List<Long> ids) {
        this(null, ids);
    }
    public BusinessTermExportFile(BusinessTermQueryDto reqDto) {
        this(reqDto, null);
    }
    public BusinessTermExportFile(BusinessTermQueryDto reqDto, List<Long> ids) {
        this.msgService = BeanHelper.getBean(MessageService.class);
        this.domainService = BeanHelper.getBean(DomainService.class);
        this.businessTermService = BeanHelper.getBean(BusinessTermService.class);
        this.domainExportService = BeanHelper.getBean(DomainExportServiceExt.class);
        this.reqDto = reqDto;
        this.ids = ids;

        String filePath;
        String copyFileName;
        filePath = "/domain/business_term_template.xlsx";
        copyFileName = "业务术语.xlsx";
        this.templateFile = new File(DatablauUtility.getResourcePath(filePath));
        this.copyFile = new File(DatablauUtility.getResourcePath("/domain/" + copyFileName));
    }

    public BusinessTermExportFile addUdpAttributeToTemplate() {
        try {
            FileUtils.copyFile(templateFile, copyFile);
        } catch (Exception e) {
            throw new AndorjRuntimeException("copy businessTerm template failed", e);
        }

        ExcelUpdater updater = null;
        XSSFWorkbook wb = null;
        try {
            updater = new ExcelUpdater(templateFile.getAbsolutePath(), copyFile.getAbsolutePath());
            wb = new XSSFWorkbook(new FileInputStream(templateFile));
            updater.open();

            XSSFSheet sheet = wb.getSheetAt(0);
            Row header = sheet.getRow(0);

            int standardPlus = 0;
            XSSFCellStyle templateStyle = wb.createCellStyle();
            for (; standardPlus < header.getLastCellNum(); standardPlus++) {
                Cell cell = header.getCell(standardPlus);
                if (msgService.getMessage("BusinessTermExcelDto.source").equals(cell.getStringCellValue())) {
                    templateStyle.cloneStyleFrom(cell.getCellStyle());
                    break;
                }
            }

            // 扩展属性
            List<StandardUdpDto> udps = new ArrayList<>();
            udps.sort(Comparator.comparing(StandardUdpDto::getOrder));
            for (StandardUdpDto udp : udps) {
                udpIndexMap.put(udp.getUdpId(), standardPlus + 1);
                XSSFCellStyle cellStyle = wb.createCellStyle();
                cellStyle.cloneStyleFrom(templateStyle);

                if (udp.isRequired()) {
                    //必填属性样式
                    cellStyle.setFillForegroundColor(new XSSFColor(new Color(192, 0, 0),null));
                }
                updater.insertNewColumnAfter(0, standardPlus++, udp.getName(), cellStyle);
            }
        } catch (Exception ex) {
            throw new AndorjRuntimeException(
                    msgService.getMessage("templateFileCreateExists", ex.getMessage()), ex);
        }
        fillExportData();
        int maxFolderLevel = toBeExportCodes.stream().mapToInt(v -> v.getPaths() == null ? 0 : v.getPaths().size()).max().orElse(0);
        List<String> dynamicPath = domainExportService.getDynamicPath(maxFolderLevel - 1);
        int idx = 0;
        for (String path : dynamicPath) {
            if(path.startsWith("业务域")) continue;
            updater.insertNewColumnAfter(0, idx, path);
            idx+=1;
        }
        updater.close();
        return this;
    }

    public BusinessTermExportFile exportStandardCode() throws Exception {
        int maxFolderLevel = toBeExportCodes.stream().mapToInt(v -> v.getPaths() == null ? 0 : v.getPaths().size()).max().orElse(0) - 1;
        // New Workbook
        try (FileInputStream inputStream = new FileInputStream(copyFile);
             XSSFWorkbook workbook = new XSSFWorkbook(inputStream)) {
            XSSFSheet sheet = workbook.getSheetAt(0);
            //移除样例数据
            for (int i = 1; i < 10; i++) {
                sheet.removeRow(sheet.getRow(i));
            }

            for (BusinessTermExcelDto code : toBeExportCodes) {
                colIdx = 0;
                Row row = sheet.createRow(idx++);
                setExportStandardBaseInfo(row, code, maxFolderLevel);
                setExportStandardUdpInfo(row, code);
            }
            try (FileOutputStream outputStream = new FileOutputStream(copyFile)) {
                workbook.write(outputStream);
            }
        }
        return this;
    }

    private synchronized void fillExportData() {
        toBeExportCodes.clear();
        if(!CollectionUtils.isEmpty(ids)) {
            List<BusinessTermDto> businessTermDtos = businessTermService.queryBusinessTermById(ids);
            for (BusinessTermDto businessTermDto : businessTermDtos) {
                toBeExportCodes.add(BusinessTermExcelDto.buildBy(businessTermDto, msgService));
            }
        } else {
            BusinessTermQueryDto defaultReqDto = new BusinessTermQueryDto();
            defaultReqDto.setOrderBy("updateTime");
            defaultReqDto.setSort("desc");
            BusinessTermQueryDto _reqDto = reqDto == null ? defaultReqDto : reqDto;
            PageResult<BusinessTermDto> pageOfBusinessTermDto = businessTermService.getPageOfBusinessTermDto(_reqDto, false);
            List<BusinessTermDto> content = pageOfBusinessTermDto.getContent();
            for (BusinessTermDto businessTermDto : content) {
                toBeExportCodes.add(BusinessTermExcelDto.buildBy(businessTermDto, msgService));
            }
        }
    }

    private void setExportStandardBaseInfo(Row row, BusinessTermExcelDto code, Integer maxFolderLevel) {
        //主题
        List<String> paths = code.getPaths();
        if (paths != null && !paths.isEmpty()) {
            for (int i = 1; i < paths.size(); i++) {
                row.createCell(colIdx++).setCellValue(paths.get(i));
            }
        }
        if(colIdx < maxFolderLevel) {
            colIdx = maxFolderLevel;
        }
        //编码
        row.createCell(colIdx++).setCellValue(code.getDomainCode());
        //标准中文名称
        row.createCell(colIdx++).setCellValue(code.getChName());
        //标准英文名称
        row.createCell(colIdx++).setCellValue(code.getEnName());
        //定义
        row.createCell(colIdx++).setCellValue(code.getExplanationTerms());
        //责任主体
        row.createCell(colIdx++).setCellValue(code.getManagementDepartment());
        //缩写
        row.createCell(colIdx++).setCellValue(code.getAbbr());
        //参考来源
        row.createCell(colIdx++).setCellValue(code.getSource());
        //应用场景
        row.createCell(colIdx++).setCellValue(code.getScene());
        //示例
        row.createCell(colIdx++).setCellValue(code.getExample());
        //同义词
        row.createCell(colIdx++).setCellValue(code.getBusinessTermAliases());
        //相关术语
        row.createCell(colIdx++).setCellValue(code.getRelaTerm());
        //首次发布时间
        row.createCell(colIdx++).setCellValue(code.getFirstPublishDate());
        //业务术语状态
        row.createCell(colIdx++).setCellValue(code.getStateStr());
    }


    private void setExportStandardUdpInfo(Row row, BusinessTermExcelDto code) {
//        Map<Long, String> udpCodeMap = code.getAdditionalProperties();
//        if (CollectionUtils.isEmpty(udpCodeMap)) {
//            return;
//        }
//        for (Map.Entry<Long, Integer> entry : udpIndexMap.entrySet()) {
//            Long udpId = entry.getKey();
//            Integer udpColIdx = entry.getValue();
//            String udpValue = udpCodeMap.getOrDefault(udpId, "");
//            row.createCell(udpColIdx).setCellValue(udpValue);
//        }
    }

    public File getCopyFile() {
        return copyFile;
    }

    public Integer getExportNumbers() {
        return toBeExportCodes.size();
    }

}
