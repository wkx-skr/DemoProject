package com.datablau.data.asset.job.wrapper;

import com.datablau.data.asset.job.DdmCollectElementJob;
import com.datablau.job.scheduler.adapter.JobWrapper;
import com.datablau.job.scheduler.api.DatablauJob;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import org.quartz.JobDetail;


public class DdmCollectElementJobWrapper extends JobWrapper {


    @Override
    public DatablauJob createJobTask(Long jobId, Long runId, DatablauJobDescriptor datablauJobDescriptor) {
        return new DdmCollectElementJob(datablauJobDescriptor);
    }

    @Override
    public String getTypeName() {
        return "模型元数据采集更新任务";
    }

    @Override
    public String getName() {
        return "模型元数据采集更新任务";
    }
}
