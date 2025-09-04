package com.datablau.metadata.main.job.descriptor;

import com.datablau.job.scheduler.adapter.JobDescriptorAdapter;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.metadata.main.job.handler.SynEtlJobHandler;
import com.datablau.metadata.main.job.wrapper.SynEtlJobWrapper;
import com.google.common.collect.ImmutableList;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-05-28 10:34
 * @description
 */
public class SynEtlJobDescriptor  extends JobDescriptorAdapter {

    private DatablauJobDescriptor descriptor;
    private static List<JobDescriptorHandler> handlers = ImmutableList.of(new SynEtlJobHandler());

    public SynEtlJobDescriptor() {
    }

    @Override
    public List<DatablauJobDescriptor> getBuildInJob() {
        List<DatablauJobDescriptor> lists = new ArrayList();
        lists.add(this.getSyncJobDesc());
        return lists;
    }


    public  SynEtlJobDescriptor(DatablauJobDescriptor descriptor) {
        this.descriptor = descriptor;
        this.descriptor.setTypeName(SynEtlJobWrapper.JOB_TYPE_NAME);
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
        JobDescriptorHandler handler = getHandler(SynEtlJobHandler.SYNC_JOB_WRAPPER.getTypeName());
        return handler.getTemplate();
    }
}
