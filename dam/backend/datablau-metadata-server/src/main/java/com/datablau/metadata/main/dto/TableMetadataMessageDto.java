package com.datablau.metadata.main.dto;

import java.util.List;
import java.util.Map;

/**
 * @ClassName：TableMetadataMessageDto
 * @Author: dingzicheng
 * @Date: 2025/8/21 21:09
 * @Description: udp更新消息体
 */
public class TableMetadataMessageDto {
    private List<TableInfo> tableList;

    // Getters and Setters
    public List<TableInfo> getTableList() {
        return tableList;
    }

    public void setTableList(List<TableInfo> tableList) {
        this.tableList = tableList;
    }

    public static class TableInfo {
        private String database;
        private String tableEnglishName;
        private String tableManager;
        private String creationDate;
        private String modificationDate;
        private Map<String, String> attributeValue;
        private List<FieldInfo> fieldList;

        // Getters and Setters
        public String getDatabase() {
            return database;
        }

        public void setDatabase(String database) {
            this.database = database;
        }

        public String getTableEnglishName() {
            return tableEnglishName;
        }

        public void setTableEnglishName(String tableEnglishName) {
            this.tableEnglishName = tableEnglishName;
        }

        public String getTableManager() {
            return tableManager;
        }

        public void setTableManager(String tableManager) {
            this.tableManager = tableManager;
        }

        public String getCreationDate() {
            return creationDate;
        }

        public void setCreationDate(String creationDate) {
            this.creationDate = creationDate;
        }

        public String getModificationDate() {
            return modificationDate;
        }

        public void setModificationDate(String modificationDate) {
            this.modificationDate = modificationDate;
        }

        public Map<String, String> getAttributeValue() {
            return attributeValue;
        }

        public void setAttributeValue(Map<String, String> attributeValue) {
            this.attributeValue = attributeValue;
        }

        public List<FieldInfo> getFieldList() {
            return fieldList;
        }

        public void setFieldList(List<FieldInfo> fieldList) {
            this.fieldList = fieldList;
        }
    }

    public static class FieldInfo {
        private String fieldCode;
        private Map<String, String> attributeValue;

        // Getters and Setters
        public String getFieldCode() {
            return fieldCode;
        }

        public void setFieldCode(String fieldCode) {
            this.fieldCode = fieldCode;
        }

        public Map<String, String> getAttributeValue() {
            return attributeValue;
        }

        public void setAttributeValue(Map<String, String> attributeValue) {
            this.attributeValue = attributeValue;
        }
    }
}
