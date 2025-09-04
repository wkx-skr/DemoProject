package com.datablau.reverse.engineering.worker.timeseries;

import cn.hutool.http.HttpResponse;
import cn.hutool.http.HttpUtil;
import com.andorj.common.core.model.ModelX;
import com.andorj.model.common.utility.BeanHelper;
import com.datablau.datasource.api.Datasource;
import com.datablau.job.scheduler.data.DatablauJobExecutionException;
import com.datablau.metadata.main.dao.model.ModelRepository;

import com.datablau.metadata.main.entity.model.Model;
import com.datablau.metadata.main.service.metadata.api.MetaModelDataService;
import com.datablau.reverse.engineering.api.IdGetter;
import com.datablau.reverse.engineering.api.ReverseForwardStrategy;
import com.datablau.reverse.engineering.data.ReverseEngineeringKnownParameterType;
import com.datablau.reverse.engineering.data.ReverseForwardOptions;
import com.datablau.reverse.engineering.dto.TimeSeriesDataMM;
import com.datablau.reverse.engineering.dto.TimeSeriesModelMM;
import com.datablau.reverse.engineering.dto.TimeSeriesPointMM;
import com.datablau.reverse.engineering.dto.TimeSeriesViewMM;
import com.datablau.reverse.engineering.dto.covermm.SheetData;
import com.datablau.reverse.engineering.dto.covermm.Sheets;
import com.datablau.reverse.engineering.exception.ReverseEngineeringFailedException;
import com.datablau.reverse.engineering.utility.ProgressJob;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public class TimeSeriesDataWorker extends ProgressJob implements ReverseForwardStrategy {
    private Logger logger = LoggerFactory.getLogger(TimeSeriesDataWorker.class);
    private static final ObjectMapper mapper = new ObjectMapper();

    protected Datasource datasource;

    private ModelX currentModelX;

    private IdGetter idGetter;
    private Long modelId;

    private String definition;

    private static final int PAGE_SIZE = 1000;

    private String timeSeriesDatasourceUrl;
    private String timeSeriesPointUrl;
    private MetaModelDataService metaModelDataService;
    private String timeSeriesDataSheet1;
    private String timeSeriesDataSheet2;
    private String timeSeriesDataSheet3;


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
        this.timeSeriesPointUrl = datasource.getProperties().getParameter("timeSeriesPointUrl");
        logger.info("timeSeriesPointUrl:{}", timeSeriesPointUrl);
        this.timeSeriesDataSheet1 =  datasource.getProperties().getParameter("timeSeriesDataSheet1");
        logger.info("timeSeriesDataSheet1:{}", timeSeriesDataSheet1);
        this.timeSeriesDataSheet2 =  datasource.getProperties().getParameter("timeSeriesDataSheet2");
        logger.info("timeSeriesDataSheet2:{}", timeSeriesDataSheet2);
        this.timeSeriesDataSheet3 =  datasource.getProperties().getParameter("timeSeriesDataSheet3");
        logger.info("timeSeriesDataSheet3:{}", timeSeriesDataSheet3);
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
        logger.info("执行时序数据源任务开始");
        //获取时序数据源
        List<TimeSeriesDataMM> timeSeriesDataMMList = getTimeSeriesDataMMList();
        //获取时序点位
        List<TimeSeriesPointMM> timeSeriesPointMMList = getTimeSeriesPointMMList();
        Map<String, List<TimeSeriesPointMM>> pointMap = timeSeriesPointMMList.stream().collect(Collectors.groupingBy(TimeSeriesPointMM::getResourceId));

        //存入元模型

        //sheet1数据
        SheetData sheetData1 = new SheetData(timeSeriesDataSheet1);
        sheetData1.addHeader(timeSeriesDataSheet1 + ".Id");
        sheetData1.addHeader(timeSeriesDataSheet1 + ".Name");
        sheetData1.addHeader(timeSeriesDataSheet1 + ".Definition");
        sheetData1.addHeader(timeSeriesDataSheet1 + ".LogicalName");
        sheetData1.addData(List.of(modelId, definition, "", ""));

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
            List data = Arrays.asList(modelId, definition, "", timeSeriesDataMM.getResourceName(), timeSeriesDataMM.getResourceName(), timeSeriesDataMM.getResourceName(), timeSeriesDataMM.getDl1BusinessDomain(),
                    timeSeriesDataMM.getDl2ThemeDomain(), timeSeriesDataMM.getDl3BusinessObject(), timeSeriesDataMM.getDataMaster(), timeSeriesDataMM.getDataSteward(),
                    timeSeriesDataMM.getDataCollectionProtocol(), timeSeriesDataMM.getResourceId(), timeSeriesDataMM.getResourceName(), timeSeriesDataMM.getResourceSummary(),
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
            String resourceId = timeSeriesDataMM.getResourceId();
            String resourceName = timeSeriesDataMM.getResourceName();
            List<TimeSeriesPointMM> timeSeriesPointMMS = pointMap.get(resourceId);
            if (!CollectionUtils.isEmpty(timeSeriesPointMMS)) {
                String name = definition+"."+resourceName;
                for (TimeSeriesPointMM timeSeriesPointMM : timeSeriesPointMMS) {
                    String pointName = timeSeriesPointMM.getPointName();
                    // 按照目前系统逻辑，项目经理提出将对方传过来的pointName中的 '.' 替换为 'の'
                    String replacedPointName = pointName.replace(".", "の");
                    List data = Arrays.asList("", name, "", replacedPointName, replacedPointName, replacedPointName, replacedPointName,
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
        this.checkStopSign();
        ModelX jsonDataModelXC = metaModelDataService.loadDataModelXFromJson(modelId, JsonData);
        metaModelDataService.saveWithCompare(modelId, jsonDataModelXC, true);
        logger.info("执行时序数据源任务结束");
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
     * 获取时序点位
     * @return
     */
    private List<TimeSeriesPointMM> getTimeSeriesPointMMList() {
        int page = 0;
        List<TimeSeriesPointMM> timeSeriesDataMMList = Lists.newArrayList();
        while (true) {
            String url = timeSeriesPointUrl +"&page=" + page + "&size=" + PAGE_SIZE;
            logger.info("point url:{}", url);
            String resp = sendRequestOfTimeSeriesPage(url);
            try {
                List<TimeSeriesPointMM> timeSeriesPointMMS = mapper.readValue(resp, new TypeReference<List<TimeSeriesPointMM>>() {
                });
                if (timeSeriesPointMMS == null || timeSeriesPointMMS.isEmpty()) {
                    break;
                }
                timeSeriesDataMMList.addAll(timeSeriesPointMMS);
                page++;
            } catch (Exception e) {
                logger.error("getTimeSeriesPointMMList失败", e);
                throw new RuntimeException(e);
            }
        }
        return timeSeriesDataMMList;
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
        return "TIMESERIES";
    }

    @Override
    public boolean canHandleDatasource(Datasource datasource) {
        return datasource.getType().equals(getType());
    }
}
