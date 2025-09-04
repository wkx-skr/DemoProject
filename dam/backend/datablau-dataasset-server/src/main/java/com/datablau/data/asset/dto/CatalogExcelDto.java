package com.datablau.data.asset.dto;

import java.io.Serializable;

/**
 *
 * @author: hxs
 * @date: 2025/4/18 13:53
 */
public class CatalogExcelDto implements Serializable {
    private String code;
    private String chineseName;
    private String englishName;
    private String definition;
    private String dataMaster;
    private String rowNum;
    //业务域编码
    private String busCode;
    //业务域中文名
    private String busChineseName;
    //主题域编码
    private String subCode;
    //主题域中文名
    private String subChineseName;
    //审批人
    private String approver;
    //数据管家
    private String dataSteward;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getChineseName() {
        return chineseName;
    }

    public void setChineseName(String chineseName) {
        this.chineseName = chineseName;
    }

    public String getEnglishName() {
        return englishName;
    }

    public void setEnglishName(String englishName) {
        this.englishName = englishName;
    }

    public String getDefinition() {
        return definition;
    }

    public void setDefinition(String definition) {
        this.definition = definition;
    }

    public String getDataMaster() {
        return dataMaster;
    }

    public void setDataMaster(String dataMaster) {
        this.dataMaster = dataMaster;
    }

    public String getRowNum() {
        return rowNum;
    }

    public void setRowNum(String rowNum) {
        this.rowNum = rowNum;
    }

    public String getBusCode() {
        return busCode;
    }

    public void setBusCode(String busCode) {
        this.busCode = busCode;
    }

    public String getBusChineseName() {
        return busChineseName;
    }

    public void setBusChineseName(String busChineseName) {
        this.busChineseName = busChineseName;
    }

    public String getSubCode() {
        return subCode;
    }

    public void setSubCode(String subCode) {
        this.subCode = subCode;
    }

    public String getSubChineseName() {
        return subChineseName;
    }

    public void setSubChineseName(String subChineseName) {
        this.subChineseName = subChineseName;
    }

    public String getDataSteward() {
        return dataSteward;
    }

    public void setDataSteward(String dataSteward) {
        this.dataSteward = dataSteward;
    }

    public String getApprover() {
        return approver;
    }

    public void setApprover(String approver) {
        this.approver = approver;
    }
}
