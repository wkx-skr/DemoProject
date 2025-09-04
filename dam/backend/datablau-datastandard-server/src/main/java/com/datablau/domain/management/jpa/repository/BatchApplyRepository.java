package com.datablau.domain.management.jpa.repository;

import com.datablau.domain.management.jpa.entity.BatchApply;
import com.datablau.domain.management.jpa.entity.DomainFolderExt;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-17 13:09
 * @description
 */
@Repository
public interface BatchApplyRepository extends PagingAndSortingRepository<BatchApply, Long>, JpaSpecificationExecutor<BatchApply> {





}
