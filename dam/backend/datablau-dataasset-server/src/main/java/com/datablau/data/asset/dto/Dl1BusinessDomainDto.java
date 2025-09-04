package com.datablau.data.asset.dto;

import java.io.Serializable;
import java.util.List;

/**
 * DL1业务域DTO
 * 表示数据架构中的第一层业务域，是最高层级的业务分类
 *
 * @author zhangziliang
 * @version 1.0
 * @date 2025-07-16
 * @description DL1业务域数据传输对象，包含业务域基本信息和下属主题域列表
 */
public class Dl1BusinessDomainDto implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * DL1业务域编码
     * 业务域的唯一标识符，用于系统间数据关联
     */
    private String dl1Code;

    /**
     * DL1业务域中文名
     * 业务域的中文名称，用于界面显示和用户理解
     */
    private String dl1CnName;

    /**
     * DL1业务域英文名
     * 业务域的英文名称，用于国际化支持和系统集成
     */
    private String dl1EnName;

    /**
     * DL1业务域定义
     * 业务域的详细描述和定义说明
     */
    private String dl1Desc;

    /**
     * DL1状态
     * 业务域的状态标识，如：启用(1)、禁用(0)等
     */
    private Integer dl1Status;

    /**
     * DL2主题域列表
     * 该业务域下包含的所有主题域信息
     */
    private List<Dl2SubjectDomainDto> dl2List;

    public Dl1BusinessDomainDto() {
    }

    public Dl1BusinessDomainDto(String dl1Code, String dl1CnName, String dl1EnName, 
                                String dl1Desc, Integer dl1Status, List<Dl2SubjectDomainDto> dl2List) {
        this.dl1Code = dl1Code;
        this.dl1CnName = dl1CnName;
        this.dl1EnName = dl1EnName;
        this.dl1Desc = dl1Desc;
        this.dl1Status = dl1Status;
        this.dl2List = dl2List;
    }

    public String getDl1Code() {
        return dl1Code;
    }

    public void setDl1Code(String dl1Code) {
        this.dl1Code = dl1Code;
    }

    public String getDl1CnName() {
        return dl1CnName;
    }

    public void setDl1CnName(String dl1CnName) {
        this.dl1CnName = dl1CnName;
    }

    public String getDl1EnName() {
        return dl1EnName;
    }

    public void setDl1EnName(String dl1EnName) {
        this.dl1EnName = dl1EnName;
    }

    public String getDl1Desc() {
        return dl1Desc;
    }

    public void setDl1Desc(String dl1Desc) {
        this.dl1Desc = dl1Desc;
    }

    public Integer getDl1Status() {
        return dl1Status;
    }

    public void setDl1Status(Integer dl1Status) {
        this.dl1Status = dl1Status;
    }

    public List<Dl2SubjectDomainDto> getDl2List() {
        return dl2List;
    }

    public void setDl2List(List<Dl2SubjectDomainDto> dl2List) {
        this.dl2List = dl2List;
    }
}
