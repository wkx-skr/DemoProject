package com.datablau.domain.management.impl.upload.standard;

import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.utility.BeanHelper;
import com.andorj.model.common.utility.ExcelUpdater;
import com.datablau.domain.management.api.DomainService;
import com.datablau.domain.management.api.StandardService;
import com.datablau.domain.management.api.StandardUdpService;
import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.dto.*;
import com.datablau.domain.management.impl.DomainExportServiceExt;
import com.datablau.domain.management.impl.StandardServiceExt;
import com.datablau.domain.management.utility.DatablauUtility;
import com.datablau.security.management.utils.AuthTools;
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
import java.util.List;
import java.util.*;
import java.util.stream.Collectors;

public final class StandardExportFile {

    private final Long categoryId;
    private final File templateFile;
    private final File copyFile;
    //导出第几行
    private int idx = 1;
    //导出数据每行的第几列
    private int colIdx = 0;
    //key是udp的id，value是udp在excel中的第几列
    private final Map<Long, Integer> udpIndexMap = new HashMap<>();
    private final StandardUdpService standardUdpService;
    private final MessageService msgService;
    private final DomainService domainService;
    private final DomainExportServiceExt domainExportService;
    private final StandardServiceExt standardService;
    private final StandardCodeQueryDto reqDto;
    private List<StandardCodeFolderDto> toBeExportCodes = new ArrayList<>();


    public StandardExportFile(StandardCodeQueryDto reqDto) {
        this.standardUdpService = BeanHelper.getBean(StandardUdpService.class);
        this.msgService = BeanHelper.getBean(MessageService.class);
        this.domainService = BeanHelper.getBean(DomainService.class);
        this.standardService = BeanHelper.getBean(StandardServiceExt.class);
        this.domainExportService = BeanHelper.getBean(DomainExportServiceExt.class);
        this.reqDto = reqDto;
        this.categoryId = reqDto.getCategoryId();

        String filePath;
        String copyFileName;
        if (categoryId == 1) {
            filePath = "/domain/code_template.xlsx";
            copyFileName = "参考数据.xlsx";
        } else {
            //领域标准模板
            filePath = "/domain/code_template_filed.xlsx";
            copyFileName = "领域标准代码.xlsx";
        }
        this.templateFile = new File(DatablauUtility.getResourcePath(filePath));
        this.copyFile = new File(DatablauUtility.getResourcePath("/domain/" + copyFileName));
    }

