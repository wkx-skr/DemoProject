package com.datablau.job.scheduler.jpa.repository;


import com.datablau.job.scheduler.jpa.entity.CommonJob;
import com.datablau.project.api.dto.JobResultDto;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommonJobNewRepository extends CrudRepository<CommonJob, Long> {

    @Query("select new com.datablau.project.api.dto.JobResultDto(id,resourceId) from CommonJob where resourceId in (?1) and jobType = ?2")
    List<JobResultDto> queryJobByResIdAndType(List<String> resId, String type);
}
