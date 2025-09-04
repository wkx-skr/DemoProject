package com.datablau.data.asset.dto;

import java.io.Serializable;
import java.util.List;

/**
 * DL2主题域DTO
 * 表示数据架构中的第二层主题域，属于特定业务域下的细分领域
 *
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-16
 * @description DL2主题域数据传输对象，包含主题域基本信息和下属业务对象列表
 */
public class Dl2SubjectDomainDto implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * DL2主题域编码
     * 主题域的唯一标识符，在所属业务域内保持唯一性
     */
    private String dl2Code;

    /**
     * DL2主题域中文名称
     * 主题域的中文名称，便于中文用户理解和使用
     */
    private String dl2CnName;

    /**
     * DL2主题域英文名称
     * 主题域的英文名称，支持国际化需求
     */
    private String dl2EnName;

    /**
     * DL2主题域定义
     * 主题域的详细描述和业务范围说明
     */
    private String dl2Desc;

    /**
     * DL2状态
     * 主题域的状态标识，如：活跃(1)、停用(0)等
     */
    private Integer dl2Status;

    /**
     * DL3业务对象列表
     * 该主题域下包含的所有业务对象信息
     */
    private List<Dl3BusinessObjectDto> dl3List;

    public Dl2SubjectDomainDto() {
    }

    public Dl2SubjectDomainDto(String dl2Code, String dl2CnName, String dl2EnName, 
                               String dl2Desc, Integer dl2Status, List<Dl3BusinessObjectDto> dl3List) {
        this.dl2Code = dl2Code;
        this.dl2CnName = dl2CnName;
        this.dl2EnName = dl2EnName;
        this.dl2Desc = dl2Desc;
        this.dl2Status = dl2Status;
        this.dl3List = dl3List;
    }

    public String getDl2Code() {
        return dl2Code;
    }

    public void setDl2Code(String dl2Code) {
        this.dl2Code = dl2Code;
    }

    public String getDl2CnName() {
        return dl2CnName;
    }

    public void setDl2CnName(String dl2CnName) {
        this.dl2CnName = dl2CnName;
    }

    public String getDl2EnName() {
        return dl2EnName;
    }

    public void setDl2EnName(String dl2EnName) {
        this.dl2EnName = dl2EnName;
    }

    public String getDl2Desc() {
        return dl2Desc;
    }

    public void setDl2Desc(String dl2Desc) {
        this.dl2Desc = dl2Desc;
    }

    public Integer getDl2Status() {
        return dl2Status;
    }

    public void setDl2Status(Integer dl2Status) {
        this.dl2Status = dl2Status;
    }

    public List<Dl3BusinessObjectDto> getDl3List() {
        return dl3List;
    }

    public void setDl3List(List<Dl3BusinessObjectDto> dl3List) {
        this.dl3List = dl3List;
    }
}
