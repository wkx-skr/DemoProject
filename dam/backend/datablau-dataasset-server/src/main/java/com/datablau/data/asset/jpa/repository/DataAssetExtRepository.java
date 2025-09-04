package com.datablau.data.asset.jpa.repository;

import com.datablau.catalog.enums.EnumSupportType;
import com.datablau.data.asset.jpa.entity.DataAssets;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author: hxs
 * @date: 2025/4/13 10:31
 */
@Repository
public interface DataAssetExtRepository extends PagingAndSortingRepository<DataAssets, Long> {

    @Query("select d from DataAssets d where d.itemId in ?1 and d.subItemType in ?2")
    List<DataAssets> findByObjectIds(List<String> objectIds, List<EnumSupportType> subItemTypes);

    @Query(value = "SELECT count(*) FROM ddc_assets da " +
            "INNER JOIN db_common_catalog dcc ON da.catalog_id = dcc.id " +
            "WHERE dcc.catalog_type_id = :catalogTypeId " +
            "AND da.sub_type = :subItemType",
            nativeQuery = true)
    int findByCatalogTypeIdAndSubType(
            @Param("catalogTypeId") Long catalogTypeId,
            @Param("subItemType") String subItemType);

    @Query("select d from DataAssets d where d.catalogId in ?1 and d.subItemType in ?2")
    List<DataAssets> findDomainByCatalogIdAndSubType(
            List<Long> catalogIds,EnumSupportType subItemType);

}
