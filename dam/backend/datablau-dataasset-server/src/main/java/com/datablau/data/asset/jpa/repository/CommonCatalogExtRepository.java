package com.datablau.data.asset.jpa.repository;

import com.datablau.catalog.enums.EnumAssetsCatalogStatus;
import com.datablau.catalog.enums.EnumCatalogPublicType;
import com.datablau.catalog.jpa.entity.CommonCatalog;
import com.datablau.catalog.jpa.repository.CommonCatalogRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;

/**
 * @author: hxs
 * @date: 2025/4/3 15:10
 */
public interface CommonCatalogExtRepository extends CommonCatalogRepository {

    @Query("select c from CommonCatalog c where c.code = ?1 and c.level = ?2")
    List<CommonCatalog> findByCodeAndLevel(String code, int level);

    @Query("select c from CommonCatalog c where c.code = ?1")
    CommonCatalog findByCode(String code);

    CommonCatalog findByStructureIdAndEnglishName(Long structureId, String englishName);

    @Query("select c from CommonCatalog c where c.name = ?1")
    CommonCatalog findByName(String chineseName);

    @Query("select c from CommonCatalog c where c.name = ?1 and c.level = ?2")
    CommonCatalog findByNameAndLevel(String chineseName, Integer level);

    @Query("select c from CommonCatalog c where c.englishName = ?1")
    CommonCatalog findByEnglishName(String englishName);

    @Query("select c from CommonCatalog c where c.catalogPath  like ?1 and c.level = ?2 and c.status = ?3 ")
    List<CommonCatalog> findByCatalogPathLikeAndLevel(String catalogPath, int level, EnumAssetsCatalogStatus status);

    @Query("select c from CommonCatalog c where c.catalogPath  like ?1 and c.level = ?2 and c.status = ?3 ")
    List<CommonCatalog> findAllByCatalogPathLikeAndLevel(String catalogPath, int level, EnumAssetsCatalogStatus status);

    @Query("select distinct c.catalogPath from CommonCatalog c where c.id = ?1")
    String findCatalogPathById(Long businessObjectId);

    @Query("select distinct c.catalogPath from CommonCatalog c where c.id in (?1)")
    List<String> findCatalogPathByIds(List<Long> businessObjectIds);

    @Query("select c from CommonCatalog c where c.status = ?1")
    List<CommonCatalog> findByStatus(EnumAssetsCatalogStatus status);

    @Query("select c from CommonCatalog c where c.status = ?1 and c.level in ?2")
    List<CommonCatalog> findByStatusAndLevelIn(EnumAssetsCatalogStatus status, Collection<Integer> levels);

    List<CommonCatalog> findByLevelAndStatus(Integer level, EnumAssetsCatalogStatus status);
}
