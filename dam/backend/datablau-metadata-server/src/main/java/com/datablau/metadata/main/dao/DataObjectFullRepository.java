package com.datablau.metadata.main.dao;

import com.datablau.metadata.main.entity.metadata.DataObject;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

/**
 * @author: hxs
 * @date: 2025/4/12 16:11
 */
@Repository
public interface DataObjectFullRepository extends PagingAndSortingRepository<DataObject, Long> {

    @Query("select o from DataObject o where o.modelId = ?1 and o.parentId = ?2 and o.endVersion is null and o.typeId = 80000005")
    List<DataObject> findColumnsByModelIdAndTableId(Long modelId, Long tableId);

    @Query("select o from DataObject o where o.modelId = ?1 and o.endVersion is null and o.typeId in (?2)")
    List<DataObject> findTypeByModelId(Long modelId, List<Long> typeIds);

    @Query("select o from DataObject o where o.modelId in (?1) and o.endVersion is null and o.typeId in (?2)")
    List<DataObject> findTypeByModelIds(Collection<Long> modelIds, List<Long> typeIds);

    @Query("select o from DataObject o where o.modelId in (?1) and o.physicalName = ?2 and o.endVersion is null")
    List<DataObject> findDataByModelIdsAndName(Collection<Long> modelIds, String name);

    @Query("select d from DataObject d where d.modelId = ?1 and d.schema = ?2 and d.endVersion is null")
    List<DataObject> findByModelIdAndSchemaAndEndVersionNull(Long modelId, String schema);

    @Query("select d from DataObject d where d.objectId = ?1 and d.typeId = ?2 and d.endVersion is null")
    List<DataObject> findByObjectIdAndTypeIdAndEndVersionNull(Long objectId, Long typeId);

    @Query("select d from DataObject d where d.parentId = ?1 and d.typeId = ?2 and d.endVersion is null")
    List<DataObject> findByParentIdAndTypeIdAndEndVersionNull(Long parentId, Long typeId);


}
