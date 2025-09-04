package com.datablau.data.asset.jpa.repository;

import com.datablau.data.asset.jpa.entity.CheckResultHandlerResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-16 14:00
 * @description
 */
@Repository
public interface CheckResultHandlerResultRepository extends JpaSpecificationExecutor<CheckResultHandlerResult>, JpaRepository<CheckResultHandlerResult, Long> {


    List<CheckResultHandlerResult> findByObjectIdIn(Collection<Long> objectIds);

    @Query("select c from CheckResultHandlerResult c where c.batchNu = ?1")
    List<CheckResultHandlerResult> findByBatchNu(String batchNu);

}
