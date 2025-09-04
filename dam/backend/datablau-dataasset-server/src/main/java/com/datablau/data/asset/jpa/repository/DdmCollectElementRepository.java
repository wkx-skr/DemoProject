package com.datablau.data.asset.jpa.repository;

import com.datablau.data.asset.dto.DdmCollectElementConditionForModel;
import com.datablau.data.asset.dto.DdmCollectElementConditionForTable;
import com.datablau.data.asset.jpa.entity.DdmCollectElement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;

@Repository
public interface DdmCollectElementRepository extends JpaSpecificationExecutor<DdmCollectElement>, JpaRepository<DdmCollectElement, Long> {

    @Query("delete from DdmCollectElement where ddmModelId = ?1")
    @Modifying
    @Transactional
    void deleteDdmCollectElementByDdmModelId(Long ddmModelId);

    @Query("select new com.datablau.data.asset.dto.DdmCollectElementConditionForModel(modelCategoryId, ddmModelId, ddmModelName) from DdmCollectElement where modelCategoryId = ?1 and typeId = 80010001" )
    List<DdmCollectElementConditionForModel> queryModelByCategoryId(Long modelCategoryId);

    @Query("select new com.datablau.data.asset.dto.DdmCollectElementConditionForTable(modelCategoryId, ddmModelId, tableId, name) from DdmCollectElement where ddmModelId = ?1 and typeId = 80000004" )
    List<DdmCollectElementConditionForTable> queryTableByModelId(Long ddmModelId);

    @Query("select c from DdmCollectElement c where c.ddmModelId = ?1 and typeId in (?2)" )
    List<DdmCollectElement> queryModelElementByModelId(Long ddmModelId, List<Long> typeIds);

    @Query("select c from DdmCollectElement c where c.ddmModelName in (?1) and typeId in (?2)" )
    List<DdmCollectElement> queryModelElementByModelName(List<String> ddmModelName, List<Long> typeIds);

    @Query("select c from DdmCollectElement c where c.ddmCategoryPath in (?1) and c.ddmModelName in (?2) and typeId in (?3)" )
    List<DdmCollectElement> queryModelElementByCategoryPathAndModelName(Collection<String> ddmCategoryPaths, Collection<String> ddmModelName, List<Long> typeIds);
}
