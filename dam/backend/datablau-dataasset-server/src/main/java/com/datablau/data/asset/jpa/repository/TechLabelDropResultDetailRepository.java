package com.datablau.data.asset.jpa.repository;

import com.datablau.data.asset.jpa.entity.TechLabelDropResult;
import com.datablau.data.asset.jpa.entity.TechLabelDropResultDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface TechLabelDropResultDetailRepository extends JpaSpecificationExecutor<TechLabelDropResultDetail>, JpaRepository<TechLabelDropResultDetail, Long> {


    boolean existsByCheckTime(String checkTime);

    void deleteByCheckTime(String checkTime);
}
