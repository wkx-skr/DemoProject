package com.datablau.metadata.main.dto.mm;

import io.swagger.v3.oas.annotations.media.Schema;

import java.io.Serializable;

public class UnstructuredFileDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long fileId;

    private Long directoryId;

    @Schema(name = "DL1业务域")
    private String dl1BusinessDomain;
    @Schema(name = "DL2主题域")
    private String dl2ThemeDomain;
    @Schema(name = "管理系统或单位")
    private String sourceSystem;
    @Schema(name = "数据主官")
    private String dataMaster;
    @Schema(name = "数据管家")
    private String dataSteward;
    @Schema(name = "文件名称")
    private String resourceName;
    @Schema(name = "文件摘要")
    private String resourceSummary;
    @Schema(name = "文件格式")
    private String resourceFormat;
    @Schema(name = "作者")
    private String creator;
    @Schema(name = "文件归属单位")
    private String ownCompany;
    @Schema(name = "上传人")
    private String uploader;
    @Schema(name = "上传时间")
    private String uploadTime;
    @Schema(name = "修改人")
    private String modifieder;
    @Schema(name = "修改时间")
    private String modifyTime;
    @Schema(name = "文件大小")
    private String fileSize;
    @Schema(name = "标签")
    private String dataTag;
    @Schema(name = "资源失效日期")
    private String updateCycle;
    @Schema(name = "版本")
    private String version;
    @Schema(name = "安全等级")
    private String securityLevel;
    @Schema(name = "文件id路径")
    private String filePath;

   public UnstructuredFileDto () {

   }
    public UnstructuredFileDto(Long fileId, Long directoryId) {
        this.fileId = fileId;
        this.directoryId = directoryId;
    }

    public Long getFileId() {
        return fileId;
    }

    public void setFileId(Long fileId) {
        this.fileId = fileId;
    }

    public Long getDirectoryId() {
        return directoryId;
    }

    public void setDirectoryId(Long directoryId) {
        this.directoryId = directoryId;
    }

    public String getDl1BusinessDomain() {
        return dl1BusinessDomain;
    }

    public void setDl1BusinessDomain(String dl1BusinessDomain) {
        this.dl1BusinessDomain = dl1BusinessDomain;
    }

    public String getDl2ThemeDomain() {
        return dl2ThemeDomain;
    }

    public void setDl2ThemeDomain(String dl2ThemeDomain) {
        this.dl2ThemeDomain = dl2ThemeDomain;
    }

    public String getSourceSystem() {
        return sourceSystem;
    }

    public void setSourceSystem(String sourceSystem) {
        this.sourceSystem = sourceSystem;
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

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public String getResourceSummary() {
        return resourceSummary;
    }

    public void setResourceSummary(String resourceSummary) {
        this.resourceSummary = resourceSummary;
    }

    public String getResourceFormat() {
        return resourceFormat;
    }

    public void setResourceFormat(String resourceFormat) {
        this.resourceFormat = resourceFormat;
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }

    public String getOwnCompany() {
        return ownCompany;
    }

    public void setOwnCompany(String ownCompany) {
        this.ownCompany = ownCompany;
    }

    public String getUploader() {
        return uploader;
    }

    public void setUploader(String uploader) {
        this.uploader = uploader;
    }

    public String getUploadTime() {
        return uploadTime;
    }

    public void setUploadTime(String uploadTime) {
        this.uploadTime = uploadTime;
    }

    public String getModifieder() {
        return modifieder;
    }

    public void setModifieder(String modifieder) {
        this.modifieder = modifieder;
    }

    public String getModifyTime() {
        return modifyTime;
    }

    public void setModifyTime(String modifyTime) {
        this.modifyTime = modifyTime;
    }

    public String getFileSize() {
        return fileSize;
    }

    public void setFileSize(String fileSize) {
        this.fileSize = fileSize;
    }

    public String getDataTag() {
        return dataTag;
    }

    public void setDataTag(String dataTag) {
        this.dataTag = dataTag;
    }

    public String getUpdateCycle() {
        return updateCycle;
    }

    public void setUpdateCycle(String updateCycle) {
        this.updateCycle = updateCycle;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getSecurityLevel() {
        return securityLevel;
    }

    public void setSecurityLevel(String securityLevel) {
        this.securityLevel = securityLevel;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    @Override
    public String toString() {
        return "UnstructuredFileDto{" +
                "securityLevel='" + securityLevel + '\'' +
                ", fileId=" + fileId +
                ", directoryId=" + directoryId +
                ", dl1BusinessDomain='" + dl1BusinessDomain + '\'' +
                ", dl2ThemeDomain='" + dl2ThemeDomain + '\'' +
                ", filePath='" + filePath + '\'' +
                ", resourceName='" + resourceName + '\'' +
                '}';
    }
}
