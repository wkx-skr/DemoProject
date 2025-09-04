package com.datablau.metadata.main.job.descriptor;

import com.datablau.job.scheduler.adapter.JobDescriptorAdapter;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.metadata.main.job.handler.SyncUnstructuredDirectoryJobHandler;
import com.datablau.metadata.main.job.wrapper.SyncUnstructuredDirectoryJobWrapper;
import com.google.common.collect.ImmutableList;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class SyncUnstructuredDirectoryJobDescriptor extends JobDescriptorAdapter {

    private DatablauJobDescriptor descriptor;
    private static List<JobDescriptorHandler> handlers = ImmutableList.of(new SyncUnstructuredDirectoryJobHandler());
    @Override
    public List<DatablauJobDescriptor> getBuildInJob() {
        List<DatablauJobDescriptor> lists = new ArrayList<>();
        lists.add(this.getSyncJobDesc());
        return lists;
    }

    public SyncUnstructuredDirectoryJobDescriptor () {

    }

    public SyncUnstructuredDirectoryJobDescriptor(DatablauJobDescriptor descriptor) {
        this.descriptor = descriptor;
        this.descriptor.setTypeName(SyncUnstructuredDirectoryJobWrapper.JOB_TYPE_NAME);
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
        JobDescriptorHandler handler = getHandler(SyncUnstructuredDirectoryJobHandler.SYNC_UNSTRUCTURED_DIRECTORY_JOB_WRAPPER.getTypeName());
        return handler.getTemplate();
    }
}
