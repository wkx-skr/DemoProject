package com.datablau.data.asset.jpa.repository;

import com.datablau.data.asset.jpa.entity.DataAssets;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Set;

@Repository
public interface ExtDataAssetsRepository extends CrudRepository<DataAssets, Long> {

  @Query("SELECT da FROM DataAssets da")
  List<DataAssets> findAllList();

  @Query("SELECT distinct da.catalogId FROM DataAssets da WHERE da.catalogId IN ?1")
  Set<Long> findAllCatalogIdSetByCatalogIdIn(Collection<Long> catalogIds);


  /**
   * 统计使用到的方法 直接通过typeid全量查询
   * @param itemTypeIds
   * @return
   */
  List<DataAssets> findByItemTypeIdIn(Collection<Long> itemTypeIds);

}
