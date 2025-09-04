package com.datablau.metadata.main.dto.objsearch;

import java.util.Date;
import java.util.LinkedHashMap;

/**
 *
 * @author: hxs
 * @date: 2025/4/22 11:53
 */
public class ReportMmSearchResultDto extends BaseSearchDto{
    private Long objectId;
    private Long parentId;
    private String definition;
    private String physicalName;
    private Long typeId;
    private Long startVersion;
    private Date createTime;
    private LinkedHashMap<String, String> prop;
//    private String dl1BusinessDomain;
//    private String dl2ThemeDomain;
//    private String systemName;
////    private String reportName;
////    private String reportRemark;
//    private String updateCycle;
//    private String technicaler;
//    private String securityLevel;
//    private String dataMaster;
//    private String dataSteward;
//    private String reportDispay;
//    private String reportType;
//    private String publishLink;
//    private String reportId;
//    private String reportItemPath;
//    private String dataSource;
//    private String reportItemSQL;
//    private String reportTable;

    public Long getObjectId() {
        return objectId;
    }

    public void setObjectId(Long objectId) {
        this.objectId = objectId;
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

    public String getPhysicalName() {
        return physicalName;
    }

    public void setPhysicalName(String physicalName) {
        this.physicalName = physicalName;
    }

    public Long getTypeId() {
        return typeId;
    }

    public void setTypeId(Long typeId) {
        this.typeId = typeId;
    }

    public LinkedHashMap<String, String> getProp() {
        return prop;
    }

    public void setProp(LinkedHashMap<String, String> prop) {
        this.prop = prop;
    }

    public Long getStartVersion() {
        return startVersion;
    }

    public void setStartVersion(Long startVersion) {
        this.startVersion = startVersion;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }
}
