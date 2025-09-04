//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

package com.datablau.domain.management.jpa.repository;

import com.datablau.domain.management.jpa.entity.Domain;
import com.datablau.domain.management.jpa.entity.DomainExt;
import com.datablau.domain.management.jpa.entity.DomainSimilarityCheckResult;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;

@Repository("domainSimilarityCheckResultRepo")
public interface DomainSimilarityCheckResultRepository extends CrudRepository<DomainSimilarityCheckResult, Long> {

}
