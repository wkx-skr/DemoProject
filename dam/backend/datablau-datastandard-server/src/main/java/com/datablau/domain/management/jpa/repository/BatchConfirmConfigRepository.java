package com.datablau.domain.management.jpa.repository;


import com.datablau.domain.management.jpa.entity.BatchApply;
import com.datablau.domain.management.jpa.entity.BatchConfirmConfig;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-09 15:56
 * @description
 */
@Repository
public interface BatchConfirmConfigRepository  extends PagingAndSortingRepository<BatchConfirmConfig, Long>, JpaSpecificationExecutor<BatchConfirmConfig> {


    @Query("select b from BatchConfirmConfig b where b.confirmUser1 = ?1 or b.confirmUser2 = ?2")
    List<BatchConfirmConfig> findByConfirmUser1OrConfirmUser2(String confirmUser1, String confirmUser2);

    @Query("select count(b) from BatchConfirmConfig b where b.domainName = ?1")
    long countByDomainName(String domainName);


}
