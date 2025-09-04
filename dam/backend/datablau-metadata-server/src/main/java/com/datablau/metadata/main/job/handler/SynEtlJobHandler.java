package com.datablau.metadata.main.job.handler;

import com.datablau.job.scheduler.adapter.JobDescriptorAdapter;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.metadata.main.job.descriptor.JobDescriptorHandler;
import com.datablau.metadata.main.job.wrapper.SynEtlJobWrapper;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-05-28 10:36
 * @description
 */
public class SynEtlJobHandler implements JobDescriptorHandler {

    public static final SynEtlJobWrapper SYNC_JOB_WRAPPER = new SynEtlJobWrapper();

    public SynEtlJobHandler() {
    }

    @Override
    public DatablauJobDescriptor getTemplate() {
        DatablauJobDescriptor descriptor = new DatablauJobDescriptor();
        descriptor.setDisabled(false);
        descriptor.setName(SYNC_JOB_WRAPPER.getName());
        descriptor.setEndVersion(JobDescriptorAdapter.getCurrentVersion());
        descriptor.setTypeName(SYNC_JOB_WRAPPER.getTypeName());
        return descriptor;
    }

    @Override
    public void validateJobDescriptor(DatablauJobDescriptor datablauJobDescriptor) {

    }

    @Override
    public boolean canHandle(String jobType) {
        return SYNC_JOB_WRAPPER.getTypeName().equals(jobType);
    }
    
}
