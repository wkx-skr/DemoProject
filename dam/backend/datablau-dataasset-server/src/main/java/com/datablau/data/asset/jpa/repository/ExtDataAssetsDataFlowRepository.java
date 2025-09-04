package com.datablau.data.asset.jpa.repository;

import com.datablau.data.asset.jpa.entity.ExtDataAssetsDataFlow;
import com.datablau.data.asset.jpa.entity.ExtDataAssetsDataFlowId;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.Set;

@Repository
public interface ExtDataAssetsDataFlowRepository extends PagingAndSortingRepository<ExtDataAssetsDataFlow, ExtDataAssetsDataFlowId> {

  ExtDataAssetsDataFlow findByModelCategoryIdAndL4Code(Long modelCategoryId, String l4Code);

  List<ExtDataAssetsDataFlow> findByModelCategoryIdEquals(Long modelCategoryId);

  List<ExtDataAssetsDataFlow> findByL4CodeEquals(String l4Code);

  @Modifying
  @Query("DELETE FROM ExtDataAssetsDataFlow df WHERE df.modelCategoryId = ?1 AND df.l4Code = ?2")
  void deleteByModelCategoryIdAndL4CodeEquals(Long modelCategoryId, String l4Code);

  @Query("SELECT CONCAT(df.l4Code, '_', df.modelCategoryId) FROM ExtDataAssetsDataFlow df")
  Set<String> findAllKeys();


  @Query("SELECT distinct df.l4Code FROM ExtDataAssetsDataFlow df")
  Set<String> findAllL4Code();

  @Query("SELECT distinct df.modelCategoryId FROM ExtDataAssetsDataFlow df")
  List<Long> findAllModelCategoryId();

  // 根据keys删除记录
  @Modifying
  @Transactional
  @Query("DELETE FROM ExtDataAssetsDataFlow e WHERE CONCAT(e.l4Code, '_', e.modelCategoryId) IN :keys")
  int deleteByKeys(@Param("keys") Set<String> keys);

  long deleteByL4CodeIn(Collection<String> l4Codes);
}
