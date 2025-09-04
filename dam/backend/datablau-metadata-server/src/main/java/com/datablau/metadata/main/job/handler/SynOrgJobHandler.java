package com.datablau.metadata.main.job.handler;

import com.datablau.job.scheduler.adapter.JobDescriptorAdapter;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.metadata.main.job.descriptor.JobDescriptorHandler;
import com.datablau.metadata.main.job.wrapper.SynOrgJobWrapper;

public class SynOrgJobHandler implements JobDescriptorHandler {

    public static final SynOrgJobWrapper SYNC_JOB_WRAPPER = new SynOrgJobWrapper();

    public SynOrgJobHandler() {
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
