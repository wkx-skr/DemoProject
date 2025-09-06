package com.datablau.data.asset.dto;

import org.elasticsearch.common.Strings;

import java.io.Serializable;

public class DDCCatalogErrorDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private String sheetName;
    private String lineNo;
    private String errorMsg;
    private Object importObject;

    public DDCCatalogErrorDto() {

    }
    public DDCCatalogErrorDto(String sheetName, String lineNo, String errorMsg, Object importObject) {
        this.sheetName = sheetName;
        this.lineNo = lineNo;
        this.errorMsg = errorMsg;
        this.importObject = importObject;
    }

    public void addErrorMsg(String msg) {
        if (errorMsg == null || Strings.isEmpty(errorMsg)) {
            errorMsg = msg;
        } else {
            errorMsg = errorMsg + ";" + msg;
        }
    }

    public String getSheetName() {
        return sheetName;
    }

    public void setSheetName(String sheetName) {
        this.sheetName = sheetName;
    }

    public String getLineNo() {
        return lineNo;
    }

    public void setLineNo(String lineNo) {
        this.lineNo = lineNo;
    }

    public String getErrorMsg() {
        return errorMsg;
    }

    public void setErrorMsg(String errorMsg) {
        this.errorMsg = errorMsg;
    }

    public Object getImportObject() {
        return importObject;
    }

    public void setImportObject(Object importObject) {
        this.importObject = importObject;
    }
}
