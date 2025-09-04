package com.datablau.data.asset.jpa.repository;

import com.datablau.data.asset.jpa.entity.DdmMappingCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DdmMappingCatalogRepository extends JpaSpecificationExecutor<DdmMappingCatalog>, JpaRepository<DdmMappingCatalog, Long> {


    @Query("select c from DdmMappingCatalog c where c.catalogId in (?1) and c.mappingType = ?2")
    List<DdmMappingCatalog> queryDdmMappingCatalogs(List<Long> catalogIds, String mappingType);

    @Query("select c from DdmMappingCatalog c where c.modelCategoryId in (?1) and c.ddmModelId in (?2) and c.objectId in (?3) and c.objectLevel = ?4")
    List<DdmMappingCatalog> queryDdmMappingCatalogsByObjectIds(List<Long> modelCategoryIds, List<Long>ddmModelIds, List<Long> objectIds, String level);

    @Query("select c from DdmMappingCatalog c where c.catalogId in (?1) and c.mappingType in (?2)")
    List<DdmMappingCatalog> queryDdmMappingCatalogsByCatalogIdsAndMappingTypes(List<Long> catalogIds, List<String> mappingTypes);

    @Query("select c from DdmMappingCatalog c where c.catalogId in (?1)")
    List<DdmMappingCatalog> queryMappingByTypes(List<Long> catalogIds);

    @Query("select distinct c.businessObjectId from DdmMappingCatalog c where c.ddmModelId = ?1")
    List<Long> findByDdmModelId(Long ddmModelId);

    @Query("select distinct c.businessObjectId from DdmMappingCatalog c where c.modelCategoryId = ?1")
    List<Long> findByModelCategoryId(Long modelCategoryId);
}
