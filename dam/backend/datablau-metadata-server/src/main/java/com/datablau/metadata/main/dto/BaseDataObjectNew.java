package com.datablau.metadata.main.dto;

import com.andorj.enhance.data.ExShallowDataObject;
import com.datablau.metadata.main.dto.metadata.BaseDataObject;

import java.io.Serializable;
import java.util.Date;

public class BaseDataObjectNew implements Serializable, ExShallowDataObject {

    private static final long serialVersionUID = 1L;
    private Long id;
    private Long objectId;
    private Long typeId;
    private Long parentId;
    private Long modelId;
    private String name;
    private String logicalName;
    private String parentName;
    private String parentAlias;
    private Long tableId;
    private Long catalogId;
    private Long modelCategoryId;
    private String schema;
    private String description;
    private String domainId;
    private String domainCode;
    private String domainName;
    private String standardCodeName;
    private Date creationTime;
    private String modelName;
    private Boolean logicalElement;
    private Integer order;
    private Boolean lineageBindStatus;
    private String modelType;
    private String metaModelCode;
    private String owner; //负责人

    public BaseDataObjectNew(Date creationTime, String name, Long id, Long objectId, Long parentId, Long typeId, Long tableId, Long modelCategoryId, String parentName, String schema, Boolean isLogical) {
        this.id = id;
        this.creationTime = creationTime;
        this.objectId = objectId;
        this.parentId = parentId;
        this.typeId = typeId;
        this.name = name;
        this.tableId = tableId;
        this.modelCategoryId = modelCategoryId;
        this.parentName = parentName;
        this.schema = schema;
        this.logicalElement = isLogical;
    }
    public BaseDataObjectNew(Date creationTime, String name, String logicalName, Long id, Long objectId, Long parentId,
                             Long typeId, Long tableId, Long modelId, String modelName, Long modelCategoryId,
                             String schema, Boolean isLogical, Boolean isBindingLineage, String parentName,
                             String parentAlias, String domainId, String domainCode, String modelType, String owner) {
        this(creationTime, name, id, objectId, parentId, typeId, tableId, modelCategoryId, parentName, schema, isLogical);
        this.logicalName = logicalName;
        this.modelName = modelName;
        this.lineageBindStatus = isBindingLineage == null ? false : isBindingLineage;
        this.domainCode = domainCode;
        this.domainId = domainId;
        this.parentAlias = parentAlias;
        this.modelId = modelId;
        this.modelType = modelType;
        this.owner = owner;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getObjectId() {
        return objectId;
    }

    public void setObjectId(Long objectId) {
        this.objectId = objectId;
    }

    public Long getTypeId() {
        return typeId;
    }

    public void setTypeId(Long typeId) {
        this.typeId = typeId;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public Long getModelId() {
        return modelId;
    }

    public void setModelId(Long modelId) {
        this.modelId = modelId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLogicalName() {
        return logicalName;
    }

    public void setLogicalName(String logicalName) {
        this.logicalName = logicalName;
    }

    public String getParentName() {
        return parentName;
    }

    public void setParentName(String parentName) {
        this.parentName = parentName;
    }

    public String getParentAlias() {
        return parentAlias;
    }

    public void setParentAlias(String parentAlias) {
        this.parentAlias = parentAlias;
    }

    public Long getTableId() {
        return tableId;
    }

    public void setTableId(Long tableId) {
        this.tableId = tableId;
    }

    public Long getCatalogId() {
        return catalogId;
    }

    public void setCatalogId(Long catalogId) {
        this.catalogId = catalogId;
    }

    public Long getModelCategoryId() {
        return modelCategoryId;
    }

    public void setModelCategoryId(Long modelCategoryId) {
        this.modelCategoryId = modelCategoryId;
    }

    public String getSchema() {
        return schema;
    }

    public void setSchema(String schema) {
        this.schema = schema;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDomainId() {
        return domainId;
    }

    public void setDomainId(String domainId) {
        this.domainId = domainId;
    }

    public String getDomainCode() {
        return domainCode;
    }

    public void setDomainCode(String domainCode) {
        this.domainCode = domainCode;
    }

    public String getDomainName() {
        return domainName;
    }

    public void setDomainName(String domainName) {
        this.domainName = domainName;
    }

    public String getStandardCodeName() {
        return standardCodeName;
    }

    public void setStandardCodeName(String standardCodeName) {
        this.standardCodeName = standardCodeName;
    }

    public Date getCreationTime() {
        return creationTime;
    }

    public void setCreationTime(Date creationTime) {
        this.creationTime = creationTime;
    }

    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public Boolean getLogicalElement() {
        return logicalElement;
    }

    public void setLogicalElement(Boolean logicalElement) {
        this.logicalElement = logicalElement;
    }

    public Integer getOrder() {
        return order;
    }

    public void setOrder(Integer order) {
        this.order = order;
    }

    public Boolean getLineageBindStatus() {
        return lineageBindStatus;
    }

    public void setLineageBindStatus(Boolean lineageBindStatus) {
        this.lineageBindStatus = lineageBindStatus;
    }

    public String getModelType() {
        return modelType;
    }

    public void setModelType(String modelType) {
        this.modelType = modelType;
    }

    public String getMetaModelCode() {
        return metaModelCode;
    }

    public void setMetaModelCode(String metaModelCode) {
        this.metaModelCode = metaModelCode;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }
}
