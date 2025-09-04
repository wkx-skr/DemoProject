package com.datablau.project.api.impl;

import com.datablau.project.api.RemoteJobSchedulerServiceNew;
import com.datablau.project.api.dto.JobResultDto;

import java.util.List;

public class EmptyRemoteJobSchedulerNewServiceImpl implements RemoteJobSchedulerServiceNew {
    @Override
    public List<JobResultDto> queryJobByResIdAndType(List<String> resIds, String type) {
        return List.of();
    }
}
