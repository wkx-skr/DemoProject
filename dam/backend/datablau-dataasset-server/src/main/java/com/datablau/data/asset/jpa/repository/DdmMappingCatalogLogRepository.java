package com.datablau.data.asset.jpa.repository;

import com.datablau.data.asset.jpa.entity.DdmMappingCatalogLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DdmMappingCatalogLogRepository extends JpaSpecificationExecutor<DdmMappingCatalogLog>, JpaRepository<DdmMappingCatalogLog, Long> {

    @Query("select log from DdmMappingCatalogLog log where log.mappingId = ?1 order by log.operatorTime desc")
    List<DdmMappingCatalogLog> queryDdmMappingCatalogLogByMappingId(Long mappingId);

}
