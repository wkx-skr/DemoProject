package com.datablau.archy.server.jpa.repository;

import com.datablau.archy.server.jpa.entity.ArchyObject;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * @author: hxs
 * @date: 2025/4/10 14:58
 */
public interface ArchyObjectExtRepository extends ArchyObjectRepository{

    @Query("SELECT ao FROM ArchyObject ao WHERE ao.subjectId in ?1")
    List<ArchyObject> findArchyObjectsBySubjectIds(List<Long> subjectIds);

}
