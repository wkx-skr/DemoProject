package com.datablau.data.asset.jpa.repository;

import com.datablau.data.asset.jpa.entity.DesignLabelDropResult;
import com.datablau.data.asset.jpa.entity.DesignLabelDropResultDetail;
import com.datablau.data.asset.jpa.entity.TechLabelDropResultDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface DesignLabelDropResultDetailRepository extends JpaSpecificationExecutor<DesignLabelDropResultDetail>, JpaRepository<DesignLabelDropResultDetail, Long> {


    boolean existsByCheckTime(String checkTime);

    void deleteByCheckTime(String checkTime);
}
