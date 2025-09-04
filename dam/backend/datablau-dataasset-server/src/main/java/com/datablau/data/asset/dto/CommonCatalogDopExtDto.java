package com.datablau.data.asset.dto;

import com.datablau.catalog.dto.CommonCatalogDto;

import java.io.Serializable;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-08-23 14:38
 * @description
 */
public class CommonCatalogDopExtDto extends CommonCatalogDto implements Serializable {

        private String lOneName;

        private String lTwoName;

        private String lThreeName;

        private String dataUser;

        private String buCode;

        private String subCode;

        private String subObjCode;


    public String getlOneName() {
        return lOneName;
    }

    public void setlOneName(String lOneName) {
        this.lOneName = lOneName;
    }

    public String getlTwoName() {
        return lTwoName;
    }

    public void setlTwoName(String lTwoName) {
        this.lTwoName = lTwoName;
    }

    public String getlThreeName() {
        return lThreeName;
    }

    public void setlThreeName(String lThreeName) {
        this.lThreeName = lThreeName;
    }

    public String getDataUser() {
        return dataUser;
    }

    public void setDataUser(String dataUser) {
        this.dataUser = dataUser;
    }

    public String getBuCode() {
        return buCode;
    }

    public void setBuCode(String buCode) {
        this.buCode = buCode;
    }

    public String getSubCode() {
        return subCode;
    }

    public void setSubCode(String subCode) {
        this.subCode = subCode;
    }

    public String getSubObjCode() {
        return subObjCode;
    }

    public void setSubObjCode(String subObjCode) {
        this.subObjCode = subObjCode;
    }
}
