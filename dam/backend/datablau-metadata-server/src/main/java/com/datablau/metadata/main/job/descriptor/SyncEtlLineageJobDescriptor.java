package com.datablau.metadata.main.job.descriptor;

import com.datablau.job.scheduler.adapter.JobDescriptorAdapter;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.metadata.main.job.handler.SyncEtlLineageJobHandler;
import com.datablau.metadata.main.job.wrapper.SyncEtlLineageJobWrapper;
import com.google.common.collect.ImmutableList;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class SyncEtlLineageJobDescriptor extends JobDescriptorAdapter {

    private DatablauJobDescriptor descriptor;
    private static List<JobDescriptorHandler> handlers = ImmutableList.of(new SyncEtlLineageJobHandler());

    public SyncEtlLineageJobDescriptor () {

    }

    public SyncEtlLineageJobDescriptor (DatablauJobDescriptor descriptor) {
        this.descriptor = descriptor;
        this.descriptor.setTypeName(SyncEtlLineageJobWrapper.JOB_TYPE_NAME);
    }

    @Override
    public List<DatablauJobDescriptor> getBuildInJob() {
        List<DatablauJobDescriptor> lists = new ArrayList<>();
        lists.add(this.getSyncJobDesc());
        return lists;
    }

    public static JobDescriptorHandler getHandler(String jobType) {
        Iterator<JobDescriptorHandler> var1 = handlers.iterator();

        JobDescriptorHandler handler;
        do {
            if (!var1.hasNext()) {
                return null;
            }

            handler = (JobDescriptorHandler)var1.next();
        } while(!handler.canHandle(jobType));

        return handler;
    }

    private DatablauJobDescriptor getSyncJobDesc() {
        JobDescriptorHandler handler = getHandler(SyncEtlLineageJobHandler.SYNC_ETL_LINEAGE_JOB_WRAPPER.getName());
        return handler.getTemplate();
    }
}
