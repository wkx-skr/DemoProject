package com.datablau.metadata.main.dto.mm;

import com.google.common.collect.Lists;
import io.swagger.v3.oas.annotations.media.Schema;

import java.io.Serializable;
import java.util.List;

public class UnstructuredDirectoryDto implements Serializable {

    private static final long serialVersionUID = 1L;

    @Schema(name = "目录名称")
    private String directoryName;
    @Schema(name = "目录ID")
    private Long directoryId;
    @Schema(name = "目录描述")
    private String directorySummary;
    @Schema(name = "目录全路径")
    private String directoryPath;
    @Schema(name = "创建人")
    private String creator;
    @Schema(name = "创建时间")
    private String createTime;
    @Schema(name = "负责人")
    private String modifieder;
    private Long parentId;
    private List<UnstructuredDirectoryDto> subDirectoryList = Lists.newArrayList();
    @Schema(name = "非结构化数据")
    private List<UnstructuredFileDto> fileDtos = Lists.newArrayList();

    public UnstructuredDirectoryDto () {

    }

    public UnstructuredDirectoryDto(String directoryName, Long directoryId, String directorySummary,
                                    String directoryPath, String creator, String createTime, String modifieder, Long parentId) {
        this.directoryName = directoryName;
        this.directoryId = directoryId;
        this.directorySummary = directorySummary;
        this.directoryPath = directoryPath;
        this.creator = creator;
        this.createTime = createTime;
        this.modifieder = modifieder;
        this.parentId = parentId;
    }

    public UnstructuredDirectoryDto(String directoryName, Long directoryId, String directoryPath, String creator, String createTime, Long parentId) {
        this.directoryName = directoryName;
        this.directoryId = directoryId;
        this.directoryPath = directoryPath;
        this.creator = creator;
        this.createTime = createTime;
        this.parentId = parentId;
    }


    public void addSubDirectory(UnstructuredDirectoryDto directoryDto) {
        subDirectoryList.add(directoryDto);
    }

    public void addFile(UnstructuredFileDto unstructuredFileDto) {
        fileDtos.add(unstructuredFileDto);
    }

    public String getDirectoryName() {
        return directoryName;
    }

    public void setDirectoryName(String directoryName) {
        this.directoryName = directoryName;
    }

    public Long getDirectoryId() {
        return directoryId;
    }

    public void setDirectoryId(Long directoryId) {
        this.directoryId = directoryId;
    }

    public String getDirectorySummary() {
        return directorySummary;
    }

    public void setDirectorySummary(String directorySummary) {
        this.directorySummary = directorySummary;
    }

    public String getDirectoryPath() {
        return directoryPath;
    }

    public void setDirectoryPath(String directoryPath) {
        this.directoryPath = directoryPath;
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }

    public String getCreateTime() {
        return createTime;
    }

    public void setCreateTime(String createTime) {
        this.createTime = createTime;
    }

    public String getModifieder() {
        return modifieder;
    }

    public void setModifieder(String modifieder) {
        this.modifieder = modifieder;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public List<UnstructuredDirectoryDto> getSubDirectoryList() {
        return subDirectoryList;
    }

    public void setSubDirectoryList(List<UnstructuredDirectoryDto> subDirectoryList) {
        this.subDirectoryList = subDirectoryList;
    }

    public List<UnstructuredFileDto> getFileDtos() {
        return fileDtos;
    }

    public void setFileDtos(List<UnstructuredFileDto> fileDtos) {
        this.fileDtos = fileDtos;
    }
}
