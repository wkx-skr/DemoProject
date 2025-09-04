package com.datablau.domain.management.jpa.repository;


import com.datablau.domain.management.data.DomainState;
import com.datablau.domain.management.jpa.entity.Domain;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Date;
import java.util.List;

@Repository("domainRepositoryExt")
@Primary
public interface DomainRepositoryExt extends DomainRepository{


    List<Domain> findByFolderIdInAndState(Collection<Long> folderIds, DomainState state);

    long countByState(DomainState state);

    List<Domain> findByFirstPublishBetween(Date firstPublishStart, Date firstPublishEnd);

    List<Domain> findByStateAndLastReviewBetween(DomainState state, Date lastReviewStart, Date lastReviewEnd);
}
