package com.datablau.data.quality.controller;

import com.datablau.data.common.controller.BaseController;
import com.datablau.data.quality.impl.LocalJobRegistryAdapter;
import com.datablau.data.quality.job.DataQualityJobExecutor;
import com.datablau.datasource.data.DatasourceNoneCloseInfo;
import com.datablau.datasource.util.DatasourceManager;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.job.scheduler.data.JobProgress;
import com.datablau.job.scheduler.data.QueueJob;
import com.datablau.job.scheduler.dto.JobDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.redisson.api.RTopic;
import org.redisson.api.RedissonClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.concurrent.BlockingQueue;

/**
 * @author nicky - 数语科技有限公司
 * date 2023/11/27 14:04
 */
@RequestMapping("/test")
@RestController
public class TestController extends BaseController {
    private static final Logger LOGGER = LoggerFactory.getLogger(TestController.class);

    @Autowired
    private LocalJobRegistryAdapter localJobRegistryAdapter;

    @Autowired
    private RedissonClient redissonClient;

    @Autowired
    private DatasourceManager datasourceManager;

    @PostMapping("/testJob")
    public void testJob(@RequestParam("jobId")Long jobId) throws Exception {
        JobDto job = localJobRegistryAdapter.queryJobById(jobId);
        testJob(job.getJobContent());
    }

    @PostMapping("/getUnclosedDatasources")
    public List<DatasourceNoneCloseInfo> getUnclosedDatasources() {
        return datasourceManager.getAllNonClosedDatasourceStacktrace();
    }
    private void testJob(String test) throws Exception {
        String topicName = "datablau_192.168.1.138_localhost_quliaty_topic";
        String queueName = "datablau_192.168.1.138_localhost_quality_queue";

        ObjectMapper mapper = new ObjectMapper();
        DatablauJobDescriptor descriptor = mapper.readValue(test, DatablauJobDescriptor.class);

        QueueJob job = new QueueJob();
        job.setApplicationName("datablau_quality");
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

        DataQualityJobExecutor runner = new DataQualityJobExecutor(null, queueName, topicName, null);
        runner.queueProcessJobs(queueName, topicName);
    }

}
