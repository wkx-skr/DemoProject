package com.datablau.metadata.main.job.handler;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.datablau.job.scheduler.adapter.JobDescriptorAdapter;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.job.scheduler.data.JobParameter;
import com.datablau.metadata.main.job.descriptor.JobDescriptorHandler;
import com.datablau.metadata.main.job.wrapper.MetaDataSimilarityJobWrapper;
import com.datablau.metadata.main.job.wrapper.SynEtlJobWrapper;
import com.google.common.base.Strings;

import java.util.ArrayList;
import java.util.List;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-16 14:21
 * @description
 */
public class MetaDataSimilarityJobHandler implements JobDescriptorHandler {


    public static final MetaDataSimilarityJobWrapper SYNC_JOB_WRAPPER = new MetaDataSimilarityJobWrapper();

    @Override
    public DatablauJobDescriptor getTemplate() {
        DatablauJobDescriptor descriptor = new DatablauJobDescriptor();
        descriptor.setDisabled(false);
        descriptor.setName(SYNC_JOB_WRAPPER.getName());
        descriptor.setEndVersion(JobDescriptorAdapter.getCurrentVersion());
        descriptor.setTypeName(SYNC_JOB_WRAPPER.getTypeName());
        List<JobParameter> parameters = new ArrayList<>();
        JobParameter jobParameter1 = new JobParameter();
        jobParameter1.setParameterName("modelA");
        jobParameter1.setParameterDescription("数据库A");
        jobParameter1.setValue("init");
        JobParameter jobParameter2 = new JobParameter();
        jobParameter2.setParameterName("modelB");
        jobParameter2.setParameterDescription("数据库B");
        jobParameter2.setValue("init");
        parameters.add(jobParameter2);
        parameters.add(jobParameter1);
        descriptor.setParameters(parameters);
        return descriptor;
    }

    @Override
    public void validateJobDescriptor(DatablauJobDescriptor datablauJobDescriptor) {
//        if (Strings.isNullOrEmpty(datablauJobDescriptor.getName())) {
//            throw new InvalidArgumentException("Name is required");
//        } else {
//            datablauJobDescriptor.setEndVersion(JobDescriptorAdapter.getCurrentVersion());
//        }

    }

    @Override
    public boolean canHandle(String s) {
        return SYNC_JOB_WRAPPER.getTypeName().equals(s);
    }
}
