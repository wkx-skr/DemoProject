package com.datablau.metadata.main.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.core.annotation.EndpointDoc;
import com.andorj.common.core.exception.AndorjRuntimeException;
import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.common.core.exception.ItemNotFoundException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.core.model.LDMTypes;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.api.MessageService;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.base.api.ObjectVisitService;
import com.datablau.data.common.api.OperationLogService;
import com.datablau.data.common.api.instantjob.InstantJob;
import com.datablau.data.common.api.instantjob.InstantJobProgressMonitor;
import com.datablau.data.common.api.instantjob.InstantJobService;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.data.DataBlauHttpServletRequest;
import com.datablau.data.common.data.FileDescriptor;
import com.datablau.data.common.data.instantjob.ImportInstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobResult;
import com.datablau.data.common.data.instantjob.InstantJobStage;
import com.datablau.data.common.operation.type.OperationLogType;
import com.datablau.data.common.operation.type.OperationModuleType;
import com.datablau.data.common.util.ExcelUtil;
import com.datablau.metadata.common.dto.report.DataReportDto;
import com.datablau.metadata.main.dto.report.BIReportServerDto;
import com.datablau.metadata.main.dto.report.DataReportTreeNodeDto;
import com.datablau.metadata.main.dto.report.bi.ResResultDto;
import com.datablau.metadata.main.entity.report.DataReport;
import com.datablau.metadata.main.entity.report.DataReportResourceStatistics;
import com.datablau.metadata.main.service.report.api.DataReportService;
import com.datablau.metadata.main.service.report.bi.base.api.BIReportImportService;
import com.datablau.metadata.main.service.report.dto.DataReportExportResult;
import com.datablau.metadata.main.service.report.dto.DataReportParamDto;
import com.datablau.metadata.main.service.report.dto.DataReportQueryDto;
import com.datablau.metadata.main.service.report.dto.ReportExcelErrorDto;
import com.datablau.metadata.main.type.ReportImportDealType;
import com.datablau.metadata.main.util.DataUtility;
import com.datablau.metadata.main.util.FileUtility;
import com.datablau.metadata.main.util.ServerConstants;
import com.datablau.security.management.api.RoleService;
import com.datablau.security.management.api.UserService;
import com.datablau.security.management.utils.AuthTools;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.Serializable;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;


/**
 * @author senyan
 */
@RestController
@RequestMapping("/dataReport")
@Tag(name = "报表REST", description = "报表REST API")
public class DataReportController extends BaseController {

    private static final Logger log = LoggerFactory.getLogger(DataReportController.class);

    @Autowired
    private DataReportService dataReportService;

    @Autowired
    private BIReportImportService biReportImportService;

    @Autowired
    private MessageService msgService;

    @Autowired
    private ObjectVisitService objectVisitService;

    @Autowired
    private InstantJobService instantJobService;

    @Autowired
    private UserService userService;
    @Autowired
    private FileUtility fileUtility;
    @Autowired
    private OperationLogService operationLogService;

    SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd HH:mm:ss");

    //todo 7.0 job
//    @Autowired
//    private DatablauJobService jobService;

