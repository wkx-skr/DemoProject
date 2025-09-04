package com.datablau.data.asset.jpa.repository;

import com.datablau.data.asset.jpa.entity.DesignLabelDropResult;
import com.datablau.data.asset.jpa.entity.TechLabelDropResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface TechLabelDropResultRepository extends JpaSpecificationExecutor<TechLabelDropResult>, JpaRepository<TechLabelDropResult, Long> {


    boolean existsByCheckTime(String checkTime);

    long deleteByCheckTime(String checkTime);
}
