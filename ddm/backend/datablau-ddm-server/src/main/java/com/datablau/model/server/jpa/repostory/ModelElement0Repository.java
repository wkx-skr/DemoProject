package com.datablau.model.server.jpa.repostory;

import com.datablau.model.data.jpa.entity.ModelElement;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

/**
 * @author: hxs
 * @date: 2025/4/24 18:13
 */
@Repository
public interface ModelElement0Repository extends PagingAndSortingRepository<ModelElement, Long> {

    @Query("select e from ModelElement e where e.modelId = ?1 and e.endVersion is null and e.typeId = 80010001")
    ModelElement findDataSource(Long modelId);

    @Query("select distinct max(e.elementId) from ModelElement e where e.modelId = ?1")
    Long getMaxElementId(Long modelId);
}
