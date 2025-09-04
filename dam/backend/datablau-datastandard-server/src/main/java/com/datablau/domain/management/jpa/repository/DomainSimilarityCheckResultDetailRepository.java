//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

package com.datablau.domain.management.jpa.repository;

import com.datablau.domain.management.jpa.entity.DomainSimilarityCheckResult;
import com.datablau.domain.management.jpa.entity.DomainSimilarityCheckResultDetail;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository("domainSimilarityCheckResultDetailRepo")
public interface DomainSimilarityCheckResultDetailRepository extends CrudRepository<DomainSimilarityCheckResultDetail, Long> {

    List<DomainSimilarityCheckResultDetail> findAllByDomainIdIn(Collection<String> domainIds);

    List<DomainSimilarityCheckResultDetail> findAllByClusterIdEquals(Long clusterId);
}
