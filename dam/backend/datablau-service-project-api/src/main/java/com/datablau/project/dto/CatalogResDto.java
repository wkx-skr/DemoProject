package com.datablau.project.dto;

import java.io.Serializable;

/**
 * @author: hxs
 * @date: 2025/4/13 13:15
 */
public class CatalogResDto implements Serializable {
    private String L1Name;
    private String L2Name;
    private String L3Name;
    private String L4Name;
    private String securityLevel;
    private String dataMaster;
    private String dataSteward;

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
}
