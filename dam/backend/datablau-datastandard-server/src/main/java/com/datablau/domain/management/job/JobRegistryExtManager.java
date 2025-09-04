package com.datablau.domain.management.job;

import com.datablau.domain.management.job.descriptor.DomainSimilarityCheckJobDescriptor;
import com.datablau.job.scheduler.adapter.JobRegistryAdapter;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
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
            List<DatablauJobDescriptor> datablauJobDescriptors = Lists.newArrayList();
            datablauJobDescriptors.addAll(new DomainSimilarityCheckJobDescriptor().getBuildInJob());
            jobRegistryAdapter.registerJobInfo(datablauJobDescriptors);
        } catch (Exception var2) {
            Exception e = var2;
            log.error("注册任务失败" + e);
        }
    }
}
