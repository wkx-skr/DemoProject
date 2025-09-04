package com.datablau.metadata.main.job;

import cn.hutool.http.HttpUtil;
import cn.hutool.json.JSONObject;
import com.andorj.common.core.model.ModelX;
import com.andorj.model.common.utility.BeanHelper;
import com.datablau.job.scheduler.adapter.DatablauJobAdapter;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.metadata.main.dao.model.ModelRepository;
import com.datablau.metadata.main.dto.covermm.SheetData;
import com.datablau.metadata.main.dto.etldto.EtlJob;
import com.datablau.metadata.main.dto.etldto.EtlResponse;
import com.datablau.metadata.main.dto.etldto.MovementPeriodInfo;
import com.datablau.metadata.main.dto.etldto.TargetTable;
import com.datablau.metadata.main.job.descriptor.SynEtlJobDescriptor;
//import com.datablau.metadata.main.service.EtlJobService;
import com.datablau.metadata.main.service.metadata.api.MetaModelDataService;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.datablau.metadata.main.entity.model.Model;
import com.datablau.metadata.main.dto.covermm.Sheets;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * @author zhangziliang
 * @version 1.2
 * @description 同步 ETL 任务（分页方式）
 */
public class SynEtlJob extends DatablauJobAdapter {

    private final Logger logger = LoggerFactory.getLogger(SynEtlJob.class);

    @Value("${mm.etl.url}")
    private String requestUrl;

    @Value("${mm.etl.sheet1}")
    private String etlMMSheet1;

    @Value("${mm.etl.sheet2}")
    private String etlMMSheet2;

    @Value("${mm.etl.sheet3}")
    private String etlMMSheet3;

    @Value("${mm.etl.modelId}")
    private String modelId;

    // 预留字段（如后续接口需要 token、appId，可扩展）
//    @Value("${sync.etl_token:}")
//    private String etlToken;
//
//    @Value("${sync.etl_app_id:}")
//    private String etlAppId;

    //    private EtlJobService etlJobService;
    private SynEtlJobDescriptor jobDescriptor;

    private ModelRepository dataModelRepo;

    private MetaModelDataService metaModelDataService;

    public SynEtlJob() {
    }

    public SynEtlJob(DatablauJobDescriptor jobDescriptor) {
        this.jobDescriptor = new SynEtlJobDescriptor(jobDescriptor);
    }

    @Override
    protected void prepare() throws Exception {
//        this.etlJobService = BeanHelper.getBean(EtlJobService.class);
//        if (this.etlJobService == null) {
//            throw new RuntimeException("cannot find EtlJobService");
//        }
//        super.prepare();
        Environment env = BeanHelper.getBean(Environment.class);
        if (env == null) {
            throw new RuntimeException("cannot find Environment");
        }

        this.requestUrl = env.getProperty("mm.etl.url");
        this.etlMMSheet1 = env.getProperty("mm.etl.sheet1");
        this.etlMMSheet2 = env.getProperty("mm.etl.sheet2");
        this.etlMMSheet3 = env.getProperty("mm.etl.sheet3");
        this.modelId = env.getProperty("mm.etl.modelId");

        this.dataModelRepo = BeanHelper.getBean(ModelRepository.class);
        if (this.dataModelRepo == null) {
            throw new RuntimeException("cannot find ModelRepository");
        }

        this.metaModelDataService = BeanHelper.getBean(MetaModelDataService.class);
        if (this.metaModelDataService == null) {
            throw new RuntimeException("cannot find MetaModelDataService");
        }

    }

