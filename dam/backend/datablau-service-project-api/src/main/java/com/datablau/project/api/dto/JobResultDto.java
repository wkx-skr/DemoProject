package com.datablau.project.api.dto;

import java.io.Serializable;

public class JobResultDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long jobId;

    private String resId;


    public JobResultDto () {

    }

    public JobResultDto (Long jobId, String resId) {
        this.jobId = jobId;
        this.resId = resId;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public String getResId() {
        return resId;
    }

    public void setResId(String resId) {
        this.resId = resId;
    }
}
