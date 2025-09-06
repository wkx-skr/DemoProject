package com.datablau.archy.server.jpa.repository;

import com.datablau.archy.server.jpa.entity.ArchySubjectExt;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

/**
 * @author: hxs
 * @date: 2025/4/3 15:10
 */
public interface ArchySubjectExtRepository extends CrudRepository<ArchySubjectExt, Long> {

    @Query("select a from ArchySubjectExt a where a.damId = ?1 and a.type = ?2")
    ArchySubjectExt findByDamIdAndType(Long damId, Integer type);

    @Query("delete from ArchySubjectExt a where a.archyObjectId in ?1 and a.type = 1")
    @Modifying
    void deleteByArchyObjectId(List<String> archyObjectIds);

    @Query("delete from ArchySubjectExt a where a.archyId in ?1 and a.type = 0")
    @Modifying
    void deleteByArchySubId(List<Long> archyIds);

    @Query("select a from ArchySubjectExt a where a.archyObjectId = ?1")
    ArchySubjectExt findByArchyObjectId(String archyObjectId);
}
