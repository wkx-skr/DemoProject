package com.datablau.metadata.main.job;

import com.datablau.job.scheduler.adapter.JobDescriptorAdapter;
import com.datablau.job.scheduler.adapter.JobRegistryAdapter;
import com.datablau.job.scheduler.api.JobRegistry;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.metadata.main.job.descriptor.*;
import com.google.common.collect.Lists;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.List;

@Component
public class JobRegistryExtManager {

    private static final Logger log = LoggerFactory.getLogger(JobRegistryExtManager.class);

    @Autowired
    private JobRegistryAdapter jobRegistryAdapter;


    public JobRegistryExtManager() {
        super();
    }

    @PostConstruct
    public void register() {
        try {
//            List<DatablauJobDescriptor> datablauJobDescriptors = Lists.newArrayList();
//            DatablauJobDescriptor user = new DatablauJobDescriptor();
//            user.setDisabled(false);
//            user.setName("用户全量同步任务");
//            user.setEndVersion(JobDescriptorAdapter.getCurrentVersion());
//            user.setTypeName("用户全量同步任务");
//            datablauJobDescriptors.add(user);
            List<DatablauJobDescriptor> datablauJobDescriptors = Lists.newArrayList();
            datablauJobDescriptors.addAll(new SyncUserJobDescriptor().getBuildInJob());
            datablauJobDescriptors.addAll(new SyncOrgJobDescriptor().getBuildInJob());
            datablauJobDescriptors.addAll(new SynEtlJobDescriptor().getBuildInJob());
            datablauJobDescriptors.addAll(new SyncUnstructuredDirectoryJobDescriptor().getBuildInJob());
            datablauJobDescriptors.addAll(new SyncTimeSeriesDataJobDescriptor().getBuildInJob());
            datablauJobDescriptors.addAll(new MetaDataSimilarityJobDescriptor().getBuildInJob());
            datablauJobDescriptors.addAll(new SyncEtlLineageJobDescriptor().getBuildInJob());
            jobRegistryAdapter.registerJobInfo(datablauJobDescriptors);
        } catch (Exception var2) {
            Exception e = var2;
            log.error("注册任务失败" + e);
        }
    }
}
