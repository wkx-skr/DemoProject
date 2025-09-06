package com.datablau.archy.server.jpa.repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;

/**
 * @author: hxs
 * @date: 2025/5/13 14:31
 */
public interface ArchyObjectVersionExtRepository extends ArchyObjectVersionRepository{

    @Query("delete from ArchyObjectVersion v where v.objectId = ?1")
    @Modifying
    void deleteArchyObjectVersionByObjectId(String objectId);

}
