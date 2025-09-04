package com.datablau.data.asset.dto;

import java.io.Serializable;
import java.util.List;

/**
 * @author zhangziliang
 * @version 1.0
 * @date 2025-05-27 15:09
 * @description
 */
public class CheckQueryDto implements Serializable {

    private String startTime;

    private String endTime;


    private List<String> buName;

    private List<String> username;


    private int pageNum = 0;
    private int pageSize = 20;


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

    public List<String> getBuName() {
        return buName;
    }

    public void setBuName(List<String> buName) {
        this.buName = buName;
    }

    public List<String> getUsername() {
        return username;
    }

    public void setUsername(List<String> username) {
        this.username = username;
    }

    public int getPageNum() {
        return pageNum;
    }

    public void setPageNum(int pageNum) {
        this.pageNum = pageNum;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }
}
