package com.datablau.data.asset.dto;

import java.io.Serializable;
import java.util.List;

/**
 * DOP数据同步DTO
 * 用于在数据架构管理平台与DOP系统之间进行数据同步
 *
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-16
 * @description 用于HTTP调用客户接口的数据传输对象，包含完整的业务域层级结构
 */
public class DopDataSyncDto implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * DOP审批ID
     * 用于标识DOP系统中的审批流程
     */
    private String dopId;

    /**
     * 数据架构管理平台批次ID
     * 用于标识数据架构管理平台中的批次信息
     */
    private String batchId;

    /**
     * DL1业务域列表
     * 包含所有需要同步的业务域信息，每个业务域下包含主题域和业务对象
     */
    private List<Dl1BusinessDomainDto> dl1List;

    public DopDataSyncDto() {
    }

    public DopDataSyncDto(String dopId, String batchId, List<Dl1BusinessDomainDto> dl1List) {
        this.dopId = dopId;
        this.batchId = batchId;
        this.dl1List = dl1List;
    }

    public String getDopId() {
        return dopId;
    }

    public void setDopId(String dopId) {
        this.dopId = dopId;
    }

    public String getBatchId() {
        return batchId;
    }

    public void setBatchId(String batchId) {
        this.batchId = batchId;
    }

    public List<Dl1BusinessDomainDto> getDl1List() {
        return dl1List;
    }

    public void setDl1List(List<Dl1BusinessDomainDto> dl1List) {
        this.dl1List = dl1List;
    }
}
