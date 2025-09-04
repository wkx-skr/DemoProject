package com.datablau.reverse.engineering.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.io.Serializable;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GisDataResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    private int total;
    private List<GisDataMM> data;

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public List<GisDataMM> getData() {
        return data;
    }

    public void setData(List<GisDataMM> data) {
        this.data = data;
    }
}
