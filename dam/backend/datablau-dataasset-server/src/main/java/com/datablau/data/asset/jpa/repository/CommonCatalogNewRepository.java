package com.datablau.data.asset.jpa.repository;

import com.datablau.catalog.enums.EnumAssetsCatalogStatus;
import com.datablau.catalog.jpa.entity.CommonCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface CommonCatalogNewRepository extends JpaSpecificationExecutor<CommonCatalog>, JpaRepository<CommonCatalog, Long> {

    @Query("select c from CommonCatalog c where c.structureId in (?1) and c.catalogPath = ?2 and c.status = ?3")
    List<CommonCatalog> findCommonCatalogs(List<Long> structureIds, String catalogPath, EnumAssetsCatalogStatus status);
    @Query("select c from CommonCatalog c where c.id in (?1) and c.status = ?2")
    List<CommonCatalog> findCommonCatalogsByIdAndStatus(List<Long> ids,  EnumAssetsCatalogStatus status);
    @Query("select c from CommonCatalog c where c.englishName in (?1) and c.status = ?2 and c.level = ?3")
    List<CommonCatalog> findCommonCatalogsByNames(List<String> names,  EnumAssetsCatalogStatus status, Integer level);
    @Query("select c from CommonCatalog c where c.structureId in (?1) and c.level = ?2 and c.status = ?3")
    List<CommonCatalog> findCommonCatalogsByLevel(List<Long> structureIds, Integer level, EnumAssetsCatalogStatus status);
    @Query("select c from CommonCatalog c where c.parentId in (?1) and c.englishName in (?2) and c.status = ?3 and c.level = ?4")
    List<CommonCatalog> findCommonCatalogsByPatentId(Collection<Long> parentId, List<String> names, EnumAssetsCatalogStatus status, Integer level);
}
