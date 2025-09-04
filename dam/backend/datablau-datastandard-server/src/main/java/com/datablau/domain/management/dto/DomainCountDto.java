package com.datablau.domain.management.dto;

import java.io.Serializable;

public class DomainCountDto implements Serializable {
    private static final long serialVersionUID = 1L;

    //已废弃的个数
    private long abolishDomain;
    //数据标准总数（已发布+已废弃）
    private long allDomain;

    private String month;

    private long monthAddCount;
    private long monthUpdateCount;
    private long monthAbolishCount;

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public long getMonthAddCount() {
        return monthAddCount;
    }

    public void setMonthAddCount(long monthAddCount) {
        this.monthAddCount = monthAddCount;
    }

    public long getMonthUpdateCount() {
        return monthUpdateCount;
    }

    public void setMonthUpdateCount(long monthUpdateCount) {
        this.monthUpdateCount = monthUpdateCount;
    }

    public long getMonthAbolishCount() {
        return monthAbolishCount;
    }

    public void setMonthAbolishCount(long monthAbolishCount) {
        this.monthAbolishCount = monthAbolishCount;
    }

    public long getAbolishDomain() {
        return abolishDomain;
    }

    public void setAbolishDomain(long abolishDomain) {
        this.abolishDomain = abolishDomain;
    }

    public long getAllDomain() {
        return allDomain;
    }

    public void setAllDomain(long allDomain) {
        this.allDomain = allDomain;
    }
}
