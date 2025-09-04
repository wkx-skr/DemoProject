package com.datablau.data.asset.jpa.repository;

import com.datablau.data.asset.jpa.entity.DesignLabelDropResult;
import com.datablau.data.asset.jpa.entity.MetaDataMappingCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DesignLabelDropResultRepository extends JpaSpecificationExecutor<DesignLabelDropResult>, JpaRepository<DesignLabelDropResult, Long> {


    boolean existsByCheckTime(String checkTime);

    void deleteByCheckTime(String checkTime);
}
