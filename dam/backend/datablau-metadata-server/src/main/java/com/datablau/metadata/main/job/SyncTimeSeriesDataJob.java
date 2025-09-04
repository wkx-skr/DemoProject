package com.datablau.metadata.main.job;

import cn.hutool.http.HttpException;
import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.http.HttpUtil;
import com.andorj.common.core.model.ModelX;
import com.andorj.model.common.utility.BeanHelper;
import com.datablau.job.scheduler.adapter.DatablauJobAdapter;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.job.scheduler.data.DatablauJobExecutionException;
import com.datablau.metadata.main.dao.model.ModelRepository;
import com.datablau.metadata.main.dto.covermm.SheetData;
import com.datablau.metadata.main.dto.covermm.Sheets;
import com.datablau.metadata.main.dto.mm.TimeSeriesDataMM;
import com.datablau.metadata.main.dto.mm.TimeSeriesModelMM;
import com.datablau.metadata.main.dto.mm.TimeSeriesPointMM;
import com.datablau.metadata.main.dto.mm.TimeSeriesViewMM;
import com.datablau.metadata.main.entity.model.Model;
import com.datablau.metadata.main.job.descriptor.SyncTimeSeriesDataJobDescriptor;
import com.datablau.metadata.main.service.metadata.api.MetaModelDataService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.util.CollectionUtils;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public class SyncTimeSeriesDataJob extends DatablauJobAdapter {
    private Logger logger = LoggerFactory.getLogger(SyncTimeSeriesDataJob.class);
    private static final ObjectMapper mapper = new ObjectMapper();

    private Long modelId;
    private Long viewModelId; //时序视图数据源ID
    private Long timeSeriesModelOfModelId; //时序模型数据源ID

    private static final int PAGE_SIZE = 1000;

    private String BASE_URL="";

    private ModelRepository dataModelRepo;

    private MetaModelDataService metaModelDataService;


    private String timeSeriesDataSheet1;
    private String timeSeriesDataSheet2;
    private String timeSeriesDataSheet3;
    private String timeSeriesViewSheet1;
    private String timeSeriesViewSheet2;

    private String timeSeriesModelSheet1;
    private String timeSeriesModelSheet2;

    private String timeSeriesDataCollectName; //时序数据源采集名称

    private Environment environment;

    private SyncTimeSeriesDataJobDescriptor jobDescriptor;

    public SyncTimeSeriesDataJob() {

    }

    public  SyncTimeSeriesDataJob(DatablauJobDescriptor descriptor) {
        this.jobDescriptor = new SyncTimeSeriesDataJobDescriptor(descriptor);
    }



    public void prepare() throws Exception {
        this.metaModelDataService = BeanHelper.getBean(MetaModelDataService.class);
        this.dataModelRepo = BeanHelper.getBean(ModelRepository.class);
        this.environment = BeanHelper.getBean(Environment.class);

        if (this.metaModelDataService == null) {
            throw new DatablauJobExecutionException("Cannot find metaModelDataService");
        }

        if (this.dataModelRepo == null) {
            throw new DatablauJobExecutionException("Cannot find dataModelRepo");
        }

        String modelIdStr = environment.getProperty("sync.timeSeries.modelId");
        if (Strings.isNullOrEmpty(modelIdStr)) {
            throw new DatablauJobExecutionException("Cannot find modelId");
        } else {
            modelId = Long.parseLong(modelIdStr);
            logger.info("modelId:{}", modelId);
        }

        String viewModelIdStr = environment.getProperty("sync.timeSeries.viewModelId");
        if (Strings.isNullOrEmpty(viewModelIdStr)) {
            throw new DatablauJobExecutionException("Cannot find viewModelId");
        } else {
            viewModelId = Long.parseLong(viewModelIdStr);
            logger.info("viewModelId:{}", viewModelId);
        }

        String timeSeriesModelOfModelIdStr = environment.getProperty("sync.timeSeries.timeSeriesModelOfModelId");
        if (Strings.isNullOrEmpty(timeSeriesModelOfModelIdStr)) {
            throw new DatablauJobExecutionException("Cannot find timeSeriesModelOfModelId");
        } else {
            timeSeriesModelOfModelId = Long.parseLong(timeSeriesModelOfModelIdStr);
            logger.info("timeSeriesModelOfModelId:{}", timeSeriesModelOfModelId);
        }

        timeSeriesDataSheet1 = environment.getProperty("sync.timeSeriesDataSheet1");
        if (Strings.isNullOrEmpty(timeSeriesDataSheet1)) {
            throw new DatablauJobExecutionException("Cannot find timeSeriesDataSheet1");
        }
        logger.info("timeSeriesDataSheet1:{}", timeSeriesDataSheet1);

        timeSeriesDataSheet2 = environment.getProperty("sync.timeSeriesDataSheet2");
        if (Strings.isNullOrEmpty(timeSeriesDataSheet2)) {
            throw new DatablauJobExecutionException("Cannot find timeSeriesDataSheet2");
        }
        logger.info("timeSeriesDataSheet2:{}", timeSeriesDataSheet2);

        timeSeriesDataSheet3 = environment.getProperty("sync.timeSeriesDataSheet3");
        if (Strings.isNullOrEmpty(timeSeriesDataSheet3)) {
            throw new DatablauJobExecutionException("Cannot find timeSeriesDataSheet3");
        }
        logger.info("timeSeriesDataSheet3:{}", timeSeriesDataSheet3);

        timeSeriesViewSheet1 = environment.getProperty("sync.timeSeriesViewSheet1");
        if (Strings.isNullOrEmpty(timeSeriesViewSheet1)) {
            throw new DatablauJobExecutionException("Cannot find timeSeriesViewSheet1");
        }
        logger.info("timeSeriesViewSheet1:{}", timeSeriesViewSheet1);

        timeSeriesViewSheet2 = environment.getProperty("sync.timeSeriesViewSheet2");
        if (Strings.isNullOrEmpty(timeSeriesViewSheet2)) {
            throw new DatablauJobExecutionException("Cannot find timeSeriesViewSheet2");
        }
        logger.info("timeSeriesViewSheet2:{}", timeSeriesViewSheet2);

        timeSeriesModelSheet1 = environment.getProperty("sync.timeSeriesModelSheet1");
        if (Strings.isNullOrEmpty(timeSeriesModelSheet1)) {
            throw new DatablauJobExecutionException("Cannot find timeSeriesModelSheet1");
        }
        logger.info("timeSeriesModelSheet1:{}", timeSeriesModelSheet1);

        timeSeriesModelSheet2 = environment.getProperty("sync.timeSeriesModelSheet2");
        if (Strings.isNullOrEmpty(timeSeriesModelSheet2)) {
            throw new DatablauJobExecutionException("Cannot find timeSeriesModelSheet2");
        }
        logger.info("timeSeriesModelSheet2:{}", timeSeriesModelSheet2);

        BASE_URL = environment.getProperty("sync.timeSeries.baseUrl");
        if (Strings.isNullOrEmpty(BASE_URL)) {
            throw new DatablauJobExecutionException("Cannot find BASE_URL");
        }
        logger.info("BASE_URL:{}", BASE_URL);
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
                String name = model.getDefinition()+"."+resourceName;
                for (TimeSeriesPointMM timeSeriesPointMM : timeSeriesPointMMS) {
                    List data = Arrays.asList("", name, "", timeSeriesPointMM.getPointName(), timeSeriesPointMM.getPointName(), timeSeriesPointMM.getPointName(), timeSeriesPointMM.getPointName(),
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

        Map<String, String> dataMap = timeSeriesDataMMList.stream().collect(Collectors.toMap(TimeSeriesDataMM::getResourceId, TimeSeriesDataMM::getResourceName, (x1, x2) -> x1));

        //todo 保存时序视图
        saveTimeSeriesView(dataMap);
        //todo 保存时序模型
        saveTimeSeriesModel(dataMap);
    }

    /***
     * 保存时序视图
     */
    private void saveTimeSeriesView(Map<String, String> sourceMap) throws Exception {
        //获取时序视图数据
        List<TimeSeriesViewMM> timeSeriesViewMMList = getTimeSeriesViewMMList();
        Map<String, List<TimeSeriesViewMM>> viewMap = timeSeriesViewMMList.stream().collect(Collectors.groupingBy(TimeSeriesViewMM::getViewId));

        //存入元模型
        Optional<Model> modelOpt = dataModelRepo.findById(viewModelId);
        Model model = modelOpt.get();

        //sheet1数据
        SheetData sheetData1 = new SheetData(timeSeriesViewSheet1);
        sheetData1.addHeader(timeSeriesViewSheet1 + ".Id");
        sheetData1.addHeader(timeSeriesViewSheet1 + ".Name");
        sheetData1.addHeader(timeSeriesViewSheet1 + ".Definition");
        sheetData1.addHeader(timeSeriesViewSheet1 + ".LogicalName");
        sheetData1.addData(List.of(viewModelId, model.getDefinition(), "", ""));

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
//        sheetData2.addHeader("timeView.timeSeriesDataPoints|rp");
//        sheetData2.addHeader("timeView.timeSeriesDataPoints");
//        for (Map.Entry<String, List<TimeSeriesViewMM>> entry : viewMap.entrySet()) {
//            List<TimeSeriesViewMM> viewMMList = entry.getValue();
//            String name = "";
//            for (TimeSeriesViewMM timeSeriesViewMM : viewMMList) {
//                String resourceId = timeSeriesViewMM.getResourceId();
//                String resourceName = sourceMap.get(resourceId);
//                if (!Strings.isNullOrEmpty(resourceName)) {
//                    name = timeSeriesDataCollectName+"."+resourceName;
//                }
//            }
//        }
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");


        for (TimeSeriesViewMM timeSeriesViewMM : timeSeriesViewMMList) {
            String timestampStr = timeSeriesViewMM.getCreateTime();
            // 将时间戳字符串转换为 long 类型
            long timestamp = Long.parseLong(timestampStr);

            // 将毫秒级时间戳转换为 LocalDateTime
            LocalDateTime dateTime = LocalDateTime.ofInstant(Instant.ofEpochMilli(timestamp), ZoneId.systemDefault());
            String formattedDateTime = dateTime.format(formatter);
//            List data =  Arrays.asList(viewModelId, model.getDefinition(), "", timeSeriesViewMM.getViewName(), timeSeriesViewMM.getViewName(),
//                    timeSeriesViewMM.getViewName(), timeSeriesViewMM.getViewName(), formattedDateTime, timeSeriesViewMM.getSecurityLevel(),
//                    timeSeriesViewMM.getViewId(), "", "");
            List data =  Arrays.asList(viewModelId, model.getDefinition(), "", timeSeriesViewMM.getViewName(), timeSeriesViewMM.getViewName(),
                    timeSeriesViewMM.getViewName(), timeSeriesViewMM.getViewName(), formattedDateTime, timeSeriesViewMM.getSecurityLevel(),
                    timeSeriesViewMM.getViewId());
            sheetData2.addData(data);
        }
        List<SheetData> sheetDatas = new ArrayList<>();
        sheetDatas.add(sheetData1);
        sheetDatas.add(sheetData2);
        Sheets sheets = new Sheets();
        sheets.setSheets(sheetDatas);

        String JsonData = mapper.writeValueAsString(sheets);
        this.checkStopSign();
        ModelX jsonDataModelXC = metaModelDataService.loadDataModelXFromJson(viewModelId, JsonData);
        metaModelDataService.saveWithCompare(viewModelId, jsonDataModelXC, true);
        logger.info("执行时序视图任务结束");

    }

    /**
     * 保存时序模型
     */
    private void saveTimeSeriesModel(Map<String, String> sourceMap) throws Exception {
        List<TimeSeriesModelMM> timeSeriesModelMMList = getTimeSeriesModelMMList();
        Map<String, List<TimeSeriesModelMM>> modelMap = timeSeriesModelMMList.stream().collect(Collectors.groupingBy(TimeSeriesModelMM::getModelName));

        //存入元模型
        Optional<Model> modelOpt = dataModelRepo.findById(timeSeriesModelOfModelId);
        Model model = modelOpt.get();

        //sheet1数据
        SheetData sheetData1 = new SheetData(timeSeriesModelSheet1);
        sheetData1.addHeader(timeSeriesModelSheet1 + ".Id");
        sheetData1.addHeader(timeSeriesModelSheet1 + ".Name");
        sheetData1.addHeader(timeSeriesModelSheet1 + ".Definition");
        sheetData1.addHeader(timeSeriesModelSheet1 + ".LogicalName");
        sheetData1.addData(List.of(timeSeriesModelOfModelId, model.getDefinition(), "", ""));

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
//        sheetData2.addHeader("timeModel.timeSeriesDataPoints|rp");
//        sheetData2.addHeader("timeModel.timeSeriesDataPoints");
//        for (Map.Entry<String, List<TimeSeriesModelMM>> entry : modelMap.entrySet()) {
//            List<TimeSeriesModelMM> modelMMList = entry.getValue();
//            String name = "";
//            for (TimeSeriesModelMM timeSeriesModelMM : modelMMList) {
//                String resourceId = timeSeriesModelMM.getResourceId();
//                String resourceName = sourceMap.get(resourceId);
//                if (!Strings.isNullOrEmpty(resourceName)) {
//                    name = timeSeriesDataCollectName+"."+resourceName;
//                }
//            }
//        }
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (TimeSeriesModelMM timeSeriesModelMM : timeSeriesModelMMList) {
            String timestampStr = timeSeriesModelMM.getCreateTime();
            // 将时间戳字符串转换为 long 类型
            long timestamp = Long.parseLong(timestampStr);
            // 将毫秒级时间戳转换为 LocalDateTime
            LocalDateTime dateTime = LocalDateTime.ofInstant(Instant.ofEpochMilli(timestamp), ZoneId.systemDefault());
            String formattedDateTime = dateTime.format(formatter);
//            List data =  Arrays.asList(timeSeriesModelOfModelId, model.getDefinition(), "", timeSeriesModelMM.getModelName(),
//                    timeSeriesModelMM.getModelName(), timeSeriesModelMM.getModelName(), timeSeriesModelMM.getModelName(),
//                    timeSeriesModelMM.getModelType(), timeSeriesModelMM.getRemarks(), formattedDateTime,
//                    timeSeriesModelMM.getCreator(), timeSeriesModelMM.getSecurityLevel(), "", "");
            List data =  Arrays.asList(timeSeriesModelOfModelId, model.getDefinition(), "", timeSeriesModelMM.getModelName(),
                    timeSeriesModelMM.getModelName(), timeSeriesModelMM.getModelName(), timeSeriesModelMM.getModelName(),
                    timeSeriesModelMM.getModelType(), timeSeriesModelMM.getRemarks(), formattedDateTime,
                    timeSeriesModelMM.getCreator(), timeSeriesModelMM.getSecurityLevel());
            sheetData2.addData(data);
        }
        List<SheetData> sheetDatas = new ArrayList<>();
        sheetDatas.add(sheetData1);
        sheetDatas.add(sheetData2);
        Sheets sheets = new Sheets();
        sheets.setSheets(sheetDatas);

        String JsonData = mapper.writeValueAsString(sheets);
        this.checkStopSign();
        ModelX jsonDataModelXC = metaModelDataService.loadDataModelXFromJson(timeSeriesModelOfModelId, JsonData);
        metaModelDataService.saveWithCompare(timeSeriesModelOfModelId, jsonDataModelXC, true);
        logger.info("执行时序模型任务结束");
    }




    /**
     * 获取时序数据源
     * @return
     */
    private List<TimeSeriesDataMM> getTimeSeriesDataMMList() {
        int page = 0;
        String baseUrl = BASE_URL;
        List<TimeSeriesDataMM> timeSeriesDataMMList = Lists.newArrayList();
        while (true) {
            String url = baseUrl + "?tb=source" +"&page=" + page + "&size=" + PAGE_SIZE;
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
        String baseUrl = BASE_URL;
        List<TimeSeriesPointMM> timeSeriesDataMMList = Lists.newArrayList();
        while (true) {
            String url = baseUrl + "?tb=tag" +"&page=" + page + "&size=" + PAGE_SIZE;
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

    /**
     * 获取时序视图数据
     * @return
     */

    private List<TimeSeriesViewMM> getTimeSeriesViewMMList() {
        int page = 0;
        String baseUrl = BASE_URL;
        List<TimeSeriesViewMM> timeSeriesViewMMList = Lists.newArrayList();
        while (true) {
            String url = baseUrl + "?tb=chart" +"&page=" + page + "&size=" + PAGE_SIZE;
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

    /**
     * 获取时序模型数据
     * @return
     */
    private List<TimeSeriesModelMM> getTimeSeriesModelMMList() {
        int page = 0;
        String baseUrl = BASE_URL;
        List<TimeSeriesModelMM> timeSeriesModelMMList = Lists.newArrayList();
        while (true) {
            String url = baseUrl + "?tb=model" +"&page=" + page + "&size=" + PAGE_SIZE;
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
}
