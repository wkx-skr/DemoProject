package com.datablau.metadata.main.dto;

import com.datablau.common.kafka.msg.BasicMsg;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * @author: hxs
 * @date: 2025/5/23 18:33
 */
public class UdpObjectIdMsgDto {

    private Long typeId;
    private String itemId;

    public UdpObjectIdMsgDto(Long typeId, String itemId) {
        this.typeId = typeId;
        this.itemId = itemId;
    }

    public UdpObjectIdMsgDto(String topic, Long typeId, String itemId) {
        this.typeId = typeId;
        this.itemId = itemId;
    }

    public Long getTypeId() {
        return typeId;
    }

    public void setTypeId(Long typeId) {
        this.typeId = typeId;
    }

    public String getItemId() {
        return itemId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    @Override
    public String toString() {
        String typeIdJson = typeId == null ? "null" : typeId.toString();
        String itemIdJson = itemId == null ? "null" : String.format("\"%s\"", itemId);
        return String.format("{\"typeId\":%s,\"itemId\":%s}", typeIdJson, itemIdJson);
    }
}
