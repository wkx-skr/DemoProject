package com.datablau.job.scheduler.service;

import com.datablau.job.scheduler.jpa.repository.CommonJobNewRepository;
import com.datablau.project.api.RemoteJobSchedulerServiceNew;
import com.datablau.project.api.dto.JobResultDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RemoteJobSchedulerServiceNewImpl implements RemoteJobSchedulerServiceNew {
    @Autowired
    private CommonJobNewRepository jobNewRepository;
    @Override
    public List<JobResultDto> queryJobByResIdAndType(List<String> resIds, String type) {
        return jobNewRepository.queryJobByResIdAndType(resIds, type);
    }
}
