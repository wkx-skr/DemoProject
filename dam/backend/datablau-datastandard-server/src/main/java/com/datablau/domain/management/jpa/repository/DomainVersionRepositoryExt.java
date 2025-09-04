package com.datablau.domain.management.jpa.repository;


import com.datablau.domain.management.jpa.entity.Domain;
import com.datablau.domain.management.jpa.entity.DomainVersion;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository("domainVersionRepositoryExt")
@Primary
public interface DomainVersionRepositoryExt extends DomainVersionRepository{


    @Query("SELECT dv FROM DomainVersion dv WHERE dv.version != 1 and dv.lastReview BETWEEN  ?1 and ?2")
    List<DomainVersion> findNewVersionByMonth(Date startDate, Date endDate);
}
