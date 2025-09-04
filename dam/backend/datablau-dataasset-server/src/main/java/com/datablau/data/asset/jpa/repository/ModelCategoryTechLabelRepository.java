package com.datablau.data.asset.jpa.repository;

import com.datablau.data.asset.jpa.entity.CatalogExt;
import com.datablau.data.asset.jpa.entity.ModelCategoryTechLabel;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

/**
 * @author: hxs
 * @date: 2025/7/29 15:20
 */
public interface ModelCategoryTechLabelRepository extends CrudRepository<ModelCategoryTechLabel, Long> {

    @Query("select m from ModelCategoryTechLabel m where m.modelCategoryId = ?1")
    ModelCategoryTechLabel findByModelCategoryId(Long modelCategoryId);
}
