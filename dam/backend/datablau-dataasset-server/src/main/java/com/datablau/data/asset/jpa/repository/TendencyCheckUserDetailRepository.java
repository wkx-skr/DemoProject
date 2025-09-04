package com.datablau.data.asset.jpa.repository;


import com.datablau.data.asset.jpa.entity.TendencyCheckUserDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-05-21 13:15
 * @description
 */
@Repository
public interface TendencyCheckUserDetailRepository extends JpaSpecificationExecutor<TendencyCheckUserDetail>, JpaRepository<TendencyCheckUserDetail,Long> {


    List<TendencyCheckUserDetail> findByBatchDate(String batchDate);
}
