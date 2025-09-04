package com.datablau.data.asset.jpa.repository;

import com.datablau.data.asset.jpa.entity.DdmMappingCatalog;
import com.datablau.data.asset.jpa.entity.MetaDataMappingCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MetaDataMappingCatalogRepository extends JpaSpecificationExecutor<MetaDataMappingCatalog>, JpaRepository<MetaDataMappingCatalog, Long> {


    @Query("select c from MetaDataMappingCatalog c where c.catalogId in (?1)")
    List<MetaDataMappingCatalog> queryMappingCatalogs(List<Long> catalogIds);

    @Query("select c from MetaDataMappingCatalog c where c.modelCategoryId in (?1) and c.modelId in (?2) and c.objectId in (?3) and c.objectLevel = ?4 ")
    List<MetaDataMappingCatalog> queryMappingCatalogsByObjectIds(List<Long> modelCategoryIds, List<Long>modelIds, List<Long> objectIds, String level);

    @Query("select distinct c.businessObjectId from MetaDataMappingCatalog c where c.modelId = ?1")
    List<Long> findByDdmModelId(Long ddmModelId);

    @Query("select c from MetaDataMappingCatalog c where c.catalogId in (?1) and c.mappingType in (?2)")
    List<MetaDataMappingCatalog> queryDdmMappingCatalogsByCatalogIdsAndMappingTypes(List<Long> catalogIds, List<String> mappingTypes);

    @Query("select distinct c.businessObjectId from MetaDataMappingCatalog c where c.modelCategoryId = ?1")
    List<Long> findByModelCategoryId(Long modelCategoryId);

    @Query("select distinct c.businessObjectId from MetaDataMappingCatalog c where c.parentModelId = ?1")
    List<Long> findByParentModelId(Long parentModelId);

    @Query(value = "SELECT p.parent_catalog_id " +
            "FROM (VALUES (:parentCatalogIds)) AS p(parent_catalog_id) " +
            "WHERE p.parent_catalog_id NOT IN (" +
            "    SELECT parent_catalog_id " +
            "    FROM meta_data_mapping_catalog" +
            ")", nativeQuery = true)
    List<Long> findMissingParentCatalogIds(List<Long> parentCatalogIds);

    @Query("select count(1) from MetaDataMappingCatalog c where c.parentCatalogId = ?1 and c.mappingType in (?2)")
    Long countMapping(Long parentCatalogId, List<String> mappingTypes);
    @Query("select c from MetaDataMappingCatalog c where c.catalogId = ?1")
    MetaDataMappingCatalog  queryMappingCatalog(Long catalogId);
}