    @Override
    protected void execute() throws Exception {
        addEvent("开始执行ETL任务同步");
        int start = 0;
        int limit = 100;
        int totalCount = 0;
        addEvent("调用接口：" + requestUrl);
        logger.info("配置文件参数值：" + etlMMSheet1 + "," + etlMMSheet2 + "," + etlMMSheet3);
        List<EtlJob> allJobs = new ArrayList<>();

        while (true) {
            JSONObject requestJson = new JSONObject();
            requestJson.put("start", start);
            requestJson.put("limit", limit);

            Map<String, String> headers = new HashMap<>();
            headers.put("Content-Type", "application/json");

            String responseStr;
            try {
                responseStr = HttpUtil.createPost(requestUrl)
                        .addHeaders(headers)
                        .body(requestJson.toString())
                        .execute()
                        .body();
            } catch (RuntimeException e) {
                throw new RuntimeException("ETL任务接口调用失败！start=" + start, e);
            }

            logger.info("对接etl返回值：{}", responseStr);

            if (responseStr == null) {
                throw new RuntimeException("ETL任务接口返回为空！start=" + start);
            }

            logger.info("接口返回值:" + responseStr);

            EtlResponse response;
            try {
                ObjectMapper objectMapper = new ObjectMapper()
                        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
                response = objectMapper.readValue(responseStr, EtlResponse.class);
            } catch (Exception e) {
                throw new RuntimeException("ETL任务返回反序列化失败！start=" + start, e);
            }

            if (response.getReturnStatus() != 200) {
                throw new RuntimeException("ETL接口返回失败，状态码：" + response.getReturnStatus());
            }

            List<EtlJob> currentJobs = response.getReturnInfo();
            if (currentJobs == null || currentJobs.isEmpty()) {
                logger.info("分页数据读取完毕，共拉取：" + totalCount + " 条ETL任务");
                break;
            }

            logger.info("当前页返回ETL任务：" + currentJobs.size());
            allJobs.addAll(currentJobs);
            totalCount += currentJobs.size();

            if (currentJobs.size() < limit) {
                logger.info("最后一页数据获取完成");
                break;
            }
            start += limit;
        }

        try {
            etlObject(Long.valueOf(modelId), allJobs);
            logger.info("ETL任务已成功保存：" + allJobs.size() + " 条记录");
        } catch (Exception e) {
            logger.error("保存ETL任务失败！", e);
            throw new RuntimeException("ETL任务保存异常", e);
        }
        addEvent("任务结束");
        logger.info("ETL任务同步执行结束");
    }

    @Override
    protected void complete() throws Exception {
        super.complete();
    }

    public void etlObject(Long modelId, List<EtlJob> etlJobs) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Optional<Model> modelOpt = dataModelRepo.findById(modelId);
        Model model = modelOpt.get();

        // sheet1: 模型基础信息
        SheetData sheetData1 = new SheetData(etlMMSheet1);
        sheetData1.addHeader(etlMMSheet1 + ".Id");
        sheetData1.addHeader(etlMMSheet1 + ".Name");
        sheetData1.addHeader(etlMMSheet1 + ".Definition");
        sheetData1.addHeader(etlMMSheet1 + ".LogicalName");
        sheetData1.addData(List.of(modelId, model.getDefinition(), "", ""));

        // sheet2: ETL主任务
        SheetData sheetData2 = new SheetData(etlMMSheet2);
        sheetData2.addHeader(etlMMSheet1 + ".Id");
        sheetData2.addHeader(etlMMSheet1 + ".Name");
        sheetData2.addHeader(etlMMSheet2 + ".Id");
        sheetData2.addHeader(etlMMSheet2 + ".Name");
        sheetData2.addHeader(etlMMSheet2 + ".Definition");
        sheetData2.addHeader(etlMMSheet2 + ".LogicalName");
        sheetData2.addHeader(etlMMSheet2 + ".rentName");
        sheetData2.addHeader(etlMMSheet2 + ".targetTable");
        sheetData2.addHeader(etlMMSheet2 + ".etlManager");
        sheetData2.addHeader(etlMMSheet2 + ".etlName");
        sheetData2.addHeader(etlMMSheet2 + ".movementTime");
        sheetData2.addHeader(etlMMSheet2 + ".scheduleWay");
        sheetData2.addHeader(etlMMSheet2 + ".movementPeriod");
        sheetData2.addHeader(etlMMSheet2 + ".etlId");

        for (EtlJob etl : etlJobs) {
            String targetTable = new String();
            if (!CollectionUtils.isEmpty(etl.getTargetTableId())) {
                targetTable = etl.getTargetTableId().get(0) != null ?
                        etl.getTargetTableId().get(0).getTableSchema() + "." + etl.getTargetTableId().get(0).getTableName() : "";
            }
            // 解析corn 表达式
            String corn = "";
            String schedule = "";
            // 先解析数组第一个
            if (!CollectionUtils.isEmpty(etl.getMovementPeriodInfo()) && etl.getMovementPeriodInfo().size() > 1) {
                MovementPeriodInfo movementPeriodInfo = etl.getMovementPeriodInfo().get(0);
                if (!ObjectUtils.isEmpty(movementPeriodInfo.getCrontab())) {
                    corn = parseCronToPeriod(movementPeriodInfo.getCrontab());
                }
                if (!ObjectUtils.isEmpty(movementPeriodInfo.getStartTime()) && !ObjectUtils.isEmpty(movementPeriodInfo.getEndTime())) {
                    schedule = formatTimeRange(movementPeriodInfo.getStartTime(), movementPeriodInfo.getEndTime());
                }
            }

            List<Object> data = List.of(
                    modelId,
                    model.getDefinition(),
                    "",
                    etl.getEtlName(),
                    "",
                    "",
                    etl.getTenantId(),
                    targetTable,
                    etl.getEtlManager(),
                    etl.getEtlName(),
                    schedule,
                    etl.getScheduleWay(),
                    corn,
                    etl.getEtlId()
            );
            sheetData2.addData(data);
        }

