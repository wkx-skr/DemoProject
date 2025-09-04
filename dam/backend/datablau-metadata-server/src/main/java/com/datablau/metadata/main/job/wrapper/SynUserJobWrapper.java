package com.datablau.metadata.main.job.wrapper;

import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.job.scheduler.adapter.JobWrapper;
import com.datablau.job.scheduler.api.DatablauJob;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.metadata.main.job.SyncUserJob;


public class SynUserJobWrapper extends JobWrapper {

    public static final String JOB_TYPE_NAME = "用户全量同步任务";

    public SynUserJobWrapper() {
    }

    public DatablauJob createJobTask(Long jobId, Long runId, DatablauJobDescriptor descriptor) {
        return new SyncUserJob(descriptor);
    }

    public String getTypeName() {
        return JOB_TYPE_NAME;
    }

    public String getName() {
        return JOB_TYPE_NAME;
    }
}
