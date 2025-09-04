package com.datablau.data.asset.jpa.repository;

import com.datablau.data.asset.jpa.entity.CheckUserName;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-05-26 10:39
 * @description
 */
@Repository
public interface CheckUserNameRepository extends CrudRepository<CheckUserName,Long> {




}
