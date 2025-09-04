package com.datablau.data.asset.jpa.repository;

import com.datablau.catalog.jpa.entity.CommonCatalog;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExtCommonCatalogRepository extends CrudRepository<CommonCatalog, Long> {

  @Query("SELECT cc FROM CommonCatalog cc")
  List<CommonCatalog> findAllList();

  @Query("SELECT cc FROM CommonCatalog cc WHERE cc.status = 'PUBLISHED'")
  List<CommonCatalog> findAllPublishedList();

  @Query("SELECT cc FROM CommonCatalog cc WHERE cc.status = 'PUBLISHED' AND cc.level = 3")
  List<CommonCatalog> findAllPublishedL3List();

  @Query("SELECT cc FROM CommonCatalog cc WHERE cc.status = 'PUBLISHED' AND cc.level = 4")
  List<CommonCatalog> findAllPublishedL4List();

  List<CommonCatalog> findAllListByParentId(Long parentId);

  @Query("SELECT cc FROM CommonCatalog cc WHERE cc.status = 'PUBLISHED' AND cc.level = 4 AND cc.code = ?1")
  CommonCatalog findPublishedL4ByCode(String code);
}
