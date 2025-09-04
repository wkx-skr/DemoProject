package com.datablau.data.asset.jpa.repository;

import com.datablau.data.asset.jpa.entity.CheckBatch;
import com.datablau.data.asset.jpa.entity.CheckUserName;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-30 16:13
 * @description
 */
@Repository
public interface CheckBatchRepository  extends CrudRepository<CheckBatch,Long> {
}
