package com.datablau.model.server.jpa.repostory;

import com.datablau.model.server.jpa.entity.ModelElementExt;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

/**
 *
 * @author: hxs
 * @date: 2025/4/24 16:11
 */
public interface ModelElementExtRepostory extends CrudRepository<ModelElementExt, Long> {

    @Query("select e from ModelElementExt e where e.archyId = ?1")
    List<ModelElementExt> findByArchyId(String archyId);

    List<ModelElementExt> findAll();

    @Query("select e from ModelElementExt e where e.modelElementId in ?1 and e.archyId = ?2")
    List<ModelElementExt> findByModelElementId(List<Long> elementIds, String archyObjectId);

    @Modifying
    @Query("delete from ModelElementExt e where e.modelElementId in ?1")
    void deleteByElementId(List<Long> elementIds);

    void deleteAllByModelElementId(Long elementId);
}
