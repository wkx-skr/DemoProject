package com.datablau.domain.management.dto;


import java.io.Serializable;
import java.util.List;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-06-26 10:38
 * @description
 */
public class BatchApplyPageQueryDto implements Serializable {

    private Integer pageNum = 1;       // 当前页码，默认第1页
    private Integer pageSize = 20;     // 每页大小，默认10条

    private List<String> applyType;          // 审核类型
    private String applyName;          // 批次名称（模糊）
    private String applyCreator;       // 创建人（模糊）
    private String startTime;            // 创建时间范围-开始
    private String endTime;              // 创建时间范围-结束
    private String innerState;
    private List<String> innerBuName;         // 内部业务域名城 用于对接用户选择添加目录时的过滤
    private String innerApplyName;

    public BatchApplyPageQueryDto() {
    }

    // 审核状态（枚举）



    public Integer getPageNum() {
        return pageNum;
    }

    public void setPageNum(Integer pageNum) {
        this.pageNum = pageNum;
    }

    public Integer getPageSize() {
        return pageSize;
    }

    public void setPageSize(Integer pageSize) {
        this.pageSize = pageSize;
    }


    public String getApplyName() {
        return applyName;
    }

    public void setApplyName(String applyName) {
        this.applyName = applyName;
    }

    public String getApplyCreator() {
        return applyCreator;
    }

    public void setApplyCreator(String applyCreator) {
        this.applyCreator = applyCreator;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public String getInnerState() {
        return innerState;
    }

    public void setInnerState(String innerState) {
        this.innerState = innerState;
    }

    public List<String> getInnerBuName() {
        return innerBuName;
    }

    public void setInnerBuName(List<String> innerBuName) {
        this.innerBuName = innerBuName;
    }


    public String getInnerApplyName() {
        return innerApplyName;
    }

    public void setInnerApplyName(String innerApplyName) {
        this.innerApplyName = innerApplyName;
    }

    public List<String> getApplyType() {
        return applyType;
    }

    public void setApplyType(List<String> applyType) {
        this.applyType = applyType;
    }
}