        // sheet3: 子元素信息（调度表达式、依赖等）
//            SheetData sheetData3 = new SheetData(etlMMSheet3);
//            sheetData3.addHeader(etlMMSheet2 + ".Id");
//            sheetData3.addHeader(etlMMSheet2 + ".Name");
//            sheetData3.addHeader(etlMMSheet3 + ".Definition");
//            sheetData3.addHeader(etlMMSheet3 + ".LogicalName");
//            sheetData3.addHeader(etlMMSheet3 + ".Id");
//            sheetData3.addHeader(etlMMSheet3 + ".schema");
//            sheetData3.addHeader(etlMMSheet3 + ".Name");
//
//            for (EtlJob etl : etlJobs) {
//                String etlId = etl.getEtlId();
//                String etlName = etl.getEtlName();
//                String events = String.join(",", Optional.ofNullable(etl.getTriggerEvents()).orElse(List.of()));
//                String waits = String.join(",", Optional.ofNullable(etl.getWaitEvents()).orElse(List.of()));
//
//                if (etl.getTargetTableId() != null) {
//                    TargetTable p = etl.getTargetTableId();
//                    sheetData3.addData(List.of(
//                            etlId,
//                            etlName,
//                            "",
//                            "",
//                            p.getId(),
//                            p.getSchema(),
//                            p.getName()
//                    ));
//                } else {
//                    sheetData3.addData(List.of(
//                            etlId,
//                            etlName,
//                            "",
//                            ""
//                    ));
//                }
//            }

        List<SheetData> sheetDatas = List.of(sheetData1, sheetData2);
        Sheets sheets = new Sheets();
        sheets.setSheets(sheetDatas);

        String JsonData = mapper.writeValueAsString(sheets);
        ModelX jsonDataModelXC = metaModelDataService.loadDataModelXFromJson(modelId, JsonData);
        metaModelDataService.saveWithCompare(modelId, jsonDataModelXC, true);
    }


    public String parseCronToPeriod(String cron) {
        if (cron == null || cron.trim().isEmpty()) {
            return "自定义";
        }

        String[] parts = cron.trim().split("\\s+");
        if (parts.length < 6 || parts.length > 7) {
            return "自定义"; // 格式不合法
        }

        String second = parts[0];
        String minute = parts[1];
        String hour = parts[2];
        String day = parts[3];
        String month = parts[4];
        String week = parts[5];

        // 先处理分钟级别
        if (minute.matches("0/1|\\*/1")) return "1分";
        if (minute.matches("0/5|\\*/5")) return "5分";
        if (minute.matches("0/10|\\*/10")) return "10分";
        if (minute.matches("0/15|\\*/15")) return "15分";
        if (minute.matches("0/30|\\*/30")) return "30分";

        // 小时级别：每小时执行一次
        if (minute.equals("0") && hour.matches("0/1|\\*/1")) return "时";

        // 天级别：每天固定时间
        if (day.equals("*") && week.equals("?") && !hour.equals("*") && !minute.equals("*")) return "天";

        // 周级别：指定每周几
        if (week.matches("[0-7]|MON|TUE|WED|THU|FRI|SAT|SUN")) return "周";

        // 月级别：每月某日
        if (!day.equals("*") && month.equals("*") && week.equals("?")) return "月";

        // 季度级别：每季度第一月
        if (month.matches("1|4|7|10") || month.equals("1,4,7,10")) return "季";

        // 年级别（七位 cron）
        if (parts.length == 7 && !parts[6].equals("*")) return "年";

        return "自定义";
    }


    public static String formatTimeRange(Long startTimeMillis, Long endTimeMillis) {
        if (startTimeMillis == null || endTimeMillis == null) {
            return "";
        }

        ZoneId zone = ZoneId.systemDefault();
        LocalDateTime start = Instant.ofEpochMilli(startTimeMillis).atZone(zone).toLocalDateTime();
        LocalDateTime end = Instant.ofEpochMilli(endTimeMillis).atZone(zone).toLocalDateTime();

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String datePart = start.format(dateFormatter);
        String startTimePart = String.format("%02d点%02d分", start.getHour(), start.getMinute());
        String endTimePart = String.format("%02d点%02d分", end.getHour(), end.getMinute());

        return String.format("%s %s - %s", datePart, startTimePart, endTimePart);
    }


}
