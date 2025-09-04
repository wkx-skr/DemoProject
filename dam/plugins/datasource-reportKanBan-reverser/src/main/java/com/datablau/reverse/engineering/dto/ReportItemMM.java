package com.datablau.reverse.engineering.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.util.List;

/**
 *
 * @author: hxs
 * @date: 2025/4/19 12:23
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ReportItemMM implements Serializable {

    @JsonProperty("reportItem")
    private String reportItem;

    @JsonProperty("reportItemPath")
    private String reportItemPath;

    @JsonProperty("dataSource")
    private String dataSource;

    @JsonProperty("technicaler")
    private String technicaler;

    @JsonProperty("reportItemSQL")
    private String reportItemSQL;

    @JsonProperty("reportTable")
    private List<ReportTableMM> reportTable;

    @JsonProperty("index")
    private List<ReportTableIndex> index;

    public String getReportItem() {
        return reportItem;
    }

    public void setReportItem(String reportItem) {
        this.reportItem = reportItem;
    }

    public String getReportItemPath() {
        return reportItemPath;
    }

    public void setReportItemPath(String reportItemPath) {
        this.reportItemPath = reportItemPath;
    }

    public String getDataSource() {
        return dataSource;
    }

    public void setDataSource(String dataSource) {
        this.dataSource = dataSource;
    }

    public String getTechnicaler() {
        return technicaler;
    }

    public void setTechnicaler(String technicaler) {
        this.technicaler = technicaler;
    }

    public String getReportItemSQL() {
        return reportItemSQL;
    }

    public void setReportItemSQL(String reportItemSQL) {
        this.reportItemSQL = reportItemSQL;
    }

    public List<ReportTableMM> getReportTable() {
        return reportTable;
    }

    public void setReportTable(List<ReportTableMM> reportTable) {
        this.reportTable = reportTable;
    }

    public List<ReportTableIndex> getIndex() {
        return index;
    }

    public void setIndex(List<ReportTableIndex> index) {
        this.index = index;
    }
}
