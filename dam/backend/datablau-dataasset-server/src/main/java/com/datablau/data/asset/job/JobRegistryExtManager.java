package com.datablau.data.asset.job;

import com.datablau.data.asset.job.descriptor.PipeAssetsCheckJobDescriptor;
import com.datablau.job.scheduler.adapter.JobRegistryAdapter;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.google.common.collect.Lists;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.List;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-01 17:05
 * @description
 */
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
            datablauJobDescriptors.addAll(new PipeAssetsCheckJobDescriptor().getBuildInJob());

            jobRegistryAdapter.registerJobInfo(datablauJobDescriptors);
        } catch (Exception var2) {
            Exception e = var2;
            log.error("注册任务失败" + e);
        }
    }
}
