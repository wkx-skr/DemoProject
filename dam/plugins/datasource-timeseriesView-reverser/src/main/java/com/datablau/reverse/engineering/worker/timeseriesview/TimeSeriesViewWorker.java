package com.datablau.reverse.engineering.worker.timeseriesview;

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
import com.datablau.reverse.engineering.dto.TimeSeriesViewMM;
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

public class TimeSeriesViewWorker extends ProgressJob implements ReverseForwardStrategy {
    private Logger logger = LoggerFactory.getLogger(TimeSeriesViewWorker.class);
    private static final ObjectMapper mapper = new ObjectMapper();

    protected Datasource datasource;

    private ModelX currentModelX;

    private IdGetter idGetter;
    private Long modelId;

    private String definition;

    private static final int PAGE_SIZE = 1000;

    private String timeSeriesDatasourceUrl;
    private String timeSeriesDatasourceCollectName;
    private String timeSeriesViewUrl;

    private MetaModelDataService metaModelDataService;

    private String timeSeriesViewSheet1;
    private String timeSeriesViewSheet2;



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

        this.timeSeriesViewUrl = datasource.getProperties().getParameter("timeSeriesViewUrl");
        logger.info("timeSeriesViewUrl:{}", timeSeriesViewUrl);

        this.timeSeriesViewSheet1 = datasource.getProperties().getParameter("timeSeriesViewSheet1");
        logger.info("timeSeriesViewSheet1:{}", timeSeriesViewSheet1);

        this.timeSeriesViewSheet2 = datasource.getProperties().getParameter("timeSeriesViewSheet2");
        logger.info("timeSeriesViewSheet2:{}", timeSeriesViewSheet2);

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
        logger.info("执行时序视图任务开始");
        //获取时序数据源
        List<TimeSeriesDataMM> timeSeriesDataMMList = getTimeSeriesDataMMList();
        logger.info("获取时序数据源数据结束,共{}条", timeSeriesDataMMList.size());
        Map<String, String> sourceMap = timeSeriesDataMMList.stream().collect(Collectors.toMap(TimeSeriesDataMM::getResourceId, TimeSeriesDataMM::getResourceName, (x1, x2) -> x1));

        //获取时序视图数据
        List<TimeSeriesViewMM> timeSeriesViewMMList = getTimeSeriesViewMMList();
        logger.info("获取时序视图数据结束,共{}条", timeSeriesViewMMList.size());
        Map<String, List<TimeSeriesViewMM>> viewMap = timeSeriesViewMMList.stream().collect(Collectors.groupingBy(TimeSeriesViewMM::getViewId));

        //存入元模型
        //sheet1数据
        SheetData sheetData1 = new SheetData(timeSeriesViewSheet1);
        sheetData1.addHeader(timeSeriesViewSheet1 + ".Id");
        sheetData1.addHeader(timeSeriesViewSheet1 + ".Name");
        sheetData1.addHeader(timeSeriesViewSheet1 + ".Definition");
        sheetData1.addHeader(timeSeriesViewSheet1 + ".LogicalName");
        sheetData1.addData(List.of(modelId, definition, "", ""));

        //sheet2数据
        SheetData sheetData2 = new SheetData(timeSeriesViewSheet2);
        sheetData2.addHeader(timeSeriesViewSheet1 + ".Id");
        sheetData2.addHeader(timeSeriesViewSheet1 + ".Name");
        sheetData2.addHeader(timeSeriesViewSheet2 + ".Id");
        sheetData2.addHeader(timeSeriesViewSheet2 + ".Name");
        sheetData2.addHeader(timeSeriesViewSheet2 + ".Definition");
        sheetData2.addHeader(timeSeriesViewSheet2 + ".LogicalName");
        sheetData2.addHeader(timeSeriesViewSheet2 + ".viewName");
        sheetData2.addHeader(timeSeriesViewSheet2 + ".createTime");
        sheetData2.addHeader(timeSeriesViewSheet2 + ".securityLevel");
        sheetData2.addHeader(timeSeriesViewSheet2 + ".viewId");
        sheetData2.addHeader(timeSeriesViewSheet2 + ".dl1BusinessDomain");

        //视图引用点位
        sheetData2.addHeader("timeView.timeSeriesDataPoints");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (Map.Entry<String, List<TimeSeriesViewMM>> entry : viewMap.entrySet()) {
            List<TimeSeriesViewMM> viewMMList = entry.getValue();
            StringBuilder name = new StringBuilder();
            for (TimeSeriesViewMM timeSeriesViewMM : viewMMList) {
                String resourceId = timeSeriesViewMM.getResourceId();
                String resourceName = sourceMap.get(resourceId);
                if (!Strings.isNullOrEmpty(resourceName)) {
                    String pointName = timeSeriesViewMM.getPointName();
                    // 按照目前系统逻辑，项目经理提出将对方传过来的pointName中的 '.' 替换为 'の'
                    String replacedPointName = pointName.replace(".", "の");
                    name.append(timeSeriesDatasourceCollectName).append(".").append(resourceName).append(".").append(replacedPointName).append(",");
                }
            }
            if (!Strings.isNullOrEmpty(name.toString())) {
                name = new StringBuilder(name.substring(0, name.length() - 1));
            }
            TimeSeriesViewMM timeSeriesViewMM = viewMMList.get(0);
            String timestampStr = timeSeriesViewMM.getCreateTime();
            // 将时间戳字符串转换为 long 类型
            long timestamp = Long.parseLong(timestampStr);
            // 将毫秒级时间戳转换为 LocalDateTime
            LocalDateTime dateTime = LocalDateTime.ofInstant(Instant.ofEpochMilli(timestamp), ZoneId.systemDefault());
            String formattedDateTime = dateTime.format(formatter);

            List data =  Arrays.asList(modelId, definition, "", timeSeriesViewMM.getViewName(), timeSeriesViewMM.getComment(),
                    timeSeriesViewMM.getViewName(), timeSeriesViewMM.getViewName(), formattedDateTime, timeSeriesViewMM.getSecurityLevel(),
                    timeSeriesViewMM.getViewId(), timeSeriesViewMM.getDl1BusinessDomain(), name.toString());
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
        logger.info("执行时序视图任务结束");
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
     * 获取时序数据源
     * @return
     */
    private List<TimeSeriesViewMM> getTimeSeriesViewMMList() {
        int page = 0;
        List<TimeSeriesViewMM> timeSeriesViewMMList = Lists.newArrayList();
        while (true) {
            String url = timeSeriesViewUrl + "&page=" + page + "&size=" + PAGE_SIZE;
            logger.info("view url:{}", url);
            String resp = sendRequestOfTimeSeriesPage(url);
            try {
                List<TimeSeriesViewMM> timeSeriesViewMMS = mapper.readValue(resp, new TypeReference<List<TimeSeriesViewMM>>() {
                });
                if (timeSeriesViewMMS == null || timeSeriesViewMMS.isEmpty()) {
                    break;
                }
                timeSeriesViewMMList.addAll(timeSeriesViewMMS);
                page++;
            } catch (Exception e) {
                logger.error("getTimeSeriesViewMMList失败", e);
                throw new RuntimeException(e);
            }
        }
        return timeSeriesViewMMList;
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
        return "TIMESERIESVIEW";
    }

    @Override
    public boolean canHandleDatasource(Datasource datasource) {
        return datasource.getType().equals(getType());
    }
}