    public StandardExportFile addUdpAttributeToTemplate() {
        return addUdpAttributeToTemplate(false);
    }
    public StandardExportFile addUdpAttributeToTemplate(boolean isAddFolderPath) {
        try {
            FileUtils.copyFile(templateFile, copyFile);
        } catch (Exception e) {
            throw new AndorjRuntimeException("copy standard template failed", e);
        }

        List<StandardUdpDto> udps = standardUdpService.getStandardUdps(categoryId);
        udps.sort(Comparator.comparing(StandardUdpDto::getOrder));

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
                if (msgService.getMessage("standardExport.remark").equals(cell.getStringCellValue())) {
                    templateStyle.cloneStyleFrom(cell.getCellStyle());
                    break;
                }
            }

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
        if(isAddFolderPath) {
            fillExportData();
            int maxFolderLevel = toBeExportCodes.stream().mapToInt(v -> v.getPaths() == null ? 0 : v.getPaths().size()).max().orElse(0);
            List<String> dynamicPath = domainExportService.getDynamicPath(maxFolderLevel - 1);
            int idx = 0;
            for (String path : dynamicPath) {
                if(path.startsWith("业务域")) continue;
                updater.insertNewColumnAfter(0, idx, path);
                idx+=1;
            }
        }
        updater.close();
        return this;
    }

    public StandardExportFile exportStandardCode() throws Exception {
        return exportStandardCode(false);
    }
    public StandardExportFile exportStandardCode(boolean isAddFolderPath) throws Exception {
        if(!isAddFolderPath) {
            fillExportData();
        }
        int maxFolderLevel = toBeExportCodes.stream().mapToInt(v -> v.getPaths() == null ? 0 : v.getPaths().size()).max().orElse(0) - 1;
        // New Workbook
        try (FileInputStream inputStream = new FileInputStream(copyFile);
             XSSFWorkbook workbook = new XSSFWorkbook(inputStream)) {
            XSSFSheet sheet = workbook.getSheetAt(0);
//            XSSFSheet sheet = workbook.getSheet(msgService.getMessage("exportDomainCode.sheet.name"));
            //移除样例数据
            for (int i = 1; i < 10; i++) {
                sheet.removeRow(sheet.getRow(i));
            }

            for (StandardCodeFolderDto code : toBeExportCodes) {
                if (code.getValues().isEmpty()) {
                    colIdx = 0;
                    Row row = sheet.createRow(idx++);
                    if (categoryId == 1L) {
                        setExportStandardBaseInfo(row, code, isAddFolderPath ? maxFolderLevel : null);
                    } else {
                        setExportDomainStandardBaseInfo(row, code);
                    }
                    setExportStandardUdpInfo(row, code);
                } else {
                    for (StandardCodeValueDto value : code.getValues()) {
                        colIdx = 0;
                        Row row = sheet.createRow(idx++);
                        if (categoryId == 1L) {
                            setExportStandardBaseInfo(row, code, isAddFolderPath ? maxFolderLevel : null);
                            setExportStandardValueInfo(row, value);
                        } else {
                            setExportDomainStandardBaseInfo(row, code);
                            setExportDomainStandardValueInfo(row, value);
                        }
                        setExportStandardUdpInfo(row, code);
                    }
                }
            }
            try (FileOutputStream outputStream = new FileOutputStream(copyFile)) {
                workbook.write(outputStream);
            }
        }
        return this;
    }

    private void fillExportData() {
        if (CollectionUtils.isEmpty(reqDto.getCodes())) {
            toBeExportCodes = standardService.findCodesListWithPath(reqDto);
        } else {
            toBeExportCodes = standardService.findCodesByIdsWithPath(reqDto.getCodes());
        }
        toBeExportCodes = toBeExportCodes
                .stream()
                .filter(code -> {
                    //过滤掉没权限的部分
                    if (code.getParentDomain() == null || code.getParentDomain().getState().equals(DomainState.D) || code.getParentDomain().getState().equals(DomainState.C)) {
//                    if (code.getState().equals(DomainState.D) || code.getState().equals(DomainState.C)) {
                        return standardService.viewAllStandard()
                                || code.getSubmitter().equals(AuthTools.currentUsername());
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    private void setExportStandardBaseInfo(Row row, StandardCodeFolderDto code, Integer maxFolderLevel) {
        //主题
        if(maxFolderLevel == null) {
            row.createCell(colIdx++).setCellValue(code.getDatasetName());
        } else {
            List<String> paths = code.getPaths();
            if (paths != null && !paths.isEmpty()) {
                for (int i = 1; i < paths.size(); i++) {
                    row.createCell(colIdx++).setCellValue(paths.get(i));
                }
            }
            if(colIdx < maxFolderLevel) {
                colIdx = maxFolderLevel;
            }
        }
        //编码
        row.createCell(colIdx++).setCellValue(code.getCode());
        //标准中文名称
        row.createCell(colIdx++).setCellValue(code.getName());
        //标准英文名称
        row.createCell(colIdx++).setCellValue(code.getEnglishName());
        //状态
        if(code.getParentDomain() != null) {
            row.createCell(colIdx++).setCellValue(getStateName(code.getParentDomain().getState()));
        }
        //备注
        row.createCell(colIdx++).setCellValue(code.getComment());
    }

    private void setExportDomainStandardBaseInfo(Row row, StandardCodeDto code) {
        //主题
        row.createCell(colIdx++).setCellValue(code.getDatasetName());
        //编码
        row.createCell(colIdx++).setCellValue(code.getCode());
        //标准中文名称
        row.createCell(colIdx++).setCellValue(code.getName());
        //标准英文名称
        row.createCell(colIdx++).setCellValue(code.getEnglishName());
        //备注
        row.createCell(colIdx++).setCellValue(code.getComment());
        //映射代码
        row.createCell(colIdx++).setCellValue(code.getRefStandardCode());
    }

    private void setExportStandardValueInfo(Row row, StandardCodeValueDto value) {
        //码值序号
        row.createCell(colIdx++).setCellValue(value.getOrder());
        //码值取值
        row.createCell(colIdx++).setCellValue(value.getValue());
        //码值名称
        row.createCell(colIdx++).setCellValue(value.getName());
        //父级码值的值
        row.createCell(colIdx++).setCellValue(value.getParentValue());
        //码值备注一
        row.createCell(colIdx++).setCellValue(value.getDefinition());
        //码值备注二
        row.createCell(colIdx++).setCellValue(value.getDefinition2());
        //码值备注三
        row.createCell(colIdx++).setCellValue(value.getDefinition3());
    }

    private void setExportDomainStandardValueInfo(Row row, StandardCodeValueDto value) {
        //码值取值
        row.createCell(colIdx++).setCellValue(value.getValue());
        //码值名称
        row.createCell(colIdx++).setCellValue(value.getName());
        //父级码值的值
        row.createCell(colIdx++).setCellValue(value.getParentValue());
        //映射编码取值
        row.createCell(colIdx++).setCellValue(value.getRefValue() == null ? "" : value.getRefValue().getValue());
        //映射编码取值中文名称
        row.createCell(colIdx++).setCellValue(value.getRefValue() == null ? "" : value.getRefValue().getName());
        //码值序号
        row.createCell(colIdx++).setCellValue(value.getOrder());
        //码值备注一
        row.createCell(colIdx++).setCellValue(value.getDefinition());
        //码值备注二
        row.createCell(colIdx++).setCellValue(value.getDefinition2());
        //码值备注三
        row.createCell(colIdx++).setCellValue(value.getDefinition3());
    }

    private void setExportStandardUdpInfo(Row row, StandardCodeDto code) {
        Map<Long, String> udpCodeMap = code.getAdditionalProperties();
        if (CollectionUtils.isEmpty(udpCodeMap)) {
            return;
        }
        for (Map.Entry<Long, Integer> entry : udpIndexMap.entrySet()) {
            Long udpId = entry.getKey();
            Integer udpColIdx = entry.getValue();
            String udpValue = udpCodeMap.getOrDefault(udpId, "");
            row.createCell(udpColIdx).setCellValue(udpValue);
        }
    }

    private String getStateName(DomainState state) {
        String stateName = "";
        switch (state) {
            case A:
                stateName = msgService.getMessage("DomainState.A");
                break;
            case D:
                stateName = msgService.getMessage("DomainState.D");
                break;
            case C:
                stateName = msgService.getMessage("DomainState.C");
                break;
            case X:
                stateName = msgService.getMessage("DomainState.X");
                break;
        }
        return stateName;
    }

    public File getCopyFile() {
        return copyFile;
    }

    public Integer getExportNumbers() {
        return toBeExportCodes.size();
    }

}
