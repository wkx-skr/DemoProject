package com.datablau.project.api.dto;

import java.io.Serializable;
import java.util.Date;

/**
 *
 * @author: hxs
 * @date: 2025/4/23 11:00
 */
public class DdmModelDto implements Serializable {

    private Long id;
    private String name;
    private String description;
    private Long categoryId;
    private Long departmentId;
    private String owner;
    private Long referredModelId;
    private boolean locked = false;
    private String locker;
    private Date lockTimestamp;
    private boolean deleted = false;
    private Long currentVersion;
    private Date createdOn;
    private Date lastModificationTimestamp;
    private String lastModifier;
    private boolean frozen;
    private String modelType;
    private Integer seed;
    private Integer phase;
    private Boolean useProto = false;
    private Long objCount = -1L;
    private Boolean shared = false;
    private Boolean limitedDsApply = false;
    private String limitedDsApplyConfig;
    private Integer originalSeed;
    private Boolean canBeRead = true;
    private Boolean dwModel = false;
    private String path;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public Long getReferredModelId() {
        return referredModelId;
    }

    public void setReferredModelId(Long referredModelId) {
        this.referredModelId = referredModelId;
    }

    public boolean isLocked() {
        return locked;
    }

    public void setLocked(boolean locked) {
        this.locked = locked;
    }

    public String getLocker() {
        return locker;
    }

    public void setLocker(String locker) {
        this.locker = locker;
    }

    public Date getLockTimestamp() {
        return lockTimestamp;
    }

    public void setLockTimestamp(Date lockTimestamp) {
        this.lockTimestamp = lockTimestamp;
    }

    public boolean isDeleted() {
        return deleted;
    }

    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }

    public Long getCurrentVersion() {
        return currentVersion;
    }

    public void setCurrentVersion(Long currentVersion) {
        this.currentVersion = currentVersion;
    }

    public Date getCreatedOn() {
        return createdOn;
    }

    public void setCreatedOn(Date createdOn) {
        this.createdOn = createdOn;
    }

    public Date getLastModificationTimestamp() {
        return lastModificationTimestamp;
    }

    public void setLastModificationTimestamp(Date lastModificationTimestamp) {
        this.lastModificationTimestamp = lastModificationTimestamp;
    }

    public String getLastModifier() {
        return lastModifier;
    }

    public void setLastModifier(String lastModifier) {
        this.lastModifier = lastModifier;
    }

    public boolean isFrozen() {
        return frozen;
    }

    public void setFrozen(boolean frozen) {
        this.frozen = frozen;
    }

    public String getModelType() {
        return modelType;
    }

    public void setModelType(String modelType) {
        this.modelType = modelType;
    }

    public Integer getSeed() {
        return seed;
    }

    public void setSeed(Integer seed) {
        this.seed = seed;
    }

    public Integer getPhase() {
        return phase;
    }

    public void setPhase(Integer phase) {
        this.phase = phase;
    }

    public Boolean getUseProto() {
        return useProto;
    }

    public void setUseProto(Boolean useProto) {
        this.useProto = useProto;
    }

    public Long getObjCount() {
        return objCount;
    }

    public void setObjCount(Long objCount) {
        this.objCount = objCount;
    }

    public Boolean getShared() {
        return shared;
    }

    public void setShared(Boolean shared) {
        this.shared = shared;
    }

    public Boolean getLimitedDsApply() {
        return limitedDsApply;
    }

    public void setLimitedDsApply(Boolean limitedDsApply) {
        this.limitedDsApply = limitedDsApply;
    }

    public String getLimitedDsApplyConfig() {
        return limitedDsApplyConfig;
    }

    public void setLimitedDsApplyConfig(String limitedDsApplyConfig) {
        this.limitedDsApplyConfig = limitedDsApplyConfig;
    }

    public Integer getOriginalSeed() {
        return originalSeed;
    }

    public void setOriginalSeed(Integer originalSeed) {
        this.originalSeed = originalSeed;
    }

    public Boolean getCanBeRead() {
        return canBeRead;
    }

    public void setCanBeRead(Boolean canBeRead) {
        this.canBeRead = canBeRead;
    }

    public Boolean getDwModel() {
        return dwModel;
    }

    public void setDwModel(Boolean dwModel) {
        this.dwModel = dwModel;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }
}
