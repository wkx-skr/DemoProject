package com.datablau.metadata.main.dto;

public class LineageMappingExcelDto {
    private String sourceTable;
    private String sourceColumn;
    private String targetTable;
    private String targetColumn;
    private String etlName;

    public LineageMappingExcelDto() {

    }

    public LineageMappingExcelDto(String sourceTable, String sourceColumn,
                                  String targetTable, String targetColumn, String etlName) {
        this.sourceTable = sourceTable;
        this.sourceColumn = sourceColumn;
        this.targetTable = targetTable;
        this.targetColumn = targetColumn;
        this.etlName = etlName;
    }

    public String getSourceTable() {
        return sourceTable;
    }

    public void setSourceTable(String sourceTable) {
        this.sourceTable = sourceTable;
    }

    public String getSourceColumn() {
        return sourceColumn;
    }

    public void setSourceColumn(String sourceColumn) {
        this.sourceColumn = sourceColumn;
    }

    public String getTargetTable() {
        return targetTable;
    }

    public void setTargetTable(String targetTable) {
        this.targetTable = targetTable;
    }

    public String getTargetColumn() {
        return targetColumn;
    }

    public void setTargetColumn(String targetColumn) {
        this.targetColumn = targetColumn;
    }

    public String getEtlName() {
        return etlName;
    }

    public void setEtlName(String etlName) {
        this.etlName = etlName;
    }
}
