package com.datablau.data.asset.job.wrapper;


import com.datablau.data.asset.job.PipeAssetsCheckJob;
import com.datablau.job.scheduler.adapter.JobWrapper;
import com.datablau.job.scheduler.api.DatablauJob;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-05-20 10:07
 * @description
 */
public class PipeAssetsCheckJobWrapper extends JobWrapper {
    public final static String JOB_TYPE_NAME = "元数据质量探查任务";

    public PipeAssetsCheckJobWrapper() {
    }

    public DatablauJob createJobTask(Long jobId, Long runId, DatablauJobDescriptor descriptor)  {
        return new PipeAssetsCheckJob(descriptor);
    }

    public String getTypeName() {
        return JOB_TYPE_NAME;
    }

    public String getName() {
        return JOB_TYPE_NAME;
    }
}
