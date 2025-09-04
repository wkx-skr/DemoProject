package com.datablau.metadata.main.job.handler;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.datablau.job.scheduler.adapter.JobDescriptorAdapter;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.metadata.main.job.descriptor.JobDescriptorHandler;
import com.datablau.metadata.main.job.wrapper.SyncTimeSeriesDataJobWrapper;
import com.datablau.metadata.main.job.wrapper.SyncUnstructuredDirectoryJobWrapper;
import com.google.common.base.Strings;

public class SyncTimeSeriesJobHandler implements JobDescriptorHandler {

    public static final SyncTimeSeriesDataJobWrapper SYNC_TIME_SERIES_DATA_JOB_WRAPPER = new SyncTimeSeriesDataJobWrapper();



    @Override
    public DatablauJobDescriptor getTemplate() {
        DatablauJobDescriptor descriptor = new DatablauJobDescriptor();
        descriptor.setDisabled(false);
        descriptor.setName(SYNC_TIME_SERIES_DATA_JOB_WRAPPER.getName());
        descriptor.setEndVersion(JobDescriptorAdapter.getCurrentVersion());
        descriptor.setTypeName(SYNC_TIME_SERIES_DATA_JOB_WRAPPER.getTypeName());
        return descriptor;
    }

    @Override
    public void validateJobDescriptor(DatablauJobDescriptor datablauJobDescriptor) {
        if (Strings.isNullOrEmpty(datablauJobDescriptor.getName())) {
            throw new InvalidArgumentException("Name is required");
        } else {
            datablauJobDescriptor.setEndVersion(JobDescriptorAdapter.getCurrentVersion());
        }
    }

    @Override
    public boolean canHandle(String jobType) {
        return SYNC_TIME_SERIES_DATA_JOB_WRAPPER.getTypeName().equals(jobType);
    }
}
