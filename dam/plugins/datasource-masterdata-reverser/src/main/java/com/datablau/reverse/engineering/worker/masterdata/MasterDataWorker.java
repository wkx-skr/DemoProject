package com.datablau.reverse.engineering.worker.masterdata;

import cn.hutool.http.HttpResponse;
import cn.hutool.http.HttpUtil;
import com.andorj.common.core.model.ModelX;
import com.andorj.model.common.utility.BeanHelper;
import com.datablau.datasource.api.Datasource;
import com.datablau.metadata.main.service.metadata.api.MetaModelDataService;
import com.datablau.reverse.engineering.api.IdGetter;
import com.datablau.reverse.engineering.api.ReverseForwardStrategy;
import com.datablau.reverse.engineering.data.ReverseForwardOptions;
import com.datablau.reverse.engineering.dto.MasterDataFieldsMM;
import com.datablau.reverse.engineering.dto.MasterDataMM;
import com.datablau.reverse.engineering.dto.covermm.SheetData;
import com.datablau.reverse.engineering.dto.covermm.Sheets;
import com.datablau.reverse.engineering.exception.ReverseEngineeringFailedException;
import com.datablau.reverse.engineering.utility.ProgressJob;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MasterDataWorker extends ProgressJob implements ReverseForwardStrategy {

    private Logger logger = LoggerFactory.getLogger(MasterDataWorker.class);

    private static final ObjectMapper mapper = new ObjectMapper();

    protected Datasource datasource;

    private ModelX currentModelX;

    private String masterDataUrl;
    private String masterDataSheet1;
    private String masterDataSheet2;
    private String masterDataSheet3;
    private MetaModelDataService metaModelDataService;

    private IdGetter idGetter;
    private Long modelId;

    private String definition;


    @Override
    public ModelX reverseEngineer(ModelX modelX, Datasource datasource, ReverseForwardOptions reverseForwardOptions) throws ReverseEngineeringFailedException {
        this.datasource = datasource;
        this.currentModelX = modelX;
        try {
            this.prepare();
            this.execute();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return null;
    }

    public void prepare() {
        this.definition =  this.currentModelX.getName();
        logger.info("definition:{}", definition);
        this.modelId= this.currentModelX.getId();
        logger.info("modelId:{}", modelId);

        this.masterDataUrl = datasource.getProperties().getParameter("masterDataUrl");
        logger.info("masterDataUrl:{}", masterDataUrl);
        this.masterDataSheet1 = datasource.getProperties().getParameter("masterDataSheet1");
        logger.info("masterDataSheet1:{}", masterDataSheet1);
        this.masterDataSheet2 = datasource.getProperties().getParameter("masterDataSheet2");
        logger.info("masterDataSheet2:{}", masterDataSheet2);
        this.masterDataSheet3 = datasource.getProperties().getParameter("masterDataSheet3");
        logger.info("masterDataSheet3:{}", masterDataSheet3);

        this.metaModelDataService = BeanHelper.getBean(MetaModelDataService.class);
        if (this.metaModelDataService == null) {
            throw new RuntimeException("cannot find MetaModelDataService");
        }
    }

    public void execute() throws Exception{
        this.checkStopSign();
        logger.info("执行主数据任务开始");

        //取主数据
        List<MasterDataMM> masterDataMMS = getMasterDataMMList();
        this.checkStopSign();

        //存入元模型
        //sheet1数据
        SheetData sheetData1 = new SheetData(masterDataSheet1);
        sheetData1.addHeader(masterDataSheet1 + ".Id");
        sheetData1.addHeader(masterDataSheet1 + ".Name");
        sheetData1.addHeader(masterDataSheet1 + ".Definition");
        sheetData1.addHeader(masterDataSheet1 + ".LogicalName");
        sheetData1.addData(List.of(modelId, definition, "", ""));

        //sheet2数据
        SheetData sheetData2 = new SheetData(masterDataSheet2);
        sheetData2.addHeader(masterDataSheet1 + ".Id");
        sheetData2.addHeader(masterDataSheet1 + ".Name");
        sheetData2.addHeader(masterDataSheet2 + ".Id");
        sheetData2.addHeader(masterDataSheet2 + ".Name");
        sheetData2.addHeader(masterDataSheet2 + ".Definition");
        sheetData2.addHeader(masterDataSheet2 + ".LogicalName");
        sheetData2.addHeader(masterDataSheet2 + ".ip");
        sheetData2.addHeader(masterDataSheet2 + ".database");
        sheetData2.addHeader(masterDataSheet2 + ".schemaName");
        sheetData2.addHeader(masterDataSheet2 + ".tableEnglishName");
        sheetData2.addHeader(masterDataSheet2 + ".tableChineseName");
        sheetData2.addHeader(masterDataSheet2 + ".businessDescription");
        sheetData2.addHeader(masterDataSheet2 + ".useDescription");
        sheetData2.addHeader(masterDataSheet2 + ".businessDomain");
        sheetData2.addHeader(masterDataSheet2 + ".securityLevel");
        sheetData2.addHeader(masterDataSheet2 + ".dataDomain");
        sheetData2.addHeader(masterDataSheet2 + ".businessProcess");
        sheetData2.addHeader(masterDataSheet2 + ".tableManager");
        sheetData2.addHeader(masterDataSheet2 + ".creationDate");
        sheetData2.addHeader(masterDataSheet2 + ".modificationDate");
        sheetData2.addHeader(masterDataSheet2 + ".dataSize");
        sheetData2.addHeader(masterDataSheet2 + ".dataCount");
        sheetData2.addHeader(masterDataSheet2 + ".upstreamSystem");
        sheetData2.addHeader(masterDataSheet2 + ".downstreamSystem");

        for (MasterDataMM masterDataMM : masterDataMMS) {
            List data = Arrays.asList(modelId, definition, "", masterDataMM.getTableEnglishName(), masterDataMM.getTableChineseName(), masterDataMM.getTableChineseName(),
                    masterDataMM.getIp(), masterDataMM.getDatabase(), masterDataMM.getSchemaName(), masterDataMM.getTableEnglishName(),
                    masterDataMM.getTableChineseName(), masterDataMM.getBusinessDescription(), masterDataMM.getUseDescription(),
                    masterDataMM.getBusinessDomain(), masterDataMM.getSecurityLevel(), masterDataMM.getDataDomain(),
                    masterDataMM.getBusinessProcess(), masterDataMM.getTableManager(), masterDataMM.getCreationDate(),
                    masterDataMM.getModificationDate(), masterDataMM.getDataSize(), masterDataMM.getDataCount(),
                    masterDataMM.getUpstreamSystem(), masterDataMM.getDownstreamSystem());

            sheetData2.addData(data);
        }

        //sheet3数据
        SheetData sheetData3 = new SheetData(masterDataSheet3);
        sheetData3.addHeader(masterDataSheet2 + ".Id");
        sheetData3.addHeader(masterDataSheet2 + ".Name");
        sheetData3.addHeader(masterDataSheet3 + ".Id");
        sheetData3.addHeader(masterDataSheet3 + ".Name");
        sheetData3.addHeader(masterDataSheet3 + ".Definition");
        sheetData3.addHeader(masterDataSheet3 + ".LogicalName");
        sheetData3.addHeader(masterDataSheet3 + ".ip");
        sheetData3.addHeader(masterDataSheet3 + ".database");
        sheetData3.addHeader(masterDataSheet3 + ".schemaName");
        sheetData3.addHeader(masterDataSheet3 + ".fieldCode");
        sheetData3.addHeader(masterDataSheet3 + ".fieldName");
        sheetData3.addHeader(masterDataSheet3 + ".fieldDescription");
        sheetData3.addHeader(masterDataSheet3 + ".fieldType");
        sheetData3.addHeader(masterDataSheet3 + ".fieldLength");
        sheetData3.addHeader(masterDataSheet3 + ".fieldAccuracy");
        sheetData3.addHeader(masterDataSheet3 + ".isPartitionField");
        sheetData3.addHeader(masterDataSheet3 + ".isPrimaryKey");
        sheetData3.addHeader(masterDataSheet3 + ".isForeignKey");
        sheetData3.addHeader(masterDataSheet3 + ".isNull");
        sheetData3.addHeader(masterDataSheet3 + ".securityLevel");
        sheetData3.addHeader(masterDataSheet3 + ".defaultValue");
        sheetData3.addHeader(masterDataSheet3 + ".enumeration");

        for (MasterDataMM masterDataMM : masterDataMMS) {

            String tableEnglishName = masterDataMM.getTableEnglishName();
            String name = definition+"."+tableEnglishName;
            List<MasterDataFieldsMM> fields = masterDataMM.getFields();
            for (MasterDataFieldsMM masterDataFieldsMM : fields) {
                List data = Arrays.asList("", name, "", masterDataFieldsMM.getFieldCode(), masterDataFieldsMM.getFieldName(),
                        masterDataFieldsMM.getFieldName(), masterDataFieldsMM.getIp(), masterDataFieldsMM.getDatabase(),
                        masterDataFieldsMM.getSchemaName(), masterDataFieldsMM.getFieldCode(),masterDataFieldsMM.getFieldName(),
                        masterDataFieldsMM.getFieldDescription(), masterDataFieldsMM.getFieldType(), masterDataFieldsMM.getFieldLength(),
                        masterDataFieldsMM.getFieldAccuracy(), masterDataFieldsMM.getIsPartitionField(),
                        masterDataFieldsMM.getIsPrimaryKey(), masterDataFieldsMM.getIsForeignKey(), masterDataFieldsMM.getIsNull(),
                        masterDataFieldsMM.getSecurityLevel(), masterDataFieldsMM.getDefaultValue(), masterDataFieldsMM.getEnumeration());
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
        this.checkStopSign();
        ModelX jsonDataModelXC = metaModelDataService.loadDataModelXFromJson(modelId, JsonData);
        metaModelDataService.saveWithCompare(modelId, jsonDataModelXC, true);

        logger.info("执行主数据任务结束");
    }

    private List<MasterDataMM> getMasterDataMMList() throws Exception {
        List<MasterDataMM> masterDataMMS = Lists.newArrayList();
        String responseBody;
        try (HttpResponse response = HttpUtil.createGet(masterDataUrl).execute()) {
            // 获取响应体的内容
            responseBody = response.body();
        } catch (Exception e) {
            logger.error("请求主数据接口失败：", e);
            throw e;
        }
        if (!Strings.isNullOrEmpty(responseBody)) {
            JsonNode rootNode = mapper.readTree(responseBody);
            String msgJson = rootNode.path("msg").asText();
            if (!Strings.isNullOrEmpty(msgJson)) {
                masterDataMMS = mapper.readValue(msgJson, new TypeReference<List<MasterDataMM>>() {});
            }

        }
        return masterDataMMS;
    }





    @Override
    public void setIdGetter(IdGetter idGetter) {
        this.idGetter = idGetter;
    }

    @Override
    public String getType() {
        return "MASTERDATA";
    }

    @Override
    public boolean canHandleDatasource(Datasource datasource) {
        return false;
    }

    public static void main(String[] args) throws Exception{
        String s = "{\n" +
                "\t\"body\": null,\n" +
                "\t\"businessCode\": \"\",\n" +
                "\t\"code\": \"0\",\n" +
                "\t\"cookie\": \"\",\n" +
                "\t\"env\": \"\",\n" +
                "\t\"modeId\": \"\",\n" +
                "\t\"msg\": \"[{\\\"ip\\\":\\\"10.40.243.34\\\",\\\"database\\\":\\\"OceanBase\\\",\\\"schemaName\\\":\\\"indata\\\",\\\"tableEnglishName\\\":\\\"busi_99\\\",\\\"tableChineseName\\\":\\\"商业伙伴主数据\\\",\\\"businessDescription\\\":\\\"\\\",\\\"useDescription\\\":\\\"\\\",\\\"businessDomain\\\":\\\"D02市场到回款\\\",\\\"securityLevel\\\":\\\"3\\\",\\\"dataDomain\\\":\\\"\\\",\\\"businessProcess\\\":\\\"\\\",\\\"tableManager\\\":\\\"root\\\",\\\"creationDate\\\":\\\"2025-08-05 15:21:37\\\",\\\"modificationDate\\\":\\\"2025-08-05 15:25:47\\\",\\\"dataSize\\\":\\\"134217728\\\",\\\"dataCount\\\":\\\"162986\\\",\\\"fields\\\":[{\\\"ip\\\":\\\"10.40.243.34\\\",\\\"database\\\":\\\"OceanBase\\\",\\\"schemaName\\\":\\\"indata\\\",\\\"tableEnglishName\\\":\\\"busi_99\\\",\\\"fieldCode\\\":\\\"busi_id\\\",\\\"fieldName\\\":\\\"主键ID\\\",\\\"fieldDescription\\\":\\\"\\\",\\\"fieldType\\\":\\\"varchar\\\",\\\"fieldLength\\\":\\\"32\\\",\\\"fieldAccuracy\\\":\\\"\\\",\\\"isPartitionField\\\":\\\"否\\\",\\\"isPrimaryKey\\\":\\\"是\\\",\\\"isForeignKey\\\":\\\"否\\\",\\\"isNull\\\":\\\"否\\\",\\\"securityLevel\\\":\\\"3\\\",\\\"defaultValue\\\":\\\"\\\",\\\"enumeration\\\":\\\"\\\"},{\\\"ip\\\":\\\"10.40.243.34\\\",\\\"database\\\":\\\"OceanBase\\\",\\\"schemaName\\\":\\\"indata\\\",\\\"tableEnglishName\\\":\\\"busi_99\\\",\\\"fieldCode\\\":\\\"busi_md_state\\\",\\\"fieldName\\\":\\\"主数据状态（0：已发布；1：已停用；2：草稿:3：审核中:4：审核拒绝；5：审核通过；6：审核拒绝已编辑；7：已归档）\\\",\\\"fieldDescription\\\":\\\"\\\",\\\"fieldType\\\":\\\"varchar\\\",\\\"fieldLength\\\":\\\"6\\\",\\\"fieldAccuracy\\\":\\\"\\\",\\\"isPartitionField\\\":\\\"否\\\",\\\"isPrimaryKey\\\":\\\"否\\\",\\\"isForeignKey\\\":\\\"否\\\",\\\"isNull\\\":\\\"是\\\",\\\"securityLevel\\\":\\\"3\\\",\\\"defaultValue\\\":\\\"\\\",\\\"enumeration\\\":\\\"\\\"},{\\\"ip\\\":\\\"10.40.243.34\\\",\\\"database\\\":\\\"OceanBase\\\",\\\"schemaName\\\":\\\"indata\\\",\\\"tableEnglishName\\\":\\\"busi_99\\\",\\\"fieldCode\\\":\\\"busi_md_state_name\\\",\\\"fieldName\\\":\\\"主数据状态名称\\\",\\\"fieldDescription\\\":\\\"\\\",\\\"fieldType\\\":\\\"varchar\\\",\\\"fieldLength\\\":\\\"48\\\",\\\"fieldAccuracy\\\":\\\"\\\",\\\"isPartitionField\\\":\\\"否\\\",\\\"isPrimaryKey\\\":\\\"否\\\",\\\"isForeignKey\\\":\\\"否\\\",\\\"isNull\\\":\\\"是\\\",\\\"securityLevel\\\":\\\"3\\\",\\\"defaultValue\\\":\\\"\\\",\\\"enumeration\\\":\\\"\\\"},{\\\"ip\\\":\\\"10.40.243.34\\\",\\\"database\\\":\\\"OceanBase\\\",\\\"schemaName\\\":\\\"indata\\\",\\\"tableEnglishName\\\":\\\"busi_99\\\",\\\"fieldCode\\\":\\\"busi_history_table_state\\\",\\\"fieldName\\\":\\\"历史表状态（0：已发布；1：已停用；2：草稿:3：审核中:4：审核拒绝；5：审核通过；6：审核拒绝已编辑；7：已归档）\\\",\\\"fieldDescription\\\":\\\"\\\",\\\"fieldType\\\":\\\"varchar\\\",\\\"fieldLength\\\":\\\"6\\\",\\\"fieldAccuracy\\\":\\\"\\\",\\\"isPartitionField\\\":\\\"否\\\",\\\"isPrimaryKey\\\":\\\"否\\\",\\\"isForeignKey\\\":\\\"否\\\",\\\"isNull\\\":\\\"是\\\",\\\"securityLevel\\\":\\\"3\\\",\\\"defaultValue\\\":\\\"\\\",\\\"enumeration\\\":\\\"\\\"}]\"\n" +
                "}";
        JsonNode rootNode = mapper.readTree(s);
        String msgJson = rootNode.path("msg").asText();
        if (!Strings.isNullOrEmpty(msgJson)) {
            List<MasterDataMM> masterDataMMS  = mapper.readValue(msgJson, new TypeReference<List<MasterDataMM>>() {});
            System.out.println("masterDataMMS = " + masterDataMMS);
        }
    }
}
