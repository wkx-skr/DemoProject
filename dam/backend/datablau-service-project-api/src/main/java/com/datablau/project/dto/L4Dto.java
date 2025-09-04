package com.datablau.project.dto;

import java.io.Serializable;
import java.util.List;

/**
 * @author: hxs
 * @date: 2025/4/27 14:01
 */
public class L4Dto implements Serializable {

    private String name;
    private String englishName;
    private String description;
    private String code;
    private int level;
    private Long l3DamId;
    private String creator;
    //数据管家
    private String dataSteward;
    //数据分类
    private String dataClassification;
    //来源系统
    private String sourceSystem;
    private List<L5Dto> l5Children;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEnglishName() {
        return englishName;
    }

    public void setEnglishName(String englishName) {
        this.englishName = englishName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public Long getL3DamId() {
        return l3DamId;
    }

    public void setL3DamId(Long l3DamId) {
        this.l3DamId = l3DamId;
    }

    public String getDataSteward() {
        return dataSteward;
    }

    public void setDataSteward(String dataSteward) {
        this.dataSteward = dataSteward;
    }

    public String getDataClassification() {
        return dataClassification;
    }

    public void setDataClassification(String dataClassification) {
        this.dataClassification = dataClassification;
    }

    public List<L5Dto> getL5Children() {
        return l5Children;
    }

    public void setL5Children(List<L5Dto> l5Children) {
        this.l5Children = l5Children;
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }

    public String getSourceSystem() {
        return sourceSystem;
    }

    public void setSourceSystem(String sourceSystem) {
        this.sourceSystem = sourceSystem;
    }
}
