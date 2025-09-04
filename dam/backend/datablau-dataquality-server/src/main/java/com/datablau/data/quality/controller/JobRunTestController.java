/*
 * Copyright (c) 2017, Datablau. All rights reserved.
 */

package com.datablau.data.quality.controller;

import com.datablau.data.common.controller.BaseController;
import com.datablau.data.quality.dashboard.DashboardDataQualityRunner;
import com.datablau.data.quality.dashboard.DashboardDataRuleRunner;
import com.datablau.data.quality.job.DataQualityVerifyJob;
import com.datablau.data.quality.job.DataRuleJob;
import com.datablau.data.quality.job.data.DataRuleJobDescriptor;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.job.scheduler.data.JobParameter;
import com.datablau.job.scheduler.data.JobParameterType;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.ArrayList;
import java.util.List;

/**
 * @author Nicky
 * @since 1.0
 */
@RestController
@RequestMapping("/job/run/test")
@Tag(name = "job任务运行测试 API")
public class JobRunTestController extends BaseController {
    private static final Logger LOGGER = LoggerFactory.getLogger(JobRunTestController.class);
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @PostMapping(value = "/qualityDashboard")
    public void qualityDashboard() throws Exception {
        //先运行质量的：会清除历史数据
        new DashboardDataQualityRunner().run();
        //后运行数据规则的：不会清除数据
        new DashboardDataRuleRunner().run();
    }

    /**
     * local data rule job test
     */
    @PostMapping(value = "/dataRuleJob")
    public void dataRuleJob(@RequestParam Long jobId) throws Exception {
        DatablauJobDescriptor jobDescriptor = new DatablauJobDescriptor();

        List<JobParameter> jobParameters = new ArrayList<>();

        //应用系统
        JobParameter modelCategoryParam = new JobParameter();
        modelCategoryParam.setType(JobParameterType.LONG);
        modelCategoryParam.setValue("1");
        modelCategoryParam.setParameterName(DataRuleJobDescriptor.PARAM_MODELCATEGORY_ID);

        JobParameter enableMail = new JobParameter();
        enableMail.setType(JobParameterType.BOOL);
        enableMail.setValue("false");
        enableMail.setParameterName(DataRuleJobDescriptor.PARAM_SEND_MAIL);

        jobParameters.add(modelCategoryParam);
        jobParameters.add(enableMail);

        jobDescriptor.setParameters(jobParameters);

        DataRuleJob dataRuleJob = new DataRuleJob(jobDescriptor);


        dataRuleJob.setJobId(jobId);
        dataRuleJob.prepare();
        dataRuleJob.execute();
    }

    @PostMapping(value = "/qualityVerifyJob")
    public void qualityVerifyJob(@RequestParam Long jobId) throws Exception {
        DatablauJobDescriptor jobDescriptor = new DatablauJobDescriptor();
        DataQualityVerifyJob verifyJob = new DataQualityVerifyJob(jobDescriptor);
        verifyJob.setJobId(jobId);
        verifyJob.prepare();
        verifyJob.execute();
    }
}
