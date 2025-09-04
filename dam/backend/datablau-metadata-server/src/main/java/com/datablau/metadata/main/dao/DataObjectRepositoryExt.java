package com.datablau.metadata.main.dao;

import com.datablau.metadata.main.dao.metadata.DataObjectRepository;
import com.datablau.metadata.main.dto.BaseDataObjectNew;
import com.datablau.metadata.main.dto.metadata.BaseDataObject;
import com.datablau.metadata.main.entity.metadata.DataObject;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
@Primary
public interface DataObjectRepositoryExt extends DataObjectRepository {

    @Query("SELECT o FROM DataObject o WHERE o.modelId = ?1 AND o.endVersion IS NULL AND o.typeId = 80000005")
    List<DataObject> findAllShallowColumnsOfModelId(Long modelId);

    @Query("SELECT o FROM DataObject o WHERE o.modelId in (?1) AND o.objectId in (?2) AND o.endVersion IS NULL AND o.typeId = 80000004")
    List<DataObject> findAllTablesByModelIdsAndObjectIds(List<Long> modelId, List<Long> typeIds);

    List<DataObject> findByObjectIdIn(Collection<Long> objectIds);

    List<DataObject> findAllBySchemaIn(Collection<String> schemaSet);

    @Query("SELECT new com.datablau.metadata.main.dto.BaseDataObjectNew( o.creationTime, o.physicalName, o.logicalName, o.id, o.objectId,  o.parentId, o.typeId, o.tableId, o.modelId, m.definition, o.modelCategoryId, o.schema, o.logicalElement,  o.lineageBindStatus, o.parentPhysicalName, o.parentLogicalName, o.domainId, o.domainCode, m.type, o.owner)  FROM DataObject o  INNER JOIN Model m ON o.modelId = m.modelId  where o.objectId in ?1 and o.endVersion is null")
    List<BaseDataObjectNew> getAllDataObjectNewByObjectIds(Collection<Long> var1);

}
