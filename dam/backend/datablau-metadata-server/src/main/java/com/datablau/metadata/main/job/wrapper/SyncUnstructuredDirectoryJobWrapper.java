package com.datablau.metadata.main.job.wrapper;

import com.datablau.job.scheduler.adapter.JobWrapper;
import com.datablau.job.scheduler.api.DatablauJob;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.metadata.main.job.SyncUnstructuredDirectoryJob;

public class SyncUnstructuredDirectoryJobWrapper extends JobWrapper {

    public static final String JOB_TYPE_NAME = "非结构化目录同步";
    @Override
    public DatablauJob createJobTask(Long jobId, Long runId, DatablauJobDescriptor descriptor) {
        return new SyncUnstructuredDirectoryJob(descriptor);
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
