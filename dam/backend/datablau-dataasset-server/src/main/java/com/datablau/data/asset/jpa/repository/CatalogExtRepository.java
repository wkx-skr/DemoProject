package com.datablau.data.asset.jpa.repository;

import com.datablau.data.asset.jpa.entity.CatalogExt;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.Collection;
import java.util.List;

/**
 * @author: hxs
 * @date: 2025/4/28 14:40
 */
public interface CatalogExtRepository extends CrudRepository<CatalogExt, Long> {

    @Query("select c from CatalogExt c where c.catalogId = ?1")
    CatalogExt findByCatalogId(Long catalogId);


    List<CatalogExt> findAll();

    List<CatalogExt> findByDomainIdIn(Collection<String> domainIds);

    List<CatalogExt> findByCatalogIdIn(Collection<Long> catalogIds);

}
