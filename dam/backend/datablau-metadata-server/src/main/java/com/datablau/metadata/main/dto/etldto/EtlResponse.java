package com.datablau.metadata.main.dto.etldto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;
import java.util.List;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-05-28 10:13
 * @description
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class EtlResponse implements Serializable {
    @JsonProperty("returnStatus")
    private int returnStatus;

    @JsonProperty("returnStatusStr")
    private String returnStatusStr;

    @JsonProperty("returnInfo")
    private List<EtlJob> returnInfo;

    // getter / setter


    public int getReturnStatus() {
        return returnStatus;
    }

    public void setReturnStatus(int returnStatus) {
        this.returnStatus = returnStatus;
    }

    public String getReturnStatusStr() {
        return returnStatusStr;
    }

    public void setReturnStatusStr(String returnStatusStr) {
        this.returnStatusStr = returnStatusStr;
    }

    public List<EtlJob> getReturnInfo() {
        return returnInfo;
    }

    public void setReturnInfo(List<EtlJob> returnInfo) {
        this.returnInfo = returnInfo;
    }
}