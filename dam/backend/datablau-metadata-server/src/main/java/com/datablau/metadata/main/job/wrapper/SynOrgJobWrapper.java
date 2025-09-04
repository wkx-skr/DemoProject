package com.datablau.metadata.main.job.wrapper;

import com.datablau.job.scheduler.adapter.JobWrapper;
import com.datablau.job.scheduler.api.DatablauJob;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.metadata.main.job.SynOrgJob;
import com.datablau.metadata.main.job.SyncUserJob;

public class SynOrgJobWrapper extends JobWrapper {

    public static final String JOB_TYPE_NAME = "机构全量同步任务";

    public SynOrgJobWrapper() {
    }

    public DatablauJob createJobTask(Long jobId, Long runId, DatablauJobDescriptor descriptor) {
        return new SynOrgJob(descriptor);
    }

    public String getTypeName() {
        return JOB_TYPE_NAME;
    }

    public String getName() {
        return JOB_TYPE_NAME;
    }
}
