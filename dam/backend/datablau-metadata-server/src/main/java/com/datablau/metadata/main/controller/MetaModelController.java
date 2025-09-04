package com.datablau.metadata.main.controller;

import com.andorj.common.core.annotation.Description;
import com.andorj.common.core.exception.AndorjException;
import com.andorj.common.core.exception.UnexpectedStateException;
import com.andorj.common.core.model.ModelX;
import com.andorj.common.data.PageResult;
import com.andorj.model.common.utility.FileUtility;
import com.datablau.data.common.controller.BaseController;
import com.datablau.data.common.util.ExcelUtil;
import com.datablau.metadata.common.dto.metamodel.MetaElementAssetDto;
import com.datablau.metadata.common.dto.metamodel.MetaModelAssetDto;
import com.datablau.metadata.common.dto.metamodel.MetaModelDetailDto;
import com.datablau.metadata.common.dto.metamodel.MetaModelDto;
import com.datablau.metadata.common.dto.metamodel.MetaModelIconDto;
import com.datablau.metadata.common.dto.metamodel.SearchDataDto;
import com.datablau.metadata.common.dto.metamodel.SearchDto;
import com.datablau.metadata.main.dao.SimilarityJobResultRepository;
import com.datablau.metadata.main.dao.metamodel.MetaModelRepository;
import com.datablau.metadata.main.dao.model.ModelRepository;
import com.datablau.metadata.main.dto.MetaDataSimilarityResultDto;
import com.datablau.metadata.main.dto.covermm.SheetData;
import com.datablau.metadata.main.dto.covermm.Sheets;
import com.datablau.metadata.main.dto.mm.ApiMM;
import com.datablau.metadata.main.dto.mm.ApplicationSystemMM;
import com.datablau.metadata.main.dto.mm.DimensionMM;
import com.datablau.metadata.main.dto.mm.ReportItemMM;
import com.datablau.metadata.main.dto.mm.ReportMM;
import com.datablau.metadata.main.dto.mm.TimeSeriesDataMM;
import com.datablau.metadata.main.dto.mm.TimeSeriesPointMM;
import com.datablau.metadata.main.dto.report.bi.ResResultDto;
import com.datablau.metadata.main.entity.SimilarityJobResult;
import com.datablau.metadata.main.entity.metamodel.MetaModel;
import com.datablau.metadata.main.entity.model.Model;
import com.datablau.metadata.main.service.metadata.api.MetaModelDataService;
import com.datablau.metadata.main.service.metadata.dto.ColumnDto;
import com.datablau.metadata.common.dto.metamodel.MetaElementParameterDto;
import com.datablau.metadata.main.service.metamodel.MetaModelIconService;
import com.datablau.metadata.main.service.metamodel.MetaModelService;
import com.datablau.metadata.main.util.DataUtility;
import com.datablau.metadata.main.util.ModelUtility;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.OutputStream;
import java.io.StringWriter;
import java.util.*;

/**
 * @program: datablau-metadata
 * @description: 元模型相关
 * @author: wang tong
 * @create: 2024-12-03 16:21
 **/
@Tag(name = "元模型", description = "/mm")
@RequestMapping("/mm")
@RestController
public class MetaModelController extends BaseController {

    private static final Logger LOGGER = LoggerFactory.getLogger(MetaModelController.class);


    @Autowired
    private MetaModelService metaModelService;

    @Autowired
    private MetaModelIconService metaModelIconService;

    @Autowired
    private MetaModelRepository metaModelRepository;

    @Autowired
    private MetaModelDataService metaModelDataService;

    @Autowired
    private ModelRepository dataModelRepo;


    @Autowired
    private SimilarityJobResultRepository similarityJobResultRepository;


    /**
     * 获取元模型信息，若不传参则返回全部
     */
    @PostMapping("/getMetaModels")
    public List<MetaModelDto> getMetaModels() {
        return metaModelService.getMetaModels();
    }

    @PostMapping("/getMetaModel")
    public MetaModelDto getMetaModel(@RequestBody Long Id) {
        return metaModelService.findMetaModelById(Id);
    }

    /**
     * 添加或更新元模型
     */
    @PostMapping("/addOrUpdateMetaModel")
    public void addOrUpdateMetaModel(@RequestBody MetaModelDto dto) {
        metaModelService.addOrUpdateMetaModel(dto);
    }

    /**
     * 删除元模型（状态为发布的，暂时设置不能删除）
     */
    @PostMapping("/removeMetaModel")
    public void removeMetaModel(@RequestBody MetaModelDto dto) throws AndorjException {
        metaModelService.removeMetaModel(dto);
    }


