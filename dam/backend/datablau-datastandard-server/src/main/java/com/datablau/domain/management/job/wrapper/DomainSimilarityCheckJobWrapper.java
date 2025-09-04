package com.datablau.domain.management.job.wrapper;

import com.datablau.domain.management.job.DomainSimilarityCheckJob;
import com.datablau.job.scheduler.adapter.JobWrapper;
import com.datablau.job.scheduler.api.DatablauJob;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;

public class DomainSimilarityCheckJobWrapper extends JobWrapper {
    private final static String JOB_TYPE_NAME = "数据标准-相似度检查任务";
    public DomainSimilarityCheckJobWrapper() {
    }

    public DatablauJob createJobTask(Long jobId, Long runId, DatablauJobDescriptor descriptor) {
        return new DomainSimilarityCheckJob(descriptor);
    }

    public String getTypeName() {
        return JOB_TYPE_NAME;
    }

    public String getName() {
        return JOB_TYPE_NAME;
    }

}
