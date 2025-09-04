package com.datablau.data.asset.jpa.repository;

import com.datablau.data.asset.jpa.entity.DdmMappingCatalogLog;
import com.datablau.data.asset.jpa.entity.MetaDataMappingCatalogLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MetaDataMappingCatalogLogRepository extends JpaSpecificationExecutor<MetaDataMappingCatalogLog>, JpaRepository<MetaDataMappingCatalogLog, Long> {

    @Query("select log from MetaDataMappingCatalogLog log where log.mappingId = ?1 order by log.operatorTime desc")
    List<MetaDataMappingCatalogLog> queryMappingCatalogLogByMappingId(Long mappingId);

}
