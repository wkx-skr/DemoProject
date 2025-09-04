package com.datablau.project.api.dto;

import java.io.Serializable;

public class DdmModelInfoQueryDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private String ddmModelName;
    private int currentPage;
    private int pageSize;


    public String getDdmModelName() {
        return ddmModelName;
    }

    public void setDdmModelName(String ddmModelName) {
        this.ddmModelName = ddmModelName;
    }

    public int getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }
}
