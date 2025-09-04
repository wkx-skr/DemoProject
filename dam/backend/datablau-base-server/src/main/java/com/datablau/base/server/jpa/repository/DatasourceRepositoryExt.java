package com.datablau.base.server.jpa.repository;

import com.datablau.base.server.jpa.entity.DatasourceEntity;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

/**
 * @author: hxs
 * @date: 2025/6/4 10:45
 */
@Repository("datasourceRepositoryExt")
public interface DatasourceRepositoryExt extends CrudRepository<DatasourceEntity, Long> {

    @Query("select d from DatasourceEntity d where d.categoryId in ?1")
    List<DatasourceEntity> findByCategoryIdIn(Collection<Long> var1);

    DatasourceEntity findByIdEquals(Long var1);

    @Query("SELECT COUNT(*) FROM DatasourceEntity ds WHERE LOWER(ds.name) = ?1")
    int findByNameConflicts(String var1);

    @Modifying
    @Query("DELETE FROM DatasourceEntity ds WHERE ds.id = ?1")
    void deleteByIdEquals(Long var1);

    boolean existsByCategoryId(Long var1);
}
