package com.datablau.archy.server.dto;

import java.util.ArrayList;

/**
 * @author: hxs
 * @date: 2025/8/19 17:12
 */
public class CompareResultDto {
    private ArrayList<TableCompareResultDto> tableResults ;
    private ArrayList<ColumnCompareResultDto> columnResults ;

    public ArrayList<TableCompareResultDto> getTableResults() {
        return tableResults;
    }

    public void setTableResults(ArrayList<TableCompareResultDto> tableResults) {
        this.tableResults = tableResults;
    }

    public ArrayList<ColumnCompareResultDto> getColumnResults() {
        return columnResults;
    }

    public void setColumnResults(ArrayList<ColumnCompareResultDto> columnResults) {
        this.columnResults = columnResults;
    }
}
