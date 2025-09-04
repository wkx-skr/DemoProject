package com.datablau.domain.management.job.descriptor;

import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.domain.management.job.wrapper.DomainSimilarityCheckJobWrapper;
import com.datablau.domain.management.job.wrapper.SyncDataStandardJobWrapper;
import com.datablau.job.scheduler.adapter.JobDescriptorAdapter;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.job.scheduler.data.JobParameter;
import com.datablau.job.scheduler.data.JobParameterBuilder;
import com.datablau.job.scheduler.data.JobParameterType;

import java.util.ArrayList;
import java.util.List;

public class DomainSimilarityCheckJobDescriptor extends JobDescriptorAdapter {
    public static final DomainSimilarityCheckJobWrapper JOB_WRAPPER = new DomainSimilarityCheckJobWrapper();

    public List<DatablauJobDescriptor> getBuildInJob() {
        List<DatablauJobDescriptor> lists = new ArrayList();
        lists.add(this.getSimilarityCheckJobDes());
        return lists;
    }

    private DatablauJobDescriptor getSimilarityCheckJobDes() {
        DatablauJobDescriptor descriptor = new DatablauJobDescriptor();
        descriptor.setDisabled(false);
        descriptor.setName(JOB_WRAPPER.getTypeName());
        descriptor.setEndVersion(JobDescriptorAdapter.getCurrentVersion());
        descriptor.setTypeName(JOB_WRAPPER.getTypeName());
//        descriptor.setBoundResourceType("MODEL_ID");
        descriptor.setCreator("system");
        List<JobParameter> jobParameters = new ArrayList();
        JobParameterBuilder jobParameterBuilder = new JobParameterBuilder();
        JobParameter p1 = jobParameterBuilder.clear().setName("threshold").setType(JobParameterType.DOUBLE).setDescription(GeneralUtility.getMessageService().getMessage("DomainSimilarityCheckJob.param1")).setDefaultValue("0.7").setMandatory(true).build();
        JobParameter p2 = jobParameterBuilder.clear().setName("groupCount").setType(JobParameterType.LONG).setDescription(GeneralUtility.getMessageService().getMessage("DomainSimilarityCheckJob.param2")).setDefaultValue("20").setMandatory(true).build();
        jobParameters.add(p1);
        jobParameters.add(p2);
        descriptor.setParameters(jobParameters);

        return descriptor;
    }
}
