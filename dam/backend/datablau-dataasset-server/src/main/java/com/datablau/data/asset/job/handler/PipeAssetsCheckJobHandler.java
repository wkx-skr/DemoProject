package com.datablau.data.asset.job.handler;

import com.datablau.data.asset.job.descriptor.JobDescriptorHandler;
import com.datablau.data.asset.job.wrapper.PipeAssetsCheckJobWrapper;
import com.datablau.job.scheduler.adapter.JobDescriptorAdapter;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-01 17:06
 * @description
 */
public class PipeAssetsCheckJobHandler     implements JobDescriptorHandler {

    public static final PipeAssetsCheckJobWrapper SYNC_JOB_WRAPPER = new PipeAssetsCheckJobWrapper();

    public PipeAssetsCheckJobHandler() {
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

