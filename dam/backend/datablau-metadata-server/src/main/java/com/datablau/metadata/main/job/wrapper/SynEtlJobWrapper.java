package com.datablau.metadata.main.job.wrapper;

import com.datablau.job.scheduler.adapter.JobWrapper;
import com.datablau.job.scheduler.api.DatablauJob;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.metadata.main.job.SynEtlJob;
import com.datablau.metadata.main.job.SyncUserJob;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-05-28 10:32
 * @description
 */
public class SynEtlJobWrapper extends JobWrapper {

    public static final String JOB_TYPE_NAME = "同步ETL接口任务";

    public SynEtlJobWrapper() {
    }



    public DatablauJob createJobTask(Long jobId, Long runId, DatablauJobDescriptor descriptor) {
        return new SynEtlJob(descriptor);
    }

    public String getTypeName() {
        return JOB_TYPE_NAME;
    }

    public String getName() {
        return JOB_TYPE_NAME;
    }
}