    /**
     * 导入 元模型，支持 xml 或者 JSON 格式
     */
    @PostMapping("/importMetaModel/{id}")
    public MetaModelDto importMetaModel(@RequestParam("file") MultipartFile file,
                                        @Description("元模型编码") @PathVariable("id") Long id) {

        File uploadFile = null;
        try {
            uploadFile = DataUtility.uploadFile(file);
            return metaModelService.importMetaModel(uploadFile, id, file.getName());
        } catch (Exception ex) {
            LOGGER.error("failed to upload file", ex);
            throw new UnexpectedStateException(ex.getMessage());
        }

    }


    /**
     * 根据id 导出 元模型  以 xml 方式
     */
    @PostMapping("/download")
    public ResponseEntity<Resource> downloadXMl(@RequestBody MetaModelDto dto) {
        MetaModel metaModelDto = metaModelRepository.findMetaModelById(dto.getId());
        if (metaModelDto == null) {
            return null;
        }
        String filePath = FileUtility.getTempFolder() + File.separator + metaModelDto.getCode() + ".xml";
        try {
            File file = new File(filePath);
            String xml = metaModelDto.getDefinition();
            if (xml.trim().startsWith("<File>")) {
                try (BufferedWriter writers = new BufferedWriter(new FileWriter(file))) {
                    writers.write(xml);
                }
            } else {
                // 输出新的XML字符串
                TransformerFactory transformerFactory = TransformerFactory.newInstance();
                Transformer transformer = transformerFactory.newTransformer();
                StringWriter writer = new StringWriter();
                transformer.setOutputProperty(OutputKeys.INDENT, "yes");
                transformer.transform(new DOMSource(ModelUtility.jsonXMlStringToCertainXMl(xml)), new StreamResult(writer));
                String outputXml = writer.getBuffer().toString();

                try (BufferedWriter writers = new BufferedWriter(new FileWriter(file))) {
                    writers.write(outputXml);
                }
            }


            // 创建要下载的文件资源
            Resource resource = new FileSystemResource(file);
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + file.getName());

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(file.length())
                    .contentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
        } catch (IOException | TransformerException e) {
            throw new RuntimeException(e);
        }

    }


    @PostMapping("/addElement")
    public MetaModelDto addElement(@RequestBody MetaModelDto dto) {
        return metaModelService.addElement(dto.getElement(), dto);
    }

    @PostMapping("/updateElement")
    public MetaModelDto updateElement(@RequestBody MetaModelDto dto) {
        return metaModelService.updateElement(dto.getElement(), dto);
    }

    @PostMapping("/deleteElement")
    public MetaModelDto deleteElement(@RequestBody MetaModelDto dto) {
        return metaModelService.deleteElement(dto.getElement(), dto);
    }


    @Operation(summary = "元模型图标")
    @GetMapping("/{metaModelCode}/{objectType}")
    public void getIcon(
            @Description("元模型编码") @PathVariable("metaModelCode") String metaModelCode,
            @Description("元模型对象类型") @PathVariable("objectType") String objectType,
            HttpServletResponse response
    ) {
        MetaModelIconDto metaModelIcon = metaModelIconService.getIcon(metaModelCode, objectType);

        response.setContentType("application/octet-stream");
        response.setHeader("Content-Disposition", "attachment;filename=" + System.currentTimeMillis());
        response.setHeader("Content-Length", String.valueOf(metaModelIcon.getContent().length));

        OutputStream os = null;
        try {
            os = response.getOutputStream();
            os.write(metaModelIcon.getContent());
            os.flush();
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            if (os != null) {
                try {
                    os.close();
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
        }
    }

    @Operation(summary = "元模型图标")
    @GetMapping("/{objectType}")
    public void getIcon(
            @Description("元模型对象类型") @PathVariable("objectType") String objectType,
            HttpServletResponse response
    ) {
        MetaModelIconDto metaModelIcon = metaModelIconService.getIcon(objectType);

        response.setContentType("application/octet-stream");
        response.setHeader("Content-Disposition", "attachment;filename=" + System.currentTimeMillis());
        response.setHeader("Content-Length", String.valueOf(metaModelIcon.getContent().length));

        OutputStream os = null;
        try {
            os = response.getOutputStream();
            os.write(metaModelIcon.getContent());
            os.flush();
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            if (os != null) {
                try {
                    os.close();
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
        }
    }


    @Operation(summary = "更新元模型图标")
    @PostMapping("/{metaModelCode}/{objectType}/update")
    public void updateIcon(
            @Description("元模型编码") @PathVariable("metaModelCode") String metaModelCode,
            @Description("元模型对象类型") @PathVariable("objectType") String objectType,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            byte[] content = file.getBytes();
            MetaModelIconDto metaModelIcon = metaModelIconService.updateIcon(metaModelCode, objectType, content);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Operation(summary = "删除元模型图标")
    @PostMapping("/{metaModelCode}/{objectType}/delete")
    public void deleteIcon(
            @Description("元模型编码") @PathVariable("metaModelCode") String metaModelCode,
            @Description("元模型对象类型") @PathVariable("objectType") String objectType
    ) {
        metaModelIconService.deleteIcon(metaModelCode, objectType);
    }

    @Operation(summary = "获取入资产的元模型列表")
    @PostMapping("/getAssetMetaElementList")
    public List<MetaElementAssetDto> getAssetMetaElementList() throws Exception {
        return metaModelService.getAllList(new MetaElementParameterDto(true, true, true));
    }


    @Operation(summary = "根据modelId  获取 M1 的元素，供界面查询下拉框使用")
    @PostMapping("/getObjectsByModelId")
    public List<MetaElementAssetDto> getObjectsByModelId(@RequestBody SearchDto searchDto) {
        return metaModelService.getObjectsByModelId(searchDto.getModelId());
    }

    @Operation(summary = "获取所有M1 元素，供界面查询下拉框使用")
    @PostMapping("/getAllList")
    @Deprecated
    public List<MetaElementAssetDto> getAllList(@RequestBody(required = false) MetaElementParameterDto parameterDto) {
        if (parameterDto == null) {
            parameterDto = new MetaElementParameterDto();
        }
        return metaModelService.getAllList(parameterDto);
    }

    @Operation(summary = "获取所有M1的元素（二级树状结构），供界面查询下拉框使用")
    @PostMapping("/getAllTree")
    @Deprecated
    public List<MetaModelAssetDto> getAllTree() {
        return metaModelService.getAllTree();
    }


    @Operation(summary = "根据dataObjectId分页查询对应的M0元素")
    @PostMapping("/getRelatedObjectsByObjectId")
    public PageResult<ColumnDto> getRelatedObjectsByObjectId(@RequestBody SearchDataDto searchDataDto) {
        return metaModelService.getRelatedObjectsByObjectId(searchDataDto);
    }

    @Operation(summary = "查询指定对象 的 M1详情 以及属性")
    @PostMapping("/getMetaModelDetailByDataObjectId")
    public MetaModelDetailDto getMetaModelDetailByDataObjectId(@RequestBody SearchDto searchDto) throws Exception {
        return metaModelService.getMetaModelDetailByDataObjectId(searchDto.getDataObjectId());
    }

    @Value("${mm.report.sheet1}")
    private String reportMMSheet1;

    @Value("${mm.report.sheet2}")
    private String reportMMSheet2;

    @Value("${mm.report.sheet3}")
    private String reportMMSheet3;

    @PostMapping("/object/reportItem")
    public ResResultDto reportItem(@RequestParam("modelId") Long modelId,
                                   @RequestBody List<ReportMM> reportMMS) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            LOGGER.info("报表元模型对接数据：{}", mapper.writeValueAsString(reportMMS));

            Optional<Model> modelOpt = dataModelRepo.findById(modelId);
            Model model = modelOpt.get();

            SheetData sheetData1 = new SheetData(reportMMSheet1);
            sheetData1.addHeader(reportMMSheet1 + ".Id");
            sheetData1.addHeader(reportMMSheet1 + ".Name");
            sheetData1.addHeader(reportMMSheet1 + ".Definition");
            sheetData1.addHeader(reportMMSheet1 + ".LogicalName");
            sheetData1.addData(List.of(modelId, model.getDefinition(), "", ""));

            /****************************************************************************/
            SheetData sheetData2 = new SheetData(reportMMSheet2);
            sheetData2.addHeader(reportMMSheet1 + ".Id");
            sheetData2.addHeader(reportMMSheet1 + ".Name");
            sheetData2.addHeader(reportMMSheet2 + ".dl1BusinessDomain");
            sheetData2.addHeader(reportMMSheet2 + ".Id");
            sheetData2.addHeader(reportMMSheet2 + ".Name");
            sheetData2.addHeader(reportMMSheet2 + ".dl2ThemeDomain");
            sheetData2.addHeader(reportMMSheet2 + ".Definition");
            sheetData2.addHeader(reportMMSheet2 + ".LogicalName");
            sheetData2.addHeader(reportMMSheet2 + ".updateCycle");
            sheetData2.addHeader(reportMMSheet2 + ".technicaler");
            sheetData2.addHeader(reportMMSheet2 + ".securityLevel");
            sheetData2.addHeader(reportMMSheet2 + ".dataMaster");
            sheetData2.addHeader(reportMMSheet2 + ".dataSteward");
            sheetData2.addHeader(reportMMSheet2 + ".reportDispay");
            sheetData2.addHeader(reportMMSheet2 + ".publishLink");
            sheetData2.addHeader(reportMMSheet2 + ".reportId");
            sheetData2.addHeader(reportMMSheet2 + ".reportType");
            sheetData2.addHeader(reportMMSheet2 + ".systemName");
            sheetData2.addHeader(reportMMSheet2 + ".index");
            sheetData2.addHeader(reportMMSheet2 + ".reportLabel");
            sheetData2.addHeader("report.index|rp");
            sheetData2.addHeader("report.index");

            for (ReportMM mm : reportMMS) {
                List data = Arrays.asList(modelId, model.getDefinition(), mm.getDl1BusinessDomain(), "", mm.getReportId(), mm.getDl2ThemeDomain(), mm.getReportRemark(),
                        mm.getReportName(), mm.getUpdateCycle(), mm.getTechnicaler(), mm.getSecurityLevel(), mm.getDataMaster(), mm.getDataSteward(), mm.getReportDispay(),
                        mm.getPublishLink(), mm.getReportId(), mm.getReportType(), mm.getSystemName(), "", mm.getReportLabel(), "", "");
//                List data = Arrays.asList(modelId, model.getDefinition(), "", mm.getReportName(), mm.getReportRemark(), "", mm.getPublishLink(), mm.getReportType(),
//                        mm.getReportId(), mm.getSystemName(), mm.getTechnicaler(), mm.getDl1BusinessDomain(), mm.getReportDispay(), mm.getUpdateCycle(),
//                        mm.getSecurityLevel(), "", mm.getDataSteward(), mm.getDl2ThemeDomain(), mm.getDataMaster());
                sheetData2.addData(data);
            }

            /****************************************************************************/
            SheetData sheetData3 = new SheetData(reportMMSheet3);
            sheetData3.addHeader(reportMMSheet2 + ".Id");
            sheetData3.addHeader(reportMMSheet2 + ".Name");
            sheetData3.addHeader(reportMMSheet3 + ".Id");
            sheetData3.addHeader(reportMMSheet3 + ".reportItemPath");
            sheetData3.addHeader(reportMMSheet3 + ".Name");
            sheetData3.addHeader(reportMMSheet3 + ".Definition");
            sheetData3.addHeader(reportMMSheet3 + ".dataSource");
            sheetData3.addHeader(reportMMSheet3 + ".LogicalName");
            sheetData3.addHeader(reportMMSheet3 + ".reportItemSQL");
            sheetData3.addHeader(reportMMSheet3 + ".technicaler");
            sheetData3.addHeader(reportMMSheet3 + ".reportTable");
            sheetData3.addHeader(reportMMSheet3 + ".index");
            sheetData3.addHeader("reportItem.reportTable|rp");
            sheetData3.addHeader("reportItem.reportTable");
            sheetData3.addHeader("reportItem.index|rp");
            sheetData3.addHeader("reportItem.index");
            for (ReportMM mm : reportMMS) {
                String reportName = mm.getReportName();
                List<ReportItemMM> reportItem = mm.getReportItem();
                for (ReportItemMM itemMM : reportItem) {
                    String firstName = model.getDefinition() + "." + reportName;

                    List<Object> data = Arrays.asList("", firstName, "", itemMM.getReportItemPath(), itemMM.getReportItem(),
                            "", itemMM.getDataSource(), "", itemMM.getReportItemSQL(), itemMM.getTechnicaler(), mapper.writeValueAsString(itemMM.getReportTable()),
                            mapper.writeValueAsString(itemMM.getIndex()), "", "", "", "");
//                    List<Object> data = Arrays.asList("", firstName, "", itemMM.getReportItem(), "", "",
//                            itemMM.getReportItemPath(), mapper.writeValueAsString(itemMM.getReportTable()),
//                            itemMM.getTechnicaler(), itemMM.getReportItemSQL());
                    sheetData3.addData(data);
                }
            }

            List<SheetData> sheetDatas = new ArrayList<>();
            sheetDatas.add(sheetData1);
            sheetDatas.add(sheetData2);
            sheetDatas.add(sheetData3);
            Sheets sheets = new Sheets();
            sheets.setSheets(sheetDatas);

            String JsonData = mapper.writeValueAsString(sheets);

            ModelX jsonDataModelXC = metaModelDataService.loadDataModelXFromJson(modelId, JsonData);
            metaModelDataService.saveWithCompare(modelId, jsonDataModelXC, true);
            return ResResultDto.ok();
        }catch (Exception e){
            return ResResultDto.error(e);
        }
    }


    @Value("${mm.api.sheet1:api模型}")
    private String apiMMSheet1;
    @Value("${mm.api.sheet2:api模型.api}")
    private String apiMMSheet2;
    @Value("${mm.api.modelId:1700100}")
    private Long apiModelId;

    @Operation(summary = "三方api对接,生成元模型数据")
    @PostMapping("/saveApiMM")
    public ResResultDto saveApiMM(@RequestBody List<ApiMM> apiMMS) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            LOGGER.info("三方api对接,生成元模型数据：{}", mapper.writeValueAsString(apiMMS));

            Optional<Model> modelOpt = dataModelRepo.findById(apiModelId);
            Model model = modelOpt.get();
            //构建sheet1数据
            SheetData sheetData1 = new SheetData(apiMMSheet1);
            sheetData1.addHeader(apiMMSheet1 + ".Id");
            sheetData1.addHeader(apiMMSheet1 + ".Name");
            sheetData1.addHeader(apiMMSheet1 + ".Definition");
            sheetData1.addHeader(apiMMSheet1 + ".LogicalName");
            sheetData1.addData(List.of(apiModelId, model.getDefinition(), "", ""));
            //构建sheet2数据
            SheetData sheetData2 = new SheetData(apiMMSheet2);
            sheetData2.addHeader(apiMMSheet1 + ".Id");
            sheetData2.addHeader(apiMMSheet1 + ".Name");
            sheetData2.addHeader(apiMMSheet2 + ".Id");
            sheetData2.addHeader(apiMMSheet2 + ".Name");
            sheetData2.addHeader(apiMMSheet2 + ".Definition");
            sheetData2.addHeader(apiMMSheet2 + ".LogicalName");
            sheetData2.addHeader(apiMMSheet2 + ".dataSourceType");
            sheetData2.addHeader(apiMMSheet2 + ".returnParameters");
            sheetData2.addHeader(apiMMSheet2 + ".requestParameters");
            sheetData2.addHeader(apiMMSheet2 + ".apiDescription");
            sheetData2.addHeader(apiMMSheet2 + ".table");
            sheetData2.addHeader(apiMMSheet2 + ".apiId");
            for (ApiMM apiMM : apiMMS) {
                List<String> tables = apiMM.getTable();
                String table = "";
                if (!CollectionUtils.isEmpty(tables)) {
                    table = String.join(",", tables);
                }
                List<Object> data = Arrays.asList(apiModelId, model.getDefinition(), "", apiMM.getApiName(), "", apiMM.getApiName(), apiMM.getDataSourceType(), apiMM.getReturnParameters(), apiMM.getRequestParameters(),
                        apiMM.getApiDescription() == null ? "":apiMM.getApiDescription(), table, apiMM.getApiId());
                sheetData2.addData(data);
            }
            List<SheetData> sheetDatas = new ArrayList<>();
            sheetDatas.add(sheetData1);
            sheetDatas.add(sheetData2);
            Sheets sheets = new Sheets();
            sheets.setSheets(sheetDatas);

            String JsonData = mapper.writeValueAsString(sheets);
            ModelX jsonDataModelXC = metaModelDataService.loadDataModelXFromJson(apiModelId, JsonData);
            metaModelDataService.saveWithCompare(apiModelId, jsonDataModelXC, true);
            return ResResultDto.ok();
        } catch (Exception e) {
            return ResResultDto.error(e);
        }
    }

    @Value("${mm.system.sheet1:数据应用模型}")
    private String systemMMSheet1;
    @Value("${mm.system.sheet2:数据应用模型.system}")
    private String systemMMSheet2;
    @Value("${mm.system.modelId:1700101}")
    private Long systemModelId;
    @Operation(summary = "三方数据应用系统对接,生成元模型数据")
    @PostMapping("/saveApplicationSystem")
    public ResResultDto saveApplicationSystem( @RequestBody List<ApplicationSystemMM> systemMMS) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            LOGGER.info("三方数据应用系统对接,生成元模型数据：{}", mapper.writeValueAsString(systemMMS));

            Optional<Model> modelOpt = dataModelRepo.findById(systemModelId);
            Model model = modelOpt.get();
            //构建sheet1数据
            SheetData sheetData1 = new SheetData(systemMMSheet1);
            sheetData1.addHeader(systemMMSheet1 + ".Id");
            sheetData1.addHeader(systemMMSheet1 + ".Name");
            sheetData1.addHeader(systemMMSheet1 + ".Definition");
            sheetData1.addHeader(systemMMSheet1 + ".LogicalName");
            sheetData1.addData(List.of(systemModelId, model.getDefinition(), "", ""));
            //构建sheet2数据
            SheetData sheetData2 = new SheetData(systemMMSheet2);
            sheetData2.addHeader(systemMMSheet1 + ".Id");
            sheetData2.addHeader(systemMMSheet1 + ".Name");
            sheetData2.addHeader(systemMMSheet2 + ".Id");
            sheetData2.addHeader(systemMMSheet2 + ".Name");
            sheetData2.addHeader(systemMMSheet2 + ".Definition");
            sheetData2.addHeader(systemMMSheet2 + ".LogicalName");
            sheetData2.addHeader(systemMMSheet2 + ".appName");
            sheetData2.addHeader(systemMMSheet2 + ".appDesc");
            sheetData2.addHeader(systemMMSheet2 + ".deptId");
            sheetData2.addHeader(systemMMSheet2 + ".userId");
            for (ApplicationSystemMM systemMM : systemMMS) {
                List<Object> data = Arrays.asList(systemModelId, model.getDefinition(), "", systemMM.getAppName(), "", systemMM.getAppName(), systemMM.getAppName(),
                        systemMM.getAppDesc() == null ? "":systemMM.getAppDesc() , systemMM.getDeptId(), systemMM.getUserId());
                sheetData2.addData(data);
            }
            List<SheetData> sheetDatas = new ArrayList<>();
            sheetDatas.add(sheetData1);
            sheetDatas.add(sheetData2);
            Sheets sheets = new Sheets();
            sheets.setSheets(sheetDatas);

            String JsonData = mapper.writeValueAsString(sheets);
            ModelX jsonDataModelXC = metaModelDataService.loadDataModelXFromJson(systemModelId, JsonData);
            metaModelDataService.saveWithCompare(systemModelId, jsonDataModelXC, true);

            //保存应用和API关系的元模型
            this.saveApiDept(systemMMS);

            return ResResultDto.ok();
        } catch (Exception e) {
            return ResResultDto.error(e);
        }
    }

    @Value("${apideptmodelId}")
    private Long apideptmodelId;
    @Value("${mm.apidept.sheet1}")
    private String apideptMMSheet1;
    @Value("${mm.apidept.sheet2}")
    private String apideptMMSheet2;

    public void saveApiDept(List<ApplicationSystemMM> systemMMS) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Optional<Model> modelOpt = dataModelRepo.findById(apideptmodelId);
        Model model = modelOpt.get();
        //构建sheet1数据
        SheetData sheetData1 = new SheetData(apideptMMSheet1);
        sheetData1.addHeader(apideptMMSheet1 + ".Id");
        sheetData1.addHeader(apideptMMSheet1 + ".Name");
        sheetData1.addHeader(apideptMMSheet1 + ".Definition");
        sheetData1.addHeader(apideptMMSheet1 + ".LogicalName");
        sheetData1.addData(List.of(model.getModelId(), model.getDefinition(), "", ""));

        //sheet2
        SheetData sheetData2 = new SheetData(apideptMMSheet2);
        sheetData2.addHeader(apideptMMSheet1 + ".Id");
        sheetData2.addHeader(apideptMMSheet1 + ".Name");
        sheetData2.addHeader(apideptMMSheet2 + ".Id");
        sheetData2.addHeader(apideptMMSheet2 + ".Name");
        sheetData2.addHeader(apideptMMSheet2 + ".Definition");
        sheetData2.addHeader(apideptMMSheet2 + ".LogicalName");
        sheetData2.addHeader(apideptMMSheet2 + ".appName");
        sheetData2.addHeader(apideptMMSheet2 + ".deptId");
        sheetData2.addHeader(apideptMMSheet2 + ".apiId");

        for (ApplicationSystemMM systemMM : systemMMS) {
            List data = Arrays.asList(model.getModelId(), model.getDefinition(),"", systemMM.getAppName(), "", systemMM.getAppName(),
                    systemMM.getAppName(), systemMM.getDeptId(), systemMM.getApiId());
            sheetData2.addData(data);
        }
        List<SheetData> sheetDatas = new ArrayList<>();
        sheetDatas.add(sheetData1);
        sheetDatas.add(sheetData2);
        Sheets sheets = new Sheets();
        sheets.setSheets(sheetDatas);
        String JsonData = mapper.writeValueAsString(sheets);
        ModelX jsonDataModelXC = metaModelDataService.loadDataModelXFromJson(apideptmodelId, JsonData);
        metaModelDataService.saveWithCompare(apideptmodelId, jsonDataModelXC, true);
    }

    @Value("${mm.dimension.sheet1:维度元模型}")
    private String dimensionMMSheet1;
    @Value("${mm.dimension.sheet2:维度元模型.dimension}")
    private String dimensionMMSheet2;
    @Value("${mm.dimension.modelId:1700102}")
    private Long dimensionModelId;

    @Operation(summary = "三方维度组对接,生成元模型数据")
    @PostMapping("/saveDimension")
    public ResResultDto saveDimensionMM(@RequestBody List<DimensionMM> dimensionMMS) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        LOGGER.info("三方维度组对接,生成元模型数据：{}", mapper.writeValueAsString(dimensionMMS));

        Optional<Model> modelOpt = dataModelRepo.findById(dimensionModelId);
        Model model = modelOpt.get();
        //构建sheet1数据
        SheetData sheetData1 = new SheetData(dimensionMMSheet1);
        sheetData1.addHeader(dimensionMMSheet1 + ".Id");
        sheetData1.addHeader(dimensionMMSheet1 + ".Name");
        sheetData1.addHeader(dimensionMMSheet1 + ".Definition");
        sheetData1.addHeader(dimensionMMSheet1 + ".LogicalName");
        sheetData1.addData(List.of(model.getModelId(), model.getDefinition(), "", ""));
        //构建sheet2数据
        SheetData sheetData2 = new SheetData(dimensionMMSheet2);
        sheetData2.addHeader(dimensionMMSheet1 + ".Id");
        sheetData2.addHeader(dimensionMMSheet1 + ".Name");
        sheetData2.addHeader(dimensionMMSheet2 + ".Id");
        sheetData2.addHeader(dimensionMMSheet2 + ".Name");
        sheetData2.addHeader(dimensionMMSheet2 + ".Definition");
        sheetData2.addHeader(dimensionMMSheet2 + ".LogicalName");
        sheetData2.addHeader(dimensionMMSheet2 + ".dimensionCode");
        sheetData2.addHeader(dimensionMMSheet2 + ".dimensionName");
        sheetData2.addHeader(dimensionMMSheet2 + ".dimensionDescription");

        for (DimensionMM dimensionMM : dimensionMMS) {
            List data =  Arrays.asList(model.getModelId(), model.getDefinition(),"", dimensionMM.getDimensionName(),
                    dimensionMM.getDimensionName(), dimensionMM.getDimensionName(), dimensionMM.getDimensionCode(),
                    dimensionMM.getDimensionName(),
                    dimensionMM.getDimensionDescription());
            sheetData2.addData(data);
        }

        List<SheetData> sheetDatas = new ArrayList<>();
        sheetDatas.add(sheetData1);
        sheetDatas.add(sheetData2);
        Sheets sheets = new Sheets();
        sheets.setSheets(sheetDatas);
        String JsonData = mapper.writeValueAsString(sheets);
        ModelX jsonDataModelXC = metaModelDataService.loadDataModelXFromJson(dimensionModelId, JsonData);
        metaModelDataService.saveWithCompare(dimensionModelId, jsonDataModelXC, true);

        return ResResultDto.ok();
    }



    @Value("${sync.timeSeriesDataSheet1}")
    private String timeSeriesDataSheet1;
    @Value("${sync.timeSeriesDataSheet2}")
    private String timeSeriesDataSheet2;

    @Value("${sync.timeSeriesDataSheet3}")
    private String timeSeriesDataSheet3;

    @PostMapping("/saveTimeSeries")
    public void saveTimeSeries (@RequestBody List<TimeSeriesDataMM> timeSeriesDataMMList) throws Exception {

        ObjectMapper mapper = new ObjectMapper();

        Long modelId = 3700103L;
        Optional<Model> modelOpt = dataModelRepo.findById(modelId);
        Model model = modelOpt.get();

        //sheet1数据
        SheetData sheetData1 = new SheetData(timeSeriesDataSheet1);
        sheetData1.addHeader(timeSeriesDataSheet1 + ".Id");
        sheetData1.addHeader(timeSeriesDataSheet1 + ".Name");
        sheetData1.addHeader(timeSeriesDataSheet1 + ".Definition");
        sheetData1.addHeader(timeSeriesDataSheet1 + ".LogicalName");
        sheetData1.addData(List.of(modelId, model.getDefinition(), "", ""));

        //sheet2数据
        SheetData sheetData2 = new SheetData(timeSeriesDataSheet2);
        sheetData2.addHeader(timeSeriesDataSheet1 + ".Id");
        sheetData2.addHeader(timeSeriesDataSheet1 + ".Name");
        sheetData2.addHeader(timeSeriesDataSheet2 + ".Id");
        sheetData2.addHeader(timeSeriesDataSheet2 + ".Name");
        sheetData2.addHeader(timeSeriesDataSheet2 + ".Definition");
        sheetData2.addHeader(timeSeriesDataSheet2 + ".LogicalName");
        sheetData2.addHeader(timeSeriesDataSheet2 + ".dl1BusinessDomain");
        sheetData2.addHeader(timeSeriesDataSheet2 + ".dl2ThemeDomain");
        sheetData2.addHeader(timeSeriesDataSheet2 + ".dl3BusinessObject");
        sheetData2.addHeader(timeSeriesDataSheet2 + ".dataMaster");
        sheetData2.addHeader(timeSeriesDataSheet2 + ".dataSteward");
        sheetData2.addHeader(timeSeriesDataSheet2 + ".dataCollectionProtocol");
        sheetData2.addHeader(timeSeriesDataSheet2 + ".resourceId");
        sheetData2.addHeader(timeSeriesDataSheet2 + ".resourceName");
        sheetData2.addHeader(timeSeriesDataSheet2 + ".resourceSummary");
        sheetData2.addHeader(timeSeriesDataSheet2 + ".sourceSystem");
        sheetData2.addHeader(timeSeriesDataSheet2 + ".securityLevel");

        for (TimeSeriesDataMM timeSeriesDataMM : timeSeriesDataMMList) {
            List data = Arrays.asList(modelId, model.getDefinition(), "", timeSeriesDataMM.getResourceName(), timeSeriesDataMM.getResourceName(), timeSeriesDataMM.getResourceName(), timeSeriesDataMM.getDl1BusinessDomain(),
                    timeSeriesDataMM.getDl2ThemeDomain(), timeSeriesDataMM.getDl3BusinessObject(), timeSeriesDataMM.getDataMaster(), timeSeriesDataMM.getDataSteward(),
                    timeSeriesDataMM.getDataCollectionProtocol(), timeSeriesDataMM.getResourceId(),timeSeriesDataMM.getResourceId(), timeSeriesDataMM.getResourceSummary(),
                    timeSeriesDataMM.getSourceSystem(), timeSeriesDataMM.getSecurityLevel());

            sheetData2.addData(data);
        }

        //sheetData3数据
        SheetData sheetData3 = new SheetData(timeSeriesDataSheet3);
        sheetData3.addHeader(timeSeriesDataSheet2 + ".Id");
        sheetData3.addHeader(timeSeriesDataSheet2 + ".Name");
        sheetData3.addHeader(timeSeriesDataSheet3 + ".Id");
        sheetData3.addHeader(timeSeriesDataSheet3 + ".Name");
        sheetData3.addHeader(timeSeriesDataSheet3 + ".Definition");
        sheetData3.addHeader(timeSeriesDataSheet3 + ".LogicalName");
        sheetData3.addHeader(timeSeriesDataSheet3 + ".pointName");
        sheetData3.addHeader(timeSeriesDataSheet3 + ".dataType");
        sheetData3.addHeader(timeSeriesDataSheet3 + ".functionDescription");
        sheetData3.addHeader(timeSeriesDataSheet3 + ".measurementUnit");

        for (TimeSeriesDataMM timeSeriesDataMM : timeSeriesDataMMList) {
            String resourceName = timeSeriesDataMM.getResourceName();
            List<TimeSeriesPointMM> timeSeriesPointMMList = timeSeriesDataMM.getTimeSeriesPointMMList();
            if (!CollectionUtils.isEmpty(timeSeriesPointMMList)) {
                String name = model.getDefinition()+"."+resourceName;
                for (TimeSeriesPointMM timeSeriesPointMM : timeSeriesPointMMList) {
                    List data = Arrays.asList("", name, "", timeSeriesPointMM.getPointName(), timeSeriesPointMM.getPointName(),timeSeriesPointMM.getPointName(), timeSeriesPointMM.getPointName(),
                            timeSeriesPointMM.getDataType(), timeSeriesPointMM.getFunctionDescription(), timeSeriesPointMM.getMeasurementUnit());
                    sheetData3.addData(data);
                }
            }
        }
        List<SheetData> sheetDatas = new ArrayList<>();
        sheetDatas.add(sheetData1);
        sheetDatas.add(sheetData2);
        sheetDatas.add(sheetData3);

        Sheets sheets = new Sheets();
        sheets.setSheets(sheetDatas);
        String JsonData = mapper.writeValueAsString(sheets);
        ModelX jsonDataModelXC = metaModelDataService.loadDataModelXFromJson(modelId, JsonData);
        metaModelDataService.saveWithCompare(modelId, jsonDataModelXC, true);
    }



    @GetMapping("/export/result")
    public void exportBatchInfo( HttpServletResponse response) {
//        Map<String, List<List<Object>>> sheets = applyService.exportBatchAndDetails(batchId);
        List<SimilarityJobResult> all =(List<SimilarityJobResult>) similarityJobResultRepository.findAll();
        if (!CollectionUtils.isEmpty(all)){
            List<MetaDataSimilarityResultDto> resultDtos = new ArrayList<>();
            Map<String, List<List<Object>>> sheets = new LinkedHashMap<>();
            for (SimilarityJobResult similarityJobResult : all) {
                List<MetaDataSimilarityResultDto> columns = similarityJobResult.getColumns();
                resultDtos.addAll(columns);
            }
            Integer num  =1;
            for (List<MetaDataSimilarityResultDto> metaDataSimilarityResultDtos : Lists.partition(resultDtos, 1000000)) {
                sheets.put("sheet"+(num), ExcelUtil.getSheetData(metaDataSimilarityResultDtos));
                num ++;
            }
            ExcelUtil.exportManySheetByList(response, "相似度比较结果", sheets);

        }else {
            Map<String, List<List<Object>>> sheets = new LinkedHashMap<>();
            ExcelUtil.exportManySheetByList(response, "相似度比较结果", sheets);
        }

    }



}
