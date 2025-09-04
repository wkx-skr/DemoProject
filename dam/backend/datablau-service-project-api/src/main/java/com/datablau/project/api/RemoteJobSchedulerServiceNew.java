package com.datablau.project.api;

import com.datablau.project.api.dto.JobResultDto;

import java.util.List;

public interface RemoteJobSchedulerServiceNew {

    List<JobResultDto> queryJobByResIdAndType(List<String> resIds, String type);
}
