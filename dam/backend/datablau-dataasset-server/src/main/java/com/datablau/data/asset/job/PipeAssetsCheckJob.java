package com.datablau.data.asset.job;

import com.andorj.enhance.recommender.api.ColumnClusterService;
import com.andorj.model.common.utility.BeanHelper;
import com.datablau.data.asset.service.DdmRelModelCategoryService;
import com.datablau.data.asset.service.PipeAssetsCheckService;
import com.datablau.job.scheduler.adapter.DatablauJobAdapter;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.job.scheduler.data.DatablauJobExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-05-20 10:06
 * @description
 */
public class PipeAssetsCheckJob extends DatablauJobAdapter {

    private static final Logger logger = LoggerFactory.getLogger(PipeAssetsCheckJob.class);
    private float threshold;
    private int groupCount;
    private ColumnClusterService columnCluster;

    private PipeAssetsCheckService pipeAssetsCheckService;

    public PipeAssetsCheckJob(DatablauJobDescriptor descriptor)  {
//        if (descriptor.getParameterByName("threshold") != null) {
//            this.threshold = Float.parseFloat(descriptor.getParameterByName("threshold").getValue());
//        }

//        if (descriptor.getParajmeterByName("groupCount") != null) {
//            this.groupCount = Integer.parseInt(descriptor.getParameterByName("groupCount").getValue());
//        }

    }



    @Override
    protected void prepare() throws Exception {
      //  super.prepare();
        this.pipeAssetsCheckService = BeanHelper.getBean(PipeAssetsCheckService.class);
        if (this.pipeAssetsCheckService == null) {
            throw new DatablauJobExecutionException("Cannot find pipeAssetsCheckService");
        }


    }

    @Override
    protected void execute() throws Exception {
        pipeAssetsCheckService.checkAssetsElement();
        //super.execute();
    }
}
