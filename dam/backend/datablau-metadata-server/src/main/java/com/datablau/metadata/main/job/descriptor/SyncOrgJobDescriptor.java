package com.datablau.metadata.main.job.descriptor;

import com.datablau.job.scheduler.adapter.JobDescriptorAdapter;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.metadata.main.job.handler.SynOrgJobHandler;
import com.datablau.metadata.main.job.wrapper.SynOrgJobWrapper;
import com.google.common.collect.ImmutableList;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class SyncOrgJobDescriptor extends JobDescriptorAdapter {

    private DatablauJobDescriptor descriptor;
    private static List<JobDescriptorHandler> handlers = ImmutableList.of(new SynOrgJobHandler());

    public SyncOrgJobDescriptor() {
    }

    @Override
    public List<DatablauJobDescriptor> getBuildInJob() {
        List<DatablauJobDescriptor> lists = new ArrayList();
        lists.add(this.getSyncJobDesc());
        return lists;
    }


    public SyncOrgJobDescriptor(DatablauJobDescriptor descriptor) {
        this.descriptor = descriptor;
        this.descriptor.setTypeName(SynOrgJobWrapper.JOB_TYPE_NAME);
    }

    public static List<JobDescriptorHandler> getHandlers() {
        return handlers;
    }

    public static JobDescriptorHandler getHandler(String jobType) {
        Iterator var1 = handlers.iterator();

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
        JobDescriptorHandler handler = getHandler(SynOrgJobHandler.SYNC_JOB_WRAPPER.getTypeName());
        return handler.getTemplate();
    }
}
