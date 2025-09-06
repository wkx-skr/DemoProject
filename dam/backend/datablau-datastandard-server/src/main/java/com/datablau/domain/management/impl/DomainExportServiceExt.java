package com.datablau.domain.management.impl;

import com.datablau.domain.management.api.BusinessTermService;
import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.dto.*;
import com.datablau.domain.management.jpa.entity.BusinessTerm;
import com.datablau.domain.management.jpa.entity.Domain;
import com.datablau.domain.management.jpa.entity.StandardCode;
import com.datablau.domain.management.jpa.repository.BusinessTermRepository;
import com.datablau.domain.management.jpa.repository.DomainExtRepository;
import com.datablau.domain.management.jpa.repository.DomainRepository;
import com.datablau.domain.management.jpa.repository.StandardCodeRepository;
import com.datablau.domain.management.utility.DatablauUtility;
import com.datablau.security.management.utils.AuthTools;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.openxml4j.util.ZipSecureFile;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.awt.*;
import java.io.*;
import java.lang.reflect.Field;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.List;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service("domainExportServiceExt")
public class DomainExportServiceExt extends DomainExportServiceImpl {
    private static final Logger logger = LoggerFactory.getLogger(DomainExportServiceExt.class);

    @Autowired
    private DomainExtServiceImpl domainExtServiceImpl;

    @Autowired
    private DomainRepository domainRepo;

    @Autowired
    private BusinessTermRepository businessTermRepo;

    @Autowired
    private StandardCodeRepository standardCodeRepo;
    public DomainExportResult exportDomainTemplate(Long categoryId, DomainQueryDto queryDto) throws Exception {
        if (categoryId == 1L) {
            return this.getBasicDomain(queryDto, categoryId);
        } else if (categoryId == 2L) {
            return this.getIndexDomain(queryDto);
        } else {
            return categoryId > 6L ? this.getBasicDomain(queryDto, categoryId) : null;
        }
    }

