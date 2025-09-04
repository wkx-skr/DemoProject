package com.datablau.metadata.main.dto;

import com.datablau.common.kafka.msg.BasicMsg;

import java.io.Serializable;
import java.util.List;

/**
 *
 * @author: hxs
 * @date: 2025/4/19 15:09
 */
public class MetaDataIncrementDto extends BasicMsg {
    private List<Long> objectIds;

    public MetaDataIncrementDto(){}

    public MetaDataIncrementDto(List<Long> objectIds) {
        this.objectIds = objectIds;
    }

    public List<Long> getObjectIds() {
        return objectIds;
    }

    public void setObjectIds(List<Long> objectIds) {
        this.objectIds = objectIds;
    }
}
