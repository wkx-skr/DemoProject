package com.datablau.metadata.main.job.wrapper;

import com.datablau.job.scheduler.adapter.JobWrapper;
import com.datablau.job.scheduler.api.DatablauJob;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.metadata.main.job.SyncTimeSeriesDataJob;
import com.datablau.metadata.main.job.SyncUnstructuredDirectoryJob;

public class SyncTimeSeriesDataJobWrapper extends JobWrapper {

    public static final String JOB_TYPE_NAME = "时序数据同步";

    @Override
    public DatablauJob createJobTask(Long jobId, Long runId, DatablauJobDescriptor descriptor) {
        return new SyncTimeSeriesDataJob(descriptor);
    }

    @Override
    public String getTypeName() {
        return JOB_TYPE_NAME;
    }

    @Override
    public String getName() {
        return JOB_TYPE_NAME;
    }
}