    public DomainExportResult getBasicDomain(DomainQueryDto queryDto, Long categoryId) throws Exception {
        String[] headRow = msgService.getMessageObj("BasicDomain.head", true);

        List<String> pathInfo = msgService.getMessageObj("BasicDomain.pathInfo", false);

        List<DomainDto> toExportDomains = null;
        if(queryDto != null){
            String username = AuthTools.currentUsernameFailFast();
            queryDto.setCurrentUser(username);

            List<DomainExtDto> listDomains = domainService.getListDomains(queryDto).stream().map(dto -> DomainExtDto.buildBy(dto)).toList();
            domainExtServiceImpl.fillDomainExtDto(listDomains);
            Object listDomains1 = listDomains;
            toExportDomains = domainService.convertDomainSomePropertiesIdToName((List<DomainDto>) listDomains1);
            if(!CollectionUtils.isEmpty(toExportDomains)) {
                int pathSize = toExportDomains.stream().mapToInt(dto -> dto.getPath() == null ? 0 : dto.getPath().size())
                        .max()
                        .orElse(0);
                if(categoryId > 6L) {
                    pathInfo = getDynamicPath(pathSize);
                } else {
                    pathInfo = getDynamicPath(pathSize - 1);
                }
            }
        }

        List<String> symbolInfo = msgService.getMessageObj("BasicDomain.symbolInfo", false);
        List<String> defineInfo = msgService.getMessageObj("BasicDomain.defineInfo", false);
        List<String> relaInfo = msgService.getMessageObj("BasicDomain.relaInfo", false);
        List<String> expressInfo = msgService.getMessageObj("BasicDomain.expressInfo", false);
        List<String> newManageInfo = msgService.getMessageObj("BasicDomain.newManageInfo", false);
//        if(queryDto != null){
//        }else {
//            managerInfo = Arrays.asList("业务定义部门", "技术部门");
//        }
        List<String> additionInfo = msgService.getMessageObj("BasicDomain.additionInfo", false);
        List<String> mustList = msgService.getMessageObj("BasicDomain.mustList", false);
        List<String> notImportList = msgService.getMessageObj("BasicDomain.notImportList", false);

        List<DomainUdpDto> domainUdps = domainService.getDomainUdps(categoryId);
        Map<String, List<String>> udpMap = new HashMap<>();
        Map<String, Long> udpKeyMap = new HashMap<>();

        if(domainUdps != null && !domainUdps.isEmpty()){
            domainUdps.stream().forEach(udp -> {
                if(queryDto != null){
                    udpKeyMap.put(udp.getName(), udp.getUdpId());
                }
                if(!udpMap.containsKey(udp.getCatalog())){
                    udpMap.put(udp.getCatalog(), new ArrayList<>());
                }
                udpMap.get(udp.getCatalog()).add(udp.getName());
                if(udp.isRequired()) mustList.add(udp.getName());
            });
        }

        ZipSecureFile.setMinInflateRatio(0.005);
        File file = new File(DatablauUtility.getResourcePath("/domain/domain_template.xlsx"));
        FileInputStream inputStream = new FileInputStream(file);
        OPCPackage pkg = OPCPackage.open(inputStream);

        XSSFWorkbook workbook = (XSSFWorkbook) WorkbookFactory.create(file);
        workbook.removeSheetAt(0);
        XSSFSheet sheet = null;
        if(categoryId>4){
            sheet = workbook.createSheet(msgService.getMessage("BasicDomain.sheet.domainStandard"));
            workbook.setSheetOrder(msgService.getMessage("BasicDomain.sheet.domainStandard"), 0);
        }else {
            sheet = workbook.createSheet(msgService.getMessage("BasicDomain.sheet.basicStandard"));
            workbook.setSheetOrder(msgService.getMessage("BasicDomain.sheet.basicStandard"), 0);
        }

        sheet.setDefaultRowHeight((short) (1.5*256));

        int symbolUdpSize = udpMap.get(msgService.getMessage("BasicDomain.udp.symbolProp")) == null? 0:udpMap.get(msgService.getMessage("BasicDomain.udp.symbolProp")).size();
        int defineUdpSize = udpMap.get(msgService.getMessage("BasicDomain.udp.defineProp")) == null? 0:udpMap.get(msgService.getMessage("BasicDomain.udp.defineProp")).size();
        int relaUdpSize = udpMap.get(msgService.getMessage("BasicDomain.udp.relaProp")) == null? 0:udpMap.get(msgService.getMessage("BasicDomain.udp.relaProp")).size();
        int expressUdpSize = udpMap.get(msgService.getMessage("BasicDomain.udp.expressProp")) == null? 0:udpMap.get(msgService.getMessage("BasicDomain.udp.expressProp")).size();
        int newManageUdpSize = udpMap.get(msgService.getMessage("BasicDomain.udp.newManageProp")) == null? 0:udpMap.get(msgService.getMessage("BasicDomain.udp.newManageProp")).size();
        int addiUdpSize = udpMap.get(msgService.getMessage("BasicDomain.udp.additionProp")) == null? 0:udpMap.get(msgService.getMessage("BasicDomain.udp.additionProp")).size();

        int newManageSize = newManageInfo.size() +  newManageUdpSize + pathInfo.size();
        int symbolSize = symbolInfo.size() +  symbolUdpSize;
        int defineSize = defineInfo.size() +  defineUdpSize;
        int relaSize = relaInfo.size() +  relaUdpSize;
        int expressSize = expressInfo.size() +  expressUdpSize;
        int addiSize = additionInfo.size() +  addiUdpSize;
        //表头处理
        sheet.addMergedRegion(new CellRangeAddress(0,0, 0, symbolSize-1));//0-1-2-3
        sheet.addMergedRegion(new CellRangeAddress(0,0, symbolSize, symbolSize+defineSize-1));//4-5
        sheet.addMergedRegion(new CellRangeAddress(0,0, symbolSize+defineSize, symbolSize+defineSize+relaSize-1));//6-7
        sheet.addMergedRegion(new CellRangeAddress(0,0, symbolSize+defineSize+relaSize, symbolSize+defineSize+relaSize+expressSize-1));//8-15
        sheet.addMergedRegion(new CellRangeAddress(0,0, symbolSize+defineSize+relaSize+expressSize, symbolSize+defineSize+relaSize+expressSize+newManageSize-1));//16
        sheet.addMergedRegion(new CellRangeAddress(0,0, symbolSize+defineSize+relaSize+expressSize+newManageSize, symbolSize+defineSize+relaSize+expressSize+newManageSize+addiSize-1));
        //title行
        XSSFRow row = sheet.createRow(0);
        row.setHeight((short) (2*256));
        XSSFCell cell = row.createCell(0);
        cell.setCellValue(headRow[0]);
        cell.setCellStyle(getColumnTopStyle(workbook, new Color(253, 255, 231)));
        XSSFCell cell1 = row.createCell(symbolSize);
        cell1.setCellValue(headRow[1]);
        cell1.setCellStyle(getColumnTopStyle(workbook, new Color(253, 255, 152)));
        XSSFCell cell2 = row.createCell(symbolSize+defineSize);
        cell2.setCellValue(headRow[2]);
        cell2.setCellStyle(getColumnTopStyle(workbook, new Color(253, 255, 231)));
        XSSFCell cell3 = row.createCell(symbolSize+defineSize+relaSize);
        cell3.setCellValue(headRow[3]);
        cell3.setCellStyle(getColumnTopStyle(workbook, new Color(253, 255, 152)));
        XSSFCell cell4 = row.createCell(symbolSize+defineSize+relaSize+expressSize);
        cell4.setCellValue(headRow[4]);
        cell4.setCellStyle(getColumnTopStyle(workbook, new Color(253, 255, 231)));
        XSSFCell cell5 = row.createCell(symbolSize+defineSize+relaSize+expressSize+newManageSize);
        cell5.setCellValue(headRow[5]);
        cell5.setCellStyle(getColumnTopStyle(workbook, new Color(253, 255, 152)));

        XSSFRow row1 = sheet.createRow(1);
        row1.setHeight((short)(3*256));
        //必填属性样式
        XSSFCellStyle mustStyle = getCellStyle(workbook, new Color(192, 0, 0));
        //选填属性样式
        XSSFCellStyle nullableStyle = getCellStyle(workbook, new Color(102, 102, 153));
        //导入时不填的字段样式
        XSSFCellStyle notImportStyle = getCellStyle(workbook, new Color(128,128,128));
        XSSFCell cellTemp = null;

        sheet.createFreezePane(0, 2);

        Function<Object[], Integer> appendTitle = (args) -> {
            List<String> titles = (List<String>) args[0];
            List<String> updTitles = (List<String>) args[1];
            Integer rowIdx = (Integer) args[2];
            Sheet _sheet = (Sheet) args[3];
            XSSFRow _row = (XSSFRow) args[4];
            List<String> _pathInfo = null;
            if(args.length > 5 && args[5] != null) {
                _pathInfo = (List<String>) args[5];
            }
            Cell _cell;
            if(_pathInfo != null) {
                for (int i = 0; i < _pathInfo.size(); i++) {
                    _sheet.setColumnWidth(rowIdx, 15*256);
                    _cell = _row.createCell(rowIdx);
                    String path = _pathInfo.get(i);
                    if(mustList.contains(path)){
                        _cell.setCellStyle(mustStyle);
                    } else if (notImportList.contains(path)) {
                        _cell.setCellStyle(notImportStyle);
                    } else {
                        _cell.setCellStyle(nullableStyle);
                    }
                    _cell.setCellValue(path);
                    rowIdx++;
                }
            }
            for(int i = 0; i < titles.size(); i ++){
                _sheet.setColumnWidth(rowIdx, 15*256);
                _cell = _row.createCell(rowIdx);
                String title = titles.get(i);
                if(mustList.contains(title)){
                    _cell.setCellStyle(mustStyle);
                } else if (notImportList.contains(title)) {
                    _cell.setCellStyle(notImportStyle);
                } else {
                    _cell.setCellStyle(nullableStyle);
                }
                _cell.setCellValue(title);
                rowIdx++;
            }
            for (int i = 0; i < updTitles.size(); i++) {
                _sheet.setColumnWidth(rowIdx, 15*256);
                _cell = _row.createCell(rowIdx);
                String title = updTitles.get(i);
                if(mustList.contains(title)){
                    _cell.setCellStyle(mustStyle);
                } else {
                    _cell.setCellStyle(nullableStyle);
                }
                _cell.setCellValue(title);
                rowIdx++;
            }
            return rowIdx;
        };
        int rowIdx = 0;
        int _rowIdx = appendTitle.apply(new Object[]{symbolInfo, udpMap.getOrDefault(msgService.getMessage("BasicDomain.udp.symbolProp"), Arrays.asList()), rowIdx, sheet, row1});
        _rowIdx = appendTitle.apply(new Object[]{defineInfo, udpMap.getOrDefault(msgService.getMessage("BasicDomain.udp.defineProp"), Arrays.asList()), _rowIdx, sheet, row1});
        _rowIdx = appendTitle.apply(new Object[]{relaInfo, udpMap.getOrDefault(msgService.getMessage("BasicDomain.udp.relaProp"), Arrays.asList()), _rowIdx, sheet, row1});
        _rowIdx = appendTitle.apply(new Object[]{expressInfo, udpMap.getOrDefault(msgService.getMessage("BasicDomain.udp.expressProp"), Arrays.asList()), _rowIdx, sheet, row1});
        _rowIdx = appendTitle.apply(new Object[]{newManageInfo, udpMap.getOrDefault(msgService.getMessage("BasicDomain.udp.newManageProp"), Arrays.asList()), _rowIdx, sheet, row1, pathInfo});
        _rowIdx = appendTitle.apply(new Object[]{additionInfo, udpMap.getOrDefault(msgService.getMessage("BasicDomain.udp.additionProp"), Arrays.asList()), _rowIdx, sheet, row1});

        if(queryDto == null){
            //如果是导出模板，则这块加样例数据。他妈的傻逼
            List<DomainExtDto> sampleDatas = this.generateDomainTemplateSampleData();
            //写到导出模板
            this.writeTemplateExcel(sampleDatas, sheet, udpMap, pathInfo);
        }

        //填充数据
        if(queryDto != null){
            List<String> symbolProp = Arrays.asList("domainCode", "chineseName", "englishName", "synonym");
            List<String> defineProp = Arrays.asList("description", "businessRule");
            List<String> relaProp = Arrays.asList("referenceTerm", "relationDomain");
            List<String> expressProp = Arrays.asList("dataType", "unit", "dataScale", "dataPrecision", "referenceCode", "dataFormat", "minValue", "maxValue");
//            List<String> newManageProp = Arrays.asList("authCategoryName");
//            List<String> additionProp = Arrays.asList("abbreviation", "source", "firstPublish", "state");
            List<String> newManageProp = Arrays.asList("source");
            List<String> additionProp = Arrays.asList("firstPublish", "state");

            Map<String, String> businessTermCacheMap = new HashMap<>();
            Map<String, String> domainCacheMap = new HashMap<>();
            Map<String, String> standardCodeCacheMap = new HashMap<>();
            Function<Object[], Integer> appendRowData = (args) -> {
                List<String> props = (List<String>) args[0];
                List<String> udpProps = (List<String>) args[1];
                Integer _dataRowIdx = (Integer) args[2];
                DomainDto domainDto = (DomainDto) args[3];
                Map<Long, String> udpValue = Optional.ofNullable(domainDto.getAdditionalProperties()).orElse(new HashMap<>());
                XSSFRow _row = (XSSFRow) args[4];

                Cell _cell;
                if(args.length > 5 && args[5] != null) {
                    List<String> _pathInfo = (List<String>) args[5];
                    List<String> _paths = domainDto.getPath();
                    for (int i = 0; i < _pathInfo.size(); i++) {
                        _cell = _row.createCell(_dataRowIdx);
                        if(!CollectionUtils.isEmpty(_paths) && _paths.size() > i + 1) {
                            _cell.setCellValue(_paths.get(i + 1));
                        }
                        _dataRowIdx++;
                    }
                }
                for(int i = 0; i < props.size(); i++){
                    _cell = _row.createCell(_dataRowIdx);

                    String prop = props.get(i);
                    Field field = getDeclaredFieldWithSuper(DomainExtDto.class, prop);
                    field.setAccessible(true);
                    Object oval; // 要填充的属性值！！
                    try {
                        oval = field.get(domainDto);
                    } catch (IllegalAccessException e) {
                        throw new RuntimeException(e);
                    }
                    oval = Optional.ofNullable(oval).orElse("");
                    if("referenceTerm".equals(prop) && StringUtils.isNotBlank(oval.toString())) {
                        Collection<String> referenceTermCodes = Arrays.stream(oval.toString().split(",")).collect(Collectors.toSet());
                        if(businessTermCacheMap.keySet().containsAll(referenceTermCodes)) {
                            oval = referenceTermCodes.stream()
                                    .map(v -> businessTermCacheMap.get(v)).collect(Collectors.joining(","));
                        } else {
                            List<BusinessTerm> businessTerms = businessTermRepo.findAllByDomainCodeIn(referenceTermCodes);
                            if(!CollectionUtils.isEmpty(businessTerms)) {
                                oval = businessTerms.stream().map(v -> v.getChName()).collect(Collectors.joining(","));
                                businessTermCacheMap.putAll(
                                        businessTerms.stream().collect(Collectors.toMap(k -> k.getDomainCode(), v -> v.getChName(), (k1, k2) -> k1))
                                );
                            }
                        }
                    } else if ("relationDomain".equals(prop) && StringUtils.isNotBlank(oval.toString())) {
                        List<String> domainCodes = Arrays.stream(oval.toString().split(",")).collect(Collectors.toList());
                        if(domainCacheMap.keySet().containsAll(domainCodes)) {
                            oval = domainCodes.stream()
                                    .map(v -> domainCacheMap.get(v)).collect(Collectors.joining(","));
                        } else {
                            List<Domain> domains = domainRepo.findDomainByDomainCodes(domainCodes);
                            if(!CollectionUtils.isEmpty(domains)) {
                                oval = domains.stream().map(v -> v.getChineseName()).collect(Collectors.joining(","));
                                domainCacheMap.putAll(
                                        domains.stream().collect(Collectors.toMap(k -> k.getDomainCode(), v -> v.getChineseName(), (k1, k2) -> k1))
                                );
                            }
                        }
                    } else if ("referenceCode".equals(prop) && StringUtils.isNotBlank(oval.toString())) {
                        List<String> codes = Arrays.stream(oval.toString().split(",")).collect(Collectors.toList());
                        if(standardCodeCacheMap.keySet().containsAll(codes)) {
                            oval = codes.stream()
                                    .map(v -> standardCodeCacheMap.get(v)).collect(Collectors.joining(","));
                        } else {
                            List<StandardCode> standardCodes = standardCodeRepo.findByCodeIn(codes);
                            if(!CollectionUtils.isEmpty(standardCodes)) {
                                oval = standardCodes.stream().map(v -> v.getName()).collect(Collectors.joining(","));
                                standardCodeCacheMap.putAll(
                                        standardCodes.stream().collect(Collectors.toMap(k -> k.getCode(), v -> v.getName(), (k1, k2) -> k1))
                                );
                            }
                        }
                    }

                    if(oval != null){
                        if(oval instanceof Collection){
                            Collection<String> val = (Collection)oval;
                            _cell.setCellValue(StringUtils.join(val.toArray(), "/"));
                        } else if(oval instanceof Date){
                            Date val = (Date) oval;
                            _cell.setCellValue(new SimpleDateFormat("yyyy-MM-dd").format(val));
                        } else if(oval instanceof DomainState){
                            DomainState val = (DomainState) oval;
                            if (val.equals(DomainState.D)) {
                                _cell.setCellValue(msgService.getMessage("BasicDomain.state.audit"));
                            } else if (val.equals(DomainState.C)) {
                                _cell.setCellValue(msgService.getMessage("BasicDomain.state.inAudit"));
                            } else if (val.equals(DomainState.A)) {
                                _cell.setCellValue(msgService.getMessage("BasicDomain.state.published"));
                            } else {
                                _cell.setCellValue(msgService.getMessage("BasicDomain.state.abandon"));
                            }
                        } else {
                            _cell.setCellValue(oval instanceof String? (String) oval: oval + "");
                        }
                    }

                    _dataRowIdx++;
                }
                for (int i = 0; i < udpProps.size(); i++) {
                    _cell = _row.createCell(_dataRowIdx);
                    String udpName = udpProps.get(i);
                    Long udpId = udpKeyMap.get(udpName);
                    if(udpValue.containsKey(udpId)){
                        _cell.setCellValue(udpValue.get(udpId));
                    }
                    _dataRowIdx++;
                }
                return _dataRowIdx;
            };

            // 将domain的属性写入excel
            int rowIndex = 2;
            XSSFRow dataRow = null;
            for (DomainDto domainDto : toExportDomains) {
                dataRow = sheet.createRow(rowIndex++);
                rowIdx = 0;
                rowIdx = appendRowData.apply(new Object[]{
                        symbolProp,
                        udpMap.getOrDefault(msgService.getMessage("BasicDomain.udp.symbolProp"), Arrays.asList()),
                        rowIdx,
                        domainDto,
                        dataRow
                });
                rowIdx = appendRowData.apply(new Object[]{
                        defineProp,
                        udpMap.getOrDefault(msgService.getMessage("BasicDomain.udp.defineProp"), Arrays.asList()),
                        rowIdx,
                        domainDto,
                        dataRow
                });
                rowIdx = appendRowData.apply(new Object[]{
                        relaProp,
                        udpMap.getOrDefault(msgService.getMessage("BasicDomain.udp.relaProp"), Arrays.asList()),
                        rowIdx,
                        domainDto,
                        dataRow
                });
                rowIdx = appendRowData.apply(new Object[]{
                        expressProp,
                        udpMap.getOrDefault(msgService.getMessage("BasicDomain.udp.expressProp"), Arrays.asList()),
                        rowIdx,
                        domainDto,
                        dataRow
                });
                rowIdx = appendRowData.apply(new Object[]{
                        newManageProp,
                        udpMap.getOrDefault(msgService.getMessage("BasicDomain.udp.newManageProp"), Arrays.asList()),
                        rowIdx,
                        domainDto,
                        dataRow,
                        pathInfo
                });
                rowIdx = appendRowData.apply(new Object[]{
                        additionProp,
                        udpMap.getOrDefault(msgService.getMessage("BasicDomain.udp.additionProp"), Arrays.asList()),
                        rowIdx,
                        domainDto,
                        dataRow
                });
            }
        }


        File file1 = null;
        if(queryDto == null){
            if(categoryId>4){
                file1 = new File(getFilePath("领域数据标准模板.xlsx"));
            }else{
                file1 = new File(getFilePath("标准数据元模板.xlsx"));
            }
        }else {
            if(categoryId>4){
                file1 = new File(getFilePath("领域数据标准.xlsx"));
            }else{
                file1 = new File(getFilePath("标准数据元.xlsx"));
            }

        }
        try (FileOutputStream out = new FileOutputStream(file1)) {
            workbook.write(out);
        } catch (FileNotFoundException e) {
            logger.warn(e.getMessage(), e);
        } catch (IOException e) {
            logger.warn(e.getMessage(), e);
        } finally {
            try {
                workbook.close();
                pkg.close();
                inputStream.close();
            } catch (IOException e) {
                logger.warn(e.getMessage(), e);
            }
        }
        return new DomainExportResult(file1, toExportDomains == null ? 0 : toExportDomains.size());
    }

