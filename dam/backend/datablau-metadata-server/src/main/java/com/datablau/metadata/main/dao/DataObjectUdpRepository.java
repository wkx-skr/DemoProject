package com.datablau.metadata.main.dao;

import com.datablau.udp.jpa.entity.MetadataUserDefinedPropertyValue;
import com.datablau.udp.jpa.repository.MetadataUserDefinedPropertyValueRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface DataObjectUdpRepository extends MetadataUserDefinedPropertyValueRepository {

    @Query("SELECT mv FROM MetadataUserDefinedPropertyValue mv WHERE mv.itemId in (?1) AND mv.udpId in (?2)")
    List<MetadataUserDefinedPropertyValue> findUdpByItemIdsAndUdpIds(Collection<String> itemIds, Collection<Long> udpIds);
}
