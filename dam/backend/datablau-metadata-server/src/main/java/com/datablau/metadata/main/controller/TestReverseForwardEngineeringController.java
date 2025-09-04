package com.datablau.metadata.main.controller;

import com.datablau.data.common.controller.BaseController;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.job.scheduler.data.JobProgress;
import com.datablau.job.scheduler.data.QueueJob;
import com.datablau.job.scheduler.dto.JobDto;
import com.datablau.metadata.main.job.LocalJobRegistryAdapter;
import com.datablau.metadata.main.job.impl.MetadataJobExecutor;
import com.datablau.metadata.main.re.utility.ReverseEngineeringWorkerManager;
import com.datablau.metadata.main.service.metadata.api.DataObjectService;
import com.datablau.metadata.main.service.model.api.DataModelService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.concurrent.BlockingQueue;
import org.redisson.api.RTopic;
import org.redisson.api.RedissonClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author nicky - 数语科技有限公司
 * date 2023/6/16 18:01
 */
@RestController
@RequestMapping("/testre")
public class TestReverseForwardEngineeringController extends BaseController {
    private static final Logger LOGGER = LoggerFactory.getLogger(TestReverseForwardEngineeringController.class);

    @Autowired
    private ReverseEngineeringWorkerManager workerManager;

    @Autowired
    private DataObjectService dataObjectService;

    @Autowired
    private DataModelService dataModelService;

    private String testStr = "{\n"
        + "  \"TagIds\": \"\",\n"
        + "  \"CommentToLogicalName\": true,\n"
        + "  \"Zone\": \"\",\n"
        + "  \"Deploy\": \"\",\n"
        + "  \"State\": \"\",\n"
        + "  \"Description\": \"\",\n"
        + "  \"HostServer\": \"192.168.1.59\",\n"
        + "  \"PortNumber\": \"1521\",\n"
        + "  \"AuthenticationType\": 0,\n"
        + "  \"DatabaseName\": \"SID:orcl\",\n"
        + "  \"PackageFiltered\": false,\n"
        + "  \"ViewFiltered\": false,\n"
        + "  \"ProceduresFiltered\": false,\n"
        + "  \"ReFK\": true,\n"
        + "  \"SelectedBlackList\": null,\n"
        + "  \"BlackListAppliedTypeIds\": \"\",\n"
        + "  \"FunctionFiltered\": false,\n"
        + "  \"SelectedSchemas\": \"DAM\"\n"
        + "}";


    @Autowired
    private RedissonClient redissonClient;


    @RequestMapping("/test")
    public void test(@RequestParam("datasourceId") Long datasourceId) throws Exception {



//        JdbcDatasource datasource = DatasourceHelper.INSTANCE.getJdbcDatasourceByDatasourceId(datasourceId);
//
//        ReverseForwardStrategy strategy = workerManager.getReverseForwardStrategy(datasource.getType());
//
//        Map<String, Object> params = new ObjectMapper().readValue(testStr, HashMap.class);
//
//        ReverseForwardObjectSaver saver = new ReverseForwardObjectSaver(dataObjectService, dataModelService, datasource.getProperties());
//        params.put(ReverseEngineeringKnownParameterType.MODEL_CATEGORY_ID.name(), 1L);
//        params.put(ReverseEngineeringKnownParameterType.PROGRESS_SAVER.name(), saver);
//        params.put(ReverseEngineeringKnownParameterType.CLEAR_MODEL_CALL_BACK.name(),
//            new ClearModelCallback() {
//                @Override
//                public void clearModel(Long modelId, Datasource datasource) {
//                    LOGGER.info("clean model " + modelId + " due to error");
//                    dataObjectService.deleteModelAndItsChildren(modelId, false);
//                    LOGGER.info("model " + modelId + " is cleaned");
//                }
//            });
//
//        ReverseForwardOptions options = new ReverseForwardOptions();
//        options.parse(params);
//        strategy.reverseEngineer("测试数据源", datasource, options);
    }

    @Autowired
    private LocalJobRegistryAdapter localJobRegistryAdapter;

    @PostMapping("/testJob")
    public void testJob(@RequestParam("jobId")Long jobId) throws Exception {
        JobDto job = localJobRegistryAdapter.queryJobById(jobId);
        testJob(job.getJobContent());
    }

    private void testJob(String test) throws Exception {
        String topicName = "datablau_192.168.1.138_localhost_topic";
        String queueName = "datablau_192.168.1.138_localhost_queue";

        ObjectMapper mapper = new ObjectMapper();
        DatablauJobDescriptor descriptor = mapper.readValue(test, DatablauJobDescriptor.class);

        QueueJob job = new QueueJob();
        job.setApplicationName("datablau_metadata");
        job.setJobDescriptor(descriptor);
        job.setJobExecutor("admin");
        job.setJobId(5L);
        job.setJobInstanceId(10L);
        job.setVersion("7.0.0");

        RTopic topic = redissonClient.getTopic(topicName);
        BlockingQueue<QueueJob> jobQueue = redissonClient.getBlockingQueue(queueName);
        jobQueue.offer(job);
        // jobQueue.offer(QueueJob.STOP_PROCESS_JOB);

        topic.addListener(JobProgress.class, (CharSequence channel, JobProgress progress) -> {
            LOGGER.info("*************TOPIC:" + progress.getMessageType() + ":" + progress.getMessage());
        });

        MetadataJobExecutor runner = new MetadataJobExecutor(null, queueName, topicName, null);
        runner.queueProcessJobs(queueName, topicName);
    }

}
