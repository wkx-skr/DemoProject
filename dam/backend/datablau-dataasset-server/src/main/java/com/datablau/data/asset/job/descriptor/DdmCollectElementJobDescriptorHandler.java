package com.datablau.data.asset.job.descriptor;

import com.andorj.common.core.exception.InvalidArgumentException;
import com.andorj.model.common.utility.GeneralUtility;
import com.datablau.data.asset.job.wrapper.DdmCollectElementJobWrapper;
import com.datablau.job.scheduler.adapter.JobDescriptorAdapter;
import com.datablau.job.scheduler.data.DatablauJobDescriptor;
import com.datablau.job.scheduler.data.JobParameter;
import com.datablau.job.scheduler.data.JobParameterBuilder;
import com.datablau.job.scheduler.data.JobParameterType;
import com.google.common.base.Strings;

import java.util.ArrayList;
import java.util.List;

public class DdmCollectElementJobDescriptorHandler implements JobDescriptorHandler{

    public static  final DdmCollectElementJobWrapper DDM_COLLECT_ELEMENT_JOB_WRAPPER = new DdmCollectElementJobWrapper();




    @Override
    public DatablauJobDescriptor getTemplate() {
        DatablauJobDescriptor descriptor = new DatablauJobDescriptor();
        descriptor.setDisabled(false);
        descriptor.setName(DDM_COLLECT_ELEMENT_JOB_WRAPPER.getName());
        descriptor.setEndVersion(JobDescriptorAdapter.getCurrentVersion());
        descriptor.setTypeName(DDM_COLLECT_ELEMENT_JOB_WRAPPER.getTypeName());
        descriptor.setBoundResourceType("DDM_MODEL_ID");
        List<JobParameter> jobParameters = new ArrayList();
        JobParameterBuilder jobParameterBuilder = new JobParameterBuilder();
        JobParameter modelIdsParameter = jobParameterBuilder.setName("ddmModelId").setType(JobParameterType.LONG).setDescription("ddm模型ID").setMandatory(true).build();
        jobParameters.add(modelIdsParameter);
        descriptor.setParameters(jobParameters);
        return descriptor;
    }

    @Override
    public void validateJobDescriptor(DatablauJobDescriptor datablauJobDescriptor) {
        if (Strings.isNullOrEmpty(datablauJobDescriptor.getName())) {
            throw new InvalidArgumentException("Name is required");
        } else {
            datablauJobDescriptor.setEndVersion(JobDescriptorAdapter.getCurrentVersion());
        }
    }

    @Override
    public boolean canHandle(String jobType) {
        return DDM_COLLECT_ELEMENT_JOB_WRAPPER.getTypeName().equals(jobType);
    }
}
