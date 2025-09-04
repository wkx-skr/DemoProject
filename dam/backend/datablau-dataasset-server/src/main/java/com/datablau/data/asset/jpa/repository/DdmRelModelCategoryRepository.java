package com.datablau.data.asset.jpa.repository;

import com.datablau.data.asset.dto.DdmRelModelCategoryDto;
import com.datablau.data.asset.jpa.entity.DdmRelModelCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DdmRelModelCategoryRepository extends JpaSpecificationExecutor<DdmRelModelCategory>, JpaRepository<DdmRelModelCategory, Long> {

    @Query("select category from DdmRelModelCategory category where ddmModelId in (?1)")
    List<DdmRelModelCategory> queryDdmRelModelCategoryDtoByDdmModelIds(List<Long> ddmModelIds);

    @Query(value = "select  * from ddm_rel_model_category where ddm_model_id = ?1", nativeQuery = true)
    DdmRelModelCategory queryDdmRelModelCategoryDtoByDdmModelId(Long ddmModelId);

    @Query("select ddmModelId from DdmRelModelCategory where modelCategoryId = ?1")
    List<Long> queryDdmModelIdByModelCategoryId(Long modelCategoryId);
}
