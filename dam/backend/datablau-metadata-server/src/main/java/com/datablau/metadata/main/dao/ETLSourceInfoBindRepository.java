package com.datablau.metadata.main.dao;

import com.datablau.metadata.main.entity.ETLSourceInfoBind;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ETLSourceInfoBindRepository extends PagingAndSortingRepository<ETLSourceInfoBind, Long> {


    @Query("SELECT E FROM ETLSourceInfoBind E WHERE E.srcObjectId = ?1 AND E.targetObjectId = ?2")
    ETLSourceInfoBind findBySrcObjectIdAndTargetObjectId(Long srcObjectId, Long targetObjectId);






}