    public DataReportController(@Autowired RoleService roleService) {
        super(ServerConstants.SERVER_TYPE, roleService);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/")
    //@PreAuthorize(UserRights.METADATA_TABALE_VIEW)
    @Operation(summary = "获取报表列表", description = "获取报表列表数据")
    @Description("获取报表列表")
    public List<DataReportDto> loadSimpleDataReports() throws Exception {
        return dataReportService.loadSimpleDataReports();
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "dam_data_report",
//            systemModule = OperationModuleType.METADATA_REPORT,
//            description = "查询报表列表"
//    )
    @RequestMapping(method = RequestMethod.GET, value = "/tree")
    @Operation(summary = "获取所有目录节点的报表", description = "获取所有目录节点的报表")
    @Description("获取所有目录节点的报表")
    public DataReportTreeNodeDto loadSimpleDataReportsTree() throws Exception {
        return dataReportService.loadDataReportTree();
    }

    @RequestMapping(method = RequestMethod.GET, value = "/folder/tree")
    @Operation(summary = "获取所有报表的目录节点", description = "获取所有报表的目录节点")
    @Description("获取所有报表的目录节点")
    public DataReportTreeNodeDto getFolderTree() throws Exception {
        return dataReportService.loadFolderTree();
    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_QUERY,
//            operateTable = "dam_data_report",
//            systemModule = OperationModuleType.METADATA_REPORT,
//            description = "查询报表详情，id为: {param}",
//            descriptionParamClass = Long.class,
//            descriptionParamMethod = "toString"
//    )
    @RequestMapping(method = RequestMethod.GET, value = "/{dataReportId}")
    @Operation(summary = "根据报表ID查询报表信息", description = "根据报表ID查询报表信息")
    @Description("根据报表ID查询报表信息")
    @Parameter(name = "dataReportId", description = "报表ID", in = ParameterIn.PATH, required = true)
    public DataReportDto loadDataReportDetail(@PathVariable("dataReportId") Long dataReportId) throws Exception {
        DataReportDto dataReportDto = dataReportService.loadDataReportDetail(dataReportId, true);
        if (dataReportDto == null) {
            return null;
        }
        objectVisitService.asyncIncrementVisitCount(dataReportDto.getId().toString(),
                LDMTypes.oDataReport, AuthTools.currentUsernameFailFast());
        dataReportDto.setVisitCount(dataReportDto.getVisitCount() + 1L);

        //增加日志
//        addDataReportCommonLog(msgService.getMessage("metadata.report.log.query", dataReportDto.getName()),
//                OperationLogType.TABLE_QUERY);

        return dataReportDto;
    }

    protected void addDataReportCommonLog(String logMessage, OperationLogType logType) {
        try {
            operationLogService.generateOperationLog(OperationModuleType.METADATA_REPORT, "dam_data_report",
                    logType, logMessage, AuthTools.currentUsername(), 0);
        } catch (Exception e) {
            log.error(e.getMessage());
        }
    }


//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "dam_data_report",
//            systemModule = OperationModuleType.METADATA_REPORT,
//            description = {"新增报表名为:","1","name"}
//    )
//    @RequestMapping(value = "/", method = RequestMethod.POST)
//    public void createDataReport(@RequestBody DataReport dr) throws Exception {
//        if(dr.getId() != null){
//            throw new InvalidArgumentException(msgService.getMessage("IdMustBeEmpty"));
//        }
//
//        dataReportService.addDataReport(dr);
//    }

//    @OperatorLog(
//            operation = OperationLogType.TABLE_ADD,
//            operateTable = "dam_data_report",
//            systemModule = OperationModuleType.METADATA_REPORT,
//            description = "新增报表名为: {param}",
//            descriptionParamClass = DataReportParamDto.class,
//            descriptionParamMethod = "getName"
//    )
    @RequestMapping(value = "/", method = RequestMethod.POST)
    @Operation(summary = "创建报表", description = "创建报表")
    @Description("创建报表")
    public void createDataReport(@Parameter(name = "dr", description = "报表info", required = true)
                                 @Description("报表info") @RequestBody DataReportParamDto dr) throws Exception {
        if (dr.getId() != null) {
            throw new InvalidArgumentException(msgService.getMessage("IdMustBeEmpty"));
        }

        dataReportService.addDataReport(dr);

        //增加日志
        addDataReportCommonLog(msgService.getMessage("metadata.report.log.add", dr.getName()),
                OperationLogType.TABLE_ADD);
    }

    //    @RequestMapping(value = "/test")
//    public void createDataReportTest() throws Exception {
//        DataReport dr = new DataReport();
//        dr.setName("drtest");
//        dr.setType(DataReport.DataReportType.Report);
//        dr.setOwner("test");
//
//        Set<DataReportConditionArea> conditionArea = new HashSet<>();
//        DataReportConditionArea drca = new DataReportConditionArea();
//        drca.setCode("DRCA0001");
//        drca.setLabel("ColumnName");
//        drca.setDescription("test");
//        //drca.setDataReport(dr);
//
//        conditionArea.add(drca);
//
//        dr.setConditionArea(conditionArea);
//
//        dataReportService.addDataReport(dr);
//    }
//
//    @RequestMapping(value = "/updatetest")
//    public boolean updateDataReportTest() throws Exception {
//        DataReport dr = dataReportService.loadDataReport(4L);
//        //dr.setName("drtest2");
//        //dr.setType(DataReport.DataReportType.Report);
//        //dr.setOwner("test");
//
//        Set<DataReportConditionArea> conditionArea = new HashSet<>();
//
//        DataReportConditionArea drcax = new DataReportConditionArea();
//        drcax.setCode("DRCA0002");
//        drcax.setLabel("C2");
//        drcax.setDescription("test2");
//        //drcax.setDataReport(dr);
//        conditionArea.add(drcax);
//
//        DataReportConditionArea drca = new DataReportConditionArea();
//        drca.setCode("DRCA0003");
//        drca.setLabel("ColumnName");
//        drca.setDescription("test");
//        //drca.setDataReport(dr);
//        conditionArea.add(drca);
//
//        dr.setConditionArea(conditionArea);
//
//
//        if (!dataReportService.updateDataReport(dr)) {
//            throw new ItemNotFoundException(msgService.getMessage("cannotFindItemToUpdate"));
//        }
//
//        return true;
//    }
//    @OperatorLog(
//            operation = OperationLogType.TABLE_MODIFY,
//            operateTable = "dam_data_report",
//            systemModule = OperationModuleType.METADATA_REPORT,
//            description = "修改报表为，名称为: {param}",
//            descriptionParamClass = DataReportParamDto.class,
//            descriptionParamMethod = "getName"
//    )
    @RequestMapping(value = "/update", method = RequestMethod.POST)
    @Operation(summary = "修改报表", description = "修改报表")
    @Description("修改报表")
    public boolean updateDataReport(
            @Parameter(name = "dr", description = "报表info", required = true)
            @Description("报表info")
            @RequestBody DataReportParamDto dr,
            @Parameter(name = "updateConditionArea", description = "是否修改条件区", required = true)
            @Description("是否修改条件区")
            @RequestParam(value = "updateConditionArea", defaultValue = "false") boolean updateConditionArea,
            @Parameter(name = "updateResultArea", description = "是否修改结果区", required = true)
            @Description("是否修改结果区")
            @RequestParam(value = "updateResultArea", defaultValue = "false") boolean updateResultArea,
            @Parameter(name = "updateRelatedTable", description = "是否修改关联报表", required = true)
            @Description("是否修改关联报表")
            @RequestParam(value = "updateRelatedTable", defaultValue = "false") boolean updateRelatedTable) throws Exception {
        if (!dataReportService.updateDataReport(dr, updateConditionArea, updateResultArea, updateRelatedTable)) {
            throw new ItemNotFoundException(msgService.getMessage("cannotFindItemToUpdate"));
        }

        //增加日志
        addDataReportModifyLog(dr);

        return true;
    }

    protected void addDataReportModifyLog(DataReportParamDto dr) {
        try {
            //普通属性日志
            String logMessage = msgService.getMessage("metadata.report.log.modify", dr.getName());
            operationLogService.generateOperationLog(OperationModuleType.METADATA_REPORT, "dam_data_report",
                    OperationLogType.TABLE_MODIFY, logMessage, AuthTools.currentUsername(), 0);

            //udp日志
            //if (!CollectionUtils.isEmpty(dr.getUdps())) {
            //    logMessage = msgService.getMessage("metadata.report.udp.log.modify", dr.getName());
            //    operationLogService.generateOperationLog(OperationModuleType.METADATA_REPORT, "db_udp_val",
            //            OperationLogType.TABLE_MODIFY, logMessage, AuthTools.currentUsername(), 0);
            //}
        } catch (Exception e) {
            log.error(e.getMessage());
        }
    }


    //    @OperatorLog(
//            operation = OperationLogType.TABLE_DELETE,
//            operateTable = "dam_data_report",
//            systemModule = OperationModuleType.METADATA_REPORT,
//            description = "删除报表，id为: {param}",
//            descriptionParamClass = ArrayList.class,
//            descriptionParamMethod = "toString"
//    )
    @Operation(summary = "删除报表", description = "删除报表")
    @Description("删除报表")
    @RequestMapping(value = "/delete", method = RequestMethod.POST)
    public void deleteDataReport(
            @Parameter(name = "ids", description = "报表id集合", required = true)
            @Description("报表id集合")
            @RequestBody List<String> ids) throws Exception {
        List<Long> reportIds = ids.stream().map(Long::parseLong).toList();
        List<DataReport> dataReports = dataReportService.getDataReportsByIds(reportIds);

        dataReportService.removeDataReports(ids);

        //增加日志
        for (DataReport dataReport : dataReports) {
            addDataReportCommonLog(msgService.getMessage("metadata.report.log.delete", dataReport.getName()),
                    OperationLogType.TABLE_DELETE);
        }
    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_IMPORT,
//            operateTable = "dam_data_report",
//            systemModule = OperationModuleType.METADATA_REPORT,
//            description = "导入报表"
//    )
    @RequestMapping(value = "/file", method = RequestMethod.POST)
    @Operation(summary = "导入报表", description = "导入报表")
    @Description("导入报表")
    public String uploadDataReportsExcel(
            @Parameter(name = "file", description = "文件", required = true)
            @Description("文件")
            @RequestParam("file") MultipartFile multipartFile,
            @Parameter(name = "dealType", description = "上传处理方式", required = true)
            @Description("上传处理方式")
            @RequestParam("dealType") ReportImportDealType dealType,
            @Parameter(name = "ignoreError", description = "忽略错误", required = true)
            @Description("忽略错误")
            @RequestParam("ignoreError") Boolean ignoreError, HttpServletRequest request) throws Exception {
        String fileName = multipartFile.getOriginalFilename();
        if (fileName == null) throw new UnexpectedStateException(GeneralUtility.getMessageService().getMessage("fileNameIsNull"));
        String type = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        if (!"xlsx".equals(type)) {
            throw new UnexpectedStateException(GeneralUtility.getMessageService().getMessage("fileNameOnlySupport"));
        }
        File uploadedFile = DataUtility.uploadFile(multipartFile);

        String username = AuthTools.currentUsernameFailFast();

        DataBlauHttpServletRequest dataBlauRequest = new DataBlauHttpServletRequest(request);

        String jobId = instantJobService.submitJob(new InstantJob<InstantJobResult>() {
            @Override
            public void setProgressMonitor(InstantJobProgressMonitor instantJobProgressMonitor) {

            }

            @Override
            public InstantJobResult call() throws Exception {
                try {
                    Set<GrantedAuthority> grantedAuthorities = userService.getUserFullAuthorities(username);
                    UsernamePasswordAuthenticationToken runAsAuthentication = new UsernamePasswordAuthenticationToken(username, "ignore it", grantedAuthorities);
                    SecurityContextHolder.setContext(SecurityContextHolder.createEmptyContext());
                    SecurityContextHolder.getContext().setAuthentication(runAsAuthentication);
                    ReportExcelErrorDto errorDto = new ReportExcelErrorDto();

                    dataReportService.loadDataReportsFromFile(uploadedFile, dealType, ignoreError, errorDto);

                    ImportInstantJobResult result = new ImportInstantJobResult();
                    result.setJobStatus(InstantJobStage.FINISHED);
                    result.setSuccess(errorDto.successCount());
                    result.setFailed(errorDto.errorCounts());

                    if(errorDto.hasErrorData()){
                        XSSFWorkbook wb = null;
                        //保存错误数据
                        try(InputStream is = new FileInputStream(uploadedFile)){
                            wb = new XSSFWorkbook(is);
                        }catch (Exception e){
                            throw new AndorjRuntimeException(e.getMessage(), e);
                        }

                        try(FileOutputStream fos = new FileOutputStream(uploadedFile, false)){
                            if(!errorDto.getReleaseMsg().isEmpty()){
                                ExcelUtil.fillingImportError(wb, 2, errorDto.getReleaseMsg(), true);
                            }else {
                                wb.removeSheetAt(2);
                            }

                            if(!errorDto.getItemMsg().isEmpty()){
                                ExcelUtil.fillingImportError(wb, 1, errorDto.getItemMsg(), true);
                            }else {
                                wb.removeSheetAt(1);
                            }

                            if(!errorDto.getBasicMsg().isEmpty()){
                                ExcelUtil.fillingImportError(wb, 0, errorDto.getBasicMsg(), true);
                            }else {
                                wb.removeSheetAt(0);
                            }
                            wb.write(fos);
                        }catch (Exception e){
                            log.warn(e.getMessage(), e);
                            throw new AndorjRuntimeException(e.getMessage(), e);
                        }finally {
                            if(wb != null){
                                try {
                                    wb.close();
                                }catch (Exception e){}
                            }
                        }
                        FileDescriptor fileDescriptor = fileUtility.uploadFile(uploadedFile, msgService.getMessage("errorExcelDataFileName"), AuthTools.currentUsernameFailFast(), false);
                        result.setFileId(fileDescriptor.getFileId());

                        if(!ignoreError){
                            result.setSuccess(0);
                            result.setFailed(errorDto.getTotalCounts());
                        }
                    }

                    //增加日志
                    addDataReportImportLog(result.getSuccess(), result.getFailed(), dataBlauRequest);

                    return result;
                } catch (Exception e) {
                    log.warn(e.getMessage(), e);
                    throw new AndorjRuntimeException(e.getMessage(), e);
                } finally {
                    SecurityContextHolder.clearContext();
                    uploadedFile.delete();
                }
            }
        }, msgService.getMessage("reportImportTask") + sdf.format(new Date()), username, "IMPORT");

        return jobId;
    }

    protected void addDataReportImportLog(Integer successNumber, Integer errorNumber, DataBlauHttpServletRequest request) {
        try {
            String logMessage = msgService.getMessage("metadata.report.log.import", successNumber, errorNumber);
            operationLogService.generateOperationLog(OperationModuleType.METADATA_REPORT, "dam_data_report",
                    OperationLogType.DATA_IMPORT, logMessage, AuthTools.currentUsername(), 0, request);
        } catch (Exception e) {
            log.error(e.getMessage());
        }
    }

//    @RequestMapping(value = "/file/test")
//    public Integer uploadDataReportsExcelTest()
//            throws Exception {
//        File uploadedFile = new File("D:\\嘉实\\数据应用.xlsx");
//        try {
//            return dataReportService.loadDataReportsFromFile(uploadedFile);
//        }
//        finally {
//            //uploadedFile.delete();
//        }
//    }

//    @OperatorLog(
//            operation = OperationLogType.DATA_EXPORT,
//            operateTable = "dam_data_report",
//            systemModule = OperationModuleType.METADATA_REPORT,
//            description = "导出数据报表模板"
//    )
    @RequestMapping("/file")
    @Operation(summary = "导出数据报表模板", description = "导出数据报表模板")
    @Description("导出数据报表模板")
    public ResponseEntity<InputStreamResource> downloadTemplateFile(HttpServletResponse response) throws FileNotFoundException, UnsupportedEncodingException {
        //File file = mappingService.createSimpleTemplateFile();
        File file = dataReportService.dowlnoadDataReportTemplateFile();
        InputStreamResource resource = new InputStreamResource(new FileInputStream(file));

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=" + URLEncoder.encode(file.getName(), "UTF-8"));
        headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
        headers.add("Pragma", "no-cache");
        headers.add("Expires", "0");

        return ResponseEntity.ok()
                .headers(headers)
                .contentLength(file.length())
                .body(resource);
    }

    protected void exportDataReportFile(File file, HttpServletResponse response, String downloadName) {
        if (file.exists()) {
            response.setContentType("application/octet-stream");
            String realName = downloadName;

            try {
                InputStream is = new FileInputStream(file);
                XSSFWorkbook workbook = new XSSFWorkbook(is);
                XSSFSheet sheet = workbook.getSheetAt(0);
                Row header = sheet.getRow(sheet.getFirstRowNum());
                XSSFRow second = sheet.getRow(sheet.getFirstRowNum() + 1);
                short lastCellNum = header.getLastCellNum();
                Cell cell1 = header.getCell(2);
                CellStyle cellStyle = cell1.getCellStyle();
                //获取udp集合
                //todo 7.0 udp
                Map<String, String> udpMap = new HashMap<>();
//                Map<String, String> udpMap = udpService.getUdpKeyValByTypeId(LDMTypes.oDataReport);
                if(udpMap != null && udpMap.size()>0){
                    Set<String> udpNames = udpMap.keySet();
                    Iterator<String> iterator = udpNames.iterator();
                    for(int i=lastCellNum; i< lastCellNum+udpNames.size(); i++){
                        if(iterator.hasNext()){
                            Cell cell = header.createCell(i);
                            cell.setCellValue(iterator.next());
                            cell.setCellStyle(cellStyle);
                            Cell cell2 = second.createCell(i);
                            cell2.setCellStyle(second.getCell(2).getCellStyle());
                            Cell cell3 = sheet.getRow(sheet.getFirstRowNum()+2).createCell(i);
                            cell3.setCellStyle(second.getCell(2).getCellStyle());
                            Cell cell4 = sheet.getRow(sheet.getFirstRowNum()+3).createCell(i);
                            cell4.setCellStyle(second.getCell(2).getCellStyle());
                        }
                    }
                }

                realName = URLEncoder.encode(downloadName, "UTF-8");
                realName = realName.replace("+", "%20");


                response.setHeader("Content-disposition", "attachment; filename=" + realName + ".xlsx");
//
//                response.setHeader("Content-Length", String.valueOf(workbook));
                workbook.write(response.getOutputStream());
//                try (BufferedInputStream bis = new BufferedInputStream(workbook.w);
//                     BufferedOutputStream bos = new BufferedOutputStream(response.getOutputStream())) {
//                    byte[] buff = new byte[2048];
//                    int bytesRead;
//                    while (-1 != (bytesRead = bis.read(buff, 0, buff.length))) {
//                        bos.write(buff, 0, bytesRead);
//                    }
//
//                } catch (Exception ex) {
//                    throw new IllegalStateException("failed to export template file");
//                }
            } catch (Exception ex) {
                //logger.warn("Failed to convert template file name");
            }


        }
    }

    @RequestMapping(value = "/file/report", method = RequestMethod.POST)
    @Operation(summary = "导出数据报表", description = "导出数据报表")
    @Description("导出数据报表")
    public ResponseEntity<byte[]> downloadReportFile(
            @Parameter(name = "categorys", description = "报表目录Id集合", required = true)
            @Description("报表目录Id集合")
            @RequestBody ReportDto categorys) {
        if (categorys == null || categorys.getCategorys() == null || categorys.getCategorys().isEmpty()) {
            throw new InvalidArgumentException(msgService.getMessage("parameterNotNull"));
        }

        DataReportExportResult exportResult = dataReportService.downloadReportFile(categorys.getCategorys());

        //增加日志
        addDataReportExportLog(exportResult.getExportTotalNumbers());

        return exportResult.getContent();
    }

    protected void addDataReportExportLog(int exportNumbers) {
        try {
            String logMessage = msgService.getMessage("metadata.report.log.export", exportNumbers);
            operationLogService.generateOperationLog(OperationModuleType.METADATA_REPORT, "dam_data_report",
                    OperationLogType.DATA_EXPORT, logMessage, AuthTools.currentUsername(), 0);
        } catch (Exception e) {
            log.error(e.getMessage());
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class ReportDto implements Serializable {
        private List<String> categorys;

        public ReportDto() {
        }

        public ReportDto(List<String> categorys) {
            this.categorys = categorys;
        }

        public List<String> getCategorys() {
            return categorys;
        }

        public void setCategorys(List<String> categorys) {
            this.categorys = categorys;
        }
    }

    @RequestMapping("/related/me/{code}")
    @Operation(summary = "根据关联指标code获取报表数据", description = "根据关联指标code获取报表数据")
    @Description("根据关联指标code获取报表数据")
    public List<DataReportDto> loadDataReportDetailByRelatedMeasurement(
            @Parameter(name = "code", description = "关联指标code", required = true)
            @Description("关联指标code")
            @PathVariable("code") String code) throws Exception {
        return dataReportService.loadDataReportDetailByRelatedMeasurement(code);
    }

    @RequestMapping("/related/table/{tableId}")
    @Operation(summary = "根据关联tableId获取报表数据", description = "根据关联tableId获取报表数据")
    @Description("根据关联tableId获取报表数据")
    public List<DataReportDto> loadDataReportDetailByRelatedTableId(
            @Parameter(name = "tableId", description = "元数据表ID", required = true)
            @Description("元数据表ID")
            @PathVariable("tableId") Long tableId) throws Exception {
        return dataReportService.getSimpleDataReportsByRelatedTable(tableId);
    }

    @RequestMapping(value = "/{drId}/resourceStatistics")
    @Operation(summary = "根据关联报表ID统计资源数", description = "根据关联报表ID统计资源数")
    @Parameter(name = "drId", description = "报表ID", in = ParameterIn.PATH, required = true)
    @Description("根据关联报表ID统计资源数")
    public PageResult<DataReportResourceStatistics> getDataReportResourceStatistics(
            @Parameter(name = "drId", description = "报表ID", required = true)
            @Description("报表Id")
            @PathVariable("drId") Long drId,
            @Parameter(name = "currentPage", description = "当前页", required = true)
            @Description("当前页")
            @RequestParam(name = "currentPage", defaultValue = "0") Integer currentPage,
            @Parameter(name = "pageSize", description = "一页的数据量", required = true)
            @RequestParam(name = "pageSize", defaultValue = "50") Integer pageSize) throws Exception {
        if (drId == null) {
            throw new IllegalArgumentException(msgService.getMessage("applicationIdOfDataBeQueriedIsEmpty"));
        }

        return dataReportService.loadDataReportResourceStatisticsPages(drId, currentPage, pageSize);
    }


    //todo 7.0 job
    @RequestMapping(value = "/importBI/test", method = RequestMethod.POST)
    @Operation(summary = "测试BI报表", description = "测试BI报表")
    @Description("测试BI报表")
    public boolean testBIServerConnection(
            @Parameter(name = "conn", description = "报表服务器连接信息", required = true)
            @Description("报表服务器连接信息")
            @RequestBody BIReportServerDto conn) throws Exception {
        return biReportImportService.testConnectionToBIServer(conn.getInfo(), conn.getType());
    }


    //todo 7.0 job
    @RequestMapping(value = "/importBI/additionalProp", method = RequestMethod.POST)
    @Operation(summary = "获取报表附加信息", description = "获取报表附加信息")
    @Description("获取报表附加信息")
    public ResResultDto importBIDavinciProjects(
            @Parameter(name = "conn", description = "报表服务器连接信息", required = true)
            @Description("报表服务器连接信息")
            @RequestBody BIReportServerDto conn) throws Exception {
        Map<String, Object> reportAdditionalProp = biReportImportService.getReportAdditionalProp(conn.getInfo(), conn.getType());
        return ResResultDto.ok(reportAdditionalProp);
    }

    @RequestMapping(value = "/search", method = RequestMethod.POST)
    @Description("分页查询报表")
    @EndpointDoc(bodyExample = "{\n" +
            "    \"pageSize\":20,\n" +
            "    \"currentPage\":1,\n" +
            "    \"keyword\":\"\",\n" +
            "    \"path\":[\n" +
            "        \"管理驾驶舱\"\n" +
            "    ]\n" +
            "}")
    @Operation(summary = "分页查询报表", description = "分页查询报表")
    public PageResult<DataReport> queryReports(
            @Parameter(name = "query", description = "查询参数", required = true)
            @Description("查询参数") @RequestBody DataReportQueryDto query) {
        return dataReportService.getPageReport(query.getKeyword(), query.getPath(), PageRequest.of(query.getCurrentPage(), query.getPageSize()));
    }
}