    private void writeTemplateExcel(List<DomainExtDto> sampleDatas, XSSFSheet sheet, Map<String, List<String>> udpMap, List<String> pathInfo) {
        List<String> symbolProp = Arrays.asList("domainCode", "chineseName", "englishName", "synonym");
        List<String> defineProp = Arrays.asList("description", "businessRule");
        List<String> relaProp = Arrays.asList("referenceTerm", "relationDomain");
        List<String> expressProp = Arrays.asList("dataType", "unit", "dataScale", "dataPrecision", "referenceCode", "dataFormat", "minValue", "maxValue");
//            List<String> newManageProp = Arrays.asList("authCategoryName");
//            List<String> additionProp = Arrays.asList("abbreviation", "source", "firstPublish", "state");
        List<String> newManageProp = Arrays.asList("source");
        List<String> additionProp = Arrays.asList("firstPublish", "state");

        Function<Object[], Integer> appendRowData = (args) -> {
            List<String> props = (List<String>) args[0];
            List<String> udpProps = (List<String>) args[1];
            Integer _dataRowIdx = (Integer) args[2];
            DomainDto domainDto = (DomainDto) args[3];
            Map<Long, String> udpValue = Optional.ofNullable(domainDto.getAdditionalProperties()).orElse(new HashMap<>());
            XSSFRow _row = (XSSFRow) args[4];

            Cell _cell;
            if(args.length > 5 && args[5] != null) {
                List<String> _pathInfo = (List<String>) args[5];
                List<String> _paths = domainDto.getPath();
                for (int i = 0; i < _pathInfo.size(); i++) {
                    _cell = _row.createCell(_dataRowIdx);
                    if(!CollectionUtils.isEmpty(_paths) && _paths.size() > i + 1) {
                        _cell.setCellValue(_paths.get(i + 1));
                    }
                    _dataRowIdx++;
                }
            }
            for(int i = 0; i < props.size(); i++){
                _cell = _row.createCell(_dataRowIdx);

                String prop = props.get(i);
                Field field = getDeclaredFieldWithSuper(DomainExtDto.class, prop);
                field.setAccessible(true);
                Object oval; // 要填充的属性值！！
                try {
                    oval = field.get(domainDto);
                } catch (IllegalAccessException e) {
                    throw new RuntimeException(e);
                }
                oval = Optional.ofNullable(oval).orElse("");
                if(oval != null){
                    if(oval instanceof Collection){
                        Collection<String> val = (Collection)oval;
                        _cell.setCellValue(StringUtils.join(val.toArray(), "/"));
                    } else if(oval instanceof Date){
                        Date val = (Date) oval;
                        _cell.setCellValue(new SimpleDateFormat("yyyy-MM-dd").format(val));
                    } else if(oval instanceof DomainState){
                        DomainState val = (DomainState) oval;
                        if (val.equals(DomainState.D)) {
                            _cell.setCellValue(msgService.getMessage("BasicDomain.state.audit"));
                        } else if (val.equals(DomainState.C)) {
                            _cell.setCellValue(msgService.getMessage("BasicDomain.state.inAudit"));
                        } else if (val.equals(DomainState.A)) {
                            _cell.setCellValue(msgService.getMessage("BasicDomain.state.published"));
                        } else {
                            _cell.setCellValue(msgService.getMessage("BasicDomain.state.abandon"));
                        }
                    } else {
                        _cell.setCellValue(oval instanceof String? (String) oval: oval + "");
                    }
                }

                _dataRowIdx++;
            }

            return _dataRowIdx;
        };

        int rowIdx = 0;
        // 将domain的属性写入excel
        int rowIndex = 2;
        XSSFRow dataRow = null;
        for (DomainDto domainDto : sampleDatas) {
            dataRow = sheet.createRow(rowIndex++);
            rowIdx = 0;
            rowIdx = appendRowData.apply(new Object[]{
                    symbolProp,
                    udpMap.getOrDefault(msgService.getMessage("BasicDomain.udp.symbolProp"), Arrays.asList()),
                    rowIdx,
                    domainDto,
                    dataRow
            });
            rowIdx = appendRowData.apply(new Object[]{
                    defineProp,
                    udpMap.getOrDefault(msgService.getMessage("BasicDomain.udp.defineProp"), Arrays.asList()),
                    rowIdx,
                    domainDto,
                    dataRow
            });
            rowIdx = appendRowData.apply(new Object[]{
                    relaProp,
                    udpMap.getOrDefault(msgService.getMessage("BasicDomain.udp.relaProp"), Arrays.asList()),
                    rowIdx,
                    domainDto,
                    dataRow
            });
            rowIdx = appendRowData.apply(new Object[]{
                    expressProp,
                    udpMap.getOrDefault(msgService.getMessage("BasicDomain.udp.expressProp"), Arrays.asList()),
                    rowIdx,
                    domainDto,
                    dataRow
            });
            rowIdx = appendRowData.apply(new Object[]{
                    newManageProp,
                    udpMap.getOrDefault(msgService.getMessage("BasicDomain.udp.newManageProp"), Arrays.asList()),
                    rowIdx,
                    domainDto,
                    dataRow,
                    pathInfo
            });
            rowIdx = appendRowData.apply(new Object[]{
                    additionProp,
                    udpMap.getOrDefault(msgService.getMessage("BasicDomain.udp.additionProp"), Arrays.asList()),
                    rowIdx,
                    domainDto,
                    dataRow
            });
        }
    }

