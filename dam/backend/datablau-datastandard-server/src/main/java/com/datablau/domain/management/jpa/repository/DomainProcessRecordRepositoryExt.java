package com.datablau.domain.management.jpa.repository;

import com.datablau.domain.management.jpa.entity.DomainProcessRecord;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @ClassName：DomainProcessRecordRepositoryExt
 * @Author: dingzicheng
 * @Date: 2025/1/9 16:39
 * @Description: 必须描述类做什么事情, 实现什么功能
 */
@Repository
public interface DomainProcessRecordRepositoryExt extends CrudRepository<DomainProcessRecord, Long> {
    @Query("select d from DomainProcessRecord d where d.processInstanceId like ?1")
    List<DomainProcessRecord> findAllByProcessInstanceIdLike(String processInstanceId);

    List<DomainProcessRecord> findAll();
}
