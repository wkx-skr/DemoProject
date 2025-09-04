package com.datablau.metadata.main.job.wrapper;

import com.datablau.job.scheduler.adapter.JobWrapper;
import com.datablau.job.scheduler.api.DatablauJob;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.metadata.main.job.MetaDataSimilarityJob;
import com.datablau.metadata.main.job.SynEtlJob;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-16 14:16
 * @description
 */
public class MetaDataSimilarityJobWrapper extends JobWrapper {

    public static final String JOB_TYPE_NAME = "元数据相似度检查任务";

    @Override
    public DatablauJob createJobTask(Long jobId, Long runId, DatablauJobDescriptor descriptor) {
        return new MetaDataSimilarityJob(descriptor);
    }

    public String getTypeName() {
        return JOB_TYPE_NAME;
    }

    public String getName() {
        return JOB_TYPE_NAME;
    }
}
