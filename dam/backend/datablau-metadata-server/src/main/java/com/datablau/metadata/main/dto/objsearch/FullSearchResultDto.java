package com.datablau.metadata.main.dto.objsearch;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

/**
 * @author: hxs
 * @date: 2025/4/12 14:22
 */
public class FullSearchResultDto extends BaseSearchDto implements Serializable {
    private Long objectId;
    private Long typeId;
    private String name;
    private String chineseName;
    private String L1Name;
    private String L2Name;
    private String L3Name;
    private String L4Name;
    private Long categoryId;
    private Long parentId;
    private String definition;
    private String tableOwner;
    private Date creationDate;
    private String modificationDate;
    private Long startVersion;
    //数据类型
    private String dataType;
    //安全级别
    private String securityLevel;
    //数据主官
    private String dataMaster;
    //数据管家
    private String dataSteward;
    private String isNull;
    private String fieldLength;
    private String scale;
    private List<Long> columnIds;
    //数据更新周期
    private String updateCycle;
    //发布日期
    private String pulishDate;
    //数据加工程度
    private String dataDegreeProcess;
    //数据入湖周期
    private String dataLakeCycle;
    //共享方式
    private String sharingMethod;
    //数据资源格式
    private String resourceFormat;

    //系统名称
    private String categoryName;
    //区域范围
    private String areaRange;
    //时间范围
    private String dateRange;
    //数据存储空间
    private String dataStorageSpace;
    //数据量
    private String dataVolume;
    //是否主键
    private String pk;
    //是否外键
    private String fk;


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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getChineseName() {
        return chineseName;
    }

    public void setChineseName(String chineseName) {
        this.chineseName = chineseName;
    }

    public String getL1Name() {
        return L1Name;
    }

    public void setL1Name(String l1Name) {
        L1Name = l1Name;
    }

    public String getL2Name() {
        return L2Name;
    }

    public void setL2Name(String l2Name) {
        L2Name = l2Name;
    }

    public String getL3Name() {
        return L3Name;
    }

    public void setL3Name(String l3Name) {
        L3Name = l3Name;
    }

    public String getL4Name() {
        return L4Name;
    }

    public void setL4Name(String l4Name) {
        L4Name = l4Name;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public String getDefinition() {
        return definition;
    }

    public void setDefinition(String definition) {
        this.definition = definition;
    }

    public String getTableOwner() {
        return tableOwner;
    }

    public void setTableOwner(String tableOwner) {
        this.tableOwner = tableOwner;
    }

    public Date getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(Date creationDate) {
        this.creationDate = creationDate;
    }

    public String getModificationDate() {
        return modificationDate;
    }

    public void setModificationDate(String modificationDate) {
        this.modificationDate = modificationDate;
    }

    public String getDataType() {
        return dataType;
    }

    public void setDataType(String dataType) {
        this.dataType = dataType;
    }

    public String getSecurityLevel() {
        return securityLevel;
    }

    public void setSecurityLevel(String securityLevel) {
        this.securityLevel = securityLevel;
    }

    public String getDataMaster() {
        return dataMaster;
    }

    public void setDataMaster(String dataMaster) {
        this.dataMaster = dataMaster;
    }

    public String getDataSteward() {
        return dataSteward;
    }

    public void setDataSteward(String dataSteward) {
        this.dataSteward = dataSteward;
    }

    public String getIsNull() {
        return isNull;
    }

    public void setIsNull(String isNull) {
        this.isNull = isNull;
    }

    public String getFieldLength() {
        return fieldLength;
    }

    public void setFieldLength(String fieldLength) {
        this.fieldLength = fieldLength;
    }

    public List<Long> getColumnIds() {
        return columnIds;
    }

    public void setColumnIds(List<Long> columnIds) {
        this.columnIds = columnIds;
    }

    public String getUpdateCycle() {
        return updateCycle;
    }

    public void setUpdateCycle(String updateCycle) {
        this.updateCycle = updateCycle;
    }

    public String getPulishDate() {
        return pulishDate;
    }

    public void setPulishDate(String pulishDate) {
        this.pulishDate = pulishDate;
    }

    public String getDataDegreeProcess() {
        return dataDegreeProcess;
    }

    public void setDataDegreeProcess(String dataDegreeProcess) {
        this.dataDegreeProcess = dataDegreeProcess;
    }

    public String getDataLakeCycle() {
        return dataLakeCycle;
    }

    public void setDataLakeCycle(String dataLakeCycle) {
        this.dataLakeCycle = dataLakeCycle;
    }

    public String getSharingMethod() {
        return sharingMethod;
    }

    public void setSharingMethod(String sharingMethod) {
        this.sharingMethod = sharingMethod;
    }

    public String getResourceFormat() {
        return resourceFormat;
    }

    public void setResourceFormat(String resourceFormat) {
        this.resourceFormat = resourceFormat;
    }

    public Long getStartVersion() {
        return startVersion;
    }

    public void setStartVersion(Long startVersion) {
        this.startVersion = startVersion;
    }

//    public String getNull() {
//        return isNull;
//    }
//
//    public void setNull(String aNull) {
//        isNull = aNull;
//    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getAreaRange() {
        return areaRange;
    }

    public void setAreaRange(String areaRange) {
        this.areaRange = areaRange;
    }

    public String getDateRange() {
        return dateRange;
    }

    public void setDateRange(String dateRange) {
        this.dateRange = dateRange;
    }

    public String getDataStorageSpace() {
        return dataStorageSpace;
    }

    public void setDataStorageSpace(String dataStorageSpace) {
        this.dataStorageSpace = dataStorageSpace;
    }

    public String getDataVolume() {
        return dataVolume;
    }

    public void setDataVolume(String dataVolume) {
        this.dataVolume = dataVolume;
    }

    public String getPk() {
        return pk;
    }

    public void setPk(String pk) {
        this.pk = pk;
    }

    public String getFk() {
        return fk;
    }

    public void setFk(String fk) {
        this.fk = fk;
    }

    public String getScale() {
        return scale;
    }

    public void setScale(String scale) {
        this.scale = scale;
    }
}