    private List<DomainExtDto> generateDomainTemplateSampleData() {
        List<DomainExtDto> sampleDataDomains = new ArrayList<>();
        sampleDataDomains.add(sampleDataDomain("DS-01-501010", "可研批复文件", "May Study The Approval Document", "", "可研批复文件", "字符型", 500));
        sampleDataDomains.add(sampleDataDomain("DS-01-501016", "建立时间", "Setup Time", "", "建立时间", "字符型", 20));
        sampleDataDomains.add(sampleDataDomain("DS-01-501017", "有效标记", "Valid Marking", "", "有效标记", "字符型", 1));
        return sampleDataDomains;
    }

    private DomainExtDto sampleDataDomain(String code, String chName, String enName, String synonym, String description,
                                       String dataType, Integer datascale){
        DomainExtDto dto = new DomainExtDto();
        dto.setDomainCode(code);
        dto.setChineseName(chName);
        dto.setEnglishName(enName);
        dto.setSynonym(synonym);
        dto.setDescription(description);
        dto.setDataType(dataType);
        dto.setDataScale(datascale);
        return dto;
    }

    private Field getDeclaredFieldWithSuper(Class<?> aClass, String fieldName) {
        Field field = null;
        try {
            field = aClass.getDeclaredField(fieldName);
        } catch (NoSuchFieldException e) {
            try {
                field = aClass.getSuperclass().getDeclaredField(fieldName);
            } catch (NoSuchFieldException ex) {
                throw new RuntimeException(ex);
            }
        }
        return field;
    }

    public List<String> getDynamicPath(int maxSize) {
        if (maxSize <= 0) {
            throw new IllegalArgumentException(this.msgService.getMessage("pathCannotBeNull"));
        } else {
            List<String> pathLists = new ArrayList();

            for(int i = 0; i < maxSize; ++i) {
                if(i == 0) {
                    pathLists.add("业务域");
                } else {
                    pathLists.add(this.msgService.getMessage("BasicDomain.path.level", new Object[]{this.CN_NUMBERS[i]}));
                }
            }

            return pathLists;
        }
    }
}
