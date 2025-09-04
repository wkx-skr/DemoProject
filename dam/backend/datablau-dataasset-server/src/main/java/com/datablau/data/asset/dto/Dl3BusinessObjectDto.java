package com.datablau.data.asset.dto;

import java.io.Serializable;

/**
 * DL3业务对象DTO
 * 表示数据架构中的第三层业务对象，是最底层的具体业务实体
 *
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-16
 * @description DL3业务对象数据传输对象，包含业务对象的基本信息
 */
public class Dl3BusinessObjectDto implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * DL3业务对象编码
     * 业务对象的唯一标识符，在所属主题域内保持唯一性
     */
    private String dl3Code;

    /**
     * DL3业务对象中文名
     * 业务对象的中文名称，用于中文界面显示和业务理解
     */
    private String dl3CnName;

    /**
     * DL3业务对象英文名
     * 业务对象的英文名称，支持英文界面和国际化需求
     */
    private String dl3EnName;

    /**
     * DL3业务对象定义
     * 业务对象的详细描述、业务规则和属性说明
     */
    private String dl3Desc;

    /**
     * DL3状态
     * 业务对象的状态标识，如：发布(1)、变更(2)、废弃(3)、停用(0)等
     */
    private Integer dl3Status;

    public Dl3BusinessObjectDto() {
    }

    public Dl3BusinessObjectDto(String dl3Code, String dl3CnName, String dl3EnName, 
                                String dl3Desc, Integer dl3Status) {
        this.dl3Code = dl3Code;
        this.dl3CnName = dl3CnName;
        this.dl3EnName = dl3EnName;
        this.dl3Desc = dl3Desc;
        this.dl3Status = dl3Status;
    }

    public String getDl3Code() {
        return dl3Code;
    }

    public void setDl3Code(String dl3Code) {
        this.dl3Code = dl3Code;
    }

    public String getDl3CnName() {
        return dl3CnName;
    }

    public void setDl3CnName(String dl3CnName) {
        this.dl3CnName = dl3CnName;
    }

    public String getDl3EnName() {
        return dl3EnName;
    }

    public void setDl3EnName(String dl3EnName) {
        this.dl3EnName = dl3EnName;
    }

    public String getDl3Desc() {
        return dl3Desc;
    }

    public void setDl3Desc(String dl3Desc) {
        this.dl3Desc = dl3Desc;
    }

    public Integer getDl3Status() {
        return dl3Status;
    }

    public void setDl3Status(Integer dl3Status) {
        this.dl3Status = dl3Status;
    }
}
