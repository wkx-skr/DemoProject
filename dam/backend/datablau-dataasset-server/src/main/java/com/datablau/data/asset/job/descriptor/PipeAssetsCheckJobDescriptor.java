package com.datablau.data.asset.job.descriptor;

import com.datablau.data.asset.job.handler.PipeAssetsCheckJobHandler;
import com.datablau.data.asset.job.wrapper.PipeAssetsCheckJobWrapper;
import com.datablau.job.scheduler.adapter.JobDescriptorAdapter;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.google.common.collect.ImmutableList;


import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-01 17:09
 * @description
 */
public class PipeAssetsCheckJobDescriptor  extends JobDescriptorAdapter {

    private DatablauJobDescriptor descriptor;
    private static List<JobDescriptorHandler> handlers = ImmutableList.of(new PipeAssetsCheckJobHandler());

    public  PipeAssetsCheckJobDescriptor() {
    }

    @Override
    public List<DatablauJobDescriptor> getBuildInJob() {
        List<DatablauJobDescriptor> lists = new ArrayList();
        lists.add(this.getSyncJobDesc());
        return lists;
    }


    public   PipeAssetsCheckJobDescriptor(DatablauJobDescriptor descriptor) {
        this.descriptor = descriptor;
        this.descriptor.setTypeName(PipeAssetsCheckJobWrapper.JOB_TYPE_NAME );
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
        JobDescriptorHandler handler = getHandler( PipeAssetsCheckJobHandler.SYNC_JOB_WRAPPER.getTypeName());
        return handler.getTemplate();
    }
}

