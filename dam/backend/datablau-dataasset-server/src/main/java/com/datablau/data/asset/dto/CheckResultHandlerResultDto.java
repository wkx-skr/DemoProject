package com.datablau.data.asset.dto;

import com.datablau.data.common.util.ExcelExport;

import javax.persistence.Column;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-28 11:06
 * @description
 */
public class CheckResultHandlerResultDto {

    private Long  objectId;


    private Long typeId;

    @ExcelExport(value = "业务域名称", sort = 0)
    private String buName;

    @ExcelExport(value = "负责人名称", sort = 1)
    private String userName;

    @ExcelExport(value = "中文名称", sort = 2)
    private String cnName;
    @ExcelExport(value = "英文名称", sort = 3)
    private String enName;

    // 会有一个表存储这个最新字段的值 uuid

    private String batchNu;

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

    public String getBuName() {
        return buName;
    }

    public void setBuName(String buName) {
        this.buName = buName;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getCnName() {
        return cnName;
    }

    public void setCnName(String cnName) {
        this.cnName = cnName;
    }

    public String getEnName() {
        return enName;
    }

    public void setEnName(String enName) {
        this.enName = enName;
    }

    public String getBatchNu() {
        return batchNu;
    }

    public void setBatchNu(String batchNu) {
        this.batchNu = batchNu;
    }
}
