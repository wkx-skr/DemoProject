package com.datablau.reverse.engineering.worker.timeseriesmodel;

import cn.hutool.http.HttpResponse;
import cn.hutool.http.HttpUtil;
import com.andorj.common.core.model.ModelX;
import com.andorj.model.common.utility.BeanHelper;
import com.datablau.datasource.api.Datasource;
import com.datablau.metadata.main.service.metadata.api.MetaModelDataService;
import com.datablau.reverse.engineering.api.IdGetter;
import com.datablau.reverse.engineering.api.ReverseForwardStrategy;
import com.datablau.reverse.engineering.data.ReverseEngineeringKnownParameterType;
import com.datablau.reverse.engineering.data.ReverseForwardOptions;
import com.datablau.reverse.engineering.dto.TimeSeriesDataMM;
import com.datablau.reverse.engineering.dto.TimeSeriesModelMM;
import com.datablau.reverse.engineering.dto.covermm.SheetData;
import com.datablau.reverse.engineering.dto.covermm.Sheets;
import com.datablau.reverse.engineering.exception.ReverseEngineeringFailedException;
import com.datablau.reverse.engineering.utility.ProgressJob;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Lists;
import org.apache.curator.shaded.com.google.common.base.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class TimeSeriesModelWorker extends ProgressJob implements ReverseForwardStrategy {
    private Logger logger = LoggerFactory.getLogger(TimeSeriesModelWorker.class);
    private static final ObjectMapper mapper = new ObjectMapper();

    protected Datasource datasource;
    private IdGetter idGetter;
    private Long modelId;

    private String definition;

    private static final int PAGE_SIZE = 1000;

    private String timeSeriesDatasourceUrl;
    private ModelX currentModelX;

    private String timeSeriesDatasourceCollectName;
    private String timeSeriesModelUrl;

    private MetaModelDataService metaModelDataService;

    private String timeSeriesModelSheet1;
    private String timeSeriesModelSheet2;

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

        this.timeSeriesDatasourceUrl = datasource.getProperties().getParameter("timeSeriesDatasourceUrl");
        logger.info("timeSeriesDatasourceUrl:{}", timeSeriesDatasourceUrl);

        this.timeSeriesDatasourceCollectName = datasource.getProperties().getParameter("timeSeriesDatasourceCollectName");
        logger.info("timeSeriesDatasourceCollectName:{}", timeSeriesDatasourceCollectName);

        this.timeSeriesModelUrl = datasource.getProperties().getParameter("timeSeriesModelUrl");
        logger.info("timeSeriesModelUrl:{}", timeSeriesModelUrl);

        this.timeSeriesModelSheet1 = datasource.getProperties().getParameter("timeSeriesModelSheet1");
        logger.info("timeSeriesModelSheet1:{}", timeSeriesModelSheet1);

        this.timeSeriesModelSheet2 = datasource.getProperties().getParameter("timeSeriesModelSheet2");
        logger.info("timeSeriesModelSheet2:{}", timeSeriesModelSheet2);

        this.definition =  this.currentModelX.getName();
        logger.info("definition:{}", definition);
        this.modelId= this.currentModelX.getId();
        logger.info("modelId:{}", modelId);

        this.metaModelDataService = BeanHelper.getBean(MetaModelDataService.class);
        if (this.metaModelDataService == null) {
            throw new RuntimeException("cannot find MetaModelDataService");
        }

    }

    public void execute() throws Exception {

        this.checkStopSign();
        logger.info("执行时序模型任务开始");
        //获取时序数据源
        List<TimeSeriesDataMM> timeSeriesDataMMList = getTimeSeriesDataMMList();
        logger.info("获取时序数据源数据结束,共:{}条", timeSeriesDataMMList.size());

        Map<String, String> sourceMap = timeSeriesDataMMList.stream().collect(Collectors.toMap(TimeSeriesDataMM::getResourceId, TimeSeriesDataMM::getResourceName, (x1, x2) -> x1));
        //获取时序模型数据
        List<TimeSeriesModelMM> timeSeriesModelMMList = getTimeSeriesModelMMList();
        logger.info("获取时序模型数据结束,共:{}条", timeSeriesModelMMList.size());

        Map<String, List<TimeSeriesModelMM>> modelMap = timeSeriesModelMMList.stream().collect(Collectors.groupingBy(TimeSeriesModelMM::getModelName));

        //sheet1数据
        SheetData sheetData1 = new SheetData(timeSeriesModelSheet1);
        sheetData1.addHeader(timeSeriesModelSheet1 + ".Id");
        sheetData1.addHeader(timeSeriesModelSheet1 + ".Name");
        sheetData1.addHeader(timeSeriesModelSheet1 + ".Definition");
        sheetData1.addHeader(timeSeriesModelSheet1 + ".LogicalName");
        sheetData1.addData(List.of(modelId, definition, "", ""));

        //sheet2数据
        SheetData sheetData2 = new SheetData(timeSeriesModelSheet2);
        sheetData2.addHeader(timeSeriesModelSheet1 + ".Id");
        sheetData2.addHeader(timeSeriesModelSheet1 + ".Name");
        sheetData2.addHeader(timeSeriesModelSheet2 + ".Id");
        sheetData2.addHeader(timeSeriesModelSheet2 + ".Name");
        sheetData2.addHeader(timeSeriesModelSheet2 + ".Definition");
        sheetData2.addHeader(timeSeriesModelSheet2 + ".LogicalName");
        sheetData2.addHeader(timeSeriesModelSheet2 + ".modelName");
        sheetData2.addHeader(timeSeriesModelSheet2 + ".modelType");
        sheetData2.addHeader(timeSeriesModelSheet2 + ".remarks");
        sheetData2.addHeader(timeSeriesModelSheet2 + ".createTime");
        sheetData2.addHeader(timeSeriesModelSheet2 + ".creator");
        sheetData2.addHeader(timeSeriesModelSheet2 + ".securityLevel");
        sheetData2.addHeader(timeSeriesModelSheet2 + ".dl1BusinessDomain");

        //模型引用点位
        sheetData2.addHeader("timeModel.timeSeriesDataPoints");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (Map.Entry<String, List<TimeSeriesModelMM>> entry : modelMap.entrySet()) {
            List<TimeSeriesModelMM> modelMMS = entry.getValue();
            StringBuilder name = new StringBuilder();
            for (TimeSeriesModelMM modelMM : modelMMS) {
                String resourceId = modelMM.getResourceId();
                String resourceName = sourceMap.get(resourceId);
                if (!Strings.isNullOrEmpty(resourceName)) {
                    String pointName = modelMM.getPointName();
                    // 按照目前系统逻辑，项目经理提出将对方传过来的pointName中的 '.' 替换为 'の'
                    String replacedPointName = pointName.replace(".", "の");
                    name.append(timeSeriesDatasourceCollectName).append(".").append(resourceName).append(".").append(replacedPointName).append(",");
                }
            }
            if (!Strings.isNullOrEmpty(name.toString())) {
                name = new StringBuilder(name.substring(0, name.length() - 1));
            }
            TimeSeriesModelMM timeSeriesModelMM = modelMMS.get(0);
            String timestampStr = timeSeriesModelMM.getCreateTime();
            // 将时间戳字符串转换为 long 类型
            long timestamp = Long.parseLong(timestampStr);
            // 将毫秒级时间戳转换为 LocalDateTime
            LocalDateTime dateTime = LocalDateTime.ofInstant(Instant.ofEpochMilli(timestamp), ZoneId.systemDefault());
            String formattedDateTime = dateTime.format(formatter);
            List data =  Arrays.asList(modelId, definition, "", timeSeriesModelMM.getModelName(),
                    timeSeriesModelMM.getComment(), timeSeriesModelMM.getModelName(), timeSeriesModelMM.getModelName(),
                    timeSeriesModelMM.getModelType(), timeSeriesModelMM.getRemarks(), formattedDateTime,
                    timeSeriesModelMM.getCreator(), timeSeriesModelMM.getSecurityLevel(),timeSeriesModelMM.getDl1BusinessDomain(), name.toString());
            sheetData2.addData(data);
        }
        List<SheetData> sheetDatas = new ArrayList<>();
        sheetDatas.add(sheetData1);
        sheetDatas.add(sheetData2);
        Sheets sheets = new Sheets();
        sheets.setSheets(sheetDatas);

        String JsonData = mapper.writeValueAsString(sheets);
        this.checkStopSign();
        ModelX jsonDataModelXC = metaModelDataService.loadDataModelXFromJson(modelId, JsonData);
        metaModelDataService.saveWithCompare(modelId, jsonDataModelXC, true);
        logger.info("执行时序模型任务结束");
    }


    /**
     * 获取时序数据源
     * @return
     */
    private List<TimeSeriesDataMM> getTimeSeriesDataMMList() {
        int page = 0;
        List<TimeSeriesDataMM> timeSeriesDataMMList = Lists.newArrayList();
        while (true) {
            String url = timeSeriesDatasourceUrl +"&page=" + page + "&size=" + PAGE_SIZE;
            logger.info("data url:{}", url);
            String resp = sendRequestOfTimeSeriesPage(url);
            try {
                List<TimeSeriesDataMM> timeSeriesDataMMS = mapper.readValue(resp, new TypeReference<List<TimeSeriesDataMM>>() {
                });
                if (timeSeriesDataMMS == null || timeSeriesDataMMS.isEmpty()) {
                    break;
                }
                timeSeriesDataMMList.addAll(timeSeriesDataMMS);
                page++;
            } catch (Exception e) {
                logger.error("getTimeSeriesDataMMList失败", e);
                throw new RuntimeException(e);
            }
        }
        return timeSeriesDataMMList;
    }


    /**
     * 获取时序模型
     * @return
     */
    private List<TimeSeriesModelMM> getTimeSeriesModelMMList() {
        int page = 0;
        List<TimeSeriesModelMM> timeSeriesModelMMList = Lists.newArrayList();
        while (true) {
            String url = timeSeriesModelUrl +"&page=" + page + "&size=" + PAGE_SIZE;
            logger.info("model url:{}", url);
            String resp = sendRequestOfTimeSeriesPage(url);
            try {
                List<TimeSeriesModelMM> timeSeriesModelMMS = mapper.readValue(resp, new TypeReference<List<TimeSeriesModelMM>>() {
                });
                if (timeSeriesModelMMS == null || timeSeriesModelMMS.isEmpty()) {
                    break;
                }
                timeSeriesModelMMList.addAll(timeSeriesModelMMS);
                page++;
            } catch (Exception e) {
                logger.error("getTimeSeriesModelMMList失败", e);
                throw new RuntimeException(e);
            }
        }
        return timeSeriesModelMMList;
    }

    private String sendRequestOfTimeSeriesPage(String url) {

        try (HttpResponse response = HttpUtil.createGet(url).execute()) {
            // 获取响应体的内容
            String responseBody = response.body();
            return responseBody;
        } catch (Exception e) {
            logger.error("请求sendRequestOfTimeSeriesPage接口失败：", e);
            throw e;
        }
    }


    @Override
    public void setIdGetter(IdGetter idGetter) {
        this.idGetter = idGetter;
    }

    @Override
    public String getType() {
        return "TIMESERIESMODEL";
    }

    @Override
    public boolean canHandleDatasource(Datasource datasource) {
        return datasource.getType().equals(getType());
    }
}
