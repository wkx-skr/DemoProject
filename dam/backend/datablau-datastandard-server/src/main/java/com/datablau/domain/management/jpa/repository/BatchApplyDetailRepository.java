package com.datablau.domain.management.jpa.repository;

import com.datablau.domain.management.jpa.entity.BatchApply;
import com.datablau.domain.management.jpa.entity.BatchApplyDetail;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-17 13:11
 * @description
 */
@Repository()
public interface BatchApplyDetailRepository extends CrudRepository<BatchApplyDetail, Long> {


    long deleteByBatchId(Long batchId);

    @Query("select b from BatchApplyDetail b where b.code in ?1 and b.dataType = ?2")
    List<BatchApplyDetail> findByCodeInAndDataType(Collection<String> codes, String applyType);

    List<BatchApplyDetail> findByBatchId(Long batchId);


}
