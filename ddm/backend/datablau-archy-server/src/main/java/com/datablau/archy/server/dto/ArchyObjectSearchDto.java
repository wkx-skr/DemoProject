package com.datablau.archy.server.dto;

import com.datablau.archy.common.enums.ArchyState;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 *
 * @author: hxs
 * @date: 2025/4/22 20:27
 */
public class ArchyObjectSearchDto {

    protected String name;
    protected String code;
    protected String alias;
    protected String abbreviation;
    protected String purpose;
    protected String definition;
    protected String scope;
    protected String include;
    protected String exclude;
    protected String owner;
    protected Date createTime;
    protected Date releaseTime;
    protected ArchyState state;
    protected String lastModifier;
    protected Date lastModifiedTime;
    protected Long logicalModelId;
    protected Long logicalModelVersionId;
    protected String logicalModelVersionName;
    protected int version;
    protected String updateId;
    protected Map<Long, String> additionalProperties;
    private String id;
    private Long subjectId;
    private String subjectTag;
    private String subjectName;
    private String path;
    private List<ArchySubEntityDto> entities;

    private String catalogState;
    private String modelName;
    //模型已发布版本名称
    private String modelVersionName;
    //模型最新版本名称
    private String modelVersionCurrentName;
    //模型最新版本VersionId
    private Long modelCurrentVersionId;
    //模型的endVersion
    private Long modelEndVer;

    private Long catalogId;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getAlias() {
        return alias;
    }

    public void setAlias(String alias) {
        this.alias = alias;
    }

    public String getAbbreviation() {
        return abbreviation;
    }

    public void setAbbreviation(String abbreviation) {
        this.abbreviation = abbreviation;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getDefinition() {
        return definition;
    }

    public void setDefinition(String definition) {
        this.definition = definition;
    }

    public String getScope() {
        return scope;
    }

    public void setScope(String scope) {
        this.scope = scope;
    }

    public String getInclude() {
        return include;
    }

    public void setInclude(String include) {
        this.include = include;
    }

    public String getExclude() {
        return exclude;
    }

    public void setExclude(String exclude) {
        this.exclude = exclude;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    public Date getReleaseTime() {
        return releaseTime;
    }

    public void setReleaseTime(Date releaseTime) {
        this.releaseTime = releaseTime;
    }

    public ArchyState getState() {
        return state;
    }

    public void setState(ArchyState state) {
        this.state = state;
    }

    public String getLastModifier() {
        return lastModifier;
    }

    public void setLastModifier(String lastModifier) {
        this.lastModifier = lastModifier;
    }

    public Date getLastModifiedTime() {
        return lastModifiedTime;
    }

    public void setLastModifiedTime(Date lastModifiedTime) {
        this.lastModifiedTime = lastModifiedTime;
    }

    public Long getLogicalModelId() {
        return logicalModelId;
    }

    public void setLogicalModelId(Long logicalModelId) {
        this.logicalModelId = logicalModelId;
    }

    public Long getLogicalModelVersionId() {
        return logicalModelVersionId;
    }

    public void setLogicalModelVersionId(Long logicalModelVersionId) {
        this.logicalModelVersionId = logicalModelVersionId;
    }

    public String getLogicalModelVersionName() {
        return logicalModelVersionName;
    }

    public void setLogicalModelVersionName(String logicalModelVersionName) {
        this.logicalModelVersionName = logicalModelVersionName;
    }

    public int getVersion() {
        return version;
    }

    public void setVersion(int version) {
        this.version = version;
    }

    public String getUpdateId() {
        return updateId;
    }

    public void setUpdateId(String updateId) {
        this.updateId = updateId;
    }

    public Map<Long, String> getAdditionalProperties() {
        return additionalProperties;
    }

    public void setAdditionalProperties(Map<Long, String> additionalProperties) {
        this.additionalProperties = additionalProperties;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public String getSubjectTag() {
        return subjectTag;
    }

    public void setSubjectTag(String subjectTag) {
        this.subjectTag = subjectTag;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public List<ArchySubEntityDto> getEntities() {
        return entities;
    }

    public void setEntities(List<ArchySubEntityDto> entities) {
        this.entities = entities;
    }

    public String getCatalogState() {
        return catalogState;
    }

    public void setCatalogState(String catalogState) {
        this.catalogState = catalogState;
    }

    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public String getModelVersionName() {
        return modelVersionName;
    }

    public void setModelVersionName(String modelVersionName) {
        this.modelVersionName = modelVersionName;
    }

    public String getModelVersionCurrentName() {
        return modelVersionCurrentName;
    }

    public void setModelVersionCurrentName(String modelVersionCurrentName) {
        this.modelVersionCurrentName = modelVersionCurrentName;
    }

    public Long getModelCurrentVersionId() {
        return modelCurrentVersionId;
    }

    public void setModelCurrentVersionId(Long modelCurrentVersionId) {
        this.modelCurrentVersionId = modelCurrentVersionId;
    }

    public Long getModelEndVer() {
        return modelEndVer;
    }

    public void setModelEndVer(Long modelEndVer) {
        this.modelEndVer = modelEndVer;
    }

    public Long getCatalogId() {
        return catalogId;
    }

    public void setCatalogId(Long catalogId) {
        this.catalogId = catalogId;
    }
}
